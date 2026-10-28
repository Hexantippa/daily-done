import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Plus, Sprout } from "lucide-react";
import { useState } from "react";
import { CategoryIcon, Shell } from "@/components/garden-ui";
import { uid, update, useGarden } from "@/lib/garden";

export const Route = createFileRoute("/kategori/$id")({
  head: () => ({
    meta: [
      { title: "Kategori – Min trädgård" },
      { name: "description", content: "Alla växter i kategorin." },
      { property: "og:title", content: "Kategori – Min trädgård" },
      { property: "og:description", content: "Alla växter i kategorin." },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { id } = Route.useParams();
  const g = useGarden();
  const cat = g.categories.find((c) => c.id === id);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  if (!cat) return <Shell back><p className="paper">Kategorin finns inte.</p></Shell>;
  const plants = g.plants.filter((p) => p.categoryId === id);
  const add = () => {
    if (!name.trim()) return;
    update((x) => ({ ...x, plants: [...x.plants, { id: uid(), name: name.trim(), categoryId: id, months: Array(12).fill(null), notes: [], photos: [], onTimeline: true }] }));
    setName(""); setAdding(false);
  };
  return (
    <Shell back>
      <div className="flex justify-center text-cream"><CategoryIcon icon={cat.icon} className="h-20 w-20 -rotate-12" /></div>
      <h1 className="sr-only">{cat.name}</h1>
      <div className="mt-6 space-y-5 px-5">
        {plants.map((p) => (
          <Link key={p.id} to="/vaxt/$id" params={{ id: p.id }} className="bark-bar"><span className="flex-1">{p.name}</span><ChevronRight /></Link>
        ))}
        {adding ? (
          <form className="paper flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ny växt…" className="flex-1 bg-transparent outline-none" />
            <button type="submit">Spara</button>
          </form>
        ) : (
          <div className="flex justify-center">
            <button onClick={() => setAdding(true)} aria-label="Lägg till växt" className="bark-bar w-auto"><Plus /><Sprout className="h-5 w-5" /></button>
          </div>
        )}
      </div>
    </Shell>
  );
}
