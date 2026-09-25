export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.12);
  const [jogAngle, setJogAngle] = useState(0);
  const [storedCues, setStoredCues] = useState([true, true, false, false]);
  const [cuePos, setCuePos] = useState([0, 0.34, 0, 0]);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);

  const baseBPM = 124;
  const currentBPM = baseBPM * (1 + pitch / 100);

  const waveData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 240; i++) {
      const t = i / 240;
      const env = 0.35 + 0.5 * Math.abs(Math.sin(t * Math.PI * 4));
      const beat = i % 12 < 2 ? 1 : 0.6;
      const noise = 0.55 + 0.45 * Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
      arr.push(Math.min(1, env * beat * noise));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g = [];
    for (let i = 0; i <= 16; i++) g.push(i / 16);
    return g;
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0016 * (currentBPM / 124)) % 1);
      setJogAngle((a) => a + 0.06);
    }, 40);
    return () => clearInterval(id);
  }, [isPlaying, currentBPM]);

  const handleScrub = (delta) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => {
      let n = p + delta * 0.03;
      if (n < 0) n += 1;
      if (n > 1) n -= 1;
      return n;
    });
  };

  const hitCue = (i) => {
    if (storedCues[i]) {
      setPlayhead(cuePos[i]);
    } else {
      setStoredCues((s) => s.map((v, j) => (j === i ? true : v)));
      setCuePos((p) => p.map((v, j) => (j === i ? playhead : v)));
    }
  };

  const toggleSync = (on) => {
    setSynced(on);
    if (on) setPitch(Number(((128 / baseBPM - 1) * 100).toFixed(1)));
  };

  const pitchStr = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";
  const loopLabel = loopBeats >= 1 ? String(loopBeats) : "1/" + Math.round(1 / loopBeats);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header chrome */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 leading-none">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Deck B
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (isPlaying ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-stone-700")
            }
          />
          <span className="text-[10px] uppercase tracking-widest text-stone-500">CH 2</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Track info + BPM */}
        <div className="flex gap-2 h-8 flex-none">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">Nocturne Drive</span>
                <span className="text-[0.72em] font-normal tracking-wide text-stone-400">V. Solaris</span>
              </span>
            </Readout>
          </div>
          <div className="w-[5rem] h-full">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {currentBPM.toFixed(1)}
                </span>
                <span className="text-[0.5em] font-medium uppercase tracking-widest text-stone-500">
                  BPM
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform bed */}
        <div className="w-full h-[2.75rem] flex-none rounded-lg border border-violet-500/20 bg-stone-950/70 p-0.5 overflow-clip">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={1}
            onScrub={setPlayhead}
          />
        </div>

        {/* Middle: jog + transport + pitch */}
        <div className="flex-1 flex gap-2">
          {/* Jog wheel */}
          <div className="h-full aspect-square">
            <JogWheel value={jogAngle} onScrub={handleScrub} />
          </div>

          {/* Transport + toggles */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1">
              <ToggleButton on={isPlaying} onChange={setIsPlaying}>
                <span className="flex flex-col items-center gap-0.5 leading-none">
                  <span className="text-[1.4em]">{isPlaying ? "❚❚" : "►"}</span>
                  <span className="font-semibold uppercase tracking-wider text-[0.72em]">
                    {isPlaying ? "Pause" : "Play"}
                  </span>
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <Button onPress={() => setPlayhead(cuePos[0] || 0)}>
                <span className="flex flex-col items-center gap-0.5 leading-none">
                  <span className="text-[1.3em] text-red-400">◉</span>
                  <span className="font-semibold uppercase tracking-wider text-[0.72em]">Cue</span>
                </span>
              </Button>
            </div>
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <ToggleButton on={synced} onChange={toggleSync}>
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-semibold uppercase tracking-wider">Key</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Pitch / tempo */}
          <div className="w-12 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none">
              Tempo
            </span>
            <div className="flex-1 w-full flex justify-center">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                orientation="vertical"
                onChange={(v) => {
                  setPitch(v);
                  setSynced(false);
                }}
              />
            </div>
            <span
              className={
                "font-mono font-bold text-[11px] leading-none " +
                (synced ? "text-lime-300" : "text-amber-400")
              }
            >
              {pitchStr}
            </span>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex gap-2 h-[2.5rem] flex-none">
          {storedCues.map((set, i) => (
            <div key={"cue-" + i} className="flex-1">
              <Pad active={set} onPress={() => hitCue(i)}>
                <span className="font-semibold uppercase tracking-wider">{i + 1}</span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex gap-2 h-[2.25rem] flex-none">
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold">÷2</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopOn((o) => !o)}>
              <span className="font-semibold uppercase tracking-wider">
                {loopOn ? "Exit" : "Loop"}
              </span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold">×2</span>
            </Button>
          </div>
          <div className="w-[4rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (loopOn ? "text-violet-300" : "text-stone-100")
                  }
                >
                  {loopLabel}
                </span>
                <span className="text-[0.5em] font-medium uppercase tracking-widest text-stone-500">
                  Beat
                </span>
              </span>
            </Readout>
          </div>
        </div>
      </div>
    </div>
  );
}