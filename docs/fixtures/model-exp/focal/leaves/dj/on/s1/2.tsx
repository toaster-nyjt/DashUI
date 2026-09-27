export default function GeneratedComponent() {
  // BUDGET height: header 3 + readouts 3.25 + gaps 1 + body(jog 20 + gap .5 + transport 3) 23.5 + padding .75 = 31.5 ≤ 41.6
  // BUDGET width: pad .75 + pads col 15 + gap .5 + center 26 + gap .5 + fader col 4.5 + pad .75 = 48 ≤ 52.0

  const DURATION = 312;
  const BASE_BPM = 126.0;

  const [playing, setPlaying] = useState(false);
  const [angle, setAngle] = useState(0);
  const [pos, setPos] = useState(18.4);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [touching, setTouching] = useState(false);
  const [cues, setCues] = useState<("empty" | "set" | "active")[]>([
    "set", "set", "empty", "set", "empty", "empty", "set", "empty",
  ]);
  const [timeMode, setTimeMode] = useState<"elapsed" | "remain">("elapsed");

  const rate = 1 + pitch / 100;
  const bpm = (BASE_BPM * rate).toFixed(2);

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      setPos((p) => {
        const n = p + 0.08 * rate;
        return n >= DURATION ? 0 : n;
      });
      setAngle((a) => a + (0.08 * rate) / 1.8);
    }, 80);
    return () => clearInterval(id);
  }, [playing, touching, rate]);

  const fmt = (s: number) => {
    const v = Math.max(0, Math.floor(s));
    return String(Math.floor(v / 60)).padStart(2, "0") + ":" + String(v % 60).padStart(2, "0");
  };

  const timeValue =
    timeMode === "elapsed" ? fmt(pos) : "-" + fmt(DURATION - pos);

  const firePad = (i: number) => {
    setCues((c) => {
      const n = [...c];
      n[i] = n[i] === "empty" ? "set" : "active";
      return n;
    });
    if (cues[i] !== "empty") setPos(8 + i * 26);
    setTimeout(() => {
      setCues((c) => {
        const n = [...c];
        if (n[i] === "active") n[i] = "set";
        return n;
      });
    }, 350);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#0a0b0f] text-amber-50 relative font-sans">
      <style>{`
        @keyframes dkbScan { 0%{transform:translateY(-100%)} 100%{transform:translateY(900%)} }
        @keyframes dkbPulse { 0%,100%{opacity:.25} 50%{opacity:.75} }
        @keyframes dkbGrid { 0%{background-position:0 0} 100%{background-position:0 28px} }
        @keyframes dkbBeat { 0%{transform:scale(1);opacity:.9} 70%{transform:scale(1.9);opacity:0} 100%{opacity:0} }
      `}</style>

      {/* ambient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(251,146,60,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(251,146,60,.08) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
          animation: "dkbGrid 3.2s linear infinite",
        }}
      />
      <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full blur-3xl bg-amber-500/20" />
      <div className="pointer-events-none absolute -left-20 bottom-0 w-72 h-72 rounded-full blur-3xl bg-cyan-500/10" />
      {playing && (
        <div
          className="pointer-events-none absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-amber-400/10 to-transparent"
          style={{ animation: "dkbScan 3.5s linear infinite" }}
        />
      )}

      {/* HEADER */}
      <div className="flex-none h-12 px-3 flex items-center gap-3 border-b border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent relative">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-black tracking-[0.4em] text-amber-400">DECK</span>
          <span className="text-2xl font-black leading-none text-amber-300 drop-shadow-[0_0_10px_rgba(251,146,60,.6)]">B</span>
        </div>
        <div className="h-5 w-px bg-amber-500/30" />
        <div className="flex items-center gap-2">
          <div className="w-[1.25rem] h-[1.25rem]">
            <StatusIndicator state={playing ? "active" : "pending"} blinking={playing} />
          </div>
          <span className="text-[10px] tracking-[0.25em] text-amber-200/70 font-semibold truncate">
            {playing ? "PLAYING" : "LOADED / CUED"}
          </span>
        </div>
        <div className="flex-1 min-w-0" />
        <div className="relative flex items-center">
          {playing && (
            <span
              className="absolute inset-0 rounded-full border border-amber-400"
              style={{ animation: "dkbBeat 0.95s ease-out infinite" }}
            />
          )}
          <span className="text-[10px] font-mono px-2 py-[3px] rounded-sm bg-amber-500/15 border border-amber-400/40 text-amber-200 tracking-widest">
            CH-B
          </span>
        </div>
      </div>

      {/* READOUT STRIP */}
      <div className="flex-none px-3 pt-2 pb-1 flex gap-2 items-stretch relative">
        <div className="flex-1 h-[3rem]">
          <TextReadout value="NEON CASCADE — EXTENDED MIX" placeholder="NO TRACK" />
        </div>
        <div className="w-[9rem] h-[3rem]">
          <TextReadout value={"AURELIA · " + bpm} />
        </div>
        <button
          onClick={() => setTimeMode(timeMode === "elapsed" ? "remain" : "elapsed")}
          className="w-[7rem] h-[3rem] transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          title="toggle elapsed / remain"
        >
          <TextReadout value={timeValue} />
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 px-3 pb-3 pt-1 flex gap-2 relative min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* LEFT: PADS + LOOP */}
        <div className="w-[15rem] flex flex-col gap-2">
          <div className="text-[9px] tracking-[0.32em] text-amber-400/70 font-bold">HOT CUES</div>
          <div className="grid grid-cols-4 gap-1.5">
            {cues.map((s, i) => (
              <div key={"pad-" + i} className="h-[2.6rem]">
                <HotCuePad
                  state={s}
                  onPress={() => firePad(i)}
                  onClear={() =>
                    setCues((c) => {
                      const n = [...c];
                      n[i] = "empty";
                      return n;
                    })
                  }
                >
                  <span className="font-black tracking-wider">{i + 1}</span>
                </HotCuePad>
              </div>
            ))}
          </div>

          <div className="text-[9px] tracking-[0.32em] text-cyan-400/70 font-bold mt-1">LOOP</div>
          <div className="flex gap-1.5">
            <div className="w-[5rem] h-[2.2rem]">
              <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
                <span className="font-black tracking-[0.15em]">LOOP</span>
              </ToggleButton>
            </div>
            <div className="w-[4rem] h-[2.2rem]">
              <PushButton onPress={() => setLoopLen(String(Math.max(1, Number(loopLen) / 2)))}>
                <span className="font-bold">1/2</span>
              </PushButton>
            </div>
            <div className="w-[4rem] h-[2.2rem]">
              <PushButton onPress={() => setLoopLen(String(Math.min(16, Number(loopLen) * 2)))}>
                <span className="font-bold">×2</span>
              </PushButton>
            </div>
          </div>
          <div className="h-[1.9rem]">
            <SegmentedSelector
              options={[
                { id: "1", label: "1" },
                { id: "2", label: "2" },
                { id: "4", label: "4" },
                { id: "8", label: "8" },
                { id: "16", label: "16" },
              ]}
              value={loopLen}
              onChange={setLoopLen}
            />
          </div>

          <div className="mt-auto flex items-center gap-2">
            <div className="w-[6.5rem] h-[2rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-black tracking-[0.12em]">KEYLOCK</span>
              </ToggleButton>
            </div>
            <div
              className={
                "flex-1 text-[9px] font-mono tracking-widest transition-colors duration-300 " +
                (keylock ? "text-cyan-300" : "text-amber-200/40")
              }
              style={keylock ? { animation: "dkbPulse 2s ease-in-out infinite" } : undefined}
            >
              KEY · 9A LOCKED
            </div>
          </div>
        </div>

        {/* CENTER: JOG + TRANSPORT */}
        <div className="flex-1 flex flex-col items-center justify-between gap-2">
          <div className="relative w-[20rem] h-[20rem]">
            <div
              className={
                "absolute -inset-3 rounded-full blur-2xl transition-opacity duration-500 " +
                (playing ? "bg-amber-500/25 opacity-100" : "bg-amber-500/10 opacity-60")
              }
            />
            <div className="relative w-full h-full">
              <JogWheel
                angle={angle}
                spinning={playing && !touching}
                onScrub={(d) => {
                  setAngle((a) => a + d);
                  setPos((p) => Math.max(0, Math.min(DURATION, p + d * 1.8)));
                }}
                onTouchChange={setTouching}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-[5.5rem] h-[2.8rem]">
              <PushButton onPress={() => { setPlaying(false); setPos(18.4); }} tone="neutral">
                <span className="font-black tracking-[0.2em]">CUE</span>
              </PushButton>
            </div>
            <div className="w-[7.5rem] h-[2.8rem]">
              <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                <span className="flex flex-col leading-tight">
                  <span className="font-black tracking-[0.18em]">{playing ? "PAUSE" : "PLAY"}</span>
                  <span className="text-[0.62em] tracking-[0.3em] opacity-70">DECK B</span>
                </span>
              </ToggleButton>
            </div>
            <div className="w-[5.5rem] h-[2.8rem]">
              <ToggleButton
                on={sync}
                onChange={(v) => { setSync(v); if (v) setPitch(0); }}
                tone="accent"
              >
                <span className="font-black tracking-[0.2em]">SYNC</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* RIGHT: PITCH FADER */}
        <div className="w-[5rem] flex flex-col items-center gap-2">
          <div className="text-[9px] tracking-[0.28em] text-amber-400/70 font-bold">PITCH</div>
          <div className="flex-1 w-[2.6rem] flex items-stretch">
            <Fader
              min={-8}
              max={8}
              value={pitch}
              onChange={(v) => { setPitch(v); if (v !== 0) setSync(false); }}
              orientation="vertical"
              detents={[0]}
            />
          </div>
          <div
            className={
              "w-full text-center font-mono text-[11px] py-1 rounded-sm border transition-colors duration-300 " +
              (pitch === 0
                ? "border-cyan-400/50 text-cyan-300 bg-cyan-400/10"
                : "border-amber-400/50 text-amber-300 bg-amber-400/10")
            }
          >
            {(pitch > 0 ? "+" : "") + pitch.toFixed(1) + "%"}
          </div>
          <div className="w-full text-center font-mono text-[10px] text-amber-200/60 tracking-wider">
            {bpm}
          </div>
        </div>
      </div>
    </div>
  );
}