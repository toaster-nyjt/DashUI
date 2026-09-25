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
  const playhead = clamp01(Number.isFinite(props.playhead) ? props.playhead : 0);
  const zoom = Math.max(1, Number.isFinite(props.zoom || NaN) ? (props.zoom as number) : 1);
  const interactive = typeof props.onScrub === "function";

  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [hoverPos, setHoverPos] = useState<number | null>(null);

  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const raw = Array.isArray(props.data) ? props.data : [];

  // Normalize + resample data into a stable number of bars for clean rendering at any width.
  const BARS = 128;
  const bars = useMemo(() => {
    const out: number[] = new Array(BARS).fill(0);
    if (raw.length === 0) return out;
    let maxAbs = 0;
    for (let i = 0; i < raw.length; i++) {
      const v = Math.abs(Number.isFinite(raw[i]) ? raw[i] : 0);
      if (v > maxAbs) maxAbs = v;
    }
    const norm = maxAbs > 0 ? maxAbs : 1;
    for (let b = 0; b < BARS; b++) {
      const start = Math.floor((b / BARS) * raw.length);
      const end = Math.max(start + 1, Math.floor(((b + 1) / BARS) * raw.length));
      let peak = 0;
      for (let i = start; i < end && i < raw.length; i++) {
        const v = Math.abs(Number.isFinite(raw[i]) ? raw[i] : 0);
        if (v > peak) peak = v;
      }
      out[b] = clamp01(peak / norm);
    }
    return out;
  }, [raw]);

  const hasData = raw.length > 0;

  // Viewport spans a zoom-dependent window centered on the playhead.
  const viewSpan = 1 / zoom;
  let viewStart = playhead - viewSpan / 2;
  if (viewStart < 0) viewStart = 0;
  if (viewStart + viewSpan > 1) viewStart = 1 - viewSpan;
  const viewEnd = viewStart + viewSpan;
  const toView = (norm: number) => (norm - viewStart) / viewSpan; // 0..1 across the visible area

  const VW = 1000;
  const VH = 200;
  const MID = VH / 2;

  const barW = VW / BARS;

  const beatGrid = Array.isArray(props.beatGrid) ? props.beatGrid : [];

  const posFromEvent = (clientX: number) => {
    const el = surfaceRef.current;
    if (!el) return playhead;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return playhead;
    const ratio = clamp01((clientX - rect.left) / rect.width);
    return clamp01(viewStart + ratio * viewSpan);
  };

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    props.onScrub && props.onScrub(posFromEvent(e.clientX));
  };
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (interactive) {
      setHover(true);
      setHoverPos(clamp01(viewStart + clamp01(( (e.clientX) - (surfaceRef.current?.getBoundingClientRect().left || 0)) / (surfaceRef.current?.getBoundingClientRect().width || 1)) * viewSpan));
    }
    if (!dragging || !interactive) return;
    props.onScrub && props.onScrub(posFromEvent(e.clientX));
  };
  const handleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const playheadX = clamp01(toView(playhead)) * VW;
  const hoverX = hoverPos != null ? clamp01(toView(hoverPos)) * VW : null;

  // Bars visible in the current view window.
  const barEls = [];
  for (let b = 0; b < BARS; b++) {
    const barNorm = (b + 0.5) / BARS; // normalized position of this bar in full track
    // Map full-track bar into view; only draw if within [viewStart,viewEnd] roughly
    const vx = toView(barNorm);
    if (vx < -0.02 || vx > 1.02) continue;
    const x = vx * VW;
    const amp = bars[b];
    const h = Math.max(VH * 0.03, amp * (VH * 0.92));
    const played = barNorm <= playhead;
    barEls.push(
      <g key={"bar-" + b}>
        <rect
          x={x - barW * 0.36}
          y={MID - h / 2}
          width={barW * 0.72}
          height={h}
          rx={barW * 0.28}
          fill={played ? "url(#" + uid + "-played)" : "url(#" + uid + "-unplayed)"}
          opacity={played ? 1 : 0.62}
        />
      </g>
    );
  }

  const beatEls = [];
  for (let i = 0; i < beatGrid.length; i++) {
    const g = clamp01(beatGrid[i]);
    const vx = toView(g);
    if (vx < -0.01 || vx > 1.01) continue;
    const x = vx * VW;
    const isDownbeat = i % 4 === 0;
    beatEls.push(
      <line
        key={"beat-" + i}
        x1={x}
        y1={isDownbeat ? VH * 0.06 : VH * 0.2}
        x2={x}
        y2={isDownbeat ? VH * 0.94 : VH * 0.8}
        stroke={isDownbeat ? "#fbbf24" : "#a3a3a3"}
        strokeOpacity={isDownbeat ? 0.5 : 0.22}
        strokeWidth={isDownbeat ? 2 : 1}
      />
    );
  }

  return (
    <div className="h-full w-full min-w-0 min-h-0 relative overflow-hidden rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
      {/* subtle center rail */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-amber-400/10" />
      </div>

      <div
        ref={surfaceRef}
        className={
          "absolute inset-0 touch-none select-none " +
          (interactive ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default")
        }
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onPointerLeave={() => {
          setHover(false);
          setHoverPos(null);
        }}
        onPointerEnter={() => interactive && setHover(true)}
      >
        {hasData ? (
          <svg
            viewBox={"0 0 " + VW + " " + VH}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id={uid + "-played"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id={uid + "-unplayed"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#737373" />
                <stop offset="50%" stopColor="#525252" />
                <stop offset="100%" stopColor="#404040" />
              </linearGradient>
              <linearGradient id={uid + "-playglow"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
              </linearGradient>
              <filter id={uid + "-soft"} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
            </defs>

            {/* played region soft wash */}
            <rect
              x={0}
              y={0}
              width={Math.max(0, playheadX)}
              height={VH}
              fill="#f59e0b"
              opacity={0.06}
            />

            {beatEls}
            {barEls}

            {/* hover ghost line */}
            {interactive && hover && !dragging && hoverX != null && (
              <line
                x1={hoverX}
                y1={0}
                x2={hoverX}
                y2={VH}
                stroke="#fbbf24"
                strokeOpacity={0.35}
                strokeWidth={1.5}
                strokeDasharray="4 5"
              />
            )}

            {/* playhead glow */}
            <rect
              x={playheadX - 9}
              y={0}
              width={18}
              height={VH}
              fill={"url(#" + uid + "-playglow)"}
              filter={"url(#" + uid + "-soft)"}
              opacity={dragging ? 0.95 : 0.7}
            />
            {/* playhead line */}
            <line
              x1={playheadX}
              y1={0}
              x2={playheadX}
              y2={VH}
              stroke="#fef3c7"
              strokeWidth={dragging ? 3 : 2}
            />
          </svg>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex w-2/3 items-center gap-[2px] opacity-30">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={"empty-" + i}
                  className="flex-1 rounded-full bg-neutral-700"
                  style={{ height: (6 + (i % 5) * 3) + "%", minHeight: 2 }}
                />
              ))}
            </div>
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-neutral-700/40" />
          </div>
        )}

        {/* playhead cap markers (top/bottom triangles) rendered in DOM for crisp scaling */}
        {hasData && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none transition-none"
            style={{ left: (clamp01(toView(playhead)) * 100) + "%" }}
          >
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div
                className="border-x-[5px] border-t-[6px] border-x-transparent border-t-amber-200"
                style={{ filter: "drop-shadow(0 0 3px rgba(251,191,36,0.8))" }}
              />
            </div>
            <div className="absolute -bottom-px left-1/2 -translate-x-1/2">
              <div
                className="border-x-[5px] border-b-[6px] border-x-transparent border-b-amber-200"
                style={{ filter: "drop-shadow(0 0 3px rgba(251,191,36,0.8))" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* edge vignette for depth */}
      <div className="absolute inset-0 pointer-events-none rounded-lg shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]" />
    </div>
  );
}