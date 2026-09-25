export default function GeneratedComponent() {
  const DURATION = 372;
  const BASE_BPM = 124.0;

  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopLen, setLoopLen] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [armedCues, setArmedCues] = useState<number[]>([0, 2, 5]);
  const [lastCue, setLastCue] = useState<number | null>(null);
  const [beat, setBeat] = useState(0);

  const rate = 1 + tempo / 100;
  const bpm = BASE_BPM * rate;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setElapsed((e) => (e + 0.1 * rate) % DURATION);
      setRotation((r) => (r + 0.1 * rate * 200) % 360);
    }, 100);
    return () => clearInterval(id);
  }, [playing, rate]);

  useEffect(() => {
    if (!playing) return;
    const ms = (60 / bpm) * 1000;
    const id = setInterval(() => setBeat((b) => (b + 1) % 4), ms);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const fmt = (s: number, neg?: boolean) => {
    const v = Math.max(0, Math.floor(s));
    const m = Math.floor(v / 60);
    const sec = v % 60;
    return (neg ? "-" : "") + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
  };

  const nudge = (v: number) => setElapsed((e) => Math.min(DURATION, Math.max(0, e + v * 0.35)));

  const toggleCue = (i: number) => {
    setLastCue(i);
    setArmedCues((a) => (a.includes(i) ? a : [...a, i]));
    setElapsed(8 + i * 24);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span
          className={
            "h-2 w-2 rounded-full transition-all duration-100 " +
            (playing && beat === 0
              ? "bg-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.9)] scale-125"
              : "bg-teal-500/40")
          }
        />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Deck B</span>
        <span className="text-[10px] font-mono tracking-widest uppercase text-teal-300/70">Right Player</span>
        <div className="flex-1 min-w-0 flex items-center justify-end gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={"bt-" + i}
              className={
                "h-1.5 rounded-full transition-all duration-100 " +
                (playing && beat === i ? "w-5 bg-teal-300/90" : "w-2.5 bg-neutral-700/70")
              }
            />
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-3 p-3">
        {/* READOUTS */}
        <div className="h-[3.25rem] flex-none flex gap-3">
          <div className="flex-1 min-w-0 h-full">
            <Readout value="NOCTURNE DRIFT — Selva Kane" placeholder="NO TRACK" />
          </div>
          <div className="w-[7.5rem] h-full">
            <Readout value={bpm.toFixed(2) + " BPM"} />
          </div>
          <div className="w-[10.5rem] h-full">
            <Readout value={fmt(elapsed) + "  " + fmt(DURATION - elapsed, true)} />
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex gap-3">
          {/* JOG */}
          <div className="w-[19.5rem] flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
            <div
              className={
                "w-[15.5rem] h-[15.5rem] rounded-full transition-shadow duration-500 ease-in-out " +
                (playing ? "shadow-[0_0_28px_rgba(45,212,191,0.35)]" : "shadow-none")
              }
            >
              <JogWheel
                rotation={rotation}
                spinning={playing}
                onScrub={(v) => nudge(v)}
                onRotate={(d) => setRotation((r) => r + d * 360)}
              />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-widest uppercase text-neutral-400">
              <span>Platter</span>
              <span className={playing ? "text-teal-300" : "text-neutral-600"}>
                {playing ? "vinyl · run" : "vinyl · hold"}
              </span>
            </div>
          </div>

          {/* CENTER */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {/* transport */}
            <div className="h-[4rem] flex-none flex gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
              <div className="flex-1 h-full">
                <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                  <span className="font-mono font-semibold tracking-wider uppercase">
                    {playing ? "PAUSE" : "PLAY"}
                  </span>
                </ToggleButton>
              </div>
              <div className="w-[5.5rem] h-full">
                <PushButton onPress={() => { setElapsed(0); setPlaying(false); }} tone="neutral">
                  <span className="font-mono font-semibold tracking-wider uppercase">CUE</span>
                </PushButton>
              </div>
              <div className="w-[5rem] h-full">
                <ToggleButton on={sync} onChange={setSync} tone="accent">
                  <span className="font-mono font-semibold tracking-wider uppercase">SYNC</span>
                </ToggleButton>
              </div>
              <div className="w-[5rem] h-full flex flex-col items-center justify-center gap-1">
                <div className="w-[3.25rem] h-[1.6rem]">
                  <ToggleSwitch on={keylock} onChange={setKeylock} />
                </div>
                <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
                  Keylock
                </span>
              </div>
            </div>

            {/* hot cues */}
            <div className="flex-1 flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Hot Cues</span>
                <span className="font-mono text-[10px] tracking-wide text-teal-300/80">
                  {lastCue === null ? "—" : "PAD " + (lastCue + 1)}
                </span>
              </div>
              <div className="grid grid-cols-4 grid-rows-2 gap-2 flex-1">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <CuePad
                    key={"cp-" + i}
                    armed={armedCues.includes(i)}
                    onPress={() => toggleCue(i)}
                    onAltPress={() => setArmedCues((a) => a.filter((x) => x !== i))}
                  >
                    <span className="flex flex-col items-center leading-tight">
                      <span className="font-mono font-semibold tracking-wider">{i + 1}</span>
                      <span className="text-[0.62em] tracking-widest uppercase opacity-70">
                        {armedCues.includes(i) ? "SET" : "···"}
                      </span>
                    </span>
                  </CuePad>
                ))}
              </div>
            </div>
          </div>

          {/* TEMPO */}
          <div className="w-[6rem] flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
              Tempo
            </span>
            <div className="w-[2.6rem] flex-1">
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
            <span className="font-mono font-bold tracking-tight text-teal-300 text-[11px] drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
              {(tempo >= 0 ? "+" : "") + tempo.toFixed(2) + "%"}
            </span>
          </div>
        </div>

        {/* LOOP BAR */}
        <div className="h-[5rem] flex-none flex items-center gap-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="flex flex-col items-center gap-1">
            <div className="w-[3.2rem] h-[3.2rem]">
              <Knob
                value={loopLen}
                min={0}
                max={5}
                mode="stepped"
                steps={[0, 1, 2, 3, 4, 5]}
                onChange={(v) => setLoopLen(Math.pow(2, Math.round(v)) / 2 >= 0 ? Math.round(v) : 0)}
              />
            </div>
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">
              Length
            </span>
          </div>
          <div className="w-[7rem] h-[2.6rem]">
            <Readout value={Math.pow(2, loopLen) + " BEAT" + (loopLen > 0 ? "S" : "")} />
          </div>
          <div className="flex-1 min-w-0 flex gap-2">
            <div className="flex-1 h-[2.6rem]">
              <PushButton onPress={() => setLoopActive(true)}>
                <span className="font-mono font-semibold tracking-wider uppercase">In</span>
              </PushButton>
            </div>
            <div className="flex-1 h-[2.6rem]">
              <PushButton onPress={() => setLoopActive(true)} tone="accent">
                <span className="font-mono font-semibold tracking-wider uppercase">Out</span>
              </PushButton>
            </div>
            <div className="flex-1 h-[2.6rem]">
              <PushButton onPress={() => setLoopActive(false)} tone="danger">
                <span className="font-mono font-semibold tracking-wider uppercase">Exit</span>
              </PushButton>
            </div>
            <div className="flex-1 h-[2.6rem]">
              <PushButton onPress={() => setLoopLen((l) => Math.max(0, l - 1))}>
                <span className="font-mono font-semibold tracking-wider uppercase">1/2×</span>
              </PushButton>
            </div>
            <div className="flex-1 h-[2.6rem]">
              <PushButton onPress={() => setLoopLen((l) => Math.min(5, l + 1))}>
                <span className="font-mono font-semibold tracking-wider uppercase">2×</span>
              </PushButton>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center gap-4 px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">CH-B · OUT</span>
        <span className={"font-mono text-[10px] tracking-wide " + (loopActive ? "text-teal-300" : "text-neutral-500")}>
          LOOP {loopActive ? "ACTIVE " + Math.pow(2, loopLen) + "B" : "OFF"}
        </span>
        <span className={"font-mono text-[10px] tracking-wide " + (sync ? "text-teal-300" : "text-neutral-500")}>
          SYNC {sync ? "LOCKED" : "FREE"}
        </span>
        <span className={"font-mono text-[10px] tracking-wide " + (keylock ? "text-teal-300" : "text-neutral-500")}>
          KEY {keylock ? "HELD" : "VARI"}
        </span>
        <span className="flex-1 min-w-0 truncate text-right font-mono text-[10px] tracking-wide text-neutral-500">
          {playing ? "STREAMING TO WAVEFORM LANE B" : "STANDBY"}
        </span>
      </div>
    </div>
  );
}