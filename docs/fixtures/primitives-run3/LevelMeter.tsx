type LevelMeterProps = { level: number };
export function LevelMeter(props: LevelMeterProps) {
  const uid = useRef("levelmeter-" + Math.random().toString(36).slice(2)).current;

  // ---- Normalize & smooth the incoming level -------------------------------
  const raw = Number.isFinite(props.level) ? props.level : 0;
  const target = raw < 0 ? 0 : raw > 1 ? 1 : raw;

  // Smoothed "current" level (ballistics: fast attack, slow release)
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  // Peak-hold marker
  const [peak, setPeak] = useState(target);
  const peakRef = useRef(target);
  const peakAgeRef = useRef(0);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);

  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastTsRef.current || ts;
      const dt = Math.min(64, ts - last) / 1000; // seconds, clamped
      lastTsRef.current = ts;

      const cur = displayRef.current;
      const tgt = target;
      // Attack vs release rates (per second, exponential-ish smoothing)
      const rising = tgt > cur;
      const rate = rising ? 1 - Math.pow(0.0001, dt) : 1 - Math.pow(0.06, dt);
      let next = cur + (tgt - cur) * rate;
      if (Math.abs(next - tgt) < 0.0006) next = tgt;
      displayRef.current = next;

      // Peak hold logic
      if (next >= peakRef.current) {
        peakRef.current = next;
        peakAgeRef.current = 0;
      } else {
        peakAgeRef.current += dt;
        if (peakAgeRef.current > 0.9) {
          // decay peak slowly after hold time
          const decay = 1 - Math.pow(0.25, dt);
          let p = peakRef.current + (next - peakRef.current) * decay;
          if (p < next) p = next;
          peakRef.current = p;
        }
      }

      setDisplay(next);
      setPeak(peakRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  // ---- Segment model -------------------------------------------------------
  // We render N stacked segments. Each segment has a threshold; it lights when
  // display >= its threshold. Color zones: amber (safe) -> gold-hot -> rose (clip).
  const SEGMENTS = 22;
  const segs = useMemo(() => {
    const arr: { t0: number; t1: number; tone: number }[] = [];
    for (let i = 0; i < SEGMENTS; i++) {
      const t0 = i / SEGMENTS;
      const t1 = (i + 1) / SEGMENTS;
      // tone: 0 = amber, 1 = hot-gold, 2 = rose(clip)
      const center = (t0 + t1) / 2;
      const tone = center > 0.9 ? 2 : center > 0.72 ? 1 : 0;
      arr.push({ t0, t1, tone });
    }
    return arr;
  }, []);

  const litColor = (tone: number, strong: boolean) => {
    if (tone === 2) return strong ? "#fb7185" : "#f43f5e"; // rose
    if (tone === 1) return strong ? "#fbbf24" : "#f59e0b"; // hot gold
    return strong ? "#fbbf24" : "#f59e0b"; // amber
  };
  const litGlow = (tone: number) => {
    if (tone === 2) return "rgba(244,63,94,0.55)";
    if (tone === 1) return "rgba(251,191,36,0.5)";
    return "rgba(245,158,11,0.45)";
  };
  const dimColor = (tone: number) => {
    if (tone === 2) return "rgba(244,63,94,0.10)";
    if (tone === 1) return "rgba(251,191,36,0.09)";
    return "rgba(245,158,11,0.08)";
  };

  const clipping = display >= 0.985 || peak >= 0.985;

  // Peak marker segment index
  const peakSegIdx = Math.min(
    SEGMENTS - 1,
    Math.max(-1, Math.floor(peak * SEGMENTS) - (peak >= 1 ? 1 : 0))
  );

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch justify-center">
      {/* Meter body — a recessed vertical well */}
      <div className="relative h-full flex items-stretch justify-center" style={{ aspectRatio: "1 / 6", maxWidth: "100%" }}>
        <div className="relative flex-1 min-w-0 min-h-0 rounded-md border border-neutral-700/70 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* subtle inner vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg,rgba(0,0,0,0.35)0%,rgba(0,0,0,0)18%,rgba(0,0,0,0)82%,rgba(0,0,0,0.35)100%)",
            }}
          />

          {/* Segments — bottom is index 0 */}
          <div className="absolute inset-[6%] flex flex-col-reverse justify-between gap-[6%]">
            {segs.map((s, i) => {
              const isLit = display >= s.t1 - 0.0001 || (display > s.t0 && display >= s.t1 - (s.t1 - s.t0));
              const fullyLit = display >= s.t1 - 0.0001;
              const partial = !fullyLit && display > s.t0;
              const fillFrac = partial
                ? Math.max(0, Math.min(1, (display - s.t0) / (s.t1 - s.t0)))
                : fullyLit
                ? 1
                : 0;
              const on = fullyLit || partial;
              const strong = fullyLit && (s.tone === 2 ? true : display > s.t1 - 0.02);

              return (
                <div
                  key={"seg-" + i}
                  className="relative flex-1 min-h-0 rounded-[2px] overflow-hidden"
                  style={{
                    background: dimColor(s.tone),
                    boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.03)",
                  }}
                >
                  {/* lit fill grows from bottom for partial segment */}
                  <div
                    className="absolute inset-x-0 bottom-0 transition-[height] duration-75 ease-out motion-reduce:transition-none"
                    style={{
                      height: (on ? fillFrac * 100 : 0) + "%",
                      background:
                        "linear-gradient(180deg," +
                        litColor(s.tone, strong) +
                        " 0%," +
                        litColor(s.tone, false) +
                        " 100%)",
                      boxShadow: on
                        ? "0 0 8px 0 " + litGlow(s.tone) + ", inset 0 0.5px 0 rgba(255,255,255,0.25)"
                        : "none",
                      opacity: on ? 1 : 0,
                    }}
                  />
                  {/* glossy top edge on lit segments */}
                  {on && (
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-[35%]"
                      style={{
                        background:
                          "linear-gradient(180deg,rgba(255,255,255,0.28)0%,rgba(255,255,255,0)100%)",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Peak-hold marker line */}
          {peak > 0.02 && (
            <div
              className="pointer-events-none absolute left-[6%] right-[6%] transition-[bottom] duration-100 ease-out motion-reduce:transition-none"
              style={{
                bottom: "calc(6% + " + Math.max(0, Math.min(1, peak)) * 88 + "%)",
                height: "2px",
                transform: "translateY(50%)",
                background:
                  peak >= 0.9 ? "#fb7185" : peak >= 0.72 ? "#fde68a" : "#fcd34d",
                boxShadow:
                  "0 0 6px 0 " +
                  (peak >= 0.9
                    ? "rgba(251,113,133,0.8)"
                    : "rgba(252,211,77,0.7)"),
                opacity: 0.95,
              }}
            />
          )}

          {/* Clip cap indicator at the very top */}
          <div
            className="pointer-events-none absolute inset-x-[6%] top-[6%] rounded-[2px] transition-all duration-100"
            style={{
              height: "5%",
              background: clipping ? "#fb7185" : "rgba(244,63,94,0.12)",
              boxShadow: clipping
                ? "0 0 12px 1px rgba(244,63,94,0.85), inset 0 0 0 0.5px rgba(255,255,255,0.3)"
                : "inset 0 0 0 0.5px rgba(255,255,255,0.03)",
            }}
          />
          {clipping && (
            <div
              className="pointer-events-none absolute inset-0 rounded-md animate-pulse motion-reduce:animate-none"
              style={{ boxShadow: "inset 0 0 14px 0 rgba(244,63,94,0.4)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}