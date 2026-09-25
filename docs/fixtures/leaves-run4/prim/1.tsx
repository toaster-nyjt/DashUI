export default function GeneratedComponent() {
  const [gain, setGain] = useState<[number, number]>([0, 0]);
  const [eqA, setEqA] = useState<[number, number, number]>([0, 0, 0]);
  const [eqB, setEqB] = useState<[number, number, number]>([0, 0, 0]);
  const [chFader, setChFader] = useState<[number, number]>([88, 88]);
  const [crossfade, setCrossfade] = useState(50);
  const [cue, setCue] = useState<[boolean, boolean]>([false, false]);
  const [master, setMaster] = useState(80);
  const [phones, setPhones] = useState(50);

  const [meterA, setMeterA] = useState(0);
  const [meterB, setMeterB] = useState(0);

  // Simulated live signal — driven by fader/gain/crossfade so the meters feel connected to the controls.
  useEffect(() => {
    let raf: number;
    let t = 0;
    const tick = () => {
      t += 0.09;
      const xfA = Math.min(1, (100 - crossfade) / 50);
      const xfB = Math.min(1, crossfade / 50);
      const baseA =
        (chFader[0] / 100) *
        (0.55 + (gain[0] + 12) / 40) *
        xfA;
      const baseB =
        (chFader[1] / 100) *
        (0.55 + (gain[1] + 12) / 40) *
        xfB;
      const wobbleA = 0.5 + 0.5 * Math.sin(t * 1.7) * Math.sin(t * 0.6 + 1);
      const wobbleB = 0.5 + 0.5 * Math.sin(t * 1.3 + 2) * Math.sin(t * 0.9);
      setMeterA(Math.max(0, Math.min(1, baseA * (0.65 + 0.5 * wobbleA))));
      setMeterB(Math.max(0, Math.min(1, baseB * (0.65 + 0.5 * wobbleB))));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chFader, gain, crossfade]);

  const eqLabels = ["HI", "MID", "LOW"];

  const renderStrip = (
    deck: "A" | "B",
    idx: 0 | 1,
    eq: [number, number, number],
    setEq: (v: [number, number, number]) => void,
    meter: number
  ) => {
    const accent = deck === "A" ? "amber" : "violet";
    const accentText = deck === "A" ? "text-amber-400" : "text-violet-300";
    const accentBar =
      deck === "A"
        ? "from-amber-500/20 to-transparent"
        : "from-violet-500/20 to-transparent";
    return (
      <div className="flex-1 basis-0 min-w-0 min-h-0 flex flex-col rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden">
        {/* Channel header */}
        <div
          className={
            "h-6 shrink px-2 flex items-center justify-between border-b border-stone-800/70 bg-gradient-to-r " +
            accentBar
          }
        >
          <span
            className={
              "font-semibold uppercase tracking-widest text-[10px] " + accentText
            }
          >
            <span className="mr-1">●</span>CH{idx + 1}
          </span>
          <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">
            {deck}
          </span>
        </div>

        {/* Gain trim */}
        <div className="px-2 pt-2 flex flex-col items-center gap-1 min-h-0">
          <div className="w-full aspect-square max-h-[34px] flex items-center justify-center">
            <Knob
              min={-12}
              max={12}
              value={gain[idx]}
              onChange={(v) =>
                setGain((prev) => {
                  const n = [...prev] as [number, number];
                  n[idx] = v;
                  return n;
                })
              }
            />
          </div>
          <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-400">
            Trim
          </span>
        </div>

        {/* 3-band EQ */}
        <div className="px-2 pt-1 flex flex-col gap-1 min-h-0">
          {eqLabels.map((lbl, b) => (
            <div key={lbl} className="flex items-center gap-2 min-w-0">
              <div className="w-[30px] aspect-square shrink flex items-center justify-center">
                <Knob
                  min={-26}
                  max={26}
                  value={eq[b]}
                  onChange={(v) => {
                    const n = [...eq] as [number, number, number];
                    n[b] = v;
                    setEq(n);
                  }}
                />
              </div>
              <span className="flex-1 min-w-0 font-medium uppercase tracking-widest leading-none text-[9px] text-stone-400">
                {lbl}
              </span>
            </div>
          ))}
        </div>

        {/* Fader + VU */}
        <div className="flex-1 min-h-0 px-2 pt-2 pb-1 flex gap-2">
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex flex-col items-center">
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <Fader
                min={0}
                max={100}
                value={chFader[idx]}
                onChange={(v) =>
                  setChFader((prev) => {
                    const n = [...prev] as [number, number];
                    n[idx] = v;
                    return n;
                  })
                }
                orientation="vertical"
              />
            </div>
          </div>
          <div className="w-[14px] shrink min-h-0 flex flex-col items-center">
            <div className="flex-1 min-h-0 w-full flex items-stretch justify-center">
              <LevelMeter level={meter} />
            </div>
          </div>
        </div>

        {/* Cue / PFL */}
        <div className="px-2 pb-2 pt-1">
          <div className="h-6 w-full">
            <ToggleButton
              on={cue[idx]}
              onChange={(on) =>
                setCue((prev) => {
                  const n = [...prev] as [boolean, boolean];
                  n[idx] = on;
                  return n;
                })
              }
            >
              CUE
            </ToggleButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="h-8 shrink px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          <span className="text-amber-400 mr-1.5">◆</span>Central Mixer
        </span>
        <span className="font-mono font-bold tracking-tight text-[11px] text-lime-300">
          MASTER {master}%
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-2 flex flex-col gap-2">
        {/* Channel strips */}
        <div className="flex-1 min-h-0 flex gap-2">
          {renderStrip("A", 0, eqA, setEqA, meterA)}
          {renderStrip("B", 1, eqB, setEqB, meterB)}
        </div>

        {/* Crossfader */}
        <div className="shrink rounded-xl border border-stone-800/70 bg-stone-950/80 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between min-w-0">
            <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-amber-400">
              A
            </span>
            <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-500">
              Crossfade
            </span>
            <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-violet-300">
              B
            </span>
          </div>
          <div className="h-6 w-full flex items-center">
            <Fader
              min={0}
              max={100}
              value={crossfade}
              onChange={setCrossfade}
              orientation="horizontal"
            />
          </div>
        </div>

        {/* Master + Headphone */}
        <div className="shrink flex gap-2">
          <div className="flex-1 basis-0 min-w-0 rounded-xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 flex items-center gap-2">
            <div className="w-[38px] aspect-square shrink flex items-center justify-center">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-400">
                Master
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-400 text-sm leading-none">
                {master}
              </span>
            </div>
          </div>

          <div className="flex-1 basis-0 min-w-0 rounded-xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 flex items-center gap-2">
            <div className="w-[38px] aspect-square shrink flex items-center justify-center">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-400">
                Phones
              </span>
              <span className="font-mono font-bold tracking-tight text-lime-300 text-sm leading-none">
                {phones}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-6 shrink px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-normal uppercase tracking-widest text-[10px] text-stone-500">
          {cue[0] || cue[1] ? "PFL Active" : "Booth"}
        </span>
        <span className="font-normal uppercase tracking-widest text-[10px] text-lime-300">
          {crossfade < 45 ? "A" : crossfade > 55 ? "B" : "A · B"}
        </span>
      </div>
    </div>
  );
}