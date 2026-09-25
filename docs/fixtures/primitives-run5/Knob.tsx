type KnobProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  mode?: "continuous" | "stepped";
  steps?: number[];
};

export function Knob(props: KnobProps) {
  const uid = useRef("knob-" + Math.random().toString(36).slice(2)).current;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;

  // Sanitize + sort steps when stepped
  const isStepped = props.mode === "stepped" && !!props.steps && props.steps.length > 0;
  const sortedSteps = useMemo(() => {
    if (!props.steps || props.steps.length === 0) return [];
    return props.steps.slice().sort((a, b) => a - b);
  }, [props.steps]);

  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const snap = (v: number) => {
    if (!isStepped) return clamp(v);
    let best = sortedSteps[0];
    let bestD = Math.abs(v - best);
    for (let i = 1; i < sortedSteps.length; i++) {
      const d = Math.abs(v - sortedSteps[i]);
      if (d < bestD) {
        bestD = d;
        best = sortedSteps[i];
      }
    }
    return clamp(best);
  };

  const current = clamp(props.value);
  const t = (current - min) / span; // 0..1

  // Rotation sweep: -135deg (min) .. +135deg (max)
  const START = -135;
  const SWEEP = 270;
  const angleForT = (tt: number) => START + tt * SWEEP;
  const angle = angleForT(t);

  // Geometry in viewBox coords
  const CX = 50;
  const CY = 50;
  const R_RING = 40; // arc radius
  const R_BODY = 30; // knob body radius

  const polar = (aDeg: number, r: number) => {
    const a = ((aDeg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };

  // Arc path from angle a0 to a1 (in "12 o'clock=0, cw positive" space we already use polar with -90)
  const arcPath = (a0: number, a1: number, r: number) => {
    const p0 = polar(a0, r);
    const p1 = polar(a1, r);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const sweepFlag = a1 > a0 ? 1 : 0;
    return "M " + p0.x + " " + p0.y + " A " + r + " " + r + " 0 " + large + " " + sweepFlag + " " + p1.x + " " + p1.y;
  };

  // Pointer -> value mapping via angle around center, using RATIO of measured rect (cancels transform)
  const pointerToValue = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    if (!el) return current;
    const rect = el.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width; // 0..1
    const ny = (clientY - rect.top) / rect.height;
    const dx = nx - 0.5;
    const dy = ny - 0.5;
    // atan2 with 12 o'clock = 0, clockwise positive
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI; // -180..180
    // clamp to sweep
    if (deg < START) deg = START;
    if (deg > START + SWEEP) deg = START + SWEEP;
    const tt = (deg - START) / SWEEP;
    return snap(min + tt * span);
  };

  const commit = (clientX: number, clientY: number) => {
    const v = pointerToValue(clientX, clientY);
    if (v !== props.value) props.onChange(v);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    commit(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    commit(e.clientX, e.clientY);
  };
  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const pointerTip = polar(angle, R_BODY - 4);
  const pointerBase = polar(angle, 8);
  const active = dragging || hovering;

  // Precompute step tick positions
  const stepTicks = useMemo(() => {
    if (!isStepped) return [];
    return sortedSteps.map((s) => {
      const st = (clamp(s) - min) / span;
      const a = angleForT(st);
      const inner = polar(a, R_RING - 6);
      const outer = polar(a, R_RING + 1);
      const reached = st <= t + 1e-6;
      return { a, inner, outer, reached, key: s };
    });
  }, [isStepped, sortedSteps, min, span, t]);

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none cursor-pointer"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
      >
        <defs>
          <radialGradient id={uid + "-body"} cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#3a3733" />
            <stop offset="55%" stopColor="#1f1d1b" />
            <stop offset="100%" stopColor="#0b0a09" />
          </radialGradient>
          <radialGradient id={uid + "-well"} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={uid + "-arc"} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={active ? 1.6 : 0.8} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Track arc (unfilled) */}
        <path
          d={arcPath(START, START + SWEEP, R_RING)}
          fill="none"
          stroke="#44403c"
          strokeOpacity="0.6"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={arcPath(START, angle, R_RING)}
          fill="none"
          stroke={"url(#" + uid + "-arc)"}
          strokeWidth={active ? 5 : 4}
          strokeLinecap="round"
          filter={"url(#" + uid + "-glow)"}
          style={{ transition: "stroke-width 150ms ease-out" }}
        />

        {/* Step ticks (stepped mode only) */}
        {stepTicks.map((tk, i) => (
          <line
            key={"stk-" + uid + "-" + i}
            x1={tk.inner.x}
            y1={tk.inner.y}
            x2={tk.outer.x}
            y2={tk.outer.y}
            stroke={tk.reached ? "#fbbf24" : "#57534e"}
            strokeOpacity={tk.reached ? 0.95 : 0.7}
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ transition: "stroke 150ms ease-out, stroke-opacity 150ms ease-out" }}
          />
        ))}

        {/* Outer shadow ring */}
        <circle cx={CX} cy={CY} r={R_BODY + 2} fill="#000000" fillOpacity="0.5" />

        {/* Knob body */}
        <circle
          cx={CX}
          cy={CY}
          r={R_BODY}
          fill={"url(#" + uid + "-body)"}
          stroke="#57534e"
          strokeOpacity={active ? 0.95 : 0.8}
          strokeWidth="2"
          style={{ transition: "stroke-opacity 200ms ease-out" }}
        />

        {/* Inner sheen well */}
        <circle cx={CX} cy={CY} r={R_BODY - 3} fill={"url(#" + uid + "-well)"} />

        {/* Rotating pointer group */}
        <g
          style={{
            transformOrigin: "50px 50px",
            transform: "rotate(" + angle + "deg)",
            transition: dragging ? "none" : "transform 150ms ease-out",
          }}
        >
          {/* pointer stalk (drawn straight up, rotated by group) */}
          <line
            x1={CX}
            y1={CY - 8}
            x2={CX}
            y2={CY - (R_BODY - 4)}
            stroke={active ? "#fde68a" : "#fbbf24"}
            strokeWidth="3"
            strokeLinecap="round"
            filter={"url(#" + uid + "-glow)"}
            style={{ transition: "stroke 200ms ease-out" }}
          />
          {/* pointer tip dot */}
          <circle
            cx={CX}
            cy={CY - (R_BODY - 4)}
            r={active ? 3 : 2.4}
            fill={active ? "#fef3c7" : "#f59e0b"}
            filter={"url(#" + uid + "-glow)"}
            style={{ transition: "r 150ms ease-out, fill 200ms ease-out" }}
          />
        </g>

        {/* Center cap */}
        <circle
          cx={CX}
          cy={CY}
          r="6"
          fill="#1c1917"
          stroke="#78716c"
          strokeOpacity="0.6"
          strokeWidth="1"
        />
        <circle cx={CX - 1.6} cy={CY - 1.6} r="1.6" fill="#57534e" fillOpacity="0.7" />
      </svg>
    </div>
  );
}