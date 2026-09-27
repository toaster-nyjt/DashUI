type ItemGridProps = {
  items: { id: string; label: string; icon?: string; rarity?: string; quantity?: number; stats?: { label: string; value: number | string }[]; equipped?: boolean }[];
  value: string | null;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

const ItemGridRarity: Record<string, { text: string; border: string; glow: string; bg: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "rgba(163,163,163,0.35)", bg: "from-neutral-500/10" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "rgba(52,211,153,0.45)", bg: "from-emerald-500/10" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "rgba(34,211,238,0.5)", bg: "from-cyan-400/10" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "rgba(232,121,249,0.5)", bg: "from-fuchsia-500/10" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "rgba(252,211,77,0.55)", bg: "from-amber-400/10" },
};

export const ItemGrid_MIN = {"base":[10,7]};

export function ItemGrid(props: ItemGridProps) {
  const uid = useRef("itemgrid-" + Math.random().toString(36).slice(2)).current;
  const floor = ItemGrid_MIN.base;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);

  const rarityOf = (r?: string) =>
    ItemGridRarity[(r || "common").toLowerCase()] || ItemGridRarity.common;

  const fire = (id: string) => {
    setPulse(id);
    window.setTimeout(() => setPulse((p) => (p === id ? null : p)), 380);
    if (props.onActivate) props.onActivate(id);
  };

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.25] pointer-events-none" aria-hidden="true">
          <defs>
            <pattern id={uid + "-grid"} width="18" height="18" patternUnits="userSpaceOnUse">
              <path d="M18 0 L0 0 L0 18" fill="none" stroke="rgba(34,211,238,0.18)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={"url(#" + uid + "-grid)"} />
        </svg>

        {props.items.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
              // empty
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-2">
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(4.75rem, 1fr))" }}
            >
              {props.items.map((it) => {
                const r = rarityOf(it.rarity);
                const sel = props.value === it.id;
                const hov = hover === it.id;
                const pl = pulse === it.id;
                return (
                  <div
                    key={it.id}
                    onPointerEnter={() => setHover(it.id)}
                    onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      props.onChange(it.id);
                    }}
                    onDoubleClick={() => fire(it.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        props.onChange(it.id);
                        fire(it.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className={
                      "touch-none relative select-none cursor-pointer border rounded-sm overflow-hidden bg-gradient-to-b " +
                      r.bg +
                      " to-neutral-950/90 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
                      (sel ? "ring-1 ring-cyan-400/60 " : "") +
                      r.border +
                      (hov || sel ? " brightness-125" : "") +
                      (pl ? " scale-[0.96]" : "")
                    }
                    style={{
                      boxShadow: sel
                        ? "0 0 16px " + r.glow + ", inset 0 0 14px rgba(0,0,0,0.7)"
                        : hov
                        ? "0 0 10px " + r.glow
                        : "inset 0 0 10px rgba(0,0,0,0.6)",
                    }}
                  >
                    {/* corner notch */}
                    <div
                      className="absolute top-0 right-0 w-0 h-0 transition-all duration-200"
                      style={{
                        borderTop: "0.55rem solid " + (sel ? r.glow : "rgba(255,255,255,0.12)"),
                        borderLeft: "0.55rem solid transparent",
                      }}
                    />
                    {pl ? (
                      <div className="absolute inset-0 bg-cyan-300/25 animate-ping pointer-events-none" />
                    ) : null}

                    <div className="flex flex-col h-full p-1 gap-1">
                      {/* icon face */}
                      <div className="relative w-full" style={{ height: "2.1rem" }}>
                        <div className="absolute inset-[8%]">
                          {it.icon ? (
                            <FitText
                              wrap={false}
                              className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + r.text}
                            >
                              {it.icon}
                            </FitText>
                          ) : (
                            <svg viewBox="0 0 24 24" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                              <path
                                d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                className={r.text}
                                opacity="0.65"
                              />
                              <circle cx="12" cy="12" r="2.4" className={r.text} fill="currentColor" opacity="0.8" />
                            </svg>
                          )}
                        </div>
                        {typeof it.quantity === "number" ? (
                          <span className="absolute bottom-0 right-0 text-[10px] font-medium uppercase tracking-[0.1em] leading-none text-cyan-200/70 bg-black/70 px-1 rounded-sm">
                            {"x" + it.quantity}
                          </span>
                        ) : null}
                        {it.equipped ? (
                          <span className="absolute bottom-0 left-0 text-[10px] font-medium uppercase tracking-[0.1em] leading-none text-amber-300/90 bg-black/70 px-1 rounded-sm">
                            EQ
                          </span>
                        ) : null}
                      </div>

                      <div
                        className={
                          "min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] leading-none transition-colors duration-200 " +
                          (sel ? "text-cyan-100" : r.text)
                        }
                      >
                        {it.label}
                      </div>

                      {it.stats && it.stats.length > 0 ? (
                        <div className="flex flex-col gap-[1px]">
                          {it.stats.slice(0, 2).map((s, i) => (
                            <div key={"s" + i} className="flex items-baseline gap-1 min-w-0">
                              <span className="min-w-0 truncate flex-1 text-[10px] font-medium uppercase tracking-[0.1em] leading-tight text-neutral-400">
                                {s.label}
                              </span>
                              <span className="text-[10px] font-medium leading-tight text-cyan-200/80">
                                {String(s.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-auto h-[2px] w-full bg-black/60 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300 ease-out"
                          style={{
                            width: sel ? "100%" : hov ? "55%" : "18%",
                            background: "linear-gradient(90deg, transparent, " + r.glow + ")",
                          }}
                        />
                      </div>
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