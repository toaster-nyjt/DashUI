export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + [displays 3.4 + jog 12 + transport 2.6 + tempoRow 6 + loopRow 2.5 + hotcue 5.2] body(≈32.9 in flex-1) + footer 1.75 ≈ 36.9 ≤ 41.6
  // BUDGET width: left col (jog 12) + gap 0.75 + right col (Fader 2.2 stack ≈ fills) ... main body two-col ≈ 51.5 ≤ 52.0

  const TRACK_TITLE = "MIDNIGHT VOLTAGE";
  const TRACK_ARTIST = "Kairo Synthetix";
  const TRACK_KEY = "8A";

  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(true);
  const [keylock, setKeylock] = useState(false);

  const [tempo, setTempo] = useState(0); // pitch % -8..+8
  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + tempo / 100);

  const [rotation, setRotation] = useState(0);
  const [scrubVel, setScrubVel] = useState(1);

  const trackDuration = 274; // seconds
  const [position, setPosition] = useState(0);

  const [loopActive, setLoopActive] = useState(false);
  const [loopLen, setLoopLen] = useState(4); // beats
  const loopSteps = [0.25, 0.5, 1, 2, 4, 8, 16, 32];

  const [cues, setCues] = useState([true, true, false, true, false, false, false, false]);
  const [lastCue, setLastCue] = useState(-1);

  // playback + platter animation via state (never scrolls page)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speed = (1 + tempo / 100) * scrubVel;
      setPosition((p) => {
        let np = p + dt * speed;
        if (np >= trackDuration) np = 0;
        if (np < 0) np = 0;
        return np;
      });
      setRotation((r) => (r + dt * 360 * 1.333 * speed) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, tempo, scrubVel]);

  const fmt = (s: number) => {
    const sign = s < 0 ? "-" : "";
    const a = Math.abs(s);
    const m = Math.floor(a / 60);
    const sec = Math.floor(a % 60);
    const cs = Math.floor((a % 1) * 100);
    return (
      sign +
      String(m).padStart(2, "0") +
      ":" +
      String(sec).padStart(2, "0") +
      "." +
      String(cs).padStart(2, "0")
    );
  };

  const elapsed = fmt(position);
  const remaining = fmt(-(trackDuration - position));

  const fireCue = (i: number) => {
    setCues((prev) => {
      if (prev[i]) {
        setLastCue(i);
        return prev;
      }
      const next = [...prev];
      next[i] = true;
      setLastCue(i);
      return next;
    });
  };

  const clearCue = (i: number) => {
    setCues((prev) => {
      const next = [...prev];
      next[i] = false;
      return next;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] text-amber-50">
      {/* Header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-base leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]">◉</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">Deck A</span>
          <span className="text-[10px] font-mono tracking-wide text-neutral-500">CH-A · LEFT PLAYER</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              "text-[10px] font-mono tracking-wide px-1.5 py-0.5 rounded border transition-all duration-200 " +
              (playing
                ? "text-teal-300 border-teal-400/40 bg-teal-500/10 shadow-[0_0_12px_rgba(45,212,191,0.35)]"
                : "text-neutral-500 border-neutral-700/60 bg-neutral-900/60")
            }
          >
            {playing ? "PLAYING" : "PAUSED"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 p-3">
        {/* Displays row */}
        <div className="flex-none grid grid-cols-[1fr_auto] gap-3">
          {/* Title / artist / BPM display block */}
          <div className="flex flex-col gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">Now Playing</span>
              <span className="text-[10px] font-mono tracking-wide text-amber-400/80 px-1.5 rounded-md border border-amber-500/20 bg-amber-500/5">
                KEY {TRACK_KEY}
              </span>
            </div>
            <div className="min-w-0">
              <div className="h-9">
                <Readout
                  value={TRACK_TITLE}
                  placeholder="— NO TRACK —"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono tracking-wide text-neutral-400 truncate">
              <span className="truncate">{TRACK_ARTIST}</span>
            </div>
          </div>

          {/* BPM cluster */}
          <div className="flex flex-col gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 w-40">
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 text-center">BPM</span>
            <div className="h-11">
              <Readout value={bpm.toFixed(1)} />
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono tracking-wide">
              <span className={"px-1 rounded " + (tempo === 0 ? "text-neutral-500" : tempo > 0 ? "text-amber-300" : "text-teal-300")}>
                {(tempo >= 0 ? "+" : "") + tempo.toFixed(1)}%
              </span>
              {sync && (
                <span className="px-1 rounded text-teal-300 border border-teal-400/30 bg-teal-500/10">SYNC</span>
              )}
            </div>
          </div>
        </div>

        {/* Main platter + tempo/time */}
        <div className="flex-1 min-h-0 grid grid-cols-[auto_1fr] gap-3">
          {/* LEFT: Jog platter + transport */}
          <div className="flex flex-col gap-3">
            {/* Jog wheel */}
            <div className="flex-1 min-h-0 flex items-center justify-center rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3">
              <div
                className={
                  "relative flex items-center justify-center rounded-full transition-shadow duration-500 " +
                  (playing ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]" : "")
                }
                style={{ width: "13rem", height: "13rem" }}
              >
                <JogWheel
                  rotation={rotation}
                  spinning={playing}
                  onScrub={(v) => {
                    setScrubVel(v);
                    if (!playing) {
                      setPosition((p) => Math.max(0, Math.min(trackDuration, p + v * 0.02)));
                    }
                  }}
                  onRotate={(d) => {
                    setRotation((r) => (r + d * 360) % 360);
                    setPosition((p) => Math.max(0, Math.min(trackDuration, p + d * (60 / bpm) * 4)));
                  }}
                />
              </div>
            </div>

            {/* Transport: CUE + PLAY */}
            <div className="flex-none grid grid-cols-2 gap-2">
              <div className="h-12">
                <PushButton
                  tone="accent"
                  onPress={() => {
                    setPosition(0);
                    setRotation(0);
                  }}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.4em]">◀◀</span>
                    <span className="text-[0.7em] tracking-widest">CUE</span>
                  </span>
                </PushButton>
              </div>
              <div className="h-12">
                <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.4em]">{playing ? "❚❚" : "▶"}</span>
                    <span className="text-[0.7em] tracking-widest">{playing ? "PAUSE" : "PLAY"}</span>
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* RIGHT: tempo fader + time + toggles */}
          <div className="grid grid-rows-[auto_1fr] gap-3 min-w-0">
            {/* Time readouts + sync/keylock */}
            <div className="flex-none flex flex-col gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">Elapsed</span>
                  <div className="h-8">
                    <Readout value={elapsed} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500 text-right">Remain</span>
                  <div className="h-8">
                    <Readout value={remaining} />
                  </div>
                </div>
              </div>
              {/* progress bar (visual) */}
              <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-clip">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-600 shadow-[0_0_10px_rgba(251,146,60,0.5)] transition-[width] duration-200 ease-out"
                  style={{ width: (position / trackDuration) * 100 + "%" }}
                />
              </div>
            </div>

            {/* Tempo fader + toggles */}
            <div className="min-h-0 grid grid-cols-[1fr_auto] gap-3">
              {/* Tempo fader */}
              <div className="min-h-0 flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Tempo</span>
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <div className="flex items-stretch gap-2 h-full">
                    <div className="flex flex-col justify-between py-1 text-[9px] font-mono text-neutral-600 leading-none">
                      <span>+8</span>
                      <span>0</span>
                      <span>-8</span>
                    </div>
                    <div style={{ width: "2.4rem", height: "100%", minHeight: "6rem" }}>
                      <Fader
                        value={tempo}
                        min={-8}
                        max={8}
                        onChange={setTempo}
                        orientation="vertical"
                        bipolar
                        detents={[0]}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono tracking-tight font-bold text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] leading-none">
                  {(tempo >= 0 ? "+" : "") + tempo.toFixed(2)}%
                </span>
              </div>

              {/* Sync / Keylock */}
              <div className="min-h-0 flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 w-28 justify-center">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Sync</span>
                  <div className="h-10 w-full">
                    <ToggleButton on={sync} onChange={setSync} tone="accent">
                      <span className="text-[0.85em] tracking-widest">{sync ? "ON" : "OFF"}</span>
                    </ToggleButton>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-center pt-1 border-t border-amber-500/10">
                  <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Keylock</span>
                  <div className="flex items-center justify-center py-1">
                    <ToggleSwitch on={keylock} onChange={setKeylock} />
                  </div>
                  <span className={"text-[9px] font-mono tracking-wide leading-none " + (keylock ? "text-teal-300" : "text-neutral-600")}>
                    {keylock ? "PITCH LOCKED" : "FREE"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loop controls row */}
        <div className="flex-none flex items-stretch gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
          <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none self-center pr-1">Loop</span>
          <div className="flex items-center gap-2 self-center">
            <div style={{ width: "2.75rem", height: "2.75rem" }}>
              <Knob
                value={loopLen}
                min={0.25}
                max={32}
                onChange={setLoopLen}
                mode="stepped"
                steps={loopSteps}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-500 leading-none">Beats</span>
              <div className="h-6 w-16">
                <Readout value={loopLen < 1 ? "1/" + Math.round(1 / loopLen) : String(loopLen)} />
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
            <div className="h-full min-h-[2.5rem]">
              <PushButton
                onPress={() => setLoopLen((l) => loopSteps[Math.max(0, loopSteps.indexOf(l) - 1)] ?? l)}
              >
                <span className="text-[0.8em] tracking-widest">½ ×</span>
              </PushButton>
            </div>
            <div className="h-full min-h-[2.5rem]">
              <ToggleButton on={loopActive} onChange={setLoopActive} tone="accent">
                <span className="text-[0.8em] tracking-widest">{loopActive ? "EXIT" : "LOOP"}</span>
              </ToggleButton>
            </div>
            <div className="h-full min-h-[2.5rem]">
              <PushButton
                onPress={() => setLoopLen((l) => loopSteps[Math.min(loopSteps.length - 1, loopSteps.indexOf(l) + 1)] ?? l)}
              >
                <span className="text-[0.8em] tracking-widest">2 ×</span>
              </PushButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none flex flex-col gap-1.5 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Hot Cues</span>
            <span className="text-[9px] font-mono tracking-wide text-neutral-600">TAP = JUMP · HOLD = CLEAR</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {cues.map((armed, i) => (
              <div
                key={"cue-" + i}
                className={
                  "flex flex-col items-center gap-0.5 rounded-md transition-all duration-200 " +
                  (lastCue === i && armed ? "ring-2 ring-amber-400/60 rounded-md" : "")
                }
              >
                <div style={{ width: "100%", aspectRatio: "1 / 1", minHeight: "2.5rem" }}>
                  <CuePad
                    armed={armed}
                    onPress={() => fireCue(i)}
                    onAltPress={() => clearCue(i)}
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[1.1em] font-bold">{i + 1}</span>
                    </span>
                  </CuePad>
                </div>
                <span className={"text-[9px] font-mono tracking-wide leading-none " + (armed ? "text-teal-300" : "text-neutral-600")}>
                  {armed ? "SET" : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          POS <span className="text-amber-300">{elapsed}</span> / {fmt(trackDuration)}
        </span>
        <span className="font-mono text-[10px] tracking-wide">
          <span className={loopActive ? "text-teal-300" : "text-neutral-500"}>
            {loopActive ? "LOOP " + (loopLen < 1 ? "1/" + Math.round(1 / loopLen) : loopLen) + " BEATS" : "LOOP OFF"}
          </span>
          <span className="text-neutral-600"> · </span>
          <span className={playing ? "text-teal-300" : "text-neutral-500"}>{"→ WAVEFORM"}</span>
        </span>
      </div>
    </div>
  );
}