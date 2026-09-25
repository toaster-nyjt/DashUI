export default function GeneratedComponent() {
  const [gain, setGain] = useState<[number, number]>([0, 0]);
  const [hi, setHi] = useState<[number, number]>([0, 0]);
  const [mid, setMid] = useState<[number, number]>([0, 0]);
  const [low, setLow] = useState<[number, number]>([0, 0]);
  const [fader, setFader] = useState<[number, number]>([82, 68]);
  const [cue, setCue] = useState<[boolean, boolean]>([false, true]);
  const [xfade, setXfade] = useState(50);
  const [master, setMaster] = useState(76);
  const [hpMix, setHpMix] = useState(40);
  const [levels, setLevels] = useState<[number, number]>([0.4, 0.3]);
  const tick = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      tick.current += 1;
      const t = tick.current;
      setLevels(() => {
        const base1 = 0.45 + 0.35 * Math.abs(Math.sin(t * 0.37)) + Math.random() * 0.15;
        const base2 = 0.4 + 0.4 * Math.abs(Math.sin(t * 0.29 + 1.3)) + Math.random() * 0.15;
        const g1 = 1 + gain[0] / 24;
        const g2 = 1 + gain[1] / 24;
        return [
          Math.min(1, base1 * g1 * (fader[0] / 100)),
          Math.min(1, base2 * g2 * (fader[1] / 100)),
        ];
      });
    }, 110);
    return () => clearInterval(id);
  }, [gain, fader]);

  const setPair = <T,>(setter: (v: [T, T]) => void, cur: [T, T], idx: 0 | 1, v: T) => {
    const next: [T, T] = [cur[0], cur[1]];
    next[idx] = v;
    setter(next);
  };

  const fmtDb = (v: number) => (v > 0 ? "+" : "") + v.toFixed(1);

  const renderKnob = (
    label: string,
    value: number,
    onChange: (v: number) => void,
    idx: 0 | 1,
    min: number,
    max: number,
    display: string
  ) => {
    const accent = idx === 0 ? "text-amber-400" : "text-violet-300";
    const hot = Math.abs(value) > 0.05;
    return (
      <div className="flex flex-col items-center gap-1" key={label + idx}>
        <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
          {label}
        </span>
        <div className="w-10 h-10">
          <Knob min={min} max={max} value={value} onChange={onChange} />
        </div>
        <span
          className={
            "font-mono font-bold tracking-tight leading-none text-[10px] transition-all duration-200 ease-out " +
            (hot ? accent : "text-stone-600")
          }
        >
          {display}
        </span>
      </div>
    );
  };

  const renderChannel = (idx: 0 | 1) => {
    const isA = idx === 0;
    const lvl = levels[idx];
    const glow = isA ? "rgba(245,158,11," : "rgba(139,92,246,";
    const chipBorder = isA ? "border-amber-500/15" : "border-violet-500/20";
    const idTxt = isA ? "text-amber-400" : "text-violet-300";
    const weight = isA ? (100 - xfade) / 100 : xfade / 100;
    return (
      <div
        className={
          "flex-1 flex flex-col rounded-2xl border p-2 gap-2 relative transition-all duration-300 ease-out bg-neutral-900/90 " +
          chipBorder
        }
        style={{
          boxShadow:
            "inset 0 0 " + Math.round(18 + lvl * 30) + "px " + glow + (0.05 + lvl * 0.2 * weight) + ")",
        }}
      >
        <div className="flex items-center justify-between">
          <span className={"font-mono font-bold tracking-tight text-xs " + idTxt}>
            CH{idx + 1}
          </span>
          <span
            className={
              "font-medium uppercase tracking-widest leading-none text-[10px] transition-all duration-300 " +
              (weight > 0.55 ? "text-lime-300 animate-pulse" : "text-stone-600")
            }
          >
            {Math.round(weight * 100)}%
          </span>
        </div>
        <div className="flex-1 flex flex-row gap-2">
          <div className="flex flex-col justify-between">
            {renderKnob("Gain", gain[idx], (v) => setPair(setGain, gain, idx, v), idx, -12, 12, fmtDb(gain[idx]))}
            {renderKnob("Hi", hi[idx], (v) => setPair(setHi, hi, idx, v), idx, -12, 12, fmtDb(hi[idx]))}
            {renderKnob("Mid", mid[idx], (v) => setPair(setMid, mid, idx, v), idx, -12, 12, fmtDb(mid[idx]))}
            {renderKnob("Low", low[idx], (v) => setPair(setLow, low, idx, v), idx, -12, 12, fmtDb(low[idx]))}
          </div>
          <div className="flex-1 flex flex-col gap-2 items-center">
            <div className="flex-1 flex flex-row gap-1 w-full justify-center">
              <div className="w-8 h-full">
                <Fader
                  min={0}
                  max={100}
                  value={fader[idx]}
                  onChange={(v) => setPair(setFader, fader, idx, v)}
                  orientation="vertical"
                />
              </div>
              <div className="w-6 h-full">
                <LevelMeter level={lvl} />
              </div>
            </div>
            <div className="w-12 h-6">
              <ToggleButton on={cue[idx]} onChange={(v) => setPair(setCue, cue, idx, v)}>
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const masterLvl = Math.min(1, (levels[0] * (100 - xfade) + levels[1] * xfade) / 100) * (master / 100);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-500/40 animate-pulse" />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Central Mixer
          </span>
        </div>
        <span className="font-mono font-bold tracking-tight text-[11px] text-lime-300 transition-all duration-100 ease-linear">
          {Math.round(masterLvl * 100)}
        </span>
      </div>

      <div className="flex-1 flex flex-row gap-2 p-2">
        {renderChannel(0)}

        <div className="w-16 flex flex-col items-center justify-between py-2 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60">
          <div className="flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
              Master
            </span>
            <div
              className="w-12 h-12 rounded-full transition-all duration-100 ease-linear"
              style={{ boxShadow: "0 0 " + Math.round(masterLvl * 26) + "px rgba(163,230,53," + masterLvl * 0.5 + ")" }}
            >
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <span className="font-mono font-bold tracking-tight text-[10px] text-amber-400">{master}</span>
          </div>

          <div className="flex-1 w-1 mx-auto my-2 rounded-full bg-stone-950/80 border border-stone-800/70 relative overflow-clip">
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-lime-400 via-amber-400 to-red-500 transition-all duration-100 ease-linear"
              style={{ height: masterLvl * 100 + "%" }}
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
              Phones
            </span>
            <div className="w-12 h-12">
              <Knob min={0} max={100} value={hpMix} onChange={setHpMix} />
            </div>
            <div className="flex gap-1 font-mono font-bold text-[10px] tracking-tight leading-none">
              <span className={hpMix < 50 ? "text-violet-300" : "text-stone-600"}>CUE</span>
              <span className={hpMix >= 50 ? "text-amber-400" : "text-stone-600"}>MIX</span>
            </div>
          </div>
        </div>

        {renderChannel(1)}
      </div>

      <div className="flex-none px-3 pb-2 pt-1 flex flex-row items-center gap-2 h-12">
        <span
          className={
            "font-mono font-bold tracking-tight text-sm transition-all duration-300 " +
            (xfade < 45 ? "text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" : "text-stone-600")
          }
        >
          A
        </span>
        <div className="flex-1 h-8 rounded-full bg-stone-950/80 border border-stone-800/70 relative">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500/25 to-transparent pointer-events-none transition-all duration-150 ease-out"
            style={{ width: 100 - xfade + "%" }}
          />
          <div
            className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-violet-500/25 to-transparent pointer-events-none transition-all duration-150 ease-out"
            style={{ width: xfade + "%" }}
          />
          <div className="relative w-full h-full">
            <Fader min={0} max={100} value={xfade} onChange={setXfade} orientation="horizontal" />
          </div>
        </div>
        <span
          className={
            "font-mono font-bold tracking-tight text-sm transition-all duration-300 " +
            (xfade > 55 ? "text-violet-300 drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]" : "text-stone-600")
          }
        >
          B
        </span>
      </div>
    </div>
  );
}