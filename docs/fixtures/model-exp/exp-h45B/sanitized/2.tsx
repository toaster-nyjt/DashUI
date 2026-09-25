export default function GeneratedComponent() {
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPos, setPlayheadPos] = useState(0);
  const [pitchValue, setPitchValue] = useState(0);
  const [isSynced, setIsSynced] = useState(false);
  const [isKeyLocked, setIsKeyLocked] = useState(false);
  const [jogWheelAngle, setJogWheelAngle] = useState(0);
  const [hotCueActive, setHotCueActive] = useState([false, false, false, false]);
  const [loopActive, setLoopActive] = useState(false);
  const [loopSize] = useState("1 BAR");

  // Sample waveform data
  const waveformData = useMemo(() => {
    return Array.from({ length: 512 }, (_, i) => {
      const t = i / 512;
      return (
        Math.sin(t * Math.PI * 12) * 0.6 +
        Math.sin(t * Math.PI * 5) * 0.3 +
        Math.sin(t * Math.PI * 2) * 0.1 +
        Math.random() * 0.05
      );
    });
  }, []);

  // Beat grid markers
  const beatGrid = useMemo(() => {
    const beats = [];
    for (let i = 0; i <= 1; i += 0.25) {
      beats.push(i);
    }
    return beats;
  }, []);

  // Track metadata
  const trackTitle = "Midnight Circuit";
  const trackArtist = "Synthwave Dreams";
  const currentBPM = 128;

  const handleJogScrub = useCallback((delta) => {
    setJogWheelAngle((prev) => prev + delta);
    if (isPlaying) {
      setPlayheadPos((prev) => Math.max(0, Math.min(1, prev + delta * 0.005)));
    }
  }, [isPlaying]);

  const handleWaveformScrub = useCallback((pos) => {
    setPlayheadPos(pos);
  }, []);

  const handleHotCuePress = useCallback((index) => {
    const newState = [...hotCueActive];
    newState[index] = !newState[index];
    setHotCueActive(newState);
  }, [hotCueActive]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Top Section: Jog Wheel + Track Info */}
      <div className="flex-none flex gap-3 p-2 items-start">
        {/* Jog Wheel */}
        <div className="flex-none w-16 h-16 rounded-full border-2 border-violet-600/80 shadow-inner shadow-black/70 shadow-lg shadow-black/50 overflow-clip bg-black/50 flex items-center justify-center">
          <JogWheel value={jogWheelAngle} onScrub={handleJogScrub} />
        </div>

        {/* Track Info Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Deck Label + Title */}
          <div className="bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-violet-500/20 rounded-lg px-2 py-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[9px] uppercase tracking-widest font-semibold text-violet-400">
                Deck B
              </span>
            </div>
            <div className="text-xs font-semibold text-stone-100 truncate leading-tight">
              {trackTitle}
            </div>
            <div className="text-[10px] text-stone-500 truncate leading-tight">
              {trackArtist}
            </div>
          </div>

          {/* BPM Display */}
          <div className="bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-violet-500/20 rounded-lg px-2 py-1.5 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-widest text-stone-500">
              BPM
            </span>
            <span className="font-mono font-bold text-violet-400 text-sm">
              {currentBPM}
            </span>
          </div>
        </div>
      </div>

      {/* Waveform Strip */}
      <div className="flex-none h-8 mx-2 mb-2 border border-stone-800/70 bg-stone-950/80 rounded-xl overflow-clip shadow-inner shadow-black/50">
        <Waveform
          data={waveformData}
          playhead={playheadPos}
          beatGrid={beatGrid}
          zoom={1}
          onScrub={handleWaveformScrub}
        />
      </div>

      {/* Main Content: Pitch Fader + Hot Cues */}
      <div className="flex-1 flex gap-2 px-2 pb-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Pitch Fader Column */}
        <div className="flex-none flex flex-col items-center gap-1">
          <span className="text-[9px] uppercase tracking-widest font-medium text-stone-400">
            Pitch
          </span>
          <div className="h-24 w-6 flex items-center justify-center bg-stone-950/60 border border-stone-700/60 rounded-full px-0.5">
            <Fader
              min={-12}
              max={12}
              value={pitchValue}
              onChange={setPitchValue}
              orientation="vertical"
            />
          </div>
          <span className="text-[8px] text-stone-500 font-mono">
            {pitchValue > 0 ? "+" : ""}
            {pitchValue.toFixed(1)}
          </span>
        </div>

        {/* Hot Cues Grid (2x2) */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={"hotcue-" + i}
              className="aspect-square flex items-center justify-center"
            >
              <Pad
                active={hotCueActive[i]}
                onPress={() => handleHotCuePress(i)}
              >
                <span className="font-bold">{i + 1}</span>
              </Pad>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex-none flex gap-2 px-2 pb-2 items-center justify-center">
        {/* Cue Button */}
        <div className="w-10 h-7 flex items-center justify-center">
          <Button onPress={() => setPlayheadPos(0)}>
            <span className="font-bold">CUE</span>
          </Button>
        </div>

        {/* Play/Pause Toggle */}
        <div className="w-8 h-7 flex items-center justify-center">
          <ToggleButton on={isPlaying} onChange={setIsPlaying}>
            <span className="">{isPlaying ? "⏸" : "▶"}</span>
          </ToggleButton>
        </div>

        {/* Sync Button */}
        <div className="w-8 h-7 flex items-center justify-center">
          <ToggleButton on={isSynced} onChange={setIsSynced}>
            <span className="font-bold">S</span>
          </ToggleButton>
        </div>

        {/* Keylock Toggle */}
        <div className="w-8 h-7 flex items-center justify-center">
          <ToggleButton on={isKeyLocked} onChange={setIsKeyLocked}>
            <span className="font-bold">🔑</span>
          </ToggleButton>
        </div>

        {/* Loop Button */}
        <div className="w-10 h-7 ml-1 flex items-center justify-center">
          <Button onPress={() => setLoopActive(!loopActive)}>
            <span className="font-bold">LOOP</span>
          </Button>
        </div>

        {/* Loop Size Display */}
        <div className="flex-1 min-w-0 bg-neutral-900/80 border border-stone-800/60 rounded-lg px-2 py-1 text-center">
          <span className="text-[9px] font-mono text-violet-400 font-semibold">
            {loopSize}
          </span>
        </div>
      </div>
    </div>
  );
}