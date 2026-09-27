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

export const ItemGrid_MIN = {"base":[9,7]};

export function ItemGrid(props: ItemGridProps) {
  const uid = useRef("itemgrid-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);

  const rar = (r?: string) => ItemGridRarity[(r || "common").toLowerCase()] || ItemGridRarity.common;

  const fire = (id: string) => {
    if (props.onActivate) {
      props.onActivate(id);
      setPulse(id);
      window.setTimeout(() => setPulse((p) => (p === id ? null : p)), 420);
    }
  };

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: ItemGrid_MIN.base[0] + "rem", minHeight: ItemGrid_MIN.base[1] + "rem" }}
    >
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
      </svg>

      {props.items.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10">
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500">// no items //</span>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-black/50 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10">
          <div
            className="grid gap-2 p-2"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(5.5rem, 1fr))" }}
          >
            {props.items.map((it) => {
              const R = rar(it.rarity);
              const sel = props.value === it.id;
              const hov = hover === it.id;
              const pls = pulse === it.id;
              return (
                <div
                  key={it.id}
                  onPointerEnter={() => setHover(it.id)}
                  onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                  onPointerDown={() => props.onChange(it.id)}
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
                    "group relative touch-none select-none cursor-pointer rounded-sm border bg-neutral-900/85 backdrop-blur-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
                    R.border +
                    (sel ? " ring-1 ring-cyan-400/60 bg-cyan-400/10 -translate-y-[1px]" : "") +
                    (hov && !sel ? " -translate-y-[1px] brightness-110" : "") +
                    (pls ? " scale-[0.96] brightness-150" : "")
                  }
                  style={{
                    minHeight: "4.6rem",
                    boxShadow: sel
                      ? "0 0 16px " + R.glow + ", inset 0 0 18px rgba(0,0,0,0.7)"
                      : hov
                      ? "0 0 10px " + R.glow + ", inset 0 0 14px rgba(0,0,0,0.75)"
                      : "inset 0 0 14px rgba(0,0,0,0.75)",
                  }}
                >
                  {/* corner notch */}
                  <div
                    className={"absolute top-0 right-0 h-2 w-2 transition-all duration-200 " + (sel || hov ? "opacity-100" : "opacity-50")}
                    style={{ background: R.glow, clipPath: "polygon(100% 0,0 0,100% 100%)" }}
                  />
                  {it.equipped ? (
                    <div className="absolute top-0 left-0 h-full w-[2px] bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.7)] animate-pulse" />
                  ) : null}

                  <div className="absolute inset-0 flex flex-col p-1">
                    {/* icon face */}
                    <div className="relative flex-1 min-h-0 min-w-0">
                      <div className="absolute inset-[8%]">
                        {it.icon ? (
                          <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + R.text} wrap={false}>
                            {it.icon}
                          </FitText>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div
                              className={"h-[42%] w-[42%] border rotate-45 transition-all duration-300 " + R.border + (sel ? " scale-110" : "")}
                              style={{ boxShadow: "0 0 10px " + R.glow }}
                            />
                          </div>
                        )}
                      </div>
                      {typeof it.quantity === "number" ? (
                        <div className="absolute bottom-0 right-0 px-1 bg-black/80 border border-cyan-400/30 rounded-sm text-[10px] font-medium uppercase tracking-[0.1em] leading-tight text-cyan-200/80">
                          {"x" + it.quantity}
                        </div>
                      ) : null}
                    </div>

                    <div className={"min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.12em] leading-none transition-colors duration-200 " + (sel ? "text-cyan-100" : R.text)}>
                      {it.label}
                    </div>

                    {it.stats && it.stats.length > 0 ? (
                      <div className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.1em] leading-tight text-neutral-400 mt-[1px]">
                        {it.stats.slice(0, 2).map((s) => s.label + " " + s.value).join(" · ")}
                      </div>
                    ) : null}

                    <div className="mt-[2px] h-[2px] w-full bg-black/60 overflow-hidden">
                      <div
                        className={"h-full bg-gradient-to-r transition-all duration-300 ease-out " + R.bar}
                        style={{ width: sel ? "100%" : hov ? "60%" : "22%" }}
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
  );
}