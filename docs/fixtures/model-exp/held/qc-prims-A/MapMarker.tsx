type MapMarkerProps = {
  id: string;
  position: { x: number; y: number };
  kind?: string;
  state?: "default" | "selected" | "tracked" | "locked";
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
};

export const MapMarker_MIN = {"base":[2,2]};

export function MapMarker(props: MapMarkerProps) {
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hot, setHot] = useState(false);
  const [press, setPress] = useState(false);

  const state = props.state || "default";
  const locked = state === "locked";
  const kind = (props.kind || "default").toLowerCase();

  const palette =
    kind.indexOf("quest") >= 0 || kind.indexOf("job") >= 0 || kind.indexOf("gig") >= 0
      ? { main: "#fcd34d", soft: "#fde68a", glow: "251,191,36" }
      : kind.indexOf("travel") >= 0 || kind.indexOf("fast") >= 0
      ? { main: "#67e8f9", soft: "#cffafe", glow: "34,211,238" }
      : kind.indexOf("vendor") >= 0 || kind.indexOf("shop") >= 0
      ? { main: "#e879f9", soft: "#f5d0fe", glow: "232,121,249" }
      : kind.indexOf("danger") >= 0 || kind.indexOf("hostile") >= 0
      ? { main: "#fb7185", soft: "#fecdd3", glow: "244,63,94" }
      : { main: "#67e8f9", soft: "#cffafe", glow: "34,211,238" };

  const col = locked ? "#8a8f98" : palette.main;
  const soft = locked ? "#b6bbc2" : palette.soft;
  const glow = locked ? "140,145,155" : palette.glow;

  const active = state === "selected" || state === "tracked";
  const scale = locked ? 0.9 : press ? 0.88 : state === "selected" ? 1.22 : hot ? 1.12 : state === "tracked" ? 1.06 : 1;

  const floor = MapMarker_MIN.base;
  const sizeRem = state === "selected" ? 2.6 : 2.2;

  const core = (() => {
    if (kind.indexOf("quest") >= 0 || kind.indexOf("job") >= 0 || kind.indexOf("gig") >= 0) {
      return (
        <g>
          <path d="M50 30 L68 50 L50 70 L32 50 Z" fill={"url(#" + uid + "-g)"} stroke={soft} strokeWidth="3" />
          <path d="M50 40 L59 50 L50 60 L41 50 Z" fill="#050505" opacity="0.75" />
        </g>
      );
    }
    if (kind.indexOf("travel") >= 0 || kind.indexOf("fast") >= 0) {
      return (
        <g>
          <circle cx="50" cy="50" r="17" fill={"url(#" + uid + "-g)"} stroke={soft} strokeWidth="3" />
          <path d="M46 40 L58 50 L46 60 Z" fill="#050505" opacity="0.8" />
          <path d="M39 42 L39 58" stroke="#050505" strokeWidth="4" opacity="0.8" strokeLinecap="round" />
        </g>
      );
    }
    if (kind.indexOf("danger") >= 0 || kind.indexOf("hostile") >= 0) {
      return (
        <g>
          <path d="M50 31 L69 66 L31 66 Z" fill={"url(#" + uid + "-g)"} stroke={soft} strokeWidth="3" strokeLinejoin="round" />
          <rect x="47" y="44" width="6" height="12" fill="#050505" opacity="0.8" />
          <rect x="47" y="58" width="6" height="5" fill="#050505" opacity="0.8" />
        </g>
      );
    }
    return (
      <g>
        <rect x="36" y="36" width="28" height="28" fill={"url(#" + uid + "-g)"} stroke={soft} strokeWidth="3" />
        <circle cx="50" cy="50" r="5" fill="#050505" opacity="0.8" />
      </g>
    );
  })();

  return (
    <div className="h-full w-full pointer-events-none relative" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div
        className="absolute"
        style={{
          left: Math.max(0, Math.min(1, props.position.x)) * 100 + "%",
          top: Math.max(0, Math.min(1, props.position.y)) * 100 + "%",
          width: sizeRem + "rem",
          height: sizeRem + "rem",
          transform: "translate(-50%,-50%) scale(" + scale + ")",
          transition: "transform 200ms cubic-bezier(0.22,1,0.36,1), width 200ms ease-out, height 200ms ease-out",
          opacity: locked ? 0.45 : 1,
          filter: locked ? "grayscale(1)" : "none",
          pointerEvents: "auto",
          cursor: locked ? "not-allowed" : "pointer",
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (!locked) setPress(true);
        }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => {
          setHot(true);
          if (props.onHover) props.onHover(props.id);
        }}
        onPointerLeave={() => {
          setHot(false);
          setPress(false);
          if (props.onHover) props.onHover(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!locked) props.onSelect(props.id);
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-g"} cx="35%" cy="30%">
              <stop offset="0%" stopColor={soft} />
              <stop offset="100%" stopColor={col} />
            </radialGradient>
            <radialGradient id={uid + "-halo"}>
              <stop offset="0%" stopColor={col} stopOpacity="0.45" />
              <stop offset="70%" stopColor={col} stopOpacity="0.08" />
              <stop offset="100%" stopColor={col} stopOpacity="0" />
            </radialGradient>
          </defs>

          {!locked && (
            <circle cx="50" cy="50" r="46" fill={"url(#" + uid + "-halo)"}>
              {state === "tracked" && <animate attributeName="r" values="34;48;34" dur="2s" repeatCount="indefinite" />}
            </circle>
          )}

          {state === "tracked" && !locked && (
            <circle cx="50" cy="50" r="26" fill="none" stroke={col} strokeWidth="2" opacity="0.7">
              <animate attributeName="r" values="22;44;22" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          <g opacity={active || hot ? 0.95 : 0.5}>
            <g
              style={{
                transformOrigin: "50px 50px",
                animation: locked ? "none" : (active ? "spin 6s linear infinite" : hot ? "spin 3s linear infinite" : "none"),
              }}
            >
              <circle
                cx="50"
                cy="50"
                r="32"
                fill="none"
                stroke={col}
                strokeWidth="2.5"
                strokeDasharray="14 12"
                strokeLinecap="butt"
              />
            </g>
            <path d="M50 12 L50 22 M50 78 L50 88 M12 50 L22 50 M78 50 L88 50" stroke={soft} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          </g>

          {state === "selected" && !locked && (
            <g stroke={col} strokeWidth="3" fill="none" strokeLinecap="square">
              <path d="M18 30 L18 18 L30 18" />
              <path d="M70 18 L82 18 L82 30" />
              <path d="M82 70 L82 82 L70 82" />
              <path d="M30 82 L18 82 L18 70" />
            </g>
          )}

          <g
            style={{
              filter: locked ? "none" : "drop-shadow(0 0 " + (active || hot ? 6 : 3) + "px rgba(" + glow + ",0.85))",
              transition: "filter 200ms ease-out",
            }}
          >
            {core}
          </g>

          {locked && (
            <g stroke="#c9ced6" strokeWidth="3" strokeLinecap="round" opacity="0.9">
              <path d="M30 30 L70 70" />
            </g>
          )}
        </svg>
        <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
      </div>
    </div>
  );
}