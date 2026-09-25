export default function GeneratedComponent() {
  const WAVE_LEN = 96;

  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < WAVE_LEN; i++) {
      const env =
        0.35 +
        0.4 * Math.abs(Math.sin(i * 0.18)) +
        0.25 * Math.abs(Math.sin(i * 0.53 + 1.1)) +
        (i % 8 === 0 ? 0.2 : 0);
      arr.push(Math.min(1, env));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < WAVE_LEN; i += 8) g.push(i / WAVE_LEN);
    return g;
  }, []);

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.22);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [jog, setJog] = useState(0);

  const baseBpm = 126.0;
  const bpm = useMemo(
    () => (baseBpm * (1 + pitch / 100)).toFixed(1),
    [pitch]
  );

  const loopSizes = [1, 2, 4, 8, 16];
  const [loopIdx, setLoopIdx] = useState(2);
  const [loopOn, setLoopOn] = useState(false);

  const [activeCue, setActiveCue] = useState<number | null>(1);
  const cueColors = ["A", "B", "C", "D"];

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    lastRef.current = performance.now();
    const tick = (t: number) => {
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;
      const rate = (Number(bpm) / 60) * 0.06;
      setPlayhead((p) => {
        let np = p + dt * rate;
        if (np > 1) np -= 1;
        return np;
      });
      setJog((j) => j + dt * rate * Math.PI * 2);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, bpm]);

  const handleScrub = (pos: number) => setPlayhead(pos);
  const handleJog = (delta: number) => {
    setJog((j) => j + delta);
    setPlayhead((p) => {
      let np = p + delta / (Math.PI * 12);
      if (np > 1) np -= 1;
      if (np < 0) np += 1;
      return np;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-violet-500/20 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <span className="h-2 w-2 rounded-full bg-violet-400 shadow-lg shadow-violet-500/40 animate-pulse" />
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck B
        </span>
        <span className="ml-auto font-medium uppercase tracking-widest text-[10px] text-violet-300">
          CH 2
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM row */}
        <div className="flex items-stretch gap-2 min-h-0">
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex">
            <Readout>
              <div className="flex flex-col items-start justify-center w-full min-w-0 px-1">
                <span className="font-semibold text-[12px] text-stone-100 truncate w-full">
                  Midnight Circuit
                </span>
                <span className="font-normal tracking-wide text-[10px] text-stone-500 truncate w-full">
                  Aphex Nocturne
                </span>
              </div>
            </Readout>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight leading-none " +
                  (sync ? "text-lime-300" : "text-violet-300")
                }
              >
                {bpm}
              </span>
            </Readout>
            <span className="mt-0.5 font-medium uppercase tracking-widest text-[9px] text-stone-500">
              BPM
            </span>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="h-16 flex">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.6}
            onScrub={handleScrub}
          />
        </div>

        {/* Middle: jog + transport + pitch */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog wheel */}
          <div className="flex flex-col items-center justify-center">
            <div className="h-24 w-24 flex">
              <JogWheel value={jog} onScrub={handleJog} />
            </div>
            <span className="mt-1 font-medium uppercase tracking-widest text-[9px] text-stone-500">
              Jog
            </span>
          </div>

          {/* Transport controls */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex flex-col justify-center gap-2">
            <div className="flex items-stretch gap-2">
              <div className="flex-1 basis-0 min-w-0 flex flex-col items-stretch">
                <div className="h-10 flex">
                  <Button onPress={() => setPlayhead(0)}>
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      Cue
                    </span>
                  </Button>
                </div>
              </div>
              <div className="flex-1 basis-0 min-w-0 flex flex-col items-stretch">
                <div className="h-10 flex">
                  <ToggleButton on={playing} onChange={setPlaying}>
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      {playing ? "❚❚" : "▶"}
                    </span>
                  </ToggleButton>
                </div>
              </div>
            </div>

            <div className="flex items-stretch gap-2">
              <div className="flex-1 basis-0 min-w-0 flex flex-col items-stretch">
                <div className="h-9 flex">
                  <ToggleButton on={sync} onChange={setSync}>
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Sync
                    </span>
                  </ToggleButton>
                </div>
              </div>
              <div className="flex-1 basis-0 min-w-0 flex flex-col items-stretch">
                <div className="h-9 flex">
                  <ToggleButton on={keylock} onChange={setKeylock}>
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Key
                    </span>
                  </ToggleButton>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch fader */}
          <div className="flex flex-col items-center justify-between">
            <span className="font-mono font-bold text-[10px] text-violet-300 leading-none">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
            <div className="flex-1 min-h-0 flex py-1">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => setPitch(Number(v.toFixed(1)))}
                orientation="vertical"
              />
            </div>
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">
              Pitch
            </span>
          </div>
        </div>

        {/* Loop controls */}
        <div className="flex items-stretch gap-2">
          <div className="flex flex-col items-stretch">
            <div className="h-9 flex">
              <ToggleButton on={loopOn} onChange={setLoopOn}>
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Loop
                </span>
              </ToggleButton>
            </div>
          </div>
          <div className="flex flex-col items-stretch">
            <div className="h-9 flex">
              <Button
                onPress={() =>
                  setLoopIdx((i) => Math.max(0, i - 1))
                }
              >
                <span className="font-semibold text-[13px]">÷2</span>
              </Button>
            </div>
          </div>
          <div className="flex-1 basis-0 min-w-0 flex">
            <Readout>
              <span className="font-mono font-bold tracking-tight text-violet-300 leading-none">
                {loopSizes[loopIdx]} BEAT
              </span>
            </Readout>
          </div>
          <div className="flex flex-col items-stretch">
            <div className="h-9 flex">
              <Button
                onPress={() =>
                  setLoopIdx((i) =>
                    Math.min(loopSizes.length - 1, i + 1)
                  )
                }
              >
                <span className="font-semibold text-[13px]">×2</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="grid grid-cols-4 gap-2">
          {cueColors.map((label, i) => (
            <div key={"cue-" + i} className="h-11 flex">
              <Pad
                active={activeCue === i}
                onPress={() =>
                  setActiveCue((c) => (c === i ? null : i))
                }
              >
                <span className="font-semibold uppercase tracking-wider text-[12px]">
                  {label}
                </span>
              </Pad>
            </div>
          ))}
        </div>
      </div>

      {/* Footer status */}
      <div className="h-6 flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
          {playing ? "PLAYING" : "PAUSED"}
        </span>
        <span className="ml-auto font-medium uppercase tracking-widest text-[10px] text-stone-500">
          POS{" "}
          <span className="font-mono text-lime-300">
            {Math.round(playhead * 100)}%
          </span>
        </span>
      </div>
    </div>
  );
}