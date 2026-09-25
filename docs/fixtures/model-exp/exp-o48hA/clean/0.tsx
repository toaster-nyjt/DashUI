export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.12);
  const [jogAngle, setJogAngle] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [keylock, setKeylock] = useState(true);
  const [sync, setSync] = useState(false);
  const [cues, setCues] = useState([true, false, false, false]);
  const [loopActive, setLoopActive] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);

  const waveData = useMemo(
    () =>
      Array.from({ length: 190 }, (_, i) => {
        const env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.05 + 0.4));
        const detail =
          0.45 +
          0.55 *
            Math.abs(
              Math.sin(i * 0.8) * 0.6 + Math.sin(i * 0.27) * 0.4 + Math.sin(i * 1.7) * 0.2
            );
        return Math.min(1, env * detail);
      }),
    []
  );

  const beatGrid = useMemo(
    () => Array.from({ length: 20 }, (_, i) => i / 20),
    []
  );

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0014) % 1);
      setJogAngle((a) => a + 0.11);
    }, 50);
    return () => clearInterval(id);
  }, [playing]);

  const effBpm = 128 * (1 + pitch / 100);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 animate-pulse">◉</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck A
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-stone-500">
          CH 1
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Waveform */}
        <div className="flex-none h-[2.75rem]">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.5}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Info row */}
        <div className="flex-none flex items-stretch gap-2 h-[2.5rem]">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start leading-tight text-left">
                <span className="font-semibold tracking-wide text-stone-100">
                  Midnight Express
                </span>
                <span className="text-[0.7em] tracking-wide text-stone-400">
                  Rüfüs Du Sol
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[5.5rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {effBpm.toFixed(1)}
                </span>
                <span className="text-[0.5em] tracking-widest text-stone-500">
                  BPM
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Main: jog + transport + pitch */}
        <div className="flex-1 flex items-stretch gap-2">
          {/* Jog wheel */}
          <div className="h-full aspect-square flex-none">
            <JogWheel
              value={jogAngle}
              onScrub={(d) => {
                setJogAngle((a) => a + d);
                setPlayhead((p) => Math.max(0, Math.min(1, p + d / 40)));
              }}
            />
          </div>

          {/* Transport */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="flex items-center justify-center gap-1 font-semibold uppercase tracking-wider">
                  <span style={{ fontSize: "1.1em" }}>
                    {playing ? "❚❚" : "▶"}
                  </span>
                  <span>{playing ? "Pause" : "Play"}</span>
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <Button onPress={() => setPlayhead(0)}>
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </Button>
            </div>
            <div className="flex-1">
              <ToggleButton on={sync} onChange={setSync}>
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
          </div>

          {/* Pitch fader + keylock */}
          <div className="flex-none flex flex-col items-center gap-1">
            <div className="flex-1 flex items-center">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => setPitch(v)}
                orientation="vertical"
              />
            </div>
            <span className="font-mono text-[10px] text-amber-400 leading-none">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
            <div className="w-[2.6rem] h-[1.6rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none grid grid-cols-4 gap-2 h-[2.75rem]">
          {cues.map((active, i) => (
            <Pad
              key={"cue-" + i}
              active={active}
              onPress={() => {
                if (active) {
                  setPlayhead(i * 0.22 + 0.05);
                } else {
                  setCues((c) => c.map((v, idx) => (idx === i ? true : v)));
                }
              }}
            >
              <span className="flex flex-col items-center leading-none font-semibold uppercase tracking-wider">
                <span>{i + 1}</span>
                <span className="text-[0.55em] tracking-widest text-stone-400">
                  Cue
                </span>
              </span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none flex items-stretch gap-2 h-[2rem]">
          <div className="w-[4.5rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className="font-mono font-bold text-amber-400">
                  {loopBeats}
                </span>
                <span className="text-[0.5em] tracking-widest text-stone-500">
                  BEATS
                </span>
              </span>
            </Readout>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.max(1, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="font-semibold uppercase tracking-wider">Loop</span>
            </ToggleButton>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">2×</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className={playing ? "text-lime-300" : ""}>
          {playing ? "▶ Playing" : "◼ Cued"}
        </span>
        <span className="ml-auto">
          Pitch{" "}
          <span className="text-lime-300 font-mono">
            {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
          </span>
        </span>
        <span className={sync ? "text-lime-300" : "text-stone-600"}>Sync</span>
      </div>
    </div>
  );
}
