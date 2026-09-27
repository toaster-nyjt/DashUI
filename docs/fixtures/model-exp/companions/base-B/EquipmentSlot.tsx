type EquipmentSlotProps = { item: { id: string; label: string; icon?: string; rarity?: string } | null; slotId: string; onSelect: (slotId: string) => void; onClear?: (slotId: string) => void; accepts?: string };

const EquipmentSlotRarity: Record<string, { text: string; ring: string; glow: string; rgb: string }> = {
  common: { text: "text-neutral-300", ring: "border-neutral-500/60", glow: "rgba(163,163,163,0.35)", rgb: "163,163,163" },
  uncommon: { text: "text-emerald-400", ring: "border-emerald-400/60", glow: "rgba(52,211,153,0.45)", rgb: "52,211,153" },
  rare: { text: "text-cyan-300", ring: "border-cyan-400/60", glow: "rgba(34,211,238,0.5)", rgb: "34,211,238" },
  epic: { text: "text-fuchsia-400", ring: "border-fuchsia-400/60", glow: "rgba(232,121,249,0.5)", rgb: "232,121,249" },
  legendary: { text: "text-amber-300", ring: "border-amber-300/60", glow: "rgba(252,211,77,0.5)", rgb: "252,211,77" },
};

export const EquipmentSlot_MIN = {"base":[4.5,4.5]};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { item, slotId, onSelect, onClear, accepts } = props;
  const uid = useRef("eqslot-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);

  const r = (item && item.rarity && EquipmentSlotRarity[item.rarity.toLowerCase()]) || null;
  const tone = r || { text: "text-cyan-300", ring: "border-cyan-400/35", glow: "rgba(34,211,238,0.35)", rgb: "34,211,238" };
  const floor = EquipmentSlot_MIN.base;

  const clip = "polygon(0 14%, 14% 0, 100% 0, 100% 86%, 86% 100%, 0 100%)";

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        type="button"
        onClick={() => onSelect(slotId)}
        onPointerDown={() => setPress(true)}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        className={
          "absolute inset-0 touch-none overflow-hidden border bg-black/60 text-left transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          tone.ring + (press ? " scale-[0.97] brightness-125" : "")
        }
        style={{
          clipPath: clip,
          boxShadow: item
            ? "inset 0 0 14px rgba(0,0,0,0.85), 0 0 " + (hover ? "20px " : "10px ") + tone.glow
            : "inset 0 0 14px rgba(0,0,0,0.9)",
        }}
      >
        {/* scanlines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{ backgroundImage: "repeating-linear-gradient(180deg, rgba(" + tone.rgb + ",0.55) 0px, rgba(" + tone.rgb + ",0.55) 1px, transparent 1px, transparent 4px)" }}
        />
        {/* diagonal sheen */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: hover ? 0.5 : 0.22,
            background: "linear-gradient(135deg, rgba(" + tone.rgb + ",0.20) 0%, transparent 45%, transparent 70%, rgba(0,0,0,0.6) 100%)",
          }}
        />
        {/* corner brackets */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M2 22 L2 4 L22 4" fill="none" stroke={"rgba(" + tone.rgb + ",0.9)"} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <path d="M98 78 L98 96 L78 96" fill="none" stroke={"rgba(" + tone.rgb + ",0.9)"} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>

        {item ? (
          <div className="absolute inset-[7%] flex flex-col gap-[2px]">
            <div className="relative flex-[3] min-h-0 min-w-0">
              {item.icon ? (
                <div className="absolute inset-[6%]">
                  <FitText wrap={false} className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + tone.text}>
                    {item.icon}
                  </FitText>
                </div>
              ) : (
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={"rgba(" + tone.rgb + ",0.85)"} />
                      <stop offset="100%" stopColor={"rgba(" + tone.rgb + ",0.15)"} />
                    </linearGradient>
                  </defs>
                  <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill={"url(#" + uid + "-g)"} stroke={"rgba(" + tone.rgb + ",0.9)"} strokeWidth="2" />
                  <polygon points="50,32 66,41 66,59 50,68 34,59 34,41" fill="rgba(0,0,0,0.6)" stroke={"rgba(" + tone.rgb + ",0.6)"} strokeWidth="1.5" />
                </svg>
              )}
            </div>
            <div className="relative flex-[2] min-h-0 min-w-0">
              <div className="absolute inset-x-0 inset-y-[10%]">
                <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + tone.text}>
                  {item.label}
                </FitText>
              </div>
            </div>
            <div
              className="h-[3px] w-full transition-all duration-200"
              style={{ background: "linear-gradient(90deg, rgba(" + tone.rgb + ",1), rgba(" + tone.rgb + ",0.05))", boxShadow: "0 0 8px rgba(" + tone.rgb + ",0.7)" }}
            />
          </div>
        ) : (
          <div className="absolute inset-[9%] flex flex-col items-center justify-center gap-[4%]">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              <polygon
                points="50,16 80,33 80,67 50,84 20,67 20,33"
                fill="none"
                stroke={hover ? "rgba(34,211,238,0.75)" : "rgba(34,211,238,0.3)"}
                strokeWidth="2"
                strokeDasharray="6 5"
                className="transition-all duration-200"
              >
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="18s" repeatCount="indefinite" />
              </polygon>
              <path d="M50 38 L50 62 M38 50 L62 50" stroke={hover ? "rgba(34,211,238,0.9)" : "rgba(34,211,238,0.35)"} strokeWidth="3" strokeLinecap="round" className="transition-all duration-200" />
            </svg>
            {accepts ? (
              <div className="relative h-[26%] w-full min-w-0">
                <FitText wrap={false} className="font-mono font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  {accepts}
                </FitText>
              </div>
            ) : null}
          </div>
        )}
      </button>

      {item && onClear ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(slotId); }}
          className="absolute right-0 top-0 flex h-[26%] w-[26%] items-center justify-center border border-rose-400/50 bg-black/80 text-rose-500 transition-all duration-200 ease-out hover:bg-rose-600 hover:text-white hover:shadow-[0_0_14px_rgba(244,63,94,0.7)] active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 30% 100%)" }}
        >
          <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]">
            <path d="M7 7 L17 17 M17 7 L7 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}