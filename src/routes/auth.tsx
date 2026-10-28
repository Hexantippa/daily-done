import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/garden-ui";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logga in – Min trädgård" },
      { name: "description", content: "Logga in eller skapa konto så sparas din trädgård på alla dina enheter." },
      { property: "og:title", content: "Logga in – Min trädgård" },
      { property: "og:description", content: "Logga in eller skapa konto så sparas din trädgård på alla dina enheter." },
    ],
  }),
  component: AuthPage,
});

type User = { email: string | undefined; name: string };

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return setUser(null);
      const { data: p } = await supabase.from("profiles").select("name").eq("id", data.user.id).maybeSingle();
      setUser({ email: data.user.email, name: p?.name ?? "" });
    };
    void load();
    const { data } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Kolla din e-post och klicka på länken för att bekräfta kontot.");
      else navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("Fel e-post eller lösenord.");
      else navigate({ to: "/" });
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) setMsg("Det gick inte att logga in med Google.");
    else if (!r.redirected) navigate({ to: "/" });
  };

  const input = "w-full rounded-sm bg-cream/90 px-3 py-2 text-xl text-paper-foreground outline-none placeholder:text-paper-foreground/60";

  if (user) {
    return (
      <Shell back>
        <div className="paper space-y-3 text-center">
          <p>Hej {user.name || user.email}!</p>
          <p className="text-lg opacity-80">Din trädgård sparas i ditt konto.</p>
          <button className="bark-bar justify-center" onClick={async () => { await supabase.auth.signOut(); }}>Logga ut</button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell back>
      <div className="flex gap-2 px-5">
        {(["in", "up"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setMsg(null); }}
            className={`bark-bar justify-center ${mode === m ? "" : "opacity-60"}`}>
            {m === "in" ? "Logga in" : "Skapa konto"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="paper mt-4 space-y-3">
        {mode === "up" && (
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Namn" autoComplete="name" className={input} />
        )}
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-post" autoComplete="email" className={input} />
        <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Lösenord" autoComplete={mode === "up" ? "new-password" : "current-password"} className={input} />
        {msg && <p className="text-lg">{msg}</p>}
        <button type="submit" disabled={busy} className="bark-bar justify-center disabled:opacity-60">
          {mode === "in" ? "Logga in" : "Skapa konto"}
        </button>
      </form>
      <div className="mt-4 px-5">
        <button onClick={google} className="bark-bar justify-center">Fortsätt med Google</button>
      </div>
    </Shell>
  );
}
