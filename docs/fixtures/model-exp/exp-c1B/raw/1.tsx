export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(2);
  const [gainB, setGainB] = useState(-1);
  const [eqA, setEqA] = useState({ hi: 3, mid: 0, low: -2 });
  const [eqB, setEqB] = useState({ hi: -1, mid: 2, low: 4 });
  const [faderA, setFaderA] = useState(84);
  const [faderB, setFaderB] = useState(76);
  const [crossfade, setCrossfade] = useState(42);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);
  const [masterVol, setMasterVol] = useState(85);
  const [phones, setPhones] = useState(55);
  const [vuA, setVuA] = useState(0.3);
  const [vuB, setVuB] = useState(0.3);
  const tRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tRef.current += 1;
      const t = tRef.current;
      const gA = Math.max(0.2, 1 + gainA / 20);
      const gB = Math.max(0.2, 1 + gainB / 20);
      const beatA = 0.5 + 0.32 * Math.abs(Math.sin(t * 0.55)) + 0.16 * Math.random();
      const beatB = 0.48 + 0.36 * Math.abs(Math.sin(t * 0.55 + 1.3)) + 0.16 * Math.random();
      setVuA(Math.max(0.04, Math.min(1, beatA * (faderA / 100) * gA)));
      setVuB(Math.max(0.04, Math.min(1, beatB * (faderB / 100) * gB)));
    }, 110);
    return () => clearInterval(id);
  }, [gainA, gainB, faderA, faderB]);

  const aW = Math.cos((crossfade / 100) * (Math.PI / 2));
  const bW = Math.sin((crossfade / 100) * (Math.PI / 2));
  const masterLevel = Math.min(1, (vuA * aW + vuB * bW) * (masterVol / 100));
  const db = masterLevel <= 0.004 ? "-\u221E" : (20 * Math.log10(masterLevel)).toFixed(1);
  const aPct = Math.round((aW / (aW + bW || 1)) * 100);
  const bPct = 100 - aPct;

  const bands = [
    { k: "hi", label: "Hi" },
    { k: "mid", label: "Mid" },
    { k: "low", label: "Low" },
  ];

  const renderStrip = (cfg: any) => (
    <div
      key={cfg.key}
      className={
        "flex-1 flex flex-col gap-1.5 p-2 rounded-xl border bg-neutral-900/80 bg-gradient-to-b from-stone-800/30 to-neutral-950/60 shadow-2xl shadow-black/60 transition-all duration-300 ease-out " +
        cfg.borderCls +
        (cfg.cue ? " " + cfg.glowCls : "")
      }
    >
      <div className="flex items-center gap-1.5">
        <span className={"w-2 h-2 rounded-full animate-pulse " + cfg.accentDot} />
        <span className={"font-semibold uppercase tracking-widest text-[10px] leading-none " + cfg.accentText}>
          {cfg.letter}
        </span>
        <span className="ml-auto font-medium uppercase tracking-widest text-[9px] leading-none text-stone-500">CH</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <div className="w-9 h-9">
          <Knob min={-12} max={12} value={cfg.gain} onChange={cfg.setGain} />
        </div>
        <span className="font-medium uppercase tracking-widest text-[9px] leading-none text-stone-400">Trim</span>
      </div>

      <div className="flex justify-center gap-1.5">
        {bands.map((b) => (
          <div key={b.k} className="flex flex-col items-center gap-0.5">
            <div className="w-8 h-8">
              <Knob
                min={-12}
                max={12}
                value={cfg.eq[b.k]}
                onChange={(v: number) => cfg.setEq((prev: any) => ({ ...prev, [b.k]: v }))}
              />
            </div>
            <span className="font-medium uppercase tracking-widest text-[9px] leading-none text-stone-400">{b.label}</span>
          </div>
        ))}
      </div>

      <div className="w-full h-6">
        <ToggleButton on={cfg.cue} onChange={cfg.setCue}>
          <span className="font-semibold uppercase tracking-wider">Cue</span>
        </ToggleButton>
      </div>

      <div className="flex-1 flex items-stretch justify-center gap-3 pt-1">
        <div className="w-6 h-full">
          <LevelMeter level={cfg.vu} />
        </div>
        <div className="w-8 h-full">
          <Fader orientation="vertical" min={0} max={100} value={cfg.fader} onChange={cfg.setFader} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 text-[13px] leading-none">&#9672;</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] leading-none text-stone-200">
          Central Mixer
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="font-medium uppercase tracking-widest text-[9px] leading-none text-stone-500">Link</span>
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40" />
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        <div className="flex-1 flex gap-2">
          {renderStrip({
            key: "A",
            letter: "A",
            accentText: "text-amber-300",
            accentDot: "bg-amber-400 shadow-lg shadow-amber-500/40",
            borderCls: "border-amber-500/20",
            glowCls: "ring-1 ring-inset ring-amber-500/40 shadow-amber-500/20",
            gain: gainA,
            setGain: setGainA,
            eq: eqA,
            setEq: setEqA,
            fader: faderA,
            setFader: setFaderA,
            cue: cueA,
            setCue: setCueA,
            vu: vuA,
          })}

          {/* Master center strip */}
          <div className="flex-none w-16 flex flex-col items-center justify-between py-2 px-1 rounded-xl border border-amber-500/20 bg-neutral-900/90 bg-gradient-to-b from-amber-500/5 to-black/50 shadow-2xl shadow-black/60">
            <span className="font-semibold uppercase tracking-widest text-[9px] leading-none text-amber-400">MST</span>
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11">
                <Knob min={0} max={100} value={masterVol} onChange={setMasterVol} />
              </div>
              <span className="font-medium uppercase tracking-widest text-[9px] leading-none text-stone-400">Vol</span>
            </div>
            <div className="w-8 h-px bg-amber-500/20" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10">
                <Knob min={0} max={100} value={phones} onChange={setPhones} />
              </div>
              <span className="flex items-center gap-1 font-medium uppercase tracking-widest text-[9px] leading-none text-stone-400">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 14v-2a8 8 0 0116 0v2" strokeLinecap="round" />
                  <rect x="2.5" y="14" width="4.5" height="6.5" rx="1.5" />
                  <rect x="17" y="14" width="4.5" height="6.5" rx="1.5" />
                </svg>
                Mix
              </span>
            </div>
          </div>

          {renderStrip({
            key: "B",
            letter: "B",
            accentText: "text-violet-300",
            accentDot: "bg-violet-400 shadow-lg shadow-violet-500/40",
            borderCls: "border-violet-500/25",
            glowCls: "ring-1 ring-inset ring-violet-500/40 shadow-violet-500/20",
            gain: gainB,
            setGain: setGainB,
            eq: eqB,
            setEq: setEqB,
            fader: faderB,
            setFader: setFaderB,
            cue: cueB,
            setCue: setCueB,
            vu: vuB,
          })}
        </div>

        {/* Crossfader */}
        <div className="flex-none rounded-xl border border-stone-800/70 bg-stone-950/80 px-3 py-1.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest leading-none">
            <span className="font-mono font-bold text-amber-400">A {aPct}</span>
            <span className="font-medium text-stone-500">Crossfader</span>
            <span className="font-mono font-bold text-violet-300">{bPct} B</span>
          </div>
          <div className="w-full h-7">
            <Fader orientation="horizontal" min={0} max={100} value={crossfade} onChange={setCrossfade} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-6 flex-none flex items-center gap-2 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest leading-none text-stone-500">
        <span>Master</span>
        <span className="font-mono font-bold text-lime-300">{db} dB</span>
        <span className="ml-auto">Xfade</span>
        <span className="font-mono font-bold text-lime-300">{Math.round(crossfade)}%</span>
      </div>
    </div>
  );
}