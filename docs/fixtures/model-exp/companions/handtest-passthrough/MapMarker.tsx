type MapMarkerProps = {
  id: string;
  position: { x: number; y: number };
  kind?: string;
  state?: "default" | "selected" | "tracked" | "locked";
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
};

const MapMarkerPALETTE: Record<string, { core: string; glow: string; dim: string }> = {
  default: { core: "#67e8f9", glow: "rgba(34,211,238,0.75)", dim: "rgba(34,211,238,0.25)" },
  selected: { core: "#f0abfc", glow: "rgba(232,121,249,0.8)", dim: "rgba(232,121,249,0.3)" },
  tracked: { core: "#fcd34d", glow: "rgba(251,191,36,0.8)", dim: "rgba(251,191,36,0.3)" },
  locked: { core: "#737373", glow: "rgba(115,115,115,0.35)", dim: "rgba(115,115,115,0.18)" },
};

function MapMarkerGlyph(props: { kind?: string; color: string }) {
  const k = (props.kind || "").toLowerCase();
  const c = props.color;
  if (k.indexOf("travel") >= 0 || k.indexOf("fast") >= 0 || k.indexOf("metro") >= 0) {
    return (
      <g>
        <path d="M50 34 L62 50 L54 50 L54 66 L46 66 L46 50 L38 50 Z" fill={c} />
      </g>
    );
  }
  if (k.indexOf("quest") >= 0 || k.indexOf("main") >= 0 || k.indexOf("job") >= 0) {
    return <path d="M50 32 L58 50 L50 68 L42 50 Z" fill={c} />;
  }
  if (k.indexOf("shop") >= 0 || k.indexOf("vendor") >= 0 || k.indexOf("ripper") >= 0) {
    return (
      <g fill={c}>
        <rect x="40" y="44" width="20" height="18" />
        <rect x="46" y="36" width="8" height="6" />
      </g>
    );
  }
  if (k.indexOf("danger") >= 0 || k.indexOf("hostile") >= 0 || k.indexOf("gang") >= 0) {
    return (
      <g fill={c}>
        <path d="M50 32 L66 64 L34 64 Z" opacity="0.85" />
        <rect x="47.5" y="42" width="5" height="12" fill="#0a0a0a" />
        <rect x="47.5" y="56" width="5" height="4" fill="#0a0a0a" />
      </g>
    );
  }
  return (
    <g fill={c}>
      <circle cx="50" cy="50" r="8" />
    </g>
  );
}

export const MapMarker_MIN = {"base":[2,2]};

export function MapMarker(props: MapMarkerProps) {
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const state = props.state || "default";
  const locked = state === "locked";
  const pal = MapMarkerPALETTE[state] || MapMarkerPALETTE.default;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const floor = MapMarker_MIN.base;

  const x = Math.max(0, Math.min(1, props.position.x)) * 100;
  const y = Math.max(0, Math.min(1, props.position.y)) * 100;

  const active = state === "selected" || state === "tracked";
  const scale = locked ? 1 : press ? 0.9 : hover || active ? 1.15 : 1;

  return (
    <div
      className="h-full w-full relative pointer-events-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        className="absolute"
        style={{
          left: x + "%",
          top: y + "%",
          width: "2.2rem",
          height: "2.2rem",
          transform: "translate(-50%,-50%) scale(" + scale + ")",
          transition: "transform 200ms ease-out, filter 200ms ease-out",
          filter: locked
            ? "grayscale(1)"
            : "drop-shadow(0 0 " + (active || hover ? "9px" : "4px") + " " + pal.glow + ")",
          opacity: locked ? 0.45 : 1,
          cursor: locked ? "default" : "pointer",
          touchAction: "none",
          pointerEvents: "auto",
        }}
        onPointerEnter={() => {
          setHover(true);
          if (props.onHover) props.onHover(props.id);
        }}
        onPointerLeave={() => {
          setHover(false);
          setPress(false);
          if (props.onHover) props.onHover(null);
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (locked) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setPress(true);
        }}
        onPointerUp={() => {
          if (locked) return;
          setPress(false);
          props.onSelect(props.id);
        }}
        onPointerCancel={() => setPress(false)}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <radialGradient id={uid + "-halo"} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={pal.core} stopOpacity="0.35" />
              <stop offset="70%" stopColor={pal.core} stopOpacity="0.08" />
              <stop offset="100%" stopColor={pal.core} stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="46" fill={"url(#" + uid + "-halo)"} />

          {state === "tracked" && !locked ? (
            <g>
              <circle cx="50" cy="50" r="40" fill="none" stroke={pal.core} strokeWidth="2" opacity="0.5">
                <animate attributeName="r" values="26;48" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.55;0" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : null}

          {/* rotating outer bracket */}
          <g
            style={{
              transformOrigin: "50px 50px",
              animation: active && !locked ? "spin 6s linear infinite" : undefined,
            }}
          >
            <path
              d="M22 34 L22 22 L34 22 M66 22 L78 22 L78 34 M78 66 L78 78 L66 78 M34 78 L22 78 L22 66"
              fill="none"
              stroke={pal.core}
              strokeWidth={active || hover ? 4 : 3}
              strokeLinecap="square"
              opacity={active || hover ? 0.95 : 0.6}
              style={{ transition: "all 200ms ease-out" }}
            />
          </g>

          {/* hex plate */}
          <path
            d="M50 16 L79 33 L79 67 L50 84 L21 67 L21 33 Z"
            fill="rgba(0,0,0,0.72)"
            stroke={pal.core}
            strokeWidth="2.5"
            strokeOpacity={active || hover ? 0.9 : 0.5}
            style={{ transition: "all 200ms ease-out" }}
          />
          <path
            d="M50 24 L72 37 L72 63 L50 76 L28 63 L28 37 Z"
            fill="none"
            stroke={pal.dim}
            strokeWidth="1.5"
          />

          <MapMarkerGlyph kind={props.kind} color={pal.core} />

          {locked ? (
            <path
              d="M30 30 L70 70 M70 30 L30 70"
              stroke="#a3a3a3"
              strokeWidth="3"
              opacity="0.55"
              strokeLinecap="square"
            />
          ) : null}

          {state === "selected" ? (
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={pal.core}
              strokeWidth="2"
              strokeDasharray="6 8"
              opacity="0.8"
              style={{ transformOrigin: "50px 50px", animation: "spin 4s linear infinite reverse" }}
            />
          ) : null}
        </svg>
      </div>
    </div>
  );
}