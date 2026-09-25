export default function GeneratedComponent() {
  const trackLength = 240; // seconds
  const bpm = 128.0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18); // normalized 0-1
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [loopActive, setLoopActive] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [scrubbing, setScrubbing] = useState(false);

  // synthesize a stable waveform
  const waveData = useMemo(() => {
    const n = 220;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const env =
        0.35 +
        0.4 * Math.abs(Math.sin(t * Math.PI * 3.3)) +
        0.25 * Math.abs(Math.sin(t * Math.PI * 11 + 1.2));
      const detail =
        0.5 + 0.5 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.31));
      out.push(Math.min(1, env * detail));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const grid: number[] = [];
    for (let i = 0; i <= 32; i++) grid.push(i / 32);
    return grid;
  }, []);

  const effBpm = bpm * (1 + pitch / 100);

  // playback advance via state (never scrolls anything)
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const speed = (1 + pitch / 100) / trackLength / 20; // step per 50ms
        const np = p + speed;
        return np >= 1 ? 0 : np;
      });
    }, 50);
    return () => clearInterval(id);
  }, [isPlaying, pitch]);

  const jogAngle = playhead * Math.PI * 12;

  const fmtTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  };
  const elapsed = playhead * trackLength;
  const remain = trackLength - elapsed;

  const cues = [
    { n: 1, label: "A", color: "amber" },
    { n: 2, label: "B", color: "amber" },
    { n: 3, label: "C", color: "amber" },
    { n: 4, label: "D", color: "amber" },
  ];

  const loopOptions = [1, 2, 4, 8, 16];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* Header */}
      <div className="h-8 flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 text-[11px] leading-none">◉</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck A
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-stone-500">
            CH1
          </span>
          <span
            className={
              "text-[10px] uppercase tracking-widest transition-all duration-200 " +
              (isPlaying ? "text-lime-300 animate-pulse" : "text-stone-600")
            }
          >
            {isPlaying ? "▶ Live" : "❚❚ Cued"}
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM readouts */}
        <div className="flex items-stretch gap-2">
          <div className="flex-1 min-w-0 flex flex-col">
            <Readout>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-semibold text-stone-100 text-sm truncate">
                  Midnight Circuit
                </span>
                <span className="text-[11px] tracking-wide text-stone-500 truncate">
                  Nova Arclight — Neon Depths EP
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-[6.5rem] flex flex-col">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span className="text-[9px] uppercase tracking-widest text-stone-500 mb-0.5">
                  BPM
                </span>
                <span
                  className={
                    "font-mono font-bold tracking-tight text-lg " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {effBpm.toFixed(1)}
                </span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="h-14 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden p-1">
          <div className="h-full w-full">
            <Waveform
              data={waveData}
              playhead={playhead}
              beatGrid={beatGrid}
              zoom={0.55}
              onScrub={(pos) => {
                setScrubbing(true);
                setPlayhead(pos);
              }}
            />
          </div>
        </div>

        {/* Center: Jog wheel + pitch fader */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col items-center justify-center gap-1 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60 p-2">
            <div className="relative flex-1 min-h-0 aspect-square max-h-full">
              <JogWheel
                value={jogAngle}
                onScrub={(delta) => {
                  setPlayhead((p) => {
                    const np = p + delta / (Math.PI * 12);
                    return np < 0 ? 0 : np > 1 ? 1 : np;
                  });
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">
              <span className="text-stone-500">−{elapsed >= 0 ? fmtTime(elapsed) : "0:00"}</span>
              <span className="text-amber-400">·</span>
              <span className="text-lime-300 font-mono">-{fmtTime(remain)}</span>
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="w-[3.75rem] flex flex-col items-center gap-1 rounded-2xl border border-amber-500/15 bg-neutral-900/90 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 shadow-2xl shadow-black/60 p-2">
            <span className="text-[9px] uppercase tracking-widest text-stone-400 leading-none">
              Pitch
            </span>
            <div className="flex-1 min-h-0 flex items-center justify-center">
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
                "font-mono font-bold text-[11px] leading-none " +
                (pitch === 0 ? "text-stone-100" : pitch > 0 ? "text-amber-400" : "text-violet-300")
              }
            >
              {(pitch > 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Transport row: Cue / Play / Sync + Keylock */}
        <div className="grid grid-cols-4 gap-2">
          <div className="h-11">
            <Button onPress={() => setPlayhead(activeCue !== null ? 0.18 : 0)}>
              <span className="flex flex-col items-center leading-none">
                <span className="text-sm">◆</span>
                <span className="font-semibold uppercase tracking-wider text-[9px] mt-0.5">
                  Cue
                </span>
              </span>
            </Button>
          </div>
          <div className="h-11 col-span-2">
            <ToggleButton on={isPlaying} onChange={setIsPlaying}>
              <span className="flex items-center justify-center gap-1.5 leading-none">
                <span className="text-sm">{isPlaying ? "❚❚" : "▶"}</span>
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  {isPlaying ? "Pause" : "Play"}
                </span>
              </span>
            </ToggleButton>
          </div>
          <div className="h-11">
            <ToggleButton on={synced} onChange={setSynced}>
              <span className="flex flex-col items-center leading-none">
                <span className="text-sm">⟲</span>
                <span className="font-semibold uppercase tracking-wider text-[9px] mt-0.5">
                  Sync
                </span>
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[9px] uppercase tracking-widest text-stone-400">
              Hot Cues
            </span>
            <span className="text-[9px] uppercase tracking-widest text-stone-600">
              Bank 1
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {cues.map((c) => (
              <div key={"cue-" + c.n} className="h-10">
                <Pad
                  active={activeCue === c.n}
                  onPress={() =>
                    setActiveCue((prev) => (prev === c.n ? null : c.n))
                  }
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-semibold text-sm">{c.label}</span>
                    <span className="font-semibold uppercase tracking-wider text-[8px] mt-0.5">
                      {activeCue === c.n ? "Set" : "Cue"}
                    </span>
                  </span>
                </Pad>
              </div>
            ))}
          </div>
        </div>

        {/* Loop controls + Keylock */}
        <div className="flex items-stretch gap-2">
          <div className="flex-1 min-w-0 flex items-stretch gap-2 rounded-xl border border-stone-800/70 bg-stone-950/80 p-1.5">
            <div className="h-9 w-9">
              <Button
                onPress={() =>
                  setLoopBeats((b) => {
                    const idx = loopOptions.indexOf(b);
                    return loopOptions[Math.max(0, idx - 1)];
                  })
                }
              >
                <span className="font-semibold text-sm leading-none">½</span>
              </Button>
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <Readout>
                <div className="flex flex-col items-center leading-none">
                  <span className="text-[8px] uppercase tracking-widest text-stone-500 mb-0.5">
                    Loop
                  </span>
                  <span
                    className={
                      "font-mono font-bold text-sm " +
                      (loopActive ? "text-lime-300" : "text-amber-400")
                    }
                  >
                    {loopBeats} <span className="text-[9px]">beat</span>
                  </span>
                </div>
              </Readout>
            </div>
            <div className="h-9 w-9">
              <Button
                onPress={() =>
                  setLoopBeats((b) => {
                    const idx = loopOptions.indexOf(b);
                    return loopOptions[
                      Math.min(loopOptions.length - 1, idx + 1)
                    ];
                  })
                }
              >
                <span className="font-semibold text-sm leading-none">2×</span>
              </Button>
            </div>
            <div className="h-9 w-12">
              <ToggleButton on={loopActive} onChange={setLoopActive}>
                <span className="font-semibold uppercase tracking-wider text-[9px] leading-none">
                  {loopActive ? "On" : "In"}
                </span>
              </ToggleButton>
            </div>
          </div>

          <div className="w-[3.75rem] flex flex-col">
            <div className="h-full">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="flex flex-col items-center leading-none">
                  <span className="text-sm">⚿</span>
                  <span className="font-semibold uppercase tracking-wider text-[8px] mt-0.5">
                    Key
                  </span>
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-6 flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Deck A
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Time <span className="text-lime-300 font-mono">{fmtTime(elapsed)}</span>
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-widest text-stone-500">
          {keylock ? (
            <span className="text-violet-300">Keylock</span>
          ) : (
            <span className="text-stone-600">Keylock</span>
          )}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {synced ? (
            <span className="text-lime-300 animate-pulse">Synced</span>
          ) : (
            <span className="text-stone-600">Free</span>
          )}
        </span>
      </div>
    </div>
  );
}