type JogWheelProps = { value?: number; onScrub: (delta: number) => void };
export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;

  const angle = props.value ?? 0;

  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [spinRate, setSpinRate] = useState(0); // radians/frame proxy from last delta, for glow intensity

  const dragState = useRef<{
    lastAngle: number;
    cx: number;
    cy: number;
    lastT: number;
  } | null>(null);

  const outerRef = useRef<SVGSVGElement | null>(null);

  // decay the visual spin glow after motion stops
  useEffect(() => {
    if (spinRate === 0) return;
    let raf = 0;
    const tick = () => {
      setSpinRate((r) => {
        const next = r * 0.86;
        if (Math.abs(next) < 0.0008) return 0;
        raf = requestAnimationFrame(tick);
        return next;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinRate === 0]);

  const pointFromEvent = (e: React.PointerEvent) => {
    const svg = outerRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    // center of the meet-scaled viewBox region
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    return { dx, dy, ang: Math.atan2(dy, dx), r: Math.hypot(dx, dy), size };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const p = pointFromEvent(e);
    if (!p) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragState.current = { lastAngle: p.ang, cx: 0, cy: 0, lastT: performance.now() };
    setDragging(true);
  };

  const normalizeDelta = (d: number) => {
    // shortest signed angular difference
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = dragState.current;
    if (!st) return;
    const p = pointFromEvent(e);
    if (!p) return;
    const delta = normalizeDelta(p.ang - st.lastAngle);
    st.lastAngle = p.ang;
    const now = performance.now();
    st.lastT = now;
    if (delta !== 0) {
      props.onScrub(delta);
      setSpinRate((r) => {
        // blend toward current instantaneous rate for smooth glow
        const blended = r * 0.4 + delta * 0.6;
        return blended;
      });
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    dragState.current = null;
    setDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch (err) {
      /* noop */
    }
  };

  // Visual constants (viewBox 0..100)
  const C = 50;
  const rOuterRing = 47;
  const rMetalOuter = 45;
  const rMetalInner = 33;
  const rHub = 32;
  const rWell = 24;
  const rSpindle = 5.5;

  // marker dot position (follows value angle)
  const markerR = 39;
  const mx = C + markerR * Math.cos(angle - Math.PI / 2);
  const my = C + markerR * Math.sin(angle - Math.PI / 2);

  // grip notches around the metal ring
  const notches: JSX.Element[] = [];
  const NOTCH_COUNT = 48;
  for (let i = 0; i < NOTCH_COUNT; i++) {
    const a = (i / NOTCH_COUNT) * Math.PI * 2;
    const inner = 41.5;
    const outer = 45;
    const x1 = C + inner * Math.cos(a);
    const y1 = C + inner * Math.sin(a);
    const x2 = C + outer * Math.cos(a);
    const y2 = C + outer * Math.sin(a);
    notches.push(
      <line
        key={"notch-" + i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#57534e"
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.6}
      />
    );
  }

  // hub radial engraving spokes that rotate with value
  const spokes: JSX.Element[] = [];
  const SPOKE_COUNT = 16;
  for (let i = 0; i < SPOKE_COUNT; i++) {
    const a = (i / SPOKE_COUNT) * Math.PI * 2;
    const inner = rWell + 1.5;
    const outer = rHub - 1.5;
    const x1 = C + inner * Math.cos(a);
    const y1 = C + inner * Math.sin(a);
    const x2 = C + outer * Math.cos(a);
    const y2 = C + outer * Math.sin(a);
    spokes.push(
      <line
        key={"spoke-" + i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#3f3b36"
        strokeWidth={0.55}
        strokeLinecap="round"
      />
    );
  }

  const rimTicks: JSX.Element[] = [];
  const RIM_TICK_COUNT = 120;
  for (let i = 0; i < RIM_TICK_COUNT; i++) {
    const a = (i / RIM_TICK_COUNT) * Math.PI * 2;
    const major = i % 10 === 0;
    const inner = major ? 45.6 : 46.2;
    const outer = 47;
    const x1 = C + inner * Math.cos(a);
    const y1 = C + inner * Math.sin(a);
    const x2 = C + outer * Math.cos(a);
    const y2 = C + outer * Math.sin(a);
    rimTicks.push(
      <line
        key={"rimtick-" + i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={major ? "#78716c" : "#44403c"}
        strokeWidth={major ? 0.6 : 0.35}
        opacity={major ? 0.75 : 0.5}
      />
    );
  }

  const spinMag = Math.min(1, Math.abs(spinRate) * 3.2);
  const active = dragging || spinMag > 0.01;
  const glowOpacity = active ? 0.35 + spinMag * 0.55 : hovering ? 0.22 : 0;

  const rotateDeg = (angle * 180) / Math.PI;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center select-none">
      <svg
        ref={outerRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        <defs>
          <radialGradient id={uid + "-metal"} cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#4b4640" />
            <stop offset="42%" stopColor="#2a2723" />
            <stop offset="78%" stopColor="#1c1a17" />
            <stop offset="100%" stopColor="#0f0e0c" />
          </radialGradient>
          <radialGradient id={uid + "-hub"} cx="42%" cy="34%" r="75%">
            <stop offset="0%" stopColor="#33302b" />
            <stop offset="55%" stopColor="#211f1b" />
            <stop offset="100%" stopColor="#121110" />
          </radialGradient>
          <radialGradient id={uid + "-well"} cx="50%" cy="42%" r="70%">
            <stop offset="0%" stopColor="#181614" />
            <stop offset="70%" stopColor="#0a0908" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id={uid + "-spindle"} cx="40%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="55%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#7c3a06" />
          </radialGradient>
          <linearGradient id={uid + "-sheen"} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.14} />
            <stop offset="30%" stopColor="#ffffff" stopOpacity={0.03} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0} />
          </linearGradient>
          <filter id={uid + "-soft"} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* outer signal glow ring (spin/hover feedback) */}
        <circle
          cx={C}
          cy={C}
          r={rOuterRing}
          fill="none"
          stroke="#a3e635"
          strokeWidth={active ? 1.6 + spinMag * 1.8 : 1.2}
          opacity={glowOpacity}
          filter={uid ? "url(#" + uid + "-soft)" : undefined}
          style={{ transition: "opacity 150ms ease-out, stroke-width 150ms ease-out" }}
        />

        {/* base rim */}
        <circle cx={C} cy={C} r={rOuterRing} fill="none" stroke="#292524" strokeWidth={2.4} />
        <circle cx={C} cy={C} r={rMetalOuter + 1.2} fill="none" stroke="#0c0b0a" strokeWidth={1.2} />

        {/* rim measurement ticks (fixed) */}
        <g opacity={0.9}>{rimTicks}</g>

        {/* metal platter ring */}
        <circle
          cx={C}
          cy={C}
          r={rMetalOuter}
          fill={"url(#" + uid + "-metal)"}
          stroke="#0d0c0b"
          strokeWidth={0.8}
        />

        {/* rotating grip layer: notches + spokes + marker + hub, all spin with value */}
        <g
          style={{
            transformOrigin: "50px 50px",
            transform: "rotate(" + rotateDeg + "deg)",
            transition: dragging ? "none" : "transform 150ms ease-out",
          }}
        >
          {/* grip notches */}
          <g>{notches}</g>

          {/* inner metal boundary shadow */}
          <circle cx={C} cy={C} r={rMetalInner} fill="none" stroke="#0b0a09" strokeWidth={1.4} />

          {/* hub disc */}
          <circle
            cx={C}
            cy={C}
            r={rHub}
            fill={"url(#" + uid + "-hub)"}
            stroke="#0d0c0b"
            strokeWidth={0.6}
          />

          {/* engraved spokes on hub */}
          <g opacity={0.9}>{spokes}</g>

          {/* concentric groove */}
          <circle cx={C} cy={C} r={(rWell + rHub) / 2} fill="none" stroke="#2c2925" strokeWidth={0.5} opacity={0.7} />

          {/* recessed center well */}
          <circle
            cx={C}
            cy={C}
            r={rWell}
            fill={"url(#" + uid + "-well)"}
            stroke="#050403"
            strokeWidth={1}
          />
          <circle cx={C} cy={C} r={rWell} fill="none" stroke="#000000" strokeWidth={2.2} opacity={0.5} />

          {/* amber spindle cap */}
          <circle
            cx={C}
            cy={C}
            r={rSpindle}
            fill={"url(#" + uid + "-spindle)"}
            stroke="#7c3a06"
            strokeWidth={0.5}
          />
          <circle cx={C} cy={C} r={rSpindle} fill="none" stroke="#fcd34d" strokeWidth={0.4} opacity={0.6} />
          <circle cx={C - 1.6} cy={C - 1.8} r={1.4} fill="#ffffff" opacity={0.35} />

          {/* the position marker line + dot on the platter (this reveals rotation) */}
          <line
            x1={C}
            y1={C - rWell + 1}
            x2={C}
            y2={C - rMetalOuter + 2}
            stroke={active ? "#a3e635" : "#f59e0b"}
            strokeWidth={active ? 1.6 : 1.2}
            strokeLinecap="round"
            opacity={active ? 0.95 : 0.85}
            style={{ transition: "stroke 150ms ease-out, stroke-width 150ms ease-out" }}
          />
          <circle
            cx={mx}
            cy={my}
            r={active ? 2.6 : 2.1}
            fill={active ? "#bef264" : "#fbbf24"}
            style={{ transition: "fill 150ms ease-out, r 150ms ease-out" }}
          >
            {active ? (
              <animate attributeName="opacity" values="1;0.55;1" dur="0.9s" repeatCount="indefinite" />
            ) : null}
          </circle>
        </g>

        {/* fixed top sheen highlight (does not rotate — simulates fixed light source) */}
        <ellipse
          cx={40}
          cy={34}
          rx={30}
          ry={22}
          fill={"url(#" + uid + "-sheen)"}
          opacity={0.55}
          pointerEvents="none"
        />

        {/* fixed index reference notch at 12 o'clock on the outer rim */}
        <polygon
          points={C - 1.6 + "," + 3.2 + " " + (C + 1.6) + "," + 3.2 + " " + C + "," + 6.6}
          fill={active ? "#bef264" : "#a3a3a3"}
          opacity={active ? 1 : 0.7}
          style={{ transition: "fill 150ms ease-out" }}
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}