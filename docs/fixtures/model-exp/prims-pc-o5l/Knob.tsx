type KnobProps = { min: number; max: number; value: number; onChange: (v: number) => void; mode?: 'continuous' | 'stepped'; steps?: number[] };

export const Knob_MIN = {"base":[2.5,2.5]};

export function Knob(props: KnobProps) {
  const uid = useRef("knob-" + Math.random().toString(36).slice(2)).current;
  const min = props.min;
  const max = props.max;
  const span = (max - min) || 1;
  const stepped = props.mode === "stepped" && !!props.steps && props.steps.length > 0;
  const steps = (props.steps && props.steps.length > 0) ? props.steps.slice().sort(function (a, b) { return a - b; }) : null;

  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const surf = useRef<HTMLDivElement | null>(null);
  const start = useRef({ y: 0, x: 0, v: 0 });

  const clamp = function (v: number) { return v < min ? min : v > max ? max : v; };
  const snap = function (v: number) {
    if (!stepped || !steps) return v;
    let best = steps[0];
    let bd = Math.abs(v - best);
    for (let i = 1; i < steps.length; i++) {
      const d = Math.abs(v - steps[i]);
      if (d < bd) { bd = d; best = steps[i]; }
    }
    return best;
  };

  const val = clamp(props.value);
  const norm = (val - min) / span;

  const A0 = -135;
  const A1 = 135;
  const ang = A0 + (A1 - A0) * norm;

  const pol = function (cx: number, cy: number, r: number, a: number) {
    const rad = (a - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const arc = function (r: number, a0: number, a1: number) {
    const p0 = pol(50, 50, r, a0);
    const p1 = pol(50, 50, r, a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const sweep = a1 > a0 ? 1 : 0;
    return "M " + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A " + r + " " + r + " 0 " + large + " " + sweep + " " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  };

  const down = function (e: any) {
    const el = surf.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    start.current = { y: e.clientY, x: e.clientX, v: val };
    setDrag(true);
  };
  const move = function (e: any) {
    if (!drag) return;
    const el = surf.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const h = r.height || 1;
    const w = r.width || 1;
    const ratio = (start.current.y - e.clientY) / h + (e.clientX - start.current.x) / w;
    const raw = clamp(start.current.v + ratio * span * 0.9);
    const nv = snap(raw);
    if (nv !== props.value) props.onChange(nv);
  };
  const up = function (e: any) {
    const el = surf.current;
    if (el && el.hasPointerCapture && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    setDrag(false);
  };

  const ticks: any[] = [];
  if (stepped && steps) {
    for (let i = 0; i < steps.length; i++) {
      const t = (clamp(steps[i]) - min) / span;
      const a = A0 + (A1 - A0) * t;
      const p0 = pol(50, 50, 44, a);
      const p1 = pol(50, 50, 39, a);
      const active = Math.abs(steps[i] - val) < 1e-9;
      ticks.push(
        <line
          key={"tick-" + i}
          x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]}
          stroke={active ? "#a3e635" : "#57534e"}
          strokeWidth={active ? 3 : 1.6}
          strokeLinecap="round"
          className="transition-all duration-200 ease-out"
        />
      );
    }
  } else {
    for (let i = 0; i <= 10; i++) {
      const a = A0 + (A1 - A0) * (i / 10);
      const p0 = pol(50, 50, 44, a);
      const p1 = pol(50, 50, i % 5 === 0 ? 40 : 42, a);
      ticks.push(
        <line key={"tick-" + i} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke="#44403c" strokeWidth={1.2} strokeLinecap="round" />
      );
    }
  }

  const ptr = pol(50, 50, 27, ang);
  const ptrIn = pol(50, 50, 11, ang);
  const active = drag || hover;

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: Knob_MIN.base[0] + "rem", minHeight: Knob_MIN.base[1] + "rem" }}
    >
      <div
        ref={surf}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={function () { setHover(true); }}
        onPointerLeave={function () { setHover(false); }}
        className={"relative h-full w-full touch-none select-none cursor-grab transition-all duration-200 ease-out" + (drag ? " cursor-grabbing" : "")}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id={uid + "-cap"} cx="50%" cy="34%" r="70%">
              <stop offset="0%" stopColor="#3f3b38" />
              <stop offset="55%" stopColor="#262322" />
              <stop offset="100%" stopColor="#0c0a09" />
            </radialGradient>
            <linearGradient id={uid + "-arc"} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation={active ? 3 : 1.6} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {ticks}

          <path d={arc(35, A0, A1)} fill="none" stroke="#292524" strokeWidth={6} strokeLinecap="round" />
          <path
            d={arc(35, A0, ang)}
            fill="none"
            stroke={"url(#" + uid + "-arc)"}
            strokeWidth={6}
            strokeLinecap="round"
            filter={"url(#" + uid + "-glow)"}
            className="transition-all duration-150 ease-out"
            opacity={norm <= 0.001 ? 0.25 : 1}
          />

          <circle cx="50" cy="50" r="28" fill="#000" opacity="0.55" />
          <circle
            cx="50" cy="50" r="27"
            fill={"url(#" + uid + "-cap)"}
            stroke={active ? "rgba(251,191,36,0.55)" : "rgba(87,83,78,0.9)"}
            strokeWidth={2}
            className="transition-all duration-200 ease-out"
          />
          <circle cx="50" cy="42" r="19" fill="none" stroke="rgba(245,158,11,0.07)" strokeWidth={6} />

          <g
            className="transition-transform duration-150 ease-out"
            style={{ transformOrigin: "50px 50px", transform: drag ? "scale(1.05)" : "scale(1)" }}
          >
            <line
              x1={ptrIn[0]} y1={ptrIn[1]} x2={ptr[0]} y2={ptr[1]}
              stroke={active ? "#fbbf24" : "#f59e0b"}
              strokeWidth={4.5}
              strokeLinecap="round"
              filter={"url(#" + uid + "-glow)"}
              className="transition-all duration-150 ease-out"
            />
            <circle cx={ptr[0]} cy={ptr[1]} r={2.6} fill="#a3e635" opacity={drag ? 1 : 0.7} className="transition-all duration-200 ease-out" />
          </g>

          <circle cx="50" cy="50" r={4} fill="#0c0a09" stroke="rgba(120,113,108,0.5)" strokeWidth={1} />
          <circle cx="50" cy="50" r={1.6} fill={drag ? "#a3e635" : "#78716c"} className="transition-all duration-200 ease-out" />
        </svg>
      </div>
    </div>
  );
}