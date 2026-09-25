type LevelMeterProps = { level: number };

export function LevelMeter(props: LevelMeterProps) {
  const uid = useRef("levelmeter-" + Math.random().toString(36).slice(2)).current;

  // ---- Config ----
  const SEGMENTS = 24; // number of discrete LED segments
  const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const level = clamp(typeof props.level === "number" && !isNaN(props.level) ? props.level : 0);

  // ---- Smoothed follow + peak hold (transient state only, not the value) ----
  const [display, setDisplay] = useState(level);
  const [peak, setPeak] = useState(level);
  const displayRef = useRef(level);
  const peakRef = useRef(level);
  const targetRef = useRef(level);
  const rafRef = useRef<number | null>(null);
  const peakHoldRef = useRef(0); // frames since last peak update

  useEffect(() => {
    targetRef.current = level;
  }, [level]);

  useEffect(() => {
    const tick = () => {
      const target = targetRef.current;
      const cur = displayRef.current;
      // fast attack, slow release
      const coeff = target > cur ? 0.55 : 0.14;
      let next = cur + (target - cur) * coeff;
      if (Math.abs(target - next) < 0.0008) next = target;
      displayRef.current = next;
      setDisplay(next);

      // peak hold
      if (next >= peakRef.current) {
        peakRef.current = next;
        peakHoldRef.current = 0;
      } else {
        peakHoldRef.current += 1;
        if (peakHoldRef.current > 34) {
          // decay peak slowly after hold
          peakRef.current = Math.max(next, peakRef.current - 0.012);
        }
      }
      setPeak(peakRef.current);

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ---- Segment color zones ----
  // 0 .. 0.72 lime (safe), 0.72 .. 0.88 amber (hot), 0.88 .. 1 red (peak)
  const zoneOf = (frac: number) => {
    if (frac >= 0.88) return "red";
    if (frac >= 0.72) return "amber";
    return "lime";
  };

  const litCount = display * SEGMENTS;
  const peakIndex = Math.max(0, Math.min(SEGMENTS - 1, Math.round(peak * SEGMENTS - 0.5)));

  const colorFor = (zone: string, on: boolean) => {
    if (zone === "red") return on ? "#ef4444" : "#ef4444";
    if (zone === "amber") return on ? "#fbbf24" : "#fbbf24";
    return on ? "#a3e635" : "#a3e635";
  };

  const glowFor = (zone: string) => {
    if (zone === "red") return "rgba(239,68,68,0.85)";
    if (zone === "amber") return "rgba(251,191,36,0.8)";
    return "rgba(163,230,53,0.8)";
  };

  const segments = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const segFrac = (i + 0.5) / SEGMENTS; // representative fraction of this segment
    const zone = zoneOf(segFrac);
    // fractional lighting: full segments fully lit, boundary segment partially
    const fill = clamp(litCount - i);
    const isLit = fill > 0.02;
    const isPeakMark = i === peakIndex && peak > 0.02;
    segments.push({ i, zone, fill, isLit, isPeakMark });
  }

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch justify-center">
      <div className="relative h-full w-full min-w-0 min-h-0 flex flex-col rounded-md overflow-hidden border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 px-[6%] py-[5%]">
        {/* subtle inner well sheen */}
        <div
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(0,0,0,0.35))",
          }}
        />

        {/* Segment stack: top = high level, bottom = low level */}
        <div className="relative flex-1 min-h-0 min-w-0 flex flex-col-reverse gap-[8%]">
          {segments.map((s) => {
            const c = colorFor(s.zone, s.isLit);
            const glow = glowFor(s.zone);
            const litOpacity = s.isLit ? 0.35 + 0.65 * Math.min(1, s.fill) : 1;
            return (
              <div
                key={"seg-" + s.i}
                className="relative flex-1 min-h-0 min-w-0 rounded-[2px] overflow-hidden"
                style={{
                  // unlit base — dim tinted trough of the segment's own zone
                  backgroundColor: c,
                  opacity: s.isLit ? 1 : 0.1,
                  transition: "opacity 100ms linear",
                }}
              >
                {/* dim base always present so unlit shows a faint tint */}
                {!s.isLit && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: c,
                      opacity: 0.35,
                    }}
                  />
                )}

                {/* Lit body with partial-fill via vertical clip using scale on a fill layer */}
                {s.isLit && (
                  <div
                    className="absolute inset-0 origin-bottom"
                    style={{
                      backgroundColor: c,
                      opacity: litOpacity,
                      transform: "scaleY(" + Math.min(1, s.fill) + ")",
                      transformOrigin: "bottom",
                      transition: "transform 100ms linear, opacity 100ms linear",
                      boxShadow:
                        "inset 0 0 0 9999px rgba(255,255,255,0.06), 0 0 6px " +
                        glow,
                    }}
                  />
                )}

                {/* gloss stripe on lit segments */}
                {s.isLit && (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0))",
                      opacity: Math.min(1, s.fill),
                    }}
                  />
                )}

                {/* Peak-hold marker: a bright cap line on this segment */}
                {s.isPeakMark && (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0"
                    style={{
                      height: "22%",
                      backgroundColor: c,
                      boxShadow: "0 0 8px " + glow + ", 0 0 2px " + glow,
                      opacity: 0.95,
                      animation:
                        "levelmeter-peak-" + uid + " 1.1s ease-out infinite",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <style>
          {"@keyframes levelmeter-peak-" +
            uid +
            " { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }"}
        </style>
      </div>
    </div>
  );
}