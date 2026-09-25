export default function GeneratedComponent() {
  type Ch = { gain: number; hi: number; mid: number; low: number; fader: number; cue: boolean };

  const [chans, setChans] = useState<Ch[]>([
    { gain: 72, hi: 55, mid: 50, low: 62, fader: 84, cue: false },
    { gain: 64, hi: 48, mid: 52, low: 44, fader: 71, cue: true },
  ]);
  const [xf, setXf] = useState(50);
  const [master, setMaster] = useState(78);
  const [phones, setPhones] = useState(42);
  const [levels, setLevels] = useState<number[]>([0, 0]);

  const chRef = useRef(chans);
  chRef.current = chans;
  const xfRef = useRef(xf);
  xfRef.current = xf;
  const mRef = useRef(master);
  mRef.current = master;

  const setCh = useCallback((i: number, key: keyof Ch, v: number | boolean) => {
    setChans((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)));
  }, []);

  useEffect(() => {
    let t = 0;
    const id = setInterval(() => {
      t += 1;
      const x = xfRef.current;
      const gA = x <= 50 ? 1 : (100 - x) / 50;
      const gB = x >= 50 ? 1 : x / 50;
      const xg = [gA, gB];
      setLevels((prev) =>
        prev.map((p, i) => {
          const c = chRef.current[i];
          const pulse =
            0.55 +
            0.3 * Math.abs(Math.sin(t * (0.41 + i * 0.13) + i * 1.7)) +
            0.15 * Math.abs(Math.sin(t * (1.9 + i * 0.4)));
          const target = Math.min(
            1,
            pulse * (c.gain / 100) * 1.35 * (c.fader / 100) * xg[i] * (mRef.current / 100) * 1.15
          );
          return p + (target - p) * 0.5;
        })
      );
    }, 95);
    return () => clearInterval(id);
  }, []);

  const gA = xf <= 50 ? 1 : (100 - xf) / 50;
  const gB = xf >= 50 ? 1 : xf / 50;

  const strips = [
    {
      label: "CH 1",
      deck: "DECK A",
      border: "border-amber-500/20",
      accent: "text-amber-400",
      glow: "shadow-amber-500/20",
    },
    {
      label: "CH 2",
      deck: "DECK B",
      border: "border-violet-500/20",
      accent: "text-violet-300",
      glow: "shadow-violet-500/20",
    },
  ];

  const eqKeys: { k: keyof Ch; l: string }[] = [
    { k: "hi", l: "HI" },
    { k: "mid", l: "MID" },
    { k: "low", l: "LOW" },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans">
      {/* Header */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-[11px] animate-pulse">◈</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Mixer
          </span>
        </div>
        <span className="font-mono font-bold tracking-tight text-[11px] text-lime-300">
          {Math.round(master)}%
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Channel strips */}
        <div className="flex-1 flex gap-2">
          {strips.map((s, i) => {
            const c = chans[i];
            return (
              <div
                key={"strip-" + i}
                className={
                  "flex-1 flex flex-col gap-1 p-2 rounded-2xl border bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60 transition-all duration-300 ease-out " +
                  s.border +
                  (c.cue ? " ring-1 ring-inset ring-lime-400/40 " + s.glow : "")
                }
              >
                {/* strip title */}
                <div className="h-[0.9rem] flex-none flex items-center justify-between">
                  <span className={"font-semibold uppercase tracking-widest text-[10px] " + s.accent}>
                    {s.label}
                  </span>
                  <span className="font-normal tracking-wide text-[9px] uppercase text-stone-500">
                    {s.deck}
                  </span>
                </div>

                {/* trim + cue */}
                <div className="h-[2.8rem] flex-none flex items-center gap-1.5">
                  <div className="w-[2.8rem] h-[2.8rem]">
                    <Knob
                      min={0}
                      max={100}
                      value={c.gain}
                      onChange={(v) => setCh(i, "gain", v)}
                    />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400">
                      TRIM
                    </span>
                    <span className="font-mono font-bold text-[10px] text-amber-400 mt-0.5">
                      {Math.round(c.gain)}
                    </span>
                  </div>
                  <div className="flex-1" />
                  <div className="w-[3.4rem] h-[2rem]">
                    <ToggleButton on={c.cue} onChange={(v) => setCh(i, "cue", v)}>
                      <span className="font-semibold uppercase tracking-wider">CUE</span>
                    </ToggleButton>
                  </div>
                </div>

                {/* EQ */}
                <div className="h-[3.4rem] flex-none flex items-start justify-between">
                  {eqKeys.map((e) => (
                    <div key={e.l} className="flex flex-col items-center gap-1">
                      <div className="w-[2.6rem] h-[2.6rem]">
                        <Knob
                          min={0}
                          max={100}
                          value={c[e.k] as number}
                          onChange={(v) => setCh(i, e.k, v)}
                        />
                      </div>
                      <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
                        {e.l}
                      </span>
                    </div>
                  ))}
                </div>

                {/* fader + meter */}
                <div className="flex-1 flex flex-col gap-1 rounded-xl border border-stone-800/70 bg-stone-950/80 p-1.5">
                  <div className="flex-1 flex items-stretch justify-center gap-3">
                    <div className="w-[1.6rem] h-full">
                      <LevelMeter level={levels[i]} />
                    </div>
                    <div className="w-[2rem] h-full">
                      <Fader
                        min={0}
                        max={100}
                        value={c.fader}
                        onChange={(v) => setCh(i, "fader", v)}
                        orientation="vertical"
                      />
                    </div>
                  </div>
                  <div className="h-[0.7rem] flex-none flex items-center justify-center gap-3">
                    <span className="w-[1.6rem] text-center font-normal uppercase tracking-widest text-[9px] text-stone-600 leading-none">
                      VU
                    </span>
                    <span className="w-[2rem] text-center font-mono font-bold text-[9px] text-lime-300 leading-none transition-all duration-100 ease-linear">
                      {Math.round(c.fader)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master / Phones / Crossfader */}
        <div className="h-[4.2rem] flex-none flex items-center gap-2 p-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60">
          <div className="flex flex-col items-center gap-1">
            <div className="w-[2.4rem] h-[2.4rem]">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <span className="font-medium uppercase tracking-widest text-[9px] text-amber-400/80 leading-none">
              MSTR
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-[2.4rem] h-[2.4rem]">
              <Knob min={0} max={100} value={phones} onChange={setPhones} />
            </div>
            <span className="font-medium uppercase tracking-widest text-[9px] text-violet-300/80 leading-none">
              PHNS
            </span>
          </div>

          <div className="w-px h-[2.6rem] bg-stone-800/80" />

          <div className="flex-1 flex flex-col gap-1">
            <div className="h-[0.8rem] flex items-center justify-between px-0.5">
              <span
                className="font-mono font-bold text-[10px] text-amber-400 leading-none transition-all duration-200 ease-out"
                style={{ opacity: 0.3 + 0.7 * gA }}
              >
                A
              </span>
              <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
                CROSSFADE
              </span>
              <span
                className="font-mono font-bold text-[10px] text-violet-300 leading-none transition-all duration-200 ease-out"
                style={{ opacity: 0.3 + 0.7 * gB }}
              >
                B
              </span>
            </div>
            <div className="w-full h-[1.8rem]">
              <Fader
                min={0}
                max={100}
                value={xf}
                onChange={setXf}
                orientation="horizontal"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          XF{" "}
          <span className="text-lime-300 font-mono">
            {Math.round(gA * 100)}/{Math.round(gB * 100)}
          </span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          PFL{" "}
          <span className={chans.some((c) => c.cue) ? "text-lime-300 animate-pulse" : "text-stone-600"}>
            {chans.some((c) => c.cue) ? "ON" : "OFF"}
          </span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          PH <span className="text-lime-300 font-mono">{Math.round(phones)}</span>
        </span>
      </div>
    </div>
  );
}