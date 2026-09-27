type ItemGridProps = {
  items: { id: string; label: string; icon?: string; rarity?: string; quantity?: number; stats?: { label: string; value: number | string }[]; equipped?: boolean }[];
  value: string | null;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

const ItemGridRarity: Record<string, { text: string; border: string; glow: string; bar: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "rgba(163,163,163,0.35)", bar: "from-neutral-400 to-neutral-200" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "rgba(52,211,153,0.45)", bar: "from-emerald-400 to-emerald-200" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "rgba(34,211,238,0.5)", bar: "from-cyan-400 to-cyan-200" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "rgba(232,121,249,0.5)", bar: "from-fuchsia-500 to-purple-400" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "rgba(252,211,77,0.55)", bar: "from-amber-400 to-yellow-300" },
};

export const ItemGrid_MIN = {"base":[9,6]};

export function ItemGrid(props: ItemGridProps) {
  const { items, value, onChange, onActivate } = props;
  const uid = useRef("itemgrid-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const lastTap = useRef<{ id: string; t: number }>({ id: "", t: 0 });

  const rar = (r?: string) => ItemGridRarity[(r || "common").toLowerCase()] || ItemGridRarity.common;

  const activate = (id: string) => {
    if (!onActivate) return;
    onActivate(id);
    setPulse(id);
    setTimeout(() => setPulse((p) => (p === id ? null : p)), 420);
  };

  const tap = (id: string) => {
    onChange(id);
    const now = Date.now();
    if (lastTap.current.id === id && now - lastTap.current.t < 380) {
      activate(id);
      lastTap.current = { id: "", t: 0 };
    } else {
      lastTap.current = { id, t: now };
    }
  };

  return (
    <div className="h-full w-full relative" style={{ minWidth: ItemGrid_MIN.base[0] + "rem", minHeight: ItemGrid_MIN.base[1] + "rem" }}>
      <div className="absolute inset-0 bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500 border border-cyan-400/20 px-2 py-1">no items</div>
          </div>
        ) : (
          <div
            className="grid gap-1 p-1"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(5.5rem, 1fr))", gridAutoRows: "minmax(4.5rem, auto)" }}
          >
            {items.map((it) => {
              const r = rar(it.rarity);
              const sel = value === it.id;
              const hov = hover === it.id;
              const pul = pulse === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onPointerEnter={() => setHover(it.id)}
                  onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                  onClick={() => tap(it.id)}
                  onDoubleClick={() => activate(it.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(it.id); }
                  }}
                  className={
                    "relative min-w-0 overflow-hidden text-left border rounded-sm bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 active:scale-[0.97] " +
                    r.border + " " + (sel ? "ring-1 ring-cyan-400/60 bg-cyan-400/10 " : "") + (pul ? "brightness-150 " : "")
                  }
                  style={{
                    boxShadow: sel
                      ? "0 0 16px " + r.glow + ", inset 0 0 18px rgba(0,0,0,0.7)"
                      : hov
                      ? "0 0 10px " + r.glow
                      : "inset 0 0 10px rgba(0,0,0,0.6)",
                    transform: hov && !sel ? "translateY(-1px)" : "none",
                  }}
                >
                  {/* rarity top bar */}
                  <div className={"absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r " + r.bar} style={{ boxShadow: "0 0 8px " + r.glow }} />
                  {/* corner notch */}
                  <div className={"absolute top-0 right-0 w-0 h-0 border-t-[10px] border-l-[10px] border-l-transparent " + (sel ? "border-t-cyan-300/80" : "border-t-transparent") + " transition-all duration-200"} />
                  {/* scan sweep on hover */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-200"
                    style={{
                      opacity: hov || sel ? 1 : 0,
                      background: "repeating-linear-gradient(135deg, rgba(34,211,238,0.06) 0px, rgba(34,211,238,0.06) 1px, transparent 1px, transparent 6px)",
                    }}
                  />
                  <div className="absolute inset-[6%] top-[10%] flex flex-col min-w-0 gap-[2px]">
                    <div className="flex-1 min-h-0 min-w-0 flex items-stretch gap-1">
                      <div className="flex-1 min-w-0 min-h-0 relative">
                        {it.icon ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FitText className={"font-mono font-bold tracking-widest uppercase " + r.text} wrap={false}>{it.icon}</FitText>
                          </div>
                        ) : (
                          <svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full opacity-60">
                            <defs>
                              <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
                              </linearGradient>
                            </defs>
                            <g className={r.text}>
                              <polygon points="20,5 34,13 34,28 20,36 6,28 6,13" fill={"url(#" + uid + "-g)"} stroke="currentColor" strokeWidth="1.2" />
                              <circle cx="20" cy="20" r="4" fill="currentColor" />
                            </g>
                          </svg>
                        )}
                        {it.quantity !== undefined && (
                          <div className="absolute bottom-0 right-0 px-1 bg-black/80 border border-cyan-400/30 rounded-sm text-[10px] font-medium leading-tight text-cyan-200/80">
                            ×{it.quantity}
                          </div>
                        )}
                        {it.equipped && (
                          <div className="absolute top-0 left-0 px-1 bg-cyan-400 text-black rounded-sm text-[10px] font-bold uppercase tracking-[0.1em] leading-tight shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                            EQ
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={"min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] leading-tight " + r.text}>{it.label}</div>
                    {it.stats && it.stats.length > 0 && (
                      <div className="min-w-0 flex flex-col gap-[1px]">
                        {it.stats.slice(0, 2).map((s, i) => (
                          <div key={"s" + i} className="flex min-w-0 items-baseline justify-between gap-1">
                            <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.12em] leading-tight text-neutral-400">{s.label}</span>
                            <span className="min-w-0 truncate text-[10px] font-bold leading-tight text-cyan-200/90">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}