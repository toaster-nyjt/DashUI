export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(flex-1, holds knob rows floor 2.5) + footer 1.75 = chrome 4.0, body gets 16.8 ≥ 2.5 ✓  ≤ 20.8
  // BUDGET width: pad-left 0.75 + selectorCol 12 + gap 0.75 + routingCol 9 + gap 0.75 + dryWet 5 + gap 0.75 + params(4×5=20) + gap 0.75 + onoff 6 + pad-right 0.75 = 57.8 ≤ 62.4

  const effectTypes = [
    { id: "echo", label: "ECHO" },
    { id: "reverb", label: "REVERB" },
    { id: "flanger", label: "FLANGER" },
    { id: "filter", label: "FILTER" },
    { id: "phaser", label: "PHASER" },
    { id: "gate", label: "GATE" },
  ];

  const beatMultipliers = [0.25, 0.5, 1, 2, 4, 8, 16];

  const [effectType, setEffectType] = useState("echo");
  const [routeA, setRouteA] = useState(true);
  const [routeB, setRouteB] = useState(false);
  const [dryWet, setDryWet] = useState(45);
  const [beatMul, setBeatMul] = useState(1);
  const [effectOn, setEffectOn] = useState(false);
  const [paramX, setParamX] = useState(60);
  const [paramY, setParamY] = useState(30);
  const [paramZ, setParamZ] = useState(75);
  const [paramW, setParamW] = useState(50);

  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!effectOn) return;
    const id = setInterval(() => setPulse((p) => (p + 1) % 1000), 90);
    return () => clearInterval(id);
  }, [effectOn]);

  const beatLabel =
    beatMul < 1 ? "1/" + Math.round(1 / beatMul) : String(beatMul);

  const activeDeckColor = routeA
    ? "text-amber-300"
    : routeB
    ? "text-teal-300"
    : "text-neutral-500";

  const currentEffectLabel =
    effectTypes.find((e) => e.id === effectType)?.label ?? "—";

  const routeSummary = routeA && routeB ? "A+B" : routeA ? "A" : routeB ? "B" : "—";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black">
      {/* Header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "text-amber-400 text-[0.9em] transition-all duration-500 " +
              (effectOn ? "drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]" : "opacity-60")
            }
          >
            ◆
          </span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Effects Rack
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-wide">
          <span className="text-neutral-500 uppercase">FX</span>
          <span className={"font-bold " + (effectOn ? "text-teal-300" : "text-neutral-500")}>
            {effectOn ? "ENGAGED" : "BYPASS"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-stretch gap-3 px-3 py-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Effect Type Selector column */}
        <div className="flex flex-col justify-center gap-2" style={{ width: "13rem" }}>
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Effect Type
          </span>
          <div className="grid grid-cols-3 gap-2">
            {effectTypes.map((e) => (
              <div key={e.id} className="h-8">
                <SegmentedSelector
                  options={[{ id: e.id, label: e.label }]}
                  value={effectType === e.id ? e.id : ""}
                  onChange={setEffectType}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 px-2 py-1.5 shadow-inner shadow-black/70">
            <span className="text-[10px] font-normal tracking-wide leading-none text-neutral-500 uppercase">
              Active
            </span>
            <span
              className={
                "font-mono font-bold tracking-tight text-amber-300 leading-none " +
                (effectOn ? "drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]" : "opacity-70")
              }
            >
              {currentEffectLabel}
            </span>
          </div>
        </div>

        {/* Routing column */}
        <div
          className="flex flex-col justify-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60"
          style={{ width: "9.5rem" }}
        >
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Routing
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono font-semibold tracking-wider uppercase text-amber-100 text-[0.95em] leading-none">
                Deck A
              </span>
              <span className="text-[10px] tracking-wide leading-none text-neutral-500 font-mono">
                {routeA ? "ROUTED" : "off"}
              </span>
            </div>
            <ToggleSwitch on={routeA} onChange={setRouteA} />
          </div>
          <div className="h-px w-full bg-amber-500/10" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono font-semibold tracking-wider uppercase text-teal-200 text-[0.95em] leading-none">
                Deck B
              </span>
              <span className="text-[10px] tracking-wide leading-none text-neutral-500 font-mono">
                {routeB ? "ROUTED" : "off"}
              </span>
            </div>
            <ToggleSwitch on={routeB} onChange={setRouteB} />
          </div>
        </div>

        {/* Dry/Wet knob */}
        <div className="flex flex-col items-center justify-center gap-1.5">
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Dry / Wet
          </span>
          <div style={{ width: "5rem", height: "5rem" }}>
            <Knob value={dryWet} min={0} max={100} onChange={setDryWet} mode="continuous" />
          </div>
          <span className="font-mono font-bold tracking-tight text-amber-300 leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
            {Math.round(dryWet)}%
          </span>
        </div>

        {/* Parameter knobs */}
        <div className="flex-1 flex flex-col justify-center gap-2">
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Parameters
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "RATE", value: paramX, set: setParamX, min: 0, max: 100, unit: "%" },
              { label: "DEPTH", value: paramY, set: setParamY, min: 0, max: 100, unit: "%" },
              { label: "FEEDBK", value: paramZ, set: setParamZ, min: 0, max: 100, unit: "%" },
              { label: "TONE", value: paramW, set: setParamW, min: 0, max: 100, unit: "%" },
            ].map((p) => (
              <div
                key={p.label}
                className="flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 px-1 py-1.5 shadow-inner shadow-black/70"
              >
                <div style={{ width: "3.5rem", height: "3.5rem" }}>
                  <Knob
                    value={p.value}
                    min={p.min}
                    max={p.max}
                    onChange={p.set}
                    mode="continuous"
                  />
                </div>
                <span className="text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                  {p.label}
                </span>
                <span className="font-mono font-bold tracking-tight text-amber-300 leading-none text-[0.75em]">
                  {Math.round(p.value)}
                  {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Beat multiplier + On/Off */}
        <div className="flex flex-col items-center justify-center gap-2" style={{ width: "6.5rem" }}>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Beat
            </span>
            <div style={{ width: "4.25rem", height: "4.25rem" }}>
              <Knob
                value={beatMul}
                min={0.25}
                max={16}
                onChange={(v) => {
                  const nearest = beatMultipliers.reduce((a, b) =>
                    Math.abs(b - v) < Math.abs(a - v) ? b : a
                  );
                  setBeatMul(nearest);
                }}
                mode="stepped"
                steps={beatMultipliers}
              />
            </div>
            <span className="font-mono font-bold tracking-tight text-amber-300 leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {beatLabel}
            </span>
          </div>
          <div className="w-full flex flex-col items-stretch">
            <ToggleButton
              on={effectOn}
              onChange={setEffectOn}
              tone="accent"
            >
              <span className="flex flex-col items-center leading-none">
                <span className="font-mono font-semibold tracking-wider uppercase">
                  {effectOn ? "ON" : "OFF"}
                </span>
                <span className="text-[0.7em] font-mono tracking-widest uppercase opacity-80">
                  FX
                </span>
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer / status strip */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15 font-mono text-[10px] tracking-wide">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-neutral-500 uppercase">Route</span>
          <span className={"font-bold " + activeDeckColor}>{routeSummary}</span>
          <span className="text-neutral-700">|</span>
          <span className="text-neutral-500 uppercase">Sync</span>
          <span className="text-teal-300 font-bold">{beatLabel} BEAT</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              "inline-block h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (effectOn
                ? pulse % 2 === 0
                  ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.7)]"
                  : "bg-teal-500/50"
                : "bg-neutral-700")
            }
          />
          <span className={effectOn ? "text-teal-300 font-bold" : "text-neutral-500"}>
            {effectOn ? "PROCESSING" : "IDLE"}
          </span>
        </div>
      </div>
    </div>
  );
}