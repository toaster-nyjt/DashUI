type BodyDiagramProps = { children?: any; points?: { id: string; x: number; y: number }[] };

export function BodyDiagram(props: BodyDiagramProps) {
  const uid = useRef("bodydiagram-" + Math.random().toString(36).slice(2)).current;
  const floor = BodyDiagram_MIN.base;
  const pts = props.points || [];

  const BodyDiagramFigure = (
    <svg
      viewBox="0 0 100 160"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id={uid + "-body"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
          <stop offset="55%" stopColor="rgba(34,211,238,0.08)" />
          <stop offset="100%" stopColor="rgba(217,70,239,0.14)" />
        </linearGradient>
        <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(253,224,71,0)" />
          <stop offset="50%" stopColor="rgba(253,224,71,0.55)" />
          <stop offset="100%" stopColor="rgba(253,224,71,0)" />
        </linearGradient>
        <clipPath id={uid + "-clip"}>
          <path d="M50 4c5.2 0 8.6 3.9 8.6 9.2 0 3.6-1 6.3-2.6 8.3 4.3 1.3 8.7 2.6 12.6 4.3 4.6 2 6.6 4.3 7.6 8.6l4.6 20.2c.7 3.1-.9 5.4-3.5 6-2.5.6-4.6-.8-5.4-3.9l-3.6-13.6-1.3 20.4 3 21.4c.4 2.8-.9 4.3-3.6 4.6l1.9 25.9 1.9 27.6c.2 3.4-1.7 5.4-5 5.4-3 0-4.7-1.6-5.2-4.8l-4.5-29.9h-2.6l-4.5 29.9c-.5 3.2-2.2 4.8-5.2 4.8-3.3 0-5.2-2-5-5.4l1.9-27.6 1.9-25.9c-2.7-.3-4-1.8-3.6-4.6l3-21.4-1.3-20.4-3.6 13.6c-.8 3.1-2.9 4.5-5.4 3.9-2.6-.6-4.2-2.9-3.5-6l4.6-20.2c1-4.3 3-6.6 7.6-8.6 3.9-1.7 8.3-3 12.6-4.3-1.6-2-2.6-4.7-2.6-8.3C41.4 7.9 44.8 4 50 4z" />
        </clipPath>
      </defs>

      <g clipPath={"url(#" + uid + "-clip)"}>
        <rect x="0" y="0" width="100" height="160" fill={"url(#" + uid + "-body)"} />
        {Array.from({ length: 27 }).map((_, i) => (
          <rect
            key={"hl-" + i}
            x="0"
            y={i * 6 + 1}
            width="100"
            height="1"
            fill="rgba(34,211,238,0.13)"
          />
        ))}
        <rect x="0" y="-40" width="100" height="40" fill={"url(#" + uid + "-scan)"}>
          <animate attributeName="y" from="-40" to="160" dur="4.5s" repeatCount="indefinite" />
        </rect>
        <path
          d="M50 22 L50 96 M50 34 L30 44 M50 34 L70 44 M50 96 L40 128 M50 96 L60 128"
          stroke="rgba(34,211,238,0.35)"
          strokeWidth="0.8"
          fill="none"
        />
      </g>

      <path
        d="M50 4c5.2 0 8.6 3.9 8.6 9.2 0 3.6-1 6.3-2.6 8.3 4.3 1.3 8.7 2.6 12.6 4.3 4.6 2 6.6 4.3 7.6 8.6l4.6 20.2c.7 3.1-.9 5.4-3.5 6-2.5.6-4.6-.8-5.4-3.9l-3.6-13.6-1.3 20.4 3 21.4c.4 2.8-.9 4.3-3.6 4.6l1.9 25.9 1.9 27.6c.2 3.4-1.7 5.4-5 5.4-3 0-4.7-1.6-5.2-4.8l-4.5-29.9h-2.6l-4.5 29.9c-.5 3.2-2.2 4.8-5.2 4.8-3.3 0-5.2-2-5-5.4l1.9-27.6 1.9-25.9c-2.7-.3-4-1.8-3.6-4.6l3-21.4-1.3-20.4-3.6 13.6c-.8 3.1-2.9 4.5-5.4 3.9-2.6-.6-4.2-2.9-3.5-6l4.6-20.2c1-4.3 3-6.6 7.6-8.6 3.9-1.7 8.3-3 12.6-4.3-1.6-2-2.6-4.7-2.6-8.3C41.4 7.9 44.8 4 50 4z"
        fill="none"
        stroke="rgba(34,211,238,0.55)"
        strokeWidth="1"
        className="drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
      />
    </svg>
  );

  return (
    <div className="relative h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      {/* grid backdrop */}
      <div className="absolute inset-0 rounded-md bg-black/40 border border-cyan-400/15 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(34,211,238,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,211,238,0.10) 1px, transparent 1px)",
            backgroundSize: "12.5% 12.5%",
          }}
        />
        {BodyDiagramFigure}
      </div>

      {/* point markers */}
      {pts.map((p) => {
        const cx = Math.min(1, Math.max(0, p.x)) * 100;
        const cy = Math.min(1, Math.max(0, p.y)) * 100;
        return (
          <div
            key={p.id}
            className="absolute"
            style={{ left: cx + "%", top: cy + "%", transform: "translate(-50%,-50%)" }}
          >
            <div className="relative h-3 w-3">
              <span className="absolute inset-0 rounded-full border border-fuchsia-400/60 animate-ping" />
              <span className="absolute inset-[25%] rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            </div>
          </div>
        );
      })}

      {/* held slots */}
      <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
        {props.children}
      </div>
    </div>
  );
}

export const BodyDiagram_MIN = {"base":[10,13]};