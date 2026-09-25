type WaveformDisplayProps = {
  data: number[];
  playhead: number;
  beatGrid?: number[];
  onScrub?: (pos: number) => void;
};

export function WaveformDisplay(props: WaveformDisplayProps) {
  const { data, playhead, beatGrid, onScrub } = props;

  const WaveformDisplayClamp = (v: number, lo: number, hi: number) =>
    v < lo ? lo : v > hi ? hi : v;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hoverPos, setHoverPos] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [ripple, setRipple] = useState<{ pos: number; id: number } | null>(null);

  const interactive = typeof onScrub === "function";
  const ph = WaveformDisplayClamp(playhead, 0, 1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(update);
      ro.observe(el);
    }
    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  // ---- Waveform geometry (SVG viewBox coordinate space) ----
  const VBW = 1000;
  const VBH = 200;
  const MID = VBH / 2;

  const hasData = Array.isArray(data) && data.length > 0;

  // Peak envelope reduction -> fixed number of bars for crisp scaling.
  const bars = useMemo(() => {
    if (!hasData) return [] as number[];
    const target = 260;
    const n = data.length;
    if (n <= target) {
      // upscale by simple mapping
      const out: number[] = [];
      for (let i = 0; i < target; i++) {
        const src = (i / target) * n;
        const idx = Math.min(n - 1, Math.floor(src));
        out.push(Math.abs(data[idx]) || 0);
      }
      return out;
    }
    const out: number[] = [];
    const bucket = n / target;
    for (let i = 0; i < target; i++) {
      const start = Math.floor(i * bucket);
      const end = Math.min(n, Math.floor((i + 1) * bucket));
      let peak = 0;
      for (let j = start; j < end; j++) {
        const a = Math.abs(data[j]);
        if (a > peak) peak = a;
      }
      out.push(peak);
    }
    return out;
  }, [data, hasData]);

  const maxAmp = useMemo(() => {
    let m = 0;
    for (let i = 0; i < bars.length; i++) if (bars[i] > m) m = bars[i];
    return m > 0 ? m : 1;
  }, [bars]);

  const barCount = bars.length;
  const gap = 0.18;
  const slot = barCount > 0 ? VBW / barCount : VBW;
  const barW = slot * (1 - gap);

  const playX = ph * VBW;

  // ---- Pointer / scrub handling ----
  const posFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    return WaveformDisplayClamp(rect.width > 0 ? x / rect.width : 0, 0, 1);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const pos = posFromClientX(e.clientX);
    setDragging(true);
    setHoverPos(pos);
    setRipple({ pos, id: Date.now() });
    onScrub!(pos);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive) return;
    const pos = posFromClientX(e.clientX);
    setHoverPos(pos);
    if (dragging) onScrub!(pos);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const handlePointerLeave = () => {
    if (!dragging) setHoverPos(null);
  };

  // ---- Sub renderers ----
  const uid = useRef("wf" + Math.random().toString(36).slice(2, 8));
  const idPlayed = uid.current + "-played";
  const idUnplayed = uid.current + "-unplayed";
  const idGlow = uid.current + "-glow";
  const idClipPlayed = uid.current + "-clipPlayed";
  const idBed = uid.current + "-bed";

  const WaveformDisplayEmpty = () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full items-center gap-[3px] px-4 opacity-40">
        {Array.from({ length: 48 }).map((_, i) => {
          const h = 6 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 22;
          return (
            <div
              key={"eb-" + i}
              className="flex-1 rounded-full bg-neutral-700"
              style={{ height: h + "%" }}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={
        "relative h-full w-full min-w-0 min-h-0 overflow-hidden rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] [container-type:size] select-none" +
        (interactive ? (dragging ? " cursor-grabbing" : " cursor-grab") : "")
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{ touchAction: "none" }}
    >
      {/* subtle horizontal center rail */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.04]" />

      {!hasData ? (
        <WaveformDisplayEmpty />
      ) : (
        <svg
          viewBox={"0 0 " + VBW + " " + VBH}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id={idBed} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c0b0a" />
              <stop offset="50%" stopColor="#050505" />
              <stop offset="100%" stopColor="#0c0b0a" />
            </linearGradient>
            <linearGradient id={idUnplayed} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b5b5b" />
              <stop offset="50%" stopColor="#3a3a3a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>
            <linearGradient id={idPlayed} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <clipPath id={idClipPlayed}>
              <rect x="0" y="0" width={playX} height={VBH} />
            </clipPath>
            <filter id={idGlow} x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="3.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x="0" y="0" width={VBW} height={VBH} fill={"url(#" + idBed + ")"} />

          {/* Unplayed (base) bars */}
          <g fill={"url(#" + idUnplayed + ")"}>
            {bars.map((amp, i) => {
              const norm = amp / maxAmp;
              const hUp = Math.max(2, norm * (MID - 6));
              const hDown = hUp * 0.72;
              const x = i * slot + (slot - barW) / 2;
              return (
                <g key={"u-" + i}>
                  <rect
                    x={x}
                    y={MID - hUp}
                    width={barW}
                    height={hUp}
                    rx={barW * 0.32}
                  />
                  <rect
                    x={x}
                    y={MID}
                    width={barW}
                    height={hDown}
                    rx={barW * 0.32}
                    opacity={0.6}
                  />
                </g>
              );
            })}
          </g>

          {/* Played (amber) bars, clipped to playhead */}
          <g clipPath={"url(#" + idClipPlayed + ")"} filter={"url(#" + idGlow + ")"}>
            <g fill={"url(#" + idPlayed + ")"}>
              {bars.map((amp, i) => {
                const norm = amp / maxAmp;
                const hUp = Math.max(2, norm * (MID - 6));
                const hDown = hUp * 0.72;
                const x = i * slot + (slot - barW) / 2;
                return (
                  <g key={"p-" + i}>
                    <rect
                      x={x}
                      y={MID - hUp}
                      width={barW}
                      height={hUp}
                      rx={barW * 0.32}
                    />
                    <rect
                      x={x}
                      y={MID}
                      width={barW}
                      height={hDown}
                      rx={barW * 0.32}
                      opacity={0.75}
                    />
                  </g>
                );
              })}
            </g>
          </g>

          {/* Beat grid overlay */}
          {Array.isArray(beatGrid) &&
            beatGrid.map((b, i) => {
              const bx = WaveformDisplayClamp(b, 0, 1) * VBW;
              const isBar = i % 4 === 0;
              return (
                <line
                  key={"bg-" + i}
                  x1={bx}
                  y1={isBar ? 6 : 22}
                  x2={bx}
                  y2={isBar ? VBH - 6 : VBH - 22}
                  stroke={isBar ? "#fbbf24" : "#a3a3a3"}
                  strokeWidth={isBar ? 2 : 1}
                  strokeOpacity={isBar ? 0.55 : 0.22}
                  strokeDasharray={isBar ? "0" : "4 6"}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
        </svg>
      )}

      {/* Hover scrub guide (HTML overlay, crisp) */}
      {interactive && hasData && hoverPos !== null && !dragging && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-px bg-amber-300/40 transition-opacity duration-150"
          style={{ left: hoverPos * 100 + "%" }}
        >
          <div className="absolute -top-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-300/70" />
          <div className="absolute -bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-300/70" />
        </div>
      )}

      {/* Scrub ripple pulse */}
      {interactive && hasData && ripple && (
        <div
          key={ripple.id}
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-400/70 motion-reduce:hidden"
          style={{
            left: ripple.pos * 100 + "%",
            animation: "wfRipple 550ms ease-out forwards",
          }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}

      {/* Playhead marker (HTML overlay for sharp line + glow) */}
      {hasData && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-10 w-[2px] bg-amber-300 shadow-[0_0_16px_-1px] shadow-amber-400/80 transition-[left] duration-100 ease-linear motion-reduce:transition-none"
          style={{ left: "calc(" + ph * 100 + "% - 1px)" }}
        >
          {/* top cap */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]" />
          </div>
          {/* bottom cap */}
          <div className="absolute -bottom-px left-1/2 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[5px] border-r-[5px] border-b-[7px] border-l-transparent border-r-transparent border-b-amber-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]" />
          </div>
          {/* pulsing core dot */}
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 shadow-[0_0_10px_2px] shadow-amber-400/80 animate-pulse motion-reduce:animate-none" />
        </div>
      )}

      {/* edge vignette for depth */}
      <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_0_28px_rgba(0,0,0,0.55)]" />

      <style>{
        "@keyframes wfRipple{0%{transform:translate(-50%,-50%) scale(0.4);opacity:0.9}100%{transform:translate(-50%,-50%) scale(3.4);opacity:0}}"
      }</style>
    </div>
  );
}