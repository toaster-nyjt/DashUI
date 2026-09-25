export default function GeneratedComponent() {
  const [trims, setTrims] = useState<number[]>([0, 0]);
  const [eqs, setEqs] = useState([
    { hi: 0, mid: 0, low: 0 },
    { hi: 0, mid: 0, low: 0 },
  ]);
  const [faders, setFaders] = useState<number[]>([82, 82]);
  const [cues, setCues] = useState<boolean[]>([false, false]);
  const [crossfade, setCrossfade] = useState<number>(50);
  const [masterVol, setMasterVol] = useState<number>(78);
  const [headMix, setHeadMix] = useState<number>(50);
  const [levels, setLevels] = useState<number[]>([0.4, 0.4]);

  useEffect(() => {
    const id = setInterval(() => {
      setLevels([
        Math.max(0, Math.min(1, (faders[0] / 100) * (0.5 + 0.5 * Math.random()))),
        Math.max(0, Math.min(1, (faders[1] / 100) * (0.5 + 0.5 * Math.random()))),
      ]);
    }, 110);
    return () => clearInterval(id);
  }, [faders]);

  const setEqBand = (idx: number, band: "hi" | "mid" | "low", v: number) =>
    setEqs((prev) => prev.map((e, i) => (i === idx ? { ...e, [band]: v } : e)));

  const decks = [
    { name: "CH 1", accent: "text-amber-400", cueAccent: "text-amber-300" },
    { name: "CH 2", accent: "text-violet-300", cueAccent: "text-violet-300" },
  ];

  const label = "font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500";

  const renderStrip = (idx: number) => {
    const bands: { key: "hi" | "mid" | "low"; label: string }[] = [
      { key: "hi", label: "HI" },
      { key: "mid", label: "MID" },
      { key: "low", label: "LOW" },
    ];
    return (
      <div className="flex-1 flex flex-col items-center gap-1.5 p-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60">
        <div className={"font-semibold uppercase tracking-widest leading-none text-[11px] " + decks[idx].accent}>
          {decks[idx].name}
        </div>

        {/* Gain trim */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-9 h-9">
            <Knob min={-12} max={12} value={trims[idx]} onChange={(v) => setTrims((p) => p.map((t, i) => (i === idx ? v : t)))} />
          </div>
          <span className={label}>TRIM</span>
        </div>

        {/* 3-band EQ */}
        <div className="flex gap-1.5">
          {bands.map((b) => (
            <div key={b.key} className="flex flex-col items-center gap-0.5">
              <div className="w-8 h-8">
                <Knob min={-12} max={12} value={eqs[idx][b.key]} onChange={(v) => setEqBand(idx, b.key, v)} />
              </div>
              <span className={label}>{b.label}</span>
            </div>
          ))}
        </div>

        {/* Fader + VU meter */}
        <div className="flex items-end gap-2 mt-0.5">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-8 h-24">
              <Fader min={0} max={100} value={faders[idx]} orientation="vertical" onChange={(v) => setFaders((p) => p.map((f, i) => (i === idx ? v : f)))} />
            </div>
            <span className={label}>LVL</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-6 h-24">
              <LevelMeter level={levels[idx]} />
            </div>
            <span className={label}>VU</span>
          </div>
        </div>

        {/* Cue / PFL */}
        <div className="w-full h-7 mt-auto">
          <ToggleButton on={cues[idx]} onChange={(o) => setCues((p) => p.map((c, i) => (i === idx ? o : c)))}>
            <span className="font-semibold uppercase tracking-wider">CUE</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none px-3 flex items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 leading-none">◈</span>
        <span className="font-semibold uppercase tracking-widest leading-none text-[11px] text-stone-200">Central Mixer</span>
        <span className="ml-auto font-mono font-bold tracking-tight text-[11px] text-lime-300">MIX</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        <div className="flex-1 flex gap-2">
          {renderStrip(0)}

          {/* Master center column */}
          <div className="flex flex-col items-center justify-center gap-3 px-1 py-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60">
            <div className="font-semibold uppercase tracking-widest leading-none text-[10px] text-stone-300">MASTER</div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-10 h-10">
                <Knob min={0} max={100} value={masterVol} onChange={setMasterVol} />
              </div>
              <span className={label}>VOL</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-10 h-10">
                <Knob min={0} max={100} value={headMix} onChange={setHeadMix} />
              </div>
              <span className={label}>PHONES</span>
            </div>
          </div>

          {renderStrip(1)}
        </div>

        {/* Crossfader */}
        <div className="flex-none flex flex-col gap-1 p-2 rounded-xl border border-stone-800/70 bg-stone-950/80">
          <div className="flex items-center justify-between leading-none">
            <span className="font-semibold uppercase tracking-widest text-[10px] text-amber-400">A</span>
            <span className={label}>CROSSFADER</span>
            <span className="font-semibold uppercase tracking-widest text-[10px] text-violet-300">B</span>
          </div>
          <div className="w-full h-7">
            <Fader min={0} max={100} value={crossfade} orientation="horizontal" onChange={setCrossfade} />
          </div>
        </div>
      </div>
    </div>
  );
}