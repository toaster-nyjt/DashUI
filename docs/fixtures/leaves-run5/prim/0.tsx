export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [jogAngle, setJogAngle] = useState(0);
  const [playhead, setPlayhead] = useState(0.18);
  const [loopLen, setLoopLen] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [litCue, setLitCue] = useState<number | null>(1);

  const baseBpm = 128.0;
  const bpm = useMemo(() => baseBpm * (1 + pitch / 100), [pitch]);

  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 220; i++) {
      const beat = Math.sin(i * 0.5) * 0.5 + 0.5;
      const env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.045));
      const kick = i % 16 < 2 ? 1 : 0.55;
      arr.push(Math.min(1, (0.25 + beat * 0.55 * env) * kick + (i % 7 === 0 ? 0.2 : 0)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 32; i++) g.push(i / 32);
    return g;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0016 * (1 + pitch / 100)) % 1);
      setJogAngle((a) => a + 0.12 * (1 + pitch / 100));
    }, 40);
    return () => clearInterval(id);
  }, [playing, pitch]);

  const cueLabels = ["A", "B", "C", "D"];
  const loopSteps = [1, 2, 4, 8, 16];

  const handleSync = (on: boolean) => {
    setSynced(on);
    if (on) setPitch(2.4);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[11px]">◈</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck A
          </span>
        </div>
        <span
          className={
            "text-[10px] uppercase tracking-widest transition-all duration-200 " +
            (synced ? "text-lime-300 animate-pulse" : "text-stone-500")
          }
        >
          CH1
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM row */}
        <div className="flex gap-2" style={{ height: "3rem" }}>
          <div className="flex-1 basis-0 min-w-0">
            <Readout>
              <div className="flex flex-col justify-center h-full min-w-0 text-left px-1">
                <span className="font-semibold tracking-tight text-stone-100 text-[12px] truncate leading-tight">
                  Midnight Circuit
                </span>
                <span className="font-normal tracking-wide text-stone-500 text-[11px] truncate leading-none mt-0.5">
                  Nova Kane
                </span>
              </div>
            </Readout>
          </div>
          <div style={{ width: "6.5rem" }}>
            <Readout>
              <div className="flex flex-col items-center justify-center h-full">
                <span
                  className={
                    "font-mono font-bold tracking-tight leading-none " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                  style={{ fontSize: "1.15rem" }}
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="font-medium uppercase tracking-widest text-stone-500 text-[9px] leading-none mt-0.5">
                  BPM
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div style={{ height: "3.25rem" }} className="w-full">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Jog wheel + pitch fader */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex items-center justify-center">
            <div className="aspect-square h-full max-h-full">
              <JogWheel
                value={jogAngle}
                onScrub={(d) => {
                  setJogAngle((a) => a + d);
                  setPlayhead((p) => Math.min(1, Math.max(0, p + d * 0.02)));
                }}
              />
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="flex flex-col items-center gap-1" style={{ width: "3.25rem" }}>
            <span className="font-medium uppercase tracking-widest text-stone-400 text-[9px] leading-none">
              Pitch
            </span>
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
            <span
              className={
                "font-mono font-bold tracking-tight text-[10px] leading-none " +
                (pitch === 0 ? "text-stone-100" : pitch > 0 ? "text-amber-400" : "text-violet-300")
              }
            >
              {(pitch > 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Transport: Cue, Play, Sync, Keylock */}
        <div className="flex gap-2" style={{ height: "2.5rem" }}>
          <div className="flex-1 basis-0 min-w-0">
            <Button onPress={() => setPlayhead(0)}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Cue</span>
            </Button>
          </div>
          <div className="flex-1 basis-0 min-w-0">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {playing ? "❚❚" : "▶"}
              </span>
            </ToggleButton>
          </div>
          <div className="flex-1 basis-0 min-w-0">
            <ToggleButton on={synced} onChange={handleSync}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Sync</span>
            </ToggleButton>
          </div>
          <div className="flex-1 basis-0 min-w-0">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Key</span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="grid grid-cols-4 gap-2" style={{ height: "2.75rem" }}>
          {cueLabels.map((label, i) => (
            <Pad
              key={"cue-" + i}
              active={litCue === i}
              onPress={() => setLitCue(litCue === i ? null : i)}
            >
              <span className="font-semibold uppercase tracking-wider text-[12px]">{label}</span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex gap-2" style={{ height: "2.25rem" }}>
          <div style={{ width: "3.25rem" }} className="min-w-0">
            <Button
              onPress={() => {
                const idx = loopSteps.indexOf(loopLen);
                setLoopLen(loopSteps[Math.max(0, idx - 1)]);
              }}
            >
              <span className="font-semibold uppercase tracking-wider text-[13px]">½</span>
            </Button>
          </div>
          <div className="flex-1 basis-0 min-w-0">
            <Readout>
              <div className="flex items-center justify-center h-full gap-1">
                <span className="font-mono font-bold tracking-tight text-amber-400 text-[13px] leading-none">
                  {loopLen}
                </span>
                <span className="font-medium uppercase tracking-widest text-stone-500 text-[9px] leading-none">
                  bars
                </span>
              </div>
            </Readout>
          </div>
          <div style={{ width: "3.25rem" }} className="min-w-0">
            <Button
              onPress={() => {
                const idx = loopSteps.indexOf(loopLen);
                setLoopLen(loopSteps[Math.min(loopSteps.length - 1, idx + 1)]);
              }}
            >
              <span className="font-semibold uppercase tracking-wider text-[13px]">×2</span>
            </Button>
          </div>
          <div style={{ width: "4rem" }} className="min-w-0">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Loop</span>
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}