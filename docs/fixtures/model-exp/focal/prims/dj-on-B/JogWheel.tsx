type JogWheelProps = { angle: number; spinning: boolean; onScrub: (deltaRevolutions: number) => void; onTouchChange?: (touching: boolean) => void };

export const JogWheel_MIN = {"base":[7,7]};

export function JogWheel(props: JogWheelProps) {
  const { angle, spinning, onScrub, onTouchChange } = props;
  const uid = useRef("jog-" + Math.random().toString(36).slice(2)).current;
  const [touching, setTouching] = useState(false);
  const [hover, setHover] = useState(false);
  const lastAng = useRef(0);
  const center = useRef({ x: 0, y: 0 });
  const vel = useRef(0);

  const deg = angle * 360;

  const pointerAngle = (e: any) => {
    const dx = e.clientX - center.current.x;
    const dy = e.clientY - center.current.y;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  const down = (e: any) => {
    const r = e.currentTarget.getBoundingClientRect();
    center.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    lastAng.current = pointerAngle(e);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    setTouching(true);
    if (onTouchChange) onTouchChange(true);
  };
  const move = (e: any) => {
    if (!touching) return;
    const a = pointerAngle(e);
    let d = a - lastAng.current;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    lastAng.current = a;
    vel.current = d;
    onScrub(d / 360);
  };
  const up = (e: any) => {
    if (!touching) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    setTouching(false);
    vel.current = 0;
    if (onTouchChange) onTouchChange(false);
  };

  const grooves = [];
  for (let i = 0; i < 5; i++) {
    grooves.push(<circle key={"g" + i} cx="100" cy="100" r={58 - i * 5} fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />);
  }

  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const major = i % 6 === 0;
    const a = (i / 72) * Math.PI * 2;
    const r1 = major ? 76 : 80;
    const r2 = 85;
    ticks.push(
      <line
        key={"t" + i}
        x1={100 + Math.cos(a) * r1}
        y1={100 + Math.sin(a) * r1}
        x2={100 + Math.cos(a) * r2}
        y2={100 + Math.sin(a) * r2}
        stroke={major ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.14)"}
        strokeWidth={major ? 2.2 : 1}
        strokeLinecap="round"
      />
    );
  }

  const dots = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    dots.push(<circle key={"d" + i} cx={100 + Math.cos(a) * 66} cy={100 + Math.sin(a) * 66} r="1.6" fill="rgba(217,70,239,0.45)" />);
  }

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
    >
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <defs>
          <radialGradient id={uid + "-plat"} cx="50%" cy="38%" r="72%">
            <stop offset="0%" stopColor="#26262e" />
            <stop offset="45%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id={uid + "-hub"} cx="42%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#3b3b45" />
            <stop offset="60%" stopColor="#141418" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <linearGradient id={uid + "-rim"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
          </linearGradient>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* outer halo */}
        <circle
          cx="100" cy="100" r="93"
          fill="none"
          stroke={touching ? "rgba(217,70,239,0.75)" : hover ? "rgba(34,211,238,0.4)" : "rgba(34,211,238,0.22)"}
          strokeWidth={touching ? 3 : 2}
          filter={touching ? "url(#" + uid + "-glow)" : undefined}
          style={{ transition: "stroke 200ms ease-out, stroke-width 200ms ease-out" }}
        />
        <circle cx="100" cy="100" r="88" fill="#09090b" />
        <circle cx="100" cy="100" r="88" fill="none" stroke={"url(#" + uid + "-rim)"} strokeWidth="4" />

        {/* rotating assembly */}
        <g
          style={{
            transformOrigin: "100px 100px",
            transform: "rotate(" + deg + "deg)",
            transition: touching ? "none" : "transform 120ms linear"
          }}
        >
          <circle cx="100" cy="100" r="84" fill={"url(#" + uid + "-plat"} />
          <circle cx="100" cy="100" r="84" fill={"url(#" + uid + "-plat)"} />
          {ticks}
          {dots}
          {grooves}
          {/* strobe segments on rim */}
          <g opacity={spinning ? 0.9 : 0.35} style={{ transition: "opacity 300ms ease-out" }}>
            {[0, 1, 2, 3].map((i) => {
              const a0 = (i / 4) * Math.PI * 2;
              return (
                <line key={"s" + i}
                  x1={100 + Math.cos(a0) * 62} y1={100 + Math.sin(a0) * 62}
                  x2={100 + Math.cos(a0) * 74} y2={100 + Math.sin(a0) * 74}
                  stroke="#22d3ee" strokeWidth="3.4" strokeLinecap="round"
                  filter={"url(#" + uid + "-glow)"} />
              );
            })}
          </g>
          {/* index marker */}
          <path d="M100 18 L104.5 30 L95.5 30 Z" fill={touching ? "#e879f9" : "#f0abfc"} filter={"url(#" + uid + "-glow)"} />
          <rect x="98.6" y="30" width="2.8" height="30" rx="1.4" fill="rgba(232,121,249,0.5)" />
        </g>

        {/* center hub (static) */}
        <circle cx="100" cy="100" r="34" fill={"url(#" + uid + "-hub)"} />
        <circle cx="100" cy="100" r="34" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        <circle
          cx="100" cy="100" r="28"
          fill="none"
          stroke={touching ? "rgba(217,70,239,0.85)" : "rgba(34,211,238,0.3)"}
          strokeWidth={touching ? 2.6 : 1.4}
          strokeDasharray="4 6"
          style={{
            transformOrigin: "100px 100px",
            transition: "stroke 200ms ease-out, stroke-width 200ms ease-out",
            animation: spinning ? "spin 3s linear infinite" : "none"
          }}
        />
        <circle
          cx="100" cy="100" r="9"
          fill={touching ? "#d946ef" : spinning ? "#22d3ee" : "#3f3f46"}
          filter={touching || spinning ? "url(#" + uid + "-glow)" : undefined}
          style={{ transition: "fill 200ms ease-out" }}
        />
        <circle cx="100" cy="100" r="3.2" fill="#000" />

        {/* glass sheen */}
        <circle cx="100" cy="100" r="84" fill={"url(#" + uid + "-sheen)"} pointerEvents="none" />
      </svg>
    </div>
  );
}