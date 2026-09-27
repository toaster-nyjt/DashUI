export default function GeneratedComponent() {
  // BUDGET height: header 3 + readouts 3.25 + main 19 + pads 6 + loop 2.25 + footer 1.75 + gaps 1.5 + pad 1 = 37.75 ≤ 41.6
  // BUDGET width: transport 9 + gap .75 + fader 4.5 + gap .75 + jog 19 + padding 1 = 35 ≤ 52.0

  const DURATION = 372;
  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(true);
  const [keylock, setKeylock] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [pitch, setPitch] = useState(0);
  const [pos, setPos] = useState(48.2);
  const [angle, setAngle] = useState(0);
  const [touching, setTouching] = useState(false);
  const [cues, setCues] = useState<("empty" | "set" | "active")[]>([
    "set", "set", "empty", "set", "empty", "empty", "set", "empty",
  ]);
  const [loaded] = useState(true);

  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + pitch / 100);

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      const dt = 0.06 * (1 + pitch / 100);
      setPos((p) => (p + dt > DURATION ? 0 : p + dt));
      setAngle((a) => a + dt * 0.55);
    }, 60);
    return () => clearInterval(id);
  }, [playing, touching, pitch]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    return (s < 0 ? "-" : "") + m + ":" + String(sec).padStart(2, "0");
  };

  const scrub = (d: number) => {
    setAngle((a) => a + d);
    setPos((p) => Math.max(0, Math.min(DURATION, p + d * 1.8)));
  };

  const hitCue = (i: number) => {
    setCues((c) => c.map((s, j) => (j === i ? (s === "empty" ? "set" : "active") : s === "active" ? "set" : s)));
    if (cues[i] !== "empty") setPos(20 + i * 34);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#0a0a0c] text-zinc-200 font-sans">
      {/* header */}
      <div className="flex-none h-12 flex items-center gap-3 px-3 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.4em] text-amber-400">DECK</span>
          <span className="text-xl font-black leading-none text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">B</span>
        </div>
        <div className="h-5 w-px bg-amber-500/30" />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <div className="h-1.5 flex-1 min-w-0 overflow-clip rounded-full bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-200"
              style={{ width: (pos / DURATION) * 100 + "%" }}
            />
          </div>
        </div>
        <div className="w-[1.25rem] h-[1.25rem]">
          <StatusIndicator state={loaded ? "active" : "off"} blinking={playing} />
        </div>
      </div>

      {/* readouts */}
      <div className="flex-none flex gap-2 px-3 pt-2">
        <div className="flex-1 h-[3.25rem]">
          <TextReadout value="NEON MERIDIAN — Extended Mix" placeholder="NO TRACK" />
        </div>
        <div className="w-[11rem] h-[3.25rem]">
          <TextReadout value={"KAVARI  ·  " + bpm.toFixed(1) + " BPM"} />
        </div>
        <div className="w-[9rem] h-[3.25rem]">
          <TextReadout value={fmt(pos) + " / " + fmt(-(DURATION - pos))} />
        </div>
      </div>

      {/* main */}
      <div className="flex-1 flex gap-3 px-3 py-2">
        {/* transport */}
        <div className="w-[8.5rem] flex flex-col gap-2">
          <div className="h-[5.5rem]">
            <ToggleButton on={playing} onChange={setPlaying} tone="accent">
              <span className="flex flex-col items-center font-black tracking-[0.2em]">
                <span>{playing ? "PAUSE" : "PLAY"}</span>
                <span className="text-[0.6em] tracking-[0.35em] opacity-70">TRANSPORT</span>
              </span>
            </ToggleButton>
          </div>
          <div className="h-[3.5rem]">
            <PushButton onPress={() => { setPos(20); setPlaying(false); }} tone="neutral">
              <span className="font-black tracking-[0.25em]">CUE</span>
            </PushButton>
          </div>
          <div className="h-[3rem]">
            <ToggleButton on={sync} onChange={setSync} tone="accent">
              <span className="font-black tracking-[0.25em]">SYNC</span>
            </ToggleButton>
          </div>
          <div className="h-[3rem]">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-black tracking-[0.2em]">KEYLOCK</span>
            </ToggleButton>
          </div>
        </div>

        {/* pitch fader */}
        <div className="w-[5rem] flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] py-2">
          <span className="text-[9px] font-black tracking-[0.3em] text-amber-400/80">PITCH</span>
          <div className="flex-1 w-[2.4rem] flex justify-center">
            <Fader
              min={-8}
              max={8}
              value={pitch}
              onChange={setPitch}
              orientation="vertical"
              detents={[0]}
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-300 tabular-nums">
            {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
          </span>
        </div>

        {/* jog */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative h-full aspect-square">
            <div
              className={
                "absolute -inset-1 rounded-full bg-amber-500/20 blur-2xl transition-opacity duration-500 " +
                (playing ? "opacity-100 animate-pulse" : "opacity-0")
              }
            />
            <div className="relative h-full w-full">
              <JogWheel
                angle={angle}
                spinning={playing && !touching}
                onScrub={scrub}
                onTouchChange={setTouching}
              />
            </div>
          </div>
        </div>
      </div>

      {/* pads */}
      <div className="flex-none px-3 grid grid-cols-4 gap-2">
        {cues.map((s, i) => (
          <div key={"pad-" + i} className="h-[2.9rem]">
            <HotCuePad
              state={s}
              onPress={() => hitCue(i)}
              onClear={() => setCues((c) => c.map((v, j) => (j === i ? "empty" : v)))}
            >
              <span className="font-black tracking-[0.2em]">{"C" + (i + 1)}</span>
            </HotCuePad>
          </div>
        ))}
      </div>

      {/* loop row */}
      <div className="flex-none flex items-center gap-2 px-3 py-2">
        <div className="w-[6.5rem] h-[2.25rem]">
          <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
            <span className="font-black tracking-[0.25em]">LOOP</span>
          </ToggleButton>
        </div>
        <div className="flex-1 h-[2.25rem]">
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
            orientation="horizontal"
          />
        </div>
        <div className="w-[4rem] h-[2.25rem]">
          <PushButton onPress={() => setLoopLen((l) => String(Math.max(1, Number(l) / 2)))}>
            <span className="font-black">÷2</span>
          </PushButton>
        </div>
        <div className="w-[4rem] h-[2.25rem]">
          <PushButton onPress={() => setLoopLen((l) => String(Math.min(16, Number(l) * 2)))}>
            <span className="font-black">×2</span>
          </PushButton>
        </div>
      </div>

      {/* footer */}
      <div className="flex-none h-7 flex items-center justify-between px-3 border-t border-white/10 text-[9px] font-mono tracking-[0.25em] text-zinc-500">
        <span className="truncate">CH-B · {sync ? "SYNCED" : "FREE"} · {keylock ? "KEYLOCK" : "VARISPEED"}</span>
        <span className={"truncate " + (touching ? "text-amber-300" : "")}>{touching ? "SCRATCH" : playing ? "PLAYING" : "CUED"}</span>
      </div>
    </div>
  );
}