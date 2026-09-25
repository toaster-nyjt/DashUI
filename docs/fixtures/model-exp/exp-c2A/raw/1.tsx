export default function GeneratedComponent() {
  type Chan = { trim: number; hi: number; mid: number; low: number; fader: number; cue: boolean };

  const BANDS: { k: "hi" | "mid" | "low"; l: string }[] = [
    { k: "hi", l: "Hi" },
    { k: "mid", l: "Mid" },
    { k: "low", l: "Low" },
  ];

  const TICKS: { l: string; t: number }[] = [
    { l: "+6", t: 0.94 },
    { l: "0", t: 0.78 },
    { l: "-6", t: 0.6 },
    { l: "-12", t: 0.42 },
    { l: "-20", t: 0.24 },
    { l: "-40", t: 0.08 },
  ];

  const [chans, setChans] = useState<Chan[]>([
    { trim: 1.5, hi: 2, mid: 0, low: -1, fader: 84, cue: false },
    { trim: -0.5, hi: -2, mid: 1, low: 3, fader: 71, cue: true },
  ]);
  const [xf, setXf] = useState<number>(48);
  const [master, setMaster] = useState<number>(86);
  const [phones, setPhones] = useState<number>(42);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 100000), 90);
    return () => clearInterval(id);
  }, []);

  const patch = useCallback((i: number, p: Partial<Chan>) => {
    setChans((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...p } : c)));
  }, []);

  const dbLin = (db: number) => Math.pow(10, db / 20);
  const fmtDb = (v: number) => (v > 0.05 ? "+" : v < -0.05 ? "\u2212" : "") + Math.abs(v).toFixed(1);

  const xa = Math.cos((xf / 100) * (Math.PI / 2));
  const xb = Math.sin((xf / 100) * (Math.PI / 2));

  const levels = useMemo(
    () =>
      chans.map((c, i) => {
        const p = tick * 0.09 + i * 2.3;
        const src =
          0.52 +
          0.26 * Math.sin(p * 1.9 + i) +
          0.13 * Math.sin(p * 5.1 + 1.3) +
          0.08 * Math.sin(p * 12.7 + i * 2);
        const eq = (dbLin(c.hi) + dbLin(c.mid) + dbLin(c.low)) / 3;
        const v = Math.max(0, src) * dbLin(c.trim) * eq * (c.fader / 100);
        return Math.max(0.02, Math.min(1, v));
      }),
    [chans, tick]
  );

  const masterLevel = Math.min(1, (levels[0] * xa + levels[1] * xb) * (master / 100));
  const cueLabel =
    chans[0].cue && chans[1].cue ? "1+2" : chans[0].cue ? "1" : chans[1].cue ? "2" : "\u2014";

  const tickCls = (t: number, lit: boolean) =>
    lit ? (t > 0.9 ? "text-red-400" : t > 0.72 ? "text-amber-300" : "text-lime-300") : "text-stone-700";

  const strip = (i: number) => {
    const c = chans[i];
    const lvl = levels[i];
    const isA = i === 0;
    const accent = isA ? "text-amber-400" : "text-violet-300";
    return (
      <div
        className={
          "flex-1 basis-0 flex flex-col gap-1.5 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60 transition-all duration-300 ease-out " +
          (c.cue ? "ring-1 ring-inset ring-lime-400/40" : "ring-0")
        }
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest leading-none text-stone-200">
            {"CH " + (i + 1)}
          </span>
          <span
            className={
              "flex items-center gap-1 text-[9px] font-medium uppercase tracking-widest leading-none " + accent
            }
          >
            <span
              className={
                "h-1.5 w-1.5 rounded-full transition-all duration-100 ease-linear " +
                (isA ? "bg-amber-400 shadow-lg shadow-amber-500/40" : "bg-violet-400 shadow-lg shadow-violet-500/40")
              }
              style={{ opacity: 0.22 + lvl * 0.78, transform: "scale(" + (0.75 + lvl * 0.6).toFixed(3) + ")" }}
            />
            {isA ? "A" : "B"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-[2.1rem] w-[2.1rem]">
            <Knob min={-12} max={12} value={c.trim} onChange={(v) => patch(i, { trim: v })} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-400">Trim</span>
            <span className={"font-mono text-[11px] font-bold leading-none tracking-tight " + accent}>
              {fmtDb(c.trim)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {BANDS.map((b) => (
            <div key={b.k} className="flex flex-col items-center gap-1">
              <div className="h-[2.15rem] w-[2.15rem]">
                <Knob min={-12} max={12} value={c[b.k]} onChange={(v) => patch(i, { [b.k]: v } as Partial<Chan>)} />
              </div>
              <span className="text-[8px] font-medium uppercase tracking-widest leading-none text-stone-500">
                {b.l}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-1 items-stretch justify-center gap-1.5 rounded-xl border border-stone-800/70 bg-stone-950/80 px-1.5 py-1.5">
          <div className="w-[1.5rem]">
            <LevelMeter level={lvl} />
          </div>
          <div className="flex flex-col justify-between py-0.5">
            {TICKS.map((tk) => (
              <span
                key={tk.l}
                className={
                  "font-mono text-[8px] leading-none tracking-tight transition-colors duration-100 ease-linear " +
                  tickCls(tk.t, lvl >= tk.t)
                }
              >
                {tk.l}
              </span>
            ))}
          </div>
          <div className="w-[2.1rem]">
            <Fader
              min={0}
              max={100}
              value={c.fader}
              orientation="vertical"
              onChange={(v) => patch(i, { fader: v })}
            />
          </div>
        </div>

        <div className="h-[1.75rem] w-full">
          <ToggleButton on={c.cue} onChange={(on) => patch(i, { cue: on })}>
            <span className="font-semibold uppercase tracking-wider">Cue</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      <style>
        {"@keyframes ndSheen{0%{transform:translateX(-170%) skewX(-18deg)}60%{transform:translateX(280%) skewX(-18deg)}100%{transform:translateX(280%) skewX(-18deg)}}"}
      </style>

      <div className="relative h-8 flex-none overflow-hidden border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div
          className="pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent"
          style={{ animation: "ndSheen 5s ease-in-out infinite" }}
        />
        <div className="relative flex h-full items-center justify-between px-3">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-stone-200">
            <span
              className="h-1.5 w-1.5 rotate-45 bg-amber-400 shadow-lg shadow-amber-500/40 transition-all duration-100 ease-linear"
              style={{ opacity: 0.4 + masterLevel * 0.6 }}
            />
            Central Mixer
          </span>
          <span className="font-mono text-[9px] tracking-widest text-stone-600">24B / 96K</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2">
        <div className="flex flex-1 gap-1.5">
          {strip(0)}

          <div className="flex w-[5rem] flex-col gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60">
            <div className="relative flex flex-1 flex-col items-center justify-evenly rounded-xl border border-stone-800/70 bg-stone-950/80 py-1">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-[3.5rem] w-[3.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/25 blur-xl transition-opacity duration-100 ease-linear"
                style={{ opacity: 0.12 + masterLevel * 0.65 }}
              />
              <span className="relative text-[9px] font-medium uppercase tracking-widest leading-none text-stone-400">
                Master
              </span>
              <div className="relative h-[3.4rem] w-[3.4rem]">
                <Knob min={0} max={100} value={master} onChange={setMaster} />
              </div>
              <span className="relative font-mono text-[12px] font-bold leading-none tracking-tight text-amber-400">
                {Math.round(master)}
              </span>
              <span className="relative text-[8px] uppercase tracking-widest leading-none text-stone-600">Out</span>
            </div>

            <div className="flex flex-1 flex-col items-center justify-evenly rounded-xl border border-stone-800/70 bg-stone-950/80 py-1">
              <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-400">
                Phones
              </span>
              <div className="h-[3.4rem] w-[3.4rem]">
                <Knob min={0} max={100} value={phones} onChange={setPhones} />
              </div>
              <span className="font-mono text-[12px] font-bold leading-none tracking-tight text-violet-300">
                {Math.round(phones)}
              </span>
              <span className="text-[8px] uppercase tracking-widest leading-none text-stone-600">
                {"Cue \u25C2\u25B8 Pgm"}
              </span>
            </div>
          </div>

          {strip(1)}
        </div>

        <div className="flex flex-none flex-col gap-1 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] font-medium uppercase tracking-widest leading-none text-amber-400 transition-opacity duration-200 ease-out"
              style={{ opacity: 0.3 + xa * 0.7 }}
            >
              Deck A
            </span>
            <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-500">
              Crossfade
            </span>
            <span
              className="text-[9px] font-medium uppercase tracking-widest leading-none text-violet-300 transition-opacity duration-200 ease-out"
              style={{ opacity: 0.3 + xb * 0.7 }}
            >
              Deck B
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold leading-none tracking-tight text-amber-400">
              {Math.round(xa * 100)}
            </span>
            <div className="h-[1.75rem] flex-1">
              <Fader min={0} max={100} value={xf} orientation="horizontal" onChange={setXf} />
            </div>
            <span className="font-mono text-[10px] font-bold leading-none tracking-tight text-violet-300">
              {Math.round(xb * 100)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-6 flex-none items-center justify-between gap-2 border-t border-stone-800/70 bg-stone-950/70 px-3 text-[10px] font-medium uppercase tracking-widest text-stone-500">
        <span className="min-w-0 truncate">
          {"Mst "}
          <span className="font-mono text-lime-300">{Math.round(master)}</span>
        </span>
        <span className="min-w-0 truncate">
          {"Phn "}
          <span className="font-mono text-lime-300">{Math.round(phones)}</span>
        </span>
        <span className="min-w-0 truncate">
          {"Xf "}
          <span className="font-mono text-lime-300">{Math.round(xf)}</span>
        </span>
        <span className="min-w-0 truncate">
          {"Pfl "}
          <span className={"font-mono " + (cueLabel === "\u2014" ? "text-stone-600" : "text-lime-300")}>
            {cueLabel}
          </span>
        </span>
      </div>
    </div>
  );
}