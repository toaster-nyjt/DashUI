export default function GeneratedComponent() {
  // ---- Deck B state (violet identity) ----
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);

  const [pitch, setPitch] = useState(0); // -8..+8 %
  const baseBpm = 126.0;
  const bpm = useMemo(() => baseBpm * (1 + pitch / 100), [pitch]);

  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);

  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [loopLen, setLoopLen] = useState(4); // beats
  const loopOptions = [1, 2, 4, 8, 16];
  const [looping, setLooping] = useState(false);

  // ---- Sample waveform data ----
  const wave = useMemo(() => {
    const n = 160;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.sin(i * 0.5) * 0.5 + 0.5;
      const swell = Math.sin(i * 0.06) * 0.35 + 0.55;
      const grit = (Math.sin(i * 3.1) + Math.sin(i * 7.7)) * 0.12;
      arr.push(Math.max(0.04, Math.min(1, beat * 0.4 + swell + grit)));
    }
    return arr;
  }, []);
  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let b = 0; b <= 16; b++) g.push(b / 16);
    return g;
  }, []);

  // ---- Playback loop (state-driven, never scrolls) ----
  useEffect(() => {
    if (!playing) return;
    const speed = (bpm / 126) * 0.0009;
    const id = setInterval(() => {
      setPlayhead((p) => (p + speed) % 1);
      setJogAngle((a) => a + speed * Math.PI * 12);
    }, 40);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const handleSync = (on: boolean) => {
    setSynced(on);
    if (on) setPitch(2.4); // snap toward Deck A tempo
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header chrome */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-violet-400 text-[11px]">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <span
          className={
            "font-mono font-bold tracking-tight text-[11px] transition-all duration-200 " +
            (synced ? "text-lime-300 animate-pulse" : "text-violet-300")
          }
        >
          {synced ? "SYNC" : "CH2"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* Track + BPM readouts */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1">
            <Readout>
              <div className="flex flex-col items-start justify-center min-w-0 px-1">
                <span className="font-semibold tracking-tight text-[0.95em] text-stone-100 text-left">
                  Midnight Circuits
                </span>
                <span className="text-[0.72em] uppercase tracking-widest text-stone-500 text-left">
                  Vela Nyx
                </span>
              </div>
            </Readout>
          </div>
          <div className="flex-none w-[6.5rem]">
            <Readout>
              <div className="flex flex-col items-center justify-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight text-[1.35em] " +
                    (synced ? "text-lime-300" : "text-violet-300")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">
                  BPM
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="flex-none h-[3.25rem]">
          <Waveform
            data={wave}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.6}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Main deck row: jog + right controls */}
        <div className="flex-1 flex gap-2">
          {/* Jog wheel */}
          <div className="flex-none flex items-center justify-center">
            <div className="w-[8.5rem] h-[8.5rem]">
              <JogWheel
                value={jogAngle}
                onScrub={(d) => {
                  setJogAngle((a) => a + d);
                  setPlayhead((p) => {
                    const np = p + d / (Math.PI * 2) * 0.04;
                    return ((np % 1) + 1) % 1;
                  });
                }}
              />
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Transport row: cue / play / pitch fader */}
            <div className="flex-1 flex gap-2">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1">
                  <Button onPress={() => setPlayhead(0)}>
                    <span className="font-semibold uppercase tracking-wider text-[0.9em]">
                      Cue
                    </span>
                  </Button>
                </div>
                <div className="flex-1">
                  <ToggleButton on={playing} onChange={setPlaying}>
                    <span className="font-semibold uppercase tracking-wider text-[0.9em]">
                      {playing ? "❚❚" : "▶"}
                    </span>
                  </ToggleButton>
                </div>
              </div>

              {/* Pitch fader */}
              <div className="flex-none w-[2.75rem] flex flex-col items-center">
                <div className="flex-1 flex items-center">
                  <div className="h-full w-[1.6rem] flex items-center justify-center">
                    <div className="h-full max-h-[7rem]">
                      <Fader
                        min={-8}
                        max={8}
                        value={pitch}
                        onChange={(v) => {
                          setPitch(v);
                          if (synced) setSynced(false);
                        }}
                        orientation="vertical"
                      />
                    </div>
                  </div>
                </div>
                <span className="flex-none mt-1 font-mono font-bold tracking-tight text-[10px] text-violet-300">
                  {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
                </span>
                <span className="flex-none font-medium uppercase tracking-widest text-[9px] text-stone-500">
                  Pitch
                </span>
              </div>
            </div>

            {/* Sync + Keylock */}
            <div className="flex-none h-[2rem] flex gap-2">
              <div className="flex-1">
                <ToggleButton on={synced} onChange={handleSync}>
                  <span className="font-semibold uppercase tracking-wider text-[0.85em]">
                    Sync
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-semibold uppercase tracking-wider text-[0.85em]">
                    Key
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none grid grid-cols-4 gap-2 h-[2.5rem]">
          {[0, 1, 2, 3].map((i) => (
            <Pad
              key={"cue-" + i}
              active={activeCue === i}
              onPress={() => setActiveCue(i === activeCue ? null : i)}
            >
              <span className="font-semibold uppercase tracking-wider text-[0.85em]">
                {i + 1}
              </span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none h-[2.25rem] flex items-stretch gap-2">
          <div className="flex-none w-[2.75rem]">
            <Button
              onPress={() =>
                setLoopLen((l) => {
                  const idx = loopOptions.indexOf(l);
                  return loopOptions[Math.max(0, idx - 1)];
                })
              }
            >
              <span className="font-semibold text-[1em]">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <div className="flex items-center justify-center gap-1 leading-none">
                <span className="font-mono font-bold tracking-tight text-[1.1em] text-violet-300">
                  {loopLen}
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">
                  beat
                </span>
              </div>
            </Readout>
          </div>
          <div className="flex-none w-[2.75rem]">
            <Button
              onPress={() =>
                setLoopLen((l) => {
                  const idx = loopOptions.indexOf(l);
                  return loopOptions[Math.min(loopOptions.length - 1, idx + 1)];
                })
              }
            >
              <span className="font-semibold text-[1em]">×2</span>
            </Button>
          </div>
          <div className="flex-none w-[3.5rem]">
            <ToggleButton on={looping} onChange={setLooping}>
              <span className="font-semibold uppercase tracking-wider text-[0.75em]">
                Loop
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {keylock ? "Keylock On" : "Master Tempo"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-lime-300 font-mono">
          {(playhead * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}