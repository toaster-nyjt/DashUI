type LevelMeterProps = { level: number };

export const LevelMeter_MIN = {"base":[1,3]};

export function LevelMeter(props: LevelMeterProps) {
  const uid = useRef("levelmeter-" + Math.random().toString(36).slice(2)).current;
  const SEGMENTS = 18;
  const raw = typeof props.level === "number" && isFinite(props.level) ? props.level : 0;
  const level = Math.max(0, Math.min(1, raw));

  const [peak, setPeak] = useState(level);
  const peakRef = useRef(level);

  useEffect(() => {
    if (level > peakRef.current) {
      peakRef.current = level;
      setPeak(level);
    }
  }, [level]);

  useEffect(() => {
    const id = setInterval(() => {
      peakRef.current = Math.max(level, peakRef.current - 0.02);
      setPeak(peakRef.current);
    }, 90);
    return () => clearInterval(id);
  }, [level]);

  const litCount = Math.round(level * SEGMENTS);
  const peakIndex = peak > 0.001 ? Math.max(0, Math.min(SEGMENTS - 1, Math.ceil(peak * SEGMENTS) - 1)) : -1;

  const segs = [];
  for (let i = SEGMENTS - 1; i >= 0; i--) {
    const frac = (i + 1) / SEGMENTS;
    const lit = i < litCount;
    const isPeak = i === peakIndex;
    let litColor = "bg-lime-400";
    let glow = "shadow-[0_0_6px_rgba(163,230,53,0.6)]";
    if (frac > 0.92) { litColor = "bg-red-500"; glow = "shadow-[0_0_7px_rgba(239,68,68,0.7)]"; }
    else if (frac > 0.78) { litColor = "bg-amber-400"; glow = "shadow-[0_0_6px_rgba(251,191,36,0.6)]"; }
    else if (frac > 0.6) { litColor = "bg-amber-500/90"; glow = "shadow-[0_0_5px_rgba(245,158,11,0.5)]"; }

    const cls =
      "flex-1 min-h-0 min-w-0 rounded-[2px] transition-all duration-100 ease-linear " +
      (lit
        ? litColor + " " + glow + " opacity-100"
        : isPeak
        ? litColor + " opacity-60"
        : "bg-stone-800/70 opacity-70");

    segs.push(<div key={uid + "-seg-" + i} className={cls} />);
  }

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: LevelMeter_MIN.base[0] + "rem", minHeight: LevelMeter_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-black/70 shadow-inner shadow-black/70 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/40 to-black/60" />
        <div
          className="absolute inset-0 transition-opacity duration-200 ease-out"
          style={{ opacity: 0.12 + level * 0.5, background: "linear-gradient(to top, rgba(163,230,53,0.25), transparent 60%)" }}
        />
      </div>
      <div className="absolute inset-[9%] flex flex-col gap-[2px]">{segs}</div>
    </div>
  );
}