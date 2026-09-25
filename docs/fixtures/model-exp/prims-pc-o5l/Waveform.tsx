type WaveformProps = { data: number[]; playhead: number; beatGrid?: number[]; zoom?: number; onScrub?: (pos: number) => void };

export const Waveform_MIN = {"base":[6,2]};

export function Waveform(props: WaveformProps) {
  const { data, playhead, beatGrid, zoom, onScrub } = props;
  const uid = useRef("wf-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const ph = clamp01(Number.isFinite(playhead) ? playhead : 0);
  const z = Math.max(0, Math.min(1, zoom == null ? 0 : zoom));
  const span = 1 / (1 + z * 9);
  let start = ph - span / 2;
  if (start < 0) start = 0;
  if (start + span > 1) start = 1 - span;
  const end = start + span;

  const W = 1000, H = 200, MID = H / 2;

  const norm = (p: number) => (p - start) / span;

  const bars = useMemo(() => {
    const n = data ? data.length : 0;
    if (!n) return [] as { x: number; a: number }[];
    const i0 = Math.max(0, Math.floor(start * n) - 1);
    const i1 = Math.min(n, Math.ceil(end * n) + 1);
    const visible = i1 - i0;
    const maxBars = 320;
    const stepIdx = Math.max(1, Math.ceil(visible / maxBars));
    const out: { x: number; a: number }[] = [];
    for (let i = i0; i < i1; i += stepIdx) {
      let peak = 0;
      for (let k = i; k < Math.min(i1, i + stepIdx); k++) {
        const v = Math.abs(data[k] || 0);
        if (v > peak) peak = v;
      }
      const center = (i + Math.min(stepIdx, i1 - i) / 2) / n;
      out.push({ x: norm(center) * W, a: Math.min(1, peak) });
    }
    return out;
  }, [data, start, end]);

  const barW = bars.length > 1 ? Math.max(1.2, (W / bars.length) * 0.66) : 6;

  const grid = useMemo(() => {
    if (!beatGrid || !beatGrid.length) return [] as { x: number; i: number }[];
    const out: { x: number; i: number }[] = [];
    for (let i = 0; i < beatGrid.length; i++) {
      const p = beatGrid[i];
      if (p < start - 0.001 || p > end + 0.001) continue;
      out.push({ x: norm(p) * W, i });
    }
    return out.length > 220 ? out.filter((g) => g.i % 4 === 0) : out;
  }, [beatGrid, start, end]);

  const posFromEvent = (e: any) => {
    const el = hostRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return 0;
    const ratio = clamp01((e.clientX - r.left) / r.width);
    return clamp01(start + ratio * span);
  };

  const down = (e: any) => {
    if (!onScrub) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    onScrub(posFromEvent(e));
  };
  const move = (e: any) => {
    if (!onScrub || !drag) return;
    onScrub(posFromEvent(e));
  };
  const up = (e: any) => {
    if (!onScrub) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDrag(false);
  };

  const phX = norm(ph) * W;
  const empty = !data || data.length === 0;

  return (
    <div
      ref={hostRef}
      className={
        "relative h-full w-full overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 transition-all duration-200 ease-out" +
        (onScrub ? " touch-none cursor-ew-resize" : "") +
        (onScrub && hover ? " border-amber-500/40" : "") +
        (drag ? " shadow-lg shadow-amber-500/30" : "")
      }
      style={{ minWidth: Waveform_MIN.base[0] + "rem", minHeight: Waveform_MIN.base[1] + "rem" }}
      onPointerDown={onScrub ? down : undefined}
      onPointerMove={onScrub ? move : undefined}
      onPointerUp={onScrub ? up : undefined}
      onPointerCancel={onScrub ? up : undefined}
      onPointerEnter={onScrub ? () => setHover(true) : undefined}
      onPointerLeave={onScrub ? () => setHover(false) : undefined}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none">
        <defs>
          <linearGradient id={uid + "-amp"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={uid + "-played"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a3e635" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#a3e635" stopOpacity="0.06" />
          </linearGradient>
          <clipPath id={uid + "-left"}>
            <rect x="0" y="0" width={Math.max(0, phX)} height={H} />
          </clipPath>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="transparent" />
        <rect x="0" y={MID - 0.6} width={W} height="1.2" fill="#57534e" opacity="0.35" />

        {grid.map((g) => (
          <rect
            key={"g-" + g.i}
            x={g.x - (g.i % 4 === 0 ? 0.9 : 0.5)}
            y={g.i % 4 === 0 ? 6 : 26}
            width={g.i % 4 === 0 ? 1.8 : 1}
            height={H - (g.i % 4 === 0 ? 12 : 52)}
            fill={g.i % 4 === 0 ? "#f59e0b" : "#78716c"}
            opacity={g.i % 4 === 0 ? 0.3 : 0.28}
          />
        ))}

        <g>
          {bars.map((b, i) => {
            const h = Math.max(2, b.a * (H * 0.92));
            return (
              <rect
                key={"b-" + i}
                x={b.x - barW / 2}
                y={MID - h / 2}
                width={barW}
                height={h}
                rx={barW * 0.4}
                fill={"url(#" + uid + "-amp)"}
              />
            );
          })}
        </g>

        <g clipPath={"url(#" + uid + "-left)"}>
          <rect x="0" y="0" width={W} height={H} fill={"url(#" + uid + "-played)"} />
          {bars.map((b, i) => {
            const h = Math.max(2, b.a * (H * 0.92));
            return (
              <rect
                key={"p-" + i}
                x={b.x - barW / 2}
                y={MID - h / 2}
                width={barW}
                height={h}
                rx={barW * 0.4}
                fill="#a3e635"
                opacity="0.9"
              />
            );
          })}
        </g>

        <g className="transition-all duration-100 ease-linear">
          <rect x={phX - 5} y="0" width="10" height={H} fill="#a3e635" opacity="0.12" />
          <rect x={phX - 1.1} y="0" width="2.2" height={H} fill="#a3e635" />
          <rect x={phX - 5} y="0" width="10" height="6" fill="#a3e635" />
          <rect x={phX - 5} y={H - 6} width="10" height="6" fill="#a3e635" />
        </g>
      </svg>

      {empty ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-600">no signal</span>
        </div>
      ) : null}

      <div
        className={
          "pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset transition-all duration-200 ease-out " +
          (drag ? "ring-amber-500/50" : onScrub && hover ? "ring-amber-500/25" : "ring-transparent")
        }
      />
    </div>
  );
}