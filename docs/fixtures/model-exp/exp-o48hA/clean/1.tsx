export default function GeneratedComponent() {
  const [chA, setChA] = useState({ gain: 78, hi: 2, mid: 0, low: -1, fader: 82, cue: false });
  const [chB, setChB] = useState({ gain: 74, hi: -1, mid: 1, low: 3, fader: 76, cue: true });
  const [xfade, setXfade] = useState(50);
  const [master, setMaster] = useState(82);
  const [phones, setPhones] = useState(48);
  const [vuA, setVuA] = useState(0.4);
  const [vuB, setVuB] = useState(0.4);

  const stateRef = useRef({ chA, chB, xfade });
  stateRef.current = { chA, chB, xfade };

  useEffect(() => {
    const id = setInterval(() => {
      const { chA, chB, xfade } = stateRef.current;
      const aMix = (100 - xfade) / 100;
      const bMix = xfade / 100;
      const tA = (chA.fader / 100) * (0.4 + 0.6 * chA.gain / 100) * (0.35 + 0.65 * aMix);
      const tB = (chB.fader / 100) * (0.4 + 0.6 * chB.gain / 100) * (0.35 + 0.65 * bMix);
      const clamp = (x) => Math.min(1, Math.max(0, x));
      setVuA((v) => clamp(v * 0.55 + (tA + (Math.random() - 0.5) * 0.22) * 0.45));
      setVuB((v) => clamp(v * 0.55 + (tB + (Math.random() - 0.5) * 0.22) * 0.45));
    }, 110);
    return () => clearInterval(id);
  }, []);

  const knobRow = (lbl, val, min, max, on) => (
    <div className="flex items-center justify-center gap-2">
      <span className="w-8 text-right text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
        {lbl}
      </span>
      <div className="w-[2rem] h-[2rem]">
        <Knob min={min} max={max} value={val} onChange={on} />
      </div>
    </div>
  );

  const renderChannel = (st, setSt, accent, label, vu) => {
    const labelColor = accent === "amber" ? "text-amber-400" : "text-violet-300";
    const borderColor = accent === "amber" ? "border-amber-500/15" : "border-violet-500/15";
    return (
      <div
        className={
          "flex-1 flex flex-col gap-1 items-stretch rounded-2xl border p-2 shadow-2xl shadow-black/60 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 " +
          borderColor
        }
      >
        <div className={"text-center text-[10px] font-semibold uppercase tracking-widest leading-none " + labelColor}>
          {label}
        </div>
        {knobRow("Trim", st.gain, 0, 100, (v) => setSt((s) => ({ ...s, gain: v })))}
        {knobRow("Hi", st.hi, -12, 12, (v) => setSt((s) => ({ ...s, hi: v })))}
        {knobRow("Mid", st.mid, -12, 12, (v) => setSt((s) => ({ ...s, mid: v })))}
        {knobRow("Low", st.low, -12, 12, (v) => setSt((s) => ({ ...s, low: v })))}
        <div className="flex-1 flex justify-center items-stretch gap-2 py-1">
          <div className="w-[1.6rem] h-full">
            <Fader
              min={0}
              max={100}
              orientation="vertical"
              value={st.fader}
              onChange={(v) => setSt((s) => ({ ...s, fader: v }))}
            />
          </div>
          <div className="w-[1.5rem] h-full">
            <LevelMeter level={vu} />
          </div>
        </div>
        <div className="h-[1.7rem] w-full">
          <ToggleButton on={st.cue} onChange={(o) => setSt((s) => ({ ...s, cue: o }))}>
            <span className="font-semibold uppercase tracking-wider">Cue</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      <header className="flex-none h-8 px-3 flex items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 leading-none">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Mixer</span>
      </header>

      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex gap-2">
          {renderChannel(chA, setChA, "amber", "CH 1 · A", vuA)}

          <div className="flex-none flex flex-col items-center justify-center gap-2 px-1 rounded-xl border border-stone-800/70 bg-stone-950/80">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 leading-none">Mstr</span>
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none">Master</span>
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none">Phones</span>
          </div>

          {renderChannel(chB, setChB, "violet", "CH 2 · B", vuB)}
        </div>

        <div className="flex-none flex flex-col gap-1 px-2 py-1 rounded-xl border border-stone-800/70 bg-stone-950/80">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest leading-none">
            <span className="text-amber-400 font-semibold">A</span>
            <span className="text-stone-400 font-medium">Crossfader</span>
            <span className="text-violet-300 font-semibold">B</span>
          </div>
          <div className="w-full h-[1.7rem]">
            <Fader min={0} max={100} orientation="horizontal" value={xfade} onChange={setXfade} />
          </div>
        </div>
      </div>
    </div>
  );
}