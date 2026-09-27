type PerkNodeProps = { state: 'locked' | 'available' | 'unlocked'; rank: number; maxRank: number; onSpend: (id: string) => void; id: string; hover?: (id: string | null) => void; children?: React.ReactNode };

export const PerkNode_MIN = {"base":[3.5,3.5]};

function PerkNodeHexPath(r: number) {
  let d = "";
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    const x = 50 + r * Math.cos(a);
    const y = 50 + r * Math.sin(a);
    d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
  }
  return d + "Z";
}

export function PerkNode(props: PerkNodeProps) {
  const { state, rank, maxRank, onSpend, id, hover, children } = props;
  const uid = useRef("perknode-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hot, setHot] = useState(false);
  const floor = PerkNode_MIN.base;

  const interactive = state === 'available';
  const locked = state === 'locked';
  const unlocked = state === 'unlocked';

  const stroke = locked ? "#525252" : unlocked ? "#fbbf24" : "#e879f9";
  const glow = locked ? "rgba(0,0,0,0)" : unlocked ? "rgba(251,191,36,0.55)" : "rgba(232,121,249,0.55)";
  const textCls = locked
    ? "font-mono font-bold tracking-widest uppercase text-neutral-500 transition-all duration-200 ease-out"
    : unlocked
    ? "font-mono font-bold tracking-widest uppercase text-amber-300 transition-all duration-200 ease-out"
    : "font-mono font-bold tracking-widest uppercase text-fuchsia-300 transition-all duration-200 ease-out";

  const pips = Math.max(0, Math.min(maxRank || 0, 12));
  const filled = Math.max(0, Math.min(rank, pips));

  const handleDown = () => { if (interactive) setPress(true); };
  const handleUp = () => setPress(false);
  const handleClick = () => { if (interactive) onSpend(id); };

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerEnter={() => { setHot(true); if (hover) hover(id); }}
      onPointerLeave={() => { setHot(false); setPress(false); if (hover) hover(null); }}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onClick={handleClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => { if (interactive && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSpend(id); } }}
    >
      <div
        className={
          "absolute inset-0 transition-all duration-200 ease-out focus-visible:outline-none " +
          (locked ? "opacity-40 grayscale " : "") +
          (interactive ? "cursor-pointer " : "") +
          (press ? "scale-[0.94] brightness-125 " : hot && interactive ? "scale-[1.04] " : "scale-100 ")
        }
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id={uid + "-core"} cx="50%" cy="38%" r="70%">
              <stop offset="0%" stopColor={unlocked ? "#4a3a12" : locked ? "#1a1a1a" : "#3a1240"} />
              <stop offset="100%" stopColor="#050505" />
            </radialGradient>
            <linearGradient id={uid + "-rim"} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.95" />
              <stop offset="60%" stopColor={stroke} stopOpacity="0.45" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.9" />
            </linearGradient>
            <filter id={uid + "-blur"} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
          </defs>

          {!locked ? (
            <path
              d={PerkNodeHexPath(46)}
              fill="none"
              stroke={stroke}
              strokeOpacity={unlocked ? 0.75 : hot ? 0.8 : 0.45}
              strokeWidth={6}
              filter={"url(#" + uid + "-blur)"}
            />
          ) : null}

          <path d={PerkNodeHexPath(42)} fill={"url(#" + uid + "-core)"} />
          <path
            d={PerkNodeHexPath(42)}
            fill="none"
            stroke={"url(#" + uid + "-rim)"}
            strokeWidth={hot && interactive ? 3.4 : 2.4}
            className="transition-all duration-200 ease-out"
          />
          <path
            d={PerkNodeHexPath(34)}
            fill="none"
            stroke={stroke}
            strokeOpacity={0.22}
            strokeWidth={0.8}
            strokeDasharray="4 5"
          >
            {interactive ? (
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="14s" repeatCount="indefinite" />
            ) : null}
          </path>

          {unlocked ? (
            <path d={PerkNodeHexPath(42)} fill="#fbbf24" opacity="0.07" />
          ) : null}

          {locked ? (
            <g stroke="#737373" strokeWidth="2.4" fill="none" opacity="0.7">
              <path d="M42 68 L58 32" />
            </g>
          ) : null}

          {pips > 0
            ? Array.from({ length: pips }).map((_, i) => {
                const spread = 54;
                const step = pips > 1 ? spread / (pips - 1) : 0;
                const a = (Math.PI / 180) * (90 - spread / 2 + i * step);
                const x = 50 + 46 * Math.cos(a);
                const y = 50 + 46 * Math.sin(a);
                const on = i < filled;
                return (
                  <circle
                    key={"pip-" + i}
                    cx={x}
                    cy={y}
                    r={on ? 3.6 : 2.4}
                    fill={on ? stroke : "#0a0a0a"}
                    stroke={stroke}
                    strokeOpacity={on ? 1 : 0.35}
                    strokeWidth="1"
                    style={{ filter: on ? "drop-shadow(0 0 3px " + glow + ")" : "none" }}
                    className="transition-all duration-200 ease-out"
                  />
                );
              })
            : null}
        </svg>

        {children ? (
          <div className="absolute inset-[26%] flex items-center justify-center">
            <FitText className={textCls}>{children}</FitText>
          </div>
        ) : null}
      </div>

      {interactive ? (
        <div
          className="pointer-events-none absolute inset-[6%] animate-pulse"
          style={{ boxShadow: "0 0 12px rgba(232,121,249,0.5)", clipPath: "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)", opacity: hot ? 0.35 : 0.15 }}
        />
      ) : null}
    </div>
  );
}