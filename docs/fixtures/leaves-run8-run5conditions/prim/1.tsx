export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(62);
  const [gainB, setGainB] = useState(55);

  const [hiA, setHiA] = useState(58);
  const [midA, setMidA] = useState(50);
  const [lowA, setLowA] = useState(66);

  const [hiB, setHiB] = useState(48);
  const [midB, setMidB] = useState(52);
  const [lowB, setLowB] = useState(44);

  const [faderA, setFaderA] = useState(78);
  const [faderB, setFaderB] = useState(70);

  const [crossfade, setCrossfade] = useState(50);

  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);

  const [master, setMaster] = useState(80);
  const [phones, setPhones] = useState(40);

  const [levelA, setLevelA] = useState(0.5);
  const [levelB, setLevelB] = useState(0.45);

  useEffect(() => {
    const id = setInterval(() => {
      const aWeight = (100 - crossfade) / 100;
      const bWeight = crossfade / 100;
      const baseA = (faderA / 100) * (gainA / 100) * aWeight;
      const baseB = (faderB / 100) * (gainB / 100) * bWeight;
      setLevelA(Math.max(0.04, Math.min(1, baseA * (0.72 + Math.random() * 0.5))));
      setLevelB(Math.max(0.04, Math.min(1, baseB * (0.72 + Math.random() * 0.5))));
    }, 110);
    return () => clearInterval(id);
  }, [faderA, faderB, gainA, gainB, crossfade]);

  const eqRowA = [
    { label: "HI", value: hiA, set: setHiA },
    { label: "MID", value: midA, set: setMidA },
    { label: "LOW", value: lowA, set: setLowA },
  ];
  const eqRowB = [
    { label: "HI", value: hiB, set: setHiB },
    { label: "MID", value: midB, set: setMidB },
    { label: "LOW", value: lowB, set: setLowB },
  ];

  const renderChannel = (
    side: "A" | "B",
    gain: number,
    setGain: (v: number) => void,
    eqRow: { label: string; value: number; set: (v: number) => void }[],
    fader: number,
    setFader: (v: number) => void,
    cue: boolean,
    setCue: (v: boolean) => void,
    level: number
  ) => {
    const accent = side === "A" ? "text-amber-400" : "text-violet-300";
    const accentBorder = side === "A" ? "border-amber-500/30" : "border-violet-500/30";
    return (
      <div className={"flex-1 basis-0 min-w-0 min-h-0 flex flex-col gap-2 rounded-xl border " + accentBorder + " bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2"}>
        <div className="flex items-center justify-between">
          <span className={"font-semibold uppercase tracking-widest text-[10px] " + accent}>CH {side === "A" ? "1" : "2"}</span>
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500">TRIM</span>
        </div>

        {/* Gain trim */}
        <div className="flex justify-center">
          <div className="w-9 h-9">
            <Knob min={0} max={100} value={gain} onChange={setGain} />
          </div>
        </div>

        {/* EQ knobs */}
        <div className="flex flex-col gap-1">
          {eqRow.map((eq) => (
            <div key={side + "-" + eq.label} className="flex items-center gap-2">
              <span className="w-7 font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">{eq.label}</span>
              <div className="w-8 h-8">
                <Knob min={0} max={100} value={eq.value} onChange={eq.set} />
              </div>
            </div>
          ))}
        </div>

        {/* Fader + VU */}
        <div className="flex-1 min-h-0 flex items-stretch justify-center gap-2 pt-1">
          <div className="w-6 flex justify-center">
            <Fader min={0} max={100} value={fader} onChange={setFader} orientation="vertical" />
          </div>
          <div className="w-6 flex justify-center">
            <LevelMeter level={level} />
          </div>
        </div>

        {/* Cue / PFL */}
        <div className="h-8">
          <ToggleButton on={cue} onChange={setCue}>CUE</ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-2">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Central Mixer</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-3">
        {/* Channel strips */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {renderChannel("A", gainA, setGainA, eqRowA, faderA, setFaderA, cueA, setCueA, levelA)}
          {renderChannel("B", gainB, setGainB, eqRowB, faderB, setFaderB, cueB, setCueB, levelB)}
        </div>

        {/* Crossfader */}
        <div className="shrink-0 rounded-xl border border-amber-500/15 bg-stone-950/80 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-amber-400">A</span>
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500">Crossfade</span>
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-violet-300">B</span>
          </div>
          <div className="w-full flex justify-center">
            <Fader min={0} max={100} value={crossfade} onChange={setCrossfade} orientation="horizontal" />
          </div>
        </div>

        {/* Master + Headphone mix */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 basis-0 min-w-0 flex items-center gap-2 rounded-xl border border-amber-500/15 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2">
            <div className="w-9 h-9">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <div className="min-w-0">
              <div className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400 truncate">Master</div>
              <div className="font-mono font-bold tracking-tight text-amber-400 text-sm">{master}</div>
            </div>
          </div>

          <div className="flex-1 basis-0 min-w-0 flex items-center gap-2 rounded-xl border border-amber-500/15 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2">
            <div className="w-9 h-9">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <div className="min-w-0">
              <div className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400 truncate">Phones</div>
              <div className="font-mono font-bold tracking-tight text-stone-100 text-sm">{phones}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="h-6 shrink-0 flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">XF <span className="text-lime-300">{crossfade}%</span></span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">OUT <span className="text-lime-300">{master}%</span></span>
      </div>
    </div>
  );
}