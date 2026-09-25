export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [jog, setJog] = useState(0);
  const [cues, setCues] = useState<number[]>([0.12]);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopOn, setLoopOn] = useState(false);

  const baseBpm = 124.0;
  const bpm = baseBpm * (1 + pitch / 100);

  const wave = useMemo(() => {
    const a: number[] = [];
    for (let i = 0; i < 256; i++) {
      const env = 0.45 + 0.55 * Math.abs(Math.sin(i / 19));
      const kick = i % 8 === 0 ? 0.45 : 0;
      a.push(Math.min(1, env * (0.5 + 0.5 * Math.abs(Math.sin(i / 3.1))) + kick));
    }
    return a;
  }, []);
  const grid = useMemo(() => Array.from({ length: 33 }, (_, i) => i / 32), []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0016 * (1 + pitch / 100)) % 1);
      setJog((j) => j + 0.12 * (1 + pitch / 100));
    }, 40);
    return () => clearInterval(id);
  }, [playing, pitch]);

  const scrub = (d: number) => {
    setJog((j) => j + d);
    setPlayhead((p) => Math.min(1, Math.max(0, p + d * 0.01)));
  };

  const time = (() => {
    const t = playhead * 312;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  })();

  const toggleCue = (i: number) =>
    setCues((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* header */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className={"text-amber-400 text-[11px] transition-all duration-200 " + (playing ? "animate-pulse" : "opacity-60")}>◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-lime-300">{playing ? "PLAY" : "CUED"}</span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* info + bpm */}
        <div className="flex gap-2 h-[2.1rem]">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col items-start">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Lacquer</span>
                <span className="text-[0.7em] uppercase tracking-widest text-stone-400">Vel Orson</span>
              </span>
            </Readout>
          </div>
          <div className="w-[5.5rem] h-full">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (sync ? "text-lime-300" : "text-amber-400")}>
                {bpm.toFixed(1)}
              </span>
            </Readout>
          </div>
        </div>

        {/* waveform */}
        <div className="h-[3rem]">
          <Waveform data={wave} playhead={playhead} beatGrid={grid} zoom={0.45} onScrub={(p) => setPlayhead(p)} />
        </div>

        {/* jog + controls + pitch */}
        <div className="flex-1 flex gap-2 items-stretch">
          <div className="w-[8rem] flex flex-col gap-1">
            <div className="flex-1">
              <JogWheel value={jog} onScrub={scrub} />
            </div>
            <div className="text-center font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
              Platter · {time}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="font-semibold uppercase tracking-wider">{playing ? "Pause" : "Play"}</span>
            </ToggleButton>
            <Button onPress={() => { setPlaying(false); setPlayhead(cues.length ? 0.12 : 0); }}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </Button>
            <ToggleButton on={sync} onChange={(v) => { setSync(v); if (v) setPitch(1.4); }}>
              <span className="font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Key</span>
            </ToggleButton>
          </div>

          <div className="w-[2.6rem] flex flex-col items-center gap-1">
            <div className="flex-1 w-[1.7rem]">
              <Fader min={-8} max={8} value={pitch} orientation="vertical" onChange={(v) => { setPitch(v); setSync(false); }} />
            </div>
            <span className="font-mono text-[10px] leading-none text-amber-400">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>
        </div>

        {/* hot cues */}
        <div className="grid grid-cols-4 gap-2 h-[2.5rem]">
          {[1, 2, 3, 4].map((n) => (
            <Pad key={"cue-" + n} active={cues.includes(n - 1)} onPress={() => toggleCue(n - 1)}>
              <span className="font-semibold uppercase tracking-wider">{"C" + n}</span>
            </Pad>
          ))}
        </div>

        {/* loop */}
        <div className="flex gap-2 h-[1.9rem]">
          <div className="w-[3rem]">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopOn((l) => !l)}>
              <span className="font-semibold uppercase tracking-wider">{loopOn ? "Exit" : "Loop"}</span>
            </Button>
          </div>
          <div className="w-[3rem]">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold tracking-wider">2×</span>
            </Button>
          </div>
          <div className="w-[5rem]">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (loopOn ? "text-lime-300" : "text-stone-400")}>
                {(loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats) + " B"}
              </span>
            </Readout>
          </div>
        </div>
      </div>
    </div>
  );
}