type MapRouteProps = { points: { x: number; y: number }[]; animated?: boolean };

export const MapRoute_MIN = {"base":[2,2]};

export function MapRoute(props: MapRouteProps) {
  const uid = useRef("maproute-" + Math.random().toString(36).slice(2)).current;
  const pts = props.points || [];
  const animated = !!props.animated;

  const d = useMemo(() => {
    if (pts.length < 2) return "";
    return pts
      .map((p, i) => (i === 0 ? "M " : "L ") + (p.x * 100).toFixed(3) + " " + (p.y * 100).toFixed(3))
      .join(" ");
  }, [pts]);

  const floor = MapRoute_MIN.base;

  return (
    <div
      className="h-full w-full pointer-events-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {d ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: "absolute", overflow: "visible" }}
        >
          <defs>
            <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <path id={uid + "-path"} d={d} />
          </defs>

          {/* outer halo */}
          <path
            d={d}
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.18"
            strokeWidth="9"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            filter={"url(#" + uid + "-glow)"}
          />
          {/* dark casing */}
          <path
            d={d}
            fill="none"
            stroke="#07070c"
            strokeOpacity="0.85"
            strokeWidth="5.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* core line */}
          <path
            d={d}
            fill="none"
            stroke={"url(#" + uid + "-grad)"}
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* dashed energy overlay */}
          <path
            d={d}
            fill="none"
            stroke="#fde047"
            strokeOpacity={animated ? 0.95 : 0.35}
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="6 10"
            vectorEffect="non-scaling-stroke"
          >
            {animated ? (
              <animate
                attributeName="stroke-dashoffset"
                from="16"
                to="0"
                dur="0.9s"
                repeatCount="indefinite"
              />
            ) : null}
          </path>

          {/* node pips */}
          {pts.map((p, i) => (
            <circle
              key={"pip-" + i}
              cx={p.x * 100}
              cy={p.y * 100}
              r="1"
              fill="#0a0a0f"
              stroke={i === 0 ? "#22d3ee" : i === pts.length - 1 ? "#fde047" : "#e879f9"}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* traveling pulse */}
          {animated ? (
            <g filter={"url(#" + uid + "-glow)"}>
              <circle r="2" fill="#fde047">
                <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto">
                  <mpath href={"#" + uid + "-path"} />
                </animateMotion>
                <animate
                  attributeName="r"
                  values="1.4;2.6;1.4"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ) : null}
        </svg>
      ) : null}
    </div>
  );
}