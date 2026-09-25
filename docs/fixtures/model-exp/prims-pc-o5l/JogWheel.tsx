type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export const JogWheel_MIN = {"base":[5,5]};

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jog-" + Math.random().toString(36).slice(2)).current;
  const gMetal = uid + "-metal";
  const gRing = uid + "-ring";
  const gGloss = uid + "-gloss";
  const gCenter = uid + "-center";

  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [localAngle, setLocalAngle] = useState(0);
  const [spin, setSpin] = useState(0);

  const hostRef = useRef<HTMLDivElement | null>(null);
  const lastAngle = useRef(0);
  const decayRef = useRef<number | null>(null);

  const controlled = typeof props.value === "number";
  const angle = controlled ? (props.value as number) : localAngle;

  useEffect(() => {
    return () => {
      if (decayRef.current !== null) window.clearInterval(decayRef.current);
    };
  }, []);

  const angleAt = (clientX: number, clientY: number) => {
    const el = hostRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const startDecay = () => {
    if (decayRef.current !== null) window.clearInterval(decayRef.current);
    decayRef.current = window.setInterval(() => {
      setSpin((s) => {
        const n = s * 0.9;
        if (Math.abs(n) < 0.0015) {
          if (decayRef.current !== null) {
            window.clearInterval(decayRef.current);
            decayRef.current = null;
          }
          return 0;
        }
        return n;
      });
    }, 60);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (decayRef.current !== null) {
      window.clearInterval(decayRef.current);
      decayRef.current = null;
    }
    setSpin(0);
    lastAngle.current = angleAt(e.clientX, e.clientY);
    setDragging(true);
  };

  const onMove = (e: any) => {
    if (!dragging) return;
    const a = angleAt(e.clientX, e.clientY);
    let d = a - lastAngle.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    lastAngle.current = a;
    if (d === 0) return;
    setSpin(d);
    if (!controlled) setLocalAngle((v) => v + d);
    props.onScrub(d);
  };

  const endDrag = (e: any) => {
    if (!dragging) return;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    startDecay();
  };

  const deg = (angle * 180) / Math.PI;
  const speed = Math.min(1, Math.abs(spin) * 3);
  const floor = JogWheel_MIN.base;

  const marks = [];
  for (let i = 0; i < 48; i++) {
    const major = i % 4 === 0;
    marks.push(
      <rect
        key={"m-" + i}
        x={49.4}
        y={major ? 8 : 10}
        width={major ? 1.2 : 0.7}
        height={major ? 6.5 : 4}
        rx={0.35}
        fill={major ? "#fbbf24" : "#78716c"}
        opacity={major ? 0.85 : 0.55}
        transform={"rotate(" + i * 7.5 + " 50 50)"}
      />
    );
  }

  return (
    <div
      ref={hostRef}
      className="h-full w-full touch-none select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full transition-all duration-200 ease-out"
        style={{ filter: dragging ? "drop-shadow(0 0 6px rgba(245,158,11,0.45))" : "none" }}
      >
        <defs>
          <radialGradient id={gMetal} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="55%" stopColor="#292524" />
            <stop offset="100%" stopColor="#0c0a09" />
          </radialGradient>
          <linearGradient id={gRing} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#57534e" />
            <stop offset="45%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#44403c" />
          </linearGradient>
          <radialGradient id={gCenter} cx="40%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <linearGradient id={gGloss} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fafaf9" stopOpacity="0.14" />
            <stop offset="45%" stopColor="#fafaf9" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="49" fill={"url(#" + gRing + ")"} />
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke="#f59e0b"
          strokeOpacity={dragging ? 0.75 : hover ? 0.4 : 0.2}
          strokeWidth="1.2"
          className="transition-all duration-200 ease-out"
        />

        <circle cx="50" cy="50" r="43.5" fill={"url(#" + gMetal + ")"} />

        <g
          className="transition-transform duration-150 ease-out"
          style={{ transform: "rotate(" + deg + "deg)", transformOrigin: "50px 50px" }}
        >
          {marks}
          <path
            d="M50 12 L53 22 L47 22 Z"
            fill="#a3e635"
            opacity={dragging ? 1 : 0.8}
          />
          <rect x="49.2" y="22" width="1.6" height="17" rx="0.8" fill="#f59e0b" opacity="0.8" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="#57534e" strokeOpacity="0.35" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#57534e" strokeOpacity="0.25" strokeWidth="0.5" />
          <circle cx="50" cy="26" r="1.6" fill="#f59e0b" opacity="0.5" />
          <circle cx="50" cy="74" r="1.6" fill="#a78bfa" opacity="0.4" />
        </g>

        <circle cx="50" cy="50" r="43.5" fill={"url(#" + gGloss + ")"} pointerEvents="none" />

        <circle cx="50" cy="50" r="19" fill={"url(#" + gCenter + ")"} stroke="#57534e" strokeOpacity="0.7" strokeWidth="1" />
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="none"
          stroke="#a3e635"
          strokeWidth="1.4"
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity={0.18 + speed * 0.7}
          className="transition-all duration-100 ease-linear"
          style={{ transform: "rotate(" + deg * 0.6 + "deg)", transformOrigin: "50px 50px" }}
        />
        <circle
          cx="50"
          cy="50"
          r="4.6"
          fill={dragging ? "#fbbf24" : "#292524"}
          stroke="#f59e0b"
          strokeOpacity={dragging ? 0.9 : 0.35}
          strokeWidth="0.9"
          className="transition-all duration-200 ease-out"
        />
        <circle cx="50" cy="50" r="1.5" fill="#0c0a09" opacity="0.8" />
      </svg>
    </div>
  );
}