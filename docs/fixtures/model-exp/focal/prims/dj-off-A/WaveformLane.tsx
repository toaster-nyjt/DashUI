type WaveformLaneProps = {
  samples: number[];
  duration: number;
  position: number;
  zoom?: number;
  beatGrid?: number[];
  cues?: { id: string; time: number; label?: string }[];
  onSeek?: (seconds: number) => void;
  showPlayhead?: boolean;
};

export const WaveformLane_MIN = {"base":[12,3]};

export function WaveformLane(props: WaveformLaneProps) {
  const uid = useRef("wfl-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const duration = props.duration > 0 ? props.duration : 0;
  const win = props.zoom && props.zoom > 0 ? Math.min(props.zoom, Math.max(duration, 0.001)) : Math.max(duration, 0.001);
  const pos = Math.max(0, Math.min(duration, props.position || 0));

  let start = props.zoom && props.zoom > 0 ? pos - win / 2 : 0;
  if (start < 0) start = 0;
  if (start + win > duration) start = Math.max(0, duration - win);
  const end = start + win;

  const W = 1000;
  const H = 100;
  const NB = 180;

  const bars = useMemo(() => {
    const s = props.samples || [];
    const out: number[] = [];
    if (s.length === 0 || duration <= 0) return out;
    for (let i = 0; i < NB; i++) {
      const t0 = start + (i / NB) * win;
      const t1 = start + ((i + 1) / NB) * win;
      let i0 = Math.floor((t0 / duration) * s.length);
      let i1 = Math.ceil((t1 / duration) * s.length);
      if (i1 <= i0) i1 = i0 + 1;
      i0 = Math.max(0, Math.min(s.length - 1, i0));
      i1 = Math.max(i0 + 1, Math.min(s.length, i1));
      let m = 0;
      for (let k = i0; k < i1; k++) {
        const v = s[k];
        const a = typeof v === "number" && isFinite(v) ? Math.abs(v) : 0;
        if (a > m) m = a;
      }
      out.push(Math.max(0.015, Math.min(1, m)));
    }
    return out;
  }, [props.samples, duration, start, win]);

  const tToX = (t: number) => ((t - start) / win) * W;
  const playX = tToX(pos);
  const showPh = props.showPlayhead !== false;

  const emit = (clientX: number) => {
    const el = hostRef.current;
    if (!el || !props.onSeek) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return;
    let ratio = (clientX - r.left) / r.width;
    ratio = Math.max(0, Math.min(1, ratio));
    const t = start + ratio * win;
    props.onSeek(Math.max(0, Math.min(duration, t)));
  };

  const interactive = !!props.onSeek;

  const grid = (props.beatGrid || []).filter((t) => t >= start - 0.001 && t <= end + 0.001);
  const cues = (props.cues || []).filter((c) => c.time >= start - 0.001 && c.time <= end + 0.001);
  const empty = bars.length === 0;

  return (
    <div
      ref={hostRef}
      className={
        "relative h-full w-full overflow-hidden rounded-xl bg-black/70 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/80 transition-all duration-200 ease-out touch-none select-none " +
        (interactive ? "cursor-ew-resize " : "") +
        (interactive && hover ? "ring-cyan-400/35 " : "") +
        (drag ? "ring-2 ring-fuchsia-400/50 " : "")
      }
      style={{ minWidth: WaveformLane_MIN.base[0] + "rem", minHeight: WaveformLane_MIN.base[1] + "rem" }}
      onPointerEnter={interactive ? () => setHover(true) : undefined}
      onPointerLeave={interactive ? () => setHover(false) : undefined}
      onPointerDown={
        interactive
          ? (e) => {
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              setDrag(true);
              emit(e.clientX);
            }
          : undefined
      }
      onPointerMove={interactive ? (e) => { if (drag) emit(e.clientX); } : undefined}
      onPointerUp={interactive ? (e) => { setDrag(false); try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {} } : undefined}
      onPointerCancel={interactive ? () => setDrag(false) : undefined}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none">
        <defs>
          <linearGradient id={uid + "-wave"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#22d3ee" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={uid + "-past"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.18" />
          </linearGradient>
          <clipPath id={uid + "-clipPast"}>
            <rect x="0" y="0" width={Math.max(0, Math.min(W, playX))} height={H} />
          </clipPath>
        </defs>

        <rect x="0" y="0" width={W} height={H} fill="#000" opacity="0.5" />
        {showPh ? <rect x="0" y="0" width={Math.max(0, Math.min(W, playX))} height={H} fill={"url(#" + uid + "-scan)"} /> : null}

        {grid.map((t, i) => {
          const x = tToX(t);
          const strong = i % 4 === 0;
          return (
            <line
              key={"g-" + i}
              x1={x}
              x2={x}
              y1={strong ? 2 : 14}
              y2={strong ? H - 2 : H - 14}
              stroke={strong ? "#d946ef" : "#ffffff"}
              strokeOpacity={strong ? 0.35 : 0.1}
              strokeWidth={strong ? 2 : 1}
            />
          );
        })}

        <line x1="0" x2={W} y1={H / 2} y2={H / 2} stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />

        {bars.map((v, i) => {
          const bw = W / NB;
          const x = i * bw;
          const h = v * (H * 0.92);
          return (
            <rect
              key={"b-" + i}
              x={x + bw * 0.14}
              y={(H - h) / 2}
              width={bw * 0.72}
              height={h}
              fill={"url(#" + uid + "-wave)"}
              rx={bw * 0.3}
            />
          );
        })}

        {showPh ? (
          <g clipPath={"url(#" + uid + "-clipPast)"}>
            {bars.map((v, i) => {
              const bw = W / NB;
              const x = i * bw;
              const h = v * (H * 0.92);
              return (
                <rect
                  key={"p-" + i}
                  x={x + bw * 0.14}
                  y={(H - h) / 2}
                  width={bw * 0.72}
                  height={h}
                  fill={"url(#" + uid + "-past)"}
                  rx={bw * 0.3}
                />
              );
            })}
          </g>
        ) : null}

        {cues.map((c) => {
          const x = tToX(c.time);
          return (
            <g key={c.id}>
              <line x1={x} x2={x} y1="0" y2={H} stroke="#fbbf24" strokeOpacity="0.85" strokeWidth="2" />
              <path d={"M " + x + " 0 L " + (x + 12) + " 0 L " + (x + 12) + " 12 L " + x + " 18 Z"} fill="#fbbf24" opacity="0.9" />
            </g>
          );
        })}

        {showPh ? (
          <g>
            <line x1={playX} x2={playX} y1="0" y2={H} stroke="#67e8f9" strokeWidth="3" opacity="0.95" />
            <line x1={playX} x2={playX} y1="0" y2={H} stroke="#ffffff" strokeWidth="1" opacity="0.9" />
            <path d={"M " + (playX - 7) + " 0 L " + (playX + 7) + " 0 L " + playX + " 12 Z"} fill="#67e8f9" />
            <path d={"M " + (playX - 7) + " " + H + " L " + (playX + 7) + " " + H + " L " + playX + " " + (H - 12) + " Z"} fill="#67e8f9" />
          </g>
        ) : null}
      </svg>

      {showPh ? (
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-cyan-300/70 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)] transition-all duration-75 ease-linear"
          style={{ left: Math.max(0, Math.min(100, (playX / W) * 100)) + "%" }}
        />
      ) : null}

      {cues.map((c) =>
        c.label ? (
          <div
            key={"lb-" + c.id}
            className="pointer-events-none absolute top-0 h-[38%] max-w-[30%] min-w-0 truncate text-[10px] font-medium uppercase tracking-wider leading-none text-amber-300 flex items-center"
            style={{ left: "calc(" + Math.max(0, Math.min(100, (tToX(c.time) / W) * 100)) + "% + 0.9rem)" }}
          >
            <span className="min-w-0 truncate">{c.label}</span>
          </div>
        ) : null
      )}

      {empty ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-px w-[70%] bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />
        </div>
      ) : null}

      <div
        className={
          "pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200 ease-out bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.12),transparent_70%)] " +
          (drag ? "opacity-100" : interactive && hover ? "opacity-60" : "opacity-0")
        }
      />
    </div>
  );
}