export default function GeneratedComponent() {
  const [chan, setChan] = useState([
    { gain: 0.62, hi: 0.55, mid: 0.5, low: 0.68, fader: 0.78, cue: false, vu: 0.4 },
    { gain: 0.48, hi: 0.6, mid: 0.42, low: 0.58, fader: 0.7, cue: true, vu: 0.3 },
  ]);
  const [xfade, setXfade] = useState(0.5);
  const [master, setMaster] = useState(0.72);
  const [phones, setPhones] = useState(0.5);

  useEffect(() => {
    const id = setInterval(() => {
      setChan((prev) =>
        prev.map((c) => {
          const target = c.fader * (0.55 + Math.random() * 0.5);
          const next = c.vu + (target - c.vu) * 0.4 + (Math.random() - 0.5) * 0.08;
          return { ...c, vu: Math.max(0, Math.min(1, next)) };
        })
      );
    }, 110);
    return () => clearInterval(id);
  }, []);

  const setC = (i: number, key: string, v: number | boolean) =>
    setChan((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)));

  const identity = [
    { text: "text-amber-400", ring: "ring-amber-500/40", label: "CH1", deck: "DECK A" },
    { text: "text-violet-300", ring: "ring-violet-500/40", label: "CH2", deck: "DECK B" },
  ];

  const Cap = ({ children }: { children: React.ReactNode }) => (
    <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400 text-center">
      {children}
    </span>
  );

  const EqBand = ({
    ci,
    band,
    lbl,
  }: {
    ci: number;
    band: "hi" | "mid" | "low";
    lbl: string;
  }) => (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className="w-[2rem] h-[2rem]">
        <Knob
          min={0}
          max={1}
          value={(chan[ci] as any)[band]}
          onChange={(v) => setC(ci, band, v)}
        />
      </div>
      <Cap>{lbl}</Cap>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 leading-none">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Mixer
          </span>
        </div>
        <span className="font-mono font-bold tracking-tight text-lime-300 text-[11px]">
          XF {Math.round(xfade * 100)}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-3 flex flex-col gap-2">
        {/* Channel strips */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
          {[0, 1].map((ci) => (
            <div
              key={"ch-" + ci}
              className="min-w-0 flex flex-col gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 shadow-none"
            >
              {/* strip header */}
              <div className="flex items-center justify-between">
                <span
                  className={
                    "font-mono font-bold tracking-tight text-[11px] " + identity[ci].text
                  }
                >
                  {identity[ci].label}
                </span>
                <span className="font-normal tracking-wide leading-none text-[10px] text-stone-500 uppercase">
                  {identity[ci].deck}
                </span>
              </div>

              {/* gain trim */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-[2rem] h-[2rem]">
                  <Knob
                    min={0}
                    max={1}
                    value={chan[ci].gain}
                    onChange={(v) => setC(ci, "gain", v)}
                  />
                </div>
                <Cap>Gain</Cap>
              </div>

              {/* EQ */}
              <div className="grid grid-cols-3 gap-1">
                <EqBand ci={ci} band="hi" lbl="Hi" />
                <EqBand ci={ci} band="mid" lbl="Mid" />
                <EqBand ci={ci} band="low" lbl="Lo" />
              </div>

              {/* fader + VU */}
              <div className="flex-1 min-h-0 flex items-stretch justify-center gap-2 pt-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex-1 min-h-0 w-[1.6rem] flex items-stretch">
                    <Fader
                      min={0}
                      max={1}
                      value={chan[ci].fader}
                      onChange={(v) => setC(ci, "fader", v)}
                      orientation="vertical"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex-1 min-h-0 w-[1.5rem] flex items-stretch">
                    <LevelMeter level={chan[ci].vu} />
                  </div>
                </div>
              </div>

              {/* cue */}
              <div className="w-full h-[1.5rem]">
                <ToggleButton
                  on={chan[ci].cue}
                  onChange={(v) => setC(ci, "cue", v)}
                >
                  <span className="font-semibold uppercase tracking-wider text-[0.7em]">
                    Cue
                  </span>
                </ToggleButton>
              </div>
            </div>
          ))}
        </div>

        {/* Crossfader */}
        <div className="flex-none rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-2 flex items-center gap-2">
          <span className="font-mono font-bold text-[11px] text-amber-400">A</span>
          <div className="flex-1 min-w-0 h-[1.6rem] flex items-stretch">
            <Fader
              min={0}
              max={1}
              value={xfade}
              onChange={setXfade}
              orientation="horizontal"
            />
          </div>
          <span className="font-mono font-bold text-[11px] text-violet-300">B</span>
        </div>

        {/* Master + Phones */}
        <div className="flex-none grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 flex items-center justify-center gap-2">
            <div className="w-[2rem] h-[2rem]">
              <Knob min={0} max={1} value={master} onChange={setMaster} />
            </div>
            <Cap>Master</Cap>
          </div>
          <div className="rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 flex items-center justify-center gap-2">
            <div className="w-[2rem] h-[2rem]">
              <Knob min={0} max={1} value={phones} onChange={setPhones} />
            </div>
            <Cap>Phones</Cap>
          </div>
        </div>
      </div>
    </div>
  );
}