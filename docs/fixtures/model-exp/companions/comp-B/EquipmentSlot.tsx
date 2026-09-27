type EquipmentSlotProps = { item: { id: string; label: string; icon?: string; rarity?: string } | null; slotId: string; onSelect: (slotId: string) => void; onClear?: (slotId: string) => void; accepts?: string };

const EquipmentSlotRarity: Record<string, { text: string; border: string; glow: string; bg: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "0 0 14px rgba(163,163,163,0.35)", bg: "rgba(163,163,163,0.10)" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "0 0 14px rgba(52,211,153,0.45)", bg: "rgba(16,185,129,0.12)" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "0 0 16px rgba(34,211,238,0.5)", bg: "rgba(34,211,238,0.12)" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "0 0 16px rgba(232,121,249,0.5)", bg: "rgba(232,121,249,0.12)" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "0 0 18px rgba(252,211,77,0.55)", bg: "rgba(251,191,36,0.12)" },
};

export const EquipmentSlot_MIN = {"base":[6,2.75]};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { item, slotId, onSelect, onClear, accepts } = props;
  const uid = useRef("equipmentslot-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const [pulse, setPulse] = useState(0);
  const lastId = useRef<string | null>(item ? item.id : null);

  useEffect(() => {
    const cur = item ? item.id : null;
    if (cur !== lastId.current) {
      lastId.current = cur;
      setPulse((p) => p + 1);
    }
  }, [item]);

  const r = item && item.rarity ? EquipmentSlotRarity[item.rarity.toLowerCase()] : undefined;
  const tone = r || { text: "text-cyan-300", border: "border-cyan-400/40", glow: "0 0 14px rgba(34,211,238,0.35)", bg: "rgba(34,211,238,0.08)" };
  const filled = !!item;

  const floor = EquipmentSlot_MIN.base;

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        role="button"
        tabIndex={0}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        onPointerDown={() => setPress(true)}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onClick={() => onSelect(slotId)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(slotId); } }}
        className={
          "group absolute inset-0 cursor-pointer overflow-hidden border bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (filled ? tone.border : "border-cyan-400/25 border-dashed") +
          (press ? " brightness-125" : "")
        }
        style={{
          transform: press ? "scale(0.975)" : "scale(1)",
          boxShadow: hover || press
            ? "inset 0 0 14px rgba(0,0,0,0.85), " + tone.glow
            : "inset 0 0 12px rgba(0,0,0,0.8)",
          backgroundImage: filled
            ? "linear-gradient(135deg," + tone.bg + " 0%, rgba(0,0,0,0) 55%)"
            : "repeating-linear-gradient(135deg, rgba(34,211,238,0.06) 0px, rgba(34,211,238,0.06) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 7px)",
        }}
      >
        {/* corner brackets */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0)" />
              <stop offset="50%" stopColor="rgba(34,211,238,0.35)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </linearGradient>
          </defs>
          <path d="M0,14 L0,0 L14,0" fill="none" stroke="currentColor" strokeWidth="2.5" className={filled ? tone.text : "text-cyan-400/40"} opacity="0.8" vectorEffect="non-scaling-stroke" />
          <path d="M100,86 L100,100 L86,100" fill="none" stroke="currentColor" strokeWidth="2.5" className={filled ? tone.text : "text-cyan-400/40"} opacity="0.8" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* sweep on hover */}
        <div
          className="pointer-events-none absolute inset-y-0 w-1/3 transition-opacity duration-300"
          style={{
            opacity: hover ? 1 : 0,
            background: "linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.14) 50%, rgba(34,211,238,0) 100%)",
            animation: hover ? "equipslot-sweep-" + uid + " 1.6s linear infinite" : "none",
          }}
        />
        {/* equip flash */}
        <div
          key={"flash-" + pulse}
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.22), rgba(255,255,255,0.0))",
            animation: pulse > 0 ? "equipslot-flash-" + uid + " 460ms ease-out 1" : "none",
            opacity: 0,
          }}
        />

        <style>{
          "@keyframes equipslot-sweep-" + uid + " { 0% { transform: translateX(-60%);} 100% { transform: translateX(340%);} }" +
          "@keyframes equipslot-flash-" + uid + " { 0% { opacity:0.9; } 100% { opacity:0; } }"
        }</style>

        <div className="absolute inset-[7%] flex min-h-0 min-w-0 items-stretch gap-2">
          {/* icon bay */}
          <div className="relative h-full aspect-square max-w-[38%] min-w-0">
            <div
              className={"absolute inset-0 border transition-all duration-200 " + (filled ? tone.border : "border-cyan-400/20")}
              style={{ background: filled ? tone.bg : "rgba(0,0,0,0.5)" }}
            />
            <div className="absolute inset-[14%] flex min-h-0 min-w-0 items-center justify-center">
              {filled && item && item.icon ? (
                <FitText className={"font-mono font-bold tracking-widest uppercase " + tone.text} wrap={false}>{item.icon}</FitText>
              ) : (
                <svg viewBox="0 0 24 24" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
                  <path
                    d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    className={filled ? tone.text : "text-cyan-400/35"}
                    strokeDasharray={filled ? "0" : "3 2.5"}
                  />
                  {!filled && <circle cx="12" cy="12" r="1.6" className="text-cyan-400/40" fill="currentColor" />}
                </svg>
              )}
            </div>
          </div>

          {/* text bay */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-[2px]">
            <div className="min-h-0 min-w-0 flex-1">
              {filled && item ? (
                <FitText className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + tone.text} align="start">{item.label}</FitText>
              ) : (
                <FitText className="font-mono font-bold uppercase tracking-widest text-neutral-500" align="start">{accepts ? accepts : "EMPTY"}</FitText>
              )}
            </div>
            <div className="h-[2px] w-full overflow-hidden bg-black/70">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: filled ? "100%" : "28%",
                  background: filled
                    ? "linear-gradient(90deg, currentColor, rgba(255,255,255,0.15))"
                    : "rgba(34,211,238,0.3)",
                  boxShadow: filled ? tone.glow : "none",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {onClear && filled && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(slotId); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 z-10 flex h-[26%] min-h-0 aspect-square items-center justify-center border border-rose-400/50 bg-black/70 text-rose-500 opacity-70 transition-all duration-200 ease-out hover:bg-rose-600 hover:text-white hover:opacity-100 hover:shadow-[0_0_14px_rgba(244,63,94,0.6)] active:scale-[0.92] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <svg viewBox="0 0 12 12" className="h-[64%] w-[64%]" preserveAspectRatio="xMidYMid meet">
            <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}