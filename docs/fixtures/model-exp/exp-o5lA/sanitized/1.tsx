export default function GeneratedComponent() {
  const [gain, setGain] = useState<number[]>([0, -2]);
  const [hi, setHi] = useState<number[]>([2, 0]);
  const [mid, setMid] = useState<number[]>([0, 1]);
  const [low, setLow] = useState<number[]>([-1, 3]);
  const [chFader, setChFader] = useState<number[]>([88, 72]);
  const [cue, setCue] = useState<boolean[]>([true, false]);
  const [xf, setXf] = useState(50);
  const [master, setMaster] = useState(78);
  const [hpMix, setHpMix] = useState(45);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => p + 1), 110);
    return () => clearInterval(id);
  }, []);

  const xfGain = (ch: number) => {
    const t = xf / 100;
    return ch === 0 ? Math.cos((t * Math.PI) / 2) : Math.sin((t * Math.PI) / 2);
  };

  const levelFor = (ch: number) => {
    const wobble =
      0.62 +
      0.3 * Math.abs(Math.sin(pulse * (ch === 0 ? 0.41 : 0.33) + ch * 1.7)) +
      0.08 * Math.sin(pulse * 0.9 + ch);
    const trim = 1 + gain[ch] / 24;
    const v = wobble * trim * (chFader[ch] / 100) * xfGain(ch) * (master / 100 + 0.25);
    return Math.max(0, Math.min(1, v));
  };

  const setAt = (
    setter: (f: (p: number[]) => number[]) => void,
    idx: number,
    v: number
  ) => setter((prev) => prev.map((x, i) => (i === idx ? v : x)));

  const rowLabels = ["Gain", "Hi", "Mid", "Low"];

  const Strip = (ch: number) => {
    const deck = ch === 0 ? "A" : "B";
    const tint = ch === 0 ? "text-amber-400" : "text-violet-300";
    return (
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-1.5 shadow-2xl shadow-black/60">
        <div
          className={
            "text-[10px] font-medium uppercase tracking-widest leading-none " + tint
          }
        >
          CH{ch + 1} · {deck}
        </div>
        <div className="h-[2rem] w-[2rem]">
          <Knob min={-12} max={12} value={gain[ch]} onChange={(v) => setAt(setGain, ch, v)} />
        </div>
        <div className="h-[2rem] w-[2rem]">
          <Knob min={-26} max={6} value={hi[ch]} onChange={(v) => setAt(setHi, ch, v)} />
        </div>
        <div className="h-[2rem] w-[2rem]">
          <Knob min={-26} max={6} value={mid[ch]} onChange={(v) => setAt(setMid, ch, v)} />
        </div>
        <div className="h-[2rem] w-[2rem]">
          <Knob min={-26} max={6} value={low[ch]} onChange={(v) => setAt(setLow, ch, v)} />
        </div>
        <div className="h-[1.5rem] w-[4rem]">
          <ToggleButton
            on={cue[ch]}
            onChange={(v) => setCue((p) => p.map((x, i) => (i === ch ? v : x)))}
          >
            <span className="font-semibold uppercase tracking-wider">Cue</span>
          </ToggleButton>
        </div>
        <div className="flex items-end gap-2 pt-0.5">
          <div className="h-[5.5rem] w-[1.6rem]">
            <Fader
              min={0}
              max={100}
              value={chFader[ch]}
              onChange={(v) => setAt(setChFader, ch, v)}
              orientation="vertical"
            />
          </div>
          <div className="h-[5.5rem] w-[1.5rem]">
            <LevelMeter level={levelFor(ch)} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-lg shadow-amber-500/40 animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">
          Central Mixer
        </span>
        <span className="ml-auto font-mono font-bold tracking-tight text-[10px] text-lime-300">
          MST {master.toFixed(0)}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-1.5 p-1.5 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Channel strips + center legend */}
        <div className="grid grid-cols-[1fr_3.25rem_1fr] gap-1.5">
          {Strip(0)}
          <div className="flex flex-col items-center gap-1 py-1.5">
            <div className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-600">
              EQ
            </div>
            {rowLabels.map((l) => (
              <div
                key={l}
                className="h-[2rem] flex items-center text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400"
              >
                {l}
              </div>
            ))}
            <div className="h-[1.5rem] flex items-center text-[10px] font-medium uppercase tracking-widest leading-none text-stone-500">
              PFL
            </div>
            <div className="h-[5.5rem] flex items-center pt-0.5">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-500 [writing-mode:vertical-rl] rotate-180">
                Level
              </span>
            </div>
          </div>
          {Strip(1)}
        </div>

        {/* Crossfader */}
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-r from-amber-500/5 via-transparent to-violet-500/5 px-2 py-1 shadow-2xl shadow-black/60">
          <span
            className={
              "text-[11px] font-semibold uppercase tracking-widest transition-all duration-200 ease-out " +
              (xf < 45 ? "text-amber-400" : "text-stone-600")
            }
          >
            A
          </span>
          <div className="h-[1.6rem] flex-1">
            <Fader min={0} max={100} value={xf} onChange={setXf} orientation="horizontal" />
          </div>
          <span
            className={
              "text-[11px] font-semibold uppercase tracking-widest transition-all duration-200 ease-out " +
              (xf > 55 ? "text-violet-300" : "text-stone-600")
            }
          >
            B
          </span>
        </div>

        {/* Master + Headphone */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-1.5 shadow-2xl shadow-black/60">
            <div className="h-[2rem] w-[2rem]">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
                Master
              </span>
              <span className="font-mono font-bold tracking-tight text-[11px] text-amber-400">
                {master.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-1.5 shadow-2xl shadow-black/60">
            <div className="h-[2rem] w-[2rem]">
              <Knob min={0} max={100} value={hpMix} onChange={setHpMix} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
                HP Mix
              </span>
              <span className="font-mono font-bold tracking-tight text-[11px] text-lime-300">
                {hpMix < 50 ? "CUE" : "MST"} {hpMix.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}