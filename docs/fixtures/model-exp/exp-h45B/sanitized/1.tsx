export default function GeneratedComponent() {
  // Channel 1 state
  const [ch1Gain, setCh1Gain] = useState(0);
  const [ch1EQLow, setCh1EQLow] = useState(0);
  const [ch1EQMid, setCh1EQMid] = useState(0);
  const [ch1EQHigh, setCh1EQHigh] = useState(0);
  const [ch1Fader, setCh1Fader] = useState(0.5);
  const [ch1Cue, setCh1Cue] = useState(false);
  const [ch1Level, setCh1Level] = useState(0.6);

  // Channel 2 state
  const [ch2Gain, setCh2Gain] = useState(0);
  const [ch2EQLow, setCh2EQLow] = useState(0);
  const [ch2EQMid, setCh2EQMid] = useState(0);
  const [ch2EQHigh, setCh2EQHigh] = useState(0);
  const [ch2Fader, setCh2Fader] = useState(0.5);
  const [ch2Cue, setCh2Cue] = useState(false);
  const [ch2Level, setCh2Level] = useState(0.4);

  // Master state
  const [crossfader, setCrossfader] = useState(0.5);
  const [masterVolume, setMasterVolume] = useState(0.75);
  const [headphoneMix, setHeadphoneMix] = useState(0.5);

  // Animate demo levels
  useEffect(() => {
    const interval = setInterval(() => {
      setCh1Level(prev => {
        const val = Math.random() * 0.6 + 0.15;
        return Math.min(1, Math.max(0, val));
      });
      setCh2Level(prev => {
        const val = Math.random() * 0.5 + 0.2;
        return Math.min(1, Math.max(0, val));
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      
      {/* Channel Strips Main Area */}
      <div className="flex-1 flex gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        
        {/* ===== CHANNEL 1 STRIP ===== */}
        <div className="flex-1 flex flex-col bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-amber-500/15 rounded-2xl overflow-clip shadow-2xl shadow-black/60">
          
          {/* Channel 1 Header */}
          <div className="flex-none px-3 py-2 border-b border-amber-500/20 bg-neutral-900/80">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
              ● Ch 1
            </div>
          </div>

          {/* Gain + EQ Section */}
          <div className="flex-none px-3 py-3 border-b border-amber-500/10 flex items-end gap-3">
            <div className="flex flex-col items-center gap-1 flex-none">
              <div className="h-8 w-8">
                <Knob
                  min={-12}
                  max={12}
                  value={ch1Gain}
                  onChange={setCh1Gain}
                />
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500">Gain</div>
            </div>
            
            <div className="flex gap-3 flex-1 items-end">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-8">
                  <Knob min={-12} max={12} value={ch1EQLow} onChange={setCh1EQLow} />
                </div>
                <div className="text-[9px] uppercase tracking-wider text-stone-500">Low</div>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-8">
                  <Knob min={-12} max={12} value={ch1EQMid} onChange={setCh1EQMid} />
                </div>
                <div className="text-[9px] uppercase tracking-wider text-stone-500">Mid</div>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-8">
                  <Knob min={-12} max={12} value={ch1EQHigh} onChange={setCh1EQHigh} />
                </div>
                <div className="text-[9px] uppercase tracking-wider text-stone-500">Hi</div>
              </div>
            </div>
          </div>

          {/* VU Meter + Fader + Cue Section */}
          <div className="flex-1 px-3 py-3 flex items-stretch gap-3">
            
            {/* VU Meter */}
            <div className="flex flex-col items-center gap-2 flex-none">
              <div className="h-full flex items-center justify-center">
                <div className="w-6 h-24">
                  <LevelMeter level={ch1Level} />
                </div>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500 flex-none">VU</div>
            </div>

            {/* Channel Fader - Main Element */}
            <div className="flex flex-col items-center gap-2 flex-none">
              <div className="flex-1 flex items-stretch">
                <div className="w-6 h-full">
                  <Fader
                    min={0}
                    max={1}
                    value={ch1Fader}
                    onChange={setCh1Fader}
                    orientation="vertical"
                  />
                </div>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500 flex-none">Fade</div>
            </div>

            {/* Cue Button */}
            <div className="flex flex-col items-center gap-2 flex-none">
              <div className="h-6 w-8">
                <ToggleButton
                  on={ch1Cue}
                  onChange={setCh1Cue}
                >
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </ToggleButton>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500 flex-none">PFL</div>
            </div>
          </div>
        </div>

        {/* ===== CHANNEL 2 STRIP ===== */}
        <div className="flex-1 flex flex-col bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-violet-500/15 rounded-2xl overflow-clip shadow-2xl shadow-black/60">
          
          {/* Channel 2 Header */}
          <div className="flex-none px-3 py-2 border-b border-violet-500/20 bg-neutral-900/80">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-violet-400">
              ● Ch 2
            </div>
          </div>

          {/* Gain + EQ Section */}
          <div className="flex-none px-3 py-3 border-b border-violet-500/10 flex items-end gap-3">
            <div className="flex flex-col items-center gap-1 flex-none">
              <div className="h-8 w-8">
                <Knob
                  min={-12}
                  max={12}
                  value={ch2Gain}
                  onChange={setCh2Gain}
                />
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500">Gain</div>
            </div>
            
            <div className="flex gap-3 flex-1 items-end">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-8">
                  <Knob min={-12} max={12} value={ch2EQLow} onChange={setCh2EQLow} />
                </div>
                <div className="text-[9px] uppercase tracking-wider text-stone-500">Low</div>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-8">
                  <Knob min={-12} max={12} value={ch2EQMid} onChange={setCh2EQMid} />
                </div>
                <div className="text-[9px] uppercase tracking-wider text-stone-500">Mid</div>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-8">
                  <Knob min={-12} max={12} value={ch2EQHigh} onChange={setCh2EQHigh} />
                </div>
                <div className="text-[9px] uppercase tracking-wider text-stone-500">Hi</div>
              </div>
            </div>
          </div>

          {/* VU Meter + Fader + Cue Section */}
          <div className="flex-1 px-3 py-3 flex items-stretch gap-3">
            
            {/* VU Meter */}
            <div className="flex flex-col items-center gap-2 flex-none">
              <div className="h-full flex items-center justify-center">
                <div className="w-6 h-24">
                  <LevelMeter level={ch2Level} />
                </div>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500 flex-none">VU</div>
            </div>

            {/* Channel Fader - Main Element */}
            <div className="flex flex-col items-center gap-2 flex-none">
              <div className="flex-1 flex items-stretch">
                <div className="w-6 h-full">
                  <Fader
                    min={0}
                    max={1}
                    value={ch2Fader}
                    onChange={setCh2Fader}
                    orientation="vertical"
                  />
                </div>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500 flex-none">Fade</div>
            </div>

            {/* Cue Button */}
            <div className="flex flex-col items-center gap-2 flex-none">
              <div className="h-6 w-8">
                <ToggleButton
                  on={ch2Cue}
                  onChange={setCh2Cue}
                >
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </ToggleButton>
              </div>
              <div className="text-[9px] uppercase tracking-wider text-stone-500 flex-none">PFL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Crossfader Section */}
      <div className="flex-none px-3 py-2 bg-neutral-900/80 border-t border-stone-800/70 flex items-center gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-400 flex-none whitespace-nowrap">
          ✕ Fade
        </div>
        <div className="flex-1 h-6">
          <Fader
            min={0}
            max={1}
            value={crossfader}
            onChange={setCrossfader}
            orientation="horizontal"
          />
        </div>
      </div>

      {/* Master Controls Section */}
      <div className="flex-none px-3 py-3 bg-neutral-900/80 border-t border-stone-800/70 flex items-end gap-6">
        
        {/* Master Volume */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-8 w-8">
            <Knob
              min={0}
              max={1}
              value={masterVolume}
              onChange={setMasterVolume}
            />
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-lime-400">Master</div>
        </div>

        {/* Headphone Mix */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-8 w-8">
            <Knob
              min={0}
              max={1}
              value={headphoneMix}
              onChange={setHeadphoneMix}
            />
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">Phones</div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>
      </div>
    </div>
  );
}