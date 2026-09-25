export default function GeneratedComponent() {
  const BANDS = ["HI", "MID", "LOW"];

  const chMeta = [
    {
      name: "CH 1",
      deck: "A",
      accentText: "text-amber-300",
      dotBg: "bg-amber-400",
      border: "border-amber-500/25",
      glowRGB: "245,158,11",
    },
    {
      name: "CH 2",
      deck: "B",
      accentText: "text-violet-300",
      dotBg: "bg-violet-400",
      border: "border-violet-500/25",
      glowRGB: "167,139,250",
    },
  ];

  const [trim, setTrim] = useState<number[]>([2, -1]);
  const [eq, setEq] = useState<number[][]>([
    [3, 0, -2],
    [-1, 2, 0],
  ]);
  const [chFader, setChFader] = useState<number[]>([82, 74]);
  const [cue, setCue] = useState<boolean[]>([true, false]);
  const [xf, setXf] = useState<number>(50);
  const [master, setMaster] = useState<number>(78);
  const [phones, setPhones] = useState<number>(55);
  const [levels, setLevels] = useState<number[]>([0.42, 0.35]);

  const paramsRef = useRef({ trim, chFader, xf, master });
  paramsRef.current = { trim, chFader, xf, master };
  const phaseRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      phaseRef.current += 0.33;
      const p = paramsRef.current;
      setLevels((prev) =>
        prev.map((l, i) => {
          const g = (p.trim[i] + 12) / 24;
          const f = p.chFader[i] / 100;
          const x =
            i === 0
              ? Math.cos((p.xf / 100) * (Math.PI / 2))
              : Math.sin((p.xf / 100) * (Math.PI / 2));
          const puls =
            0.5 + 0.5 * Math.abs(Math.sin(phaseRef.current * (i === 0 ? 1 : 1.43)));
          const noise = 0.78 + 0.22 * Math.random();
          const target =
            puls * noise * (0.45 + 0.85 * g) * f * x * (0.45 + 0.55 * (p.master / 100));
          return Math.max(0, Math.min(1, l * 0.45 + target * 0.55));
        })
      );
    }, 110);
    return () => clearInterval(id);
  }, []);

  const setAt = (arr: number[] | boolean[], i: number, v: any): any[] =>
    (arr as any[]).map((x, k) => (k === i ? v : x));

  const db = (l: number) => (l <= 0.005 ? "-inf" : (20 * Math.log10(l)).toFixed(1));

  const aMix = Math.round(Math.cos((xf / 100) * (Math.PI / 2)) * 100);
  const bMix = Math.round(Math.sin((xf / 100) * (Math.PI / 2)) * 100);
  const anyCue = cue[0] || cue[1];

  const knobCell = (
    key: string,
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (v: number) => void,
    accent: string,
    size: string
  ) => (
    <div key={key} className="flex flex-col items-center gap-[0.15rem]">
      <div className={size}>
        <Knob min={min} max={max} value={value} onChange={onChange} />
      </div>
      <span
        className={
          "font-mono text-[9px] font-medium uppercase tracking-widest leading-none tabular-nums transition-colors duration-200 ease-out " +
          (Math.abs(value) >= 0.5 ? accent : "text-stone-400")
        }
      >
        {Math.abs(value) >= 0.5
          ? (value > 0 ? "+" : "") + value.toFixed(0)
          : label}
      </span>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* HEADER */}
      <div className="h-8 flex-none flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent px-3">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-400 text-[10px] animate-pulse">◆</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">
            Central Mixer
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              "rounded-md border px-1.5 py-[1px] text-[9px] font-semibold uppercase tracking-widest transition-all duration-300 ease-out " +
              (anyCue
                ? "border-lime-400/50 bg-lime-400/15 text-lime-300 animate-pulse"
                : "border-stone-700/60 text-stone-600")
            }
          >
            PFL
          </span>
          <span className="font-mono text-[11px] font-bold tracking-tight tabular-nums text-amber-400">
            {Math.round(master)}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        {/* MASTER BUS STRIP */}
        <div className="flex flex-none items-center gap-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-r from-amber-500/5 to-transparent px-2 py-1.5 shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2">
            <div className="h-[2.4rem] w-[2.4rem]">
              <Knob min={0} max={100} value={master} onChange={(v) => setMaster(v)} />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-400">
                Master
              </span>
              <span className="font-mono text-sm font-bold leading-none tracking-tight tabular-nums text-amber-400">
                {Math.round(master)}
              </span>
              <div className="h-[3px] w-[3.1rem] overflow-clip rounded-full bg-stone-950/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-lime-400 transition-all duration-200 ease-out"
                  style={{ width: master + "%" }}
                />
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <span className="h-1 w-1 rounded-full bg-lime-400 animate-pulse" />
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end gap-[0.2rem]">
              <span className="text-[9px] font-medium uppercase tracking-widest leading-none text-stone-400">
                Phones
              </span>
              <span className="font-mono text-sm font-bold leading-none tracking-tight tabular-nums text-violet-300">
                {Math.round(phones)}
              </span>
              <div className="flex h-[3px] w-[3.1rem] overflow-clip rounded-full bg-stone-950/80">
                <div
                  className="h-full bg-violet-500 transition-all duration-200 ease-out"
                  style={{ width: 100 - phones + "%" }}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-200 ease-out"
                  style={{ width: phones + "%" }}
                />
              </div>
            </div>
            <div className="h-[2.4rem] w-[2.4rem]">
              <Knob min={0} max={100} value={phones} onChange={(v) => setPhones(v)} />
            </div>
          </div>
        </div>

        {/* CHANNEL STRIPS */}
        <div className="flex flex-1 gap-1.5">
          {chMeta.map((m, i) => {
            const lvl = levels[i];
            return (
              <div
                key={m.name}
                className={
                  "relative flex flex-1 flex-col justify-between rounded-2xl border bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-1.5 transition-all duration-300 ease-out " +
                  m.border
                }
                style={{
                  boxShadow:
                    "0 12px 30px rgba(0,0,0,0.6), 0 0 " +
                    (4 + lvl * 18).toFixed(1) +
                    "px rgba(" +
                    m.glowRGB +
                    "," +
                    (0.04 + lvl * 0.22).toFixed(3) +
                    ")",
                }}
              >
                {/* channel title */}
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-widest leading-none text-stone-200">
                    {m.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className={
                        "h-1.5 w-1.5 rounded-full transition-all duration-100 ease-linear " +
                        m.dotBg
                      }
                      style={{ opacity: 0.2 + 0.8 * lvl }}
                    />
                    <span
                      className={
                        "text-[9px] font-medium uppercase tracking-widest leading-none " +
                        m.accentText
                      }
                    >
                      {m.deck}
                    </span>
                  </span>
                </div>

                {/* gain trim */}
                <div className="flex justify-center">
                  {knobCell(
                    "trim" + i,
                    "Trim",
                    trim[i],
                    -12,
                    12,
                    (v) => setTrim((p) => setAt(p, i, v)),
                    m.accentText,
                    "h-[2.3rem] w-[2.3rem]"
                  )}
                </div>

                {/* 3-band EQ */}
                <div className="flex items-start justify-center gap-1.5">
                  {BANDS.map((b, bi) =>
                    knobCell(
                      "eq" + i + bi,
                      b,
                      eq[i][bi],
                      -12,
                      12,
                      (v) =>
                        setEq((prev) =>
                          prev.map((row, ci) =>
                            ci === i ? row.map((x, k) => (k === bi ? v : x)) : row
                          )
                        ),
                      m.accentText,
                      "h-[2.1rem] w-[2.1rem]"
                    )
                  )}
                </div>

                {/* fader + meter + cue */}
                <div className="flex h-[6rem] items-end justify-around gap-1">
                  <div className="h-[6rem] w-[1.7rem]">
                    <Fader
                      min={0}
                      max={100}
                      value={chFader[i]}
                      onChange={(v) => setChFader((p) => setAt(p, i, v))}
                      orientation="vertical"
                    />
                  </div>
                  <div className="h-[6rem] w-[1.5rem]">
                    <LevelMeter level={lvl} />
                  </div>
                  <div className="flex h-[6rem] flex-col items-center justify-between py-[0.15rem]">
                    <span className="font-mono text-[9px] leading-none tabular-nums text-lime-300 transition-all duration-100 ease-linear">
                      {db(lvl)}
                    </span>
                    <div className="flex flex-col items-center gap-[0.2rem]">
                      <span className="font-mono text-[10px] font-bold leading-none tabular-nums text-stone-100">
                        {Math.round(chFader[i])}
                      </span>
                      <div className="h-[1.7rem] w-[2.7rem]">
                        <ToggleButton
                          on={cue[i]}
                          onChange={(on) => setCue((p) => setAt(p, i, on))}
                        >
                          <span className="font-semibold uppercase tracking-wider">
                            Cue
                          </span>
                        </ToggleButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CROSSFADER */}
        <div className="flex flex-none flex-col gap-1 rounded-2xl border border-amber-500/15 bg-neutral-900/90 px-2 py-1.5 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest leading-none">
            <span
              className="font-mono font-bold tabular-nums text-amber-400 transition-all duration-200 ease-out"
              style={{ opacity: 0.35 + 0.65 * (aMix / 100) }}
            >
              A {aMix}
            </span>
            <span className="font-medium text-stone-500">Crossfader</span>
            <span
              className="font-mono font-bold tabular-nums text-violet-300 transition-all duration-200 ease-out"
              style={{ opacity: 0.35 + 0.65 * (bMix / 100) }}
            >
              {bMix} B
            </span>
          </div>
          <div className="h-[1.7rem] w-full">
            <Fader
              min={0}
              max={100}
              value={xf}
              onChange={(v) => setXf(v)}
              orientation="horizontal"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70 px-3 text-[10px] uppercase tracking-widest text-stone-500">
        <span>
          A <span className="text-lime-300 tabular-nums">{db(levels[0])}</span>
        </span>
        <span>
          Bus{" "}
          <span className="text-lime-300 tabular-nums">
            {aMix}/{bMix}
          </span>
        </span>
        <span>
          B <span className="text-lime-300 tabular-nums">{db(levels[1])}</span>
        </span>
      </div>
    </div>
  );
}