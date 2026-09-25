type LevelMeterProps = { level: number };
export function LevelMeter(props: LevelMeterProps) {
  const SEGMENTS = 22;
  const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

  const target = clamp(props.level);

  // Smoothed animated value that eases toward the target level.
  const [display, setDisplay] = useState(target);
  // Peak-hold marker that snaps up instantly and decays slowly.
  const [peak, setPeak] = useState(target);

  const displayRef = useRef(display);
  const peakRef = useRef(peak);
  const targetRef = useRef(target);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  displayRef.current = display;
  peakRef.current = peak;
  targetRef.current = target;

  useEffect(() => {
    const tick = (ts: number) => {
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = last == null ? 16 : Math.min(64, ts - last);

      const cur = displayRef.current;
      const tgt = targetRef.current;

      // Fast attack, slower release for a natural VU feel.
      const rising = tgt > cur;
      const rate = rising ? 0.045 : 0.012;
      const k = 1 - Math.pow(1 - rate, dt / 16);
      let next = cur + (tgt - cur) * k;
      if (Math.abs(next - tgt) < 0.0005) next = tgt;

      let nextPeak = peakRef.current;
      if (next >= nextPeak) {
        nextPeak = next;
      } else {
        // Peak decay
        nextPeak = Math.max(next, nextPeak - dt * 0.00035);
      }

      if (next !== cur) setDisplay(next);
      if (nextPeak !== peakRef.current) setPeak(nextPeak);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, []);

  const litExact = display * SEGMENTS;
  const peakSeg = Math.min(SEGMENTS - 1, Math.max(0, Math.round(peak * SEGMENTS) - 1));

  // Per-segment color zone: amber body, warning near top, danger at ceiling.
  const zoneFor = (idx: number) => {
    const frac = idx / (SEGMENTS - 1);
    if (frac >= 0.9) return "danger";
    if (frac >= 0.72) return "warn";
    return "amber";
  };

  const litColor = (zone: string) => {
    if (zone === "danger") return "#fb7185"; // rose-400
    if (zone === "warn") return "#fcd34d"; // amber-300
    return "#f59e0b"; // amber-500
  };
  const litGlow = (zone: string) => {
    if (zone === "danger") return "0 0 7px rgba(251,113,133,0.85)";
    if (zone === "warn") return "0 0 7px rgba(252,211,77,0.8)";
    return "0 0 7px rgba(245,158,11,0.75)";
  };
  const dimColor = (zone: string) => {
    if (zone === "danger") return "rgba(251,113,133,0.14)";
    if (zone === "warn") return "rgba(252,211,77,0.12)";
    return "rgba(245,158,11,0.10)";
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] flex items-stretch justify-center">
      {/* Meter well — recessed inset surface */}
      <div className="relative h-full w-full min-w-0 min-h-0 flex flex-col-reverse gap-[3cqh] rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] p-[6cqmin] overflow-hidden">
        {/* subtle top ceiling seam */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const zone = zoneFor(i);
          const fill = clamp(litExact - i); // 0..1 partial fill of this segment
          const isLit = fill > 0.001;
          const isPeak = i === peakSeg && peak > 0.02;

          return (
            <div
              key={"seg-" + i}
              className="relative flex-1 min-h-0 w-full rounded-[2px] overflow-hidden transition-[background-color] duration-75 ease-out motion-reduce:transition-none"
              style={{
                backgroundColor: dimColor(zone),
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.55)"
              }}
            >
              {/* lit fill grows from bottom of the segment */}
              <div
                className="absolute inset-x-0 bottom-0 rounded-[2px] transition-[height,opacity] duration-75 ease-out motion-reduce:transition-none"
                style={{
                  height: (isLit ? Math.min(1, fill) * 100 : 0) + "%",
                  opacity: isLit ? 1 : 0,
                  backgroundColor: litColor(zone),
                  boxShadow: isLit ? litGlow(zone) : "none"
                }}
              />
              {/* glossy highlight strip */}
              {isLit ? (
                <div
                  className="pointer-events-none absolute inset-x-[15%] top-[8%] h-[22%] rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.28)" }}
                />
              ) : null}
              {/* peak-hold cap marker */}
              {isPeak ? (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-[16%] rounded-[2px]"
                  style={{
                    backgroundColor: "#fde68a",
                    boxShadow: "0 0 8px rgba(253,230,138,0.95)"
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}