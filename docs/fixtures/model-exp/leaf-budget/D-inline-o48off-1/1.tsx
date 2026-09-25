export default function GeneratedComponent() {
  // ---- Core playback state ----------------------------------------------------
  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState(42.7); // seconds elapsed
  const duration = 214; // seconds total
  const [tempo, setTempo] = useState(0); // pitch % (-8..+8)
  const baseBpm = 124.0;
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);

  // ---- Loop state -------------------------------------------------------------
  const loopSizes = [0.25, 0.5, 1, 2, 4, 8, 16, 32];
  const [loopIdx, setLoopIdx] = useState(2); // index into loopSizes -> 1 beat
  const [loopActive, setLoopActive] = useState(false);

  // ---- Hot cues ---------------------------------------------------------------
  const [cues, setCues] = useState<boolean[]>([true, true, false, false]);
  const cueLabels = ["A", "B", "C", "D"];

  // ---- Derived values ---------------------------------------------------------
  const effectiveBpm = baseBpm * (1 + tempo / 100);
  const remaining = Math.max(0, duration - position);

  const fmt = (secs: number) => {
    const s = Math.max(0, secs);
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    const cs = Math.floor((s % 1) * 100);
    return (
      String(m).padStart(2, "0") +
      ":" +
      String(r).padStart(2, "0") +
      "." +
      String(cs).padStart(2, "0")
    );
  };

  const loopLabel = (n: number) => (n < 1 ? "1/" + Math.round(1 / n) : String(n));

  // ---- Playback + platter animation ------------------------------------------
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const speed = 1 + tempo / 100;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPosition((p) => {
        let next = p + dt * speed;
        if (next >= duration) next = 0;
        return next;
      });
      setRotation((r) => (r + dt * speed * 60) % 360); // ~one rev/sec at nominal
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, tempo]);

  // ---- Handlers ---------------------------------------------------------------
  const handleScrub = (velocity: number) => {
    // Nudge position by scrub velocity relative to nominal playback
    setPosition((p) => Math.max(0, Math.min(duration, p + velocity * 0.05)));
  };

  const handleRotate = (deltaTurns: number) => {
    if (!playing) setPosition((p) => Math.max(0, Math.min(duration, p + deltaTurns * 1.2)));
  };

  const handleCueSet = (i: number) => {
    setCues((prev) => {
      const n = [...prev];
      n[i] = true;
      return n;
    });
  };

  const handleCueClear = (i: number) => {
    setCues((prev) => {
      const n = [...prev];
      n[i] = false;
      return n;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* ===== HEADER ============================================================ */}
      <div className="h-9 flex-none px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[0.9rem] drop-shadow-[0_0_8px_rgba(251,146,60,0.55)]">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Deck A
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">Left Player</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-wide">
          <span
            className={
              "px-1.5 py-0.5 rounded-md border " +
              (playing
                ? "border-teal-400/40 text-teal-300 bg-teal-500/10"
                : "border-neutral-700/60 text-neutral-500")
            }
          >
            {playing ? "PLAYING" : "CUED"}
          </span>
          <span className="text-amber-300 font-bold tracking-tight drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
            CH A
          </span>
        </div>
      </div>

      {/* ===== BODY ============================================================== */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* ---- Top readouts row ---- */}
        <div className="flex-none flex items-stretch gap-3">
          {/* Track title */}
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Now Playing
            </span>
            <div className="flex-1">
              <div className="h-9 w-full">
                <Readout value="Solar Drift — Nightgrid" placeholder="No Track Loaded" />
              </div>
            </div>
          </div>

          {/* BPM */}
          <div className="flex-none w-28 flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              BPM
            </span>
            <div className="h-9 w-full">
              <Readout value={effectiveBpm.toFixed(1)} />
            </div>
          </div>
        </div>

        {/* ---- Time displays ---- */}
        <div className="flex-none grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Elapsed
            </span>
            <div className="h-9 w-full">
              <Readout value={fmt(position)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Remaining
            </span>
            <div className="h-9 w-full">
              <Readout value={"-" + fmt(remaining)} />
            </div>
          </div>
        </div>

        {/* ---- Main deck: platter + tempo + transport ---- */}
        <div className="flex-1 flex items-stretch gap-3">

          {/* Platter cluster */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
            <div
              className={
                "relative rounded-full transition-shadow duration-500 ease-in-out " +
                (playing ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]" : "")
              }
            >
              <div className="w-[13rem] h-[13rem]">
                <JogWheel
                  rotation={rotation}
                  spinning={playing}
                  onScrub={handleScrub}
                  onRotate={handleRotate}
                />
              </div>
            </div>

            {/* Transport under platter */}
            <div className="flex-none w-full flex items-stretch gap-2 pt-1">
              <div className="flex-1 h-9">
                <PushButton tone="accent" onPress={() => setPosition(0)}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[0.7em] tracking-widest opacity-80">SET</span>
                    <span>CUE</span>
                  </span>
                </PushButton>
              </div>
              <div className="flex-[1.4] h-9">
                <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                  <span className="tracking-wider">{playing ? "❚❚ PAUSE" : "▶ PLAY"}</span>
                </ToggleButton>
              </div>
              <div className="flex-1 h-9">
                <ToggleButton on={sync} onChange={setSync}>
                  <span>SYNC</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Tempo + keylock column */}
          <div className="flex-none w-24 flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-2xl shadow-black/60">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Tempo
            </span>
            <div className="font-mono font-bold text-amber-300 tracking-tight drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] text-[0.95rem] leading-none">
              {(tempo >= 0 ? "+" : "") + tempo.toFixed(1) + "%"}
            </div>
            <div className="flex-1 flex items-center justify-center py-1">
              <div className="w-[2.2rem] h-[11rem]">
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
            <div className="flex-none w-full flex flex-col items-center gap-1">
              <span className="text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-500">
                Keylock
              </span>
              <div className="h-6 w-[3rem]">
                <ToggleSwitch on={keylock} onChange={setKeylock} />
              </div>
            </div>
          </div>
        </div>

        {/* ---- Loop controls ---- */}
        <div className="flex-none flex items-stretch gap-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="flex-none flex flex-col items-center justify-center gap-1 px-1">
            <span className="text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Loop
            </span>
            <div className="w-[2.5rem] h-[2.5rem]">
              <Knob
                value={loopIdx}
                min={0}
                max={loopSizes.length - 1}
                mode="stepped"
                steps={loopSizes.map((_, i) => i)}
                onChange={(v) => setLoopIdx(Math.round(v))}
              />
            </div>
          </div>

          <div className="flex-none w-20 flex flex-col justify-center gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Beats
            </span>
            <div className="h-8 w-full">
              <Readout value={loopLabel(loopSizes[loopIdx])} />
            </div>
          </div>

          <div className="flex-1 h-full flex items-center">
            <div className="w-full h-9">
              <ToggleButton on={loopActive} onChange={setLoopActive}>
                <span className="tracking-wider">{loopActive ? "LOOP ON" : "LOOP OFF"}</span>
              </ToggleButton>
            </div>
          </div>

          <div className="flex-1 h-full flex items-center">
            <div className="w-full h-9">
              <PushButton
                onPress={() => setLoopIdx((i) => Math.max(0, i - 1))}
                tone="neutral"
              >
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[0.7em] tracking-widest opacity-80">1/2</span>
                  <span>HALVE</span>
                </span>
              </PushButton>
            </div>
          </div>

          <div className="flex-1 h-full flex items-center">
            <div className="w-full h-9">
              <PushButton
                onPress={() => setLoopIdx((i) => Math.min(loopSizes.length - 1, i + 1))}
                tone="neutral"
              >
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[0.7em] tracking-widest opacity-80">×2</span>
                  <span>DOUBLE</span>
                </span>
              </PushButton>
            </div>
          </div>
        </div>

        {/* ---- Hot cue pads ---- */}
        <div className="flex-none flex flex-col gap-1">
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Hot Cues
          </span>
          <div className="grid grid-cols-4 gap-2">
            {cueLabels.map((label, i) => (
              <div key={"cue-" + i} className="w-full h-[3rem]">
                <CuePad
                  armed={cues[i]}
                  onPress={() => (cues[i] ? setPosition(i * 12 + 4) : handleCueSet(i))}
                  onAltPress={() => handleCueClear(i)}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span>{label}</span>
                    <span className="text-[0.6em] tracking-widest opacity-70">
                      {cues[i] ? "CUE" : "SET"}
                    </span>
                  </span>
                </CuePad>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FOOTER =========================================================== */}
      <div className="h-7 flex-none px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          KEY <span className="text-amber-300">8A</span> · {keylock ? "KEYLOCK ON" : "PITCH+KEY"}
        </span>
        <span
          className={
            "font-mono text-[10px] tracking-wide " +
            (sync ? "text-teal-300" : "text-neutral-500")
          }
        >
          {sync ? "SYNCED · MASTER" : "FREE TEMPO"}
        </span>
      </div>
    </div>
  );
}