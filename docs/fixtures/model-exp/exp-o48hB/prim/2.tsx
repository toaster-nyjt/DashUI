export default function GeneratedComponent() {
  const BASE_BPM = 124.0;

  const [playing, setPlaying] = useState(false);
  const [pitch, setPitch] = useState(0); // -8..8 %
  const [playhead, setPlayhead] = useState(0.12);
  const [jogAngle, setJogAngle] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [cues, setCues] = useState<(number | null)[]>([0.0, 0.28, null, null]);
  const [loopBeats, setLoopBeats] = useState(0); // 0 = off

  const bpm = useMemo(() => {
    const factor = sync ? 1 : 1 + pitch / 100;
    return BASE_BPM * factor;
  }, [pitch, sync]);

  const waveData = useMemo(() => {
    const n = 110;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const env = 0.45 + 0.4 * Math.sin(i * 0.13) * Math.cos(i * 0.04);
      const beat = i % 8 < 2 ? 1.15 : 0.75;
      const noise = 0.5 + 0.5 * Math.abs(Math.sin(i * 1.7 + i * i * 0.011));
      arr.push(Math.max(0.05, Math.min(1, env * beat * noise)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 16; i++) g.push(i / 16);
    return g;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const speed = (bpm / 60) * 0.0006;
    const id = setInterval(() => {
      setPlayhead((p) => (p + speed) % 1);
      setJogAngle((a) => a + speed * Math.PI * 8);
    }, 16);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const hitCue = (i: number) => {
    setCues((prev) => {
      const next = [...prev];
      if (next[i] == null) next[i] = playhead;
      else setPlayhead(next[i] as number);
      return next;
    });
  };

  const loopLabel = loopBeats === 0 ? "OFF" : (loopBeats < 1 ? "½" : String(loopBeats)) + " BEAT";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"h-2 w-2 rounded-full " + (playing ? "bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40" : "bg-violet-500/60")} />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck B</span>
        </div>
        <span className="font-medium uppercase tracking-widest text-[10px] text-violet-300">CH 2</span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* Info + BPM */}
        <div className="flex gap-2 flex-none">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Voltage</span>
                <span className="text-[0.7em] font-normal tracking-wide text-stone-400">Neon Cascade</span>
              </span>
            </Readout>
          </div>
          <div className="w-24">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (sync ? "text-lime-300" : "text-amber-400")}>{bpm.toFixed(1)}</span>
                <span className="text-[0.55em] font-medium uppercase tracking-widest text-stone-500">BPM</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="h-16 flex-none">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={0.5} onScrub={(p) => setPlayhead(p)} />
        </div>

        {/* Jog + controls + pitch */}
        <div className="flex-1 flex gap-2">
          {/* Jog wheel */}
          <div className="h-full aspect-square flex-none">
            <JogWheel value={jogAngle} onScrub={(d) => { setJogAngle((a) => a + d); setPlayhead((p) => Math.max(0, Math.min(1, p + d * 0.02))); }} />
          </div>

          {/* Transport cluster */}
          <div className="flex-1 grid grid-rows-2 grid-cols-2 gap-2">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="font-semibold uppercase tracking-wider">{playing ? "▮▮" : "▶"}</span>
            </ToggleButton>
            <Button onPress={() => setPlayhead(cues[0] ?? 0)}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </Button>
            <ToggleButton on={sync} onChange={setSync}>
              <span className="font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Key</span>
            </ToggleButton>
          </div>

          {/* Pitch fader */}
          <div className="flex-none flex flex-col items-center gap-1">
            <div className="flex-1">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span className="font-mono font-bold text-[10px] text-violet-300 leading-none">{(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}</span>
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">Pitch</span>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="grid grid-cols-4 gap-2 flex-none">
          {cues.map((c, i) => (
            <div key={"cue-" + i} className="h-10">
              <Pad active={c != null} onPress={() => hitCue(i)}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">{"Q" + (i + 1)}</span>
                  <span className="text-[0.6em] font-normal tracking-wide">{c != null ? "SET" : "—"}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex gap-2 flex-none">
          {[0.5, 1, 2, 4].map((b) => (
            <div key={"loop-" + b} className="flex-1">
              <Button onPress={() => setLoopBeats((cur) => (cur === b ? 0 : b))}>
                <span className="font-semibold uppercase tracking-wider">{b < 1 ? "½" : String(b)}</span>
              </Button>
            </div>
          ))}
          <div className="w-24">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (loopBeats ? "text-lime-300" : "text-stone-500")}>{loopLabel}</span>
                <span className="text-[0.55em] font-medium uppercase tracking-widest text-stone-600">Loop</span>
              </span>
            </Readout>
          </div>
        </div>
      </div>
    </div>
  );
}