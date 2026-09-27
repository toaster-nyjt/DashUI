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

export const WaveformLane_MIN = {"base":[10,3]};

export function WaveformLane(props: WaveformLaneProps) {
  const uid = useRef("wfl-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const duration = Math.max(0.0001, props.duration || 0);
  const pos = Math.min(duration, Math.max(0, props.position || 0));
  const span = Math.max(0.05, Math.min(props.zoom && props.zoom > 0 ? props.zoom : duration, duration));
  const windowed = span < duration - 1e-6;
  const t0 = windowed ? pos - span / 2 : 0;
  const t1 = t0 + span;
  const interactive = !!props.onSeek;
  const showPlayhead = props.showPlayhead !== false;

  const N = 260;
  const VW = 1000;
  const VH = 200;

  const samples = props.samples && props.samples.length ? props.samples : null;

  const bars = useMemo(() => {
    const out: number[] = [];
    if (!samples) return out;
    const L = samples.length;
    for (let i = 0; i < N; i++) {
      const a = t0 + (i / N) * span;
      const b = t0 + ((i + 1) / N) * span;
      if (b < 0 || a > duration) { out.push(-1); continue; }
      let i0 = Math.floor((a / duration) * L);
      let i1 = Math.ceil((b / duration) * L);
      if (i1 <= i0) i1 = i0 + 1;
      i0 = Math.max(0, Math.min(L - 1, i0));
      i1 = Math.max(i0 + 1, Math.min(L, i1));
      let mx = 0;
      for (let k = i0; k < i1; k++) { const v = Math.abs(samples[k]); if (v > mx) mx = v; }
      out.push(Math.max(0.015, Math.min(1, mx)));
    }
    return out;
  }, [samples, t0, span, duration]);

  const pct = (t: number) => ((t - t0) / span) * 100;
  const playPct = Math.max(0, Math.min(100, pct(pos)));

  const seekFrom = (clientX: number) => {
    const el = hostRef.current;
    if (!el || !props.onSeek) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0) return;
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const s = Math.min(duration, Math.max(0, t0 + ratio * span));
    props.onSeek(s);
  };

  const beats = (props.beatGrid || []).filter((t) => t >= t0 - span * 0.02 && t <= t1 + span * 0.02);
  const cues = (props.cues || []).filter((c) => c.time >= t0 - span * 0.05 && c.time <= t1 + span * 0.05);

  return (
    <div
      ref={hostRef}
      className={"relative h-full w-full overflow-hidden rounded-xl bg-black/70 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/80 transition-all duration-200 ease-out select-none" + (interactive ? " touch-none cursor-ew-resize hover:ring-cyan-400/35" : "")}
      style={{ minWidth: WaveformLane_MIN.base[0] + "rem", minHeight: WaveformLane_MIN.base[1] + "rem" }}
      onPointerDown={interactive ? (e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setDrag(true); seekFrom(e.clientX); } : undefined}
      onPointerMove={interactive ? (e) => { setHoverX(e.clientX); if (drag) seekFrom(e.clientX); } : undefined}
      onPointerUp={interactive ? (e) => { setDrag(false); (e.currentTarget as any).releasePointerCapture?.(e.pointerId); } : undefined}
      onPointerCancel={interactive ? () => setDrag(false) : undefined}
      onPointerLeave={interactive ? () => { setHoverX(null); } : undefined}
    >
      {/* backdrop scanlines + vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.07)_0%,rgba(0,0,0,0)_70%)]" />
      <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_4px)]" />

      {/* beat grid */}
      {beats.map((t, i) => {
        const p = pct(t);
        if (p < -2 || p > 102) return null;
        const strong = i % 4 === 0;
        return (
          <div
            key={"b-" + i + "-" + t}
            className={"absolute top-0 bottom-0 transition-opacity duration-200" + (strong ? " w-px bg-fuchsia-400/40" : " w-px bg-white/10")}
            style={{ left: p + "%" }}
          />
        );
      })}

      {/* waveform */}
      <svg className="absolute inset-0 h-full w-full" viewBox={"0 0 " + VW + " " + VH} preserveAspectRatio="none">
        <defs>
          <linearGradient id={uid + "-up"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={uid + "-dim"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={uid + "-played"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#e879f9" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
          </linearGradient>
          <clipPath id={uid + "-clipPlayed"}>
            <rect x="0" y="0" width={(playPct / 100) * VW} height={VH} />
          </clipPath>
          <filter id={uid + "-glow"} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {bars.length === 0 ? (
          <g>
            <rect x="0" y={VH / 2 - 1} width={VW} height="2" fill="#334155" />
            <rect x="0" y={VH / 2 - 1} width={VW} height="2" fill="#22d3ee" opacity="0.25">
              <animate attributeName="opacity" values="0.05;0.35;0.05" dur="2.6s" repeatCount="indefinite" />
            </rect>
          </g>
        ) : (
          <g>
            <g filter={"url(#" + uid + "-glow)"}>
              {bars.map((v, i) => {
                if (v < 0) return null;
                const w = VW / N;
                const x = i * w;
                const h = v * (VH * 0.94);
                return (
                  <rect
                    key={"u" + i}
                    x={x + w * 0.16}
                    y={(VH - h) / 2}
                    width={w * 0.68}
                    height={h}
                    rx={w * 0.3}
                    fill={"url(#" + uid + "-up)"}
                  />
                );
              })}
            </g>
            <g clipPath={"url(#" + uid + "-clipPlayed)"} filter={"url(#" + uid + "-glow)"}>
              {bars.map((v, i) => {
                if (v < 0) return null;
                const w = VW / N;
                const x = i * w;
                const h = v * (VH * 0.94);
                return (
                  <rect
                    key={"p" + i}
                    x={x + w * 0.16}
                    y={(VH - h) / 2}
                    width={w * 0.68}
                    height={h}
                    rx={w * 0.3}
                    fill={"url(#" + uid + "-played)"}
                  />
                );
              })}
            </g>
            <rect x="0" y={VH / 2 - 0.6} width={VW} height="1.2" fill="#ffffff" opacity="0.14" />
          </g>
        )}
      </svg>

      {/* played haze */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-fuchsia-500/10 to-fuchsia-400/5 transition-[width] duration-75 ease-linear pointer-events-none"
        style={{ width: playPct + "%" }}
      />

      {/* cue markers */}
      {cues.map((c) => {
        const p = pct(c.time);
        if (p < -2 || p > 102) return null;
        return (
          <div key={c.id} className="absolute top-0 bottom-0 pointer-events-none" style={{ left: p + "%" }}>
            <div className="absolute top-0 bottom-0 -left-px w-[2px] bg-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
            <div className="absolute top-0 -left-px h-2 w-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-br-[3px]" />
            {c.label ? (
              <div className="absolute bottom-0 left-1 max-w-[7rem] min-w-0 truncate px-1 py-[1px] rounded-sm bg-black/70 ring-1 ring-inset ring-amber-400/30 text-[10px] font-medium uppercase tracking-wider leading-none text-amber-300">
                {c.label}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* hover scrub ghost */}
      {interactive && hoverX !== null && !drag ? (
        <WaveformLaneGhost hostRef={hostRef} clientX={hoverX} />
      ) : null}

      {/* playhead */}
      {showPlayhead ? (
        <div
          className={"absolute top-0 bottom-0 pointer-events-none transition-[left] duration-75 ease-linear" + (windowed ? " duration-0" : "")}
          style={{ left: playPct + "%" }}
        >
          <div className="absolute top-0 bottom-0 -left-[1px] w-[2px] bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
          <div className={"absolute top-0 bottom-0 -left-[6px] w-[13px] bg-cyan-300/10 blur-[2px]" + (drag ? " opacity-100" : " opacity-60")} />
          <div className="absolute -top-[1px] -left-[5px] h-0 w-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          <div className="absolute -bottom-[1px] -left-[5px] h-0 w-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
      ) : null}

      {/* frame sheen */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[35%] rounded-t-xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}

function WaveformLaneGhost(p: { hostRef: any; clientX: number }) {
  const el = p.hostRef.current as HTMLDivElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width <= 0) return null;
  const ratio = Math.min(1, Math.max(0, (p.clientX - r.left) / r.width));
  return (
    <div className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none transition-opacity duration-200" style={{ left: ratio * 100 + "%" }} />
  );
}