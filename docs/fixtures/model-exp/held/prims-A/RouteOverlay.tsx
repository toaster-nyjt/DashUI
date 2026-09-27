type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export const RouteOverlay_MIN = {"base":[6,4]};

export function RouteOverlay(props: RouteOverlayProps) {
  const { points, visible, distance } = props;
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;

  const pts = (points || []).filter(
    (p) => p && typeof p.x === "number" && typeof p.y === "number"
  );

  const coords = useMemo(
    () => pts.map((p) => ({ x: Math.max(0, Math.min(1, p.x)) * 100, y: Math.max(0, Math.min(1, p.y)) * 100 })),
    [pts]
  );

  const d = useMemo(() => {
    if (coords.length === 0) return "";
    if (coords.length === 1) return "M " + coords[0].x + " " + coords[0].y;
    let s = "M " + coords[0].x + " " + coords[0].y;
    for (let i = 1; i < coords.length; i++) {
      const a = coords[i - 1];
      const b = coords[i];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      s += " L " + mx + " " + my + " L " + b.x + " " + b.y;
    }
    return s;
  }, [coords]);

  const fmt = (n: number) => {
    if (!isFinite(n)) return "--";
    if (n >= 100) return String(Math.round(n));
    if (n >= 10) return n.toFixed(1);
    return n.toFixed(2);
  };

  const last = coords.length > 0 ? coords[coords.length - 1] : null;
  const first = coords.length > 0 ? coords[0] : null;

  return (
    <div
      className="relative h-full w-full pointer-events-none select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-flow{to{stroke-dashoffset:-40}}" +
        "@keyframes " + uid + "-ping{0%{r:1.4;opacity:.9}100%{r:6;opacity:0}}" +
        "@keyframes " + uid + "-breathe{0%,100%{opacity:.35}50%{opacity:.85}}"
      }</style>

      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{ opacity: visible && coords.length > 0 ? 1 : 0, filter: visible ? "none" : "blur(2px)" }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#fcd34d" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.4" result="b" />
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
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke={"url(#" + uid + "-grad)"}
                strokeWidth="4"
                strokeOpacity="0.22"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ animation: uid + "-breathe 2.4s ease-in-out infinite" }}
              />
              <path
                d={d}
                fill="none"
                stroke={"url(#" + uid + "-grad)"}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke="#ecfeff"
                strokeWidth="1"
                strokeOpacity="0.9"
                strokeLinecap="round"
                strokeDasharray="6 14"
                vectorEffect="non-scaling-stroke"
                style={{ animation: uid + "-flow 1.6s linear infinite" }}
              />
            </g>
          ) : null}

          {coords.map((c, i) => {
            const isEnd = i === coords.length - 1 && coords.length > 1;
            const isStart = i === 0;
            if (isStart || isEnd) return null;
            return (
              <g key={"wp-" + i}>
                <circle cx={c.x} cy={c.y} r="1.1" fill="#0a0a0a" stroke="#22d3ee" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
              </g>
            );
          })}

          {first ? (
            <g>
              <circle cx={first.x} cy={first.y} r="1.8" fill="none" stroke="#22d3ee" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <circle cx={first.x} cy={first.y} r="0.9" fill="#22d3ee" />
            </g>
          ) : null}

          {last && coords.length > 1 ? (
            <g filter={"url(#" + uid + "-glow)"}>
              <circle cx={last.x} cy={last.y} r="1.4" fill="none" stroke="#fcd34d" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ animation: uid + "-ping 1.8s ease-out infinite" }} />
              <path
                d={"M " + last.x + " " + (last.y - 3) + " L " + (last.x + 2.2) + " " + last.y + " L " + last.x + " " + (last.y + 3) + " L " + (last.x - 2.2) + " " + last.y + " Z"}
                fill="#fcd34d"
                stroke="#1c1917"
                strokeWidth="0.6"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ) : null}
        </svg>

        {typeof distance === "number" && coords.length > 0 ? (
          <div
            className="absolute left-0 top-0 flex items-stretch border border-amber-300/40 bg-neutral-900/85 backdrop-blur-md shadow-[0_0_16px_rgba(252,211,77,0.25)] transition-all duration-300 ease-out"
            style={{ margin: "0.4rem", height: "1.35rem", width: "5rem" }}
          >
            <div className="w-[0.25rem] bg-gradient-to-b from-amber-300 to-cyan-400" />
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-[10%]">
                <FitText className="font-mono font-bold tracking-widest uppercase text-amber-300" wrap={false}>
                  {fmt(distance) + " KM"}
                </FitText>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}