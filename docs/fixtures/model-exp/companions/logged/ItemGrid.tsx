type ItemGridProps = { items: { id: string; label: string; icon?: string; rarity?: string; quantity?: number; stats?: { label: string; value: number | string }[]; equipped?: boolean }[]; value: string | null; onChange: (id: string) => void; onActivate?: (id: string) => void };

const ItemGridRarity: Record<string, { text: string; border: string; glow: string; bg: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "0 0 10px rgba(163,163,163,0.35)", bg: "from-neutral-700/25" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "0 0 12px rgba(52,211,153,0.45)", bg: "from-emerald-500/20" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "0 0 12px rgba(34,211,238,0.5)", bg: "from-cyan-500/20" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "0 0 14px rgba(232,121,249,0.5)", bg: "from-fuchsia-500/20" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "0 0 16px rgba(252,211,77,0.55)", bg: "from-amber-400/25" },
};

export const ItemGrid_MIN = {"base":[11,7.5]};

export function ItemGrid(props: ItemGridProps) {
  const { items, value, onChange, onActivate } = props;
  const uid = useRef("itemgrid-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);

  const rarityOf = (r?: string) => ItemGridRarity[(r || "common").toLowerCase()] || ItemGridRarity.common;

  const fire = (id: string) => {
    if (!onActivate) return;
    onActivate(id);
    setPulse(id);
    window.setTimeout(() => setPulse((p) => (p === id ? null : p)), 420);
  };

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: ItemGrid_MIN.base[0] + "rem", minHeight: ItemGrid_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.length === 0 ? (
            <div className="h-full w-full min-h-[5rem] flex items-center justify-center">
              <div className="text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500 border border-cyan-400/15 px-2 py-1">
                // no items
              </div>
            </div>
          ) : (
            <div
              className="grid gap-[2px] p-[2px]"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(5.25rem, 1fr))" }}
            >
              {items.map((it, i) => {
                const r = rarityOf(it.rarity);
                const sel = value === it.id;
                const hov = hover === it.id;
                const pul = pulse === it.id;
                return (
                  <div
                    key={it.id}
                    onPointerEnter={() => setHover(it.id)}
                    onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                    onPointerDown={() => onChange(it.id)}
                    onDoubleClick={() => fire(it.id)}
                    className={
                      "group relative select-none cursor-pointer rounded-sm border bg-gradient-to-b " +
                      r.bg +
                      " to-neutral-950/90 transition-all duration-200 ease-out active:scale-[0.97] active:brightness-125 " +
                      (sel ? r.border + " ring-1 ring-cyan-400/60 " : "border-cyan-400/20 ")
                    }
                    style={{
                      minHeight: "4.6rem",
                      boxShadow: sel || hov ? r.glow : "none",
                      animationDuration: "0.4s",
                    }}
                  >
                    {/* corner brackets */}
                    <span className={"pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t transition-all duration-200 " + (sel ? r.border : "border-cyan-400/25")} />
                    <span className={"pointer-events-none absolute right-0 bottom-0 h-2 w-2 border-r border-b transition-all duration-200 " + (sel ? r.border : "border-cyan-400/25")} />

                    {/* rarity spine */}
                    <span
                      className={"pointer-events-none absolute left-0 top-0 bottom-0 w-[2px] transition-all duration-200 " + (sel || hov ? "opacity-100" : "opacity-50")}
                      style={{ background: "currentColor" }}
                    />
                    <div className={"absolute inset-0 " + r.text} style={{ pointerEvents: "none" }}>
                      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-current" style={{ boxShadow: sel || hov ? r.glow : "none" }} />
                    </div>

                    {/* scan sweep on hover */}
                    <span
                      className={"pointer-events-none absolute inset-0 overflow-hidden rounded-sm transition-opacity duration-200 " + (hov ? "opacity-100" : "opacity-0")}
                    >
                      <span
                        className="absolute -inset-y-2 w-1/3 bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent"
                        style={{ animation: hov ? "itemgridsweep 1.4s linear infinite" : "none" }}
                      />
                    </span>

                    <div className="relative h-full w-full flex flex-col p-2 gap-1">
                      {/* face: icon */}
                      <div className="relative flex-1 min-h-0 min-w-0 flex items-center justify-center">
                        <div className="absolute inset-[8%]">
                          <FitText
                            wrap={false}
                            className={"font-mono font-bold tracking-widest uppercase transition-all duration-200 " + r.text + (pul ? " brightness-150" : "")}
                          >
                            {it.icon && it.icon.length > 0 ? it.icon : it.label.slice(0, 2)}
                          </FitText>
                        </div>
                      </div>

                      {/* name */}
                      <div className={"min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight transition-colors duration-150 " + (sel ? "text-cyan-100" : "text-cyan-200/70")}>
                        {it.label}
                      </div>

                      {/* stats */}
                      {it.stats && it.stats.length > 0 ? (
                        <div className="flex flex-wrap gap-x-2 gap-y-[1px] overflow-hidden" style={{ maxHeight: "1.6rem" }}>
                          {it.stats.slice(0, 2).map((s, k) => (
                            <span key={"s-" + k} className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.1em] leading-tight text-neutral-400">
                              <span className="text-neutral-500">{s.label}</span>{" "}
                              <span className={r.text}>{s.value}</span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    {/* quantity badge */}
                    {typeof it.quantity === "number" ? (
                      <span className="absolute right-1 top-1 rounded-sm border border-cyan-400/30 bg-black/70 px-1 text-[10px] font-semibold leading-tight tracking-[0.1em] text-cyan-200/80">
                        {"x" + it.quantity}
                      </span>
                    ) : null}

                    {/* equipped marker */}
                    {it.equipped ? (
                      <span className="absolute right-1 bottom-1 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/25 px-2 text-[10px] font-semibold uppercase leading-tight tracking-[0.15em] text-fuchsia-200 shadow-[0_0_12px_rgba(232,121,249,0.5)] animate-pulse">
                        EQ
                      </span>
                    ) : null}

                    {/* activate flash */}
                    {pul ? (
                      <span
                        className="pointer-events-none absolute inset-0 rounded-sm bg-cyan-300/25"
                        style={{ animation: "itemgridflash 0.42s ease-out forwards" }}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{
        "@keyframes itemgridsweep{0%{transform:translateX(-120%)}100%{transform:translateX(420%)}}" +
        "@keyframes itemgridflash{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(1.06)}}"
      }</style>
      <span className="hidden">{uid}</span>
    </div>
  );
}