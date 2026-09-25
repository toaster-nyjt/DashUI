type WaveformProps = {
  data: number[];
  playhead: number;
  beatGrid?: number[];
  zoom?: number;
  onScrub?: (pos: number) => void;
};
export function Waveform(props: WaveformProps) {
  const uid = useRef("waveform-" + Math.random().toString(36).slice(2)).current;

  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

  const rawData = props.data || [];
  const rawPlayhead = clamp01(Number.isFinite(props.playhead) ? props.playhead : 0);
  const zoom = props.zoom != null && Number.isFinite(props.zoom) && props.zoom > 0 ? props.zoom : 1;
  const beatGrid = props.beatGrid || [];
  const interactive = typeof props.onScrub === "function";

  const [dragging, setDragging] = useState(false);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  // --- Resample amplitude data into a fixed number of columns for a crisp,
  //     resolution-independent render. Higher zoom -> fewer source samples span
  //     the view (magnification) centered on the playhead.
  const COLS = 160;
  const VBW = 1000;
  const VBH = 200;
  const MID = VBH / 2;

  // Compute the visible window over the normalized 0..1 domain.
  const halfSpan = zoom > 1 ? 0.5 / zoom : 0.5;
  let viewStart = zoom > 1 ? clamp01(rawPlayhead - halfSpan) : 0;
  let viewEnd = zoom > 1 ? clamp01(rawPlayhead + halfSpan) : 1;
  if (viewEnd - viewStart < 0.0001) {
    viewStart = 0;
    viewEnd = 1;
  }
  const viewSpan = viewEnd - viewStart;

  const bars = useMemo(() => {
    const n = rawData.length;
    const out: number[] = new Array(COLS).fill(0);
    if (n === 0) return out;
    let maxAmp = 0;
    for (let i = 0; i < n; i++) {
      const v = Math.abs(rawData[i]);
      if (v > maxAmp) maxAmp = v;
    }
    const norm = maxAmp > 0 ? maxAmp : 1;
    for (let c = 0; c < COLS; c++) {
      const t0 = viewStart + (c / COLS) * viewSpan;
      const t1 = viewStart + ((c + 1) / COLS) * viewSpan;
      const s0 = Math.floor(t0 * n);
      const s1 = Math.max(s0 + 1, Math.ceil(t1 * n));
      let peak = 0;
      for (let s = s0; s < s1 && s < n; s++) {
        const v = Math.abs(rawData[s]);
        if (v > peak) peak = v;
      }
      out[c] = clamp01(peak / norm);
    }
    return out;
  }, [rawData, viewStart, viewSpan]);

  // Build the mirrored waveform silhouette path.
  const wavePath = useMemo(() => {
    if (bars.length === 0) return "";
    const step = VBW / COLS;
    let top = "M 0 " + MID;
    for (let c = 0; c < COLS; c++) {
      const x = c * step + step / 2;
      const h = Math.max(0.02, bars[c]) * (MID - 6);
      top += " L " + x.toFixed(2) + " " + (MID - h).toFixed(2);
    }
    top += " L " + VBW + " " + MID;
    let bottom = " L " + VBW + " " + MID;
    for (let c = COLS - 1; c >= 0; c--) {
      const x = c * step + step / 2;
      const h = Math.max(0.02, bars[c]) * (MID - 6);
      bottom += " L " + x.toFixed(2) + " " + (MID + h).toFixed(2);
    }
    bottom += " L 0 " + MID + " Z";
    return top + bottom;
  }, [bars]);

  // Playhead x within the current view (in viewBox units).
  const playheadX = ((rawPlayhead - viewStart) / viewSpan) * VBW;
  const playheadVisible = playheadX >= -1 && playheadX <= VBW + 1;

  // Visible beat grid lines mapped into view coordinates.
  const gridLines = useMemo(() => {
    const lines: { x: number; strong: boolean }[] = [];
    for (let i = 0; i < beatGrid.length; i++) {
      const b = beatGrid[i];
      if (b < viewStart - 0.001 || b > viewEnd + 0.001) continue;
      const x = ((b - viewStart) / viewSpan) * VBW;
      lines.push({ x: x, strong: i % 4 === 0 });
    }
    return lines;
  }, [beatGrid, viewStart, viewSpan]);

  const isEmpty = rawData.length === 0;

  const posFromEvent = (clientX: number) => {
    const el = surfaceRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const ratio = clamp01((clientX - rect.left) / rect.width);
    // Map local ratio -> normalized domain through the current view window.
    return clamp01(viewStart + ratio * viewSpan);
  };

  const handleDown = (e: any) => {
    if (!interactive || isEmpty) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
    setDragging(true);
    const p = posFromEvent(e.clientX);
    setHoverPos(p);
    props.onScrub && props.onScrub(p);
  };

  const handleMove = (e: any) => {
    if (!interactive || isEmpty) return;
    const p = posFromEvent(e.clientX);
    setHoverPos(p);
    if (dragging) props.onScrub && props.onScrub(p);
  };

  const handleUp = (e: any) => {
    if (!interactive) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setDragging(false);
  };

  const handleLeave = () => {
    if (!dragging) setHoverPos(null);
  };

  const hoverX = hoverPos != null ? ((hoverPos - viewStart) / viewSpan) * VBW : null;

  return (
    <div className="h-full w-full min-w-0 min-h-0 relative overflow-hidden rounded-xl bg-stone-950/80 border border-stone-800/70 shadow-inner shadow-black/70">
      {/* Ambient recessed sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-800/20 via-transparent to-black/40" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={"0 0 " + VBW + " " + VBH}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity="0.15" />
            <stop offset="48%" stopColor="rgb(251 191 36)" stopOpacity="0.95" />
            <stop offset="52%" stopColor="rgb(217 119 6)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="rgb(217 119 6)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id={uid + "-played"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(163 230 53)" stopOpacity="0.2" />
            <stop offset="48%" stopColor="rgb(190 242 100)" stopOpacity="1" />
            <stop offset="52%" stopColor="rgb(132 204 22)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgb(132 204 22)" stopOpacity="0.2" />
          </linearGradient>
          <clipPath id={uid + "-clip-played"}>
            <rect x="0" y="0" width={Math.max(0, Math.min(VBW, playheadX))} height={VBH} />
          </clipPath>
          <linearGradient id={uid + "-scanline"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(190 242 100)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(190 242 100)" stopOpacity="1" />
            <stop offset="100%" stopColor="rgb(190 242 100)" stopOpacity="0" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Center baseline */}
        <line
          x1="0"
          y1={MID}
          x2={VBW}
          y2={MID}
          stroke="rgb(120 113 108)"
          strokeOpacity="0.25"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {/* Beat grid */}
        {!isEmpty &&
          gridLines.map((g, i) => (
            <line
              key={"grid-" + i}
              x1={g.x}
              y1={g.strong ? 8 : MID - (MID - 8) * 0.55}
              x2={g.x}
              y2={g.strong ? VBH - 8 : MID + (MID - 8) * 0.55}
              stroke={g.strong ? "rgb(168 162 158)" : "rgb(120 113 108)"}
              strokeOpacity={g.strong ? "0.45" : "0.28"}
              strokeWidth={g.strong ? 1.5 : 1}
              vectorEffect="non-scaling-stroke"
            />
          ))}

        {/* Base waveform silhouette (upcoming / full) */}
        {!isEmpty && (
          <path d={wavePath} fill={"url(#" + uid + "-fill)"} />
        )}

        {/* Played portion overlay (lime, energized) */}
        {!isEmpty && playheadVisible && (
          <g clipPath={"url(#" + uid + "-clip-played)"}>
            <path d={wavePath} fill={"url(#" + uid + "-played)"} />
          </g>
        )}

        {/* Playhead marker */}
        {!isEmpty && playheadVisible && (
          <g>
            <rect
              x={playheadX - 1}
              y="0"
              width="2"
              height={VBH}
              fill={"url(#" + uid + "-scanline)"}
              filter={"url(#" + uid + "-glow)"}
            />
            <line
              x1={playheadX}
              y1="0"
              x2={playheadX}
              y2={VBH}
              stroke="rgb(190 242 100)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}

        {/* Hover / scrub indicator */}
        {interactive && !isEmpty && hoverX != null && (
          <line
            x1={hoverX}
            y1="0"
            x2={hoverX}
            y2={VBH}
            stroke="rgb(251 191 36)"
            strokeOpacity={dragging ? "0.9" : "0.5"}
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* Playhead cap markers (top/bottom triangles) drawn in a non-stretched overlay */}
      {!isEmpty && playheadVisible && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 transition-transform duration-100 ease-linear"
          style={{ left: (playheadX / VBW) * 100 + "%", transform: "translateX(-50%)" }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-lime-300 drop-shadow-[0_0_4px_rgba(190,242,100,0.7)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0 w-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-lime-300 drop-shadow-[0_0_4px_rgba(190,242,100,0.7)]" />
        </div>
      )}

      {/* Zoom badge when magnified */}
      {zoom > 1 && !isEmpty && (
        <div className="pointer-events-none absolute top-1 right-1.5 rounded-md border border-amber-500/25 bg-neutral-950/70 px-1.5 py-0.5">
          <span className="font-mono font-bold tracking-tight text-[9px] leading-none text-amber-400">
            {zoom >= 10 ? Math.round(zoom) + "\u00d7" : zoom.toFixed(1) + "\u00d7"}
          </span>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 opacity-60">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-600 animate-pulse" />
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600">
              No Signal
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-stone-600 animate-pulse" />
          </div>
        </div>
      )}

      {/* Interaction surface */}
      {interactive && (
        <div
          ref={surfaceRef}
          className={
            "absolute inset-0 touch-none " +
            (isEmpty ? "cursor-default" : dragging ? "cursor-grabbing" : "cursor-grab")
          }
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          onPointerLeave={handleLeave}
        />
      )}
    </div>
  );
}