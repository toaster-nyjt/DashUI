export default function GeneratedComponent() {
  // ---- Channel A state ----
  const [gainA, setGainA] = useState(72);
  const [hiA, setHiA] = useState(2);
  const [midA, setMidA] = useState(-1);
  const [loA, setLoA] = useState(3);
  const [volA, setVolA] = useState(84);
  const [cueA, setCueA] = useState(true);

  // ---- Channel B state ----
  const [gainB, setGainB] = useState(65);
  const [hiB, setHiB] = useState(-3);
  const [midB, setMidB] = useState(1);
  const [loB, setLoB] = useState(-2);
  const [volB, setVolB] = useState(70);
  const [cueB, setCueB] = useState(false);

  // ---- Master / crossfade ----
  const [crossfade, setCrossfade] = useState(0); // -100 (A) .. 100 (B)
  const [master, setMaster] = useState(80);

  // ---- Live meter levels (visual only) ----
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, []);

  // Derive animated meter levels from state + a wandering pseudo-signal
  const wobble = (seed: number) => {
    const s = Math.sin((tick + seed) * 0.5) * 0.5 + 0.5;
    const s2 = Math.sin((tick + seed) * 1.31 + 1.7) * 0.5 + 0.5;
    return s * 0.6 + s2 * 0.4;
  };

  const xfA = Math.min(1, (100 - Math.max(0, crossfade)) / 100 + 0.15);
  const xfB = Math.min(1, (100 + Math.min(0, crossfade)) / 100 + 0.15);

  const levelA = Math.max(0, Math.min(1, (volA / 100) * xfA * (0.55 + wobble(0) * 0.5)));
  const peakA = Math.max(0, Math.min(1, levelA + 0.12 + wobble(3) * 0.08));
  const levelB = Math.max(0, Math.min(1, (volB / 100) * xfB * (0.55 + wobble(11) * 0.5)));
  const peakB = Math.max(0, Math.min(1, levelB + 0.12 + wobble(6) * 0.08));

  const masterMix = (levelA + levelB) * 0.5 * (master / 100);
  const masterL = Math.max(0, Math.min(1, masterMix * (0.85 + wobble(21) * 0.35)));
  const masterR = Math.max(0, Math.min(1, masterMix * (0.85 + wobble(24) * 0.35)));
  const peakML = Math.max(0, Math.min(1, masterL + 0.1));
  const peakMR = Math.max(0, Math.min(1, masterR + 0.1));

  const accentText = (deck: "A" | "B") => (deck === "A" ? "text-amber-300" : "text-teal-300");
  const capLabel = "text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-400 text-center";

  // A vertical channel strip (gain, 3-band EQ, fader, cue, meter)
  const ChannelStrip = ({
    deck,
    gain,
    setGain,
    hi,
    setHi,
    mid,
    setMid,
    lo,
    setLo,
    vol,
    setVol,
    cue,
    setCue,
    level,
    peak,
  }: any) => (
    <div className="flex flex-col h-full rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 gap-2">
      {/* Deck header */}
      <div className="flex items-center justify-between px-1 flex-none">
        <span className={"font-mono font-bold tracking-wider text-[0.95rem] " + accentText(deck)}>
          {deck === "A" ? "CH·A" : "CH·B"}
        </span>
        <span
          className={
            "h-2 w-2 rounded-full transition-all duration-500 " +
            (deck === "A"
              ? "bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.7)]"
              : "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.7)]")
          }
        />
      </div>

      {/* Gain */}
      <div className="flex flex-col items-center gap-1 flex-none">
        <div className="w-[2.5rem] h-[2.5rem]">
          <Knob value={gain} min={0} max={100} onChange={setGain} mode="continuous" />
        </div>
        <span className={capLabel}>Trim</span>
      </div>

      {/* 3-band EQ */}
      <div className="grid grid-rows-3 gap-1.5 flex-none">
        {[
          { label: "Hi", v: hi, set: setHi },
          { label: "Mid", v: mid, set: setMid },
          { label: "Lo", v: lo, set: setLo },
        ].map((band) => (
          <div key={band.label} className="flex items-center gap-2 justify-center">
            <span className="w-6 text-right text-[10px] font-medium tracking-widest uppercase text-neutral-400">
              {band.label}
            </span>
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob value={band.v} min={-12} max={12} onChange={band.set} bipolar mode="continuous" />
            </div>
          </div>
        ))}
      </div>

      {/* Fader + meter row (fills remaining height) */}
      <div className="flex-1 flex items-stretch justify-center gap-2 py-1">
        <div className="flex flex-col items-center gap-1">
          <div className="w-[2.2rem] flex-1 flex items-stretch">
            <Fader value={vol} min={0} max={100} onChange={setVol} orientation="vertical" />
          </div>
          <span className={capLabel}>Vol</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-[1rem] flex-1 flex items-stretch">
            <LevelMeter level={level} peak={peak} orientation="vertical" />
          </div>
          <span className="font-mono text-[10px] tracking-tight text-neutral-500">
            {Math.round(level * 100)}
          </span>
        </div>
      </div>

      {/* Cue */}
      <div className="flex flex-col items-center gap-1 flex-none">
        <div className="w-full h-[1.75rem]">
          <ToggleButton on={cue} onChange={setCue} tone={deck === "A" ? "accent" : "neutral"}>
            <span className="font-mono font-semibold tracking-wider uppercase">Cue</span>
          </ToggleButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black">
      {/* Header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.7)]" />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Central Mixer</span>
        </div>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          MASTER <span className="text-teal-300">{Math.round(master)}%</span>
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Channel A */}
        <div className="flex-1">
          <ChannelStrip
            deck="A"
            gain={gainA}
            setGain={setGainA}
            hi={hiA}
            setHi={setHiA}
            mid={midA}
            setMid={setMidA}
            lo={loA}
            setLo={setLoA}
            vol={volA}
            setVol={setVolA}
            cue={cueA}
            setCue={setCueA}
            level={levelA}
            peak={peakA}
          />
        </div>

        {/* Center: master + crossfader */}
        <div className="flex-[1.15] flex flex-col gap-3">
          {/* Master section */}
          <div className="flex-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3 flex flex-col items-center gap-2">
            <span className="text-sm font-semibold tracking-wide uppercase text-amber-50">Master</span>

            <div className="flex flex-col items-center gap-1 flex-none">
              <div className="w-[3.4rem] h-[3.4rem]">
                <Knob value={master} min={0} max={100} onChange={setMaster} mode="continuous" />
              </div>
              <span className={capLabel}>Output</span>
            </div>

            {/* Stereo master meters fill remaining height */}
            <div className="flex-1 w-full flex items-stretch justify-center gap-3 pt-1">
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1rem] flex-1 flex items-stretch">
                  <LevelMeter level={masterL} peak={peakML} orientation="vertical" />
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">L</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-[1rem] flex-1 flex items-stretch">
                  <LevelMeter level={masterR} peak={peakMR} orientation="vertical" />
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">R</span>
              </div>
            </div>
          </div>

          {/* Crossfader */}
          <div className="flex-none rounded-2xl border border-amber-500/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono font-bold text-[0.8rem] tracking-wider text-amber-300">A</span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400">Crossfade</span>
              <span className="font-mono font-bold text-[0.8rem] tracking-wider text-teal-300">B</span>
            </div>
            <div className="w-full h-[2.2rem]">
              <Fader
                value={crossfade}
                min={-100}
                max={100}
                onChange={setCrossfade}
                orientation="horizontal"
                bipolar
                detents={[0]}
              />
            </div>
            <div className="flex items-center justify-center">
              <span className="font-mono text-[10px] tracking-tight text-neutral-500">
                {crossfade === 0 ? "CENTER" : crossfade < 0 ? "A " + Math.abs(Math.round(crossfade)) + "%" : "B " + Math.round(crossfade) + "%"}
              </span>
            </div>
          </div>
        </div>

        {/* Channel B */}
        <div className="flex-1">
          <ChannelStrip
            deck="B"
            gain={gainB}
            setGain={setGainB}
            hi={hiB}
            setHi={setHiB}
            mid={midB}
            setMid={setMidB}
            lo={loB}
            setLo={setLoB}
            vol={volB}
            setVol={setVolB}
            cue={cueB}
            setCue={setCueB}
            level={levelB}
            peak={peakB}
          />
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          CUE:{" "}
          <span className={cueA || cueB ? "text-teal-300" : "text-neutral-500"}>
            {[cueA ? "A" : null, cueB ? "B" : null].filter(Boolean).join("+") || "OFF"}
          </span>
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          MIX <span className="text-amber-300">{Math.round((levelA + levelB) * 50)}%</span>
        </span>
      </div>
    </div>
  );
}