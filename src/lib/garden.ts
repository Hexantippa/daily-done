import { useSyncExternalStore } from "react";

export type Stage = "sow" | "plant" | "harvest" | null;
export type Plant = {
  id: string;
  name: string;
  categoryId: string;
  months: Stage[]; // 12
  notes: { id: string; text: string }[];
  photos: { id: string; src: string }[];
  onTimeline: boolean;
};
export type Category = { id: string; name: string; icon: "carrot" | "salad" | "flower" };
export type Task = { id: string; text: string; done: boolean };
export type Garden = { categories: Category[]; plants: Plant[]; tasks: Task[] };

export const MONTHS = ["Jan", "Feb", "Mars", "April", "Maj", "Jun", "Jul", "Aug", "Sept", "Okt", "Nov", "Dec"];
export const uid = () => Math.random().toString(36).slice(2, 10);
const empty = (): Stage[] => Array(12).fill(null);
const m = (s: Record<number, Stage>) => empty().map((_, i) => s[i] ?? null);

const seed: Garden = {
  categories: [
    { id: "rot", name: "Rotfrukter", icon: "carrot" },
    { id: "gron", name: "Grönsaker", icon: "salad" },
    { id: "pryd", name: "Prydnadsväxter", icon: "flower" },
  ],
  plants: [
    { id: "morot", name: "Morötter", categoryId: "rot", months: m({ 0: "sow", 3: "harvest" }), notes: [{ id: "n1", text: "Goda morötter. Kom ihåg att plantera tidigare nästa år." }], photos: [], onTimeline: true },
    { id: "potatis", name: "Potatis", categoryId: "rot", months: empty(), notes: [], photos: [], onTimeline: false },
    { id: "rodbeta", name: "Rödbetor", categoryId: "rot", months: empty(), notes: [], photos: [], onTimeline: false },
    { id: "pakchoi", name: "Pak Choi", categoryId: "gron", months: m({ 1: "sow", 4: "harvest" }), notes: [], photos: [], onTimeline: true },
    { id: "tomat", name: "Tomater", categoryId: "gron", months: m({ 0: "sow", 1: "plant", 4: "harvest" }), notes: [], photos: [], onTimeline: true },
  ],
  tasks: [
    { id: "t1", text: "Såjord", done: true },
    { id: "t2", text: "Tomatnäring", done: false },
    { id: "t3", text: "Trädgårdshandskar", done: false },
  ],
};

const KEY = "min-tradgard-v1";
let state: Garden = seed;
let loaded = false;
let userId: string | null = null;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
const subs = new Set<() => void>();
const emit = () => subs.forEach((s) => s());

async function connectAccount() {
  const { supabase } = await import("@/integrations/supabase/client");
  const sync = async (id: string | null) => {
    if (id === userId) return;
    userId = id;
    if (!id) return;
    const { data } = await supabase.from("gardens").select("data").eq("user_id", id).maybeSingle();
    if (data?.data) {
      state = data.data as unknown as Garden;
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
      emit();
    } else {
      await supabase.from("gardens").upsert({ user_id: id, data: state as never });
    }
  };
  const { data } = await supabase.auth.getSession();
  await sync(data.session?.user.id ?? null);
  supabase.auth.onAuthStateChange((_e, session) => { void sync(session?.user.id ?? null); });
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
  void connectAccount();
}

function saveToAccount() {
  if (!userId) return;
  const id = userId;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("gardens").upsert({ user_id: id, data: state as never, updated_at: new Date().toISOString() });
  }, 600);
}

export function update(fn: (g: Garden) => Garden) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    alert("Lagringen är full – ta bort några bilder.");
  }
  saveToAccount();
  emit();
}

export function useGarden(): Garden {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      if (!loaded) {
        load();
        cb();
      }
      return () => subs.delete(cb);
    },
    () => state,
    () => seed,
  );
}

export function updatePlant(id: string, fn: (p: Plant) => Plant) {
  update((g) => ({ ...g, plants: g.plants.map((p) => (p.id === id ? fn(p) : p)) }));
}

export const nextStage = (s: Stage): Stage =>
  s === null ? "sow" : s === "sow" ? "plant" : s === "plant" ? "harvest" : null;
