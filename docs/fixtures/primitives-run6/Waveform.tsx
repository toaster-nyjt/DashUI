type WaveformProps = { data: number[]; playhead: number; beatGrid?: number[]; zoom?: number; onScrub?: (pos: number) => void };

export const Waveform_MIN = {"base":[6,2]};

export function Waveform(props: WaveformProps) {
  const { data, playhead, beatGrid, zoom, onScrub } = props;
  const uid = useRef("waveform-" + Math.random().toString(36).slice(2)).current;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubPos, setScrubPos] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const [hoverPos, setHoverPos] = useState<number | null>(null);

  const floor = Waveform_MIN.base;

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const head = clamp01(Number.isFinite(playhead) ? playhead : 0);
  const z = zoom == null ? 1 : (zoom <= 0 ? 1 : zoom);

  // Zoom expands the visible span symmetrically around the playhead.
  const VBW = 1000;
  const VBH = 200;
  const MID = VBH / 2;

  // window fraction of the track that is visible: at zoom 1 -> whole track, higher zoom -> narrower window
  const windowFrac = clamp01(1 / Math.max(1, z));
  let winStart = head - windowFrac / 2;
  let winEnd = head + windowFrac / 2;
  if (winStart < 0) { winEnd -= winStart; winStart = 0; }
  if (winEnd > 1) { winStart -= (winEnd - 1); winEnd = 1; }
  winStart = clamp01(winStart);
  winEnd = clamp01(winEnd);
  const winSpan = Math.max(1e-6, winEnd - winStart);

  const toX = (norm: number) => ((norm - winStart) / winSpan) * VBW;

  const clean = useMemo(() => {
    if (!Array.isArray(data)) return [] as number[];
    return data.map((d) => {
      const v = typeof d === "number" && Number.isFinite(d) ? d : 0;
      return v < 0 ? -v : v;
    });
  }, [data]);

  const maxAmp = useMemo(() => {
    let m = 0;
    for (let i = 0; i < clean.length; i++) if (clean[i] > m) m = clean[i];
    return m <= 0 ? 1 : m;
  }, [clean]);

  // Build the mirrored waveform silhouette as a filled polygon, sampled across the viewbox width.
  const BARS = 220;
  const geometry = useMemo(() => {
    const n = clean.length;
    if (n === 0) return null;
    const topPts: string[] = [];
    const botPts: string[] = [];
    const spikes: { x: number; h: number }[] = [];
    for (let i = 0; i < BARS; i++) {
      const t = i / (BARS - 1); // 0..1 across visible window
      const norm = winStart + t * winSpan;
      const src = norm * (n - 1);
      const i0 = Math.floor(src);
      const i1 = Math.min(n - 1, i0 + 1);
      const f = src - i0;
      const a = clean[i0] * (1 - f) + clean[i1] * f;
      const amp = clamp01(a / maxAmp);
      const half = amp * (MID - 6) + 2;
      const x = t * VBW;
      topPts.push(x.toFixed(2) + "," + (MID - half).toFixed(2));
      botPts.push(x.toFixed(2) + "," + (MID + half).toFixed(2));
      spikes.push({ x, h: half });
    }
    const path = "M" + topPts.join(" L") + " L" + botPts.reverse().join(" L") + " Z";
    return { path, spikes };
  }, [clean, maxAmp, winStart, winSpan]);

  const beats = useMemo(() => {
    if (!Array.isArray(beatGrid)) return [] as { x: number; strong: boolean }[];
    const out: { x: number; strong: boolean }[] = [];
    for (let i = 0; i < beatGrid.length; i++) {
      const b = beatGrid[i];
      if (typeof b !== "number" || !Number.isFinite(b)) continue;
      const nb = clamp01(b);
      if (nb < winStart - 0.0001 || nb > winEnd + 0.0001) continue;
      out.push({ x: toX(nb), strong: i % 4 === 0 });
    }
    return out;
  }, [beatGrid, winStart, winEnd, winSpan]);

  const headX = toX(head);

  const interactive = typeof onScrub === "function";

  const posFromEvent = (clientX: number) => {
    const el = rootRef.current;
    if (!el) return head;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return head;
    const ratio = clamp01((clientX - rect.left) / rect.width);
    // map ratio within visible window back to global normalized position
    return clamp01(winStart + ratio * winSpan);
  };

  const handleDown = (e: any) => {
    if (!interactive) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    const p = posFromEvent(e.clientX);
    setScrubbing(true);
    setScrubPos(p);
    onScrub!(p);
  };
  const handleMove = (e: any) => {
    if (interactive && scrubbing) {
      const p = posFromEvent(e.clientX);
      setScrubPos(p);
      onScrub!(p);
    }
    if (interactive) setHoverPos(posFromEvent(e.clientX));
  };
  const handleUp = (e: any) => {
    if (!interactive) return;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    setScrubbing(false);
    setScrubPos(null);
  };

  const scrubX = scrubPos != null ? toX(scrubPos) : null;
  const hoverX = hoverPos != null ? toX(hoverPos) : null;

  const empty = geometry == null;

  return (
    <div
      ref={rootRef}
      className={"relative h-full w-full overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 select-none" + (interactive ? " cursor-ew-resize touch-none" : "")}
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={interactive ? handleDown : undefined}
      onPointerMove={interactive ? handleMove : undefined}
      onPointerUp={interactive ? handleUp : undefined}
      onPointerCancel={interactive ? handleUp : undefined}
      onPointerEnter={interactive ? () => setHovering(true) : undefined}
      onPointerLeave={interactive ? () => { setHovering(false); setHoverPos(null); } : undefined}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={"0 0 " + VBW + " " + VBH}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={uid + "-wave"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity="0.95" />
            <stop offset="42%" stopColor="rgb(245 158 11)" stopOpacity="0.85" />
            <stop offset="50%" stopColor="rgb(251 146 60)" stopOpacity="1" />
            <stop offset="58%" stopColor="rgb(245 158 11)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="rgb(180 83 9)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={uid + "-played"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(163 230 53)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="rgb(132 204 22)" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id={uid + "-center"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(120 113 108)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(168 162 158)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="rgb(120 113 108)" stopOpacity="0" />
          </linearGradient>
          <clipPath id={uid + "-clipwave"}>
            {geometry ? <path d={geometry.path} /> : <rect x="0" y="0" width={VBW} height={VBH} />}
          </clipPath>
          <filter id={uid + "-glow"} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* center reference line */}
        <rect x="0" y={MID - 0.6} width={VBW} height="1.2" fill={"url(#" + uid + "-center)"} />

        {/* Beat grid (behind wave for subtle depth) */}
        {beats.map((b, i) => (
          <line
            key={"beat-" + i}
            x1={b.x}
            x2={b.x}
            y1={b.strong ? 6 : 18}
            y2={b.strong ? VBH - 6 : VBH - 18}
            stroke={b.strong ? "rgb(214 211 209)" : "rgb(120 113 108)"}
            strokeOpacity={b.strong ? 0.32 : 0.22}
            strokeWidth={b.strong ? 2.2 : 1.2}
          />
        ))}

        {/* Waveform silhouette */}
        {geometry && (
          <>
            <path d={geometry.path} fill={"url(#" + uid + "-wave)"} />
            {/* played portion overlay clipped to the wave shape */}
            <g clipPath={"url(#" + uid + "-clipwave)"}>
              <rect x="0" y="0" width={Math.max(0, headX)} height={VBH} fill={"url(#" + uid + "-played)"} />
              <rect x="0" y="0" width={Math.max(0, headX)} height={VBH} fill="rgb(163 230 53)" fillOpacity="0.10" />
            </g>
            {/* crisp center spine on top */}
            <line x1="0" x2={VBW} y1={MID} y2={MID} stroke="rgb(41 37 36)" strokeOpacity="0.55" strokeWidth="1" />
          </>
        )}

        {/* hover guide */}
        {interactive && hovering && !scrubbing && hoverX != null && (
          <line
            x1={hoverX}
            x2={hoverX}
            y1="0"
            y2={VBH}
            stroke="rgb(251 191 36)"
            strokeOpacity="0.35"
            strokeWidth="1.4"
            strokeDasharray="3 5"
          />
        )}

        {/* scrub indicator (while dragging) */}
        {interactive && scrubbing && scrubX != null && (
          <line
            x1={scrubX}
            x2={scrubX}
            y1="0"
            y2={VBH}
            stroke="rgb(251 146 60)"
            strokeOpacity="0.7"
            strokeWidth="2"
          />
        )}

        {/* Playhead — lime, glowing */}
        <g filter={"url(#" + uid + "-glow)"} style={{ transition: scrubbing ? "none" : "transform 100ms linear" }}>
          <line
            x1={headX}
            x2={headX}
            y1="0"
            y2={VBH}
            stroke="rgb(163 230 53)"
            strokeWidth="2.4"
          />
        </g>
      </svg>

      {/* Playhead cap markers (HTML for crisp non-stretched triangles) */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{
          left: (((head - winStart) / winSpan) * 100) + "%",
          transform: "translateX(-50%)",
          transition: scrubbing ? "none" : "left 100ms linear"
        }}
      >
        <div className="relative h-full w-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-0 w-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-lime-400 drop-shadow-[0_0_4px_rgba(163,230,53,0.7)]" />
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-0 w-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-lime-400 drop-shadow-[0_0_4px_rgba(163,230,53,0.7)]" />
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-lime-400/30" />
        </div>
      </div>

      {/* subtle top sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-stone-100/[0.03] to-transparent" />

      {/* empty state */}
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-px w-2/3 bg-stone-700/50" />
          <div className="absolute inset-x-[8%] flex items-center justify-center">
            <FitText className="font-medium uppercase tracking-widest text-stone-600" wrap={false}>NO SIGNAL</FitText>
          </div>
        </div>
      )}

      {/* zoom indicator pip when magnified */}
      {z > 1.05 && !empty && (
        <div className="pointer-events-none absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md border border-amber-400/30 bg-neutral-950/70 px-1.5 py-0.5 shadow-md shadow-black/40">
          <div className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
          <div className="h-2 leading-none">
            <FitText className="font-mono font-bold tracking-tight text-amber-400" wrap={false}>{z.toFixed(1) + "x"}</FitText>
          </div>
        </div>
      )}
    </div>
  );
}