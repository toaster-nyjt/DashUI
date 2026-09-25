export default function GeneratedComponent() {
  const TRACK = {
    title: "MIDNIGHT PROTOCOL",
    artist: "Vela Kroon",
    baseBpm: 128.0,
    key: "8A",
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [jogAngle, setJogAngle] = useState(0);
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);
  const [scratching, setScratching] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  // Static-ish waveform data (violet lane / Deck B identity)
  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = Math.abs(Math.sin(t * Math.PI * 24));
      const swell = 0.35 + 0.65 * Math.abs(Math.sin(t * Math.PI * 3));
      const grit = 0.15 * Math.abs(Math.sin(t * 57.13 + 1.7));
      arr.push(Math.min(1, beat * 0.55 * swell + grit + 0.08));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let b = 0; b <= 32; b++) g.push(b / 32);
    return g;
  }, []);

  const effectiveBpm = TRACK.baseBpm * (1 + pitch / 100);

  // Playback advance loop (state-driven, never scrolls page)
  useEffect(() => {
    if (!isPlaying) {
      lastTsRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const speed = (1 + pitch / 100) * 0.02; // fraction per second
      setPlayhead((p) => {
        let np = p + dt * speed;
        if (loopOn) {
          const start = 0.18;
          const span = (loopBeats / 32) * 0.9;
          if (np > start + span) np = start;
        }
        if (np >= 1) np = 0;
        return np;
      });
      if (!scratching) setJogAngle((a) => a + dt * speed * Math.PI * 30);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, pitch, loopOn, loopBeats, scratching]);

  const handleCue = () => {
    setPlayhead(0.18);
    setIsPlaying(false);
  };

  const handleScrub = (pos: number) => {
    setPlayhead(Math.max(0, Math.min(1, pos)));
  };

  const handleJog = (delta: number) => {
    setScratching(true);
    setJogAngle((a) => a + delta);
    setPlayhead((p) => Math.max(0, Math.min(1, p + delta / (Math.PI * 40))));
    window.clearTimeout((handleJog as any)._t);
    (handleJog as any)._t = window.setTimeout(() => setScratching(false), 140);
  };

  const cueColors = ["A", "B", "C", "D"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header / title bar */}
      <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-violet-400 text-[11px]">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (isPlaying ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-stone-700")
            }
          />
          <span className="text-[10px] uppercase tracking-widest text-stone-500">CH 2</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM row */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 basis-0 min-w-0 rounded-xl border border-stone-800/70 bg-stone-950/80 p-1.5">
            <Readout>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="truncate font-semibold text-[11px] text-stone-100 tracking-tight">
                  {TRACK.title}
                </span>
                <span className="truncate text-[10px] text-stone-500 tracking-wide">
                  {TRACK.artist}
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-[92px] rounded-xl border border-stone-800/70 bg-black/70 p-1.5 flex flex-col items-center justify-center">
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight leading-none text-lg " +
                  (synced ? "text-lime-300" : "text-amber-400")
                }
              >
                {effectiveBpm.toFixed(1)}
              </span>
            </Readout>
            <span className="mt-0.5 text-[9px] uppercase tracking-widest text-stone-500">
              BPM · {TRACK.key}
            </span>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 h-16 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden p-1">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={handleScrub}
          />
        </div>

        {/* Main control zone: jog wheel + pitch fader */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 rounded-xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 flex flex-col items-center justify-center gap-2 shadow-2xl shadow-black/60">
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <div className="h-full aspect-square max-h-full">
                <JogWheel value={jogAngle} onScrub={handleJog} />
              </div>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-stone-500">
              {scratching ? "SCRATCH" : "PLATTER"}
            </span>
          </div>

          {/* Pitch fader column */}
          <div className="w-[70px] rounded-xl border border-stone-800/70 bg-stone-950/80 p-2 flex flex-col items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-widest text-stone-400">Pitch</span>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span
              className={
                "font-mono font-bold text-[11px] tracking-tight " +
                (pitch === 0 ? "text-stone-100" : pitch > 0 ? "text-amber-400" : "text-violet-300")
              }
            >
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
            </span>
          </div>
        </div>

        {/* Transport row */}
        <div className="shrink-0 grid grid-cols-4 gap-2">
          <div className="h-11">
            <Button onPress={handleCue}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Cue</span>
            </Button>
          </div>
          <div className="h-11">
            <ToggleButton on={isPlaying} onChange={setIsPlaying}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {isPlaying ? "Play" : "Pause"}
              </span>
            </ToggleButton>
          </div>
          <div className="h-11">
            <ToggleButton on={synced} onChange={setSynced}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Sync</span>
            </ToggleButton>
          </div>
          <div className="h-11">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider text-[10px]">Keylock</span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-2">
          {cueColors.map((label, i) => (
            <div key={"cue-" + i} className="h-12">
              <Pad
                active={activeCue === i}
                onPress={() => {
                  setActiveCue(i);
                  setPlayhead(0.1 + i * 0.2);
                }}
              >
                <div className="flex flex-col items-center leading-none gap-0.5">
                  <span className="font-semibold uppercase tracking-wider text-[12px]">{label}</span>
                  <span className="text-[8px] uppercase tracking-widest opacity-70">CUE</span>
                </div>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="h-10 flex-1 basis-0 min-w-0">
            <Button onPress={() => setLoopBeats((b) => Math.max(1, b / 2))}>
              <span className="font-semibold tracking-wider text-[12px]">½</span>
            </Button>
          </div>
          <div className="h-10 w-[86px] rounded-lg border border-stone-800/70 bg-black/70 flex flex-col items-center justify-center">
            <Readout>
              <span className="font-mono font-bold text-amber-400 text-sm tracking-tight leading-none">
                {loopBeats >= 1 ? loopBeats : loopBeats.toFixed(2)}
              </span>
            </Readout>
            <span className="text-[8px] uppercase tracking-widest text-stone-500 mt-0.5">Beats</span>
          </div>
          <div className="h-10 flex-1 basis-0 min-w-0">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold tracking-wider text-[12px]">×2</span>
            </Button>
          </div>
          <div className="h-10 flex-1 basis-0 min-w-0">
            <ToggleButton on={loopOn} onChange={setLoopOn}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Loop</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer / status strip */}
      <div className="h-6 shrink-0 flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Pos <span className="text-lime-300">{Math.round(playhead * 100)}%</span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {synced ? <span className="text-lime-300">Synced</span> : "Free"} · {keylock ? "Key ●" : "Key ○"}
        </span>
      </div>
    </div>
  );
}