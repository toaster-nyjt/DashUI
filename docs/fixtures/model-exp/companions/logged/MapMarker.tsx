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
  const [down, setDown] = useState(false);

  const state = props.state || "default";
  const kind = (props.kind || "").toLowerCase();
  const locked = state === "locked";

  const isTravel = kind.indexOf("travel") >= 0 || kind.indexOf("fast") >= 0 || kind.indexOf("transit") >= 0;
  const isQuest = kind.indexOf("quest") >= 0 || kind.indexOf("main") >= 0 || kind.indexOf("job") >= 0 || kind.indexOf("gig") >= 0;
  const isVendor = kind.indexOf("vendor") >= 0 || kind.indexOf("shop") >= 0 || kind.indexOf("ripper") >= 0;

  let accent = "#22d3ee";
  if (isQuest) accent = "#fcd34d";
  if (isVendor) accent = "#e879f9";
  if (state === "tracked") accent = isQuest ? "#fbbf24" : "#22d3ee";
  if (state === "selected") accent = isQuest ? "#fde68a" : "#67e8f9";
  if (locked) accent = "#737373";

  const clampedX = Math.max(0, Math.min(1, props.position.x));
  const clampedY = Math.max(0, Math.min(1, props.position.y));

  const active = state === "selected" || state === "tracked";
  const lift = locked ? 1 : hot ? 1.18 : active ? 1.08 : 1;
  const scale = down && !locked ? lift * 0.9 : lift;
  const glow = locked ? 0 : hot ? 10 : state === "selected" ? 9 : state === "tracked" ? 7 : 3;

  const size = active || hot ? 2.1 : 1.8;

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: MapMarker_MIN.base[0] + "rem", minHeight: MapMarker_MIN.base[1] + "rem" }}
    >
      <div
        className="absolute"
        style={{
          left: clampedX * 100 + "%",
          top: clampedY * 100 + "%",
          width: size + "rem",
          height: size + "rem",
          transform: "translate(-50%,-50%) scale(" + scale + ")",
          transition: "transform 200ms ease-out, width 200ms ease-out, height 200ms ease-out",
          opacity: locked ? 0.45 : 1,
          filter: locked ? "grayscale(1)" : "none",
          cursor: locked ? "not-allowed" : "pointer",
          touchAction: "none",
        }}
        onPointerEnter={() => { setHot(true); if (props.onHover) props.onHover(props.id); }}
        onPointerLeave={() => { setHot(false); setDown(false); if (props.onHover) props.onHover(null); }}
        onPointerDown={(e) => { if (locked) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setDown(true); }}
        onPointerUp={() => { if (locked) return; setDown(false); props.onSelect(props.id); }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-core"} cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity={locked ? 0.2 : 0.95} />
              <stop offset="55%" stopColor={accent} stopOpacity="0.95" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.15" />
            </radialGradient>
            <filter id={uid + "-blur"} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation={glow} />
            </filter>
          </defs>

          {glow > 0 ? (
            <circle cx="50" cy="50" r="26" fill={accent} opacity="0.35" filter={"url(#" + uid + "-blur)"} />
          ) : null}

          {state === "tracked" && !locked ? (
            <g>
              <circle cx="50" cy="50" r="40" fill="none" stroke={accent} strokeWidth="2" opacity="0.5">
                <animate attributeName="r" values="30;48;30" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : null}

          {/* rotating bracket ring for selected */}
          {state === "selected" && !locked ? (
            <g stroke={accent} strokeWidth="4" fill="none" opacity="0.9">
              <g>
                <path d="M50 8 A42 42 0 0 1 84 30" />
                <path d="M50 92 A42 42 0 0 1 16 70" />
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" />
              </g>
            </g>
          ) : null}

          {/* static hairline ring */}
          <circle cx="50" cy="50" r="42" fill="none" stroke={accent} strokeOpacity="0.28" strokeWidth="2" strokeDasharray="4 6" />

          {isTravel ? (
            <g>
              <polygon
                points="50,14 81,32 81,68 50,86 19,68 19,32"
                fill="#000000"
                fillOpacity="0.75"
                stroke={accent}
                strokeWidth="5"
                strokeLinejoin="miter"
              />
              <path d="M50 30 L64 52 L54 52 L54 70 L46 70 L46 52 L36 52 Z" fill={"url(#" + uid + "-core)"} />
            </g>
          ) : isQuest ? (
            <g>
              <polygon points="50,12 88,50 50,88 12,50" fill="#000000" fillOpacity="0.75" stroke={accent} strokeWidth="5" strokeLinejoin="miter" />
              <rect x="45" y="30" width="10" height="26" fill={"url(#" + uid + "-core)"} />
              <rect x="45" y="61" width="10" height="9" fill={accent} />
            </g>
          ) : (
            <g>
              <polygon points="50,16 84,50 50,84 16,50" fill="#000000" fillOpacity="0.7" stroke={accent} strokeWidth="4" strokeLinejoin="miter" opacity="0.8" />
              <circle cx="50" cy="50" r="15" fill={"url(#" + uid + "-core)"} />
            </g>
          )}

          {/* crosshair ticks */}
          <g stroke={accent} strokeWidth="4" strokeLinecap="butt" opacity={hot && !locked ? 0.95 : 0.4}>
            <line x1="50" y1="0" x2="50" y2="8" />
            <line x1="50" y1="92" x2="50" y2="100" />
            <line x1="0" y1="50" x2="8" y2="50" />
            <line x1="92" y1="50" x2="100" y2="50" />
          </g>

          {locked ? (
            <g stroke="#a3a3a3" strokeWidth="6" strokeLinecap="round">
              <line x1="34" y1="34" x2="66" y2="66" />
              <line x1="66" y1="34" x2="34" y2="66" />
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}