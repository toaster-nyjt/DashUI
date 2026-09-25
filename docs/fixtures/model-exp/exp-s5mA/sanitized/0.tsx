export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [cueLit, setCueLit] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [keylock, setKeylock] = useState(false);
  const [sync, setSync] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [hotCues, setHotCues] = useState([false, false, true, false]);
  const [loopOn, setLoopOn] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);

  const waveData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 200; i++) {
      const base = Math.sin(i * 0.15) * 0.3 + Math.sin(i * 0.4) * 0.2;
      arr.push(Math.abs(base + Math.random() * 0.5));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g = [];
    for (let i = 0; i < 32; i++) g.push(i / 32);
    return g;
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const speed = 0.0009 * (1 + pitch / 100);
    const id = setInterval(() => {
      setPlayhead((p) => (p + speed >= 1 ? 0 : p + speed));
    }, 60);
    return () => clearInterval(id);
  }, [isPlaying, pitch]);

  const baseBpm = 128;
  const liveBpm = (baseBpm * (1 + pitch / 100)).toFixed(2);

  const toggleCue = (idx) => {
    setHotCues((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const handleScrub = (pos) => {
    setPlayhead(pos);
  };

  const handleJog = (delta) => {
    setPlayhead((p) => {
      let n = p + delta * 0.02;
      if (n < 0) n = 0;
      if (n > 1) n = 1;
      return n;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      <div className="flex-none h-8 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-1.5">●</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
          Deck A — Channel 1
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Track info + BPM */}
        <div className="flex-none flex gap-2">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col">
                <span className="font-semibold text-stone-100">Nocturne Falls</span>
                <span className="text-[0.75em] text-stone-400">Kestrel &amp; Dune</span>
              </span>
            </Readout>
          </div>
          <div style={{ width: "6rem" }} className="flex-none">
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight " +
                  (keylock || sync ? "text-lime-300" : "text-amber-400")
                }
              >
                {liveBpm}
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex-none" style={{ height: "3.5rem" }}>
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={1} onScrub={handleScrub} />
        </div>

        {/* Main controls: jog + pitch + transport */}
        <div className="flex-1 flex gap-2">
          <div className="flex flex-col items-center gap-1" style={{ width: "9rem" }}>
            <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400">Jog</span>
            <div className="flex-1 w-full aspect-square">
              <JogWheel value={playhead * Math.PI * 2} onScrub={handleJog} />
            </div>
          </div>

          <div className="flex flex-col items-center gap-1" style={{ width: "3.2rem" }}>
            <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400">Pitch</span>
            <div className="flex-1 w-full flex justify-center">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <ToggleButton on={isPlaying} onChange={setIsPlaying}>
                <span className="font-semibold uppercase tracking-wider">{isPlaying ? "▮▮" : "▶"}</span>
              </ToggleButton>
              <Button
                onPress={() => {
                  setCueLit(true);
                  setIsPlaying(false);
                  setPlayhead(0.02);
                  setTimeout(() => setCueLit(false), 220);
                }}
              >
                <span
                  className={
                    "font-semibold uppercase tracking-wider " + (cueLit ? "text-red-400" : "")
                  }
                >
                  Cue
                </span>
              </Button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <ToggleButton on={sync} onChange={setSync}>
                <span
                  className={"font-semibold uppercase tracking-wider " + (sync ? "text-lime-300 animate-pulse" : "")}
                >
                  Sync
                </span>
              </ToggleButton>
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Hot cues */}
        <div className="flex-none flex gap-2">
          {hotCues.map((active, idx) => (
            <div key={"cue-" + idx} className="flex-1" style={{ height: "2.6rem" }}>
              <Pad active={active} onPress={() => toggleCue(idx)}>
                <span className="font-semibold uppercase tracking-wider">{idx + 1}</span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1" style={{ height: "1.9rem" }}>
            <Button
              onPress={() => {
                setLoopOn((v) => !v);
              }}
            >
              <span
                className={"font-semibold uppercase tracking-wider " + (loopOn ? "text-lime-300" : "")}
              >
                Loop {loopOn ? "On" : "Off"}
              </span>
            </Button>
          </div>
          <div className="flex-none" style={{ width: "3rem", height: "1.9rem" }}>
            <Button onPress={() => setLoopBeats((b) => Math.max(1, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-none" style={{ width: "3rem", height: "1.9rem" }}>
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">2×</span>
            </Button>
          </div>
          <div className="flex-none" style={{ width: "5.5rem", height: "1.9rem" }}>
            <Readout>
              <span className="font-mono font-bold tracking-tight text-amber-400">{loopBeats} beat</span>
            </Readout>
          </div>
        </div>
      </div>
    </div>
  );
}