type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export const RouteOverlay_MIN = {"base":[4,4]};

export function RouteOverlay(props: RouteOverlayProps) {
  const { points, visible, distance } = props;
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;

  const pts = Array.isArray(points) ? points.filter((p) => p && isFinite(p.x) && isFinite(p.y)) : [];
  const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const d = useMemo(() => {
    if (pts.length === 0) return "";
    return pts
      .map((p, i) => (i === 0 ? "M " : "L ") + (clamp(p.x) * 1000).toFixed(2) + " " + (clamp(p.y) * 1000).toFixed(2))
      .join(" ");
  }, [JSON.stringify(pts)]);

  const last = pts.length ? pts[pts.length - 1] : null;
  const first = pts.length ? pts[0] : null;

  return (
    <div
      className="h-full w-full relative overflow-hidden transition-all duration-500 ease-out"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem", opacity: visible ? 1 : 0 }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={uid + "-line"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="b" />
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
              stroke="#0ff"
              strokeOpacity="0.18"
              strokeWidth="14"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke={"url(#" + uid + "-line)"}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke="#ecfeff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="10 26"
              vectorEffect="non-scaling-stroke"
            >
              <animate attributeName="stroke-dashoffset" from="72" to="0" dur="1.6s" repeatCount="indefinite" />
            </path>
          </g>
        ) : null}
      </svg>

      {/* nodes in overlay coordinates */}
      {pts.map((p, i) => {
        const isFirst = i === 0;
        const isLast = i === pts.length - 1;
        return (
          <div
            key={"node-" + i}
            className="absolute"
            style={{ left: clamp(p.x) * 100 + "%", top: clamp(p.y) * 100 + "%" }}
          >
            <div
              className={
                "absolute -translate-x-1/2 -translate-y-1/2 rotate-45 transition-all duration-200 ease-out " +
                (isLast
                  ? "h-3 w-3 bg-fuchsia-500 shadow-[0_0_12px_rgba(232,121,249,0.8)] animate-pulse"
                  : isFirst
                  ? "h-2.5 w-2.5 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                  : "h-1.5 w-1.5 bg-cyan-200/80 shadow-[0_0_6px_rgba(34,211,238,0.6)]")
              }
            />
            {(isFirst || isLast) && (
              <div
                className={
                  "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border animate-ping " +
                  (isLast ? "h-5 w-5 border-fuchsia-400/60" : "h-5 w-5 border-cyan-400/50")
                }
              />
            )}
          </div>
        );
      })}

      {typeof distance === "number" && pts.length > 0 && last ? (
        <div
          className="absolute h-5 w-20 -translate-x-1/2 transition-all duration-300 ease-out"
          style={{
            left: clamp(last.x) * 100 + "%",
            top: "calc(" + clamp(last.y) * 100 + "% - 1.6rem)",
          }}
        >
          <div className="absolute inset-0 border border-fuchsia-400/40 bg-black/80 shadow-[0_0_12px_rgba(232,121,249,0.5)]" />
          <div className="absolute inset-y-[14%] inset-x-[6%]">
            <FitText className="font-mono font-bold tracking-widest uppercase text-fuchsia-300" wrap={false}>
              {(distance < 10 ? distance.toFixed(1) : Math.round(distance).toString()) + "M"}
            </FitText>
          </div>
        </div>
      ) : null}

      {pts.length === 0 && visible ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border border-cyan-400/25 bg-black/60 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-400">
            NO ROUTE
          </div>
        </div>
      ) : null}
    </div>
  );
}