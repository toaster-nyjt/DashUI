type StatBarProps = { value: number; min: number; max: number; segments?: number; showValue?: boolean; tone?: 'neutral' | 'accent' | 'danger' | 'success' };

export const StatBar_MIN = {"base":[6,1.5]};

export function StatBar(props: StatBarProps) {
  const { value, min, max, segments, showValue, tone } = props;
  const uid = useRef("statbar-" + Math.random().toString(36).slice(2)).current;

  const span = max - min;
  const raw = span === 0 ? 0 : (value - min) / span;
  const pct = Math.max(0, Math.min(1, isFinite(raw) ? raw : 0));

  const TONES: any = {
    neutral: { fill: "#38bdf8", glow: "rgba(56,189,248,0.55)", text: "text-sky-300" },
    accent: { fill: "#22d3ee", glow: "rgba(34,211,238,0.6)", text: "text-cyan-300" },
    danger: { fill: "#ef4444", glow: "rgba(239,68,68,0.6)", text: "text-red-400" },
    success: { fill: "#a3e635", glow: "rgba(163,230,53,0.6)", text: "text-lime-400" }
  };
  const t = TONES[tone || "neutral"];

  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 420);
      return () => clearTimeout(id);
    }
  }, [value]);

  const segCount = segments && segments > 0 ? Math.floor(segments) : 0;

  const track = (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-0 bg-cyan-950/40" />
      <div
        className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          width: (pct * 100) + "%",
          background: "linear-gradient(90deg," + t.fill + "33 0%," + t.fill + " 70%," + t.fill + " 100%)",
          boxShadow: "0 0 12px " + t.glow + ", inset 0 0 6px rgba(255,255,255,0.18)"
        }}
      />
      <div
        className="absolute inset-y-0 w-[2px] transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ left: "calc(" + (pct * 100) + "% - 1px)", background: "#fde047", boxShadow: "0 0 10px rgba(253,224,71,0.8)", opacity: pct > 0.005 ? 1 : 0 }}
      />
      {segCount > 0 ? (
        <div className="absolute inset-0 flex">
          {Array.from({ length: segCount }).map((_, i) => (
            <div
              key={"seg-" + i}
              className="h-full flex-1"
              style={{ borderRight: i === segCount - 1 ? "none" : "1px solid rgba(2,6,12,0.95)" }}
            />
          ))}
        </div>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(0,0,0,0.6) 0px,rgba(0,0,0,0.6) 1px,transparent 1px,transparent 7px)" }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(255,255,255,0.12) 0px,rgba(255,255,255,0.12) 1px,transparent 1px,transparent 3px)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{ opacity: flash ? 1 : 0, boxShadow: "inset 0 0 0 2px rgba(217,70,239,0.6)", borderRadius: "0.375rem" }}
      />
    </div>
  );

  return (
    <div className="h-full w-full flex items-stretch gap-2" style={{ minWidth: StatBar_MIN.base[0] + "rem", minHeight: StatBar_MIN.base[1] + "rem" }} data-uid={uid}>
      <div className="relative flex-1 min-w-0 h-full">{track}</div>
      {showValue ? (
        <div className="relative h-full w-[26%] max-w-[6rem] min-w-0">
          <div className="absolute inset-y-[8%] inset-x-0">
            <FitText wrap={false} className={"font-mono font-black tracking-tight " + t.text + " drop-shadow-[0_0_8px_currentColor]" + (flash ? " animate-pulse" : "")}>
              {String(Math.round(value))}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}