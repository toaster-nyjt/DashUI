export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + strip(label .9 + gain 3 + eq 3 + cue 1.75 + fader 7) + gaps 2.5 + crossfader block 3.6 + footer 1.75 = 27.25 ≤ 41.6
  // BUDGET width: pad 1.5 + chA 18 + gap .75 + center 11 + gap .75 + chB 18 = 50.0 ≤ 52.0

  const [gainA, setGainA] = useState(2);
  const [gainB, setGainB] = useState(-1);
  const [eqA, setEqA] = useState({ hi: 3, mid: 0, low: -2 });
  const [eqB, setEqB] = useState({ hi: -1, mid: 2, low: 4 });
  const [volA, setVolA] = useState(82);
  const [volB, setVolB] = useState(68);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(74);
  const [cueA, setCueA] = useState(true);
  const [cueB, setCueB] = useState(false);

  const [lv, setLv] = useState({ a: 0, b: 0, ml: 0, mr: 0 });
  const [pk, setPk] = useState({ a: 0, b: 0, ml: 0, mr: 0 });
  const t = useRef(0);

  const xA = Math.min(1, 1 - xf) ;
  const xB = Math.min(1, 1 + xf);

  useEffect(() => {
    const id = setInterval(() => {
      t.current += 1;
      const n = t.current;
      const pulseA = 0.55 + 0.45 * Math.abs(Math.sin(n / 3.1)) * (0.6 + 0.4 * Math.random());
      const pulseB = 0.5 + 0.5 * Math.abs(Math.sin(n / 2.3 + 1)) * (0.6 + 0.4 * Math.random());
      const a = Math.min(1, (volA / 100) * xA * pulseA * (1 + gainA / 24));
      const b = Math.min(1, (volB / 100) * xB * pulseB * (1 + gainB / 24));
      const m = Math.min(1, (a + b) * 0.72 * (master / 100) * 1.35);
      const next = {
        a,
        b,
        ml: Math.min(1, m * (0.92 + Math.random() * 0.12)),
        mr: Math.min(1, m * (0.9 + Math.random() * 0.15)),
      };
      setLv(next);
      setPk((p) => ({
        a: Math.max(next.a, p.a - 0.03),
        b: Math.max(next.b, p.b - 0.03),
        ml: Math.max(next.ml, p.ml - 0.03),
        mr: Math.max(next.mr, p.mr - 0.03),
      }));
    }, 110);
    return () => clearInterval(id);
  }, [volA, volB, xA, xB, gainA, gainB, master]);

  const Cap = (p: { children: any; tone?: string }) => (
    <div className={"text-[10px] font-medium tracking-widest uppercase leading-none " + (p.tone || "text-neutral-400")}>
      {p.children}
    </div>
  );

  const strip = (deck: "A" | "B") => {
    const isA = deck === "A";
    const accent = isA ? "text-amber-300" : "text-teal-300";
    const ring = isA ? "border-amber-500/20" : "border-teal-500/20";
    const eq = isA ? eqA : eqB;
    const setEq = isA ? setEqA : setEqB;
    const vol = isA ? volA : volB;
    const setVol = isA ? setVolA : setVolB;
    const gain = isA ? gainA : gainB;
    const setGain = isA ? setGainA : setGainB;
    const cue = isA ? cueA : cueB;
    const setCue = isA ? setCueA : setCueB;
    const lvl = isA ? lv.a : lv.b;
    const peak = isA ? pk.a : pk.b;

    return (
      <div
        className={
          "flex-1 flex flex-col gap-2 p-3 rounded-2xl border " +
          ring +
          " bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 transition-all duration-500"
        }
      >
        <div className="flex items-center justify-between">
          <div className={"font-mono text-sm font-bold tracking-widest uppercase " + accent + " drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]"}>
            CH {deck}
          </div>
          <div
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-300 " +
              (lvl > 0.15
                ? isA
                  ? "bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.8)]"
                  : "bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]"
                : "bg-neutral-700")
            }
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70">
          <div className="w-[3rem] h-[3rem]">
            <Knob value={gain} min={-12} max={12} bipolar onChange={setGain} />
          </div>
          <div className="flex flex-col gap-1">
            <Cap>Trim</Cap>
            <div className="font-mono text-xs font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {(gain > 0 ? "+" : "") + gain.toFixed(1)} dB
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl border border-amber-500/10 bg-black/50 p-2 shadow-inner shadow-black/70">
          {([["HI", "hi"], ["MID", "mid"], ["LOW", "low"]] as const).map(([lab, key]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div className="w-[3rem] h-[3rem]">
                <Knob
                  value={(eq as any)[key]}
                  min={-26}
                  max={6}
                  bipolar
                  onChange={(v) => setEq((s: any) => ({ ...s, [key]: v }))}
                />
              </div>
              <Cap>{lab}</Cap>
            </div>
          ))}
        </div>

        <div className="h-[1.75rem] w-full">
          <ToggleButton on={cue} onChange={setCue} tone={isA ? "accent" : "neutral"}>
            <span className="font-mono font-semibold tracking-widest">CUE {deck}</span>
          </ToggleButton>
        </div>

        <div className="flex-1 flex items-stretch justify-center gap-3 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70">
          <div className="w-[1rem]">
            <LevelMeter level={lvl} peak={peak} orientation="vertical" />
          </div>
          <div className="w-[2.4rem]">
            <Fader value={vol} min={0} max={100} orientation="vertical" detents={[0, 50, 100]} onChange={setVol} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Cap tone={isA ? "text-amber-400/70" : "text-teal-400/70"}>Level</Cap>
          <div className="font-mono text-[11px] font-bold tracking-tight text-amber-300">{Math.round(vol)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black">
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Central Mixer</span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">2-CH / MASTER BUS</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)]">
        <div className="flex-1 flex gap-3">
          {strip("A")}

          <div className="w-[11rem] flex flex-col gap-2 p-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
            <div className="text-center font-mono text-sm font-bold tracking-widest uppercase text-amber-100">
              MASTER
            </div>

            <div className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/10 bg-black/50 p-2 shadow-inner shadow-black/70">
              <div className="w-[5rem] h-[5rem]">
                <Knob value={master} min={0} max={100} onChange={setMaster} />
              </div>
              <div className="font-mono text-base font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {Math.round(master)}
              </div>
              <Cap>Out Gain</Cap>
            </div>

            <div className="flex-1 flex items-stretch justify-center gap-4 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70">
              <div className="flex flex-col items-center gap-1">
                <div className="flex-1 w-[1rem]">
                  <LevelMeter level={lv.ml} peak={pk.ml} orientation="vertical" />
                </div>
                <Cap>L</Cap>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex-1 w-[1rem]">
                  <LevelMeter level={lv.mr} peak={pk.mr} orientation="vertical" />
                </div>
                <Cap>R</Cap>
              </div>
            </div>
          </div>

          {strip("B")}
        </div>

        <div className="flex-none flex flex-col gap-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between">
            <Cap tone="text-amber-400">A</Cap>
            <Cap>Crossfader</Cap>
            <Cap tone="text-teal-300">B</Cap>
          </div>
          <div className="h-[2.4rem] w-full">
            <Fader value={xf} min={-1} max={1} bipolar orientation="horizontal" detents={[-1, 0, 1]} onChange={setXf} />
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          XF {xf < -0.05 ? "A " + Math.round(Math.abs(xf) * 100) + "%" : xf > 0.05 ? "B " + Math.round(xf * 100) + "%" : "CENTER"}
        </span>
        <span className={"font-mono text-[10px] tracking-wide " + (cueA || cueB ? "text-teal-300" : "text-neutral-500")}>
          CUE BUS {cueA ? "A" : ""}{cueA && cueB ? "+" : ""}{cueB ? "B" : ""}{!cueA && !cueB ? "OFF" : ""}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          MST {(lv.ml * 12 - 12).toFixed(1)} dB
        </span>
      </div>
    </div>
  );
}