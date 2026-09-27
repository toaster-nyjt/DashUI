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
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const state = props.state || "default";
  const kind = (props.kind || "default").toLowerCase();

  const palette = (function () {
    if (state === "locked") return { main: "#737373", glow: "rgba(115,115,115,0.35)" };
    if (kind.indexOf("quest") >= 0 || kind.indexOf("gig") >= 0 || kind.indexOf("job") >= 0)
      return { main: "#fcd34d", glow: "rgba(252,211,77,0.65)" };
    if (kind.indexOf("danger") >= 0 || kind.indexOf("hostile") >= 0 || kind.indexOf("combat") >= 0)
      return { main: "#f43f5e", glow: "rgba(244,63,94,0.65)" };
    if (kind.indexOf("vendor") >= 0 || kind.indexOf("shop") >= 0 || kind.indexOf("ripper") >= 0)
      return { main: "#e879f9", glow: "rgba(232,121,249,0.65)" };
    if (kind.indexOf("travel") >= 0 || kind.indexOf("fast") >= 0)
      return { main: "#22d3ee", glow: "rgba(34,211,238,0.65)" };
    return { main: "#67e8f9", glow: "rgba(34,211,238,0.6)" };
  })();

  const cx = Math.min(1, Math.max(0, props.position.x)) * 100;
  const cy = Math.min(1, Math.max(0, props.position.y)) * 100;
  const interactive = state !== "locked";

  const glyph = (function () {
    if (kind.indexOf("travel") >= 0 || kind.indexOf("fast") >= 0) {
      return (
        <g>
          <path d="M50 26 L74 50 L50 74 L26 50 Z" fill="none" stroke={palette.main} strokeWidth="5" />
          <path d="M50 38 L62 50 L50 62 L38 50 Z" fill={palette.main} />
        </g>
      );
    }
    if (kind.indexOf("quest") >= 0 || kind.indexOf("gig") >= 0 || kind.indexOf("job") >= 0) {
      return (
        <g>
          <path d="M50 22 L76 66 L24 66 Z" fill="none" stroke={palette.main} strokeWidth="6" strokeLinejoin="miter" />
          <rect x="46" y="38" width="8" height="14" fill={palette.main} />
          <rect x="46" y="56" width="8" height="7" fill={palette.main} />
        </g>
      );
    }
    if (kind.indexOf("danger") >= 0 || kind.indexOf("hostile") >= 0) {
      return (
        <g>
          <circle cx="50" cy="50" r="22" fill="none" stroke={palette.main} strokeWidth="6" />
          <path d="M40 40 L60 60 M60 40 L40 60" stroke={palette.main} strokeWidth="6" strokeLinecap="square" />
        </g>
      );
    }
    if (kind.indexOf("vendor") >= 0 || kind.indexOf("shop") >= 0) {
      return (
        <g>
          <rect x="30" y="34" width="40" height="32" fill="none" stroke={palette.main} strokeWidth="6" />
          <path d="M30 44 H70" stroke={palette.main} strokeWidth="5" />
        </g>
      );
    }
    return (
      <g>
        <circle cx="50" cy="50" r="10" fill={palette.main} />
        <circle cx="50" cy="50" r="21" fill="none" stroke={palette.main} strokeWidth="4" />
      </g>
    );
  })();

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: MapMarker_MIN.base[0] + "rem", minHeight: MapMarker_MIN.base[1] + "rem" }}
    >
      <div
        className="absolute"
        style={{
          left: cx + "%",
          top: cy + "%",
          width: "2rem",
          height: "2rem",
          transform: "translate(-50%,-50%)",
        }}
      >
        <button
          type="button"
          disabled={!interactive}
          onClick={function () { if (interactive) props.onSelect(props.id); }}
          onPointerEnter={function () { setHover(true); if (props.onHover && interactive) props.onHover(props.id); }}
          onPointerLeave={function () { setHover(false); setPress(false); if (props.onHover) props.onHover(null); }}
          onPointerDown={function () { setPress(true); }}
          onPointerUp={function () { setPress(false); }}
          className={
            "group relative block h-full w-full touch-none bg-transparent p-0 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
            (state === "locked" ? "opacity-40 grayscale cursor-default " : "cursor-pointer ") +
            (press ? "scale-90 " : hover || state === "selected" ? "scale-110 " : "scale-100 ")
          }
          style={{ filter: "drop-shadow(0 0 " + (hover || state !== "default" ? "8px " : "4px ") + palette.glow + ")" }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
            <defs>
              <radialGradient id={uid + "-halo"} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={palette.main} stopOpacity="0.35" />
                <stop offset="70%" stopColor={palette.main} stopOpacity="0.08" />
                <stop offset="100%" stopColor={palette.main} stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="50" cy="50" r="46" fill={"url(#" + uid + "-halo)"} />

            {state === "tracked" ? (
              <g>
                <circle cx="50" cy="50" r="38" fill="none" stroke={palette.main} strokeWidth="3" opacity="0.5">
                  <animate attributeName="r" values="26;46;26" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="33" fill="none" stroke={palette.main} strokeWidth="2" opacity="0.35" strokeDasharray="6 8">
                  <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" />
                </circle>
              </g>
            ) : null}

            {state === "selected" ? (
              <g>
                <g>
                  <path d="M20 20 H34 M20 20 V34" stroke={palette.main} strokeWidth="5" fill="none" />
                  <path d="M80 20 H66 M80 20 V34" stroke={palette.main} strokeWidth="5" fill="none" />
                  <path d="M20 80 H34 M20 80 V66" stroke={palette.main} strokeWidth="5" fill="none" />
                  <path d="M80 80 H66 M80 80 V66" stroke={palette.main} strokeWidth="5" fill="none" />
                  <animateTransform attributeName="transform" type="rotate" values="0 50 50;90 50 50" dur="3s" repeatCount="indefinite" />
                </g>
                <circle cx="50" cy="50" r="42" fill="none" stroke={palette.main} strokeWidth="1.5" opacity="0.45" />
              </g>
            ) : null}

            {hover && state !== "locked" && state !== "selected" ? (
              <circle cx="50" cy="50" r="40" fill="none" stroke={palette.main} strokeWidth="2" opacity="0.4" strokeDasharray="4 6">
                <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="4s" repeatCount="indefinite" />
              </circle>
            ) : null}

            {state === "locked" ? (
              <g>
                <path d="M34 34 L66 66" stroke="#737373" strokeWidth="4" opacity="0.8" />
              </g>
            ) : null}

            <g opacity={state === "locked" ? 0.85 : 1}>{glyph}</g>
          </svg>
        </button>
      </div>
    </div>
  );
}