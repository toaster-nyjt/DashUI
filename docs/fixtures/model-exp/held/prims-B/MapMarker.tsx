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
  const k = (kind || "default").toLowerCase();

  const palette = (function () {
    if (k.indexOf("quest") >= 0 || k.indexOf("mission") >= 0 || k.indexOf("job") >= 0)
      return { main: "#fcd34d", soft: "rgba(252,211,77,0.55)", shape: "quest" };
    if (k.indexOf("travel") >= 0 || k.indexOf("fast") >= 0 || k.indexOf("station") >= 0)
      return { main: "#22d3ee", soft: "rgba(34,211,238,0.55)", shape: "travel" };
    if (k.indexOf("danger") >= 0 || k.indexOf("hostile") >= 0 || k.indexOf("combat") >= 0)
      return { main: "#fb7185", soft: "rgba(251,113,133,0.55)", shape: "hex" };
    if (k.indexOf("vendor") >= 0 || k.indexOf("shop") >= 0 || k.indexOf("ripper") >= 0)
      return { main: "#e879f9", soft: "rgba(232,121,249,0.55)", shape: "hex" };
    return { main: "#67e8f9", soft: "rgba(103,232,249,0.5)", shape: "hex" };
  })();

  const locked = st === "locked";
  const selected = st === "selected";
  const tracked = st === "tracked";
  const active = (selected || tracked || (hover && !locked));

  const scale = locked ? 0.92 : press ? 0.86 : hover ? 1.18 : selected ? 1.12 : tracked ? 1.06 : 1;
  const col = locked ? "#8b8b8b" : palette.main;
  const soft = locked ? "rgba(140,140,140,0.35)" : palette.soft;

  const cx = 50, cy = 50;

  const core = (function () {
    if (palette.shape === "quest") {
      return (
        <g>
          <path d="M50 22 L70 50 L50 78 L30 50 Z" fill={"url(#" + uid + "-grad)"} stroke={col} strokeWidth="3" strokeLinejoin="miter" />
          <path d="M50 34 L50 56" stroke="#0a0a0a" strokeWidth="6" strokeLinecap="butt" />
          <circle cx="50" cy="65" r="3.4" fill="#0a0a0a" />
        </g>
      );
    }
    if (palette.shape === "travel") {
      return (
        <g>
          <circle cx="50" cy="50" r="22" fill={"url(#" + uid + "-grad)"} stroke={col} strokeWidth="3" />
          <path d="M44 34 L60 50 L44 66" fill="none" stroke="#0a0a0a" strokeWidth="6" strokeLinejoin="miter" strokeLinecap="butt" />
          <path d="M34 34 L44 44" fill="none" stroke="#0a0a0a" strokeWidth="4" opacity="0.7" />
          <path d="M34 66 L44 56" fill="none" stroke="#0a0a0a" strokeWidth="4" opacity="0.7" />
        </g>
      );
    }
    return (
      <g>
        <path d="M50 26 L71 38 L71 62 L50 74 L29 62 L29 38 Z" fill={"url(#" + uid + "-grad)"} stroke={col} strokeWidth="3" strokeLinejoin="miter" />
        <path d="M50 38 L61 44 L61 56 L50 62 L39 56 L39 44 Z" fill="#0a0a0a" opacity="0.85" />
        <circle cx="50" cy="50" r="4" fill={col} />
      </g>
    );
  })();

  return (
    <div className="h-full w-full pointer-events-none relative" style={{ minWidth: MapMarker_MIN.base[0] + "rem", minHeight: MapMarker_MIN.base[1] + "rem" }}>
      <div
        className="absolute"
        style={{
          left: (Math.max(0, Math.min(1, position.x)) * 100) + "%",
          top: (Math.max(0, Math.min(1, position.y)) * 100) + "%",
          width: "2.6rem",
          height: "2.6rem",
          marginLeft: "-1.3rem",
          marginTop: "-1.3rem",
          pointerEvents: "auto",
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.45 : 1,
          filter: locked ? "grayscale(1)" : "none",
          transform: "scale(" + scale + ")",
          transition: "transform 200ms ease-out, opacity 200ms ease-out, filter 200ms ease-out",
          touchAction: "none",
          zIndex: active ? 3 : 1,
        }}
        onPointerDown={(e) => { e.stopPropagation(); if (!locked) setPress(true); }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => { setHover(true); if (onHover) onHover(id); }}
        onPointerLeave={() => { setHover(false); setPress(false); if (onHover) onHover(null); }}
        onClick={(e) => { e.stopPropagation(); if (!locked) onSelect(id); }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-grad"} cx="50%" cy="30%" r="75%">
              <stop offset="0%" stopColor={col} stopOpacity="0.95" />
              <stop offset="55%" stopColor={col} stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0.9" />
            </radialGradient>
            <filter id={uid + "-glow"} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation={active ? 4 : 2} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {!locked && (
            <circle cx={cx} cy={cy} r="34" fill="none" stroke={soft} strokeWidth="2" opacity={tracked ? 0.9 : 0.35}>
              {tracked && <animate attributeName="r" values="26;46;26" dur="2.2s" repeatCount="indefinite" />}
              {tracked && <animate attributeName="opacity" values="0.8;0;0.8" dur="2.2s" repeatCount="indefinite" />}
            </circle>
          )}

          <circle cx={cx} cy={cy} r="30" fill="#000" opacity={active ? 0.45 : 0.25} />

          {(selected || tracked) && (
            <g stroke={col} strokeWidth="3" fill="none" opacity="0.95">
              <path d="M22 34 L22 22 L34 22" />
              <path d="M66 22 L78 22 L78 34" />
              <path d="M78 66 L78 78 L66 78" />
              <path d="M34 78 L22 78 L22 66" />
              {selected && <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="9s" repeatCount="indefinite" />}
            </g>
          )}

          <g filter={"url(#" + uid + "-glow)"}>{core}</g>

          {hover && !locked && (
            <circle cx={cx} cy={cy} r="40" fill="none" stroke={col} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.7">
              <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="5s" repeatCount="indefinite" />
            </circle>
          )}

          {locked && (
            <g stroke="#a3a3a3" strokeWidth="3" opacity="0.85">
              <path d="M30 30 L70 70" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}