type EquipmentSlotProps = { item: { id: string; label: string; icon?: string; rarity?: string } | null; slotId: string; onSelect: (slotId: string) => void; onClear?: (slotId: string) => void; accepts?: string };

const EquipmentSlotRarity: Record<string, { text: string; border: string; glow: string; rgb: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "0 0 10px rgba(163,163,163,0.25)", rgb: "163,163,163" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "0 0 14px rgba(52,211,153,0.35)", rgb: "52,211,153" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "0 0 14px rgba(34,211,238,0.4)", rgb: "34,211,238" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "0 0 16px rgba(232,121,249,0.45)", rgb: "232,121,249" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "0 0 18px rgba(252,211,77,0.5)", rgb: "252,211,77" },
};

export const EquipmentSlot_MIN = {"base":[4.5,4]};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { item, slotId, onSelect, onClear, accepts } = props;
  const uid = useRef("equipmentslot-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => { setPulse((p) => p + 1); }, [item ? item.id : "none"]);

  const r = (item && item.rarity && EquipmentSlotRarity[item.rarity.toLowerCase()]) || null;
  const tone = r ? r : { text: "text-cyan-300", border: "border-cyan-400/45", glow: "0 0 12px rgba(34,211,238,0.3)", rgb: "34,211,238" };
  const floor = EquipmentSlot_MIN.base;

  const Bracket = (a: { x: string; y: string; rx: number; ry: number }) => (
    <span
      className="pointer-events-none absolute transition-all duration-200 ease-out"
      style={{
        left: a.x === "l" ? "0" : undefined,
        right: a.x === "r" ? "0" : undefined,
        top: a.y === "t" ? "0" : undefined,
        bottom: a.y === "b" ? "0" : undefined,
        width: hover ? "34%" : "22%",
        height: hover ? "34%" : "22%",
        maxWidth: "0.9rem",
        maxHeight: "0.9rem",
        borderColor: "rgba(" + tone.rgb + ",0.9)",
        borderTopWidth: a.y === "t" ? 2 : 0,
        borderBottomWidth: a.y === "b" ? 2 : 0,
        borderLeftWidth: a.x === "l" ? 2 : 0,
        borderRightWidth: a.x === "r" ? 2 : 0,
        opacity: item ? 1 : 0.5,
        filter: hover ? "drop-shadow(0 0 4px rgba(" + tone.rgb + ",0.8))" : "none",
      }}
    />
  );

  return (
    <div className="relative h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <button
        type="button"
        onClick={() => onSelect(slotId)}
        onPointerDown={() => setPress(true)}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        className={"group absolute inset-0 flex flex-col overflow-hidden border bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] rounded-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " + (item ? tone.border : "border-cyan-400/20 border-dashed")}
        style={{
          boxShadow: (hover || item ? tone.glow + ", " : "") + "inset 0 0 12px rgba(0,0,0,0.8)",
          transform: press ? "scale(0.97)" : "scale(1)",
          backgroundColor: hover ? "rgba(" + tone.rgb + ",0.07)" : undefined,
        }}
      >
        {/* scanline / hatch texture */}
        <span
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: item
              ? "repeating-linear-gradient(0deg, rgba(" + tone.rgb + ",0.10) 0px, rgba(" + tone.rgb + ",0.10) 1px, transparent 1px, transparent 4px)"
              : "repeating-linear-gradient(45deg, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 7px)",
          }}
        />
        {/* sweep on hover */}
        <span
          className="pointer-events-none absolute inset-y-0 w-1/3 transition-all duration-500 ease-out"
          style={{
            left: hover ? "100%" : "-40%",
            background: "linear-gradient(90deg, transparent, rgba(" + tone.rgb + ",0.18), transparent)",
          }}
        />
        {/* equip flash on item change */}
        <span
          key={"flash-" + uid + "-" + pulse}
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(" + tone.rgb + ",0.45), transparent 70%)",
            animation: "equipslot-fade 520ms ease-out forwards",
          }}
        />
        <style>{"@keyframes equipslot-fade{from{opacity:.9;transform:scale(.9)}to{opacity:0;transform:scale(1.05)}}"}</style>

        {Bracket({ x: "l", y: "t", rx: 0, ry: 0 })}
        {Bracket({ x: "r", y: "t", rx: 0, ry: 0 })}
        {Bracket({ x: "l", y: "b", rx: 0, ry: 0 })}
        {Bracket({ x: "r", y: "b", rx: 0, ry: 0 })}

        {item ? (
          <span className="absolute inset-[11%] flex min-h-0 min-w-0 flex-col items-stretch gap-[2px]">
            {item.icon ? (
              <span className="relative min-h-0 min-w-0 flex-[1.4]">
                <FitText className={"font-mono font-bold " + tone.text} wrap={false}>{item.icon}</FitText>
              </span>
            ) : (
              <span className="relative min-h-0 min-w-0 flex-[1.4]">
                <svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
                  <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" fill="none" stroke={"rgba(" + tone.rgb + ",0.75)"} strokeWidth="2" />
                  <polygon points="20,12 27,16 27,24 20,28 13,24 13,16" fill={"rgba(" + tone.rgb + ",0.3)"} />
                </svg>
              </span>
            )}
            <span className="relative min-h-0 min-w-0 flex-1">
              <FitText className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + tone.text}>{item.label}</FitText>
            </span>
          </span>
        ) : (
          <span className="absolute inset-[14%] flex min-h-0 min-w-0 flex-col items-center justify-center gap-[3px]">
            <span className="relative min-h-0 min-w-0 flex-1">
              <svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
                <defs>
                  <linearGradient id={uid + "-plus"} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
                    <stop offset="100%" stopColor="rgba(232,121,249,0.7)" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="15" fill="none" stroke={"url(#" + uid + "-plus)"} strokeWidth="1.5" strokeDasharray="4 3" opacity={hover ? 0.95 : 0.5}>
                  <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="14s" repeatCount="indefinite" />
                </circle>
                <path d="M20 12 V28 M12 20 H28" stroke={"url(#" + uid + "-plus)"} strokeWidth="2.5" strokeLinecap="square" opacity={hover ? 1 : 0.6} />
              </svg>
            </span>
            {accepts ? (
              <span className="w-full min-w-0 truncate text-center text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-400">{accepts}</span>
            ) : null}
          </span>
        )}
      </button>

      {item && onClear ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(slotId); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 flex h-[0.95rem] w-[0.95rem] items-center justify-center border border-rose-400/50 bg-black/80 text-rose-500 transition-all duration-200 ease-out hover:bg-rose-600 hover:text-white hover:shadow-[0_0_12px_rgba(244,63,94,0.6)] active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <svg viewBox="0 0 10 10" className="h-[60%] w-[60%]" preserveAspectRatio="xMidYMid meet">
            <path d="M2 2 L8 8 M8 2 L2 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}