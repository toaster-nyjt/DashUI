type JogWheelProps = { onScrub: (delta: number) => void; playing: boolean };

export function JogWheel(props: JogWheelProps) {
  const { onScrub, playing } = props;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastAngleRef = useRef<number>(0);
  const spinRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);

  const [spin, setSpin] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false);
  const [scrubDir, setScrubDir] = useState<number>(0);
  const [hovered, setHovered] = useState<boolean>(false);
  const [pressGlow, setPressGlow] = useState<number>(0);

  const scrubTimeoutRef = useRef<number | null>(null);

  // Continuous auto-spin loop when playing (and not being scratched)
  useEffect(() => {
    const step = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = Math.min(64, ts - last);
      lastTsRef.current = ts;

      if (playing && !dragging) {
        // ~ 33.3 rpm platter feel -> 0.72 rev/s -> deg/ms
        const degPerMs = 360 * 0.4 / 1000;
        spinRef.current = (spinRef.current + degPerMs * dt) % 360;
        setSpin(spinRef.current);
      } else if (!dragging) {
        // inertial decay of any residual velocity
        if (Math.abs(velocityRef.current) > 0.001) {
          spinRef.current = (spinRef.current + velocityRef.current * dt) % 360;
          velocityRef.current *= Math.pow(0.9, dt / 16);
          setSpin(spinRef.current);
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [playing, dragging]);

  const angleFromEvent = (e: React.PointerEvent | PointerEvent) => {
    const c = centerRef.current;
    const dx = (e as PointerEvent).clientX - c.x;
    const dy = (e as PointerEvent).clientY - c.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  const clearScrubDir = () => {
    if (scrubTimeoutRef.current != null) window.clearTimeout(scrubTimeoutRef.current);
    scrubTimeoutRef.current = window.setTimeout(() => setScrubDir(0), 140);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    centerRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    lastAngleRef.current = angleFromEvent(e);
    velocityRef.current = 0;
    setDragging(true);
    setPressGlow(1);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const a = angleFromEvent(e);
    let delta = a - lastAngleRef.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngleRef.current = a;

    if (delta !== 0) {
      spinRef.current = (spinRef.current + delta) % 360;
      setSpin(spinRef.current);
      velocityRef.current = delta / 16;
      onScrub(delta);
      setScrubDir(delta > 0 ? 1 : -1);
      clearScrubDir();
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    setPressGlow(0);
    clearScrubDir();
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    return () => {
      if (scrubTimeoutRef.current != null) window.clearTimeout(scrubTimeoutRef.current);
    };
  }, []);

  // Decorative grip dots around the platter rim
  const gripDots = useMemo(() => {
    const arr: { x: number; y: number; a: number }[] = [];
    const n = 48;
    const r = 40;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      arr.push({ x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r, a: (i / n) * 360 });
    }
    return arr;
  }, []);

  // Fine tick marks near the outer edge
  const outerTicks = useMemo(() => {
    const arr: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
    const n = 72;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const major = i % 6 === 0;
      const rOuter = 47.5;
      const rInner = major ? 44.5 : 46;
      arr.push({
        x1: 50 + Math.cos(a) * rInner,
        y1: 50 + Math.sin(a) * rInner,
        x2: 50 + Math.cos(a) * rOuter,
        y2: 50 + Math.sin(a) * rOuter,
        major,
      });
    }
    return arr;
  }, []);

  const active = playing || dragging;
  const glowOpacity = dragging ? 0.85 : playing ? 0.55 : 0;

  return (
    <div
      className="relative h-full w-full min-w-0 min-h-0 select-none touch-none"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <radialGradient id="jog-chassis" cx="50%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#3a352d" />
            <stop offset="45%" stopColor="#26221c" />
            <stop offset="100%" stopColor="#0c0b0a" />
          </radialGradient>
          <radialGradient id="jog-platter" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#57504405" stopOpacity="0" />
            <stop offset="0%" stopColor="#4a453b" />
            <stop offset="55%" stopColor="#2b2721" />
            <stop offset="100%" stopColor="#141210" />
          </radialGradient>
          <radialGradient id="jog-cap" cx="50%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#6a6154" />
            <stop offset="55%" stopColor="#3a352d" />
            <stop offset="100%" stopColor="#181511" />
          </radialGradient>
          <linearGradient id="jog-spokeAmber" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="jog-innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <filter id="jog-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <clipPath id="jog-clip">
            <circle cx="50" cy="50" r="41.5" />
          </clipPath>
        </defs>

        {/* Outer active glow ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#f59e0b"
          strokeWidth={active ? 1.4 : 0.8}
          style={{
            opacity: glowOpacity,
            filter: "drop-shadow(0 0 3px rgba(245,158,11,0.9))",
            transition: "opacity 200ms ease-out, stroke-width 200ms ease-out",
          }}
          className={playing && !dragging ? "motion-reduce:animate-none animate-pulse" : ""}
        />

        {/* Chassis base */}
        <circle cx="50" cy="50" r="49" fill="url(#jog-chassis)" />
        <circle cx="50" cy="50" r="49" fill="none" stroke="#000000" strokeOpacity="0.6" strokeWidth="0.6" />

        {/* Fixed outer tick ring (does not rotate) */}
        <g>
          {outerTicks.map((t, i) => (
            <line
              key={"tick-" + i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.major ? "#f59e0b" : "#6b6152"}
              strokeOpacity={t.major ? (active ? 0.85 : 0.5) : 0.35}
              strokeWidth={t.major ? 0.7 : 0.4}
              strokeLinecap="round"
              style={{ transition: "stroke-opacity 200ms ease-out" }}
            />
          ))}
        </g>

        {/* Recessed platter well */}
        <circle
          cx="50"
          cy="50"
          r="43"
          fill="#0c0b0a"
          stroke="#000000"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />

        {/* Rotating platter group */}
        <g
          style={{
            transformOrigin: "50px 50px",
            transform: "rotate(" + spin + "deg)",
            transition: dragging ? "none" : "transform 90ms linear",
          }}
        >
          <circle cx="50" cy="50" r="41.5" fill="url(#jog-platter)" />

          {/* Inner accent glow within the platter when active */}
          <circle
            cx="50"
            cy="50"
            r="41.5"
            fill="url(#jog-innerGlow)"
            style={{ opacity: active ? 1 : 0.15, transition: "opacity 250ms ease-out" }}
            clipPath="url(#jog-clip)"
          />

          {/* Position marker spoke — the "one revolution" indicator */}
          <g clipPath="url(#jog-clip)">
            <rect
              x="49.1"
              y="9"
              width="1.8"
              height="32"
              rx="0.9"
              fill="url(#jog-spokeAmber)"
              style={{
                opacity: active ? 1 : 0.55,
                filter: active ? "drop-shadow(0 0 1.4px rgba(251,191,36,0.9))" : "none",
                transition: "opacity 200ms ease-out",
              }}
            />
            {/* subtle secondary spokes for motion legibility */}
            <rect x="49.4" y="12" width="1.2" height="8" rx="0.6" fill="#fbbf24" opacity={active ? 0.35 : 0.15} transform="rotate(120 50 50)" />
            <rect x="49.4" y="12" width="1.2" height="8" rx="0.6" fill="#fbbf24" opacity={active ? 0.35 : 0.15} transform="rotate(240 50 50)" />
          </g>

          {/* Grip texture dots around rim */}
          <g clipPath="url(#jog-clip)">
            {gripDots.map((d, i) => (
              <circle
                key={"grip-" + i}
                cx={d.x}
                cy={d.y}
                r={i % 4 === 0 ? 0.7 : 0.45}
                fill="#000000"
                opacity="0.45"
              />
            ))}
            {gripDots.map((d, i) => (
              <circle
                key={"grip-h-" + i}
                cx={d.x - 0.25}
                cy={d.y - 0.25}
                r={i % 4 === 0 ? 0.35 : 0.22}
                fill="#7a7060"
                opacity="0.35"
              />
            ))}
          </g>

          {/* Concentric machined grooves */}
          <circle cx="50" cy="50" r="34" fill="none" stroke="#000000" strokeOpacity="0.35" strokeWidth="0.3" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#000000" strokeOpacity="0.3" strokeWidth="0.3" />
        </g>

        {/* Fixed rim highlight seam */}
        <circle
          cx="50"
          cy="50"
          r="41.5"
          fill="none"
          stroke="#8a7f6d"
          strokeOpacity="0.28"
          strokeWidth="0.5"
        />

        {/* Scratch direction arcs — flash while scrubbing */}
        <g style={{ opacity: scrubDir !== 0 ? 1 : 0, transition: "opacity 120ms ease-out" }} filter="url(#jog-blur)">
          <path
            d="M 82 32 A 36 36 0 0 1 84 50"
            fill="none"
            stroke={scrubDir > 0 ? "#fbbf24" : "#57534e"}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={scrubDir > 0 ? 0.9 : 0.15}
          />
          <path
            d="M 18 68 A 36 36 0 0 1 16 50"
            fill="none"
            stroke={scrubDir < 0 ? "#fbbf24" : "#57534e"}
            strokeWidth="2"
            strokeLinecap="round"
            opacity={scrubDir < 0 ? 0.9 : 0.15}
          />
        </g>

        {/* Center cap (stationary) */}
        <g>
          <circle cx="50" cy="50" r="20" fill="url(#jog-cap)" stroke="#000000" strokeOpacity="0.6" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#8a7f6d" strokeOpacity="0.2" strokeWidth="0.4" />

          {/* Cap inner ring accent */}
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={dragging ? 1.1 : 0.7}
            strokeOpacity={active ? 0.7 : 0.28}
            style={{ transition: "stroke-opacity 200ms ease-out, stroke-width 150ms ease-out" }}
          />

          {/* Center hub dome */}
          <circle cx="50" cy="50" r="8.5" fill="url(#jog-cap)" stroke="#000000" strokeOpacity="0.5" strokeWidth="0.5" />

          {/* Play/pause state pip in center */}
          <circle
            cx="50"
            cy="50"
            r="3.2"
            fill={active ? "#fbbf24" : "#3a352d"}
            style={{
              filter: active ? "drop-shadow(0 0 2px rgba(251,191,36,0.95))" : "none",
              transition: "fill 200ms ease-out",
            }}
            className={playing && !dragging ? "motion-reduce:animate-none animate-pulse" : ""}
          />
          <circle cx="48.6" cy="48.6" r="1.1" fill="#fff7ed" opacity={active ? 0.7 : 0.25} />
        </g>

        {/* Hover / press ripple on the cap */}
        <circle
          cx="50"
          cy="50"
          r="20"
          fill="#fbbf24"
          style={{
            opacity: dragging ? 0.1 : hovered ? 0.05 : 0,
            transition: "opacity 200ms ease-out",
          }}
        />

        {/* Press pulse ring */}
        {pressGlow > 0 && (
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.8"
            opacity="0.5"
            style={{ transition: "opacity 200ms ease-out" }}
          />
        )}
      </svg>
    </div>
  );
}