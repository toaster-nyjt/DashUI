type RouteOverlayProps = { points: { x: number; y: number }[]; animated?: boolean; tone?: "neutral" | "accent" };

export const RouteOverlay_MIN = {"base":[4,4]};

export function RouteOverlay(props: RouteOverlayProps) {
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const pts = Array.isArray(props.points) ? props.points : [];
  const tone = props.tone || "neutral";
  const animated = !!props.animated;

  const accent = tone === "accent" ? "#fde047" : "#22d3ee";
  const accent2 = tone === "accent" ? "#f0abfc" : "#67e8f9";
  const glowRGBA = tone === "accent" ? "rgba(253,224,71,0.55)" : "rgba(34,211,238,0.5)";

  const d = useMemo(() => {
    if (pts.length === 0) return "";
    const c = (p: { x: number; y: number }) =>
      Math.max(0, Math.min(1, p.x)) * 100 + "," + Math.max(0, Math.min(1, p.y)) * 100;
    return "M " + pts.map((p, i) => (i === 0 ? c(p) : "L " + c(p))).join(" ");
  }, [pts]);

  if (pts.length === 0) return <div className="h-full w-full pointer-events-none" style={{ minWidth: RouteOverlay_MIN.base[0] + "rem", minHeight: RouteOverlay_MIN.base[1] + "rem" }} />;

  return (
    <div
      className="h-full w-full pointer-events-none relative"
      style={{ minWidth: RouteOverlay_MIN.base[0] + "rem", minHeight: RouteOverlay_MIN.base[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-dash{to{stroke-dashoffset:-40}}" +
        "@keyframes " + uid + "-pulse{0%,100%{opacity:.45}50%{opacity:1}}" +
        "@keyframes " + uid + "-node{0%,100%{r:1.6;opacity:.8}50%{r:2.4;opacity:1}}"
      }</style>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor={accent2} />
          </linearGradient>
          <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="b" />
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
          stroke={glowRGBA}
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          filter={"url(#" + uid + "-glow)"}
          style={animated ? { animation: uid + "-pulse 2.2s ease-in-out infinite" } : undefined}
        />
        {/* dark casing */}
        <path
          d={d}
          fill="none"
          stroke="rgba(3,4,10,0.85)"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* core line */}
        <path
          d={d}
          fill="none"
          stroke={"url(#" + uid + "-grad)"}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity={tone === "accent" ? 1 : 0.85}
        />
        {/* travel dashes */}
        {animated ? (
          <path
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.9}
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="6 14"
            style={{ animation: uid + "-dash 1.4s linear infinite" }}
          />
        ) : (
          <path
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeOpacity={0.25}
            strokeWidth={0.8}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="3 9"
          />
        )}

        {/* waypoint nodes */}
        {pts.map((p, i) => {
          const cx = Math.max(0, Math.min(1, p.x)) * 100;
          const cy = Math.max(0, Math.min(1, p.y)) * 100;
          const edge = i === 0 || i === pts.length - 1;
          return (
            <g key={"n-" + i}>
              <circle cx={cx} cy={cy} r={edge ? 2.6 : 1.6} fill="rgba(3,4,10,0.9)" stroke={accent} strokeWidth={1} vectorEffect="non-scaling-stroke" />
              {edge ? (
                <circle
                  cx={cx}
                  cy={cy}
                  r={1.2}
                  fill={accent}
                  filter={"url(#" + uid + "-glow)"}
                  style={animated ? { animation: uid + "-pulse 1.6s ease-in-out infinite" } : undefined}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}