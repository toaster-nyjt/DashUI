export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + gain 3 + gap 0.5 + eq 9 + gap 0.5 + cue 1.75 + gap 0.5 + fader 12 + gap 0.75 + crossfader 3.25 + footer 1.75 = 36.75 ≤ 41.6
  // BUDGET width: pad 1.5 + chA 13.5 + gap 0.75 + master 10 + gap 0.75 + chB 13.5 = 40.0 ≤ 52.0

  const [gainA, setGainA] = useState(72);
  const [gainB, setGainB] = useState(64);
  const [eqA, setEqA] = useState({ hi: 2, mid: 0, low: -1 });
  const [eqB, setEqB] = useState({ hi: -1, mid: 3, low: 4 });
  const [volA, setVolA] = useState(82);
  const [volB, setVolB] = useState(70);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(78);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);

  const [lvl, setLvl] = useState({ a: 0.4, b: 0.35, l: 0.4, r: 0.4 });
  const [peak, setPeak] = useState({ a: 0.5, b: 0.5, l: 0.5, r: 0.5 });
  const envRef = useRef({ a: 0.5, b: 0.45 });

  const aMix = Math.cos(((xf + 1) / 2) * (Math.PI / 2));
  const bMix = Math.sin(((xf + 1) / 2) * (Math.PI / 2));

  useEffect(() => {
    const id = setInterval(() => {
      const e = envRef.current;
      e.a = Math.min(1, Math.max(0.12, e.a + (Math.random() - 0.48) * 0.28));
      e.b = Math.min(1, Math.max(0.12, e.b + (Math.random() - 0.48) * 0.3));
      const a = e.a * (volA / 100) * (0.4 + gainA / 140);
      const b = e.b * (volB / 100) * (0.4 + gainB / 140);
      const m = (master / 100) * (a * aMix + b * bMix);
      const l = Math.min(1, m * (1 + Math.random() * 0.12));
      const r = Math.min(1, m * (1 + Math.random() * 0.12));
      setLvl({ a: Math.min(1, a), b: Math.min(1, b), l, r });
      setPeak((p) => ({
        a: Math.max(a, p.a - 0.03),
        b: Math.max(b, p.b - 0.03),
        l: Math.max(l, p.l - 0.03),
        r: Math.max(r, p.r - 0.03),
      }));
    }, 100);
    return () => clearInterval(id);
  }, [volA, volB, gainA, gainB, master, aMix, bMix]);

  const Label = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">{children}</span>
  );

  const channel = (
    side: "A" | "B",
    gain: number,
    setGain: (v: number) => void,
    eq: { hi: number; mid: number; low: number },
    setEq: (e: { hi: number; mid: number; low: number }) => void,
    vol: number,
    setVol: (v: number) => void,
    cue: boolean,
    setCue: (b: boolean) => void,
    level: number,
    pk: number,
    mix: number
  ) => {
    const isA = side === "A";
    const accent = isA ? "text-amber-300" : "text-teal-300";
    const ring = isA
      ? "border-amber-500/25 shadow-[0_0_20px_rgba(251,146,60,0.12)]"
      : "border-teal-400/25 shadow-[0_0_20px_rgba(45,212,191,0.12)]";
    return (
      <div className={"flex flex-col gap-2 p-3 rounded-2xl border bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 transition-all duration-500 " + ring}>
        <div className="flex items-center justify-between">
          <span className={"font-mono font-bold tracking-tight uppercase text-sm " + accent + " drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]"}>
            CH {side}
          </span>
          <span className="font-mono text-[10px] tracking-wide text-neutral-500">
            {Math.round(mix * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-[3rem] h-[3rem]">
            <Knob value={gain} min={0} max={100} onChange={setGain} />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Trim</Label>
            <span className="font-mono font-bold tracking-tight text-amber-300 text-xs drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {(gain / 5 - 10).toFixed(1)} dB
            </span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

        <div className="flex flex-col gap-1.5">
          {([["HI", "hi"], ["MID", "mid"], ["LOW", "low"]] as const).map(([lab, key]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-[2.9rem] h-[2.9rem]">
                <Knob
                  value={(eq as any)[key]}
                  min={-12}
                  max={12}
                  bipolar
                  onChange={(v) => setEq({ ...eq, [key]: v })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>{lab}</Label>
                <span className="font-mono text-[10px] tracking-wide text-neutral-500">
                  {(eq as any)[key] > 0 ? "+" : ""}
                  {Math.round((eq as any)[key])}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-[1.9rem] w-full">
          <ToggleButton on={cue} onChange={setCue} tone={isA ? "accent" : "neutral"}>
            <span className="font-mono font-semibold tracking-wider uppercase">Cue {side}</span>
          </ToggleButton>
        </div>

        <div className="flex-1 flex items-stretch gap-2 pt-1">
          <div className="w-[2.6rem] h-full">
            <Fader value={vol} min={0} max={100} onChange={setVol} orientation="vertical" detents={[0, 50, 100]} />
          </div>
          <div className="w-[1.1rem] h-full">
            <LevelMeter level={level} peak={pk} orientation="vertical" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label>Vol</Label>
          <span className="font-mono font-bold tracking-tight text-amber-300 text-xs">{Math.round(vol)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black font-sans">
      <div className="h-9 flex-none px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_rgba(251,146,60,0.8)]" />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">Central Mixer</span>
        </div>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          XF {xf < -0.05 ? "◀ A" : xf > 0.05 ? "B ▶" : "CENTER"}
        </span>
      </div>

      <div className="flex-1 flex gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex flex-col">
          {channel("A", gainA, setGainA, eqA, setEqA, volA, setVolA, cueA, setCueA, lvl.a, peak.a, aMix)}
        </div>

        <div className="w-[12rem] flex flex-col gap-3">
          <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
            <Label>Master</Label>
            <div className="w-[4.6rem] h-[4.6rem] transition-all duration-500">
              <Knob value={master} min={0} max={100} onChange={setMaster} />
            </div>
            <span className="font-mono font-bold tracking-tight text-amber-300 text-lg drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {Math.round(master)}
            </span>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
            <div className="flex-1 w-full flex items-stretch justify-center gap-3 pt-1">
              <div className="flex flex-col items-center gap-1">
                <div className="flex-1 w-[1.2rem]">
                  <LevelMeter level={lvl.l} peak={peak.l} orientation="vertical" />
                </div>
                <span className="text-[10px] font-mono tracking-wide text-neutral-500">L</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex-1 w-[1.2rem]">
                  <LevelMeter level={lvl.r} peak={peak.r} orientation="vertical" />
                </div>
                <span className="text-[10px] font-mono tracking-wide text-neutral-500">R</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70">
            <div className="flex items-center justify-between">
              <Label>Crossfade</Label>
              <span className="font-mono text-[10px] tracking-wide text-teal-300">
                {Math.round(aMix * 100)}/{Math.round(bMix * 100)}
              </span>
            </div>
            <div className="h-[2.4rem] w-full">
              <Fader value={xf} min={-1} max={1} onChange={setXf} orientation="horizontal" bipolar detents={[-1, 0, 1]} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400">A</span>
              <span className="font-mono text-[10px] tracking-widest uppercase text-teal-300">B</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {channel("B", gainB, setGainB, eqB, setEqB, volB, setVolB, cueB, setCueB, lvl.b, peak.b, bMix)}
        </div>
      </div>

      <div className="h-7 flex-none px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          MASTER {(master / 5 - 20).toFixed(1)} dB
        </span>
        <span className={"font-mono text-[10px] tracking-wide " + (cueA || cueB ? "text-teal-300" : "text-neutral-400")}>
          CUE BUS {cueA ? "A" : ""}{cueA && cueB ? "+" : ""}{cueB ? "B" : ""}{!cueA && !cueB ? "OFF" : ""}
        </span>
      </div>
    </div>
  );
}