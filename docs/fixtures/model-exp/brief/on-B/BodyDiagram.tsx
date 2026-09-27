type BodyDiagramProps = { children?: any; points?: { id: string; x: number; y: number }[] };

export const BodyDiagram_MIN = {"base":[9,13]};

export function BodyDiagram(props: BodyDiagramProps) {
  const uid = useRef("bodydiagram-" + Math.random().toString(36).slice(2)).current;
  const pts = props.points || [];
  const floor = BodyDiagram_MIN.base;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* grid well */}
      <div className="absolute inset-0 rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]" />

      {/* silhouette */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 160"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={uid + "-body"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.30)" />
            <stop offset="55%" stopColor="rgba(217,70,239,0.16)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.10)" />
          </linearGradient>
          <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(253,224,71,0)" />
            <stop offset="50%" stopColor="rgba(253,224,71,0.55)" />
            <stop offset="100%" stopColor="rgba(253,224,71,0)" />
          </linearGradient>
          <pattern id={uid + "-grid"} width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M6 0 L0 0 L0 6" fill="none" stroke="rgba(34,211,238,0.22)" strokeWidth="0.4" />
          </pattern>
          <clipPath id={uid + "-clip"}>
            <path d="M50 4 c-6 0 -10 4.5 -10 10.5 0 4 1.6 7 3.6 8.8 -7 1.8 -12.6 4.6 -15.4 7.6 -3.2 3.4 -4.4 9 -5.4 17 -0.8 6.4 -1.6 12.4 -3.2 18.2 -0.9 3.3 2.1 5.4 4.4 3.6 2.2 -1.8 3.4 -5.4 4.6 -10.4 l1.2 -5 0.4 18 c0.1 5 -0.4 9 -1.2 14.6 l-1.4 9.6 c-0.8 5.6 -0.4 8.6 0.4 14.4 l2 14.6 c0.6 4.4 0.6 8.6 0.2 13.4 l-0.7 8.2 c-0.3 3.4 1.4 5.2 4.6 5.2 3.2 0 4.8 -1.6 5.2 -5.2 l1 -9.6 c0.5 -4.6 1 -8 1.8 -12.6 l2.5 -14.4 c0.3 -1.7 0.5 -2.8 1.4 -2.8 0.9 0 1.1 1.1 1.4 2.8 l2.5 14.4 c0.8 4.6 1.3 8 1.8 12.6 l1 9.6 c0.4 3.6 2 5.2 5.2 5.2 3.2 0 4.9 -1.8 4.6 -5.2 l-0.7 -8.2 c-0.4 -4.8 -0.4 -9 0.2 -13.4 l2 -14.6 c0.8 -5.8 1.2 -8.8 0.4 -14.4 l-1.4 -9.6 c-0.8 -5.6 -1.3 -9.6 -1.2 -14.6 l0.4 -18 1.2 5 c1.2 5 2.4 8.6 4.6 10.4 2.3 1.8 5.3 -0.3 4.4 -3.6 -1.6 -5.8 -2.4 -11.8 -3.2 -18.2 -1 -8 -2.2 -13.6 -5.4 -17 -2.8 -3 -8.4 -5.8 -15.4 -7.6 2 -1.8 3.6 -4.8 3.6 -8.8 0 -6 -4 -10.5 -10 -10.5 z" />
          </clipPath>
        </defs>

        <g clipPath={"url(#" + uid + "-clip)"}>
          <rect x="0" y="0" width="100" height="160" fill={"url(#" + uid + "-body)"} />
          <rect x="0" y="0" width="100" height="160" fill={"url(#" + uid + "-grid)"} />
          <rect x="0" y="-40" width="100" height="40" fill={"url(#" + uid + "-scan)"}>
            <animate attributeName="y" values="-40;160" dur="4.5s" repeatCount="indefinite" />
          </rect>
        </g>

        <use
          href={"#" + uid + "-none"}
        />
        <path
          d="M50 4 c-6 0 -10 4.5 -10 10.5 0 4 1.6 7 3.6 8.8 -7 1.8 -12.6 4.6 -15.4 7.6 -3.2 3.4 -4.4 9 -5.4 17 -0.8 6.4 -1.6 12.4 -3.2 18.2 -0.9 3.3 2.1 5.4 4.4 3.6 2.2 -1.8 3.4 -5.4 4.6 -10.4 l1.2 -5 0.4 18 c0.1 5 -0.4 9 -1.2 14.6 l-1.4 9.6 c-0.8 5.6 -0.4 8.6 0.4 14.4 l2 14.6 c0.6 4.4 0.6 8.6 0.2 13.4 l-0.7 8.2 c-0.3 3.4 1.4 5.2 4.6 5.2 3.2 0 4.8 -1.6 5.2 -5.2 l1 -9.6 c0.5 -4.6 1 -8 1.8 -12.6 l2.5 -14.4 c0.3 -1.7 0.5 -2.8 1.4 -2.8 0.9 0 1.1 1.1 1.4 2.8 l2.5 14.4 c0.8 4.6 1.3 8 1.8 12.6 l1 9.6 c0.4 3.6 2 5.2 5.2 5.2 3.2 0 4.9 -1.8 4.6 -5.2 l-0.7 -8.2 c-0.4 -4.8 -0.4 -9 0.2 -13.4 l2 -14.6 c0.8 -5.8 1.2 -8.8 0.4 -14.4 l-1.4 -9.6 c-0.8 -5.6 -1.3 -9.6 -1.2 -14.6 l0.4 -18 1.2 5 c1.2 5 2.4 8.6 4.6 10.4 2.3 1.8 5.3 -0.3 4.4 -3.6 -1.6 -5.8 -2.4 -11.8 -3.2 -18.2 -1 -8 -2.2 -13.6 -5.4 -17 -2.8 -3 -8.4 -5.8 -15.4 -7.6 2 -1.8 3.6 -4.8 3.6 -8.8 0 -6 -4 -10.5 -10 -10.5 z"
          fill="none"
          stroke="rgba(34,211,238,0.75)"
          strokeWidth="0.8"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
        />
        {/* spine / axis telemetry */}
        <line x1="50" y1="28" x2="50" y2="96" stroke="rgba(217,70,239,0.35)" strokeWidth="0.4" strokeDasharray="2 3" />
      </svg>

      {/* node markers */}
      {pts.length > 0 && (
        <div className="absolute inset-0">
          {pts.map((p, i) => (
            <div
              key={"pt-" + p.id}
              className="absolute"
              style={{
                left: Math.max(0, Math.min(1, p.x)) * 100 + "%",
                top: Math.max(0, Math.min(1, p.y)) * 100 + "%",
                transform: "translate(-50%,-50%)",
              }}
            >
              <div className="relative h-2 w-2">
                <div className="absolute inset-0 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
                <div
                  className="absolute -inset-1.5 rounded-full border border-cyan-400/50 animate-ping"
                  style={{ animationDuration: "2.4s", animationDelay: (i * 0.25) + "s" }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* held slots */}
      <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
        {props.children}
      </div>
    </div>
  );
}