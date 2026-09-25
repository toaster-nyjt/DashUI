type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;

  const angle = props.value ?? 0;

  // Transient interaction state — never stores the controlled value.
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [flare, setFlare] = useState(0); // 0..1 scratch intensity, decays

  const rootRef = useRef<HTMLDivElement | null>(null);
  const prevAngleRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const velRef = useRef<number>(0); // rad/ms, signed
  const flareRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  // Keep flare state ref in sync
  useEffect(() => {
    flareRef.current = flare;
  }, [flare]);

  // Decay loop for the scratch flare + velocity glow while idle
  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const f = flareRef.current;
      if (f > 0.001) {
        const next = f * 0.9;
        flareRef.current = next < 0.001 ? 0 : next;
        setFlare(flareRef.current);
      }
      // velocity decays too when not dragging
      if (!dragging) {
        velRef.current *= 0.9;
        if (Math.abs(velRef.current) < 0.00001) velRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [dragging]);

  const angleFromEvent = (clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const shortestDelta = (from: number, to: number) => {
    let d = to - from;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    prevAngleRef.current = angleFromEvent(e.clientX, e.clientY);
    lastTimeRef.current = performance.now();
    velRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || prevAngleRef.current === null) return;
    const now = performance.now();
    const cur = angleFromEvent(e.clientX, e.clientY);
    const delta = shortestDelta(prevAngleRef.current, cur);
    prevAngleRef.current = cur;

    const dt = Math.max(1, now - lastTimeRef.current);
    lastTimeRef.current = now;
    velRef.current = delta / dt;

    if (delta !== 0) {
      props.onScrub(delta);
      const intensity = Math.min(1, Math.abs(delta) * 5 + Math.abs(velRef.current) * 200);
      flareRef.current = Math.max(flareRef.current, intensity);
      setFlare(flareRef.current);
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDragging(false);
    prevAngleRef.current = null;
  };

  // Derived visual quantities
  const deg = (angle * 180) / Math.PI;
  const spinning = Math.abs(velRef.current) > 0.0005;
  const dirPositive = velRef.current >= 0;
  const glow = Math.max(flare, dragging ? 0.35 : 0, spinning ? Math.min(0.5, Math.abs(velRef.current) * 120) : 0);

  // Grip dots around the platter rim
  const grips = [];
  const gripCount = 24;
  for (let i = 0; i < gripCount; i++) {
    const a = (i / gripCount) * Math.PI * 2;
    const gx = 50 + Math.cos(a) * 40.5;
    const gy = 50 + Math.sin(a) * 40.5;
    grips.push(
      <circle
        key={"grip-" + i}
        cx={gx}
        cy={gy}
        r={0.9}
        fill="#0a0a0a"
        opacity={0.75}
      />
    );
  }

  // Concentric ticks on the rotating platter face for spin readability
  const spokes = [];
  const spokeCount = 60;
  for (let i = 0; i < spokeCount; i++) {
    const a = (i / spokeCount) * Math.PI * 2;
    const major = i % 5 === 0;
    const r1 = major ? 30 : 33;
    const r2 = 36;
    const x1 = 50 + Math.cos(a) * r1;
    const y1 = 50 + Math.sin(a) * r1;
    const x2 = 50 + Math.cos(a) * r2;
    const y2 = 50 + Math.sin(a) * r2;
    spokes.push(
      <line
        key={"spoke-" + i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={major ? "#f59e0b" : "#3a3a3a"}
        strokeOpacity={major ? 0.55 : 0.9}
        strokeWidth={major ? 0.7 : 0.4}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      className="h-full w-full min-w-0 min-h-0 flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing [container-type:size]"
    >
      <div className="relative" style={{ width: "min(100cqw,100cqh)", height: "min(100cqw,100cqh)" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            {/* Chassis bezel metal */}
            <radialGradient id={uid + "-bezel"} cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#2c2c2c" />
              <stop offset="55%" stopColor="#161616" />
              <stop offset="100%" stopColor="#050505" />
            </radialGradient>
            {/* Platter brushed surface */}
            <radialGradient id={uid + "-platter"} cx="42%" cy="34%" r="80%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="45%" stopColor="#242424" />
              <stop offset="100%" stopColor="#0e0e0e" />
            </radialGradient>
            {/* Center cap dome */}
            <radialGradient id={uid + "-cap"} cx="40%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#6b6b6b" />
              <stop offset="55%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#0b0b0b" />
            </radialGradient>
            {/* Amber accent gradient for markers */}
            <linearGradient id={uid + "-amber"} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            {/* Rotating sheen sweep */}
            <linearGradient id={uid + "-sheen"} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.10" />
              <stop offset="55%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id={uid + "-soft"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>

          {/* Active outer glow ring */}
          <circle
            cx="50"
            cy="50"
            r="48.5"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeOpacity={glow * 0.85}
            filter={"url(#" + uid + "-soft)"}
            style={{ transition: "stroke-opacity 120ms ease-out" }}
          />

          {/* Outer chassis bezel */}
          <circle cx="50" cy="50" r="48" fill={"url(#" + uid + "-bezel)"} stroke="#000000" strokeOpacity={0.6} strokeWidth={0.6} />
          <circle cx="50" cy="50" r="45.5" fill="none" stroke="#ffffff" strokeOpacity={0.05} strokeWidth={0.7} />

          {/* Recessed platter well */}
          <circle cx="50" cy="50" r="43.5" fill="#050505" />
          <circle cx="50" cy="50" r="43" fill="#0a0a0a" stroke="#000" strokeOpacity={0.7} strokeWidth={0.8} />

          {/* ---- ROTATING PLATTER GROUP ---- */}
          <g
            style={{
              transform: "rotate(" + deg + "deg)",
              transformOrigin: "50px 50px",
              transition: dragging ? "none" : "transform 100ms linear",
            }}
          >
            {/* Platter face */}
            <circle cx="50" cy="50" r="42" fill={"url(#" + uid + "-platter)"} />

            {/* Brushed concentric rings */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="#000000" strokeOpacity={0.35} strokeWidth={0.4} />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#ffffff" strokeOpacity={0.04} strokeWidth={0.4} />
            <circle cx="50" cy="50" r="26" fill="none" stroke="#000000" strokeOpacity={0.4} strokeWidth={0.4} />
            <circle cx="50" cy="50" r="20" fill="none" stroke="#ffffff" strokeOpacity={0.04} strokeWidth={0.4} />

            {/* Tick spokes */}
            {spokes}

            {/* Grip dots on rim */}
            {grips}

            {/* Rotating sheen wedge — reads spin direction & motion */}
            <path
              d="M50 50 L50 8 A42 42 0 0 1 82 26 Z"
              fill={"url(#" + uid + "-sheen)"}
              opacity={0.6 + glow * 0.4}
            />

            {/* Bold amber position marker (the scratch reference line) */}
            <rect
              x="49.1"
              y="8"
              width="1.8"
              height="20"
              rx="0.9"
              fill={"url(#" + uid + "-amber)"}
              opacity={0.95}
            />
            <circle cx="50" cy="11" r="1.6" fill="#fcd34d" opacity={0.95} />
            {/* faint marker glow when active */}
            <rect
              x="48.4"
              y="8"
              width="3.2"
              height="20"
              rx="1.6"
              fill="#f59e0b"
              opacity={glow * 0.5}
              filter={"url(#" + uid + "-soft)"}
            />
          </g>
          {/* ---- END ROTATING GROUP ---- */}

          {/* Static center hub cap (does not rotate — the label/spindle) */}
          <circle cx="50" cy="50" r="16" fill="#060606" />
          <circle cx="50" cy="50" r="15" fill={"url(#" + uid + "-cap)"} stroke="#000" strokeOpacity={0.6} strokeWidth={0.5} />
          <circle cx="50" cy="50" r="14.4" fill="none" stroke="#ffffff" strokeOpacity={0.07} strokeWidth={0.5} />

          {/* Direction indicator ring segment on hub — brightens with motion */}
          <g style={{ transition: "opacity 150ms ease-out" }} opacity={0.35 + glow * 0.65}>
            <path
              d={dirPositive ? "M50 39 A11 11 0 0 1 61 50" : "M50 39 A11 11 0 0 0 39 50"}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          </g>

          {/* Spindle nub */}
          <circle cx="50" cy="50" r="3.2" fill="#1a1a1a" stroke="#000" strokeOpacity={0.6} strokeWidth={0.4} />
          <circle cx="50" cy="50" r="2.4" fill="#2f2f2f" />
          <circle cx="48.9" cy="48.9" r="0.9" fill="#7a7a7a" opacity={0.8} />

          {/* Hover halo ring on the touch zone */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={0.8}
            strokeOpacity={hovering && !dragging ? 0.35 : 0}
            style={{ transition: "stroke-opacity 200ms ease-out" }}
          />

          {/* Press state inner darkening */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="#000000"
            opacity={dragging ? 0.12 : 0}
            style={{ transition: "opacity 120ms ease-out" }}
          />
        </svg>
      </div>
    </div>
  );
}