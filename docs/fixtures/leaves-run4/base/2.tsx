export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0); // -8..+8
  const [playhead, setPlayhead] = useState(0.28); // 0..1
  const [activeLoop, setActiveLoop] = useState<number | null>(null);
  const [cuePressed, setCuePressed] = useState(false);
  const [jogAngle, setJogAngle] = useState(0);
  const [litCue, setLitCue] = useState<number | null>(2);

  const dragRef = useRef<{ dragging: boolean; lastY: number }>({ dragging: false, lastY: 0 });

  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + pitch / 100);

  // Playback advance
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPlayhead((p) => (p + dt * 0.012 * (1 + pitch / 100)) % 1);
      setJogAngle((a) => (a + dt * 120 * (1 + pitch / 100)) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, pitch]);

  // Jog wheel drag (scratch / bend)
  const onJogDown = (e: React.PointerEvent) => {
    dragRef.current.dragging = true;
    dragRef.current.lastY = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onJogMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastY = e.clientY;
    setJogAngle((a) => (a - dy * 1.4 + 360) % 360);
    setPlayhead((p) => Math.min(1, Math.max(0, p - dy * 0.0009)));
  };
  const onJogUp = () => {
    dragRef.current.dragging = false;
  };

  const waveBars = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 96; i++) {
      const v =
        0.35 +
        0.4 * Math.abs(Math.sin(i * 0.5)) +
        0.25 * Math.abs(Math.sin(i * 0.17 + 1.3)) +
        0.12 * Math.abs(Math.sin(i * 1.1));
      arr.push(Math.min(1, v));
    }
    return arr;
  }, []);

  const hotCues = ["A", "B", "C", "D"];
  const loops = [
    { label: "1/4", v: 0 },
    { label: "1/2", v: 1 },
    { label: "1", v: 2 },
    { label: "4", v: 3 },
  ];

  const fmtTime = (frac: number) => {
    const total = 214; // seconds
    const s = Math.floor(total * frac);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-violet-500/20 bg-neutral-900/80 bg-gradient-to-l from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-violet-400 text-xs leading-none animate-pulse">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B · CH2
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-stone-500 leading-none">BPM</span>
          <span
            className={
              "font-mono font-bold tracking-tight text-sm leading-none " +
              (isSynced ? "text-lime-300" : "text-violet-300")
            }
          >
            {bpm.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-3">
        {/* Track Info */}
        <div className="shrink-0 flex items-center justify-between gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold tracking-tight leading-tight text-stone-100 truncate">
              Midnight Circuit
            </div>
            <div className="text-[11px] tracking-wide leading-none text-stone-500 truncate mt-0.5">
              Neon Drifter — Deep Tech
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono font-bold text-sm leading-none text-stone-100">
              {fmtTime(playhead)}
            </div>
            <div className="font-mono text-[10px] leading-none text-stone-600 mt-1">
              -{fmtTime(1 - playhead)}
            </div>
          </div>
        </div>

        {/* Waveform Strip */}
        <div className="shrink-0 relative h-12 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden shadow-none">
          {/* beat grid */}
          <div className="absolute inset-0 flex justify-between px-1 opacity-40 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={"grid-" + i} className="w-px h-full bg-stone-600/40" />
            ))}
          </div>
          {/* wave bars */}
          <div className="absolute inset-0 flex items-center gap-px px-0.5">
            {waveBars.map((v, i) => {
              const passed = i / waveBars.length < playhead;
              return (
                <div
                  key={"wb-" + i}
                  className={
                    "flex-1 basis-0 min-w-0 rounded-sm transition-colors duration-150 " +
                    (passed ? "bg-violet-400/90" : "bg-violet-400/30")
                  }
                  style={{ height: Math.max(8, v * 100) + "%" }}
                />
              );
            })}
          </div>
          {/* playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-lime-400 shadow-lg shadow-lime-400/40 transition-all duration-100 ease-linear"
            style={{ left: playhead * 100 + "%" }}
          >
            <div className="absolute -top-0.5 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-lime-400" />
          </div>
        </div>

        {/* Jog + Pitch */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog Wheel */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex items-center justify-center">
            <div
              className="relative aspect-square h-full max-h-full max-w-full rounded-full border-2 border-stone-700/80 bg-black/70 shadow-inner shadow-black/70 touch-none cursor-grab active:cursor-grabbing select-none"
              onPointerDown={onJogDown}
              onPointerMove={onJogMove}
              onPointerUp={onJogUp}
              onPointerLeave={onJogUp}
            >
              {/* outer ring markers */}
              <div
                className="absolute inset-0 rounded-full transition-transform duration-150 ease-out"
                style={{ transform: "rotate(" + jogAngle + "deg)" }}
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={"tick-" + i}
                    className="absolute left-1/2 top-1 w-px h-2 -translate-x-1/2 bg-violet-400/40"
                    style={{ transformOrigin: "50% calc(50vmin)", transform: "rotate(" + i * 15 + "deg)" }}
                  />
                ))}
                {/* position dot */}
                <div className="absolute left-1/2 top-1.5 w-2 h-2 -translate-x-1/2 rounded-full bg-lime-400 shadow-lg shadow-lime-400/50" />
              </div>
              {/* inner platter */}
              <div className="absolute inset-[18%] rounded-full border border-stone-800/70 bg-gradient-to-b from-neutral-800/50 to-neutral-950/70 shadow-inner shadow-black/60 flex items-center justify-center">
                <div
                  className={
                    "absolute inset-[22%] rounded-full border border-violet-500/20 " +
                    (isPlaying ? "animate-[spin_2s_linear_infinite]" : "")
                  }
                  style={{ transform: "rotate(" + jogAngle * 0.5 + "deg)" }}
                >
                  <div className="absolute left-1/2 top-0 w-px h-1/2 -translate-x-1/2 bg-violet-400/30" />
                </div>
                <div className="relative z-10 text-center leading-none">
                  <div
                    className={
                      "font-mono font-bold text-sm " +
                      (isSynced ? "text-lime-300" : "text-violet-300")
                    }
                  >
                    {isPlaying ? "▶" : "❚❚"}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-stone-500 mt-1">Jog</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch Fader */}
          <div className="shrink-0 w-14 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">Pitch</span>
            <div className="flex-1 min-h-0 w-full flex items-stretch justify-center gap-1.5">
              {/* scale */}
              <div className="flex flex-col justify-between py-1 items-end">
                {["+8", "+4", "0", "-4", "-8"].map((t) => (
                  <span key={"sc-" + t} className="text-[8px] font-mono text-stone-600 leading-none">
                    {t}
                  </span>
                ))}
              </div>
              {/* track */}
              <div className="relative w-3 flex-shrink">
                <div className="absolute inset-x-[35%] inset-y-0 rounded-full bg-stone-950/80 border border-stone-800/70" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 w-4 h-px bg-lime-400/40" />
                <input
                  type="range"
                  min={-8}
                  max={8}
                  step={0.1}
                  value={-pitch}
                  onChange={(e) => setPitch(-parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                  style={{ writingMode: "vertical-lr" as any }}
                />
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-7 h-3 rounded-sm border border-violet-500/40 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-md shadow-black/50 pointer-events-none transition-all duration-75"
                  style={{ top: "calc(" + ((8 - pitch) / 16) * 100 + "% - 6px)" }}
                >
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-px bg-violet-400" />
                </div>
              </div>
            </div>
            <span
              className={
                "font-mono font-bold text-[11px] leading-none " +
                (pitch === 0 ? "text-stone-100" : "text-violet-300")
              }
            >
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Hot Cue Pads + Loop */}
        <div className="shrink-0 grid grid-cols-2 gap-2">
          {/* Hot Cues */}
          <div className="min-w-0">
            <div className="text-[9px] font-medium uppercase tracking-widest text-stone-500 mb-1 leading-none">Hot Cues</div>
            <div className="grid grid-cols-4 gap-1">
              {hotCues.map((c, i) => {
                const lit = litCue === i;
                return (
                  <button
                    key={"cue-" + i}
                    onClick={() => setLitCue(lit ? null : i)}
                    className={
                      "aspect-square rounded-md border p-1 font-semibold uppercase tracking-wider text-[11px] shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 " +
                      (lit
                        ? "bg-violet-600/25 text-violet-200 border-violet-400/50 shadow-lg shadow-violet-500/30 animate-pulse"
                        : "bg-neutral-900/90 text-stone-400 border-violet-500/25 hover:text-violet-300 hover:border-violet-400/60 hover:shadow-md hover:shadow-violet-500/30 hover:-translate-y-px")
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Loops */}
          <div className="min-w-0">
            <div className="text-[9px] font-medium uppercase tracking-widest text-stone-500 mb-1 leading-none">Loop</div>
            <div className="grid grid-cols-4 gap-1">
              {loops.map((l) => {
                const on = activeLoop === l.v;
                return (
                  <button
                    key={"loop-" + l.v}
                    onClick={() => setActiveLoop(on ? null : l.v)}
                    className={
                      "aspect-square rounded-md border p-1 font-mono font-bold text-[10px] shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 " +
                      (on
                        ? "bg-amber-500/20 text-amber-200 border-amber-400/50 shadow-lg shadow-amber-500/30 animate-pulse"
                        : "bg-neutral-900/90 text-stone-400 border-amber-500/25 hover:text-amber-300 hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/30 hover:-translate-y-px")
                    }
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transport row */}
        <div className="shrink-0 grid grid-cols-4 gap-2">
          {/* Cue */}
          <button
            onPointerDown={() => {
              setCuePressed(true);
              setPlayhead(0);
            }}
            onPointerUp={() => setCuePressed(false)}
            onPointerLeave={() => setCuePressed(false)}
            className={
              "h-10 rounded-lg border font-semibold uppercase tracking-wider text-[11px] shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 " +
              (cuePressed
                ? "bg-amber-500 text-neutral-950 border-amber-400/60 shadow-lg shadow-amber-500/40"
                : "bg-neutral-900/90 text-amber-300 border-amber-500/40 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-px")
            }
          >
            Cue
          </button>
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={
              "col-span-1 h-10 rounded-lg border font-semibold uppercase tracking-wider text-[11px] shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 flex items-center justify-center gap-1 " +
              (isPlaying
                ? "bg-lime-400/90 text-neutral-950 border-lime-300/60 shadow-lg shadow-lime-400/30"
                : "bg-neutral-900/90 text-lime-300 border-lime-400/40 hover:bg-lime-400/90 hover:text-neutral-950 hover:shadow-lg hover:shadow-lime-400/30 hover:-translate-y-px")
            }
          >
            <span className="text-sm leading-none">{isPlaying ? "❚❚" : "▶"}</span>
          </button>
          {/* Sync */}
          <button
            onClick={() => setIsSynced((s) => !s)}
            className={
              "h-10 rounded-lg border font-semibold uppercase tracking-wider text-[11px] shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 " +
              (isSynced
                ? "bg-lime-400/20 text-lime-300 border-lime-400/50 shadow-lg shadow-lime-400/30 animate-pulse"
                : "bg-neutral-900/90 text-stone-400 border-amber-500/25 hover:text-lime-300 hover:border-lime-400/50 hover:shadow-md hover:shadow-lime-400/30 hover:-translate-y-px")
            }
          >
            Sync
          </button>
          {/* Keylock */}
          <button
            onClick={() => setKeylock((k) => !k)}
            className={
              "h-10 rounded-lg border font-semibold uppercase tracking-wider text-[10px] shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 flex flex-col items-center justify-center leading-none gap-0.5 " +
              (keylock
                ? "bg-violet-600/25 text-violet-200 border-violet-400/50 shadow-lg shadow-violet-500/30 ring-1 ring-inset ring-violet-500/50"
                : "bg-neutral-900/90 text-stone-500 border-violet-500/25 hover:text-violet-300 hover:border-violet-400/60 hover:shadow-md hover:shadow-violet-500/30 hover:-translate-y-px")
            }
          >
            <span>Key</span>
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Footer status */}
      <div className="h-6 shrink-0 flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500 leading-none">
          {isPlaying ? <span className="text-lime-300">● Playing</span> : "Paused"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 leading-none">
          Key <span className={keylock ? "text-violet-300" : "text-stone-400"}>{keylock ? "Lock" : "Free"}</span>
        </span>
      </div>
    </div>
  );
}