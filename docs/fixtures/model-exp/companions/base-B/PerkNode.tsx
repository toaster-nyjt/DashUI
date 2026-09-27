type PerkNodeProps = {
  state: 'locked' | 'available' | 'unlocked';
  rank: number;
  maxRank: number;
  onSpend: (id: string) => void;
  id: string;
  hover?: (id: string | null) => void;
  children?: React.ReactNode;
};

export const PerkNode_MIN = {"base":[3.5,3.5]};

export function PerkNode(props: PerkNodeProps) {
  const uid = useRef("perknode-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hot, setHot] = useState(false);

  const state = props.state;
  const interactive = state !== "locked";
  const maxRank = Math.max(1, Math.floor(props.maxRank || 1));
  const rank = Math.max(0, Math.min(maxRank, Math.floor(props.rank || 0)));

  const C =
    state === "locked"
      ? { main: "#525252", dim: "#3f3f46", glow: "rgba(82,82,91,0)", txt: "text-neutral-500" }
      : state === "available"
      ? { main: "#22d3ee", dim: "#0e7490", glow: "rgba(34,211,238,0.55)", txt: "text-cyan-300" }
      : { main: "#e879f9", dim: "#a21caf", glow: "rgba(232,121,249,0.6)", txt: "text-fuchsia-300" };

  const pts: string[] = [];
  const R = 44;
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push((50 + R * Math.cos(a)).toFixed(2) + "," + (50 + R * Math.sin(a)).toFixed(2));
  }
  const hex = pts.join(" ");
  const pts2: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts2.push((50 + 34 * Math.cos(a)).toFixed(2) + "," + (50 + 34 * Math.sin(a)).toFixed(2));
  }
  const hexInner = pts2.join(" ");

  const fillRatio = rank / maxRank;

  const act = () => {
    if (!interactive) return;
    props.onSpend(props.id);
  };

  const floor = PerkNode_MIN.base;

  const pips = [];
  for (let i = 0; i < maxRank; i++) {
    const span = Math.min(9, 46 / maxRank);
    const total = span * (maxRank - 1);
    const x = 50 - total / 2 + i * span;
    const filled = i < rank;
    pips.push(
      <g key={"pip-" + i}>
        <circle
          cx={x}
          cy={80}
          r={filled ? 3 : 2.2}
          fill={filled ? C.main : "#000"}
          stroke={filled ? C.main : C.dim}
          strokeWidth={1}
          style={{
            filter: filled ? "drop-shadow(0 0 3px " + C.glow + ")" : "none",
            transition: "all 260ms ease-out",
          }}
        />
      </g>
    );
  }

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerEnter={() => {
        setHot(true);
        if (props.hover) props.hover(props.id);
      }}
      onPointerLeave={() => {
        setHot(false);
        setPress(false);
        if (props.hover) props.hover(null);
      }}
      onPointerDown={(e) => {
        if (!interactive) return;
        (e.currentTarget as any).setPointerCapture?.(e.pointerId);
        setPress(true);
      }}
      onPointerUp={() => {
        if (press) act();
        setPress(false);
      }}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          act();
        }
      }}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-disabled={!interactive}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className={
          "absolute inset-0 h-full w-full touch-none transition-all duration-200 ease-out " +
          (interactive ? "cursor-pointer " : "cursor-default opacity-60 grayscale ") +
          (press ? "scale-[0.94] " : hot && interactive ? "scale-[1.05] " : "scale-100 ")
        }
        style={{ transformOrigin: "50% 50%" }}
      >
        <defs>
          <linearGradient id={uid + "-fill"} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={C.main} stopOpacity="0.55" />
            <stop offset="100%" stopColor={C.main} stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={uid + "-clip"}>
            <polygon points={hex} />
          </clipPath>
          <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation={hot && interactive ? 3.4 : 2} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* outer aura */}
        {state !== "locked" && (
          <polygon
            points={hex}
            fill="none"
            stroke={C.main}
            strokeWidth={hot ? 5 : 3}
            opacity={state === "available" ? 0.28 : 0.4}
            filter={"url(#" + uid + "-glow)"}
            className={state === "available" ? "animate-pulse" : ""}
            style={{ transition: "all 200ms ease-out" }}
          />
        )}

        {/* body */}
        <g clipPath={"url(#" + uid + "-clip)"}>
          <polygon points={hex} fill="#000000" opacity="0.85" />
          <rect
            x="0"
            y={100 - fillRatio * 100}
            width="100"
            height={fillRatio * 100}
            fill={"url(#" + uid + "-fill)"}
            style={{ transition: "all 400ms cubic-bezier(.2,.8,.2,1)" }}
          />
          {/* scanlines */}
          {[18, 30, 42, 54, 66].map((y) => (
            <rect key={"sl-" + y} x="0" y={y} width="100" height="1" fill={C.main} opacity="0.07" />
          ))}
          <polygon points={hex} fill={"url(#" + uid + "-sheen)"} />
        </g>

        {/* borders */}
        <polygon
          points={hex}
          fill="none"
          stroke={C.main}
          strokeWidth={state === "unlocked" ? 3 : 2}
          opacity={state === "locked" ? 0.7 : 1}
          style={{ transition: "all 200ms ease-out" }}
        />
        <polygon
          points={hexInner}
          fill="none"
          stroke={C.main}
          strokeWidth="0.8"
          opacity={hot && interactive ? 0.5 : 0.22}
          strokeDasharray="6 5"
          style={{ transition: "opacity 200ms ease-out" }}
        >
          {state === "available" && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="12s"
              repeatCount="indefinite"
            />
          )}
        </polygon>

        {/* corner ticks */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (Math.PI / 180) * (60 * i - 90);
          const x1 = 50 + 44 * Math.cos(a);
          const y1 = 50 + 44 * Math.sin(a);
          const x2 = 50 + 50 * Math.cos(a);
          const y2 = 50 + 50 * Math.sin(a);
          return (
            <line
              key={"tk-" + i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={C.main}
              strokeWidth="1.6"
              opacity={i < Math.round((rank / maxRank) * 6) ? 0.9 : 0.25}
              style={{ transition: "opacity 300ms ease-out" }}
            />
          );
        })}

        {/* lock slash */}
        {state === "locked" && (
          <g opacity="0.55">
            <line x1="34" y1="34" x2="66" y2="66" stroke="#525252" strokeWidth="2.4" />
            <line x1="66" y1="34" x2="34" y2="66" stroke="#525252" strokeWidth="2.4" />
          </g>
        )}

        {/* face content */}
        {props.children != null && (
          <foreignObject x="24" y={maxRank > 1 ? 30 : 34} width="52" height={maxRank > 1 ? 36 : 34}>
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              <FitText
                className={
                  "font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + C.txt
                }
              >
                {props.children}
              </FitText>
            </div>
          </foreignObject>
        )}

        {/* rank pips */}
        {maxRank > 1 && <g>{pips}</g>}
      </svg>
    </div>
  );
}