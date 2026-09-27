type PerkNodeProps = { state: 'locked' | 'available' | 'unlocked'; rank: number; maxRank: number; onSpend: (id: string) => void; id: string; hover?: (id: string | null) => void; children?: React.ReactNode };

export const PerkNode_MIN = {"base":[3,3.25]};

export function PerkNode(props: PerkNodeProps) {
  const { state, rank, maxRank, onSpend, id, hover, children } = props;
  const uid = useRef("perknode-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hov, setHov] = useState(false);

  const canSpend = state !== "locked" && rank < maxRank;
  const accent = state === "unlocked" ? "#22d3ee" : state === "available" ? "#e879f9" : "#525252";
  const accentSoft = state === "unlocked" ? "#a5f3fc" : state === "available" ? "#f5d0fe" : "#737373";

  const hex = "M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z";
  const hexIn = "M50 14 L81.5 32 L81.5 68 L50 86 L18.5 68 L18.5 32 Z";

  const pips = [];
  const n = Math.max(1, maxRank);
  for (let i = 0; i < n; i++) {
    const w = 62 / n;
    const x = 19 + i * w;
    const filled = i < rank;
    pips.push(
      <rect
        key={"pip-" + i}
        x={x + 1}
        y={88.5}
        width={Math.max(1, w - 2)}
        height={3.2}
        fill={filled ? accent : "#000"}
        stroke={filled ? "none" : accent}
        strokeOpacity={0.35}
        strokeWidth={0.6}
        style={{ transition: "fill 200ms ease-out", filter: filled ? "drop-shadow(0 0 3px " + accent + ")" : "none" }}
      />
    );
  }

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: PerkNode_MIN.base[0] + "rem", minHeight: PerkNode_MIN.base[1] + "rem" }}
      onPointerEnter={() => { setHov(true); if (hover) hover(id); }}
      onPointerLeave={() => { setHov(false); setPress(false); if (hover) hover(null); }}
      onPointerDown={(e) => { if (!canSpend) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
      onPointerUp={() => { if (press && canSpend) onSpend(id); setPress(false); }}
      onPointerCancel={() => setPress(false)}
    >
      <div
        className="absolute inset-0 touch-none transition-all duration-200 ease-out"
        style={{
          cursor: canSpend ? "pointer" : "default",
          opacity: state === "locked" ? 0.45 : 1,
          filter: state === "locked" ? "grayscale(1)" : "none",
          transform: press ? "scale(0.95)" : hov && canSpend ? "scale(1.05)" : "scale(1)",
        }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={state === "unlocked" ? 0.34 : 0.16} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
            </linearGradient>
            <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
              <stop offset="55%" stopColor={accent} stopOpacity="0" />
              <stop offset="100%" stopColor={accent} stopOpacity={hov && canSpend ? 0.45 : 0.22} />
            </radialGradient>
          </defs>

          <path d={hex} fill={"url(#" + uid + "-glow)"} style={{ transition: "opacity 200ms ease-out" }} />
          <path d={hex} fill={"url(#" + uid + "-fill)"} stroke={accent} strokeOpacity={state === "locked" ? 0.5 : 0.9} strokeWidth="1.8"
            style={{ filter: state === "locked" ? "none" : "drop-shadow(0 0 " + (hov && canSpend ? 5 : 2.5) + "px " + accent + ")", transition: "all 200ms ease-out" }} />
          <path d={hexIn} fill="none" stroke={accentSoft} strokeOpacity={state === "unlocked" ? 0.45 : 0.22} strokeWidth="0.7" strokeDasharray="5 4">
            {state === "available" ? <animate attributeName="stroke-opacity" values="0.15;0.6;0.15" dur="2.2s" repeatCount="indefinite" /> : null}
          </path>

          {state === "unlocked" ? (
            <path d="M34 50 L46 62 L68 38" fill="none" stroke={accent} strokeOpacity="0.16" strokeWidth="3" strokeLinecap="square" />
          ) : null}
          {state === "locked" ? (
            <g stroke={accentSoft} strokeOpacity="0.5" strokeWidth="2" fill="none">
              <rect x="42" y="47" width="16" height="13" />
              <path d="M45.5 47 v-5 a4.5 4.5 0 0 1 9 0 v5" />
            </g>
          ) : null}

          {pips}
        </svg>
      </div>

      {children && state !== "locked" ? (
        <div className="pointer-events-none absolute inset-x-[24%] inset-y-[30%] flex items-center justify-center">
          <FitText className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + (state === "unlocked" ? "text-cyan-200" : "text-fuchsia-200")}>
            {children}
          </FitText>
        </div>
      ) : null}
      {children && state === "locked" ? (
        <div className="pointer-events-none absolute inset-x-[24%] bottom-[2%] top-[62%] flex items-center justify-center opacity-60">
          <FitText className="font-mono font-bold uppercase tracking-widest text-neutral-500" wrap={false}>{children}</FitText>
        </div>
      ) : null}
    </div>
  );
}