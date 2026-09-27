type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export function RouteOverlay(props: RouteOverlayProps) {
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;
  const pts = Array.isArray(props.points) ? props.points.filter((p) => p && isFinite(p.x) && isFinite(p.y)) : [];
  const has = pts.length >= 1;

  const d = useMemo(() => {
    if (pts.length < 2) return "";
    const c = pts.map((p) => ({ x: Math.max(0, Math.min(1, p.x)) * 100, y: Math.max(0, Math.min(1, p.y)) * 100 }));
    let s = "M " + c[0].x.toFixed(3) + " " + c[0].y.toFixed(3);
    for (let i = 1; i < c.length; i++) s += " L " + c[i].x.toFixed(3) + " " + c[i].y.toFixed(3);
    return s;
  }, [props.points]);

  const mid = pts.length ? pts[Math.floor((pts.length - 1) / 2)] : { x: 0.5, y: 0.5 };
  const last = pts.length ? pts[pts.length - 1] : null;

  const fmt = (n: number) => (n >= 100 ? Math.round(n).toString() : n.toFixed(1));

  return (
    <div
      className="h-full w-full pointer-events-none relative transition-all duration-300 ease-out"
      style={{
        minWidth: floor[0] + "rem",
        minHeight: floor[1] + "rem",
        opacity: props.visible && has ? 1 : 0,
        filter: props.visible ? "none" : "blur(2px)",
      }}
    >
      <style>{"@keyframes " + uid + "-dash{to{stroke-dashoffset:-24}}@keyframes " + uid + "-ping{0%{transform:scale(.6);opacity:.9}70%{transform:scale(1.9);opacity:0}100%{opacity:0}}"}</style>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="55%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {d ? (
          <g>
            <path
              d={d}
              fill="none"
              stroke="#000"
              strokeOpacity="0.65"
              strokeWidth="7"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke={"url(#" + uid + "-g)"}
              strokeOpacity="0.35"
              strokeWidth="6"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              filter={"url(#" + uid + "-glow)"}
            />
            <path
              d={d}
              fill="none"
              stroke={"url(#" + uid + "-g)"}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke="#ecfeff"
              strokeOpacity="0.9"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="6 18"
              vectorEffect="non-scaling-stroke"
              style={{ animation: uid + "-dash 1.1s linear infinite" }}
            />
          </g>
        ) : null}
      </svg>

      {pts.map((p, i) => {
        const isFirst = i === 0;
        const isLast = i === pts.length - 1 && pts.length > 1;
        const size = isFirst || isLast ? 0.72 : 0.42;
        const col = isFirst ? "#fcd34d" : isLast ? "#e879f9" : "#22d3ee";
        return (
          <div
            key={"wp-" + i}
            className="absolute"
            style={{
              left: Math.max(0, Math.min(1, p.x)) * 100 + "%",
              top: Math.max(0, Math.min(1, p.y)) * 100 + "%",
              width: size + "rem",
              height: size + "rem",
              transform: "translate(-50%,-50%)",
            }}
          >
            {(isFirst || isLast) && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: "1px solid " + col,
                  animation: uid + "-ping 1.8s cubic-bezier(0,0,0.2,1) infinite",
                  animationDelay: isLast ? "0.5s" : "0s",
                }}
              />
            )}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: isLast ? col : "rgba(0,0,0,0.85)",
                border: "1px solid " + col,
                boxShadow: "0 0 8px " + col,
                transform: isFirst || isLast ? "rotate(45deg)" : "none",
                borderRadius: isFirst ? "2px" : undefined,
              }}
            />
          </div>
        );
      })}

      {typeof props.distance === "number" && has ? (
        <div
          className="absolute"
          style={{
            left: Math.max(0, Math.min(1, (last || mid).x)) * 100 + "%",
            top: Math.max(0, Math.min(1, (last || mid).y)) * 100 + "%",
            transform: "translate(-50%,-190%)",
          }}
        >
          <div className="flex items-center gap-1 whitespace-nowrap border border-amber-300/50 bg-black/80 px-2 py-1 shadow-[0_0_12px_rgba(252,211,77,0.35)] backdrop-blur-sm">
            <span className="block h-1 w-1 rounded-full bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.9)]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] leading-none text-amber-300">
              {fmt(props.distance)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const RouteOverlay_MIN = {"base":[6,4]};