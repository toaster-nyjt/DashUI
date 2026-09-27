type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export const RouteOverlay_MIN = {"base":[6,5]};

export function RouteOverlay(props: RouteOverlayProps) {
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const pts = Array.isArray(props.points) ? props.points.filter(function (p) { return p && isFinite(p.x) && isFinite(p.y); }) : [];
  const clamp = function (v: number) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  const P = pts.map(function (p) { return { x: clamp(p.x) * 100, y: clamp(p.y) * 100 }; });
  const d = P.length > 0 ? P.map(function (p, i) { return (i === 0 ? "M" : "L") + p.x.toFixed(3) + " " + p.y.toFixed(3); }).join(" ") : "";
  const last = P.length > 0 ? P[P.length - 1] : null;
  const first = P.length > 0 ? P[0] : null;
  const dist = props.distance;

  const fmt = function (v: number) {
    if (v >= 1000) return (v / 1000).toFixed(v >= 10000 ? 0 : 1) + " KM";
    return Math.round(v) + " M";
  };

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: RouteOverlay_MIN.base[0] + "rem", minHeight: RouteOverlay_MIN.base[1] + "rem" }}
    >
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{ opacity: props.visible ? 1 : 0, filter: props.visible ? "none" : "blur(2px)" }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#67e8f9" />
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

          {d !== "" && P.length > 1 ? (
            <g filter={"url(#" + uid + "-glow)"}>
              <path
                d={d}
                fill="none"
                stroke="#000000"
                strokeOpacity="0.65"
                strokeWidth="7"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke={"url(#" + uid + "-grad)"}
                strokeOpacity="0.28"
                strokeWidth="6"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke={"url(#" + uid + "-grad)"}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke="#ecfeff"
                strokeWidth="1.4"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="6 10"
                vectorEffect="non-scaling-stroke"
                style={{ animation: uid + "-dash 1.1s linear infinite" }}
              />
            </g>
          ) : null}

          {P.map(function (p, i) {
            const isEnd = i === P.length - 1 && P.length > 1;
            const isStart = i === 0;
            if (isEnd || isStart) return null;
            return (
              <g key={"wp-" + i}>
                <circle cx={p.x} cy={p.y} r="1" fill="#0a0a0a" stroke="#22d3ee" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}

          {first ? (
            <g>
              <circle cx={first.x} cy={first.y} r="1.6" fill="#22d3ee" fillOpacity="0.25" stroke="#67e8f9" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </g>
          ) : null}
        </svg>

        {last ? (
          <div
            className="absolute"
            style={{ left: last.x + "%", top: last.y + "%", width: 0, height: 0 }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ width: "1.6rem", height: "1.6rem" }}>
              <div className="absolute inset-0 rounded-full border border-fuchsia-400/60 animate-ping" />
              <div className="absolute inset-[22%] rotate-45 border border-fuchsia-300 bg-fuchsia-500/40 shadow-[0_0_12px_rgba(232,121,249,0.5)]" />
              <div className="absolute inset-[42%] rotate-45 bg-fuchsia-200" />
            </div>
          </div>
        ) : null}

        {typeof dist === "number" && isFinite(dist) ? (
          <div className="absolute right-[3%] bottom-[3%] h-[16%] w-[38%] min-h-0 min-w-0 border border-cyan-400/30 bg-black/70 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-cyan-300 to-fuchsia-500" />
            <div className="absolute inset-[12%] left-[10%]">
              <FitText className="font-mono font-bold tracking-widest uppercase text-cyan-300" wrap={false}>
                {fmt(dist)}
              </FitText>
            </div>
          </div>
        ) : null}
      </div>

      <style>{"@keyframes " + uid + "-dash { to { stroke-dashoffset: -16; } }"}</style>
    </div>
  );
}