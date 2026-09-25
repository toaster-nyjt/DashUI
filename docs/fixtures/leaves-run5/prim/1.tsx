export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(72);
  const [gainB, setGainB] = useState(65);

  const [hiA, setHiA] = useState(60);
  const [midA, setMidA] = useState(50);
  const [lowA, setLowA] = useState(55);

  const [hiB, setHiB] = useState(52);
  const [midB, setMidB] = useState(58);
  const [lowB, setLowB] = useState(48);

  const [chFaderA, setChFaderA] = useState(0.82);
  const [chFaderB, setChFaderB] = useState(0.7);

  const [crossfade, setCrossfade] = useState(0.5);

  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(false);

  const [masterVol, setMasterVol] = useState(78);
  const [headMix, setHeadMix] = useState(45);

  // Live meter simulation seeded off the actual control values
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 110);
    return () => clearInterval(id);
  }, []);

  const levelA = useMemo(() => {
    const base = (gainA / 100) * chFaderA * (1 - crossfade * 0.55);
    const wobble = 0.12 * Math.abs(Math.sin(pulse * 0.55 + 0.3)) + 0.05 * Math.abs(Math.sin(pulse * 1.7));
    return Math.max(0, Math.min(1, base * 0.85 + wobble * base));
  }, [gainA, chFaderA, crossfade, pulse]);

  const levelB = useMemo(() => {
    const base = (gainB / 100) * chFaderB * (0.45 + crossfade * 0.55);
    const wobble = 0.12 * Math.abs(Math.sin(pulse * 0.62 + 1.1)) + 0.05 * Math.abs(Math.sin(pulse * 1.4 + 0.6));
    return Math.max(0, Math.min(1, base * 0.85 + wobble * base));
  }, [gainB, chFaderB, crossfade, pulse]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 px-3 flex items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 text-[11px] leading-none">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Central Mixer</span>
        <span className="ml-auto font-mono font-bold tracking-tight text-lime-300 text-[10px] leading-none">
          MSTR {masterVol}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col p-2 gap-2">
        {/* Top: two channel strips */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Channel A */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex flex-col rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-amber-500/[0.06] to-neutral-950/60 shadow-2xl shadow-black/60 p-2 gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-widest text-[10px] text-amber-400 leading-none">CH 1 · A</span>
              <span className="font-mono font-bold tracking-tight text-amber-400 text-[11px] leading-none">{gainA}</span>
            </div>

            {/* Gain trim */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-full flex items-center justify-center" style={{ height: "2.4rem" }}>
                <div className="h-full aspect-square">
                  <Knob min={0} max={100} value={gainA} onChange={setGainA} />
                </div>
              </div>
              <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400 leading-none">Trim</span>
            </div>

            {/* 3-band EQ */}
            <div className="flex-1 min-h-0 flex flex-col justify-around gap-1">
              {[
                { label: "Hi", val: hiA, set: setHiA },
                { label: "Mid", val: midA, set: setMidA },
                { label: "Low", val: lowA, set: setLowA },
              ].map((band) => (
                <div key={band.label} className="flex items-center gap-2">
                  <div className="flex items-center justify-center" style={{ width: "2.1rem", height: "2.1rem" }}>
                    <div className="h-full aspect-square">
                      <Knob min={-12} max={12} value={band.val - 50} onChange={(v) => band.set(v + 50)} />
                    </div>
                  </div>
                  <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400 leading-none w-6">{band.label}</span>
                </div>
              ))}
            </div>

            {/* Meter + fader + cue */}
            <div className="flex gap-2" style={{ height: "8rem" }}>
              <div className="flex flex-col items-center gap-1 h-full">
                <div className="flex-1 min-h-0" style={{ width: "1.6rem" }}>
                  <LevelMeter level={levelA} />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-center gap-1 h-full">
                <div className="flex-1 min-h-0 flex justify-center" style={{ width: "1.6rem" }}>
                  <Fader min={0} max={1} value={chFaderA} onChange={setChFaderA} orientation="vertical" />
                </div>
              </div>
            </div>

            <div style={{ height: "1.6rem" }}>
              <ToggleButton on={cueA} onChange={setCueA}>CUE</ToggleButton>
            </div>
          </div>

          {/* Channel B */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex flex-col rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-violet-500/[0.06] to-neutral-950/60 shadow-2xl shadow-black/60 p-2 gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-widest text-[10px] text-violet-300 leading-none">CH 2 · B</span>
              <span className="font-mono font-bold tracking-tight text-violet-300 text-[11px] leading-none">{gainB}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="w-full flex items-center justify-center" style={{ height: "2.4rem" }}>
                <div className="h-full aspect-square">
                  <Knob min={0} max={100} value={gainB} onChange={setGainB} />
                </div>
              </div>
              <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400 leading-none">Trim</span>
            </div>

            <div className="flex-1 min-h-0 flex flex-col justify-around gap-1">
              {[
                { label: "Hi", val: hiB, set: setHiB },
                { label: "Mid", val: midB, set: setMidB },
                { label: "Low", val: lowB, set: setLowB },
              ].map((band) => (
                <div key={band.label} className="flex items-center gap-2">
                  <div className="flex items-center justify-center" style={{ width: "2.1rem", height: "2.1rem" }}>
                    <div className="h-full aspect-square">
                      <Knob min={-12} max={12} value={band.val - 50} onChange={(v) => band.set(v + 50)} />
                    </div>
                  </div>
                  <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400 leading-none w-6">{band.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2" style={{ height: "8rem" }}>
              <div className="flex-1 min-w-0 flex flex-col items-center gap-1 h-full">
                <div className="flex-1 min-h-0 flex justify-center" style={{ width: "1.6rem" }}>
                  <Fader min={0} max={1} value={chFaderB} onChange={setChFaderB} orientation="vertical" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 h-full">
                <div className="flex-1 min-h-0" style={{ width: "1.6rem" }}>
                  <LevelMeter level={levelB} />
                </div>
              </div>
            </div>

            <div style={{ height: "1.6rem" }}>
              <ToggleButton on={cueB} onChange={setCueB}>CUE</ToggleButton>
            </div>
          </div>
        </div>

        {/* Master + Headphone knobs */}
        <div className="flex gap-2" style={{ height: "4.4rem" }}>
          <div className="flex-1 basis-0 min-w-0 flex items-center gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-1 shadow-none">
            <div className="flex items-center justify-center h-full" style={{ width: "3rem" }}>
              <div className="h-full aspect-square">
                <Knob min={0} max={100} value={masterVol} onChange={setMasterVol} />
              </div>
            </div>
            <div className="min-w-0 flex flex-col gap-1">
              <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400 leading-none truncate">Master</span>
              <span className="font-mono font-bold tracking-tight text-amber-400 text-sm leading-none">{masterVol}</span>
            </div>
          </div>

          <div className="flex-1 basis-0 min-w-0 flex items-center gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-1 shadow-none">
            <div className="flex items-center justify-center h-full" style={{ width: "3rem" }}>
              <div className="h-full aspect-square">
                <Knob min={0} max={100} value={headMix} onChange={setHeadMix} />
              </div>
            </div>
            <div className="min-w-0 flex flex-col gap-1">
              <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400 leading-none truncate">Phones</span>
              <span className="font-mono font-bold tracking-tight text-violet-300 text-sm leading-none">{headMix}</span>
            </div>
          </div>
        </div>

        {/* Crossfader */}
        <div className="flex flex-col rounded-xl border border-stone-800/70 bg-stone-950/80 px-3 py-2 gap-1 shadow-none">
          <div className="flex items-center justify-between">
            <span className="font-medium uppercase tracking-widest text-[10px] text-amber-400 leading-none">A</span>
            <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400 leading-none">Crossfade</span>
            <span className="font-medium uppercase tracking-widest text-[10px] text-violet-300 leading-none">B</span>
          </div>
          <div className="w-full flex items-center justify-center" style={{ height: "1.6rem" }}>
            <div className="w-full flex items-center" style={{ height: "1.6rem" }}>
              <Fader min={0} max={1} value={crossfade} onChange={setCrossfade} orientation="horizontal" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}