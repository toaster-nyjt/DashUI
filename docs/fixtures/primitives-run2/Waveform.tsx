type WaveformProps = {
  data: number[];
  playhead: number;
  beatGrid?: number[];
  zoom?: number;
  onScrub?: (pos: number) => void;
};

export function Waveform(props: WaveformProps) {
  const WAVEFORM_clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [WAVEFORM_size, WAVEFORM_setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [WAVEFORM_scrubbing, WAVEFORM_setScrubbing] = useState(false);
  const [WAVEFORM_hovering, WAVEFORM_setHovering] = useState(false);
  const [WAVEFORM_hoverPos, WAVEFORM_setHoverPos] = useState<number | null>(null);
  const [WAVEFORM_pulse, WAVEFORM_setPulse] = useState(0);

  const interactive = typeof props.onScrub === "function";
  const zoom = Math.max(1, props.zoom == null ? 1 : props.zoom);
  const playhead = WAVEFORM_clamp01(props.playhead);
  const data = props.data || [];
  const hasData = data.length > 0;

  // Observe size for a definite drawing surface.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      WAVEFORM_setSize({ w: r.width, h: r.height });
    };
    measure();
    const RO = (window as any).ResizeObserver;
    if (RO) {
      const ro = new RO(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Beat-sync pulse tied to playhead crossings of nearest beat.
  const lastBeatRef = useRef<number>(-1);
  useEffect(() => {
    if (!props.beatGrid || props.beatGrid.length === 0) return;
    let idx = -1;
    for (let i = 0; i < props.beatGrid.length; i++) {
      if (playhead >= props.beatGrid[i]) idx = i;
    }
    if (idx !== lastBeatRef.current) {
      lastBeatRef.current = idx;
      WAVEFORM_setPulse((p) => p + 1);
    }
  }, [playhead, props.beatGrid]);

  const W = Math.max(1, Math.round(WAVEFORM_size.w));
  const H = Math.max(1, Math.round(WAVEFORM_size.h));
  const mid = H / 2;

  // Visible window derived from zoom, centered on the playhead.
  const windowFrac = 1 / zoom;
  const rawStart = playhead - windowFrac / 2;
  const start = Math.min(Math.max(0, rawStart), Math.max(0, 1 - windowFrac));
  const end = Math.min(1, start + windowFrac);

  const posToNorm = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return playhead;
    const r = el.getBoundingClientRect();
    const local = (clientX - r.left) / Math.max(1, r.width);
    const within = WAVEFORM_clamp01(local);
    return WAVEFORM_clamp01(start + within * (end - start));
  };

  const onPointerDown = (e: any) => {
    if (!interactive) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    WAVEFORM_setScrubbing(true);
    props.onScrub?.(posToNorm(e.clientX));
  };
  const onPointerMove = (e: any) => {
    if (interactive) {
      const el = containerRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        WAVEFORM_setHoverPos(WAVEFORM_clamp01((e.clientX - r.left) / Math.max(1, r.width)));
      }
    }
    if (!WAVEFORM_scrubbing) return;
    props.onScrub?.(posToNorm(e.clientX));
  };
  const endScrub = (e: any) => {
    if (!WAVEFORM_scrubbing) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    WAVEFORM_setScrubbing(false);
  };

  // Build symmetric mirrored amplitude bars across the full visible width.
  const barGeom = useMemo(() => {
    if (!hasData || W <= 0) return [] as { x: number; w: number; up: number; peak: number; center: number }[];
    const barW = 2;
    const gap = 1;
    const step = barW + gap;
    const count = Math.max(1, Math.floor(W / step));
    const bars: { x: number; w: number; up: number; peak: number; center: number }[] = [];
    for (let i = 0; i < count; i++) {
      const frac0 = i / count;
      const frac1 = (i + 1) / count;
      const d0 = start + frac0 * (end - start);
      const d1 = start + frac1 * (end - start);
      const iStart = Math.floor(d0 * (data.length - 1));
      const iEnd = Math.max(iStart, Math.floor(d1 * (data.length - 1)));
      let sum = 0;
      let peak = 0;
      let n = 0;
      for (let k = iStart; k <= iEnd; k++) {
        const v = Math.abs(data[k] || 0);
        sum += v;
        if (v > peak) peak = v;
        n++;
      }
      const avg = n > 0 ? sum / n : 0;
      const center = (d0 + d1) / 2;
      bars.push({ x: i * step + gap / 2, w: barW, up: avg, peak, center });
    }
    return bars;
  }, [hasData, W, data, start, end]);

  const playheadX = end > start ? ((playhead - start) / (end - start)) * W : W / 2;
  const hoverXNorm = WAVEFORM_hoverPos == null ? null : WAVEFORM_hoverPos;

  return (
    <div className="h-full w-full min-w-0 min-h-0 relative overflow-hidden [container-type:size]">
      {/* Recessed bed */}
      <div className="absolute inset-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Ambient molten glow band around center */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1/2 bg-[radial-gradient(120%_80%_at_50%_50%,rgba(245,158,11,0.10)_0%,rgba(245,158,11,0)_70%)] pointer-events-none" />
      </div>

      <div
        ref={containerRef}
        className={
          "absolute inset-0 touch-none select-none " +
          (interactive ? (WAVEFORM_scrubbing ? "cursor-grabbing" : "cursor-grab") : "")
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endScrub}
        onPointerCancel={endScrub}
        onPointerEnter={() => interactive && WAVEFORM_setHovering(true)}
        onPointerLeave={() => {
          WAVEFORM_setHovering(false);
          WAVEFORM_setHoverPos(null);
        }}
      >
        {hasData ? (
          <svg
            width={W}
            height={H}
            viewBox={"0 0 " + W + " " + H}
            preserveAspectRatio="none"
            className="absolute inset-0 block"
          >
            <defs>
              <linearGradient id="wf-amp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="wf-played" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fcd34d" stopOpacity="1" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="wf-peak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.7" />
              </linearGradient>
              <clipPath id="wf-clip">
                <rect x="0" y="0" width={W} height={H} />
              </clipPath>
            </defs>

            {/* Center spine */}
            <line
              x1="0"
              y1={mid}
              x2={W}
              y2={mid}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />

            {/* Beat grid */}
            {props.beatGrid &&
              props.beatGrid.map((b, i) => {
                if (b < start || b > end) return null;
                const bx = ((b - start) / (end - start)) * W;
                const strong = i % 4 === 0;
                return (
                  <line
                    key={"beat-" + i}
                    x1={bx}
                    y1={strong ? 0 : H * 0.14}
                    x2={bx}
                    y2={strong ? H : H * 0.86}
                    stroke={strong ? "rgba(251,191,36,0.28)" : "rgba(251,191,36,0.12)"}
                    strokeWidth={strong ? 1.25 : 1}
                    shapeRendering="crispEdges"
                  />
                );
              })}

            {/* Amplitude bars */}
            <g clipPath="url(#wf-clip)">
              {barGeom.map((bar, i) => {
                const played = bar.center <= playhead;
                const bodyH = Math.max(1, bar.up * (H * 0.9));
                const peakH = Math.max(bodyH, bar.peak * (H * 0.96));
                const y = mid - bodyH;
                const peakY = mid - peakH;
                return (
                  <g key={"bar-" + i}>
                    {/* Peak whisker */}
                    <rect
                      x={bar.x}
                      y={peakY}
                      width={bar.w}
                      height={peakH * 2}
                      fill="url(#wf-peak)"
                      opacity={played ? 0.55 : 0.25}
                    />
                    {/* Body */}
                    <rect
                      x={bar.x}
                      y={y}
                      width={bar.w}
                      height={bodyH * 2}
                      fill={played ? "url(#wf-played)" : "url(#wf-amp)"}
                      opacity={played ? 1 : 0.7}
                    />
                  </g>
                );
              })}
            </g>

            {/* Dim veil over unplayed region for contrast */}
            <rect
              x={playheadX}
              y="0"
              width={Math.max(0, W - playheadX)}
              height={H}
              fill="rgba(5,5,5,0.32)"
            />

            {/* Hover indicator */}
            {interactive && WAVEFORM_hovering && !WAVEFORM_scrubbing && hoverXNorm != null && (
              <line
                x1={hoverXNorm * W}
                y1="0"
                x2={hoverXNorm * W}
                y2={H}
                stroke="rgba(252,211,77,0.35)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
            )}

            {/* Playhead */}
            <g>
              <line
                x1={playheadX}
                y1="0"
                x2={playheadX}
                y2={H}
                stroke="#fde68a"
                strokeWidth={WAVEFORM_scrubbing ? 2.5 : 1.75}
                style={{ transition: "stroke-width 120ms ease-out" }}
              />
              <line
                x1={playheadX}
                y1="0"
                x2={playheadX}
                y2={H}
                stroke="rgba(251,191,36,0.9)"
                strokeWidth={WAVEFORM_scrubbing ? 6 : 4}
                opacity="0.28"
                style={{ transition: "stroke-width 120ms ease-out" }}
              />
              {/* Top/bottom carets */}
              <polygon
                points={
                  (playheadX - 4) + ",0 " + (playheadX + 4) + ",0 " + playheadX + "," + 5
                }
                fill="#fde68a"
              />
              <polygon
                points={
                  (playheadX - 4) + "," + H + " " + (playheadX + 4) + "," + H + " " + playheadX + "," + (H - 5)
                }
                fill="#fde68a"
              />
            </g>
          </svg>
        ) : (
          // Clean empty state
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full mx-3 flex items-center gap-2 opacity-40">
              <div className="h-px flex-1 bg-neutral-700/60" />
              <div className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
                No Signal
              </div>
              <div className="h-px flex-1 bg-neutral-700/60" />
            </div>
          </div>
        )}

        {/* Beat pulse flash on the accent ring only */}
        {hasData && props.beatGrid && props.beatGrid.length > 0 && (
          <div
            key={"pulse-" + WAVEFORM_pulse}
            className="absolute inset-0 rounded-lg pointer-events-none ring-1 ring-amber-400/40 motion-reduce:animate-none"
            style={{ animation: "wfPulse 260ms ease-out" }}
          />
        )}
      </div>

      {/* Top edge sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.05] pointer-events-none rounded-t-lg" />

      <style>{
        "@keyframes wfPulse{0%{opacity:0.85;box-shadow:inset 0 0 18px -2px rgba(245,158,11,0.55)}100%{opacity:0;box-shadow:inset 0 0 0 0 rgba(245,158,11,0)}}"
      }</style>
    </div>
  );
}