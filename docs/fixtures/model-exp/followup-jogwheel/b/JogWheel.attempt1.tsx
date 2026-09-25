type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export function JogWheel(props: JogWheelProps) {
  const { value, onScrub } = props;
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;
  const angle = typeof value === "number" ? value : 0;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const [spin, setSpin] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const last = useRef(0);

  const floor = JogWheel_MIN.base;

  const angleAt = (e: any) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    last.current = angleAt(e);
    setDrag(true);
  };
  const onMove = (e: any) => {
    if (!drag) return;
    const a = angleAt(e);
    let d = a - last.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    if (d !== 0) {
      setSpin(d);
      onScrub(d);
    }
  };
  const onUp = (e: any) => {
    if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDrag(false);
    setSpin(0);
  };

  const deg = (angle * 180) / Math.PI;
  const spokes = [];
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    const r1 = 33;
    const r2 = i % 6 === 0 ? 25 : 29;
    spokes.push(
      <line
        key={"sp-" + i}
        x1={50 + Math.cos(a) * r1}
        y1={50 + Math.sin(a) * r1}
        x2={50 + Math.cos(a) * r2}
        y2={50 + Math.sin(a) * r2}
        stroke={i % 6 === 0 ? "rgba(251,191,36,0.75)" : "rgba(120,113,108,0.55)"}
        strokeWidth={i % 6 === 0 ? 1.8 : 1}
        strokeLinecap="round"
      />
    );
  }

  const grips = [];
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI * 2) / 48;
    grips.push(
      <line
        key={"gr-" + i}
        x1={50 + Math.cos(a) * 46}
        y1={50 + Math.sin(a) * 46}
        x2={50 + Math.cos(a) * 42}
        y2={50 + Math.sin(a) * 42}
        stroke="rgba(68,64,60,0.9)"
        strokeWidth="1.6"
      />
    );
  }

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        ref={ref}
        className="absolute inset-0 touch-none cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full transition-all duration-200 ease-out"
          style={{
            filter: drag
              ? "drop-shadow(0 0 10px rgba(245,158,11,0.45))"
              : hover
              ? "drop-shadow(0 0 6px rgba(245,158,11,0.22))"
              : "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
          }}
        >
          <defs>
            <radialGradient id={uid + "-plate"} cx="38%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#3f3b38" />
              <stop offset="55%" stopColor="#1c1917" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
            <radialGradient id={uid + "-well"} cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#171412" />
              <stop offset="100%" stopColor="#000000" />
            </radialGradient>
            <linearGradient id={uid + "-ring"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(245,158,11,0.55)" />
              <stop offset="100%" stopColor="rgba(120,113,108,0.35)" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="48.5" fill="url(#{}".replace("{}", "") + ""} />
          <circle cx="50" cy="50" r="48.5" fill={"url(#" + uid + "-plate)"} />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={"url(#" + uid + "-ring)"}
            strokeWidth="2"
          />

          <g
            style={{
              transformOrigin: "50px 50px",
              transform: "rotate(" + deg + "deg)",
              transition: drag ? "none" : "transform 150ms ease-out",
            }}
          >
            {grips}
            {spokes}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="rgba(41,37,36,0.9)"
              strokeWidth="0.8"
            />
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="12"
              stroke={drag ? "#a3e635" : "#fbbf24"}
              strokeWidth="2.2"
              strokeLinecap="round"
              className="transition-all duration-200 ease-out"
            />
            <circle
              cx="50"
              cy="14"
              r="3"
              fill={drag ? "#a3e635" : "#f59e0b"}
              className="transition-all duration-200 ease-out"
            />
          </g>

          <circle cx="50" cy="50" r="22" fill={"url(#" + uid + "-well)"} />
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke={drag ? "rgba(163,230,53,0.55)" : "rgba(245,158,11,0.25)"}
            strokeWidth="1.2"
            className="transition-all duration-200 ease-out"
          />

          <circle
            cx="50"
            cy="50"
            r="17"
            fill="none"
            stroke={drag ? "rgba(163,230,53,0.7)" : "rgba(245,158,11,0.35)"}
            strokeWidth="2"
            strokeDasharray="6 9"
            strokeLinecap="round"
            style={{
              transformOrigin: "50px 50px",
              transform: "rotate(" + (deg * 1.6) + "deg)",
              transition: drag ? "none" : "transform 150ms ease-out",
            }}
          />

          <circle
            cx="50"
            cy="50"
            r="4.5"
            fill={drag ? "#a3e635" : hover ? "#fbbf24" : "#57534e"}
            className="transition-all duration-200 ease-out"
          />

          {drag && Math.abs(spin) > 0.004 ? (
            <path
              d={
                "M 50 50 L " +
                (50 + Math.cos(angle - spin * 6) * 44) +
                " " +
                (50 + Math.sin(angle - spin * 6) * 44) +
                " A 44 44 0 0 " +
                (spin > 0 ? 1 : 0) +
                " " +
                (50 + Math.cos(angle) * 44) +
                " " +
                (50 + Math.sin(angle) * 44) +
                " Z"
              }
              fill="rgba(163,230,53,0.15)"
            />
          ) : null}
        </svg>
      </div>
    </div>
  );
}

export const JogWheel_MIN = {"base":[4,4]};