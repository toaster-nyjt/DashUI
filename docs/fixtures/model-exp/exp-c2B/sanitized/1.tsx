export default function GeneratedComponent() {
  type Chan = { gain: number; hi: number; mid: number; low: number; fader: number; cue: boolean };

  const [chans, setChans] = useState<Chan[]>([
    { gain: 2, hi: 3, mid: 0, low: -2, fader: 84, cue: false },
    { gain: -1, hi: 0, mid: -4, low: 5, fader: 70, cue: true },
  ]);
  const [xfade, setXfade] = useState<number>(46);
  const [master, setMaster] = useState<number>(78);
  const [phones, setPhones] = useState<number>(55);
  const [levels, setLevels] = useState<number[]>([0.4, 0.3]);
  const tickRef = useRef<number>(0);

  const setChan = useCallback((i: number, patch: Partial<Chan>) => {
    setChans((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }, []);

  const aMix = Math.cos((xfade / 100) * (Math.PI / 2));
  const bMix = Math.sin((xfade / 100) * (Math.PI / 2));
  const aPct = Math.round(100 - xfade);

  useEffect(() => {
    const id = window.setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;
      const drive = (c: Chan, seed: number, mix: number) => {
        const beat = 0.56 + 0.44 * Math.pow(Math.abs(Math.sin(t * 0.34 + seed)), 1.6);
        const noise = 0.86 + Math.random() * 0.14;
        const trim = Math.pow(10, c.gain / 45);
        const eq = 1 + (c.hi + c.mid + c.low) / 90;
        const v = beat * noise * trim * eq * (c.fader / 100) * mix * (0.55 + 0.45 * (master / 100));
        return Math.max(0, Math.min(1, v));
      };
      const na = drive(chans[0], 0, aMix);
      const nb = drive(chans[1], 1.7, bMix);
      setLevels((prev) => [prev[0] * 0.4 + na * 0.6, prev[1] * 0.4 + nb * 0.6]);
    }, 110);
    return () => window.clearInterval(id);
  }, [chans, aMix, bMix, master]);

  const anyCue = chans[0].cue || chans[1].cue;

  const renderChannel = (i: number) => {
    const c = chans[i];
    const isA = i === 0;
    const accentText = isA ? "text-amber-400" : "text-violet-300";
    const eqActive = c.hi !== 0 || c.mid !== 0 || c.low !== 0;
    const bands: { key: "hi" | "mid" | "low"; label: string }[] = [
      { key: "hi", label: "Hi" },
      { key: "mid", label: "Mid" },
      { key: "low", label: "Low" },
    ];
    const bandTone = (v: number) =>
      v <= -11
        ? "text-red-400"
        : v > 0.5
        ? isA
          ? "text-amber-300"
          : "text-violet-300"
        : v < -0.5
        ? "text-stone-300"
        : "text-stone-500";

    return (
      <div
        key={"ch-" + i}
        className={
          "relative flex-1 flex flex-col gap-1.5 rounded-2xl border px-1.5 py-2 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60 transition-all duration-300 ease-out " +
          (c.cue
            ? isA
              ? "border-amber-400/50 ring-1 ring-inset ring-amber-500/35 shadow-lg shadow-amber-500/20"
              : "border-violet-400/50 ring-1 ring-inset ring-violet-500/40 shadow-lg shadow-violet-500/20"
            : "border-amber-500/15")
        }
      >
        {c.cue ? (
          <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-lime-400/80 to-transparent animate-pulse" />
        ) : null}

        {/* identity + gain trim */}
        <div className="flex items-end gap-1.5">
          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
            <span className={"truncate text-[11px] font-semibold uppercase tracking-widest leading-none " + accentText}>
              {"CH " + (i + 1)}
            </span>
            <span className="truncate text-[9px] font-medium uppercase tracking-widest leading-none text-stone-500">
              {isA ? "Deck A" : "Deck B"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="h-[2.1rem] w-[2.1rem]">
              <Knob min={-12} max={12} value={c.gain} onChange={(v) => setChan(i, { gain: v })} />
            </div>
            <span className="text-[8px] font-medium uppercase tracking-widest leading-none text-stone-500">Trim</span>
          </div>
        </div>

        {/* 3-band EQ */}
        <div
          className={
            "rounded-xl border bg-stone-950/80 p-1 transition-all duration-300 ease-out " +
            (eqActive ? "border-stone-800/70 ring-1 ring-inset ring-violet-500/40" : "border-stone-800/70")
          }
        >
          <div className="grid grid-cols-3 gap-1">
            {bands.map((b) => (
              <div key={b.key} className="flex flex-col items-center gap-0.5">
                <div className="h-[1.9rem] w-[1.9rem]">
                  <Knob min={-12} max={12} value={c[b.key]} onChange={(v) => setChan(i, { [b.key]: v } as Partial<Chan>)} />
                </div>
                <span
                  className={
                    "text-[8px] font-medium uppercase tracking-widest leading-none transition-colors duration-200 " +
                    bandTone(c[b.key])
                  }
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* cue / pfl */}
        <div className="h-[1.55rem] w-full">
          <ToggleButton on={c.cue} onChange={(on) => setChan(i, { cue: on })}>
            <span className="font-semibold uppercase tracking-wider">Cue</span>
          </ToggleButton>
        </div>

        {/* meter + channel fader + scale */}
        <div className="flex-1 flex items-stretch justify-center gap-1.5 pt-0.5">
          <div className="w-[1.6rem]">
            <LevelMeter level={levels[i]} />
          </div>
          <div className="w-[2rem]">
            <Fader min={0} max={100} value={c.fader} onChange={(v) => setChan(i, { fader: v })} orientation="vertical" />
          </div>
          <div className="w-[1.35rem] flex flex-col justify-between py-1">
            {["+6", "0", "−6", "−12", "−∞"].map((t) => (
              <div key={t} className="flex items-center gap-[2px]">
                <span className="h-px w-[4px] bg-stone-700/80" />
                <span className="font-mono text-[7px] leading-none text-stone-600">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      <style>{`
        @keyframes nmxFlow {
          0% { transform: translate(-50%, -160%); opacity: 0; }
          12% { opacity: 1; }
          82% { opacity: 1; }
          100% { transform: translate(-50%, 1150%); opacity: 0; }
        }
      `}</style>

      {/* header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-500/50 animate-pulse" />
          <span className="truncate text-[11px] font-semibold uppercase tracking-widest text-stone-200">Central Mixer</span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-stone-500">Sum Bus</span>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex gap-2">
          {renderChannel(0)}

          {/* master / phones spine */}
          <div className="w-[4rem] flex flex-col items-center rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 px-1 py-2 shadow-2xl shadow-black/60">
            <span className="text-[8px] font-medium uppercase tracking-widest leading-none text-stone-400">Master</span>
            <div className="mt-1 h-[2.6rem] w-[2.6rem]">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <span className="mt-1 font-mono text-[10px] font-bold tracking-tight leading-none text-amber-400">
              {Math.round(master)}
            </span>

            <div className="relative my-1 w-full flex-1 overflow-hidden">
              <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-amber-500/40 via-stone-700/50 to-violet-500/40" />
              {[0, 1, 2].map((k) => (
                <span
                  key={"flow-" + k}
                  className="absolute left-1/2 top-0 h-3 w-[3px] rounded-full bg-lime-400 shadow-lg shadow-lime-400/40"
                  style={{ animation: "nmxFlow 2.6s linear infinite", animationDelay: k * 0.85 + "s" }}
                />
              ))}
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 text-[7px] uppercase tracking-[0.3em] text-stone-700"
                style={{ writingMode: "vertical-rl" }}
              >
                mix
              </span>
            </div>

            <span
              className={
                "font-mono text-[10px] font-bold tracking-tight leading-none transition-colors duration-200 " +
                (anyCue ? "text-lime-300 animate-pulse" : "text-violet-300")
              }
            >
              {Math.round(phones)}
            </span>
            <div className="mt-1 h-[2.6rem] w-[2.6rem]">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <span className="mt-1 text-[8px] font-medium uppercase tracking-widest leading-none text-stone-400">Phones</span>
          </div>

          {renderChannel(1)}
        </div>

        {/* crossfader */}
        <div className="flex flex-col gap-1 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 px-2 py-1.5 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] font-semibold uppercase tracking-widest leading-none text-amber-400 transition-all duration-200 ease-out"
              style={{ opacity: 0.3 + 0.7 * aMix }}
            >
              A
            </span>
            <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-400">Crossfade</span>
            <span
              className="text-[9px] font-semibold uppercase tracking-widest leading-none text-violet-300 transition-all duration-200 ease-out"
              style={{ opacity: 0.3 + 0.7 * bMix }}
            >
              B
            </span>
          </div>
          <div className="h-[1.7rem] w-full">
            <Fader min={0} max={100} value={xfade} onChange={setXfade} orientation="horizontal" />
          </div>
          <div className="flex h-[0.3rem] w-full overflow-clip rounded-full border border-stone-800/70 bg-stone-950/80">
            <div
              className="h-full bg-gradient-to-r from-amber-400/90 to-amber-500/15 transition-all duration-200 ease-out"
              style={{ width: aPct + "%" }}
            />
            <div
              className="h-full bg-gradient-to-l from-violet-400/90 to-violet-500/15 transition-all duration-200 ease-out"
              style={{ width: 100 - aPct + "%" }}
            />
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Mstr <span className="font-mono text-lime-300">{Math.round(master)}</span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          XF <span className="font-mono text-lime-300">{aPct}</span>
          <span className="text-stone-700">/</span>
          <span className="font-mono text-lime-300">{100 - aPct}</span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          PFL{" "}
          <span className={"font-mono transition-colors duration-200 " + (chans[0].cue ? "text-lime-300" : "text-stone-700")}>1</span>
          <span className="text-stone-700">·</span>
          <span className={"font-mono transition-colors duration-200 " + (chans[1].cue ? "text-lime-300" : "text-stone-700")}>2</span>
        </span>
      </div>
    </div>
  );
}