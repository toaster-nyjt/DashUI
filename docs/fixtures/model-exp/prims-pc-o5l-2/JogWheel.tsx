type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export const JogWheel_MIN = {"base":[4,4]};

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;
  const gRim = uid + "-rim";
  const gFace = uid + "-face";
  const gWell = uid + "-well";
  const gGlow = uid + "-glow";

  const angle = props.value || 0;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const [spin, setSpin] = useState(0);
  const last = useRef(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const angleAt = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = angleAt(e.clientX, e.clientY);
    setDrag(true);
  };

  const onMove = (e: any) => {
    if (!drag) return;
    const a = angleAt(e.clientX, e.clientY);
    let d = a - last.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    setSpin(d);
    if (d !== 0) props.onScrub(d);
  };

  const onUp = (e: any) => {
    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDrag(false);
    setSpin(0);
  };

  const deg = (angle * 180) / Math.PI;
  const ticks = [];
  for (let i = 0; i < 36; i++) {
    const lit = i % 9 === 0;
    ticks.push(
      <rect
        key={"tick-" + i}
        x="49.3"
        y="5"
        width="1.4"
        height={lit ? 7 : 4}
        rx="0.7"
        fill={lit ? "#fbbf24" : "#57534e"}
        opacity={lit ? 0.9 : 0.7}
        transform={"rotate(" + i * 10 + " 50 50)"}
      />
    );
  }

  const floor = JogWheel_MIN.base;
  const strobe = Math.min(1, Math.abs(spin) * 6);

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className={
          "absolute inset-0 h-full w-full touch-none select-none transition-all duration-200 ease-out " +
          (drag ? "cursor-grabbing" : "cursor-grab")
        }
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <defs>
          <radialGradient id={gRim} cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#57534e" />
            <stop offset="55%" stopColor="#292524" />
            <stop offset="100%" stopColor="#0c0a09" />
          </radialGradient>
          <radialGradient id={gFace} cx="40%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="60%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <radialGradient id={gWell} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id={gGlow} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill={"url(#" + gRim + ")"} />
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#78716c"
          strokeOpacity={hover || drag ? 0.6 : 0.35}
          strokeWidth="1.2"
          className="transition-all duration-200 ease-out"
        />
        <circle
          cx="50"
          cy="50"
          r="47"
          fill={"url(#" + gGlow + ")"}
          opacity={drag ? 0.5 + strobe * 0.5 : hover ? 0.28 : 0.1}
          className="transition-all duration-200 ease-out"
        />

        <g
          className="transition-transform duration-150 ease-out"
          style={{ transform: "rotate(" + deg + "deg)", transformOrigin: "50px 50px" }}
        >
          {ticks}
          <circle cx="50" cy="50" r="39" fill={"url(#" + gFace + ")"} stroke="#292524" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="31" fill="none" stroke="#44403c" strokeOpacity="0.7" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="24" fill="none" stroke="#44403c" strokeOpacity="0.5" strokeWidth="0.5" />
          <path
            d="M50 12 L50 38"
            stroke="#fbbf24"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={drag ? 1 : 0.85}
          />
          <circle
            cx="50"
            cy="18"
            r={drag ? 3.4 : 2.6}
            fill="#a3e635"
            opacity={drag ? 1 : 0.75}
            className="transition-all duration-200 ease-out"
          />
        </g>

        <circle cx="50" cy="50" r="14" fill={"url(#" + gWell + ")"} stroke="#292524" strokeWidth="1" />
        <circle
          cx="50"
          cy="50"
          r="6"
          fill="none"
          stroke={drag ? "#a3e635" : "#fbbf24"}
          strokeOpacity={drag ? 0.9 : 0.45}
          strokeWidth="1.2"
          className="transition-all duration-200 ease-out"
        />
        <circle
          cx="50"
          cy="50"
          r="2"
          fill={drag ? "#a3e635" : "#fbbf24"}
          opacity={drag ? 1 : 0.6}
          className="transition-all duration-200 ease-out"
        />
      </svg>
    </div>
  );
}