export default function GeneratedComponent() {
  const [gain, setGain] = useState<[number, number]>([0, 0]);
  const [hi, setHi] = useState<[number, number]>([0, 0]);
  const [mid, setMid] = useState<[number, number]>([0, 0]);
  const [low, setLow] = useState<[number, number]>([0, 0]);
  const [chFader, setChFader] = useState<[number, number]>([82, 74]);
  const [cue, setCue] = useState<[boolean, boolean]>([false, false]);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(78);
  const [phones, setPhones] = useState(45);
  const [lvl, setLvl] = useState<[number, number]>([0.4, 0.3]);

  const pairSet =
    (set: (v: [number, number]) => void, cur: [number, number]) =>
    (i: number) =>
    (v: number) =>
      set(i === 0 ? [v, cur[1]] : [cur[0], v]);

  // Simulated deck signal feeding each channel's VU meter
  useEffect(() => {
    const id = setInterval(() => {
      setLvl((prev) => {
        const next: number[] = [0, 1].map((i) => {
          const drive =
            (0.55 + Math.random() * 0.45) *
            (chFader[i] / 100) *
            (1 + gain[i] / 24) *
            (i === 0 ? 1 - Math.max(0, xf) * 0.85 : 1 - Math.max(0, -xf) * 0.85);
          const smoothed = prev[i] * 0.55 + Math.min(1, Math.max(0, drive)) * 0.45;
          return Math.min(1, smoothed);
        });
        return [next[0], next[1]];
      });
    }, 110);
    return () => clearInterval(id);
  }, [chFader, gain, xf]);

  const chAccent = [
    { text: "text-amber-400", dot: "bg-amber-400", glow: "shadow-amber-500/30" },
    { text: "text-violet-300", dot: "bg-violet-400", glow: "shadow-violet-500/30" },
  ];

  const eqRows: {
    label: string;
    state: [number, number];
    set: (v: [number, number]) => void;
  }[] = [
    { label: "HI", state: hi, set: setHi },
    { label: "MID", state: mid, set: setMid },
    { label: "LOW", state: low, set: setLow },
  ];

  const fmtDb = (v: number) => (v > 0 ? "+" + v.toFixed(0) : v.toFixed(0));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header chrome */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 text-[11px] animate-pulse">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Central Mixer
        </span>
        <span className="ml-auto font-mono font-bold tracking-tight text-[10px] text-lime-300">
          {(Math.max(lvl[0], lvl[1]) * 100).toFixed(0)}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-1.5 p-2">
        {/* Channel strips */}
        <div className="flex-1 flex items-stretch gap-1.5">
          {[0, 1].map((i) => (
            <div
              key={"ch-" + i}
              className="flex-1 flex flex-col items-center gap-1.5 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60 transition-all duration-200 ease-out"
            >
              <div className="flex w-full items-center justify-center gap-1.5">
                <span className={"h-1.5 w-1.5 rounded-full " + chAccent[i].dot + " animate-pulse"} />
                <span
                  className={
                    "font-medium uppercase tracking-widest leading-none text-[10px] " +
                    chAccent[i].text
                  }
                >
                  {"CH " + (i + 1)}
                </span>
              </div>

              {/* Gain trim */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="h-[2.1rem] w-[2.1rem]">
                  <Knob
                    min={-12}
                    max={12}
                    value={gain[i]}
                    onChange={pairSet(setGain, gain)(i)}
                  />
                </div>
                <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
                  Trim
                </span>
              </div>

              {/* 3-band EQ */}
              <div className="flex flex-col items-center gap-1">
                {eqRows.map((row) => (
                  <div key={row.label + i} className="flex items-center gap-1.5">
                    <span className="w-6 text-right font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
                      {row.label}
                    </span>
                    <div className="h-[2rem] w-[2rem]">
                      <Knob
                        min={-24}
                        max={6}
                        value={row.state[i]}
                        onChange={pairSet(row.set, row.state)(i)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Meter + channel fader */}
              <div className="flex flex-1 items-stretch justify-center gap-2 pt-0.5">
                <div className="w-[1.5rem] h-full">
                  <LevelMeter level={lvl[i]} />
                </div>
                <div className="w-[1.6rem] h-full">
                  <Fader
                    min={0}
                    max={100}
                    value={chFader[i]}
                    onChange={pairSet(setChFader, chFader)(i)}
                    orientation="vertical"
                  />
                </div>
              </div>

              {/* Cue / PFL */}
              <div className="h-[1.5rem] w-[3.4rem]">
                <ToggleButton
                  on={cue[i]}
                  onChange={(on) =>
                    setCue(i === 0 ? [on, cue[1]] : [cue[0], on])
                  }
                >
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </ToggleButton>
              </div>
            </div>
          ))}
        </div>

        {/* Master / Headphones + Crossfader */}
        <div className="flex-none flex flex-col gap-1.5 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-[2.1rem] w-[2.1rem]">
                <Knob min={0} max={100} value={master} onChange={setMaster} />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
                  Master
                </span>
                <span className="font-mono font-bold tracking-tight text-[11px] text-amber-400">
                  {fmtDb((master - 78) / 3)}
                </span>
              </div>
            </div>

            <span className="font-normal tracking-wide leading-none text-[11px] text-stone-500">
              {xf === 0 ? "CENTER" : xf < 0 ? "CH 1" : "CH 2"}
            </span>

            <div className="flex items-center gap-1.5">
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
                  Phones
                </span>
                <span className="font-mono font-bold tracking-tight text-[11px] text-violet-300">
                  {phones}
                </span>
              </div>
              <div className="h-[2.1rem] w-[2.1rem]">
                <Knob min={0} max={100} value={phones} onChange={setPhones} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="h-[1.6rem] w-full">
              <Fader
                min={-100}
                max={100}
                value={xf}
                onChange={setXf}
                orientation="horizontal"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-amber-400">
                A
              </span>
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500">
                Crossfade
              </span>
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-violet-300">
                B
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}