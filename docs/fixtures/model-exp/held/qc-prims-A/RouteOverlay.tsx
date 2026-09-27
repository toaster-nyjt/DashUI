type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export function RouteOverlay(props: RouteOverlayProps) {
  const { points, visible, distance } = props;
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;

  const pts = Array.isArray(points) ? points.filter(function (p) { return p && isFinite(p.x) && isFinite(p.y); }) : [];
  const cl = function (n: number) { return Math.max(0, Math.min(1, n)); };

  const d = useMemo(function () {
    if (pts.length === 0) return "";
    const P = pts.map(function (p) { return { x: cl(p.x) * 100, y: cl(p.y) * 100 }; });
    if (P.length === 1) return "M " + P[0].x + " " + P[0].y;
    let s = "M " + P[0].x + " " + P[0].y;
    for (let i = 1; i < P.length; i++) {
      const prev = P[i - 1];
      const cur = P[i];
      const mx = (prev.x + cur.x) / 2;
      const my = (prev.y + cur.y) / 2;
      s += " L " + mx + " " + my + " L " + cur.x + " " + cur.y;
    }
    return s;
  }, [JSON.stringify(pts)]);

  const mid = pts.length > 0 ? pts[Math.floor((pts.length - 1) / 2)] : { x: 0.5, y: 0.5 };
  const last = pts.length > 0 ? pts[pts.length - 1] : { x: 0.5, y: 0.5 };
  const first = pts.length > 0 ? pts[0] : { x: 0.5, y: 0.5 };

  const fmt = function (n: number) {
    if (!isFinite(n)) return "";
    const a = Math.abs(n);
    return a >= 100 ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
  };

  return (
    <div
      className="h-full w-full relative pointer-events-none transition-all duration-300 ease-out"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem", opacity: visible ? 1 : 0 }}
    >
      {pts.length > 0 ? (
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="55%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d={d}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.7"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={d}
            fill="none"
            stroke={"url(#" + uid + "-g)"}
            strokeOpacity="0.28"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter={"url(#" + uid + "-glow)"}
          />
          <path
            d={d}
            fill="none"
            stroke={"url(#" + uid + "-g)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={d}
            fill="none"
            stroke="#ecfeff"
            strokeOpacity="0.95"
            strokeWidth="1.6"
            strokeDasharray="6 12"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          >
            <animate attributeName="stroke-dashoffset" from="18" to="0" dur="0.9s" repeatCount="indefinite" />
          </path>

          {pts.slice(1, Math.max(1, pts.length - 1)).map(function (p, i) {
            return (
              <circle
                key={"wp-" + i}
                cx={cl(p.x) * 100}
                cy={cl(p.y) * 100}
                r="1.1"
                fill="#000"
                stroke="#22d3ee"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          <circle
            cx={cl(first.x) * 100}
            cy={cl(first.y) * 100}
            r="1.6"
            fill="#fcd34d"
            stroke="#000"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />

          {pts.length > 1 ? (
            <g>
              <circle
                cx={cl(last.x) * 100}
                cy={cl(last.y) * 100}
                r="2"
                fill="#e879f9"
                stroke="#000"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                filter={"url(#" + uid + "-glow)"}
              />
              <circle
                cx={cl(last.x) * 100}
                cy={cl(last.y) * 100}
                r="2"
                fill="none"
                stroke="#e879f9"
                strokeOpacity="0.8"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              >
                <animate attributeName="r" from="2" to="8" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" from="0.8" to="0" dur="1.6s" repeatCount="indefinite" />
              </circle>
            </g>
          ) : null}
        </svg>
      ) : null}

      {typeof distance === "number" && pts.length > 0 ? (
        <div
          className="absolute transition-all duration-300 ease-out"
          style={{
            left: cl(mid.x) * 100 + "%",
            top: cl(mid.y) * 100 + "%",
            width: "4.5rem",
            height: "1.35rem",
            transform: "translate(-50%,-160%)"
          }}
        >
          <div className="absolute inset-0 bg-black/80 border border-amber-300/50 rounded-sm shadow-[0_0_12px_rgba(252,211,77,0.35)]" />
          <div className="absolute inset-y-0 left-0 w-[2px] bg-amber-300" />
          <div className="absolute inset-[12%] left-[10%]">
            <FitText className="font-mono font-bold tracking-widest uppercase text-amber-300" wrap={false}>
              {fmt(distance)}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const RouteOverlay_MIN = {"base":[4,4]};