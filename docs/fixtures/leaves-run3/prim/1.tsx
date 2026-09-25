export default function GeneratedComponent() {
  const [gainA, setGainA] = useState(0.62);
  const [gainB, setGainB] = useState(0.58);
  const [hiA, setHiA] = useState(0.5);
  const [midA, setMidA] = useState(0.5);
  const [loA, setLoA] = useState(0.5);
  const [hiB, setHiB] = useState(0.5);
  const [midB, setMidB] = useState(0.5);
  const [loB, setLoB] = useState(0.5);
  const [faderA, setFaderA] = useState(0.82);
  const [faderB, setFaderB] = useState(0.74);
  const [xfade, setXfade] = useState(0.5);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(false);
  const [master, setMaster] = useState(0.7);
  const [phones, setPhones] = useState(0.45);

  const [levelA, setLevelA] = useState(0.4);
  const [levelB, setLevelB] = useState(0.4);

  useEffect(() => {
    let raf: number;
    let t = 0;
    const tick = () => {
      t += 0.08;
      const baseA = faderA * gainA * (1 - Math.max(0, xfade - 0.5) * 1.6);
      const baseB = faderB * gainB * (1 - Math.max(0, 0.5 - xfade) * 1.6);
      const jitterA = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.7) * Math.cos(t * 0.9));
      const jitterB = 0.55 + 0.45 * Math.abs(Math.sin(t * 1.3 + 1.1) * Math.cos(t * 1.2));
      setLevelA(Math.min(1, Math.max(0, baseA * jitterA * 1.3)));
      setLevelB(Math.min(1, Math.max(0, baseB * jitterB * 1.3)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [faderA, faderB, gainA, gainB, xfade]);

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 leading-none text-center truncate">
      {children}
    </div>
  );

  const EqStack = ({
    hi,
    mid,
    lo,
    setHi,
    setMid,
    setLo,
  }: {
    hi: number;
    mid: number;
    lo: number;
    setHi: (v: number) => void;
    setMid: (v: number) => void;
    setLo: (v: number) => void;
  }) => (
    <div className="flex flex-col items-stretch gap-1 flex-1 min-h-0">
      {[
        { k: "HI", v: hi, s: setHi },
        { k: "MID", v: mid, s: setMid },
        { k: "LO", v: lo, s: setLo },
      ].map((b) => (
        <div key={b.k} className="flex-1 min-h-0 flex items-center gap-1.5">
          <div className="w-6 text-[8px] font-semibold uppercase tracking-widest text-neutral-500 leading-none">
            {b.k}
          </div>
          <div className="flex-1 min-w-0 min-h-0 aspect-square max-h-full">
            <Knob min={0} max={1} value={b.v} onChange={b.s} />
          </div>
        </div>
      ))}
    </div>
  );

  const Channel = ({
    id,
    accent,
    gain,
    setGain,
    hi,
    mid,
    lo,
    setHi,
    setMid,
    setLo,
    fader,
    setFader,
    cue,
    setCue,
    level,
  }: {
    id: string;
    accent: "amber" | "teal";
    gain: number;
    setGain: (v: number) => void;
    hi: number;
    mid: number;
    lo: number;
    setHi: (v: number) => void;
    setMid: (v: number) => void;
    setLo: (v: number) => void;
    fader: number;
    setFader: (v: number) => void;
    cue: boolean;
    setCue: (v: boolean) => void;
    level: number;
  }) => {
    const chip =
      accent === "amber"
        ? "text-amber-400 bg-amber-500/15 border-amber-400/30"
        : "text-teal-300 bg-teal-500/15 border-teal-400/30";
    return (
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div
          className={
            "shrink-0 h-5 rounded-md border flex items-center justify-center text-[10px] font-bold tracking-widest " +
            chip
          }
        >
          {id}
        </div>

        <div className="shrink-0 flex flex-col items-center gap-0.5">
          <div className="w-10 aspect-square">
            <Knob min={0} max={1} value={gain} onChange={setGain} />
          </div>
          <Label>Trim</Label>
        </div>

        <EqStack hi={hi} mid={mid} lo={lo} setHi={setHi} setMid={setMid} setLo={setLo} />

        <div className="flex-1 min-h-0 flex items-stretch gap-1.5">
          <div className="w-3.5 min-h-0">
            <LevelMeter level={level} />
          </div>
          <div className="flex-1 min-w-0 min-h-0">
            <Fader min={0} max={1} value={fader} onChange={setFader} orientation="vertical" />
          </div>
        </div>

        <div className="shrink-0">
          <ToggleButton on={cue} onChange={setCue}>
            <span className="text-[9px] font-bold tracking-widest">CUE</span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-[radial-gradient(120%_120%_at_50%_-10%,#221a10_0%,#0c0b0a_55%,#050505_100%)] text-neutral-100">
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-rose-300/90">
          Mixer
        </span>
        <span className="text-[10px] font-mono tabular-nums text-neutral-500">
          XF {Math.round(xfade * 100)}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col gap-2.5">
        <div className="flex-1 min-h-0 flex items-stretch gap-2.5">
          <Channel
            id="CH 1"
            accent="amber"
            gain={gainA}
            setGain={setGainA}
            hi={hiA}
            mid={midA}
            lo={loA}
            setHi={setHiA}
            setMid={setMidA}
            setLo={setLoA}
            fader={faderA}
            setFader={setFaderA}
            cue={cueA}
            setCue={setCueA}
            level={levelA}
          />

          <div className="w-16 shrink-0 flex flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
            <div className="shrink-0 flex flex-col items-center gap-0.5">
              <div className="w-11 aspect-square">
                <Knob min={0} max={1} value={master} onChange={setMaster} />
              </div>
              <Label>Master</Label>
            </div>
            <div className="flex-1" />
            <div className="shrink-0 flex flex-col items-center gap-0.5">
              <div className="w-10 aspect-square">
                <Knob min={0} max={1} value={phones} onChange={setPhones} />
              </div>
              <Label>Phones</Label>
            </div>
          </div>

          <Channel
            id="CH 2"
            accent="teal"
            gain={gainB}
            setGain={setGainB}
            hi={hiB}
            mid={midB}
            lo={loB}
            setHi={setHiB}
            setMid={setMidB}
            setLo={setLoB}
            fader={faderB}
            setFader={setFaderB}
            cue={cueB}
            setCue={setCueB}
            level={levelB}
          />
        </div>

        <div className="shrink-0 rounded-xl border border-white/[0.06] bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-widest">
            <span className="text-amber-400">A</span>
            <span className="text-neutral-500">Crossfade</span>
            <span className="text-teal-300">B</span>
          </div>
          <div className="h-7">
            <Fader min={0} max={1} value={xfade} onChange={setXfade} orientation="horizontal" />
          </div>
        </div>
      </div>
    </div>
  );
}