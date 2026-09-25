export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [jogAngle, setJogAngle] = useState(0);
  const [syncOn, setSyncOn] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [cues, setCues] = useState([null, null, null, null]);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);
  const cuePoint = 0;

  const pitchRef = useRef(pitch);
  useEffect(() => { pitchRef.current = pitch; }, [pitch]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      const step = 0.0016 * (1 + pitchRef.current / 100);
      setPlayhead(p => { const n = p + step; return n >= 1 ? n - 1 : n; });
      setJogAngle(a => a + 0.14 * (1 + pitchRef.current / 100));
    }, 40);
    return () => clearInterval(id);
  }, [isPlaying]);

  const waveData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 180; i++) {
      const env = 0.35 + 0.45 * Math.abs(Math.sin(i * 0.045));
      const beat = Math.abs(Math.sin(i * 0.32));
      let v = env * beat + 0.08 * Math.random();
      if (i % 16 === 0) v = Math.min(1, v + 0.25);
      arr.push(Math.max(0.04, Math.min(1, v)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => Array.from({ length: 16 }, (_, i) => i / 16), []);

  const bpm = 128 * (1 + pitch / 100);
  const pitchLabel = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";

  const handleScrub = (d) => {
    setJogAngle(a => a + d);
    setPlayhead(p => Math.max(0, Math.min(1, p + d * 0.03)));
  };
  const handleWaveScrub = (pos) => setPlayhead(Math.max(0, Math.min(1, pos)));
  const handleCue = () => setPlayhead(cuePoint);
  const handleSync = (on) => { setSyncOn(on); if (on) setPitch(0); };
  const handlePad = (i) => {
    if (cues[i] == null) setCues(prev => { const c = [...prev]; c[i] = playhead; return c; });
    else setPlayhead(cues[i]);
  };

  const loopDisplay = loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : String(loopBeats);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-[11px] leading-none">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={"h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " + (isPlaying ? "bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40" : "bg-stone-700")}></span>
          <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">CH 1</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Track info + BPM */}
        <div className="flex-none h-10 flex gap-2">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Protocol</span>
                <span className="text-[0.72em] font-normal tracking-wide text-stone-400">Neon Circuit — 03:47</span>
              </span>
            </Readout>
          </div>
          <div className="w-24">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (syncOn ? "text-lime-300" : "text-amber-400")}>{bpm.toFixed(1)}</span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500 mt-0.5">{syncOn ? "Synced" : "BPM"}</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex-none h-10">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={0.5} onScrub={handleWaveScrub} />
        </div>

        {/* Central control zone */}
        <div className="flex-1 flex gap-2 items-stretch">
          {/* Pitch fader */}
          <div className="flex-none flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">Pitch</span>
            <div className="w-8 flex-1">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span className={"font-mono text-[11px] leading-none " + (syncOn ? "text-lime-300" : "text-amber-400")}>{pitchLabel}</span>
          </div>

          {/* Jog wheel */}
          <div className="flex-1 flex items-center justify-center">
            <div className="h-full aspect-square max-w-full">
              <JogWheel value={jogAngle} onScrub={handleScrub} />
            </div>
          </div>

          {/* Sync + Keylock */}
          <div className="flex-none w-20 flex flex-col gap-2">
            <div className="flex-1">
              <ToggleButton on={syncOn} onChange={handleSync}>
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="flex flex-col items-center leading-none font-semibold uppercase tracking-wider">
                  <span>Key</span>
                  <span>Lock</span>
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Transport */}
        <div className="flex-none h-9 flex gap-2">
          <div className="flex-1">
            <Button onPress={handleCue}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </Button>
          </div>
          <div className="flex-1">
            <ToggleButton on={isPlaying} onChange={setIsPlaying}>
              <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                <span>{isPlaying ? "❚❚" : "▶"}</span>
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none h-10 grid grid-cols-4 gap-2">
          {cues.map((c, i) => (
            <Pad key={"cue-" + i} active={c != null} onPress={() => handlePad(i)}>
              <span className="flex flex-col items-center leading-none font-semibold uppercase tracking-wider">
                <span>{i + 1}</span>
                <span className="text-[0.55em] tracking-widest opacity-70">{c != null ? "Cue" : "Set"}</span>
              </span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none h-9 flex gap-2">
          <div className="flex-1">
            <Button onPress={() => setLoopBeats(b => Math.max(0.25, b / 2))}>
              <span className="font-semibold tracking-wider">÷2</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopOn(o => !o)}>
              <span className="font-semibold uppercase tracking-wider">Loop</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopBeats(b => Math.min(32, b * 2))}>
              <span className="font-semibold tracking-wider">×2</span>
            </Button>
          </div>
          <div className={"w-20 " + (loopOn ? "animate-pulse" : "")}>
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (loopOn ? "text-lime-300" : "text-stone-300")}>{loopDisplay}</span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500 mt-0.5">Beat</span>
              </span>
            </Readout>
          </div>
        </div>

      </div>
    </div>
  );
}