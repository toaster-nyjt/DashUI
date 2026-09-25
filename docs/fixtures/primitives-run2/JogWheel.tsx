type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export function JogWheel(props: JogWheelProps) {
  const { value, onScrub } = props;

  const angle = typeof value === "number" && isFinite(value) ? value : 0;

  const surfaceRef = useRef<SVGSVGElement | null>(null);
  const centerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastAngleRef = useRef<number>(0);
  const dragActiveRef = useRef<boolean>(false);

  const [dragging, setDragging] = useState(false);
  const [spinBoost, setSpinBoost] = useState(0);
  const [hover, setHover] = useState(false);

  // Track the visual "sweep" indicator momentum for a satisfying flourish.
  const boostDecayRef = useRef<number | null>(null);

  const bumpBoost = (mag: number) => {
    setSpinBoost((b) => {
      const next = Math.min(1, b * 0.6 + mag);
      return next;
    });
    if (boostDecayRef.current == null) {
      const step = () => {
        setSpinBoost((b) => {
          const nv = b * 0.9;
          if (nv < 0.01) {
            if (boostDecayRef.current != null) {
              cancelAnimationFrame(boostDecayRef.current);
              boostDecayRef.current = null;
            }
            return 0;
          }
          boostDecayRef.current = requestAnimationFrame(step);
          return nv;
        });
      };
      boostDecayRef.current = requestAnimationFrame(step);
    }
  };

  useEffect(() => {
    return () => {
      if (boostDecayRef.current != null) cancelAnimationFrame(boostDecayRef.current);
    };
  }, []);

  const pointerAngle = (clientX: number, clientY: number) => {
    const c = centerRef.current;
    return Math.atan2(clientY - c.y, clientX - c.x);
  };

  const recomputeCenter = () => {
    const el = surfaceRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    centerRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.preventDefault();
    recomputeCenter();
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    dragActiveRef.current = true;
    lastAngleRef.current = pointerAngle(e.clientX, e.clientY);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragActiveRef.current) return;
    const a = pointerAngle(e.clientX, e.clientY);
    let delta = a - lastAngleRef.current;
    // normalize into [-PI, PI]
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    lastAngleRef.current = a;
    if (delta !== 0) {
      onScrub(delta);
      bumpBoost(Math.min(0.9, Math.abs(delta) * 1.6));
    }
  };

  const endDrag = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragActiveRef.current) return;
    dragActiveRef.current = false;
    setDragging(false);
    try {
      (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const deg = (angle * 180) / Math.PI;

  // Geometry within a 200x200 viewBox (centered at 100,100)
  const R_OUTER = 96;
  const R_RIM = 82;
  const R_RIM_INNER = 70;
  const R_PLATTER = 66;
  const R_CENTER = 26;
  const R_HUB = 15;

  // grip ticks around the rim
  const gripCount = 48;
  const grips = [];
  for (let i = 0; i < gripCount; i++) {
    const t = (i / gripCount) * 360;
    const isMajor = i % 4 === 0;
    grips.push({ t, isMajor });
  }

  // platter spokes / groove marks (rotate with value)
  const spokeCount = 6;
  const spokes = [];
  for (let i = 0; i < spokeCount; i++) {
    spokes.push((i / spokeCount) * 360);
  }

  // Concentric groove rings for a vinyl look
  const grooveRings = [58, 51, 44, 37, 30];

  const glowOpacity = dragging ? 0.9 : 0.35 + spinBoost * 0.5;
  const markerOpacity = 0.55 + spinBoost * 0.45;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center [container-type:size]">
      <svg
        ref={surfaceRef}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none select-none cursor-grab active:cursor-grabbing"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <defs>
          <radialGradient id="jw-chassis" cx="50%" cy="42%" r="65%">
            <stop offset="0%" stopColor="#3a352c" />
            <stop offset="55%" stopColor="#1c1a17" />
            <stop offset="100%" stopColor="#0a0908" />
          </radialGradient>
          <radialGradient id="jw-platter" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#2b2823" />
            <stop offset="60%" stopColor="#161513" />
            <stop offset="100%" stopColor="#0b0a09" />
          </radialGradient>
          <radialGradient id="jw-hub" cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor="#6b6154" />
            <stop offset="55%" stopColor="#2a2620" />
            <stop offset="100%" stopColor="#100e0c" />
          </radialGradient>
          <radialGradient id="jw-hub-core" cx="50%" cy="35%" r="80%">
            <stop offset="0%" stopColor="#f5c063" />
            <stop offset="45%" stopColor="#d9962b" />
            <stop offset="100%" stopColor="#6b4310" />
          </radialGradient>
          <linearGradient id="jw-rim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a4438" />
            <stop offset="50%" stopColor="#211e19" />
            <stop offset="100%" stopColor="#0d0c0a" />
          </linearGradient>
          <radialGradient id="jw-sheen" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffe9b8" stopOpacity="0.20" />
            <stop offset="45%" stopColor="#ffe9b8" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffe9b8" stopOpacity="0" />
          </radialGradient>
          <filter id="jw-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer accent glow ring — brightens on drag */}
        <circle
          cx="100"
          cy="100"
          r={R_OUTER}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={dragging ? 3 : 2}
          opacity={glowOpacity}
          filter="url(#jw-glow)"
          className="transition-all duration-200 ease-out motion-reduce:transition-none"
        />

        {/* Chassis base */}
        <circle cx="100" cy="100" r={R_OUTER - 3} fill="url(#jw-chassis)" stroke="#000000" strokeOpacity="0.6" strokeWidth="1" />

        {/* Rim ring */}
        <circle cx="100" cy="100" r={R_RIM} fill="none" stroke="url(#jw-rim)" strokeWidth={R_RIM - R_RIM_INNER} />
        <circle cx="100" cy="100" r={R_RIM} fill="none" stroke="#000000" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="100" cy="100" r={R_RIM_INNER} fill="none" stroke="#000000" strokeOpacity="0.45" strokeWidth="1" />

        {/* Grip ticks on the rim (static — rim is stationary, platter spins) */}
        <g opacity={hover || dragging ? 0.95 : 0.7} className="transition-opacity duration-200 motion-reduce:transition-none">
          {grips.map((g, i) => {
            const rad = (g.t * Math.PI) / 180;
            const rOut = R_RIM_INNER + (R_RIM - R_RIM_INNER) - 1;
            const rIn = g.isMajor ? R_RIM_INNER + 2 : R_RIM_INNER + (R_RIM - R_RIM_INNER) * 0.45;
            const x1 = 100 + Math.cos(rad) * rIn;
            const y1 = 100 + Math.sin(rad) * rIn;
            const x2 = 100 + Math.cos(rad) * rOut;
            const y2 = 100 + Math.sin(rad) * rOut;
            return (
              <line
                key={"grip-" + i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={g.isMajor ? "#c99a3a" : "#0a0908"}
                strokeOpacity={g.isMajor ? 0.85 : 0.7}
                strokeWidth={g.isMajor ? 1.6 : 1.1}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Spinning platter group */}
        <g
          transform={"rotate(" + deg + " 100 100)"}
          className="transition-transform duration-100 ease-linear motion-reduce:transition-none"
          style={{ transition: dragging ? "none" : undefined }}
        >
          {/* Platter face */}
          <circle cx="100" cy="100" r={R_PLATTER} fill="url(#jw-platter)" stroke="#000000" strokeOpacity="0.6" strokeWidth="1" />

          {/* Concentric grooves */}
          {grooveRings.map((gr, i) => (
            <circle
              key={"groove-" + i}
              cx="100"
              cy="100"
              r={gr}
              fill="none"
              stroke="#000000"
              strokeOpacity="0.35"
              strokeWidth="0.8"
            />
          ))}

          {/* Groove spokes */}
          {spokes.map((s, i) => {
            const rad = (s * Math.PI) / 180;
            const x1 = 100 + Math.cos(rad) * R_CENTER;
            const y1 = 100 + Math.sin(rad) * R_CENTER;
            const x2 = 100 + Math.cos(rad) * (R_PLATTER - 4);
            const y2 = 100 + Math.sin(rad) * (R_PLATTER - 4);
            return (
              <line
                key={"spoke-" + i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#000000"
                strokeOpacity="0.28"
                strokeWidth="0.9"
              />
            );
          })}

          {/* Position marker stripe — the amber cue that shows rotation clearly */}
          <line
            x1="100"
            y1={100 - R_CENTER + 2}
            x2="100"
            y2={100 - R_PLATTER + 3}
            stroke="#fbbf24"
            strokeWidth="3.4"
            strokeLinecap="round"
            opacity={markerOpacity}
            filter="url(#jw-glow)"
            className="transition-opacity duration-150 motion-reduce:transition-none"
          />
          {/* small dot at marker tip */}
          <circle cx="100" cy={100 - R_PLATTER + 6} r="2.6" fill="#ffd97a" opacity={markerOpacity} />

          {/* Sheen highlight rotates subtly with platter */}
          <circle cx="100" cy="100" r={R_PLATTER} fill="url(#jw-sheen)" />
        </g>

        {/* Center hub (stationary bezel) */}
        <circle cx="100" cy="100" r={R_CENTER} fill="url(#jw-hub)" stroke="#000000" strokeOpacity="0.6" strokeWidth="1" />
        <circle cx="100" cy="100" r={R_CENTER - 3} fill="none" stroke="#000000" strokeOpacity="0.4" strokeWidth="0.8" />

        {/* Live spin ring inside hub — arc grows with scrub energy */}
        <g transform={"rotate(" + deg * 1.6 + " 100 100)"}>
          <circle
            cx="100"
            cy="100"
            r={R_HUB + 5}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={(2 * Math.PI * (R_HUB + 5) * (0.12 + spinBoost * 0.55)) + " 999"}
            opacity={0.4 + spinBoost * 0.6}
            className="motion-reduce:transition-none"
          />
        </g>

        {/* Glowing hub core */}
        <circle
          cx="100"
          cy="100"
          r={R_HUB}
          fill="url(#jw-hub-core)"
          stroke="#7a4d12"
          strokeWidth="1"
          filter="url(#jw-glow)"
          opacity={dragging ? 1 : 0.9}
          className="transition-all duration-200 ease-out motion-reduce:transition-none"
        />
        {/* hub core highlight */}
        <circle cx="94" cy="93" r="5" fill="#fff2cf" opacity={0.5} />
        {/* spindle */}
        <circle cx="100" cy="100" r="3" fill="#2a1c07" />
        <circle cx="100" cy="100" r="1.2" fill="#0c0a06" />

        {/* Active pulse ring when dragging */}
        {dragging ? (
          <circle
            cx="100"
            cy="100"
            r={R_RIM_INNER - 2}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.4"
            opacity="0.5"
            className="animate-pulse motion-reduce:animate-none"
          />
        ) : null}
      </svg>
    </div>
  );
}