export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [jogAngle, setJogAngle] = useState(0);
  const [playhead, setPlayhead] = useState(0); // 0..1 through track
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [loopLen, setLoopLen] = useState<number | null>(null);
  const [draggingJog, setDraggingJog] = useState(false);

  const baseBpm = 128.0;
  const bpm = baseBpm * (1 + pitch / 100);

  const jogRef = useRef<HTMLDivElement | null>(null);
  const faderRef = useRef<HTMLDivElement | null>(null);
  const lastAngle = useRef<number | null>(null);

  // Auto-advance playback (state-driven, never scrolls page)
  useEffect(() => {
    if (!playing || draggingJog) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0018 * (1 + pitch / 100)) % 1);
      setJogAngle((a) => (a + 4.2 * (1 + pitch / 100)) % 360);
    }, 40);
    return () => clearInterval(id);
  }, [playing, pitch, draggingJog]);

  const hotCues = useMemo(
    () => [
      { id: 0, label: "A", pos: 0.06 },
      { id: 1, label: "B", pos: 0.28 },
      { id: 2, label: "C", pos: 0.55 },
      { id: 3, label: "D", pos: 0.81 },
    ],
    []
  );

  const loops = [
    { id: 0, label: "1/4", val: 0.25 },
    { id: 1, label: "1/2", val: 0.5 },
    { id: 2, label: "1", val: 1 },
    { id: 3, label: "4", val: 4 },
  ];

  // Waveform bars — deterministic pseudo-random amplitudes
  const waveBars = useMemo(() => {
    const bars: number[] = [];
    let seed = 1337;
    for (let i = 0; i < 96; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const base = (seed % 1000) / 1000;
      const beat = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.55));
      bars.push(Math.min(1, 0.25 + base * 0.55 * beat + 0.2 * beat));
    }
    return bars;
  }, []);

  // Jog wheel drag → scratch
  const angleFromEvent = (clientX: number, clientY: number) => {
    const el = jogRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  const startJog = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraggingJog(true);
    lastAngle.current = angleFromEvent(e.clientX, e.clientY);
  };
  const moveJog = (e: React.PointerEvent) => {
    if (!draggingJog || lastAngle.current == null) return;
    const a = angleFromEvent(e.clientX, e.clientY);
    let delta = a - lastAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngle.current = a;
    setJogAngle((prev) => (prev + delta + 360) % 360);
    setPlayhead((p) => Math.max(0, Math.min(1, p + delta / 3200)));
  };
  const endJog = () => {
    setDraggingJog(false);
    lastAngle.current = null;
  };

  // Pitch fader drag
  const startFader = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFader(e.clientY);
    const mv = (ev: PointerEvent) => updateFader(ev.clientY);
    const up = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  };
  const updateFader = (clientY: number) => {
    const el = faderRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    // top = +8, bottom = -8
    setPitch(Math.round((8 - t * 16) * 10) / 10);
  };

  const timeStr = (frac: number) => {
    const total = 214; // seconds
    const s = Math.floor(frac * total);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return m + ":" + (rem < 10 ? "0" : "") + rem;
  };

  const faderTopPct = ((8 - pitch) / 16) * 100;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="h-8 shrink-0 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[11px]">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Deck A
          </span>
          <span className="text-[9px] font-medium uppercase tracking-widest text-stone-500">
            CH 1
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (playing
                ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse"
                : "bg-stone-700")
            }
          />
          <span className="text-[9px] uppercase tracking-widest text-stone-500">
            {playing ? "LIVE" : "CUE"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-2 flex flex-col gap-2">
        {/* Track info + BPM */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 min-w-0 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-1.5 flex flex-col justify-center">
            <div className="truncate text-[13px] font-semibold tracking-tight text-stone-100 leading-tight">
              Midnight Vector
            </div>
            <div className="truncate text-[11px] tracking-wide text-stone-500 leading-none mt-0.5">
              Lumen Drift — Neon Circuits EP
            </div>
          </div>
          <div className="shrink rounded-xl border border-amber-500/15 bg-neutral-900/90 px-2.5 py-1 flex flex-col items-center justify-center min-w-0">
            <span className="text-[9px] font-medium uppercase tracking-widest text-stone-400 leading-none">
              BPM
            </span>
            <span
              className={
                "font-mono font-bold tracking-tight leading-none mt-0.5 " +
                (synced ? "text-lime-300" : "text-amber-400")
              }
              style={{ fontSize: "20px" }}
            >
              {bpm.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 relative h-12 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden shadow-inner shadow-black/60">
          <div className="absolute inset-0 flex items-center">
            {waveBars.map((h, i) => {
              const barFrac = i / waveBars.length;
              const past = barFrac < playhead;
              const inLoop =
                loopLen != null &&
                barFrac >= playhead &&
                barFrac < playhead + loopLen * 0.12;
              return (
                <div
                  key={"wb-" + i}
                  className="flex-1 mx-[0.5px] flex flex-col items-center justify-center"
                >
                  <div
                    className={
                      "w-full rounded-sm transition-colors duration-100 " +
                      (inLoop
                        ? "bg-violet-400/80"
                        : past
                        ? "bg-amber-400/85"
                        : "bg-amber-400/25")
                    }
                    style={{ height: h * 100 + "%" }}
                  />
                </div>
              );
            })}
          </div>
          {/* beat grid */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={"bg-" + i}
                className="flex-1 border-r border-stone-600/20 last:border-r-0"
              />
            ))}
          </div>
          {/* playhead */}
          <div
            className="absolute top-0 bottom-0 w-px bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)] transition-all duration-100 ease-linear"
            style={{ left: playhead * 100 + "%" }}
          />
          {/* time overlay */}
          <div className="absolute bottom-0.5 left-1.5 font-mono text-[9px] font-bold text-lime-300 tracking-tight">
            {timeStr(playhead)}
          </div>
          <div className="absolute bottom-0.5 right-1.5 font-mono text-[9px] font-bold text-stone-400 tracking-tight">
            -{timeStr(1 - playhead)}
          </div>
        </div>

        {/* Main deck: jog + fader */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div
                ref={jogRef}
                onPointerDown={startJog}
                onPointerMove={moveJog}
                onPointerUp={endJog}
                onPointerCancel={endJog}
                className={
                  "relative aspect-square h-full max-h-full max-w-full rounded-full border-2 cursor-grab active:cursor-grabbing select-none touch-none transition-shadow duration-200 " +
                  (draggingJog
                    ? "border-amber-400/60 shadow-lg shadow-amber-500/30"
                    : "border-stone-700/80 shadow-lg shadow-black/50")
                }
                style={{
                  background:
                    "radial-gradient(circle at 50% 40%, rgba(41,37,36,0.6), rgba(0,0,0,0.85))",
                }}
              >
                {/* rotating platter surface */}
                <div
                  className="absolute inset-2 rounded-full border border-stone-800/60 shadow-inner shadow-black/70"
                  style={{
                    transform: "rotate(" + jogAngle + "deg)",
                    transition: draggingJog
                      ? "none"
                      : "transform 0.15s ease-out",
                    background:
                      "conic-gradient(from 0deg, rgba(251,191,36,0.05), rgba(41,37,36,0.4), rgba(251,191,36,0.05), rgba(41,37,36,0.4), rgba(251,191,36,0.05))",
                  }}
                >
                  {/* position marker */}
                  <div className="absolute left-1/2 top-1 -translate-x-1/2 h-3 w-1 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]" />
                  {/* tick marks */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={"tk-" + i}
                      className="absolute left-1/2 top-1/2 h-1/2 w-px origin-top"
                      style={{
                        transform:
                          "translateX(-0.5px) rotate(" + i * 15 + "deg)",
                      }}
                    >
                      <div
                        className={
                          "w-px " +
                          (i % 6 === 0
                            ? "h-2 bg-amber-400/40"
                            : "h-1 bg-stone-600/40")
                        }
                      />
                    </div>
                  ))}
                </div>
                {/* center well */}
                <div className="absolute inset-0 m-auto h-[42%] w-[42%] rounded-full border-2 border-stone-700/80 bg-black/70 shadow-inner shadow-black/80 flex flex-col items-center justify-center">
                  <span className="text-[8px] font-medium uppercase tracking-widest text-stone-500 leading-none">
                    {playing ? "PLAY" : "CUE"}
                  </span>
                  <span
                    className={
                      "font-mono text-[10px] font-bold leading-none mt-1 tracking-tight " +
                      (synced ? "text-lime-300" : "text-amber-400")
                    }
                  >
                    {timeStr(playhead)}
                  </span>
                  <span
                    className={
                      "mt-1 h-1.5 w-1.5 rounded-full transition-all duration-150 " +
                      (playing
                        ? "bg-lime-400 shadow-[0_0_5px_rgba(163,230,53,0.9)] animate-pulse"
                        : "bg-stone-700")
                    }
                  />
                </div>
              </div>
            </div>

            {/* Transport buttons */}
            <div className="shrink-0 grid grid-cols-2 gap-2">
              <button
                onPointerDown={() => setPlayhead(0)}
                className="group flex flex-col items-center justify-center rounded-lg border border-amber-500/25 bg-neutral-900/90 py-1.5 shadow-md shadow-black/40 transition-all duration-200 ease-out hover:bg-amber-400 hover:border-amber-400/60 hover:text-neutral-950 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-px active:translate-y-0 active:scale-95"
              >
                <span className="text-amber-400 group-hover:text-neutral-950 transition-colors leading-none text-sm">
                  ◉
                </span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-stone-300 group-hover:text-neutral-950 leading-none">
                  Cue
                </span>
              </button>
              <button
                onPointerDown={() => setPlaying((p) => !p)}
                className={
                  "group flex flex-col items-center justify-center rounded-lg border py-1.5 shadow-md transition-all duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-95 " +
                  (playing
                    ? "bg-lime-400/90 border-lime-300/50 text-neutral-950 shadow-lg shadow-lime-400/30"
                    : "bg-neutral-900/90 border-amber-500/25 text-stone-300 shadow-black/40 hover:bg-amber-400 hover:border-amber-400/60 hover:text-neutral-950 hover:shadow-lg hover:shadow-amber-500/40")
                }
              >
                <span className="leading-none text-sm">
                  {playing ? "❚❚" : "▶"}
                </span>
                <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider leading-none">
                  {playing ? "Pause" : "Play"}
                </span>
              </button>
            </div>
          </div>

          {/* Pitch fader + toggles column */}
          <div className="shrink w-20 flex flex-col gap-2 min-w-0">
            {/* Sync + Keylock */}
            <div className="shrink-0 grid grid-cols-2 gap-1.5">
              <button
                onPointerDown={() => setSynced((s) => !s)}
                className={
                  "flex flex-col items-center justify-center rounded-md border py-1 shadow-sm transition-all duration-200 ease-out active:scale-95 " +
                  (synced
                    ? "bg-lime-400/20 border-lime-400/50 text-lime-300 shadow-lg shadow-lime-400/30 animate-pulse"
                    : "bg-neutral-900/90 border-amber-500/25 text-stone-400 hover:border-amber-400/60 hover:text-amber-300")
                }
              >
                <span className="text-[9px] font-semibold uppercase tracking-wider leading-none">
                  Sync
                </span>
              </button>
              <button
                onPointerDown={() => setKeylock((k) => !k)}
                className={
                  "flex flex-col items-center justify-center rounded-md border py-1 shadow-sm transition-all duration-200 ease-out active:scale-95 " +
                  (keylock
                    ? "bg-violet-600/25 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/30 ring-1 ring-inset ring-violet-500/50"
                    : "bg-neutral-900/90 border-amber-500/25 text-stone-400 hover:border-violet-500/50 hover:text-violet-300")
                }
              >
                <span className="text-[9px] font-semibold uppercase tracking-wider leading-none">
                  Key
                </span>
              </button>
            </div>

            {/* Fader */}
            <div className="flex-1 min-h-0 flex items-stretch gap-1.5">
              <div className="flex-1 min-w-0 flex flex-col items-center">
                <span className="text-[8px] font-medium uppercase tracking-widest text-stone-500 leading-none mb-1">
                  Tempo
                </span>
                <div
                  ref={faderRef}
                  onPointerDown={startFader}
                  className="relative flex-1 min-h-0 w-full flex justify-center touch-none select-none cursor-ns-resize"
                >
                  {/* track */}
                  <div className="relative h-full w-1.5 rounded-full bg-stone-950/80 border border-stone-800/70 shadow-inner shadow-black/70">
                    {/* center detent */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-3 bg-amber-400/50" />
                    {/* filled */}
                    <div
                      className={
                        "absolute left-0 right-0 rounded-full transition-all duration-150 " +
                        (pitch >= 0
                          ? "bg-amber-400/40 bottom-1/2"
                          : "bg-violet-400/40 top-1/2")
                      }
                      style={
                        pitch >= 0
                          ? { height: (pitch / 8) * 50 + "%" }
                          : { height: (-pitch / 8) * 50 + "%" }
                      }
                    />
                    {/* handle */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-6 rounded-md border border-amber-500/40 bg-neutral-800 shadow-lg shadow-black/60 flex items-center justify-center transition-all duration-150"
                      style={{ top: faderTopPct + "%" }}
                    >
                      <div className="h-px w-3 bg-amber-400/70" />
                    </div>
                  </div>
                </div>
              </div>
              {/* value readout */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                <div className="rounded-md border border-stone-800/70 bg-stone-950/80 px-1 py-1.5 flex flex-col items-center">
                  <span
                    className={
                      "font-mono text-[11px] font-bold leading-none tracking-tight " +
                      (pitch === 0
                        ? "text-stone-100"
                        : pitch > 0
                        ? "text-amber-400"
                        : "text-violet-300")
                    }
                  >
                    {pitch > 0 ? "+" : ""}
                    {pitch.toFixed(1)}
                  </span>
                  <span className="text-[7px] uppercase tracking-widest text-stone-500 leading-none mt-0.5">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hot cues + loop controls */}
        <div className="shrink-0 flex flex-col gap-1.5">
          {/* Hot cue pads */}
          <div className="grid grid-cols-4 gap-1.5">
            {hotCues.map((c) => {
              const armed = activeCue === c.id;
              return (
                <button
                  key={"cue-" + c.id}
                  onPointerDown={() => {
                    setActiveCue(c.id);
                    setPlayhead(c.pos);
                  }}
                  className={
                    "relative flex items-center justify-center rounded-md border py-1.5 shadow-md shadow-black/40 transition-all duration-200 ease-out active:scale-95 " +
                    (armed
                      ? "bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-lg shadow-amber-500/30 animate-pulse"
                      : "bg-neutral-900/90 border-amber-400/30 text-stone-400 hover:border-amber-400/60 hover:text-amber-300 hover:shadow-md hover:shadow-amber-500/30")
                  }
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider leading-none">
                    {c.label}
                  </span>
                  <span
                    className={
                      "absolute top-1 right-1 h-1 w-1 rounded-full " +
                      (armed ? "bg-amber-300" : "bg-stone-700")
                    }
                  />
                </button>
              );
            })}
          </div>
          {/* Loop row */}
          <div className="grid grid-cols-4 gap-1.5">
            {loops.map((l) => {
              const on = loopLen === l.val;
              return (
                <button
                  key={"loop-" + l.id}
                  onPointerDown={() =>
                    setLoopLen((prev) => (prev === l.val ? null : l.val))
                  }
                  className={
                    "flex flex-col items-center justify-center rounded-md border py-1 shadow-sm transition-all duration-200 ease-out active:scale-95 " +
                    (on
                      ? "bg-violet-600/25 border-violet-500/50 text-violet-300 shadow-lg shadow-violet-500/30 ring-1 ring-inset ring-violet-500/50"
                      : "bg-stone-950/80 border-stone-700/60 text-stone-400 hover:border-violet-500/50 hover:text-violet-300")
                  }
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider leading-none">
                    {l.label}
                  </span>
                  <span className="text-[7px] uppercase tracking-widest text-stone-600 leading-none mt-0.5">
                    beat
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-6 shrink-0 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {keylock ? (
            <span className="text-violet-300">KEYLOCK ON</span>
          ) : (
            "DECK A"
          )}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {synced ? (
            <span className="text-lime-300">● SYNC LOCK</span>
          ) : loopLen != null ? (
            <span className="text-violet-300">LOOP {loops.find((l) => l.val === loopLen)?.label}</span>
          ) : (
            <span className="text-lime-300">{bpm.toFixed(1)} BPM</span>
          )}
        </span>
      </div>
    </div>
  );
}