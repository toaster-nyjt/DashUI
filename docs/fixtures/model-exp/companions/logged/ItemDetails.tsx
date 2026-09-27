type ItemDetailsProps = { item: { id: string; label: string; description?: string; rarity?: string; stats?: { label: string; value: number | string }[] } | null };

const ItemDetailsRarityMap: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500", bg: "bg-neutral-400", glow: "rgba(163,163,163,0.45)" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400", bg: "bg-emerald-400", glow: "rgba(52,211,153,0.5)" },
  rare: { text: "text-cyan-300", border: "border-cyan-400", bg: "bg-cyan-400", glow: "rgba(34,211,238,0.55)" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400", bg: "bg-fuchsia-500", glow: "rgba(232,121,249,0.55)" },
  legendary: { text: "text-amber-300", border: "border-amber-300", bg: "bg-amber-400", glow: "rgba(252,211,77,0.55)" },
};

export const ItemDetails_MIN = {"base":[11,8]};

export function ItemDetails(props: ItemDetailsProps) {
  const uid = useRef("itemdetails-" + Math.random().toString(36).slice(2)).current;
  const item = props.item;
  const key = (item && item.rarity ? item.rarity : "common").toLowerCase();
  const r = ItemDetailsRarityMap[key] || ItemDetailsRarityMap.common;
  const stats = (item && item.stats) || [];

  const [pulse, setPulse] = useState(0);
  useEffect(() => { setPulse((p) => p + 1); }, [item ? item.id : "none"]);

  return (
    <div className="h-full w-full" style={{ minWidth: ItemDetails_MIN.base[0] + "rem", minHeight: ItemDetails_MIN.base[1] + "rem" }}>
      <div
        key={pulse}
        className={"relative h-full w-full flex flex-col overflow-hidden border " + (item ? r.border : "border-cyan-400/20") + " bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 backdrop-blur-md transition-all duration-200 ease-out"}
        style={item ? { boxShadow: "0 0 18px " + r.glow.replace("0.5", "0.18").replace("0.55", "0.18").replace("0.45", "0.15") + ", inset 0 0 24px rgba(0,0,0,0.75)" } : { boxShadow: "inset 0 0 24px rgba(0,0,0,0.75)" }}
      >
        {/* scanlines */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.35) 0px, rgba(34,211,238,0.35) 1px, transparent 1px, transparent 4px)" }} />
        {/* corner brackets */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className={item ? r.text : "text-cyan-400/30"} stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.7">
            <path d="M0.5 8 L0.5 0.5 L10 0.5" vectorEffect="non-scaling-stroke" />
            <path d="M90 0.5 L99.5 0.5 L99.5 8" vectorEffect="non-scaling-stroke" />
            <path d="M0.5 92 L0.5 99.5 L10 99.5" vectorEffect="non-scaling-stroke" />
            <path d="M90 99.5 L99.5 99.5 L99.5 92" vectorEffect="non-scaling-stroke" />
          </g>
        </svg>

        {item === null ? (
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="absolute inset-[18%] border border-dashed border-cyan-400/20" />
            <div className="absolute inset-[26%] flex items-center justify-center">
              <FitText className="font-mono font-bold uppercase tracking-widest text-neutral-500">NO ITEM SELECTED</FitText>
            </div>
          </div>
        ) : (
          <div className="relative flex h-full w-full min-h-0 flex-col">
            {/* header: rarity strip */}
            <div className={"relative flex items-center gap-2 border-b " + r.border + " bg-gradient-to-r from-cyan-500/10 via-neutral-900/70 to-transparent px-2 py-1"}>
              <span className={"inline-block h-2 w-2 rounded-full " + r.bg + " animate-pulse"} style={{ boxShadow: "0 0 10px " + r.glow }} />
              <span className={"min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight " + r.text}>{item.rarity ? item.rarity : "UNRANKED"}</span>
              <span className="ml-auto min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500">{item.id}</span>
            </div>

            {/* name */}
            <div className="relative h-[26%] min-h-0 w-full">
              <div className="absolute inset-[8%] left-[3%] right-[3%]">
                <FitText align="start" className={"font-mono font-bold uppercase tracking-widest " + r.text}>{item.label}</FitText>
              </div>
              <div className={"absolute bottom-0 left-0 h-px w-full " + r.bg} style={{ opacity: 0.35 }} />
            </div>

            {/* body */}
            <div className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {item.description ? (
                <p className="text-[11px] font-normal leading-relaxed tracking-normal text-cyan-100/80">{item.description}</p>
              ) : null}
              {stats.length > 0 ? (
                <div className="mt-auto flex flex-col border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
                  {stats.map((s, i) => (
                    <div
                      key={"st-" + i}
                      className="flex items-center justify-between gap-2 border-b border-cyan-400/10 px-2 py-[3px] last:border-b-0 transition-colors duration-150 hover:bg-cyan-400/10"
                      style={{ animation: "none" }}
                    >
                      <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.15em] leading-none text-cyan-300/70">{s.label}</span>
                      <span className={"min-w-0 truncate text-[11px] font-mono font-bold tracking-widest " + r.text}>{String(s.value)}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}