export default function GeneratedComponent() {
  // BUDGET height: header 2.5 + body(ch label 1.5 + knobstack 5×(2.5+0.7)=16 + gaps 1) 18.5 + crossfader 5 + padding 1 = 27.0 ≤ 41.6  (fader takes remaining height inside body)
  // BUDGET width: chA 15 + center 12 + chB 15 + gaps 1 + padding 1 = 44.0 ≤ 52.0

  const [chans, setChans] = useState([
    { id: "A", gain: 2, hi: 1, mid: 0, low: -2, filter: 0, vol: 88 },
    { id: "B", gain: -1, hi: 0, mid: 2, low: 3, filter: 0, vol: 74 },
  ]);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(80);
  const [cueOn, setCueOn] = useState(true);
  const [cueLvl, setCueLvl] = useState(45);
  const [meters, setMeters] = useState([
    { l: 0.4, p: 0.5 },
    { l: 0.3, p: 0.4 },
  ]);

  const set = (i, k, v) =>
    setChans((c) => c.map((ch, n) => (n === i ? { ...ch, [k]: v } : ch)));

  const gainA = Math.min(1, Math.max(0, (1 - xf) / 2 + 0.5));
  const gainB = Math.min(1, Math.max(0, (1 + xf) / 2 - 0.0));

  useEffect(() => {
    const t = setInterval(() => {
      setMeters((m) =>
        m.map((mm, i) => {
          const ch = chans[i];
          const fade = i === 0 ? 1 - Math.max(0, xf) : 1 - Math.max(0, -xf);
          const base =
            (ch.vol / 100) *
            fade *
            (master / 100) *
            (0.55 + Math.random() * 0.45) *
            (1 + ch.gain / 24);
          const l = Math.max(0, Math.min(1, base));
          return { l, p: Math.max(l, mm.p * 0.93) };
        })
      );
    }, 90);
    return () => clearInterval(t);
  }, [chans, xf, master]);

  const eqDefs = [
    { k: "hi", label: "HI" },
    { k: "mid", label: "MID" },
    { k: "low", label: "LOW" },
  ];

  const accents = ["#22e0d0", "#ff3ea5"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#06080b] text-neutral-200 font-mono relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,rgba(255,255,255,0.05) 0px,rgba(255,255,255,0.05) 1px,transparent 1px,transparent 4px)",
        }}
      />

      {/* HEADER */}
      <header className="flex-none h-10 px-3 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#0b1016] via-[#0a0d12] to-[#0b1016] relative">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[11px] tracking-[0.35em] font-bold text-white truncate">
            CENTRAL MIXER
          </span>
          <span className="text-[9px] tracking-[0.25em] text-white/35 truncate">
            2CH / MASTER BUS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] tracking-[0.3em] text-white/40">MST</span>
          <span
            className="text-[11px] font-bold tabular-nums"
            style={{ color: "#ffb43a" }}
          >
            {String(master).padStart(3, "0")}
          </span>
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ background: "#ffb43a", boxShadow: "0 0 8px #ffb43a" }}
          />
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex gap-2 p-2 relative">
        {chans.map((ch, i) => (
          <section
            key={ch.id}
            className="flex-1 basis-0 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-2 transition-colors duration-300 hover:border-white/25"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
          >
            <div className="flex-none h-6 flex items-center justify-between px-1 rounded-md bg-black/40 border border-white/10">
              <span
                className="text-[11px] font-bold tracking-[0.3em]"
                style={{ color: accents[i], textShadow: "0 0 10px " + accents[i] }}
              >
                CH {ch.id}
              </span>
              <span className="text-[9px] tracking-[0.2em] text-white/35 tabular-nums">
                {ch.vol.toFixed(0)}%
              </span>
            </div>

            <div className="flex-1 flex gap-2">
              {/* knob stack */}
              <div className="w-[4.25rem] flex flex-col justify-between">
                {[{ k: "gain", label: "TRIM" }, ...eqDefs, { k: "filter", label: "FILT" }].map(
                  (d) => (
                    <div key={d.k} className="flex flex-col items-center gap-[2px]">
                      <div className="h-[2.6rem] w-[2.6rem] transition-transform duration-200 hover:scale-105">
                        <Knob
                          min={d.k === "filter" ? -100 : -12}
                          max={d.k === "filter" ? 100 : 12}
                          value={ch[d.k]}
                          onChange={(v) => set(i, d.k, Math.round(v))}
                          detents={[0]}
                        />
                      </div>
                      <span className="text-[8px] tracking-[0.22em] text-white/40">
                        {d.label}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* fader + meter */}
              <div className="flex-1 flex items-stretch justify-center gap-2 rounded-lg bg-black/30 border border-white/5 p-2">
                <div className="w-[2.75rem] h-full">
                  <Fader
                    min={0}
                    max={100}
                    value={ch.vol}
                    onChange={(v) => set(i, "vol", Math.round(v))}
                    orientation="vertical"
                    detents={[0, 100]}
                  />
                </div>
                <div className="w-[1.4rem] h-full">
                  <LevelMeter
                    level={meters[i].l}
                    peak={meters[i].p}
                    orientation="vertical"
                  />
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CENTER MASTER */}
        <section className="w-[12rem] flex flex-col gap-2 order-none">
          <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-gradient-to-b from-[#12100a] to-[#08090c] p-3">
            <span className="text-[9px] tracking-[0.35em] text-white/45">MASTER</span>
            <div
              className="h-[5.5rem] w-[5.5rem] rounded-full transition-transform duration-300 hover:scale-105"
              style={{ boxShadow: "0 0 34px rgba(255,180,58,0.18)" }}
            >
              <Knob min={0} max={100} value={master} onChange={(v) => setMaster(Math.round(v))} />
            </div>
            <div className="text-[10px] tracking-[0.25em] tabular-nums text-white/55">
              OUT {master}%
            </div>
          </div>

          <div className="flex-none flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-2">
            <span className="text-[9px] tracking-[0.3em] text-white/40">HEADPHONE CUE</span>
            <div className="flex items-center gap-2">
              <div className="h-[2rem] w-[4.5rem]">
                <ToggleButton on={cueOn} onChange={setCueOn} tone="accent">
                  <span className="font-bold tracking-[0.2em]">CUE</span>
                </ToggleButton>
              </div>
              <div className="h-[2.6rem] w-[2.6rem] transition-transform duration-200 hover:scale-105">
                <Knob min={0} max={100} value={cueLvl} onChange={(v) => setCueLvl(Math.round(v))} />
              </div>
              <span className="text-[10px] tabular-nums text-white/45">{cueLvl}</span>
            </div>
          </div>
        </section>
      </div>

      {/* CROSSFADER */}
      <footer className="flex-none px-3 pb-3 pt-1 relative">
        <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 flex items-center gap-3">
          <span
            className="text-[11px] font-bold tracking-[0.3em] transition-opacity duration-200"
            style={{ color: accents[0], opacity: 0.35 + gainA * 0.65 }}
          >
            A
          </span>
          <div className="flex-1 h-[2.5rem]">
            <Fader
              min={-100}
              max={100}
              value={xf}
              onChange={(v) => setXf(Math.round(v))}
              orientation="horizontal"
              detents={[0]}
            />
          </div>
          <span
            className="text-[11px] font-bold tracking-[0.3em] transition-opacity duration-200"
            style={{ color: accents[1], opacity: 0.35 + gainB * 0.65 }}
          >
            B
          </span>
        </div>
      </footer>
    </div>
  );
}