type LevelMeterProps = { level: number };

export const LevelMeter_MIN = {"base":[1.25,4]};

export function LevelMeter(props: LevelMeterProps) {
  const N = 18;
  const raw = typeof props.level === "number" && isFinite(props.level) ? props.level : 0;
  const lvl = Math.max(0, Math.min(1, raw));

  const [peak, setPeak] = useState(lvl);

  useEffect(() => {
    setPeak((p) => (lvl > p ? lvl : p));
  }, [lvl]);

  useEffect(() => {
    const id = setInterval(() => {
      setPeak((p) => (p > lvl ? Math.max(lvl, p - 0.015) : lvl));
    }, 60);
    return () => clearInterval(id);
  }, [lvl]);

  const segColor = (i: number) => {
    const t = (i + 1) / N;
    if (t > 0.9) return { on: "bg-red-500", glow: "shadow-[0_0_6px_rgba(239,68,68,0.8)]" };
    if (t > 0.72) return { on: "bg-amber-400", glow: "shadow-[0_0_6px_rgba(251,191,36,0.7)]" };
    return { on: "bg-lime-400", glow: "shadow-[0_0_6px_rgba(163,230,53,0.55)]" };
  };

  const segs = [];
  for (let i = 0; i < N; i++) {
    const lo = i / N;
    const hi = (i + 1) / N;
    const frac = lvl <= lo ? 0 : lvl >= hi ? 1 : (lvl - lo) / (hi - lo);
    const c = segColor(i);
    segs.push(
      <div key={"seg-" + i} className="relative flex-1 min-h-0 w-full rounded-[2px] overflow-hidden bg-stone-800/50">
        <div
          className={
            "absolute inset-0 rounded-[2px] transition-all duration-100 ease-linear " +
            c.on +
            " " +
            (frac > 0.2 ? c.glow : "")
          }
          style={{ opacity: frac === 0 ? 0.06 : 0.35 + 0.65 * frac }}
        />
      </div>
    );
  }

  const peakPct = Math.max(0, Math.min(100, peak * 100));
  const clip = peak > 0.96;

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: LevelMeter_MIN.base[0] + "rem", minHeight: LevelMeter_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/25 to-black/50" />
      </div>

      <div className="absolute inset-[7%] flex flex-col-reverse gap-[2px]">{segs}</div>

      <div className="absolute inset-[7%] pointer-events-none">
        <div
          className={
            "absolute left-0 right-0 h-[2px] rounded-full transition-all duration-150 ease-out " +
            (clip ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" : "bg-amber-300 shadow-[0_0_6px_rgba(252,211,77,0.7)]")
          }
          style={{ bottom: "calc(" + peakPct + "% - 1px)", opacity: peak > 0.02 ? 1 : 0 }}
        />
      </div>

      <div
        className={
          "absolute inset-0 rounded-xl pointer-events-none transition-all duration-200 ease-out ring-1 ring-inset " +
          (clip ? "ring-red-500/60 animate-pulse" : "ring-amber-500/10")
        }
      />
    </div>
  );
}