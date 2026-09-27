export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 0.75 + knob row 3.9 + gap 0.75 + [fader+meter flex ≥7] + gap 0.75 + cue 2.25 + gap 0.75 + crossfader block 5 + pad 0.75 + footer 1.75 = 26.65 fixed ≤ 38.1 (fader region absorbs ~11.4)
  // BUDGET width: pad 0.75 + strip A 27 + gap 0.75 + strip B 27 + pad 0.75 = 56.25 ≤ 59.0 (strips fluid via flex-1)

  const [gainA, setGainA] = useState(0.2);
  const [gainB, setGainB] = useState(-0.1);
  const [eqA, setEqA] = useState({ hi: 2, mid: 0, low: -1 });
  const [eqB, setEqB] = useState({ hi: -2, mid: 1, low: 3 });
  const [volA, setVolA] = useState(82);
  const [volB, setVolB] = useState(64);
  const [xf, setXf] = useState(0);
  const [cueA, setCueA] = useState(true);
  const [cueB, setCueB] = useState(false);
  const [lvlA, setLvlA] = useState([0.4, 0.35]);
  const [lvlB, setLvlB] = useState([0.3, 0.32]);
  const [peakA, setPeakA] = useState([0.5, 0.5]);
  const [peakB, setPeakB] = useState([0.4, 0.4]);
  const phase = useRef(0);

  // Incoming deck signals (pre-mixer sources) and play state
  const [deckA, setDeckA] = useState({ playing: false, level: [0.62, 0.58] });
  const [deckB, setDeckB] = useState({ playing: false, level: [0.34, 0.31] });

  // Incoming FX rack routing/processing
  const [fx, setFx] = useState({
    engaged: false,
    channel: "a" as "a" | "b" | "m",
    type: "echo" as "echo" | "reverb" | "filter" | "flanger" | "gate",
    wet: 0,
    params: [0, 0, 0] as [number, number, number],
    division: "1/4" as "1/8" | "1/4" | "1/2" | "1" | "2" | "4",
  });

  // Post-crossfader master mix output
  const [masterLevels, setMasterLevels] = useState<[number, number]>([0.4, 0.35]);
  const [masterPeak, setMasterPeak] = useState<[number, number]>([0.5, 0.48]);
  const [masterClip, setMasterClip] = useState(false);

  useEffect(() => bus.on("DJ Table: Left Deck (Deck A)->DJ Table: Central Mixer Console", (data) => {
    setDeckA({ playing: data.playing, level: data.level });
  }), []);

  useEffect(() => bus.on("DJ Table: Right Deck (Deck B)->DJ Table: Central Mixer Console", (data) => {
    setDeckB({ playing: data.playing, level: data.level });
  }), []);

  useEffect(() => bus.on("DJ Table: Effects Rack->DJ Table: Central Mixer Console", (data) => {
    setFx({
      engaged: data.engaged,
      channel: data.channel,
      type: data.type,
      wet: data.wet,
      params: data.params,
      division: data.division,
    });
  }), []);

  const xfA = Math.min(1, 1 - xf > 1 ? 1 : Math.max(0, 1 - Math.max(0, xf) * 1));
  const xfB = Math.min(1, Math.max(0, 1 + Math.min(0, xf) * 1));

  useEffect(() => {
    const id = setInterval(() => {
      phase.current += 1;
      const p = phase.current;
      const base = (k: number, seed: number) =>
        Math.max(
          0,
          Math.min(
            1,
            k *
              (0.55 +
                0.3 * Math.abs(Math.sin(p * 0.31 + seed)) +
                0.15 * Math.abs(Math.sin(p * 0.83 + seed * 2)))
          )
        );
      const fxBoostA = fx.engaged && fx.channel === "a" ? 1 + fx.wet / 200 : 1;
      const fxBoostB = fx.engaged && fx.channel === "b" ? 1 + fx.wet / 200 : 1;
      const srcA = deckA.playing ? (deckA.level[0] + deckA.level[1]) / 2 : 0;
      const srcB = deckB.playing ? (deckB.level[0] + deckB.level[1]) / 2 : 0;
      const kA = (volA / 100) * Math.pow(10, gainA / 6) * xfA * (0.4 + srcA) * fxBoostA;
      const kB = (volB / 100) * Math.pow(10, gainB / 6) * xfB * (0.4 + srcB) * fxBoostB;
      const a = [base(kA, 0.4), base(kA, 1.7)];
      const b = [base(kB, 2.9), base(kB, 4.1)];
      setLvlA(a);
      setLvlB(b);
      setPeakA((prev) => prev.map((v, i) => Math.max(a[i], v - 0.035)));
      setPeakB((prev) => prev.map((v, i) => Math.max(b[i], v - 0.035)));

      const fxMasterBoost = fx.engaged && fx.channel === "m" ? 1 + fx.wet / 200 : 1;
      const mixL = Math.max(0, Math.min(1, (a[0] + b[0]) * fxMasterBoost));
      const mixR = Math.max(0, Math.min(1, (a[1] + b[1]) * fxMasterBoost));
      setMasterLevels([mixL, mixR]);
      setMasterPeak((prev) => [Math.max(mixL, prev[0] - 0.035), Math.max(mixR, prev[1] - 0.035)]);
      setMasterClip(mixL > 0.96 || mixR > 0.96);
    }, 90);
    return () => clearInterval(id);
  }, [volA, volB, gainA, gainB, xfA, xfB, deckA, deckB, fx]);

  useEffect(() => {
    bus.emit("DJ Table: Central Mixer Console->DJ Table: Master Output & VU Meters", {
      levels: masterLevels,
      peak: masterPeak,
      clip: masterClip,
    });
  }, [masterLevels, masterPeak, masterClip]);

  const strip = (
    id: "A" | "B",
    accentText: string,
    dot: string,
    glow: string,
    gain: number,
    setGain: (v: number) => void,
    eq: { hi: number; mid: number; low: number },
    setEq: (e: { hi: number; mid: number; low: number }) => void,
    vol: number,
    setVol: (v: number) => void,
    levels: number[],
    peak: number[],
    cue: boolean,
    setCue: (b: boolean) => void
  ) => (
    <div className="flex-1 flex flex-col gap-2 rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm p-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={"h-2 w-2 rounded-full " + dot + " " + glow} />
          <span className={"text-sm font-bold uppercase tracking-[0.18em] " + accentText}>
            CH {id}
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-600 truncate">
          {vol.toFixed(0).padStart(3, "0")} · {gain >= 0 ? "+" : ""}
          {gain.toFixed(1)}dB
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        {[
          { k: "GAIN", v: gain, set: (n: number) => setGain(n), min: -12, max: 12 },
          { k: "HI", v: eq.hi, set: (n: number) => setEq({ ...eq, hi: n }), min: -26, max: 6 },
          { k: "MID", v: eq.mid, set: (n: number) => setEq({ ...eq, mid: n }), min: -26, max: 6 },
          { k: "LOW", v: eq.low, set: (n: number) => setEq({ ...eq, low: n }), min: -26, max: 6 },
        ].map((c) => (
          <div key={c.k} className="flex flex-col items-center gap-1">
            <div className="h-[3rem] w-[3rem]">
              <Knob
                min={c.min}
                max={c.max}
                value={c.v}
                onChange={c.set}
                mode="continuous"
                bipolar
              />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {c.k}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-stretch justify-center gap-4 rounded-xl border border-zinc-800/80 bg-[#08060f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-2">
        <div className="flex flex-col items-center gap-1">
          <div className="flex-1 w-[3.5rem]">
            <Fader
              min={0}
              max={100}
              value={vol}
              onChange={setVol}
              orientation="vertical"
              detents={[0, 50, 100]}
            />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            VOL
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex-1 w-[2.5rem]">
            <LevelMeter levels={levels} peak={peak} clip={Math.max(...levels) > 0.96} orientation="vertical" />
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            VU
          </span>
        </div>
      </div>

      <div className="h-[2.25rem] w-full">
        <PushButton mode="toggle" on={cue} onChange={setCue} tone="accent">
          <span className="font-bold uppercase tracking-[0.12em]">CUE {id}</span>
        </PushButton>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#050308] text-zinc-100">
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-violet-500/25">
        <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_8px_currentColor] text-violet-400 animate-pulse" />
        <span className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-200 truncate">
          Central Mixer Console
        </span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.14em] text-violet-300/70">
          XF {xf > 0.02 ? "B" : xf < -0.02 ? "A" : "CTR"} {Math.abs(xf * 100).toFixed(0)}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex items-stretch gap-3">
          {strip("A", "text-cyan-300", "bg-cyan-400", "shadow-[0_0_18px_rgba(34,211,238,0.45)]", gainA, setGainA, eqA, setEqA, volA, setVolA, lvlA, peakA, cueA, setCueA)}
          {strip("B", "text-amber-300", "bg-amber-400", "shadow-[0_0_18px_rgba(251,191,36,0.45)]", gainB, setGainB, eqB, setEqB, volB, setVolB, lvlB, peakB, cueB, setCueB)}
        </div>

        <div className="flex-none flex items-center gap-3 rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm p-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300 drop-shadow-[0_0_6px_currentColor]">
              A
            </span>
            <span className="text-[10px] font-medium tracking-wide text-zinc-600">DECK</span>
          </div>
          <div className="flex-1 h-[3.25rem]">
            <Fader
              min={-1}
              max={1}
              value={xf}
              onChange={setXf}
              orientation="horizontal"
              detents={[-1, 0, 1]}
              bipolar
            />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300 drop-shadow-[0_0_6px_currentColor]">
              B
            </span>
            <span className="text-[10px] font-medium tracking-wide text-zinc-600">DECK</span>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 bg-zinc-950/90 border-t border-zinc-800/80">
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">
          CROSSFADE → MASTER BUS
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">
          SUM {(Math.max(...lvlA) * xfA * 100).toFixed(0)}·{(Math.max(...lvlB) * xfB * 100).toFixed(0)}
        </span>
      </div>
    </div>
  );
}