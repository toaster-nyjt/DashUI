type KnobProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  mode?: 'continuous' | 'stepped';
  steps?: number[];
};

export const Knob_MIN = {"base":[2,2]};

export function Knob(props: KnobProps) {
  const uid = useRef("knob-" + Math.random().toString(36).slice(2)).current;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);

  const floor = (Knob_MIN as any).base;

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;

  // Sweep geometry: gap at the bottom, sweep from -135deg to +135deg.
  const START = -135;
  const END = 135;
  const SWEEP = END - START; // 270

  const isStepped = props.mode === "stepped";
  const rawSteps = props.steps;
  const steps = useMemo(() => {
    if (!rawSteps || rawSteps.length === 0) return null;
    const s = rawSteps.slice().sort((a, b) => a - b);
    return s;
  }, [rawSteps]);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const snap = (v: number) => {
    if (!isStepped || !steps) return v;
    let best = steps[0];
    let bestD = Math.abs(v - best);
    for (let i = 1; i < steps.length; i++) {
      const d = Math.abs(v - steps[i]);
      if (d < bestD) {
        bestD = d;
        best = steps[i];
      }
    }
    return best;
  };

  const value = clamp(props.value);
  const norm = (value - min) / span; // 0..1
  const angle = START + norm * SWEEP;

  // The visible arc gap (bottom). Half-width of the gap in the full circle.
  const GAP = (360 - SWEEP) / 2; // 45

  // SVG viewBox is 100x100, center 50,50.
  const CX = 50;
  const CY = 50;
  const R_TRACK = 40; // arc radius
  const R_BODY = 30; // knob body radius

  const polar = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };

  const arcPath = (a0: number, a1: number, r: number) => {
    const p0 = polar(a0, r);
    const p1 = polar(a1, r);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const sweepFlag = a1 > a0 ? 1 : 0;
    return "M " + p0.x + " " + p0.y + " A " + r + " " + r + " 0 " + large + " " + sweepFlag + " " + p1.x + " " + p1.y;
  };

  const applyFromPointer = (clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Determine square region (the SVG uses meet, centered).
    const size = Math.min(rect.width, rect.height);
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    // Angle from top, clockwise positive.
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI; // -180..180
    // Clamp into the active sweep, treat the bottom gap.
    if (deg < START) {
      // Could be near the bottom gap; decide nearest end.
      // Map angles in the gap (below START or above END) to nearest boundary.
      deg = deg < -180 + GAP ? END : START;
      // if it's on the left side of gap -> START, right side handled below
    }
    if (deg > END) deg = END;
    if (deg < START) deg = START;
    const n = (deg - START) / SWEEP;
    let v = min + n * span;
    v = clamp(snap(v));
    props.onChange(v);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    applyFromPointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    applyFromPointer(e.clientX, e.clientY);
  };
  const endDrag = (e: React.PointerEvent) => {
    if ((e.target as Element).hasPointerCapture?.(e.pointerId)) {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    }
    setDragging(false);
  };

  // Pointer/indicator dot on the knob body pointing outward.
  const indicatorOuter = polar(angle, R_BODY - 3);
  const indicatorInner = polar(angle, R_BODY * 0.42);

  const active = dragging || hover;

  // Step tick marks (stepped mode only).
  const stepTicks = useMemo(() => {
    if (!isStepped || !steps) return [];
    return steps.map((s) => {
      const n = (clamp(s) - min) / span;
      const a = START + n * SWEEP;
      const outer = polar(a, R_TRACK + 5);
      const inner = polar(a, R_TRACK - 1);
      const isCurrent = s === value;
      return { s, a, outer, inner, isCurrent };
    });
  }, [isStepped, steps, min, span, value]);

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem", cursor: dragging ? "grabbing" : "grab" }}
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <radialGradient id={uid + "-body"} cx="42%" cy="34%" r="75%">
            <stop offset="0%" stopColor="#3a352f" />
            <stop offset="45%" stopColor="#26221e" />
            <stop offset="100%" stopColor="#0c0a09" />
          </radialGradient>
          <radialGradient id={uid + "-sheen"} cx="40%" cy="28%" r="60%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={active ? 0.22 : 0.1} />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={uid + "-fill"} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={active ? 2.4 : 1.4} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track background arc */}
        <path
          d={arcPath(START, END, R_TRACK)}
          fill="none"
          stroke="#292524"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Track subtle ring */}
        <path
          d={arcPath(START, END, R_TRACK)}
          fill="none"
          stroke="#57534e"
          strokeOpacity="0.35"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Value fill arc */}
        {norm > 0.001 && (
          <path
            d={arcPath(START, angle, R_TRACK)}
            fill="none"
            stroke={"url(#" + uid + "-fill)"}
            strokeWidth="6"
            strokeLinecap="round"
            filter={"url(#" + uid + "-glow)"}
            style={{ transition: dragging ? "none" : "all 150ms ease-out" }}
          />
        )}

        {/* Step ticks */}
        {stepTicks.map((t, i) => (
          <line
            key={"tk-" + i}
            x1={t.inner.x}
            y1={t.inner.y}
            x2={t.outer.x}
            y2={t.outer.y}
            stroke={t.isCurrent ? "#fbbf24" : "#78716c"}
            strokeOpacity={t.isCurrent ? 1 : 0.5}
            strokeWidth={t.isCurrent ? 2.4 : 1.4}
            strokeLinecap="round"
            style={{ transition: "all 150ms ease-out" }}
          />
        ))}

        {/* Knob body */}
        <g
          style={{ transformOrigin: "50px 50px", transition: dragging ? "none" : "transform 150ms ease-out" }}
        >
          <circle cx={CX} cy={CY} r={R_BODY + 1.5} fill="#0c0a09" fillOpacity="0.9" />
          <circle
            cx={CX}
            cy={CY}
            r={R_BODY}
            fill={"url(#" + uid + "-body)"}
            stroke="#57534e"
            strokeOpacity={active ? 0.9 : 0.7}
            strokeWidth="1.6"
          />
          <circle cx={CX} cy={CY} r={R_BODY} fill={"url(#" + uid + "-sheen)"} />

          {/* Indicator line */}
          <line
            x1={indicatorInner.x}
            y1={indicatorInner.y}
            x2={indicatorOuter.x}
            y2={indicatorOuter.y}
            stroke="#fcd34d"
            strokeWidth="3"
            strokeLinecap="round"
            filter={"url(#" + uid + "-glow)"}
            style={{ transition: dragging ? "none" : "all 150ms ease-out" }}
          />
          {/* Indicator dot */}
          <circle
            cx={indicatorOuter.x}
            cy={indicatorOuter.y}
            r={active ? 3 : 2.4}
            fill="#fde68a"
            filter={"url(#" + uid + "-glow)"}
            style={{ transition: dragging ? "none" : "all 150ms ease-out" }}
          />
          {/* Center hub */}
          <circle cx={CX} cy={CY} r={R_BODY * 0.34} fill="#171310" stroke="#3f3a34" strokeWidth="1" />
          <circle
            cx={CX}
            cy={CY}
            r={R_BODY * 0.34}
            fill="none"
            stroke="#f59e0b"
            strokeOpacity={active ? 0.55 : 0.25}
            strokeWidth="1.2"
            style={{ transition: "all 200ms ease-out" }}
          />
        </g>
      </svg>
    </div>
  );
}