export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(1);
  const [gainB, setGainB] = useState(1);
  const [eqA, setEqA] = useState({ low: 0, mid: 0, high: 0 });
  const [eqB, setEqB] = useState({ low: 0, mid: 0, high: 0 });
  const [faderA, setFaderA] = useState(0.85);
  const [faderB, setFaderB] = useState(0.85);
  const [crossfade, setCrossfade] = useState(0.5);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);
  const [masterVol, setMasterVol] = useState(0.75);
  const [hpMix, setHpMix] = useState(0.5);
  const [levelA, setLevelA] = useState(0.4);
  const [levelB, setLevelB] = useState(0.4);
  const tRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tRef.current += 1;
      const t = tRef.current;
      const xa = Math.max(0, 1 - crossfade * 1.4);
      const xb = Math.max(0, (crossfade - 0.1) * 1.4);
      const jA = 0.15 * Math.sin(t * 0.7) + 0.1 * Math.random();
      const jB = 0.15 * Math.sin(t * 0.55 + 1.3) + 0.1 * Math.random();
      setLevelA(Math.max(0, Math.min(1, faderA * gainA * xa + jA)));
      setLevelB(Math.max(0, Math.min(1, faderB * gainB * xb + jB)));
    }, 120);
    return () => clearInterval(id);
  }, [faderA, faderB, gainA, gainB, crossfade]);

  const ChannelStrip = ({
    accent,
    label,
    gain,
    setGain,
    eq,
    setEq,
    level,
    fader,
    setFader,
    cue,
    setCue,
  }: any) => {
    const accentText = accent === "amber" ? "text-amber-400" : "text-violet-300";
    return (
      <div className="flex-1 flex flex-col items-stretch gap-1">
        <div className={"text-[10px] font-medium uppercase tracking-widest text-center " + accentText}>
          {label}
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[9px] uppercase tracking-widest text-stone-500">Gain</span>
          <div className="w-8 h-8">
            <Knob min={0} max={2} value={gain} onChange={setGain} />
          </div>
        </div>

        <div className="flex flex-row justify-between px-0.5">
          {["low", "mid", "high"].map((band) => (
            <div key={"eq-" + label + "-" + band} className="flex flex-col items-center gap-0.5">
              <span className="text-[8px] uppercase tracking-widest text-stone-500">
                {band === "low" ? "Lo" : band === "mid" ? "Md" : "Hi"}
              </span>
              <div className="w-8 h-8">
                <Knob
                  min={-12}
                  max={12}
                  value={eq[band]}
                  onChange={(v: number) => setEq((prev: any) => ({ ...prev, [band]: v }))}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-row items-center justify-center gap-2 flex-1">
          <div className="w-6 h-16">
            <LevelMeter level={level} />
          </div>
          <div className="w-7 h-24">
            <Fader min={0} max={1} value={fader} onChange={setFader} orientation="vertical" />
          </div>
        </div>

        <div className="flex flex-row justify-center">
          <div className="w-8 h-6">
            <ToggleButton on={cue} onChange={setCue}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </ToggleButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      <div className="h-8 flex-none flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-1.5">●</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Central Mixer
        </span>
      </div>

      <div className="flex-1 flex flex-col p-2 gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex flex-row gap-2">
          <ChannelStrip
            accent="amber"
            label="Ch 1"
            gain={gainA}
            setGain={setGainA}
            eq={eqA}
            setEq={setEqA}
            level={levelA}
            fader={faderA}
            setFader={setFaderA}
            cue={cueA}
            setCue={setCueA}
          />

          <div className="flex flex-col items-center justify-center gap-2 px-1 border-x border-amber-500/10">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-stone-500">Master</span>
              <div className="w-8 h-8">
                <Knob min={0} max={1} value={masterVol} onChange={setMasterVol} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] uppercase tracking-widest text-stone-500">HP Mix</span>
              <div className="w-8 h-8">
                <Knob min={0} max={1} value={hpMix} onChange={setHpMix} />
              </div>
            </div>
          </div>

          <ChannelStrip
            accent="violet"
            label="Ch 2"
            gain={gainB}
            setGain={setGainB}
            eq={eqB}
            setEq={setEqB}
            level={levelB}
            fader={faderB}
            setFader={setFaderB}
            cue={cueB}
            setCue={setCueB}
          />
        </div>

        <div className="flex-none flex flex-col items-stretch gap-1">
          <div className="flex flex-row justify-between px-1">
            <span className="text-[9px] font-medium uppercase tracking-widest text-amber-400">A</span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-stone-500">
              Crossfader
            </span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-violet-300">B</span>
          </div>
          <div className="w-full h-7">
            <Fader min={0} max={1} value={crossfade} onChange={setCrossfade} orientation="horizontal" />
          </div>
        </div>
      </div>
    </div>
  );
}