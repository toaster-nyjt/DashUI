type KnobCellProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  size?: string;
  tint?: string;
};

function KnobCell({ label, value, min, max, onChange, size = "2.75rem", tint = "text-white/40" }: KnobCellProps) {
  return (
    <div className="flex flex-col items-center gap-[0.3rem]">
      <div style={{ width: size, height: size }}>
        <Knob min={min} max={max} value={value} onChange={onChange} />
      </div>
      <span className={"text-[0.5rem] tracking-[0.22em] uppercase " + tint}>{label}</span>
    </div>
  );
}

export default function GeneratedComponent() {
  // BUDGET height: header 2.5 + pad 1.0 + [gain/filter row 2.5+0.9 + eq row 2.5+0.9 + fader/meter 8.0(flex, grows) + label 0.9] + gap 0.6 + crossfader block 3.6 = 23.4 <= 41.6
  // BUDGET width: pad 1.0 + chA (2.75+0.5+2.75 = 6.0 .. strip 11.5) + gap 0.6 + center 12.0 + gap 0.6 + chB 11.5 = 37.2 <= 52.0

  const [gainA, setGainA] = useState(62);
  const [gainB, setGainB] = useState(48);
  const [eqA, setEqA] = useState<number[]>([2, -1, 4]);
  const [eqB, setEqB] = useState<number[]>([-3, 1, 0]);
  const [filtA, setFiltA] = useState(0);
  const [filtB, setFiltB] = useState(0);
  const [volA, setVolA] = useState(82);
  const [volB, setVolB] = useState(70);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(74);
  const [cueLevel, setCueLevel] = useState(55);
  const [cueA, setCueA] = useState(true);
  const [cueB, setCueB] = useState(false);

  const [lvlA, setLvlA] = useState(0.4);
  const [lvlB, setLvlB] = useState(0.3);
  const [pkA, setPkA] = useState(0.5);
  const [pkB, setPkB] = useState(0.4);
  const [tick, setTick] = useState(0);

  const xfA = Math.min(1, (100 - xf) / 60);
  const xfB = Math.min(1, (100 + xf) / 60);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      const base = (v: number, g: number, x: number) =>
        Math.max(0, Math.min(1, (v / 100) * (0.45 + g / 140) * x * (0.62 + Math.random() * 0.45)));
      const a = base(volA, gainA, xfA);
      const b = base(volB, gainB, xfB);
      setLvlA(a);
      setLvlB(b);
      setPkA((p) => Math.max(a, p * 0.93));
      setPkB((p) => Math.max(b, p * 0.93));
    }, 110);
    return () => clearInterval(id);
  }, [volA, volB, gainA, gainB, xfA, xfB]);

  const eqLabels = ["HI", "MID", "LOW"];

  const strip = (
    id: "A" | "B",
    accent: string,
    glow: string,
    gain: number,
    setGain: (v: number) => void,
    eq: number[],
    setEq: (v: number[]) => void,
    filt: number,
    setFilt: (v: number) => void,
    vol: number,
    setVol: (v: number) => void,
    lvl: number,
    pk: number,
    cue: boolean,
    setCue: (v: boolean) => void
  ) => (
    <div
      className="flex flex-col gap-[0.45rem] rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-[0.55rem] transition-colors duration-300 hover:border-white/25"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center justify-between px-[0.15rem]">
        <span className={"text-[0.7rem] font-bold tracking-[0.3em] " + accent} style={{ textShadow: glow }}>
          CH {id}
        </span>
        <span className="text-[0.5rem] tracking-[0.2em] text-white/30">DECK {id}</span>
      </div>

      <div className="flex items-start justify-center gap-[0.9rem]">
        <KnobCell label="TRIM" value={gain} min={0} max={100} onChange={setGain} />
        <KnobCell label="FILTER" value={filt} min={-50} max={50} onChange={setFilt} />
      </div>

      <div className="flex items-start justify-center gap-[0.55rem] rounded-lg bg-black/40 py-[0.4rem]">
        {eq.map((v, i) => (
          <KnobCell
            key={id + "-eq-" + i}
            label={eqLabels[i]}
            value={v}
            min={-12}
            max={12}
            size="2.5rem"
            onChange={(nv) => {
              const next = eq.slice();
              next[i] = nv;
              setEq(next);
            }}
          />
        ))}
      </div>

      <div className="flex flex-1 items-stretch justify-center gap-[0.7rem] pt-[0.2rem]">
        <div className="flex flex-col items-center gap-[0.3rem]">
          <div className="w-[1.4rem] flex-1">
            <LevelMeter level={lvl} peak={pk} orientation="vertical" />
          </div>
          <span className="text-[0.45rem] tracking-[0.15em] text-white/30">dB</span>
        </div>
        <div className="flex flex-col items-center gap-[0.35rem]">
          <div className="w-[2.6rem] flex-1">
            <Fader min={0} max={100} value={vol} onChange={setVol} orientation="vertical" detents={[0, 50, 100]} />
          </div>
          <span className={"text-[0.55rem] font-bold tabular-nums " + accent}>{Math.round(vol)}</span>
        </div>
      </div>

      <div className="h-[1.9rem] w-full">
        <ToggleButton on={cue} onChange={setCue} tone="accent">
          <span className="tracking-[0.25em]">CUE {id}</span>
        </ToggleButton>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07080b] font-mono text-white">
      {/* header */}
      <div className="relative flex-none h-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-transparent to-fuchsia-500/10 px-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-2 w-2 rounded-full bg-cyan-300"
            style={{ boxShadow: "0 0 10px 2px rgba(34,211,238,0.9)", opacity: tick % 2 ? 1 : 0.45, transition: "opacity .25s" }}
          />
          <span className="truncate text-[0.72rem] font-bold tracking-[0.42em] text-white/90">CENTRAL MIXER</span>
        </div>
        <div className="flex items-center gap-3 text-[0.5rem] tracking-[0.3em] text-white/35">
          <span className="text-cyan-300/70">A</span>
          <span>2CH · MASTER OUT</span>
          <span className="text-fuchsia-300/70">B</span>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-[0.6rem] p-[0.6rem] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex flex-col">
          {strip("A", "text-cyan-300", "0 0 12px rgba(34,211,238,.8)", gainA, setGainA, eqA, setEqA, filtA, setFiltA, volA, setVolA, lvlA, pkA, cueA, setCueA)}
        </div>

        {/* center */}
        <div className="flex w-[12rem] flex-col gap-[0.6rem]">
          <div className="flex flex-1 flex-col items-center justify-center gap-[0.5rem] rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_70%)] p-[0.6rem]">
            <span className="text-[0.5rem] tracking-[0.35em] text-white/35">MASTER</span>
            <div className="h-[4.6rem] w-[4.6rem]">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <span className="text-[0.95rem] font-bold tabular-nums text-white/90" style={{ textShadow: "0 0 14px rgba(255,255,255,.35)" }}>
              {Math.round(master)}
            </span>
            <div className="mt-[0.2rem] h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-[0.5rem] tracking-[0.35em] text-amber-300/70">HEADPHONES</span>
            <KnobCell label="CUE LVL" value={cueLevel} min={0} max={100} onChange={setCueLevel} size="3rem" />
          </div>

          <div className="flex-none rounded-xl border border-white/10 bg-white/[0.04] p-[0.55rem]">
            <div className="mb-[0.35rem] flex items-center justify-between text-[0.5rem] tracking-[0.25em]">
              <span className="text-cyan-300/80">A</span>
              <span className="text-white/35">CROSSFADER</span>
              <span className="text-fuchsia-300/80">B</span>
            </div>
            <div className="h-[2.3rem] w-full">
              <Fader min={-100} max={100} value={xf} onChange={setXf} orientation="horizontal" detents={[-100, 0, 100]} />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {strip("B", "text-fuchsia-300", "0 0 12px rgba(232,121,249,.8)", gainB, setGainB, eqB, setEqB, filtB, setFiltB, volB, setVolB, lvlB, pkB, cueB, setCueB)}
        </div>
      </div>
    </div>
  );
}