type MapMarkerProps = {
  id: string;
  position: { x: number; y: number };
  kind: 'quest' | 'poi' | 'player' | 'waypoint' | 'district';
  label?: string;
  active?: boolean;
  heading?: number;
  onSelect?: (id: string) => void;
};

export const MapMarker_MIN = {"base":[2,2],"kind:district":[5,1.5]};

export function MapMarker(props: MapMarkerProps) {
  const { id, position, kind, label, active, heading, onSelect } = props;
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const floor = (MapMarker_MIN as any)["kind:" + kind] ?? MapMarker_MIN.base;
  const interactive = !!onSelect;

  const x = Math.max(0, Math.min(1, position?.x ?? 0)) * 100;
  const y = Math.max(0, Math.min(1, position?.y ?? 0)) * 100;

  const tone =
    kind === "quest" ? "#fde047" :
    kind === "player" ? "#22d3ee" :
    kind === "waypoint" ? "#e879f9" :
    kind === "district" ? "#67e8f9" : "#a5f3fc";

  const handleDown = (e: any) => {
    e.stopPropagation();
    if (!interactive) return;
    setPress(true);
  };
  const handleUp = (e: any) => {
    e.stopPropagation();
    if (!interactive) return;
    setPress(false);
    onSelect && onSelect(id);
  };

  const scale = (active ? 1.12 : 1) * (hover && interactive ? 1.1 : 1) * (press ? 0.92 : 1);

  const glyph = () => {
    if (kind === "district") return null;
    return (
      <svg viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={tone} stopOpacity="0.55" />
            <stop offset="70%" stopColor={tone} stopOpacity="0.08" />
            <stop offset="100%" stopColor={tone} stopOpacity="0" />
          </radialGradient>
          <filter id={uid + "-blur"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        <circle cx="24" cy="24" r="23" fill={"url(#" + uid + "-glow)"}>
          {active ? <animate attributeName="r" values="18;23;18" dur="2.2s" repeatCount="indefinite" /> : null}
        </circle>

        {active ? (
          <circle cx="24" cy="24" r="14" fill="none" stroke={tone} strokeWidth="1" opacity="0.6">
            <animate attributeName="r" values="12;22;12" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" />
          </circle>
        ) : null}

        {kind === "quest" ? (
          <g filter={active ? undefined : undefined}>
            <path d="M24 5 L31 17 L44 20 L35 30 L37 43 L24 37 L11 43 L13 30 L4 20 L17 17 Z"
              fill={active ? tone : "rgba(10,10,20,0.85)"} stroke={tone} strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="24" cy="25" r="3" fill={active ? "#0a0a14" : tone} />
          </g>
        ) : null}

        {kind === "poi" ? (
          <g>
            <path d="M24 6 L40 24 L24 42 L8 24 Z" fill="rgba(10,10,20,0.85)" stroke={tone} strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M24 15 L33 24 L24 33 L15 24 Z" fill={active ? tone : "rgba(165,243,252,0.35)"} />
          </g>
        ) : null}

        {kind === "waypoint" ? (
          <g>
            <circle cx="24" cy="24" r="15" fill="rgba(10,10,20,0.8)" stroke={tone} strokeWidth="2.2" strokeDasharray="5 4">
              <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="24" cy="24" r="5" fill={tone} filter={"url(#" + uid + "-blur)"} />
            <circle cx="24" cy="24" r="3.5" fill={tone} />
          </g>
        ) : null}

        {kind === "player" ? (
          <g transform={"rotate(" + (heading ?? 0) + " 24 24)"} style={{ transition: "transform 300ms ease-out" }}>
            <path d="M24 2 L34 20 L24 15 L14 20 Z" fill={tone} opacity="0.35" />
            <circle cx="24" cy="24" r="11" fill="rgba(10,10,20,0.9)" stroke={tone} strokeWidth="2" />
            <path d="M24 13 L31 30 L24 26 L17 30 Z" fill={tone} />
          </g>
        ) : null}
      </svg>
    );
  };

  const isDistrict = kind === "district";

  return (
    <div className="h-full w-full pointer-events-none relative" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div
        className="absolute"
        style={{ left: x + "%", top: y + "%", transform: "translate(-50%,-50%)" }}
      >
        <div
          onPointerDown={handleDown}
          onPointerUp={handleUp}
          onPointerCancel={() => setPress(false)}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => { setHover(false); setPress(false); }}
          className={"touch-none flex flex-col items-center transition-all duration-200 ease-out " + (interactive ? "cursor-pointer" : "")}
          style={{
            pointerEvents: interactive ? "auto" : "none",
            transform: "scale(" + scale + ")",
            filter: (active || (hover && interactive))
              ? "drop-shadow(0 0 10px " + tone + ")"
              : "drop-shadow(0 0 4px rgba(0,0,0,0.9))",
          }}
        >
          {isDistrict ? (
            <div
              className={"px-2 py-1 rounded-sm border transition-all duration-200 ease-out " +
                (active
                  ? "border-yellow-300/70 bg-yellow-300/15"
                  : "border-fuchsia-500/40 bg-[#0a0a14]/80")}
            >
              <div
                className={"font-mono font-semibold tracking-[0.2em] uppercase text-xs leading-none whitespace-nowrap " +
                  (active ? "text-yellow-300" : "text-cyan-300/80")}
              >
                {label ?? ""}
              </div>
            </div>
          ) : (
            <>
              <div style={{ width: "1.9rem", height: "1.9rem" }}>{glyph()}</div>
              {label ? (
                <div
                  className={"mt-0.5 max-w-[9rem] min-w-0 truncate font-mono tracking-wider uppercase text-[10px] leading-none transition-colors duration-200 " +
                    (active ? "text-yellow-300" : hover && interactive ? "text-cyan-100" : "text-slate-400")}
                >
                  {label}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}