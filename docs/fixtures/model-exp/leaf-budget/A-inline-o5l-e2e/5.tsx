export default function GeneratedComponent() {
  const FX = [
    { id: "echo", label: "ECHO", params: ["FEEDBACK", "TIME", "TONE"] },
    { id: "filter", label: "FILTER", params: ["CUTOFF", "RESO", "DRIVE"] },
    { id: "flanger", label: "FLANGER", params: ["DEPTH", "RATE", "FEEDBK"] },
    { id: "reverb", label: "REVERB", params: ["SIZE", "DAMP", "PRE-DLY"] },
    { id: "roll", label: "ROLL", params: ["GATE", "PITCH", "DECAY"] },
  ];

  const [fx, setFx] = useState("echo");
  const [deckA, setDeckA] = useState(true);
  const [deckB, setDeckB] = useState(false);
  const [wet, setWet] = useState(42);
  const [beat, setBeat] = useState(1);
  const [on, setOn] = useState(true);
  const [params, setParams] = useState<Record<string, number[]>>({
    echo: [55, 38, 70],
    filter: [64, 30, 20],
    flanger: [48, 25, 60],
    reverb: [72, 40, 18],
    roll: [50, 50, 35],
  });
  const [pulse, setPulse] = useState(0);

  const active = FX.find((f) => f.id === fx)!;
  const routed = deckA || deckB;
  const live = on && routed;

  useEffect(() => {
    const id = setInterval(() => setPulse((p) => (p + 1) % 64), 90);
    return () => clearInterval(id);
  }, []);

  const setParam = (i: number, v: number) =>
    setParams((prev) => {
      const next = prev[fx].slice();
      next[i] = v;
      return { ...prev, [fx]: next };
    });

  const beatLabel = (b: number) =>
    b < 1 ? "1/" + Math.round(1 / b) : b.toFixed(0) + "/1";

  const routeTone = deckA && deckB ? "A+B" : deckA ? "A" : deckB ? "B" : "—";

  const Cap = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 text-center truncate">
      {children}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black font-sans">
      {/* header */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span
          className={
            "h-2 w-2 rounded-full transition-all duration-500 ease-in-out " +
            (live
              ? "bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.45)]"
              : "bg-neutral-700")
          }
        />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
          Effects Rack
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-500 truncate">
          / {active.label}
        </span>
        <div className="ml-auto flex items-end gap-[2px] h-4">
          {Array.from({ length: 16 }).map((_, i) => {
            const h = live
              ? 20 + 80 * Math.abs(Math.sin((pulse + i * 3) * 0.35 + i))
              : 12;
            return (
              <span
                key={"b" + i}
                className={
                  "w-[3px] rounded-sm transition-all duration-100 ease-out " +
                  (live ? "bg-amber-400/80" : "bg-neutral-700/70")
                }
                style={{ height: h + "%" }}
              />
            );
          })}
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-3 p-3 items-stretch min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* selector + routing */}
        <div className="flex-[1.15] flex flex-col gap-2 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <Cap>Effect Type</Cap>
          <div className="h-[2.2rem]">
            <SegmentedSelector
              options={FX.map((f) => ({ id: f.id, label: f.label }))}
              value={fx}
              onChange={setFx}
            />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            {[
              {
                k: "A",
                on: deckA,
                set: setDeckA,
                ring: "ring-amber-400/60",
                glow: "shadow-[0_0_16px_rgba(251,146,60,0.45)]",
                txt: "text-amber-300",
              },
              {
                k: "B",
                on: deckB,
                set: setDeckB,
                ring: "ring-teal-400/60",
                glow: "shadow-[0_0_16px_rgba(45,212,191,0.4)]",
                txt: "text-teal-300",
              },
            ].map((d) => (
              <div
                key={d.k}
                className={
                  "flex flex-col items-center justify-center gap-2 rounded-xl border p-2 transition-all duration-200 ease-out " +
                  (d.on
                    ? "border-amber-500/30 bg-black/60 ring-2 " + d.ring + " " + d.glow
                    : "border-amber-500/10 bg-black/40")
                }
              >
                <div
                  className={
                    "font-mono font-bold tracking-tight text-lg leading-none transition-all duration-200 " +
                    (d.on ? d.txt : "text-neutral-600")
                  }
                >
                  DECK {d.k}
                </div>
                <div className="w-[3rem] h-[1.5rem]">
                  <ToggleSwitch on={d.on} onChange={d.set} />
                </div>
                <Cap>Route</Cap>
              </div>
            ))}
          </div>
        </div>

        {/* parameter knobs */}
        <div className="flex-[1.35] flex flex-col gap-2 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <Cap>{active.label} Parameters</Cap>
          <div className="flex-1 grid grid-cols-3 gap-2">
            {active.params.map((p, i) => (
              <div
                key={p}
                className="flex flex-col items-center justify-center gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70"
              >
                <div className="w-[3.2rem] h-[3.2rem]">
                  <Knob
                    value={params[fx][i]}
                    min={0}
                    max={100}
                    onChange={(v) => setParam(i, v)}
                  />
                </div>
                <Cap>{p}</Cap>
                <div className="font-mono font-bold tracking-tight text-amber-300 text-xs leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                  {Math.round(params[fx][i])}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* mix + beat */}
        <div className="flex-[1.05] flex gap-2 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Cap>Dry / Wet</Cap>
            <div className="w-[4.6rem] h-[4.6rem]">
              <Knob value={wet} min={0} max={100} onChange={setWet} />
            </div>
            <div className="font-mono font-bold tracking-tight text-amber-300 text-sm leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {Math.round(wet)}%
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Cap>Beats</Cap>
            <div className="w-[4.6rem] h-[4.6rem]">
              <Knob
                value={beat}
                min={0.125}
                max={8}
                mode="stepped"
                steps={[0.125, 0.25, 0.5, 1, 2, 4, 8]}
                onChange={setBeat}
              />
            </div>
            <div className="font-mono font-bold tracking-tight text-teal-300 text-sm leading-none drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
              {beatLabel(beat)}
            </div>
          </div>
        </div>

        {/* master engage */}
        <div
          className={
            "flex-[0.7] flex flex-col items-center justify-center gap-3 p-2 rounded-2xl border bg-gradient-to-b from-neutral-900 to-neutral-950 transition-all duration-500 ease-in-out " +
            (live
              ? "border-amber-500/40 shadow-[0_0_16px_rgba(251,146,60,0.45)]"
              : "border-amber-500/15 shadow-2xl shadow-black/60")
          }
        >
          <Cap>Engage</Cap>
          <div className="w-[6rem] h-[3.4rem]">
            <ToggleButton on={on} onChange={setOn} tone="accent">
              <span className="flex flex-col items-center leading-tight">
                <span className="font-mono font-semibold tracking-wider uppercase">
                  FX {on ? "ON" : "OFF"}
                </span>
                <span className="text-[0.6em] tracking-[0.3em] opacity-70">
                  {active.label}
                </span>
              </span>
            </ToggleButton>
          </div>
          <div className="w-full h-[0.75rem] rounded-md overflow-clip bg-black/70 border border-amber-500/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-500 ease-in-out"
              style={{ width: (live ? wet : 0) + "%" }}
            />
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none flex items-center gap-4 px-3 bg-neutral-950/90 border-t border-amber-500/15 font-mono text-[10px] tracking-wide text-neutral-400">
        <span className={live ? "text-teal-300" : ""}>
          {live ? "PROCESSING" : routed ? "BYPASSED" : "UNROUTED"}
        </span>
        <span className="truncate">ROUTE {routeTone}</span>
        <span className="truncate">SYNC {beatLabel(beat)}</span>
        <span className="ml-auto truncate text-neutral-500">
          {active.params
            .map((p, i) => p + " " + Math.round(params[fx][i]))
            .join("  ·  ")}
        </span>
      </div>
    </div>
  );
}