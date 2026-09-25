export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.05);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [jogAngle, setJogAngle] = useState(0);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);
  const [cues, setCues] = useState([
    { pos: 0.05, set: true },
    { pos: 0.31, set: true },
    { pos: 0.62, set: false },
    { pos: 0.0, set: false },
  ]);

  const baseBpm = 126;
  const bpm = baseBpm * (1 + pitch / 100);

  const waveData = useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => {
        const env = 0.35 + 0.45 * Math.abs(Math.sin(i * 0.11));
        const beat = i % 8 < 2 ? 1 : 0.55;
        return Math.min(1, env * beat * (0.6 + 0.4 * Math.abs(Math.sin(i * 0.7))));
      }),
    []
  );
  const beatGrid = useMemo(() => Array.from({ length: 17 }, (_, i) => i / 16), []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0016) % 1);
      setJogAngle((a) => a + 0.06);
    }, 40);
    return () => clearInterval(id);
  }, [playing]);

  const handleCue = (i: number) => {
    setCues((prev) => {
      const c = [...prev];
      if (c[i].set) {
        setPlayhead(c[i].pos);
      } else {
        c[i] = { pos: playhead, set: true };
      }
      return c;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-violet-500/20 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 animate-pulse">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Deck B
          </span>
        </div>
        <span
          className={
            "font-mono font-bold text-[11px] tracking-tight " +
            (sync ? "text-lime-300" : playing ? "text-violet-300" : "text-stone-500")
          }
        >
          {sync ? "SYNC" : playing ? "PLAY" : "CUE"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* Top: track info + BPM */}
        <div className="flex-none flex gap-2 h-11">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col leading-tight items-start">
                <span className="font-semibold tracking-tight text-stone-100">
                  NEON MIRAGE
                </span>
                <span className="text-[0.68em] tracking-wide text-stone-400">
                  ASTRA VOSS
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[6rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.5em] tracking-widest text-stone-500 mt-[0.15em]">
                  BPM
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex-none h-[2.75rem]">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.5}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Middle: jog + transport + pitch */}
        <div className="flex-1 flex items-stretch gap-2">
          {/* Jog */}
          <div className="h-full aspect-square flex items-center justify-center">
            <JogWheel
              value={jogAngle}
              onScrub={(d) => {
                setJogAngle((a) => a + d);
                setPlayhead((p) => Math.max(0, Math.min(1, p + d * 0.02)));
              }}
            />
          </div>

          {/* Transport */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex-1">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">
                  {playing ? "❚❚ Pause" : "▶ Play"}
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <Button onPress={() => setPlayhead(cues[0].set ? cues[0].pos : 0)}>
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </Button>
            </div>
            <div className="flex-1">
              <ToggleButton
                on={sync}
                onChange={(v) => {
                  setSync(v);
                  if (v) setPitch(0);
                }}
              >
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
          </div>

          {/* Pitch */}
          <div className="w-[3.5rem] flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400">
              Pitch
            </span>
            <div className="flex-1 flex items-center justify-center">
              <div className="h-full w-[1.75rem] flex items-center justify-center">
                <Fader
                  min={-8}
                  max={8}
                  value={pitch}
                  onChange={(v) => {
                    setPitch(v);
                    setSync(false);
                  }}
                  orientation="vertical"
                />
              </div>
            </div>
            <span className="font-mono font-bold text-[10px] tracking-tight text-violet-300">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
            <div className="w-full h-[1.7rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none h-[3rem] grid grid-cols-4 gap-1.5">
          {cues.map((c, i) => (
            <Pad key={"cue-" + i} active={c.set} onPress={() => handleCue(i)}>
              <span className="flex flex-col items-center leading-none">
                <span className="font-semibold uppercase tracking-wider">{i + 1}</span>
                <span className="text-[0.5em] tracking-widest text-stone-500 mt-[0.2em]">
                  {c.set ? "CUE" : "SET"}
                </span>
              </span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none h-[2.3rem] flex gap-1.5">
          <div className="w-[3rem]">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="w-[3rem]">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold tracking-wider">2×</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <span className="flex items-center gap-[0.4em] leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (loopOn ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats}
                </span>
                <span className="text-[0.55em] tracking-widest text-stone-500">
                  BEAT
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[4.5rem]">
            <Button onPress={() => setLoopOn((v) => !v)}>
              <span className="font-semibold uppercase tracking-wider">
                {loopOn ? "Exit" : "Loop"}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}