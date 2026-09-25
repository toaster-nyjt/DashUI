export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + padding 0.75*2 + body row (knob 3.5 + label 0.9 = 4.4 max) stacked pairs 2x4.4=8.8 + gap 0.5 = 9.3 → body 16.8 available = 12.3 ≤ 20.8
  // BUDGET width: pad 0.75*2 + routing 9 + gap .75 + selector col 15 + gap .75 + mix 9 + gap .75 + params 12.5 + gap .75 + onoff 10 = 60.0 ≤ 62.4

  const EFFECTS = [
    { id: "echo", label: "ECHO", params: ["FEEDBACK", "FILTER", "DECAY"] },
    { id: "flanger", label: "FLANGER", params: ["DEPTH", "RATE", "WIDTH"] },
    { id: "reverb", label: "REVERB", params: ["SIZE", "DAMP", "TONE"] },
    { id: "filter", label: "FILTER", params: ["CUTOFF", "RESO", "DRIVE"] },
    { id: "crush", label: "CRUSH", params: ["BITS", "RATE", "MIX"] },
  ];
  const BEATS = [0.25, 0.5, 1, 2, 4, 8, 16];

  const [fx, setFx] = useState("echo");
  const [deckA, setDeckA] = useState(true);
  const [deckB, setDeckB] = useState(false);
  const [wet, setWet] = useState(58);
  const [beat, setBeat] = useState(1);
  const [on, setOn] = useState(true);
  const [p, setP] = useState([42, 63, 30]);
  const [pulse, setPulse] = useState(0);

  const active = on && (deckA || deckB);

  useEffect(() => {
    const id = setInterval(() => setPulse((v) => (v + 1) % 1000), 90);
    return () => clearInterval(id);
  }, []);

  const params = useMemo(
    () => (EFFECTS.find((e) => e.id === fx) || EFFECTS[0]).params,
    [fx]
  );

  const setParam = (i: number, v: number) =>
    setP((prev) => prev.map((x, j) => (j === i ? v : x)));

  const beatLabel = beat < 1 ? "1/" + Math.round(1 / beat) : beat + "";

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-400 text-center">
      {children}
    </div>
  );

  const Panel = ({
    title,
    children,
    tone,
  }: {
    title: string;
    children: React.ReactNode;
    tone?: string;
  }) => (
    <div
      className={
        "flex flex-col justify-between rounded-2xl border bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60 transition-all duration-500 ease-in-out " +
        (tone || "border-amber-500/15")
      }
    >
      <div className="text-[10px] font-mono font-semibold tracking-widest uppercase text-neutral-500">
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black">
      {/* header */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span
          className={
            "h-2 w-2 rounded-full transition-all duration-500 ease-in-out " +
            (active
              ? "bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.45)]"
              : "bg-neutral-700")
          }
        />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">
          Effects Rack
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-[2px] px-3 overflow-hidden">
          {Array.from({ length: 48 }).map((_, i) => {
            const h = active
              ? 20 +
                Math.abs(Math.sin((pulse + i * 3) / 6 + i)) * (30 + wet * 0.5)
              : 12;
            return (
              <span
                key={"b" + i}
                className={
                  "flex-1 rounded-full transition-all duration-200 ease-out " +
                  (active ? "bg-amber-500/60" : "bg-neutral-800")
                }
                style={{ height: Math.min(h, 60) + "%" }}
              />
            );
          })}
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400">
          {(EFFECTS.find((e) => e.id === fx) || EFFECTS[0]).label} · {beatLabel}{" "}
          BEAT
        </span>
      </div>

      {/* body */}
      <div className="flex-1 grid grid-cols-[9rem_15rem_9rem_1fr_9.5rem] gap-2 p-2">
        {/* routing */}
        <Panel
          title="Routing"
          tone={
            deckA || deckB ? "border-teal-400/30" : "border-amber-500/15"
          }
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-md border border-amber-500/20 bg-black/60 px-2 py-1 shadow-inner shadow-black/70">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-amber-300">
                Deck A
              </span>
              <div className="w-[3rem] h-[1.5rem]">
                <ToggleSwitch on={deckA} onChange={setDeckA} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border border-teal-400/25 bg-black/60 px-2 py-1 shadow-inner shadow-black/70">
              <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-teal-300">
                Deck B
              </span>
              <div className="w-[3rem] h-[1.5rem]">
                <ToggleSwitch on={deckB} onChange={setDeckB} />
              </div>
            </div>
          </div>
          <div className="font-mono text-[10px] tracking-wide text-neutral-500">
            {deckA && deckB
              ? "> BUS A+B"
              : deckA
              ? "> BUS A"
              : deckB
              ? "> BUS B"
              : "> NO SEND"}
          </div>
        </Panel>

        {/* selector */}
        <Panel title="Effect Type">
          <div className="w-full h-[2.25rem]">
            <SegmentedSelector
              options={EFFECTS.slice(0, 3).map((e) => ({
                id: e.id,
                label: e.label,
              }))}
              value={fx}
              onChange={setFx}
            />
          </div>
          <div className="w-full h-[2.25rem]">
            <SegmentedSelector
              options={EFFECTS.slice(3).map((e) => ({
                id: e.id,
                label: e.label,
              }))}
              value={fx}
              onChange={setFx}
            />
          </div>
          <div className="font-mono text-[10px] tracking-wide text-neutral-500">
            ENGINE · MOLTEN DSP v2
          </div>
        </Panel>

        {/* mix */}
        <Panel title="Mix / Sync">
          <div className="flex items-end justify-around gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-[3.25rem] h-[3.25rem]">
                <Knob
                  value={wet}
                  min={0}
                  max={100}
                  onChange={(v) => setWet(Math.round(v))}
                />
              </div>
              <Label>Dry/Wet</Label>
              <span className="font-mono text-[10px] font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {wet}%
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-[3.25rem] h-[3.25rem]">
                <Knob
                  value={beat}
                  min={0.25}
                  max={16}
                  mode="stepped"
                  steps={BEATS}
                  onChange={setBeat}
                />
              </div>
              <Label>Beats</Label>
              <span className="font-mono text-[10px] font-bold text-teal-300">
                {beatLabel}
              </span>
            </div>
          </div>
        </Panel>

        {/* params */}
        <Panel title="Parameters">
          <div className="flex items-end justify-around gap-2">
            {params.map((name, i) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div className="w-[3.25rem] h-[3.25rem]">
                  <Knob
                    value={p[i]}
                    min={0}
                    max={100}
                    onChange={(v) => setParam(i, Math.round(v))}
                  />
                </div>
                <Label>{name}</Label>
                <span className="font-mono text-[10px] font-bold text-amber-300/90">
                  {p[i]}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        {/* on/off */}
        <div
          className={
            "flex flex-col items-center justify-center gap-2 rounded-2xl border p-2 transition-all duration-500 ease-in-out " +
            (active
              ? "border-amber-400/50 bg-gradient-to-b from-neutral-900 to-black shadow-[0_0_16px_rgba(251,146,60,0.45)]"
              : "border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950")
          }
        >
          <div className="w-[7.5rem] h-[3.5rem]">
            <ToggleButton on={on} onChange={setOn} tone="accent">
              <span className="flex flex-col items-center leading-tight">
                <span className="font-mono font-bold tracking-widest uppercase">
                  {on ? "FX ON" : "FX OFF"}
                </span>
                <span className="text-[0.6em] font-mono tracking-widest uppercase opacity-70">
                  Engage
                </span>
              </span>
            </ToggleButton>
          </div>
          <Label>Master Engage</Label>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          SEND {deckA ? "A" : "–"}/{deckB ? "B" : "–"} · WET {wet}% · {beatLabel} BEAT
        </span>
        <span
          className={
            "font-mono text-[10px] tracking-widest uppercase transition-all duration-500 " +
            (active ? "text-teal-300" : "text-neutral-500")
          }
        >
          {active ? "PROCESSING" : "BYPASSED"}
        </span>
      </div>
    </div>
  );
}