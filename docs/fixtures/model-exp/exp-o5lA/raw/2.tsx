export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.18);
  const [angle, setAngle] = useState(0);
  const [cues, setCues] = useState<number[]>([1]);
  const [loopLen, setLoopLen] = useState(4);
  const [loopIn, setLoopIn] = useState(false);

  const wave = useMemo(() => {
    const d: number[] = [];
    for (let i = 0; i < 160; i++) {
      const env = 0.45 + 0.4 * Math.sin(i / 11) * Math.cos(i / 29);
      const beat = i % 8 === 0 ? 0.35 : 0;
      d.push(Math.min(1, Math.abs(env) + beat + (i % 3) * 0.05));
    }
    return d;
  }, []);
  const grid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 33; i++) g.push(i / 32);
    return g;
  }, []);

  const bpm = 126.0 * (1 + pitch / 100);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => (p + 0.0018 * (1 + pitch / 100)) % 1);
      setAngle((a) => a + 0.16 * (1 + pitch / 100));
    }, 60);
    return () => clearInterval(id);
  }, [playing, pitch]);

  const toggleCue = (i: number) =>
    setCues((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      <div className="h-8 flex-none px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <span className={"h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " + (playing ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-violet-400")} />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck B</span>
        </div>
        <span className={"font-medium uppercase tracking-widest text-[10px] transition-all duration-200 ease-out " + (sync ? "text-lime-300 animate-pulse" : "text-stone-600")}>
          {sync ? "Sync Lock" : "Free"}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-3">
        <div className="flex gap-2">
          <div className="flex-1 h-[2.25rem]">
            <Readout>
              <span className="flex flex-col leading-none">
                <span className="font-semibold uppercase tracking-wider">Violet Hours</span>
                <span className="text-[0.7em] tracking-widest text-stone-400">NOCTIS / A-MINOR</span>
              </span>
            </Readout>
          </div>
          <div className="w-[5.5rem] h-[2.25rem]">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (sync ? "text-lime-300" : "text-violet-300")}>
                {bpm.toFixed(1)}
              </span>
            </Readout>
          </div>
        </div>

        <div className="h-[2.75rem] w-full">
          <Waveform data={wave} playhead={playhead} beatGrid={grid} zoom={0.6} onScrub={(p) => setPlayhead(p)} />
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className="w-[7.5rem] h-[7.5rem]">
            <JogWheel value={angle} onScrub={(d) => { setAngle((a) => a + d); setPlayhead((p) => (p + d * 0.02 + 1) % 1); }} />
          </div>

          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="h-[2.4rem]">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">{playing ? "Play" : "Pause"}</span>
              </ToggleButton>
            </div>
            <div className="h-[2.4rem]">
              <Button onPress={() => { setPlaying(false); setPlayhead(0); }}>
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </Button>
            </div>
            <div className="h-[2.4rem]">
              <ToggleButton on={sync} onChange={(v) => { setSync(v); if (v) setPitch(0); }}>
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
            <div className="h-[2.4rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="w-[1.8rem] h-[6.5rem]">
              <Fader min={-8} max={8} value={pitch} onChange={(v) => { setPitch(v); setSync(false); }} orientation="vertical" />
            </div>
            <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 h-[2.5rem]">
          {[1, 2, 3, 4].map((i) => (
            <Pad key={"cue-" + i} active={cues.includes(i)} onPress={() => toggleCue(i)}>
              <span className="font-semibold uppercase tracking-wider">{"C" + i}</span>
            </Pad>
          ))}
        </div>

        <div className="flex gap-2 h-[1.9rem]">
          <div className="flex-1">
            <Button onPress={() => setLoopIn(true)}>
              <span className="font-semibold uppercase tracking-wider">In</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopIn(false)}>
              <span className="font-semibold uppercase tracking-wider">Out</span>
            </Button>
          </div>
          <div className="w-[4.5rem]">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (loopIn ? "text-lime-300" : "text-violet-300")}>
                {loopLen + "B"}
              </span>
            </Readout>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopLen((l) => Math.max(0.25, l / 2))}>
              <span className="font-semibold uppercase tracking-wider">÷2</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopLen((l) => Math.min(32, l * 2))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}