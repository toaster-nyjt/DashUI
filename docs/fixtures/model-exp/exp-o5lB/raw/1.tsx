export default function GeneratedComponent() {
  const [gain, setGain] = useState<number[]>([0, 0]);
  const [eq, setEq] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [chFader, setChFader] = useState<number[]>([82, 70]);
  const [cue, setCue] = useState<boolean[]>([false, false]);
  const [xf, setXf] = useState(50);
  const [master, setMaster] = useState(78);
  const [hpMix, setHpMix] = useState(40);
  const [lvl, setLvl] = useState<number[]>([0.4, 0.3]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLvl(([a, b]) => {
        const target = (i: number) => {
          const cf = i === 0 ? (100 - xf) / 100 : xf / 100;
          const g = (gain[i] + 12) / 24;
          const base = (chFader[i] / 100) * (0.45 + g * 0.6) * (0.35 + cf * 0.75);
          return Math.max(0, Math.min(1, base * (0.7 + Math.random() * 0.55)));
        };
        return [a + (target(0) - a) * 0.55, b + (target(1) - b) * 0.55];
      });
    }, 110);
    return () => clearInterval(id);
  }, [gain, chFader, xf]);

  const setEqBand = (ch: number, band: number, v: number) =>
    setEq((prev) => prev.map((r, i) => (i === ch ? r.map((x, j) => (j === band ? v : x)) : r)));

  const bands = ["HI", "MID", "LOW"];
  const accent = ["text-amber-400", "text-violet-300"];
  const ring = ["ring-amber-500/25", "ring-violet-500/25"];

  const Strip = (ch: number) => (
    <div
      key={"ch" + ch}
      className={
        "flex-1 flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60 ring-1 ring-inset transition-all duration-300 ease-out " +
        ring[ch]
      }
    >
      <div className="flex items-center justify-between">
        <span className={"text-[10px] font-medium uppercase tracking-widest leading-none " + accent[ch]}>
          CH {ch + 1}
        </span>
        <span
          className={
            "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
            (lvl[ch] > 0.82 ? "bg-red-500 animate-pulse" : lvl[ch] > 0.2 ? "bg-lime-400" : "bg-stone-700")
          }
        />
      </div>

      <div className="flex justify-between gap-2">
        {/* knob column */}
        <div className="flex flex-col gap-[0.3rem]">
          <div className="flex items-center gap-1">
            <span className="w-[1.7rem] text-right text-[9px] font-medium uppercase tracking-widest leading-none text-stone-500">
              TRM
            </span>
            <div className="h-[2rem] w-[2rem]">
              <Knob
                min={-12}
                max={12}
                value={gain[ch]}
                onChange={(v) => setGain((g) => g.map((x, i) => (i === ch ? v : x)))}
              />
            </div>
          </div>
          {bands.map((b, i) => (
            <div key={b} className="flex items-center gap-1">
              <span className="w-[1.7rem] text-right text-[9px] font-medium uppercase tracking-widest leading-none text-stone-400">
                {b}
              </span>
              <div className="h-[2rem] w-[2rem]">
                <Knob min={-26} max={6} value={eq[ch][i]} onChange={(v) => setEqBand(ch, i, v)} />
              </div>
            </div>
          ))}
        </div>

        {/* meter + fader */}
        <div className="flex gap-1">
          <div className="h-[8.9rem] w-[1.5rem]">
            <LevelMeter level={lvl[ch]} />
          </div>
          <div className="h-[8.9rem] w-[1.7rem]">
            <Fader
              min={0}
              max={100}
              value={chFader[ch]}
              onChange={(v) => setChFader((f) => f.map((x, i) => (i === ch ? v : x)))}
              orientation="vertical"
            />
          </div>
        </div>
      </div>

      <div className="h-[1.6rem] w-full">
        <ToggleButton on={cue[ch]} onChange={(v) => setCue((c) => c.map((x, i) => (i === ch ? v : x)))}>
          <span className="font-semibold uppercase tracking-wider">CUE</span>
        </ToggleButton>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      <div className="h-8 flex-none flex items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent px-3">
        <span className="text-amber-400 animate-pulse">◆</span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">Central Mixer</span>
        <span className="ml-auto font-mono text-[10px] tracking-widest text-lime-300">
          {Math.round(20 * Math.log10(Math.max(0.01, (lvl[0] + lvl[1]) / 2))) + " dB"}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-2">
        <div className="flex gap-2">
          {Strip(0)}
          {Strip(1)}
        </div>

        {/* crossfader */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-[0.35rem]">
          <div className="flex items-center justify-between pb-[0.2rem]">
            <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-amber-400">A</span>
            <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-500">
              CROSSFADE
            </span>
            <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-violet-300">B</span>
          </div>
          <div className="h-[1.6rem] w-full">
            <Fader min={0} max={100} value={xf} onChange={setXf} orientation="horizontal" />
          </div>
        </div>

        {/* master / headphones */}
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 px-2 py-[0.35rem] shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2">
            <div className="h-[2.3rem] w-[2.3rem]">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <div className="flex flex-col gap-[0.15rem]">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
                MASTER
              </span>
              <span className="font-mono text-[11px] font-bold tracking-tight text-amber-400">
                {Math.round(master)}
              </span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex flex-col items-end gap-[0.15rem]">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
                HP MIX
              </span>
              <span
                className={
                  "font-mono text-[11px] font-bold tracking-tight transition-all duration-200 ease-out " +
                  (cue[0] || cue[1] ? "text-lime-300" : "text-stone-500")
                }
              >
                {hpMix < 50 ? "CUE " + Math.round(100 - hpMix * 2) : "MST " + Math.round((hpMix - 50) * 2)}
              </span>
            </div>
            <div className="h-[2.3rem] w-[2.3rem]">
              <Knob min={0} max={100} value={hpMix} onChange={setHpMix} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}