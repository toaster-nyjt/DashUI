export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(0);
  const [gainB, setGainB] = useState(-1);
  const [hiA, setHiA] = useState(2);
  const [midA, setMidA] = useState(0);
  const [lowA, setLowA] = useState(-3);
  const [hiB, setHiB] = useState(-1);
  const [midB, setMidB] = useState(1);
  const [lowB, setLowB] = useState(3);
  const [faderA, setFaderA] = useState(85);
  const [faderB, setFaderB] = useState(72);
  const [crossfade, setCrossfade] = useState(50);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);
  const [master, setMaster] = useState(80);
  const [phones, setPhones] = useState(50);

  const [beat, setBeat] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setBeat((b) => (b + 1) % 1000), 90);
    return () => clearInterval(id);
  }, []);

  // Derived VU levels: base on channel fader + gain, modulated by crossfade blend and a pulsing groove
  const xA = 1 - crossfade / 100;
  const xB = crossfade / 100;
  const grooveA = 0.55 + 0.45 * Math.abs(Math.sin(beat * 0.35));
  const grooveB = 0.5 + 0.5 * Math.abs(Math.sin(beat * 0.28 + 1.2));
  const levelA = Math.max(
    0,
    Math.min(1, (faderA / 100) * (0.6 + (gainA + 12) / 40) * (0.35 + 0.65 * xA) * grooveA)
  );
  const levelB = Math.max(
    0,
    Math.min(1, (faderB / 100) * (0.6 + (gainB + 12) / 40) * (0.35 + 0.65 * xB) * grooveB)
  );

  const eqRow = (
    label: string,
    v: number,
    set: (n: number) => void,
    accent: string
  ) => (
    <div className="flex flex-col items-center gap-0.5 min-w-0 flex-1">
      <div className="w-full flex-1 min-h-0">
        <Knob min={-12} max={12} value={v} onChange={set} />
      </div>
      <span className={"text-[8px] font-semibold uppercase tracking-widest leading-none " + accent}>
        {label}
      </span>
    </div>
  );

  const channelStrip = (side: "A" | "B") => {
    const isA = side === "A";
    const idText = isA ? "text-amber-400" : "text-teal-300";
    const idBg = isA ? "bg-amber-500/15 border-amber-400/30" : "bg-teal-500/15 border-teal-400/30";
    const gain = isA ? gainA : gainB;
    const setGain = isA ? setGainA : setGainB;
    const hi = isA ? hiA : hiB;
    const setHi = isA ? setHiA : setHiB;
    const mid = isA ? midA : midB;
    const setMid = isA ? setMidA : setMidB;
    const low = isA ? lowA : lowB;
    const setLow = isA ? setLowA : setLowB;
    const fader = isA ? faderA : faderB;
    const setFader = isA ? setFaderA : setFaderB;
    const cue = isA ? cueA : cueB;
    const setCue = isA ? setCueA : setCueB;
    const level = isA ? levelA : levelB;

    return (
      <div className="flex flex-col min-w-0 flex-1 min-h-0 gap-1.5">
        {/* channel id + gain */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={
              "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border leading-none " +
              idText +
              " " +
              idBg
            }
          >
            CH{isA ? "1" : "2"}
          </span>
          <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
            <div className="w-full flex-1 min-h-0 max-h-[34px]">
              <Knob min={-12} max={12} value={gain} onChange={setGain} />
            </div>
            <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">
              Gain
            </span>
          </div>
        </div>

        {/* 3-band EQ */}
        <div className="flex gap-1 min-w-0">
          {eqRow("Hi", hi, setHi, idText)}
          {eqRow("Mid", mid, setMid, idText)}
          {eqRow("Low", low, setLow, idText)}
        </div>

        {/* fader + VU */}
        <div className="flex-1 min-h-0 flex gap-1.5 items-stretch">
          <div className="flex-1 min-w-0 min-h-0">
            <Fader min={0} max={100} value={fader} onChange={setFader} orientation="vertical" />
          </div>
          <div className="w-2.5 min-h-0 rounded-full overflow-hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
            <LevelMeter level={level} />
          </div>
        </div>

        {/* cue / PFL */}
        <div className="h-6 min-w-0">
          <ToggleButton on={cue} onChange={setCue}>
            <span className="text-[9px] font-bold uppercase tracking-widest">Cue</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-[radial-gradient(120%_120%_at_50%_-10%,#221a10_0%,#0c0b0a_55%,#050505_100%)] text-neutral-100">
      {/* header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-rose-300/90">
          Mixer
        </span>
        <span className="text-[9px] font-mono tracking-wide text-neutral-500 tabular-nums">
          XF {crossfade < 48 ? "A" + (100 - crossfade) : crossfade > 52 ? "B" + crossfade : "CTR"}
        </span>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col gap-2.5">
        {/* twin channel strips */}
        <div className="flex-1 min-h-0 flex gap-3">
          {channelStrip("A")}
          <div className="w-px bg-white/[0.06] self-stretch" />
          {channelStrip("B")}
        </div>

        {/* crossfader */}
        <div className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 leading-none">
              A
            </span>
            <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500 leading-none">
              Crossfade
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-teal-300 leading-none">
              B
            </span>
          </div>
          <div className="h-6 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] px-1.5 flex items-center">
            <Fader min={0} max={100} value={crossfade} onChange={setCrossfade} orientation="horizontal" />
          </div>
        </div>

        {/* master + phones */}
        <div className="shrink-0 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-rose-400/20 bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 px-2 py-1.5 min-w-0">
            <div className="w-9 h-9 shrink-0">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-semibold uppercase tracking-widest text-rose-300/90 leading-none">
                Master
              </span>
              <span className="font-mono text-sm font-bold tabular-nums leading-none text-amber-300 mt-0.5">
                {master}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 px-2 py-1.5 min-w-0">
            <div className="w-9 h-9 shrink-0">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">
                Phones
              </span>
              <span className="font-mono text-sm font-bold tabular-nums leading-none text-neutral-200 mt-0.5">
                {phones}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}