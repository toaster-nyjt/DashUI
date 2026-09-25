export default function GeneratedComponent() {
  const [channel1Gain, setChannel1Gain] = useState(0);
  const [channel1EQ, setChannel1EQ] = useState({ low: 0, mid: 0, high: 0 });
  const [channel1Fader, setChannel1Fader] = useState(0);
  const [channel1Level, setChannel1Level] = useState(0.3);
  const [channel1Cue, setChannel1Cue] = useState(false);

  const [channel2Gain, setChannel2Gain] = useState(0);
  const [channel2EQ, setChannel2EQ] = useState({ low: 0, mid: 0, high: 0 });
  const [channel2Fader, setChannel2Fader] = useState(0);
  const [channel2Level, setChannel2Level] = useState(0.4);
  const [channel2Cue, setChannel2Cue] = useState(false);

  const [crossfader, setCrossfader] = useState(0.5);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [headphoneMix, setHeadphoneMix] = useState(0.5);

  useEffect(() => {
    const interval = setInterval(() => {
      setChannel1Level(Math.max(0.05, Math.random() * 0.85 + 0.1 * Math.sin(Date.now() / 500)));
      setChannel2Level(Math.max(0.05, Math.random() * 0.85 + 0.1 * Math.cos(Date.now() / 500)));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const renderEQKnob = (label, value, onChange) => (
    <div className="flex flex-col items-center gap-0.5 transition-all duration-200">
      <span className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">{label}</span>
      <div className="w-8 h-8 transition-transform duration-200 hover:scale-110">
        <Knob min={-12} max={12} value={value} onChange={onChange} />
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="h-8 flex-none px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent flex items-center shadow-sm">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">
          <span className="text-amber-400 inline-block animate-pulse">◆</span> Central Mixer
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Channel strips */}
        <div className="flex-1 flex gap-2">
          {/* Channel 1 - Amber */}
          <div className="flex-1 flex flex-col gap-2 p-3 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-amber-500/15 rounded-2xl shadow-2xl shadow-black/60 transition-all duration-300 hover:border-amber-500/25 hover:shadow-amber-500/20">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <span className="inline-block animate-pulse">●</span> Ch 1
            </div>
            
            {/* Controls row: Gain + EQ */}
            <div className="flex gap-1 justify-center items-end">
              <div className="flex flex-col items-center gap-0.5 transition-all duration-200">
                <span className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">Gain</span>
                <div className="w-8 h-8 transition-transform duration-200 hover:scale-110">
                  <Knob min={-12} max={12} value={channel1Gain} onChange={setChannel1Gain} />
                </div>
              </div>
              {[
                { l: 'Lo', v: channel1EQ.low, set: (v) => setChannel1EQ({...channel1EQ, low: v}) },
                { l: 'Mid', v: channel1EQ.mid, set: (v) => setChannel1EQ({...channel1EQ, mid: v}) },
                { l: 'Hi', v: channel1EQ.high, set: (v) => setChannel1EQ({...channel1EQ, high: v}) }
              ].map((eq, i) => (
                <div key={"ch1-eq-" + i}>
                  {renderEQKnob(eq.l, eq.v, eq.set)}
                </div>
              ))}
            </div>

            {/* Fader section with meter and cue */}
            <div className="flex-1 flex gap-2 items-stretch">
              {/* VU Meter */}
              <div className="flex flex-col items-center gap-1 flex-none">
                <span className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">Lvl</span>
                <div className="w-6 flex-1 transition-transform duration-100">
                  <LevelMeter level={channel1Level} />
                </div>
              </div>

              {/* Cue button */}
              <div className="flex flex-col items-center justify-center flex-none">
                <div className="transition-all duration-200 hover:scale-110 active:scale-95">
                  <ToggleButton on={channel1Cue} onChange={setChannel1Cue}>
                    <span className="">CUE</span>
                  </ToggleButton>
                </div>
              </div>

              {/* Channel Fader */}
              <div className="flex-1 flex justify-center items-stretch">
                <div className="w-[1.6rem] transition-all duration-150 hover:opacity-80">
                  <Fader min={0} max={1} value={channel1Fader} onChange={setChannel1Fader} orientation="vertical" />
                </div>
              </div>
            </div>
          </div>

          {/* Channel 2 - Violet */}
          <div className="flex-1 flex flex-col gap-2 p-3 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-violet-500/15 rounded-2xl shadow-2xl shadow-black/60 transition-all duration-300 hover:border-violet-500/25 hover:shadow-violet-500/20">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-violet-400 flex items-center gap-1">
              <span className="inline-block animate-pulse">●</span> Ch 2
            </div>
            
            {/* Controls row: Gain + EQ */}
            <div className="flex gap-1 justify-center items-end">
              <div className="flex flex-col items-center gap-0.5 transition-all duration-200">
                <span className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">Gain</span>
                <div className="w-8 h-8 transition-transform duration-200 hover:scale-110">
                  <Knob min={-12} max={12} value={channel2Gain} onChange={setChannel2Gain} />
                </div>
              </div>
              {[
                { l: 'Lo', v: channel2EQ.low, set: (v) => setChannel2EQ({...channel2EQ, low: v}) },
                { l: 'Mid', v: channel2EQ.mid, set: (v) => setChannel2EQ({...channel2EQ, mid: v}) },
                { l: 'Hi', v: channel2EQ.high, set: (v) => setChannel2EQ({...channel2EQ, high: v}) }
              ].map((eq, i) => (
                <div key={"ch2-eq-" + i}>
                  {renderEQKnob(eq.l, eq.v, eq.set)}
                </div>
              ))}
            </div>

            {/* Fader section with meter and cue */}
            <div className="flex-1 flex gap-2 items-stretch">
              {/* VU Meter */}
              <div className="flex flex-col items-center gap-1 flex-none">
                <span className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">Lvl</span>
                <div className="w-6 flex-1 transition-transform duration-100">
                  <LevelMeter level={channel2Level} />
                </div>
              </div>

              {/* Cue button */}
              <div className="flex flex-col items-center justify-center flex-none">
                <div className="transition-all duration-200 hover:scale-110 active:scale-95">
                  <ToggleButton on={channel2Cue} onChange={setChannel2Cue}>
                    <span className="">CUE</span>
                  </ToggleButton>
                </div>
              </div>

              {/* Channel Fader */}
              <div className="flex-1 flex justify-center items-stretch">
                <div className="w-[1.6rem] transition-all duration-150 hover:opacity-80">
                  <Fader min={0} max={1} value={channel2Fader} onChange={setChannel2Fader} orientation="vertical" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Crossfader Section */}
        <div className="h-12 flex-none flex flex-col gap-1 p-2 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-stone-800/70 rounded-xl shadow-lg shadow-black/40 transition-all duration-300 hover:border-lime-500/20">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-lime-400 font-bold">Crossfade</span>
          <div className="flex-1 flex items-center px-2">
            <div className="w-full h-[1.6rem] transition-all duration-150 hover:opacity-80">
              <Fader min={0} max={1} value={crossfader} onChange={setCrossfader} orientation="horizontal" />
            </div>
          </div>
        </div>

        {/* Master Section */}
        <div className="h-14 flex-none flex flex-col gap-1 p-2 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-lime-500/15 rounded-2xl shadow-lg shadow-lime-400/20 transition-all duration-300 hover:border-lime-500/30 hover:shadow-lime-400/30">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-lime-400 font-bold flex items-center gap-1">
            <span className="inline-block animate-pulse">◆</span> Master
          </span>
          <div className="flex-1 flex gap-4 justify-center items-center">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">Volume</span>
              <div className="w-8 h-8 transition-transform duration-200 hover:scale-110">
                <Knob min={0} max={1} value={masterVolume} onChange={setMasterVolume} />
              </div>
            </div>
            <div className="w-0.5 h-6 bg-gradient-to-b from-stone-800/0 via-lime-500/20 to-stone-800/0"></div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[8px] uppercase tracking-widest text-stone-500 font-medium">Phones</span>
              <div className="w-8 h-8 transition-transform duration-200 hover:scale-110">
                <Knob min={0} max={1} value={headphoneMix} onChange={setHeadphoneMix} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}