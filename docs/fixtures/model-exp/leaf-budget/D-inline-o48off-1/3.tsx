export default function GeneratedComponent() {
  // ---- Deck B (teal/cyan identity) core state ----
  const DURATION = 254; // seconds
  const [baseBpm] = useState(126.0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(38.4);
  const [tempo, setTempo] = useState(0); // percentage -8..+8
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [spinBoost, setSpinBoost] = useState(1); // scrub velocity multiplier

  // ---- Loop state ----
  const LOOP_SIZES = [1, 2, 4, 8, 16, 32];
  const [loopActive, setLoopActive] = useState(false);
  const [loopIdx, setLoopIdx] = useState(2); // -> 4 beats

  // ---- Hot cues ----
  const [cues, setCues] = useState<(number | null)[]>([12.5, 64.0, null, 128.75]);
  const [activeCue, setActiveCue] = useState<number | null>(null);

  const effTempo = useMemo(() => 1 + tempo / 100, [tempo]);
  const displayBpm = useMemo(() => baseBpm * effTempo, [baseBpm, effTempo]);

  // ---- Playback + platter animation ----
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  useEffect(() => {
    const tick = (t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;

      if (playing) {
        setPosition((p) => {
          let next = p + dt * effTempo * spinBoost;
          if (next >= DURATION) next = 0;
          if (next < 0) next = 0;
          return next;
        });
        setRotation((r) => (r + dt * 300 * effTempo * spinBoost) % 360);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [playing, effTempo, spinBoost]);

  // decay any scrub boost back to nominal
  useEffect(() => {
    if (spinBoost === 1) return;
    const id = setInterval(() => {
      setSpinBoost((s) => {
        const n = s + (1 - s) * 0.25;
        return Math.abs(n - 1) < 0.02 ? 1 : n;
      });
    }, 40);
    return () => clearInterval(id);
  }, [spinBoost]);

  // ---- Waveform-ish sample bed for the mini overview inside displays (not required, small) ----
  const fmt = (s: number) => {
    const sign = s < 0 ? "-" : "";
    const a = Math.abs(s);
    const m = Math.floor(a / 60);
    const sec = Math.floor(a % 60);
    const ms = Math.floor((a - Math.floor(a)) * 100);
    return sign + m + ":" + String(sec).padStart(2, "0") + "." + String(ms).padStart(2, "0");
  };

  const remaining = DURATION - position;

  const handleCue = (i: number) => {
    setCues((prev) => {
      const copy = [...prev];
      if (copy[i] == null) {
        copy[i] = position; // set cue at current position
      }
      return copy;
    });
    setActiveCue(i);
    setCues((prev) => {
      const target = prev[i];
      if (target != null) setPosition(target);
      return prev;
    });
    setTimeout(() => setActiveCue((c) => (c === i ? null : c)), 220);
  };

  const handleAltCue = (i: number) => {
    // delete cue
    setCues((prev) => {
      const copy = [...prev];
      copy[i] = null;
      return copy;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* Ambient deck-B tint overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(45,212,191,0.06),transparent_60%)]" />

      {/* HEADER */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-teal-500/25">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-block h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.7)]" />
          <span className="text-sm font-semibold tracking-wide uppercase text-teal-100 truncate">
            Deck B — Right Player
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">CH·B</span>
      </div>

      {/* BODY */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TOP: Displays row */}
        <div className="flex-none grid grid-cols-12 gap-3">
          {/* Track title */}
          <div className="col-span-6 flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Track</span>
            <div className="h-[3rem]">
              <Readout value={"Nocturne Drift — Kaelo"} placeholder="No track loaded" />
            </div>
          </div>
          {/* BPM */}
          <div className="col-span-3 flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">BPM</span>
            <div className="h-[3rem]">
              <Readout value={displayBpm.toFixed(1)} />
            </div>
          </div>
          {/* Key badge (decorative meta, part of title-display grouping) */}
          <div className="col-span-3 flex flex-col gap-1">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Pitch</span>
            <div className="h-[3rem]">
              <Readout value={(tempo >= 0 ? "+" : "") + tempo.toFixed(1) + "%"} />
            </div>
          </div>
        </div>

        {/* TIME row */}
        <div className="flex-none grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-neutral-500">Elapsed</span>
            <div className="h-[1.9rem]">
              <Readout value={fmt(position)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] tracking-wide uppercase text-neutral-500 text-right">Remaining</span>
            <div className="h-[1.9rem]">
              <Readout value={"-" + fmt(remaining)} />
            </div>
          </div>
        </div>

        {/* MAIN control zone: Jog + Tempo + Transport */}
        <div className="flex-1 grid grid-cols-12 gap-3">
          {/* LEFT: Jog platter + transport under it */}
          <div className="col-span-7 flex flex-col gap-3">
            {/* Platter */}
            <div className="flex-1 rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex items-center justify-center">
              <div
                className={
                  "aspect-square h-full max-h-full rounded-full transition-shadow duration-500 " +
                  (playing ? "shadow-[0_0_16px_rgba(45,212,191,0.4)]" : "shadow-none")
                }
              >
                <div className="h-full w-full">
                  <JogWheel
                    rotation={rotation}
                    spinning={playing}
                    onScrub={(velocity) => {
                      setSpinBoost(velocity);
                    }}
                    onRotate={(deltaTurns) => {
                      setPosition((p) => {
                        let next = p + deltaTurns * (60 / displayBpm) * 4; // ~1 turn = 4 beats scrub
                        if (next < 0) next = 0;
                        if (next > DURATION) next = DURATION;
                        return next;
                      });
                      setRotation((r) => (r + deltaTurns * 360) % 360);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Transport row: CUE + PLAY + SYNC */}
            <div className="flex-none grid grid-cols-12 gap-2 items-stretch">
              <div className="col-span-4 flex flex-col items-stretch">
                <div className="h-[2.75rem]">
                  <PushButton onPress={() => setPosition((p) => (p > 0 ? 0 : p))} tone="neutral">
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[1.1em]">◀◀</span>
                      <span className="text-[0.7em] tracking-wider">CUE</span>
                    </span>
                  </PushButton>
                </div>
              </div>
              <div className="col-span-4 flex flex-col items-stretch">
                <div className="h-[2.75rem]">
                  <ToggleButton on={playing} onChange={(o) => setPlaying(o)} tone="accent">
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[1.1em]">{playing ? "❚❚" : "►"}</span>
                      <span className="text-[0.7em] tracking-wider">{playing ? "PAUSE" : "PLAY"}</span>
                    </span>
                  </ToggleButton>
                </div>
              </div>
              <div className="col-span-4 flex flex-col items-stretch">
                <div className="h-[2.75rem]">
                  <ToggleButton on={sync} onChange={(o) => setSync(o)} tone="neutral">
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[1.05em]">⟳</span>
                      <span className="text-[0.7em] tracking-wider">SYNC</span>
                    </span>
                  </ToggleButton>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Tempo fader + keylock */}
          <div className="col-span-5 grid grid-cols-2 gap-3">
            {/* Tempo fader */}
            <div className="rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-inner shadow-black/70 p-2 flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Tempo</span>
              <div className="flex-1 flex items-center justify-center">
                <div className="h-full w-[2.2rem] flex items-center justify-center">
                  <div className="h-full">
                    <Fader
                      value={tempo}
                      min={-8}
                      max={8}
                      onChange={(v) => setTempo(v)}
                      orientation="vertical"
                      bipolar
                      detents={[0]}
                    />
                  </div>
                </div>
              </div>
              <span className="font-mono font-bold tracking-tight text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)] text-[13px]">
                {(tempo >= 0 ? "+" : "") + tempo.toFixed(1)}
              </span>
            </div>

            {/* Keylock + status column */}
            <div className="flex flex-col gap-3">
              <div className="flex-none rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 flex flex-col items-center gap-2">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Keylock</span>
                <div className="h-[1.5rem] w-[3rem]">
                  <ToggleSwitch on={keylock} onChange={(o) => setKeylock(o)} />
                </div>
                <span
                  className={
                    "font-mono text-[10px] tracking-widest uppercase " +
                    (keylock ? "text-teal-300" : "text-neutral-500")
                  }
                >
                  {keylock ? "LOCKED" : "OFF"}
                </span>
              </div>

              {/* Playback status indicator fills remaining */}
              <div className="flex-1 min-h-0 rounded-2xl border border-teal-500/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 flex flex-col justify-center items-center gap-2">
                <span className="text-[10px] tracking-widest uppercase text-neutral-500">Status</span>
                <span
                  className={
                    "font-mono font-bold tracking-wider uppercase text-[15px] transition-colors duration-200 " +
                    (playing
                      ? "text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                      : "text-neutral-500")
                  }
                >
                  {playing ? "PLAYING" : "CUED"}
                </span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={"beat-" + i}
                      className={
                        "h-1.5 w-1.5 rounded-full transition-all duration-100 " +
                        (playing && Math.floor((position / (60 / displayBpm)) % 4) === i
                          ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.7)]"
                          : "bg-neutral-700")
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM: Loop controls + Hot cues */}
        <div className="flex-none grid grid-cols-12 gap-3">
          {/* Loop controls */}
          <div className="col-span-5 rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Loop</span>
            <div className="flex items-center gap-2">
              {/* Loop size knob */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-[2.5rem] w-[2.5rem]">
                  <Knob
                    value={loopIdx}
                    min={0}
                    max={LOOP_SIZES.length - 1}
                    onChange={(v) => setLoopIdx(Math.round(v))}
                    mode="stepped"
                    steps={LOOP_SIZES.map((_, i) => i)}
                  />
                </div>
                <span className="text-[9px] tracking-widest uppercase text-neutral-500">Size</span>
              </div>
              {/* Loop length readout */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="h-[1.5rem]">
                  <Readout value={LOOP_SIZES[loopIdx] + " BEAT"} />
                </div>
                {/* Loop on/off */}
                <div className="h-[1.75rem]">
                  <PushButton
                    onPress={() => setLoopActive((a) => !a)}
                    tone={loopActive ? "accent" : "neutral"}
                  >
                    <span className="text-[0.75em] tracking-wider">
                      {loopActive ? "LOOP ON" : "LOOP"}
                    </span>
                  </PushButton>
                </div>
              </div>
            </div>
          </div>

          {/* Hot cue pads */}
          <div className="col-span-7 rounded-2xl border border-teal-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Hot Cues</span>
            <div className="grid grid-cols-4 gap-2">
              {cues.map((c, i) => (
                <div key={"cue-" + i} className="flex flex-col items-center gap-1">
                  <div className="h-[2.5rem] w-full aspect-square max-w-[2.75rem]">
                    <CuePad
                      armed={c != null}
                      onPress={() => handleCue(i)}
                      onAltPress={() => handleAltCue(i)}
                    >
                      <span className="flex flex-col items-center leading-none">
                        <span className="text-[1.05em] font-bold">{i + 1}</span>
                        <span className="text-[0.55em] tracking-wide">
                          {c != null ? fmt(c).slice(0, 4) : "—"}
                        </span>
                      </span>
                    </CuePad>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER STATUS STRIP */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-teal-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">
          → WAVEFORM · SYNCING LANE B
        </span>
        <span
          className={
            "font-mono text-[10px] tracking-wide " +
            (loopActive ? "text-teal-300" : "text-neutral-500")
          }
        >
          {loopActive ? "LOOP " + LOOP_SIZES[loopIdx] + "b ACTIVE" : "LOOP IDLE"}
        </span>
      </div>
    </div>
  );
}