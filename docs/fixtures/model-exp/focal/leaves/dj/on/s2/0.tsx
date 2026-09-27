export default function GeneratedComponent() {
  // BUDGET height: header 3 + gap 0.5 + main 24 (jog 20 + gap 0.5 + transport 3.5) + gap 0.5 + bottom 13.6 = 41.6 ≤ 41.6
  // BUDGET width: left col 39.5 (jog 20 centered) + gap 0.5 + right col 11 + padding 1 = 52.0 ≤ 52.0

  const DURATION = 312;
  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(true);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [pos, setPos] = useState(41.5);
  const [angle, setAngle] = useState(0);
  const [touching, setTouching] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [cues, setCues] = useState<("empty" | "set" | "active")[]>(["set", "set", "empty", "empty"]);
  const [flash, setFlash] = useState(false);

  const baseBpm = 128.0;
  const bpm = baseBpm * (1 + pitch / 100);

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      const rate = 1 + pitch / 100;
      setPos((p) => (p + 0.06 * rate) % DURATION);
      setAngle((a) => a + (0.06 * rate) / 1.8);
    }, 60);
    return () => clearInterval(id);
  }, [playing, touching, pitch]);

  useEffect(() => {
    const id = setInterval(() => setFlash((f) => !f), 60000 / bpm / 2);
    return () => clearInterval(id);
  }, [bpm]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    const cs = Math.floor((Math.abs(s) * 100) % 100);
    return (s < 0 ? "-" : "") + m + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0");
  };

  const hitCue = (i: number) => {
    setCues((c) => c.map((s, j) => (j === i ? (s === "empty" ? "set" : "active") : s === "active" ? "set" : s)));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07080c] text-cyan-50 p-2 gap-2 relative font-sans">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #22d3ee22 1px, transparent 1px), linear-gradient(to bottom, #22d3ee22 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* HEADER */}
      <div className="flex-none h-[3rem] flex items-center gap-2 px-2 bg-gradient-to-r from-[#0d1117] via-[#0b1220] to-[#0d1117] border border-cyan-400/25 relative overflow-clip">
        <div
          className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"
          style={{ animation: "none", transform: "translateX(" + ((pos * 7) % 400 - 50) + "%)", transition: "transform 0.4s linear" }}
        />
        <div className="w-[1.25rem] h-[1.25rem] relative z-10">
          <StatusIndicator state="active" blinking={playing} />
        </div>
        <div className="flex flex-col justify-center relative z-10">
          <span className="text-[9px] tracking-[0.3em] text-cyan-400/70 leading-none">DECK</span>
          <span className="text-lg font-black leading-none text-cyan-300">A</span>
        </div>
        <div className="flex-1 h-[2rem] relative z-10">
          <TextReadout value="NEON CASCADE — EXTENDED MIX" placeholder="NO TRACK" />
        </div>
        <div className="w-[10rem] h-[2rem] relative z-10">
          <TextReadout value={"VELVET SIGNAL · " + bpm.toFixed(2) + " BPM"} />
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-none h-[24rem] flex gap-2">
        {/* LEFT */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 flex items-center justify-center relative">
            <div
              className="absolute rounded-full transition-all duration-500"
              style={{
                width: "21.5rem",
                height: "21.5rem",
                boxShadow: playing
                  ? "0 0 90px 10px rgba(34,211,238,0.22), inset 0 0 40px rgba(34,211,238,0.08)"
                  : "0 0 30px 2px rgba(34,211,238,0.07)",
                border: "1px solid rgba(34,211,238,0.18)",
              }}
            />
            <div
              className="absolute rounded-full border border-fuchsia-400/25"
              style={{
                width: "22.6rem",
                height: "22.6rem",
                transform: "scale(" + (flash && playing ? 1.012 : 1) + ")",
                transition: "transform 120ms ease-out",
              }}
            />
            <div className="h-[20rem] w-[20rem] relative">
              <JogWheel
                angle={angle}
                spinning={playing}
                onScrub={(d) => {
                  setAngle((a) => a + d);
                  setPos((p) => Math.max(0, Math.min(DURATION, p + d * 1.8)));
                }}
                onTouchChange={setTouching}
              />
            </div>
          </div>
          <div className="flex-none h-[3.5rem] flex items-stretch gap-2">
            <div className="w-[7rem]">
              <PushButton tone="accent" onPress={() => { setPos(41.5); setPlaying(false); }}>
                <span className="font-black tracking-[0.2em]">CUE</span>
              </PushButton>
            </div>
            <div className="flex-1">
              <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-black tracking-[0.25em]">{playing ? "PAUSE" : "PLAY"}</span>
                  <span className="text-[0.55em] tracking-[0.3em] opacity-70">TRANSPORT</span>
                </span>
              </ToggleButton>
            </div>
            <div className="w-[7rem]">
              <ToggleButton on={sync} onChange={setSync}>
                <span className="font-black tracking-[0.2em]">SYNC</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* RIGHT: PITCH */}
        <div className="w-[11rem] flex flex-col gap-2 bg-[#0a0d14] border border-fuchsia-400/20 p-2 relative overflow-clip">
          <div className="flex-none h-[2rem]">
            <TextReadout value={fmt(pos)} />
          </div>
          <div className="flex-none h-[2rem]">
            <TextReadout value={fmt(-(DURATION - pos))} />
          </div>
          <div className="flex-1 flex items-stretch justify-center gap-2 py-1">
            <div className="flex flex-col justify-between py-1 text-[9px] tracking-widest text-fuchsia-300/60 font-mono">
              <span>+8</span>
              <span>+4</span>
              <span className="text-cyan-300">0</span>
              <span>-4</span>
              <span>-8</span>
            </div>
            <div className="w-[3rem] h-full">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" detents={[0]} />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] tracking-[0.3em] text-fuchsia-300/70 [writing-mode:vertical-rl] rotate-180 font-bold">
                PITCH
              </span>
            </div>
          </div>
          <div className="flex-none text-center font-mono text-sm font-bold text-fuchsia-300 tracking-wider transition-colors">
            {(pitch >= 0 ? "+" : "") + pitch.toFixed(2) + "%"}
          </div>
          <div className="flex-none h-[2rem]">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-bold tracking-[0.2em]">KEYLOCK</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex flex-col gap-1 bg-[#0a0d14] border border-cyan-400/20 p-2">
          <span className="flex-none text-[9px] tracking-[0.35em] text-cyan-400/70 font-bold">HOT CUES</span>
          <div className="flex-1 grid grid-cols-4 gap-2">
            {cues.map((s, i) => (
              <div key={"cue-" + i} className="h-full">
                <HotCuePad state={s} onPress={() => hitCue(i)} onClear={() => setCues((c) => c.map((x, j) => (j === i ? "empty" : x)))}>
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-black">{i + 1}</span>
                    <span className="text-[0.5em] tracking-[0.2em] opacity-70">{["INTRO", "DROP", "—", "—"][i]}</span>
                  </span>
                </HotCuePad>
              </div>
            ))}
          </div>
        </div>

        <div className="w-[17rem] flex flex-col gap-1 bg-[#0a0d14] border border-fuchsia-400/20 p-2">
          <span className="flex-none text-[9px] tracking-[0.35em] text-fuchsia-400/70 font-bold">LOOP</span>
          <div className="flex-1 flex items-stretch gap-2">
            <div className="w-[6.5rem]">
              <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-black tracking-[0.2em]">LOOP</span>
                  <span className="text-[0.55em] tracking-[0.25em] opacity-70">{loopLen} BEAT</span>
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <SegmentedSelector
                options={[
                  { id: "1", label: "1" },
                  { id: "2", label: "2" },
                  { id: "4", label: "4" },
                  { id: "8", label: "8" },
                ]}
                value={loopLen}
                onChange={setLoopLen}
                orientation="vertical"
              />
            </div>
            <div className="w-[4.5rem]">
              <PushButton onPress={() => setLoopOn(true)}>
                <span className="font-bold tracking-[0.15em]">RELOOP</span>
              </PushButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}