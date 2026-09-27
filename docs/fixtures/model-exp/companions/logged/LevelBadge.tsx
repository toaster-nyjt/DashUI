type LevelBadgeProps = { level: number; progress?: number };

export const LevelBadge_MIN = {"base":[3,3]};

export function LevelBadge(props: LevelBadgeProps) {
  const uid = useRef("levelbadge-" + Math.random().toString(36).slice(2)).current;
  const floor = LevelBadge_MIN.base;
  const hasProg = typeof props.progress === "number" && isFinite(props.progress as number);
  const p = hasProg ? Math.max(0, Math.min(1, props.progress as number)) : 0;

  const lvl = Math.round(props.level);
  const prevRef = useRef(lvl);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (prevRef.current !== lvl) {
      prevRef.current = lvl;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 620);
      return () => clearTimeout(t);
    }
  }, [lvl]);

  const hex = (r: number) => {
    let d = "";
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (i * 60 - 90);
      const x = 50 + r * Math.cos(a);
      const y = 50 + r * Math.sin(a);
      d += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    }
    return d + "Z";
  };

  const ticks = [];
  for (let i = 0; i < 24; i++) {
    const a = (Math.PI / 180) * (i * 15 - 90);
    const r1 = 47.5;
    const r2 = i % 6 === 0 ? 42 : 45;
    ticks.push(
      <line
        key={"tk-" + i}
        x1={50 + r1 * Math.cos(a)}
        y1={50 + r1 * Math.sin(a)}
        x2={50 + r2 * Math.cos(a)}
        y2={50 + r2 * Math.sin(a)}
        stroke={i % 6 === 0 ? "rgba(34,211,238,0.55)" : "rgba(34,211,238,0.2)"}
        strokeWidth={i % 6 === 0 ? 2 : 1}
      />
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={uid + "-face"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(23,23,23,0.95)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.95)" />
          </linearGradient>
          <linearGradient id={uid + "-arc"} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#a5f3fc" />
          </linearGradient>
          <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
            <stop offset="55%" stopColor="rgba(34,211,238,0)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.22)" />
          </radialGradient>
          <filter id={uid + "-blur"} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <circle cx="50" cy="50" r="49" fill={"url(#" + uid + "-glow)"} />

        <path d={hex(47)} fill={"url(#" + uid + "-face)"} stroke="rgba(34,211,238,0.28)" strokeWidth="1.5" />
        <path d={hex(41)} fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth="1" />
        {ticks}

        {hasProg ? (
          <g>
            <path
              d={hex(44)}
              pathLength={1}
              fill="none"
              stroke="rgba(34,211,238,0.14)"
              strokeWidth="5"
              strokeLinecap="butt"
            />
            <path
              d={hex(44)}
              pathLength={1}
              fill="none"
              stroke={"url(#" + uid + "-arc)"}
              strokeWidth="5"
              strokeLinecap="butt"
              strokeDasharray={p + " 1"}
              filter={"url(#" + uid + "-blur)"}
              opacity="0.8"
              style={{ transition: "stroke-dasharray 600ms cubic-bezier(.2,.8,.2,1)" }}
            />
            <path
              d={hex(44)}
              pathLength={1}
              fill="none"
              stroke={"url(#" + uid + "-arc)"}
              strokeWidth="3"
              strokeLinecap="butt"
              strokeDasharray={p + " 1"}
              style={{ transition: "stroke-dasharray 600ms cubic-bezier(.2,.8,.2,1)" }}
            />
          </g>
        ) : (
          <path d={hex(44)} fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="1.5" strokeDasharray="3 4" />
        )}

        {flash ? (
          <path d={hex(47)} fill="none" stroke="#e879f9" strokeWidth="3" className="animate-ping" />
        ) : null}
      </svg>

      <div className="absolute inset-[26%] flex items-center justify-center">
        <FitText
          wrap={false}
          className={
            "font-mono font-bold tracking-widest uppercase transition-all duration-200 ease-out " +
            (flash ? "text-fuchsia-300 drop-shadow-[0_0_10px_rgba(232,121,249,0.8)]" : "text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]")
          }
        >
          {String(lvl)}
        </FitText>
      </div>
    </div>
  );
}