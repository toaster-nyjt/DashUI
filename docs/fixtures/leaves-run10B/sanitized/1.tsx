export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(62);
  const [gainB, setGainB] = useState(58);

  const [hiA, setHiA] = useState(50);
  const [midA, setMidA] = useState(50);
  const [loA, setLoA] = useState(50);
  const [hiB, setHiB] = useState(50);
  const [midB, setMidB] = useState(50);
  const [loB, setLoB] = useState(50);

  const [faderA, setFaderA] = useState(78);
  const [faderB, setFaderB] = useState(70);
  const [crossfade, setCrossfade] = useState(50);

  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(false);

  const [master, setMaster] = useState(75);
  const [phones, setPhones] = useState(40);

  const [levelA, setLevelA] = useState(0.4);
  const [levelB, setLevelB] = useState(0.35);

  useEffect(() => {
    let raf: number;
    let t = 0;
    const tick = () => {
      t += 0.08;
      const cfA = 1 - crossfade / 100;
      const cfB = crossfade / 100;
      const baseA =
        (gainA / 100) * (faderA / 100) * (0.55 + cfA * 0.45);
      const baseB =
        (gainB / 100) * (faderB / 100) * (0.55 + cfB * 0.45);
      const wobbleA =
        0.5 +
        0.3 * Math.sin(t * 1.7) +
        0.18 * Math.sin(t * 4.3 + 1) +
        0.06 * Math.sin(t * 9.1);
      const wobbleB =
        0.5 +
        0.3 * Math.sin(t * 1.3 + 2) +
        0.18 * Math.sin(t * 3.9 + 0.5) +
        0.06 * Math.sin(t * 8.4 + 1.2);
      setLevelA(Math.max(0, Math.min(1, baseA * (0.75 + wobbleA * 0.6))));
      setLevelB(Math.max(0, Math.min(1, baseB * (0.75 + wobbleB * 0.6))));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gainA, gainB, faderA, faderB, crossfade]);

  const eqLabel = (t: string) => (
    <span className="font-medium uppercase tracking-widest leading-none text-stone-500 text-[9px]">
      {t}
    </span>
  );

  const Channel = (props: {
    accent: "amber" | "violet";
    name: string;
    gain: number;
    setGain: (v: number) => void;
    hi: number;
    setHi: (v: number) => void;
    mid: number;
    setMid: (v: number) => void;
    lo: number;
    setLo: (v: number) => void;
    fader: number;
    setFader: (v: number) => void;
    cue: boolean;
    setCue: (v: boolean) => void;
    level: number;
  }) => {
    const isA = props.accent === "amber";
    const headText = isA ? "text-amber-400" : "text-violet-300";
    const dot = isA ? "bg-amber-400" : "bg-violet-400";
    return (
      <div className="flex-1 flex flex-col gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 shadow-none">
        <div className="flex-none flex items-center justify-center gap-1.5">
          <span className={"h-1.5 w-1.5 rounded-full " + dot} />
          <span
            className={
              "font-semibold uppercase tracking-widest leading-none text-[10px] " +
              headText
            }
          >
            {props.name}
          </span>
        </div>

        {/* Gain trim */}
        <div className="flex-none flex flex-col items-center gap-1">
          <div className="h-8 w-8">
            <Knob min={0} max={100} value={props.gain} onChange={props.setGain} />
          </div>
          {eqLabel("Trim")}
        </div>

        {/* EQ stack */}
        <div className="flex-none flex flex-col items-center gap-1.5">
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-7 w-7">
              <Knob min={0} max={100} value={props.hi} onChange={props.setHi} />
            </div>
            {eqLabel("Hi")}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-7 w-7">
              <Knob min={0} max={100} value={props.mid} onChange={props.setMid} />
            </div>
            {eqLabel("Mid")}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-7 w-7">
              <Knob min={0} max={100} value={props.lo} onChange={props.setLo} />
            </div>
            {eqLabel("Lo")}
          </div>
        </div>

        {/* Fader + meter */}
        <div className="flex-1 flex items-stretch justify-center gap-2 pt-1">
          <div className="flex flex-col items-center">
            <div className="h-full" style={{ width: "1.6rem" }}>
              <Fader
                min={0}
                max={100}
                value={props.fader}
                onChange={props.setFader}
                orientation="vertical"
              />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-full" style={{ width: "1.5rem" }}>
              <LevelMeter level={props.level} />
            </div>
          </div>
        </div>

        {/* Cue */}
        <div className="flex-none flex items-center justify-center">
          <div style={{ width: "3.75rem", height: "1.5rem" }}>
            <ToggleButton on={props.cue} onChange={props.setCue}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </ToggleButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-lg shadow-amber-500/30 animate-pulse" />
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Mixer
        </span>
        <span className="ml-auto font-mono font-bold tracking-tight text-[11px] text-lime-300">
          {crossfade < 45 ? "A" : crossfade > 55 ? "B" : "A/B"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Channel strips */}
        <div className="flex-1 flex items-stretch gap-2">
          <Channel
            accent="amber"
            name="CH 1"
            gain={gainA}
            setGain={setGainA}
            hi={hiA}
            setHi={setHiA}
            mid={midA}
            setMid={setMidA}
            lo={loA}
            setLo={setLoA}
            fader={faderA}
            setFader={setFaderA}
            cue={cueA}
            setCue={setCueA}
            level={levelA}
          />
          <Channel
            accent="violet"
            name="CH 2"
            gain={gainB}
            setGain={setGainB}
            hi={hiB}
            setHi={setHiB}
            mid={midB}
            setMid={setMidB}
            lo={loB}
            setLo={setLoB}
            fader={faderB}
            setFader={setFaderB}
            cue={cueB}
            setCue={setCueB}
            level={levelB}
          />
        </div>

        {/* Crossfader */}
        <div className="flex-none flex flex-col items-center gap-1 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-2">
          <div className="w-full flex items-center justify-between px-1">
            <span className="font-medium uppercase tracking-widest leading-none text-amber-400 text-[9px]">
              A
            </span>
            <span className="font-medium uppercase tracking-widest leading-none text-stone-500 text-[9px]">
              Xfade
            </span>
            <span className="font-medium uppercase tracking-widest leading-none text-violet-300 text-[9px]">
              B
            </span>
          </div>
          <div className="w-full flex justify-center">
            <div style={{ width: "12rem", height: "1.6rem" }} className="max-w-full">
              <Fader
                min={0}
                max={100}
                value={crossfade}
                onChange={setCrossfade}
                orientation="horizontal"
              />
            </div>
          </div>
        </div>

        {/* Master + Phones */}
        <div className="flex-none flex items-stretch justify-around gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-2">
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[9px]">
              Master
            </span>
          </div>
          <div className="w-px self-stretch bg-stone-800/70" />
          <div className="flex flex-col items-center gap-1">
            <div className="h-9 w-9">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[9px]">
              Phones
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}