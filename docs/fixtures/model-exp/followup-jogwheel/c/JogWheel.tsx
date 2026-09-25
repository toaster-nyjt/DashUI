type JogWheelProps = { value?: number; onScrub: (delta: number) => void };
export const JogWheel_MIN = {"base":[4,4]};
export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;
  const angle = props.value || 0;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const last = useRef(0);

  const angleAt = (e: any) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = angleAt(e);
    setDrag(true);
  };
  const move = (e: any) => {
    if (!drag) return;
    const a = angleAt(e);
    let d = a - last.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    if (d !== 0) props.onScrub(d);
  };
  const up = (e: any) => {
    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDrag(false);
  };

  const deg = (angle * 180) / Math.PI;
  const spokes = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const r1 = i % 6 === 0 ? 34 : 38;
    spokes.push(
      <line
        key={"sp-" + i}
        x1={50 + Math.cos(a) * r1}
        y1={50 + Math.sin(a) * r1}
        x2={50 + Math.cos(a) * 43}
        y2={50 + Math.sin(a) * 43}
        stroke={i % 6 === 0 ? "rgb(251,191,36)" : "rgb(120,113,108)"}
        strokeOpacity={i % 6 === 0 ? 0.85 : 0.5}
        strokeWidth={i % 6 === 0 ? 2.2 : 1.2}
        strokeLinecap="round"
      />
    );
  }

  return (
    <div
      ref={ref}
      className="h-full w-full relative touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={uid + "-plate"} cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor="rgb(68,64,60)" />
            <stop offset="55%" stopColor="rgb(41,37,36)" />
            <stop offset="100%" stopColor="rgb(12,10,9)" />
          </radialGradient>
          <radialGradient id={uid + "-well"} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgb(23,23,23)" />
            <stop offset="100%" stopColor="rgb(0,0,0)" />
          </radialGradient>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.18" />
            <stop offset="60%" stopColor="rgb(251,191,36)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill="rgb(28,25,23)" stroke="rgb(68,64,60)" strokeOpacity="0.8" strokeWidth="2" />
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={drag ? "rgb(163,230,53)" : hover ? "rgb(251,191,36)" : "rgb(245,158,11)"}
          strokeOpacity={drag ? 0.9 : hover ? 0.5 : 0.25}
          strokeWidth="1.6"
          style={{ transition: "all 200ms ease-out" }}
        />
        <circle cx="50" cy="50" r="44" fill={"url(#" + uid + "-plate)"} />

        <g
          style={{
            transform: "rotate(" + deg + "deg)",
            transformOrigin: "50px 50px",
            transition: drag ? "none" : "transform 150ms ease-out",
          }}
        >
          {spokes}
          <circle cx="50" cy="50" r="30" fill="none" stroke="rgb(87,83,78)" strokeOpacity="0.55" strokeWidth="0.8" />
          <line x1="50" y1="20" x2="50" y2="31" stroke="rgb(251,191,36)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="24" r="2.6" fill={drag ? "rgb(163,230,53)" : "rgb(251,191,36)"} style={{ transition: "fill 200ms ease-out" }} />
        </g>

        <circle cx="50" cy="50" r="44" fill={"url(#" + uid + "-sheen)"} />
        <circle cx="50" cy="50" r="19" fill={"url(#" + uid + "-well)"} stroke="rgb(41,37,36)" strokeWidth="1.4" />
        <circle
          cx="50"
          cy="50"
          r="19"
          fill="none"
          stroke={drag ? "rgb(163,230,53)" : "rgb(245,158,11)"}
          strokeOpacity={drag ? 0.75 : 0.3}
          strokeWidth="1"
          style={{ transition: "all 200ms ease-out" }}
        />
        <circle
          cx="50"
          cy="50"
          r={drag ? 5.5 : 4}
          fill={drag ? "rgb(163,230,53)" : "rgb(245,158,11)"}
          opacity={drag ? 0.95 : hover ? 0.7 : 0.45}
          style={{ transition: "all 200ms ease-out" }}
        />
      </svg>
    </div>
  );
}