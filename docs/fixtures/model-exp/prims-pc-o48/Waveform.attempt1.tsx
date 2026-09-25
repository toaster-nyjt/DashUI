type WaveformProps = {
  data: number[];
  playhead: number;
  beatGrid?: number[];
  zoom?: number;
  onScrub?: (pos: number) => void;
};

export const Waveform_MIN = { "base": [8, 2] };

export function Waveform(props: WaveformProps) {
  const { data, playhead, beatGrid, zoom, onScrub } = props;

  const uid = useRef("waveform-" + Math.random().toString(36).slice(2)).current;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ph = clamp01(playhead);
  const z = zoom == null ? 1 : Math.max(0.05, zoom);
  const interactive = typeof onScrub === "function";

  const floor = (Waveform_MIN as any).base;

  const VW = 1000;
  const VH = 200;
  const MID = VH / 2;

  // ----- amplitude sampling into a fixed number of columns -----
  const columns = useMemo(() => {
    const N = 220;
    const out: number[] = new Array(N).fill(0);
    if (!data || data.length === 0) return out;
    const len = data.length;
    for (let i = 0; i < N; i++) {
      const start = Math.floor((i / N) * len);
      const end = Math.max(start + 1, Math.floor(((i + 1) / N) * len));
      let peak = 0;
      for (let j = start; j < end && j < len; j++) {
        const a = Math.abs(data[j]);
        if (a > peak) peak = a;
      }
      out[i] = peak;
    }
    // normalize
    let max = 0;
    for (let i = 0; i < N; i++) if (out[i] > max) max = out[i];
    if (max > 0) for (let i = 0; i < N; i++) out[i] = out[i] / max;
    return out;
  }, [data]);

  const hasData = data && data.length > 0;

  // ----- window mapping for zoom (playhead-centered) -----
  // We render the full column set but transform horizontally so the playhead
  // stays centered and zoom magnifies around it.
  const viewSpan = 1 / z; // fraction of full waveform visible
  let viewStart = ph - viewSpan / 2;
  if (viewStart < 0) viewStart = 0;
  if (viewStart > 1 - viewSpan) viewStart = Math.max(0, 1 - viewSpan);
  const viewEnd = viewStart + viewSpan;

  const toView = (pos: number) => {
    // maps a normalized 0-1 track position to a 0-1 horizontal view position
    if (viewSpan <= 0) return 0.5;
    return (pos - viewStart) / viewSpan;
  };

  // ----- bar geometry -----
  const bars = useMemo(() => {
    const N = columns.length;
    const total = VW;
    const step = total / N;
    const bw = step * 0.62;
    return columns.map((amp, i) => {
      const cx = i * step + step / 2;
      const h = Math.max(VH * 0.03, amp * (VH * 0.92));
      return { cx, bw, y: MID - h / 2, h };
    });
  }, [columns]);

  const playedCutoff = ph; // track-space

  // ----- pointer -> position -----
  const posFromEvent = (clientX: number) => {
    const el = rootRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const ratio = clamp01((clientX - rect.left) / rect.width);
    // ratio is in view-space; convert to track-space
    return clamp01(viewStart + ratio * viewSpan);
  };

  const handleDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    onScrub && onScrub(posFromEvent(e.clientX));
  };
  const handleMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const el = rootRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setHoverX(clamp01((e.clientX - rect.left) / rect.width));
    }
    if (!dragging) return;
    onScrub && onScrub(posFromEvent(e.clientX));
  };
  const handleUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch (err) {}
    setDragging(false);
  };
  const handleLeave = () => {
    setHoverX(null);
  };

  const phView = toView(ph);

  return (
    <div
      ref={rootRef}
      className={
        "relative h-full w-full overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 select-none" +
        (interactive ? (dragging ? " cursor-grabbing touch-none" : " cursor-grab touch-none") : "")
      }
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerLeave={handleLeave}
    >
      {/* recessed bed sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-800/20 to-black/40" />

      {/* center reference line */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-stone-700/30" />

      {hasData ? (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={"0 0 " + VW + " " + VH}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-played"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity="0.95" />
              <stop offset="50%" stopColor="rgb(251 146 60)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(217 119 6)" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={uid + "-unplayed"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(120 113 108)" stopOpacity="0.7" />
              <stop offset="50%" stopColor="rgb(87 83 78)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="rgb(68 64 60)" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id={uid + "-glow"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(163 230 53)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(163 230 53)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(163 230 53)" stopOpacity="0" />
            </linearGradient>
            <clipPath id={uid + "-playedclip"}>
              <rect x="0" y="0" width={VW * playedCutoff} height={VH} />
            </clipPath>
            <clipPath id={uid + "-unplayedclip"}>
              <rect x={VW * playedCutoff} y="0" width={Math.max(0, VW - VW * playedCutoff)} height={VH} />
            </clipPath>
          </defs>

          {/* zoom-aware group: scale around playhead so the playhead stays centered */}
          <g
            style={{
              transform:
                "translate(" +
                (VW / 2 - VW * ph * z) +
                "px, 0px) scale(" +
                z +
                ", 1)",
              transformOrigin: "0px 0px",
              transition: "transform 150ms ease-out",
            }}
          >
            {/* beat grid */}
            {beatGrid &&
              beatGrid.map((b, i) => {
                const p = clamp01(b);
                const x = VW * p;
                const isDown = i % 4 === 0;
                return (
                  <line
                    key={"beat-" + i}
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={VH}
                    stroke={isDown ? "rgb(120 113 108)" : "rgb(87 83 78)"}
                    strokeOpacity={isDown ? 0.55 : 0.3}
                    strokeWidth={isDown ? 2.4 : 1.2}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}

            {/* unplayed bars */}
            <g clipPath={"url(#" + uid + "-unplayedclip)"}>
              {bars.map((b, i) => (
                <rect
                  key={"u-" + i}
                  x={b.cx - b.bw / 2}
                  y={b.y}
                  width={b.bw}
                  height={b.h}
                  rx={b.bw * 0.4}
                  fill={"url(#" + uid + "-unplayed)"}
                />
              ))}
            </g>

            {/* played bars */}
            <g clipPath={"url(#" + uid + "-playedclip)"}>
              {bars.map((b, i) => (
                <rect
                  key={"p-" + i}
                  x={b.cx - b.bw / 2}
                  y={b.y}
                  width={b.bw}
                  height={b.h}
                  rx={b.bw * 0.4}
                  fill={"url(#" + uid + "-played)"}
                />
              ))}
            </g>
          </g>
        </svg>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex w-full items-center gap-[3px] px-[6%] opacity-40">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={"empty-" + i}
                className="flex-1 rounded-full bg-stone-700/50"
                style={{
                  height: (6 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 10) + "%",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* hover indicator (interactive only) */}
      {interactive && hoverX != null && !dragging && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-amber-400/40 transition-opacity duration-150"
          style={{ left: hoverX * 100 + "%" }}
        />
      )}

      {/* playhead marker (always centered because view is playhead-centered when zoomed;
          when zoom == 1 it tracks its true position) */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 z-10 flex flex-col items-center transition-[left] duration-100 ease-linear"
        style={{ left: clamp01(phView) * 100 + "%", transform: "translateX(-50%)" }}
      >
        {/* glowing line */}
        <div className="relative h-full w-[2px] bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]">
          <div className="absolute inset-0 animate-pulse bg-lime-300/60" />
        </div>
        {/* top cap */}
        <div className="absolute top-0 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-lime-400 drop-shadow-[0_0_4px_rgba(163,230,53,0.9)]" />
        {/* bottom cap */}
        <div className="absolute bottom-0 h-0 w-0 border-l-[5px] border-r-[5px] border-b-[6px] border-l-transparent border-r-transparent border-b-lime-400 drop-shadow-[0_0_4px_rgba(163,230,53,0.9)]" />
      </div>

      {/* subtle top/bottom vignette to seat waveform in the well */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}