type BodyDiagramProps = { regions: { id: string; label: string; x: number; y: number }[]; children?: any };

export const BodyDiagram_MIN = {"base":[13,15]};

export function BodyDiagram(props: BodyDiagramProps) {
  const uid = useRef("bodydiagram-" + Math.random().toString(36).slice(2)).current;
  const floor = BodyDiagram_MIN.base;
  const regions = props.regions || [];

  const raw = props.children;
  const kids: any[] = (Array.isArray(raw) ? raw : raw == null || raw === false ? [] : [raw]).flat
    ? (Array.isArray(raw) ? raw : raw == null || raw === false ? [] : [raw]).flat(3).filter(Boolean)
    : [];

  const SW = 30;
  const SH = 13;

  return (
    <div className="relative h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={uid + "-body"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.30" />
            <stop offset="55%" stopColor="#a21caf" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0" />
            <stop offset="50%" stopColor="#fde047" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={uid + "-aura"} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <pattern id={uid + "-grid"} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0 L0 0 L0 6" fill="none" stroke="#22d3ee" strokeOpacity="0.09" strokeWidth="0.3" />
          </pattern>
          <clipPath id={uid + "-clipbody"}>
            <path d="M43 20 L57 20 L62 30 L64 46 L60 62 L40 62 L36 46 L38 30 Z" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-grid)"} />
        <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-aura)"} />

        <g opacity={regions.length ? 1 : 0.35} style={{ transition: "opacity 300ms ease-out" }}>
          {/* silhouette fills */}
          <g fill={"url(#" + uid + "-body)"} stroke="#22d3ee" strokeOpacity="0.55" strokeWidth="0.7">
            <circle cx="50" cy="12" r="7" />
            <path d="M46 18 L54 18 L54 21 L46 21 Z" />
            <path d="M43 20 L57 20 L62 30 L64 46 L60 62 L40 62 L36 46 L38 30 Z" />
            <path d="M38 22 L33 30 L29 48 L27 62 L31 63 L34 49 L39 33 Z" />
            <path d="M62 22 L67 30 L71 48 L73 62 L69 63 L66 49 L61 33 Z" />
            <path d="M41 62 L39 80 L38 95 L43 95 L45 80 L48 64 Z" />
            <path d="M59 62 L61 80 L62 95 L57 95 L55 80 L52 64 Z" />
          </g>

          {/* circuitry inside torso */}
          <g clipPath={"url(#" + uid + "-clipbody)"} stroke="#e879f9" strokeOpacity="0.45" strokeWidth="0.45" fill="none">
            <path d="M50 20 L50 60 M40 30 L50 36 L60 30 M42 46 L50 46 L58 42 M44 54 L50 50 L58 54" />
            <circle cx="50" cy="38" r="3" stroke="#fde047" strokeOpacity="0.6">
              <animate attributeName="r" values="2.4;3.6;2.4" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* core pulse */}
          <circle cx="50" cy="38" r="1.1" fill="#fde047" filter={"url(#" + uid + "-glow)"}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
          </circle>

          {/* scan sweep */}
          <g clipPath={"url(#" + uid + "-clipbody)"}>
            <rect x="0" y="0" width="100" height="1.6" fill={"url(#" + uid + "-scan)"}>
              <animate attributeName="y" values="18;62;18" dur="5s" repeatCount="indefinite" />
            </rect>
          </g>
        </g>

        {/* region anchors + connectors */}
        {regions.map(function (r, i) {
          const x = Math.max(0, Math.min(100, r.x));
          const y = Math.max(0, Math.min(100, r.y));
          const side = x < 50 ? 1 : -1;
          return (
            <g key={"anchor-" + r.id + "-" + i}>
              <line
                x1="50"
                y1={y}
                x2={x + side * 2}
                y2={y}
                stroke="#22d3ee"
                strokeOpacity="0.35"
                strokeWidth="0.4"
                strokeDasharray="1.5 1.5"
              >
                <animate attributeName="stroke-dashoffset" values="0;-6" dur="1.6s" repeatCount="indefinite" />
              </line>
              <circle cx={x} cy={y} r="1.6" fill="none" stroke="#fde047" strokeOpacity="0.7" strokeWidth="0.4" filter={"url(#" + uid + "-glow)"}>
                <animate
                  attributeName="r"
                  values="1.4;3.2;1.4"
                  dur="2.8s"
                  begin={(i * 0.25) + "s"}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.75;0.05;0.75"
                  dur="2.8s"
                  begin={(i * 0.25) + "s"}
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx={x} cy={y} r="0.7" fill="#fde047" fillOpacity="0.9" />
            </g>
          );
        })}

        {/* held slot layer — children share diagram coordinates */}
        {kids.map(function (child, i) {
          const r = regions[i];
          if (!r) return null;
          const cx = Math.max(SW / 2, Math.min(100 - SW / 2, r.x));
          const cy = Math.max(SH / 2, Math.min(100 - SH / 2, r.y));
          return (
            <foreignObject
              key={"slot-" + r.id + "-" + i}
              x={cx - SW / 2}
              y={cy - SH / 2}
              width={SW}
              height={SH}
            >
              <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
                {child}
              </div>
            </foreignObject>
          );
        })}
      </svg>
    </div>
  );
}