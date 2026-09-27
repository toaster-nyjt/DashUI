type MapMarkerProps = { id: string; position: { x: number; y: number }; kind?: string; state?: 'default' | 'selected' | 'tracked' | 'locked'; onSelect: (id: string) => void; onHover?: (id: string | null) => void };

export const MapMarker_MIN = {"base":[2,2]};

export function MapMarker(props: MapMarkerProps) {
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hot, setHot] = useState(false);
  const [press, setPress] = useState(false);
  const state = props.state || "default";
  const locked = state === "locked";
  const kind = (props.kind || "").toLowerCase();

  const palette =
    state === "selected"
      ? { main: "#67e8f9", glow: "rgba(34,211,238,0.75)", ring: "rgba(34,211,238,0.55)" }
      : state === "tracked"
      ? { main: "#fcd34d", glow: "rgba(251,191,36,0.7)", ring: "rgba(251,191,36,0.5)" }
      : locked
      ? { main: "#737373", glow: "rgba(115,115,115,0.25)", ring: "rgba(115,115,115,0.35)" }
      : { main: "#e879f9", glow: "rgba(232,121,249,0.55)", ring: "rgba(232,121,249,0.4)" };

  const glyph = (() => {
    if (kind.indexOf("travel") >= 0 || kind.indexOf("fast") >= 0) {
      // fast travel: chevron burst
      return (
        <g>
          <path d="M50 30 L64 50 L50 70 L36 50 Z" fill={palette.main} opacity="0.9" />
          <path d="M50 38 L58 50 L50 62 L42 50 Z" fill="#0a0a0a" />
          <path d="M28 50 H16 M84 50 H72" stroke={palette.main} strokeWidth="5" strokeLinecap="square" />
        </g>
      );
    }
    if (kind.indexOf("quest") >= 0 || kind.indexOf("main") >= 0 || kind.indexOf("job") >= 0) {
      return (
        <g>
          <path d="M50 26 L58 44 L50 50 L42 44 Z" fill={palette.main} />
          <path d="M50 74 L42 56 L50 50 L58 56 Z" fill={palette.main} opacity="0.7" />
        </g>
      );
    }
    if (kind.indexOf("shop") >= 0 || kind.indexOf("vendor") >= 0 || kind.indexOf("ripper") >= 0) {
      return (
        <g>
          <rect x="36" y="36" width="28" height="28" fill={palette.main} opacity="0.85" />
          <rect x="44" y="44" width="12" height="12" fill="#0a0a0a" />
        </g>
      );
    }
    if (kind.indexOf("danger") >= 0 || kind.indexOf("hostile") >= 0 || kind.indexOf("gang") >= 0) {
      return (
        <g>
          <path d="M50 30 L68 66 H32 Z" fill={palette.main} opacity="0.9" />
          <rect x="47" y="42" width="6" height="14" fill="#0a0a0a" />
          <rect x="47" y="59" width="6" height="5" fill="#0a0a0a" />
        </g>
      );
    }
    return (
      <g>
        <circle cx="50" cy="50" r="13" fill={palette.main} opacity="0.9" />
        <circle cx="50" cy="50" r="5" fill="#0a0a0a" />
      </g>
    );
  })();

  const scale = press ? 0.9 : hot && !locked ? 1.18 : state === "selected" ? 1.1 : 1;

  return (
    <div className="h-full w-full pointer-events-none relative" style={{ minWidth: MapMarker_MIN.base[0] + "rem", minHeight: MapMarker_MIN.base[1] + "rem" }}>
      <div
        className="absolute"
        style={{
          left: (props.position.x * 100) + "%",
          top: (props.position.y * 100) + "%",
          width: "2rem",
          height: "2rem",
          transform: "translate(-50%, -50%) scale(" + scale + ")",
          transition: "transform 200ms ease-out",
          pointerEvents: "auto",
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.45 : 1,
          filter: locked ? "grayscale(1)" : "none",
        }}
        onPointerDown={(e) => { e.stopPropagation(); setPress(true); }}
        onPointerUp={() => { setPress(false); if (!locked) props.onSelect(props.id); }}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => { setHot(true); if (props.onHover) props.onHover(props.id); }}
        onPointerLeave={() => { setHot(false); setPress(false); if (props.onHover) props.onHover(null); }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-halo"}>
              <stop offset="0%" stopColor={palette.main} stopOpacity="0.45" />
              <stop offset="70%" stopColor={palette.main} stopOpacity="0.08" />
              <stop offset="100%" stopColor={palette.main} stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="46" fill={"url(#" + uid + "-halo)"} />

          {(state === "tracked" || state === "selected") && !locked ? (
            <circle cx="50" cy="50" r="40" fill="none" stroke={palette.ring} strokeWidth="2">
              <animate attributeName="r" values="26;46" dur="1.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
            </circle>
          ) : null}

          <g style={{ transformOrigin: "50px 50px", filter: "drop-shadow(0 0 5px " + palette.glow + ")" }}>
            <polygon
              points="50,8 88,50 50,92 12,50"
              fill="rgba(10,10,10,0.82)"
              stroke={palette.main}
              strokeOpacity={state === "default" ? 0.55 : 0.95}
              strokeWidth="3"
            />
            <polygon
              points="50,18 78,50 50,82 22,50"
              fill="none"
              stroke={palette.main}
              strokeOpacity="0.25"
              strokeWidth="1"
            />
            {glyph}
          </g>

          {!locked ? (
            <g stroke={palette.main} strokeWidth="2.5" strokeLinecap="square" opacity={hot || state !== "default" ? 0.95 : 0.4}>
              <path d="M50 2 V-4" />
              <path d="M50 98 V104" />
              <path d="M6 50 H0" />
              <path d="M94 50 H100" />
              <g style={{ transformOrigin: "50px 50px", animation: hot ? "none" : "none" }} />
            </g>
          ) : null}

          {locked ? (
            <g stroke="#a3a3a3" strokeWidth="3" strokeLinecap="square">
              <path d="M30 30 L70 70" opacity="0.5" />
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}