export default function GeneratedComponent() {
  const DURATION = 312;
  const BASE_BPM = 126;

  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(64.2);
  const [rotation, setRotation] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [cues, setCues] = useState<boolean[]>([true, true, false, true, false, false, true, false]);
  const [lastAction, setLastAction] = useState("DECK READY");

  const rate = 1 + tempo / 100;
  const bpm = BASE_BPM * rate;

  useEffect(() => {
    const id = setInterval(() => {
      setRotation((r) => (r + (playing ? 4.2 * rate : 0)) % 360);
      if (playing) {
        setPosition((p) => {
          const n = p + 0.06 * rate;
          return n >= DURATION ? 0 : n;
        });
      }
    }, 60);
    return () => clearInterval(id);
  }, [playing, rate]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    const cs = Math.floor((Math.abs(s) * 100) % 100);
    return (
      (s < 0 ? "-" : "") +
      String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const loopSeconds = (60 / bpm) * loopBeats;

  const cueLabels = ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* Header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-2 w-2 rounded-full transition-all duration-500 " +
              (playing
                ? "bg-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.9)] animate-pulse"
                : "bg-neutral-600")
            }
          />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Deck B · Right Player
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-teal-300/80">
          {playing ? "PLAYING" : "CUED"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Displays */}
        <div className="flex gap-3 items-stretch">
          <div className="flex-1 h-[2.75rem]">
            <Readout value="NOCTURNE DRIVE — Ayla Sørens" placeholder="NO TRACK" />
          </div>
          <div className="w-[7rem] h-[2.75rem]">
            <Readout value={bpm.toFixed(2) + " BPM"} />
          </div>
          <div className="w-[7.5rem] h-[2.75rem]">
            <Readout value={fmt(position)} />
          </div>
          <div className="w-[7.5rem] h-[2.75rem]">
            <Readout value={fmt(position - DURATION)} />
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex gap-3">
          {/* Platter + transport */}
          <div className="w-[20rem] flex flex-col gap-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
            <div className="flex-1 flex items-center justify-center">
              <div
                className={
                  "w-[16.5rem] h-[16.5rem] rounded-full transition-all duration-500 " +
                  (playing ? "shadow-[0_0_16px_rgba(45,212,191,0.4)]" : "shadow-lg shadow-black/50")
                }
              >
                <JogWheel
                  rotation={rotation}
                  spinning={playing}
                  onScrub={(v) => setLastAction("SCRUB " + v.toFixed(2) + "x")}
                  onRotate={(d) => {
                    setPosition((p) => Math.max(0, Math.min(DURATION, p + d * 1.8)));
                    setRotation((r) => (r + d * 360) % 360);
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2 items-stretch">
              <div className="flex-1 h-[3.25rem]">
                <ToggleButton
                  on={playing}
                  onChange={(v) => {
                    setPlaying(v);
                    setLastAction(v ? "PLAY" : "PAUSE");
                  }}
                  tone="accent"
                >
                  <span className="font-mono font-semibold tracking-wider uppercase">
                    {playing ? "❚❚ Pause" : "▶ Play"}
                  </span>
                </ToggleButton>
              </div>
              <div className="w-[7rem] h-[3.25rem]">
                <PushButton
                  tone="neutral"
                  onPress={() => {
                    setPosition(0);
                    setPlaying(false);
                    setLastAction("CUE ▸ 00:00.00");
                  }}
                >
                  <span className="font-mono font-semibold tracking-wider uppercase">Cue</span>
                </PushButton>
              </div>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex-1 flex gap-3">
            <div className="flex-1 flex flex-col gap-3">
              {/* Hot cues */}
              <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
                <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                  Hot Cues
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {cueLabels.map((l, i) => (
                    <div key={"cue-" + i} className="h-[3.1rem]">
                      <CuePad
                        armed={cues[i]}
                        onPress={() => {
                          if (cues[i]) {
                            setPosition(i * 28 + 4);
                            setLastAction("JUMP " + l);
                          } else {
                            setCues((c) => c.map((v, j) => (j === i ? true : v)));
                            setLastAction("SET " + l);
                          }
                        }}
                        onAltPress={() => {
                          setCues((c) => c.map((v, j) => (j === i ? false : v)));
                          setLastAction("CLEAR " + l);
                        }}
                      >
                        <span className="font-mono font-semibold tracking-wider">{l}</span>
                      </CuePad>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loop */}
              <div className="flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
                <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                  Loop
                </span>
                <div className="flex gap-2 items-center">
                  <div className="w-[3.25rem] h-[3.25rem]">
                    <Knob
                      value={loopBeats}
                      min={0.25}
                      max={32}
                      mode="stepped"
                      steps={[0.25, 0.5, 1, 2, 4, 8, 16, 32]}
                      onChange={(v) => {
                        setLoopBeats(v);
                        setLastAction("LOOP " + v + " BEAT");
                      }}
                    />
                  </div>
                  <div className="flex-1 h-[2.4rem]">
                    <Readout value={loopBeats + " BT / " + loopSeconds.toFixed(2) + "s"} />
                  </div>
                  <div className="w-[4.5rem] h-[2.4rem]">
                    <PushButton
                      tone="neutral"
                      onPress={() => {
                        setLoopOn(true);
                        setLastAction("LOOP IN @ " + fmt(position));
                      }}
                    >
                      <span className="font-mono font-semibold tracking-wider uppercase">In</span>
                    </PushButton>
                  </div>
                  <div className="w-[4.5rem] h-[2.4rem]">
                    <PushButton
                      tone={loopOn ? "accent" : "neutral"}
                      onPress={() => {
                        setLoopOn((l) => !l);
                        setLastAction(loopOn ? "LOOP EXIT" : "LOOP OUT");
                      }}
                    >
                      <span className="font-mono font-semibold tracking-wider uppercase">Out</span>
                    </PushButton>
                  </div>
                </div>
              </div>

              {/* Sync / keylock */}
              <div className="flex-1 flex gap-3 items-stretch rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                    Beat Sync
                  </span>
                  <div className="h-[2.6rem]">
                    <ToggleButton
                      on={sync}
                      onChange={(v) => {
                        setSync(v);
                        if (v) setTempo(2.4);
                        setLastAction(v ? "SYNC LOCK" : "SYNC OFF");
                      }}
                      tone="accent"
                    >
                      <span className="font-mono font-semibold tracking-wider uppercase">Sync</span>
                    </ToggleButton>
                  </div>
                </div>
                <div className="w-[7rem] flex flex-col gap-2">
                  <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                    Keylock
                  </span>
                  <div className="h-[2.6rem] flex items-center">
                    <div className="w-[4rem] h-[2rem]">
                      <ToggleSwitch
                        on={keylock}
                        onChange={(v) => {
                          setKeylock(v);
                          setLastAction(v ? "KEYLOCK ON" : "KEYLOCK OFF");
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tempo fader */}
            <div className="w-[6.25rem] flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
                Tempo
              </span>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-[3rem] h-[16rem]">
                  <Fader
                    value={tempo}
                    min={-8}
                    max={8}
                    bipolar
                    orientation="vertical"
                    detents={[-8, -4, 0, 4, 8]}
                    onChange={(v) => {
                      setTempo(v);
                      setSync(false);
                      setLastAction("PITCH " + (v >= 0 ? "+" : "") + v.toFixed(2) + "%");
                    }}
                  />
                </div>
              </div>
              <span className="font-mono font-bold tracking-tight text-amber-300 text-sm drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {(tempo >= 0 ? "+" : "") + tempo.toFixed(2) + "%"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          CH-B · {keylock ? "KEYLOCK" : "VARISPEED"} · {loopOn ? "LOOP " + loopBeats + "BT" : "NO LOOP"}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-teal-300 truncate">{lastAction}</span>
      </div>
    </div>
  );
}