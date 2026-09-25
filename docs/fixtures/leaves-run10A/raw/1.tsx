export default function GeneratedComponent() {
  // ---- Channel 1 (Deck A / amber) state ----
  const [gainA, setGainA] = useState(62);
  const [hiA, setHiA] = useState(58);
  const [midA, setMidA] = useState(50);
  const [lowA, setLowA] = useState(70);
  const [faderA, setFaderA] = useState(78);
  const [cueA, setCueA] = useState(false);

  // ---- Channel 2 (Deck B / violet) state ----
  const [gainB, setGainB] = useState(55);
  const [hiB, setHiB] = useState(64);
  const [midB, setMidB] = useState(48);
  const [lowB, setLowB] = useState(52);
  const [faderB, setFaderB] = useState(66);
  const [cueB, setCueB] = useState(false);

  // ---- Master section ----
  const [xfade, setXfade] = useState(50);
  const [master, setMaster] = useState(80);
  const [hpMix, setHpMix] = useState(35);

  // ---- Live VU simulation, driven by fader + gain + crossfade weighting ----
  const [pulseA, setPulseA] = useState(0.4);
  const [pulseB, setPulseB] = useState(0.4);
  useEffect(() => {
    const id = setInterval(() => {
      setPulseA(0.35 + Math.random() * 0.65);
      setPulseB(0.35 + Math.random() * 0.65);
    }, 110);
    return () => clearInterval(id);
  }, []);

  const wA = (100 - xfade) / 100;
  const wB = xfade / 100;
  const levelA = Math.min(
    1,
    (faderA / 100) * (0.45 + (gainA / 100) * 0.55) * (0.55 + wA * 0.75) * pulseA
  );
  const levelB = Math.min(
    1,
    (faderB / 100) * (0.45 + (gainB / 100) * 0.55) * (0.55 + wB * 0.75) * pulseB
  );

  const Label = (props: { children: React.ReactNode; tone?: string }) => (
    <span
      className={
        "font-medium uppercase tracking-widest leading-none text-[10px] " +
        (props.tone || "text-stone-400")
      }
    >
      {props.children}
    </span>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header chrome */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-[11px] leading-none">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Mixer
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400 shadow-lg shadow-lime-400/30 animate-pulse" />
          <span className="font-mono font-bold tracking-tight text-[10px] text-lime-300">
            LIVE
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-2 flex flex-col gap-2">
        {/* Two channel strips */}
        <div className="flex-1 grid grid-cols-2 gap-2">
          {/* ---------- CHANNEL 1 ---------- */}
          <div className="rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-amber-500/5 to-neutral-950/60 shadow-2xl shadow-black/60 p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-widest text-[10px] text-amber-300">
                CH 1
              </span>
              <span className="font-mono font-bold text-[9px] tracking-tight text-amber-400/80">
                DECK A
              </span>
            </div>

            {/* Gain trim */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8">
                <Knob min={0} max={100} value={gainA} onChange={setGainA} />
              </div>
              <Label>Gain</Label>
            </div>

            {/* 3-band EQ */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { l: "Hi", v: hiA, s: setHiA },
                { l: "Mid", v: midA, s: setMidA },
                { l: "Low", v: lowA, s: setLowA },
              ].map((b) => (
                <div key={"a-" + b.l} className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7">
                    <Knob min={-12} max={12} value={b.v} onChange={b.s} />
                  </div>
                  <Label>{b.l}</Label>
                </div>
              ))}
            </div>

            {/* VU + Fader row */}
            <div className="flex-1 flex items-stretch justify-center gap-2 min-h-0">
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 flex-1">
                  <LevelMeter level={levelA} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 flex-1">
                  <Fader min={0} max={100} value={faderA} onChange={setFaderA} />
                </div>
              </div>
            </div>

            {/* Cue / PFL */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-6">
                <ToggleButton on={cueA} onChange={setCueA}>
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* ---------- CHANNEL 2 ---------- */}
          <div className="rounded-2xl border border-violet-500/15 bg-neutral-900/90 bg-gradient-to-b from-violet-500/5 to-neutral-950/60 shadow-2xl shadow-black/60 p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold uppercase tracking-widest text-[10px] text-violet-300">
                CH 2
              </span>
              <span className="font-mono font-bold text-[9px] tracking-tight text-violet-300/80">
                DECK B
              </span>
            </div>

            {/* Gain trim */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8">
                <Knob min={0} max={100} value={gainB} onChange={setGainB} />
              </div>
              <Label>Gain</Label>
            </div>

            {/* 3-band EQ */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { l: "Hi", v: hiB, s: setHiB },
                { l: "Mid", v: midB, s: setMidB },
                { l: "Low", v: lowB, s: setLowB },
              ].map((b) => (
                <div key={"b-" + b.l} className="flex flex-col items-center gap-1">
                  <div className="w-7 h-7">
                    <Knob min={-12} max={12} value={b.v} onChange={b.s} />
                  </div>
                  <Label>{b.l}</Label>
                </div>
              ))}
            </div>

            {/* VU + Fader row */}
            <div className="flex-1 flex items-stretch justify-center gap-2 min-h-0">
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 flex-1">
                  <LevelMeter level={levelB} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 flex-1">
                  <Fader min={0} max={100} value={faderB} onChange={setFaderB} />
                </div>
              </div>
            </div>

            {/* Cue / PFL */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-6">
                <ToggleButton on={cueB} onChange={setCueB}>
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Master section: crossfader + master vol + hp mix */}
        <div className="flex-none rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-stone-800/40 to-neutral-950/60 shadow-2xl shadow-black/60 p-2 flex items-end gap-3">
          {/* Crossfader */}
          <div className="flex-1 min-w-0 flex flex-col items-stretch gap-1">
            <div className="flex items-center justify-between px-0.5">
              <Label tone="text-amber-300">A</Label>
              <Label>Xfade</Label>
              <Label tone="text-violet-300">B</Label>
            </div>
            <div className="h-[1.6rem]">
              <Fader
                min={0}
                max={100}
                value={xfade}
                onChange={setXfade}
                orientation="horizontal"
              />
            </div>
          </div>

          {/* Master volume */}
          <div className="flex-none flex flex-col items-center gap-1">
            <div className="w-9 h-9">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <Label tone="text-amber-300">Master</Label>
          </div>

          {/* Headphone mix */}
          <div className="flex-none flex flex-col items-center gap-1">
            <div className="w-9 h-9">
              <Knob min={0} max={100} value={hpMix} onChange={setHpMix} />
            </div>
            <Label>Phones</Label>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Xfade{" "}
          <span className="font-mono text-lime-300">
            {xfade < 45 ? "A" : xfade > 55 ? "B" : "CTR"}
          </span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Mstr <span className="font-mono text-lime-300">{master}%</span>
        </span>
      </div>
    </div>
  );
}