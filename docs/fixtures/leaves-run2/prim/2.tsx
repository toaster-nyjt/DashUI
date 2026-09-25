export default function GeneratedComponent() {
  // ---- Track / deck state ---------------------------------------------------
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0); // -8 .. +8 percent
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopIdx, setLoopIdx] = useState(2); // index into loopLengths
  const [loopActive, setLoopActive] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [jogAngle, setJogAngle] = useState(0);
  const [playhead, setPlayhead] = useState(0.32);

  const baseBpm = 126.0;
  const loopLengths = ["1/8", "1/4", "1/2", "1", "2", "4"];

  // ---- Waveform sample data (generated once) --------------------------------
  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const env =
        0.35 +
        0.5 * Math.abs(Math.sin(t * Math.PI * 3.1)) +
        0.15 * Math.sin(t * 40) +
        0.1 * Math.sin(t * 123.7);
      const kick = i % 16 < 2 ? 0.35 : 0;
      arr.push(Math.min(1, Math.max(0.05, env + kick)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let b = 0; b <= 32; b++) g.push(b / 32);
    return g;
  }, []);

  // ---- Derived readouts -----------------------------------------------------
  const effBpm = baseBpm * (1 + pitch / 100);
  const pitchLabel = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";

  const totalSec = 214;
  const elapsed = playhead * totalSec;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  // ---- Playback loop --------------------------------------------------------
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const rate = (effBpm / totalSec) * 0.0075; // gentle sweep
      setPlayhead((p) => {
        let np = p + rate * dt * 8;
        if (np >= 1) np -= 1;
        return np;
      });
      setJogAngle((a) => a + dt * (effBpm / 60) * Math.PI * 2 * 0.6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, effBpm]);

  // ---- Handlers -------------------------------------------------------------
  const cueReturn = () => {
    setPlayhead(activeCue !== null ? [0.08, 0.28, 0.52, 0.74][activeCue] : 0);
  };
  const hitCue = (i: number) => {
    setActiveCue(i);
    setPlayhead([0.08, 0.28, 0.52, 0.74][i]);
  };
  const halveLoop = () => setLoopIdx((i) => Math.max(0, i - 1));
  const doubleLoop = () => setLoopIdx((i) => Math.min(loopLengths.length - 1, i + 1));

  const cueColors = ["#f59e0b", "#2dd4bf", "#fb7185", "#a78bfa"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm text-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-teal-400/40 bg-teal-500/15 text-[9px] font-bold text-teal-300">
            B
          </span>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-teal-300/90">
            Deck B
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-colors duration-200 " +
              (isPlaying ? "bg-teal-400 shadow-[0_0_8px_1px] shadow-teal-500/70" : "bg-neutral-700")
            }
          />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
            CH 2
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-2.5 flex flex-col gap-2">
        {/* Track info + BPM readouts */}
        <div className="flex items-stretch gap-2 shrink-0">
          <div className="flex-1 min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2.5 py-1.5 flex flex-col justify-center">
            <Readout>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[12px] font-semibold text-neutral-100">
                  Midnight Drift
                </div>
                <div className="truncate text-[10px] text-neutral-500">Kavari · Neon Cycles</div>
              </div>
            </Readout>
          </div>
          <div className="w-[104px] rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2 py-1 flex flex-col items-center justify-center">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-teal-300">
                  {effBpm.toFixed(1)}
                </span>
                <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-widest text-neutral-500">
                  BPM
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="h-14 shrink-0 rounded-lg overflow-hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Jog + Pitch fader */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog wheel */}
          <div className="flex-1 min-w-0 min-h-0 rounded-xl bg-neutral-950/60 border border-neutral-700/50 p-1.5 flex flex-col">
            <div className="flex items-center justify-between px-0.5 pb-1 shrink-0">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
                Jog
              </span>
              <span className="font-mono text-[10px] tabular-nums text-teal-300/80">
                {fmt(elapsed)}
              </span>
            </div>
            <div className="flex-1 min-h-0 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative aspect-square h-full max-w-full">
                  <JogWheel value={jogAngle} onScrub={(d) => setJogAngle((a) => a + d)} />
                </div>
              </div>
            </div>
          </div>

          {/* Pitch fader */}
          <div className="w-[62px] shrink-0 rounded-xl bg-neutral-950/60 border border-neutral-700/50 p-1.5 flex flex-col items-center">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 shrink-0">
              Pitch
            </span>
            <div className="flex-1 min-h-0 w-full py-1 flex justify-center">
              <div className="h-full w-8">
                <Fader
                  min={-8}
                  max={8}
                  value={pitch}
                  onChange={(v) => setPitch(v)}
                  orientation="vertical"
                />
              </div>
            </div>
            <span className="font-mono text-[10px] font-bold tabular-nums text-teal-300 shrink-0">
              {pitchLabel}
            </span>
          </div>
        </div>

        {/* Transport row: Cue / Play / Sync */}
        <div className="shrink-0 grid grid-cols-3 gap-2 h-11">
          <div className="min-w-0">
            <Button onPress={cueReturn}>
              <span className="text-[10px] font-bold uppercase tracking-widest">Cue</span>
            </Button>
          </div>
          <div className="min-w-0">
            <ToggleButton on={isPlaying} onChange={(v) => setIsPlaying(v)}>
              <span className="flex items-center justify-center gap-1.5">
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="text-[13px]" fill="currentColor">
                  {isPlaying ? (
                    <>
                      <rect x="3" y="2.5" width="4" height="11" rx="0.8" />
                      <rect x="9" y="2.5" width="4" height="11" rx="0.8" />
                    </>
                  ) : (
                    <path d="M4 2.5v11l9-5.5z" />
                  )}
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {isPlaying ? "Play" : "Pause"}
                </span>
              </span>
            </ToggleButton>
          </div>
          <div className="min-w-0">
            <ToggleButton on={sync} onChange={(v) => setSync(v)}>
              <span className="text-[10px] font-bold uppercase tracking-widest">Sync</span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5 h-10">
          {[0, 1, 2, 3].map((i) => (
            <div key={"cue-" + i} className="min-w-0 relative">
              <Pad onPress={() => hitCue(i)} active={activeCue === i}>
                <span className="flex flex-col items-center leading-none">
                  <span
                    className="h-1.5 w-1.5 rounded-full mb-0.5"
                    style={{ backgroundColor: cueColors[i] }}
                  />
                  <span className="text-[10px] font-bold tabular-nums">{i + 1}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls + keylock */}
        <div className="shrink-0 flex items-stretch gap-2 h-10">
          <div className="min-w-0 w-9">
            <Button onPress={halveLoop}>
              <span className="text-[13px] font-bold leading-none">÷2</span>
            </Button>
          </div>

          <div className="flex-1 min-w-0 flex flex-col rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 items-center justify-center px-1">
            <Readout>
              <div className="flex items-center justify-center gap-2 leading-none">
                <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500">
                  Loop
                </span>
                <span className="font-mono text-base font-bold tabular-nums text-teal-300">
                  {loopLengths[loopIdx]}
                </span>
                <span
                  className={
                    "h-1.5 w-1.5 rounded-full transition-colors duration-150 " +
                    (loopActive
                      ? "bg-teal-400 shadow-[0_0_8px_1px] shadow-teal-500/70 animate-pulse"
                      : "bg-neutral-700")
                  }
                />
              </div>
            </Readout>
          </div>

          <div className="min-w-0 w-9">
            <Button onPress={doubleLoop}>
              <span className="text-[13px] font-bold leading-none">×2</span>
            </Button>
          </div>

          <div className="min-w-0 w-[74px]">
            <ToggleButton on={loopActive} onChange={(v) => setLoopActive(v)}>
              <span className="text-[9px] font-bold uppercase tracking-widest">
                {loopActive ? "On" : "Loop"}
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono tabular-nums text-neutral-400 truncate">
            {fmt(elapsed)} / {fmt(totalSec)}
          </span>
          <span className={sync ? "text-teal-300 font-semibold" : "text-neutral-600"}>
            {sync ? "SYNC ON" : "SYNC OFF"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink">
          <span className="uppercase tracking-widest">Key</span>
          <div className="w-[52px] h-5">
            <ToggleButton on={keylock} onChange={(v) => setKeylock(v)}>
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {keylock ? "Lock" : "Off"}
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}