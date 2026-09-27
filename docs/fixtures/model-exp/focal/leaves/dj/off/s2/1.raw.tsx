export default function GeneratedComponent() {
  // BUDGET height: header 2.5 + [title 1.5 + gain 3.25 + eq 9.75 + filter 3.25 + faderRow 8.0 + cue 1.75 + gaps 2.4 = 29.9] + crossfader strip 5.0 + padding 1.0 = 38.4 ≤ 41.6
  // BUDGET width: pad 0.75 + chA (fader 2.25 + meter 1.5 + gap 0.5 = 11 flex) + gap 0.75 + center 12 + gap 0.75 + chB 11 + pad 0.75 = 37 ≤ 52.0

  const [ch, setCh] = useState([
    { gain: 0, hi: 0, mid: 0, low: 0, filter: 0, vol: 82, cue: true },
    { gain: -2, hi: 0, mid: 0, low: 0, filter: 0, vol: 74, cue: false },
  ]);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(78);
  const [cueLvl, setCueLvl] = useState(45);
  const [lv, setLv] = useState([0.5, 0.4]);
  const [pk, setPk] = useState([0.6, 0.5]);
  const [t, setT] = useState(0);

  const set = (i: number, k: string, v: number | boolean) =>
    setCh((p) => p.map((c, j) => (j === i ? { ...c, [k]: v } : c)));

  useEffect(() => {
    const id = setInterval(() => {
      setT((x) => x + 1);
      setLv((prev) =>
        prev.map((_, i) => {
          const gain = (ch[i].vol / 100) * (1 - Math.abs((i === 0 ? -1 : 1) - xf / 100) * 0.45);
          const base = 0.55 + 0.35 * Math.sin(Date.now() / (i === 0 ? 210 : 260));
          return Math.max(0, Math.min(1, base * gain + Math.random() * 0.12));
        })
      );
      setPk((prev) => prev.map((p, i) => Math.max(lv[i], p - 0.035)));
    }, 90);
    return () => clearInterval(id);
  }, [ch, xf, lv]);

  const accents = ["#22e3ff", "#ff3ea5"];

  const KnobCell = (props: {
    label: string;
    size: string;
    min: number;
    max: number;
    value: number;
    onChange: (v: number) => void;
    color: string;
    detents?: number[];
  }) => (
    <div className="flex flex-col items-center gap-[0.2rem]">
      <div
        className="rounded-full transition-all duration-300 hover:scale-105"
        style={{
          width: props.size,
          height: props.size,
          boxShadow: "0 0 0.9rem -0.2rem " + props.color + "66",
        }}
      >
        <Knob min={props.min} max={props.max} value={props.value} onChange={props.onChange} detents={props.detents} />
      </div>
      <span
        className="text-[0.55rem] font-semibold uppercase tracking-[0.18em]"
        style={{ color: props.color + "cc" }}
      >
        {props.label}
      </span>
    </div>
  );

  const strip = (i: number) => {
    const c = ch[i];
    const a = accents[i];
    return (
      <div
        className="flex flex-col items-stretch gap-[0.4rem] rounded-[0.6rem] border p-[0.5rem] transition-colors duration-300"
        style={{
          flex: "1 1 0%",
          borderColor: a + "2e",
          background: "linear-gradient(180deg,rgba(255,255,255,0.045),rgba(0,0,0,0.35))",
        }}
      >
        <div className="flex h-[1.5rem] items-center justify-between rounded-[0.35rem] px-[0.45rem]" style={{ background: a + "1a" }}>
          <span className="text-[0.7rem] font-black italic tracking-[0.2em]" style={{ color: a }}>
            CH {i === 0 ? "A" : "B"}
          </span>
          <span
            className="h-[0.45rem] w-[0.45rem] rounded-full"
            style={{ background: a, boxShadow: "0 0 0.5rem " + a, opacity: 0.4 + lv[i] * 0.6 }}
          />
        </div>

        <div className="flex justify-center">
          {KnobCell({ label: "TRIM", size: "2.6rem", min: -12, max: 12, value: c.gain, onChange: (v) => set(i, "gain", v), color: a, detents: [0] })}
        </div>

        <div className="flex flex-col items-center gap-[0.25rem] rounded-[0.45rem] py-[0.3rem]" style={{ background: "rgba(255,255,255,0.03)" }}>
          {(["hi", "mid", "low"] as const).map((b) => (
            <div key={b}>
              {KnobCell({
                label: b === "hi" ? "HIGH" : b === "mid" ? "MID" : "LOW",
                size: "2.5rem",
                min: -26,
                max: 6,
                value: (c as any)[b],
                onChange: (v) => set(i, b, v),
                color: a,
                detents: [0],
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          {KnobCell({ label: "FILTER", size: "2.6rem", min: -100, max: 100, value: c.filter, onChange: (v) => set(i, "filter", v), color: a, detents: [0] })}
        </div>

        <div className="flex flex-1 items-stretch justify-center gap-[0.5rem] pt-[0.15rem]">
          <div className="w-[2.25rem]">
            <Fader min={0} max={100} value={c.vol} onChange={(v) => set(i, "vol", v)} orientation="vertical" detents={[0, 50, 100]} />
          </div>
          <div className="w-[1.4rem]">
            <LevelMeter level={lv[i]} peak={pk[i]} orientation="vertical" />
          </div>
        </div>

        <div className="h-[1.75rem]">
          <ToggleButton on={c.cue} onChange={(v) => set(i, "cue", v)} tone="accent">
            <span className="font-black tracking-[0.2em]">CUE</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#08090c] font-sans text-white">
      {/* header */}
      <div className="flex h-[2.5rem] flex-none items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0d0f14] via-[#121521] to-[#0d0f14] px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-[0.8rem] font-black italic tracking-[0.3em] text-white">MIXER</span>
          <span className="truncate text-[0.55rem] uppercase tracking-[0.3em] text-white/35">2-channel · master sink</span>
        </div>
        <div className="flex items-center gap-[0.3rem]">
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <span
              key={k}
              className="h-[0.9rem] w-[0.14rem] rounded-full transition-all duration-200"
              style={{
                background: k / 6 < (lv[0] + lv[1]) / 2 ? "#22e3ff" : "#ffffff20",
                boxShadow: k / 6 < (lv[0] + lv[1]) / 2 ? "0 0 0.4rem #22e3ff" : "none",
                transform: "scaleY(" + (0.6 + ((t + k) % 5) * 0.08) + ")",
              }}
            />
          ))}
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 items-stretch gap-[0.6rem] p-[0.6rem]">
        {strip(0)}

        {/* center master */}
        <div
          className="flex flex-col items-center justify-between rounded-[0.6rem] border border-white/10 p-[0.6rem]"
          style={{ flex: "0 1 13rem", background: "radial-gradient(circle at 50% 22%,rgba(255,186,60,0.13),rgba(0,0,0,0.4) 62%)" }}
        >
          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-amber-300/70">master</span>

          <div className="flex flex-col items-center gap-[0.35rem]">
            <div
              className="rounded-full transition-transform duration-500 hover:scale-105"
              style={{ width: "5.4rem", height: "5.4rem", boxShadow: "0 0 2.2rem -0.3rem #ffba3c88" }}
            >
              <Knob min={0} max={100} value={master} onChange={setMaster} detents={[0, 80, 100]} />
            </div>
            <span className="text-[1.05rem] font-black tabular-nums tracking-tight text-amber-200">{master}</span>
            <span className="text-[0.5rem] uppercase tracking-[0.3em] text-white/35">output level</span>
          </div>

          <div className="flex w-full items-center gap-[0.5rem] rounded-[0.45rem] border border-white/10 bg-white/[0.035] p-[0.45rem]">
            <div className="rounded-full" style={{ width: "2.8rem", height: "2.8rem", boxShadow: "0 0 0.9rem -0.2rem #9d7bff88" }}>
              <Knob min={0} max={100} value={cueLvl} onChange={setCueLvl} />
            </div>
            <div className="flex flex-col gap-[0.2rem]" style={{ flex: "1 1 0%" }}>
              <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-violet-300/80">phones</span>
              <span className="text-[0.5rem] tabular-nums text-white/40">{cueLvl}%</span>
            </div>
          </div>
        </div>

        {strip(1)}
      </div>

      {/* crossfader */}
      <div className="flex h-[5rem] flex-none flex-col justify-center gap-[0.3rem] border-t border-white/10 bg-[#0b0d12] px-[1.2rem]">
        <div className="flex items-center justify-between text-[0.55rem] font-bold uppercase tracking-[0.3em]">
          <span style={{ color: accents[0], opacity: 0.4 + (xf < 0 ? 0.6 : 0) }}>A</span>
          <span className="text-white/30">crossfader</span>
          <span style={{ color: accents[1], opacity: 0.4 + (xf > 0 ? 0.6 : 0) }}>B</span>
        </div>
        <div className="h-[2.2rem] w-full">
          <Fader min={-100} max={100} value={xf} onChange={setXf} orientation="horizontal" detents={[-100, 0, 100]} />
        </div>
      </div>
    </div>
  );
}