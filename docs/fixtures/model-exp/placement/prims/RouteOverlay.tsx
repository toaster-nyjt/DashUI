type RouteOverlayProps = { points: { x: number; y: number }[]; animated?: boolean; tone?: "neutral" | "accent" };

export const RouteOverlay_MIN = {"base":[2,2]};

export function RouteOverlay(props: RouteOverlayProps) {
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const pts = Array.isArray(props.points) ? props.points : [];
  const tone = props.tone === "neutral" ? "neutral" : props.tone === "accent" ? "accent" : "accent";
  const animated = !!props.animated;

  const C = tone === "accent"
    ? { main: "#fde047", soft: "rgba(253,224,71,0.85)", halo: "rgba(253,224,71,0.35)", node: "#fde047", spark: "#f0abfc" }
    : { main: "#67e8f9", soft: "rgba(103,232,249,0.8)", halo: "rgba(34,211,238,0.3)", node: "#22d3ee", spark: "#a5f3fc" };

  const clamp = (n: number) => (typeof n === "number" && isFinite(n) ? Math.max(0, Math.min(1, n)) : 0);
  const P = pts.map((p) => ({ x: clamp(p && p.x) * 100, y: clamp(p && p.y) * 100 }));
  const d = P.length ? "M " + P.map((p) => p.x.toFixed(3) + " " + p.y.toFixed(3)).join(" L ") : "";

  const floor = RouteOverlay_MIN.base;

  return (
    <div
      className="h-full w-full pointer-events-none relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-flow{to{stroke-dashoffset:-24}}@keyframes " + uid + "-pulse{0%,100%{opacity:.35}50%{opacity:.85}}@keyframes " + uid + "-run{0%{stroke-dashoffset:220}100%{stroke-dashoffset:0}}@keyframes " + uid + "-node{0%,100%{r:1.6;opacity:.9}50%{r:2.4;opacity:1}}"}</style>
      {P.length > 0 && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {P.length > 1 && (
            <>
              {/* halo */}
              <path
                d={d}
                fill="none"
                stroke={C.halo}
                strokeWidth={7}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ filter: "url(#" + uid + "-glow)", animation: animated ? uid + "-pulse 2.2s ease-in-out infinite" : undefined }}
              />
              {/* base line */}
              <path
                d={d}
                fill="none"
                stroke={C.soft}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={0.55}
                vectorEffect="non-scaling-stroke"
              />
              {/* dashed flow */}
              <path
                d={d}
                fill="none"
                stroke={C.main}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 4"
                vectorEffect="non-scaling-stroke"
                style={{ animation: animated ? uid + "-flow 0.9s linear infinite" : undefined }}
              />
              {/* travelling spark */}
              {animated && (
                <path
                  d={d}
                  fill="none"
                  stroke={C.spark}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 214"
                  vectorEffect="non-scaling-stroke"
                  style={{ animation: uid + "-run 3.4s linear infinite", filter: "url(#" + uid + "-glow)" }}
                />
              )}
            </>
          )}

          {/* waypoint nodes */}
          {P.map((p, i) => {
            const endpoint = i === 0 || i === P.length - 1;
            return (
              <g key={"n-" + i}>
                {endpoint && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={3.4}
                    fill="none"
                    stroke={C.main}
                    strokeWidth={1}
                    strokeOpacity={0.6}
                    vectorEffect="non-scaling-stroke"
                    style={{ animation: animated ? uid + "-pulse 1.8s ease-in-out infinite" : undefined }}
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={endpoint ? 2.1 : 1.4}
                  fill={endpoint ? C.node : "#07070c"}
                  stroke={C.node}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: "url(#" + uid + "-glow)" }}
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}