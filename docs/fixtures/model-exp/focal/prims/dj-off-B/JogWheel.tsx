type JogWheelProps = { angle: number; spinning: boolean; onScrub: (deltaRevolutions: number) => void; onTouchChange?: (touching: boolean) => void };

export const JogWheel_MIN = {"base":[6,6]};

export function JogWheel(props: JogWheelProps) {
  const { angle, spinning, onScrub, onTouchChange } = props;
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;
  const [touching, setTouching] = useState(false);
  const [hover, setHover] = useState(false);
  const drag = useRef<{ last: number } | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const angleAt = (e: any) => {
    const el = hostRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) / (Math.PI * 2);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { last: angleAt(e) };
    setTouching(true);
    if (onTouchChange) onTouchChange(true);
  };
  const move = (e: any) => {
    if (!drag.current) return;
    const a = angleAt(e);
    let d = a - drag.current.last;
    while (d > 0.5) d -= 1;
    while (d < -0.5) d += 1;
    drag.current.last = a;
    if (d !== 0) onScrub(d);
  };
  const up = (e: any) => {
    if (!drag.current) return;
    drag.current = null;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (err) {}
    setTouching(false);
    if (onTouchChange) onTouchChange(false);
  };

  const deg = angle * 360;
  const grooves = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const r1 = 62, r2 = 76;
    grooves.push(
      <line
        key={"g-" + i}
        x1={100 + Math.cos(a) * r1}
        y1={100 + Math.sin(a) * r1}
        x2={100 + Math.cos(a) * r2}
        y2={100 + Math.sin(a) * r2}
        stroke={i % 4 === 0 ? "rgba(34,211,238,0.55)" : "rgba(255,255,255,0.12)"}
        strokeWidth={i % 4 === 0 ? 2.2 : 1.2}
        strokeLinecap="round"
      />
    );
  }
  const rings = [];
  for (let i = 0; i < 7; i++) {
    rings.push(
      <circle key={"r-" + i} cx="100" cy="100" r={26 + i * 4.6} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.8" />
    );
  }

  return (
    <div
      ref={hostRef}
      className="h-full w-full relative touch-none select-none cursor-grab active:cursor-grabbing"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={uid + "-body"} cx="50%" cy="28%" r="80%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="45%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id={uid + "-hub"} cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#0a0a0f" />
          </radialGradient>
          <linearGradient id={uid + "-rim"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(217,70,239,0.55)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="100" cy="100" r="96" fill="none" stroke={"url(#" + uid + "-rim)"} strokeWidth="5" opacity={touching ? 1 : hover ? 0.8 : 0.55} className="transition-all duration-200 ease-out" />
        <circle cx="100" cy="100" r="88" fill={"url(#" + uid + "-body)"} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        <g
          style={{ transform: "rotate(" + deg + "deg)", transformOrigin: "100px 100px", transition: touching ? "none" : "transform 120ms linear" }}
        >
          {grooves}
          {rings}
          <circle cx="100" cy="100" r="46" fill={"url(#" + uid + "-hub)"} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <circle
            cx="100"
            cy="34"
            r="6"
            fill={touching ? "#fbbf24" : "#22d3ee"}
            filter={"url(#" + uid + "-glow)"}
            className="transition-all duration-200 ease-out"
          />
          <rect x="97.6" y="56" width="4.8" height="22" rx="2.4" fill={touching ? "rgba(251,191,36,0.8)" : "rgba(34,211,238,0.6)"} />
          <path d="M100 58 L100 142" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </g>

        <circle
          cx="100"
          cy="100"
          r="83"
          fill="none"
          stroke={touching ? "rgba(251,191,36,0.85)" : "rgba(217,70,239,0)"}
          strokeWidth="2.5"
          className="transition-all duration-200 ease-out"
          filter={touching ? "url(#" + uid + "-glow)" : undefined}
        />

        {spinning ? (
          <g opacity="0.9">
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="rgba(34,211,238,0.55)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="34 544"
              filter={"url(#" + uid + "-glow)"}
              className="motion-safe:animate-[spin_2s_linear_infinite]"
              style={{ transformOrigin: "100px 100px" }}
            />
          </g>
        ) : null}

        <circle cx="100" cy="100" r="13" fill="#09090b" stroke="rgba(255,255,255,0.14)" strokeWidth="1.2" />
        <circle
          cx="100"
          cy="100"
          r="5"
          fill={spinning ? "#34d399" : "#52525b"}
          className="transition-all duration-200 ease-out"
          filter={spinning ? "url(#" + uid + "-glow)" : undefined}
        />
        <ellipse cx="100" cy="52" rx="62" ry="30" fill="rgba(255,255,255,0.035)" />
      </svg>
    </div>
  );
}