type KnobProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  mode?: 'continuous' | 'stepped';
  steps?: number[];
};

export function Knob(props: KnobProps) {
  const KNOB_ARC = 270; // total sweep in degrees
  const KNOB_START = -135; // degrees from top (12 o'clock), left extent
  const KNOB_END = 135; // right extent

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragState = useRef<{
    startY: number;
    startX: number;
    startValue: number;
    range: number;
  } | null>(null);

  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pulse, setPulse] = useState(0); // increments on committed value change for tick flash
  const lastValueRef = useRef(props.value);

  const stepped = props.mode === 'stepped';
  const rawSteps = props.steps;
  const useSteps = stepped && Array.isArray(rawSteps) && rawSteps.length > 0;

  // Sorted, clamped step list
  const sortedSteps = useMemo(() => {
    if (!useSteps) return null;
    const s = rawSteps!.slice().sort((a, b) => a - b);
    return s;
  }, [useSteps, rawSteps]);

  const lo = Math.min(props.min, props.max);
  const hi = Math.max(props.min, props.max);
  const span = hi - lo || 1;

  const clamp = (v: number) => (v < lo ? lo : v > hi ? hi : v);

  const snapToStep = (v: number): number => {
    if (!sortedSteps || sortedSteps.length === 0) return clamp(v);
    let best = sortedSteps[0];
    let bestDist = Math.abs(v - best);
    for (let i = 1; i < sortedSteps.length; i++) {
      const d = Math.abs(v - sortedSteps[i]);
      if (d < bestDist) {
        bestDist = d;
        best = sortedSteps[i];
      }
    }
    return best;
  };

  // normalized 0..1 of current value
  const norm = useMemo(() => {
    const v = clamp(props.value);
    return (v - lo) / span;
  }, [props.value, lo, span]);

  const angleForNorm = (n: number) => KNOB_START + n * KNOB_ARC;
  const currentAngle = angleForNorm(norm);

  // detect committed value change to flash indicator
  useEffect(() => {
    if (props.value !== lastValueRef.current) {
      lastValueRef.current = props.value;
      setPulse((p) => p + 1);
    }
  }, [props.value]);

  const commit = (v: number) => {
    const finalV = useSteps ? snapToStep(v) : clamp(v);
    if (finalV !== props.value) props.onChange(finalV);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragState.current = {
      startY: e.clientY,
      startX: e.clientX,
      startValue: clamp(props.value),
      range: span,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const st = dragState.current;
    if (!st) return;
    e.preventDefault();
    // Vertical drag primary; combine with horizontal for fine control feel
    const dy = st.startY - e.clientY;
    const dx = e.clientX - st.startX;
    const delta = dy + dx * 0.35;
    // Full travel over ~220px; shift for fine mode
    const sensitivity = e.shiftKey ? 520 : 220;
    const frac = delta / sensitivity;
    let next = st.startValue + frac * st.range;
    next = clamp(next);
    if (useSteps) {
      // live snap for tactile detents
      next = snapToStep(next);
    }
    commit(next);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
    dragState.current = null;
    setDragging(false);
  };

  // Geometry within viewBox 100x100
  const CX = 50;
  const CY = 50;
  const R_OUTER = 46; // arc radius
  const R_TICK_OUT = 45.5;
  const R_TICK_IN = 39;
  const R_CAP = 30; // knob cap radius
  const R_POINTER_OUT = 27;
  const R_POINTER_IN = 9;

  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  // Build arc path helper
  const arcPath = (r: number, startDeg: number, endDeg: number) => {
    const s = polar(CX, CY, r, startDeg);
    const e = polar(CX, CY, r, endDeg);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweep = endDeg > startDeg ? 1 : 0;
    return (
      'M ' + s.x.toFixed(3) + ' ' + s.y.toFixed(3) +
      ' A ' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' +
      e.x.toFixed(3) + ' ' + e.y.toFixed(3)
    );
  };

  const trackBg = arcPath(R_OUTER, KNOB_START, KNOB_END);
  const trackFill = arcPath(R_OUTER, KNOB_START, currentAngle);

  // Step markers (for stepped mode)
  const stepMarks = useMemo(() => {
    if (!sortedSteps) return [] as { angle: number; active: boolean; n: number }[];
    return sortedSteps.map((sv) => {
      const n = (clamp(sv) - lo) / span;
      const angle = angleForNorm(n);
      const active = Math.abs(clamp(sv) - clamp(props.value)) < 1e-6;
      return { angle, active, n };
    });
  }, [sortedSteps, lo, span, props.value]);

  // Continuous ticks (decorative graduation) when not stepped
  const contTicks = useMemo(() => {
    if (useSteps) return [] as number[];
    const arr: number[] = [];
    const count = 11;
    for (let i = 0; i < count; i++) arr.push(i / (count - 1));
    return arr;
  }, [useSteps]);

  const pointerTip = polar(CX, CY, R_POINTER_OUT, currentAngle);
  const pointerBase = polar(CX, CY, R_POINTER_IN, currentAngle);

  const glowOpacity = dragging ? 0.9 : hovering ? 0.55 : 0.32;
  const capLift = dragging ? 0.99 : hovering ? 1.015 : 1;

  return (
    <div
      className="h-full w-full min-w-0 min-h-0 flex items-center justify-center select-none touch-none"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full overflow-visible cursor-ns-resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <radialGradient id="knobCapGrad" cx="50%" cy="34%" r="75%">
            <stop offset="0%" stopColor="#4a4642" />
            <stop offset="42%" stopColor="#33302c" />
            <stop offset="100%" stopColor="#131211" />
          </radialGradient>
          <radialGradient id="knobCapInner" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#5a544c" />
            <stop offset="60%" stopColor="#2a2723" />
            <stop offset="100%" stopColor="#151412" />
          </radialGradient>
          <linearGradient id="knobRingSheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>
          <filter id="knobGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Recessed well */}
        <circle cx={CX} cy={CY} r={R_OUTER + 2.5} fill="#0a0a09" />
        <circle
          cx={CX}
          cy={CY}
          r={R_OUTER + 2.5}
          fill="none"
          stroke="#000000"
          strokeOpacity="0.85"
          strokeWidth="2.5"
        />
        <circle
          cx={CX}
          cy={CY}
          r={R_OUTER - 0.5}
          fill="none"
          stroke="#3f3b36"
          strokeOpacity="0.5"
          strokeWidth="0.6"
        />

        {/* Graduation ticks */}
        {!useSteps &&
          contTicks.map((n, i) => {
            const a = angleForNorm(n);
            const p1 = polar(CX, CY, R_TICK_OUT, a);
            const p2 = polar(CX, CY, R_TICK_IN + 2.5, a);
            const passed = n <= norm + 1e-3;
            return (
              <line
                key={"ct-" + i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={passed ? '#fbbf24' : '#57534e'}
                strokeOpacity={passed ? 0.85 : 0.55}
                strokeWidth={i === 0 || i === contTicks.length - 1 ? 1.4 : 0.9}
                strokeLinecap="round"
                style={{ transition: 'stroke 140ms ease-out, stroke-opacity 140ms ease-out' }}
              />
            );
          })}

        {/* Background arc track */}
        <path
          d={trackBg}
          fill="none"
          stroke="#292524"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={trackFill}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter="url(#knobGlow)"
          style={{
            transition: dragging ? 'none' : 'stroke-dashoffset 100ms linear',
            opacity: 0.95,
          }}
        />

        {/* Stepped detent markers on top of arc */}
        {useSteps &&
          stepMarks.map((m, i) => {
            const outer = polar(CX, CY, R_TICK_OUT + 1.5, m.angle);
            const inner = polar(CX, CY, R_TICK_IN, m.angle);
            const dot = polar(CX, CY, R_OUTER, m.angle);
            return (
              <g key={"sm-" + i}>
                <line
                  x1={outer.x}
                  y1={outer.y}
                  x2={inner.x}
                  y2={inner.y}
                  stroke={m.active ? '#fcd34d' : '#6b6259'}
                  strokeOpacity={m.active ? 1 : 0.7}
                  strokeWidth={m.active ? 2 : 1.1}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 160ms ease-out, stroke-width 160ms ease-out' }}
                />
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={m.active ? 2.6 : 1.3}
                  fill={m.active ? '#fbbf24' : '#3f3b36'}
                  filter={m.active ? 'url(#knobGlow)' : undefined}
                  style={{ transition: 'r 160ms ease-out, fill 160ms ease-out' }}
                />
              </g>
            );
          })}

        {/* Knob cap group (rotates) */}
        <g
          style={{
            transformOrigin: '50px 50px',
            transform: 'scale(' + capLift + ')',
            transition: 'transform 140ms ease-out',
          }}
        >
          {/* Outer accent glow ring under cap */}
          <circle
            cx={CX}
            cy={CY}
            r={R_CAP + 2.5}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.4"
            strokeOpacity={glowOpacity}
            filter="url(#knobGlow)"
            style={{ transition: 'stroke-opacity 200ms ease-out' }}
          />
          {/* Cap base */}
          <circle cx={CX} cy={CY} r={R_CAP} fill="url(#knobCapGrad)" />
          {/* Metallic seam */}
          <circle
            cx={CX}
            cy={CY}
            r={R_CAP}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.6"
            strokeWidth="1.2"
          />
          <circle
            cx={CX}
            cy={CY}
            r={R_CAP - 3.5}
            fill="url(#knobCapInner)"
            stroke="#000000"
            strokeOpacity="0.35"
            strokeWidth="0.8"
          />
          {/* Sheen overlay */}
          <circle cx={CX} cy={CY} r={R_CAP - 1} fill="url(#knobRingSheen)" />

          {/* Rotating pointer */}
          <g
            style={{
              transformOrigin: '50px 50px',
              transform: 'rotate(' + currentAngle + 'deg)',
              transition: dragging ? 'none' : 'transform 110ms ease-out',
            }}
          >
            {/* pointer channel groove */}
            <line
              x1={CX}
              y1={CY - R_POINTER_IN}
              x2={CX}
              y2={CY - R_POINTER_OUT}
              stroke="#000000"
              strokeOpacity="0.55"
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            {/* pointer bright */}
            <line
              x1={CX}
              y1={CY - R_POINTER_IN}
              x2={CX}
              y2={CY - R_POINTER_OUT}
              stroke="#fcd34d"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#knobGlow)"
            />
            {/* pointer tip cap */}
            <circle
              cx={CX}
              cy={CY - R_POINTER_OUT}
              r={2.2}
              fill="#fde68a"
              filter="url(#knobGlow)"
            />
          </g>

          {/* Center hub */}
          <circle cx={CX} cy={CY} r={4.2} fill="#1a1917" stroke="#000" strokeOpacity="0.5" strokeWidth="0.6" />
          <circle cx={CX} cy={CY - 0.6} r={2.4} fill="#3f3b36" />
        </g>

        {/* Value-change flash ring (keyed by pulse) */}
        <circle
          key={"flash-" + pulse}
          cx={CX}
          cy={CY}
          r={R_CAP + 4}
          fill="none"
          stroke="#fcd34d"
          strokeWidth="1.5"
          className="motion-reduce:hidden"
          style={{
            transformOrigin: '50px 50px',
            animation: 'knobFlash 420ms ease-out forwards',
            pointerEvents: 'none',
          }}
        />

        <style>{`
          @keyframes knobFlash {
            0% { opacity: 0.75; transform: scale(0.96); }
            100% { opacity: 0; transform: scale(1.12); }
          }
        `}</style>
      </svg>
    </div>
  );
}