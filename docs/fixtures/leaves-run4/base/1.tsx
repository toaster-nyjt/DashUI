export default function GeneratedComponent() {
  // ------- Channel state -------
  const [gainA, setGainA] = useState(72);
  const [gainB, setGainB] = useState(65);
  const [eqA, setEqA] = useState({ hi: 60, mid: 50, lo: 55 });
  const [eqB, setEqB] = useState({ hi: 48, mid: 62, lo: 50 });
  const [faderA, setFaderA] = useState(85);
  const [faderB, setFaderB] = useState(78);
  const [cueA, setCueA] = useState(false);
  const [cueB, setCueB] = useState(true);
  const [crossfader, setCrossfader] = useState(50); // 0 = full A, 100 = full B
  const [master, setMaster] = useState(80);
  const [hpMix, setHpMix] = useState(35); // 0 = cue, 100 = master

  // ------- Live meter simulation -------
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 100000), 90);
    return () => clearInterval(id);
  }, []);

  const cfA = 1 - Math.max(0, (crossfader - 50) / 50); // A weight
  const cfB = 1 - Math.max(0, (50 - crossfader) / 50); // B weight

  // pseudo-random but smooth-ish level per channel
  const lvl = (seed: number, gain: number, fader: number, cf: number) => {
    const base =
      0.5 +
      0.5 *
        Math.sin(tick * 0.35 + seed) *
        Math.cos(tick * 0.11 + seed * 2.3);
    const beat = ((tick + seed * 7) % 8 < 2 ? 0.28 : 0) * (0.6 + 0.4 * Math.sin(tick * 0.9 + seed));
    const g = (gain / 100) * (fader / 100) * cf;
    return Math.min(1, Math.max(0.04, (Math.abs(base) * 0.85 + beat) * g));
  };

  const meterA = lvl(1.2, gainA, faderA, cfA);
  const meterB = lvl(4.7, gainB, faderB, cfB);

  // ---------------------------------------------------------------
  // Knob component
  // ---------------------------------------------------------------
  const Knob = ({
    value,
    onChange,
    label,
    tint,
    centered,
  }: {
    value: number;
    onChange: (v: number) => void;
    label: string;
    tint: "amber" | "violet" | "lime";
    centered?: boolean;
  }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const drag = useRef<{ y: number; v: number } | null>(null);

    const stroke =
      tint === "violet"
        ? "text-violet-400"
        : tint === "lime"
        ? "text-lime-300"
        : "text-amber-400";

    const angle = -135 + (value / 100) * 270;

    useEffect(() => {
      const move = (e: MouseEvent) => {
        if (!drag.current) return;
        const dy = drag.current.y - e.clientY;
        onChange(Math.min(100, Math.max(0, drag.current.v + dy * 0.6)));
      };
      const up = () => (drag.current = null);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
    }, [onChange]);

    return (
      <div className="flex flex-1 min-w-0 flex-col items-center gap-1">
        <div
          ref={ref}
          onMouseDown={(e) => (drag.current = { y: e.clientY, v: value })}
          onDoubleClick={() => onChange(centered ? 50 : 75)}
          className="relative aspect-square w-full max-w-[2.4rem] cursor-ns-resize rounded-full border-2 border-stone-700/80 bg-black/70 shadow-inner shadow-black/70 transition-transform duration-150 ease-out active:scale-95"
        >
          {/* tick marks */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            {Array.from({ length: 11 }).map((_, i) => {
              const a = (-135 + (i / 10) * 270) * (Math.PI / 180);
              const x1 = 50 + Math.cos(a) * 44;
              const y1 = 50 + Math.sin(a) * 44;
              const x2 = 50 + Math.cos(a) * 49;
              const y2 = 50 + Math.sin(a) * 49;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  className="stroke-stone-700/70"
                  strokeWidth={1.5}
                />
              );
            })}
          </svg>
          {/* pointer */}
          <div
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{ transform: "rotate(" + angle + "deg)" }}
          >
            <div
              className={
                "absolute left-1/2 top-[10%] h-[34%] w-[2px] -translate-x-1/2 rounded-full bg-current " +
                stroke
              }
            />
          </div>
          {/* center cap */}
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-600" />
        </div>
        <span className="w-full truncate text-center text-[9px] font-medium uppercase leading-none tracking-widest text-stone-400">
          {label}
        </span>
      </div>
    );
  };

  // ---------------------------------------------------------------
  // Vertical fader
  // ---------------------------------------------------------------
  const VFader = ({
    value,
    onChange,
    tint,
  }: {
    value: number;
    onChange: (v: number) => void;
    tint: "amber" | "violet";
  }) => {
    const track = useRef<HTMLDivElement | null>(null);
    const dragging = useRef(false);

    const apply = (clientY: number) => {
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = 1 - (clientY - r.top) / r.height;
      onChange(Math.min(100, Math.max(0, p * 100)));
    };

    useEffect(() => {
      const move = (e: MouseEvent) => dragging.current && apply(e.clientY);
      const up = () => (dragging.current = false);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
    }, [onChange]);

    const fill = tint === "violet" ? "bg-violet-500/70" : "bg-amber-500/70";
    const cap =
      tint === "violet"
        ? "bg-gradient-to-b from-violet-300 to-violet-600 shadow-violet-500/40"
        : "bg-gradient-to-b from-amber-300 to-amber-600 shadow-amber-500/40";

    return (
      <div
        ref={track}
        onMouseDown={(e) => {
          dragging.current = true;
          apply(e.clientY);
        }}
        className="relative w-3 flex-1 min-h-0 cursor-ns-resize rounded-full border border-stone-700/60 bg-stone-950/80 shadow-inner shadow-black/70"
      >
        {/* center notch */}
        <div className="absolute left-1/2 top-1/2 h-px w-2.5 -translate-x-1/2 bg-stone-700/70" />
        {/* fill */}
        <div
          className={"absolute inset-x-0 bottom-0 rounded-full " + fill}
          style={{ height: value + "%" }}
        />
        {/* cap */}
        <div
          className={
            "absolute left-1/2 h-3 w-6 -translate-x-1/2 rounded-md border border-stone-900/60 shadow-lg transition-all duration-100 ease-out " +
            cap
          }
          style={{ bottom: "calc(" + value + "% - 6px)" }}
        />
      </div>
    );
  };

  // ---------------------------------------------------------------
  // VU meter (vertical segments)
  // ---------------------------------------------------------------
  const VU = ({ level }: { level: number }) => {
    const segs = 14;
    const active = Math.round(level * segs);
    return (
      <div className="flex w-2.5 flex-1 min-h-0 flex-col-reverse gap-[2px] rounded-md border border-stone-800/70 bg-black/70 p-[2px] shadow-inner shadow-black/70">
        {Array.from({ length: segs }).map((_, i) => {
          const on = i < active;
          const color =
            i >= segs - 2
              ? on
                ? "bg-red-500 shadow-[0_0_4px] shadow-red-500/50"
                : "bg-red-900/40"
              : i >= segs - 5
              ? on
                ? "bg-amber-400 shadow-[0_0_4px] shadow-amber-400/40"
                : "bg-amber-900/30"
              : on
              ? "bg-lime-400 shadow-[0_0_4px] shadow-lime-400/40"
              : "bg-lime-900/25";
          return (
            <div
              key={i}
              className={"flex-1 rounded-[1px] transition-all duration-100 ease-linear " + color}
            />
          );
        })}
      </div>
    );
  };

  // ---------------------------------------------------------------
  // Channel strip
  // ---------------------------------------------------------------
  const Channel = ({
    id,
    tint,
    gain,
    setGain,
    eq,
    setEq,
    fader,
    setFader,
    cue,
    setCue,
    meter,
  }: any) => {
    const accent = tint === "violet" ? "text-violet-300" : "text-amber-400";
    const dot = tint === "violet" ? "bg-violet-400" : "bg-amber-400";
    return (
      <div className="flex flex-1 min-w-0 flex-col gap-1.5 rounded-xl border border-stone-800/70 bg-stone-950/80 p-1.5">
        {/* header */}
        <div className="flex items-center justify-center gap-1">
          <span className={"h-1.5 w-1.5 rounded-full " + dot} />
          <span className={"text-[10px] font-semibold uppercase tracking-widest " + accent}>
            CH {id}
          </span>
        </div>

        {/* gain */}
        <Knob value={gain} onChange={setGain} label="Gain" tint={tint} centered />

        {/* EQ */}
        <div className="flex items-start gap-1">
          <Knob value={eq.hi} onChange={(v: number) => setEq({ ...eq, hi: v })} label="Hi" tint={tint} centered />
          <Knob value={eq.mid} onChange={(v: number) => setEq({ ...eq, mid: v })} label="Mid" tint={tint} centered />
          <Knob value={eq.lo} onChange={(v: number) => setEq({ ...eq, lo: v })} label="Lo" tint={tint} centered />
        </div>

        {/* fader + VU */}
        <div className="flex flex-1 min-h-0 items-stretch justify-center gap-1.5 pt-0.5">
          <VFader value={fader} onChange={setFader} tint={tint} />
          <VU level={meter} />
        </div>

        {/* cue */}
        <button
          onClick={() => setCue((c: boolean) => !c)}
          className={
            "rounded-md border py-1 text-[9px] font-semibold uppercase tracking-wider shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 " +
            (cue
              ? "border-amber-400/50 bg-amber-500/20 text-amber-200 shadow-amber-500/30 animate-pulse"
              : "border-stone-700/60 text-stone-400 hover:border-amber-400/60 hover:text-amber-300")
          }
        >
          Cue
        </button>
      </div>
    );
  };

  // ---------------------------------------------------------------
  // Horizontal slider (crossfader / hp mix)
  // ---------------------------------------------------------------
  const HSlider = ({
    value,
    onChange,
    leftLabel,
    rightLabel,
    marks,
  }: {
    value: number;
    onChange: (v: number) => void;
    leftLabel: string;
    rightLabel: string;
    marks?: boolean;
  }) => {
    const track = useRef<HTMLDivElement | null>(null);
    const dragging = useRef(false);
    const apply = (x: number) => {
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      onChange(Math.min(100, Math.max(0, ((x - r.left) / r.width) * 100)));
    };
    useEffect(() => {
      const move = (e: MouseEvent) => dragging.current && apply(e.clientX);
      const up = () => (dragging.current = false);
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      };
    }, [onChange]);

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[9px] font-medium uppercase tracking-widest text-stone-500">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        <div
          ref={track}
          onMouseDown={(e) => {
            dragging.current = true;
            apply(e.clientX);
          }}
          className="relative h-3 cursor-ew-resize rounded-full border border-stone-700/60 bg-stone-950/80 shadow-inner shadow-black/70"
        >
          {marks && (
            <div className="absolute left-1/2 top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-stone-600/70" />
          )}
          <div
            className="absolute left-1/2 top-1/2 h-5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-md border border-stone-900/60 bg-gradient-to-b from-amber-300 to-amber-600 shadow-lg shadow-amber-500/40 transition-all duration-100 ease-out"
            style={{ left: value + "%" }}
          />
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* header */}
      <div className="flex h-8 items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent px-3">
        <span className="text-amber-400">◈</span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">
          Central Mixer
        </span>
        <span className="ml-auto font-mono text-[10px] font-bold tracking-tight text-lime-300">
          A/B
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 min-h-0 flex-col gap-2 p-2">
        {/* channels */}
        <div className="flex flex-1 min-h-0 gap-2">
          <Channel
            id={1}
            tint="amber"
            gain={gainA}
            setGain={setGainA}
            eq={eqA}
            setEq={setEqA}
            fader={faderA}
            setFader={setFaderA}
            cue={cueA}
            setCue={setCueA}
            meter={meterA}
          />

          {/* master center column */}
          <div className="flex w-16 flex-col items-center gap-1.5 rounded-xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-amber-500/5 to-neutral-950/60 p-1.5 shadow-2xl shadow-black/60">
            <span className="text-[9px] font-medium uppercase tracking-widest text-stone-400">
              Master
            </span>
            <Knob value={master} onChange={setMaster} label="Vol" tint="lime" />
            <div className="flex flex-1 min-h-0 items-stretch gap-1 pt-0.5">
              <VU level={Math.min(1, (meterA + meterB) * 0.55 * (master / 100))} />
              <VU level={Math.min(1, (meterA + meterB) * 0.55 * (master / 100))} />
            </div>
            <span className="font-mono text-[11px] font-bold tracking-tight text-amber-400">
              {Math.round(master)}
            </span>
          </div>

          <Channel
            id={2}
            tint="violet"
            gain={gainB}
            setGain={setGainB}
            eq={eqB}
            setEq={setEqB}
            fader={faderB}
            setFader={setFaderB}
            cue={cueB}
            setCue={setCueB}
            meter={meterB}
          />
        </div>

        {/* crossfader */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-950/80 p-2">
          <HSlider
            value={crossfader}
            onChange={setCrossfader}
            leftLabel="A"
            rightLabel="B"
            marks
          />
        </div>

        {/* headphone mix */}
        <div className="rounded-xl border border-stone-800/70 bg-stone-950/80 p-2">
          <HSlider value={hpMix} onChange={setHpMix} leftLabel="Cue" rightLabel="Master" />
        </div>
      </div>

      {/* footer */}
      <div className="flex h-6 items-center gap-3 border-t border-stone-800/70 bg-stone-950/70 px-3 text-[10px] uppercase tracking-widest text-stone-500">
        <span>
          XF <span className="text-lime-300">{Math.round(crossfader)}</span>
        </span>
        <span>
          HP <span className="text-lime-300">{Math.round(hpMix)}</span>
        </span>
        <span className="ml-auto">
          MSTR <span className="font-mono text-lime-300">{Math.round(master)}</span>
        </span>
      </div>
    </div>
  );
}