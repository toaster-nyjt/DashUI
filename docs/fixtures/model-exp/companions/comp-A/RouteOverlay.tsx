type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export function RouteOverlay(props: RouteOverlayProps) {
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;
  const pts = Array.isArray(props.points) ? props.points.filter(function (p) { return p && isFinite(p.x) && isFinite(p.y); }) : [];
  const S = 1000;
  const coords = pts.map(function (p) {
    return { x: Math.max(0, Math.min(1, p.x)) * S, y: Math.max(0, Math.min(1, p.y)) * S };
  });

  const d = coords.length
    ? coords.map(function (c, i) { return (i === 0 ? "M" : "L") + c.x.toFixed(2) + " " + c.y.toFixed(2); }).join(" ")
    : "";

  const start = coords[0];
  const end = coords.length > 1 ? coords[coords.length - 1] : null;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-dash{to{stroke-dashoffset:-64}}@keyframes " + uid + "-ping{0%{r:10;opacity:.9}100%{r:34;opacity:0}}@keyframes " + uid + "-fade{from{opacity:0}to{opacity:1}}"}</style>
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          opacity: props.visible && coords.length > 0 ? 1 : 0,
          transform: props.visible ? "scale(1)" : "scale(1.02)",
          pointerEvents: "none"
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={"0 0 " + S + " " + S}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {d ? (
            <g filter={"url(#" + uid + "-glow)"}>
              <path
                d={d}
                fill="none"
                stroke="#000000"
                strokeOpacity="0.6"
                strokeWidth="9"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke={"url(#" + uid + "-grad)"}
                strokeOpacity="0.28"
                strokeWidth="7"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke={"url(#" + uid + "-grad)"}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="18 10 4 10"
                vectorEffect="non-scaling-stroke"
                style={{ animation: uid + "-dash 1.6s linear infinite" }}
              />
            </g>
          ) : null}

          {coords.slice(1, Math.max(1, coords.length - 1)).map(function (c, i) {
            return (
              <g key={"wp-" + i}>
                <rect
                  x={c.x - 5}
                  y={c.y - 5}
                  width="10"
                  height="10"
                  fill="#0a0a0a"
                  stroke="#67e8f9"
                  strokeOpacity="0.8"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                  transform={"rotate(45 " + c.x + " " + c.y + ")"}
                />
              </g>
            );
          })}

          {start ? (
            <g>
              <circle cx={start.x} cy={start.y} r="10" fill="none" stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <circle cx={start.x} cy={start.y} r="4" fill="#22d3ee" />
            </g>
          ) : null}

          {end ? (
            <g>
              <circle
                cx={end.x}
                cy={end.y}
                fill="none"
                stroke="#e879f9"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                style={{ animation: uid + "-ping 1.8s ease-out infinite" }}
              />
              <circle cx={end.x} cy={end.y} r="11" fill="#0a0a0a" fillOpacity="0.75" stroke="#e879f9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
              <path
                d={"M" + (end.x - 4.5) + " " + end.y + " L" + end.x + " " + (end.y + 5) + " L" + (end.x + 4.5) + " " + end.y + " L" + end.x + " " + (end.y - 5) + " Z"}
                fill="#e879f9"
              />
            </g>
          ) : null}
        </svg>

        {props.distance !== undefined && coords.length > 0 ? (
          <div
            className="absolute bottom-[4%] left-[4%] flex h-[1.4rem] w-[42%] items-center border border-cyan-400/40 bg-black/75 shadow-[0_0_12px_rgba(34,211,238,0.35)] backdrop-blur-sm"
            style={{ animation: uid + "-fade 400ms ease-out both" }}
          >
            <div className="h-full w-[3px] bg-gradient-to-b from-cyan-300 to-fuchsia-500" />
            <div className="relative h-full flex-1 min-w-0">
              <div className="absolute inset-[14%]">
                <FitText className="font-mono font-bold uppercase tracking-widest text-cyan-300" wrap={false} align="center">
                  {(props.distance >= 1000
                    ? (props.distance / 1000).toFixed(1) + " KM"
                    : Math.round(props.distance) + " M")}
                </FitText>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const RouteOverlay_MIN = {"base":[4,4]};