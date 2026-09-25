type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;
  const floor = JogWheel_MIN.base;
  const angle = props.value ?? 0;
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [spin, setSpin] = useState(0);
  const areaRef = useRef<HTMLDivElement | null>(null);
  const lastRef = useRef<number | null>(null);

  const angleAt = (e: { clientX: number; clientY: number }) => {
    const el = areaRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastRef.current = angleAt(e);
    setDragging(true);
  };
  const onMove = (e: any) => {
    if (!dragging || lastRef.current === null) return;
    const a = angleAt(e);
    let d = a - lastRef.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    lastRef.current = a;
    if (d !== 0) {
      setSpin(d);
      props.onScrub(d);
    }
  };
  const onUp = (e: any) => {
    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    lastRef.current = null;
    setDragging(false);
    setSpin(0);
  };

  const deg = (angle * 180) / Math.PI;
  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const lit = i % 6 === 0;
    ticks.push(
      <rect
        key={"tick-" + i}
        x={49.4}
        y={5}
        width={1.2}
        height={lit ? 6 : 3.4}
        rx={0.6}
        fill={lit ? "#fbbf24" : "#57534e"}
        opacity={dragging ? 0.95 : 0.7}
        transform={"rotate(" + i * 7.5 + " 50 50)"}
      />
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        ref={areaRef}
        className="relative h-full w-full touch-none select-none cursor-grab active:cursor-grabbing transition-all duration-200 ease-out"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id={uid + "-platter"} cx="38%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#3f3a35" />
              <stop offset="55%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
            <radialGradient id={uid + "-well"} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#121110" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <linearGradient id={uid + "-sheen"} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.16" />
              <stop offset="60%" stopColor="#fbbf24" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={dragging ? 0.45 : hover ? 0.25 : 0.1} />
            </radialGradient>
          </defs>

          <circle cx="50" cy="50" r="49" fill={"url(#" + uid + "-glow)"} />
          <circle
            cx="50"
            cy="50"
            r="46.5"
            fill={"url(#" + uid + "-platter)"}
            stroke="#57534e"
            strokeOpacity="0.8"
            strokeWidth="1.6"
          />
          <circle cx="50" cy="50" r="46.5" fill={"url(#" + uid + "-sheen)"} />

          <g
            className="transition-transform duration-150 ease-out"
            style={{ transform: "rotate(" + deg + "deg)", transformOrigin: "50px 50px" }}
          >
            {ticks}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#78716c"
              strokeOpacity="0.35"
              strokeWidth="0.5"
              strokeDasharray="1.5 3"
            />
            <path
              d="M50 15 L52 24 L48 24 Z"
              fill={dragging ? "#a3e635" : "#fbbf24"}
              className="transition-all duration-200 ease-out"
            />
            <rect x="49.3" y="24" width="1.4" height="14" rx="0.7" fill={dragging ? "#a3e635" : "#f59e0b"} opacity="0.75" />
          </g>

          <circle
            cx="50"
            cy="50"
            r="22"
            fill={"url(#" + uid + "-well)"}
            stroke="#292524"
            strokeWidth="1.2"
          />
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke={dragging ? "#a3e635" : "#f59e0b"}
            strokeOpacity={dragging ? 0.85 : hover ? 0.5 : 0.28}
            strokeWidth={dragging ? 1.6 : 1}
            className="transition-all duration-200 ease-out"
          />
          <circle
            cx="50"
            cy="50"
            r="16"
            fill="none"
            stroke="#a3e635"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="100.5"
            strokeDashoffset={100.5 - Math.min(1, Math.abs(spin) * 6) * 100.5}
            opacity={dragging ? 0.9 : 0}
            transform={"rotate(" + (spin >= 0 ? -90 : 90) + " 50 50)" + (spin < 0 ? " scale(-1,1) translate(-100,0)" : "")}
            className="transition-all duration-100 ease-linear"
          />
          <circle
            cx="50"
            cy="50"
            r="3.4"
            fill={dragging ? "#a3e635" : "#f59e0b"}
            className="transition-all duration-200 ease-out"
          />
          <circle cx="50" cy="50" r="1.2" fill="#0a0a0a" />
        </svg>
      </div>
    </div>
  );
}

export const JogWheel_MIN = {"base":[4,4]};