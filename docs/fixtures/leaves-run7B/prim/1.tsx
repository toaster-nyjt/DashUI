export default function GeneratedComponent() {
  // ---- Channel 1 (Deck A / amber) state ----
  const [gainA, setGainA] = useState(64);
  const [hiA, setHiA] = useState(0);
  const [midA, setMidA] = useState(0);
  const [lowA, setLowA] = useState(0);
  const [faderA, setFaderA] = useState(78);
  const [cueA, setCueA] = useState(false);

  // ---- Channel 2 (Deck B / violet) state ----
  const [gainB, setGainB] = useState(58);
  const [hiB, setHiB] = useState(0);
  const [midB, setMidB] = useState(0);
  const [lowB, setLowB] = useState(0);
  const [faderB, setFaderB] = useState(70);
  const [cueB, setCueB] = useState(false);

  // ---- Master section ----
  const [crossfade, setCrossfade] = useState(50);
  const [master, setMaster] = useState(80);
  const [phones, setPhones] = useState(50);

  // ---- Live VU simulation, driven by fader + gain + crossfade balance ----
  const [vuA, setVuA] = useState(0);
  const [vuB, setVuB] = useState(0);
  const phaseA = useRef(0);
  const phaseB = useRef(0);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      phaseA.current += 0.19 + Math.random() * 0.12;
      phaseB.current += 0.17 + Math.random() * 0.12;
      const xfA = 1 - crossfade / 100;
      const xfB = crossfade / 100;
      const baseA = (faderA / 100) * (0.45 + gainA / 220) * (0.35 + xfA * 0.85);
      const baseB = (faderB / 100) * (0.45 + gainB / 220) * (0.35 + xfB * 0.85);
      const pulseA = (Math.sin(phaseA.current) * 0.5 + 0.5) * 0.5 + (Math.sin(phaseA.current * 2.3) * 0.5 + 0.5) * 0.25;
      const pulseB = (Math.sin(phaseB.current) * 0.5 + 0.5) * 0.5 + (Math.sin(phaseB.current * 1.9) * 0.5 + 0.5) * 0.25;
      setVuA(Math.min(1, baseA * (0.55 + pulseA)));
      setVuB(Math.min(1, baseB * (0.55 + pulseB)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [faderA, faderB, gainA, gainB, crossfade]);

  const masterDb = useMemo(() => {
    const v = master / 100;
    if (v <= 0) return "-\u221e";
    return (Math.round((-40 + v * 40) * 10) / 10).toFixed(1);
  }, [master]);

  const Ch = (accent: "amber" | "violet") => accent === "amber"
    ? { dot: "bg-amber-400", txt: "text-amber-400", ring: "ring-amber-500/40" }
    : { dot: "bg-violet-400", txt: "text-violet-300", ring: "ring-violet-500/40" };

  const eqRow = (
    label: string,
    hi: number, setHi: (v: number) => void,
    mid: number, setMid: (v: number) => void,
    low: number, setLow: (v: number) => void,
  ) => (
    <div className="flex flex-col items-center gap-1">
      {[["HI", hi, setHi], ["MID", mid, setMid], ["LOW", low, setLow]].map((e, i) => (
        <div key={"eq-" + label + i} className="flex flex-col items-center gap-0.5">
          <div className="h-8 w-8">
            <Knob min={-12} max={12} value={e[1] as number} onChange={e[2] as (v: number) => void} />
          </div>
          <span className="font-medium uppercase tracking-widest leading-none text-stone-500 text-[9px]">{e[0] as string}</span>
        </div>
      ))}
    </div>
  );

  const channelStrip = (
    which: "A" | "B",
    accent: "amber" | "violet",
    gain: number, setGain: (v: number) => void,
    hi: number, setHi: (v: number) => void,
    mid: number, setMid: (v: number) => void,
    low: number, setLow: (v: number) => void,
    fader: number, setFader: (v: number) => void,
    cue: boolean, setCue: (v: boolean) => void,
    vu: number,
  ) => {
    const c = Ch(accent);
    return (
      <div className="flex flex-1 basis-0 min-w-0 min-h-0 flex-col items-center gap-1.5 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 shadow-none">
        {/* channel header */}
        <div className="flex w-full items-center justify-center gap-1.5">
          <span className={"h-1.5 w-1.5 rounded-full " + c.dot + " shadow-lg shadow-black/50"} />
          <span className={"font-semibold uppercase tracking-widest leading-none text-[10px] " + c.txt}>CH {which === "A" ? "1" : "2"}</span>
        </div>

        {/* gain trim */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="h-8 w-8">
            <Knob min={0} max={100} value={gain} onChange={setGain} />
          </div>
          <span className="font-medium uppercase tracking-widest leading-none text-stone-500 text-[9px]">TRIM</span>
        </div>

        {/* eq */}
        {eqRow(which, hi, setHi, mid, setMid, low, setLow)}

        {/* fader + VU meter row */}
        <div className="flex flex-1 min-h-0 w-full items-stretch justify-center gap-2 pt-0.5">
          <div className="flex w-6 items-stretch justify-center">
            <Fader min={0} max={100} value={fader} onChange={setFader} orientation="vertical" />
          </div>
          <div className="flex w-4 items-stretch justify-center">
            <LevelMeter level={vu} />
          </div>
        </div>

        {/* cue / PFL */}
        <div className="w-full">
          <ToggleButton on={cue} onChange={setCue}>CUE</ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="flex h-8 items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 text-[11px]">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Mixer</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="font-medium uppercase tracking-widest leading-none text-stone-500 text-[9px]">MST</span>
          <span className="font-mono font-bold tracking-tight text-lime-300 text-[11px]">{masterDb}<span className="text-stone-500">dB</span></span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Two channel strips */}
        <div className="flex flex-1 min-h-0 items-stretch gap-2">
          {channelStrip("A", "amber", gainA, setGainA, hiA, setHiA, midA, setMidA, lowA, setLowA, faderA, setFaderA, cueA, setCueA, vuA)}
          {channelStrip("B", "violet", gainB, setGainB, hiB, setHiB, midB, setMidB, lowB, setLowB, faderB, setFaderB, cueB, setCueB, vuB)}
        </div>

        {/* Master row: master vol + headphone mix */}
        <div className="flex items-stretch gap-2">
          <div className="flex flex-1 basis-0 min-w-0 flex-col items-center gap-1 rounded-xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2">
            <div className="h-9 w-9">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-amber-400/90 text-[9px]">MASTER</span>
          </div>
          <div className="flex flex-1 basis-0 min-w-0 flex-col items-center gap-1 rounded-xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2">
            <div className="h-9 w-9">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[9px]">PHONES</span>
          </div>
        </div>

        {/* Crossfader */}
        <div className="flex flex-col gap-1 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold uppercase tracking-widest leading-none text-amber-400 text-[9px]">A</span>
            <span className="font-medium uppercase tracking-widest leading-none text-stone-500 text-[9px]">XFADE</span>
            <span className="font-semibold uppercase tracking-widest leading-none text-violet-300 text-[9px]">B</span>
          </div>
          <div className="flex w-full items-center">
            <Fader min={0} max={100} value={crossfade} onChange={setCrossfade} orientation="horizontal" />
          </div>
        </div>
      </div>
    </div>
  );
}