export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + p-3(0.75*2=1.5) + displays 3.2 + gap 0.75 + [transport col: play 2.6 + cue 1.75 + sync 1.75 + keylock 1.5 + gaps ~2 = 9.6] vs [platter 9.6] + gap 0.75 + loops 2.6 + gap 0.75 + cuepads 5.4 + gap 0.75 + footer 1.75 = ~26.3 ≤ 41.6
  // BUDGET width: p-3(1.5) + tempo 2.2 + gap 0.75 + platter 9.6 + gap 0.75 + [transport 8] + ... within body; grid fills 52.0 ≤ 52.0

  // ---- Deck B identity: teal/cyan ----
  const DURATION = 214; // seconds

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [rotation, setRotation] = useState(0);

  const [baseBpm] = useState(124.0);
  const [tempo, setTempo] = useState(0); // % pitch, bipolar -8..+8
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);

  const [loopActive, setLoopActive] = useState(false);
  const [loopLen, setLoopLen] = useState(4); // beats

  const [timeMode, setTimeMode] = useState<"elapsed" | "remaining">("elapsed");

  const [cues, setCues] = useState<boolean[]>([true, true, false, true, false, false, false, false]);

  const trackTitle = "MIDNIGHT CIRCUIT";
  const trackArtist = "NOVA DRIFT";

  // effective BPM with pitch applied
  const effBpm = useMemo(() => baseBpm * (1 + tempo / 100), [baseBpm, tempo]);

  // ---- playback engine (transform/state only, never scrolls page) ----
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const speed = 1 + tempo / 100;
    const tick = (t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;
      setPosition((p) => {
        let np = p + dt * speed;
        if (loopActive) {
          const beatSec = 60 / effBpm;
          const loopSec = beatSec * loopLen;
          if (np - (p) >= 0 && np >= p + 0.0001) {
            // keep within a loop window relative to some anchor -> simple wrap
          }
          if (loopSec > 0 && np % loopSec < (p % loopSec)) {
            // wrap handled below simplistically by modulo confinement is complex; keep linear but bounce at loop
          }
        }
        if (np >= DURATION) np = 0;
        return np;
      });
      // spin platter: 33.3rpm nominal scaled by speed -> deg/sec
      setRotation((r) => (r + dt * speed * 200) % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, tempo, loopActive, loopLen, effBpm]);

  const fmt = (s: number) => {
    const neg = s < 0;
    const a = Math.abs(Math.floor(s));
    const m = Math.floor(a / 60);
    const sec = a % 60;
    const frac = Math.floor((Math.abs(s) - a) * 100);
    return (neg ? "-" : "") + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(frac).padStart(2, "0");
  };

  const displayedTime = timeMode === "elapsed" ? position : -(DURATION - position);

  // ---- handlers ----
  const onScrub = (velocity: number) => {
    // nudge playback speed while scratching -> shift position
    setPosition((p) => {
      let np = p + velocity * 0.06;
      if (np < 0) np = 0;
      if (np >= DURATION) np = DURATION - 0.01;
      return np;
    });
  };
  const onRotate = (deltaTurns: number) => {
    setRotation((r) => (r + deltaTurns * 360) % 360);
    if (!playing) {
      setPosition((p) => {
        let np = p + deltaTurns * (60 / effBpm) * 2;
        if (np < 0) np = 0;
        if (np >= DURATION) np = DURATION - 0.01;
        return np;
      });
    }
  };

  const doCue = () => {
    // jump to start (temporary cue behavior)
    setPosition(0);
  };

  const hitCue = (i: number) => {
    if (cues[i]) {
      // jump to that cue's stored position (fake positions spread across track)
      setPosition((DURATION / 8) * i);
    } else {
      // set a cue here
      setCues((c) => c.map((v, idx) => (idx === i ? true : v)));
    }
  };
  const clearCue = (i: number) => {
    setCues((c) => c.map((v, idx) => (idx === i ? false : v)));
  };

  const halveLoop = () => setLoopLen((l) => Math.max(0.25, l / 2));
  const doubleLoop = () => setLoopLen((l) => Math.min(32, l * 2));

  const loopLabel = (l: number) => (l < 1 ? "1/" + Math.round(1 / l) : String(l)) + " BEAT";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,0.06),transparent_60%)] text-amber-50 font-sans">
      {/* Header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-teal-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-teal-300 text-base leading-none drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">Deck&nbsp;B</span>
          <span className="text-[10px] font-mono tracking-wide text-teal-300/80 uppercase">Player B</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={"text-[10px] font-mono tracking-wide uppercase " + (playing ? "text-teal-300" : "text-neutral-500")}>{playing ? "▶ Playing" : "❚❚ Cued"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 p-3">

        {/* Displays row */}
        <div className="flex-none grid grid-cols-12 gap-2">
          {/* Title */}
          <div className="col-span-6 rounded-xl border border-teal-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 flex flex-col justify-center">
            <div className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 mb-1">Now Playing</div>
            <div className="h-9">
              <Readout
                value={trackTitle + "  —  " + trackArtist}
                placeholder="— NO TRACK —"
              />
            </div>
          </div>

          {/* BPM */}
          <div className="col-span-3 rounded-xl border border-teal-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">BPM</span>
              {sync && <span className="text-[9px] font-mono tracking-wide text-teal-300 uppercase">Sync</span>}
            </div>
            <div className="h-9">
              <Readout value={effBpm.toFixed(1)} />
            </div>
          </div>

          {/* Time */}
          <div className="col-span-3 rounded-xl border border-teal-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 flex flex-col justify-center">
            <button
              onClick={() => setTimeMode((m) => (m === "elapsed" ? "remaining" : "elapsed"))}
              className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 mb-1 text-left transition-all duration-200 ease-out hover:text-teal-300"
            >
              {timeMode === "elapsed" ? "Elapsed ▸" : "Remain ▸"}
            </button>
            <div className="h-9">
              <Readout value={fmt(displayedTime)} />
            </div>
          </div>
        </div>

        {/* Main deck region: tempo fader | platter | transport */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-3">

          {/* Tempo / Pitch fader */}
          <div className="col-span-2 rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col items-center">
            <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none text-center">Pitch</div>
            <div className="flex-1 min-h-0 flex items-stretch justify-center py-2">
              <div className="w-[2.2rem]">
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
            </div>
            <div className="font-mono font-bold tracking-tight text-teal-300 text-sm drop-shadow-[0_0_8px_rgba(45,212,191,0.35)] leading-none">
              {(tempo > 0 ? "+" : "") + tempo.toFixed(1)}%
            </div>
          </div>

          {/* Platter */}
          <div className="col-span-6 rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3 flex flex-col items-center justify-center">
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
              <div
                className={
                  "aspect-square h-full max-h-full max-w-full transition-shadow duration-500 ease-in-out rounded-full " +
                  (playing ? "shadow-[0_0_28px_rgba(45,212,191,0.45)]" : "")
                }
              >
                <JogWheel
                  rotation={rotation}
                  spinning={playing}
                  onScrub={onScrub}
                  onRotate={onRotate}
                />
              </div>
            </div>
            <div className="flex-none mt-2 flex items-center gap-3 text-[10px] font-mono tracking-wide text-neutral-500 uppercase">
              <span className={playing ? "text-teal-300" : ""}>{playing ? "33⅓ RPM" : "SCRUB"}</span>
              {loopActive && <span className="text-violet-300">LOOP {loopLabel(loopLen)}</span>}
            </div>
          </div>

          {/* Transport column */}
          <div className="col-span-4 flex flex-col gap-2">
            {/* Play / Pause */}
            <div className="flex-1 min-h-0 rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col">
              <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none mb-2">Transport</div>
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex-[2] min-h-[2.6rem]">
                  <ToggleButton on={playing} onChange={(o) => setPlaying(o)} tone="accent">
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[1.4em]">{playing ? "❚❚" : "▶"}</span>
                      <span className="text-[0.7em] tracking-wider mt-1">{playing ? "PAUSE" : "PLAY"}</span>
                    </span>
                  </ToggleButton>
                </div>
                <div className="flex-1 min-h-[1.75rem]">
                  <PushButton onPress={doCue} tone="neutral">
                    <span className="tracking-wider">CUE</span>
                  </PushButton>
                </div>
              </div>
            </div>

            {/* Sync + Keylock */}
            <div className="flex-none rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col gap-2">
              <div className="h-[1.9rem]">
                <ToggleButton on={sync} onChange={(o) => setSync(o)} tone="accent">
                  <span className="tracking-wider">SYNC</span>
                </ToggleButton>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Keylock</span>
                <div className="w-[3rem] h-[1.5rem] flex items-center justify-end">
                  <ToggleSwitch on={keylock} onChange={(o) => setKeylock(o)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loop controls */}
        <div className="flex-none rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none shrink-0">Loop</span>

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-[3rem] h-[1.75rem]">
                <PushButton onPress={halveLoop} tone="neutral">
                  <span className="text-[0.85em] tracking-wider">½</span>
                </PushButton>
              </div>
              <div className="w-[3rem] h-[1.75rem]">
                <PushButton onPress={doubleLoop} tone="neutral">
                  <span className="text-[0.85em] tracking-wider">×2</span>
                </PushButton>
              </div>
            </div>

            {/* Loop length knob */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-[2.6rem] h-[2.6rem]">
                <Knob
                  value={Math.log2(loopLen)}
                  min={-2}
                  max={5}
                  mode="stepped"
                  steps={[-2, -1, 0, 1, 2, 3, 4, 5]}
                  onChange={(v) => setLoopLen(Math.pow(2, Math.round(v)))}
                />
              </div>
              <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">Size</span>
            </div>

            {/* Loop length readout */}
            <div className="w-[6rem] h-[1.9rem] shrink-0">
              <Readout value={loopLabel(loopLen)} />
            </div>

            {/* Loop engage */}
            <div className="flex-1 min-w-0" />
            <div className="w-[6.5rem] h-[1.9rem] shrink-0">
              <ToggleButton on={loopActive} onChange={(o) => setLoopActive(o)} tone="neutral">
                <span className="tracking-wider">{loopActive ? "LOOP ON" : "LOOP OFF"}</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Hot Cues</span>
            <span className="text-[10px] font-mono tracking-wide text-neutral-500 uppercase">tap set · hold clear</span>
          </div>
          <div className="grid grid-cols-8 gap-2">
            {cues.map((armed, i) => (
              <div key={"cue-" + i} className="aspect-square min-h-[2.5rem]">
                <CuePad
                  armed={armed}
                  onPress={() => hitCue(i)}
                  onAltPress={() => clearCue(i)}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.1em]">{i + 1}</span>
                    <span className="text-[0.6em] tracking-wider mt-1">{armed ? "CUE" : "SET"}</span>
                  </span>
                </CuePad>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-teal-500/15">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wide text-neutral-400">
          <span className={playing ? "text-teal-300" : ""}>DECK&nbsp;B</span>
          <span>KEY&nbsp;<span className="text-amber-300">8A</span></span>
          <span>{keylock ? <span className="text-teal-300">KEYLOCK</span> : <span className="text-neutral-600">KEYLOCK</span>}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wide text-neutral-400">
          <span>→ WAVEFORM LANE B</span>
          <span className="text-teal-300">{effBpm.toFixed(1)} BPM</span>
        </div>
      </div>
    </div>
  );
}