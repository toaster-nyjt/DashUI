type LevelMeterProps = { level: number };

export function LevelMeter(props: LevelMeterProps) {
  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const level = clamp01(typeof props.level === "number" && !isNaN(props.level) ? props.level : 0);

  const SEGMENTS = 24;
  const litExact = level * SEGMENTS;

  // Peak-hold behavior: track a falling peak marker.
  const peakRef = useRef(level);
  const [peak, setPeak] = useState(level);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (level >= peakRef.current) {
      peakRef.current = level;
      setPeak(level);
    }
  }, [level]);

  useEffect(() => {
    const decayPerMs = 0.00045; // gentle fall
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const target = level;
      if (peakRef.current > target) {
        peakRef.current = Math.max(target, peakRef.current - decayPerMs * dt);
        setPeak(peakRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [level]);

  const peakSeg = Math.round(peak * (SEGMENTS - 1));

  // Zone thresholds (fraction of segment index).
  const warnStart = 0.72; // amber region begins
  const dangerStart = 0.9; // rose region begins

  const zoneFor = (frac: number) => {
    if (frac >= dangerStart) return "danger";
    if (frac >= warnStart) return "warn";
    return "ok";
  };

  const litColors: Record<string, string> = {
    ok: "#34d399", // emerald-400
    warn: "#fbbf24", // amber-400
    danger: "#fb7185", // rose-400
  };
  const glowColors: Record<string, string> = {
    ok: "rgba(52,211,153,0.55)",
    warn: "rgba(251,191,36,0.6)",
    danger: "rgba(251,113,133,0.65)",
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] flex items-stretch justify-center">
      <div className="h-full w-full min-w-0 min-h-0 flex flex-col items-center">
        {/* Meter well */}
        <div className="relative flex-1 min-h-0 w-full flex items-stretch justify-center gap-[6cqw]">
          {[0, 1].map((col) => (
            <div
              key={"col-" + col}
              className="relative h-full flex flex-col-reverse items-stretch justify-start gap-[2.2cqh] rounded-[3px] bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] px-[3cqw] py-[1.5cqh]"
              style={{ width: "42cqw" }}
            >
              {Array.from({ length: SEGMENTS }).map((_, i) => {
                const frac = i / (SEGMENTS - 1);
                const zone = zoneFor(frac);

                // Partial fill for the topmost lit segment.
                let intensity = 0;
                if (i + 1 <= Math.floor(litExact)) intensity = 1;
                else if (i === Math.floor(litExact)) intensity = litExact - Math.floor(litExact);

                const isLit = intensity > 0.02;
                const isPeak = i === peakSeg && peakSeg > 0;

                const base = litColors[zone];
                const glow = glowColors[zone];

                return (
                  <div
                    key={"seg-" + col + "-" + i}
                    className="relative flex-1 min-h-0 w-full rounded-[1.5px] overflow-hidden transition-all duration-75 ease-out motion-reduce:transition-none"
                    style={{
                      backgroundColor: isLit ? base : "rgba(255,255,255,0.045)",
                      opacity: isLit ? 0.35 + 0.65 * intensity : 1,
                      boxShadow: isLit
                        ? "0 0 " + (5 + 7 * intensity).toFixed(1) + "px " + glow + ", inset 0 0 2px rgba(255,255,255,0.25)"
                        : "inset 0 1px 1px rgba(0,0,0,0.6)",
                    }}
                  >
                    {/* segment sheen */}
                    <div
                      className="absolute inset-x-0 top-0 h-1/2 rounded-t-[1.5px]"
                      style={{
                        background: isLit
                          ? "linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0))"
                          : "linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0))",
                      }}
                    />
                    {/* peak marker cap */}
                    {isPeak && (
                      <div
                        className="absolute inset-x-0 top-0 h-[30%] rounded-[1.5px]"
                        style={{
                          backgroundColor: base,
                          boxShadow: "0 0 8px " + glow,
                          opacity: 0.95,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}