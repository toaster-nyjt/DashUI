export default function GeneratedComponent() {
  // BUDGET height: header 3 + strip 2.25 + gap .5 + body(jog 16 / fader 16) + gap .5 + pads 3 + gap .5 + loop 2.5 + padding 1 = 29.25 ≤ 41.6
  // BUDGET width: pad .75 + pitch col 5 + gap .75 + jog 16 + gap .75 + transport 9 + pad .75 = 33 ≤ 52.0

  const DUR = 341;
  const BASE_BPM = 128;

  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(12.4);
  const [angle, setAngle] = useState(0);
  const [touching, setTouching] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [cues, setCues] = useState<Array<"empty" | "set" | "active">>(["set", "set", "empty", "empty"]);
  const [showRemain, setShowRemain] = useState(false);
  const [loaded] = useState(true);

  const rate = 1 + pitch / 100;
  const bpm = (BASE_BPM * rate).toFixed(2);

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      setPos((p) => {
        const n = p + 0.08 * rate;
        return n >= DUR ? 0 : n;
      });
      setAngle((a) => a + 0.08 * rate * 0.45);
    }, 80);
    return () => clearInterval(id);
  }, [playing, touching, rate]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    const cs = Math.floor((Math.abs(s) * 100) % 100);
    return (s < 0 ? "-" : "") + m + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0");
  };

  const cueTimes = [12.4, 88.2, 0, 0];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#08090c] text-zinc-200 font-sans relative">
      <style>{`
        @keyframes dkb-spin { to { transform: rotate(360deg); } }
        @keyframes dkb-pulse { 0%,100% { opacity:.25 } 50% { opacity:.85 } }
        @keyframes dkb-sweep { 0% { transform: translateX(-100%) } 100% { transform: translateX(300%) } }
      `}</style>

      {/* ambient */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{ backgroundImage: "linear-gradient(#f59e0b 1px,transparent 1px),linear-gradient(90deg,#f59e0b 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="pointer-events-none absolute -top-24 right-0 w-[26rem] h-[26rem] rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle,#f59e0b,transparent 65%)" }} />

      {/* HEADER */}
      <div className="flex-none h-12 px-3 flex items-center gap-3 border-b border-amber-500/25 bg-black/50 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.35em] text-amber-400">DECK</span>
          <span className="text-xl font-black leading-none text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">B</span>
        </div>
        <div className="w-[1.4rem] h-[1.4rem]">
          <StatusIndicator state={loaded ? "active" : "off"} blinking={playing} />
        </div>
        <div className="flex-1 h-[1.8rem]">
          <TextReadout value="NIGHTDRIVE (EXTENDED MIX)" placeholder="NO TRACK" />
        </div>
        <div className="hidden sm:block w-[9rem] h-[1.8rem]">
          <TextReadout value={"SOLAR UNIT · " + bpm} />
        </div>
      </div>

      {/* METER STRIP */}
      <div className="flex-none px-3 py-2 flex items-center gap-3 relative z-10">
        <button
          onClick={() => setShowRemain((v) => !v)}
          className="h-[2rem] w-[8.5rem] transition-transform hover:-translate-y-0.5 active:translate-y-0"
          title="Toggle elapsed / remaining"
        >
          <TextReadout value={showRemain ? fmt(pos - DUR) : fmt(pos)} />
        </button>
        <div className="flex-1 min-w-0 h-[0.5rem] relative overflow-hidden rounded-full bg-white/5 border border-amber-500/20">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-300 transition-[width] duration-100"
            style={{ width: (pos / DUR) * 100 + "%" }} />
          {playing && <div className="absolute inset-y-0 w-1/4 bg-white/20 blur-sm" style={{ animation: "dkb-sweep 2.4s linear infinite" }} />}
        </div>
        <span className="text-[10px] font-mono tracking-widest text-amber-400/70">{showRemain ? "REMAIN" : "ELAPSED"}</span>
      </div>

      {/* BODY */}
      <div className="flex-1 px-3 flex items-stretch gap-3 relative z-10 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* PITCH */}
        <div className="w-[5rem] flex flex-col items-center gap-2 py-1">
          <span className="text-[9px] font-bold tracking-[0.25em] text-amber-400/80">PITCH</span>
          <div className="w-[2.75rem] flex-1">
            <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" detents={[0]} />
          </div>
          <span className="text-[11px] font-mono text-amber-200">{(pitch > 0 ? "+" : "") + pitch.toFixed(1) + "%"}</span>
          <div className="w-[4.2rem] h-[1.9rem]">
            <ToggleButton on={keylock} onChange={setKeylock} tone="neutral">
              <span className="font-bold tracking-widest">KEY</span>
            </ToggleButton>
          </div>
        </div>

        {/* JOG */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute w-[19rem] h-[19rem] rounded-full border border-amber-500/15"
            style={{ animation: "dkb-spin 18s linear infinite" }} />
          <div className="absolute w-[21rem] h-[21rem] rounded-full border border-dashed border-amber-500/10" />
          <div className="w-[16rem] h-[16rem] relative">
            <JogWheel
              angle={angle}
              spinning={playing && !touching}
              onScrub={(d) => { setAngle((a) => a + d); setPos((p) => Math.max(0, Math.min(DUR, p + d * 2.2))); }}
              onTouchChange={setTouching}
            />
          </div>
          <span className="absolute bottom-0 text-[9px] font-mono tracking-[0.3em] text-amber-400/60"
            style={touching ? { animation: "dkb-pulse 0.7s ease-in-out infinite" } : undefined}>
            {touching ? "SCRATCH" : "VINYL MODE"}
          </span>
        </div>

        {/* TRANSPORT */}
        <div className="w-[9rem] flex flex-col gap-2 py-1">
          <div className="text-right leading-none">
            <div className="text-[9px] tracking-[0.3em] text-amber-400/70">BPM</div>
            <div className="text-2xl font-black text-amber-300 tabular-nums drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]">{bpm}</div>
          </div>
          <div className="h-[4rem]">
            <ToggleButton on={playing} onChange={setPlaying} tone="accent">
              <span className="flex flex-col items-center">
                <span className="text-[1.4em] leading-none">{playing ? "❚❚" : "▶"}</span>
                <span className="text-[0.6em] tracking-[0.3em] font-bold">{playing ? "PAUSE" : "PLAY"}</span>
              </span>
            </ToggleButton>
          </div>
          <div className="h-[2.6rem]">
            <PushButton onPress={() => { setPos(cueTimes[0]); setPlaying(false); }} tone="neutral">
              <span className="font-black tracking-[0.25em]">CUE</span>
            </PushButton>
          </div>
          <div className="h-[2.4rem]">
            <ToggleButton on={sync} onChange={setSync} tone="accent">
              <span className="font-black tracking-[0.25em]">SYNC</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* PADS + LOOP */}
      <div className="flex-none px-3 py-3 flex items-end gap-3 border-t border-amber-500/20 bg-black/40 relative z-10">
        <div className="flex-1">
          <div className="text-[9px] font-bold tracking-[0.3em] text-amber-400/70 mb-1.5">HOT CUES</div>
          <div className="flex gap-2">
            {cues.map((c, i) => (
              <div key={"cue-" + i} className="w-[4.5rem] h-[2.6rem]">
                <HotCuePad
                  state={c}
                  onPress={() => {
                    setCues((prev) => prev.map((s, j) => (j === i ? (s === "empty" ? "set" : "active") : s === "active" ? "set" : s)));
                    if (cueTimes[i]) setPos(cueTimes[i]);
                  }}
                  onClear={() => setCues((prev) => prev.map((s, j) => (j === i ? "empty" : s)))}
                >
                  <span className="font-black">{i + 1}</span>
                </HotCuePad>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[9px] font-bold tracking-[0.3em] text-amber-400/70 mb-1.5">LOOP</div>
          <div className="flex items-center gap-2">
            <div className="w-[4.5rem] h-[2.6rem]">
              <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
                <span className="font-black tracking-widest">LOOP</span>
              </ToggleButton>
            </div>
            <div className="w-[11rem] h-[2rem]">
              <SegmentedSelector
                options={[{ id: "1", label: "1" }, { id: "2", label: "2" }, { id: "4", label: "4" }, { id: "8", label: "8" }]}
                value={loopLen}
                onChange={setLoopLen}
                orientation="horizontal"
              />
            </div>
            <div className="w-[3.6rem] h-[2.6rem]">
              <PushButton onPress={() => setLoopLen((l) => String(Math.max(1, Number(l) / 2)))}>
                <span className="font-bold">½</span>
              </PushButton>
            </div>
            <div className="w-[3.6rem] h-[2.6rem]">
              <PushButton onPress={() => setLoopLen((l) => String(Math.min(8, Number(l) * 2)))}>
                <span className="font-bold">×2</span>
              </PushButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}