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

  const KNOB_START = -135; // degrees at min
  const KNOB_END = 135; // degrees at max
  const KNOB_SWEEP = KNOB_END - KNOB_START;

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;

  const isStepped = props.mode === "stepped";
  const rawSteps = props.steps;

  // Build a clean, sorted, in-range list of step values when stepped.
  const steps = useMemo(() => {
    if (!isStepped || !rawSteps || rawSteps.length === 0) return null;
    const cleaned = rawSteps
      .filter((s) => s >= Math.min(min, max) && s <= Math.max(min, max))
      .slice()
      .sort((a, b) => a - b);
    return cleaned.length > 0 ? cleaned : null;
  }, [isStepped, rawSteps, min, max]);

  const clampToRange = (v: number) => {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return Math.max(lo, Math.min(hi, v));
  };

  const snapToStep = (v: number) => {
    if (!steps) return v;
    let best = steps[0];
    let bestD = Math.abs(v - best);
    for (let i = 1; i < steps.length; i++) {
      const d = Math.abs(v - steps[i]);
      if (d < bestD) {
        best = steps[i];
        bestD = d;
      }
    }
    return best;
  };

  const valueToFrac = (v: number) => clampToRange01((v - min) / span);
  function clampToRange01(f: number) {
    return Math.max(0, Math.min(1, f));
  }

  const displayValue = clampToRange(props.value);
  const frac = valueToFrac(displayValue);
  const angle = KNOB_START + frac * KNOB_SWEEP;

  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const lastReported = useRef(props.value);

  // Pulse the ring when the value changes from outside or from a step commit.
  useEffect(() => {
    if (props.value !== lastReported.current) {
      lastReported.current = props.value;
      setPulseKey((k) => k + 1);
    }
  }, [props.value]);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ startFrac: number; startY: number; startX: number }>(
    { startFrac: 0, startY: 0, startX: 0 }
  );

  const commit = (rawFrac: number) => {
    const clampedFrac = clampToRange01(rawFrac);
    let v = min + clampedFrac * span;
    if (steps) v = snapToStep(v);
    else v = clampToRange(v);
    if (v !== lastReported.current) {
      lastReported.current = v;
      setPulseKey((k) => k + 1);
    }
    props.onChange(v);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragState.current = {
      startFrac: frac,
      startY: e.clientY,
      startX: e.clientX,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = surfaceRef.current?.getBoundingClientRect();
    // Vertical drag is primary; use the element's own size to make sensitivity
    // proportional to the rendered control (cancels host transform via ratio).
    const refSize = rect ? Math.max(rect.height, rect.width) : 200;
    const dy = dragState.current.startY - e.clientY; // up = increase
    const dx = e.clientX - dragState.current.startX; // right = increase (fine)
    // Combine: vertical dominant, horizontal adds a little for tactile feel.
    const delta = (dy * 1.0 + dx * 0.35) / (refSize * 1.15);
    commit(dragState.current.startFrac + delta);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setDragging(false);
  };

  const active = dragging || hovering;

  // Geometry in a fixed viewBox; scales as a unit.
  const CX = 50;
  const CY = 50;
  const R_ARC = 42; // value arc radius
  const R_CAP = 30; // knob cap radius
  const R_TICK_OUT = 46;
  const R_TICK_IN = 40.5;

  const polar = (r: number, deg: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  };

  const arcPath = (startDeg: number, endDeg: number, r: number) => {
    const s = polar(r, startDeg);
    const e = polar(r, endDeg);
    const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
    const sweepFlag = endDeg > startDeg ? 1 : 0;
    return (
      "M " +
      s.x.toFixed(3) +
      " " +
      s.y.toFixed(3) +
      " A " +
      r +
      " " +
      r +
      " 0 " +
      large +
      " " +
      sweepFlag +
      " " +
      e.x.toFixed(3) +
      " " +
      e.y.toFixed(3)
    );
  };

  const trackFull = arcPath(KNOB_START, KNOB_END, R_ARC);
  const trackValue = arcPath(KNOB_START, angle, R_ARC);

  const pointerTip = polar(R_CAP - 3, angle);
  const pointerBase = polar(6, angle);

  // Step tick marks around the dial (only when stepped).
  const stepTicks = useMemo(() => {
    if (!steps) return [] as { deg: number; on: boolean }[];
    return steps.map((s) => {
      const f = valueToFrac(s);
      const deg = KNOB_START + f * KNOB_SWEEP;
      const on = displayValue >= s - 1e-9;
      return { deg, on };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, displayValue]);

  // Decorative minor ticks for continuous mode.
  const minorTicks = useMemo(() => {
    if (steps) return [] as number[];
    const arr: number[] = [];
    const count = 11;
    for (let i = 0; i < count; i++) {
      arr.push(KNOB_START + (i / (count - 1)) * KNOB_SWEEP);
    }
    return arr;
  }, [steps]);

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center select-none">
      <div
        ref={surfaceRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        className={
          "relative aspect-square h-full w-full max-h-full max-w-full touch-none " +
          (dragging ? "cursor-grabbing" : "cursor-grab")
        }
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <radialGradient id={uid + "-cap"} cx="50%" cy="34%" r="75%">
              <stop offset="0%" stopColor="#4b4b4b" />
              <stop offset="42%" stopColor="#2c2c2c" />
              <stop offset="100%" stopColor="#141414" />
            </radialGradient>
            <radialGradient id={uid + "-capGlow"} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={uid + "-rim"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a5a5a" />
              <stop offset="100%" stopColor="#0d0d0d" />
            </linearGradient>
            <linearGradient id={uid + "-arc"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Recessed well */}
          <circle
            cx={CX}
            cy={CY}
            r="48"
            fill="#0a0a0a"
            stroke="#3f3f46"
            strokeOpacity="0.55"
            strokeWidth="1"
          />
          <circle cx={CX} cy={CY} r="48" fill="none" stroke="#000000" strokeOpacity="0.6" strokeWidth="2" />

          {/* Background value track */}
          <path
            d={trackFull}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.85"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d={trackFull}
            fill="none"
            stroke="#27272a"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Active value arc */}
          <path
            key={"arc-" + pulseKey}
            d={trackValue}
            fill="none"
            stroke={"url(#" + uid + "-arc)"}
            strokeWidth={active ? 5.2 : 4.4}
            strokeLinecap="round"
            filter={"url(#" + uid + "-glow)"}
            className="transition-[stroke-width] duration-150 ease-out"
            style={{ opacity: 0.96 }}
          />

          {/* Continuous decorative ticks */}
          {!steps &&
            minorTicks.map((deg, i) => {
              const on = deg <= angle + 0.001;
              const a = polar(R_TICK_OUT, deg);
              const b = polar(R_TICK_IN, deg);
              return (
                <line
                  key={"mtick-" + i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={on ? "#fbbf24" : "#3f3f46"}
                  strokeOpacity={on ? 0.9 : 0.7}
                  strokeWidth={on ? 1.5 : 1}
                  strokeLinecap="round"
                  className="transition-all duration-150 ease-out"
                />
              );
            })}

          {/* Stepped detent ticks */}
          {steps &&
            stepTicks.map((t, i) => {
              const a = polar(R_TICK_OUT + 1, t.deg);
              const b = polar(R_TICK_IN - 0.5, t.deg);
              const dot = polar(R_TICK_OUT + 3.5, t.deg);
              const isCurrent =
                Math.abs(t.deg - angle) < KNOB_SWEEP / (steps.length * 2 + 2);
              return (
                <g key={"stick-" + i}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={t.on ? "#f59e0b" : "#3f3f46"}
                    strokeOpacity={t.on ? 0.95 : 0.75}
                    strokeWidth={isCurrent ? 2.2 : 1.4}
                    strokeLinecap="round"
                    className="transition-all duration-150 ease-out"
                  />
                  {isCurrent && (
                    <circle
                      cx={dot.x}
                      cy={dot.y}
                      r="1.7"
                      fill="#fbbf24"
                      filter={"url(#" + uid + "-glow)"}
                    />
                  )}
                </g>
              );
            })}

          {/* Rim ring */}
          <circle
            cx={CX}
            cy={CY}
            r={R_CAP + 3.5}
            fill="none"
            stroke={"url(#" + uid + "-rim)"}
            strokeWidth="2.4"
          />

          {/* Accent halo behind cap when active */}
          <circle
            cx={CX}
            cy={CY}
            r={R_CAP + 2}
            fill={"url(#" + uid + "-capGlow)"}
            className="transition-opacity duration-200 ease-out"
            style={{ opacity: active ? 1 : 0 }}
          />

          {/* Knob cap */}
          <g
            className="transition-transform duration-100 ease-linear"
            style={{
              transform: "rotate(" + angle + "deg)",
              transformOrigin: "50px 50px",
            }}
          >
            <circle
              cx={CX}
              cy={CY}
              r={R_CAP}
              fill={"url(#" + uid + "-cap)"}
              stroke="#000000"
              strokeOpacity="0.7"
              strokeWidth="1"
            />
            {/* subtle top sheen */}
            <ellipse
              cx={CX}
              cy={CY - 11}
              rx={R_CAP * 0.62}
              ry={R_CAP * 0.32}
              fill="#ffffff"
              opacity="0.06"
            />
            {/* fine knurl ring */}
            <circle
              cx={CX}
              cy={CY}
              r={R_CAP - 4}
              fill="none"
              stroke="#000000"
              strokeOpacity="0.35"
              strokeWidth="0.6"
            />
            {/* pointer indicator */}
            <line
              x1={pointerBase.x}
              y1={pointerBase.y}
              x2={pointerTip.x}
              y2={pointerTip.y}
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
              filter={"url(#" + uid + "-glow)"}
            />
            <circle
              cx={pointerTip.x}
              cy={pointerTip.y}
              r="2.4"
              fill="#fde68a"
            />
            {/* center hub */}
            <circle cx={CX} cy={CY} r="4" fill="#1c1c1c" stroke="#000" strokeOpacity="0.6" strokeWidth="0.8" />
            <circle cx={CX} cy={CY} r="1.4" fill="#f59e0b" opacity="0.85" />
          </g>

          {/* Pulse ring on value change */}
          <circle
            key={"pulse-" + pulseKey}
            cx={CX}
            cy={CY}
            r={R_CAP + 4}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.6"
            className="motion-reduce:hidden"
            style={{
              transformOrigin: "50px 50px",
              animation: "none",
            }}
          >
            <animate
              attributeName="r"
              from={String(R_CAP + 4)}
              to={String(R_CAP + 12)}
              dur="0.5s"
              begin="0s"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              from="0.55"
              to="0"
              dur="0.5s"
              begin="0s"
              fill="freeze"
            />
          </circle>
        </svg>
      </div>
    </div>
  );
}