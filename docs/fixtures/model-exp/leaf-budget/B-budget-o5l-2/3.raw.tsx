export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 0.75 + meta 3 + gap 0.75 + main 15 (jog) + transport 2 + gap + pads/loop 8.5 + pad 0.75 + footer 1.75 = ~35.5 ≤ 41.6
  // BUDGET width: pad 0.75 + jog col 15 + gap 0.75 + center 30 + gap 0.75 + fader col 3.25 + pad 0.75 = 52.0 ≤ 52.0

  const DURATION = 312;
  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [tempo, setTempo] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState(46.8);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [scrub, setScrub] = useState(0);
  const [armed, setArmed] = useState<number[]>([0, 1, 3]);
  const [lastCue, setLastCue] = useState("—");

  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + tempo / 100);
  const rate = 1 + tempo / 100;

  useEffect(() => {
    const id = setInterval(() => {
      setRotation((r) => r + (playing ? 5.4 * rate : 0) + scrub * 4);
      if (playing) setPosition((p) => (p + 0.06 * rate) % DURATION);
      setScrub((s) => (Math.abs(s) < 0.02 ? 0 : s * 0.85));
    }, 60);
    return () => clearInterval(id);
  }, [playing, rate, scrub]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    const cs = Math.floor((Math.abs(s) * 100) % 100);
    return (
      (s < 0 ? "-" : "") +
      String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const cueLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* header */}
      <div className="h-9 flex-none px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className={"h-2 w-2 rounded-full transition-all duration-500 " + (playing ? "bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.8)]" : "bg-neutral-600")} />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Deck B</span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-teal-300">
          {playing ? "PLAYING" : "CUED"} · {rate.toFixed(3)}x
        </span>
      </div>

      {/* body */}
      <div className="flex-1 p-3 flex flex-col gap-3">
        {/* meta strip */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">Track</span>
            <div className="h-[2.4rem] w-full">
              <Readout value="NOCTURNE DRIVE — Kaito Vex" placeholder="NO TRACK" />
            </div>
          </div>
          <div className="w-[7rem] flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">BPM</span>
            <div className="h-[2.4rem] w-full">
              <Readout value={bpm.toFixed(2)} />
            </div>
          </div>
          <div className="w-[7rem] flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">Elapsed</span>
            <div className="h-[2.4rem] w-full">
              <Readout value={fmt(position)} />
            </div>
          </div>
          <div className="w-[7rem] flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">Remain</span>
            <div className="h-[2.4rem] w-full">
              <Readout value={fmt(-(DURATION - position))} />
            </div>
          </div>
        </div>

        {/* main */}
        <div className="flex-1 flex items-stretch gap-3">
          {/* jog + transport */}
          <div className="w-[15rem] flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
            <div className="flex-1 flex items-center justify-center">
              <div
                className={"h-[11.5rem] w-[11.5rem] rounded-full transition-all duration-500 " + (playing ? "shadow-[0_0_28px_rgba(45,212,191,0.4)]" : "shadow-lg shadow-black/50")}
              >
                <JogWheel
                  rotation={rotation}
                  spinning={playing}
                  onScrub={(v) => setScrub(v)}
                  onRotate={(d) => setPosition((p) => Math.max(0, Math.min(DURATION, p + d * 1.8)))}
                />
              </div>
            </div>
            <div className="flex-none flex items-stretch gap-2">
              <div className="w-[4.2rem] h-[2.6rem]">
                <PushButton tone="accent" onPress={() => { setPlaying(false); setPosition(0); setLastCue("CUE"); }}>
                  <span className="font-mono font-semibold tracking-wider">CUE</span>
                </PushButton>
              </div>
              <div className="flex-1 h-[2.6rem]">
                <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                  <span className="font-mono font-semibold tracking-wider">{playing ? "PAUSE" : "PLAY"}</span>
                </ToggleButton>
              </div>
              <div className="w-[3.6rem] h-[2.6rem]">
                <ToggleButton on={sync} onChange={setSync} tone="neutral">
                  <span className="font-mono font-semibold tracking-wider">SYNC</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* center: pads + loop */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60 flex flex-col gap-2">
              <div className="flex-none flex items-baseline justify-between">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Hot Cues</span>
                <span className="font-mono text-[10px] tracking-wide text-teal-300">LAST · {lastCue}</span>
              </div>
              <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-2">
                {cueLabels.map((l, i) => (
                  <div key={"cue-" + i} className="w-full h-full">
                    <CuePad
                      armed={armed.includes(i)}
                      onPress={() => { setLastCue(l); if (armed.includes(i)) setPosition(i * 21.5); else setArmed((a) => [...a, i]); }}
                      onAltPress={() => setArmed((a) => a.filter((x) => x !== i))}
                    >
                      <span className="flex flex-col items-center leading-none">
                        <span className="font-mono font-bold tracking-wider">{l}</span>
                        <span className="text-[0.55em] tracking-widest uppercase opacity-70">
                          {armed.includes(i) ? fmt(i * 21.5).slice(0, 5) : "SET"}
                        </span>
                      </span>
                    </CuePad>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-none rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60 flex items-end gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">Beats</span>
                <div className="h-[3rem] w-[3rem]">
                  <Knob
                    value={loopBeats}
                    min={0.25}
                    max={32}
                    mode="stepped"
                    steps={[0.25, 0.5, 1, 2, 4, 8, 16, 32]}
                    onChange={(v) => setLoopBeats(v)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">Length</span>
                <div className="h-[2.2rem] w-[6rem]">
                  <Readout value={loopBeats + " BT · " + ((loopBeats * 60) / bpm).toFixed(2) + "s"} />
                </div>
              </div>
              <div className="flex-1 flex items-end gap-2">
                <div className="flex-1 h-[2.2rem]">
                  <PushButton onPress={() => { setLoopActive(true); setLastCue("LOOP IN"); }}>
                    <span className="font-mono font-semibold tracking-wider">IN</span>
                  </PushButton>
                </div>
                <div className="flex-1 h-[2.2rem]">
                  <PushButton onPress={() => { setLoopActive(true); setLastCue("LOOP OUT"); }}>
                    <span className="font-mono font-semibold tracking-wider">OUT</span>
                  </PushButton>
                </div>
                <div className="flex-1 h-[2.2rem]">
                  <PushButton tone="danger" onPress={() => { setLoopActive(false); setLastCue("EXIT"); }}>
                    <span className="font-mono font-semibold tracking-wider">EXIT</span>
                  </PushButton>
                </div>
              </div>
            </div>
          </div>

          {/* tempo column */}
          <div className="w-[5.5rem] rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60 flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400">Tempo</span>
            <span className="font-mono font-bold tracking-tight text-amber-300 text-xs drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {(tempo >= 0 ? "+" : "") + tempo.toFixed(2) + "%"}
            </span>
            <div className="flex-1 w-[2.6rem] flex items-stretch justify-center">
              <Fader
                value={tempo}
                min={-8}
                max={8}
                bipolar
                orientation="vertical"
                detents={[-8, -4, 0, 4, 8]}
                onChange={setTempo}
              />
            </div>
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">Key</span>
            <div className="h-[1.6rem] w-[3rem]">
              <ToggleSwitch on={keylock} onChange={setKeylock} />
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          CH-B · 44.1kHz · KEYLOCK {keylock ? "ON" : "OFF"} · {loopActive ? loopBeats + "BT LOOP" : "NO LOOP"}
        </span>
        <span className={"font-mono text-[10px] tracking-wide " + (sync ? "text-teal-300" : "text-neutral-500")}>
          {sync ? "SYNCED TO MASTER" : "FREE TEMPO"}
        </span>
      </div>
    </div>
  );
}