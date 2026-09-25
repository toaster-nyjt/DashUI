export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + top row 24.0 + gap 0.75 + pads 5.5 + gap 0.75 + loop row 2.75 + footer 1.75 = 39.25 ≤ 41.6
  // BUDGET width: pad 1.5 + deck block 36.0 + gap 0.75 + tempo col 11.0 = 49.25 ≤ 52.0

  const DURATION = 254;
  const BASE_BPM = 124.0;

  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pos, setPos] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);
  const [armed, setArmed] = useState([true, true, false, false]);
  const [nudge, setNudge] = useState(0);
  const [flash, setFlash] = useState(false);

  const rate = 1 + tempo / 100 + nudge;
  const bpm = (BASE_BPM * (1 + tempo / 100)).toFixed(2);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => {
        const n = p + 0.06 * rate;
        return n >= DURATION ? 0 : n;
      });
      setRotation((r) => (r + 0.06 * rate * 200) % 360);
    }, 60);
    return () => clearInterval(id);
  }, [playing, rate]);

  useEffect(() => {
    if (nudge === 0) return;
    const t = setTimeout(() => setNudge(0), 220);
    return () => clearTimeout(t);
  }, [nudge]);

  const fmt = (s) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    return (s < 0 ? "-" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const cue = () => {
    setPos(0);
    setRotation(0);
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
  };

  const progress = Math.min(1, pos / DURATION);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"h-2 w-2 rounded-full transition-all duration-500 " + (playing ? "bg-teal-300 shadow-[0_0_10px_rgba(45,212,191,0.9)]" : "bg-neutral-600")} />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">Deck B</span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-teal-300/80">Right Player</span>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* top row */}
        <div className="flex-1 flex gap-3">
          {/* deck block */}
          <div className="flex-1 flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
            {/* displays */}
            <div className="flex-none flex gap-2 items-stretch">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">Track</span>
                <div className="h-[2.1rem] w-full">
                  <Readout value="NOCTURNE DRIFT — KAIRO" placeholder="NO TRACK" />
                </div>
              </div>
              <div className="w-[6.5rem] flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">BPM</span>
                <div className="h-[2.1rem] w-full">
                  <Readout value={bpm} />
                </div>
              </div>
              <div className="w-[5.5rem] flex flex-col gap-1">
                <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">Elapsed / Rem</span>
                <div className="h-[2.1rem] w-full">
                  <Readout value={fmt(pos) + " / " + fmt(-(DURATION - pos))} />
                </div>
              </div>
            </div>

            {/* platter */}
            <div className="flex-1 flex items-center justify-center relative">
              <div
                className={
                  "relative rounded-full transition-all duration-500 " +
                  (playing ? "shadow-[0_0_34px_rgba(45,212,191,0.32)]" : "") +
                  (flash ? " ring-2 ring-amber-400/70" : "")
                }
                style={{ width: "min(100%, 15rem)", aspectRatio: "1 / 1" }}
              >
                <JogWheel
                  rotation={rotation}
                  spinning={playing}
                  onScrub={(v) => setNudge(Math.max(-0.6, Math.min(0.6, v - 1)))}
                  onRotate={(d) => {
                    setRotation((r) => (r + d * 360) % 360);
                    setPos((p) => Math.max(0, Math.min(DURATION, p + d * 4)));
                  }}
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
                <span className="font-mono text-[10px] tracking-widest uppercase text-teal-300/70">
                  {playing ? "PLAY" : "CUED"} · {(rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* progress hairline */}
            <div className="flex-none h-[3px] w-full rounded-full bg-black/70 shadow-inner shadow-black/70 overflow-clip">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-amber-400 transition-all duration-200 ease-out"
                style={{ width: (progress * 100).toFixed(2) + "%" }}
              />
            </div>

            {/* transport */}
            <div className="flex-none flex gap-2 items-stretch">
              <div className="w-[6rem] h-[3rem]">
                <PushButton onPress={cue} tone="neutral">
                  <span className="font-mono font-semibold tracking-wider uppercase">CUE</span>
                </PushButton>
              </div>
              <div className="flex-1 h-[3rem]">
                <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                  <span className="font-mono font-semibold tracking-wider uppercase">{playing ? "PAUSE" : "PLAY"}</span>
                </ToggleButton>
              </div>
              <div className="w-[6rem] h-[3rem]">
                <ToggleButton on={sync} onChange={setSync} tone="neutral">
                  <span className="font-mono font-semibold tracking-wider uppercase">SYNC</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* tempo column */}
          <div className="w-[10.5rem] flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
            <span className="flex-none text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Tempo</span>
            <div className="h-[2rem] w-full flex-none">
              <Readout value={(tempo >= 0 ? "+" : "") + tempo.toFixed(2) + "%"} />
            </div>
            <div className="flex-1 flex justify-center items-stretch py-1">
              <div className="w-[3rem]">
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
            </div>
            <div className="flex-none flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Keylock</span>
              <div className="w-[3.2rem] h-[1.6rem]">
                <ToggleSwitch on={keylock} onChange={setKeylock} />
              </div>
            </div>
          </div>
        </div>

        {/* hot cues */}
        <div className="flex-none rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="grid grid-cols-4 gap-2">
            {["A", "B", "C", "D"].map((l, i) => (
              <div key={"cp-" + i} className="h-[3.4rem]">
                <CuePad
                  armed={armed[i]}
                  onPress={() => {
                    if (armed[i]) { setPos(i * 38 + 6); setRotation(0); }
                    else setArmed((a) => a.map((v, j) => (j === i ? true : v)));
                  }}
                  onAltPress={() => setArmed((a) => a.map((v, j) => (j === i ? false : v)))}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-mono font-bold tracking-wider">{l}</span>
                    <span className="font-mono text-[0.6em] tracking-widest opacity-70">
                      {armed[i] ? fmt(i * 38 + 6) : "SET"}
                    </span>
                  </span>
                </CuePad>
              </div>
            ))}
          </div>
        </div>

        {/* loop controls */}
        <div className="flex-none flex items-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 px-2 py-2 shadow-2xl shadow-black/60">
          <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Loop</span>
          <div className="w-[2.6rem] h-[2.6rem]">
            <Knob
              value={loopBeats}
              min={1}
              max={32}
              mode="stepped"
              steps={[1, 2, 4, 8, 16, 32]}
              onChange={(v) => setLoopBeats(v)}
            />
          </div>
          <div className="w-[5rem] h-[2rem]">
            <Readout value={loopBeats + " BEAT"} />
          </div>
          <div className="flex-1 h-[2.2rem]">
            <PushButton onPress={() => setLoopOn(true)}>
              <span className="font-mono font-semibold tracking-wider uppercase">IN</span>
            </PushButton>
          </div>
          <div className="flex-1 h-[2.2rem]">
            <PushButton onPress={() => setLoopOn(false)}>
              <span className="font-mono font-semibold tracking-wider uppercase">OUT</span>
            </PushButton>
          </div>
          <div className="flex-1 h-[2.2rem]">
            <PushButton onPress={() => setLoopOn((l) => !l)} tone={loopOn ? "accent" : "neutral"}>
              <span className="font-mono font-semibold tracking-wider uppercase">{loopOn ? "EXIT" : "RELOOP"}</span>
            </PushButton>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          CH-B · {keylock ? "KEYLOCK ON" : "KEYLOCK OFF"} · {sync ? "SYNCED" : "FREE"}
        </span>
        <span className={"font-mono text-[10px] tracking-wide " + (loopOn ? "text-teal-300" : "text-neutral-500")}>
          {loopOn ? "LOOP " + loopBeats + "B ACTIVE" : "LOOP IDLE"}
        </span>
      </div>
    </div>
  );
}