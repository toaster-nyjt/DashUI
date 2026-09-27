type EquipmentSlotProps = {
  id: string;
  item?: { id: string; label: string; icon?: string; rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' };
  empty?: boolean;
  locked?: boolean;
  selected?: boolean;
  position?: { x: number; y: number };
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
};

const EquipmentSlotRarityHex: Record<string, string> = {
  common: "#cbd5e1",
  uncommon: "#a3e635",
  rare: "#38bdf8",
  epic: "#e879f9",
  legendary: "#fde047",
};

export const EquipmentSlot_MIN = {"base":[4.5,4]};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { id, item, empty, locked, selected, position, onSelect, onHover } = props;
  const uid = useRef("eqslot-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const floor = EquipmentSlot_MIN.base;

  const filled = !!item && !empty;
  const rarity = (item && item.rarity) || "common";
  const accent = locked ? "#64748b" : filled ? (EquipmentSlotRarityHex[rarity] || "#cbd5e1") : "#22d3ee";
  const interactive = !!onSelect && !locked;
  const point = !!position;

  const fire = (e: any) => {
    e.stopPropagation();
    if (!interactive) return;
    setPress(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const release = (e: any) => {
    e.stopPropagation();
    if (press && interactive && onSelect) onSelect(id);
    setPress(false);
  };

  const enter = () => { setHover(true); if (onHover) onHover(id); };
  const leave = () => { setHover(false); setPress(false); if (onHover) onHover(null); };

  const glow = selected
    ? "0 0 16px " + accent + "88, inset 0 0 14px " + accent + "33"
    : hover && interactive
    ? "0 0 12px " + accent + "55, inset 0 0 10px rgba(0,0,0,0.8)"
    : "inset 0 2px 8px rgba(0,0,0,0.8)";

  const clip = "polygon(0 14%, 14% 0, 100% 0, 100% 86%, 86% 100%, 0 100%)";

  const frame = (
    <div
      onPointerDown={fire}
      onPointerUp={release}
      onPointerCancel={() => setPress(false)}
      onPointerEnter={enter}
      onPointerLeave={leave}
      style={{
        pointerEvents: "auto",
        touchAction: "none",
        clipPath: clip,
        borderColor: locked ? "rgba(100,116,139,0.45)" : accent + (selected ? "cc" : filled ? "88" : "44"),
        boxShadow: glow,
        transform: press ? "scale(0.96)" : (hover && interactive) || selected ? "scale(1.04)" : "scale(1)",
        cursor: interactive ? "pointer" : "default",
        opacity: locked ? 0.55 : 1,
        filter: locked ? "grayscale(0.7)" : "none",
      }}
      className="absolute inset-0 flex flex-col overflow-hidden border bg-[#07070c] bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] transition-all duration-200 ease-out"
    >
      {/* corner accents */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={uid + "-sweep"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="50%" stopColor={accent} stopOpacity="0.20" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
          <pattern id={uid + "-hatch"} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="8" fill="#64748b" fillOpacity="0.18" />
          </pattern>
        </defs>
        {(selected || (hover && interactive)) && (
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sweep)"} className="animate-pulse" />
        )}
        {locked && <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-hatch)"} />}
        {!filled && !locked && (
          <rect x="4" y="4" width="92" height="92" fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
        )}
      </svg>

      {/* top edge tag */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-[3px] transition-all duration-500 ease-out"
        style={{ width: filled ? "62%" : "22%", background: accent, boxShadow: "0 0 8px " + accent }}
      />
      {selected && (
        <div className="pointer-events-none absolute inset-0 animate-pulse" style={{ boxShadow: "inset 0 0 0 2px " + accent + "99" }} />
      )}

      {/* content */}
      <div className="relative flex h-full w-full flex-col">
        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-[12%]">
            {locked ? (
              <FitText wrap={false} className="font-mono font-black tracking-tight text-slate-400">⛒</FitText>
            ) : filled ? (
              <FitText
                wrap={false}
                className="font-mono font-black tracking-tight transition-all duration-200"
                {...{}}
              >
                {item && item.icon ? item.icon : "◈"}
              </FitText>
            ) : (
              <FitText wrap={false} className="font-mono font-black tracking-tight text-cyan-400/40">+</FitText>
            )}
          </div>
          <div className="pointer-events-none absolute inset-0" style={{ mixBlendMode: "normal" }} />
        </div>
        {!point && (
          <div className="relative h-[34%] min-h-0 w-full border-t" style={{ borderColor: accent + "33" }}>
            <div className="absolute inset-x-[6%] inset-y-[14%]">
              <FitText
                wrap={false}
                className={
                  "font-mono font-bold uppercase tracking-[0.12em] " +
                  (locked ? "text-slate-500" : filled ? "" : "text-slate-500")
                }
              >
                {locked ? "LOCKED" : filled && item ? item.label : "EMPTY"}
              </FitText>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tinted = (
    <div style={{ color: accent }} className="absolute inset-0 transition-colors duration-200">
      {frame}
    </div>
  );

  if (point) {
    return (
      <div className="pointer-events-none relative h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
        <div
          className="absolute"
          style={{
            left: (position as any).x * 100 + "%",
            top: (position as any).y * 100 + "%",
            width: "3.25rem",
            height: "3.25rem",
            transform: "translate(-50%,-50%)",
          }}
        >
          {tinted}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none relative h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      {tinted}
    </div>
  );
}