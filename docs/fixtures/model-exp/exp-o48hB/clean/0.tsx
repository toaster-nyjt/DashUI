export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [jogAngle, setJogAngle] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [activeCue, setActiveCue] = useState(-1);
  const [loopIdx, setLoopIdx] = useState(3);

  const baseBpm = 124.0;
  const loops = [0.25, 0.5, 1, 2, 4, 8, 16];
  const loopLabels = ["1/4", "1/2", "1", "2", "4", "8", "16"];
  const cuePoints = [0.04, 0.28, 0.52, 0.78];

  const waveData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 220; i++) {
      const env = 0.28 + 0.72 * Math.abs(Math.sin(i * 0.045 + 0.4));
      const detail = Math.abs(Math.sin(i * 0.63)) * 0.55 + Math.abs(Math.cos(i * 0.21)) * 0.3;
      arr.push(Math.min(1, env * (0.4 + detail) + 0.08));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => Array.from({ length: 24 }, (_, i) => i / 24), []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0016) % 1);
      setJogAngle((a) => a + 0.14);
    }, 40);
    return () => clearInterval(id);
  }, [playing]);

  const displayBpm = (baseBpm * (1 + pitch / 100)).toFixed(1);
  const totalSec = 294;
  const elapsed = playhead * totalSec;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" + sec : sec);
  };

  const handleSync = (on: boolean) => {
    setSynced(on);
    if (on) setPitch(2.4);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className={"h-2 w-2 rounded-full " + (playing ? "bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40" : "bg-amber-500/60")} />
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          <span className="text-amber-400">◆</span> Deck A
        </span>
        <span className="ml-auto font-mono font-bold tracking-tight text-[11px] text-amber-400">CH1</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Track + BPM readouts */}
        <div className="flex-none flex gap-2 h-[2.2rem]">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start leading-tight text-left">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Drive</span>
                <span className="text-[0.68em] font-normal tracking-wide text-stone-400">Neon Cascade</span>
              </span>
            </Readout>
          </div>
          <div className="w-[5.5rem] flex-none">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (synced ? "text-lime-300" : "text-amber-400")}>{displayBpm}</span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">BPM</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="flex-none h-[3rem] w-full">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={1} onScrub={(p) => setPlayhead(p)} />
        </div>

        {/* Main: jog + transport + pitch */}
        <div className="flex-1 flex gap-2">
          {/* Jog wheel */}
          <div className="h-full aspect-square flex-none">
            <JogWheel value={jogAngle} onScrub={(d) => { setJogAngle((a) => a + d); setPlayhead((p) => Math.max(0, Math.min(1, p + d * 0.02))); }} />
          </div>

          {/* Transport controls */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="text-[1.4em]">{playing ? "❚❚" : "▶"}</span>
            </ToggleButton>
            <Button onPress={() => { setPlayhead(activeCue >= 0 ? cuePoints[activeCue] : 0); }}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </Button>
            <ToggleButton on={synced} onChange={handleSync}>
              <span className="font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Key</span>
            </ToggleButton>
          </div>

          {/* Pitch fader */}
          <div className="w-[3.2rem] flex-none flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none">Pitch</span>
            <div className="flex-1 flex justify-center">
              <div className="w-[2rem] h-full">
                <Fader min={-8} max={8} value={pitch} onChange={(v) => { setPitch(v); setSynced(false); }} orientation="vertical" />
              </div>
            </div>
            <span className={"font-mono font-bold text-[11px] leading-none " + (pitch === 0 ? "text-stone-300" : "text-amber-400")}>
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none h-[3rem] grid grid-cols-4 gap-2">
          {cuePoints.map((cp, i) => (
            <Pad key={"cue-" + i} active={activeCue === i} onPress={() => { setActiveCue(i); setPlayhead(cp); }}>
              <span className="flex flex-col items-center leading-none">
                <span className="font-semibold text-[1.1em]">{i + 1}</span>
                <span className="text-[0.5em] uppercase tracking-widest">cue</span>
              </span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none h-[2rem] flex items-stretch gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 self-center">Loop</span>
          <div className="w-[3rem]">
            <Button onPress={() => setLoopIdx((i) => Math.max(0, i - 1))}>
              <span className="font-semibold">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <span className="flex items-baseline gap-1 leading-none">
                <span className="font-mono font-bold text-amber-400">{loopLabels[loopIdx]}</span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">beat</span>
              </span>
            </Readout>
          </div>
          <div className="w-[3rem]">
            <Button onPress={() => setLoopIdx((i) => Math.min(loops.length - 1, i + 1))}>
              <span className="font-semibold">2×</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer status */}
      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span>Elapsed <span className="text-lime-300 font-mono">{fmt(elapsed)}</span></span>
        <span className="ml-auto">{synced ? <span className="text-lime-300 animate-pulse">Synced</span> : <span>Free</span>}</span>
        <span>{keylock ? <span className="text-violet-300">Keylock</span> : <span>—</span>}</span>
      </div>
    </div>
  );
}