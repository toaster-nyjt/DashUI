export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(72);
  const [gainB, setGainB] = useState(58);
  const [eqA, setEqA] = useState({ hi: 2, mid: -1, low: 4 });
  const [eqB, setEqB] = useState({ hi: -3, mid: 1, low: 0 });
  const [volA, setVolA] = useState(82);
  const [volB, setVolB] = useState(64);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(76);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 110);
    return () => clearInterval(id);
  }, []);

  const wob = (seed: number) => 0.72 + 0.28 * Math.abs(Math.sin(pulse * 0.42 + seed));

  const gateA = Math.min(1, (1 - xf) / 1.0 + 0.0);
  const gateB = Math.min(1, (1 + xf) / 1.0 + 0.0);
  const lvlA = Math.max(0, Math.min(1, (volA / 100) * (gainA / 100 + 0.35) * gateA * wob(0)));
  const lvlB = Math.max(0, Math.min(1, (volB / 100) * (gainB / 100 + 0.35) * gateB * wob(2.1)));
  const mstL = Math.min(1, (lvlA * 0.9 + lvlB * 0.7) * (master / 100));
  const mstR = Math.min(1, (lvlB * 0.9 + lvlA * 0.7) * (master / 100));

  const Label = (p: { children: any; tone?: string }) => (
    <span className={"text-[10px] font-medium tracking-widest uppercase leading-none " + (p.tone || "text-neutral-400")}>
      {p.children}
    </span>
  );

  const strip = (
    deck: "A" | "B",
    gain: number,
    setGain: (v: number) => void,
    eq: { hi: number; mid: number; low: number },
    setEq: (e: any) => void,
    vol: number,
    setVol: (v: number) => void,
    cue: boolean,
    setCue: (v: boolean) => void
  ) => {
    const accent = deck === "A" ? "text-amber-300" : "text-teal-300";
    const ring = deck === "A" ? "border-amber-500/25" : "border-teal-400/25";
    return (
      <div className={"flex flex-col items-center gap-2 rounded-2xl border p-2 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 " + ring}>
        <div className="flex items-center gap-2">
          <span className={"font-mono text-sm font-bold tracking-tight " + accent + " drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]"}>
            CH {deck}
          </span>
          <span className={"h-1.5 w-1.5 rounded-full transition-all duration-500 " + (deck === "A" ? "bg-amber-400" : "bg-teal-400")} style={{ opacity: 0.35 + (deck === "A" ? lvlA : lvlB) * 0.65 }} />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-[2.6rem] w-[2.6rem]">
            <Knob value={gain} min={0} max={100} onChange={setGain} mode="continuous" />
          </div>
          <Label>Gain</Label>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          {([["HI", "hi"], ["MID", "mid"], ["LOW", "low"]] as const).map(([lab, key]) => (
            <div key={key} className="flex flex-col items-center gap-0.5">
              <div className="h-[2.6rem] w-[2.6rem]">
                <Knob
                  value={(eq as any)[key]}
                  min={-12}
                  max={12}
                  bipolar
                  onChange={(v) => setEq({ ...eq, [key]: v })}
                />
              </div>
              <Label>{lab}</Label>
            </div>
          ))}
        </div>

        <div className="h-[1.9rem] w-[3.6rem]">
          <ToggleButton on={cue} onChange={setCue} tone={cue ? "accent" : "neutral"}>
            <span className="font-mono font-semibold tracking-wider">CUE</span>
          </ToggleButton>
        </div>

        <div className="flex items-end gap-2">
          <div className="h-[9.5rem] w-[2.4rem]">
            <Fader value={vol} min={0} max={100} onChange={setVol} orientation="vertical" detents={[0, 50, 100]} />
          </div>
          <div className="h-[9.5rem] w-[1.1rem]">
            <LevelMeter level={deck === "A" ? lvlA : lvlB} peak={deck === "A" ? Math.min(1, lvlA + 0.08) : Math.min(1, lvlB + 0.08)} orientation="vertical" />
          </div>
        </div>
        <Label>Volume</Label>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.7)] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Central Mixer</span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
          A <span className="text-amber-300">{Math.round((1 - Math.max(0, xf)) * 100)}%</span> · B{" "}
          <span className="text-teal-300">{Math.round((1 - Math.max(0, -xf)) * 100)}%</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.07),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          {strip("A", gainA, setGainA, eqA, setEqA, volA, setVolA, cueA, setCueA)}

          <div className="flex flex-col items-center justify-between gap-2 rounded-2xl border border-amber-500/15 p-3 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
            <Label tone="text-amber-400">Master</Label>
            <div className="h-[4.2rem] w-[4.2rem] transition-all duration-500" style={{ filter: "drop-shadow(0 0 " + (6 + mstL * 16) + "px rgba(251,146,60,0.45))" }}>
              <Knob value={master} min={0} max={100} onChange={setMaster} mode="continuous" />
            </div>
            <div className="font-mono text-xs font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {String(Math.round(master)).padStart(3, "0")}
            </div>
            <div className="flex items-end gap-1.5 px-1">
              <div className="h-[8.5rem] w-[1.1rem]">
                <LevelMeter level={mstL} peak={Math.min(1, mstL + 0.06)} orientation="vertical" />
              </div>
              <div className="h-[8.5rem] w-[1.1rem]">
                <LevelMeter level={mstR} peak={Math.min(1, mstR + 0.06)} orientation="vertical" />
              </div>
            </div>
            <Label>L · R</Label>
          </div>

          {strip("B", gainB, setGainB, eqB, setEqB, volB, setVolB, cueB, setCueB)}
        </div>

        <div className="flex-none rounded-2xl border border-amber-500/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-3 py-2">
          <div className="flex items-center justify-between pb-1">
            <Label tone="text-amber-300">Deck A</Label>
            <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">Crossfader</span>
            <Label tone="text-teal-300">Deck B</Label>
          </div>
          <div className="h-[2.6rem] w-full">
            <Fader value={xf} min={-1} max={1} onChange={setXf} orientation="horizontal" bipolar detents={[-1, 0, 1]} />
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          GAIN A {Math.round(gainA)} · B {Math.round(gainB)}
        </span>
        <span className={"font-mono text-[10px] tracking-wide " + (cueA || cueB ? "text-teal-300" : "text-neutral-500")}>
          CUE BUS {cueA ? "A" : ""}{cueA && cueB ? "+" : ""}{cueB ? "B" : ""}{!cueA && !cueB ? "—" : ""}
        </span>
      </div>
    </div>
  );
}