export default function GeneratedComponent() {
  // BUDGET height: header 2.5 + readouts 2.5 + gap .75 + jog 17 + gap .75 + transport 3 + gap .75 + pads 4 + gap .5 + loop 2.25 + padding 1.5 = 35.5 ≤ 41.6
  // BUDGET width: pad 0.75 + deck column 34 + gap .75 + rail 11 + pad .75 = 47.25 ≤ 52.0

  const DURATION = 312;
  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(true);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [pos, setPos] = useState(48.6);
  const [angle, setAngle] = useState(0);
  const [touching, setTouching] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [cueStates, setCueStates] = useState<Array<"empty" | "set" | "active">>([
    "set", "set", "empty", "set", "empty", "empty", "set", "empty",
  ]);
  const [activePad, setActivePad] = useState<number | null>(null);

  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + pitch / 100);
  const rate = 1 + pitch / 100;

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      setPos((p) => {
        const n = p + 0.1 * rate;
        return n >= DURATION ? 0 : n;
      });
      setAngle((a) => a + (0.1 * rate) / 1.8);
    }, 100);
    return () => clearInterval(id);
  }, [playing, touching, rate]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    const cs = Math.floor((Math.abs(s) * 100) % 100);
    return (
      (s < 0 ? "-" : "") +
      m + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const pct = Math.min(100, (pos / DURATION) * 100);

  const padLabels = ["CUE 1", "CUE 2", "CUE 3", "CUE 4", "CUE 5", "CUE 6", "CUE 7", "CUE 8"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#08090c] text-zinc-200 font-mono select-none">
      {/* chrome header */}
      <div className="flex-none h-10 flex items-center gap-3 px-3 border-b border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-[0.95rem] font-bold tracking-[0.3em] text-cyan-300">DECK A</span>
          <span className="text-[0.6rem] tracking-[0.25em] text-zinc-500">CH-1 / PLAYER</span>
        </div>
        <div className="flex-1 h-[2px] bg-gradient-to-r from-cyan-400/40 to-transparent overflow-clip">
          <div
            className="h-full bg-cyan-300 transition-all duration-200 ease-linear"
            style={{ width: pct + "%" }}
          />
        </div>
        <span
          className={
            "text-[0.6rem] tracking-[0.2em] transition-colors " +
            (playing ? "text-cyan-300 animate-pulse" : "text-zinc-600")
          }
        >
          {playing ? "● LIVE" : "○ STANDBY"}
        </span>
        <div className="w-[1.25rem] h-[1.25rem]">
          <StatusIndicator state={playing ? "active" : "pending"} blinking={playing} />
        </div>
      </div>

      {/* readouts */}
      <div className="flex-none flex gap-2 px-3 pt-3">
        <div className="flex-1 h-[2.5rem]">
          <TextReadout value="NOCTURNE DRIVE — EXTENDED MIX" placeholder="NO TRACK" />
        </div>
        <div className="w-[11rem] h-[2.5rem]">
          <TextReadout value={"KAI ØSTER · " + bpm.toFixed(2) + " BPM"} />
        </div>
        <div className="w-[9rem] h-[2.5rem]">
          <TextReadout value={fmt(pos) + " / " + fmt(pos - DURATION)} />
        </div>
      </div>

      {/* main body */}
      <div className="flex-1 flex gap-3 px-3 py-3">
        {/* deck column */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="relative w-[17rem] h-[17rem] flex items-center justify-center">
            <div
              className={
                "absolute inset-[-0.5rem] rounded-full blur-xl transition-opacity duration-500 " +
                (playing ? "opacity-60" : "opacity-15")
              }
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(34,211,238,0.5), rgba(168,85,247,0.35), rgba(34,211,238,0.5))",
                animation: "spin 6s linear infinite",
              }}
            />
            <div
              className={
                "absolute inset-[-1.1rem] rounded-full border border-cyan-400/25 transition-transform duration-500 " +
                (touching ? "scale-105 border-fuchsia-400/60" : "scale-100")
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
            <div className="pointer-events-none absolute bottom-[-0.15rem] left-1/2 -translate-x-1/2 text-[0.55rem] tracking-[0.3em] text-cyan-300/70">
              {touching ? "SCRATCH" : "VINYL"}
            </div>
          </div>

          <div className="flex items-stretch gap-2">
            <div className="w-[8rem] h-[3rem]">
              <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-bold tracking-[0.2em]">{playing ? "PAUSE" : "PLAY"}</span>
                  <span className="text-[0.55em] tracking-[0.3em] opacity-70">TRANSPORT</span>
                </span>
              </ToggleButton>
            </div>
            <div className="w-[6rem] h-[3rem]">
              <PushButton
                onPress={() => {
                  setPos(48.6);
                  setPlaying(false);
                }}
                tone="neutral"
              >
                <span className="font-bold tracking-[0.25em]">CUE</span>
              </PushButton>
            </div>
            <div className="w-[6rem] h-[3rem]">
              <ToggleButton on={sync} onChange={setSync} tone="accent">
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-bold tracking-[0.2em]">SYNC</span>
                  <span className="text-[0.55em] tracking-[0.25em] opacity-70">MASTER</span>
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* pitch rail */}
        <div className="w-[11rem] flex flex-col gap-2">
          <div className="flex-none flex items-baseline justify-between">
            <span className="text-[0.6rem] tracking-[0.25em] text-zinc-500">PITCH</span>
            <span
              className={
                "text-[0.85rem] font-bold tabular-nums transition-colors " +
                (Math.abs(pitch) < 0.01 ? "text-cyan-300" : "text-fuchsia-300")
              }
            >
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(2)}%
            </span>
          </div>
          <div className="flex-1 flex gap-2 items-stretch">
            <div className="w-[3rem] h-full">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={setPitch}
                orientation="vertical"
                detents={[0]}
              />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              {[8, 4, 0, -4, -8].map((t) => (
                <div key={"tick" + t} className="flex items-center gap-1">
                  <span className="h-px w-3 bg-zinc-700" />
                  <span className="text-[0.55rem] tabular-nums text-zinc-600">
                    {(t > 0 ? "+" : "") + t}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-none h-[2.25rem] w-full">
            <ToggleButton on={keylock} onChange={setKeylock} tone="neutral">
              <span className="font-bold tracking-[0.2em]">KEYLOCK</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* hot cues */}
      <div className="flex-none px-3 grid grid-cols-4 gap-2">
        {padLabels.map((label, i) => (
          <div key={label} className="h-[3.75rem]">
            <HotCuePad
              state={activePad === i ? "active" : cueStates[i]}
              onPress={() => {
                setActivePad(i);
                setCueStates((s) => {
                  const n = [...s];
                  if (n[i] === "empty") n[i] = "set";
                  return n;
                });
                setTimeout(() => setActivePad(null), 220);
              }}
              onClear={() =>
                setCueStates((s) => {
                  const n = [...s];
                  n[i] = "empty";
                  return n;
                })
              }
            >
              <span className="flex flex-col items-center leading-tight">
                <span className="font-bold tracking-[0.15em]">{label}</span>
                <span className="text-[0.55em] tracking-[0.2em] opacity-70">
                  {cueStates[i] === "empty" ? "- -" : String(i + 1) + ":0" + ((i % 4) + 1)}
                </span>
              </span>
            </HotCuePad>
          </div>
        ))}
      </div>

      {/* loop strip */}
      <div className="flex-none flex items-stretch gap-2 px-3 py-3">
        <div className="w-[6rem] h-[2.25rem]">
          <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
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
        <div className="w-[4rem] h-[2.25rem]">
          <PushButton onPress={() => setLoopLen((l) => String(Math.max(0.5, parseFloat(l) / 2)))}>
            <span className="font-bold">÷2</span>
          </PushButton>
        </div>
        <div className="w-[4rem] h-[2.25rem]">
          <PushButton onPress={() => setLoopLen((l) => String(Math.min(16, parseFloat(l) * 2)))}>
            <span className="font-bold">×2</span>
          </PushButton>
        </div>
      </div>

      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}