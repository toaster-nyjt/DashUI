export default function GeneratedComponent() {
  const [gain, setGain] = useState<[number, number]>([0, 0]);
  const [eq, setEq] = useState<[number[], number[]]>([[0, 0, 0], [0, 0, 0]]);
  const [faders, setFaders] = useState<[number, number]>([0.85, 0.7]);
  const [cue, setCue] = useState<[boolean, boolean]>([false, true]);
  const [xfade, setXfade] = useState(0.5);
  const [master, setMaster] = useState(0.8);
  const [phones, setPhones] = useState(0.5);
  const [levels, setLevels] = useState<[number, number]>([0.4, 0.3]);
  const tRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tRef.current += 0.09;
      const t = tRef.current;
      const baseA = 0.5 + 0.35 * Math.abs(Math.sin(t * 2.1)) + 0.15 * Math.random();
      const baseB = 0.45 + 0.4 * Math.abs(Math.sin(t * 1.6 + 1)) + 0.15 * Math.random();
      const gA = 1 + gain[0] / 24;
      const gB = 1 + gain[1] / 24;
      setLevels([
        Math.min(1, baseA * gA * faders[0]),
        Math.min(1, baseB * gB * faders[1]),
      ]);
    }, 90);
    return () => clearInterval(id);
  }, [gain, faders]);

  const setEqBand = (ch: number, band: number, v: number) => {
    setEq((prev) => {
      const next: [number[], number[]] = [[...prev[0]], [...prev[1]]];
      next[ch][band] = v;
      return next;
    });
  };

  const eqLabels = ["HI", "MID", "LOW"];

  const renderStrip = (ch: number) => {
    const isA = ch === 0;
    const accent = isA ? "text-amber-400" : "text-violet-300";
    const ring = isA ? "border-amber-500/15" : "border-violet-500/20";
    const glow = isA ? "shadow-amber-500/30" : "shadow-violet-500/30";
    const lvl = levels[ch];
    return (
      <div
        className={
          "flex flex-col gap-2 p-2 rounded-2xl border bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60 transition-all duration-300 ease-out " +
          ring +
          (cue[ch] ? " ring-1 ring-inset ring-violet-500/50" : "")
        }
        style={{ width: "6.25rem" }}
      >
        <div className="flex items-center justify-between">
          <span className={"font-mono font-bold tracking-tight text-[11px] " + accent}>
            {isA ? "CH 1" : "CH 2"}
          </span>
          <span
            className={
              "w-1.5 h-1.5 rounded-full transition-all duration-100 ease-linear " +
              (lvl > 0.95 ? "bg-red-500 shadow-lg shadow-red-500/60" : lvl > 0.75 ? "bg-amber-400" : "bg-lime-400/70")
            }
          />
        </div>

        {/* Gain + EQ grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="flex flex-col items-center gap-1">
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob min={-12} max={12} value={gain[ch]} onChange={(v) => setGain((p) => (ch === 0 ? [v, p[1]] : [p[0], v]))} />
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">Gain</span>
          </div>
          {eqLabels.map((lab, i) => (
            <div key={"eq-" + ch + "-" + i} className="flex flex-col items-center gap-1">
              <div className="w-[2.5rem] h-[2.5rem]">
                <Knob min={-12} max={12} value={eq[ch][i]} onChange={(v) => setEqBand(ch, i, v)} />
              </div>
              <span
                className={
                  "font-medium uppercase tracking-widest leading-none text-[10px] transition-all duration-200 " +
                  (eq[ch][i] !== 0 ? accent : "text-stone-400")
                }
              >
                {lab}
              </span>
            </div>
          ))}
        </div>

        {/* Cue */}
        <div className="flex justify-center">
          <div className="w-[3.25rem] h-[1.5rem]">
            <ToggleButton on={cue[ch]} onChange={(on) => setCue((p) => (ch === 0 ? [on, p[1]] : [p[0], on]))}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </ToggleButton>
          </div>
        </div>

        {/* Fader + Meter */}
        <div className="flex-1 flex items-stretch justify-center gap-2 pt-1">
          <div className="w-[1.6rem]">
            <Fader min={0} max={1} value={faders[ch]} onChange={(v) => setFaders((p) => (ch === 0 ? [v, p[1]] : [p[0], v]))} orientation="vertical" />
          </div>
          <div className={"w-[1.6rem] rounded-full transition-all duration-100 ease-linear " + (lvl > 0.6 ? "shadow-lg " + glow : "shadow-none")}>
            <LevelMeter level={lvl} />
          </div>
        </div>
      </div>
    );
  };

  const xPct = Math.round(xfade * 100);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-lg shadow-amber-500/40" />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Central Mixer</span>
        </div>
        <span className="font-mono font-bold tracking-tight text-[10px] text-lime-300 animate-pulse">MST LIVE</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex items-stretch gap-2">
          {renderStrip(0)}

          {/* Center master column */}
          <div className="flex-1 flex flex-col items-stretch gap-2 p-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60">
            <div className="flex flex-col items-center gap-1 flex-1 justify-center">
              <div className="relative w-[3.75rem] h-[3.75rem]">
                <div
                  className="absolute -inset-2 rounded-full border border-amber-500/20 border-dashed animate-[spin_12s_linear_infinite] transition-all duration-200"
                  style={{ opacity: 0.4 + master * 0.6 }}
                />
                <Knob min={0} max={1} value={master} onChange={setMaster} />
              </div>
              <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px] mt-1">Master</span>
              <span className="font-mono font-bold tracking-tight text-amber-400 text-[11px] leading-none">{Math.round(master * 100)}</span>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            <div className="flex flex-col items-center gap-1 flex-1 justify-center">
              <div className="relative w-[3rem] h-[3rem]">
                <div
                  className={
                    "absolute -inset-1.5 rounded-full border border-violet-500/30 transition-all duration-300 " +
                    (cue[0] || cue[1] ? "animate-pulse shadow-lg shadow-violet-500/30" : "opacity-40")
                  }
                />
                <Knob min={0} max={1} value={phones} onChange={setPhones} />
              </div>
              <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px] mt-1">Phones Mix</span>
              <div className="flex items-center gap-1 font-mono font-bold tracking-tight text-[10px] leading-none">
                <span className={"transition-all duration-200 " + (phones < 0.5 ? "text-violet-300" : "text-stone-600")}>CUE</span>
                <span className="text-stone-600">·</span>
                <span className={"transition-all duration-200 " + (phones >= 0.5 ? "text-amber-400" : "text-stone-600")}>MST</span>
              </div>
            </div>
          </div>

          {renderStrip(1)}
        </div>

        {/* Crossfader */}
        <div className="flex-none flex items-center gap-2 p-2 rounded-xl border border-stone-800/70 bg-stone-950/80">
          <span
            className="font-mono font-bold tracking-tight text-amber-400 text-[11px] leading-none transition-all duration-200"
            style={{ opacity: 0.35 + (1 - xfade) * 0.65, transform: "scale(" + (0.9 + (1 - xfade) * 0.3) + ")" }}
          >
            A
          </span>
          <div className="flex-1 flex flex-col gap-1">
            <div className="w-full h-[1.6rem]">
              <Fader min={0} max={1} value={xfade} onChange={setXfade} orientation="horizontal" />
            </div>
            <div className="w-full h-0.5 rounded-full bg-stone-800/70 relative">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-violet-500 transition-all duration-150 ease-out"
                style={{ width: xPct + "%" }}
              />
            </div>
          </div>
          <span
            className="font-mono font-bold tracking-tight text-violet-300 text-[11px] leading-none transition-all duration-200"
            style={{ opacity: 0.35 + xfade * 0.65, transform: "scale(" + (0.9 + xfade * 0.3) + ")" }}
          >
            B
          </span>
        </div>
      </div>
    </div>
  );
}