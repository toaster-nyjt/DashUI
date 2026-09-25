export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.12);
  const [jogAngle, setJogAngle] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [syncOn, setSyncOn] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [cuePoint, setCuePoint] = useState(0);
  const [loopLen, setLoopLen] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [hotCues, setHotCues] = useState([false, false, false, false]);

  const waveData = useMemo(() => {
    const arr = [];
    let v = 0.3;
    for (let i = 0; i < 80; i++) {
      v += (Math.random() - 0.5) * 0.3;
      v = Math.max(0.08, Math.min(1, v));
      arr.push(v);
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 16; i++) arr.push(i / 16);
    return arr;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (playing) {
        setPlayhead((p) => (p + 0.0025) % 1);
        setJogAngle((a) => a + 0.12);
      }
    }, 100);
    return () => clearInterval(id);
  }, [playing]);

  const handleScrub = useCallback((delta) => {
    setPlayhead((p) => {
      let n = p + delta * 0.06;
      if (n < 0) n = 0;
      if (n > 1) n = 1;
      return n;
    });
    setJogAngle((a) => a + delta);
  }, []);

  const baseBpm = 128;
  const bpm = baseBpm * (1 + pitch / 100);

  const handleSync = useCallback((on) => {
    setSyncOn(on);
    if (on) {
      const deckABpm = 126;
      const target = ((deckABpm / baseBpm) - 1) * 100;
      setPitch(Math.max(-16, Math.min(16, target)));
    }
  }, []);

  const handleCue = useCallback(() => {
    setPlaying(false);
    setPlayhead(cuePoint);
  }, [cuePoint]);

  const pressHotCue = useCallback((idx) => {
    setHotCues((prev) => {
      const next = [...prev];
      if (!next[idx]) {
        next[idx] = true;
        setCuePoint(0.1 + idx * 0.18);
      } else {
        setPlayhead(0.1 + idx * 0.18);
      }
      return next;
    });
  }, []);

  const halfLoop = useCallback(() => setLoopLen((l) => Math.max(1, l / 2)), []);
  const doubleLoop = useCallback(() => setLoopLen((l) => Math.min(32, l * 2)), []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-violet-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-lg shadow-violet-500/40 flex-none"></span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck B</span>
        </div>
        <span className={"font-mono font-bold tracking-tight text-[11px] " + (syncOn ? "text-lime-300 animate-pulse" : "text-stone-500")}>
          {syncOn ? "SYNCED" : "FREE"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Row 1: Jog + Pitch + Toggles */}
        <div className="flex flex-row gap-3 items-center justify-between">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16">
              <JogWheel value={jogAngle} onScrub={handleScrub} />
            </div>
            <div className="flex flex-row gap-1">
              <div className="w-14 h-8">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="flex items-center justify-center">{playing ? "II" : "▶"}</span>
                </ToggleButton>
              </div>
              <div className="w-11 h-8">
                <Button onPress={handleCue}>
                  <span>CUE</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">Pitch</span>
            <div className="w-8 h-24">
              <Fader min={-16} max={16} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-16 h-8">
              <ToggleButton on={syncOn} onChange={handleSync}>
                <span className="text-[0.8em]">SYNC</span>
              </ToggleButton>
            </div>
            <div className="w-16 h-8">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="text-[0.8em]">KEY</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Row 2: Waveform */}
        <div className="flex-1 flex flex-col">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={1} onScrub={setPlayhead} />
        </div>

        {/* Row 3: Hot cue pads */}
        <div className="flex flex-row gap-2">
          {hotCues.map((set, i) => (
            <div key={"hc-" + i} className="flex-1 h-9">
              <Pad active={set} onPress={function () { pressHotCue(i); }}>
                <span className="text-[0.85em]">{i + 1}</span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Row 4: Loop controls */}
        <div className="flex flex-row items-center gap-2">
          <div className="w-11 h-7">
            <Button onPress={function () { setLoopActive(true); }}>
              <span className="text-[0.7em]">IN</span>
            </Button>
          </div>
          <div className="w-11 h-7">
            <Button onPress={function () { setLoopActive(false); }}>
              <span className="text-[0.7em]">OUT</span>
            </Button>
          </div>
          <div className="w-11 h-7">
            <Button onPress={halfLoop}>
              <span className="text-[0.7em]">1/2</span>
            </Button>
          </div>
          <div className="w-11 h-7">
            <Button onPress={doubleLoop}>
              <span className="text-[0.7em]">2X</span>
            </Button>
          </div>
          <div className="flex-1 h-7">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (loopActive ? "text-lime-300" : "text-stone-100")}>
                {loopLen + " BEAT LOOP"}
              </span>
            </Readout>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-none h-6 px-3 flex items-center gap-2 border-t border-stone-800/70 bg-stone-950/70">
        <div className="flex-1 h-full">
          <Readout>
            <span className="font-mono font-bold tracking-tight text-stone-100">Nocturnal Pulse — DJ Nova</span>
          </Readout>
        </div>
        <div className="w-16 h-full">
          <Readout>
            <span className={"font-mono font-bold tracking-tight " + (syncOn ? "text-lime-300" : "text-amber-400")}>
              {bpm.toFixed(1)}
            </span>
          </Readout>
        </div>
      </div>
    </div>
  );
}