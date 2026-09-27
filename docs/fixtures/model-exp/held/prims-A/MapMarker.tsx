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
  const { id, position, kind, state, onSelect, onHover } = props;
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const st = state || "default";
  const locked = st === "locked";

  const k = (kind || "default").toLowerCase();
  const TONES: any = {
    quest: { c: "#fcd34d", g: "rgba(252,211,77,0.75)" },
    gig: { c: "#e879f9", g: "rgba(232,121,249,0.75)" },
    fasttravel: { c: "#22d3ee", g: "rgba(34,211,238,0.75)" },
    fast_travel: { c: "#22d3ee", g: "rgba(34,211,238,0.75)" },
    travel: { c: "#22d3ee", g: "rgba(34,211,238,0.75)" },
    vendor: { c: "#34d399", g: "rgba(52,211,153,0.75)" },
    danger: { c: "#f43f5e", g: "rgba(244,63,94,0.75)" },
    default: { c: "#67e8f9", g: "rgba(103,232,249,0.7)" }
  };
  const tone = TONES[k] || TONES.default;
  const color = locked ? "#737373" : st === "selected" ? "#a5f3fc" : tone.c;
  const glow = locked ? "rgba(115,115,115,0.4)" : tone.g;

  const interactive = !locked;
  const scale = press ? 0.9 : hover && interactive ? 1.18 : st === "selected" ? 1.12 : 1;

  const Glyph = () => {
    if (k === "quest") {
      return <path d="M50 22 L64 50 L50 78 L36 50 Z" fill={color} opacity={0.95} />;
    }
    if (k === "gig") {
      return <path d="M52 24 L34 54 L48 54 L44 78 L66 46 L52 46 Z" fill={color} opacity={0.95} />;
    }
    if (k === "fasttravel" || k === "fast_travel" || k === "travel") {
      return (
        <g fill="none" stroke={color} strokeWidth={7} strokeLinecap="square">
          <path d="M50 24 L50 76 M30 44 L50 24 L70 44" />
        </g>
      );
    }
    if (k === "vendor") {
      return <rect x={34} y={34} width={32} height={32} fill={color} opacity={0.9} />;
    }
    if (k === "danger") {
      return <path d="M50 26 L74 72 L26 72 Z" fill="none" stroke={color} strokeWidth={8} strokeLinejoin="miter" />;
    }
    return <circle cx={50} cy={50} r={13} fill={color} />;
  };

  const floor = MapMarker_MIN.base;

  return (
    <div
      className="h-full w-full pointer-events-none relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        className="absolute"
        style={{
          left: Math.max(0, Math.min(1, position.x)) * 100 + "%",
          top: Math.max(0, Math.min(1, position.y)) * 100 + "%",
          width: "2.6rem",
          height: "2.6rem",
          transform: "translate(-50%,-50%) scale(" + scale + ")",
          transition: "transform 200ms cubic-bezier(.2,.8,.3,1)",
          pointerEvents: "auto",
          cursor: interactive ? "pointer" : "default",
          opacity: locked ? 0.4 : 1,
          filter: locked ? "grayscale(1)" : "none"
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (!interactive) return;
          (e.currentTarget as any).setPointerCapture?.(e.pointerId);
          setPress(true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (!interactive) return;
          setPress(false);
          onSelect(id);
        }}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => { setHover(true); if (onHover) onHover(id); }}
        onPointerLeave={() => { setHover(false); setPress(false); if (onHover) onHover(null); }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-halo"} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="70%" stopColor={color} stopOpacity={0.08} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
            <filter id={uid + "-glow"} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation={3.2} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={50} cy={50} r={46} fill={"url(#" + uid + "-halo)"} />

          {(st === "tracked" || st === "selected") && !locked ? (
            <g>
              <circle cx={50} cy={50} r={34} fill="none" stroke={color} strokeWidth={2} opacity={0.5}>
                <animate attributeName="r" values="26;46" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.55;0" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : null}

          <g filter={"url(#" + uid + "-glow)"}>
            {/* bracket frame */}
            <g stroke={color} strokeWidth={3.5} fill="none" opacity={hover || st === "selected" ? 0.95 : 0.55}>
              <path d="M18 32 L18 18 L32 18" />
              <path d="M68 18 L82 18 L82 32" />
              <path d="M82 68 L82 82 L68 82" />
              <path d="M32 82 L18 82 L18 68" />
            </g>

            {st === "selected" && !locked ? (
              <rect x={22} y={22} width={56} height={56} fill={color} opacity={0.12} />
            ) : null}

            {st === "tracked" && !locked ? (
              <g stroke={color} strokeWidth={2} opacity={0.7}>
                <path d="M50 6 L50 16 M50 84 L50 94 M6 50 L16 50 M84 50 L94 50" />
                <circle cx={50} cy={50} r={40} fill="none" strokeDasharray="4 9" opacity={0.55}>
                  <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="9s" repeatCount="indefinite" />
                </circle>
              </g>
            ) : null}

            <Glyph />

            {locked ? (
              <g stroke="#a3a3a3" strokeWidth={5} opacity={0.8}>
                <path d="M32 32 L68 68" />
              </g>
            ) : null}
          </g>

          <circle
            cx={50}
            cy={50}
            r={44}
            fill="transparent"
            stroke={glow}
            strokeWidth={hover && interactive ? 1.6 : 0}
            opacity={0.6}
            style={{ transition: "stroke-width 200ms ease-out" }}
          />
        </svg>
      </div>
    </div>
  );
}