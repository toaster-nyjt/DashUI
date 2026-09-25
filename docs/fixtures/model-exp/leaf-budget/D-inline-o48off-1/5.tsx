export default function GeneratedComponent() {
  const effectTypes = [
    { id: "reverb", label: "REVERB" },
    { id: "delay", label: "DELAY" },
    { id: "flanger", label: "FLANGER" },
    { id: "filter", label: "FILTER" },
    { id: "phaser", label: "PHASER" },
  ];

  const beatSteps = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16];
  const beatLabels: Record<number, string> = {
    0.125: "1/8",
    0.25: "1/4",
    0.5: "1/2",
    1: "1",
    2: "2",
    4: "4",
    8: "8",
    16: "16",
  };

  const [effectType, setEffectType] = useState<string>("delay");
  const [routeA, setRouteA] = useState<boolean>(true);
  const [routeB, setRouteB] = useState<boolean>(false);
  const [dryWet, setDryWet] = useState<number>(45);
  const [beatMult, setBeatMult] = useState<number>(1);
  const [engaged, setEngaged] = useState<boolean>(false);
  const [paramX, setParamX] = useState<number>(60);
  const [paramY, setParamY] = useState<number>(30);

  const activeDeck = routeA && !routeB ? "A" : routeB && !routeA ? "B" : routeA && routeB ? "A+B" : "—";

  const paramXLabel =
    effectType === "reverb" ? "SIZE" :
    effectType === "delay" ? "FEEDBK" :
    effectType === "flanger" ? "DEPTH" :
    effectType === "filter" ? "CUTOFF" : "RATE";
  const paramYLabel =
    effectType === "reverb" ? "DECAY" :
    effectType === "delay" ? "TIME" :
    effectType === "flanger" ? "RATE" :
    effectType === "filter" ? "RESO" : "SPREAD";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* Header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "inline-block h-2 w-2 rounded-full transition-all duration-500 " +
              (engaged
                ? "bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.45)]"
                : "bg-neutral-600")
            }
          />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Effects Rack
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase">
          <span className="text-neutral-500">ROUTE</span>
          <span
            className={
              "px-1.5 py-0.5 rounded-md border transition-all duration-200 " +
              (activeDeck === "A"
                ? "text-amber-300 border-amber-500/40 bg-amber-500/10"
                : activeDeck === "B"
                ? "text-teal-300 border-teal-400/40 bg-teal-500/10"
                : activeDeck === "A+B"
                ? "text-violet-300 border-violet-400/40 bg-violet-500/10"
                : "text-neutral-500 border-neutral-700/60")
            }
          >
            {activeDeck}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 flex items-stretch gap-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Column 1: Type + Routing + Toggle */}
        <div className="flex flex-col gap-2 basis-0 grow-[1.15]">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Effect Type
            </span>
            <div className="">
              <SegmentedSelector options={effectTypes} value={effectType} onChange={setEffectType} />
            </div>
          </div>

          <div className="flex-1 flex items-stretch gap-2">
            {/* Routing */}
            <div className="flex-1 flex flex-col rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-2 py-2">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 mb-2">
                Routing
              </span>
              <div className="flex-1 flex flex-col justify-around gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      "font-mono font-bold tracking-tight text-sm transition-colors duration-200 " +
                      (routeA ? "text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]" : "text-neutral-500")
                    }
                  >
                    DECK A
                  </span>
                  <ToggleSwitch on={routeA} onChange={setRouteA} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      "font-mono font-bold tracking-tight text-sm transition-colors duration-200 " +
                      (routeB ? "text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]" : "text-neutral-500")
                    }
                  >
                    DECK B
                  </span>
                  <ToggleSwitch on={routeB} onChange={setRouteB} />
                </div>
              </div>
            </div>

            {/* On/Off */}
            <div className="flex flex-col items-center justify-between gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-2 py-2">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                Active
              </span>
              <div className="flex-1 flex items-center">
                <div className="h-[3.25rem] w-[3.5rem]">
                  <ToggleButton on={engaged} onChange={setEngaged} tone="accent">
                    <span className="flex flex-col items-center leading-none">
                      <span>{engaged ? "ON" : "OFF"}</span>
                      <span className="text-[0.7em] tracking-widest opacity-80">FX</span>
                    </span>
                  </ToggleButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Knob bank */}
        <div className="flex flex-col basis-0 grow-[1.35] rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-2 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Parameters
            </span>
            <span className="font-mono text-[10px] tracking-wide text-neutral-500 truncate">
              {effectTypes.find((e) => e.id === effectType)?.label}
            </span>
          </div>

          <div className="flex-1 grid grid-cols-4 gap-2 items-stretch">
            {/* Dry/Wet */}
            <div className="flex flex-col items-center justify-between">
              <div className="h-[2.75rem] w-[2.75rem] flex items-center justify-center">
                <Knob value={dryWet} min={0} max={100} onChange={setDryWet} />
              </div>
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 mt-1 text-center">
                Dry/Wet
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-300 text-[0.7rem] leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {Math.round(dryWet)}%
              </span>
            </div>

            {/* Beat Multiplier */}
            <div className="flex flex-col items-center justify-between">
              <div className="h-[2.75rem] w-[2.75rem] flex items-center justify-center">
                <Knob
                  value={beatMult}
                  min={0.125}
                  max={16}
                  onChange={setBeatMult}
                  mode="stepped"
                  steps={beatSteps}
                />
              </div>
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 mt-1 text-center">
                Beats
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-300 text-[0.7rem] leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {beatLabels[
                  beatSteps.reduce((prev, cur) =>
                    Math.abs(cur - beatMult) < Math.abs(prev - beatMult) ? cur : prev
                  )
                ]}
              </span>
            </div>

            {/* Param X */}
            <div className="flex flex-col items-center justify-between">
              <div className="h-[2.75rem] w-[2.75rem] flex items-center justify-center">
                <Knob value={paramX} min={0} max={100} onChange={setParamX} />
              </div>
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 mt-1 text-center truncate max-w-full">
                {paramXLabel}
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-300 text-[0.7rem] leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {Math.round(paramX)}
              </span>
            </div>

            {/* Param Y */}
            <div className="flex flex-col items-center justify-between">
              <div className="h-[2.75rem] w-[2.75rem] flex items-center justify-center">
                <Knob value={paramY} min={0} max={100} onChange={setParamY} />
              </div>
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 mt-1 text-center truncate max-w-full">
                {paramYLabel}
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-300 text-[0.7rem] leading-none mt-0.5 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {Math.round(paramY)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          {engaged ? (
            <span className="text-teal-300">
              SIGNAL &rarr; DECK {activeDeck} · {effectTypes.find((e) => e.id === effectType)?.label}
            </span>
          ) : (
            <span>STANDBY · SIGNAL BYPASSED</span>
          )}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-500 truncate">
          WET {Math.round(dryWet)}% · SYNC {beatLabels[
            beatSteps.reduce((prev, cur) =>
              Math.abs(cur - beatMult) < Math.abs(prev - beatMult) ? cur : prev
            )
          ]}
        </span>
      </div>
    </div>
  );
}