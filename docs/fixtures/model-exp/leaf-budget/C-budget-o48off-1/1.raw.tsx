export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + gap 0.75 + displays 3.0 + gap 0.75 + platterRow 12.5 + gap 0.75 + faderRow 8.0 + gap 0.75 + pads(2*2.5=5.0)+gap0.5 = 34.5 + footer 1.75 = ~36.25 ≤ 41.6
  // BUDGET width: leftCol(fader 2.2) + gap 0.75 + platter 12.5 + gap 0.75 + rightCol 6.0 + padding 1.5 = ~23.7 ≤ 52.0 (fluid columns absorb remainder)

  // ---- Deck A visual identity: amber/orange ----
  const DECK_ACCENT = "amber";

  // ---- Sample track state ----
  const [loadedTrack] = useState({
    title: "MIDNIGHT VELVET",
    artist: "Lunar Drift",
    baseBpm: 124.0,
    key: "8A",
    duration: 218, // seconds
  });

  // ---- Transport state ----
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0); // seconds
  const [platterAngle, setPlatterAngle] = useState(0); // degrees

  // ---- Tempo/pitch ----
  const [tempo, setTempo] = useState(0); // -8..+8 percent
  const effectiveBpm = useMemo(
    () => loadedTrack.baseBpm * (1 + tempo / 100),
    [loadedTrack.baseBpm, tempo]
  );

  // ---- Sync / keylock ----
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);

  // ---- Loop ----
  const [loopActive, setLoopActive] = useState(false);
  const LOOP_STEPS = [0.25, 0.5, 1, 2, 4, 8, 16, 32];
  const [loopLen, setLoopLen] = useState(4); // beats

  // ---- Hot cues ----
  const [hotCues, setHotCues] = useState<(number | null)[]>([
    12, 48, null, 96, null, 160, null, null,
  ]);

  // ---- Cue point (for CUE button) ----
  const [cuePoint, setCuePoint] = useState(0);

  // ---- Playback loop (state-driven, never scrolls host) ----
  useEffect(() => {
    if (!playing) return;
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speed = 1 + tempo / 100;
      setPosition((p) => {
        let next = p + dt * speed;
        if (loopActive) {
          const beatSec = 60 / effectiveBpm;
          const loopSec = loopLen * beatSec;
          const loopStart = cuePoint;
          if (next >= loopStart + loopSec) {
            next = loopStart + ((next - loopStart) % loopSec);
          }
        }
        if (next >= loadedTrack.duration) next = 0;
        return next;
      });
      setPlatterAngle((a) => (a + dt * speed * 200) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    playing,
    tempo,
    loopActive,
    loopLen,
    effectiveBpm,
    cuePoint,
    loadedTrack.duration,
  ]);

  // ---- Handlers ----
  const handleScrub = useCallback(
    (velocity: number) => {
      if (!playing) {
        setPosition((p) =>
          Math.max(0, Math.min(loadedTrack.duration, p + velocity * 0.03))
        );
      }
    },
    [playing, loadedTrack.duration]
  );

  const handleRotate = useCallback((deltaTurns: number) => {
    setPlatterAngle((a) => (a + deltaTurns * 360) % 360);
  }, []);

  const handleCue = useCallback(() => {
    if (playing) {
      setPlaying(false);
      setPosition(cuePoint);
    } else {
      setCuePoint(position);
    }
  }, [playing, position, cuePoint]);

  const toggleHotCue = useCallback(
    (i: number) => {
      setHotCues((prev) => {
        const next = [...prev];
        if (next[i] == null) {
          next[i] = position;
        } else {
          setPosition(next[i] as number);
        }
        return next;
      });
    },
    [position]
  );

  const clearHotCue = useCallback((i: number) => {
    setHotCues((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });
  }, []);

  // ---- Time formatting ----
  const fmtTime = (s: number) => {
    const sign = s < 0 ? "-" : "";
    const abs = Math.abs(Math.floor(s));
    const m = Math.floor(abs / 60);
    const sec = abs % 60;
    return sign + m + ":" + (sec < 10 ? "0" : "") + sec;
  };
  const elapsed = fmtTime(position);
  const remaining = fmtTime(-(loadedTrack.duration - position));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] text-amber-50">
      {/* ---------- HEADER ---------- */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,146,60,0.6)] " +
              (playing ? "animate-pulse" : "")
            }
          />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Deck A
          </span>
        </div>
        <div className="flex items-center gap-2 shrink">
          <span className="hidden sm:inline text-[10px] font-mono tracking-wide text-neutral-500 uppercase">
            Left Player
          </span>
          <span className="px-1.5 py-0.5 rounded-md border border-amber-500/25 bg-black/40 font-mono text-[10px] tracking-wider text-amber-300">
            KEY {loadedTrack.key}
          </span>
        </div>
      </div>

      {/* ---------- BODY ---------- */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 p-3 overflow-hidden">
        {/* ===== DISPLAYS ROW ===== */}
        <div className="flex-none grid grid-cols-[1fr_auto] gap-3">
          {/* Track title + artist readout */}
          <div className="min-w-0 flex flex-col gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">
              Now Playing
            </span>
            <div className="h-8">
              <Readout
                value={
                  loadedTrack.title + "  —  " + loadedTrack.artist
                }
                placeholder="NO TRACK LOADED"
              />
            </div>
          </div>

          {/* BPM readout */}
          <div className="flex flex-col gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 w-28">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">
              BPM
            </span>
            <div className="h-8">
              <Readout value={effectiveBpm.toFixed(1)} />
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTROL AREA (fluid) ===== */}
        <div className="flex-1 min-h-0 grid grid-cols-[auto_1fr_auto] gap-3">
          {/* --- LEFT: Tempo fader column --- */}
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 px-2 py-3">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
              Tempo
            </span>
            <div className="flex-1 min-h-0 flex items-stretch">
              <div className="w-9 h-full flex justify-center">
                <div className="h-full w-6">
                  <Fader
                    value={tempo}
                    min={-8}
                    max={8}
                    orientation="vertical"
                    bipolar
                    detents={[0]}
                    onChange={setTempo}
                  />
                </div>
              </div>
            </div>
            <div className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] text-sm leading-none">
              {(tempo >= 0 ? "+" : "") + tempo.toFixed(1) + "%"}
            </div>
          </div>

          {/* --- CENTER: Jog Platter + transport --- */}
          <div className="min-w-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3">
            {/* Platter */}
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <div
                className={
                  "relative flex items-center justify-center transition-shadow duration-500 rounded-full " +
                  (playing
                    ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]"
                    : "")
                }
                style={{ width: "13rem", height: "13rem" }}
              >
                <JogWheel
                  rotation={platterAngle}
                  spinning={playing}
                  onScrub={handleScrub}
                  onRotate={handleRotate}
                />
                {/* Center spindle label overlay (decorative, non-blocking) */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border border-amber-500/20 bg-neutral-950/70 px-2 py-1">
                    <span className="font-mono font-bold text-[11px] tracking-tight text-amber-300/90">
                      {elapsed}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport buttons */}
            <div className="flex-none w-full grid grid-cols-2 gap-2">
              <div className="h-10">
                <PushButton onPress={handleCue} tone="accent">
                  <span className="font-mono font-semibold tracking-wider uppercase">
                    Cue
                  </span>
                </PushButton>
              </div>
              <div className="h-10">
                <ToggleButton
                  on={playing}
                  onChange={setPlaying}
                  tone="accent"
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.1em]">
                      {playing ? "⏸" : "▶"}
                    </span>
                    <span className="text-[0.6em] font-mono tracking-widest uppercase">
                      {playing ? "Pause" : "Play"}
                    </span>
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* --- RIGHT: Sync / Keylock / Time / Loop stack --- */}
          <div className="flex flex-col gap-3 w-40">
            {/* Sync + Keylock */}
            <div className="flex-none flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
              <div className="h-9">
                <ToggleButton
                  on={synced}
                  onChange={setSynced}
                  tone="accent"
                >
                  <span className="font-mono font-semibold tracking-wider uppercase">
                    Sync
                  </span>
                </ToggleButton>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
                  Keylock
                </span>
                <ToggleSwitch on={keylock} onChange={setKeylock} />
              </div>
            </div>

            {/* Time remaining */}
            <div className="flex-none flex flex-col gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
              <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">
                Remaining
              </span>
              <div className="h-7">
                <Readout value={remaining} />
              </div>
            </div>

            {/* Loop controls */}
            <div className="flex-1 min-h-0 flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
              <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
                Loop
              </span>
              <div className="flex items-center gap-2">
                <div className="w-11 h-11">
                  <Knob
                    value={loopLen}
                    min={0.25}
                    max={32}
                    mode="stepped"
                    steps={LOOP_STEPS}
                    onChange={setLoopLen}
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">
                    Beats
                  </span>
                  <div className="h-6">
                    <Readout value={loopLen} />
                  </div>
                </div>
              </div>
              <div className="h-9">
                <ToggleButton
                  on={loopActive}
                  onChange={setLoopActive}
                  tone="accent"
                >
                  <span className="font-mono font-semibold tracking-wider uppercase">
                    {loopActive ? "Loop On" : "Loop"}
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* ===== HOT CUE PADS ===== */}
        <div className="flex-none flex flex-col gap-1.5">
          <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
            Hot Cues
          </span>
          <div className="grid grid-cols-4 grid-rows-2 gap-2">
            {hotCues.map((cue, i) => (
              <div
                key={"cue-" + i}
                className="h-14"
                onContextMenu={(e) => {
                  e.preventDefault();
                  clearHotCue(i);
                }}
              >
                <CuePad
                  armed={cue != null}
                  onPress={() => toggleHotCue(i)}
                  onAltPress={() => clearHotCue(i)}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.05em] font-mono font-bold tracking-tight">
                      {i + 1}
                    </span>
                    <span className="text-[0.62em] font-mono tracking-wide">
                      {cue != null ? fmtTime(cue) : "—"}
                    </span>
                  </span>
                </CuePad>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span
          className={
            "font-mono text-[10px] tracking-wide " +
            (playing ? "text-teal-300" : "text-neutral-400")
          }
        >
          {playing ? "▶ PLAYING" : "◼ STOPPED"}
          {loopActive ? "  •  LOOP " + loopLen + "B" : ""}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          {synced ? "SYNC " : ""}
          {keylock ? "KEYLOCK " : ""}
          {elapsed} / {fmtTime(loadedTrack.duration)}
        </span>
      </div>
    </div>
  );
}