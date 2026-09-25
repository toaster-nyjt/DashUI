export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [jogWheelValue, setJogWheelValue] = useState(0);
  const [pitchValue, setPitchValue] = useState(0);
  const [waveformPlayhead, setWaveformPlayhead] = useState(0.5);
  const [hotCueStates, setHotCueStates] = useState([false, false, false, false]);
  const [isSynced, setIsSynced] = useState(false);
  const [loopLength, setLoopLength] = useState(0);
  const [isKeylock, setIsKeylock] = useState(false);

  const trackTitle = "Midnight Dreams";
  const trackArtist = "Luna Echo";
  const bpm = 128;

  const waveformData = Array.from({ length: 256 }, (_, i) => {
    const x = (i / 256) * Math.PI * 4;
    return Math.sin(x) * (1 - i / 512) * 0.8;
  });

  const handleHotCuePress = (index) => {
    const newStates = [...hotCueStates];
    newStates[index] = !newStates[index];
    setHotCueStates(newStates);
  };

  const handleWaveformScrub = (pos) => {
    setWaveformPlayhead(pos);
    if (isPlaying) {
      setJogWheelValue(pos * Math.PI * 2);
    }
  };

  const handleCuePress = () => {
    setWaveformPlayhead(0);
    setJogWheelValue(0);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header: Track Info */}
      <div className="flex-none h-8 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"text-amber-400 text-lg transition-all duration-200 " + (isPlaying ? "animate-pulse" : "")}>●</span>
          <div className="min-w-0">
            <div className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
              {trackTitle}
            </div>
            <div className="font-normal tracking-wide text-[10px] text-stone-500 truncate">
              {trackArtist}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-clip p-2 gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* Upper Section: Jog Wheel + Pitch + Controls */}
        <div className="flex-none flex gap-3 items-start">
          {/* Jog Wheel - Featured */}
          <div className="w-16 h-16 rounded-full border-2 border-stone-700/80 bg-black/70 shadow-xl shadow-amber-500/20 flex items-center justify-center flex-shrink-0">
            <JogWheel
              value={jogWheelValue}
              onScrub={(delta) => {
                setJogWheelValue((v) => v + delta);
                if (isPlaying) {
                  setWaveformPlayhead((p) => Math.max(0, Math.min(1, p + delta * 0.01)));
                }
              }}
            />
          </div>

          {/* Pitch Fader */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="font-medium uppercase tracking-widest text-[9px] text-stone-400">Pitch</div>
            <div className="h-24">
              <Fader
                min={-12}
                max={12}
                value={pitchValue}
                onChange={setPitchValue}
                orientation="vertical"
              />
            </div>
            <div className={"font-mono font-bold text-[10px] transition-all duration-150 " + (pitchValue !== 0 ? "text-amber-400" : "text-stone-400")}>
              {pitchValue >= 0 ? "+" : ""}{pitchValue.toFixed(1)}
            </div>
          </div>

          {/* Transport & Info Panel */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Transport Buttons */}
            <div className="flex gap-1 items-center">
              <div className="w-12 h-6">
                <ToggleButton on={isPlaying} onChange={setIsPlaying}>
                  <span className="font-semibold uppercase tracking-wider">Play</span>
                </ToggleButton>
              </div>
              <div className="w-12 h-6">
                <Button onPress={handleCuePress}>
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </Button>
              </div>
              <div className="w-12 h-6">
                <ToggleButton on={isSynced} onChange={setIsSynced}>
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                </ToggleButton>
              </div>
            </div>

            {/* BPM + Keylock Row */}
            <div className="flex gap-1 items-center">
              <div className="flex-1 h-5">
                <Readout>
                  <div className="font-mono font-bold text-amber-400">{bpm}</div>
                </Readout>
              </div>
              <div className="w-12 h-6 flex-shrink-0">
                <ToggleButton on={isKeylock} onChange={setIsKeylock}>
                  <span className="">🔐</span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Waveform Display */}
        <div className="flex-none">
          <div className="font-medium uppercase tracking-widest text-[9px] text-stone-400 mb-1">Waveform</div>
          <div className="w-full h-8 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-clip p-1 shadow-inner shadow-black/70">
            <Waveform
              data={waveformData}
              playhead={waveformPlayhead}
              beatGrid={[0.25, 0.5, 0.75]}
              zoom={1}
              onScrub={handleWaveformScrub}
            />
          </div>
        </div>

        {/* Hot Cue Pads - Fillable Region */}
        <div className="flex-1 flex flex-col overflow-clip">
          <div className="font-medium uppercase tracking-widest text-[9px] text-stone-400 mb-1">Hot Cues</div>
          <div className="flex-1 min-h-0 grid grid-cols-4 gap-2 auto-rows-max [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-auto">
            {[0, 1, 2, 3].map((i) => (
              <div key={"hotcue-" + i} className="aspect-square">
                <Pad active={hotCueStates[i]} onPress={() => handleHotCuePress(i)}>
                  <span className={"font-bold uppercase transition-all duration-200 " + (hotCueStates[i] ? "text-amber-200" : "text-stone-400")}>
                    {i + 1}
                  </span>
                </Pad>
              </div>
            ))}
          </div>
        </div>

        {/* Loop Controls */}
        <div className="flex-none">
          <div className="font-medium uppercase tracking-widest text-[9px] text-stone-400 mb-1">Loop</div>
          <div className="flex gap-2 items-center">
            <div className="w-16 h-6">
              <Button onPress={() => setLoopLength((v) => (v + 1) % 5)}>
                <span className="font-semibold uppercase tracking-wider">Loop</span>
              </Button>
            </div>
            <Readout value={loopLength === 0 ? "Off" : loopLength + "B"} />
          </div>
        </div>
      </div>
    </div>
  );
}