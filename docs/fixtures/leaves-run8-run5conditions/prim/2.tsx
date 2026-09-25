export default function GeneratedComponent() {
  const BASE_BPM = 128.0;
  const [bpm, setBpm] = useState(BASE_BPM);
  const [pitch, setPitch] = useState(0); // -8..8 percent
  const [isPlaying, setIsPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);

  // Static-ish waveform data (Deck B / violet lane)
  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 220; i++) {
      const env =
        0.35 +
        0.4 * Math.abs(Math.sin(i * 0.11)) +
        0.25 * Math.abs(Math.sin(i * 0.031 + 1.2));
      const kick = i % 16 < 2 ? 0.9 : 0;
      arr.push(Math.min(1, env + kick * 0.5 + (Math.sin(i * 0.7) * 0.12 + 0.12)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let b = 0; b <= 32; b++) g.push(b / 32);
    return g;
  }, []);

  // Advance playhead + jog while playing
  useEffect(() => {
    if (!isPlaying) return;
    const speed = (bpm / BASE_BPM) * 0.0016;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const np = p + speed;
        return np >= 1 ? 0 : np;
      });
      setJogAngle((a) => a + speed * Math.PI * 8);
    }, 33);
    return () => clearInterval(id);
  }, [isPlaying, bpm]);

  // Pitch affects BPM (unless synced overrides on press)
  useEffect(() => {
    if (!synced) setBpm(BASE_BPM * (1 + pitch / 100));
  }, [pitch, synced]);

  const handleSync = (on: boolean) => {
    setSynced(on);
    if (on) {
      setBpm(BASE_BPM); // matched to Deck A downbeat
      setPitch(0);
    }
  };

  const handleScrub = (pos: number) => {
    setPlayhead(pos);
  };

  const handleJog = (delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => {
      const np = p + delta / (Math.PI * 60);
      return np < 0 ? 1 + np : np >= 1 ? np - 1 : np;
    });
  };

  const cueLabels = ["A", "B", "C", "D"];
  const loopSizes = [1, 2, 4, 8];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "inline-block h-2 w-2 rounded-full " +
              (isPlaying ? "bg-violet-400 animate-pulse" : "bg-stone-600")
            }
          />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
            CH2
          </span>
          <span
            className={
              "font-mono font-bold tracking-tight text-[11px] " +
              (synced ? "text-lime-300" : "text-violet-300")
            }
          >
            {bpm.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM readouts */}
        <div className="shrink-0 flex gap-2">
          <div className="flex-1 min-w-0">
            <Readout>
              <div className="flex flex-col min-w-0 text-left leading-tight">
                <span className="font-semibold text-stone-100 text-sm truncate">
                  Neon Mirage
                </span>
                <span className="font-normal tracking-wide text-[11px] text-stone-500 truncate">
                  Violet Circuit
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-24 shrink-0">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">
                  BPM
                </span>
                <span
                  className={
                    "font-mono font-bold tracking-tight text-lg " +
                    (synced ? "text-lime-300" : "text-violet-300")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 h-16 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/60 overflow-hidden p-1">
          <div className="h-full w-full">
            <Waveform
              data={waveData}
              playhead={playhead}
              beatGrid={beatGrid}
              zoom={0.6}
              onScrub={handleScrub}
            />
          </div>
        </div>

        {/* Main deck area: pitch fader | jog wheel | meters column */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Pitch fader */}
          <div className="w-14 shrink-0 flex flex-col items-center gap-1 rounded-xl border border-stone-800/70 bg-neutral-900/90 bg-gradient-to-b from-stone-800/30 to-neutral-950/60 py-2">
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-400">
              Pitch
            </span>
            <div className="flex-1 min-h-0 flex items-center">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => {
                  if (synced) setSynced(false);
                  setPitch(v);
                }}
                orientation="vertical"
              />
            </div>
            <span
              className={
                "font-mono font-bold tracking-tight text-[11px] " +
                (pitch === 0 ? "text-stone-300" : "text-violet-300")
              }
            >
              {(pitch > 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
          </div>

          {/* Jog wheel */}
          <div className="flex-1 min-w-0 flex items-center justify-center rounded-xl border border-stone-800/70 bg-black/40 shadow-inner shadow-black/70 p-2">
            <div className="h-full aspect-square max-h-full flex items-center justify-center">
              <JogWheel value={jogAngle} onScrub={handleJog} />
            </div>
          </div>

          {/* Sync + Keylock column */}
          <div className="w-16 shrink-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0">
              <ToggleButton on={synced} onChange={handleSync}>
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Sync
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1 min-h-0">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <div className="flex flex-col items-center leading-none">
                  <span className="text-[13px]">🔒</span>
                  <span className="font-semibold uppercase tracking-wider text-[8px]">
                    Key
                  </span>
                </div>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Transport: Cue + Play */}
        <div className="shrink-0 h-11 flex gap-2">
          <div className="flex-1">
            <Button onPress={() => setPlayhead(0)}>
              <span className="font-semibold uppercase tracking-wider text-[11px] text-red-300">
                ◀ Cue
              </span>
            </Button>
          </div>
          <div className="flex-[1.4]">
            <ToggleButton on={isPlaying} onChange={setIsPlaying}>
              <span className="font-semibold uppercase tracking-wider text-[12px]">
                {isPlaying ? "❚❚ Pause" : "▶ Play"}
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 h-12 grid grid-cols-4 gap-2">
          {cueLabels.map((label, i) => (
            <Pad
              key={"cue-" + i}
              active={activeCue === i}
              onPress={() => {
                setActiveCue(i);
                setPlayhead(i * 0.25);
              }}
            >
              <div className="flex flex-col items-center leading-none">
                <span className="font-semibold uppercase tracking-wider text-[13px]">
                  {label}
                </span>
                <span className="font-normal tracking-wide text-[8px] text-stone-500">
                  CUE
                </span>
              </div>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="shrink-0 h-11 flex gap-2 items-stretch">
          <div className="w-10">
            <Button
              onPress={() => setLoopBeats((b) => Math.max(1, b / 2))}
            >
              <span className="font-semibold text-[13px]">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <ToggleButton on={loopOn} onChange={setLoopOn}>
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                {loopOn ? "Loop On" : "Loop"}
              </span>
            </ToggleButton>
          </div>
          <div className="w-16">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight text-sm " +
                    (loopOn ? "text-violet-300" : "text-stone-300")
                  }
                >
                  {loopBeats >= 1 ? loopBeats : "1/" + Math.round(1 / loopBeats)}
                </span>
                <span className="font-medium uppercase tracking-widest text-[8px] text-stone-500">
                  beat
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-10">
            <Button
              onPress={() =>
                setLoopBeats((b) => Math.min(32, b < 1 ? b * 2 : b * 2))
              }
            >
              <span className="font-semibold text-[13px]">×2</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-6 shrink-0 flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
          {isPlaying ? "Playing" : "Cued"} · {keylock ? "Keylock" : "Vinyl"}
        </span>
        <span className="font-mono font-bold tracking-tight text-[10px] text-lime-300">
          {String(Math.floor(playhead * 4)).padStart(2, "0")}:
          {String(Math.floor((playhead * 240) % 60)).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}