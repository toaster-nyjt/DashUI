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

const EquipmentSlotRarity: Record<string, { hex: string; cls: string }> = {
  common: { hex: "#cbd5e1", cls: "text-slate-300" },
  uncommon: { hex: "#a3e635", cls: "text-lime-400" },
  rare: { hex: "#38bdf8", cls: "text-sky-400" },
  epic: { hex: "#e879f9", cls: "text-fuchsia-400" },
  legendary: { hex: "#fde047", cls: "text-yellow-300" },
};

export const EquipmentSlot_MIN = {"base":[4,4]};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { id, item, empty, locked, selected, position, onSelect, onHover } = props;
  const uid = useRef("eqslot-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const [flash, setFlash] = useState(false);

  const floor = (EquipmentSlot_MIN as any).base;
  const rar = item && item.rarity ? EquipmentSlotRarity[item.rarity] : null;
  const accent = locked ? "#64748b" : rar ? rar.hex : item ? "#22d3ee" : "#22d3ee";
  const filled = !!item && !empty;
  const interactive = !!onSelect && !locked;

  const prevItem = useRef<string | undefined>(item ? item.id : undefined);
  useEffect(() => {
    const cur = item ? item.id : undefined;
    if (cur !== prevItem.current) {
      prevItem.current = cur;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 520);
      return () => clearTimeout(t);
    }
  }, [item && item.id]);

  const enter = () => { setHover(true); if (onHover) onHover(id); };
  const leave = () => { setHover(false); setPress(false); if (onHover) onHover(null); };

  const glow =
    locked ? "none"
      : selected ? "drop-shadow(0 0 10px " + accent + ") drop-shadow(0 0 22px " + accent + "66)"
        : hover && interactive ? "drop-shadow(0 0 8px " + accent + "cc)"
          : filled ? "drop-shadow(0 0 4px " + accent + "55)" : "none";

  const frame = (
    <svg
      className="absolute inset-0 h-full w-full transition-all duration-200 ease-out"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ filter: glow }}
    >
      <defs>
        <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={filled ? (selected ? 0.3 : 0.16) : 0.05} />
          <stop offset="100%" stopColor="#0a0a14" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={uid + "-sweep"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <pattern id={uid + "-hatch"} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="transparent" />
          <rect width="3" height="8" fill="#64748b" fillOpacity="0.22" />
        </pattern>
        <clipPath id={uid + "-clip"}>
          <path d="M14,2 L98,2 L98,86 L86,98 L2,98 L2,14 Z" />
        </clipPath>
      </defs>

      <path d="M14,2 L98,2 L98,86 L86,98 L2,98 L2,14 Z" fill={"url(#" + uid + "-fill)"} />
      {locked ? <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-hatch)"} clipPath={"url(#" + uid + "-clip)"} /> : null}

      {!filled && !locked ? (
        <g stroke={accent} strokeOpacity="0.2" strokeWidth="1.2">
          <line x1="22" y1="50" x2="78" y2="50" strokeDasharray="5 5" />
          <line x1="50" y1="22" x2="50" y2="78" strokeDasharray="5 5" />
        </g>
      ) : null}

      <path
        d="M14,2 L98,2 L98,86 L86,98 L2,98 L2,14 Z"
        fill="none"
        stroke={accent}
        strokeOpacity={locked ? 0.35 : selected ? 1 : filled ? 0.7 : 0.35}
        strokeWidth={selected ? 3 : 1.8}
        strokeDasharray={filled || locked ? undefined : "6 4"}
        vectorEffect="non-scaling-stroke"
        className="transition-all duration-200 ease-out"
      />
      {/* corner brackets */}
      <g stroke={accent} strokeOpacity={locked ? 0.3 : 0.9} strokeWidth="2.4" vectorEffect="non-scaling-stroke" fill="none">
        <path d="M14,2 L2,14" />
        <path d="M98,86 L86,98" />
        {selected || hover ? <path d="M90,2 L98,2 L98,10" /> : null}
        {selected || hover ? <path d="M2,90 L2,98 L10,98" /> : null}
      </g>

      {(selected || (hover && interactive)) && !locked ? (
        <g clipPath={"url(#" + uid + "-clip)"}>
          <rect x="0" y="-40" width="100" height="40" fill={"url(#" + uid + "-sweep)"}>
            <animate attributeName="y" from="-40" to="100" dur="1.6s" repeatCount="indefinite" />
          </rect>
        </g>
      ) : null}
      {flash ? (
        <rect x="0" y="0" width="100" height="100" fill={accent} clipPath={"url(#" + uid + "-clip)"} opacity="0.5">
          <animate attributeName="opacity" from="0.5" to="0" dur="0.5s" fill="freeze" />
        </rect>
      ) : null}
    </svg>
  );

  const face = (
    <div className="absolute inset-[13%] flex flex-col items-stretch gap-[6%] pointer-events-none">
      {locked ? (
        <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-full w-full max-h-full" preserveAspectRatio="xMidYMid meet">
            <path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke="#94a3b8" strokeOpacity="0.7" strokeWidth="1.8" />
            <rect x="5" y="11" width="14" height="9" rx="1.5" fill="#0a0a14" stroke="#94a3b8" strokeOpacity="0.7" strokeWidth="1.6" />
            <circle cx="12" cy="15.5" r="1.4" fill="#94a3b8" fillOpacity="0.8" />
          </svg>
        </div>
      ) : filled ? (
        <>
          {item && item.icon ? (
            <div className="flex-[3] min-h-0 min-w-0">
              <FitText
                wrap={false}
                className={
                  "font-mono font-black tracking-tight transition-all duration-200 ease-out " +
                  (rar ? rar.cls : "text-cyan-200")
                }
              >
                {item.icon}
              </FitText>
            </div>
          ) : null}
          <div className={(item && item.icon ? "flex-[2]" : "flex-1") + " min-h-0 min-w-0"}>
            <FitText
              className={
                "font-mono font-bold tracking-[0.12em] uppercase transition-all duration-200 ease-out " +
                (selected ? "text-cyan-50" : rar ? rar.cls : "text-cyan-100/90")
              }
            >
              {item ? item.label : ""}
            </FitText>
          </div>
        </>
      ) : null}
    </div>
  );

  const tile = (
    <div
      className={
        "relative h-full w-full transition-all duration-200 ease-out " +
        (locked ? "opacity-50 grayscale " : "") +
        (interactive ? "cursor-pointer " : "") +
        (press ? "translate-y-[1px] brightness-90 " : hover && interactive ? "-translate-y-[1px] " : "")
      }
      style={{ pointerEvents: "auto" }}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onPointerDown={(e) => { e.stopPropagation(); if (interactive) setPress(true); }}
      onPointerUp={() => setPress(false)}
      onClick={() => { if (interactive && onSelect) onSelect(id); }}
    >
      {frame}
      {face}
    </div>
  );

  if (position) {
    return (
      <div
        className="relative h-full w-full pointer-events-none"
        style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      >
        <div
          className="absolute"
          style={{
            left: position.x * 100 + "%",
            top: position.y * 100 + "%",
            width: "2.9rem",
            height: "2.9rem",
            transform: "translate(-50%,-50%)",
          }}
        >
          {tile}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full pointer-events-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0">{tile}</div>
    </div>
  );
}