type JogWheelProps = { angle: number; spinning: boolean; onScrub: (deltaRevolutions: number) => void; onTouchChange?: (touching: boolean) => void };

export const JogWheel_MIN = {"base":[6,6]};

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;
  const ref = useRef<SVGSVGElement | null>(null);
  const last = useRef<number | null>(null);
  const [touching, setTouching] = useState(false);
  const [hover, setHover] = useState(false);

  const deg = props.angle * 360;

  const pointerAngle = (e: any) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    last.current = pointerAngle(e);
    setTouching(true);
    props.onTouchChange && props.onTouchChange(true);
  };
  const move = (e: any) => {
    if (last.current === null) return;
    const a = pointerAngle(e);
    let d = a - last.current;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    last.current = a;
    if (d !== 0) props.onScrub(d / 360);
  };
  const up = (e: any) => {
    if (last.current === null) return;
    last.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setTouching(false);
    props.onTouchChange && props.onTouchChange(false);
  };

  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const major = i % 4 === 0;
    ticks.push(
      <rect
        key={"t-" + i}
        x={49.5}
        y={major ? 5.5 : 6.5}
        width={major ? 1.2 : 0.7}
        height={major ? 5 : 3}
        rx={0.35}
        fill={major ? "#22d3ee" : "#ffffff"}
        opacity={major ? 0.85 : 0.28}
        transform={"rotate(" + (i * 7.5) + " 50 50)"}
      />
    );
  }

  const spokes = [];
  for (let i = 0; i < 12; i++) {
    spokes.push(
      <line
        key={"s-" + i}
        x1={50}
        y1={20}
        x2={50}
        y2={36}
        stroke="#ffffff"
        strokeWidth={0.5}
        opacity={0.12}
        transform={"rotate(" + (i * 30) + " 50 50)"}
      />
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
    >
      <svg
        ref={ref}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing select-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <defs>
          <radialGradient id={uid + "-platter"} cx="50%" cy="38%" r="70%">
            <stop offset="0%" stopColor="#1f2937" />
            <stop offset="42%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id={uid + "-hub"} cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#4b5563" />
            <stop offset="60%" stopColor="#111827" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <linearGradient id={uid + "-mark"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* outer halo */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={touching ? "#e879f9" : "#22d3ee"}
          strokeWidth={touching ? 2.2 : 1.2}
          opacity={touching ? 0.9 : hover ? 0.5 : 0.3}
          filter={"url(#" + uid + "-glow)"}
          style={{ transition: "all 200ms ease-out" }}
        />
        {/* rim */}
        <circle cx="50" cy="50" r="45.5" fill="#0a0a0f" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="0.8" />

        {/* rotating body */}
        <g transform={"rotate(" + deg + " 50 50)"}>
          <g opacity={0.9}>{ticks}</g>
          <circle cx="50" cy="50" r="38" fill={"url(#" + uid + "-platter)"} stroke="#ffffff" strokeOpacity="0.07" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="31" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.5" />
          {spokes}
          {/* position marker */}
          <rect
            x="48.8"
            y="14"
            width="2.4"
            height="22"
            rx="1.2"
            fill={"url(#" + uid + "-mark)"}
            filter={"url(#" + uid + "-glow)"}
          />
          <circle cx="50" cy="16.5" r="2.6" fill="#f5d0fe" opacity="0.95" filter={"url(#" + uid + "-glow)"} />
        </g>

        {/* hub */}
        <circle cx="50" cy="50" r="13" fill={"url(#" + uid + "-hub)"} stroke="#ffffff" strokeOpacity="0.1" strokeWidth="0.7" />
        <circle
          cx="50"
          cy="50"
          r="9"
          fill="none"
          stroke={touching ? "#e879f9" : props.spinning ? "#22d3ee" : "#52525b"}
          strokeWidth="1.1"
          strokeDasharray="4 5"
          opacity={touching ? 1 : props.spinning ? 0.85 : 0.5}
          filter={props.spinning || touching ? "url(#" + uid + "-glow)" : undefined}
          style={{
            transformOrigin: "50px 50px",
            transformBox: "fill-box",
            animation: props.spinning ? "spin 2s linear infinite" : "none",
            transition: "stroke 200ms ease-out, opacity 200ms ease-out",
          }}
        />
        <circle
          cx="50"
          cy="50"
          r="3.2"
          fill={touching ? "#e879f9" : props.spinning ? "#22d3ee" : "#3f3f46"}
          style={{ transition: "fill 200ms ease-out" }}
          filter={touching || props.spinning ? "url(#" + uid + "-glow)" : undefined}
        />

        {/* touch flash ring */}
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="#e879f9"
          strokeWidth="0.9"
          opacity={touching ? 0.55 : 0}
          style={{ transition: "opacity 200ms ease-out" }}
        />
      </svg>
    </div>
  );
}