export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(72);
  const [gainB, setGainB] = useState(64);
  const [eqA, setEqA] = useState({ hi: 2, mid: 0, low: -1 });
  const [eqB, setEqB] = useState({ hi: -1, mid: 3, low: 4 });
  const [volA, setVolA] = useState(82);
  const [volB, setVolB] = useState(70);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(78);
  const [cueA, setCueA] = useState(true);
  const [cueB, setCueB] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, []);

  const gainCurveA = Math.max(0, 1 - Math.max(0, xf) * 1.0);
  const gainCurveB = Math.max(0, 1 + Math.min(0, xf) * 1.0);

  const jitter = (seed: number) => 0.82 + 0.18 * Math.abs(Math.sin(tick * 0.55 + seed));

  const lvlA = Math.min(1, (volA / 100) * (gainA / 100) * 1.45 * gainCurveA * jitter(0));
  const lvlB = Math.min(1, (volB / 100) * (gainB / 100) * 1.45 * gainCurveB * jitter(2.1));
  const lvlM = Math.min(1, (lvlA + lvlB) * 0.78 * (master / 100) * 1.25);

  const [peakA, setPeakA] = useState(0);
  const [peakB, setPeakB] = useState(0);
  useEffect(() => {
    setPeakA((p) => (lvlA > p ? lvlA : Math.max(lvlA, p - 0.02)));
    setPeakB((p) => (lvlB > p ? lvlB : Math.max(lvlB, p - 0.02)));
  }, [tick]);

  const Label = (p: { children: any; tone?: string }) => (
    <span
      className={
        "text-[10px] font-medium tracking-widest uppercase leading-none " +
        (p.tone || "text-neutral-400")
      }
    >
      {p.children}
    </span>
  );

  const eqBands: { key: "hi" | "mid" | "low"; label: string }[] = [
    { key: "hi", label: "HI" },
    { key: "mid", label: "MID" },
    { key: "low", label: "LOW" },
  ];

  const strip = (deck: "A" | "B") => {
    const isA = deck === "A";
    const accent = isA ? "text-amber-300" : "text-teal-300";
    const eq = isA ? eqA : eqB;
    const setEq = isA ? setEqA : setEqB;
    const gain = isA ? gainA : gainB;
    const setGain = isA ? setGainA : setGainB;
    const vol = isA ? volA : volB;
    const setVol = isA ? setVolA : setVolB;
    const cue = isA ? cueA : cueB;
    const setCue = isA ? setCueA : setCueB;
    const lvl = isA ? lvlA : lvlB;

    return (
      <div className="flex-1 flex flex-col items-center gap-2 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
        <div className="flex w-full items-center justify-between px-1">
          <span className={"font-mono text-[11px] font-bold tracking-widest uppercase " + accent}>
            CH {deck}
          </span>
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-500 " +
              (lvl > 0.06
                ? isA
                  ? "bg-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]"
                  : "bg-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.9)]"
                : "bg-neutral-700")
            }
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-[2.9rem] h-[2.9rem]">
            <Knob value={gain} min={0} max={100} onChange={setGain} mode="continuous" />
          </div>
          <Label tone={accent}>Gain</Label>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

        {eqBands.map((b) => (
          <div key={b.key} className="flex flex-col items-center gap-1">
            <div className="w-[2.7rem] h-[2.7rem]">
              <Knob
                value={eq[b.key]}
                min={-12}
                max={12}
                bipolar
                onChange={(v) => setEq({ ...eq, [b.key]: v })}
              />
            </div>
            <Label>{b.label}</Label>
          </div>
        ))}

        <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

        <div className="w-[4.6rem] h-[2rem]">
          <ToggleButton on={cue} onChange={setCue} tone={isA ? "accent" : "neutral"}>
            <span className="font-mono font-semibold tracking-widest">CUE</span>
          </ToggleButton>
        </div>

        <div className="flex-1 flex items-end justify-center pb-1 pt-1">
          <div className="w-[2.6rem] h-full flex items-stretch justify-center">
            <div className="w-[2.6rem] h-full">
              <Fader
                value={vol}
                min={0}
                max={100}
                onChange={setVol}
                orientation="vertical"
                detents={[0, 50, 100]}
              />
            </div>
          </div>
        </div>
        <Label tone={accent}>Vol {Math.round(vol)}</Label>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black font-sans">
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
            Central Mixer
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
          2-CH / XF
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex gap-3 items-stretch">
          {strip("A")}

          <div className="w-[14rem] flex flex-col items-center gap-2 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
            <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-amber-200">
              MASTER
            </span>

            <div className="flex flex-col items-center gap-1">
              <div className="w-[4.2rem] h-[4.2rem]">
                <Knob value={master} min={0} max={100} onChange={setMaster} />
              </div>
              <span className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] text-[13px]">
                {Math.round(master)}
              </span>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

            <div className="flex-1 w-full flex items-stretch justify-center gap-3 py-1">
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1.3rem] h-full">
                  <LevelMeter level={lvlA} peak={peakA} orientation="vertical" />
                </div>
                <Label tone="text-amber-300">A</Label>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1.6rem] h-full">
                  <LevelMeter level={lvlM} orientation="vertical" />
                </div>
                <Label tone="text-neutral-300">MST</Label>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1.3rem] h-full">
                  <LevelMeter level={lvlB} peak={peakB} orientation="vertical" />
                </div>
                <Label tone="text-teal-300">B</Label>
              </div>
            </div>

            <div className="w-full flex items-center justify-between px-1">
              <span
                className={
                  "font-mono text-[10px] tracking-widest uppercase transition-all duration-200 " +
                  (cueA ? "text-teal-300" : "text-neutral-600")
                }
              >
                ●CUE A
              </span>
              <span
                className={
                  "font-mono text-[10px] tracking-widest uppercase transition-all duration-200 " +
                  (cueB ? "text-teal-300" : "text-neutral-600")
                }
              >
                CUE B●
              </span>
            </div>
          </div>

          {strip("B")}
        </div>

        <div className="flex-none flex flex-col gap-1 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between px-1">
            <Label tone="text-amber-300">Deck A</Label>
            <Label>Crossfader</Label>
            <Label tone="text-teal-300">Deck B</Label>
          </div>
          <div className="w-full h-[2.6rem]">
            <Fader
              value={xf}
              min={-1}
              max={1}
              bipolar
              orientation="horizontal"
              detents={[-1, 0, 1]}
              onChange={setXf}
            />
          </div>
        </div>
      </div>

      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          XF {xf >= 0 ? "R" : "L"}
          {Math.abs(Math.round(xf * 100))}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-teal-300">
          {cueA || cueB ? "HEADPHONE BUS ACTIVE" : "CUE BUS IDLE"}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          MST {Math.round(lvlM * 100)}%
        </span>
      </div>
    </div>
  );
}