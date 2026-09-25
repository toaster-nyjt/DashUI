export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0.32); // 0..1 through track
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [keylock, setKeylock] = useState(true);
  const [synced, setSynced] = useState(false);
  const [scratching, setScratching] = useState(false);
  const [scratchDelta, setScratchDelta] = useState(0); // visual jog rotation offset
  const [cuePressed, setCuePressed] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(0);
  const [loopLen, setLoopLen] = useState<number | null>(null); // beats
  const [loopActive, setLoopActive] = useState(false);

  const baseBpm = 128.0;
  const bpm = useMemo(() => baseBpm * (1 + pitch / 100), [pitch]);

  const jogRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ lastAngle: number; active: boolean }>({ lastAngle: 0, active: false });
  const spinRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Continuous playback + jog spin
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (playing && !scratching) {
        setPosition((p) => {
          let np = p + (dt * (bpm / 60)) / 220; // arbitrary track length feel
          if (np >= 1) np -= 1;
          return np;
        });
        spinRef.current = (spinRef.current + dt * (bpm / 60) * 40) % 360;
      }
      setScratchDelta(spinRef.current + scratchDelta * 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, scratching, bpm]);

  const jogRotation = spinRef.current;

  const angleFromEvent = (clientX: number, clientY: number) => {
    const el = jogRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  const onJogDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragState.current = { lastAngle: angleFromEvent(e.clientX, e.clientY), active: true };
    setScratching(true);
  };
  const onJogMove = (e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    const a = angleFromEvent(e.clientX, e.clientY);
    let diff = a - dragState.current.lastAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    dragState.current.lastAngle = a;
    spinRef.current = (spinRef.current + diff + 360) % 360;
    setPosition((p) => {
      let np = p + diff / 360 / 40;
      if (np < 0) np += 1;
      if (np >= 1) np -= 1;
      return np;
    });
  };
  const onJogUp = () => {
    dragState.current.active = false;
    setScratching(false);
  };

  const fmtTime = (frac: number) => {
    const total = 214; // seconds
    const s = Math.floor(frac * total);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return m + ":" + rem.toString().padStart(2, "0");
  };

  // Static-ish waveform bars, positioned relative to playhead
  const waveBars = useMemo(() => {
    const n = 64;
    return Array.from({ length: n }, (_, i) => {
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const h = 0.25 + (seed - Math.floor(seed)) * 0.75;
      const lowMid = ((i * 7) % 3) === 0;
      return { h, lowMid };
    });
  }, []);

  const cueColors = ["bg-amber-500", "bg-teal-500", "bg-rose-500", "bg-emerald-500"];
  const loopButtons = [1, 2, 4, 8];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm text-neutral-100">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-400 text-[11px] font-bold leading-none">A</span>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400/90 truncate">Deck A</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={"w-1.5 h-1.5 rounded-full " + (playing ? "bg-emerald-400 shadow-[0_0_8px_1px] shadow-emerald-500/60 animate-pulse" : "bg-neutral-600")} />
          <span className="text-[10px] tracking-wide text-neutral-500">CH1</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col gap-2">
        {/* Track info + BPM */}
        <div className="flex items-stretch gap-2 shrink-0">
          <div className="flex-1 min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2.5 py-1.5 overflow-hidden">
            <div className="text-[13px] font-medium leading-tight text-neutral-100 truncate">Midnight Circuit</div>
            <div className="text-[11px] leading-tight text-neutral-500 truncate">Nova Alias · Am · {fmtTime(position)} / 3:34</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2.5 py-1 min-w-0">
            <span className="font-mono text-lg font-bold tabular-nums leading-none text-amber-300">{bpm.toFixed(1)}</span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">BPM</span>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 relative h-11 rounded-lg overflow-hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-white/[0.04]">
          <div className="absolute inset-0 flex items-center">
            <div
              className="flex items-center h-full gap-[2px] will-change-transform"
              style={{ transform: "translateX(" + (-position * 40 + 50) + "%)", width: "160%" }}
            >
              {waveBars.concat(waveBars).map((b, i) => (
                <div
                  key={"w" + i}
                  className={"w-[3px] rounded-sm " + (b.lowMid ? "bg-amber-500/70" : "bg-amber-400/35")}
                  style={{ height: (b.h * 100) + "%" }}
                />
              ))}
            </div>
          </div>
          {/* Playhead */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-rose-400 shadow-[0_0_10px_1px] shadow-rose-500/70" />
          {loopActive && (
            <div className="absolute inset-y-0 left-1/2 w-14 bg-teal-500/15 border-x border-teal-400/40" />
          )}
        </div>

        {/* Jog + Pitch */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog Wheel */}
          <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center">
            <div className="relative aspect-square h-full max-h-full">
              <div
                ref={jogRef}
                onPointerDown={onJogDown}
                onPointerMove={onJogMove}
                onPointerUp={onJogUp}
                onPointerLeave={onJogUp}
                className={
                  "absolute inset-0 rounded-full border cursor-grab active:cursor-grabbing select-none touch-none transition-shadow duration-200 " +
                  (playing
                    ? "border-amber-400/40 shadow-[0_0_16px_-2px] shadow-amber-500/60"
                    : "border-neutral-700/70 shadow-md shadow-black/40")
                }
                style={{ background: "radial-gradient(circle at 50% 40%, #3a3a3a 0%, #1c1c1c 55%, #0a0a0a 100%)" }}
              >
                {/* rotation marker layer */}
                <div
                  className="absolute inset-2 rounded-full will-change-transform"
                  style={{ transform: "rotate(" + jogRotation + "deg)" }}
                >
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-amber-400/80 shadow-[0_0_6px_1px] shadow-amber-500/60" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.05]" />
                </div>
                {/* center cap */}
                <div className="absolute inset-[26%] rounded-full bg-gradient-to-b from-neutral-700 to-neutral-900 border border-neutral-700/70 flex flex-col items-center justify-center">
                  <span className="font-mono text-[13px] font-bold tabular-nums leading-none text-amber-300">{fmtTime(position)}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500 mt-0.5">
                    {scratching ? "SCR" : playing ? "PLAY" : "CUE"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch fader */}
          <div className="w-14 shrink-0 flex flex-col items-center justify-between gap-1.5 py-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">Pitch</span>
            <div className="relative flex-1 min-h-0 flex items-center justify-center">
              <div className="relative h-full w-2 rounded-full bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]" />
              <input
                type="range"
                min={-8}
                max={8}
                step={0.1}
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                aria-label="Pitch fader"
                className="absolute h-full w-8 appearance-none bg-transparent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-full [writing-mode:vertical-lr] [direction:rtl] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-neutral-500 [&::-webkit-slider-thumb]:to-neutral-800 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-amber-400/40 [&::-webkit-slider-thumb]:shadow-[0_0_10px_-2px_rgba(245,158,11,0.7)] [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-amber-400/40 [&::-moz-range-thumb]:bg-neutral-700"
              />
            </div>
            <span className="font-mono text-[11px] font-bold tabular-nums leading-none text-amber-300">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Transport row */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5">
          <button
            onPointerDown={() => {
              setCuePressed(true);
              if (!playing) setActiveCue(0);
            }}
            onPointerUp={() => setCuePressed(false)}
            onPointerLeave={() => setCuePressed(false)}
            className={
              "rounded-lg border px-2 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-200 ease-out active:scale-[0.97] " +
              (cuePressed
                ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-[0_0_12px_-1px] shadow-amber-500/60"
                : "bg-neutral-800 text-neutral-300 border-neutral-600/50 hover:border-amber-400/50")
            }
          >
            CUE
          </button>
          <button
            onClick={() => setPlaying((p) => !p)}
            className={
              "col-span-2 rounded-lg border px-2 py-1.5 text-[12px] font-bold tracking-wide transition-all duration-200 ease-out active:scale-[0.97] " +
              (playing
                ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-[0_0_16px_-2px] shadow-amber-500/60"
                : "bg-neutral-800 text-neutral-200 border-neutral-600/50 hover:bg-amber-400 hover:text-neutral-950 hover:shadow-[0_0_14px_-2px] hover:shadow-amber-500/50")
            }
          >
            {playing ? "❚❚  PAUSE" : "▶  PLAY"}
          </button>
          <button
            onClick={() => setSynced((s) => !s)}
            className={
              "rounded-lg border px-2 py-1.5 text-[11px] font-semibold tracking-wide transition-all duration-200 ease-out active:scale-[0.97] " +
              (synced
                ? "bg-teal-500 text-neutral-950 border-teal-400 shadow-[0_0_12px_-1px] shadow-teal-500/60 animate-pulse"
                : "bg-neutral-800 text-neutral-300 border-neutral-600/50 hover:border-teal-400/50")
            }
          >
            SYNC
          </button>
        </div>

        {/* Hot cues + Loop + Keylock */}
        <div className="shrink-0 flex items-stretch gap-2">
          {/* Hot cue pads */}
          <div className="flex-1 min-w-0 grid grid-cols-4 gap-1">
            {cueColors.map((c, i) => {
              const on = activeCue === i;
              return (
                <button
                  key={"cue" + i}
                  onClick={() => setActiveCue(i)}
                  className={
                    "rounded-md border h-8 text-[10px] font-bold tabular-nums transition-all duration-150 ease-out active:scale-[0.95] " +
                    (on
                      ? c + " text-neutral-950 border-white/20 shadow-[0_0_12px_-2px] shadow-amber-500/60"
                      : "bg-neutral-800 text-neutral-500 border-amber-400/20 hover:border-amber-400/50 hover:bg-amber-500/15")
                  }
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Keylock */}
          <button
            onClick={() => setKeylock((k) => !k)}
            className={
              "w-14 shrink-0 rounded-md border h-8 text-[9px] font-semibold uppercase tracking-widest transition-all duration-200 " +
              (keylock
                ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-[0_0_10px_-2px] shadow-amber-500/60"
                : "bg-neutral-800 text-neutral-400 border-neutral-600/50 hover:border-amber-400/50")
            }
          >
            Key
            <br />Lock
          </button>
        </div>

        {/* Loop controls */}
        <div className="shrink-0 flex items-stretch gap-1">
          {loopButtons.map((n) => {
            const on = loopActive && loopLen === n;
            return (
              <button
                key={"loop" + n}
                onClick={() => {
                  if (loopActive && loopLen === n) {
                    setLoopActive(false);
                    setLoopLen(null);
                  } else {
                    setLoopActive(true);
                    setLoopLen(n);
                  }
                }}
                className={
                  "flex-1 min-w-0 rounded-md border h-7 text-[10px] font-semibold tabular-nums transition-all duration-150 ease-out active:scale-[0.95] " +
                  (on
                    ? "bg-teal-500 text-neutral-950 border-teal-400 shadow-[0_0_10px_-2px] shadow-teal-500/60"
                    : "bg-neutral-800 text-neutral-400 border-teal-400/20 hover:border-teal-400/50 hover:bg-teal-500/15")
                }
              >
                {n} <span className="text-[8px] opacity-70">BT</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / status */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="truncate">{keylock ? "KEYLOCK ON" : "KEYLOCK OFF"} · {loopActive ? loopLen + "-BEAT LOOP" : "NO LOOP"}</span>
        <span className={"font-mono tabular-nums " + (synced ? "text-teal-300" : "text-amber-300/80")}>
          {synced ? "SYNC ● " : ""}{bpm.toFixed(1)}
        </span>
      </div>
    </div>
  );
}