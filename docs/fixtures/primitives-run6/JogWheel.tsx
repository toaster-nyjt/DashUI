type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export function JogWheel(props: JogWheelProps) {
  const { value, onScrub } = props;

  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;

  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [spinRate, setSpinRate] = useState(0); // radians per second visual momentum feedback

  const svgRef = useRef<SVGSVGElement | null>(null);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const decayRafRef = useRef<number | null>(null);

  const angle = typeof value === "number" && isFinite(value) ? value : 0;

  // ---- helpers ----
  const JogWheelGetAngle = (clientX: number, clientY: number): number | null => {
    const el = svgRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const JogWheelNormDelta = (raw: number): number => {
    let d = raw;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  };

  // momentum decay of the *visual* spin indicator (does not emit; purely feedback)
  useEffect(() => {
    if (dragging) {
      if (decayRafRef.current !== null) {
        cancelAnimationFrame(decayRafRef.current);
        decayRafRef.current = null;
      }
      return;
    }
    if (Math.abs(spinRate) < 0.001) return;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      setSpinRate((r) => {
        const nr = r * Math.pow(0.06, dt);
        if (Math.abs(nr) < 0.001) {
          decayRafRef.current = null;
          return 0;
        }
        decayRafRef.current = requestAnimationFrame(tick);
        return nr;
      });
      decayRafRef.current = requestAnimationFrame(tick);
    };
    decayRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (decayRafRef.current !== null) {
        cancelAnimationFrame(decayRafRef.current);
        decayRafRef.current = null;
      }
    };
  }, [dragging, spinRate]);

  useEffect(() => {
    return () => {
      if (decayRafRef.current !== null) cancelAnimationFrame(decayRafRef.current);
    };
  }, []);

  const onPointerDown = (e: any) => {
    const a = JogWheelGetAngle(e.clientX, e.clientY);
    if (a === null) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    lastAngleRef.current = a;
    lastTimeRef.current = performance.now();
    setDragging(true);
  };

  const onPointerMove = (e: any) => {
    if (!dragging) return;
    const a = JogWheelGetAngle(e.clientX, e.clientY);
    if (a === null) return;
    const delta = JogWheelNormDelta(a - lastAngleRef.current);
    const now = performance.now();
    const dt = Math.max(0.001, (now - lastTimeRef.current) / 1000);
    lastAngleRef.current = a;
    lastTimeRef.current = now;
    if (delta !== 0) {
      onScrub(delta);
      setSpinRate(delta / dt);
    }
  };

  const endDrag = (e: any) => {
    if (!dragging) return;
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  // ---- visuals ----
  // Total displayed rotation = controlled angle + a tiny extra lean from momentum for liveliness.
  const leanDeg = Math.max(-14, Math.min(14, spinRate * 2.2));
  const baseDeg = (angle * 180) / Math.PI;
  const rotDeg = baseDeg + leanDeg;

  const active = dragging;
  const spinning = Math.abs(spinRate) > 0.05;

  // grip dots around the platter
  const grips: number[] = [];
  for (let i = 0; i < 24; i++) grips.push(i);

  // radial index marks
  const marks: number[] = [];
  for (let i = 0; i < 48; i++) marks.push(i);

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: JogWheel_MIN.base[0] + "rem", minHeight: JogWheel_MIN.base[1] + "rem" }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <defs>
          {/* platter metal body */}
          <radialGradient id={uid + "-body"} cx="42%" cy="36%" r="72%">
            <stop offset="0%" stopColor="#3f3a34" />
            <stop offset="42%" stopColor="#292520" />
            <stop offset="78%" stopColor="#17140f" />
            <stop offset="100%" stopColor="#0b0906" />
          </radialGradient>
          {/* rotating brushed-metal sheen — attached to the spinning group */}
          <linearGradient id={uid + "-sheen"} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="46%" stopColor="#f59e0b" stopOpacity={active ? 0.22 : 0.1} />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity={active ? 0.34 : 0.16} />
            <stop offset="54%" stopColor="#f59e0b" stopOpacity={active ? 0.22 : 0.1} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          {/* center well */}
          <radialGradient id={uid + "-well"} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#1c1913" />
            <stop offset="60%" stopColor="#0a0806" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          {/* spindle cap */}
          <radialGradient id={uid + "-cap"} cx="42%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
          {/* outer ring bevel */}
          <linearGradient id={uid + "-ring"} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a443c" />
            <stop offset="50%" stopColor="#2a2620" />
            <stop offset="100%" stopColor="#100e0a" />
          </linearGradient>

          <filter id={uid + "-soft"} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>

          <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="88%" stopColor="#f59e0b" stopOpacity={active ? 0.28 : hovered ? 0.14 : 0} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ambient glow when active/hovered */}
        <circle cx="100" cy="100" r="98" fill={"url(#" + uid + "-glow)"} />

        {/* outer bevel ring */}
        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke={"url(#" + uid + "-ring)"}
          strokeWidth="6"
        />
        <circle
          cx="100"
          cy="100"
          r="93"
          fill="none"
          stroke={active ? "#f59e0b" : hovered ? "#d97706" : "#57534e"}
          strokeOpacity={active ? 0.85 : hovered ? 0.6 : 0.5}
          strokeWidth="1.5"
          style={{ transition: "stroke 200ms ease-out, stroke-opacity 200ms ease-out" }}
        />

        {/* main platter body (static, so lighting stays fixed like real light) */}
        <circle cx="100" cy="100" r="90" fill={"url(#" + uid + "-body)"} />

        {/* ==== SPINNING GROUP ==== everything here rotates with value/scratch ==== */}
        <g
          style={{
            transformOrigin: "100px 100px",
            transform: "rotate(" + rotDeg + "deg)",
            transition: active ? "none" : "transform 150ms ease-out",
          }}
        >
          {/* concentric grooves */}
          {[82, 74, 66, 58, 50].map((r, i) => (
            <circle
              key={"groove-" + i}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke="#000000"
              strokeOpacity={0.28 - i * 0.02}
              strokeWidth="1"
            />
          ))}

          {/* fine radial index marks around rim */}
          {marks.map((i) => {
            const ang = (i / marks.length) * Math.PI * 2;
            const isMajor = i % 4 === 0;
            const rOuter = 88;
            const rInner = isMajor ? 80 : 84;
            const x1 = 100 + Math.cos(ang) * rInner;
            const y1 = 100 + Math.sin(ang) * rInner;
            const x2 = 100 + Math.cos(ang) * rOuter;
            const y2 = 100 + Math.sin(ang) * rOuter;
            return (
              <line
                key={"mark-" + i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? (active ? "#fbbf24" : "#78716c") : "#44403c"}
                strokeOpacity={isMajor ? (active ? 0.9 : 0.6) : 0.45}
                strokeWidth={isMajor ? 1.4 : 0.8}
                style={{ transition: "stroke 200ms ease-out" }}
              />
            );
          })}

          {/* rotating sheen sweep */}
          <circle cx="100" cy="100" r="86" fill={"url(#" + uid + "-sheen)"} />

          {/* grip dimples ring */}
          {grips.map((i) => {
            const ang = (i / grips.length) * Math.PI * 2;
            const gr = 70;
            const gx = 100 + Math.cos(ang) * gr;
            const gy = 100 + Math.sin(ang) * gr;
            return (
              <circle
                key={"grip-" + i}
                cx={gx}
                cy={gy}
                r="1.6"
                fill="#000000"
                fillOpacity="0.45"
              />
            );
          })}

          {/* POSITION MARKER — the signature index stripe (top by default) */}
          <line
            x1="100"
            y1="14"
            x2="100"
            y2="46"
            stroke={active ? "#a3e635" : "#f59e0b"}
            strokeWidth="4"
            strokeLinecap="round"
            filter={"url(#" + uid + "-soft)"}
            style={{ transition: "stroke 200ms ease-out" }}
          />
          <line
            x1="100"
            y1="14"
            x2="100"
            y2="46"
            stroke={active ? "#d9f99d" : "#fcd34d"}
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ transition: "stroke 200ms ease-out" }}
          />
          {/* marker cap dot */}
          <circle
            cx="100"
            cy="14"
            r="3.4"
            fill={active ? "#a3e635" : "#fbbf24"}
            style={{ transition: "fill 200ms ease-out" }}
          />

          {/* secondary quarter marks on inner ring for readable spin */}
          {[0, 90, 180, 270].map((deg) => {
            const ang = (deg * Math.PI) / 180 - Math.PI / 2;
            const x1 = 100 + Math.cos(ang) * 48;
            const y1 = 100 + Math.sin(ang) * 48;
            const x2 = 100 + Math.cos(ang) * 56;
            const y2 = 100 + Math.sin(ang) * 56;
            return (
              <line
                key={"q-" + deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={active ? "#fbbf24" : "#57534e"}
                strokeOpacity={active ? 0.8 : 0.5}
                strokeWidth="1.6"
                style={{ transition: "stroke 200ms ease-out" }}
              />
            );
          })}
        </g>
        {/* ==== END SPINNING GROUP ==== */}

        {/* center well (static) */}
        <circle cx="100" cy="100" r="40" fill={"url(#" + uid + "-well)"} />
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.7"
          strokeWidth="2"
        />
        <circle
          cx="100"
          cy="100"
          r="40"
          fill="none"
          stroke={active ? "#f59e0b" : "#292524"}
          strokeOpacity={active ? 0.5 : 0.8}
          strokeWidth="0.8"
          style={{ transition: "stroke 200ms ease-out" }}
        />

        {/* rotating spindle indicator inside well (shows fine motion) */}
        <g
          style={{
            transformOrigin: "100px 100px",
            transform: "rotate(" + rotDeg + "deg)",
            transition: active ? "none" : "transform 150ms ease-out",
          }}
        >
          <line
            x1="100"
            y1="66"
            x2="100"
            y2="82"
            stroke={active ? "#a3e635" : "#78716c"}
            strokeOpacity={active ? 0.9 : 0.55}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: "stroke 200ms ease-out" }}
          />
        </g>

        {/* spindle cap (static, catches light) */}
        <circle
          cx="100"
          cy="100"
          r="15"
          fill={"url(#" + uid + "-cap)"}
          stroke="#000000"
          strokeOpacity="0.6"
          strokeWidth="1"
        />
        <circle cx="95" cy="95" r="4.5" fill="#fff7ed" fillOpacity="0.55" filter={"url(#" + uid + "-soft)"} />
        <circle cx="100" cy="100" r="3" fill="#451a03" fillOpacity="0.7" />

        {/* activity pulse ring while scratching/spinning */}
        {(active || spinning) && (
          <circle
            cx="100"
            cy="100"
            r="93"
            fill="none"
            stroke="#a3e635"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
}

export const JogWheel_MIN = {"base":[4,4]};