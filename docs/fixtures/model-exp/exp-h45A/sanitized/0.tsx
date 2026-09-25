export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.35);
  const [jogValue, setJogValue] = useState(0);
  const [pitchValue, setPitchValue] = useState(0);
  const [hotCues, setHotCues] = useState([false, false, false, false]);
  const [isSynced, setIsSynced] = useState(false);
  const [isKeylock, setIsKeylock] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const waveformData = Array.from({ length: 512 }, (_, i) =>
    Math.sin(i * 0.05) * 0.7 + Math.cos(i * 0.02) * 0.3 + Math.random() * 0.1
  );

  const handleScrub = (pos: number) => {
    setPlayhead(pos);
  };

  const handleJogScrub = (delta: number) => {
    setPlayhead(prev => Math.max(0, Math.min(1, prev + delta * 0.05)));
  };

  const handleHotCue = (index: number) => {
    const newCues = [...hotCues];
    newCues[index] = !newCues[index];
    setHotCues(newCues);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header: Track Info & BPM */}
      <div className="flex-none h-8 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-amber-400 text-[10px] font-semibold uppercase tracking-widest">
            ● Deck A
          </div>
          <div className="text-stone-100 text-[13px] font-semibold tracking-tight truncate">
            Sunset Boulevard
          </div>
          <div className="text-stone-500 text-[10px] font-normal tracking-wide">
            Night Runner
          </div>
        </div>
        <div className="flex-none text-right">
          <div className="text-amber-400 text-[10px] font-semibold uppercase tracking-widest">
            BPM
          </div>
          <div className="text-amber-400 font-mono font-bold text-base tracking-tight">
            128.4
          </div>
        </div>
      </div>

      {/* Waveform Strip */}
      <div className="flex-none h-8 px-2 py-1 bg-stone-950/40">
        <div className="h-full w-full border border-stone-800/70 rounded-lg bg-stone-950/80 overflow-clip">
          <Waveform
            data={waveformData}
            playhead={playhead}
            beatGrid={[0.25, 0.5, 0.75]}
            zoom={1}
            onScrub={handleScrub}
          />
        </div>
      </div>

      {/* Main Deck Area */}
      <div className="flex-1 flex flex-col overflow-clip p-2 gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Jog Wheel + Pitch + Transport */}
        <div className="flex gap-3 flex-none">
          {/* Jog Wheel */}
          <div className="flex-none w-16 h-16 rounded-full border-2 border-stone-700/80 shadow-lg shadow-black/50 shadow-inner overflow-clip bg-black/70">
            <JogWheel value={jogValue} onScrub={handleJogScrub} />
          </div>

          {/* Right Column: Pitch Fader + Transport */}
          <div className="flex-1 flex flex-col gap-2">
            {/* Pitch Fader Row */}
            <div className="flex-none h-24 flex gap-2 items-stretch">
              <div className="flex-none w-6 border border-stone-700/60 rounded-full bg-stone-950/80 shadow-inner shadow-black/40 flex items-center justify-center">
                <Fader
                  min={-12}
                  max={12}
                  value={pitchValue}
                  onChange={setPitchValue}
                  orientation="vertical"
                />
              </div>
              <div className="flex flex-col justify-center gap-1">
                <div className="text-stone-400 text-[9px] font-medium uppercase tracking-widest leading-none">
                  Pitch
                </div>
                <div className="text-amber-400 font-mono font-bold text-xs leading-none">
                  {pitchValue > 0 ? "+" : ""}{pitchValue.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Transport Row 1: Play + Cue */}
            <div className="flex gap-2 flex-none">
              <div className="flex-1">
                <ToggleButton
                  on={isPlaying}
                  onChange={setIsPlaying}
                >
                  <span className="font-semibold uppercase tracking-wider">
                    {isPlaying ? "●" : "▶"}
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <Button onPress={() => setPlayhead(0)}>
                  <span className="font-semibold uppercase tracking-wider">
                    CUE
                  </span>
                </Button>
              </div>
            </div>

            {/* Transport Row 2: Sync + Keylock */}
            <div className="flex gap-2 flex-none">
              <div className="flex-1">
                <ToggleButton
                  on={isSynced}
                  onChange={setIsSynced}
                >
                  <span className="font-semibold uppercase tracking-wider">
                    SYNC
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <ToggleButton
                  on={isKeylock}
                  onChange={setIsKeylock}
                >
                  <span className="font-semibold uppercase tracking-wider">
                    KEY
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Hot Cue Pads Row */}
        <div className="flex gap-2 flex-none h-9">
          {[0, 1, 2, 3].map((i) => (
            <div key={"cue-" + i} className="flex-1 h-full">
              <Pad
                onPress={() => handleHotCue(i)}
                active={hotCues[i]}
              >
                <span className="font-semibold uppercase tracking-wider">
                  {i + 1}
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop Controls Row */}
        <div className="flex gap-2 flex-none h-7">
          <Button onPress={() => {}}>
            <span className="font-semibold uppercase tracking-wider">
              IN
            </span>
          </Button>
          <Button onPress={() => {}}>
            <span className="font-semibold uppercase tracking-wider">
              OUT
            </span>
          </Button>
          <div className="flex-1">
            <ToggleButton
              on={isLooping}
              onChange={setIsLooping}
            >
              <span className="font-semibold uppercase tracking-wider">
                {isLooping ? "⟳" : "LOOP"}
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}