export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [playhead, setPlayhead] = useState(0.15);
  const [cuePoint, setCuePoint] = useState(0.15);
  const [hotCues, setHotCues] = useState([false, false, false, false]);
  const [loopActive, setLoopActive] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);

  const track = { title: "Violet Echo", artist: "Nocturne Falls" };
  const baseBpm = 128;
  const bpm = baseBpm * (1 + pitch / 100);

  const waveData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 120; i++) {
      arr.push(0.15 + Math.random() * 0.85 * (0.4 + 0.6 * Math.sin(i / 9)));
    }
    return arr.map((v) => Math.max(0.08, Math.min(1, Math.abs(v))));
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
        const speed = 0.0009 * (1 + pitch / 100);
        const next = p + speed;
        return next >= 1 ? 0 : next;
      });
    }, 30);
    return () => clearInterval(id);
  }, [playing, pitch]);

  const handleJog = useCallback(
    (delta) => {
      setPlayhead((p) => {
        let next = p + delta * 0.02;
        next = ((next % 1) + 1) % 1;
        return next;
      });
    },
    []
  );

  const handleCue = useCallback(() => {
    setPlaying(false);
    setPlayhead(cuePoint);
  }, [cuePoint]);

  const handleSync = useCallback((on) => {
    setSync(on);
    if (on) setPitch(0);
  }, []);

  const toggleHotCue = (idx) => {
    setHotCues((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/5 to-transparent">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-violet-400 text-[11px]">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        {sync && (
          <span className="text-[10px] uppercase tracking-widest text-lime-300 animate-pulse">
            Sync Locked
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Track info + BPM */}
        <div className="flex items-center gap-2 h-8">
          <div className="flex-1 h-full">
            <Readout>
              <div className="flex flex-col leading-none min-w-0">
                <span className="font-semibold text-stone-100">{track.title}</span>
                <span className="text-[0.7em] text-stone-500">{track.artist}</span>
              </div>
            </Readout>
          </div>
          <div className="w-20 h-full flex-none">
            <Readout>
              <div className="flex flex-col items-end leading-none">
                <span className={keylock ? "text-lime-300 font-bold" : "text-violet-400 font-bold"}>
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.55em] text-stone-500 tracking-widest">BPM</span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="w-full" style={{ height: "3.2rem" }}>
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={1}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Jog + Fader + Transport */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-none flex items-center justify-center h-16 w-16">
            <JogWheel value={playhead * Math.PI * 2} onScrub={handleJog} />
          </div>

          <div className="flex-none flex flex-col items-center justify-center gap-1 h-24">
            <Fader
              min={-8}
              max={8}
              value={pitch}
              onChange={setPitch}
              orientation="vertical"
            />
            <span className="text-[9px] uppercase tracking-widest text-stone-500">Pitch</span>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2 place-items-center">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="text-[0.8em]">{playing ? "❚❚" : "▶"}</span>
            </ToggleButton>
            <Button onPress={handleCue}>
              <span className="text-[0.75em]">CUE</span>
            </Button>
            <ToggleButton on={sync} onChange={handleSync}>
              <span className="text-[0.7em]">SYNC</span>
            </ToggleButton>
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="text-[0.7em]">KEY</span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none flex items-center gap-2 justify-between">
          {hotCues.map((active, i) => (
            <div key={"cue-" + i} className="flex-1 h-9">
              <Pad active={active} onPress={() => toggleHotCue(i)}>
                <span className="text-[0.7em]">{i + 1}</span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none flex items-center gap-2">
          <div className="h-7 flex-none">
            <Button
              onPress={() => setLoopBeats((b) => Math.max(1, b / 2))}
            >
              <span className="text-[0.65em]">IN</span>
            </Button>
          </div>
          <div className="h-7 flex-1">
            <Readout>
              <div className="flex items-center justify-center gap-1 leading-none">
                <span className={loopActive ? "text-lime-300 font-bold" : "text-stone-400 font-bold"}>
                  {loopBeats}
                </span>
                <span className="text-[0.6em] text-stone-500 uppercase tracking-widest">
                  Beats
                </span>
              </div>
            </Readout>
          </div>
          <div className="h-7 flex-none">
            <Button
              onPress={() => {
                setLoopActive((a) => !a);
                setLoopBeats((b) => Math.min(32, b * 2));
              }}
            >
              <span className="text-[0.65em]">OUT</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}