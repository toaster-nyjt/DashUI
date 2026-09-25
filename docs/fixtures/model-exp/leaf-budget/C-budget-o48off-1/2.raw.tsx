export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(gain 2.5 + eq 3*2.5=7.5 + fader 6 + cue 1.75 + gaps/pad ~3) ~22.9 + xfader row ~3.5 + footer 1.75 = ~30.4 ≤ 41.6
  // BUDGET width: chA(fader 2.2 + gap) + meterA 1 + master(knob 2.5 + meters) + meterB 1 + chB(fader 2.2) + gaps/pad ~ 40 ≤ 52.0

  // ---- Deck A state (amber identity) ----
  const [gainA, setGainA] = useState<number>(75);
  const [hiA, setHiA] = useState<number>(0);
  const [midA, setMidA] = useState<number>(0);
  const [lowA, setLowA] = useState<number>(0);
  const [volA, setVolA] = useState<number>(82);
  const [cueA, setCueA] = useState<boolean>(false);

  // ---- Deck B state (teal identity) ----
  const [gainB, setGainB] = useState<number>(70);
  const [hiB, setHiB] = useState<number>(0);
  const [midB, setMidB] = useState<number>(0);
  const [lowB, setLowB] = useState<number>(0);
  const [volB, setVolB] = useState<number>(78);
  const [cueB, setCueB] = useState<boolean>(false);

  // ---- Master ----
  const [crossfade, setCrossfade] = useState<number>(0); // -1 (A) .. +1 (B)
  const [master, setMaster] = useState<number>(85);

  // ---- Simulated VU animation ----
  const [tick, setTick] = useState<number>(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 100000), 90);
    return () => clearInterval(id);
  }, []);

  // Derived channel loudness feeding the meters (0..1)
  const aFader = volA / 100;
  const bFader = volB / 100;
  const aXf = Math.min(1, 1 - Math.max(0, crossfade)); // A fades as xf -> +1
  const bXf = Math.min(1, 1 + Math.min(0, crossfade)); // B fades as xf -> -1
  const eqBoostA = 1 + (hiA + midA + lowA) / 60;
  const eqBoostB = 1 + (hiB + midB + lowB) / 60;

  const envA = 0.55 + 0.35 * Math.sin(tick / 3.1) + 0.1 * Math.sin(tick / 1.3);
  const envB = 0.55 + 0.35 * Math.sin(tick / 2.6 + 1.4) + 0.1 * Math.sin(tick / 1.1);

  const preA = Math.max(0, envA) * (gainA / 100) * aFader * aXf * eqBoostA;
  const preB = Math.max(0, envB) * (gainB / 100) * bFader * bXf * eqBoostB;
  const levelA = Math.min(1, preA);
  const levelB = Math.min(1, preB);
  const masterL = Math.min(1, (preA + preB) * (master / 100) * 0.85);
  const masterR = Math.min(1, (preA + preB) * (master / 100) * 0.9);

  const peakA = useRef<number>(0);
  const peakB = useRef<number>(0);
  peakA.current = Math.max(levelA, peakA.current * 0.94);
  peakB.current = Math.max(levelB, peakB.current * 0.94);

  const eqRows: {
    label: string;
    aVal: number;
    aSet: (v: number) => void;
    bVal: number;
    bSet: (v: number) => void;
  }[] = [
    { label: "HI", aVal: hiA, aSet: setHiA, bVal: hiB, bSet: setHiB },
    { label: "MID", aVal: midA, aSet: setMidA, bVal: midB, bSet: setMidB },
    { label: "LOW", aVal: lowA, aSet: setLowA, bVal: lowB, bSet: setLowB },
  ];

  const capStyle = "flex flex-col items-center justify-center gap-1";
  const capLabel =
    "text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* radial warmth overlay */}
      <div className="relative flex flex-col h-full w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)]" />

        {/* ===== HEADER ===== */}
        <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20 z-10">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,146,60,0.7)]" />
            <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
              Central Mixer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wide text-amber-300/80">
              CH·A
            </span>
            <span className="text-[10px] font-mono tracking-wide text-neutral-500">
              /
            </span>
            <span className="text-[10px] font-mono tracking-wide text-teal-300/80">
              CH·B
            </span>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <div className="flex-1 min-h-0 z-10 p-3 flex flex-col gap-3">
          {/* --- Channel strips + master column --- */}
          <div className="flex-1 min-h-0 grid grid-cols-[1fr_auto_auto_auto_1fr] gap-3">
            {/* ===== CHANNEL A STRIP ===== */}
            <div className="flex flex-col rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-wide leading-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                  DECK A
                </span>
                <span className="h-2 w-2 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_0_10px_rgba(251,146,60,0.55)]" />
              </div>

              {/* Gain */}
              <div className={capStyle}>
                <Knob value={gainA} min={0} max={100} onChange={setGainA} mode="continuous" />
                <span className={capLabel}>Gain</span>
              </div>

              {/* EQ knobs */}
              <div className="flex flex-col gap-1.5">
                {eqRows.map((r) => (
                  <div key={"a-" + r.label} className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-neutral-400 w-6">
                      {r.label}
                    </span>
                    <Knob
                      value={r.aVal}
                      min={-12}
                      max={12}
                      onChange={r.aSet}
                      mode="continuous"
                      bipolar
                    />
                  </div>
                ))}
              </div>

              {/* Volume fader */}
              <div className="flex-1 min-h-0 flex flex-col items-center justify-end gap-1 pt-1">
                <div className="flex-1 min-h-0 flex items-end">
                  <div className="h-full flex items-stretch" style={{ height: "100%" }}>
                    <div style={{ height: "100%" }} className="flex">
                      <div className="h-full" style={{ height: "100%" }}>
                        <div style={{ width: "2.2rem", height: "100%", minHeight: "6rem" }}>
                          <Fader value={volA} min={0} max={100} onChange={setVolA} orientation="vertical" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={capLabel}>Volume</span>
              </div>

              {/* Cue */}
              <div className="w-full">
                <ToggleButton on={cueA} onChange={setCueA} tone="accent">
                  <span className="flex items-center gap-1">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                      <rect x="2" y="14" width="4" height="6" rx="1" />
                      <rect x="18" y="14" width="4" height="6" rx="1" />
                    </svg>
                    <span>CUE</span>
                  </span>
                </ToggleButton>
              </div>
            </div>

            {/* ===== CHANNEL A METER ===== */}
            <div className="flex flex-col items-center justify-end gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-1.5 py-2">
              <div className="flex-1 min-h-0 flex items-stretch">
                <div style={{ width: "1rem", height: "100%", minHeight: "4rem" }}>
                  <LevelMeter level={levelA} peak={peakA.current} orientation="vertical" />
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-wide text-amber-300/70">A</span>
            </div>

            {/* ===== MASTER COLUMN ===== */}
            <div className="flex flex-col items-center justify-between rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3 gap-3">
              <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
                Master
              </span>

              <div className={capStyle}>
                <div style={{ width: "3rem", height: "3rem" }}>
                  <Knob value={master} min={0} max={100} onChange={setMaster} mode="continuous" />
                </div>
                <span className={capLabel}>Level</span>
              </div>

              {/* Master stereo meters */}
              <div className="flex-1 min-h-0 flex items-stretch justify-center gap-1.5 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-2 py-2">
                <div className="flex flex-col items-center justify-end gap-1">
                  <div className="flex-1 min-h-0 flex items-stretch">
                    <div style={{ width: "1rem", height: "100%", minHeight: "4rem" }}>
                      <LevelMeter level={masterL} peak={Math.min(1, masterL + 0.05)} orientation="vertical" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono tracking-wide text-neutral-500">L</span>
                </div>
                <div className="flex flex-col items-center justify-end gap-1">
                  <div className="flex-1 min-h-0 flex items-stretch">
                    <div style={{ width: "1rem", height: "100%", minHeight: "4rem" }}>
                      <LevelMeter level={masterR} peak={Math.min(1, masterR + 0.05)} orientation="vertical" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono tracking-wide text-neutral-500">R</span>
                </div>
              </div>

              <span className="font-mono text-[10px] tracking-wide text-teal-300">
                {masterL + masterR > 1.75 ? "PEAK" : "OUT"}
              </span>
            </div>

            {/* ===== CHANNEL B METER ===== */}
            <div className="flex flex-col items-center justify-end gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-1.5 py-2">
              <div className="flex-1 min-h-0 flex items-stretch">
                <div style={{ width: "1rem", height: "100%", minHeight: "4rem" }}>
                  <LevelMeter level={levelB} peak={peakB.current} orientation="vertical" />
                </div>
              </div>
              <span className="text-[10px] font-mono tracking-wide text-teal-300/70">B</span>
            </div>

            {/* ===== CHANNEL B STRIP ===== */}
            <div className="flex flex-col rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-wide leading-tight text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
                  DECK B
                </span>
                <span className="h-2 w-2 rounded-full bg-teal-500/80 shadow-[0_0_10px_rgba(45,212,191,0.55)]" />
              </div>

              {/* Gain */}
              <div className={capStyle}>
                <Knob value={gainB} min={0} max={100} onChange={setGainB} mode="continuous" />
                <span className={capLabel}>Gain</span>
              </div>

              {/* EQ knobs */}
              <div className="flex flex-col gap-1.5">
                {eqRows.map((r) => (
                  <div key={"b-" + r.label} className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-neutral-400 w-6">
                      {r.label}
                    </span>
                    <Knob
                      value={r.bVal}
                      min={-12}
                      max={12}
                      onChange={r.bSet}
                      mode="continuous"
                      bipolar
                    />
                  </div>
                ))}
              </div>

              {/* Volume fader */}
              <div className="flex-1 min-h-0 flex flex-col items-center justify-end gap-1 pt-1">
                <div className="flex-1 min-h-0 flex items-end">
                  <div style={{ width: "2.2rem", height: "100%", minHeight: "6rem" }}>
                    <Fader value={volB} min={0} max={100} onChange={setVolB} orientation="vertical" />
                  </div>
                </div>
                <span className={capLabel}>Volume</span>
              </div>

              {/* Cue */}
              <div className="w-full">
                <ToggleButton on={cueB} onChange={setCueB} tone="accent">
                  <span className="flex items-center gap-1">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                      <rect x="2" y="14" width="4" height="6" rx="1" />
                      <rect x="18" y="14" width="4" height="6" rx="1" />
                    </svg>
                    <span>CUE</span>
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* --- Crossfader row --- */}
          <div className="flex-none rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span
                className={
                  "text-sm font-mono font-bold tracking-tight transition-all duration-200 " +
                  (crossfade < -0.05
                    ? "text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                    : "text-neutral-500")
                }
              >
                A
              </span>
              <div className="flex-1 min-w-0">
                <div style={{ width: "100%", height: "2.2rem", minWidth: "6rem" }}>
                  <Fader
                    value={crossfade}
                    min={-1}
                    max={1}
                    onChange={setCrossfade}
                    orientation="horizontal"
                    detents={[-1, 0, 1]}
                    bipolar
                  />
                </div>
                <div className="mt-1 flex items-center justify-center">
                  <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                    Crossfade
                  </span>
                </div>
              </div>
              <span
                className={
                  "text-sm font-mono font-bold tracking-tight transition-all duration-200 " +
                  (crossfade > 0.05
                    ? "text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                    : "text-neutral-500")
                }
              >
                B
              </span>
            </div>
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15 z-10">
          <span className="font-mono text-[10px] tracking-wide text-neutral-400">
            XF {crossfade === 0 ? "CTR" : crossfade < 0 ? "A" + Math.round(Math.abs(crossfade) * 100) : "B" + Math.round(crossfade * 100)}
          </span>
          <div className="flex items-center gap-3">
            {(cueA || cueB) && (
              <span className="font-mono text-[10px] tracking-wide text-teal-300">
                CUE {cueA ? "A" : ""}{cueA && cueB ? "+" : ""}{cueB ? "B" : ""}
              </span>
            )}
            <span className="font-mono text-[10px] tracking-wide text-neutral-400">
              MST {master}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}