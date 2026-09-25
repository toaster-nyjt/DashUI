type KnobProps = { min: number; max: number; value: number; onChange: (v: number) => void; steps?: number[] };
export function Knob(props: KnobProps) {
  const { min, max, value, onChange, steps } = props;

  const KnobSTART_ANGLE = -135;
  const KnobEND_ANGLE = 135;
  const KnobSWEEP = KnobEND_ANGLE - KnobSTART_ANGLE;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startY: number; startX: number; startVal: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : 1;
  const range = safeMax - safeMin || 1;

  const clamp = (v: number) => Math.max(safeMin, Math.min(safeMax, v));

  const sortedSteps =
    steps && steps.length > 0
      ? [...steps].filter((s) => Number.isFinite(s)).sort((a, b) => a - b)
      : null;

  const snap = (v: number) => {
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

  const curVal = clamp(value);
  const frac = (curVal - safeMin) / range;
  const angle = KnobSTART_ANGLE + frac * KnobSWEEP;

  const prevValRef = useRef(curVal);
  useEffect(() => {
    if (prevValRef.current !== curVal) {
      prevValRef.current = curVal;
      setPulseKey((k) => k + 1);
    }
  }, [curVal]);

  const commitFromDelta = (clientX: number, clientY: number) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = d.startY - clientY;
    const dx = clientX - d.startX;
    const combined = dy + dx * 0.35;
    const sensitivity = 220;
    let next = d.startVal + (combined / sensitivity) * range;
    next = clamp(next);
    if (sortedSteps) next = snap(next);
    if (next !== value) onChange(next);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startX: e.clientX, startVal: curVal };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    commitFromDelta(e.clientX, e.clientY);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (dragRef.current) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    dragRef.current = null;
    setDragging(false);
  };

  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    const s = polar(cx, cy, r, a0);
    const e = polar(cx, cy, r, a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const sweepFlag = a1 > a0 ? 1 : 0;
    return "M " + s.x + " " + s.y + " A " + r + " " + r + " 0 " + large + " " + sweepFlag + " " + e.x + " " + e.y;
  };

  const CX = 50;
  const CY = 50;
  const trackR = 40;
  const capR = 27;

  const tickAngles: number[] = [];
  if (sortedSteps) {
    for (const s of sortedSteps) {
      const f = (clamp(s) - safeMin) / range;
      tickAngles.push(KnobSTART_ANGLE + f * KnobSWEEP);
    }
  } else {
    const N = 9;
    for (let i = 0; i < N; i++) tickAngles.push(KnobSTART_ANGLE + (i / (N - 1)) * KnobSWEEP);
  }

  const active = dragging || hovering;
  const pointerTip = polar(CX, CY, capR - 3, angle);
  const pointerBase = polar(CX, CY, 7, angle);

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      className={
        "h-full w-full min-w-0 min-h-0 touch-none select-none [container-type:size] flex items-center justify-center " +
        (dragging ? "cursor-grabbing" : "cursor-grab")
      }
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <radialGradient id="knobCapFill" cx="50%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#565452" />
            <stop offset="46%" stopColor="#3a3836" />
            <stop offset="100%" stopColor="#161514" />
          </radialGradient>
          <radialGradient id="knobCapSheen" cx="50%" cy="26%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="knobPointer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="knobGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* recessed well */}
        <circle cx={CX} cy={CY} r={trackR + 6} fill="#0a0908" />
        <circle
          cx={CX}
          cy={CY}
          r={trackR + 6}
          fill="none"
          stroke="#000000"
          strokeOpacity="0.7"
          strokeWidth="1.4"
        />

        {/* tick marks */}
        {tickAngles.map((ta, i) => {
          const isPast = ta <= angle + 0.001;
          const outer = polar(CX, CY, trackR + 3.5, ta);
          const inner = polar(CX, CY, trackR - 0.5, ta);
          return (
            <line
              key={"tick-" + i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={isPast ? "#f59e0b" : "#4b4845"}
              strokeOpacity={isPast ? 0.9 : 0.55}
              strokeWidth={sortedSteps ? 2 : 1.4}
              strokeLinecap="round"
              className="transition-all duration-150 ease-out"
            />
          );
        })}

        {/* unfilled track */}
        <path
          d={arcPath(CX, CY, trackR, KnobSTART_ANGLE, KnobEND_ANGLE)}
          fill="none"
          stroke="#2a2826"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* filled value arc */}
        {frac > 0.001 && (
          <path
            d={arcPath(CX, CY, trackR, KnobSTART_ANGLE, angle)}
            fill="none"
            stroke="url(#knobPointer)"
            strokeWidth={active ? 4 : 3.4}
            strokeLinecap="round"
            filter={active ? "url(#knobGlow)" : undefined}
            className="transition-all duration-150 ease-out"
          />
        )}

        {/* value-change pulse ring */}
        <circle
          key={"pulse-" + pulseKey}
          cx={CX}
          cy={CY}
          r={trackR}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          className="motion-reduce:hidden"
          style={{
            transformOrigin: "50px 50px",
            animation: "knobPulseRing 520ms ease-out forwards",
            opacity: 0,
          }}
        />

        {/* raised cap */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            transform: dragging ? "scale(0.965)" : hovering ? "scale(1.015)" : "scale(1)",
          }}
          className="transition-transform duration-100 ease-out motion-reduce:transition-none"
        >
          <circle cx={CX} cy={CY + 1.4} r={capR} fill="#000000" fillOpacity="0.55" />
          <circle
            cx={CX}
            cy={CY}
            r={capR}
            fill="url(#knobCapFill)"
            stroke="#100f0e"
            strokeWidth="1"
          />
          <circle
            cx={CX}
            cy={CY}
            r={capR}
            fill="none"
            stroke={active ? "#f59e0b" : "#57534e"}
            strokeOpacity={active ? 0.55 : 0.7}
            strokeWidth="1"
            className="transition-all duration-200 ease-out"
          />
          <circle cx={CX} cy={CY} r={capR - 2} fill="url(#knobCapSheen)" />

          {/* concentric machined groove */}
          <circle
            cx={CX}
            cy={CY}
            r={capR - 8}
            fill="none"
            stroke="#000000"
            strokeOpacity="0.35"
            strokeWidth="0.8"
          />

          {/* pointer indicator */}
          <line
            x1={pointerBase.x}
            y1={pointerBase.y}
            x2={pointerTip.x}
            y2={pointerTip.y}
            stroke="url(#knobPointer)"
            strokeWidth={active ? 4 : 3.4}
            strokeLinecap="round"
            filter={active ? "url(#knobGlow)" : undefined}
            className="transition-all duration-100 ease-out"
          />
          {/* center hub */}
          <circle
            cx={CX}
            cy={CY}
            r={active ? 4.4 : 3.8}
            fill="#fbbf24"
            className="transition-all duration-150 ease-out"
            filter={active ? "url(#knobGlow)" : undefined}
          />
          <circle cx={CX} cy={CY} r={1.6} fill="#3a2c0a" />
        </g>
      </svg>

      <style>{
        "@keyframes knobPulseRing{0%{opacity:0.55;transform:scale(0.92);}100%{opacity:0;transform:scale(1.14);}}"
      }</style>
    </div>
  );
}