export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(62);
  const [gainB, setGainB] = useState(58);

  const [hiA, setHiA] = useState(6);
  const [midA, setMidA] = useState(-2);
  const [lowA, setLowA] = useState(3);

  const [hiB, setHiB] = useState(-3);
  const [midB, setMidB] = useState(4);
  const [lowB, setLowB] = useState(1);

  const [faderA, setFaderA] = useState(78);
  const [faderB, setFaderB] = useState(71);

  const [crossfade, setCrossfade] = useState(50);

  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);

  const [master, setMaster] = useState(80);
  const [phones, setPhones] = useState(40);

  const [levelA, setLevelA] = useState(0.5);
  const [levelB, setLevelB] = useState(0.5);

  useEffect(() => {
    let raf: number;
    let t = 0;
    const tick = () => {
      t += 0.09;
      const xf = crossfade / 100;
      const aWeight = 1 - xf * 0.85;
      const bWeight = 0.15 + xf * 0.85;
      const baseA =
        (0.55 + 0.45 * Math.sin(t * 1.7)) *
        (0.4 + 0.6 * Math.abs(Math.sin(t * 0.9)));
      const baseB =
        (0.5 + 0.5 * Math.sin(t * 2.3 + 1.1)) *
        (0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + 0.6)));
      const la =
        baseA * (gainA / 100) * (faderA / 100) * aWeight * (0.8 + master / 250);
      const lb =
        baseB * (gainB / 100) * (faderB / 100) * bWeight * (0.8 + master / 250);
      setLevelA(Math.max(0, Math.min(1, la + Math.random() * 0.05)));
      setLevelB(Math.max(0, Math.min(1, lb + Math.random() * 0.05)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gainA, gainB, faderA, faderB, crossfade, master]);

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 leading-none text-center truncate w-full">
      {children}
    </div>
  );

  const EqKnob = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-1">
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <div className="h-full aspect-square max-w-full">
          <Knob min={-12} max={12} value={value} onChange={onChange} />
        </div>
      </div>
      <Label>{label}</Label>
    </div>
  );

  const ChannelStrip = ({
    deck,
    accent,
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
  }: any) => {
    const isA = deck === "A";
    const accentText = isA ? "text-amber-400" : "text-teal-300";
    const accentBg = isA ? "bg-amber-500/15" : "bg-teal-500/15";
    const accentBorder = isA ? "border-amber-400/30" : "border-teal-400/30";
    return (
      <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-1.5">
        <div
          className={
            "shrink-0 h-5 rounded-md flex items-center justify-center border " +
            accentBg +
            " " +
            accentBorder
          }
        >
          <span
            className={
              "text-[10px] font-bold tracking-widest uppercase " + accentText
            }
          >
            CH{isA ? "1" : "2"}
          </span>
        </div>

        {/* Gain trim */}
        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <div className="h-9 aspect-square">
            <Knob min={0} max={100} value={gain} onChange={setGain} />
          </div>
          <Label>Trim</Label>
        </div>

        {/* 3-band EQ */}
        <div className="flex-1 min-h-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 px-1 py-1 flex flex-col">
          <EqKnob label="Hi" value={hi} onChange={setHi} />
          <EqKnob label="Mid" value={mid} onChange={setMid} />
          <EqKnob label="Low" value={low} onChange={setLow} />
        </div>

        {/* Fader + VU */}
        <div className="flex-[1.4] min-h-0 flex items-stretch gap-1.5">
          <div className="w-2.5 rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 overflow-hidden flex flex-col justify-end p-0.5">
            <LevelMeter level={level} />
          </div>
          <div className="flex-1 min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 flex items-center justify-center py-1">
            <Fader
              min={0}
              max={100}
              value={fader}
              onChange={setFader}
              orientation="vertical"
            />
          </div>
        </div>

        {/* Cue / PFL */}
        <div className="shrink-0 h-7">
          <ToggleButton on={cue} onChange={setCue}>
            <span className="text-[10px] font-bold tracking-widest">CUE</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-[radial-gradient(120%_120%_at_50%_-10%,#221a10_0%,#0c0b0a_55%,#050505_100%)]">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-rose-300/90">
          Central Mixer
        </span>
        <span className="text-[10px] font-mono tabular-nums tracking-wide text-neutral-500">
          MSTR {master}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-2.5 flex flex-col gap-2">
        {/* Channels */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          <ChannelStrip
            deck="A"
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

          {/* Master column */}
          <div className="w-16 shrink-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0 rounded-lg bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 border border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center gap-0.5 px-1 py-2">
              <div className="w-full aspect-square max-h-[46%]">
                <Knob min={0} max={100} value={master} onChange={setMaster} />
              </div>
              <Label>Master</Label>
            </div>
            <div className="flex-1 min-h-0 rounded-lg bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 border border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center gap-0.5 px-1 py-2">
              <div className="w-full aspect-square max-h-[46%]">
                <Knob min={0} max={100} value={phones} onChange={setPhones} />
              </div>
              <Label>Phones</Label>
            </div>
          </div>

          <ChannelStrip
            deck="B"
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
        <div className="shrink-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400">
              A
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
              Crossfade
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-teal-300">
              B
            </span>
          </div>
          <div className="h-7 w-full flex items-center">
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
    </div>
  );
}