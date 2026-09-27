export default function GeneratedComponent() {
  // BUDGET height: header 2.5 + readouts 2.4 + main(jog 15) + transport 2.5 + pads 2×2.5=5 + loop 2 + gaps/pad 2.6 = 32.0 ≤ 41.6
  // BUDGET width: pad 1 + jogcol 40 + gap 0.75 + rail 4 + pad 1 = 46.75 ≤ 52.0

  const DURATION = 312;
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(true);
  const [keylock, setKeylock] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [pitch, setPitch] = useState(0);
  const [pos, setPos] = useState(74.5);
  const [angle, setAngle] = useState(0);
  const [touching, setTouching] = useState(false);
  const [cues, setCues] = useState<Array<"empty" | "set" | "active">>([
    "set", "set", "empty", "set", "empty", "empty", "set", "empty",
  ]);

  const baseBpm = 126.0;
  const bpm = (baseBpm * (1 + pitch / 100)).toFixed(2);

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      setPos((p) => {
        const n = p + 0.08 * (1 + pitch / 100);
        return n >= DURATION ? 0 : n;
      });
      setAngle((a) => a + 0.022 * (1 + pitch / 100));
    }, 80);
    return () => clearInterval(id);
  }, [playing, pitch, touching]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.max(0, s) / 60);
    const sec = Math.floor(Math.max(0, s) % 60);
    const cs = Math.floor((Math.max(0, s) * 100) % 100);
    return (
      String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const hitCue = (i: number) => {
    setCues((c) => c.map((s, k) => (k === i ? (s === "empty" ? "set" : "active") : s === "active" ? "set" : s)));
    setPos(20 + i * 28);
  };

  const pitchPct = ((pitch + 8) / 16) * 100;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#08080b] text-zinc-200 font-sans relative">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full blur-3xl transition-opacity duration-700"
        style={{ background: "radial-gradient(circle,#ff7a1855,transparent 70%)", opacity: playing ? 0.9 : 0.35 }}
      />

      {/* HEADER */}
      <header className="flex-none h-10 flex items-center gap-3 px-4 border-b border-white/10 bg-gradient-to-r from-[#141419] to-[#0b0b0f] relative">
        <span className="text-[10px] font-black tracking-[0.35em] text-[#ff7a18]">DECK</span>
        <span className="text-xl font-black leading-none text-white">B</span>
        <div className="h-4 w-px bg-white/15" />
        <span className="text-[10px] tracking-[0.3em] text-zinc-500 truncate min-w-0 flex-1">CHANNEL&nbsp;B&nbsp;/&nbsp;PLAYER</span>
        <span className="text-[10px] tracking-[0.25em] text-zinc-500">LOAD</span>
        <div className="w-[1.25rem] h-[1.25rem]">
          <StatusIndicator state={playing ? "active" : "pending"} blinking={playing} />
        </div>
      </header>

      {/* READOUTS */}
      <div className="flex-none px-3 pt-3 flex gap-2 items-stretch">
        <div className="flex-1 h-[2.6rem]">
          <TextReadout value="NIGHT SIGNAL — EXTENDED MIX" placeholder="NO TRACK" />
        </div>
        <div className="w-[13rem] h-[2.6rem]">
          <TextReadout value={"VELVET AXIS · " + bpm + " BPM"} />
        </div>
        <div className="w-[11rem] h-[2.6rem]">
          <TextReadout value={fmt(pos) + "  -" + fmt(DURATION - pos)} />
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex gap-3 px-3 py-3 items-stretch relative min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* JOG SIDE */}
        <div className="flex-1 flex items-center justify-center relative">
          <div
            className="absolute inset-0 rounded-2xl border border-white/5 bg-[#0d0d12]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg,#ffffff06 0 1px,transparent 1px 22px),repeating-linear-gradient(0deg,#ffffff06 0 1px,transparent 1px 22px)",
            }}
          />
          <div className="relative w-[15.5rem] h-[15.5rem]">
            <div
              className="absolute -inset-3 rounded-full blur-2xl transition-all duration-500"
              style={{
                background: "radial-gradient(circle,#ff7a1844,transparent 65%)",
                opacity: playing ? 1 : 0.3,
                transform: playing ? "scale(1.04)" : "scale(0.96)",
              }}
            />
            <div className="relative w-full h-full">
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
        </div>

        {/* PITCH RAIL */}
        <div className="w-[7.5rem] flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0d12] px-2 py-3">
          <div className="text-[9px] tracking-[0.3em] text-zinc-500">TEMPO</div>
          <div
            className="text-[13px] font-black tabular-nums transition-colors duration-300"
            style={{ color: pitch === 0 ? "#52e0c4" : "#ff7a18" }}
          >
            {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
          </div>
          <div className="flex-1 w-[2.6rem] flex justify-center py-1">
            <Fader
              min={-8}
              max={8}
              value={pitch}
              onChange={setPitch}
              orientation="vertical"
              detents={[-8, -4, 0, 4, 8]}
            />
          </div>
          <div className="w-full h-[1.9rem]">
            <ToggleButton on={keylock} onChange={setKeylock} tone="accent">
              <span className="font-black tracking-[0.15em]">KEY</span>
            </ToggleButton>
          </div>
          <div className="w-full h-[1.9rem]">
            <ToggleButton on={synced} onChange={setSynced} tone="accent">
              <span className="font-black tracking-[0.15em]">SYNC</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* TRANSPORT + PADS + LOOP */}
      <div className="flex-none px-3 pb-3 flex gap-3 items-stretch">
        {/* transport */}
        <div className="w-[9.5rem] flex flex-col gap-2">
          <div className="h-[2.6rem]">
            <ToggleButton on={playing} onChange={setPlaying} tone="accent">
              <span className="font-black tracking-[0.2em]">{playing ? "PAUSE" : "PLAY"}</span>
            </ToggleButton>
          </div>
          <div className="h-[2.6rem]">
            <PushButton
              onPress={() => {
                setPos(20);
                setAngle(0);
              }}
              tone="danger"
            >
              <span className="font-black tracking-[0.2em]">CUE</span>
            </PushButton>
          </div>
        </div>

        {/* pads */}
        <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-2">
          {cues.map((s, i) => (
            <div key={"pad-" + i} className="h-[2.6rem]">
              <HotCuePad
                state={s}
                onPress={() => hitCue(i)}
                onClear={() => setCues((c) => c.map((v, k) => (k === i ? "empty" : v)))}
              >
                <span className="font-black tracking-[0.1em]">{i + 1}</span>
              </HotCuePad>
            </div>
          ))}
        </div>

        {/* loop */}
        <div className="w-[12rem] flex flex-col gap-2">
          <div className="h-[2.6rem]">
            <SegmentedSelector
              options={[
                { id: "1", label: "1" },
                { id: "2", label: "2" },
                { id: "4", label: "4" },
                { id: "8", label: "8" },
              ]}
              value={loopLen}
              onChange={setLoopLen}
            />
          </div>
          <div className="h-[2.6rem] flex gap-2">
            <div className="flex-1">
              <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
                <span className="font-black tracking-[0.12em]">LOOP</span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <PushButton onPress={() => setLoopLen(String(Math.max(1, Number(loopLen) / 2)))}>
                <span className="font-black tracking-[0.12em]">½×</span>
              </PushButton>
            </div>
          </div>
        </div>
      </div>

      {/* pitch ribbon footer */}
      <div className="flex-none h-1 w-full bg-white/5 relative overflow-clip">
        <div
          className="absolute top-0 bottom-0 w-px bg-[#52e0c4] transition-all duration-200"
          style={{ left: pitchPct + "%" }}
        />
        <div
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#ff7a18] to-[#ff7a18]/10 transition-all duration-150"
          style={{ width: (pos / DURATION) * 100 + "%" }}
        />
      </div>
    </div>
  );
}