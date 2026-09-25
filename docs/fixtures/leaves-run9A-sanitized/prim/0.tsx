export default function GeneratedComponent() {
  const trackDuration = 218; // seconds
  const trackBpm = 128;

  const [waveData] = useState<number[]>(() => {
    const n = 260;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.pow(Math.abs(Math.sin(i * 0.19)), 0.6);
      const swell = 0.35 + 0.65 * Math.pow(Math.abs(Math.sin(i * 0.012)), 1.4);
      const noise = 0.12 * Math.abs(Math.sin(i * 1.7 + Math.cos(i * 0.5)));
      arr.push(Math.min(1, beat * swell + noise));
    }
    return arr;
  });

  const beatGrid = useMemo(() => {
    const grid: number[] = [];
    for (let i = 0; i < 33; i++) grid.push(i / 32);
    return grid;
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.0); // 0..1
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [jogAngle, setJogAngle] = useState(0);

  const [cues, setCues] = useState<(number | null)[]>([0.02, 0.24, null, null]);
  const [activeCue, setActiveCue] = useState<number | null>(null);

  const loopLengths = [0.25, 0.5, 1, 2, 4, 8];
  const [loopIdx, setLoopIdx] = useState(2);
  const [loopActive, setLoopActive] = useState(false);

  // playback engine
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const rate = 1 + pitch / 100;
      setPlayhead((p) => {
        let next = p + (dt / trackDuration) * rate;
        if (next >= 1) next -= 1;
        return next;
      });
      setJogAngle((a) => a + dt * rate * 3.2);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, pitch]);

  const effectiveBpm = (trackBpm * (1 + pitch / 100)).toFixed(1);

  const curTime = playhead * trackDuration;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const handleJog = (delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => {
      let next = p + delta / (Math.PI * 2) / 64;
      if (next < 0) next += 1;
      if (next >= 1) next -= 1;
      return next;
    });
  };

  const handleCue = (i: number) => {
    setCues((prev) => {
      const copy = [...prev];
      if (copy[i] == null) {
        copy[i] = playhead;
      } else {
        setPlayhead(copy[i] as number);
        setActiveCue(i);
        setTimeout(() => setActiveCue((c) => (c === i ? null : c)), 180);
      }
      return copy;
    });
  };

  const handleSync = (on: boolean) => {
    setSynced(on);
    if (on) setPitch(0);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[11px]">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck A
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (isPlaying ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-stone-700")
            }
          />
          <span className="text-[10px] uppercase tracking-widest text-stone-500">CH 1</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 overflow-clip">
        {/* Track info + BPM readouts */}
        <div className="flex-none flex gap-2">
          <div className="flex-1">
            <Readout>
              <div className="flex flex-col items-start leading-none min-w-0">
                <span className="font-semibold uppercase tracking-wider text-[0.85em] text-stone-100">
                  Midnight Circuit
                </span>
                <span className="text-[0.68em] tracking-wide text-stone-500 mt-0.5">
                  Aurora Kane
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-[6.5rem] flex-none">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {effectiveBpm}
                </span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500 mt-0.5">
                  BPM
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="flex-none">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.45}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Main control row: jog wheel + fader + right column */}
        <div className="flex-1 flex gap-2">
          {/* Jog wheel with time readout below */}
          <div className="flex flex-col items-center justify-center gap-1 flex-none">
            <div className="w-[7.5rem] h-[7.5rem] flex-none">
              <JogWheel value={jogAngle} onScrub={handleJog} />
            </div>
            <div className="font-mono font-bold tracking-tight text-stone-100 text-[0.85em] leading-none">
              {fmt(curTime)}
            </div>
          </div>

          {/* Pitch fader */}
          <div className="flex flex-col items-center justify-between flex-none py-0.5">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
              Pitch
            </span>
            <div className="flex-1 flex items-center py-1">
              <div className="w-[1.6rem] h-full min-h-[6rem]">
                <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
              </div>
            </div>
            <span
              className={
                "font-mono font-bold text-[10px] leading-none " +
                (pitch === 0 ? "text-stone-400" : pitch > 0 ? "text-amber-400" : "text-violet-300")
              }
            >
              {(pitch > 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>

          {/* Right column: transport + toggles */}
          <div className="flex-1 flex flex-col gap-1.5">
            {/* Play / Cue */}
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              <ToggleButton on={isPlaying} onChange={setIsPlaying}>
                <span className="flex items-center gap-1">
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    {isPlaying ? (
                      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                    ) : (
                      <path d="M7 5v14l12-7z" />
                    )}
                  </svg>
                  <span className="text-[0.7em]">{isPlaying ? "PAUSE" : "PLAY"}</span>
                </span>
              </ToggleButton>
              <Button onPress={() => setPlayhead(cues[0] ?? 0)}>
                <span className="text-[0.72em]">CUE</span>
              </Button>
            </div>

            {/* Sync / Keylock */}
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              <ToggleButton on={synced} onChange={handleSync}>
                <span className="text-[0.72em]">SYNC</span>
              </ToggleButton>
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[0.62em]">KEY</span>
                  <span className="text-[0.62em]">LOCK</span>
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none">
          <div className="grid grid-cols-4 gap-1.5">
            {cues.map((c, i) => (
              <div key={"cue-" + i} className="h-[2.5rem]">
                <Pad onPress={() => handleCue(i)} active={c != null || activeCue === i}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[0.7em]">{i + 1}</span>
                    <span className="text-[0.5em] tracking-widest text-stone-400 mt-0.5">
                      {c != null ? "CUE" : "SET"}
                    </span>
                  </span>
                </Pad>
              </div>
            ))}
          </div>
        </div>

        {/* Loop controls */}
        <div className="flex-none flex items-stretch gap-1.5">
          <div className="w-[2.75rem] flex-none">
            <Button onPress={() => setLoopIdx((i) => Math.max(0, i - 1))}>
              <span className="text-[0.9em]">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <div className="flex items-center justify-center gap-1.5 leading-none">
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">Loop</span>
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (loopActive ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {loopLengths[loopIdx] + " "}
                </span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">beat</span>
              </div>
            </Readout>
          </div>
          <div className="w-[2.75rem] flex-none">
            <Button onPress={() => setLoopIdx((i) => Math.min(loopLengths.length - 1, i + 1))}>
              <span className="text-[0.9em]">×2</span>
            </Button>
          </div>
          <div className="w-[3.5rem] flex-none">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="text-[0.66em]">IN/OUT</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {isPlaying ? "PLAYING" : "STOPPED"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 flex items-center gap-2">
          <span className={synced ? "text-lime-300" : "text-stone-600"}>
            {synced ? "SYNC" : "FREE"}
          </span>
          <span className={keylock ? "text-violet-300" : "text-stone-600"}>
            {keylock ? "KEY" : "—"}
          </span>
          <span className="text-lime-300 font-mono">{effectiveBpm}</span>
        </span>
      </div>
    </div>
  );
}