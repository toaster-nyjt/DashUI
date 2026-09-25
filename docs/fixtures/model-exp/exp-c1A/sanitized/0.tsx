export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.12);
  const [pitch, setPitch] = useState(0);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [jogAngle, setJogAngle] = useState(0);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [cues, setCues] = useState([
    { set: true, pos: 0.05 },
    { set: true, pos: 0.32 },
    { set: false, pos: 0 },
    { set: false, pos: 0 },
  ]);

  const waveform = useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => {
        const t = i / 160;
        let v = Math.abs(Math.sin(i * 0.19)) * 0.5 + 0.22;
        v *= 0.5 + 0.5 * Math.sin(t * Math.PI * 3);
        if (i % 8 === 0) v = Math.min(1, v + 0.42);
        v += 0.07 * Math.sin(i * 1.3);
        return Math.max(0.05, Math.min(1, v));
      }),
    []
  );
  const beatGrid = useMemo(() => Array.from({ length: 33 }, (_, i) => i / 32), []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      const speed = 0.0022 * (1 + pitch / 100);
      setPlayhead((p) => {
        let n = p + speed;
        if (n >= 1) n = 0;
        return n;
      });
      setJogAngle((a) => a + 0.28 * (1 + pitch / 100));
    }, 60);
    return () => clearInterval(id);
  }, [isPlaying, pitch]);

  const bpm = (128 * (1 + pitch / 100)).toFixed(1);
  const pitchLabel = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";
  const currentBeat = Math.floor(playhead * 32) % 4;

  const fmtLoop = (b) => {
    if (b >= 1) return String(b);
    return "1/" + Math.round(1 / b);
  };

  const handleCueBtn = () => {
    setIsPlaying(false);
    setPlayhead(cues[0].set ? cues[0].pos : 0);
  };
  const handlePad = (i) => {
    const c = cues[i];
    if (c.set) {
      setPlayhead(c.pos);
    } else {
      setCues((prev) => prev.map((x, j) => (j === i ? { set: true, pos: playhead } : x)));
    }
  };
  const handleSync = (on) => {
    setSynced(on);
    if (on) setPitch(0);
  };
  const handleJog = (delta) => {
    setJogAngle((a) => a + delta);
    if (!isPlaying) {
      setPlayhead((p) => Math.min(1, Math.max(0, p + delta * 0.03)));
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header chrome */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-2 w-2 rounded-full transition-all duration-200 " +
              (isPlaying
                ? "bg-amber-400 animate-pulse shadow-lg shadow-amber-500/50"
                : "bg-stone-700")
            }
          />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck A
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={"beat-" + i}
                className={
                  "h-1.5 w-1.5 rounded-full transition-all duration-100 " +
                  (isPlaying && i === currentBeat
                    ? "bg-lime-400 shadow shadow-lime-400/50"
                    : "bg-stone-700/70")
                }
              />
            ))}
          </div>
          <span className="font-medium uppercase tracking-widest text-[10px] text-amber-400">
            CH 1
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Left zone */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Info row */}
          <div className="h-10 flex-none flex gap-2">
            <div className="flex-1">
              <Readout>
                <span className="flex flex-col items-start leading-tight">
                  <span className="font-semibold tracking-tight text-stone-100">
                    Midnight Voltage
                  </span>
                  <span className="text-[0.72em] tracking-wide text-stone-400">Kav0s</span>
                </span>
              </Readout>
            </div>
            <div className="w-24">
              <Readout>
                <span className="flex flex-col items-center leading-none">
                  <span
                    className={
                      "font-mono font-bold tracking-tight " +
                      (synced ? "text-lime-300" : "text-amber-400")
                    }
                  >
                    {bpm}
                  </span>
                  <span className="text-[0.5em] tracking-widest text-stone-500">BPM</span>
                </span>
              </Readout>
            </div>
          </div>

          {/* Waveform */}
          <div className="h-11 flex-none">
            <Waveform
              data={waveform}
              playhead={playhead}
              beatGrid={beatGrid}
              zoom={0.6}
              onScrub={(p) => setPlayhead(p)}
            />
          </div>

          {/* Deck core: jog + transport */}
          <div className="flex-1 flex gap-2">
            <div className="h-full aspect-square flex-none">
              <JogWheel value={jogAngle} onScrub={handleJog} />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex-[2]">
                <ToggleButton on={isPlaying} onChange={setIsPlaying}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.7em]">{isPlaying ? "❚❚" : "▶"}</span>
                    <span className="text-[0.7em] font-semibold uppercase tracking-wider">
                      {isPlaying ? "Pause" : "Play"}
                    </span>
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <Button onPress={handleCueBtn}>
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </Button>
              </div>
              <div className="flex-1">
                <ToggleButton on={synced} onChange={handleSync}>
                  <span
                    className={
                      "font-semibold uppercase tracking-wider " +
                      (synced ? "animate-pulse" : "")
                    }
                  >
                    Sync
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Hot cue pads */}
          <div className="h-11 flex-none flex gap-2">
            {cues.map((c, i) => (
              <div key={"cue-" + i} className="flex-1">
                <Pad active={c.set} onPress={() => handlePad(i)}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-bold">{i + 1}</span>
                    <span className="text-[0.5em] uppercase tracking-widest">
                      {c.set ? "Cue" : "Set"}
                    </span>
                  </span>
                </Pad>
              </div>
            ))}
          </div>

          {/* Loop controls */}
          <div className="h-9 flex-none flex items-stretch gap-2">
            <div className="flex-none flex items-center px-1 text-[10px] font-medium uppercase tracking-widest text-stone-400">
              Loop
            </div>
            <div className="flex-1">
              <Button onPress={() => setLoopBeats((b) => Math.max(0.125, b / 2))}>
                <span className="font-semibold tracking-wider">½</span>
              </Button>
            </div>
            <div className="w-14">
              <Readout>
                <span className="flex flex-col items-center leading-none">
                  <span
                    className={
                      "font-mono font-bold " +
                      (loopActive ? "text-lime-300" : "text-stone-100")
                    }
                  >
                    {fmtLoop(loopBeats)}
                  </span>
                  <span className="text-[0.5em] uppercase tracking-widest text-stone-500">
                    Beat
                  </span>
                </span>
              </Readout>
            </div>
            <div className="flex-1">
              <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
                <span className="font-semibold tracking-wider">×2</span>
              </Button>
            </div>
            <div className="flex-1">
              <Button onPress={() => setLoopActive((v) => !v)}>
                <span
                  className={
                    "font-semibold uppercase tracking-wider " +
                    (loopActive ? "text-lime-300 animate-pulse" : "")
                  }
                >
                  Loop
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Right rail: tempo */}
        <div className="w-16 flex-none flex flex-col items-center gap-1 py-1">
          <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400">
            Tempo
          </span>
          <div className="flex-1 w-8">
            <Fader
              min={-8}
              max={8}
              value={pitch}
              onChange={setPitch}
              orientation="vertical"
            />
          </div>
          <span
            className={
              "font-mono font-bold text-[11px] tracking-tight transition-colors duration-200 " +
              (synced ? "text-lime-300" : "text-amber-400")
            }
          >
            {pitchLabel}
          </span>
          <div className="w-full h-8">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Key</span>
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}