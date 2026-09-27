type EquipmentSlotProps = {
  slotId: string;
  item?: { id: string; name: string; rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; iconUrl?: string };
  locked?: boolean;
  selected?: boolean;
  onSelect?: (slotId: string) => void;
};

const EquipmentSlotRarity: Record<string, { text: string; hex: string }> = {
  common: { text: "text-slate-300", hex: "#cbd5e1" },
  uncommon: { text: "text-lime-400", hex: "#a3e635" },
  rare: { text: "text-sky-400", hex: "#38bdf8" },
  epic: { text: "text-fuchsia-400", hex: "#e879f9" },
  legendary: { text: "text-yellow-300", hex: "#fde047" },
};

export const EquipmentSlot_MIN = {"base":[4.5,4]};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { slotId, item, locked, selected, onSelect } = props;
  const uid = useRef("eqslot-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const floor = EquipmentSlot_MIN.base;
  const interactive = !!onSelect && !locked;
  const rar = item && item.rarity ? EquipmentSlotRarity[item.rarity] : null;
  const baseHex = rar ? rar.hex : (item ? "#67e8f9" : "#22d3ee");
  const accent = selected ? "#fde047" : baseHex;
  const active = interactive && (hover || press);

  const toRgba = (hex: string, a: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  };

  const down = (e: any) => {
    if (!interactive) return;
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    setPress(true);
    if (onSelect) onSelect(slotId);
  };

  const corner = (pos: string) => (
    <div
      key={pos}
      className={"pointer-events-none absolute h-[0.5rem] w-[0.5rem] transition-all duration-200 ease-out " +
        (pos === "tl" ? "left-[-1px] top-[-1px] border-l-2 border-t-2 " :
         pos === "tr" ? "right-[-1px] top-[-1px] border-r-2 border-t-2 " :
         pos === "bl" ? "bottom-[-1px] left-[-1px] border-b-2 border-l-2 " :
                        "bottom-[-1px] right-[-1px] border-b-2 border-r-2 ")}
      style={{
        borderColor: accent,
        opacity: selected ? 1 : active ? 0.9 : item ? 0.6 : 0.35,
        transform: (selected || active) ? "scale(1.14)" : "scale(1)",
        filter: selected ? "drop-shadow(0 0 5px " + toRgba(accent, 0.9) + ")" : "none",
      }}
    />
  );

  return (
    <div
      className={"relative h-full w-full select-none touch-none transition-all duration-200 ease-out " +
        (locked ? "opacity-40 grayscale " : "") + (interactive ? "cursor-pointer " : "")}
      style={{
        minWidth: floor[0] + "rem",
        minHeight: floor[1] + "rem",
        transform: press ? "translateY(0) scale(0.975)" : active ? "translateY(-1px)" : "none",
      }}
      onPointerDown={down}
      onPointerUp={() => setPress(false)}
      onPointerCancel={() => setPress(false)}
      onPointerEnter={() => { if (interactive) setHover(true); }}
      onPointerLeave={() => { setHover(false); setPress(false); }}
    >
      {/* frame + surface */}
      <div
        className="absolute inset-0 rounded-md border transition-all duration-200 ease-out"
        style={{
          borderColor: selected ? toRgba(accent, 0.95) : toRgba(accent, active ? 0.7 : item ? 0.42 : 0.22),
          background: item
            ? "linear-gradient(135deg," + toRgba(baseHex, selected ? 0.16 : active ? 0.13 : 0.08) + " 0%, rgba(10,10,20,0.96) 70%)"
            : "linear-gradient(135deg,rgba(21,15,40,0.55) 0%, rgba(7,7,12,0.98) 100%)",
          boxShadow: selected
            ? "0 0 16px rgba(253,224,71,0.4), inset 0 2px 10px rgba(0,0,0,0.85)"
            : active
              ? "0 0 14px " + toRgba(baseHex, 0.35) + ", inset 0 2px 8px rgba(0,0,0,0.8)"
              : "inset 0 2px 8px rgba(0,0,0,0.8)",
        }}
      />
      {/* rarity top edge */}
      <div
        className="pointer-events-none absolute left-[12%] right-[12%] top-0 h-[2px] rounded-full transition-all duration-300 ease-out"
        style={{
          background: "linear-gradient(90deg,transparent," + accent + ",transparent)",
          opacity: item ? (selected ? 1 : active ? 0.85 : 0.55) : 0.12,
        }}
      />
      {["tl", "tr", "bl", "br"].map(corner)}

      {/* content */}
      <div className="absolute inset-[9%] flex min-h-0 min-w-0 flex-col gap-[0.15rem]">
        <div className="relative min-h-0 min-w-0 flex-[3]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id={uid + "-hex"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={toRgba(baseHex, item ? 0.35 : 0.1)} />
                <stop offset="100%" stopColor="rgba(7,7,12,0.2)" />
              </linearGradient>
            </defs>
            <polygon
              points="50,6 89,28 89,72 50,94 11,72 11,28"
              fill={"url(#" + uid + "-hex)"}
              stroke={accent}
              strokeWidth={item ? 2.6 : 1.6}
              strokeDasharray={item ? "none" : "7 6"}
              strokeLinejoin="round"
              opacity={item ? (selected ? 1 : active ? 0.9 : 0.7) : 0.32}
              style={{ transition: "all 200ms ease-out" }}
            />
            {item ? (
              <polygon
                points="50,16 80,33 80,67 50,84 20,67 20,33"
                fill="none"
                stroke={accent}
                strokeWidth="0.9"
                opacity={selected ? 0.55 : 0.22}
              />
            ) : null}
          </svg>

          {item && item.iconUrl ? (
            <img
              src={item.iconUrl}
              alt=""
              draggable={false}
              className="pointer-events-none absolute inset-[24%] h-auto w-auto max-h-[52%] max-w-[52%] m-auto object-contain transition-all duration-200 ease-out"
              style={{ filter: "drop-shadow(0 0 6px " + toRgba(accent, 0.6) + ")", left: 0, right: 0, top: 0, bottom: 0 }}
            />
          ) : item ? (
            <div className="pointer-events-none absolute inset-[30%]">
              <FitText
                wrap={false}
                className={"font-mono font-black tracking-tight " + (rar ? rar.text : "text-cyan-300")}
              >
                {item.name.trim().slice(0, 1).toUpperCase()}
              </FitText>
            </div>
          ) : (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[14%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "linear-gradient(90deg,transparent,rgba(100,116,139,0.55),transparent)" }}
            />
          )}

          {selected && item ? (
            <span
              className="pointer-events-none absolute right-[6%] top-[6%] h-[0.4rem] w-[0.4rem] animate-ping rounded-full"
              style={{ background: accent }}
            />
          ) : null}
        </div>

        <div className="min-h-0 min-w-0 flex-[1.1]">
          {item ? (
            <FitText
              className={"font-mono font-bold uppercase tracking-wider transition-all duration-200 ease-out " +
                (selected ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" : (rar ? rar.text : "text-cyan-100"))}
            >
              {item.name}
            </FitText>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-[2px] w-[40%] rounded-full bg-slate-600/50" />
            </div>
          )}
        </div>
      </div>

      {/* locked overlay */}
      {locked ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-md">
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(135deg, rgba(253,224,71,0.14) 0px, rgba(253,224,71,0.14) 3px, transparent 3px, transparent 9px)",
            }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <g opacity="0.9" transform="translate(50 52) scale(0.34) translate(-50 -50)">
              <rect x="22" y="45" width="56" height="44" rx="7" fill="rgba(7,7,12,0.85)" stroke="#fde047" strokeWidth="6" />
              <path d="M34 45 V32 a16 16 0 0 1 32 0 V45" fill="none" stroke="#fde047" strokeWidth="6" strokeLinecap="round" />
              <circle cx="50" cy="65" r="6" fill="#fde047" />
            </g>
          </svg>
        </div>
      ) : null}
    </div>
  );
}