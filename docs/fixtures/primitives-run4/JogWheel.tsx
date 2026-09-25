type JogWheelProps = { value?: number; onScrub: (delta: number) => void };
export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;

  const angle = typeof props.value === "number" && isFinite(props.value) ? props.value : 0;

  const [dragging, setDragging] = useState(false);
  const [spinVel, setSpinVel] = useState(0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const accumRef = useRef(0);

  const TWO_PI = Math.PI * 2;

  const JogWheelPointerAngle = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const JogWheelNorm = (d: number) => {
    let x = d;
    while (x > Math.PI) x -= TWO_PI;
    while (x < -Math.PI) x += TWO_PI;
    return x;
  };

  const onPointerDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    setSpinVel(0);
    lastAngleRef.current = JogWheelPointerAngle(e.clientX, e.clientY);
    lastTimeRef.current = performance.now();
  };

  const onPointerMove = (e: any) => {
    if (!dragging) return;
    const a = JogWheelPointerAngle(e.clientX, e.clientY);
    const delta = JogWheelNorm(a - lastAngleRef.current);
    lastAngleRef.current = a;

    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    lastTimeRef.current = now;

    setSpinVel(delta / (dt / 16));
    if (delta !== 0) props.onScrub(delta);
  };

  const endDrag = (e: any) => {
    if (!dragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setDragging(false);
  };

  // Inertial decay of spin velocity after release (visual momentum only)
  useEffect(() => {
    if (dragging) return;
    if (Math.abs(spinVel) < 0.0008) {
      if (spinVel !== 0) setSpinVel(0);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      setSpinVel((v) => {
        const nv = v * Math.pow(0.94, dt / 16);
        return Math.abs(nv) < 0.0008 ? 0 : nv;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, spinVel]);

  // Visual spin: combine controlled angle with a small drifting offset from momentum
  const [drift, setDrift] = useState(0);
  useEffect(() => {
    if (spinVel === 0) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      accumRef.current += spinVel * (dt / 16) * 0.35;
      setDrift(accumRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinVel]);

  const totalAngle = angle + drift;
  const deg = (totalAngle * 180) / Math.PI;

  const spinning = Math.abs(spinVel) > 0.02 || dragging;
  const spinIntensity = Math.min(1, Math.abs(spinVel) / 1.2);

  // Grip marks around the rim
  const marks = 48;
  const gripArr = [];
  for (let i = 0; i < marks; i++) gripArr.push(i);

  const ringOpacity = 0.25 + spinIntensity * 0.6;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none select-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <radialGradient id={uid + "-cap"} cx="42%" cy="34%" r="80%">
            <stop offset="0%" stopColor="#525252" />
            <stop offset="45%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#0c0a09" />
          </radialGradient>
          <radialGradient id={uid + "-inner"} cx="42%" cy="36%" r="75%">
            <stop offset="0%" stopColor="#404040" />
            <stop offset="70%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <radialGradient id={uid + "-hub"} cx="40%" cy="34%" r="80%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="55%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#3a2408" />
          </radialGradient>
          <linearGradient id={uid + "-rim"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#57534e" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={uid + "-platterClip"}>
            <circle cx="100" cy="100" r="72" />
          </clipPath>
        </defs>

        {/* Outer chassis well (recessed) */}
        <circle cx="100" cy="100" r="96" fill="#0a0a0a" />
        <circle cx="100" cy="100" r="96" fill="none" stroke="#000000" strokeWidth="4" opacity="0.7" />
        <circle cx="100" cy="100" r="92" fill="url(#{uid}-rim)" />
        <circle cx="100" cy="100" r="92" fill="url(#uidrim)" />

        {/* fallback solid rim (url refs above are decorative gradients; ensure metal ring) */}
        <circle cx="100" cy="100" r="92" fill={"url(#" + uid + "-rim)"} />

        {/* Outer grip ring with tick marks (rotates) */}
        <g transform={"rotate(" + deg + " 100 100)"}>
          <circle cx="100" cy="100" r="88" fill={"url(#" + uid + "-cap)"} />
          {gripArr.map((i) => {
            const a = (i / marks) * TWO_PI;
            const r1 = 79;
            const r2 = 87;
            const x1 = 100 + Math.cos(a) * r1;
            const y1 = 100 + Math.sin(a) * r1;
            const x2 = 100 + Math.cos(a) * r2;
            const y2 = 100 + Math.sin(a) * r2;
            const strong = i % 6 === 0;
            return (
              <line
                key={"grip-" + i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={strong ? "#f59e0b" : "#78716c"}
                strokeOpacity={strong ? 0.7 : 0.4}
                strokeWidth={strong ? 2.2 : 1.1}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Progress / spin arc ring */}
        <circle
          cx="100"
          cy="100"
          r="83"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeOpacity={ringOpacity}
          strokeLinecap="round"
          strokeDasharray="4 8"
          transform={"rotate(" + deg * 1.4 + " 100 100)"}
          className="motion-reduce:hidden"
        />

        {/* Inner platter face (rotates) */}
        <g transform={"rotate(" + deg + " 100 100)"}>
          <circle cx="100" cy="100" r="76" fill={"url(#" + uid + "-inner)"} stroke="#000000" strokeOpacity="0.6" strokeWidth="2" />

          {/* concentric vinyl grooves */}
          <g clipPath={"url(#" + uid + "-platterClip)"} opacity="0.5">
            {[68, 60, 52, 44, 36].map((r, gi) => (
              <circle
                key={"groove-" + gi}
                cx="100"
                cy="100"
                r={r}
                fill="none"
                stroke="#000000"
                strokeOpacity="0.55"
                strokeWidth="0.8"
              />
            ))}
          </g>

          {/* strobe/orientation sector so rotation is legible */}
          <path
            d="M100 100 L100 30 A70 70 0 0 1 152 55 Z"
            fill="#f59e0b"
            fillOpacity={0.08 + spinIntensity * 0.14}
          />

          {/* index marker line */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="30"
            stroke="#fbbf24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeOpacity={0.85}
            filter={spinning ? "url(#" + uid + "-glow)" : undefined}
          />
          <circle cx="100" cy="33" r="3.4" fill="#fde68a" filter={"url(#" + uid + "-glow)"} />
        </g>

        {/* Center hub (amber, static) */}
        <circle
          cx="100"
          cy="100"
          r="26"
          fill={"url(#" + uid + "-hub)"}
          stroke="#000000"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          className={dragging ? "" : "transition-all duration-200 ease-out"}
        />
        <circle
          cx="100"
          cy="100"
          r="26"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="1.5"
          strokeOpacity={dragging ? 0.9 : 0.4 + spinIntensity * 0.4}
          className={spinning ? "motion-reduce:opacity-40" : ""}
        />
        {spinning && (
          <circle
            cx="100"
            cy="100"
            r="30"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeOpacity="0.5"
            className="animate-pulse motion-reduce:hidden"
          />
        )}

        {/* hub center dimple */}
        <circle cx="100" cy="100" r="6" fill="#1c1917" stroke="#000" strokeOpacity="0.6" strokeWidth="1" />
        <circle cx="97.5" cy="97.5" r="2" fill="#fde68a" fillOpacity="0.6" />

        {/* subtle top highlight sheen */}
        <ellipse cx="82" cy="70" rx="46" ry="26" fill="#ffffff" opacity="0.04" />
      </svg>
    </div>
  );
}