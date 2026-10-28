import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, ChevronUp, Plus, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { CategoryIcon, Shell, Timeline } from "@/components/garden-ui";
import { uid, update, useGarden } from "@/lib/garden";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Min trädgård – att göra i trädgården" },
      { name: "description", content: "Planera sådd, plantering och skörd och håll koll på inköpslistan." },
      { property: "og:title", content: "Min trädgård" },
      { property: "og:description", content: "Planera sådd, plantering och skörd och håll koll på inköpslistan." },
    ],
  }),
  component: Index,
});

function Index() {
  const g = useGarden();
  const [open, setOpen] = useState(true);
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    update((x) => ({ ...x, tasks: [...x.tasks, { id: uid(), text: text.trim(), done: false }] }));
    setText("");
  };
  return (
    <Shell>
      <Timeline plants={g.plants.filter((p) => p.onTimeline)} />
      <section className="mt-8">
        <button className="bark-bar min-h-12 active:brightness-90" onClick={() => setOpen(!open)}>
          <ShoppingCart className="h-5 w-5" /> <span className="flex-1 text-left">Inköp</span>
          {open ? <ChevronUp /> : <ChevronDown />}
        </button>
        {open && (
          <div className="paper mt-0.5">
            {g.tasks.map((t) => (
              <div key={t.id} className="group flex items-center">
                <button
                  className={`flex-1 text-left ${t.done ? "line-through opacity-70" : ""}`}
                  onClick={() => update((x) => ({ ...x, tasks: x.tasks.map((y) => (y.id === t.id ? { ...y, done: !y.done } : y)) }))}
                >{t.text}</button>
                <button aria-label="Ta bort" className="opacity-40 hover:opacity-100" onClick={() => update((x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== t.id) }))}><X className="h-4 w-4" /></button>
              </div>
            ))}
            <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
              <button type="submit" aria-label="Lägg till"><Plus /></button>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Lägg till" className="flex-1 bg-transparent outline-none placeholder:text-paper-foreground/70" />
            </form>
          </div>
        )}
      </section>
      <nav className="mt-10 space-y-4 px-5">
        {g.categories.map((c) => (
          <Link key={c.id} to="/kategori/$id" params={{ id: c.id }} className="bark-bar min-h-12 active:brightness-90">
            <CategoryIcon icon={c.icon} className="h-5 w-5" /><span className="flex-1">{c.name}</span><ChevronRight />
          </Link>
        ))}
      </nav>
    </Shell>
  );
}
