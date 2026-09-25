export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(64);
  const [gainB, setGainB] = useState(58);
  const [eqA, setEqA] = useState({ hi: 2, mid: 0, low: -1 });
  const [eqB, setEqB] = useState({ hi: -2, mid: 1, low: 3 });
  const [volA, setVolA] = useState(82);
  const [volB, setVolB] = useState(76);
  const [xfade, setXfade] = useState(48);
  const [master, setMaster] = useState(78);
  const [phones, setPhones] = useState(45);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);
  const [lvlA, setLvlA] = useState(0.3);
  const [lvlB, setLvlB] = useState(0.25);

  useEffect(() => {
    const id = setInterval(() => {
      const drive = (g, v) => (v / 100) * (0.35 + 0.55 * (g / 100));
      const clamp = (x) => Math.max(0, Math.min(1, x));
      setLvlA((p) => {
        const t = drive(gainA, volA) * (0.5 + 0.5 * Math.random());
        return clamp(p * 0.55 + t * 0.45);
      });
      setLvlB((p) => {
        const t = drive(gainB, volB) * (0.5 + 0.5 * Math.random());
        return clamp(p * 0.55 + t * 0.45);
      });
    }, 110);
    return () => clearInterval(id);
  }, [gainA, volA, gainB, volB]);

  const renderChannel = (opts) => {
    const { letter, accent, ring, dot, gain, setGain, eq, setEq, vol, setVol, cue, setCue, level } = opts;
    const eqRows = [["Hi", "hi"], ["Mid", "mid"], ["Lo", "low"]];
    return (
      <div className={"flex-1 flex flex-col items-center justify-between gap-1 rounded-xl border p-2 shadow-lg shadow-black/40 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 " + ring}>
        <span className={"flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest leading-none " + accent}>
          <span className={"h-1.5 w-1.5 rounded-full animate-pulse " + dot} />
          {"Ch " + letter}
        </span>

        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8"><Knob min={0} max={100} value={gain} onChange={setGain} /></div>
            <span className="w-8 text-[8px] font-medium uppercase tracking-widest leading-none text-stone-400">Gain</span>
          </div>
          {eqRows.map(([lbl, k]) => (
            <div key={k} className="flex items-center gap-1.5">
              <div className="w-8 h-8"><Knob min={-12} max={12} value={eq[k]} onChange={(v) => setEq(k, v)} /></div>
              <span className="w-8 text-[8px] font-medium uppercase tracking-widest leading-none text-stone-400">{lbl}</span>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2 h-24">
          <div className="w-6 h-24"><LevelMeter level={level} /></div>
          <div className="w-7 h-24"><Fader min={0} max={100} value={vol} onChange={setVol} orientation="vertical" /></div>
        </div>

        <div className="w-full h-6">
          <ToggleButton on={cue} onChange={setCue}>
            <span className="font-semibold uppercase tracking-wider">{"Cue " + letter}</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden select-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/10 to-transparent">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-500/40" />
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Channel Mixer</span>
        <span className="ml-auto text-[9px] font-medium uppercase tracking-widest text-stone-500">2 · CH</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex gap-2">
          {renderChannel({
            letter: "A",
            accent: "text-amber-400",
            ring: "border-amber-500/30 ring-1 ring-inset ring-amber-500/10",
            dot: "bg-amber-400 shadow-lg shadow-amber-500/40",
            gain: gainA, setGain: setGainA,
            eq: eqA, setEq: (k, v) => setEqA((p) => ({ ...p, [k]: v })),
            vol: volA, setVol: setVolA,
            cue: cueA, setCue: setCueA,
            level: lvlA,
          })}

          {/* Master column */}
          <div className="flex-1 flex flex-col items-center justify-between rounded-xl border border-amber-500/15 p-2 shadow-lg shadow-black/40 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60">
            <span className="text-[10px] font-semibold uppercase tracking-widest leading-none text-amber-400">Master</span>
            <div className="w-10 h-px bg-stone-800/70" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-14"><Knob min={0} max={100} value={master} onChange={setMaster} /></div>
              <span className="text-[8px] font-medium uppercase tracking-widest leading-none text-stone-400">Volume</span>
            </div>
            <div className="w-10 h-px bg-stone-800/70" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12"><Knob min={0} max={100} value={phones} onChange={setPhones} /></div>
              <span className="text-[8px] font-medium uppercase tracking-widest leading-none text-violet-300">Phones</span>
            </div>
            <div className="w-10 h-px bg-stone-800/70" />
            <span className="font-mono font-bold tracking-tight text-amber-400 text-sm leading-none">{master}</span>
          </div>

          {renderChannel({
            letter: "B",
            accent: "text-violet-300",
            ring: "border-violet-500/30 ring-1 ring-inset ring-violet-500/10",
            dot: "bg-violet-400 shadow-lg shadow-violet-500/40",
            gain: gainB, setGain: setGainB,
            eq: eqB, setEq: (k, v) => setEqB((p) => ({ ...p, [k]: v })),
            vol: volB, setVol: setVolB,
            cue: cueB, setCue: setCueB,
            level: lvlB,
          })}
        </div>

        {/* Crossfader */}
        <div className="flex-none flex items-center gap-2 rounded-xl border border-amber-500/15 p-2 shadow-lg shadow-black/40 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60">
          <span className="text-[10px] font-semibold uppercase tracking-widest leading-none text-amber-400">A</span>
          <div className="flex-1 h-7"><Fader min={0} max={100} value={xfade} onChange={setXfade} orientation="horizontal" /></div>
          <span className="text-[10px] font-semibold uppercase tracking-widest leading-none text-violet-300">B</span>
        </div>
      </div>

      {/* Footer */}
      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span>XF <span className="font-mono text-lime-300">{xfade}%</span></span>
        <span>MST <span className="font-mono text-lime-300">{master}%</span></span>
        <span className="ml-auto">PH <span className="font-mono text-lime-300">{phones}%</span></span>
      </div>
    </div>
  );
}