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

export const WaveformLane_MIN = {"base":[12,3.5]};

export function WaveformLane(props: WaveformLaneProps) {
  const { samples, duration, position, zoom, beatGrid, cues, onSeek, showPlayhead } = props;
  const uid = useRef("wfl-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const dur = duration > 0 ? duration : 1;
  const span = zoom && zoom > 0 ? Math.min(zoom, dur) : dur;
  const centered = !!(zoom && zoom > 0);
  const pos = Math.max(0, Math.min(dur, position));
  const left = centered ? pos - span / 2 : 0;

  const W = 1000;
  const H = 200;
  const MID = H / 2;
  const N = 240;

  const bars = useMemo(() => {
    const out: { x: number; a: number; inside: boolean; t: number }[] = [];
    const n = samples ? samples.length : 0;
    for (let i = 0; i < N; i++) {
      const t = left + ((i + 0.5) / N) * span;
      const inside = t >= 0 && t <= dur;
      let a = 0;
      if (inside && n > 0) {
        const f = (t / dur) * n;
        const i0 = Math.max(0, Math.min(n - 1, Math.floor(f)));
        const i1 = Math.max(0, Math.min(n - 1, i0 + 1));
        const fr = f - i0;
        const v = samples[i0] * (1 - fr) + samples[i1] * fr;
        a = Math.max(0, Math.min(1, v || 0));
      }
      out.push({ x: (i / N) * W, a, inside, t });
    }
    return out;
  }, [samples, left, span, dur]);

  const bw = W / N;
  const playX = ((pos - left) / span) * W;

  const toSeconds = (clientX: number) => {
    const el = hostRef.current;
    if (!el) return pos;
    const r = el.getBoundingClientRect();
    const ratio = r.width > 0 ? (clientX - r.left) / r.width : 0;
    const t = left + Math.max(0, Math.min(1, ratio)) * span;
    return Math.max(0, Math.min(dur, t));
  };

  const grid = (beatGrid || []).filter((t) => t >= left - 0.001 && t <= left + span + 0.001);
  const cueList = (cues || []).filter((c) => c.time >= left - 0.001 && c.time <= left + span + 0.001);

  return (
    <div
      ref={hostRef}
      className={
        "relative h-full w-full overflow-hidden rounded-xl bg-black/70 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/80 transition-all duration-200 ease-out touch-none select-none " +
        (onSeek ? "cursor-ew-resize " : "") +
        (drag ? "ring-cyan-300/50 " : hover && onSeek ? "ring-cyan-400/30 " : "")
      }
      style={{ minWidth: WaveformLane_MIN.base[0] + "rem", minHeight: WaveformLane_MIN.base[1] + "rem" }}
      onPointerEnter={onSeek ? () => setHover(true) : undefined}
      onPointerLeave={onSeek ? () => setHover(false) : undefined}
      onPointerDown={
        onSeek
          ? (e) => {
              (e.currentTarget as any).setPointerCapture(e.pointerId);
              setDrag(true);
              onSeek(toSeconds(e.clientX));
            }
          : undefined
      }
      onPointerMove={
        onSeek
          ? (e) => {
              if (drag) onSeek(toSeconds(e.clientX));
            }
          : undefined
      }
      onPointerUp={onSeek ? () => setDrag(false) : undefined}
      onPointerCancel={onSeek ? () => setDrag(false) : undefined}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.07)_0%,rgba(0,0,0,0)_70%)]" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={"0 0 " + W + " " + H}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={uid + "-wave"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id={uid + "-played"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0abfc" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id={uid + "-head"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={uid + "-clipPlayed"}>
            <rect x="0" y="0" width={Math.max(0, Math.min(W, playX))} height={H} />
          </clipPath>
        </defs>

        {/* centerline + rails */}
        <rect x="0" y={MID - 0.6} width={W} height="1.2" fill="rgba(255,255,255,0.10)" />
        <rect x="0" y="2" width={W} height="1" fill="rgba(255,255,255,0.05)" />
        <rect x="0" y={H - 3} width={W} height="1" fill="rgba(255,255,255,0.05)" />

        {/* beat grid */}
        {grid.map((t, i) => {
          const x = ((t - left) / span) * W;
          const strong = i % 4 === 0;
          return (
            <rect
              key={"bg-" + i + "-" + t}
              x={x - (strong ? 0.9 : 0.5)}
              y={strong ? 6 : 26}
              width={strong ? 1.8 : 1}
              height={H - (strong ? 12 : 52)}
              fill={strong ? "rgba(217,70,239,0.42)" : "rgba(255,255,255,0.12)"}
            />
          );
        })}

        {/* waveform unplayed */}
        <g>
          {bars.map((b, i) => {
            const h = Math.max(1.5, b.a * (H * 0.46));
            return (
              <rect
                key={"u" + i}
                x={b.x + bw * 0.14}
                y={MID - h}
                width={bw * 0.72}
                height={h * 2}
                rx={bw * 0.3}
                fill={b.inside ? "url(#" + uid + "-wave)" : "rgba(255,255,255,0.05)"}
                opacity={b.inside ? 0.85 : 1}
              />
            );
          })}
        </g>

        {/* played overlay */}
        {showPlayhead !== false ? (
          <g clipPath={"url(#" + uid + "-clipPlayed)"}>
            {bars.map((b, i) => {
              const h = Math.max(1.5, b.a * (H * 0.46));
              return (
                <rect
                  key={"p" + i}
                  x={b.x + bw * 0.14}
                  y={MID - h}
                  width={bw * 0.72}
                  height={h * 2}
                  rx={bw * 0.3}
                  fill={b.inside ? "url(#" + uid + "-played)" : "rgba(255,255,255,0.05)"}
                />
              );
            })}
            <rect x="0" y="0" width={W} height={H} fill="rgba(217,70,239,0.07)" />
          </g>
        ) : null}

        {/* cues */}
        {cueList.map((c) => {
          const x = ((c.time - left) / span) * W;
          return (
            <g key={c.id}>
              <rect x={x - 1} y="4" width="2" height={H - 8} fill="rgba(251,191,36,0.85)" filter={"url(#" + uid + "-glow)"} />
              <path d={"M " + x + " 4 L " + (x + 22) + " 12 L " + x + " 20 Z"} fill="#fbbf24" />
            </g>
          );
        })}

        {/* playhead */}
        {showPlayhead !== false ? (
          <g>
            <rect x={playX - 8} y="0" width="16" height={H} fill="rgba(34,211,238,0.10)" />
            <rect
              x={playX - 1.4}
              y="0"
              width="2.8"
              height={H}
              fill={"url(#" + uid + "-head)"}
              filter={"url(#" + uid + "-glow)"}
            />
            <path d={"M " + (playX - 9) + " 0 L " + (playX + 9) + " 0 L " + playX + " 16 Z"} fill="#67e8f9" />
            <path d={"M " + (playX - 9) + " " + H + " L " + (playX + 9) + " " + H + " L " + playX + " " + (H - 16) + " Z"} fill="#67e8f9" />
          </g>
        ) : null}
      </svg>

      {/* cue labels */}
      {cueList.length > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3">
          {cueList.map((c) => {
            const x = ((c.time - left) / span) * 100;
            if (!c.label) return null;
            return (
              <div
                key={"lb-" + c.id}
                className="absolute bottom-1 max-w-[28%] min-w-0 truncate rounded-lg bg-black/70 px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider leading-none text-amber-300 ring-1 ring-inset ring-amber-400/40"
                style={{ left: x + "%", transform: "translateX(-50%)" }}
              >
                {c.label}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* scrub sheen */}
      {onSeek ? (
        <div
          className={
            "pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/5 transition-opacity duration-200 ease-out " +
            (drag ? "opacity-100" : hover ? "opacity-60" : "opacity-0")
          }
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5" />
    </div>
  );
}