type LevelMeterProps = { level: number };
export function LevelMeter(props: LevelMeterProps) {
  const uid = useRef("levelmeter-" + Math.random().toString(36).slice(2)).current;

  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const raw = typeof props.level === "number" && isFinite(props.level) ? props.level : 0;
  const level = clamp01(raw);

  // Smoothed peak-hold indicator (transient decorative state only, derived from prop)
  const [peak, setPeak] = useState(level);
  const peakRef = useRef(level);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (level >= peakRef.current) {
      peakRef.current = level;
      setPeak(level);
    }
  }, [level]);

  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      // decay peak toward current level
      const decayPerMs = 0.0009;
      const target = level;
      if (peakRef.current > target) {
        const next = Math.max(target, peakRef.current - decayPerMs * dt);
        peakRef.current = next;
        setPeak(next);
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

  // Segment ladder — thresholds where segment i lights when level >= its low bound.
  const SEG = 22;
  const segments = useMemo(() => {
    const arr: { lo: number; hi: number; tone: "signal" | "warn" | "peak" }[] = [];
    for (let i = 0; i < SEG; i++) {
      const lo = i / SEG;
      const hi = (i + 1) / SEG;
      // top ~2 segments red, next ~4 amber, rest lime
      const tone: "signal" | "warn" | "peak" =
        i >= SEG - 2 ? "peak" : i >= SEG - 6 ? "warn" : "signal";
      arr.push({ lo, hi, tone });
    }
    return arr;
  }, []);

  const toneLit = (t: "signal" | "warn" | "peak") =>
    t === "peak" ? "#ef4444" : t === "warn" ? "#fbbf24" : "#a3e635";
  const toneGlow = (t: "signal" | "warn" | "peak") =>
    t === "peak" ? "#f87171" : t === "warn" ? "#fcd34d" : "#bef264";

  const peakSegIndex = Math.min(SEG - 1, Math.floor(peak * SEG - 1e-6));
  const clipping = level >= 0.999;

  const floor = (LevelMeter_MIN as any).base;

  // viewBox in fluid coordinates; preserveAspectRatio none so it fills its (linear) slot.
  // We build vertical ladder in viewBox space, host slot stretches it along both axes.
  const VB_W = 100;
  const VB_H = 300;
  const padX = 14;
  const padY = 8;
  const innerW = VB_W - padX * 2;
  const innerH = VB_H - padY * 2;
  const gap = 3;
  const segH = (innerH - gap * (SEG - 1)) / SEG;

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* Recessed well */}
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-black/70 shadow-inner shadow-black/70 overflow-hidden">
        {/* subtle top sheen */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-stone-800/20 to-black/40 pointer-events-none" />
        {/* clip flash overlay */}
        <div
          className={
            "absolute inset-0 rounded-xl pointer-events-none transition-all duration-100 ease-linear " +
            (clipping ? "opacity-100" : "opacity-0")
          }
          style={{
            boxShadow: "inset 0 0 24px 2px rgba(239,68,68,0.55)",
          }}
        />
      </div>

      {/* Meter ladder */}
      <div className="absolute inset-[6%]">
        <svg
          className="h-full w-full"
          viewBox={"0 0 " + VB_W + " " + VB_H}
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id={uid + "-clip"}>
              <rect
                x={padX}
                y={padY}
                width={innerW}
                height={innerH}
                rx={4}
                ry={4}
              />
            </clipPath>
            {(["signal", "warn", "peak"] as const).map((t) => (
              <filter
                key={"f-" + t}
                id={uid + "-glow-" + t}
                x="-60%"
                y="-60%"
                width="220%"
                height="220%"
              >
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2.4"
                  floodColor={toneGlow(t)}
                  floodOpacity="0.9"
                />
              </filter>
            ))}
          </defs>

          <g clipPath={"url(#" + uid + "-clip)"}>
            {segments.map((s, i) => {
              // segments drawn bottom-up: index 0 at the bottom
              const yTop = padY + (SEG - 1 - i) * (segH + gap);
              const lit = level >= s.lo + (s.hi - s.lo) * 0.15;
              const isPeakMark = i === peakSegIndex && peak > 0.001 && !lit;
              const col = toneLit(s.tone);

              if (lit) {
                return (
                  <rect
                    key={"seg-" + i}
                    x={padX + 1}
                    y={yTop}
                    width={innerW - 2}
                    height={segH}
                    rx={2}
                    ry={2}
                    fill={col}
                    filter={"url(#" + uid + "-glow-" + s.tone + ")"}
                    style={{
                      transition: "opacity 100ms linear",
                    }}
                    opacity={0.96}
                  />
                );
              }

              if (isPeakMark) {
                return (
                  <rect
                    key={"seg-" + i}
                    x={padX + 1}
                    y={yTop}
                    width={innerW - 2}
                    height={segH}
                    rx={2}
                    ry={2}
                    fill={col}
                    opacity={0.75}
                    filter={"url(#" + uid + "-glow-" + s.tone + ")"}
                    style={{ transition: "opacity 100ms linear" }}
                  />
                );
              }

              // unlit segment
              return (
                <rect
                  key={"seg-" + i}
                  x={padX + 1}
                  y={yTop}
                  width={innerW - 2}
                  height={segH}
                  rx={2}
                  ry={2}
                  fill={col}
                  opacity={0.09}
                  style={{ transition: "opacity 100ms linear" }}
                />
              );
            })}
          </g>

          {/* faint frame around ladder */}
          <rect
            x={padX}
            y={padY}
            width={innerW}
            height={innerH}
            rx={4}
            ry={4}
            fill="none"
            stroke="#57534e"
            strokeOpacity="0.35"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}
export const LevelMeter_MIN = {"base":[0.75,4]};