export default function GeneratedComponent() {
  const WAVE_LEN = 220;
  const waveData = useMemo(() => {
    const arr: number[] = [];
    let seed = 7.13;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < WAVE_LEN; i++) {
      const beat = Math.pow(Math.abs(Math.sin(i * 0.19)), 3.2);
      const env = 0.35 + 0.45 * Math.sin(i * 0.012) + 0.2 * Math.sin(i * 0.07);
      const noise = rnd() * 0.5;
      arr.push(Math.min(1, Math.max(0.04, env * (0.5 + noise) + beat * 0.55)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 33; i++) g.push(i / 32);
    return g;
  }, []);

  const BPM = 126.0;
  const TRACK_TITLE = "Midnight Voltage";
  const TRACK_ARTIST = "Kaelo Ryn";
  const TRACK_KEY = "8A";

  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [jogAngle, setJogAngle] = useState(0);
  const [playhead, setPlayhead] = useState(0.18);
  const [loopLen, setLoopLen] = useState(4); // beats
  const [loopActive, setLoopActive] = useState(false);
  const [cues, setCues] = useState<Record<number, number>>({ 1: 0.12, 3: 0.46 });

  const loopSteps = [0.25, 0.5, 1, 2, 4, 8, 16];

  // Playback simulation via state (no scrolling, no focus)
  useEffect(() => {
    if (!playing) return;
    const rate = (1 + pitch / 100) * 0.00042 * (126 / 100);
    const id = setInterval(() => {
      setPlayhead((p) => {
        let next = p + rate;
        if (loopActive) {
          const span = (loopLen / 32) * 1.0;
          const start = Math.floor(p / span) * span;
          if (next >= start + span) next = start;
        }
        if (next >= 1) next = 0;
        return next;
      });
      setJogAngle((a) => a + rate * Math.PI * 2 * 34);
    }, 40);
    return () => clearInterval(id);
  }, [playing, pitch, loopActive, loopLen]);

  const effectiveBpm = (BPM * (1 + pitch / 100)).toFixed(1);

  const handleJog = useCallback((delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => {
      let next = p + delta * 0.02;
      if (next < 0) next = 0;
      if (next > 1) next = 1;
      return next;
    });
  }, []);

  const handleCue = useCallback(() => {
    setPlayhead(cues[1] ?? 0);
    setPlaying(false);
  }, [cues]);

  const setHotCue = useCallback(
    (i: number) => {
      setCues((prev) => {
        if (prev[i] !== undefined) {
          setPlayhead(prev[i]);
          return prev;
        }
        return { ...prev, [i]: playhead };
      });
    },
    [playhead]
  );

  const stepLoop = useCallback((dir: number) => {
    setLoopLen((l) => {
      const idx = loopSteps.indexOf(l);
      const ni = Math.min(loopSteps.length - 1, Math.max(0, idx + dir));
      return loopSteps[ni];
    });
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 text-[11px] leading-none">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck A
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (playing
                ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse"
                : "bg-stone-700")
            }
          />
          <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
            CH 1
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Track info + BPM row */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 h-[3.25rem]">
            <Readout>
              <div className="flex flex-col justify-center min-w-0 px-1 text-left">
                <span className="font-semibold tracking-tight text-stone-100 leading-tight">
                  {TRACK_TITLE}
                </span>
                <span className="text-[0.72em] font-normal tracking-wide text-stone-500 leading-none mt-0.5">
                  {TRACK_ARTIST} · {TRACK_KEY}
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-[6.5rem] h-[3.25rem]">
            <Readout>
              <div className="flex flex-col items-center justify-center">
                <span
                  className={
                    "font-mono font-bold tracking-tight leading-none " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {effectiveBpm}
                </span>
                <span className="text-[0.5em] font-medium uppercase tracking-widest text-stone-500 leading-none mt-1">
                  BPM
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="flex-none h-[3.5rem]">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Jog + pitch fader */}
        <div className="flex-none flex items-stretch gap-3">
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-[7.5rem] h-[7.5rem] max-w-full">
              <JogWheel value={jogAngle} onScrub={handleJog} />
            </div>
          </div>

          <div className="flex-none flex flex-col items-center gap-1">
            <div className="h-[7rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={setPitch}
                orientation="vertical"
              />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-amber-400 leading-none">
              {pitch > 0 ? "+" : ""}
              {pitch.toFixed(1)}
            </span>
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
              Pitch
            </span>
          </div>
        </div>

        {/* Transport row */}
        <div className="flex-none grid grid-cols-4 gap-2">
          <div className="h-[2.5rem]">
            <Button onPress={handleCue}>
              <span className="font-semibold uppercase tracking-wider text-[0.7em]">
                Cue
              </span>
            </Button>
          </div>
          <div className="h-[2.5rem]">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="font-semibold uppercase tracking-wider text-[0.7em]">
                {playing ? "❚❚" : "▶"}
              </span>
            </ToggleButton>
          </div>
          <div className="h-[2.5rem]">
            <ToggleButton on={synced} onChange={setSynced}>
              <span className="font-semibold uppercase tracking-wider text-[0.62em]">
                Sync
              </span>
            </ToggleButton>
          </div>
          <div className="h-[2.5rem]">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider text-[0.56em]">
                Key
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Loop controls */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="w-[2.5rem] h-[2.5rem]">
            <Button onPress={() => stepLoop(-1)}>
              <span className="font-semibold text-[0.85em]">½</span>
            </Button>
          </div>
          <div className="flex-1 h-[2.5rem]">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="font-semibold uppercase tracking-wider text-[0.6em]">
                Loop {loopLen}
              </span>
            </ToggleButton>
          </div>
          <div className="w-[2.5rem] h-[2.5rem]">
            <Button onPress={() => stepLoop(1)}>
              <span className="font-semibold text-[0.85em]">×2</span>
            </Button>
          </div>
          <div className="w-[4.5rem] h-[2.5rem]">
            <Readout>
              <div className="flex flex-col items-center justify-center">
                <span
                  className={
                    "font-mono font-bold tracking-tight leading-none " +
                    (loopActive ? "text-lime-300" : "text-stone-400")
                  }
                >
                  {loopLen}
                </span>
                <span className="text-[0.5em] font-medium uppercase tracking-widest text-stone-500 leading-none mt-0.5">
                  beats
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={"cue-" + i} className="h-[2.5rem]">
                <Pad active={cues[i] !== undefined} onPress={() => setHotCue(i)}>
                  <span className="font-semibold uppercase tracking-wider text-[0.62em]">
                    {i}
                  </span>
                </Pad>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
          Pos
        </span>
        <span className="font-mono text-[10px] text-lime-300 tabular-nums">
          {(playhead * 100).toFixed(0)}%
        </span>
        <span className="ml-auto font-medium uppercase tracking-widest text-[10px] text-stone-500">
          {keylock ? (
            <span className="text-violet-300">Keylock On</span>
          ) : (
            "Keylock Off"
          )}
        </span>
      </div>
    </div>
  );
}