type JogWheelProps = { angle: number; spinning: boolean; onScrub: (deltaRevolutions: number) => void; onTouchChange?: (touching: boolean) => void };

export const JogWheel_MIN = {"base":[7,7]};

export function JogWheel(props: JogWheelProps) {
  const { angle, spinning, onScrub, onTouchChange } = props;
  const uid = useRef("jog-" + Math.random().toString(36).slice(2)).current;
  const [touching, setTouching] = useState(false);
  const [hover, setHover] = useState(false);
  const last = useRef(0);
  const ref = useRef<SVGSVGElement | null>(null);

  const pointAngle = (e: any) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = pointAngle(e);
    setTouching(true);
    if (onTouchChange) onTouchChange(true);
  };
  const move = (e: any) => {
    if (!touching) return;
    const a = pointAngle(e);
    let d = a - last.current;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    last.current = a;
    onScrub(d / 360);
  };
  const up = (e: any) => {
    if (!touching) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    setTouching(false);
    if (onTouchChange) onTouchChange(false);
  };

  const deg = angle * 360;
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const major = i % 6 === 0;
    ticks.push(
      <rect
        key={"t-" + i}
        x={99.3}
        y={major ? 10 : 12.5}
        width={major ? 1.4 : 0.7}
        height={major ? 8 : 4}
        rx={0.3}
        fill={major ? "#67e8f9" : "#ffffff"}
        opacity={major ? 0.75 : 0.28}
        transform={"rotate(" + (i * 5) + " 100 100)"}
      />
    );
  }
  const grooves = [];
  for (let i = 0; i < 26; i++) {
    grooves.push(
      <circle key={"g-" + i} cx={100} cy={100} r={34 + i * 1.7} fill="none" stroke="#ffffff" strokeWidth={0.35} opacity={0.05 + (i % 2) * 0.035} />
    );
  }
  const spokes = [];
  for (let i = 0; i < 12; i++) {
    spokes.push(
      <line key={"s-" + i} x1={100} y1={100} x2={100} y2={26} stroke="#22d3ee" strokeWidth={i % 3 === 0 ? 0.9 : 0.4} opacity={i % 3 === 0 ? 0.3 : 0.12} transform={"rotate(" + (i * 30) + " 100 100)"} />
    );
  }

  return (
    <div
      className="h-full w-full relative select-none"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
    >
      <svg
        ref={ref}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <defs>
          <radialGradient id={uid + "-plat"} cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="45%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id={uid + "-hub"} cx="42%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="60%" stopColor="#111114" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <linearGradient id={uid + "-rim"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#52525b" />
            <stop offset="40%" stopColor="#1c1c20" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.20" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* outer glow ring */}
        <circle
          cx={100} cy={100} r={96}
          fill="none"
          stroke={touching ? "#e879f9" : "#22d3ee"}
          strokeWidth={touching ? 3 : 1.6}
          opacity={touching ? 0.85 : hover ? 0.5 : 0.3}
          filter={"url(#" + uid + "-glow)"}
          style={{ transition: "all 200ms ease-out" }}
        />
        {/* rim */}
        <circle cx={100} cy={100} r={93} fill={"url(#" + uid + "-rim)"} />
        <circle cx={100} cy={100} r={86} fill="#0a0a0c" />
        <circle cx={100} cy={100} r={86} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} />

        {/* fixed index marker at top */}
        <path d="M100 4 L104.5 13 L95.5 13 Z" fill={touching ? "#e879f9" : "#22d3ee"} opacity={0.9} style={{ transition: "fill 200ms ease-out" }} />

        {/* rotating platter */}
        <g
          style={{
            transform: "rotate(" + deg + "deg)",
            transformOrigin: "100px 100px",
            transition: touching ? "none" : "transform 120ms linear"
          }}
        >
          <circle cx={100} cy={100} r={84} fill={"url(#" + uid + "-plat)"} />
          <g>{grooves}</g>
          <g>{spokes}</g>
          <g>{ticks}</g>
          {/* strobe dots ring */}
          {Array.from({ length: 36 }).map((_, i) => (
            <circle
              key={"d-" + i}
              cx={100}
              cy={24}
              r={1.1}
              fill={spinning ? "#a78bfa" : "#3f3f46"}
              opacity={spinning ? 0.8 : 0.4}
              transform={"rotate(" + (i * 10) + " 100 100)"}
              style={{ transition: "fill 200ms ease-out" }}
            />
          ))}
          {/* position stripe */}
          <rect x={98.6} y={20} width={2.8} height={62} rx={1.4} fill={touching ? "#e879f9" : "#22d3ee"} opacity={0.9} filter={"url(#" + uid + "-glow)"} style={{ transition: "fill 200ms ease-out" }} />
          <circle cx={100} cy={100} r={30} fill={"url(#" + uid + "-hub)"} stroke="#ffffff" strokeOpacity={0.1} />
          <circle cx={100} cy={100} r={22} fill="none" stroke="#ffffff" strokeOpacity={0.06} strokeWidth={0.6} />
        </g>

        {/* spinning halo */}
        <g style={{ transformOrigin: "100px 100px", animation: spinning ? "spin 2s linear infinite" : "none" }}>
          <circle cx={100} cy={100} r={78} fill="none" stroke="#a78bfa" strokeOpacity={spinning ? 0.5 : 0} strokeWidth={1.4} strokeDasharray="30 460" strokeLinecap="round" filter={"url(#" + uid + "-glow)"} />
        </g>

        {/* static hub cap + sheen */}
        <circle cx={100} cy={100} r={13} fill="#0b0b0f" stroke={touching ? "#e879f9" : "#52525b"} strokeOpacity={0.8} strokeWidth={1} style={{ transition: "stroke 200ms ease-out" }} />
        <circle
          cx={100} cy={100} r={6}
          fill={touching ? "#e879f9" : spinning ? "#22d3ee" : "#27272a"}
          opacity={touching ? 1 : spinning ? 0.9 : 0.8}
          filter={"url(#" + uid + "-glow)"}
          style={{ transition: "fill 200ms ease-out" }}
        />
        <ellipse cx={100} cy={64} rx={78} ry={52} fill={"url(#" + uid + "-sheen)"} pointerEvents="none" />
        <circle cx={100} cy={100} r={93} fill="none" stroke="#000" strokeOpacity={0.6} strokeWidth={2} pointerEvents="none" />
      </svg>
    </div>
  );
}