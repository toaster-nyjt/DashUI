export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0.18);
  const [angle, setAngle] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [cues, setCues] = useState<boolean[]>([true, true, false, false]);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);

  const baseBpm = 124.0;
  const bpm = baseBpm * (1 + pitch / 100);

  const wave = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < 320; i++) {
      const env = 0.45 + 0.35 * Math.sin(i / 26) + 0.2 * Math.sin(i / 7.3);
      const kick = i % 16 < 2 ? 0.35 : 0;
      a.push(Math.min(1, Math.abs(env) * (0.6 + 0.4 * Math.random()) + kick));
    }
    return a;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 64; i++) g.push(i / 64);
    return g;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => (p + 0.0012 * (1 + pitch / 100)) % 1);
      setAngle((a) => a + 0.16);
    }, 60);
    return () => clearInterval(id);
  }, [playing, pitch]);

  const time = (() => {
    const total = 312;
    const s = Math.floor(pos * total);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  })();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className={"text-amber-400 text-[11px] " + (playing ? "animate-pulse" : "")}>◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        <span className="ml-auto font-medium uppercase tracking-widest text-[10px] text-stone-500">CH 1</span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* info + bpm */}
        <div className="h-9 flex gap-2">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col gap-[0.1em]">
                <span className="font-semibold tracking-tight">Midnight Circuit</span>
                <span className="text-[0.7em] uppercase tracking-widest text-stone-400">Vela Kane — 4A</span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.5rem] h-full">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (sync ? "text-lime-300" : "text-amber-400")}>
                {bpm.toFixed(1)}
              </span>
            </Readout>
          </div>
        </div>

        {/* waveform */}
        <div className="h-[2.6rem] w-full">
          <Waveform data={wave} playhead={pos} beatGrid={beatGrid} zoom={0.5} onScrub={(p) => setPos(p)} />
        </div>

        {/* jog + controls */}
        <div className="h-[9.25rem] flex gap-2">
          <div className="w-[9.25rem] h-full relative">
            <JogWheel
              value={angle}
              onScrub={(d) => {
                setAngle((a) => a + d);
                setPos((p) => Math.min(0.999, Math.max(0, p + d * 0.01)));
              }}
            />
          </div>

          <div className="flex-1 h-full flex gap-2">
            <div className="w-[2.6rem] h-full flex flex-col items-center gap-1">
              <div className="w-[1.8rem] flex-1">
                <Fader min={-8} max={8} value={pitch} orientation="vertical" onChange={(v) => { setPitch(v); setSync(false); }} />
              </div>
              <span className="font-mono font-bold tracking-tight text-[10px] text-amber-400">
                {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
              </span>
              <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">Pitch</span>
            </div>

            <div className="flex-1 h-full grid grid-cols-2 grid-rows-2 gap-2">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">{playing ? "Pause" : "Play"}</span>
              </ToggleButton>
              <Button onPress={() => { setPlaying(false); setPos(0); }}>
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </Button>
              <ToggleButton on={sync} onChange={(v) => { setSync(v); if (v) setPitch(1.6); }}>
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* hot cues */}
        <div className="h-[2.4rem] grid grid-cols-4 gap-2">
          {cues.map((c, i) => (
            <Pad
              key={"cue-" + i}
              active={c}
              onPress={() => {
                setCues((prev) => prev.map((v, j) => (j === i ? !v : v)));
                if (c) setPos(i * 0.21 + 0.02);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">{"C" + (i + 1)}</span>
            </Pad>
          ))}
        </div>

        {/* loop */}
        <div className="h-[2rem] flex gap-2">
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopOn((l) => !l)}>
              <span className="font-semibold uppercase tracking-wider">{loopOn ? "Exit" : "Loop"}</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[5.5rem] h-full">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (loopOn ? "text-lime-300" : "text-stone-100")}>
                {loopBeats + " BT"}
              </span>
            </Readout>
          </div>
        </div>
      </div>

      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span>Time</span>
        <span className="text-lime-300 font-mono">{time}</span>
        <span className="ml-auto">{keylock ? "KEYLOCK" : "VARISPEED"}</span>
        <span className={sync ? "text-lime-300 animate-pulse" : "text-stone-600"}>SYNC</span>
      </div>
    </div>
  );
}