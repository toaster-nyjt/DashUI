type MapMarkerProps = {
  id: string;
  x: number;
  y: number;
  kind: 'quest' | 'poi' | 'player' | 'waypoint';
  label?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export const MapMarker_MIN = {"base":[2.5,2.5]};

export function MapMarker(props: MapMarkerProps) {
  const uid = useRef("mapmarker-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const interactive = !!props.onSelect;
  const sel = !!props.selected;

  const TONE: any = {
    quest: { c: "#fde047", glow: "rgba(253,224,71,0.75)" },
    poi: { c: "#22d3ee", glow: "rgba(34,211,238,0.7)" },
    player: { c: "#a3e635", glow: "rgba(163,230,53,0.7)" },
    waypoint: { c: "#e879f9", glow: "rgba(232,121,249,0.7)" }
  };
  const tone = TONE[props.kind];

  const size = props.kind === "player" ? 2.3 : 2.0;
  const scale = (press ? 0.92 : hover && interactive ? 1.12 : 1) * (sel ? 1.08 : 1);

  const clamp = (n: number) => Math.max(0, Math.min(1, isFinite(n) ? n : 0));
  const left = clamp(props.x) * 100;
  const top = clamp(props.y) * 100;

  const glyph = () => {
    if (props.kind === "quest") {
      return (
        <g>
          <path d="M50 14 L74 50 L50 86 L26 50 Z" fill={"url(#" + uid + "-g)"} stroke={tone.c} strokeWidth="5" strokeLinejoin="round" />
          <path d="M50 32 L62 50 L50 68 L38 50 Z" fill={tone.c} opacity="0.95" />
        </g>
      );
    }
    if (props.kind === "poi") {
      return (
        <g>
          <path d="M50 16 L79 33 L79 67 L50 84 L21 67 L21 33 Z" fill={"url(#" + uid + "-g)"} stroke={tone.c} strokeWidth="5" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="10" fill={tone.c} />
        </g>
      );
    }
    if (props.kind === "player") {
      return (
        <g>
          <circle cx="50" cy="50" r="30" fill={"url(#" + uid + "-g)"} stroke={tone.c} strokeWidth="4" />
          <path d="M50 26 L66 68 L50 58 L34 68 Z" fill={tone.c} />
        </g>
      );
    }
    return (
      <g>
        <path d="M50 88 C50 88 24 60 24 42 A26 26 0 0 1 76 42 C76 60 50 88 50 88 Z" fill={"url(#" + uid + "-g)"} stroke={tone.c} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="50" cy="42" r="9" fill="#07070c" stroke={tone.c} strokeWidth="4" />
      </g>
    );
  };

  return (
    <div className="h-full w-full pointer-events-none relative" style={{ minWidth: MapMarker_MIN.base[0] + "rem", minHeight: MapMarker_MIN.base[1] + "rem" }}>
      <div
        className="absolute flex flex-col items-center"
        style={{ left: left + "%", top: top + "%", transform: "translate(-50%,-50%)" }}
      >
        <div
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => { setHover(false); setPress(false); }}
          onPointerDown={(e) => { if (!interactive) return; e.stopPropagation(); setPress(true); }}
          onPointerUp={() => { if (!interactive) return; setPress(false); if (props.onSelect) props.onSelect(props.id); }}
          className={"relative touch-none transition-all duration-200 ease-out " + (interactive ? "cursor-pointer" : "")}
          style={{
            pointerEvents: interactive ? "auto" : "none",
            width: size + "rem",
            height: size + "rem",
            transform: "scale(" + scale + ")",
            filter: "drop-shadow(0 0 " + (sel || hover ? 10 : 5) + "px " + tone.glow + ")"
          }}
        >
          {(sel || props.kind === "player") && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid " + tone.c,
                opacity: 0.55,
                animation: "mapmarker-ping 1.8s cubic-bezier(0.22,1,0.36,1) infinite"
              }}
            />
          )}
          {sel && (
            <span
              className="absolute rounded-full"
              style={{ inset: "-22%", border: "1px dashed " + tone.c, opacity: 0.5, animation: "mapmarker-spin 6s linear infinite" }}
            />
          )}
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id={uid + "-g"} cx="50%" cy="35%" r="70%">
                <stop offset="0%" stopColor={tone.c} stopOpacity="0.45" />
                <stop offset="100%" stopColor="#07070c" stopOpacity="0.92" />
              </radialGradient>
            </defs>
            {glyph()}
          </svg>
        </div>

        {props.label ? (
          <div
            className="mt-1 max-w-[9rem] truncate min-w-0 px-2 py-1 rounded-sm font-mono font-medium tracking-wider uppercase text-[10px] leading-none transition-all duration-200 ease-out"
            style={{
              pointerEvents: "none",
              color: sel ? "#000" : tone.c,
              background: sel ? tone.c : "rgba(7,7,12,0.85)",
              border: "1px solid " + tone.c + (sel ? "" : "66"),
              boxShadow: sel ? "0 0 12px " + tone.glow : "none",
              opacity: sel || hover ? 1 : 0.85
            }}
          >
            {props.label}
          </div>
        ) : null}
      </div>
      <style>{"@keyframes mapmarker-ping{0%{transform:scale(0.75);opacity:0.65}70%{transform:scale(1.9);opacity:0}100%{opacity:0}}@keyframes mapmarker-spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}