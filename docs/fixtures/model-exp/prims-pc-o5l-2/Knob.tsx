type KnobProps = { min: number; max: number; value: number; onChange: (v: number) => void; mode?: 'continuous' | 'stepped'; steps?: number[] };

export const Knob_MIN = {"base":[2.5,2.5]};

export function Knob(props: KnobProps) {
  const uid = useRef("knob-" + Math.random().toString(36).slice(2)).current;
  const { min, max, value, onChange, mode, steps } = props;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const span = max - min || 1;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const stepList = (steps && steps.length ? steps.slice().sort((a, b) => a - b) : null);
  const stepped = mode === "stepped" && !!stepList;

  const snap = (v: number) => {
    if (!stepList) return v;
    let best = stepList[0];
    for (const s of stepList) if (Math.abs(s - v) < Math.abs(best - v)) best = s;
    return best;
  };

  const norm = Math.max(0, Math.min(1, (clamp(value) - min) / span));
  const A0 = -135, A1 = 135;
  const angle = A0 + norm * (A1 - A0);

  const polar = (a: number, r: number) => {
    const rad = (a - 90) * Math.PI / 180;
    return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
  };
  const arc = (a0: number, a1: number, r: number) => {
    const [x0, y0] = polar(a0, r);
    const [x1, y1] = polar(a1, r);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return "M " + x0 + " " + y0 + " A " + r + " " + r + " 0 " + large + " 1 " + x1 + " " + y1;
  };

  const commitFromPointer = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = clientX - cx, dy = clientY - cy;
    let a = Math.atan2(dx, -dy) * 180 / Math.PI;
    if (a < A0) a = A0;
    if (a > A1) a = A1;
    const n = (a - A0) / (A1 - A0);
    let v = min + n * span;
    if (stepped) v = snap(v);
    onChange(clamp(v));
  };

  const active = drag || hover;

  return (
    <div
      ref={ref}
      className="h-full w-full touch-none select-none"
      style={{ minWidth: Knob_MIN.base[0] + "rem", minHeight: Knob_MIN.base[1] + "rem", cursor: drag ? "grabbing" : "grab" }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(e) => {
        (e.currentTarget as any).setPointerCapture(e.pointerId);
        setDrag(true);
        commitFromPointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => { if (drag) commitFromPointer(e.clientX, e.clientY); }}
      onPointerUp={(e) => { setDrag(false); try { (e.currentTarget as any).releasePointerCapture(e.pointerId); } catch (err) {} }}
      onPointerCancel={() => setDrag(false)}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id={uid + "-body"} cx="50%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#3f3b36" />
            <stop offset="60%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <linearGradient id={uid + "-val"} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* detents / ticks */}
        {stepped && stepList!.map((s, i) => {
          const n = Math.max(0, Math.min(1, (s - min) / span));
          const a = A0 + n * (A1 - A0);
          const on = n <= norm + 0.001;
          const [x0, y0] = polar(a, 44);
          const [x1, y1] = polar(a, 49);
          return (
            <line key={"tick-" + i} x1={x0} y1={y0} x2={x1} y2={y1}
              stroke={on ? "#fbbf24" : "#57534e"} strokeWidth={on ? 2.6 : 1.6} strokeLinecap="round"
              opacity={on ? 1 : 0.7} className="transition-all duration-200 ease-out" />
          );
        })}
        {!stepped && [0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const a = A0 + t * (A1 - A0);
          const [x0, y0] = polar(a, 45);
          const [x1, y1] = polar(a, 48.5);
          return <line key={"m-" + i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#44403c" strokeWidth="1.4" strokeLinecap="round" />;
        })}

        {/* track */}
        <path d={arc(A0, A1, 39)} fill="none" stroke="#292524" strokeWidth="6" strokeLinecap="round" />
        <path d={arc(A0, A1, 39)} fill="none" stroke="#57534e" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />

        {/* value arc */}
        {norm > 0.001 && (
          <path d={arc(A0, angle, 39)} fill="none" stroke={"url(#" + uid + "-val)"} strokeWidth="6" strokeLinecap="round"
            filter={active ? "url(#" + uid + "-glow)" : undefined}
            className="transition-all duration-150 ease-out" />
        )}

        {/* body */}
        <circle cx="50" cy="50" r="31" fill={"url(#" + uid + "-body)"} stroke="#44403c" strokeWidth="2.5"
          className="transition-all duration-200 ease-out"
          style={{ filter: active ? "drop-shadow(0 0 6px rgba(245,158,11,0.35))" : "none" }} />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#f59e0b" strokeWidth="1" opacity={active ? 0.45 : 0.12}
          className="transition-all duration-200 ease-out" />

        {/* pointer */}
        <g style={{ transform: "rotate(" + angle + "deg)", transformOrigin: "50px 50px", transition: drag ? "none" : "transform 150ms ease-out" }}>
          <line x1="50" y1="30" x2="50" y2="15" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"
            filter={active ? "url(#" + uid + "-glow)" : undefined} />
          <circle cx="50" cy="26" r="2.6" fill="#a3e635" opacity={drag ? 1 : 0.65} />
        </g>

        <circle cx="50" cy="50" r="4.5" fill="#0a0a0a" stroke="#57534e" strokeWidth="1" />
        <circle cx="50" cy="50" r="1.8" fill={drag ? "#a3e635" : "#78716c"} className="transition-all duration-200 ease-out" />
      </svg>
    </div>
  );
}