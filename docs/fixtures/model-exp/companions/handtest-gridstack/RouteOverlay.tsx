type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export function RouteOverlay(props: RouteOverlayProps) {
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;
  const pts = (props.points || []).filter(
    (p) => p && typeof p.x === "number" && typeof p.y === "number"
  );

  const d = useMemo(() => {
    if (pts.length === 0) return "";
    const c = pts.map((p) => ({ x: Math.max(0, Math.min(1, p.x)) * 100, y: Math.max(0, Math.min(1, p.y)) * 100 }));
    if (c.length === 1) return "M " + c[0].x + " " + c[0].y;
    let s = "M " + c[0].x + " " + c[0].y;
    for (let i = 1; i < c.length; i++) {
      const prev = c[i - 1];
      const cur = c[i];
      const mx = (prev.x + cur.x) / 2;
      const my = (prev.y + cur.y) / 2;
      s += " Q " + prev.x + " " + prev.y + " " + mx + " " + my;
      if (i === c.length - 1) s += " L " + cur.x + " " + cur.y;
    }
    return s;
  }, [pts]);

  const mid = pts.length > 0 ? pts[Math.floor((pts.length - 1) / 2)] : { x: 0.5, y: 0.5 };
  const start = pts[0];
  const end = pts[pts.length - 1];

  return (
    <div
      className="relative h-full w-full pointer-events-none select-none transition-all duration-300 ease-out"
      style={{
        minWidth: floor[0] + "rem",
        minHeight: floor[1] + "rem",
        opacity: props.visible && pts.length > 0 ? 1 : 0,
      }}
    >
      <style>
        {"@keyframes " + uid + "-flow{to{stroke-dashoffset:-40}}@keyframes " + uid + "-ping{0%{r:1.6;opacity:.9}100%{r:6;opacity:0}}"}
      </style>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
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
              strokeOpacity="0.55"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke={"url(#" + uid + "-grad)"}
              strokeOpacity="0.28"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke={"url(#" + uid + "-grad)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={d}
              fill="none"
              stroke="#ecfeff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="6 14"
              vectorEffect="non-scaling-stroke"
              style={{ animation: uid + "-flow 1.1s linear infinite" }}
            />
          </g>
        ) : null}
      </svg>

      {pts.map((p, i) => {
        const isStart = i === 0;
        const isEnd = i === pts.length - 1 && pts.length > 1;
        const size = isStart || isEnd ? 0.85 : 0.45;
        const color = isEnd ? "#e879f9" : "#22d3ee";
        return (
          <div
            key={"wp-" + i}
            className="absolute"
            style={{
              left: Math.max(0, Math.min(1, p.x)) * 100 + "%",
              top: Math.max(0, Math.min(1, p.y)) * 100 + "%",
              width: size + "rem",
              height: size + "rem",
              transform: "translate(-50%,-50%) rotate(45deg)",
              background: isStart || isEnd ? color : "rgba(0,0,0,0.7)",
              border: "1px solid " + color,
              boxShadow: "0 0 10px " + color,
            }}
          />
        );
      })}

      {props.visible && end && pts.length > 1 ? (
        <div
          className="absolute"
          style={{
            left: Math.max(0, Math.min(1, end.x)) * 100 + "%",
            top: Math.max(0, Math.min(1, end.y)) * 100 + "%",
            width: "1.8rem",
            height: "1.8rem",
            transform: "translate(-50%,-50%)",
            borderRadius: "9999px",
            border: "1px solid rgba(232,121,249,0.5)",
          }}
        >
          <div className="h-full w-full rounded-full animate-pulse shadow-[0_0_12px_rgba(232,121,249,0.5)]" />
        </div>
      ) : null}

      {typeof props.distance === "number" && pts.length > 0 ? (
        <div
          className="absolute flex items-center border border-cyan-400/40 bg-black/80 shadow-[0_0_12px_rgba(34,211,238,0.35)] backdrop-blur-sm transition-all duration-200 ease-out"
          style={{
            left: Math.max(0, Math.min(1, mid.x)) * 100 + "%",
            top: Math.max(0, Math.min(1, mid.y)) * 100 + "%",
            width: "4.2rem",
            height: "1.15rem",
            transform: "translate(-50%,-160%)",
          }}
        >
          <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-cyan-300 to-fuchsia-400" />
          <div className="absolute inset-y-[12%] left-[8%] right-[6%]">
            <FitText className="font-mono font-bold tracking-widest uppercase text-cyan-300" wrap={false}>
              {(props.distance >= 100 ? Math.round(props.distance) : Math.round(props.distance * 10) / 10) + " KM"}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const RouteOverlay_MIN = {"base":[4,4]};