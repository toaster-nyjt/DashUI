type MapMarkerProps = {
  id: string;
  position: { x: number; y: number };
  kind: 'quest' | 'poi' | 'player' | 'waypoint' | 'district';
  label?: string;
  active?: boolean;
  heading?: number;
  onSelect?: (id: string) => void;
};

export const MapMarker_MIN = {"base":[2.5,2.5],"kind:district":[5.5,1.75]};

export function MapMarker(props: MapMarkerProps) {
  const { id, position, kind, label, active, heading, onSelect } = props;
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const floor = (MapMarker_MIN as any)["kind:" + kind] ?? MapMarker_MIN.base;
  const isDistrict = kind === "district";
  const interactive = !!onSelect;

  const tone =
    kind === "quest" ? { main: "#fde047", glow: "rgba(253,224,71,0.75)" } :
    kind === "poi" ? { main: "#e879f9", glow: "rgba(217,70,239,0.7)" } :
    kind === "player" ? { main: "#22d3ee", glow: "rgba(34,211,238,0.75)" } :
    kind === "waypoint" ? { main: "#22d3ee", glow: "rgba(34,211,238,0.7)" } :
    { main: "#67e8f9", glow: "rgba(34,211,238,0.45)" };

  const lit = !!active || hover;
  const size = isDistrict ? { w: floor[0], h: floor[1] } : { w: 2.5, h: 2.5 };

  const handleDown = (e: any) => {
    e.stopPropagation();
    if (!interactive) return;
    setPress(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const handleUp = (e: any) => {
    e.stopPropagation();
    if (!interactive) return;
    setPress(false);
    if (onSelect) onSelect(id);
  };

  const glyph = () => {
    if (kind === "player") {
      return (
        <g>
          <circle cx="50" cy="50" r="34" fill="none" stroke={tone.main} strokeOpacity="0.3" strokeWidth="2">
            <animate attributeName="r" values="26;44;26" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="22" fill="#07070c" stroke={tone.main} strokeOpacity="0.45" strokeWidth="2" />
          <g transform={"rotate(" + (heading ?? 0) + " 50 50)"} style={{ transition: "transform 400ms cubic-bezier(0.22,1,0.36,1)" }}>
            <path d="M50 8 L62 34 L50 28 L38 34 Z" fill={tone.main} opacity="0.85" />
            <path d="M50 20 L60 46 L50 40 L40 46 Z" fill="#fde047" />
          </g>
          <circle cx="50" cy="50" r="7" fill="#fde047" />
          <circle cx="50" cy="50" r="12" fill="none" stroke="#fde047" strokeOpacity="0.6" strokeWidth="2" />
        </g>
      );
    }
    if (kind === "quest") {
      return (
        <g>
          <g style={{ transformOrigin: "50px 50px", animation: "none" }}>
            <path d="M50 10 L84 50 L50 90 L16 50 Z" fill="#07070c" stroke={tone.main} strokeWidth="5" strokeLinejoin="round" />
            <path d="M50 22 L74 50 L50 78 L26 50 Z" fill={tone.main} fillOpacity={lit ? "0.9" : "0.55"} style={{ transition: "fill-opacity 200ms ease-out" }} />
            <rect x="46" y="34" width="8" height="22" rx="2" fill="#0a0a0f" />
            <rect x="46" y="60" width="8" height="8" rx="2" fill="#0a0a0f" />
          </g>
          {lit ? (
            <path d="M50 4 L90 50 L50 96 L10 50 Z" fill="none" stroke={tone.main} strokeOpacity="0.5" strokeWidth="2">
              <animate attributeName="stroke-opacity" values="0.6;0.05;0.6" dur="1.4s" repeatCount="indefinite" />
            </path>
          ) : null}
        </g>
      );
    }
    if (kind === "poi") {
      return (
        <g>
          <path d="M50 16 L79 33 L79 67 L50 84 L21 67 L21 33 Z" fill="#07070c" stroke={tone.main} strokeWidth="5" strokeLinejoin="round" />
          <path d="M50 30 L67 40 L67 60 L50 70 L33 60 L33 40 Z" fill={tone.main} fillOpacity={lit ? "0.85" : "0.35"} style={{ transition: "fill-opacity 200ms ease-out" }} />
          <circle cx="50" cy="50" r="6" fill="#0a0a0f" />
        </g>
      );
    }
    if (kind === "waypoint") {
      return (
        <g>
          <circle cx="50" cy="50" r="38" fill="none" stroke={tone.main} strokeOpacity="0.55" strokeWidth="4" strokeDasharray="10 9" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" />
          </circle>
          <path d="M50 22 L70 74 L50 62 L30 74 Z" fill={tone.main} fillOpacity={lit ? "1" : "0.75"} stroke="#07070c" strokeWidth="3" strokeLinejoin="round" style={{ transition: "fill-opacity 200ms ease-out" }} />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full pointer-events-none relative" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div
        className="absolute"
        style={{
          left: (position?.x ?? 0) * 100 + "%",
          top: (position?.y ?? 0) * 100 + "%",
          width: size.w + "rem",
          height: size.h + "rem",
          transform: "translate(-50%,-50%) scale(" + (press ? 0.92 : lit && interactive ? 1.1 : 1) + ")",
          transition: "transform 200ms ease-out",
        }}
      >
        <div
          className="relative h-full w-full"
          style={{ pointerEvents: interactive ? "auto" : "none", cursor: interactive ? "pointer" : "default" }}
          onPointerDown={handleDown}
          onPointerUp={handleUp}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => { setHover(false); setPress(false); }}
        >
          {isDistrict ? (
            <div
              className={
                "absolute inset-0 flex items-center justify-center rounded-sm border transition-all duration-200 ease-out " +
                (lit
                  ? "border-cyan-400/60 bg-cyan-500/20 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
                  : "border-cyan-500/20 bg-black/45")
              }
            >
              <div className="absolute left-0 top-0 h-full w-[2px] bg-fuchsia-500/70" />
              <div className="absolute inset-[14%] left-[10%]">
                <FitText
                  wrap={false}
                  className={
                    "font-mono font-bold tracking-[0.25em] uppercase transition-colors duration-200 " +
                    (lit ? "text-cyan-50 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" : "text-cyan-300/80")
                  }
                >
                  {label ?? ""}
                </FitText>
              </div>
            </div>
          ) : (
            <>
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
                <defs>
                  <filter id={uid + "-glow"} x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation={lit ? 4 : 2} result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <g filter={"url(#" + uid + "-glow)"} style={{ color: tone.main }}>
                  {glyph()}
                </g>
                {active ? (
                  <circle cx="50" cy="50" r="46" fill="none" stroke={tone.main} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 6">
                    <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="9s" repeatCount="indefinite" />
                  </circle>
                ) : null}
              </svg>
              {label && (lit || active) ? (
                <div
                  className="absolute left-1/2 top-full whitespace-nowrap rounded-sm border border-fuchsia-500/40 bg-black/85 px-2 py-1 font-mono text-[10px] leading-none tracking-wider uppercase text-cyan-100 shadow-[0_0_10px_rgba(217,70,239,0.35)]"
                  style={{ transform: "translate(-50%, 0.25rem)" }}
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