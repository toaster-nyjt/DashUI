export default function GeneratedComponent() {
  const [chA, setChA] = useState({
    gain: 0.62,
    hi: 0.55,
    mid: 0.48,
    low: 0.66,
    fader: 0.78,
    cue: true,
  });
  const [chB, setChB] = useState({
    gain: 0.54,
    hi: 0.6,
    mid: 0.52,
    low: 0.44,
    fader: 0.71,
    cue: false,
  });
  const [crossfade, setCrossfade] = useState(0.5);
  const [master, setMaster] = useState(0.72);
  const [phones, setPhones] = useState(0.4);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 90);
    return () => clearInterval(id);
  }, []);

  // Simulated live level driven by fader + gain + a wobble, attenuated by crossfade balance
  const levels = useMemo(() => {
    const wob = (seed: number) =>
      0.5 +
      0.5 *
        Math.sin(tick * 0.5 + seed) *
        (0.6 + 0.4 * Math.sin(tick * 0.13 + seed * 1.7));
    const aBase = chA.fader * (0.5 + chA.gain * 0.5) * (0.85 + wob(0) * 0.25);
    const bBase = chB.fader * (0.5 + chB.gain * 0.5) * (0.85 + wob(3.2) * 0.25);
    const aMix = aBase * (0.35 + (1 - crossfade) * 0.65);
    const bMix = bBase * (0.35 + crossfade * 0.65);
    return {
      a: Math.max(0, Math.min(1, aMix)),
      b: Math.max(0, Math.min(1, bMix)),
    };
  }, [tick, chA.fader, chA.gain, chB.fader, chB.gain, crossfade]);

  const setA = (k: string, v: number) => setChA((s) => ({ ...s, [k]: v }));
  const setB = (k: string, v: number) => setChB((s) => ({ ...s, [k]: v }));

  const EqStack = ({
    strip,
    accent,
  }: {
    strip: typeof chA;
    accent: "amber" | "violet";
  }) => {
    const isA = accent === "amber";
    const setter = isA ? setA : setB;
    const rows: { key: keyof typeof chA; label: string }[] = [
      { key: "hi", label: "HI" },
      { key: "mid", label: "MID" },
      { key: "low", label: "LOW" },
    ];
    return (
      <div className="flex flex-col gap-1.5 min-h-0">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center gap-1.5 justify-center"
          >
            <span
              className={
                "font-medium uppercase tracking-widest leading-none text-[9px] w-6 text-right " +
                (isA ? "text-amber-400/70" : "text-violet-300/70")
              }
            >
              {r.label}
            </span>
            <div className="h-9 w-9">
              <Knob
                min={0}
                max={1}
                value={strip[r.key] as number}
                onChange={(v) => setter(r.key as string, v)}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ChannelStrip = ({
    strip,
    accent,
    label,
  }: {
    strip: typeof chA;
    accent: "amber" | "violet";
    label: string;
  }) => {
    const isA = accent === "amber";
    const setter = isA ? setA : setB;
    const level = isA ? levels.a : levels.b;
    const cueTint = isA
      ? "text-amber-300 border-amber-400/40 from-amber-500/5"
      : "text-violet-300 border-violet-400/40 from-violet-500/5";
    return (
      <div
        className={
          "flex-1 basis-0 min-w-0 min-h-0 flex flex-col rounded-xl border bg-neutral-900/90 bg-gradient-to-b to-neutral-950/60 shadow-lg shadow-black/40 p-2 gap-2 " +
          (isA
            ? "border-amber-500/20 from-amber-500/[0.04]"
            : "border-violet-500/20 from-violet-500/[0.04]")
        }
      >
        {/* Strip label + gain trim */}
        <div className="flex items-center justify-between">
          <span
            className={
              "font-semibold uppercase tracking-widest text-[10px] " +
              (isA ? "text-amber-400" : "text-violet-300")
            }
          >
            {label}
          </span>
          <div className="flex items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-[8px] text-stone-500">
              TRIM
            </span>
            <div className="h-7 w-7">
              <Knob
                min={0}
                max={1}
                value={strip.gain}
                onChange={(v) => setter("gain", v)}
              />
            </div>
          </div>
        </div>

        {/* EQ */}
        <EqStack strip={strip} accent={accent} />

        {/* Fader + VU */}
        <div className="flex-1 min-h-0 flex items-stretch justify-center gap-2 pt-0.5">
          <div className="flex flex-col items-center min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="h-full w-6 flex items-center justify-center">
                <div className="h-full max-h-full flex items-center">
                  <div className="h-full flex items-stretch">
                    <div className="h-full w-6 flex items-center justify-center">
                      <div className="h-full py-1 flex items-center">
                        <div className="h-full">
                          <Fader
                            min={0}
                            max={1}
                            value={strip.fader}
                            onChange={(v) => setter("fader", v)}
                            orientation="vertical"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-[8px] text-stone-500 pt-1">
              VOL
            </span>
          </div>

          <div className="flex flex-col items-center min-h-0">
            <div className="flex-1 min-h-0 flex items-center justify-center py-1">
              <div className="h-full w-5 flex items-center justify-center">
                <LevelMeter level={level} />
              </div>
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-[8px] text-lime-300/70 pt-1">
              VU
            </span>
          </div>
        </div>

        {/* Cue / PFL */}
        <div className="h-8">
          <ToggleButton
            on={strip.cue}
            onChange={(on) => setter("cue", on)}
          >
            <span className="inline-flex items-center gap-1">
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 18V6l8-4 8 4v12" />
                <circle cx="7" cy="18" r="2.5" />
                <circle cx="17" cy="18" r="2.5" />
              </svg>
              CUE
            </span>
          </ToggleButton>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-1.5 text-[11px]">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Mixer
        </span>
        <span className="ml-auto font-mono font-bold tracking-tight text-lime-300 text-[10px] tabular-nums">
          {Math.round((levels.a * 0.5 + levels.b * 0.5) * -0 + (Math.max(levels.a, levels.b) * 24 - 24))
            .toString()
            .padStart(3, " ")}
          dB
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col p-2 gap-2">
        {/* Two channel strips */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          <ChannelStrip strip={chA} accent="amber" label="CH 1" />
          <ChannelStrip strip={chB} accent="violet" label="CH 2" />
        </div>

        {/* Crossfader */}
        <div className="shrink-0 rounded-xl border border-stone-800/70 bg-stone-950/80 px-3 py-2 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-amber-400/80">
              A
            </span>
            <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-400">
              CROSSFADE
            </span>
            <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-violet-300/80">
              B
            </span>
          </div>
          <div className="h-7 w-full flex items-center">
            <Fader
              min={0}
              max={1}
              value={crossfade}
              onChange={setCrossfade}
              orientation="horizontal"
            />
          </div>
        </div>

        {/* Master + Headphone */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 basis-0 min-w-0 rounded-xl border border-amber-500/20 bg-neutral-900/90 bg-gradient-to-b from-amber-500/[0.04] to-neutral-950/60 shadow-md shadow-black/40 px-2 py-2 flex items-center gap-2">
            <div className="h-11 w-11 shrink-0">
              <Knob min={0} max={1} value={master} onChange={setMaster} />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-amber-400">
                Master
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-400 text-sm leading-tight tabular-nums">
                {Math.round(master * 100)}
              </span>
            </div>
          </div>

          <div className="flex-1 basis-0 min-w-0 rounded-xl border border-stone-700/60 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-md shadow-black/40 px-2 py-2 flex items-center gap-2">
            <div className="h-11 w-11 shrink-0">
              <Knob min={0} max={1} value={phones} onChange={setPhones} />
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="font-medium uppercase tracking-widest leading-none text-[9px] text-stone-400">
                Phones
              </span>
              <span className="font-mono font-bold tracking-tight text-stone-100 text-sm leading-tight tabular-nums">
                {Math.round(phones * 100)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}