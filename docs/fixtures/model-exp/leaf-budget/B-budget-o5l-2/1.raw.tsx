export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + readouts 2.75 + gap 0.75 + main 32.6 (jog 25 + gap .75 + transport 3.5 | fader 18 + gap .75 + pads 13) + footer 1.75 = 41.6 ≤ 41.6
  // BUDGET width: pad 1.5 + left 27 (jog 25) + gap 0.75 + right 22.75 (fader 3.5 + gap .75 + stack 18.5) = 52.0 ≤ 52.0

  const DURATION = 268;
  const BASE_BPM = 128;

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(12.4);
  const [rotation, setRotation] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState(4);
  const [cues, setCues] = useState<boolean[]>([true, true, false, true, false, false, true, false]);
  const [activeCue, setActiveCue] = useState<number | null>(0);
  const [nudge, setNudge] = useState(0);

  const rate = 1 + tempo / 100 + nudge;
  const bpm = BASE_BPM * (1 + tempo / 100);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => {
        const next = p + 0.06 * rate;
        return next >= DURATION ? 0 : next;
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

  const fmt = (s: number) => {
    const sign = s < 0 ? "-" : "";
    const a = Math.abs(Math.floor(s));
    const m = Math.floor(a / 60);
    const sec = a % 60;
    return sign + m + ":" + (sec < 10 ? "0" + sec : "" + sec);
  };

  const label = "text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400";
  const panel =
    "bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/15 rounded-2xl shadow-2xl shadow-black/60";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* header */}
      <div className="h-9 flex-none px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-2 w-2 rounded-full bg-amber-400 " +
              (playing ? "animate-pulse shadow-[0_0_10px_rgba(251,146,60,0.9)]" : "opacity-40")
            }
          />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Deck A — Left Player
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400/80">
          CH·A {playing ? "PLAY" : "PAUSE"}
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-col gap-3 p-3">
        {/* readouts */}
        <div className="h-[2.75rem] flex-none flex items-stretch gap-3">
          <div className="flex-1 flex flex-col justify-between">
            <span className={label}>Track</span>
            <div className="h-[1.75rem]">
              <Readout value="NOCTURNAL DRIVE — Kaito Rey" placeholder="NO TRACK" />
            </div>
          </div>
          <div className="w-[7rem] flex flex-col justify-between">
            <span className={label}>BPM</span>
            <div className="h-[1.75rem]">
              <Readout value={bpm.toFixed(2)} />
            </div>
          </div>
          <div className="w-[6rem] flex flex-col justify-between">
            <span className={label}>Elapsed</span>
            <div className="h-[1.75rem]">
              <Readout value={fmt(position)} />
            </div>
          </div>
          <div className="w-[6rem] flex flex-col justify-between">
            <span className={label}>Remain</span>
            <div className="h-[1.75rem]">
              <Readout value={fmt(position - DURATION)} />
            </div>
          </div>
        </div>

        {/* main */}
        <div className="flex-1 flex gap-3">
          {/* LEFT: platter + transport */}
          <div className={"w-[27rem] flex flex-col gap-3 p-3 " + panel}>
            <div className="flex-1 flex items-center justify-center relative">
              <div
                className={
                  "absolute h-[24rem] w-[24rem] rounded-full transition-all duration-500 ease-in-out " +
                  (playing
                    ? "shadow-[0_0_60px_rgba(251,146,60,0.28)]"
                    : "shadow-[0_0_24px_rgba(0,0,0,0.6)]")
                }
              />
              <div className="h-[23rem] w-[23rem] relative">
                <JogWheel
                  rotation={rotation}
                  spinning={playing}
                  onScrub={(v) => setNudge(Math.max(-0.35, Math.min(0.35, (v - 1) * 0.3)))}
                  onRotate={(d) => setPosition((p) => Math.max(0, Math.min(DURATION, p + d * 1.8)))}
                />
              </div>
            </div>
            <div className="h-[3.5rem] flex-none flex items-stretch gap-3">
              <div className="flex-1">
                <PushButton tone="neutral" onPress={() => { setPosition(0); setPlaying(false); setActiveCue(null); }}>
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-mono font-semibold tracking-widest">CUE</span>
                    <span className="text-[0.6em] tracking-widest text-neutral-400">RETURN</span>
                  </span>
                </PushButton>
              </div>
              <div className="flex-[1.4]">
                <ToggleButton on={playing} tone="accent" onChange={setPlaying}>
                  <span className="font-mono font-bold tracking-[0.3em] uppercase">
                    {playing ? "▮▮ PAUSE" : "▶ PLAY"}
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col gap-3">
            <div className={"flex-none h-[18.5rem] flex gap-3 p-3 " + panel}>
              {/* tempo fader */}
              <div className="w-[4rem] flex flex-col items-center gap-2">
                <span className={label}>Tempo</span>
                <div className="flex-1 w-[2.6rem]">
                  <Fader
                    value={tempo}
                    min={-8}
                    max={8}
                    bipolar
                    orientation="vertical"
                    detents={[-8, -4, 0, 4, 8]}
                    onChange={(v) => setTempo(v)}
                  />
                </div>
                <span className="font-mono text-[10px] tracking-wide text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                  {(tempo >= 0 ? "+" : "") + tempo.toFixed(1) + "%"}
                </span>
              </div>

              {/* stack */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-[3.75rem] flex-none flex gap-3">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className={label}>Sync</span>
                    <div className="flex-1">
                      <ToggleButton on={sync} tone="accent" onChange={setSync}>
                        <span className="font-mono font-semibold tracking-widest uppercase">Sync</span>
                      </ToggleButton>
                    </div>
                  </div>
                  <div className="w-[6rem] flex flex-col gap-1">
                    <span className={label}>Keylock</span>
                    <div className="h-[1.9rem] w-[3.6rem]">
                      <ToggleSwitch on={keylock} onChange={setKeylock} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
                  <span className={label}>Loop</span>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="h-[4.25rem] w-[4.25rem]">
                      <Knob
                        value={loopLen}
                        min={0.25}
                        max={16}
                        mode="stepped"
                        steps={[0.25, 0.5, 1, 2, 4, 8, 16]}
                        onChange={setLoopLen}
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="h-[1.75rem]">
                        <Readout value={loopLen + " BEAT"} />
                      </div>
                      <div className="h-[2rem]">
                        <PushButton tone={loopOn ? "accent" : "neutral"} onPress={() => setLoopOn((l) => !l)}>
                          <span className="font-mono font-semibold tracking-widest uppercase">
                            {loopOn ? "Exit Loop" : "Loop In/Out"}
                          </span>
                        </PushButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* hot cues */}
            <div className={"flex-1 flex flex-col gap-2 p-3 " + panel}>
              <div className="flex items-center justify-between">
                <span className={label}>Hot Cues</span>
                <span className="font-mono text-[10px] tracking-wide text-teal-300">
                  {cues.filter(Boolean).length}/8 ARMED
                </span>
              </div>
              <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-2">
                {cues.map((armed, i) => (
                  <CuePad
                    key={"cue-" + i}
                    armed={armed}
                    onPress={() => {
                      if (armed) {
                        setActiveCue(i);
                        setPosition(i * 26 + 4);
                      } else {
                        setCues((c) => c.map((v, j) => (j === i ? true : v)));
                        setActiveCue(i);
                      }
                    }}
                    onAltPress={() => {
                      setCues((c) => c.map((v, j) => (j === i ? false : v)));
                      if (activeCue === i) setActiveCue(null);
                    }}
                  >
                    <span className="flex flex-col items-center leading-tight">
                      <span className="font-mono font-bold tracking-widest">{i + 1}</span>
                      <span className="text-[0.58em] tracking-widest uppercase opacity-70">
                        {armed ? fmt(i * 26 + 4) : "SET"}
                      </span>
                    </span>
                  </CuePad>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          KEY 8A · {keylock ? <span className="text-teal-300">KEYLOCK ON</span> : "KEYLOCK OFF"} ·{" "}
          {sync ? <span className="text-teal-300">SYNC MASTER</span> : "FREE TEMPO"}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          RATE {rate.toFixed(3)}× · CUE {activeCue === null ? "—" : activeCue + 1}
        </span>
      </div>
    </div>
  );
}