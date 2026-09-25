export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(gain-row 2.5 + eq-stack 3*2.5=7.5 + cue 1.75 + fader 6 + label ~1) + gaps ~2 + padding 0.75 = ~23.75 ≤ 41.6
  // BUDGET width: chA(2.5) + master-col(4) + chB(2.5) ... using flex-1 columns; primitive floors: Knob 2.5, Fader 2.2, LevelMeter 1, ToggleButton 3. total well within 52.0

  // ---- Channel state ----
  const [gainA, setGainA] = useState(70);
  const [gainB, setGainB] = useState(65);

  const [hiA, setHiA] = useState(0);
  const [midA, setMidA] = useState(0);
  const [lowA, setLowA] = useState(0);

  const [hiB, setHiB] = useState(0);
  const [midB, setMidB] = useState(0);
  const [lowB, setLowB] = useState(0);

  const [volA, setVolA] = useState(85);
  const [volB, setVolB] = useState(80);

  const [crossfade, setCrossfade] = useState(50); // 0 = full A, 100 = full B
  const [master, setMaster] = useState(75);

  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);

  // ---- Live VU animation ----
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, []);

  const now = tick;

  // channel level = gain * volume * program energy, attenuated by crossfade side
  const energy = (seed: number) =>
    0.5 +
    0.35 * Math.abs(Math.sin(now * 0.11 + seed)) +
    0.15 * Math.abs(Math.sin(now * 0.37 + seed * 2));

  const cfA = 1 - crossfade / 100; // how much A survives crossfade
  const cfB = crossfade / 100;

  const levelA = Math.min(1, (gainA / 100) * (volA / 100) * energy(0.3) * (0.5 + 0.5 * cfA) * 1.35);
  const levelB = Math.min(1, (gainB / 100) * (volB / 100) * energy(1.7) * (0.5 + 0.5 * cfB) * 1.35);

  const masterMix = Math.min(1, ((levelA + levelB) * 0.6) * (master / 100) * 1.4);
  const masterL = Math.min(1, masterMix * (0.9 + 0.1 * Math.sin(now * 0.2)));
  const masterR = Math.min(1, masterMix * (0.9 + 0.1 * Math.sin(now * 0.2 + 1)));

  const [peakA, setPeakA] = useState(0);
  const [peakB, setPeakB] = useState(0);
  const [peakML, setPeakML] = useState(0);
  const [peakMR, setPeakMR] = useState(0);
  useEffect(() => {
    setPeakA((p) => Math.max(levelA, p * 0.96));
    setPeakB((p) => Math.max(levelB, p * 0.96));
    setPeakML((p) => Math.max(masterL, p * 0.96));
    setPeakMR((p) => Math.max(masterR, p * 0.96));
  }, [tick]);

  // ---- helpers ----
  const EqCluster = (props: {
    hi: number;
    mid: number;
    low: number;
    setHi: (v: number) => void;
    setMid: (v: number) => void;
    setLow: (v: number) => void;
    accentClass: string;
  }) => {
    const bands: Array<[string, number, (v: number) => void]> = [
      ["HI", props.hi, props.setHi],
      ["MID", props.mid, props.setMid],
      ["LOW", props.low, props.setLow],
    ];
    return (
      <div className="flex flex-col gap-2">
        {bands.map(([label, val, set]) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 w-7 text-right">
              {label}
            </span>
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob value={val} min={-24} max={24} bipolar onChange={set} />
            </div>
            <span
              className={
                "font-mono font-bold tracking-tight text-[10px] w-9 text-right " +
                (val === 0 ? "text-neutral-500" : props.accentClass)
              }
            >
              {(val > 0 ? "+" : "") + val.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* Header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
            Central Mixer
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wide">
          <span className={cueA || cueB ? "text-teal-300" : "text-neutral-500"}>
            CUE {cueA && cueB ? "A+B" : cueA ? "A" : cueB ? "B" : "—"}
          </span>
          <span className="text-neutral-400">
            MSTR {master.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-3 flex gap-3 overflow-hidden">
        {/* ===== CHANNEL A ===== */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 p-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide leading-tight text-amber-50">
              CH A
            </span>
            <span className="text-[10px] font-mono tracking-wide text-amber-400/80">DECK A</span>
          </div>

          {/* Gain */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 w-7 text-right">
              GAIN
            </span>
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob value={gainA} min={0} max={100} onChange={setGainA} />
            </div>
            <span className="font-mono font-bold tracking-tight text-[10px] w-9 text-right text-amber-300">
              {gainA}
            </span>
          </div>

          <div className="h-px bg-amber-500/10" />

          {/* EQ */}
          <EqCluster
            hi={hiA}
            mid={midA}
            low={lowA}
            setHi={setHiA}
            setMid={setMidA}
            setLow={setLowA}
            accentClass="text-amber-300"
          />

          <div className="h-px bg-amber-500/10" />

          {/* Cue */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 w-7 text-right">
              CUE
            </span>
            <div className="w-[3.5rem] h-[1.75rem]">
              <ToggleButton on={cueA} onChange={setCueA} tone="accent">
                <span className="font-mono font-semibold tracking-wider uppercase">PFL</span>
              </ToggleButton>
            </div>
          </div>

          {/* Fader + Meter */}
          <div className="flex-1 min-h-0 flex items-end justify-center gap-3 pt-1">
            <div className="flex flex-col items-center gap-1 h-full">
              <div className="flex-1 min-h-0 w-[2.2rem] flex items-center justify-center">
                <div className="h-full w-[2.2rem]">
                  <Fader
                    value={volA}
                    min={0}
                    max={100}
                    orientation="vertical"
                    detents={[0, 25, 50, 75, 100]}
                    onChange={setVolA}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold tracking-tight text-amber-300">
                {volA}
              </span>
            </div>
            <div className="h-full w-[1rem] flex items-center justify-center">
              <div className="h-full w-[1rem]">
                <LevelMeter level={levelA} peak={peakA} orientation="vertical" />
              </div>
            </div>
          </div>
        </div>

        {/* ===== MASTER / CENTER ===== */}
        <div className="flex-none w-[9rem] flex flex-col gap-2 p-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <span className="text-sm font-semibold tracking-wide leading-tight text-amber-50 text-center">
            MASTER
          </span>

          {/* Master knob */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-[3rem] h-[3rem]">
              <Knob value={master} min={0} max={100} onChange={setMaster} />
            </div>
            <span className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {master}
            </span>
            <span className="text-[10px] font-normal tracking-wide leading-none text-neutral-500">
              OUTPUT
            </span>
          </div>

          {/* Master VU (L/R) */}
          <div className="flex-1 min-h-0 flex items-stretch justify-center gap-3 py-1">
            <div className="flex flex-col items-center gap-1 h-full">
              <div className="flex-1 min-h-0 w-[1rem] flex items-stretch">
                <div className="h-full w-[1rem]">
                  <LevelMeter level={masterL} peak={peakML} orientation="vertical" />
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-500">L</span>
            </div>
            <div className="flex flex-col items-center gap-1 h-full">
              <div className="flex-1 min-h-0 w-[1rem] flex items-stretch">
                <div className="h-full w-[1rem]">
                  <LevelMeter level={masterR} peak={peakMR} orientation="vertical" />
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-widest text-neutral-500">R</span>
            </div>
          </div>

          {/* Crossfader */}
          <div className="flex flex-col gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-amber-300">
                A
              </span>
              <span className="text-[10px] font-mono tracking-wide text-neutral-500">XFADE</span>
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-teal-300">
                B
              </span>
            </div>
            <div className="h-[2.2rem] w-full flex items-center">
              <div className="w-full h-[2.2rem]">
                <Fader
                  value={crossfade}
                  min={0}
                  max={100}
                  orientation="horizontal"
                  detents={[0, 50, 100]}
                  bipolar
                  onChange={setCrossfade}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== CHANNEL B ===== */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 p-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide leading-tight text-amber-50">
              CH B
            </span>
            <span className="text-[10px] font-mono tracking-wide text-teal-300/80">DECK B</span>
          </div>

          {/* Gain */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 w-7 text-right">
              GAIN
            </span>
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob value={gainB} min={0} max={100} onChange={setGainB} />
            </div>
            <span className="font-mono font-bold tracking-tight text-[10px] w-9 text-right text-teal-300">
              {gainB}
            </span>
          </div>

          <div className="h-px bg-amber-500/10" />

          {/* EQ */}
          <EqCluster
            hi={hiB}
            mid={midB}
            low={lowB}
            setHi={setHiB}
            setMid={setMidB}
            setLow={setLowB}
            accentClass="text-teal-300"
          />

          <div className="h-px bg-amber-500/10" />

          {/* Cue */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 w-7 text-right">
              CUE
            </span>
            <div className="w-[3.5rem] h-[1.75rem]">
              <ToggleButton on={cueB} onChange={setCueB} tone="accent">
                <span className="font-mono font-semibold tracking-wider uppercase">PFL</span>
              </ToggleButton>
            </div>
          </div>

          {/* Fader + Meter */}
          <div className="flex-1 min-h-0 flex items-end justify-center gap-3 pt-1">
            <div className="h-full w-[1rem] flex items-center justify-center">
              <div className="h-full w-[1rem]">
                <LevelMeter level={levelB} peak={peakB} orientation="vertical" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 h-full">
              <div className="flex-1 min-h-0 w-[2.2rem] flex items-center justify-center">
                <div className="h-full w-[2.2rem]">
                  <Fader
                    value={volB}
                    min={0}
                    max={100}
                    orientation="vertical"
                    detents={[0, 25, 50, 75, 100]}
                    onChange={setVolB}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold tracking-tight text-teal-300">
                {volB}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15 font-mono text-[10px] tracking-wide">
        <span className="text-neutral-400">
          A <span className={levelA > 0.9 ? "text-rose-400" : "text-amber-300"}>{Math.round(levelA * 100)}%</span>
          <span className="text-neutral-600"> · </span>
          B <span className={levelB > 0.9 ? "text-rose-400" : "text-teal-300"}>{Math.round(levelB * 100)}%</span>
        </span>
        <span className={masterMix > 0.92 ? "text-rose-400" : "text-teal-300"}>
          MIX {Math.round(masterMix * 100)}%{masterMix > 0.92 ? " CLIP" : ""}
        </span>
      </div>
    </div>
  );
}