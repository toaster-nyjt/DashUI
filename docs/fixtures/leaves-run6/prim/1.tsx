export default function GeneratedComponent() {
  // ---- Channel 1 (Deck A / amber) state ----
  const [gainA, setGainA] = useState(64);
  const [hiA, setHiA] = useState(0);
  const [midA, setMidA] = useState(2);
  const [lowA, setLowA] = useState(-1);
  const [faderA, setFaderA] = useState(78);
  const [cueA, setCueA] = useState(false);

  // ---- Channel 2 (Deck B / violet) state ----
  const [gainB, setGainB] = useState(58);
  const [hiB, setHiB] = useState(-2);
  const [midB, setMidB] = useState(1);
  const [lowB, setLowB] = useState(3);
  const [faderB, setFaderB] = useState(71);
  const [cueB, setCueB] = useState(true);

  // ---- Master / crossfade ----
  const [crossfade, setCrossfade] = useState(50);
  const [master, setMaster] = useState(80);
  const [phones, setPhones] = useState(45);

  // ---- Live meter simulation ----
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, []);

  const xf = crossfade / 100; // 0 = full A, 1 = full B

  // pseudo-random pumping level derived from tick + channel params
  const meterA = useMemo(() => {
    const base = (faderA / 100) * (gainA / 100) * (1 - xf * 0.85);
    const wob = (Math.sin(tick * 0.7) * 0.18 + Math.sin(tick * 1.9 + 1) * 0.1 + 0.72);
    return Math.max(0, Math.min(1, base * wob * 1.5));
  }, [faderA, gainA, xf, tick]);

  const meterB = useMemo(() => {
    const base = (faderB / 100) * (gainB / 100) * (0.15 + xf * 0.85);
    const wob = (Math.sin(tick * 0.9 + 2) * 0.18 + Math.sin(tick * 1.6) * 0.1 + 0.72);
    return Math.max(0, Math.min(1, base * wob * 1.5));
  }, [faderB, gainB, xf, tick]);

  const EqRow = (props: {
    label: string;
    val: number;
    set: (v: number) => void;
  }) => (
    <div className="flex flex-1 basis-0 min-h-0 flex-col items-center justify-center gap-1">
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <div className="h-full aspect-square max-h-full">
          <Knob min={-12} max={12} value={props.val} onChange={props.set} />
        </div>
      </div>
      <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
        {props.label}
      </span>
    </div>
  );

  const ChannelStrip = (props: {
    accent: "amber" | "violet";
    name: string;
    gain: number;
    setGain: (v: number) => void;
    hi: number;
    setHi: (v: number) => void;
    mid: number;
    setMid: (v: number) => void;
    low: number;
    setLow: (v: number) => void;
    fader: number;
    setFader: (v: number) => void;
    cue: boolean;
    setCue: (v: boolean) => void;
    meter: number;
  }) => {
    const isA = props.accent === "amber";
    return (
      <div
        className={
          "flex flex-1 basis-0 min-w-0 min-h-0 flex-col rounded-xl border bg-stone-950/80 p-2 gap-1.5 shadow-none " +
          (isA ? "border-amber-500/25" : "border-violet-500/25")
        }
      >
        {/* Channel label */}
        <div className="flex items-center justify-between">
          <span
            className={
              "font-semibold uppercase tracking-widest text-[10px] " +
              (isA ? "text-amber-400" : "text-violet-300")
            }
          >
            {props.name}
          </span>
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (isA ? "bg-amber-500" : "bg-violet-500")
            }
          />
        </div>

        {/* Gain trim */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="h-9 w-9">
            <Knob min={0} max={100} value={props.gain} onChange={props.setGain} />
          </div>
          <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-500">
            Trim
          </span>
        </div>

        {/* 3-band EQ */}
        <div className="flex flex-col flex-1 min-h-0 gap-0.5">
          <EqRow label="Hi" val={props.hi} set={props.setHi} />
          <EqRow label="Mid" val={props.mid} set={props.setMid} />
          <EqRow label="Low" val={props.low} set={props.setLow} />
        </div>

        {/* VU + fader row */}
        <div className="flex flex-1 basis-0 min-h-0 gap-1.5">
          {/* VU meter */}
          <div className="flex flex-col items-center min-w-0">
            <div className="flex-1 min-h-0 w-6 flex items-stretch justify-center">
              <LevelMeter level={props.meter} />
            </div>
          </div>
          {/* Channel fader */}
          <div className="flex flex-1 basis-0 min-w-0 flex-col items-center">
            <div className="flex-1 min-h-0 flex items-stretch justify-center">
              <Fader
                min={0}
                max={100}
                value={props.fader}
                onChange={props.setFader}
                orientation="vertical"
              />
            </div>
          </div>
        </div>

        {/* Cue / PFL */}
        <ToggleButton on={props.cue} onChange={props.setCue}>
          CUE
        </ToggleButton>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header */}
      <div className="h-8 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-1.5">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Mixer
        </span>
        <div className="ml-auto flex items-center gap-1 text-[9px] uppercase tracking-widest text-stone-500">
          <span className="text-amber-400">A</span>
          <span>/</span>
          <span className="text-violet-300">B</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col p-2 gap-2">
        {/* Channel strips */}
        <div className="flex flex-1 min-h-0 gap-2">
          <ChannelStrip
            accent="amber"
            name="CH 1"
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
            meter={meterA}
          />

          {/* Master column */}
          <div className="flex flex-col items-center justify-between rounded-xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 px-2 py-2 gap-2 shadow-2xl shadow-black/60">
            <div className="flex flex-col items-center gap-1">
              <div className="h-11 w-11">
                <Knob min={0} max={100} value={master} onChange={setMaster} />
              </div>
              <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-amber-400">
                Master
              </span>
              <span className="font-mono font-bold text-[10px] text-lime-300 leading-none">
                {master}
              </span>
            </div>

            <div className="w-full h-px bg-stone-800/70" />

            <div className="flex flex-col items-center gap-1">
              <div className="h-9 w-9">
                <Knob min={0} max={100} value={phones} onChange={setPhones} />
              </div>
              <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-400 text-center">
                Phones
              </span>
            </div>
          </div>

          <ChannelStrip
            accent="violet"
            name="CH 2"
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
            meter={meterB}
          />
        </div>

        {/* Crossfader */}
        <div className="flex flex-col gap-1 rounded-xl border border-stone-800/70 bg-stone-950/80 px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[10px] text-amber-400">A</span>
            <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-500">
              Crossfade
            </span>
            <span className="font-semibold text-[10px] text-violet-300">B</span>
          </div>
          <div className="w-full flex items-center">
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