export default function GeneratedComponent() {
  type Chan = { trim: number; hi: number; mid: number; low: number; fader: number; cue: boolean };

  const [chans, setChans] = useState<Chan[]>([
    { trim: 2.5, hi: 1.5, mid: 0, low: -2, fader: 86, cue: false },
    { trim: -1, hi: -2, mid: 2.5, low: 1, fader: 72, cue: true },
  ]);
  const [xfade, setXfade] = useState<number>(50);
  const [master, setMaster] = useState<number>(78);
  const [hpMix, setHpMix] = useState<number>(45);
  const [levels, setLevels] = useState<number[]>([0.5, 0.4]);

  const chansRef = useRef<Chan[]>(chans);
  useEffect(() => {
    chansRef.current = chans;
  }, [chans]);

  const tick = useRef<number>(0);
  useEffect(() => {
    const id = setInterval(() => {
      tick.current += 1;
      const t = tick.current;
      setLevels(
        chansRef.current.map((c, i) => {
          const osc =
            0.58 +
            0.26 * Math.sin(t * 0.33 + i * 2.2) +
            0.14 * Math.sin(t * 0.81 + i * 1.1) +
            0.07 * Math.sin(t * 1.63 + i * 0.5);
          const g = Math.pow(10, c.trim / 40) * (1 + (c.hi + c.mid + c.low) / 90);
          const v = osc * g * (c.fader / 100);
          return Math.max(0.02, Math.min(1, v));
        })
      );
    }, 90);
    return () => clearInterval(id);
  }, []);

  const setChan = useCallback((i: number, key: keyof Chan, v: number | boolean) => {
    setChans((cs) => cs.map((c, j) => (j === i ? { ...c, [key]: v } : c)));
  }, []);

  const xa = Math.cos((xfade / 100) * (Math.PI / 2));
  const xb = Math.sin((xfade / 100) * (Math.PI / 2));

  const fmtDb = (v: number) => (v > 0 ? "+" : "") + v.toFixed(1);
  const snap = (v: number) => Math.round(v * 2) / 2;

  const deck = [
    {
      letter: "A",
      ring: "border-amber-500/20",
      dot: "bg-amber-400",
      glow: "from-amber-500/30",
      accent: "text-amber-300",
      glowRgb: "251,191,36",
    },
    {
      letter: "B",
      ring: "border-violet-500/25",
      dot: "bg-violet-400",
      glow: "from-violet-500/30",
      accent: "text-violet-300",
      glowRgb: "167,139,250",
    },
  ];

  const bands: { key: keyof Chan; label: string }[] = [
    { key: "hi", label: "HI" },
    { key: "mid", label: "MID" },
    { key: "low", label: "LOW" },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* HEADER */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-[10px] animate-pulse">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Central Mixer
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-medium uppercase tracking-widest text-stone-500">PFL</span>
          {chans.map((c, i) => (
            <span
              key={"pfl-" + i}
              className={
                "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
                (c.cue ? "bg-lime-400 animate-pulse" : "bg-stone-700")
              }
              style={c.cue ? { boxShadow: "0 0 7px rgba(163,230,53,0.75)" } : undefined}
            />
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* CHANNEL STRIPS */}
        <div className="flex-1 flex items-stretch gap-2">
          {chans.map((c, i) => {
            const d = deck[i];
            const lvl = levels[i] || 0;
            const share = i === 0 ? xa : xb;
            return (
              <section
                key={"ch-" + i}
                className={
                  "relative basis-0 flex-1 rounded-2xl border p-1.5 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60 overflow-clip transition-all duration-300 ease-out " +
                  d.ring
                }
              >
                <div
                  className={
                    "pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t to-transparent transition-opacity duration-200 ease-out " +
                    d.glow
                  }
                  style={{ opacity: 0.12 + share * 0.72 * lvl }}
                />
                <div className="relative flex h-full flex-col gap-1.5">
                  {/* strip title */}
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400">
                      CH {i + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={"text-[10px] font-semibold uppercase tracking-widest " + d.accent}>
                        {d.letter}
                      </span>
                      <span
                        className={"h-1.5 w-1.5 rounded-full transition-all duration-100 ease-linear " + d.dot}
                        style={{
                          opacity: 0.28 + lvl * 0.72,
                          boxShadow: "0 0 " + (2 + lvl * 8).toFixed(1) + "px rgba(" + d.glowRgb + ",0.8)",
                        }}
                      />
                    </div>
                  </div>

                  {/* gain trim */}
                  <div className="flex items-center gap-2 px-0.5">
                    <div className="h-[2.4rem] w-[2.4rem]">
                      <Knob
                        min={-12}
                        max={12}
                        value={c.trim}
                        onChange={(v) => setChan(i, "trim", snap(v))}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-medium uppercase tracking-widest text-stone-400 leading-none">
                        Trim
                      </span>
                      <span
                        className={
                          "font-mono font-bold tracking-tight text-[11px] leading-none transition-colors duration-200 " +
                          (c.trim === 0 ? "text-stone-500" : d.accent)
                        }
                      >
                        {fmtDb(c.trim)}
                      </span>
                    </div>
                  </div>

                  {/* 3-band EQ */}
                  <div className="flex items-start justify-between gap-1 px-0.5">
                    {bands.map((b) => {
                      const val = c[b.key] as number;
                      return (
                        <div key={b.label + i} className="flex flex-col items-center gap-1">
                          <div className="h-[2.4rem] w-[2.4rem]">
                            <Knob
                              min={-12}
                              max={12}
                              value={val}
                              onChange={(v) => setChan(i, b.key, snap(v))}
                            />
                          </div>
                          <span
                            className={
                              "text-[9px] font-medium uppercase tracking-wider leading-none transition-colors duration-200 " +
                              (val === 0 ? "text-stone-500" : d.accent)
                            }
                          >
                            {b.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* meter + channel fader well */}
                  <div className="flex-1 flex items-stretch justify-center gap-1.5 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-1.5">
                    <div className="h-full w-[1.6rem]">
                      <LevelMeter level={lvl} />
                    </div>
                    <div className="flex w-[0.45rem] flex-col justify-between py-1">
                      {[0, 1, 2, 3, 4, 5].map((k) => (
                        <span
                          key={"tk-" + i + "-" + k}
                          className={
                            "h-px w-full transition-colors duration-200 " +
                            (k === 1 ? "bg-amber-500/50" : "bg-stone-700/70")
                          }
                        />
                      ))}
                    </div>
                    <div className="h-full w-[2rem]">
                      <Fader
                        min={0}
                        max={100}
                        value={c.fader}
                        onChange={(v) => setChan(i, "fader", Math.round(v))}
                        orientation="vertical"
                      />
                    </div>
                  </div>

                  {/* cue / PFL */}
                  <div className="h-[1.7rem] w-full">
                    <ToggleButton on={c.cue} onChange={(on) => setChan(i, "cue", on)}>
                      <span className="font-semibold uppercase tracking-wider">Cue</span>
                    </ToggleButton>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* MASTER / CROSSFADER / HEADPHONES */}
        <div className="flex-none flex items-center gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-1.5 shadow-2xl shadow-black/60">
          <div className="flex w-[3.4rem] flex-col items-center gap-1">
            <div className="h-[2.5rem] w-[2.5rem]">
              <Knob min={0} max={100} value={master} onChange={(v) => setMaster(Math.round(v))} />
            </div>
            <span className="text-[9px] font-medium uppercase tracking-wider leading-none text-stone-400">
              Master
            </span>
            <span className="font-mono font-bold tracking-tight text-[11px] leading-none text-amber-400">
              {master}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-1 px-1">
            <div className="flex items-baseline justify-between">
              <span
                className="text-[10px] font-semibold uppercase tracking-widest leading-none text-amber-400 transition-all duration-150 ease-out"
                style={{ opacity: 0.3 + xa * 0.7 }}
              >
                A
              </span>
              <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-500">
                Xfade
              </span>
              <span
                className="text-[10px] font-semibold uppercase tracking-widest leading-none text-violet-400 transition-all duration-150 ease-out"
                style={{ opacity: 0.3 + xb * 0.7 }}
              >
                B
              </span>
            </div>
            <div className="relative h-[3px] w-full overflow-clip rounded-full bg-stone-800/90">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-150 ease-out"
                style={{ width: (xa * 50).toFixed(1) + "%" }}
              />
              <div
                className="absolute inset-y-0 right-0 rounded-full bg-violet-400 transition-all duration-150 ease-out"
                style={{ width: (xb * 50).toFixed(1) + "%" }}
              />
            </div>
            <div className="h-[1.7rem] w-full">
              <Fader
                min={0}
                max={100}
                value={xfade}
                onChange={(v) => setXfade(Math.round(v))}
                orientation="horizontal"
              />
            </div>
          </div>

          <div className="flex w-[3.4rem] flex-col items-center gap-1">
            <div className="h-[2.5rem] w-[2.5rem]">
              <Knob min={0} max={100} value={hpMix} onChange={(v) => setHpMix(Math.round(v))} />
            </div>
            <span className="text-[9px] font-medium uppercase tracking-wider leading-none text-stone-400">
              HP Mix
            </span>
            <span
              className={
                "font-mono font-bold tracking-tight text-[11px] leading-none transition-colors duration-200 " +
                (chans.some((c) => c.cue) ? "text-lime-300" : "text-stone-500")
              }
            >
              {hpMix}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}