export default function GeneratedComponent() {
  const trackData = useMemo(() => {
    return { title: "MIDNIGHT VELOCITY", artist: "Solar Drift", baseBpm: 128.0, keyName: "8A" };
  }, []);

  const waveData = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < 200; i++) {
      const env = 0.35 + 0.35 * Math.sin(i * 0.08) + 0.2 * Math.sin(i * 0.31);
      const kick = i % 16 < 2 ? 0.4 : 0;
      const noise = Math.abs(Math.sin(i * 1.7)) * 0.25;
      pts.push(Math.min(1, Math.max(0.05, env + kick + noise)));
    }
    return pts;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 32; i++) g.push(i / 32);
    return g;
  }, []);

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.12);
  const [pitch, setPitch] = useState(0);
  const [jogAngle, setJogAngle] = useState(0);
  const [keylock, setKeylock] = useState(true);
  const [synced, setSynced] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [loopLen, setLoopLen] = useState(4);
  const [looping, setLooping] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);

  const cues = useMemo(() => {
    return [
      { id: 0, pos: 0.05 },
      { id: 1, pos: 0.28 },
      { id: 2, pos: 0.51 },
      { id: 3, pos: 0.77 },
    ];
  }, []);

  const displayBpm = useMemo(() => {
    return (trackData.baseBpm * (1 + pitch / 100)).toFixed(1);
  }, [pitch, trackData.baseBpm]);

  useEffect(() => {
    if (!playing) return;
    const speed = (1 + pitch / 100) * 0.0009;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let next = p + speed;
        if (looping) {
          const loopStart = Math.floor(p * 32) / 32;
          const loopEnd = loopStart + loopLen / 32;
          if (next >= loopEnd) next = loopStart;
        }
        if (next >= 1) next = 0;
        return next;
      });
      setJogAngle((a) => a + speed * Math.PI * 8);
    }, 40);
    return () => clearInterval(id);
  }, [playing, pitch, looping, loopLen]);

  const loopOptions = [1, 2, 4, 8, 16];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-2 leading-none">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
          Deck A · Channel 1
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (playing ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-stone-700")
            }
          />
          <span className="text-[10px] uppercase tracking-widest text-stone-500">
            {playing ? "Live" : "Cued"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM row */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 min-w-0 rounded-xl border border-stone-800/70 bg-stone-950/80 px-2 py-1.5 flex flex-col justify-center">
            <Readout>
              <div className="min-w-0">
                <div className="font-semibold uppercase tracking-wider text-[11px] text-amber-200 truncate">
                  {trackData.title}
                </div>
                <div className="font-normal tracking-wide text-[10px] text-stone-500 truncate leading-none mt-0.5">
                  {trackData.artist}
                </div>
              </div>
            </Readout>
          </div>
          <div className="w-20 shrink-0 rounded-xl border border-stone-800/70 bg-black/70 px-1.5 py-1 flex flex-col items-center justify-center">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight text-base " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {displayBpm}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-stone-500 mt-0.5">
                  BPM · {trackData.keyName}
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 h-12 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden p-1">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.6}
            onScrub={(pos) => {
              setPlayhead(pos);
              setJogAngle(pos * Math.PI * 12);
            }}
          />
        </div>

        {/* Jog + Pitch + transport main region */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 min-w-0 min-h-0 rounded-xl border border-stone-800/70 bg-black/70 shadow-inner shadow-black/70 p-2 flex flex-col">
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="relative h-full aspect-square max-h-full">
                <JogWheel
                  value={jogAngle}
                  onScrub={(delta) => {
                    setScrubbing(true);
                    setJogAngle((a) => a + delta);
                    setPlayhead((p) => {
                      let next = p + delta / (Math.PI * 12);
                      if (next >= 1) next -= 1;
                      if (next < 0) next += 1;
                      return next;
                    });
                    setTimeout(() => setScrubbing(false), 120);
                  }}
                />
              </div>
            </div>
            <div className="shrink-0 flex items-center justify-center mt-1">
              <span
                className={
                  "text-[9px] uppercase tracking-widest transition-all duration-200 " +
                  (scrubbing ? "text-amber-300" : "text-stone-500")
                }
              >
                {scrubbing ? "Scratch" : "Platter A"}
              </span>
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="w-14 shrink-0 rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 flex flex-col items-center">
            <span className="text-[9px] font-medium uppercase tracking-widest text-stone-400 leading-none mb-1">
              Pitch
            </span>
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span
              className={
                "text-[10px] font-mono font-bold leading-none mt-1 " +
                (pitch === 0 ? "text-stone-100" : pitch > 0 ? "text-amber-400" : "text-violet-300")
              }
            >
              {pitch > 0 ? "+" : ""}
              {pitch.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5">
          {cues.map((c) => (
            <div key={"cue-" + c.id} className="h-9">
              <Pad
                active={activeCue === c.id}
                onPress={() => {
                  setActiveCue(c.id);
                  setPlayhead(c.pos);
                  setJogAngle(c.pos * Math.PI * 12);
                }}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {"CUE " + (c.id + 1)}
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls + transport buttons */}
        <div className="shrink-0 flex gap-1.5">
          {/* Loop cluster */}
          <div className="flex-1 min-w-0 flex items-stretch gap-1.5">
            <div className="w-12 shrink-0 rounded-lg border border-stone-800/70 bg-black/70 flex flex-col items-center justify-center px-1">
              <Readout>
                <div className="flex flex-col items-center leading-none">
                  <span className="font-mono font-bold text-sm text-amber-400">{loopLen}</span>
                  <span className="text-[8px] uppercase tracking-widest text-stone-500 mt-0.5">
                    beats
                  </span>
                </div>
              </Readout>
            </div>
            <div className="h-10 flex-1 min-w-0">
              <Button
                onPress={() => {
                  const idx = loopOptions.indexOf(loopLen);
                  const prev = idx <= 0 ? loopOptions[0] : loopOptions[idx - 1];
                  setLoopLen(prev);
                }}
              >
                <span className="text-sm font-semibold">½</span>
              </Button>
            </div>
            <div className="h-10 flex-1 min-w-0">
              <Button
                onPress={() => {
                  const idx = loopOptions.indexOf(loopLen);
                  const next =
                    idx >= loopOptions.length - 1 ? loopOptions[loopOptions.length - 1] : loopOptions[idx + 1];
                  setLoopLen(next);
                }}
              >
                <span className="text-sm font-semibold">×2</span>
              </Button>
            </div>
            <div className="h-10 flex-[1.3] min-w-0">
              <ToggleButton on={looping} onChange={setLooping}>
                <span className="text-[10px] font-semibold uppercase tracking-wider">Loop</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Bottom transport row */}
        <div className="shrink-0 grid grid-cols-5 gap-1.5">
          <div className="h-11">
            <Button
              onPress={() => {
                setPlaying(false);
                setPlayhead(cues[0].pos);
                setActiveCue(0);
                setJogAngle(cues[0].pos * Math.PI * 12);
              }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                Cue
              </span>
            </Button>
          </div>
          <div className="h-11 col-span-2">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {playing ? "Pause" : "Play"}
              </span>
            </ToggleButton>
          </div>
          <div className="h-11">
            <ToggleButton on={synced} onChange={setSynced}>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
          </div>
          <div className="h-11">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="text-[10px] font-semibold uppercase tracking-wider">Key</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-6 shrink-0 flex items-center px-3 border-t border-stone-800/70 bg-stone-950/70 gap-3">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">Out → Ch 1</span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500 ml-auto">
          {synced ? (
            <span className="text-lime-300">Beat-Locked</span>
          ) : keylock ? (
            <span className="text-violet-300">Keylock On</span>
          ) : (
            <span className="text-stone-500">Free Pitch</span>
          )}
        </span>
      </div>
    </div>
  );
}