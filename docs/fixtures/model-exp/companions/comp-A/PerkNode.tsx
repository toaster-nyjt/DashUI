type PerkNodeProps = { state: 'locked' | 'available' | 'unlocked'; rank: number; maxRank: number; onSpend: (id: string) => void; id: string; hover?: (id: string | null) => void; children?: React.ReactNode };

export const PerkNode_MIN = {"base":[3.5,3.5]};

export function PerkNode(props: PerkNodeProps) {
  const { state, rank, maxRank, onSpend, id, hover, children } = props;
  const uid = useRef("perknode-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hot, setHot] = useState(false);

  const maxR = Math.max(1, Math.floor(maxRank));
  const r = Math.max(0, Math.min(maxR, Math.floor(rank)));
  const full = r >= maxR;
  const interactive = state !== "locked" && !full;

  const C = state === "locked"
    ? { main: "#737373", glow: "rgba(115,115,115,0.25)", face: "text-neutral-500", pipOn: "#a3a3a3", pipOff: "rgba(115,115,115,0.25)" }
    : state === "unlocked"
    ? { main: "#e879f9", glow: "rgba(232,121,249,0.55)", face: "text-fuchsia-300", pipOn: "#e879f9", pipOff: "rgba(232,121,249,0.2)" }
    : { main: "#22d3ee", glow: "rgba(34,211,238,0.55)", face: "text-cyan-300", pipOn: "#22d3ee", pipOff: "rgba(34,211,238,0.18)" };

  // octagon points in 0..100 viewbox
  const oct = (rad: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI / 4) * i + Math.PI / 8;
      pts.push((50 + rad * Math.cos(a)).toFixed(2) + "," + (50 + rad * Math.sin(a)).toFixed(2));
    }
    return pts.join(" ");
  };

  const pipR = 45.5;
  const gap = 5; // degrees gap
  const seg = 360 / maxR;
  const arc = (idx: number) => {
    const a0 = (-90 + idx * seg + gap / 2) * (Math.PI / 180);
    const a1 = (-90 + (idx + 1) * seg - gap / 2) * (Math.PI / 180);
    const x0 = 50 + pipR * Math.cos(a0), y0 = 50 + pipR * Math.sin(a0);
    const x1 = 50 + pipR * Math.cos(a1), y1 = 50 + pipR * Math.sin(a1);
    const large = seg - gap > 180 ? 1 : 0;
    return "M " + x0.toFixed(2) + " " + y0.toFixed(2) + " A " + pipR + " " + pipR + " 0 " + large + " 1 " + x1.toFixed(2) + " " + y1.toFixed(2);
  };

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: PerkNode_MIN.base[0] + "rem", minHeight: PerkNode_MIN.base[1] + "rem" }}
      onPointerEnter={() => { setHot(true); if (hover) hover(id); }}
      onPointerLeave={() => { setHot(false); setPress(false); if (hover) hover(null); }}
      onPointerDown={(e) => { if (!interactive) return; e.currentTarget.setPointerCapture(e.pointerId); setPress(true); }}
      onPointerUp={() => { if (press && interactive) onSpend(id); setPress(false); }}
      onPointerCancel={() => setPress(false)}
    >
      <div
        className="absolute inset-0 transition-all duration-200 ease-out touch-none"
        style={{
          cursor: interactive ? "pointer" : "default",
          transform: press ? "scale(0.94)" : hot && interactive ? "scale(1.05)" : "scale(1)",
          filter: state === "locked" ? "grayscale(1)" : "none",
          opacity: state === "locked" ? 0.45 : 1,
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-core"} cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor={C.main} stopOpacity={state === "unlocked" ? 0.45 : 0.22} />
              <stop offset="60%" stopColor="#000000" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
            </radialGradient>
            <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* outer halo */}
          {state !== "locked" && (
            <polygon
              points={oct(41)}
              fill="none"
              stroke={C.main}
              strokeOpacity={hot ? 0.5 : 0.25}
              strokeWidth={press ? 6 : 4}
              filter={"url(#" + uid + "-glow)"}
              className="transition-all duration-200 ease-out"
            >
              {state === "available" && !full && (
                <animate attributeName="stroke-opacity" values="0.18;0.6;0.18" dur="2.2s" repeatCount="indefinite" />
              )}
            </polygon>
          )}

          {/* body */}
          <polygon points={oct(38)} fill={"url(#" + uid + "-core)"} />
          <polygon
            points={oct(38)}
            fill="none"
            stroke={C.main}
            strokeOpacity={state === "locked" ? 0.5 : hot ? 1 : 0.8}
            strokeWidth="2"
            className="transition-all duration-200 ease-out"
          />
          {/* inner bevel */}
          <polygon points={oct(31)} fill="none" stroke={C.main} strokeOpacity="0.18" strokeWidth="0.8" />

          {/* corner ticks */}
          {[0, 1, 2, 3].map((i) => {
            const a = (Math.PI / 2) * i + Math.PI / 4;
            const x1 = 50 + 38 * Math.cos(a), y1 = 50 + 38 * Math.sin(a);
            const x2 = 50 + 44 * Math.cos(a), y2 = 50 + 44 * Math.sin(a);
            return <line key={"t" + i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.main} strokeOpacity="0.45" strokeWidth="1.4" />;
          })}

          {/* rank pips */}
          {Array.from({ length: maxR }).map((_, i) => (
            <path
              key={"p" + i}
              d={arc(i)}
              fill="none"
              stroke={i < r ? C.pipOn : C.pipOff}
              strokeWidth={i < r ? 4 : 2.4}
              strokeLinecap="butt"
              className="transition-all duration-300 ease-out"
              filter={i < r ? "url(#" + uid + "-glow)" : undefined}
            />
          ))}

          {/* locked slash */}
          {state === "locked" && (
            <g stroke="#737373" strokeWidth="2" strokeOpacity="0.55">
              <line x1="34" y1="34" x2="66" y2="66" />
            </g>
          )}

          {/* full ring flash */}
          {full && state === "unlocked" && (
            <circle cx="50" cy="50" r="46.5" fill="none" stroke={C.main} strokeOpacity="0.3" strokeWidth="0.8">
              <animate attributeName="r" values="42;50;42" dur="3s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="3s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>

        {children != null && children !== false && (
          <div className="absolute inset-[26%] flex items-center justify-center">
            <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + C.face}>
              {children}
            </FitText>
          </div>
        )}
      </div>
    </div>
  );
}