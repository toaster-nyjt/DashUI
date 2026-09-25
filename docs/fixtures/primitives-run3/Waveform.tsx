type WaveformProps = {
  data: number[];
  playhead: number;
  beatGrid?: number[];
  zoom?: number;
  onScrub?: (pos: number) => void;
};

export function Waveform(props: WaveformProps) {
  const uid = useRef("waveform-" + Math.random().toString(36).slice(2)).current;

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const rawPlayhead = clamp01(
    typeof props.playhead === "number" && isFinite(props.playhead) ? props.playhead : 0
  );
  const zoom = Math.max(1, typeof props.zoom === "number" && isFinite(props.zoom) ? props.zoom : 1);
  const interactive = typeof props.onScrub === "function";

  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // ---- amplitude sampling ----------------------------------------------------
  const VBW = 1000;
  const VBH = 200;
  const MID = VBH / 2;

  const cleanData = useMemo(() => {
    const src = Array.isArray(props.data) ? props.data : [];
    const out: number[] = [];
    let mx = 0;
    for (let i = 0; i < src.length; i++) {
      let v = src[i];
      if (typeof v !== "number" || !isFinite(v)) v = 0;
      v = Math.abs(v);
      if (v > mx) mx = v;
      out.push(v);
    }
    // normalize amplitude to 0..1 range (assume data already 0..1 unless it exceeds)
    if (mx > 1.0001) {
      for (let i = 0; i < out.length; i++) out[i] = out[i] / mx;
    }
    return out;
  }, [props.data]);

  const hasData = cleanData.length > 0;

  // Window of data shown depends on zoom, centered on playhead.
  const windowFrac = 1 / zoom; // fraction of full track visible
  const halfWin = windowFrac / 2;
  let winStart = rawPlayhead - halfWin;
  let winEnd = rawPlayhead + halfWin;
  if (winStart < 0) {
    winEnd += -winStart;
    winStart = 0;
  }
  if (winEnd > 1) {
    winStart -= winEnd - 1;
    winEnd = 1;
  }
  if (winStart < 0) winStart = 0;
  const winSpan = Math.max(1e-6, winEnd - winStart);

  // number of bars to draw across the viewbox
  const BARS = 220;

  const bars = useMemo(() => {
    if (!hasData) return [];
    const res: number[] = new Array(BARS);
    const n = cleanData.length;
    for (let b = 0; b < BARS; b++) {
      const fA = winStart + (b / BARS) * winSpan;
      const fB = winStart + ((b + 1) / BARS) * winSpan;
      let iA = Math.floor(fA * n);
      let iB = Math.ceil(fB * n);
      if (iA < 0) iA = 0;
      if (iB > n) iB = n;
      if (iB <= iA) iB = Math.min(n, iA + 1);
      let peak = 0;
      for (let i = iA; i < iB; i++) {
        const v = cleanData[i];
        if (v > peak) peak = v;
      }
      res[b] = peak;
    }
    return res;
  }, [cleanData, hasData, winStart, winSpan]);

  // playhead x in viewbox coords (fixed near left third for scrolling feel,
  // but respecting clamped window at track ends)
  const playheadFrac = clamp01((rawPlayhead - winStart) / winSpan);
  const playheadX = playheadFrac * VBW;

  // beat grid lines mapped into window
  const beatLines = useMemo(() => {
    const grid = Array.isArray(props.beatGrid) ? props.beatGrid : [];
    const out: { x: number; strong: boolean }[] = [];
    for (let i = 0; i < grid.length; i++) {
      let g = grid[i];
      if (typeof g !== "number" || !isFinite(g)) continue;
      g = clamp01(g);
      if (g < winStart - 1e-6 || g > winEnd + 1e-6) continue;
      const x = ((g - winStart) / winSpan) * VBW;
      out.push({ x, strong: i % 4 === 0 });
    }
    return out;
  }, [props.beatGrid, winStart, winSpan, winEnd]);

  // ---- pointer -> normalized position ---------------------------------------
  const posFromEvent = (clientX: number) => {
    const el = rootRef.current;
    if (!el) return rawPlayhead;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return rawPlayhead;
    const ratio = clamp01((clientX - rect.left) / rect.width);
    // map view ratio back to normalized track position
    return clamp01(winStart + ratio * winSpan);
  };

  const handleDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDragging(true);
    props.onScrub && props.onScrub(posFromEvent(e.clientX));
  };
  const handleMove = (e: React.PointerEvent) => {
    if (interactive) {
      const ratioPos = posFromEvent(e.clientX);
      setHoverPos(ratioPos);
    }
    if (!dragging || !interactive) return;
    props.onScrub && props.onScrub(posFromEvent(e.clientX));
  };
  const handleUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const hoverX =
    interactive && hoverPos != null
      ? clamp01((hoverPos - winStart) / winSpan) * VBW
      : null;

  const barGap = 0.28; // fraction of slot per bar reserved as gap
  const slotW = VBW / BARS;
  const barW = slotW * (1 - barGap);

  return (
    <div
      ref={rootRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => {
        setHovering(false);
        setHoverPos(null);
      }}
      className={
        "relative h-full w-full min-w-0 min-h-0 overflow-hidden rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] select-none" +
        (interactive ? " touch-none cursor-ew-resize" : "")
      }
    >
      {/* subtle center baseline glow bed */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-amber-400/10" />
      </div>

      {!hasData ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            <span className="block h-1.5 w-1.5 rounded-full bg-neutral-700 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
              No Signal
            </span>
            <span
              className="block h-1.5 w-1.5 rounded-full bg-neutral-700 animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
          </div>
        </div>
      ) : (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={"0 0 " + VBW + " " + VBH}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-played"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id={uid + "-upcoming"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a3a3a3" />
              <stop offset="50%" stopColor="#737373" />
              <stop offset="100%" stopColor="#525252" />
            </linearGradient>
            <linearGradient id={uid + "-glow"} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.18" />
            </linearGradient>
            <clipPath id={uid + "-clip"}>
              <rect x="0" y="0" width={VBW} height={VBH} />
            </clipPath>
          </defs>

          <g clipPath={"url(#" + uid + "-clip)"}>
            {/* played-region wash behind bars */}
            <rect
              x="0"
              y="0"
              width={playheadX}
              height={VBH}
              fill={"url(#" + uid + "-glow)"}
            />

            {/* beat grid */}
            {beatLines.map((bl, i) => (
              <line
                key={"beat-" + i}
                x1={bl.x}
                y1={bl.strong ? MID - MID * 0.92 : MID - MID * 0.58}
                x2={bl.x}
                y2={bl.strong ? MID + MID * 0.92 : MID + MID * 0.58}
                stroke={bl.strong ? "#fbbf24" : "#a16207"}
                strokeWidth={bl.strong ? 2.2 : 1.2}
                strokeOpacity={bl.strong ? 0.45 : 0.22}
              />
            ))}

            {/* amplitude bars */}
            {bars.map((amp, i) => {
              const x = i * slotW + (slotW - barW) / 2;
              const h = Math.max(VBH * 0.012, amp * (MID * 0.94));
              const played = x + barW / 2 <= playheadX;
              return (
                <rect
                  key={"bar-" + i}
                  x={x}
                  y={MID - h}
                  width={barW}
                  height={h * 2}
                  rx={barW * 0.4}
                  fill={
                    played
                      ? "url(#" + uid + "-played)"
                      : "url(#" + uid + "-upcoming)"
                  }
                  opacity={played ? 1 : 0.85}
                />
              );
            })}

            {/* hover scrub guide */}
            {hoverX != null && hovering && !dragging && (
              <line
                x1={hoverX}
                y1="0"
                x2={hoverX}
                y2={VBH}
                stroke="#fcd34d"
                strokeWidth="1.4"
                strokeOpacity="0.5"
                strokeDasharray="4 5"
              />
            )}
          </g>
        </svg>
      )}

      {/* Playhead marker overlay (non-scaling stroke via DOM element) */}
      {hasData && (
        <div
          className="pointer-events-none absolute top-0 bottom-0"
          style={{
            left: (playheadFrac * 100).toString() + "%",
            transform: "translateX(-50%)",
            transition: dragging ? "none" : "left 100ms linear",
          }}
        >
          {/* glow column */}
          <div
            className={
              "absolute top-0 bottom-0 left-1/2 w-6 -translate-x-1/2 " +
              (dragging ? "" : "")
            }
            style={{
              background:
                "radial-gradient(60% 90% at 50% 50%, rgba(251,191,36,0.28), rgba(251,191,36,0) 70%)",
            }}
          />
          {/* core line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
          {/* top cap */}
          <div className="absolute top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          {/* bottom cap */}
          <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rotate-45 bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
        </div>
      )}

      {/* edge vignette for depth */}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />

      {/* active scrub ring */}
      {dragging && (
        <div className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-amber-400/40" />
      )}
    </div>
  );
}