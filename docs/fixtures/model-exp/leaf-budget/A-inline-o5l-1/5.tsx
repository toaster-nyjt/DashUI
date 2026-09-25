export default function GeneratedComponent() {
  const FX = [
    { id: "echo", label: "ECHO", params: ["FEEDBACK", "TIME", "TONE"] },
    { id: "filter", label: "FILTER", params: ["CUTOFF", "RESO", "DRIVE"] },
    { id: "flanger", label: "FLANGER", params: ["DEPTH", "RATE", "FEEDBK"] },
    { id: "reverb", label: "REVERB", params: ["SIZE", "DECAY", "DAMP"] },
    { id: "crush", label: "CRUSH", params: ["BITS", "RATE", "MIX"] },
  ];
  const BEATS = [0.25, 0.5, 1, 2, 4, 8, 16];

  const [fx, setFx] = useState("echo");
  const [deckA, setDeckA] = useState(true);
  const [deckB, setDeckB] = useState(false);
  const [wet, setWet] = useState(42);
  const [beat, setBeat] = useState(1);
  const [on, setOn] = useState(true);
  const [params, setParams] = useState<number[]>([55, 30, 70]);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(id);
  }, []);

  const active = FX.find((f) => f.id === fx) || FX[0];
  const routed = deckA && deckB ? "A+B" : deckA ? "DECK A" : deckB ? "DECK B" : "—";
  const live = on && (deckA || deckB);
  const energy = live ? wet / 100 : 0;
  const beatLabel = beat < 1 ? "1/" + Math.round(1 / beat) : beat + "/1";

  const setParam = (i: number, v: number) =>
    setParams((p) => p.map((x, j) => (j === i ? v : x)));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* header */}
      <div className="flex-none h-9 px-3 flex items-center gap-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span
          className={
            "h-2 w-2 rounded-full transition-all duration-200 " +
            (live
              ? "bg-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]"
              : "bg-neutral-600")
          }
          style={{ transform: live ? "scale(" + (1 + 0.35 * Math.abs(Math.sin(pulse / 4))) + ")" : "none" }}
        />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
          Effects Rack
        </span>
        <div className="flex-1 min-w-0 h-[2px] mx-2 bg-gradient-to-r from-amber-500/40 via-amber-500/10 to-transparent" />
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-400 truncate">
          {active.label} · {beatLabel} · {routed}
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex items-stretch gap-3 p-3 relative min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            opacity: energy * 0.55,
            background:
              "radial-gradient(ellipse at 50% 120%, rgba(251,146,60,0.35), transparent 65%)",
          }}
        />

        {/* LEFT: selector + routing */}
        <div className="flex-1 flex flex-col gap-3 relative">
          <div className="flex flex-col gap-2">
            <div className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Effect Type
            </div>
            <div className="h-[2.25rem] w-full">
              <SegmentedSelector
                options={FX.map((f) => ({ id: f.id, label: f.label }))}
                value={fx}
                onChange={setFx}
              />
            </div>
          </div>

          <div className="flex-1 flex items-stretch gap-2">
            {[
              { k: "A", on: deckA, set: setDeckA, ring: "ring-amber-400/60", glow: "shadow-[0_0_16px_rgba(251,146,60,0.45)]", txt: "text-amber-300" },
              { k: "B", on: deckB, set: setDeckB, ring: "ring-teal-400/60", glow: "shadow-[0_0_16px_rgba(45,212,191,0.4)]", txt: "text-teal-300" },
            ].map((d) => (
              <div
                key={d.k}
                className={
                  "flex-1 flex flex-col items-center justify-center gap-2 p-2 rounded-xl border bg-gradient-to-b from-neutral-900 to-neutral-950 transition-all duration-200 " +
                  (d.on
                    ? "border-amber-500/30 ring-2 " + d.ring + " " + d.glow
                    : "border-amber-500/10")
                }
              >
                <div
                  className={
                    "font-mono font-bold tracking-tight text-base leading-none transition-all duration-200 " +
                    (d.on ? d.txt : "text-neutral-600")
                  }
                >
                  DECK {d.k}
                </div>
                <div className="h-[1.5rem] w-[3rem]">
                  <ToggleSwitch on={d.on} onChange={d.set} />
                </div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 leading-none">
                  {d.on ? "ROUTED" : "BYPASS"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: params */}
        <div className="flex flex-col gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 relative">
          <div className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 text-center">
            Parameters
          </div>
          <div className="flex-1 flex items-center gap-3">
            {active.params.map((p, i) => (
              <div key={p} className="flex flex-col items-center gap-1.5 w-[4rem]">
                <div className="h-[3.6rem] w-[3.6rem]">
                  <Knob
                    value={params[i]}
                    min={0}
                    max={100}
                    onChange={(v) => setParam(i, v)}
                  />
                </div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 leading-none">
                  {p}
                </div>
                <div className="font-mono font-bold text-[11px] tracking-tight text-amber-300 leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                  {Math.round(params[i])}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BEAT */}
        <div className="flex flex-col items-center justify-center gap-2 px-2 rounded-xl border border-amber-500/10 bg-neutral-900/60">
          <div className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Beats
          </div>
          <div className="h-[3.6rem] w-[3.6rem]">
            <Knob
              value={beat}
              min={0.25}
              max={16}
              mode="stepped"
              steps={BEATS}
              onChange={setBeat}
            />
          </div>
          <div className="h-[1.6rem] w-[3.4rem]">
            <Readout value={beatLabel} />
          </div>
        </div>

        {/* DRY/WET */}
        <div className="flex flex-col items-center justify-center gap-2 px-2 rounded-xl border border-amber-500/20 bg-gradient-to-b from-neutral-900 to-neutral-950">
          <div className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Dry / Wet
          </div>
          <div
            className="h-[5rem] w-[5rem] rounded-full transition-all duration-500"
            style={{
              boxShadow: live
                ? "0 0 " + (8 + energy * 26) + "px rgba(251,146,60," + (0.25 + energy * 0.5) + ")"
                : "none",
            }}
          >
            <Knob value={wet} min={0} max={100} onChange={setWet} />
          </div>
          <div className="font-mono font-bold text-sm tracking-tight text-amber-300 leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
            {Math.round(wet)}%
          </div>
        </div>

        {/* ON/OFF */}
        <div className="flex flex-col items-stretch justify-center gap-2 w-[7rem]">
          <div className="h-[1rem] flex items-center justify-center">
            <div className="flex gap-[3px]">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <span
                  key={i}
                  className="w-[5px] rounded-sm transition-all duration-200"
                  style={{
                    height: 10 + (live ? Math.abs(Math.sin((pulse + i * 7) / 5)) * energy * 6 : 0),
                    background: live
                      ? "rgba(251,146,60," + (0.25 + energy * 0.7) + ")"
                      : "rgba(120,113,108,0.35)",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="h-[4.5rem] w-full">
            <ToggleButton on={on} onChange={setOn} tone="accent">
              <span className="flex flex-col items-center leading-tight">
                <span className="font-mono font-bold tracking-widest">{on ? "ON" : "OFF"}</span>
                <span className="text-[0.55em] tracking-[0.3em] uppercase opacity-70">FX Engage</span>
              </span>
            </ToggleButton>
          </div>
          <div className="h-[1.6rem] w-full">
            <Readout value={live ? "ACTIVE " + routed : "STANDBY"} />
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex-none h-7 px-3 flex items-center gap-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className={"font-mono text-[10px] tracking-wide " + (live ? "text-teal-300" : "text-neutral-500")}>
          {live ? "◆ PROCESSING" : "◇ BYPASSED"}
        </span>
        <div className="flex-1 min-w-0 h-[3px] rounded-full bg-black/70 overflow-clip">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-500"
            style={{ width: energy * 100 + "%" }}
          />
        </div>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          {active.params.map((p, i) => p[0] + Math.round(params[i])).join(" · ")}
        </span>
      </div>
    </div>
  );
}