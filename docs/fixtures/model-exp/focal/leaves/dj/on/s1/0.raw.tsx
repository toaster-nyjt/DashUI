export default function GeneratedComponent() {
  // BUDGET height: header 3.5 + gap 0.75 + main 26.35 (jog block) + gap 0.75 + pads 4.5 + gap 0.5 + loop 2.5 + padding 1.5 = 40.35 ≤ 41.6
  // BUDGET width: pad 1.5 + jog column 34 + gap 0.75 + fader column 13 = 49.25 ≤ 52.0

  const DURATION = 312;
  const BASE_BPM = 126.0;

  const [loaded] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [angle, setAngle] = useState(0);
  const [position, setPosition] = useState(41.5);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(true);
  const [keylock, setKeylock] = useState(false);
  const [touching, setTouching] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [cues, setCues] = useState<Array<"empty" | "set">>(["set", "set", "set", "empty"]);
  const [flash, setFlash] = useState(0);

  const rate = 1 + pitch / 100;
  const bpm = BASE_BPM * rate;

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      setPosition((p) => (p + 0.05 * rate) % DURATION);
      setAngle((a) => a + (0.05 * rate) / 1.8);
    }, 50);
    return () => clearInterval(id);
  }, [playing, touching, rate]);

  useEffect(() => {
    const id = setInterval(() => setFlash((f) => f + 1), 60000 / bpm);
    return () => clearInterval(id);
  }, [bpm]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.max(0, s) / 60);
    const sec = Math.floor(Math.max(0, s) % 60);
    const cs = Math.floor((Math.max(0, s) * 100) % 100);
    return (
      String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const scrub = (d: number) => {
    setAngle((a) => a + d);
    setPosition((p) => Math.min(DURATION, Math.max(0, p + d * 1.8)));
  };

  const hitCue = (i: number) => {
    setCues((c) => {
      if (c[i] === "empty") {
        const n = [...c];
        n[i] = "set";
        return n;
      }
      return c;
    });
    setActiveCue(i);
    setPosition([8.2, 41.5, 96.0, 164.0][i]);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07090d] text-cyan-50 relative font-[system-ui]">
      {/* ambient */}
      <div
        className="absolute inset-0 opacity-[0.16] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.35) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        className="absolute -left-24 top-1/3 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-500"
        style={{ background: "radial-gradient(circle,rgba(34,211,238,.28),transparent 70%)", opacity: playing ? 1 : 0.4 }}
      />
      <div
        className="absolute right-0 -bottom-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,rgba(217,70,239,.22),transparent 70%)" }}
      />

      {/* HEADER */}
      <div className="flex-none h-[3.5rem] px-3 flex items-center gap-2 border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/10 via-transparent to-fuchsia-500/10 relative">
        <div className="w-[1.25rem] h-[1.25rem]">
          <StatusIndicator state={loaded ? "active" : "off"} blinking={playing} />
        </div>
        <span className="text-[0.6rem] tracking-[0.3em] text-cyan-300/80 font-bold">DECK&nbsp;A</span>
        <div className="flex-1 h-[2.1rem]">
          <TextReadout value="NEON CASCADE — EXTENDED MIX" placeholder="NO TRACK" />
        </div>
        <div className="w-[11rem] h-[2.1rem]">
          <TextReadout value={"VOLTA · " + bpm.toFixed(2) + " BPM"} />
        </div>
        <div className="w-[8.5rem] h-[2.1rem]">
          <TextReadout value={fmt(position)} />
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex gap-3 px-3 pt-3 pb-2 relative">
        {/* JOG COLUMN */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex-1 flex items-center justify-center relative">
            <div
              className="absolute w-[24rem] h-[24rem] rounded-full border border-cyan-400/20 transition-transform duration-300"
              style={{ transform: "scale(" + (playing ? 1.02 : 0.98) + ")" }}
            />
            <div
              key={flash}
              className="absolute w-[22rem] h-[22rem] rounded-full border-2 border-fuchsia-400/40 animate-ping"
              style={{ animationDuration: "900ms", opacity: playing ? 0.35 : 0 }}
            />
            <div className="h-full aspect-square relative">
              <JogWheel
                angle={angle}
                spinning={playing && !touching}
                onScrub={scrub}
                onTouchChange={setTouching}
              />
            </div>
          </div>
          <div className="flex-none h-[3.6rem] flex gap-2">
            <div className="flex-1 h-full">
              <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                <span className="font-black tracking-[0.25em]">{playing ? "PAUSE" : "PLAY"}</span>
              </ToggleButton>
            </div>
            <div className="flex-1 h-full">
              <PushButton onPress={() => { setPosition(8.2); setActiveCue(0); }} tone="danger">
                <span className="font-black tracking-[0.25em]">CUE</span>
              </PushButton>
            </div>
            <div className="flex-1 h-full">
              <ToggleButton on={sync} onChange={setSync} tone="accent">
                <span className="font-black tracking-[0.25em]">SYNC</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* PITCH COLUMN */}
        <div className="w-[12.5rem] flex flex-col gap-2 border border-cyan-400/20 rounded-lg bg-black/40 p-2 backdrop-blur-sm">
          <div className="flex-none flex items-baseline justify-between">
            <span className="text-[0.55rem] tracking-[0.28em] text-cyan-300/70 font-bold">PITCH</span>
            <span
              className="text-[0.95rem] font-black tabular-nums transition-colors duration-200"
              style={{ color: pitch === 0 ? "#67e8f9" : pitch > 0 ? "#f0abfc" : "#7dd3fc" }}
            >
              {(pitch > 0 ? "+" : "") + pitch.toFixed(2) + "%"}
            </span>
          </div>
          <div className="flex-1 flex items-stretch justify-center gap-2">
            <div className="w-[4.5rem] h-full">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => setPitch(Math.round(v * 20) / 20)}
                orientation="vertical"
                detents={[-8, -4, 0, 4, 8]}
              />
            </div>
            <div className="w-[4rem] h-full flex flex-col justify-between py-1">
              {[8, 4, 0, -4, -8].map((t) => (
                <div key={t} className="flex items-center gap-1">
                  <div className="h-px w-3 bg-cyan-400/40" />
                  <span className="text-[0.5rem] tabular-nums text-cyan-200/50">{(t > 0 ? "+" : "") + t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-none h-[2.4rem]">
            <ToggleButton on={keylock} onChange={setKeylock} tone="neutral">
              <span className="font-bold tracking-[0.2em]">KEYLOCK</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* PADS + LOOP */}
      <div className="flex-none px-3 pb-3 flex flex-col gap-2 relative">
        <div className="grid grid-cols-4 gap-2 h-[4.6rem]">
          {cues.map((s, i) => (
            <div key={i} className="h-full">
              <HotCuePad
                state={activeCue === i && s !== "empty" ? "active" : s}
                onPress={() => hitCue(i)}
                onClear={() =>
                  setCues((c) => {
                    const n = [...c];
                    n[i] = "empty";
                    return n;
                  })
                }
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-black">{"CUE " + (i + 1)}</span>
                  <span className="text-[0.6em] tracking-[0.2em] opacity-70">
                    {s === "empty" ? "EMPTY" : fmt([8.2, 41.5, 96.0, 164.0][i]).slice(0, 5)}
                  </span>
                </span>
              </HotCuePad>
            </div>
          ))}
        </div>
        <div className="h-[2.6rem] flex gap-2 items-stretch">
          <div className="w-[7rem] h-full">
            <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
              <span className="font-black tracking-[0.2em]">LOOP</span>
            </ToggleButton>
          </div>
          <div className="flex-1 h-full">
            <SegmentedSelector
              options={[
                { id: "0.5", label: "1/2" },
                { id: "1", label: "1" },
                { id: "2", label: "2" },
                { id: "4", label: "4" },
                { id: "8", label: "8" },
                { id: "16", label: "16" },
              ]}
              value={loopLen}
              onChange={setLoopLen}
              orientation="horizontal"
            />
          </div>
          <div className="w-[5.5rem] h-full">
            <PushButton onPress={() => setLoopLen((l) => String(Math.max(0.5, parseFloat(l) / 2)))}>
              <span className="font-black">÷2</span>
            </PushButton>
          </div>
          <div className="w-[5.5rem] h-full">
            <PushButton onPress={() => setLoopLen((l) => String(Math.min(16, parseFloat(l) * 2)))}>
              <span className="font-black">×2</span>
            </PushButton>
          </div>
        </div>
      </div>
    </div>
  );
}