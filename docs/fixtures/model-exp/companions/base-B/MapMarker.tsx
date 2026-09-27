type MapMarkerProps = {
  id: string;
  position: { x: number; y: number };
  kind?: string;
  state?: "default" | "selected" | "tracked" | "locked";
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
};

export const MapMarker_MIN = {"base":[2.5,2.5]};

export function MapMarker(props: MapMarkerProps) {
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const state = props.state || "default";
  const locked = state === "locked";
  const kind = (props.kind || "default").toLowerCase();

  const palette =
    state === "selected"
      ? { main: "#e879f9", soft: "rgba(232,121,249,0.5)", faint: "rgba(232,121,249,0.18)" }
      : state === "tracked"
      ? { main: "#fcd34d", soft: "rgba(252,211,77,0.5)", faint: "rgba(252,211,77,0.18)" }
      : locked
      ? { main: "#737373", soft: "rgba(115,115,115,0.35)", faint: "rgba(115,115,115,0.12)" }
      : { main: "#22d3ee", soft: "rgba(34,211,238,0.5)", faint: "rgba(34,211,238,0.16)" };

  const x = Math.max(0, Math.min(1, props.position?.x ?? 0.5));
  const y = Math.max(0, Math.min(1, props.position?.y ?? 0.5));

  const glow =
    state === "selected"
      ? 10
      : state === "tracked"
      ? 8
      : hovered
      ? 7
      : locked
      ? 0
      : 4;

  const glyph = (() => {
    const c = palette.main;
    if (kind.indexOf("quest") >= 0 || kind.indexOf("mission") >= 0 || kind.indexOf("gig") >= 0) {
      return (
        <g>
          <rect x="47.2" y="35" width="5.6" height="20" fill={c} />
          <rect x="47.2" y="59" width="5.6" height="5.6" fill={c} />
        </g>
      );
    }
    if (kind.indexOf("travel") >= 0 || kind.indexOf("fast") >= 0 || kind.indexOf("metro") >= 0) {
      return (
        <g fill="none" stroke={c} strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter">
          <path d="M37 38 L50 50 L37 62" />
          <path d="M54 38 L67 50 L54 62" />
        </g>
      );
    }
    if (kind.indexOf("danger") >= 0 || kind.indexOf("hostile") >= 0 || kind.indexOf("combat") >= 0) {
      return <path d="M50 34 L66 64 L34 64 Z" fill="none" stroke={c} strokeWidth="5" />;
    }
    if (kind.indexOf("vendor") >= 0 || kind.indexOf("shop") >= 0 || kind.indexOf("ripper") >= 0) {
      return (
        <g>
          <rect x="36" y="42" width="28" height="18" fill="none" stroke={c} strokeWidth="5" />
          <rect x="45" y="34" width="10" height="8" fill={c} />
        </g>
      );
    }
    if (locked || kind.indexOf("lock") >= 0) {
      return (
        <g>
          <rect x="39" y="47" width="22" height="17" fill="none" stroke={c} strokeWidth="5" />
          <path d="M44 47 V41 a6 6 0 0 1 12 0 V47" fill="none" stroke={c} strokeWidth="4.5" />
        </g>
      );
    }
    return <circle cx="50" cy="50" r="8" fill={c} />;
  })();

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: MapMarker_MIN.base[0] + "rem", minHeight: MapMarker_MIN.base[1] + "rem" }}
    >
      <div
        className="absolute"
        style={{
          left: x * 100 + "%",
          top: y * 100 + "%",
          width: "2.25rem",
          height: "2.25rem",
          transform: "translate(-50%,-50%)",
        }}
      >
        <button
          type="button"
          disabled={locked}
          onClick={() => { if (!locked) props.onSelect(props.id); }}
          onPointerEnter={() => { setHovered(true); if (props.onHover) props.onHover(props.id); }}
          onPointerLeave={() => { setHovered(false); setPressed(false); if (props.onHover) props.onHover(null); }}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          className={
            "relative block h-full w-full touch-none bg-transparent p-0 outline-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
            (locked
              ? "cursor-default opacity-40 grayscale"
              : "cursor-pointer " + (pressed ? "scale-90 brightness-125" : hovered ? "scale-110" : "scale-100"))
          }
          style={{ filter: glow ? "drop-shadow(0 0 " + glow + "px " + palette.soft + ")" : "none" }}
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
            <defs>
              <radialGradient id={uid + "-core"} cx="50%" cy="38%" r="65%">
                <stop offset="0%" stopColor={palette.main} stopOpacity="0.5" />
                <stop offset="60%" stopColor={palette.main} stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.85" />
              </radialGradient>
              <linearGradient id={uid + "-edge"} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={palette.main} stopOpacity="1" />
                <stop offset="50%" stopColor={palette.main} stopOpacity="0.55" />
                <stop offset="100%" stopColor={palette.main} stopOpacity="1" />
              </linearGradient>
            </defs>

            {(state === "selected" || state === "tracked") && (
              <g opacity="0.75">
                <circle cx="50" cy="50" r="44" fill="none" stroke={palette.main} strokeWidth="1.5" strokeDasharray="6 10">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to={state === "tracked" ? "-360 50 50" : "360 50 50"}
                    dur={state === "tracked" ? "6s" : "9s"}
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="50" cy="50" r="40" fill="none" stroke={palette.main} strokeWidth="2" opacity="0.35">
                  <animate attributeName="r" values="34;47;34" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.45;0;0.45" dur="2.4s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* hexagonal body */}
            <polygon
              points="50,10 85,30 85,70 50,90 15,70 15,30"
              fill={"url(#" + uid + "-core)"}
              stroke={"url(#" + uid + "-edge)"}
              strokeWidth={state === "default" ? 4 : 5}
              className="transition-all duration-200 ease-out"
            />
            <polygon
              points="50,18 78,34 78,66 50,82 22,66 22,34"
              fill="none"
              stroke={palette.main}
              strokeWidth="1"
              opacity={hovered || state !== "default" ? 0.55 : 0.25}
            />

            {/* corner ticks */}
            <g stroke={palette.main} strokeWidth="3" opacity={hovered || state === "selected" ? 0.9 : 0.4}>
              <path d="M50 4 V13" />
              <path d="M50 96 V87" />
            </g>

            {glyph}

            {/* scan sweep */}
            {!locked && (
              <g clipPath="none" opacity="0.5">
                <rect x="15" y="0" width="70" height="3" fill={palette.main}>
                  <animate attributeName="y" values="22;78;22" dur="3.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;0.8;0" dur="3.2s" repeatCount="indefinite" />
                </rect>
              </g>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}