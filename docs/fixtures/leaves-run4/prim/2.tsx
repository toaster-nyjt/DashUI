export default function GeneratedComponent() {
  const BASE_BPM = 128.0;
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [playhead, setPlayhead] = useState(0.22);
  const [jogAngle, setJogAngle] = useState(0);
  const [activeCue, setActiveCue] = useState(1);
  const [loopLen, setLoopLen] = useState(4); // beats
  const [loopOn, setLoopOn] = useState(false);
  const scratchRef = useRef(false);

  // Synthesized waveform data for Deck B lane
  const waveData = useMemo(() => {
    const N = 220;
    const arr = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const env =
        0.32 +
        0.5 * Math.abs(Math.sin(t * Math.PI * 3.1)) +
        0.28 * Math.abs(Math.sin(t * Math.PI * 11.7)) +
        0.18 * Math.abs(Math.sin(t * Math.PI * 29.3));
      const kick = i % 14 < 2 ? 0.9 : 0;
      arr.push(Math.min(1, 0.15 + env * 0.6 + kick * 0.35));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g = [];
    for (let b = 0; b <= 32; b++) g.push(b / 32);
    return g;
  }, []);

  const effectiveBpm = BASE_BPM * (1 + pitch / 100);

  // Playback advance loop (state-driven, never scrolls page)
  useEffect(() => {
    if (!playing) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!scratchRef.current) {
        setPlayhead((p) => {
          const speed = (effectiveBpm / 60) * 0.0025; // normalized advance
          let np = p + speed * dt * 60;
          if (loopOn) {
            const loopSpan = loopLen / 128;
            const loopStart = 0.22;
            if (np > loopStart + loopSpan) np = loopStart;
          }
          if (np >= 1) np = 0;
          return np;
        });
        setJogAngle((a) => a + (effectiveBpm / 60) * dt * 2 * Math.PI * 0.45);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, effectiveBpm, loopOn, loopLen]);

  const handleScrub = useCallback((delta) => {
    scratchRef.current = true;
    setJogAngle((a) => a + delta);
    setPlayhead((p) => Math.max(0, Math.min(1, p + delta * 0.03)));
    window.clearTimeout((handleScrub)._t);
    (handleScrub)._t = window.setTimeout(() => {
      scratchRef.current = false;
    }, 120);
  }, []);

  const handleWaveScrub = useCallback((pos) => {
    setPlayhead(Math.max(0, Math.min(1, pos)));
  }, []);

  const cueTo = useCallback((idx) => {
    setActiveCue(idx);
    const positions = [0.02, 0.22, 0.41, 0.58, 0.73, 0.88];
    setPlayhead(positions[idx] ?? 0.22);
  }, []);

  const loopSizes = [1, 2, 4, 8, 16];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-violet-500/20 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-violet-300 text-[11px] leading-none">◇</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-violet-300/80 leading-none">
          CH 2
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM row */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 min-w-0 rounded-lg border border-stone-700/60 bg-stone-950/80 px-2 py-1 flex flex-col justify-center">
            <Readout>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-[12px] text-stone-100 truncate leading-tight">
                  Midnight Transit
                </span>
                <span className="font-normal tracking-wide text-[11px] text-stone-500 truncate leading-none mt-0.5">
                  Kaveh Vantera
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-24 shrink-0 rounded-lg border border-violet-500/40 bg-black/70 px-2 py-1 flex flex-col items-center justify-center">
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
              BPM
            </span>
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight leading-none text-lg " +
                  (synced ? "text-lime-300" : "text-violet-300")
                }
              >
                {effectiveBpm.toFixed(1)}
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 h-14 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden shadow-inner shadow-black/60">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.6}
            onScrub={handleWaveScrub}
          />
        </div>

        {/* Main control area: jog + right column */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="relative aspect-square h-full max-h-full">
                <div
                  className={
                    "absolute inset-0 rounded-full border-2 border-stone-700/80 bg-black/70 shadow-lg shadow-black/50 transition-all duration-200 " +
                    (playing ? "ring-1 ring-inset ring-violet-500/40" : "")
                  }
                />
                <JogWheel value={jogAngle} onScrub={handleScrub} />
              </div>
            </div>
            {/* Transport buttons */}
            <div className="shrink-0 flex items-stretch gap-2 h-9">
              <div className="flex-1 min-w-0">
                <Button onPress={() => cueTo(activeCue)}>
                  <span className="font-semibold uppercase tracking-wider text-red-400">
                    Cue
                  </span>
                </Button>
              </div>
              <div className="flex-[1.4] min-w-0">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="font-semibold uppercase tracking-wider">
                    {playing ? "❚❚ Pause" : "► Play"}
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1 min-w-0">
                <ToggleButton on={synced} onChange={setSynced}>
                  <span
                    className={
                      "font-semibold uppercase tracking-wider " +
                      (synced ? "text-lime-300 animate-pulse" : "")
                    }
                  >
                    Sync
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="w-14 shrink-0 flex flex-col items-center gap-1 rounded-xl border border-stone-800/70 bg-stone-950/80 py-2">
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-400 leading-none">
              Pitch
            </span>
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={setPitch}
                orientation="vertical"
              />
            </div>
            <span className="font-mono font-bold text-[11px] leading-none text-violet-300 tracking-tight">
              {(pitch > 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
            <div className="w-full px-1">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span
                  className={
                    "font-semibold uppercase tracking-wider text-[9px] " +
                    (keylock ? "text-violet-200" : "")
                  }
                >
                  Key
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5 h-9">
          {[0, 1, 2, 3].map((i) => (
            <Pad key={"cue-" + i} active={activeCue === i} onPress={() => cueTo(i)}>
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {"CUE " + (i + 1)}
              </span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="shrink-0 flex items-stretch gap-1.5 h-9">
          <div className="w-24 shrink-0">
            <ToggleButton on={loopOn} onChange={setLoopOn}>
              <span
                className={
                  "font-semibold uppercase tracking-wider text-[10px] " +
                  (loopOn ? "text-lime-300 animate-pulse" : "")
                }
              >
                Loop
              </span>
            </ToggleButton>
          </div>
          <div className="flex-1 min-w-0 flex items-center justify-center rounded-md border border-amber-400/30 bg-stone-950/80 px-2">
            <Readout>
              <span className="font-mono font-bold tracking-tight text-amber-400 text-sm leading-none">
                {loopLen + " BEAT"}
              </span>
            </Readout>
          </div>
          <div className="flex items-stretch gap-1">
            <Button
              onPress={() =>
                setLoopLen((l) => {
                  const idx = loopSizes.indexOf(l);
                  return loopSizes[Math.max(0, idx - 1)];
                })
              }
            >
              <span className="font-semibold text-sm">½</span>
            </Button>
            <Button
              onPress={() =>
                setLoopLen((l) => {
                  const idx = loopSizes.indexOf(l);
                  return loopSizes[Math.min(loopSizes.length - 1, idx + 1)];
                })
              }
            >
              <span className="font-semibold text-sm">×2</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}