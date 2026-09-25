export default function GeneratedComponent() {
  // ---------- Track / transport state ----------
  const [track] = useState({
    title: "MIDNIGHT PROTOCOL",
    artist: "Vektral",
    bpm: 128,
    key: "8A",
  });

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);

  // ---------- Loop state ----------
  const loopSizes = [1, 2, 4, 8];
  const [loopIdx, setLoopIdx] = useState(1);
  const [loopActive, setLoopActive] = useState(false);

  // ---------- Hot cue state ----------
  const [cues, setCues] = useState<boolean[]>([true, true, false, false]);

  // ---------- Derived BPM ----------
  const effectiveBpm = useMemo(
    () => (track.bpm * (1 + pitch / 100)).toFixed(1),
    [track.bpm, pitch]
  );

  // ---------- Waveform sample data ----------
  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const kick = Math.pow(Math.abs(Math.sin(t * Math.PI * 32)), 6);
      const body = 0.35 + 0.4 * Math.abs(Math.sin(t * Math.PI * 9));
      const noise = 0.15 * Math.sin(i * 12.9898) * Math.cos(i * 3.233);
      arr.push(Math.min(1, Math.max(0.05, body * 0.6 + kick * 0.6 + Math.abs(noise))));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 32; i++) g.push(i / 32);
    return g;
  }, []);

  // ---------- Playback advance (no page scroll — pure state) ----------
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const speed = 0.0016 * (1 + pitch / 100);
        let next = p + speed;
        if (loopActive) {
          const loopLen = 0.02 * loopSizes[loopIdx];
          const loopStart = 0.18;
          if (next > loopStart + loopLen) next = loopStart;
        }
        if (next > 1) next = 0;
        return next;
      });
    }, 60);
    return () => clearInterval(id);
  }, [playing, pitch, loopActive, loopIdx]);

  // ---------- Jog wheel scrub ----------
  const [jogAngle, setJogAngle] = useState(0);
  const handleScrub = useCallback(
    (delta: number) => {
      setJogAngle((a) => a + delta);
      if (!playing) {
        setPlayhead((p) => Math.min(1, Math.max(0, p + delta * 0.02)));
      }
    },
    [playing]
  );

  const handleWaveScrub = useCallback((pos: number) => {
    setPlayhead(Math.min(1, Math.max(0, pos)));
  }, []);

  const toggleCue = (i: number) =>
    setCues((c) => c.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* ---------- HEADER ---------- */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[11px]">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck A
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          CH 1
        </span>
      </div>

      {/* ---------- BODY ---------- */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2 overflow-hidden">
        {/* Track info + BPM readouts */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 min-w-0">
            <Readout>
              <span className="flex flex-col leading-tight">
                <span className="font-semibold tracking-wide text-amber-300">
                  {track.title}
                </span>
                <span className="text-[0.72em] font-normal tracking-wide text-stone-400">
                  {track.artist}
                </span>
              </span>
            </Readout>
          </div>
          <div className="flex-none w-[5.5rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (synced ? "text-lime-300" : "text-amber-400")}>
                  {effectiveBpm}
                </span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500 mt-0.5">
                  {"BPM · " + track.key}
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="flex-none w-full h-[3rem]">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.5}
            onScrub={handleWaveScrub}
          />
        </div>

        {/* Jog wheel + right-side controls */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog wheel */}
          <div className="flex-none w-[8.5rem] flex flex-col items-center justify-center gap-1">
            <div className="w-[8rem] h-[8rem]">
              <JogWheel value={jogAngle} onScrub={handleScrub} />
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
              Jog
            </span>
          </div>

          {/* Right control column */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Pitch fader + label */}
            <div className="flex-1 min-h-0 flex items-stretch gap-2">
              <div className="flex-none w-[1.6rem] flex flex-col items-center">
                <div className="flex-1 min-h-0 flex items-center">
                  <div className="h-[6rem]">
                    <Fader
                      min={-8}
                      max={8}
                      value={pitch}
                      onChange={setPitch}
                      orientation="vertical"
                    />
                  </div>
                </div>
              </div>

              {/* Sync + Keylock toggles */}
              <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
                <ToggleButton on={synced} onChange={setSynced}>
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                </ToggleButton>
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-semibold uppercase tracking-wider text-[0.85em]">
                    Keylock
                  </span>
                </ToggleButton>
                <div className="flex flex-col items-center leading-none">
                  <span className="font-mono font-bold tracking-tight text-amber-400 text-[0.9em]">
                    {(pitch > 0 ? "+" : "") + pitch.toFixed(1) + "%"}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-stone-500 mt-0.5">
                    Pitch
                  </span>
                </div>
              </div>
            </div>

            {/* Transport: Cue + Play */}
            <div className="flex-none flex items-stretch gap-2">
              <div className="flex-1 min-w-0 h-[2rem]">
                <Button onPress={() => setPlayhead(0.18)}>
                  <span className="font-semibold uppercase tracking-wider text-amber-300">
                    Cue
                  </span>
                </Button>
              </div>
              <div className="flex-1 min-w-0 h-[2rem]">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="font-semibold uppercase tracking-wider">
                    {playing ? "Pause" : "Play"}
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Loop controls */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-none w-[2.6rem]">
            <Button onPress={() => setLoopIdx((i) => Math.max(0, i - 1))}>
              <span className="font-semibold">½</span>
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <Readout>
              <span className="flex items-center justify-center gap-1 leading-none">
                <span className="font-mono font-bold tracking-tight text-amber-400">
                  {loopSizes[loopIdx]}
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">
                  Beat Loop
                </span>
              </span>
            </Readout>
          </div>
          <div className="flex-none w-[2.6rem]">
            <Button onPress={() => setLoopIdx((i) => Math.min(loopSizes.length - 1, i + 1))}>
              <span className="font-semibold">×2</span>
            </Button>
          </div>
          <div className="flex-none w-[3.4rem]">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="font-semibold uppercase tracking-wider text-[0.8em]">
                Loop
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none grid grid-cols-4 gap-2">
          {cues.map((active, i) => (
            <div key={"cue-" + i} className="h-[2.25rem]">
              <Pad active={active} onPress={() => toggleCue(i)}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">
                    {i + 1}
                  </span>
                  <span className="text-[0.55em] uppercase tracking-widest opacity-70 mt-0.5">
                    Cue
                  </span>
                </span>
              </Pad>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {playing ? "Playing" : "Cued"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Pos{" "}
          <span className="text-lime-300 font-mono">
            {(playhead * 100).toFixed(0) + "%"}
          </span>
        </span>
      </div>
    </div>
  );
}