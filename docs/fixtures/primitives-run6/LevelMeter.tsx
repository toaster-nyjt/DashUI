type LevelMeterProps = { level: number };
export const LevelMeter_MIN = {"base":[1.5,4]};
export function LevelMeter(props: LevelMeterProps) {
  const uid = useRef("levelmeter-" + Math.random().toString(36).slice(2)).current;

  // Clamp incoming level to 0..1
  const raw = typeof props.level === "number" && isFinite(props.level) ? props.level : 0;
  const level = raw < 0 ? 0 : raw > 1 ? 1 : raw;

  // Peak-hold with slow decay. Purely transient/visual state (not the source of truth).
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
    const DECAY_PER_SEC = 0.55; // units of normalized level per second
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;
      if (peakRef.current > level) {
        peakRef.current = Math.max(level, peakRef.current - DECAY_PER_SEC * dt);
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

  // Segment ladder: green (safe) -> amber (hot) -> red (clip), bottom to top.
  const SEG_COUNT = 22;
  // Thresholds where color changes (as fraction of full height, from bottom).
  const AMBER_AT = 0.62;
  const RED_AT = 0.86;

  const LevelMeterSegColor = (frac: number) => {
    if (frac >= RED_AT) return { on: "#ef4444", glow: "rgba(239,68,68,0.55)" }; // red-500
    if (frac >= AMBER_AT) return { on: "#f59e0b", glow: "rgba(245,158,11,0.5)" }; // amber-500
    return { on: "#a3e635", glow: "rgba(163,230,53,0.5)" }; // lime-400
  };

  const litCount = Math.round(level * SEG_COUNT);
  const peakIndex = peak > 0 ? Math.min(SEG_COUNT - 1, Math.ceil(peak * SEG_COUNT) - 1) : -1;

  // Geometry in viewBox units (tall by default; scales to any slot via preserveAspectRatio)
  const VB_W = 40;
  const VB_H = 160;
  const padX = 6;
  const padY = 6;
  const innerW = VB_W - padX * 2;
  const innerH = VB_H - padY * 2;
  const gap = 1.6;
  const segH = (innerH - gap * (SEG_COUNT - 1)) / SEG_COUNT;

  const clipActive = level >= RED_AT;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: LevelMeter_MIN.base[0] + "rem", minHeight: LevelMeter_MIN.base[1] + "rem" }}
    >
      <svg
        viewBox={"0 0 " + VB_W + " " + VB_H}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={uid + "-well"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a0a0a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
          </linearGradient>
          <filter id={uid + "-blur"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* Recessed well */}
        <rect
          x={padX * 0.35}
          y={padY * 0.35}
          width={VB_W - padX * 0.7}
          height={VB_H - padY * 0.7}
          rx="5"
          ry="5"
          fill={"url(#" + uid + "-well)"}
          stroke="#292524"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />

        {/* Segment ladder */}
        {Array.from({ length: SEG_COUNT }).map((_, i) => {
          // i = 0 is bottom
          const frac = (i + 0.5) / SEG_COUNT;
          const c = LevelMeterSegColor(frac);
          const y = padY + innerH - (i + 1) * segH - i * gap;
          const isLit = i < litCount;
          const isPeakCap = i === peakIndex;

          const fillColor = isLit ? c.on : "#1c1917";
          const fillOpacity = isLit ? 1 : 0.85;

          return (
            <g key={"seg-" + i}>
              {isLit ? (
                <rect
                  x={padX}
                  y={y}
                  width={innerW}
                  height={segH}
                  rx="1.4"
                  ry="1.4"
                  fill={c.glow}
                  filter={"url(#" + uid + "-blur)"}
                  opacity={0.9}
                />
              ) : null}
              <rect
                x={padX}
                y={y}
                width={innerW}
                height={segH}
                rx="1.4"
                ry="1.4"
                fill={fillColor}
                fillOpacity={fillOpacity}
                stroke={isLit ? c.on : "#292524"}
                strokeOpacity={isLit ? 0.9 : 0.5}
                strokeWidth="0.5"
                style={{ transition: "fill 100ms linear, fill-opacity 100ms linear" }}
              />
              {/* Peak-hold cap marker */}
              {isPeakCap && !isLit ? (
                <rect
                  x={padX}
                  y={y}
                  width={innerW}
                  height={Math.max(1.2, segH * 0.38)}
                  rx="1"
                  ry="1"
                  fill={c.on}
                  opacity="0.95"
                  style={{ transition: "y 60ms linear" }}
                />
              ) : null}
            </g>
          );
        })}

        {/* Clip cap frame flashes when hitting the red zone */}
        <rect
          x={padX * 0.35}
          y={padY * 0.35}
          width={VB_W - padX * 0.7}
          height={VB_H - padY * 0.7}
          rx="5"
          ry="5"
          fill="none"
          stroke="#ef4444"
          strokeWidth="1.4"
          style={{
            opacity: clipActive ? 0.85 : 0,
            transition: "opacity 120ms ease-out",
          }}
        />
      </svg>

      {/* Subtle top glass sheen (non-interactive) */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-stone-100/5 via-transparent to-black/30" />
    </div>
  );
}