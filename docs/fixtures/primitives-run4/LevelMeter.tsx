type LevelMeterProps = { level: number };
export function LevelMeter(props: LevelMeterProps) {
  const uid = useRef("levelmeter-" + Math.random().toString(36).slice(2)).current;

  // ---- normalize + clamp the incoming level ----
  const raw = typeof props.level === "number" && isFinite(props.level) ? props.level : 0;
  const level = raw < 0 ? 0 : raw > 1 ? 1 : raw;

  // ---- smoothed "ballistics": fast attack, slow decay for the bar; slower peak-hold ----
  const [display, setDisplay] = useState(level);
  const [peak, setPeak] = useState(level);
  const displayRef = useRef(level);
  const peakRef = useRef(level);
  const targetRef = useRef(level);
  const rafRef = useRef(0);
  const peakHoldRef = useRef(0);

  useEffect(() => {
    targetRef.current = level;
  }, [level]);

  useEffect(() => {
    let last = 0;
    const tick = (t: number) => {
      if (!last) last = t;
      const dt = Math.min(64, t - last);
      last = t;

      const target = targetRef.current;
      const cur = displayRef.current;

      // attack fast, release slow
      const rate = target > cur ? 0.5 : 0.10;
      const k = 1 - Math.pow(1 - rate, dt / 16.67);
      let next = cur + (target - cur) * k;
      if (Math.abs(next - target) < 0.0006) next = target;
      displayRef.current = next;

      // peak hold / decay
      if (next >= peakRef.current) {
        peakRef.current = next;
        peakHoldRef.current = t;
      } else if (t - peakHoldRef.current > 650) {
        const pk = 1 - Math.pow(1 - 0.06, dt / 16.67);
        peakRef.current = peakRef.current + (next - peakRef.current) * pk;
        if (peakRef.current < next) peakRef.current = next;
      }

      setDisplay(displayRef.current);
      setPeak(peakRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ---- segment model: LED ladder that reads in both tall and wide slots ----
  const SEG = 22;
  const GAP = 0.28; // gap as fraction of a cell
  const fillN = display * SEG;
  const peakIdx = Math.max(0, Math.min(SEG - 1, Math.round(peak * SEG - 0.5)));

  // zone thresholds (fraction of segments): green -> amber -> hot rose at the top
  const warnStart = 0.68;
  const hotStart = 0.88;

  const zoneOf = (frac: number) => (frac >= hotStart ? "hot" : frac >= warnStart ? "warn" : "ok");

  const litColor = (zone: string) =>
    zone === "hot" ? "#fb7185" : zone === "warn" ? "#fbbf24" : "#34d399";
  const litGlow = (zone: string) =>
    zone === "hot" ? "rgba(251,113,133,0.85)" : zone === "warn" ? "rgba(251,191,36,0.85)" : "rgba(52,211,153,0.8)";
  const dimColor = (zone: string) =>
    zone === "hot" ? "rgba(251,113,133,0.13)" : zone === "warn" ? "rgba(251,191,36,0.13)" : "rgba(52,211,153,0.12)";

  // build the SVG ladder in a fixed 100x1000 viewBox (bottom = index 0)
  const VBW = 100;
  const VBH = 1000;
  const unit = VBH / SEG; // height per (cell+gap)
  const cellH = unit * (1 - GAP);
  const gapH = unit * GAP;
  const cellW = VBW * 0.62;
  const cellX = (VBW - cellW) / 2;
  const rx = Math.min(cellW, cellH) * 0.28;

  const segments = [];
  for (let i = 0; i < SEG; i++) {
    const frac = (i + 0.5) / SEG;
    const zone = zoneOf(frac);
    const y = VBH - (i + 1) * unit + gapH / 2;

    // partial illumination on the leading segment for smooth, analog feel
    const localFill = fillN - i; // 0..1 across this cell
    const lit = localFill >= 0.999;
    const partial = localFill > 0.02 && localFill < 0.999;
    const isPeakCap = i === peakIdx && peak > 0.02;

    segments.push(
      <g key={"seg-" + i}>
        {/* dim base */}
        <rect
          x={cellX}
          y={y}
          width={cellW}
          height={cellH}
          rx={rx}
          fill={dimColor(zone)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={1}
        />
        {/* full lit */}
        {lit ? (
          <rect
            x={cellX}
            y={y}
            width={cellW}
            height={cellH}
            rx={rx}
            fill={litColor(zone)}
            stroke={litColor(zone)}
            strokeWidth={1}
            style={{ filter: "drop-shadow(0 0 6px " + litGlow(zone) + ")" }}
          />
        ) : null}
        {/* partial lit (leading cell) */}
        {partial ? (
          <g>
            <clipPath id={uid + "-clip-" + i}>
              <rect
                x={cellX}
                y={y + cellH * (1 - localFill)}
                width={cellW}
                height={cellH * localFill}
              />
            </clipPath>
            <rect
              x={cellX}
              y={y}
              width={cellW}
              height={cellH}
              rx={rx}
              fill={litColor(zone)}
              clipPath={"url(#" + uid + "-clip-" + i + ")"}
              style={{ filter: "drop-shadow(0 0 5px " + litGlow(zone) + ")" }}
            />
          </g>
        ) : null}
        {/* glossy top highlight on lit cells */}
        {lit || partial ? (
          <rect
            x={cellX + cellW * 0.12}
            y={y + cellH * 0.1}
            width={cellW * 0.4}
            height={cellH * 0.28}
            rx={rx * 0.6}
            fill="rgba(255,255,255,0.28)"
          />
        ) : null}
        {/* peak-hold marker */}
        {isPeakCap && !lit ? (
          <rect
            x={cellX}
            y={y}
            width={cellW}
            height={cellH}
            rx={rx}
            fill="none"
            stroke={litColor(zone)}
            strokeWidth={2.5}
            style={{ filter: "drop-shadow(0 0 5px " + litGlow(zone) + ")" }}
          />
        ) : null}
      </g>
    );
  }

  const dbText = level <= 0.0001 ? "-\u221e" : Math.round((level * 60) - 60);

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch justify-center">
      <div className="relative h-full w-full min-w-0 min-h-0 flex flex-col items-center">
        {/* meter well */}
        <div className="relative flex-1 min-h-0 w-full min-w-0 flex items-stretch justify-center">
          <div className="relative h-full aspect-[1/6] max-w-full rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/70 overflow-hidden">
            {/* subtle top clip-zone tint */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[12%] bg-gradient-to-b from-rose-500/10 to-transparent" />
            <svg
              className="absolute inset-[6%]"
              viewBox={"0 0 " + VBW + " " + VBH}
              preserveAspectRatio="xMidYMid meet"
              style={{ width: "88%", height: "88%" }}
            >
              <defs>
                <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="rgba(255,255,255,0.06)" />
                  <stop offset="0.5" stopColor="rgba(255,255,255,0)" />
                  <stop offset="1" stopColor="rgba(0,0,0,0.18)" />
                </linearGradient>
              </defs>
              {segments}
              <rect x={0} y={0} width={VBW} height={VBH} fill={"url(#" + uid + "-sheen)"} pointerEvents="none" />
            </svg>
          </div>
        </div>

        {/* numeric readout — display text via FitText, height-capped so it never dominates a short slot */}
        <div className="mt-[4%] w-full min-w-0 h-[13%] max-h-[16px] min-h-0 flex items-center justify-center px-[4%]">
          <FitText
            className={
              "font-mono font-bold tabular-nums tracking-tight leading-none transition-colors duration-150 " +
              (level >= hotStart
                ? "text-rose-300"
                : level >= warnStart
                ? "text-amber-300"
                : "text-emerald-300")
            }
          >
            {dbText === "-\u221e" ? dbText : (dbText > 0 ? "+" + dbText : "" + dbText)}
          </FitText>
        </div>
      </div>
    </div>
  );
}