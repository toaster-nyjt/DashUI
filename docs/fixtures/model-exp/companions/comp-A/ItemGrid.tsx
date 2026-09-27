type ItemGridProps = {
  items: { id: string; label: string; icon?: string; rarity?: string; quantity?: number; stats?: { label: string; value: number | string }[]; equipped?: boolean }[];
  value: string | null;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

const ItemGridRarity: Record<string, { text: string; border: string; glow: string; bar: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "rgba(163,163,163,0.35)", bar: "from-neutral-400 to-neutral-200" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "rgba(52,211,153,0.5)", bar: "from-emerald-500 to-emerald-300" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "rgba(34,211,238,0.55)", bar: "from-cyan-400 to-cyan-200" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "rgba(232,121,249,0.55)", bar: "from-fuchsia-500 to-purple-400" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "rgba(252,211,77,0.55)", bar: "from-amber-400 to-yellow-300" },
};

export const ItemGrid_MIN = {"base":[9,6]};

export function ItemGrid(props: ItemGridProps) {
  const { items, value, onChange, onActivate } = props;
  const uid = useRef("itemgrid-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);

  const rar = (r?: string) => ItemGridRarity[(r || "common").toLowerCase()] || ItemGridRarity.common;

  const fire = (id: string) => {
    if (!onActivate) return;
    onActivate(id);
    setPulse(id);
    window.setTimeout(() => setPulse((p) => (p === id ? null : p)), 420);
  };

  return (
    <div className="h-full w-full relative" style={{ minWidth: ItemGrid_MIN.base[0] + "rem", minHeight: ItemGrid_MIN.base[1] + "rem" }}>
      <style>{"@keyframes " + uid + "-zap{0%{opacity:0;transform:scale(0.7)}40%{opacity:1}100%{opacity:0;transform:scale(1.25)}}@keyframes " + uid + "-scan{0%{transform:translateY(-120%)}100%{transform:translateY(420%)}}"}</style>
      <div className="absolute inset-0 bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        {items.length === 0 ? (
          <div className="absolute inset-[18%] flex items-center justify-center">
            <FitText className="font-mono font-bold tracking-widest uppercase text-neutral-500" wrap={false}>NO ITEMS</FitText>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-2">
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(6.5rem,1fr))" }}>
              {items.map((it) => {
                const R = rar(it.rarity);
                const sel = value === it.id;
                const hov = hover === it.id;
                return (
                  <div
                    key={it.id}
                    onPointerEnter={() => setHover(it.id)}
                    onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                    onPointerDown={() => onChange(it.id)}
                    onDoubleClick={() => fire(it.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(it.id); fire(it.id); }
                    }}
                    tabIndex={0}
                    role="button"
                    className={
                      "group relative touch-none select-none cursor-pointer rounded-sm border bg-neutral-900/85 backdrop-blur-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 active:scale-[0.97] " +
                      R.border + " " + (sel ? "ring-1 ring-cyan-400/60 bg-cyan-400/10 -translate-y-[1px]" : hov ? "-translate-y-[1px]" : "")
                    }
                    style={{ boxShadow: sel ? "0 0 16px " + R.glow : hov ? "0 0 10px " + R.glow : "inset 0 0 10px rgba(0,0,0,0.7)" }}
                  >
                    <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden">
                      <div className={"h-full w-full bg-gradient-to-r " + R.bar} style={{ opacity: sel ? 1 : 0.55 }} />
                    </div>
                    {(sel || hov) && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm">
                        <div className="h-[18%] w-full bg-gradient-to-b from-transparent via-cyan-300/15 to-transparent" style={{ animation: uid + "-scan 2.2s linear infinite" }} />
                      </div>
                    )}
                    {pulse === it.id && (
                      <div className="pointer-events-none absolute inset-0 rounded-sm border-2 border-cyan-200" style={{ animation: uid + "-zap 0.42s ease-out" }} />
                    )}

                    <div className="flex flex-col gap-1 p-2">
                      <div className="relative h-8 w-full">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className={"h-full aspect-square flex items-center justify-center border " + R.border + " bg-black/50 rounded-sm transition-transform duration-200 " + (hov || sel ? "scale-105" : "")}>
                            {it.icon ? (
                              <div className="absolute inset-[14%] flex items-center justify-center">
                                <FitText className={"font-mono font-bold tracking-widest uppercase " + R.text} wrap={false}>{it.icon}</FitText>
                              </div>
                            ) : (
                              <svg viewBox="0 0 24 24" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
                                <path d="M12 4l7 4v8l-7 4-7-4V8z" fill="none" stroke="currentColor" strokeWidth="1.2" className={R.text} opacity="0.7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        {typeof it.quantity === "number" && (
                          <div className="absolute right-0 top-0 rounded-sm border border-cyan-400/30 bg-black/80 px-1 text-[10px] font-medium uppercase tracking-[0.1em] leading-tight text-cyan-200/80">
                            ×{it.quantity}
                          </div>
                        )}
                        {it.equipped && (
                          <div className="absolute left-0 top-0 rounded-sm border border-amber-300/50 bg-amber-400/15 px-1 text-[10px] font-medium uppercase tracking-[0.12em] leading-tight text-amber-300">E</div>
                        )}
                      </div>

                      <div className={"min-w-0 truncate text-xs font-semibold uppercase tracking-[0.12em] leading-none " + (sel ? "text-cyan-200" : R.text)}>{it.label}</div>

                      {it.rarity && (
                        <div className={"min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight " + R.text} style={{ opacity: 0.8 }}>{it.rarity}</div>
                      )}

                      {it.stats && it.stats.length > 0 && (
                        <div className="flex flex-col gap-[2px]">
                          {it.stats.slice(0, 2).map((s, i) => (
                            <div key={"s" + i} className="flex items-baseline justify-between gap-1">
                              <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.12em] leading-tight text-neutral-400">{s.label}</span>
                              <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-[0.1em] leading-tight text-cyan-200/90">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}