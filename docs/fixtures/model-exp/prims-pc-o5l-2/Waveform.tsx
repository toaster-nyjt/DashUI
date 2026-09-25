type WaveformProps = { data: number[]; playhead: number; beatGrid?: number[]; zoom?: number; onScrub?: (pos: number) => void };

export const Waveform_MIN = {"base":[6,2]};

export function Waveform(props: WaveformProps) {
  const uid = useRef("wf-" + Math.random().toString(36).slice(2)).current;
  const data = props.data || [];
  const zoom = Math.max(1, props.zoom && props.zoom > 0 ? props.zoom : 1);
  const ph = Math.min(1, Math.max(0, props.playhead || 0));
  const interactive = !!props.onScrub;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);

  const span = 1 / zoom;
  let start = ph - span / 2;
  if (start < 0) start = 0;
  if (start + span > 1) start = Math.max(0, 1 - span);
  const end = start + span;

  const W = 1000, H = 100, MID = 50;

  const bars = useMemo(() => {
    if (!data.length) return [] as { x: number; a: number }[];
    const N = Math.min(320, Math.max(24, data.length));
    const out: { x: number; a: number }[] = [];
    for (let i = 0; i < N; i++) {
      const t0 = start + (i / N) * span;
      const t1 = start + ((i + 1) / N) * span;
      let i0 = Math.floor(t0 * data.length);
      let i1 = Math.ceil(t1 * data.length);
      if (i1 <= i0) i1 = i0 + 1;
      let peak = 0;
      for (let k = i0; k < i1 && k < data.length; k++) {
        const v = Math.abs(data[k] || 0);
        if (v > peak) peak = v;
      }
      out.push({ x: (i / N) * W, a: Math.min(1, peak) });
    }
    return out;
  }, [data, start, span]);

  const barW = bars.length ? W / bars.length : W;
  const phX = ((ph - start) / span) * W;

  const emit = (e: any) => {
    if (!props.onScrub || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    if (r.width <= 0) return;
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    props.onScrub(Math.min(1, Math.max(0, start + f * span)));
  };

  return (
    <div
      ref={hostRef}
      className={"relative h-full w-full overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 transition-all duration-200 ease-out touch-none" + (interactive ? " cursor-ew-resize" : "") + (interactive && (hover || drag) ? " border-amber-500/40" : "")}
      style={{ minWidth: Waveform_MIN.base[0] + "rem", minHeight: Waveform_MIN.base[1] + "rem" }}
      onPointerEnter={interactive ? () => setHover(true) : undefined}
      onPointerLeave={interactive ? () => setHover(false) : undefined}
      onPointerDown={interactive ? (e) => { (e.currentTarget as any).setPointerCapture(e.pointerId); setDrag(true); emit(e); } : undefined}
      onPointerMove={interactive ? (e) => { if (drag) emit(e); } : undefined}
      onPointerUp={interactive ? (e) => { setDrag(false); try { (e.currentTarget as any).releasePointerCapture(e.pointerId); } catch (err) {} } : undefined}
      onPointerCancel={interactive ? () => setDrag(false) : undefined}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none">
        <defs>
          <linearGradient id={uid + "-g"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.95" />
            <stop offset="50%" stopColor="rgb(245,158,11)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="rgb(251,191,36)" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={uid + "-glow"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(163,230,53)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(163,230,53)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="rgb(163,230,53)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1="0" y1={MID} x2={W} y2={MID} stroke="rgb(87,83,78)" strokeOpacity="0.35" strokeWidth="1" />

        {(props.beatGrid || []).map((b, i) => {
          if (b < start || b > end) return null;
          const x = ((b - start) / span) * W;
          const strong = i % 4 === 0;
          return (
            <line
              key={"bg-" + i}
              x1={x} y1={strong ? 4 : 18} x2={x} y2={strong ? H - 4 : H - 18}
              stroke={strong ? "rgb(168,162,158)" : "rgb(87,83,78)"}
              strokeOpacity={strong ? 0.45 : 0.4}
              strokeWidth={strong ? 1.5 : 1}
            />
          );
        })}

        {bars.map((b, i) => {
          const h = Math.max(1.2, b.a * (H / 2 - 4));
          const played = b.x + barW / 2 <= phX;
          return (
            <rect
              key={"b-" + i}
              x={b.x + barW * 0.12}
              y={MID - h}
              width={Math.max(0.6, barW * 0.76)}
              height={h * 2}
              rx={Math.min(1.5, barW * 0.3)}
              fill={played ? "rgb(168,162,158)" : ("url(#" + uid + "-g)")}
              opacity={played ? 0.42 : 1}
            />
          );
        })}

        {data.length > 0 && phX >= -1 && phX <= W + 1 ? (
          <g>
            <rect x={phX - 14} y="0" width="28" height={H} fill={"url(#" + uid + "-glow)"} />
            <line x1={phX} y1="0" x2={phX} y2={H} stroke="rgb(163,230,53)" strokeWidth="2" />
            <polygon points={(phX - 5) + ",0 " + (phX + 5) + ",0 " + phX + ",8"} fill="rgb(163,230,53)" />
            <polygon points={(phX - 5) + "," + H + " " + (phX + 5) + "," + H + " " + phX + "," + (H - 8)} fill="rgb(163,230,53)" />
          </g>
        ) : null}
      </svg>

      {data.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-px w-1/2 bg-stone-700/60" />
        </div>
      ) : null}

      {interactive ? (
        <div className={"pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset transition-all duration-200 ease-out " + (drag ? "ring-amber-500/50 bg-amber-500/5" : hover ? "ring-amber-500/25" : "ring-transparent")} />
      ) : null}
    </div>
  );
}