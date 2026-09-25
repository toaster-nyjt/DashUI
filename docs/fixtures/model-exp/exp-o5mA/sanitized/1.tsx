export default function GeneratedComponent() {
  type Ch = {
    trim: number;
    hi: number;
    mid: number;
    low: number;
    fader: number;
    cue: boolean;
  };

  const [ch1, setCh1] = useState<Ch>({ trim: 2, hi: 3, mid: 0, low: -2, fader: 82, cue: true });
  const [ch2, setCh2] = useState<Ch>({ trim: -1, hi: -3, mid: 2, low: 4, fader: 68, cue: false });
  const [xfade, setXfade] = useState(46);
  const [master, setMaster] = useState(78);
  const [phones, setPhones] = useState(55);
  const [lvl, setLvl] = useState({ a: 0.4, b: 0.3 });

  const tick = useRef(0);

  const xA = Math.cos((xfade / 100) * (Math.PI / 2));
  const xB = Math.sin((xfade / 100) * (Math.PI / 2));

  const chain = (c: Ch, x: number, env: number) => {
    const trimF = Math.pow(10, c.trim / 24);
    const eqF = 1 + (c.hi + c.mid + c.low) / 90;
    return Math.max(0, Math.min(1, env * trimF * eqF * (c.fader / 100) * x));
  };

  useEffect(() => {
    const id = setInterval(() => {
      tick.current += 1;
      const t = tick.current;
      const envA =
        0.5 +
        0.3 * Math.abs(Math.sin(t * 0.21)) +
        0.18 * Math.abs(Math.sin(t * 0.77 + 1.2)) +
        Math.random() * 0.1;
      const envB =
        0.45 +
        0.32 * Math.abs(Math.sin(t * 0.17 + 2.1)) +
        0.2 * Math.abs(Math.sin(t * 0.63)) +
        Math.random() * 0.1;
      setLvl({ a: chain(ch1, xA, envA), b: chain(ch2, xB, envB) });
    }, 90);
    return () => clearInterval(id);
  }, [ch1, ch2, xA, xB]);

  const masterLvl = Math.max(0, Math.min(1, (lvl.a + lvl.b) * 0.68 * (master / 100)));
  const db = masterLvl <= 0.001 ? "-∞" : (20 * Math.log10(masterLvl)).toFixed(1);

  const set = (n: 1 | 2, k: keyof Ch, v: number | boolean) => {
    const fn = (p: Ch) => ({ ...p, [k]: v } as Ch);
    if (n === 1) setCh1(fn);
    else setCh2(fn);
  };

  const lbl = "text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400";

  const eqRow = (n: 1 | 2, c: Ch) => (
    <div className="flex items-end justify-between gap-1 px-1">
      {([
        ["HI", "hi"],
        ["MID", "mid"],
        ["LOW", "low"],
      ] as [string, keyof Ch][]).map(([label, key]) => (
        <div key={label} className="flex flex-col items-center gap-1">
          <div className="h-[2.4rem] w-[2.4rem]">
            <Knob
              min={-12}
              max={12}
              value={c[key] as number}
              onChange={(v) => set(n, key, Math.round(v))}
            />
          </div>
          <span className={lbl}>{label}</span>
        </div>
      ))}
    </div>
  );

  const strip = (n: 1 | 2, c: Ch) => {
    const accent = n === 1 ? "text-amber-400" : "text-violet-300";
    const edge = n === 1 ? "border-amber-500/20" : "border-violet-500/25";
    const level = n === 1 ? lvl.a : lvl.b;
    const clip = level > 0.92;
    return (
      <div
        className={
          "flex flex-1 flex-col gap-1.5 rounded-2xl border p-2 shadow-2xl shadow-black/60 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 transition-all duration-300 ease-out " +
          edge
        }
      >
        <div className="flex items-center justify-between">
          <span className={"text-[10px] font-semibold uppercase tracking-widest leading-none " + accent}>
            {"CH " + n}
          </span>
          <span className="text-[10px] font-normal uppercase tracking-wide leading-none text-stone-500">
            {n === 1 ? "DECK A" : "DECK B"}
          </span>
        </div>

        <div className="flex items-end justify-between gap-1">
          <div className="flex flex-col items-center gap-1">
            <div className="h-[2.5rem] w-[2.5rem]">
              <Knob min={-12} max={12} value={c.trim} onChange={(v) => set(n, "trim", Math.round(v))} />
            </div>
            <span className={lbl}>TRIM</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-[1.8rem] w-[3.4rem]">
              <ToggleButton on={c.cue} onChange={(v) => set(n, "cue", v)}>
                <span className="font-semibold uppercase tracking-wider">CUE</span>
              </ToggleButton>
            </div>
            <span className={lbl}>PFL</span>
          </div>
        </div>

        {eqRow(n, c)}

        <div className="flex items-center justify-center gap-2 pt-0.5">
          <div className="flex flex-col items-center gap-1">
            <div className="h-[7.6rem] w-[1.6rem]">
              <LevelMeter level={level} />
            </div>
            <span
              className={
                "h-1.5 w-1.5 rounded-full transition-all duration-100 ease-linear " +
                (clip ? "bg-red-500 shadow-lg shadow-red-500/50" : "bg-stone-700")
              }
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-[7.6rem] w-[1.9rem]">
              <Fader
                min={0}
                max={100}
                value={c.fader}
                onChange={(v) => set(n, "fader", Math.round(v))}
                orientation="vertical"
              />
            </div>
            <span className={lbl}>LVL</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      <div className="h-8 flex-none flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent px-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-500/40" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">
            Mixer
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[10px] uppercase tracking-widest text-stone-500">MSTR</span>
          <span className="font-mono text-[11px] font-bold tracking-tight text-lime-300 transition-all duration-100 ease-linear">
            {db}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-stone-600">dB</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-1 items-stretch gap-2">
          {strip(1, ch1)}
          {strip(2, ch2)}
        </div>

        <div className="flex items-end gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60">
          <div className="flex flex-col items-center gap-1">
            <div className="h-[2.5rem] w-[2.5rem]">
              <Knob min={0} max={100} value={master} onChange={(v) => setMaster(Math.round(v))} />
            </div>
            <span className={lbl}>MSTR</span>
          </div>

          <div className="flex flex-1 flex-col items-stretch gap-1 px-1">
            <div className="flex h-1 w-full items-stretch gap-0.5 overflow-clip rounded-full bg-stone-950/80">
              <div
                className="bg-amber-400 transition-all duration-200 ease-out"
                style={{ width: (xA * 100).toFixed(1) + "%" }}
              />
              <div
                className="bg-violet-500 transition-all duration-200 ease-out"
                style={{ width: (xB * 100).toFixed(1) + "%" }}
              />
            </div>
            <div className="h-[1.8rem] w-full">
              <Fader
                min={0}
                max={100}
                value={xfade}
                onChange={(v) => setXfade(Math.round(v))}
                orientation="horizontal"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-amber-400">A</span>
              <span className={lbl}>XFADE</span>
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-violet-300">B</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="h-[2.5rem] w-[2.5rem]">
              <Knob min={0} max={100} value={phones} onChange={(v) => setPhones(Math.round(v))} />
            </div>
            <span className={lbl}>PHONES</span>
          </div>
        </div>
      </div>
    </div>
  );
}