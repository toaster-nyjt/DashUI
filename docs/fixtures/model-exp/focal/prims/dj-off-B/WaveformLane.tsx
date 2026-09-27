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

export const WaveformLane_MIN = {"base":[10,2.5]};

export function WaveformLane(props: WaveformLaneProps) {
  const { samples, duration, position, zoom, beatGrid, cues, onSeek, showPlayhead } = props;
  const uid = useRef("wfl-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const dur = duration > 0 ? duration : 1;
  const span = zoom && zoom > 0 ? Math.min(zoom, dur * 4) : dur;
  const t0 = zoom && zoom > 0 ? position - span / 2 : 0;
  const t1 = t0 + span;

  const BARS = 260;
  const bars = useMemo(() => {
    const out: number[] = new Array(BARS).fill(0);
    const n = samples ? samples.length : 0;
    if (!n) return out;
    for (let b = 0; b < BARS; b++) {
      const ba = t0 + (b / BARS) * span;
      const bb = t0 + ((b + 1) / BARS) * span;
      if (bb < 0 || ba > dur) { out[b] = -1; continue; }
      let i0 = Math.floor((ba / dur) * n);
      let i1 = Math.ceil((bb / dur) * n);
      if (i0 < 0) i0 = 0;
      if (i1 > n) i1 = n;
      if (i1 <= i0) i1 = Math.min(n, i0 + 1);
      let m = 0;
      for (let i = i0; i < i1; i++) {
        const v = samples[i];
        if (typeof v === "number" && v > m) m = v;
      }
      out[b] = Math.max(0, Math.min(1, m));
    }
    return out;
  }, [samples, t0, span, dur]);

  const pct = (t: number) => ((t - t0) / span) * 100;

  const emit = (clientX: number) => {
    if (!onSeek || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    if (r.width <= 0) return;
    let ratio = (clientX - r.left) / r.width;
    ratio = Math.max(0, Math.min(1, ratio));
    const t = t0 + ratio * span;
    onSeek(Math.max(0, Math.min(dur, t)));
  };

  const headPct = pct(position);
  const gridLines = (beatGrid || []).filter((t) => t >= t0 - span * 0.02 && t <= t1 + span * 0.02);
  const cueList = (cues || []).filter((c) => c.time >= t0 - span * 0.02 && c.time <= t1 + span * 0.02);
  const empty = !samples || samples.length === 0;

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: WaveformLane_MIN.base[0] + "rem", minHeight: WaveformLane_MIN.base[1] + "rem" }}
    >
      <div
        ref={hostRef}
        onPointerDown={onSeek ? (e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setDrag(true); emit(e.clientX); } : undefined}
        onPointerMove={onSeek ? (e) => { if (drag) emit(e.clientX); } : undefined}
        onPointerUp={onSeek ? (e) => { setDrag(false); (e.currentTarget as any).releasePointerCapture?.(e.pointerId); } : undefined}
        onPointerCancel={onSeek ? () => setDrag(false) : undefined}
        onPointerEnter={onSeek ? () => setHover(true) : undefined}
        onPointerLeave={onSeek ? () => setHover(false) : undefined}
        className={
          "absolute inset-0 overflow-hidden rounded-xl bg-black/70 shadow-inner shadow-black/80 ring-1 ring-inset transition-all duration-200 ease-out " +
          (onSeek ? "touch-none cursor-ew-resize " : "") +
          (drag ? "ring-cyan-300/60" : hover ? "ring-cyan-400/35" : "ring-cyan-400/15")
        }
      >
        {/* waveform */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-wf"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={uid + "-past"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
            </linearGradient>
            <clipPath id={uid + "-clipPast"}>
              <rect x="0" y="0" width={Math.max(0, Math.min(100, headPct)) * 10} height="100" />
            </clipPath>
          </defs>

          <rect x="0" y="49.4" width="1000" height="1.2" fill="#22d3ee" opacity="0.12" />

          <g>
            {bars.map((v, i) => {
              if (v < 0) return null;
              const w = 1000 / BARS;
              const x = i * w;
              const h = Math.max(1.6, v * 92);
              return (
                <rect
                  key={"b" + i}
                  x={x + w * 0.16}
                  y={50 - h / 2}
                  width={w * 0.68}
                  height={h}
                  rx={w * 0.3}
                  fill={"url(#" + uid + "-wf)"}
                />
              );
            })}
          </g>
          {showPlayhead !== false && (
            <g clipPath={"url(#" + uid + "-clipPast)"} opacity="0.85">
              <rect x="0" y="0" width="1000" height="100" fill="#000" opacity="0.45" />
              {bars.map((v, i) => {
                if (v < 0) return null;
                const w = 1000 / BARS;
                const x = i * w;
                const h = Math.max(1.6, v * 92);
                return (
                  <rect
                    key={"p" + i}
                    x={x + w * 0.16}
                    y={50 - h / 2}
                    width={w * 0.68}
                    height={h}
                    rx={w * 0.3}
                    fill={"url(#" + uid + "-past)"}
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* beat grid */}
        {gridLines.map((t, i) => {
          const p = pct(t);
          const strong = i % 4 === 0;
          return (
            <div
              key={"g" + i}
              className="pointer-events-none absolute top-0 bottom-0"
              style={{
                left: p + "%",
                width: "1px",
                background: strong ? "rgba(244,114,182,0.45)" : "rgba(255,255,255,0.13)",
                boxShadow: strong ? "0 0 6px rgba(217,70,239,0.45)" : "none",
              }}
            />
          );
        })}

        {/* cues */}
        {cueList.map((c) => {
          const p = pct(c.time);
          return (
            <div key={c.id} className="pointer-events-none absolute top-0 bottom-0" style={{ left: p + "%" }}>
              <div className="absolute inset-y-0 w-[2px] -translate-x-1/2 bg-amber-400/80 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <div className="absolute top-0 left-0 h-2 w-2 -translate-x-[1px] bg-amber-400 [clip-path:polygon(0_0,100%_0,0_100%)]" />
              {c.label ? (
                <div className="absolute bottom-0 left-1 max-w-[6rem] min-w-0 truncate rounded-sm bg-black/70 px-1 text-[10px] font-medium uppercase tracking-wider leading-none text-amber-300">
                  {c.label}
                </div>
              ) : null}
            </div>
          );
        })}

        {/* playhead */}
        {showPlayhead !== false && headPct >= -2 && headPct <= 102 && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 transition-all duration-75 ease-linear"
            style={{ left: Math.max(0, Math.min(100, headPct)) + "%" }}
          >
            <div className="absolute inset-y-0 w-[2px] -translate-x-1/2 bg-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            <div className="absolute top-0 left-0 h-1.5 w-3 -translate-x-1/2 rounded-b-sm bg-gradient-to-br from-cyan-400 to-sky-500" />
            <div className="absolute bottom-0 left-0 h-1.5 w-3 -translate-x-1/2 rounded-t-sm bg-gradient-to-br from-cyan-400 to-sky-500" />
          </div>
        )}

        {/* scrub glow */}
        {onSeek && (
          <div
            className={
              "pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.10),transparent_70%)] " +
              (drag ? "opacity-100" : hover ? "opacity-60" : "opacity-0")
            }
          />
        )}

        {empty && (
          <div className="absolute inset-[18%] flex items-center justify-center">
            <FitText className="font-mono font-extrabold tracking-tight text-neutral-500" wrap={false}>
              NO SIGNAL
            </FitText>
          </div>
        )}
      </div>
    </div>
  );
}