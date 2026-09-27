export default function GeneratedComponent() {
  // BUDGET height: header 2.75 + readouts 3.25 + gap .5 + jogrow 17 + gap .5 + pads 3.5 + gap .5 + loop 2.5 + padding 1.5 = 32.0 ≤ 41.6
  // BUDGET width: pad 1.5 + jog 17 + gap .75 + controls 14 + gap .75 + fader col 4.5 = 38.5 ≤ 52.0

  const DURATION = 274;
  const BASE_BPM = 126;

  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [angle, setAngle] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [touching, setTouching] = useState(false);
  const [cuePoint, setCuePoint] = useState(12.5);
  const [cues, setCues] = useState([
    { id: "A", state: "set", time: 12.5 },
    { id: "B", state: "set", time: 68.0 },
    { id: "C", state: "empty", time: 0 },
    { id: "D", state: "empty", time: 0 },
  ]);

  const rate = 1 + pitch / 100;
  const bpm = BASE_BPM * rate;

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      setPos((p) => {
        let n = p + 0.06 * rate;
        if (loopOn) {
          const len = (parseFloat(loopLen) * 60) / bpm;
          if (n > cuePoint + len) n = cuePoint;
        }
        return n >= DURATION ? 0 : n;
      });
      setAngle((a) => a + 0.06 * rate * 0.55);
    }, 60);
    return () => clearInterval(id);
  }, [playing, touching, rate, loopOn, loopLen, bpm, cuePoint]);

  const fmt = (s) => {
    const m = Math.floor(Math.max(0, s) / 60);
    const sec = Math.floor(Math.max(0, s) % 60);
    const cs = Math.floor((Math.max(0, s) * 100) % 100);
    return (
      String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const label = "text-[9px] uppercase tracking-[0.22em] text-cyan-300/50 font-semibold";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#06080b] text-cyan-50 font-sans relative">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 55% at 22% 48%, rgba(34,224,255,0.13), transparent 70%), radial-gradient(45% 40% at 95% 8%, rgba(255,46,150,0.10), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,224,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(34,224,255,0.25) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* HEADER */}
      <div className="flex-none h-11 px-4 flex items-center gap-3 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-transparent relative">
        <span className="text-[13px] font-black tracking-[0.35em] text-cyan-200">DECK A</span>
        <span className="h-[2px] flex-1 min-w-0 bg-gradient-to-r from-cyan-400/60 via-cyan-400/10 to-transparent" />
        <span className={label}>{playing ? "PLAYING" : "PAUSED"}</span>
        <div className="w-[1.35rem] h-[1.35rem]">
          <StatusIndicator state={playing ? "active" : "pending"} blinking={playing} />
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-3 relative">
        {/* READOUT STRIP */}
        <div className="flex-none flex gap-2 h-[3.25rem]">
          <div className="flex-1 flex flex-col justify-center">
            <span className={label}>Track</span>
            <div className="w-full h-[2rem]">
              <TextReadout value="NEON CASCADE — EXTENDED MIX" placeholder="NO TRACK" />
            </div>
          </div>
          <div className="w-[11rem] flex flex-col justify-center">
            <span className={label}>Artist / BPM</span>
            <div className="w-full h-[2rem]">
              <TextReadout value={"VELVET AXIS · " + bpm.toFixed(2)} />
            </div>
          </div>
          <div className="w-[9.5rem] flex flex-col justify-center">
            <span className={label}>{"Elapsed / -Rem"}</span>
            <div className="w-full h-[2rem]">
              <TextReadout value={fmt(pos) + " / -" + fmt(DURATION - pos)} />
            </div>
          </div>
        </div>

        {/* MAIN ROW */}
        <div className="flex-1 flex gap-3 items-stretch">
          {/* JOG */}
          <div className="w-[16.5rem] flex flex-col items-center justify-center gap-1.5">
            <div
              className="w-[15rem] h-[15rem] rounded-full p-[6px] transition-all duration-500"
              style={{
                boxShadow: playing
                  ? "0 0 0 1px rgba(34,224,255,0.35), 0 0 42px rgba(34,224,255,0.28)"
                  : "0 0 0 1px rgba(34,224,255,0.14)",
              }}
            >
              <JogWheel
                angle={angle}
                spinning={playing && !touching}
                onScrub={(d) => {
                  setAngle((a) => a + d);
                  setPos((p) => Math.min(DURATION, Math.max(0, p + d * 1.8)));
                }}
                onTouchChange={setTouching}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={label}>{touching ? "SCRATCH" : "VINYL"}</span>
              <span className="text-[10px] font-mono text-cyan-300/70">
                {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
              </span>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex-1 flex flex-col justify-center gap-2.5">
            <div className="flex gap-2">
              <div className="flex-1 h-[3.25rem]">
                <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                  <span className="font-black tracking-[0.2em]">{playing ? "PAUSE" : "PLAY"}</span>
                </ToggleButton>
              </div>
              <div className="w-[7rem] h-[3.25rem]">
                <PushButton
                  onPress={() => {
                    setPos(cuePoint);
                    setPlaying(false);
                  }}
                  onRelease={() => {}}
                  tone="danger"
                >
                  <span className="font-black tracking-[0.2em]">CUE</span>
                </PushButton>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-[2.5rem]">
                <ToggleButton on={sync} onChange={setSync} tone="accent">
                  <span className="font-bold tracking-[0.22em]">SYNC</span>
                </ToggleButton>
              </div>
              <div className="flex-1 h-[2.5rem]">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-bold tracking-[0.22em]">KEYLOCK</span>
                </ToggleButton>
              </div>
              <div className="w-[5.5rem] h-[2.5rem]">
                <PushButton onPress={() => setCuePoint(pos)}>
                  <span className="flex flex-col leading-tight font-bold tracking-widest">
                    <span>SET</span>
                    <span className="text-[0.7em] opacity-70">CUE</span>
                  </span>
                </PushButton>
              </div>
            </div>

            {/* mini transport meterline */}
            <div className="h-[2.25rem] rounded-md border border-cyan-400/20 bg-cyan-400/[0.04] px-3 flex items-center gap-2 overflow-clip">
              <span className={label}>POS</span>
              <div className="flex-1 min-w-0 h-[6px] rounded-full bg-cyan-400/10 relative overflow-clip">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400/60 to-cyan-200 transition-[width] duration-100"
                  style={{ width: (pos / DURATION) * 100 + "%" }}
                />
              </div>
              <span className="text-[10px] font-mono text-cyan-200/80">
                {Math.round((pos / DURATION) * 100) + "%"}
              </span>
            </div>
          </div>

          {/* PITCH FADER */}
          <div className="w-[4.5rem] flex flex-col items-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.03] py-2">
            <span className={label}>PITCH</span>
            <div className="w-[2.5rem] h-[11rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={setPitch}
                orientation="vertical"
                detents={[0]}
              />
            </div>
            <span className="text-[10px] font-mono text-cyan-200/80">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="flex-none">
          <div className="flex items-center gap-2 mb-1">
            <span className={label}>Hot Cues</span>
            <span className="h-px flex-1 min-w-0 bg-cyan-400/15" />
          </div>
          <div className="grid grid-cols-4 gap-2 h-[3.25rem]">
            {cues.map((c, i) => (
              <HotCuePad
                key={c.id}
                state={c.state === "set" && Math.abs(pos - c.time) < 0.5 ? "active" : c.state}
                onPress={() => {
                  if (c.state === "empty") {
                    setCues((prev) =>
                      prev.map((x, j) => (j === i ? { ...x, state: "set", time: pos } : x))
                    );
                  } else {
                    setPos(c.time);
                    setCuePoint(c.time);
                  }
                }}
                onClear={() =>
                  setCues((prev) => prev.map((x, j) => (j === i ? { ...x, state: "empty", time: 0 } : x)))
                }
              >
                <span className="flex flex-col leading-tight items-center font-black tracking-widest">
                  <span>{c.id}</span>
                  <span className="text-[0.62em] font-mono opacity-70">
                    {c.state === "empty" ? "—" : fmt(c.time).slice(0, 5)}
                  </span>
                </span>
              </HotCuePad>
            ))}
          </div>
        </div>

        {/* LOOP */}
        <div className="flex-none flex items-center gap-2 h-[2.5rem]">
          <div className="w-[6.5rem] h-[2.25rem]">
            <ToggleButton
              on={loopOn}
              onChange={(v) => {
                setLoopOn(v);
                if (v) setCuePoint(pos);
              }}
              tone="accent"
            >
              <span className="font-bold tracking-[0.2em]">LOOP</span>
            </ToggleButton>
          </div>
          <div className="flex-1 h-[2.25rem]">
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
          <div className="w-[6.5rem] h-[2.25rem]">
            <PushButton
              onPress={() => {
                setCuePoint(pos);
                setLoopOn(true);
              }}
            >
              <span className="font-bold tracking-[0.18em]">RELOOP</span>
            </PushButton>
          </div>
        </div>
      </div>
    </div>
  );
}