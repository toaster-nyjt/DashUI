type MapMarkerProps = {
  id: string;
  position: { x: number; y: number };
  kind?: string;
  state?: "default" | "selected" | "tracked" | "locked";
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
};

const MapMarkerGlyph = (kind: string) => {
  const k = (kind || "").toLowerCase();
  if (k.indexOf("travel") >= 0 || k.indexOf("fast") >= 0)
    return <path d="M12 4.5 L18 12 L14.5 12 L14.5 19 L9.5 19 L9.5 12 L6 12 Z" fill="currentColor" />;
  if (k.indexOf("quest") >= 0 || k.indexOf("main") >= 0)
    return <path d="M12 4 L14.6 9.7 L20.5 10.4 L16.1 14.5 L17.3 20.4 L12 17.4 L6.7 20.4 L7.9 14.5 L3.5 10.4 L9.4 9.7 Z" fill="currentColor" />;
  if (k.indexOf("side") >= 0 || k.indexOf("gig") >= 0)
    return <path d="M12 3.6 L20.4 12 L12 20.4 L3.6 12 Z" fill="none" stroke="currentColor" strokeWidth="2.4" />;
  if (k.indexOf("vendor") >= 0 || k.indexOf("shop") >= 0)
    return <path d="M6 9.5 H18 L16.8 18.5 H7.2 Z M9.2 9.5 V7.6 a2.8 2.8 0 0 1 5.6 0 V9.5" fill="none" stroke="currentColor" strokeWidth="2" />;
  if (k.indexOf("danger") >= 0 || k.indexOf("hostile") >= 0 || k.indexOf("combat") >= 0)
    return <path d="M12 4 L20.5 19 H3.5 Z M12 9.5 V14 M12 16 V17.4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="miter" />;
  if (k.indexOf("lock") >= 0 || k.indexOf("secure") >= 0)
    return <path d="M7 11 H17 V19 H7 Z M9.3 11 V8.7 a2.7 2.7 0 0 1 5.4 0 V11" fill="none" stroke="currentColor" strokeWidth="2" />;
  return <circle cx="12" cy="12" r="3.6" fill="currentColor" />;
};

export const MapMarker_MIN = {"base":[2,2]};

export function MapMarker(props: MapMarkerProps) {
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hot, setHot] = useState(false);
  const [press, setPress] = useState(false);
  const state = props.state || "default";
  const locked = state === "locked";
  const floor = MapMarker_MIN.base;

  const tone =
    state === "selected"
      ? { main: "#e879f9", soft: "rgba(232,121,249,0.55)", text: "text-fuchsia-300" }
      : state === "tracked"
      ? { main: "#fcd34d", soft: "rgba(252,211,77,0.5)", text: "text-amber-300" }
      : locked
      ? { main: "#737373", soft: "rgba(115,115,115,0.25)", text: "text-neutral-500" }
      : { main: "#22d3ee", soft: "rgba(34,211,238,0.5)", text: "text-cyan-300" };

  const x = Math.max(0, Math.min(1, props.position.x)) * 100;
  const y = Math.max(0, Math.min(1, props.position.y)) * 100;
  const active = (hot || state === "selected" || state === "tracked") && !locked;

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 overflow-visible">
        <div
          className="absolute"
          style={{ left: x + "%", top: y + "%", transform: "translate(-50%,-50%)" }}
        >
          <button
            type="button"
            onClick={() => { if (!locked) props.onSelect(props.id); }}
            onPointerEnter={() => { setHot(true); if (props.onHover) props.onHover(props.id); }}
            onPointerLeave={() => { setHot(false); setPress(false); if (props.onHover) props.onHover(null); }}
            onPointerDown={() => setPress(true)}
            onPointerUp={() => setPress(false)}
            className={
              "relative block touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 transition-all duration-200 ease-out " +
              (locked ? "opacity-40 grayscale cursor-default" : "cursor-pointer")
            }
            style={{
              width: "2.1rem",
              height: "2.1rem",
              transform: "scale(" + (press ? 0.9 : active ? 1.14 : 1) + ")",
              filter: active ? "drop-shadow(0 0 8px " + tone.soft + ")" : "none",
            }}
          >
            <svg
              viewBox="0 0 48 48"
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              <defs>
                <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={tone.main} stopOpacity="0.5" />
                  <stop offset="70%" stopColor={tone.main} stopOpacity="0.08" />
                  <stop offset="100%" stopColor={tone.main} stopOpacity="0" />
                </radialGradient>
                <linearGradient id={uid + "-plate"} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(10,10,12,0.95)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
                </linearGradient>
              </defs>

              <circle cx="24" cy="24" r="22" fill={"url(#" + uid + "-glow)"} />

              {(state === "tracked" || state === "selected") && !locked ? (
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke={tone.main}
                  strokeWidth="1"
                  opacity="0.5"
                  className="animate-ping"
                  style={{ transformOrigin: "24px 24px", animationDuration: "2s" }}
                />
              ) : null}

              {/* rotating bracket ring */}
              <g
                className={active ? "animate-spin" : ""}
                style={{ transformOrigin: "24px 24px", animationDuration: state === "selected" ? "5s" : "9s" }}
              >
                <path
                  d="M24 3.5 A20.5 20.5 0 0 1 44.5 24"
                  fill="none"
                  stroke={tone.main}
                  strokeWidth="1.6"
                  opacity={active ? "0.95" : "0.45"}
                />
                <path
                  d="M24 44.5 A20.5 20.5 0 0 1 3.5 24"
                  fill="none"
                  stroke={tone.main}
                  strokeWidth="1.6"
                  opacity={active ? "0.95" : "0.45"}
                />
                <circle cx="44.5" cy="24" r="1.6" fill={tone.main} opacity="0.9" />
                <circle cx="3.5" cy="24" r="1.6" fill={tone.main} opacity="0.9" />
              </g>

              {/* hexagonal plate */}
              <path
                d="M24 6 L39.6 15 L39.6 33 L24 42 L8.4 33 L8.4 15 Z"
                fill={"url(#" + uid + "-plate)"}
                stroke={tone.main}
                strokeWidth={state === "selected" ? "2.2" : "1.5"}
                strokeOpacity={active ? "1" : "0.65"}
              />
              <path
                d="M24 9 L37 16.5 L37 31.5 L24 39 L11 31.5 L11 16.5 Z"
                fill="none"
                stroke={tone.main}
                strokeWidth="0.6"
                strokeOpacity="0.3"
              />

              <g
                transform="translate(24 24) scale(1.05) translate(-12 -12)"
                style={{ color: tone.main, transition: "all 200ms ease-out" }}
                opacity={active ? "1" : "0.85"}
              >
                {MapMarkerGlyph(props.kind || "")}
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}