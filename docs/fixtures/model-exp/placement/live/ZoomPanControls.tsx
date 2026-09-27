type ZoomPanControlsProps = {
  zoom: number;
  min: number;
  max: number;
  onZoomChange: (zoom: number) => void;
  onPan?: (delta: { x: number; y: number }) => void;
  onRecenter?: () => void;
};

export function ZoomPanControls(props: ZoomPanControlsProps) {
  const uid = useRef("zpc-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState<string | null>(null);
  const [spin, setSpin] = useState(0);

  const min = Math.min(props.min, props.max);
  const max = Math.max(props.min, props.max);
  const zoom = Math.max(min, Math.min(max, props.zoom));
  const t = max > min ? (zoom - min) / (max - min) : 0;

  const C = 2 * Math.PI * 44;
  const step = 0.16 / Math.max(zoom, 0.0001);

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const doZoom = (dir: number) => {
    const next = clamp(dir > 0 ? zoom * 1.35 : zoom / 1.35);
    if (next !== zoom) props.onZoomChange(next);
  };

  const arm = (key: string, fn: () => void) => ({
    onPointerDown: (e: any) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setPressed(key);
      fn();
    },
    onPointerUp: () => setPressed(null),
    onPointerCancel: () => setPressed(null),
    onPointerLeave: () => setPressed(null),
    style: { cursor: "pointer", transition: "transform 200ms ease-out, opacity 200ms ease-out" } as any,
  });

  const arrows: { k: string; a: number; dx: number; dy: number }[] = [
    { k: "up", a: 0, dx: 0, dy: -1 },
    { k: "right", a: 90, dx: 1, dy: 0 },
    { k: "down", a: 180, dx: 0, dy: 1 },
    { k: "left", a: 270, dx: -1, dy: 0 },
  ];

  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const on = i / 48 <= t;
    const ang = (i / 48) * 360 - 90;
    ticks.push(
      <line
        key={"tk-" + i}
        x1="50"
        y1="50"
        x2="50"
        y2="50"
        transform={"rotate(" + ang + " 50 50) translate(0 0)"}
        stroke="none"
      />
    );
    void on;
  }

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: ZoomPanControls_MIN.base[0] + "rem", minHeight: ZoomPanControls_MIN.base[1] + "rem" }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={uid + "-core"} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#1a2b3a" />
            <stop offset="100%" stopColor="#07070c" />
          </radialGradient>
          <linearGradient id={uid + "-arc"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>

        {/* base disc */}
        <circle cx="50" cy="50" r="46" fill={"url(#" + uid + "-core)"} stroke="rgba(34,211,238,0.3)" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(8,145,178,0.35)" strokeWidth="5" />

        {/* zoom arc */}
        <g transform="rotate(-90 50 50)">
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={"url(#" + uid + "-arc)"}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={C * t + " " + C}
            style={{ transition: "stroke-dasharray 500ms cubic-bezier(0.22,1,0.36,1)" }}
            opacity="0.95"
          />
        </g>
        <g opacity="0.5">
          {[0, 90, 180, 270].map((a) => (
            <line
              key={"m-" + a}
              x1="50"
              y1="2.5"
              x2="50"
              y2="6.5"
              stroke="rgba(217,70,239,0.7)"
              strokeWidth="1"
              transform={"rotate(" + a + " 50 50)"}
            />
          ))}
        </g>

        {/* pan arrows */}
        {props.onPan
          ? arrows.map((ar) => {
              const isP = pressed === ar.k;
              return (
                <g
                  key={ar.k}
                  {...arm(ar.k, () => props.onPan && props.onPan({ x: ar.dx * step, y: ar.dy * step }))}
                  transform={"rotate(" + ar.a + " 50 50)"}
                  opacity={isP ? 1 : 0.85}
                >
                  <path
                    d="M50 14 L58.5 28 L41.5 28 Z"
                    fill={isP ? "#fde047" : "rgba(6,182,212,0.22)"}
                    stroke={isP ? "#fde047" : "rgba(34,211,238,0.55)"}
                    strokeWidth="1"
                    strokeLinejoin="round"
                    style={{
                      transition: "fill 200ms ease-out, stroke 200ms ease-out",
                      filter: isP ? "drop-shadow(0 0 4px rgba(253,224,71,0.8))" : "none",
                    }}
                  />
                  <path d="M50 19 L54 26 L46 26 Z" fill={isP ? "#000" : "rgba(207,250,254,0.6)"} />
                </g>
              );
            })
          : null}

        {/* zoom out */}
        <g {...arm("zo", () => doZoom(-1))} opacity={zoom <= min + 1e-6 ? 0.35 : 1}>
          <circle
            cx="27"
            cy="73"
            r="9.5"
            fill={pressed === "zo" ? "#fde047" : "rgba(6,182,212,0.18)"}
            stroke={pressed === "zo" ? "#fde047" : "rgba(34,211,238,0.5)"}
            strokeWidth="1"
            style={{ transition: "fill 200ms ease-out, stroke 200ms ease-out" }}
          />
          <line x1="22" y1="73" x2="32" y2="73" stroke={pressed === "zo" ? "#000" : "#cffafe"} strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* zoom in */}
        <g {...arm("zi", () => doZoom(1))} opacity={zoom >= max - 1e-6 ? 0.35 : 1}>
          <circle
            cx="73"
            cy="73"
            r="9.5"
            fill={pressed === "zi" ? "#fde047" : "rgba(6,182,212,0.18)"}
            stroke={pressed === "zi" ? "#fde047" : "rgba(34,211,238,0.5)"}
            strokeWidth="1"
            style={{ transition: "fill 200ms ease-out, stroke 200ms ease-out" }}
          />
          <line x1="68" y1="73" x2="78" y2="73" stroke={pressed === "zi" ? "#000" : "#cffafe"} strokeWidth="2" strokeLinecap="round" />
          <line x1="73" y1="68" x2="73" y2="78" stroke={pressed === "zi" ? "#000" : "#cffafe"} strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* center hub */}
        {props.onRecenter ? (
          <g
            {...arm("rc", () => {
              setSpin((s) => s + 360);
              props.onRecenter && props.onRecenter();
            })}
          >
            <circle
              cx="50"
              cy="50"
              r="15"
              fill={pressed === "rc" ? "rgba(253,224,71,0.9)" : "rgba(13,13,20,0.95)"}
              stroke={pressed === "rc" ? "#fde047" : "rgba(253,224,71,0.45)"}
              strokeWidth="1.2"
              style={{
                transition: "fill 200ms ease-out, stroke 200ms ease-out",
                filter: pressed === "rc" ? "drop-shadow(0 0 6px rgba(253,224,71,0.7))" : "none",
              }}
            />
            <g
              style={{ transform: "rotate(" + spin + "deg)", transformOrigin: "50px 50px", transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)" }}
            >
              <circle cx="50" cy="50" r="7.5" fill="none" stroke={pressed === "rc" ? "#000" : "#fde047"} strokeWidth="1.4" strokeDasharray="7 4" />
              <circle cx="50" cy="50" r="2.4" fill={pressed === "rc" ? "#000" : "#fde047"} />
            </g>
          </g>
        ) : (
          <g>
            <circle cx="50" cy="50" r="11" fill="rgba(13,13,20,0.9)" stroke="rgba(34,211,238,0.3)" strokeWidth="1" />
            <circle cx="50" cy="50" r="2.2" fill="rgba(34,211,238,0.7)" />
          </g>
        )}
      </svg>
    </div>
  );
}

export const ZoomPanControls_MIN = {"base":[5,5]};