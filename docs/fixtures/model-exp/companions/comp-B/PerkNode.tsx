type PerkNodeProps = { state: 'locked' | 'available' | 'unlocked'; rank: number; maxRank: number; onSpend: (id: string) => void; id: string; hover?: (id: string | null) => void; children?: React.ReactNode };

export function PerkNode(props: PerkNodeProps) {
  const { state, rank, maxRank, onSpend, id, hover, children } = props;
  const uid = useRef("perknode-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hot, setHot] = useState(false);
  const floor = PerkNode_MIN.base;

  const canSpend = state !== "locked" && rank < Math.max(1, maxRank);
  const accent = state === "locked" ? "#737373" : state === "unlocked" ? "#f0abfc" : "#22d3ee";
  const accentDim = state === "locked" ? "#404040" : state === "unlocked" ? "#a21caf" : "#0e7490";

  const hexPts = (r: number) => {
    let pts = "";
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 90);
      pts += (50 + r * Math.cos(a)).toFixed(2) + "," + (50 + r * Math.sin(a)).toFixed(2) + " ";
    }
    return pts.trim();
  };

  const total = Math.max(1, maxRank);
  const pips = [];
  for (let i = 0; i < total; i++) {
    const filled = i < rank;
    const span = 54;
    const start = 90 - (span * (total - 1)) / 2;
    const ang = (Math.PI / 180) * (start + span * i + 90);
    const R = 41;
    const cx = 50 + R * Math.cos(ang);
    const cy = 50 + R * Math.sin(ang);
    pips.push(
      <circle
        key={"pip-" + i}
        cx={cx}
        cy={cy}
        r={filled ? 4.2 : 3}
        fill={filled ? accent : "#0a0a0a"}
        stroke={filled ? accent : accentDim}
        strokeWidth="1.2"
        style={{ filter: filled ? "drop-shadow(0 0 3px " + accent + ")" : "none", transition: "all 240ms ease-out" }}
      />
    );
  }

  const interactive = state !== "locked";

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerEnter={() => { setHot(true); if (hover) hover(id); }}
      onPointerLeave={() => { setHot(false); setPress(false); if (hover) hover(null); }}
    >
      <button
        type="button"
        disabled={!canSpend}
        onPointerDown={() => { if (canSpend) setPress(true); }}
        onPointerUp={() => setPress(false)}
        onClick={() => { if (canSpend) onSpend(id); }}
        className={"absolute inset-0 block bg-transparent border-0 p-0 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " + (canSpend ? "cursor-pointer" : "cursor-default") + (state === "locked" ? " opacity-45 grayscale" : "")}
        style={{ transform: press ? "scale(0.94)" : hot && canSpend ? "scale(1.05)" : "scale(1)" }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-core"} cx="50%" cy="35%" r="70%">
              <stop offset="0%" stopColor={accent} stopOpacity={state === "unlocked" ? 0.45 : 0.22} />
              <stop offset="60%" stopColor="#0a0a0a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#000" stopOpacity="1" />
            </radialGradient>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} />
              <stop offset="100%" stopColor={accentDim} />
            </linearGradient>
            <clipPath id={uid + "-clip"}>
              <polygon points={hexPts(33)} />
            </clipPath>
          </defs>

          {/* outer halo */}
          <polygon
            points={hexPts(36)}
            fill="none"
            stroke={accent}
            strokeWidth={state === "available" ? 1.2 : 0.8}
            opacity={hot && interactive ? 0.75 : 0.28}
            style={{ transition: "opacity 220ms ease-out" }}
          >
            {state === "available" ? (
              <animate attributeName="opacity" values="0.25;0.8;0.25" dur="2.2s" repeatCount="indefinite" />
            ) : null}
          </polygon>

          {/* body */}
          <polygon
            points={hexPts(33)}
            fill={"url(#" + uid + "-core)"}
            stroke={"url(#" + uid + "-edge)"}
            strokeWidth="2.2"
            style={{ filter: interactive ? "drop-shadow(0 0 " + (hot ? 8 : 4) + "px " + accent + "80)" : "none", transition: "filter 220ms ease-out" }}
          />

          {/* scan lines inside body */}
          <g clipPath={"url(#" + uid + "-clip)"} opacity="0.35">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={"sl-" + i} x="14" y={18 + i * 8.6} width="72" height="1" fill={accent} opacity="0.25" />
            ))}
            {state === "available" ? (
              <rect x="14" y="16" width="72" height="4" fill={accent} opacity="0.5">
                <animate attributeName="y" values="16;80;16" dur="3s" repeatCount="indefinite" />
              </rect>
            ) : null}
          </g>

          {/* inner frame */}
          <polygon points={hexPts(26)} fill="none" stroke={accent} strokeWidth="0.7" opacity="0.35" />

          {pips}

          {state === "locked" ? (
            <g stroke="#737373" strokeWidth="2" strokeLinecap="round" opacity="0.9">
              <line x1="43" y1="50" x2="57" y2="50" />
              <line x1="50" y1="43" x2="50" y2="57" transform="rotate(45 50 50)" />
            </g>
          ) : null}
        </svg>
      </button>

      {children != null && state !== "locked" ? (
        <div className="pointer-events-none absolute inset-[30%] flex items-center justify-center">
          <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + (state === "unlocked" ? "text-fuchsia-300" : "text-cyan-200")}>
            {children}
          </FitText>
        </div>
      ) : null}
    </div>
  );
}

export const PerkNode_MIN = {"base":[3,3]};