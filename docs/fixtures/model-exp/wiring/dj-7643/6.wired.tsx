export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(meters 12 / knobs 2.5+2.5) + padding 0.75 + footer 1.75 = 16.75 ≤ 24.3
  // BUDGET width: pad 0.75 + meters 14 + gap 0.75 + knobs (2×5.5=11) + gap 0.75 + rec (PushButton 7 + Readout 7 = 14) + Indicator 1.5 + pad 0.75 = 43.5 ≤ 48.6

  const [master, setMaster] = useState(78);
  const [booth, setBooth] = useState(45);
  const [rec, setRec] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState([0.6, 0.55]);
  const [peak, setPeak] = useState([0.7, 0.68]);
  const [clip, setClip] = useState(false);

  useEffect(() => {
    return bus.on("DJ Table: Central Mixer Console->DJ Table: Master Output & VU Meters", (data) => {
      const g = master / 100;
      setLevels([
        Math.min(1, Math.max(0, data.levels[0] * g)),
        Math.min(1, Math.max(0, data.levels[1] * g)),
      ]);
      setPeak([
        Math.min(1, Math.max(0, data.peak[0] * g)),
        Math.min(1, Math.max(0, data.peak[1] * g)),
      ]);
      setClip(data.clip || data.levels[0] * g > 0.96 || data.levels[1] * g > 0.96);
    });
  }, [master]);

  useEffect(() => {
    if (!rec) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [rec]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return (m < 10 ? "0" + m : "" + m) + ":" + (sec < 10 ? "0" + sec : "" + sec);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#050308] text-zinc-100">
      {/* header */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-violet-500/25">
        <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_currentColor] text-violet-400 animate-pulse" />
        <span className="text-sm font-bold tracking-[0.18em] uppercase text-zinc-200 truncate">Master Output</span>
        <span className="ml-auto text-[10px] font-medium tracking-wide uppercase text-zinc-600 truncate">terminal stage</span>
      </div>

      {/* body */}
      <div className="flex-1 flex items-stretch gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* VU meters */}
        <div className="flex-1 flex flex-col rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm p-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">Master VU</span>
            <span className="font-mono font-bold tracking-tight text-violet-200 drop-shadow-[0_0_6px_currentColor] text-[11px]">
              {(-40 + Math.round(levels[0] * 40))} dB
            </span>
          </div>
          <div className="flex-1 flex items-stretch gap-3 pt-2">
            <div className="flex flex-col items-center justify-end gap-1 w-[2.75rem]">
              <div className="w-[2.5rem] h-[9rem]">
                <LevelMeter levels={[levels[0]]} peak={[peak[0]]} clip={clip} orientation="vertical" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-600">L</span>
            </div>
            <div className="flex flex-col items-center justify-end gap-1 w-[2.75rem]">
              <div className="w-[2.5rem] h-[9rem]">
                <LevelMeter levels={[levels[1]]} peak={[peak[1]]} clip={clip} orientation="vertical" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-600">R</span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              {[0, -6, -12, -24, -40].map((d) => (
                <div key={"sc" + d} className="flex items-center gap-2">
                  <span className="h-px flex-1 bg-zinc-800" />
                  <span className="text-[10px] font-mono tracking-wide text-zinc-600">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Knobs */}
        <div className="flex-none flex flex-col rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm p-3 gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">Output Trim</span>
          <div className="flex-1 flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-[4.5rem] h-[4.5rem]">
                <Knob min={0} max={100} value={master} onChange={setMaster} mode="continuous" />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">Master</span>
              <span className="font-mono font-bold tracking-tight text-violet-200 drop-shadow-[0_0_6px_currentColor] text-[11px]">{master.toFixed(0)}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-[4.5rem] h-[4.5rem]">
                <Knob min={0} max={100} value={booth} onChange={setBooth} mode="continuous" />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">Booth</span>
              <span className="font-mono font-bold tracking-tight text-violet-200 drop-shadow-[0_0_6px_currentColor] text-[11px]">{booth.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Limiter + record */}
        <div className="flex-1 flex flex-col rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm p-3 gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-[#08060f] px-2 py-1.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
            <div className="w-[1.25rem] h-[1.25rem]">
              <Indicator active={clip} tone="danger" blink={clip} />
            </div>
            <span className={"text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors duration-150 " + (clip ? "text-rose-400" : "text-zinc-600")}>
              Limiter
            </span>
            <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-600">{clip ? "engaged" : "clear"}</span>
          </div>

          <div className="flex-1 flex items-stretch gap-3">
            <div className="flex-1 flex flex-col gap-2">
              <div className="w-full h-[3rem]">
                <PushButton mode="toggle" on={rec} onChange={setRec} tone="danger">
                  <span className="flex flex-col items-center leading-none">
                    <span>{rec ? "STOP" : "RECORD"}</span>
                    <span className="text-[0.62em] tracking-[0.2em] opacity-70">master</span>
                  </span>
                </PushButton>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[1rem] h-[1rem]">
                  <Indicator active={rec} tone="danger" blink={rec} />
                </div>
                <span className="text-[10px] font-medium tracking-wide uppercase text-zinc-600 truncate">
                  {rec ? "capturing 24bit / 48k" : "armed"}
                </span>
              </div>
            </div>
            <div className="flex-none flex flex-col gap-1 items-center justify-center">
              <div className="w-[7rem] h-[3rem]">
                <Readout value={fmt(elapsed)} unit="rec" />
              </div>
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">Elapsed</span>
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none flex items-center gap-3 px-3 bg-zinc-950/90 border-t border-zinc-800/80">
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">out · stereo xlr</span>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">mst {master.toFixed(0)}%</span>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">bth {booth.toFixed(0)}%</span>
        <span className={"ml-auto text-[10px] font-mono uppercase tracking-[0.14em] truncate " + (rec ? "text-rose-400 animate-pulse" : "text-zinc-600")}>
          {rec ? "● rec " + fmt(elapsed) : "idle"}
        </span>
      </div>
    </div>
  );
}