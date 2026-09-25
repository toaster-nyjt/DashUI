export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + padding 1.5 + [selector 2.25 + gap 0.5 + knob row 8.5] = 15.0 ≤ 20.8
  // BUDGET width: pad 1.5 + route panel 12 + gap 0.75 + main panel (5 knobs × 5 = 25 + gaps 2 + pad 1.5) = 42.75 ≤ 62.4

  const FX = [
    { id: "echo", label: "ECHO", params: ["TIME", "FEEDBK", "TONE"] },
    { id: "filter", label: "FILTER", params: ["CUTOFF", "RESO", "DRIVE"] },
    { id: "flange", label: "FLANGER", params: ["DEPTH", "RATE", "PHASE"] },
    { id: "reverb", label: "REVERB", params: ["SIZE", "DAMP", "PRE-DLY"] },
    { id: "roll", label: "ROLL", params: ["LENGTH", "GATE", "PITCH"] },
  ];

  const BEATS = [0.25, 0.5, 1, 2, 4, 8];

  const [fx, setFx] = useState("echo");
  const [routeA, setRouteA] = useState(true);
  const [routeB, setRouteB] = useState(false);
  const [on, setOn] = useState(false);
  const [wet, setWet] = useState(42);
  const [beat, setBeat] = useState(1);
  const [params, setParams] = useState([55, 30, 70]);
  const [pulse, setPulse] = useState(0);

  const active = on && (routeA || routeB);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setPulse((p) => (p + 1) % 120), 40);
    return () => clearInterval(id);
  }, [active]);

  const current = FX.find((f) => f.id === fx) || FX[0];
  const setParam = (i: number, v: number) =>
    setParams((p) => p.map((x, j) => (j === i ? v : x)));

  const beatLabel = beat < 1 ? "1/" + Math.round(1 / beat) : beat + "/1";

  const routeTone = routeA && routeB ? "A+B" : routeA ? "A" : routeB ? "B" : "—";

  const KnobCell = ({
    label,
    value,
    children,
  }: {
    label: string;
    value: string;
    children: React.ReactNode;
  }) => (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="h-[4.5rem] w-[4.5rem]">{children}</div>
      <div className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
        {label}
      </div>
      <div className="font-mono font-bold tracking-tight text-amber-300 text-[11px] leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
        {value}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span
            className={
              "h-2 w-2 rounded-full transition-all duration-500 " +
              (active
                ? "bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.45)]"
                : "bg-neutral-700")
            }
          />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
            Effects Rack
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          {current.label} · {beatLabel} · RTE {routeTone} ·{" "}
          <span className={active ? "text-teal-300" : "text-neutral-500"}>
            {active ? "ENGAGED" : "BYPASS"}
          </span>
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* routing / engage */}
        <div className="w-[13rem] flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
          <div className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Routing
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-black/70 px-2 py-1 shadow-inner shadow-black/70 transition-all duration-200">
            <span
              className={
                "font-mono text-sm font-semibold tracking-wider transition-all duration-200 " +
                (routeA ? "text-amber-300" : "text-neutral-500")
              }
            >
              DECK A
            </span>
            <div className="h-[1.5rem] w-[3rem]">
              <ToggleSwitch on={routeA} onChange={setRouteA} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border border-amber-500/20 bg-black/70 px-2 py-1 shadow-inner shadow-black/70 transition-all duration-200">
            <span
              className={
                "font-mono text-sm font-semibold tracking-wider transition-all duration-200 " +
                (routeB ? "text-teal-300" : "text-neutral-500")
              }
            >
              DECK B
            </span>
            <div className="h-[1.5rem] w-[3rem]">
              <ToggleSwitch on={routeB} onChange={setRouteB} />
            </div>
          </div>

          <div className="flex-1 flex items-stretch">
            <div
              className={
                "w-full rounded-lg transition-all duration-200 " +
                (active ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]" : "")
              }
            >
              <ToggleButton on={on} onChange={setOn} tone="accent">
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-mono font-semibold tracking-widest uppercase">
                    {on ? "FX ON" : "FX OFF"}
                  </span>
                  <span className="text-[0.55em] tracking-[0.3em] uppercase opacity-70">
                    engage
                  </span>
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* main rack */}
        <div className="flex-1 flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60 relative overflow-clip">
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: active ? 0.5 : 0,
              background:
                "radial-gradient(ellipse at " +
                (10 + (pulse % 60) * 1.4) +
                "% 120%, rgba(251,146,60,0.18), transparent 60%)",
            }}
          />

          <div className="relative flex items-center gap-3">
            <div className="h-[2rem] flex-1">
              <SegmentedSelector
                options={FX.map((f) => ({ id: f.id, label: f.label }))}
                value={fx}
                onChange={setFx}
              />
            </div>
            <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] tracking-wide text-neutral-500">
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (active ? "bg-teal-300" : "bg-neutral-700")
                }
              />
              SYNC
            </div>
          </div>

          <div className="relative flex-1 grid grid-cols-5 items-center gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 px-2 shadow-inner shadow-black/70">
            <KnobCell label="Dry / Wet" value={Math.round(wet) + "%"}>
              <Knob value={wet} min={0} max={100} onChange={setWet} />
            </KnobCell>

            <KnobCell label="Beat" value={beatLabel}>
              <Knob
                value={beat}
                min={0.25}
                max={8}
                mode="stepped"
                steps={BEATS}
                onChange={setBeat}
              />
            </KnobCell>

            {current.params.map((p, i) => (
              <KnobCell
                key={p + i}
                label={p}
                value={Math.round(params[i]) + ""}
              >
                <Knob
                  value={params[i]}
                  min={0}
                  max={100}
                  onChange={(v) => setParam(i, v)}
                />
              </KnobCell>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}