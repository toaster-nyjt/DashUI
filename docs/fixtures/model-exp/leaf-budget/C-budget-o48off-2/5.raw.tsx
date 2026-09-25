export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body[ selector row 2.4 + knob row (max child 2.5 knob + ~1 label = 3.5) ] + gaps 0.75*2 + padding 0.75*2 = ~11.6 ≤ 20.8
  // BUDGET width: routing 8 + selector flex + drywet 3 + beatmult 3 + param 3*3=9 + on/off 4 + gaps ≈ fits within 62.4 ≤ 62.4

  const EFFECTS = [
    { id: "echo", label: "ECHO" },
    { id: "reverb", label: "REVERB" },
    { id: "filter", label: "FILTER" },
    { id: "flanger", label: "FLANGER" },
    { id: "phaser", label: "PHASER" },
    { id: "bitcrush", label: "CRUSH" },
  ] as const;

  const BEAT_STEPS = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16];
  const BEAT_LABEL: Record<number, string> = {
    0.125: "1/8",
    0.25: "1/4",
    0.5: "1/2",
    1: "1",
    2: "2",
    4: "4",
    8: "8",
    16: "16",
  };

  const PARAM_DEFS: Record<
    string,
    { key: string; label: string; min: number; max: number; init: number; unit: string; bipolar?: boolean }[]
  > = {
    echo: [
      { key: "fb", label: "FEEDBK", min: 0, max: 100, init: 45, unit: "%" },
      { key: "time", label: "TIME", min: 0, max: 100, init: 60, unit: "%" },
      { key: "tone", label: "TONE", min: -50, max: 50, init: 0, unit: "", bipolar: true },
    ],
    reverb: [
      { key: "size", label: "SIZE", min: 0, max: 100, init: 55, unit: "%" },
      { key: "decay", label: "DECAY", min: 0, max: 100, init: 40, unit: "%" },
      { key: "damp", label: "DAMP", min: 0, max: 100, init: 30, unit: "%" },
    ],
    filter: [
      { key: "cutoff", label: "CUTOFF", min: -50, max: 50, init: 0, unit: "", bipolar: true },
      { key: "reso", label: "RESO", min: 0, max: 100, init: 25, unit: "%" },
      { key: "drive", label: "DRIVE", min: 0, max: 100, init: 20, unit: "%" },
    ],
    flanger: [
      { key: "depth", label: "DEPTH", min: 0, max: 100, init: 50, unit: "%" },
      { key: "rate", label: "RATE", min: 0, max: 100, init: 35, unit: "%" },
      { key: "fb", label: "FEEDBK", min: 0, max: 100, init: 40, unit: "%" },
    ],
    phaser: [
      { key: "depth", label: "DEPTH", min: 0, max: 100, init: 60, unit: "%" },
      { key: "rate", label: "RATE", min: 0, max: 100, init: 30, unit: "%" },
      { key: "stages", label: "STAGES", min: 2, max: 12, init: 6, unit: "" },
    ],
    bitcrush: [
      { key: "bits", label: "BITS", min: 2, max: 16, init: 12, unit: "b" },
      { key: "rate", label: "RATE", min: 0, max: 100, init: 45, unit: "%" },
      { key: "mix", label: "GRIT", min: 0, max: 100, init: 30, unit: "%" },
    ],
  };

  const [effect, setEffect] = useState<string>("echo");
  const [routeA, setRouteA] = useState<boolean>(true);
  const [routeB, setRouteB] = useState<boolean>(false);
  const [dryWet, setDryWet] = useState<number>(50);
  const [beat, setBeat] = useState<number>(1);
  const [on, setOn] = useState<boolean>(false);
  const [params, setParams] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    Object.values(PARAM_DEFS).forEach((defs) =>
      defs.forEach((d) => {
        init[d.key] = d.init;
      })
    );
    return init;
  });

  const activeParams = PARAM_DEFS[effect];
  const nearestBeat = BEAT_STEPS.reduce((p, c) => (Math.abs(c - beat) < Math.abs(p - beat) ? c : p), BEAT_STEPS[0]);

  const routeColor = routeA && routeB ? "text-amber-300" : routeB ? "text-violet-300" : routeA ? "text-amber-300" : "text-neutral-500";
  const routeName = routeA && routeB ? "A+B" : routeB ? "DECK B" : routeA ? "DECK A" : "OFF";

  const setParam = (k: string, v: number) => setParams((p) => ({ ...p, [k]: v }));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] text-amber-50">
      {/* HEADER */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-2 w-2 rounded-full transition-all duration-500 " +
              (on
                ? "bg-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.45)] animate-pulse"
                : "bg-neutral-600")
            }
          />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Effects Rack
          </span>
        </div>
        <div className="flex items-center gap-2 shrink">
          <span className="hidden sm:inline text-[10px] font-mono tracking-wide text-neutral-500 uppercase">
            ROUTE
          </span>
          <span
            className={
              "font-mono text-[11px] font-bold tracking-wider uppercase transition-colors duration-200 " +
              routeColor
            }
          >
            {routeName}
          </span>
          <span
            className={
              "font-mono text-[11px] font-bold tracking-tight px-2 py-0.5 rounded-md border transition-all duration-100 " +
              (on
                ? "text-amber-300 border-amber-500/40 bg-amber-500/10 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]"
                : "text-neutral-500 border-neutral-700/60 bg-black/40")
            }
          >
            {on ? "LIVE" : "BYP"}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 p-3">
        {/* ROW 1: TYPE SELECTOR + ROUTING */}
        <div className="flex-none flex items-stretch gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Effect Type
            </span>
            <div className="w-full h-8">
              <SegmentedSelector
                options={EFFECTS.map((e) => ({ id: e.id, label: e.label }))}
                value={effect}
                onChange={setEffect}
              />
            </div>
          </div>

          <div className="flex-none flex items-end gap-3">
            {/* Deck A */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-amber-400/90">
                Deck A
              </span>
              <div className="w-12 h-8 flex items-center justify-center">
                <ToggleSwitch on={routeA} onChange={setRouteA} />
              </div>
            </div>
            {/* Deck B */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-teal-300/90">
                Deck B
              </span>
              <div className="w-12 h-8 flex items-center justify-center">
                <ToggleSwitch on={routeB} onChange={setRouteB} />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: KNOBS + ON/OFF */}
        <div className="flex-1 min-h-0 flex items-stretch gap-3">
          {/* CORE CONTROLS: DRY/WET + BEAT */}
          <div className="flex-none flex items-stretch gap-3 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-3 py-2">
            <div className="flex flex-col items-center justify-between gap-1">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                Dry/Wet
              </span>
              <div className="w-11 h-11 sm:w-12 sm:h-12">
                <Knob value={dryWet} min={0} max={100} onChange={setDryWet} mode="continuous" />
              </div>
              <span className="font-mono text-[10px] font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {Math.round(dryWet)}%
              </span>
            </div>

            <div className="flex flex-col items-center justify-between gap-1">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                Beat
              </span>
              <div className="w-11 h-11 sm:w-12 sm:h-12">
                <Knob
                  value={beat}
                  min={0.125}
                  max={16}
                  onChange={setBeat}
                  mode="stepped"
                  steps={BEAT_STEPS}
                />
              </div>
              <span className="font-mono text-[10px] font-bold tracking-tight text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
                {BEAT_LABEL[nearestBeat]}
              </span>
            </div>
          </div>

          {/* PARAMETER KNOBS */}
          <div className="flex-1 min-w-0 flex items-stretch gap-3 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-3 py-2">
            {activeParams.map((p) => {
              const span = p.max - p.min;
              const disp = p.bipolar
                ? (params[p.key] > 0 ? "+" : "") + Math.round(params[p.key])
                : Math.round(params[p.key]) + p.unit;
              return (
                <div key={p.key} className="flex-1 min-w-0 flex flex-col items-center justify-between gap-1">
                  <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 truncate max-w-full">
                    {p.label}
                  </span>
                  <div className="w-11 h-11 sm:w-12 sm:h-12">
                    <Knob
                      value={params[p.key]}
                      min={p.min}
                      max={p.max}
                      onChange={(v) => setParam(p.key, v)}
                      mode="continuous"
                      bipolar={p.bipolar}
                    />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-tight text-amber-300/90">
                    {disp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ON/OFF TOGGLE */}
          <div className="flex-none flex flex-col items-center justify-center gap-1 rounded-xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 px-3 py-2">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              FX
            </span>
            <div className="w-16 h-full min-h-[2.75rem] flex items-center justify-center">
              <ToggleButton on={on} onChange={setOn} tone="accent">
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-mono font-bold tracking-wider uppercase">
                    {on ? "ON" : "OFF"}
                  </span>
                </span>
              </ToggleButton>
            </div>
            <span
              className={
                "font-mono text-[9px] tracking-wide uppercase transition-colors duration-200 " +
                (on ? "text-teal-300" : "text-neutral-600")
              }
            >
              {on ? "engaged" : "bypass"}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 uppercase truncate">
          {EFFECTS.find((e) => e.id === effect)?.label} · {BEAT_LABEL[nearestBeat]} BEAT
        </span>
        <span
          className={
            "font-mono text-[10px] tracking-wide uppercase " +
            (on && (routeA || routeB) ? "text-teal-300" : "text-neutral-500")
          }
        >
          {on && (routeA || routeB) ? "SENDING → " + routeName : "IDLE"}
        </span>
      </div>
    </div>
  );
}