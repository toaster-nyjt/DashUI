export default function GeneratedComponent() {
  const [gain, setGain] = useState<number[]>([2, -1]);
  const [eqHi, setEqHi] = useState<number[]>([3, -2]);
  const [eqMid, setEqMid] = useState<number[]>([0, 1]);
  const [eqLow, setEqLow] = useState<number[]>([-1, 4]);
  const [chFader, setChFader] = useState<number[]>([82, 68]);
  const [cue, setCue] = useState<boolean[]>([true, false]);
  const [xf, setXf] = useState<number>(50);
  const [master, setMaster] = useState<number>(76);
  const [phones, setPhones] = useState<number>(54);
  const [src, setSrc] = useState<number[]>([0.6, 0.5]);

  useEffect(() => {
    const id = setInterval(() => {
      setSrc((prev) =>
        prev.map((v, i) => {
          const target = 0.42 + Math.random() * (i === 0 ? 0.58 : 0.5);
          return v + (target - v) * 0.5;
        })
      );
    }, 110);
    return () => clearInterval(id);
  }, []);

  const set = (fn: (u: number[]) => void, arr: number[], i: number, v: number) => {
    const next = arr.slice();
    next[i] = v;
    fn(next);
  };

  const level = (i: number) => {
    const g = Math.pow(10, gain[i] / 20);
    const eqLift = 1 + (eqHi[i] + eqMid[i] + eqLow[i]) / 90;
    const l = src[i] * g * eqLift * (chFader[i] / 100) * (0.45 + master / 180);
    return Math.max(0, Math.min(1, l));
  };

  const aWeight = Math.max(0, Math.min(1, (100 - xf) / 100));
  const bWeight = Math.max(0, Math.min(1, xf / 100));

  const renderChannel = (ch: number) => {
    const i = ch - 1;
    const accent = ch === 1 ? "text-amber-400" : "text-violet-300";
    const bands: { key: string; arr: number[]; fn: (u: number[]) => void }[] = [
      { key: "HI", arr: eqHi, fn: setEqHi },
      { key: "MID", arr: eqMid, fn: setEqMid },
      { key: "LOW", arr: eqLow, fn: setEqLow },
    ];
    return (
      <div className="flex flex-col gap-1.5 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60">
        <div className="flex h-[0.9rem] items-center justify-between px-0.5">
          <span className={"text-[10px] font-medium uppercase tracking-widest " + accent}>
            CH {ch}
          </span>
          <span className="text-[9px] font-normal uppercase tracking-widest text-stone-600">
            {ch === 1 ? "DECK A" : "DECK B"}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="h-[2.4rem] w-[2.4rem]">
            <Knob
              min={-12}
              max={12}
              value={gain[i]}
              onChange={(v) => set(setGain, gain, i, v)}
            />
          </div>
          <span className="text-[10px] font-medium uppercase leading-none tracking-widest text-stone-400">
            Gain
          </span>
        </div>

        <div className="flex items-end justify-center gap-2">
          {bands.map((b) => (
            <div key={b.key} className="flex flex-col items-center gap-1">
              <div className="h-[2.1rem] w-[2.1rem]">
                <Knob
                  min={-12}
                  max={12}
                  value={b.arr[i]}
                  onChange={(v) => set(b.fn, b.arr, i, v)}
                />
              </div>
              <span className="text-[10px] font-medium uppercase leading-none tracking-widest text-stone-500">
                {b.key}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-1 items-stretch justify-center gap-3 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-1">
          <div className="h-full w-[1.6rem]">
            <LevelMeter level={level(i)} />
          </div>
          <div className="h-full w-[1.8rem]">
            <Fader
              min={0}
              max={100}
              value={chFader[i]}
              onChange={(v) => set(setChFader, chFader, i, v)}
              orientation="vertical"
            />
          </div>
        </div>

        <div className="h-[1.7rem] w-full">
          <ToggleButton
            on={cue[i]}
            onChange={(on) => {
              const next = cue.slice();
              next[i] = on;
              setCue(next);
            }}
          >
            <span className="font-semibold uppercase tracking-wider">CUE</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      <div className="flex h-8 flex-none items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent px-3">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 animate-pulse">◆</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">
            Central Mixer
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-amber-400 transition-all duration-200 ease-out"
            style={{ opacity: 0.25 + aWeight * 0.75 }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-violet-400 transition-all duration-200 ease-out"
            style={{ opacity: 0.25 + bWeight * 0.75 }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid flex-1 grid-cols-[1fr_auto_1fr] gap-2">
          {renderChannel(1)}

          <div className="flex flex-col items-center justify-between py-1">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent to-amber-500/25" />
            <div className="flex flex-col items-center gap-1 py-2">
              <div className="relative h-[3rem] w-[3rem]">
                <div
                  className="absolute -inset-2 rounded-full bg-amber-500/25 blur-md transition-all duration-300 ease-out"
                  style={{ opacity: 0.15 + (master / 100) * 0.85 }}
                />
                <div className="relative h-full w-full">
                  <Knob min={0} max={100} value={master} onChange={setMaster} />
                </div>
              </div>
              <span className="text-[10px] font-medium uppercase leading-none tracking-widest text-amber-400">
                Master
              </span>
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-amber-500/25 via-stone-700/40 to-violet-500/25" />
            <div className="flex flex-col items-center gap-1 py-2">
              <div className="relative h-[2.7rem] w-[2.7rem]">
                <div
                  className="absolute -inset-2 rounded-full bg-violet-500/25 blur-md transition-all duration-300 ease-out"
                  style={{ opacity: 0.12 + (phones / 100) * 0.8 }}
                />
                <div className="relative h-full w-full">
                  <Knob min={0} max={100} value={phones} onChange={setPhones} />
                </div>
              </div>
              <span className="text-[10px] font-medium uppercase leading-none tracking-widest text-violet-300">
                Phones
              </span>
            </div>
            <div className="w-px flex-1 bg-gradient-to-b from-violet-500/25 to-transparent" />
          </div>

          {renderChannel(2)}
        </div>

        <div className="flex flex-none flex-col gap-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 px-3 py-2 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[11px] font-bold tracking-tight text-amber-400 transition-all duration-200 ease-out"
              style={{ opacity: 0.3 + aWeight * 0.7 }}
            >
              A
            </span>
            <span className="text-[10px] font-medium uppercase leading-none tracking-widest text-stone-500">
              Crossfader
            </span>
            <span
              className="font-mono text-[11px] font-bold tracking-tight text-violet-300 transition-all duration-200 ease-out"
              style={{ opacity: 0.3 + bWeight * 0.7 }}
            >
              B
            </span>
          </div>
          <div className="h-[1.8rem] w-full">
            <Fader
              min={0}
              max={100}
              value={xf}
              onChange={setXf}
              orientation="horizontal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}