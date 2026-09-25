export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(128);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.35);
  const [hotCues, setHotCues] = useState([false, false, false, false]);
  const [isLooping, setIsLooping] = useState(false);
  const [loopSize, setLoopSize] = useState(4);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [keylockEnabled, setKeylockEnabled] = useState(false);
  const [jogAngle, setJogAngle] = useState(0);
  const [trackTitle] = useState("Summer Vibes Remix");
  const [trackArtist] = useState("Deep House Collective");

  const waveformData = Array.from({ length: 256 }, (_, i) => {
    const t = i / 256;
    return (Math.sin(t * 12 * Math.PI) * 0.7 + Math.sin(t * 3 * Math.PI) * 0.2) * (1 - t * 0.2) + Math.random() * 0.1;
  });

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 rounded-none">
      {/* Header */}
      <div className="flex-none h-8 px-3 border-b border-violet-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/5 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-violet-400 text-lg font-bold flex-none">◆</span>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-stone-200 truncate">Deck B</div>
            <div className="text-[9px] font-normal tracking-wide text-stone-500 truncate">{trackTitle}</div>
          </div>
        </div>
        {isPlaying && (
          <div className="flex-none text-violet-400 text-xs animate-pulse font-bold">●</div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col overflow-clip p-2 gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Waveform Display */}
        <div className="flex-none h-8 bg-stone-950/80 border border-stone-800/70 rounded-xl p-1 overflow-clip">
          <Waveform
            data={waveformData}
            playhead={playhead}
            beatGrid={[0.25, 0.5, 0.75]}
          />
        </div>

        {/* Jog Wheel + Hot Cue Pads */}
        <div className="flex-none flex gap-2 h-16">
          {/* Jog Wheel Container */}
          <div className="flex-none w-16 h-16 bg-gradient-to-b from-stone-900/50 to-black/70 border-2 border-stone-700/80 rounded-xl shadow-inner shadow-black/70 overflow-clip flex items-center justify-center transition-all duration-200">
            <JogWheel
              value={jogAngle}
              onScrub={(delta) => {
                setJogAngle(prev => prev + delta);
                setPlayhead(prev => Math.max(0, Math.min(1, prev + delta * 0.08)));
              }}
            />
          </div>

          {/* Hot Cue Pads Grid */}
          <div className="flex-1 grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Pad
                key={"cue-" + i}
                active={hotCues[i]}
                onPress={() => {
                  const updated = [...hotCues];
                  updated[i] = !updated[i];
                  setHotCues(updated);
                }}
              >
                <div className="flex flex-col items-center justify-center gap-px">
                  <span className="text-[0.6em] font-bold uppercase tracking-wider">CUE</span>
                  <span className="text-[0.5em] font-mono font-bold">{i + 1}</span>
                </div>
              </Pad>
            ))}
          </div>
        </div>

        {/* Transport & Info Row */}
        <div className="flex-none h-7 flex gap-1.5">
          <ToggleButton
            on={isPlaying}
            onChange={setIsPlaying}
          >
            <span className="text-[0.7em] font-bold">▶</span>
          </ToggleButton>
          <Button onPress={() => setPlayhead(0)}>
            <span className="text-[0.7em] font-bold">⏸</span>
          </Button>
          <ToggleButton
            on={syncEnabled}
            onChange={setSyncEnabled}
          >
            <span className="text-[0.7em] font-bold">🔗</span>
          </ToggleButton>
          <div className="flex-1 min-w-0"></div>
          <div className="flex-none bg-gradient-to-br from-stone-900/60 to-black/40 border border-violet-500/20 rounded-lg p-1.5 min-w-max">
            <div className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">BPM</div>
            <Readout value={String(bpm)} />
          </div>
        </div>

        {/* Pitch Control + Settings */}
        <div className="flex-1 flex gap-2">
          {/* Pitch Fader Section */}
          <div className="flex-none flex flex-col gap-2 items-center">
            <div className="text-[9px] font-medium uppercase tracking-widest text-stone-400">Pitch</div>
            <div className="flex-1 flex items-center justify-center py-1">
              <div className="w-6 h-full">
                <Fader
                  min={-12}
                  max={12}
                  value={pitch}
                  onChange={setPitch}
                  orientation="vertical"
                />
              </div>
            </div>
            <div className="text-[9px] font-mono font-bold text-violet-400 tracking-tight">
              {pitch > 0 ? '+' : ''}{pitch.toFixed(1)}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="flex-1 flex flex-col gap-1.5">
            {/* Key Lock */}
            <ToggleButton
              on={keylockEnabled}
              onChange={setKeylockEnabled}
            >
              <span className="text-[0.6em] font-bold uppercase tracking-wider">🔑 Key</span>
            </ToggleButton>

            {/* Loop Control */}
            <div className="flex gap-1.5 flex-1">
              <ToggleButton
                on={isLooping}
                onChange={setIsLooping}
              >
                <span className="text-[0.6em] font-bold uppercase tracking-wider">⟳</span>
              </ToggleButton>
              <div className="flex-1 min-w-0 bg-gradient-to-br from-stone-900/60 to-black/40 border border-violet-500/15 rounded-lg px-2 py-1 flex flex-col justify-center">
                <div className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">Loop</div>
                <div className="text-[10px] font-mono font-bold text-violet-300">{loopSize}B</div>
              </div>
            </div>

            {/* Track Artist */}
            <div className="flex-none bg-gradient-to-br from-violet-950/40 to-black/30 border border-violet-500/10 rounded-lg p-1.5 text-center">
              <div className="text-[8px] font-normal tracking-wide text-stone-500 line-clamp-2">{trackArtist}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex-none h-6 px-3 border-t border-stone-800/70 bg-stone-950/70 flex items-center gap-2 text-[10px] uppercase tracking-widest">
        <span className={`font-bold flex-none transition-all duration-200 ${syncEnabled ? 'text-lime-400 animate-pulse' : 'text-violet-400'}`}>
          {syncEnabled ? '◆' : '●'}
        </span>
        <span className="text-stone-500 flex-1 min-w-0 truncate">
          {syncEnabled ? 'Synced to Deck A' : 'Ready'}
        </span>
        {isLooping && (
          <span className="flex-none text-violet-300 font-bold animate-pulse">⟳</span>
        )}
      </div>
    </div>
  );
}