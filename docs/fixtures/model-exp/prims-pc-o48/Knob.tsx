type KnobProps = { min: number; max: number; value: number; onChange: (v: number) => void; mode?: 'continuous' | 'stepped'; steps?: number[] };

export const Knob_MIN = {"base":[1.75,1.75]};

export function Knob(props: KnobProps) {
  const { min, max, value, onChange, mode, steps } = props;

  const uid = useRef("knob-" + Math.random().toString(36).slice(2)).current;

  const stepped = mode === "stepped";
  const useSteps = stepped && Array.isArray(steps) && steps.length > 0;

  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState(false);
  const [flash, setFlash] = useState(false);

  const dragRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ startY: 0, startVal: 0 });

  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const span = safeMax - safeMin || 1;

  const KnobClamp = (v: number) => Math.max(safeMin, Math.min(safeMax, v));

  const sortedSteps = useMemo(() => {
    if (!useSteps) return [];
    return (steps as number[]).slice().sort((a, b) => a - b);
  }, [useSteps, steps]);

  const KnobSnap = (v: number) => {
    if (!useSteps) return v;
    let best = sortedSteps[0];
    let bestD = Math.abs(v - best);
    for (let i = 1; i < sortedSteps.length; i++) {
      const d = Math.abs(v - sortedSteps[i]);
      if (d < bestD) { bestD = d; best = sortedSteps[i]; }
    }
    return best;
  };

  const cur = KnobClamp(value);
  const frac = (cur - safeMin) / span;

  // Sweep from -135deg to +135deg (270deg total)
  const A0 = -135;
  const A1 = 135;
  const angle = A0 + frac * (A1 - A0);

  // Geometry (viewBox 0..100)
  const cx = 50;
  const cy = 50;
  const rTrack = 40;
  const rKnob = 30;

  const KnobPolar = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const KnobArc = (a: number, b: number, r: number) => {
    const start = KnobPolar(a, r);
    const end = KnobPolar(b, r);
    const large = Math.abs(b - a) > 180 ? 1 : 0;
    return "M " + start.x + " " + start.y + " A " + r + " " + r + " 0 " + large + " 1 " + end.x + " " + end.y;
  };

  const trackArc = KnobArc(A0, A1, rTrack);
  const fillArc = KnobArc(A0, angle, rTrack);

  const emitFromDelta = (dy: number) => {
    const range = 200; // px for full travel
    const delta = (-dy / range) * span;
    let next = KnobClamp(dragState.current.startVal + delta);
    if (useSteps) next = KnobSnap(next);
    if (next !== value) onChange(next);
  };

  const onPointerDown = (e: any) => {
    e.stopPropagation();
    const el = dragRef.current;
    if (el && el.setPointerCapture) {
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    }
    dragState.current = { startY: e.clientY, startVal: cur };
    setDrag(true);
  };

  const onPointerMove = (e: any) => {
    if (!drag) return;
    emitFromDelta(e.clientY - dragState.current.startY);
  };

  const endDrag = (e: any) => {
    if (!drag) return;
    const el = dragRef.current;
    if (el && el.releasePointerCapture) {
      try { el.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    setDrag(false);
  };

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 180);
    return () => clearTimeout(t);
  }, [cur]);

  const active = hover || drag;

  // Detent ticks for stepped mode
  const detents = useMemo(() => {
    if (!useSteps) return [];
    return sortedSteps.map((s) => {
      const f = (KnobClamp(s) - safeMin) / span;
      const a = A0 + f * (A1 - A0);
      return { a, val: s };
    });
  }, [useSteps, sortedSteps, safeMin, span]);

  return (
    <div
      className="h-full w-full relative select-none"
      style={{ minWidth: Knob_MIN.base[0] + "rem", minHeight: Knob_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          ref={dragRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={"relative touch-none cursor-ns-resize transition-transform duration-150 ease-out " + (drag ? "scale-95" : active ? "scale-105" : "scale-100")}
          style={{ width: "100%", height: "100%", aspectRatio: "1 / 1", maxWidth: "100%", maxHeight: "100%" }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <radialGradient id={uid + "-cap"} cx="42%" cy="34%" r="78%">
                <stop offset="0%" stopColor="#44403c" />
                <stop offset="55%" stopColor="#292524" />
                <stop offset="100%" stopColor="#0c0a09" />
              </radialGradient>
              <radialGradient id={uid + "-well"} cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
              </radialGradient>
              <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Recessed well shadow */}
            <circle cx={cx} cy={cy} r={rTrack + 6} fill={"url(#" + uid + "-well)"} />

            {/* Track groove */}
            <path
              d={trackArc}
              fill="none"
              stroke="#1c1917"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d={trackArc}
              fill="none"
              stroke="#44403c"
              strokeOpacity="0.5"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Detent ticks (stepped) */}
            {detents.map((d, i) => {
              const outer = KnobPolar(d.a, rTrack + 5.5);
              const inner = KnobPolar(d.a, rTrack + 1.5);
              const lit = Math.abs(d.a - angle) < 0.5;
              return (
                <line
                  key={"det-" + i}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={lit ? "#a3e635" : "#57534e"}
                  strokeOpacity={lit ? 1 : 0.7}
                  strokeWidth={lit ? 2.4 : 1.6}
                  strokeLinecap="round"
                  className="transition-all duration-150 ease-out"
                />
              );
            })}

            {/* Active fill arc */}
            <path
              d={fillArc}
              fill="none"
              stroke={"url(#" + uid + "-fill)"}
              strokeWidth="7"
              strokeLinecap="round"
              filter={active || flash ? "url(#" + uid + "-glow)" : undefined}
              className="transition-all duration-150 ease-out"
              style={{ opacity: active ? 1 : 0.92 }}
            />

            {/* Knob cap */}
            <circle
              cx={cx}
              cy={cy}
              r={rKnob}
              fill={"url(#" + uid + "-cap)"}
              stroke="#57534e"
              strokeOpacity="0.8"
              strokeWidth="2"
            />
            {/* Cap inner sheen ring */}
            <circle
              cx={cx}
              cy={cy}
              r={rKnob - 3.5}
              fill="none"
              stroke="#78716c"
              strokeOpacity={active ? 0.35 : 0.18}
              strokeWidth="1"
              className="transition-all duration-200 ease-out"
            />

            {/* Pointer indicator */}
            <g
              style={{ transformOrigin: "50px 50px", transform: "rotate(" + angle + "deg)" }}
              className="transition-transform duration-150 ease-out"
            >
              <line
                x1={cx}
                y1={cy - rKnob + 5}
                x2={cx}
                y2={cy - 9}
                stroke={flash ? "#a3e635" : "#fbbf24"}
                strokeWidth="3.2"
                strokeLinecap="round"
                filter={active || flash ? "url(#" + uid + "-glow)" : undefined}
                className="transition-colors duration-150 ease-out"
              />
              <circle
                cx={cx}
                cy={cy - rKnob + 6.5}
                r="2.2"
                fill={flash ? "#a3e635" : "#fdba74"}
                className="transition-colors duration-150 ease-out"
              />
            </g>

            {/* Center hub */}
            <circle cx={cx} cy={cy} r="4.5" fill="#0c0a09" stroke="#57534e" strokeOpacity="0.6" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="1.6" fill={active ? "#f59e0b" : "#292524"} className="transition-colors duration-200 ease-out" />
          </svg>
        </div>
      </div>
    </div>
  );
}