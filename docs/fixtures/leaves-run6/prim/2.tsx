export default function GeneratedComponent() {
  const TRACK = { title: "Neon Mirage", artist: "Violet Cascade", bpm: 126.0 };

  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [loopLen, setLoopLen] = useState(4); // beats
  const [loopOn, setLoopOn] = useState(false);
  const [cueHeld, setCueHeld] = useState(false);

  const effectiveBpm = useMemo(
    () => TRACK.bpm * (1 + pitch / 100),
    [pitch]
  );

  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const base =
        Math.abs(Math.sin(t * Math.PI * 9)) * 0.55 +
        Math.abs(Math.sin(t * Math.PI * 23)) * 0.28 +
        Math.abs(Math.sin(t * Math.PI * 3)) * 0.35;
      const swell = 0.55 + 0.45 * Math.sin(t * Math.PI * 2);
      const spike = i % 16 === 0 ? 0.25 : 0;
      arr.push(Math.min(1, base * swell + spike + 0.06));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 32; i++) g.push(i / 32);
    return g;
  }, []);

  // playback advance
  useEffect(() => {
    if (!playing) return;
    const perTick = effectiveBpm / 60 / 40 / 64; // ~beats/sec scaled to bar fraction
    const id = setInterval(() => {
      setPlayhead((p) => {
        let np = p + perTick;
        if (loopOn) {
          const loopSpan = loopLen / 32;
          const start = Math.floor(p / loopSpan) * loopSpan;
          if (np >= start + loopSpan) np = start;
        }
        if (np >= 1) np = 0;
        return np;
      });
      setJogAngle((a) => a + perTick * Math.PI * 12);
    }, 25);
    return () => clearInterval(id);
  }, [playing, effectiveBpm, loopOn, loopLen]);

  const doSync = (on: boolean) => {
    setSynced(on);
    if (on) setPitch(2.4); // pretend to match Deck A
  };

  const loopSizes = [1, 2, 4, 8, 16];
  const cueColors = 6;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <span className="text-violet-400 mr-2 leading-none">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck B
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (playing ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-stone-700")
            }
          />
          <span className="text-[10px] uppercase tracking-widest text-stone-500">
            CH2
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-3">
        {/* Track + BPM readouts */}
        <div className="flex gap-2">
          <div className="flex-1 min-w-0">
            <Readout>
              <div className="flex flex-col items-start min-w-0 w-full leading-tight">
                <span className="font-semibold text-[13px] text-stone-100 truncate w-full">
                  {TRACK.title}
                </span>
                <span className="text-[11px] tracking-wide text-stone-500 truncate w-full">
                  {TRACK.artist}
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-[7.5rem]">
            <Readout>
              <div className="flex flex-col items-end leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight text-lg " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {effectiveBpm.toFixed(1)}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-stone-500 mt-0.5">
                  {synced ? "Synced" : "BPM"}
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="h-[3.25rem]">
          <div className="h-full w-full rounded-xl border border-stone-800/70 bg-stone-950/80 p-1 shadow-inner shadow-black/60">
            <Waveform
              data={waveData}
              playhead={playhead}
              beatGrid={beatGrid}
              zoom={0.55}
              onScrub={(pos) => setPlayhead(pos)}
            />
          </div>
        </div>

        {/* Main control zone: jog + right column */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel */}
          <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center">
            <div className="aspect-square h-full max-h-full">
              <JogWheel value={jogAngle} onScrub={(d) => {
                setJogAngle((a) => a + d);
                setPlayhead((p) => Math.min(1, Math.max(0, p + d / (Math.PI * 60))));
              }} />
            </div>
          </div>

          {/* Right column: pitch fader + level + toggles */}
          <div className="flex flex-col gap-2 items-stretch w-[8.5rem]">
            {/* Pitch fader + readout */}
            <div className="flex-1 min-h-0 flex gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2">
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <Fader
                  min={-8}
                  max={8}
                  value={pitch}
                  onChange={(v) => {
                    setPitch(v);
                    if (synced) setSynced(false);
                  }}
                  orientation="vertical"
                />
              </div>
              <div className="flex flex-col items-center justify-between py-0.5">
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-medium">
                  Pitch
                </span>
                <span
                  className={
                    "font-mono font-bold tracking-tight text-xs " +
                    (pitch === 0 ? "text-stone-100" : "text-amber-400")
                  }
                >
                  {(pitch > 0 ? "+" : "") + pitch.toFixed(1)}
                </span>
                <span className="text-[8px] uppercase tracking-widest text-stone-600">
                  %
                </span>
              </div>
            </div>

            {/* Sync + Keylock toggles */}
            <div className="flex gap-2 h-[2.25rem]">
              <div className="flex-1 min-w-0">
                <ToggleButton on={synced} onChange={doSync}>
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Sync
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1 min-w-0">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Key
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Transport: Cue + Play */}
        <div className="flex gap-2 h-[2.5rem]">
          <div className="flex-1 min-w-0">
            <Button
              onPress={() => {
                setCueHeld(true);
                if (activeCue !== null) setPlayhead(0.02);
                setTimeout(() => setCueHeld(false), 160);
              }}
            >
              <span className="flex items-center justify-center gap-1.5 font-semibold uppercase tracking-wider text-[11px]">
                <span
                  className={
                    "h-2 w-2 rounded-full transition-all duration-200 " +
                    (cueHeld ? "bg-red-500 shadow-lg shadow-red-500/40" : "bg-red-400/70")
                  }
                />
                Cue
              </span>
            </Button>
          </div>
          <div className="flex-[1.4] min-w-0">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="flex items-center justify-center gap-1.5 font-semibold uppercase tracking-wider text-[11px]">
                {playing ? (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 5v14l12-7z" />
                  </svg>
                )}
                {playing ? "Playing" : "Play"}
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="grid grid-cols-6 gap-1.5 h-[2.75rem]">
          {Array.from({ length: cueColors }).map((_, i) => (
            <Pad
              key={"cue-" + i}
              active={activeCue === i}
              onPress={() => {
                setActiveCue(i);
                setPlayhead((i + 0.5) / cueColors * 0.9 + 0.02);
              }}
            >
              <span className="font-semibold text-[11px]">{i + 1}</span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex items-stretch gap-2 h-[2.5rem]">
          <div className="w-[4rem]">
            <ToggleButton on={loopOn} onChange={setLoopOn}>
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Loop
              </span>
            </ToggleButton>
          </div>
          <div className="flex-1 min-w-0 flex gap-1.5">
            <div className="flex-1 min-w-0">
              <Button
                onPress={() =>
                  setLoopLen((l) => Math.max(loopSizes[0], loopSizes[Math.max(0, loopSizes.indexOf(l) - 1)]))
                }
              >
                <span className="font-semibold text-sm leading-none">½</span>
              </Button>
            </div>
            <div className="flex-[1.3] min-w-0">
              <Readout>
                <div className="flex flex-col items-center leading-none">
                  <span className="font-mono font-bold tracking-tight text-sm text-amber-400">
                    {loopLen}
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-stone-500 mt-0.5">
                    beat
                  </span>
                </div>
              </Readout>
            </div>
            <div className="flex-1 min-w-0">
              <Button
                onPress={() =>
                  setLoopLen((l) => Math.min(loopSizes[loopSizes.length - 1], loopSizes[Math.min(loopSizes.length - 1, loopSizes.indexOf(l) + 1)]))
                }
              >
                <span className="font-semibold text-sm leading-none">×2</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-6 flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Pos
        </span>
        <span className="font-mono text-[10px] text-lime-300">
          {(playhead * 100).toFixed(1)}%
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-stone-500">
          {keylock ? "Keylock On" : "Keylock Off"}
        </span>
        <span
          className={
            "text-[10px] uppercase tracking-widest " +
            (loopOn ? "text-violet-300" : "text-stone-600")
          }
        >
          {loopOn ? loopLen + "B Loop" : "No Loop"}
        </span>
      </div>
    </div>
  );
}