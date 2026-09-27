type EquipmentSlotProps = {
  item: { id: string; label: string; icon?: string; rarity?: string } | null;
  slotId: string;
  onSelect: (slotId: string) => void;
  onClear?: (slotId: string) => void;
  accepts?: string;
};

export const EquipmentSlot_MIN = {"base":[5,3.5]};

const EquipmentSlotRarity: Record<string, { text: string; border: string; glow: string; rgb: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "rgba(163,163,163,0.35)", rgb: "163,163,163" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "rgba(52,211,153,0.45)", rgb: "52,211,153" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "rgba(34,211,238,0.5)", rgb: "34,211,238" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "rgba(232,121,249,0.5)", rgb: "232,121,249" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "rgba(252,211,77,0.5)", rgb: "252,211,77" },
};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { item, slotId, onSelect, onClear, accepts } = props;
  const uid = useRef("eqslot-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevId = useRef<string | null>(item ? item.id : null);

  useEffect(() => {
    const cur = item ? item.id : null;
    if (cur !== prevId.current) {
      prevId.current = cur;
      if (cur) {
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 500);
        return () => clearTimeout(t);
      }
    }
  }, [item]);

  const rar = (item && item.rarity && EquipmentSlotRarity[item.rarity.toLowerCase()]) || null;
  const accent = rar || { text: "text-cyan-300", border: "border-cyan-400/40", glow: "rgba(34,211,238,0.4)", rgb: "34,211,238" };
  const floor = EquipmentSlot_MIN.base;
  const clip = "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))";

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        type="button"
        onClick={() => onSelect(slotId)}
        onPointerDown={() => setPress(true)}
        onPointerUp={() => setPress(false)}
        onPointerLeave={() => setPress(false)}
        className={
          "group absolute inset-0 block touch-none overflow-hidden border text-left transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (item
            ? accent.border + " bg-neutral-900/85 "
            : "border-cyan-400/20 bg-black/60 ") +
          (press ? "brightness-125 scale-[0.975] " : "")
        }
        style={{
          clipPath: clip,
          boxShadow: item
            ? "inset 0 0 14px rgba(0,0,0,0.85), 0 0 " + (press ? "18px " : "10px ") + accent.glow
            : "inset 0 0 12px rgba(0,0,0,0.8)",
        }}
      >
        {/* base gradient */}
        <span
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            background: item
              ? "linear-gradient(140deg, rgba(" + accent.rgb + ",0.16) 0%, rgba(10,10,12,0.9) 55%, rgba(0,0,0,0.95) 100%)"
              : "repeating-linear-gradient(135deg, rgba(34,211,238,0.06) 0 2px, rgba(0,0,0,0) 2px 9px)",
          }}
        />
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0 1px, rgba(0,0,0,0) 1px 4px)" }}
        />
        {/* hover sweep */}
        <span
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 opacity-0 transition-all duration-500 ease-out group-hover:left-[110%] group-hover:opacity-100"
          style={{ background: "linear-gradient(90deg, rgba(0,0,0,0), rgba(" + accent.rgb + ",0.28), rgba(0,0,0,0))" }}
        />
        {/* equip flash */}
        {flash && (
          <span
            className="pointer-events-none absolute inset-0 animate-ping"
            style={{ background: "rgba(" + accent.rgb + ",0.18)" }}
          />
        )}

        {/* corner brackets */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={"rgba(" + accent.rgb + ",0.9)"} />
              <stop offset="100%" stopColor={"rgba(" + accent.rgb + ",0.25)"} />
            </linearGradient>
          </defs>
          <path d="M0 0 H16 M0 0 V18" stroke={"url(#" + uid + "-edge)"} strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />
          <path d="M100 100 H84 M100 100 V82" stroke={"url(#" + uid + "-edge)"} strokeWidth="3" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* content */}
        <span className="absolute inset-0 flex items-stretch gap-2 p-2">
          {/* icon / empty mark */}
          <span className="relative aspect-square h-full max-w-[42%] shrink">
            <span
              className={
                "absolute inset-0 border transition-all duration-200 " +
                (item ? accent.border : "border-cyan-400/20 border-dashed")
              }
              style={{
                clipPath: "polygon(18% 0, 100% 0, 100% 82%, 82% 100%, 0 100%, 0 18%)",
                background: item ? "rgba(" + accent.rgb + ",0.10)" : "rgba(0,0,0,0.4)",
              }}
            />
            {item ? (
              item.icon ? (
                <span className="absolute inset-[16%]">
                  <FitText className={"font-mono font-bold tracking-widest uppercase " + accent.text} wrap={false}>
                    {item.icon}
                  </FitText>
                </span>
              ) : (
                <svg className="absolute inset-[22%] h-auto w-auto" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style={{ width: "56%", height: "56%", left: "22%", top: "22%" }}>
                  <path d="M12 2 L21 7 V17 L12 22 L3 17 V7 Z" fill="none" stroke={"rgba(" + accent.rgb + ",0.85)"} strokeWidth="1.6" />
                  <path d="M12 7 L16.5 9.5 V14.5 L12 17 L7.5 14.5 V9.5 Z" fill={"rgba(" + accent.rgb + ",0.35)"} />
                </svg>
              )
            ) : (
              <svg className="absolute left-[25%] top-[25%]" style={{ width: "50%", height: "50%" }} viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
                <path d="M12 4 V20 M4 12 H20" stroke="rgba(34,211,238,0.5)" strokeWidth="2" strokeLinecap="square" className="transition-all duration-200 group-hover:stroke-[rgba(34,211,238,0.95)]" />
              </svg>
            )}
          </span>

          {/* label region */}
          <span className="relative flex min-w-0 flex-1 flex-col justify-center overflow-hidden">
            {item ? (
              <span className="relative min-h-0 min-w-0 flex-1">
                <span className="absolute inset-0 flex items-center">
                  <span className="relative h-full w-full">
                    <FitText className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + accent.text} align="start">
                      {item.label}
                    </FitText>
                  </span>
                </span>
              </span>
            ) : accepts ? (
              <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500 transition-colors duration-200 group-hover:text-cyan-300/80">
                {accepts}
              </span>
            ) : (
              <span className="h-px w-full bg-cyan-400/20" />
            )}
            {item && accepts ? (
              <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500">
                {accepts}
              </span>
            ) : null}
          </span>
        </span>
      </button>

      {/* clear */}
      {item && onClear ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(slotId); }}
          className="absolute right-0 top-0 z-10 flex h-4 w-4 items-center justify-center border border-rose-400/50 bg-black/70 text-rose-500 transition-all duration-200 ease-out hover:bg-rose-600 hover:text-white hover:shadow-[0_0_12px_rgba(244,63,94,0.6)] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" preserveAspectRatio="xMidYMid meet">
            <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}