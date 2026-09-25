export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [cueLit, setCueLit] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [playhead, setPlayhead] = useState(0.12);
  const [hotcues, setHotcues] = useState([false, false, false, false]);
  const [loopLenIdx, setLoopLenIdx] = useState(0);
  const [loopSet, setLoopSet] = useState(false);
  const loopLens = ["OFF", "1", "2", "4", "8"];

  const waveData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 96; i++) {
      arr.push(0.15 + Math.abs(Math.sin(i * 0.35)) * 0.6 + Math.random() * 0.25);
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g = [];
    for (let i = 0; i < 16; i++) g.push(i / 16);
    return g;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const next = p + 0.0025 * (1 + pitch / 100);
        return next >= 1 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(id);
  }, [playing, pitch]);

  const toggleHotcue = (i) => {
    setHotcues((h) => h.map((v, idx) => (idx === i ? !v : v)));
  };

  const bpm = useMemo(() => (128 + pitch * 0.13).toFixed(1), [pitch]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="flex-none h-8 flex items-center px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className="text-amber-400 mr-2 leading-none">●</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck A
        </span>
        {sync && (
          <span className="ml-auto text-[10px] uppercase tracking-widest text-lime-300 animate-pulse">
            synced
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Row 1: track info + bpm */}
        <div className="flex-none flex gap-2 items-stretch h-7">
          <div className="flex-1">
            <Readout value="">
              <span className="flex flex-col leading-tight">
                <span className="font-semibold text-stone-100">Midnight Pulse</span>
                <span className="text-[0.7em] text-stone-500">Nova Reign</span>
              </span>
            </Readout>
          </div>
          <div className="w-20">
            <Readout value="">
              <span className="flex flex-col items-center leading-tight">
                <span className={"font-bold " + (sync ? "text-lime-300" : "text-amber-400")}>
                  {bpm}
                </span>
                <span className="text-[0.55em] text-stone-500 uppercase tracking-widest">
                  bpm
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Row 2: waveform */}
        <div className="flex-1">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={1}
            onScrub={(pos) => setPlayhead(pos)}
            className="w-full h-full"
          />
        </div>

        {/* Row 3: jog + fader + transport */}
        <div className="flex-none flex gap-2 items-stretch h-24">
          <div className="h-full aspect-square">
            <JogWheel
              value={playhead * Math.PI * 2}
              onScrub={(delta) => setPlayhead((p) => (p + delta + 1) % 1)}
              className="w-full h-full"
            />
          </div>

          <div className="w-8 h-full">
            <Fader
              min={-8}
              max={8}
              value={pitch}
              onChange={setPitch}
              orientation="vertical"
              className="w-full h-full"
            />
          </div>

          <div className="flex-1 h-full">
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full w-full">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="flex items-center justify-center">
                  {playing ? (
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="4" width="5" height="16" />
                      <rect x="14" y="4" width="5" height="16" />
                    </svg>
                  ) : (
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  )}
                </span>
              </ToggleButton>

              <Button
                onPress={() => {
                  setCueLit(true);
                  setPlayhead(0.12);
                  setPlaying(false);
                  setTimeout(() => setCueLit(false), 200);
                }}
              >
                <span className={cueLit ? "text-amber-300" : ""}>Cue</span>
              </Button>

              <ToggleButton on={sync} onChange={setSync}>
                Sync
              </ToggleButton>

              <ToggleButton on={keylock} onChange={setKeylock}>
                Key
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Row 4: hot cue pads */}
        <div className="flex-none flex gap-2 h-14">
          {hotcues.map((active, i) => (
            <div className="flex-1 h-full" key={"pad-" + i}>
              <Pad active={active} onPress={() => toggleHotcue(i)} className="w-full h-full">
                <span className="flex flex-col items-center leading-none">
                  <span>Hc{i + 1}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Row 5: loop controls */}
        <div className="flex-none flex gap-2 items-stretch h-7">
          <Button onPress={() => setLoopSet(true)}>In</Button>
          <Button onPress={() => setLoopSet(false)}>Out</Button>
          <Button onPress={() => setLoopLenIdx((i) => (i + 1) % loopLens.length)}>
            Loop
          </Button>
          <div className="flex-1">
            <Readout value="">
              <span className="flex items-center justify-center gap-1">
                <span className="text-stone-500 text-[0.7em] uppercase tracking-widest">
                  len
                </span>
                <span className={loopSet ? "text-lime-300 font-bold" : "text-stone-300 font-bold"}>
                  {loopLens[loopLenIdx]}
                </span>
              </span>
            </Readout>
          </div>
        </div>
      </div>
    </div>
  );
}