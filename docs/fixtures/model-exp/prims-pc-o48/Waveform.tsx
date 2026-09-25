type WaveformProps = {
  data: number[];
  playhead: number;
  beatGrid?: number[];
  zoom?: number;
  onScrub?: (pos: number) => void;
};

export const Waveform_MIN = { "base": [6, 2] };

export function Waveform(props: WaveformProps) {
  const { data, playhead, beatGrid, zoom, onScrub } = props;

  const uid = useRef("waveform-" + Math.random().toString(36).slice(2)).current;

  const [dragging, setDragging] = useState(false);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  const floor = (Waveform_MIN as any).base;

  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const ph = clamp01(typeof playhead === "number" && isFinite(playhead) ? playhead : 0);
  const z = typeof zoom === "number" && isFinite(zoom) ? clamp01(zoom) : 0;

  // viewBox coordinates
  const VBW = 1000;
  const VBH = 200;
  const MID = VBH / 2;

  // Zoom magnifies around the playhead: at z=0 show full track, at z=1 show a tight window.
  const windowFrac = 1 - z * 0.82; // fraction of full data shown
  const halfWin = windowFrac / 2;
  let winStart = ph - halfWin;
  let winEnd = ph + halfWin;
  if (winStart < 0) {
    winEnd += -winStart;
    winStart = 0;
  }
  if (winEnd > 1) {
    winStart -= winEnd - 1;
    winEnd = 1;
    if (winStart < 0) winStart = 0;
  }
  const winSpan = winEnd - winStart || 1;

  const toX = (norm: number) => ((norm - winStart) / winSpan) * VBW;
  const fromX = (ratio: number) => winStart + ratio * winSpan;

  const clean = Array.isArray(data) ? data.filter((n) => typeof n === "number" && isFinite(n)) : [];
  const hasData = clean.length > 0;

  // Resample data into fixed number of columns across the visible window for stable rendering.
  const COLS = 220;
  const columns = useMemo(() => {
    if (!hasData) return [] as number[];
    const out: number[] = [];
    let peak = 0;
    for (let i = 0; i < clean.length; i++) {
      const a = Math.abs(clean[i]);
      if (a > peak) peak = a;
    }
    if (peak <= 0) peak = 1;
    for (let c = 0; c < COLS; c++) {
      const nStart = winStart + (c / COLS) * winSpan;
      const nEnd = winStart + ((c + 1) / COLS) * winSpan;
      const iStart = Math.max(0, Math.floor(nStart * (clean.length - 1)));
      const iEnd = Math.min(clean.length - 1, Math.ceil(nEnd * (clean.length - 1)));
      let m = 0;
      for (let i = iStart; i <= iEnd; i++) {
        const a = Math.abs(clean[i]);
        if (a > m) m = a;
      }
      out.push(m / peak);
    }
    return out;
  }, [clean, winStart, winSpan, hasData]);

  const colW = VBW / (columns.length || 1);
  const barGap = colW * 0.18;

  const beats = useMemo(() => {
    if (!beatGrid) return [] as number[];
    return beatGrid
      .filter((b) => typeof b === "number" && isFinite(b))
      .map((b) => clamp01(b))
      .filter((b) => b >= winStart - 0.001 && b <= winEnd + 0.001);
  }, [beatGrid, winStart, winEnd]);

  const posFromEvent = (e: { clientX: number }) => {
    const el = surfaceRef.current;
    if (!el) return ph;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return ph;
    const ratio = clamp01((e.clientX - rect.left) / rect.width);
    return clamp01(fromX(ratio));
  };

  const handleDown = (e: React.PointerEvent) => {
    if (!onScrub) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    onScrub(posFromEvent(e));
  };
  const handleMove = (e: React.PointerEvent) => {
    if (onScrub) setHoverPos(posFromEvent(e));
    if (!dragging || !onScrub) return;
    onScrub(posFromEvent(e));
  };
  const handleUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };
  const handleLeave = () => {
    if (!dragging) setHoverPos(null);
  };

  const interactive = !!onScrub;
  const phX = toX(ph);
  const hoverX = hoverPos != null ? toX(hoverPos) : null;

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* recessed bed */}
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-none overflow-hidden">
        {/* subtle top sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/25 to-black/50 pointer-events-none" />
        {/* center rail glow */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-amber-500/10 pointer-events-none" />
      </div>

      {/* waveform surface */}
      <div
        ref={surfaceRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onPointerLeave={handleLeave}
        className={
          "absolute inset-0 touch-none " +
          (interactive ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default")
        }
      >
        <svg
          viewBox={"0 0 " + VBW + " " + VBH}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id={uid + "-wave"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity="0.95" />
              <stop offset="50%" stopColor="rgb(251 146 60)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="rgb(251 191 36)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={uid + "-wavePast"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="rgb(139 92 246)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="rgb(167 139 250)" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id={uid + "-playGlow"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(163 230 53)" stopOpacity="0" />
              <stop offset="50%" stopColor="rgb(163 230 53)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(163 230 53)" stopOpacity="0" />
            </linearGradient>
            <clipPath id={uid + "-clip"}>
              <rect x="0" y="0" width={VBW} height={VBH} />
            </clipPath>
          </defs>

          <g clipPath={"url(#" + uid + "-clip)"}>
            {/* beat grid */}
            {beats.map((b, i) => {
              const bx = toX(b);
              return (
                <line
                  key={"beat-" + i}
                  x1={bx}
                  y1={0}
                  x2={bx}
                  y2={VBH}
                  stroke="rgb(120 113 108)"
                  strokeOpacity={0.4}
                  strokeWidth={colW * 0.12 + 0.5}
                />
              );
            })}

            {/* empty state baseline */}
            {!hasData && (
              <line
                x1={0}
                y1={MID}
                x2={VBW}
                y2={MID}
                stroke="rgb(120 113 108)"
                strokeOpacity={0.35}
                strokeWidth={1.5}
                strokeDasharray="6 8"
              />
            )}

            {/* waveform bars */}
            {hasData &&
              columns.map((amp, i) => {
                const x = i * colW + barGap / 2;
                const w = Math.max(0.5, colW - barGap);
                const h = Math.max(VBH * 0.012, amp * (MID - 3));
                const colCenterNorm = winStart + ((i + 0.5) / columns.length) * winSpan;
                const isPast = colCenterNorm <= ph;
                return (
                  <rect
                    key={"bar-" + i}
                    x={x}
                    y={MID - h}
                    width={w}
                    height={h * 2}
                    rx={Math.min(w / 2, 1.5)}
                    fill={
                      isPast ? "url(#" + uid + "-wavePast)" : "url(#" + uid + "-wave)"
                    }
                    opacity={isPast ? 0.55 : 1}
                  />
                );
              })}

            {/* hover indicator */}
            {interactive && hoverX != null && !dragging && (
              <line
                x1={hoverX}
                y1={0}
                x2={hoverX}
                y2={VBH}
                stroke="rgb(251 191 36)"
                strokeOpacity={0.4}
                strokeWidth={1.5}
              />
            )}

            {/* playhead glow band */}
            <rect
              x={phX - colW * 2}
              y={0}
              width={colW * 4}
              height={VBH}
              fill={"url(#" + uid + "-playGlow)"}
            />
            {/* playhead line */}
            <line
              x1={phX}
              y1={0}
              x2={phX}
              y2={VBH}
              stroke="rgb(163 230 53)"
              strokeWidth={2}
              className={dragging ? "" : "transition-all duration-100 ease-linear"}
            />
            {/* playhead cap top */}
            <path
              d={
                "M " +
                (phX - 5) +
                " 0 L " +
                (phX + 5) +
                " 0 L " +
                phX +
                " 9 Z"
              }
              fill="rgb(163 230 53)"
              className={dragging ? "animate-pulse" : ""}
            />
            {/* playhead cap bottom */}
            <path
              d={
                "M " +
                (phX - 5) +
                " " +
                VBH +
                " L " +
                (phX + 5) +
                " " +
                VBH +
                " L " +
                phX +
                " " +
                (VBH - 9) +
                " Z"
              }
              fill="rgb(163 230 53)"
              className={dragging ? "animate-pulse" : ""}
            />
          </g>
        </svg>

        {/* live scrub sheen overlay */}
        {dragging && (
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-lime-400/30 rounded-xl" />
        )}
      </div>

      {/* edge vignette */}
      <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-black/40 via-transparent to-black/40" />
    </div>
  );
}