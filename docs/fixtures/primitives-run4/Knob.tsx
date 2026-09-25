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

  const KNOB_START = -135;
  const KNOB_END = 135;
  const KNOB_SWEEP = KNOB_END - KNOB_START;

  const stepped = props.mode === "stepped";
  const steps =
    props.steps && props.steps.length > 0
      ? props.steps.slice().sort((a, b) => a - b)
      : null;

  const lo = Math.min(props.min, props.max);
  const hi = Math.max(props.min, props.max);
  const span = hi - lo || 1;

  const clamp = (v: number) => (v < lo ? lo : v > hi ? hi : v);

  const snap = (v: number): number => {
    if (stepped && steps) {
      let best = steps[0];
      let bestD = Math.abs(steps[0] - v);
      for (let i = 1; i < steps.length; i++) {
        const d = Math.abs(steps[i] - v);
        if (d < bestD) {
          bestD = d;
          best = steps[i];
        }
      }
      return best;
    }
    return clamp(v);
  };

  const current = snap(props.value);
  const norm = (current - lo) / span;
  const angle = KNOB_START + norm * KNOB_SWEEP;

  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startY: number; startX: number; startVal: number } | null>(
    null
  );

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const polar = (cx: number, cy: number, r: number, deg: number) => {
    const a = rad(deg - 90);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const CX = 50;
  const CY = 50;
  const TRACK_R = 40;
  const arcPath = (fromDeg: number, toDeg: number, r: number) => {
    const s = polar(CX, CY, r, fromDeg);
    const e = polar(CX, CY, r, toDeg);
    const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    const sweepFlag = toDeg > fromDeg ? 1 : 0;
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

  const commit = (clientX: number, clientY: number, rect: DOMRect) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - clientY;
    const dx = clientX - dragRef.current.startX;
    const delta = dy + dx * 0.35;
    const range = rect.height > 0 ? rect.height : 100;
    const sensitivity = 1.6;
    const frac = (delta / range) * sensitivity;
    const raw = dragRef.current.startVal + frac * span;
    const next = snap(raw);
    if (next !== current) props.onChange(next);
  };

  const onPointerDown = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startY: e.clientY,
      startX: e.clientX,
      startVal: current,
    };
    (dragRef.current as any).rect = rect;
    setDragging(true);
  };

  const onPointerMove = (e: any) => {
    if (!dragRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    commit(e.clientX, e.clientY, rect);
  };

  const onPointerUp = (e: any) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  };

  const stepTicks =
    stepped && steps
      ? steps.map((s) => {
          const n = (clamp(s) - lo) / span;
          return { v: s, deg: KNOB_START + n * KNOB_SWEEP };
        })
      : null;

  const decoTicks = !stepped
    ? Array.from({ length: 11 }, (_, i) => ({
        deg: KNOB_START + (i / 10) * KNOB_SWEEP,
        major: i % 5 === 0,
      }))
    : null;

  const pointerTip = polar(CX, CY, 30, angle);
  const pointerBase = polar(CX, CY, 12, angle);

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center">
      <div
        className="relative h-full w-full touch-none select-none cursor-ns-resize"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <radialGradient id={uid + "-cap"} cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#4b4643" />
              <stop offset="55%" stopColor="#2b2825" />
              <stop offset="100%" stopColor="#121110" />
            </radialGradient>
            <radialGradient id={uid + "-capHi"} cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#5f5851" />
              <stop offset="60%" stopColor="#332f2c" />
              <stop offset="100%" stopColor="#151413" />
            </radialGradient>
            <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff7e6" stopOpacity="0.28" />
              <stop offset="45%" stopColor="#fff7e6" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
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
            r="47"
            fill="#0a0908"
            stroke="#3a3632"
            strokeWidth="1.4"
            strokeOpacity="0.7"
          />
          <circle
            cx={CX}
            cy={CY}
            r="47"
            fill="none"
            stroke="#000000"
            strokeWidth="2.4"
            strokeOpacity="0.55"
          />

          {/* Unlit track */}
          <path
            d={arcPath(KNOB_START, KNOB_END, TRACK_R)}
            fill="none"
            stroke="#26221e"
            strokeWidth="3.4"
            strokeLinecap="round"
          />

          {/* Value fill arc */}
          <path
            d={arcPath(KNOB_START, angle, TRACK_R)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.4"
            strokeLinecap="round"
            filter={"url(#" + uid + "-glow)"}
            style={{
              transition: dragging ? "none" : "all 100ms linear",
              opacity: dragging ? 1 : 0.92,
            }}
          />

          {/* Continuous decorative ticks */}
          {decoTicks &&
            decoTicks.map((t, i) => {
              const outer = polar(CX, CY, 44.5, t.deg);
              const inner = polar(CX, CY, t.major ? 40 : 42, t.deg);
              return (
                <line
                  key={"deco-" + i}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={t.major ? "#8a7a4a" : "#4a443c"}
                  strokeWidth={t.major ? 1.3 : 0.8}
                  strokeLinecap="round"
                />
              );
            })}

          {/* Stepped detent markers */}
          {stepTicks &&
            stepTicks.map((t, i) => {
              const active = t.v === current;
              const outer = polar(CX, CY, 45, t.deg);
              const inner = polar(CX, CY, 39, t.deg);
              return (
                <line
                  key={"step-" + i}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={active ? "#fbbf24" : "#6b6152"}
                  strokeWidth={active ? 2.1 : 1.2}
                  strokeLinecap="round"
                  filter={active ? "url(#" + uid + "-glow)" : undefined}
                  style={{ transition: "all 120ms ease-out" }}
                />
              );
            })}

          {/* Knob cap */}
          <circle cx={CX} cy={CY} r="33" fill={"url(#" + uid + "-cap)"} />
          <circle
            cx={CX}
            cy={CY}
            r="33"
            fill="none"
            stroke="#000000"
            strokeWidth="1.6"
            strokeOpacity="0.6"
          />
          <circle cx={CX} cy={CY} r="31" fill={"url(#" + uid + "-sheen)"} />
          <circle
            cx={CX}
            cy={CY}
            r="24"
            fill={"url(#" + uid + "-capHi)"}
            stroke="#1a1917"
            strokeWidth="0.8"
          />

          {/* Rotating pointer group */}
          <g
            style={{
              transformOrigin: "50px 50px",
              transition: dragging ? "none" : "transform 100ms ease-linear",
              transform: "rotate(0deg)",
            }}
          >
            <line
              x1={pointerBase.x}
              y1={pointerBase.y}
              x2={pointerTip.x}
              y2={pointerTip.y}
              stroke="#fde68a"
              strokeWidth="3"
              strokeLinecap="round"
              filter={"url(#" + uid + "-glow)"}
            />
            <circle
              cx={pointerTip.x}
              cy={pointerTip.y}
              r="2.4"
              fill="#fffbeb"
              filter={"url(#" + uid + "-glow)"}
            />
          </g>

          {/* Center hub */}
          <circle
            cx={CX}
            cy={CY}
            r="6"
            fill="#1c1a18"
            stroke="#4a443c"
            strokeWidth="0.8"
          />
          <circle cx={CX} cy={CY} r="2.2" fill="#5a5248" />

          {/* Drag emphasis ring */}
          <circle
            cx={CX}
            cy={CY}
            r="36"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1"
            style={{
              opacity: dragging ? 0.55 : 0,
              transition: "opacity 150ms ease-out",
            }}
          />
        </svg>
      </div>
    </div>
  );
}