export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(50);
  const [gainB, setGainB] = useState(50);
  const [eqA, setEqA] = useState({ high: 0, mid: 0, low: 0 });
  const [eqB, setEqB] = useState({ high: 0, mid: 0, low: 0 });
  const [faderA, setFaderA] = useState(82);
  const [faderB, setFaderB] = useState(82);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);
  const [crossfade, setCrossfade] = useState(50);
  const [masterVol, setMasterVol] = useState(74);
  const [phoneMix, setPhoneMix] = useState(50);
  const [vuA, setVuA] = useState(0);
  const [vuB, setVuB] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setVuA(Math.max(0, Math.min(1, (faderA / 100) * (0.35 + Math.random() * 0.65))));
      setVuB(Math.max(0, Math.min(1, (faderB / 100) * (0.35 + Math.random() * 0.65))));
    }, 130);
    return () => clearInterval(id);
  }, [faderA, faderB]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header */}
      <div className="flex-none h-8 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 animate-pulse" />
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Central Mixer</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex gap-2">
          {/* Channel A */}
          <div className="flex-1 flex flex-col gap-2 p-2 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-amber-500/15 rounded-2xl">
            <div className="flex-none text-[10px] font-medium uppercase tracking-widest text-amber-400">Ch 1</div>

            <div className="flex-none flex items-center justify-between gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8">
                  <Knob min={0} max={100} value={gainA} onChange={setGainA} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Gain</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-6">
                  <ToggleButton on={cueA} onChange={setCueA}>Cue</ToggleButton>
                </div>
              </div>
            </div>

            <div className="flex-none flex items-center justify-between gap-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8">
                  <Knob min={-12} max={12} value={eqA.high} onChange={(v) => setEqA((s) => ({ ...s, high: v }))} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Hi</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8">
                  <Knob min={-12} max={12} value={eqA.mid} onChange={(v) => setEqA((s) => ({ ...s, mid: v }))} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Mid</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8">
                  <Knob min={-12} max={12} value={eqA.low} onChange={(v) => setEqA((s) => ({ ...s, low: v }))} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Lo</span>
              </div>
            </div>

            <div className="flex-1 flex items-stretch gap-2">
              <div className="w-6 h-full">
                <LevelMeter level={vuA} />
              </div>
              <div className="flex-1 h-full flex justify-center">
                <div className="w-7 h-full">
                  <Fader min={0} max={100} value={faderA} onChange={setFaderA} orientation="vertical" />
                </div>
              </div>
            </div>
          </div>

          {/* Master */}
          <div className="flex-none w-16 flex flex-col items-center justify-center gap-3 p-2 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-amber-500/15 rounded-2xl">
            <span className="text-[10px] font-medium uppercase tracking-widest text-amber-400">Master</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8">
                <Knob min={0} max={100} value={masterVol} onChange={setMasterVol} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-stone-500">Vol</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8">
                <Knob min={0} max={100} value={phoneMix} onChange={setPhoneMix} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-stone-500">Phones</span>
            </div>
          </div>

          {/* Channel B */}
          <div className="flex-1 flex flex-col gap-2 p-2 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-amber-500/15 rounded-2xl">
            <div className="flex-none text-[10px] font-medium uppercase tracking-widest text-violet-300">Ch 2</div>

            <div className="flex-none flex items-center justify-between gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8">
                  <Knob min={0} max={100} value={gainB} onChange={setGainB} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Gain</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-6">
                  <ToggleButton on={cueB} onChange={setCueB}>Cue</ToggleButton>
                </div>
              </div>
            </div>

            <div className="flex-none flex items-center justify-between gap-1">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8">
                  <Knob min={-12} max={12} value={eqB.high} onChange={(v) => setEqB((s) => ({ ...s, high: v }))} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Hi</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8">
                  <Knob min={-12} max={12} value={eqB.mid} onChange={(v) => setEqB((s) => ({ ...s, mid: v }))} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Mid</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-8 h-8">
                  <Knob min={-12} max={12} value={eqB.low} onChange={(v) => setEqB((s) => ({ ...s, low: v }))} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-stone-500">Lo</span>
              </div>
            </div>

            <div className="flex-1 flex items-stretch gap-2">
              <div className="flex-1 h-full flex justify-center">
                <div className="w-7 h-full">
                  <Fader min={0} max={100} value={faderB} onChange={setFaderB} orientation="vertical" />
                </div>
              </div>
              <div className="w-6 h-full">
                <LevelMeter level={vuB} />
              </div>
            </div>
          </div>
        </div>

        {/* Crossfader */}
        <div className="flex-none flex items-center gap-2 p-2 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 border border-amber-500/15 rounded-2xl">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">A</span>
          <div className="flex-1 h-7">
            <Fader min={0} max={100} value={crossfade} onChange={setCrossfade} orientation="horizontal" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-300">B</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none h-6 flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">Blend</span>
        <span className="text-[10px] uppercase tracking-widest text-lime-300">
          {Math.round(crossfade)}%
        </span>
      </div>
    </div>
  );
}