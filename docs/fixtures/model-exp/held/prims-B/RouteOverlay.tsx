type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export function RouteOverlay(props: RouteOverlayProps) {
  const { points, visible, distance } = props;
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;

  const pts = Array.isArray(points) ? points.filter(function (p) { return p && isFinite(p.x) && isFinite(p.y); }) : [];

  const d = useMemo(function () {
    if (pts.length === 0) return "";
    const c = pts.map(function (p) {
      return { x: Math.max(0, Math.min(1, p.x)) * 100, y: Math.max(0, Math.min(1, p.y)) * 100 };
    });
    if (c.length === 1) return "M " + c[0].x + " " + c[0].y;
    let s = "M " + c[0].x + " " + c[0].y;
    for (let i = 1; i < c.length; i++) {
      const prev = c[i - 1];
      const cur = c[i];
      const mx = (prev.x + cur.x) / 2;
      const my = (prev.y + cur.y) / 2;
      s += " L " + mx + " " + my + " L " + cur.x + " " + cur.y;
    }
    return s;
  }, [pts]);

  const last = pts.length ? pts[pts.length - 1] : null;
  const first = pts.length ? pts[0] : null;

  const fmt = function (v: number) {
    if (v >= 1000) return (v / 1000).toFixed(v / 1000 >= 10 ? 0 : 1) + " KM";
    return (v >= 10 ? Math.round(v) : v.toFixed(1)) + " M";
  };

  return (
    <div
      className="pointer-events-none relative h-full w-full select-none"
      style={{
        minWidth: floor[0] + "rem",
        minHeight: floor[1] + "rem",
        opacity: visible && pts.length > 0 ? 1 : 0,
        filter: visible ? "none" : "blur(2px)",
        transition: "opacity 320ms ease-out, filter 320ms ease-out"
      }}
    >
      <style>{
        "@keyframes " + uid + "-flow{to{stroke-dashoffset:-24}}" +
        "@keyframes " + uid + "-ping{0%{transform:scale(.7);opacity:.9}70%{transform:scale(2.2);opacity:0}100%{transform:scale(2.2);opacity:0}}" +
        "@keyframes " + uid + "-draw{from{stroke-dashoffset:400}to{stroke-dashoffset:0}}" +
        "@keyframes " + uid + "-bob{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.18)}}"
      }</style>

      {d ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="55%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* outer halo */}
          <path
            d={d}
            fill="none"
            stroke="rgba(34,211,238,0.28)"
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter={"url(#" + uid + "-glow)"}
          />
          {/* base conduit */}
          <path
            d={d}
            fill="none"
            stroke="rgba(0,0,0,0.75)"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* gradient core, draw-in */}
          <path
            d={d}
            fill="none"
            stroke={"url(#" + uid + "-grad)"}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ strokeDasharray: "400", animation: uid + "-draw 900ms ease-out both" }}
          />
          {/* flowing packets */}
          <path
            d={d}
            fill="none"
            stroke="#ecfeff"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: "3 21",
              animation: uid + "-flow 900ms linear infinite",
              opacity: 0.95
            }}
          />
        </svg>
      ) : null}

      {/* waypoint nodes */}
      {pts.map(function (p, i) {
        const isFirst = i === 0;
        const isLast = i === pts.length - 1;
        const color = isLast ? "#fcd34d" : isFirst ? "#22d3ee" : "#e879f9";
        return (
          <div
            key={"wp-" + i}
            className="absolute"
            style={{
              left: Math.max(0, Math.min(1, p.x)) * 100 + "%",
              top: Math.max(0, Math.min(1, p.y)) * 100 + "%",
              width: isFirst || isLast ? "0.7rem" : "0.42rem",
              height: isFirst || isLast ? "0.7rem" : "0.42rem",
              transform: "translate(-50%,-50%)",
              background: isFirst || isLast ? "rgba(0,0,0,0.85)" : color,
              border: "1px solid " + color,
              borderRadius: isLast ? "2px" : "9999px",
              boxShadow: "0 0 10px " + color,
              animation: isLast ? uid + "-bob 1600ms ease-in-out infinite" : "none"
            }}
          />
        );
      })}

      {/* destination ping */}
      {last ? (
        <div
          className="absolute"
          style={{
            left: Math.max(0, Math.min(1, last.x)) * 100 + "%",
            top: Math.max(0, Math.min(1, last.y)) * 100 + "%",
            marginLeft: "-0.6rem",
            marginTop: "-0.6rem",
            width: "1.2rem",
            height: "1.2rem",
            borderRadius: "9999px",
            border: "1px solid rgba(252,211,77,0.8)",
            animation: uid + "-ping 1800ms ease-out infinite"
          }}
        />
      ) : null}

      {/* origin ring */}
      {first ? (
        <div
          className="absolute"
          style={{
            left: Math.max(0, Math.min(1, first.x)) * 100 + "%",
            top: Math.max(0, Math.min(1, first.y)) * 100 + "%",
            marginLeft: "-0.5rem",
            marginTop: "-0.5rem",
            width: "1rem",
            height: "1rem",
            borderRadius: "9999px",
            border: "1px dashed rgba(34,211,238,0.5)"
          }}
        />
      ) : null}

      {/* distance readout */}
      {typeof distance === "number" && isFinite(distance) && pts.length > 0 ? (
        <div
          className="absolute border border-amber-300/50 bg-black/80 shadow-[0_0_14px_rgba(252,211,77,0.35)]"
          style={{ left: "0.25rem", top: "0.25rem", height: "1.1rem", minWidth: "3rem", maxWidth: "60%" }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="h-full w-[3px] bg-gradient-to-b from-amber-300 to-cyan-300" />
            <div className="relative h-full flex-1 min-w-0" style={{ padding: "0 0.3rem" }}>
              <div className="absolute inset-y-[14%] inset-x-0">
                <FitText className="font-mono font-bold uppercase tracking-widest text-amber-300" wrap={false}>
                  {fmt(distance)}
                </FitText>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const RouteOverlay_MIN = {"base":[6,4]};