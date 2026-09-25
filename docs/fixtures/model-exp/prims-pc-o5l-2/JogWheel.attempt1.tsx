type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export const JogWheel_MIN = {"base":[4.5,4.5]};

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jog-" + Math.random().toString(36).slice(2)).current;
  const angle = props.value ?? 0;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const last = useRef(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const spinRef = useRef(0);
  const [spin, setSpin] = useState(0);

  const angFrom = (e: any) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = angFrom(e);
    setDrag(true);
  };
  const move = (e: any) => {
    if (!drag) return;
    const a = angFrom(e);
    let d = a - last.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    spinRef.current += d;
    setSpin(spinRef.current);
    props.onScrub(d);
  };
  const up = (e: any) => {
    if (!drag) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    setDrag(false);
  };

  const deg = ((props.value === undefined ? spin : angle) * 180) / Math.PI;

  const ticks = [];
  for (let i = 0; i < 48; i++) {
    const major = i % 4 === 0;
    ticks.push(
      <line
        key={"t-" + i}
        x1="50"
        y1={major ? 7 : 9.5}
        x2="50"
        y2={major ? 14 : 12.5}
        stroke={major ? "rgb(251 191 36)" : "rgb(120 113 108)"}
        strokeOpacity={major ? 0.85 : 0.6}
        strokeWidth={major ? 1.6 : 0.9}
        strokeLinecap="round"
        transform={"rotate(" + (i * 7.5) + " 50 50)"}
      />
    );
  }

  return (
    <div
      ref={ref}
      className="h-full w-full touch-none select-none"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <radialGradient id={uid + "-plat"} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#3b3733" />
            <stop offset="55%" stopColor="#1c1917" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </radialGradient>
          <radialGradient id={uid + "-well"} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#141210" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <linearGradient id={uid + "-ring"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity={drag ? 0.9 : hover ? 0.55 : 0.3} />
            <stop offset="100%" stopColor="rgb(120 113 108)" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill="url(#" + "" />
        <circle cx="50" cy="50" r="48" fill={"url(#" + uid + "-plat)"} />
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke={"url(#" + uid + "-ring)"}
          strokeWidth="2.5"
          className="transition-all duration-200 ease-out"
        />

        <g
          className="transition-transform duration-150 ease-out"
          style={{ transform: "rotate(" + deg + "deg)", transformOrigin: "50px 50px" }}
        >
          {ticks}
          <circle cx="50" cy="50" r="38" fill="none" stroke="rgb(68 64 60)" strokeOpacity="0.55" strokeWidth="0.6" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgb(68 64 60)" strokeOpacity="0.4" strokeWidth="0.5" />
          <line
            x1="50"
            y1="18"
            x2="50"
            y2="36"
            stroke={drag ? "rgb(163 230 53)" : "rgb(251 191 36)"}
            strokeWidth="2.6"
            strokeLinecap="round"
            className="transition-all duration-200 ease-out"
          />
          <circle
            cx="50"
            cy="22"
            r={drag ? 3.4 : 2.6}
            fill={drag ? "rgb(163 230 53)" : "rgb(245 158 11)"}
            className="transition-all duration-200 ease-out"
          />
        </g>

        <circle cx="50" cy="50" r="22" fill={"url(#" + uid + "-well)"} />
        <circle
          cx="50"
          cy="50"
          r="22"
          fill="none"
          stroke="rgb(68 64 60)"
          strokeOpacity="0.8"
          strokeWidth="1.2"
        />
        <circle
          cx="50"
          cy="50"
          r="16"
          fill="none"
          stroke={drag ? "rgb(163 230 53)" : "rgb(245 158 11)"}
          strokeOpacity={drag ? 0.8 : hover ? 0.45 : 0.22}
          strokeWidth="1"
          className="transition-all duration-200 ease-out"
        />
        <circle
          cx="50"
          cy="50"
          r={drag ? 4.2 : 3.2}
          fill={drag ? "rgb(163 230 53)" : "rgb(120 113 108)"}
          className="transition-all duration-200 ease-out"
        />
      </svg>
    </div>
  );
}