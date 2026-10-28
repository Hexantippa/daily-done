import { createFileRoute } from "@tanstack/react-router";
import { Camera, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Shell, Timeline } from "@/components/garden-ui";
import { uid, updatePlant, useGarden } from "@/lib/garden";

export const Route = createFileRoute("/vaxt/$id")({
  head: () => ({
    meta: [
      { title: "Växt – Min trädgård" },
      { name: "description", content: "Anteckningar, tidslinje och bilder för växten." },
      { property: "og:title", content: "Växt – Min trädgård" },
      { property: "og:description", content: "Anteckningar, tidslinje och bilder för växten." },
    ],
  }),
  component: PlantPage,
});

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section>
      <button className="bark-bar" onClick={() => setOpen(!open)}>{icon}<span className="flex-1 truncate text-left">{title}</span>{open ? <ChevronUp /> : <ChevronDown />}</button>
      {open && <div className="paper mt-0.5">{children}</div>}
    </section>
  );
}

function resize(file: File): Promise<string> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, 600 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s; c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL("image/jpeg", 0.7));
    };
    img.src = URL.createObjectURL(file);
  });
}

function PlantPage() {
  const { id } = Route.useParams();
  const plant = useGarden().plants.find((p) => p.id === id);
  const [draft, setDraft] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  if (!plant) return <Shell back><p className="paper">Växten finns inte.</p></Shell>;

  const saveNote = () => {
    const text = draft?.trim();
    if (text) updatePlant(id, (p) => ({ ...p, notes: [...p.notes, { id: uid(), text }] }));
    setDraft(null);
  };

  return (
    <Shell back>
      <Timeline plants={[plant]} />
      <div className="mt-8 space-y-3 px-5">
        {plant.notes.map((n, i) => (
          <Section key={n.id} icon={<Pencil className="h-5 w-5" />} title={i === 0 ? "Kom ihåg" : n.text.split(".")[0]}>
            <p className="leading-tight">{n.text}</p>
            <button aria-label="Ta bort anteckning" className="mt-1 rounded-full bg-bark/80 p-1 text-paper-foreground" onClick={() => updatePlant(id, (p) => ({ ...p, notes: p.notes.filter((x) => x.id !== n.id) }))}><Trash2 className="h-4 w-4" /></button>
          </Section>
        ))}
        {draft !== null ? (
          <div className="paper">
            <textarea autoFocus rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Skriv en anteckning…" className="w-full resize-none bg-transparent leading-tight outline-none" />
            <div className="flex justify-end gap-4"><button onClick={() => setDraft(null)}>Avbryt</button><button onClick={saveNote}>Spara</button></div>
          </div>
        ) : (
          <div className="flex justify-center"><button aria-label="Ny anteckning" onClick={() => setDraft("")} className="bark-bar w-auto"><Plus /><Pencil className="h-5 w-5" /></button></div>
        )}

        <div className="pt-8">
          <Section icon={<Camera className="h-5 w-5" />} title="Galleri">
            {plant.photos.length === 0 ? <p className="text-xl opacity-70">Inga bilder än.</p> : (
              <div className="grid grid-cols-2 gap-3 py-1">
                {plant.photos.map((ph) => (
                  <div key={ph.id} className="relative">
                    <img src={ph.src} alt={plant.name} className="aspect-[4/3] w-full rounded-sm object-cover" />
                    <button aria-label="Ta bort bild" className="absolute bottom-1 left-1 rounded-full bg-bark/90 p-1 text-paper-foreground" onClick={() => updatePlant(id, (p) => ({ ...p, photos: p.photos.filter((x) => x.id !== ph.id) }))}><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </Section>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const src = await resize(f);
            updatePlant(id, (p) => ({ ...p, photos: [...p.photos, { id: uid(), src }] }));
            e.target.value = "";
          }} />
          <div className="mt-3 flex justify-center"><button aria-label="Lägg till bild" onClick={() => fileRef.current?.click()} className="bark-bar w-auto"><Plus /><Camera className="h-5 w-5" /></button></div>
        </div>
      </div>
    </Shell>
  );
}
