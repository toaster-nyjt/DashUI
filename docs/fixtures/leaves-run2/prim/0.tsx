export default function GeneratedComponent() {
  const trackData = useMemo(() => {
    return {
      title: "Molten Skyline",
      artist: "Aurelia & The Nightform",
      baseBpm: 124.0,
      key: "8A",
      duration: "6:42",
    };
  }, []);

  const waveform = useMemo(() => {
    const arr: number[] = [];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < 220; i++) {
      const beat = Math.abs(Math.sin(i * 0.42)) * 0.55;
      const kick = i % 16 < 2 ? 0.42 : 0;
      const noise = rnd() * 0.35;
      arr.push(Math.min(1, 0.12 + beat + kick + noise));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 220; i += 16) g.push(i / 220);
    return g;
  }, []);

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [cueStored] = useState(0.18);
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [loopLen, setLoopLen] = useState(4);
  const [loopActive, setLoopActive] = useState(false);

  const cues = useMemo(
    () => [
      { pos: 0.05, color: "amber" },
      { pos: 0.22, color: "amber" },
      { pos: 0.44, color: "amber" },
      { pos: 0.71, color: "amber" },
    ],
    []
  );

  const bpm = useMemo(() => trackData.baseBpm * (1 + pitch / 100), [pitch, trackData.baseBpm]);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    lastRef.current = performance.now();
    const tick = (t: number) => {
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;
      const speed = 1 + pitch / 100;
      setPlayhead((p) => {
        let np = p + dt * 0.045 * speed;
        if (np >= 1) np = 0;
        return np;
      });
      setJogAngle((a) => a + dt * 3.6 * speed);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, pitch]);

  const handleScrub = (delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => Math.max(0, Math.min(1, p + delta * 0.02)));
  };

  const handleWaveScrub = (pos: number) => {
    setPlayhead(Math.max(0, Math.min(1, pos)));
  };

  const handleCue = () => {
    setPlayhead(cueStored);
    setPlaying(false);
  };

  const loopOptions = [1, 2, 4, 8, 16];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-[radial-gradient(120%_120%_at_50%_-10%,#221a10_0%,#0c0b0a_55%,#050505_100%)] text-neutral-100">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400/90 leading-none">
            Deck A
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-600 leading-none">
            CH1
          </span>
        </div>
        <div
          className={
            "flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest leading-none transition-colors duration-200 " +
            (playing ? "text-amber-300" : "text-neutral-600")
          }
        >
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (playing
                ? "bg-amber-400 shadow-[0_0_10px_-1px] shadow-amber-500/70 animate-pulse"
                : "bg-neutral-700")
            }
          />
          {playing ? "Playing" : "Cued"}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col gap-2">
        {/* Track info + BPM row */}
        <div className="flex items-stretch gap-2 shrink-0">
          <div className="flex-1 min-w-0 rounded-lg border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm overflow-hidden">
            <div className="h-full px-2.5 py-1.5 flex flex-col justify-center min-w-0">
              <Readout>
                <div className="min-w-0 flex flex-col leading-tight">
                  <span className="text-[13px] font-semibold text-amber-300 truncate">
                    {trackData.title}
                  </span>
                  <span className="text-[11px] font-normal text-neutral-500 truncate">
                    {trackData.artist}
                  </span>
                </div>
              </Readout>
            </div>
          </div>
          <div className="w-[92px] shrink-0 rounded-lg border border-amber-400/20 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center px-1 py-1">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-amber-300 leading-none">
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 mt-0.5">
                  BPM · {trackData.key}
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 h-12 rounded-lg border border-white/[0.06] bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="h-full w-full">
            <Waveform
              data={waveform}
              playhead={playhead}
              beatGrid={beatGrid}
              zoom={0.5}
              onScrub={handleWaveScrub}
            />
          </div>
        </div>

        {/* Main control zone: jog + pitch */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-2">
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
              <div
                className={
                  "aspect-square h-full max-h-full max-w-full rounded-full border border-neutral-700/70 transition-shadow duration-200 " +
                  (playing ? "shadow-[0_0_16px_-2px] shadow-amber-500/60" : "shadow-none")
                }
              >
                <JogWheel value={jogAngle} onScrub={handleScrub} />
              </div>
            </div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-neutral-500 leading-none">
              Jog · Scratch
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="w-14 shrink-0 min-h-0 flex flex-col items-center rounded-2xl border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm p-1.5 gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">
              Pitch
            </span>
            <div className="flex-1 min-h-0 w-full flex items-stretch justify-center">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={setPitch}
                orientation="vertical"
              />
            </div>
            <span className="font-mono text-[11px] font-bold tabular-nums text-amber-300 leading-none">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
            </span>
          </div>
        </div>

        {/* Transport row */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5">
          <div className="h-9 min-w-0">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest leading-none">
                {playing ? (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 4.5v15l13-7.5z" />
                  </svg>
                )}
                {playing ? "Pause" : "Play"}
              </span>
            </ToggleButton>
          </div>
          <div className="h-9 min-w-0">
            <Button onPress={handleCue}>
              <span className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest leading-none">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5" />
                </svg>
                Cue
              </span>
            </Button>
          </div>
          <div className="h-9 min-w-0">
            <ToggleButton on={sync} onChange={setSync}>
              <span className="text-[10px] font-semibold uppercase tracking-widest leading-none">
                Sync
              </span>
            </ToggleButton>
          </div>
          <div className="h-9 min-w-0">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-widest leading-none">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="5" y="11" width="14" height="9" rx="1.5" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
                Key
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cues + loop */}
        <div className="shrink-0 flex items-stretch gap-2">
          {/* Hot cue pads */}
          <div className="flex-1 min-w-0 grid grid-cols-4 gap-1.5">
            {cues.map((c, i) => (
              <div key={"cue-" + i} className="h-9 min-w-0">
                <Pad
                  active={activeCue === i}
                  onPress={() => {
                    setActiveCue(i);
                    setPlayhead(c.pos);
                  }}
                >
                  <span className="text-[10px] font-bold tabular-nums leading-none">
                    {i + 1}
                  </span>
                </Pad>
              </div>
            ))}
          </div>

          {/* Loop controls */}
          <div className="w-[120px] shrink-0 flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="w-8 h-7 shrink-0">
                <Button
                  onPress={() =>
                    setLoopLen((l) => {
                      const idx = loopOptions.indexOf(l);
                      return loopOptions[Math.max(0, idx - 1)];
                    })
                  }
                >
                  <span className="text-[13px] font-bold leading-none">-</span>
                </Button>
              </div>
              <div className="flex-1 min-w-0 h-7">
                <Readout>
                  <div className="flex flex-col items-center leading-none">
                    <span className="font-mono text-[13px] font-bold tabular-nums text-amber-300 leading-none">
                      {loopLen}
                    </span>
                    <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500">
                      beats
                    </span>
                  </div>
                </Readout>
              </div>
              <div className="w-8 h-7 shrink-0">
                <Button
                  onPress={() =>
                    setLoopLen((l) => {
                      const idx = loopOptions.indexOf(l);
                      return loopOptions[Math.min(loopOptions.length - 1, idx + 1)];
                    })
                  }
                >
                  <span className="text-[13px] font-bold leading-none">+</span>
                </Button>
              </div>
            </div>
            <div className="h-7 w-full">
              <ToggleButton on={loopActive} onChange={setLoopActive}>
                <span className="text-[10px] font-semibold uppercase tracking-widest leading-none">
                  Loop
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="tabular-nums">
          {(playhead * 100).toFixed(0)}% · {trackData.duration}
        </span>
        <span className="flex items-center gap-2">
          <span className={sync ? "text-amber-400" : "text-neutral-600"}>
            {sync ? "SYNC ON" : "SYNC"}
          </span>
          <span className={keylock ? "text-amber-400" : "text-neutral-600"}>
            {keylock ? "KEY LOCK" : "KEY"}
          </span>
        </span>
      </div>
    </div>
  );
}