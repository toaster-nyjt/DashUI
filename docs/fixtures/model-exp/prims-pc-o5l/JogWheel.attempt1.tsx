type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export const JogWheel_MIN = {"base":[4,4]};

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jog-" + Math.random().toString(36).slice(2)).current;
  const angle = props.value ?? 0;
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const last = useRef(0);

  const angleAt = (e: any) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    last.current = angleAt(e);
    setDragging(true);
  };
  const move = (e: any) => {
    if (!dragging) return;
    const a = angleAt(e);
    let d = a - last.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    if (d !== 0) props.onScrub(d);
  };
  const up = (e: any) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const deg = (angle * 180) / Math.PI;
  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * 360;
    const major = i % 4 === 0;
    ticks.push(
      <rect
        key={"tick-" + i}
        x={49.3}
        y={major ? 6 : 8}
        width={major ? 1.4 : 0.8}
        height={major ? 7 : 4}
        rx={0.4}
        fill={major ? "rgb(251 191 36)" : "rgb(120 113 108)"}
        opacity={major ? 0.75 : 0.5}
        transform={"rotate(" + a + " 50 50)"}
      />
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
    >
      <div
        ref={ref}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={
          "relative h-full w-full touch-none select-none transition-all duration-200 ease-out " +
          (dragging ? "cursor-grabbing scale-[0.985]" : "cursor-grab")
        }
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <radialGradient id={uid + "-platter"} cx="38%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#3f3a35" />
              <stop offset="55%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#09090b" />
            </radialGradient>
            <radialGradient id={uid + "-well"} cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#181614" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <linearGradient id={uid + "-glow"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(251 191 36)" />
              <stop offset="100%" stopColor="rgb(163 230 53)" />
            </linearGradient>
          </defs>

          {/* outer ring */}
          <circle cx="50" cy="50" r="48" fill="url(#" + "" />
          <circle cx="50" cy="50" r="48" fill={"url(#" + uid + "-platter)"} />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgb(68 64 60)"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={dragging ? "rgb(163 230 53)" : hover ? "rgb(251 191 36)" : "rgb(120 113 108)"}
            strokeWidth={dragging ? 1.2 : 0.7}
            opacity={dragging ? 0.85 : hover ? 0.55 : 0.3}
            className="transition-all duration-200 ease-out"
          />

          {/* rotating group */}
          <g
            transform={"rotate(" + deg + " 50 50)"}
            style={{ transition: dragging ? "none" : "transform 150ms ease-out" }}
          >
            {ticks}
            <circle
              cx="50"
              cy="50"
              r="33"
              fill="none"
              stroke="rgb(41 37 36)"
              strokeWidth="0.6"
            />
            {/* strobe dots */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle
                key={"dot-" + i}
                cx="50"
                cy="20"
                r="1.1"
                fill="rgb(251 191 36)"
                opacity={0.35 + (i === 0 ? 0.45 : 0)}
                transform={"rotate(" + i * 60 + " 50 50)"}
              />
            ))}
            {/* index marker */}
            <rect
              x="49.1"
              y="17"
              width="1.8"
              height="20"
              rx="0.9"
              fill={"url(#" + uid + "-glow)"}
              opacity={dragging ? 1 : 0.8}
            />
          </g>

          {/* center well */}
          <circle cx="50" cy="50" r="24" fill={"url(#" + uid + "-well)"} />
          <circle
            cx="50"
            cy="50"
            r="24"
            fill="none"
            stroke="rgb(41 37 36)"
            strokeWidth="1.2"
          />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke={dragging ? "rgb(163 230 53)" : "rgb(251 191 36)"}
            strokeWidth="0.8"
            opacity={dragging ? 0.7 : 0.25}
            strokeDasharray="3 5"
            className="transition-all duration-300 ease-out"
            style={{
              transformOrigin: "50% 50%",
              transform: "rotate(" + deg * 0.5 + "deg)",
            }}
          />
          <circle
            cx="50"
            cy="50"
            r="3.4"
            fill={dragging ? "rgb(163 230 53)" : "rgb(120 113 108)"}
            className={"transition-all duration-200 ease-out " + (dragging ? "" : "")}
          />
          <circle
            cx="50"
            cy="50"
            r="6.5"
            fill="none"
            stroke={dragging ? "rgb(163 230 53)" : "rgb(87 83 78)"}
            strokeWidth="0.6"
            opacity="0.7"
          />
        </svg>

        <div
          className={
            "pointer-events-none absolute inset-0 rounded-full transition-all duration-200 ease-out " +
            (dragging
              ? "shadow-lg shadow-lime-400/30"
              : hover
              ? "shadow-lg shadow-amber-500/20"
              : "shadow-none")
          }
        />
      </div>
    </div>
  );
}