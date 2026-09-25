type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;

  const angle = props.value ?? 0;

  const dragRef = useRef<{
    lastAngle: number;
    rectCx: number;
    rectCy: number;
    lastT: number;
    velocity: number;
    active: boolean;
  } | null>(null);

  const [dragging, setDragging] = useState(false);
  const [spin, setSpin] = useState(0); // visual velocity indicator 0..1
  const [pulse, setPulse] = useState(0); // scratch pulse bump

  const rafRef = useRef<number | null>(null);

  // Decay spin indicator smoothly when not scrubbing
  useEffect(() => {
    if (dragging) return;
    if (spin <= 0.001) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      setSpin((s) => {
        const n = s * Math.pow(0.02, dt);
        if (n <= 0.001) return 0;
        raf = requestAnimationFrame(tick);
        return n;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [dragging, spin]);

  useEffect(() => {
    if (pulse <= 0.001) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      setPulse((p) => {
        const n = p * Math.pow(0.0005, dt);
        if (n <= 0.001) return 0;
        raf = requestAnimationFrame(tick);
        return n;
      });
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pulse]);

  const pointerAngle = (clientX: number, clientY: number, cx: number, cy: number) => {
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const angDelta = (a: number, b: number) => {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  const onPointerDown = (e: any) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    try {
      el.setPointerCapture(e.pointerId);
    } catch (err) {}
    dragRef.current = {
      lastAngle: pointerAngle(e.clientX, e.clientY, cx, cy),
      rectCx: cx,
      rectCy: cy,
      lastT: performance.now(),
      velocity: 0,
      active: true,
    };
    setDragging(true);
  };

  const onPointerMove = (e: any) => {
    const d = dragRef.current;
    if (!d || !d.active) return;
    const now = performance.now();
    const cur = pointerAngle(e.clientX, e.clientY, d.rectCx, d.rectCy);
    const delta = angDelta(cur, d.lastAngle);
    d.lastAngle = cur;
    const dt = Math.max(0.001, (now - d.lastT) / 1000);
    d.lastT = now;
    if (delta !== 0) {
      props.onScrub(delta);
      const speed = Math.abs(delta) / dt; // rad/s
      const norm = Math.min(1, speed / 14);
      setSpin((s) => Math.max(s * 0.6, norm));
      setPulse((p) => Math.min(1, Math.max(p, Math.min(1, Math.abs(delta) * 6))));
    }
  };

  const endDrag = (e: any) => {
    const d = dragRef.current;
    if (d) d.active = false;
    dragRef.current = null;
    setDragging(false);
    try {
      const el = e.currentTarget as HTMLElement;
      el.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const floor = (JogWheel_MIN as any).base;

  const deg = (angle * 180) / Math.PI;

  // Spoke marks around platter
  const marks = [];
  const markCount = 48;
  for (let i = 0; i < markCount; i++) {
    const major = i % 4 === 0;
    marks.push({ i, major });
  }

  const gridDots = [];
  const gridCount = 24;
  for (let i = 0; i < gridCount; i++) {
    gridDots.push(i);
  }

  return (
    <div
      className="relative h-full w-full touch-none select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full overflow-visible"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <defs>
          <radialGradient id={uid + "-plat"} cx="42%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="45%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <radialGradient id={uid + "-rim"} cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="#0c0a09" stopOpacity="0" />
            <stop offset="92%" stopColor="#44403c" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <radialGradient id={uid + "-well"} cx="46%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#1c1917" />
            <stop offset="70%" stopColor="#0a0a0a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id={uid + "-hub"} cx="42%" cy="36%" r="70%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="55%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.28" />
            <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow ring reacting to activity */}
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2 + spin * 4}
          strokeOpacity={0.1 + spin * 0.55 + (dragging ? 0.15 : 0)}
          style={{ transition: "stroke-opacity 120ms ease-out" }}
          filter={spin > 0.2 ? "url(#" + uid + "-glow)" : undefined}
        />

        {/* Metallic platter base */}
        <circle cx="100" cy="100" r="93" fill={"url(#" + uid + "-plat)"} />
        <circle cx="100" cy="100" r="93" fill={"url(#" + uid + "-rim)"} />

        {/* Rotating group: spokes + top-plate details */}
        <g
          style={{
            transform: "rotate(" + deg + "deg)",
            transformOrigin: "100px 100px",
            transition: dragging ? "none" : "transform 150ms ease-out",
          }}
        >
          {/* Fine concentric ridges (rotate with platter for scratch feel) */}
          <circle cx="100" cy="100" r="84" fill="none" stroke="#57534e" strokeOpacity="0.28" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="76" fill="none" stroke="#57534e" strokeOpacity="0.2" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="68" fill="none" stroke="#57534e" strokeOpacity="0.16" strokeWidth="0.6" />

          {/* Tick marks around rim */}
          {marks.map((m) => {
            const a = (m.i / markCount) * Math.PI * 2 - Math.PI / 2;
            const r1 = m.major ? 80 : 84;
            const r2 = 89;
            const x1 = 100 + Math.cos(a) * r1;
            const y1 = 100 + Math.sin(a) * r1;
            const x2 = 100 + Math.cos(a) * r2;
            const y2 = 100 + Math.sin(a) * r2;
            return (
              <line
                key={"mk-" + m.i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={m.major ? "#f59e0b" : "#78716c"}
                strokeOpacity={m.major ? 0.55 : 0.35}
                strokeWidth={m.major ? 1.6 : 0.9}
                strokeLinecap="round"
              />
            );
          })}

          {/* Position marker: bright amber wedge/beacon so rotation reads */}
          <g filter={"url(#" + uid + "-glow)"}>
            <path d="M 100 12 L 104.5 30 L 95.5 30 Z" fill="#fbbf24" fillOpacity={0.95} />
          </g>
          <line
            x1="100"
            y1="30"
            x2="100"
            y2="46"
            stroke="#fbbf24"
            strokeOpacity="0.7"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Radial spokes for spin readability */}
          {[0, 1, 2].map((k) => {
            const a = (k / 3) * Math.PI * 2 - Math.PI / 2;
            const x1 = 100 + Math.cos(a) * 34;
            const y1 = 100 + Math.sin(a) * 34;
            const x2 = 100 + Math.cos(a) * 64;
            const y2 = 100 + Math.sin(a) * 64;
            return (
              <line
                key={"spoke-" + k}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#a8a29e"
                strokeOpacity={0.15 + spin * 0.35}
                strokeWidth="1.4"
                strokeLinecap="round"
                style={{ transition: "stroke-opacity 120ms ease-out" }}
              />
            );
          })}
        </g>

        {/* Static sheen highlight on top (does not rotate) */}
        <ellipse cx="100" cy="70" rx="70" ry="46" fill={"url(#" + uid + "-sheen)"} pointerEvents="none" />

        {/* Central label well */}
        <circle
          cx="100"
          cy="100"
          r="33"
          fill={"url(#" + uid + "-well)"}
          stroke="#292524"
          strokeWidth="1.5"
        />
        {/* Rotating spindle ring inside well */}
        <g
          style={{
            transform: "rotate(" + deg + "deg)",
            transformOrigin: "100px 100px",
            transition: dragging ? "none" : "transform 150ms ease-out",
          }}
        >
          <circle
            cx="100"
            cy="100"
            r="27"
            fill="none"
            stroke="#f59e0b"
            strokeOpacity={0.25 + spin * 0.5}
            strokeWidth="1.2"
            strokeDasharray="2 5"
            style={{ transition: "stroke-opacity 120ms ease-out" }}
          />
          {/* strobe dots around the well — the DJ platter dot ring */}
          {gridDots.map((i) => {
            const a = (i / gridCount) * Math.PI * 2;
            const x = 100 + Math.cos(a) * 30;
            const y = 100 + Math.sin(a) * 30;
            const lit = i % 2 === 0;
            return (
              <circle
                key={"gd-" + i}
                cx={x}
                cy={y}
                r={lit ? 1.4 : 1}
                fill={lit ? "#84cc16" : "#57534e"}
                fillOpacity={lit ? 0.6 + spin * 0.4 : 0.4}
                style={{ transition: "fill-opacity 120ms ease-out" }}
              />
            );
          })}
        </g>

        {/* Center hub — glows on scratch */}
        <circle
          cx="100"
          cy="100"
          r={12 + pulse * 2}
          fill={"url(#" + uid + "-hub)"}
          stroke="#78350f"
          strokeWidth="1"
          filter={pulse > 0.15 || dragging ? "url(#" + uid + "-glow)" : undefined}
          style={{ transition: "r 120ms ease-out" }}
        />
        <circle cx="96.5" cy="96.5" r="3.5" fill="#fde68a" fillOpacity="0.75" />

        {/* Active state ring highlight */}
        {dragging ? (
          <circle
            cx="100"
            cy="100"
            r="93"
            fill="none"
            stroke="#fbbf24"
            strokeOpacity="0.5"
            strokeWidth="2.5"
            style={{ transition: "stroke-opacity 150ms ease-out" }}
          />
        ) : null}
      </svg>
    </div>
  );
}

export const JogWheel_MIN = {"base":[4,4]};