import { Link } from "@tanstack/react-router";
import { ArrowLeft, BellDot, Bean, Camera, Carrot, CircleUser, Flower2, Salad, Sprout, Utensils } from "lucide-react";
import type { ReactNode } from "react";
import leaves from "@/assets/leaves.jpg";
import { MONTHS, nextStage, updatePlant, type Category, type Plant, type Stage } from "@/lib/garden";

export function Shell({ children, back }: { children: ReactNode; back?: boolean }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <img src={leaves} alt="" width={864} height={1536} className="fixed inset-0 -z-10 h-full w-full object-cover brightness-75" />
      <div className="mx-auto max-w-md px-6 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between text-cream">
          {back ? (
            <button onClick={() => history.back()} aria-label="Tillbaka"><ArrowLeft className="h-8 w-8" /></button>
          ) : <span />}
          <div className="flex gap-5"><Link to="/auth" aria-label="Konto"><CircleUser className="h-6 w-6" /></Link><BellDot className="h-6 w-6" /></div>
        </header>
        <Link to="/" className="mt-8 block rounded-full bg-moss/90 py-4 text-center font-display text-5xl text-cream shadow-lg">
          Min trädgård
        </Link>
        <div className="mt-8">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] flex justify-center">
        <span className="flex h-16 w-28 items-center justify-center rounded-full bg-moss/90 text-cream shadow-lg"><Camera className="h-7 w-7" /></span>
      </div>
    </div>
  );
}

export function CategoryIcon({ icon, className }: { icon: Category["icon"]; className?: string }) {
  const I = icon === "carrot" ? Carrot : icon === "salad" ? Salad : Flower2;
  return <I className={className} />;
}

function StageDot({ stage, onClick, label }: { stage: Stage; onClick: () => void; label: string }) {
  const I = stage === "sow" ? Bean : stage === "plant" ? Sprout : stage === "harvest" ? Utensils : null;
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`relative z-10 flex h-7 w-7 shrink-0 outline-none after:absolute after:-inset-3 after:content-[""] active:scale-90 transition items-center justify-center rounded-full ${I ? "bg-sprout text-paper-foreground" : "h-5 w-5 border-2 border-cream bg-transparent"}`}
    >
      {I && <I className="h-4 w-4" />}
    </button>
  );
}

export function Timeline({ plants }: { plants: Plant[] }) {
  return (
    <div className="no-scrollbar -mx-6 snap-x overflow-x-auto overscroll-x-contain px-6">
      <div className="w-[640px] font-hand text-cream">
        {plants.map((p) => (
          <div key={p.id} className="mb-2">
            <Link to="/vaxt/$id" params={{ id: p.id }} className="text-2xl">{p.name}</Link>
            <div className="relative flex items-center justify-between">
              <div className="absolute inset-x-2 top-1/2 h-0.5 bg-cream/80" />
              {p.months.map((s, i) => (
                <div key={i} className="flex w-7 justify-center">
                  <StageDot stage={s} label={`${p.name} ${MONTHS[i]}`} onClick={() => updatePlant(p.id, (x) => ({ ...x, months: x.months.map((v, j) => (j === i ? nextStage(v) : v)) }))} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-between text-lg">
          {MONTHS.map((mo) => <span key={mo} className="w-7 text-center">{mo}</span>)}
        </div>
      </div>
      <p className="mt-1 font-hand text-lg text-cream/80">Tryck på en månad: så → plantera → skörd</p>
    </div>
  );
}
