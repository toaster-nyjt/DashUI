type EquipmentSlotProps = { item: { id: string; label: string; icon?: string; rarity?: string } | null; slotId: string; onSelect: (slotId: string) => void; onClear?: (slotId: string) => void; accepts?: string };

const EquipmentSlotRarity: Record<string, { text: string; border: string; glow: string; rgb: string }> = {
  common: { text: "text-neutral-300", border: "border-neutral-500/60", glow: "rgba(163,163,163,0.35)", rgb: "163,163,163" },
  uncommon: { text: "text-emerald-400", border: "border-emerald-400/60", glow: "rgba(52,211,153,0.45)", rgb: "52,211,153" },
  rare: { text: "text-cyan-300", border: "border-cyan-400/60", glow: "rgba(34,211,238,0.5)", rgb: "34,211,238" },
  epic: { text: "text-fuchsia-400", border: "border-fuchsia-400/60", glow: "rgba(232,121,249,0.5)", rgb: "232,121,249" },
  legendary: { text: "text-amber-300", border: "border-amber-300/60", glow: "rgba(252,211,77,0.55)", rgb: "252,211,77" },
};

export const EquipmentSlot_MIN = {"base":[6,3]};

export function EquipmentSlot(props: EquipmentSlotProps) {
  const { item, slotId, onSelect, onClear, accepts } = props;
  const uid = useRef("equipslot-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(0);
  const lastId = useRef<string | null>(item ? item.id : null);

  useEffect(() => {
    const id = item ? item.id : null;
    if (id !== lastId.current) {
      lastId.current = id;
      setPulse((p) => p + 1);
    }
  }, [item]);

  const r = item && item.rarity ? EquipmentSlotRarity[item.rarity.toLowerCase()] : undefined;
  const tone = r ?? { text: "text-cyan-300", border: "border-cyan-400/40", glow: "rgba(34,211,238,0.4)", rgb: "34,211,238" };
  const empty = !item;
  const floor = EquipmentSlot_MIN.base;

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(slotId)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(slotId); } }}
        onPointerDown={() => setPress(true)}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        className={
          "absolute inset-0 overflow-hidden border cursor-pointer rounded-sm transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (empty ? "border-dashed border-cyan-400/25 bg-black/60 " : tone.border + " bg-neutral-900/85 ") +
          (press ? "scale-[0.97] brightness-110 " : "")
        }
        style={{
          boxShadow: empty
            ? "inset 0 0 12px rgba(0,0,0,0.8)"
            : (hover
                ? "inset 0 0 14px rgba(0,0,0,0.75), 0 0 18px " + tone.glow
                : "inset 0 0 14px rgba(0,0,0,0.8), 0 0 8px " + tone.glow)
        }}
      >
        {/* scanline / diagonal texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(" + tone.rgb + ",0.07) 0px, rgba(" + tone.rgb + ",0.07) 1px, transparent 1px, transparent 6px)" }}
        />
        {/* rarity edge wash */}
        {!empty && (
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{ background: "linear-gradient(90deg, rgba(" + tone.rgb + ",0.18) 0%, rgba(0,0,0,0) 55%)", opacity: hover ? 1 : 0.7 }}
          />
        )}
        {/* equip flash on item change */}
        <div
          key={"flash-" + pulse}
          className="pointer-events-none absolute inset-0 animate-[ping_0.7s_ease-out_1] opacity-0"
          style={{ background: "linear-gradient(90deg, transparent, rgba(" + tone.rgb + ",0.35), transparent)" }}
        />

        {/* corner brackets */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-br"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={"rgba(" + tone.rgb + ",0.95)"} />
              <stop offset="100%" stopColor={"rgba(" + tone.rgb + ",0.35)"} />
            </linearGradient>
          </defs>
          <g stroke={"url(#" + uid + "-br)"} strokeWidth={hover ? 2.4 : 1.6} fill="none" vectorEffect="non-scaling-stroke" className="transition-all duration-200">
            <path d="M2 12 L2 2 L14 2" />
            <path d="M98 12 L98 2 L86 2" />
            <path d="M2 88 L2 98 L14 98" />
            <path d="M98 88 L98 98 L86 98" />
          </g>
        </svg>

        <div className="absolute inset-[7%] flex items-stretch gap-2">
          {/* icon cell */}
          <div className="relative h-full aspect-square">
            <div
              className={"absolute inset-0 rounded-sm border transition-all duration-200 " + (empty ? "border-cyan-400/20 bg-black/50" : tone.border + " bg-black/60")}
              style={{ boxShadow: empty ? "inset 0 0 8px rgba(0,0,0,0.8)" : "inset 0 0 10px rgba(" + tone.rgb + ",0.2)" }}
            />
            {empty ? (
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet">
                <g stroke="rgba(34,211,238,0.45)" strokeWidth="1.2" fill="none" className="animate-pulse">
                  <path d="M12 7 L12 17 M7 12 L17 12" />
                  <rect x="5" y="5" width="14" height="14" strokeDasharray="3 3" />
                </g>
              </svg>
            ) : (
              <div className="absolute inset-[14%]">
                <FitText className={"font-mono font-bold tracking-widest uppercase " + tone.text} wrap={false}>
                  {item.icon && item.icon.length ? item.icon : item.label.slice(0, 2)}
                </FitText>
              </div>
            )}
          </div>

          {/* text cell */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center">
            {empty ? (
              <div className="absolute inset-0 flex items-center">
                <div className="min-w-0 flex-1">
                  <FitText className="font-mono font-bold tracking-widest uppercase text-neutral-500" align="start">
                    {accepts && accepts.length ? accepts : "EMPTY"}
                  </FitText>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center">
                <div className="min-w-0 flex-1">
                  <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + tone.text} align="start">
                    {item.label}
                  </FitText>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* bottom energy line */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] transition-all duration-300 ease-out"
          style={{
            width: empty ? "18%" : hover ? "100%" : "62%",
            background: "linear-gradient(90deg, rgba(" + tone.rgb + ",0.9), rgba(" + tone.rgb + ",0))",
            boxShadow: "0 0 8px rgba(" + tone.rgb + ",0.7)"
          }}
        />
      </div>

      {!empty && onClear && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear(slotId); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 flex h-[30%] w-[30%] max-h-[1.15rem] max-w-[1.15rem] items-center justify-center border border-rose-400/50 bg-black/70 text-rose-500 transition-all duration-200 ease-out hover:bg-rose-600 hover:text-white hover:shadow-[0_0_12px_rgba(244,63,94,0.6)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
        >
          <svg viewBox="0 0 12 12" className="h-full w-full p-[2px]">
            <path d="M3 3 L9 9 M9 3 L3 9" stroke="currentColor" strokeWidth="1.6" fill="none" />
          </svg>
        </button>
      )}
    </div>
  );
}