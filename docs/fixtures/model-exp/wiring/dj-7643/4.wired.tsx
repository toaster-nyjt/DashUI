export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + main 20.3 (knob 7 + labels) + footer 1.75 = 24.3 ≤ 24.3
  // BUDGET width: pad 0.75 + typeSel 9.5 + gap 0.75 + center 26.5 (7 + 3×5 + gaps 1.5) + gap 0.75 + right 14 + pad 0.75 = 53.0 ≤ 59.0

  const FX_TYPES = [
    { id: "echo", label: "ECHO", params: ["FEEDBACK", "TONE", "SPREAD"] },
    { id: "reverb", label: "REVERB", params: ["SIZE", "DAMP", "PRE-DLY"] },
    { id: "filter", label: "FILTER", params: ["CUTOFF", "RESO", "DRIVE"] },
    { id: "flanger", label: "FLANGER", params: ["DEPTH", "FEEDBK", "PHASE"] },
    { id: "gate", label: "GATE", params: ["SHAPE", "HOLD", "BITE"] },
  ];
  const DIVS = [
    { id: "1/8", label: "1/8" },
    { id: "1/4", label: "1/4" },
    { id: "1/2", label: "1/2" },
    { id: "1", label: "1" },
    { id: "2", label: "2" },
    { id: "4", label: "4" },
  ];
  const CHANS = [
    { id: "a", label: "CH A" },
    { id: "b", label: "CH B" },
    { id: "m", label: "MST" },
  ];

  const [fx, setFx] = useState("echo");
  const [wet, setWet] = useState(42);
  const [p, setP] = useState([55, 30, 68]);
  const [div, setDiv] = useState("1/4");
  const [on, setOn] = useState(true);
  const [chan, setChan] = useState("a");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((x) => (x + 1) % 1000), 90);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    bus.emit("DJ Table: Effects Rack->DJ Table: Central Mixer Console", {
      engaged: on,
      channel: chan,
      type: fx,
      wet: wet,
      params: [p[0], p[1], p[2]],
      division: div,
    });
  }, [on, chan, fx, wet, p, div]);

  const active = FX_TYPES.find((f) => f.id === fx) || FX_TYPES[0];
  const setParam = (i: number, v: number) =>
    setP((old) => old.map((x, j) => (j === i ? v : x)));

  const chanAccent =
    chan === "a" ? "text-cyan-300" : chan === "b" ? "text-amber-300" : "text-violet-200";

  const energy = on ? 0.35 + (wet / 100) * 0.65 : 0.08;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#050308] text-zinc-100 font-sans">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-violet-500/25">
        <span
          className={
            "h-2 w-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_currentColor] text-fuchsia-400 transition-all duration-200 " +
            (on ? "animate-pulse" : "opacity-30")
          }
        />
        <span className="text-sm font-bold tracking-[0.18em] uppercase text-zinc-200 truncate">
          Effects Rack
        </span>
        <div className="flex-1 flex items-center gap-[3px] px-2 overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => {
            const h = on
              ? 20 + Math.abs(Math.sin((pulse + i * 7) / 6 + i)) * 70 * energy
              : 12;
            return (
              <span
                key={"bar-" + i}
                className="w-[3px] rounded-full bg-fuchsia-500/70 transition-all duration-100 ease-linear"
                style={{ height: h + "%", opacity: on ? 0.35 + energy * 0.65 : 0.15 }}
              />
            );
          })}
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
          {active.label} · {div}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* FX TYPE */}
        <div className="flex flex-col gap-2" style={{ width: "9.5rem" }}>
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500">
            FX Type
          </span>
          <div className="flex-1" style={{ minHeight: "3.5rem" }}>
            <SegmentedSelector
              options={FX_TYPES.map((f) => ({ id: f.id, label: f.label }))}
              value={fx}
              onChange={setFx}
              orientation="vertical"
            />
          </div>
        </div>

        {/* KNOB DECK */}
        <div className="flex-1 flex flex-col gap-2 rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm p-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)] relative overflow-clip">
          <div
            className="pointer-events-none absolute -inset-10 transition-opacity duration-500"
            style={{
              opacity: on ? 0.22 + (wet / 100) * 0.35 : 0,
              background:
                "radial-gradient(circle at 18% 50%, rgba(232,121,249,0.55), transparent 55%)",
            }}
          />
          <div className="relative flex items-end gap-4">
            {/* WET/DRY */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={
                  "rounded-full transition-all duration-200 " +
                  (on ? "shadow-[0_0_24px_rgba(232,121,249,0.45)]" : "")
                }
                style={{ width: "7rem", height: "7rem" }}
              >
                <Knob min={0} max={100} value={wet} onChange={(v) => setWet(v)} mode="continuous" />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-fuchsia-300">
                Wet / Dry
              </span>
              <span className="font-mono font-bold tracking-tight text-[13px] text-fuchsia-300 drop-shadow-[0_0_6px_currentColor]">
                {Math.round(wet)}%
              </span>
            </div>

            {/* PARAMS */}
            <div className="flex-1 flex items-end justify-around gap-3">
              {active.params.map((label, i) => (
                <div key={label + i} className="flex flex-col items-center gap-2">
                  <div style={{ width: "5rem", height: "5rem" }}>
                    <Knob
                      min={0}
                      max={100}
                      value={p[i]}
                      onChange={(v) => setParam(i, v)}
                      mode="continuous"
                    />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500">
                    {label}
                  </span>
                  <span className="font-mono font-bold tracking-tight text-[12px] text-violet-200 drop-shadow-[0_0_6px_currentColor]">
                    {Math.round(p[i])}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex-1 flex items-end">
            <div className="w-full h-full rounded-xl border border-zinc-800/80 bg-[#08060f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-clip flex items-center">
              <div className="flex w-full items-center gap-[2px] px-2">
                {Array.from({ length: 64 }).map((_, i) => {
                  const v = on
                    ? Math.abs(
                        Math.sin((pulse + i * 5) / 9) *
                          Math.cos((pulse - i * 3) / 17 + p[0] / 40)
                      )
                    : 0.06;
                  return (
                    <span
                      key={"w-" + i}
                      className="flex-1 rounded-full bg-gradient-to-t from-fuchsia-600 to-violet-300 transition-all duration-75 ease-linear"
                      style={{
                        height: Math.max(2, v * 30 * (0.4 + energy)) + "px",
                        opacity: on ? 0.5 + energy * 0.5 : 0.2,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="flex flex-col gap-3" style={{ width: "14rem" }}>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500">
              Beat Division
            </span>
            <div style={{ height: "2rem" }}>
              <SegmentedSelector options={DIVS} value={div} onChange={setDiv} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500">
              Route To
            </span>
            <div style={{ height: "2rem" }}>
              <SegmentedSelector options={CHANS} value={chan} onChange={setChan} />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between gap-2 rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 px-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500">
                FX Engage
              </span>
              <span
                className={
                  "font-mono font-bold tracking-tight text-[15px] transition-all duration-200 " +
                  (on
                    ? chanAccent + " drop-shadow-[0_0_6px_currentColor]"
                    : "text-zinc-600")
                }
              >
                {on ? "ON AIR" : "BYPASS"}
              </span>
            </div>
            <div style={{ width: "3.75rem", height: "2rem" }}>
              <ToggleSwitch on={on} onChange={setOn} />
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-zinc-950/90 border-t border-zinc-800/80">
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">
          {active.label} → {chan === "m" ? "MASTER" : "CHANNEL " + chan.toUpperCase()} · SYNC {div}
        </span>
        <span
          className={
            "text-[10px] font-mono uppercase tracking-[0.14em] transition-all duration-200 " +
            (on ? "text-fuchsia-300 animate-pulse" : "text-zinc-600")
          }
        >
          WET {Math.round(wet)}% · {on ? "INSERT ACTIVE" : "IDLE"}
        </span>
      </div>
    </div>
  );
}