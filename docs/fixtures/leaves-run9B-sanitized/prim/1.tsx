export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(62);
  const [gainB, setGainB] = useState(55);

  const [hiA, setHiA] = useState(50);
  const [midA, setMidA] = useState(48);
  const [lowA, setLowA] = useState(58);

  const [hiB, setHiB] = useState(52);
  const [midB, setMidB] = useState(50);
  const [lowB, setLowB] = useState(45);

  const [faderA, setFaderA] = useState(76);
  const [faderB, setFaderB] = useState(64);

  const [crossfade, setCrossfade] = useState(50);

  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);

  const [master, setMaster] = useState(70);
  const [phones, setPhones] = useState(40);

  const [levelA, setLevelA] = useState(0.4);
  const [levelB, setLevelB] = useState(0.3);

  useEffect(() => {
    const id = setInterval(() => {
      const cf = crossfade / 100;
      const targetA = (faderA / 100) * (gainA / 100) * (1 - cf * 0.85);
      const targetB = (faderB / 100) * (gainB / 100) * (0.15 + cf * 0.85);
      setLevelA((prev) => {
        const jitter = (Math.random() - 0.45) * 0.28;
        return Math.max(0.02, Math.min(1, targetA * 1.15 + jitter));
      });
      setLevelB((prev) => {
        const jitter = (Math.random() - 0.45) * 0.28;
        return Math.max(0.02, Math.min(1, targetB * 1.15 + jitter));
      });
    }, 110);
    return () => clearInterval(id);
  }, [faderA, faderB, gainA, gainB, crossfade]);

  const cf = crossfade / 100;

  const Strip = (props) => {
    const {
      accent,
      label,
      gain,
      setGain,
      hi,
      setHi,
      mid,
      setMid,
      low,
      setLow,
      fader,
      setFader,
      cue,
      setCue,
      level,
    } = props;

    const isA = accent === "amber";
    const dot = isA ? "bg-amber-400" : "bg-violet-400";
    const lbl = isA ? "text-amber-400" : "text-violet-300";

    return (
      <div className="flex flex-col flex-1 gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 shadow-none">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={"h-1.5 w-1.5 rounded-full " + dot + " animate-pulse"} />
            <span className={"font-semibold uppercase tracking-widest text-[10px] " + lbl + " truncate"}>
              {label}
            </span>
          </div>
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600">
            CH
          </span>
        </div>

        {/* Gain trim */}
        <div className="flex flex-col items-center gap-1">
          <div className="h-9 w-9">
            <Knob min={0} max={100} value={gain} onChange={setGain} />
          </div>
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
            Trim
          </span>
        </div>

        {/* EQ knobs */}
        <div className="flex flex-col gap-1.5">
          {[
            { name: "Hi", v: hi, set: setHi },
            { name: "Mid", v: mid, set: setMid },
            { name: "Low", v: low, set: setLow },
          ].map((band) => (
            <div key={band.name} className="flex items-center gap-2">
              <div className="h-8 w-8 flex-none">
                <Knob min={-12} max={12} value={((band.v - 50) / 50) * 12} onChange={(val) => band.set(((val / 12) * 50) + 50)} />
              </div>
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500 flex-1 min-w-0 truncate">
                {band.name}
              </span>
            </div>
          ))}
        </div>

        {/* Fader + VU meter */}
        <div className="flex flex-1 items-stretch justify-center gap-2 pt-0.5">
          <div className="flex flex-col items-center justify-end">
            <div className="w-6 flex-1 flex items-center justify-center">
              <div className="h-full w-[1.6rem]">
                <Fader min={0} max={100} value={fader} onChange={setFader} orientation="vertical" />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-end">
            <div className="w-4 flex-1 flex items-stretch justify-center">
              <div className="h-full w-[1.5rem]">
                <LevelMeter level={level} />
              </div>
            </div>
          </div>
        </div>

        {/* Cue / PFL */}
        <div className="h-6 flex items-stretch">
          <ToggleButton on={cue} onChange={setCue}>
            <span className="font-semibold uppercase tracking-wider">Cue</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 rounded-none">
      {/* Header */}
      <div className="h-8 flex-none flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-1.5">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Mixer
        </span>
        <span className="ml-auto font-mono font-bold tracking-tight text-lime-300 text-[11px]">
          {Math.round(master)}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* Channel strips */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          <Strip
            accent="amber"
            label="Deck A"
            gain={gainA}
            setGain={setGainA}
            hi={hiA}
            setHi={setHiA}
            mid={midA}
            setMid={setMidA}
            low={lowA}
            setLow={setLowA}
            fader={faderA}
            setFader={setFaderA}
            cue={cueA}
            setCue={setCueA}
            level={levelA}
          />
          <Strip
            accent="violet"
            label="Deck B"
            gain={gainB}
            setGain={setGainB}
            hi={hiB}
            setHi={setHiB}
            mid={midB}
            setMid={setMidB}
            low={lowB}
            setLow={setLowB}
            fader={faderB}
            setFader={setFaderB}
            cue={cueB}
            setCue={setCueB}
            level={levelB}
          />
        </div>

        {/* Crossfader */}
        <div className="flex-none rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className={"font-mono font-bold tracking-tight text-[11px] " + (cf < 0.4 ? "text-amber-400" : "text-stone-600")}>A</span>
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
              Crossfade
            </span>
            <span className={"font-mono font-bold tracking-tight text-[11px] " + (cf > 0.6 ? "text-violet-300" : "text-stone-600")}>B</span>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-full h-[1.6rem]" style={{ width: "12rem" }}>
              <Fader min={0} max={100} value={crossfade} onChange={setCrossfade} orientation="horizontal" />
            </div>
          </div>
        </div>

        {/* Master + Phones */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 flex items-center gap-2">
            <div className="h-10 w-10 flex-none">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400 truncate">
                Master
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-400 text-[11px] mt-0.5">
                {Math.round(master)}
              </span>
            </div>
          </div>
          <div className="flex-1 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 flex items-center gap-2">
            <div className="h-10 w-10 flex-none">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400 truncate">
                Phones
              </span>
              <span className="font-mono font-bold tracking-tight text-violet-300 text-[11px] mt-0.5">
                {Math.round(phones)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="h-6 flex-none flex items-center px-3 border-t border-stone-800/70 bg-stone-950/70 gap-3">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">A</span>
        <span className="font-mono text-[10px] tracking-tight text-lime-300">{Math.round(levelA * 100)}</span>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-stone-500">B</span>
        <span className="font-mono text-[10px] tracking-tight text-lime-300">{Math.round(levelB * 100)}</span>
      </div>
    </div>
  );
}
