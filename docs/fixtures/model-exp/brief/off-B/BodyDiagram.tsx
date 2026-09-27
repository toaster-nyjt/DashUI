type BodyDiagramProps = { children?: any; points?: { id: string; x: number; y: number }[] };

export const BodyDiagram_MIN = {"base":[10,14]};

export function BodyDiagram(props: BodyDiagramProps) {
  const uid = useRef("bodydiagram-" + Math.random().toString(36).slice(2)).current;
  const pts = props.points || [];
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const loop = (ts: number) => {
      if (!start) start = ts;
      setT(((ts - start) / 3200) % 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const SILHOUETTE =
    "M50 4 C56 4 60 9 60 15 C60 19.5 58.2 22.6 55.6 24.4 L55.6 27.5 " +
    "C64 29 72 32 76 36 C80 40 82 48 83 58 L85 74 C85.6 78 82 80 80.4 76.4 L77 66 " +
    "L76 86 C76 94 74.6 101 74 110 L72.6 140 C72.4 145 73 152 73.6 160 L74.4 176 " +
    "C74.8 181 68 182 67.2 177 L64 158 L60 132 L56 132 L52 158 L48.8 177 " +
    "C48 182 41.2 181 41.6 176 L42.4 160 C43 152 43.6 145 43.4 140 L42 110 " +
    "C41.4 101 40 94 40 86 L39 66 L35.6 76.4 C34 80 30.4 78 31 74 L33 58 " +
    "C34 48 36 40 40 36 C44 32 52 29 60.4 27.5 L60.4 24.4 Z";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: BodyDiagram_MIN.base[0] + "rem", minHeight: BodyDiagram_MIN.base[1] + "rem" }}
    >
      {/* grid + silhouette layer */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 190"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={uid + "-body"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.30)" />
            <stop offset="55%" stopColor="rgba(34,211,238,0.10)" />
            <stop offset="100%" stopColor="rgba(217,70,239,0.18)" />
          </linearGradient>
          <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(253,224,71,0)" />
            <stop offset="45%" stopColor="rgba(253,224,71,0.85)" />
            <stop offset="55%" stopColor="rgba(34,211,238,0.85)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
          <pattern id={uid + "-grid"} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0 L0 0 L0 6" fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="0.3" />
          </pattern>
          <clipPath id={uid + "-clip"}>
            <path d={SILHOUETTE} />
          </clipPath>
          <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* faint backdrop grid */}
        <rect x="0" y="0" width="100" height="190" fill={"url(#" + uid + "-grid)"} opacity="0.35" />

        {/* body fill */}
        <path d={SILHOUETTE} fill={"url(#" + uid + "-body)"} />
        {/* inner grid clipped to body */}
        <g clipPath={"url(#" + uid + "-clip)"}>
          <rect x="0" y="0" width="100" height="190" fill={"url(#" + uid + "-grid)"} opacity="0.9" />
          {/* contour lines */}
          {[36, 52, 70, 90, 110, 132, 152].map((y, i) => (
            <line
              key={"c-" + i}
              x1="0"
              x2="100"
              y1={y}
              y2={y}
              stroke="rgba(34,211,238,0.22)"
              strokeWidth="0.4"
            />
          ))}
          <line x1="50" x2="50" y1="0" y2="190" stroke="rgba(217,70,239,0.3)" strokeWidth="0.4" />
          {/* travelling scan band */}
          <rect
            x="0"
            width="100"
            height="26"
            y={-26 + t * 216}
            fill={"url(#" + uid + "-scan)"}
            opacity="0.35"
          />
        </g>

        {/* body outline */}
        <path
          d={SILHOUETTE}
          fill="none"
          stroke="rgba(34,211,238,0.85)"
          strokeWidth="0.9"
          strokeLinejoin="round"
          filter={"url(#" + uid + "-glow)"}
        />
        {/* spine / neural highlight */}
        <path
          d="M50 26 L50 110"
          fill="none"
          stroke="rgba(253,224,71,0.55)"
          strokeWidth="0.6"
          strokeDasharray="3 3"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="1.2s" repeatCount="indefinite" />
        </path>
      </svg>

      {/* connector + node layer for points */}
      {pts.length > 0 && (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {pts.map((p, i) => {
            const x = Math.max(0, Math.min(1, p.x)) * 100;
            const y = Math.max(0, Math.min(1, p.y)) * 100;
            const mx = x < 50 ? x + (50 - x) * 0.55 : x - (x - 50) * 0.55;
            return (
              <g key={"ln-" + p.id + "-" + i}>
                <path
                  d={"M" + x + " " + y + " L" + mx + " " + y + " L50 " + y}
                  fill="none"
                  stroke="rgba(34,211,238,0.45)"
                  strokeWidth="0.4"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="2 2"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="8"
                    to="0"
                    dur="1.6s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            );
          })}
        </svg>
      )}

      {/* node markers (aspect-true, drawn as absolutely positioned dots) */}
      {pts.map((p, i) => (
        <div
          key={"nd-" + p.id + "-" + i}
          className="absolute"
          style={{
            left: Math.max(0, Math.min(1, p.x)) * 100 + "%",
            top: Math.max(0, Math.min(1, p.y)) * 100 + "%",
            transform: "translate(-50%,-50%)",
          }}
        >
          <span className="block h-1.5 w-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.9)] animate-pulse" />
        </div>
      ))}

      {/* held children layer */}
      <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
        {props.children}
      </div>
    </div>
  );
}