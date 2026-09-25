export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0);
  const [pos, setPos] = useState(0.18);
  const [angle, setAngle] = useState(0);
  const [cues, setCues] = useState<number[]>([0.12, 0.44]);
  const [loopLen, setLoopLen] = useState(4);
  const [loopOn, setLoopOn] = useState(false);

  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + pitch / 100);

  const wave = useMemo(() => {
    const d: number[] = [];
    for (let i = 0; i < 256; i++) {
      const b = Math.sin(i / 3.1) * 0.35 + Math.sin(i / 11) * 0.3;
      const kick = i % 16 < 2 ? 0.45 : 0;
      d.push(Math.min(1, Math.abs(b) + kick + 0.18 + (i % 7) * 0.02));
    }
    return d;
  }, []);
  const grid = useMemo(() => Array.from({ length: 32 }, (_, i) => i / 32), []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => (p + 0.0016 * (1 + pitch / 100)) % 1);
      setAngle((a) => a + 0.09 * (1 + pitch / 100));
    }, 40);
    return () => clearInterval(id);
  }, [playing, pitch]);

  const timeStr = (() => {
    const total = 318 * pos;
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  })();

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* header */}
      <div className="h-8 flex-none px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2">
          <span className={"text-violet-400 text-[11px] " + (playing ? "animate-pulse" : "")}>◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck B</span>
        </div>
        <span className={"font-medium uppercase tracking-widest text-[10px] " + (sync ? "text-lime-300 animate-pulse" : "text-stone-500")}>
          {sync ? "sync lock" : "free"}
        </span>
      </div>

      {/* body */}
      <div className="flex-1 p-2 flex flex-col gap-1.5">
        {/* info + bpm */}
        <div className="flex-none h-[2.4rem] flex gap-1.5">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Circuit</span>
                <span className="text-[0.7em] uppercase tracking-widest text-stone-400">Vel Kandor</span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.5rem] h-full">
            <Readout>
              <span className="flex flex-col items-center leading-tight">
                <span className={"font-mono font-bold tracking-tight " + (sync ? "text-lime-300" : "text-violet-300")}>
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">bpm</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* waveform */}
        <div className="flex-none h-[2.3rem] w-full rounded-xl overflow-clip border border-stone-800/70 bg-stone-950/80">
          <Waveform data={wave} playhead={pos} beatGrid={grid} zoom={0.5} onScrub={(p) => setPos(p)} />
        </div>

        {/* jog + pitch */}
        <div className="flex-1 flex items-stretch gap-2">
          <div className="flex-1 flex items-center justify-center">
            <div className="h-full aspect-square">
              <JogWheel value={angle} onScrub={(d) => { setAngle((a) => a + d); setPos((p) => (p + d * 0.01 + 1) % 1); }} />
            </div>
          </div>
          <div className="w-[3rem] flex flex-col items-center justify-between py-0.5">
            <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400">pitch</span>
            <div className="w-[2rem] flex-1 my-1">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span className="font-mono font-bold tracking-tight text-[10px] text-violet-300">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>
        </div>

        {/* transport */}
        <div className="flex-none h-[2rem] grid grid-cols-4 gap-1.5">
          <ToggleButton on={playing} onChange={setPlaying}>
            <span className="font-semibold uppercase tracking-wider">{playing ? "Play" : "Paus"}</span>
          </ToggleButton>
          <Button onPress={() => { setPos(cues[0] ?? 0); setPlaying(false); }}>
            <span className="font-semibold uppercase tracking-wider">Cue</span>
          </Button>
          <ToggleButton on={sync} onChange={(v) => { setSync(v); if (v) setPitch(1.4); }}>
            <span className="font-semibold uppercase tracking-wider">Sync</span>
          </ToggleButton>
          <ToggleButton on={keylock} onChange={setKeylock}>
            <span className="font-semibold uppercase tracking-wider">Key</span>
          </ToggleButton>
        </div>

        {/* hot cues */}
        <div className="flex-none h-[2.3rem] grid grid-cols-4 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Pad
              key={"cue-" + i}
              active={cues[i] !== undefined}
              onPress={() => {
                if (cues[i] !== undefined) setPos(cues[i]);
                else setCues((c) => { const n = [...c]; n[i] = pos; return n; });
              }}
            >
              <span className="font-semibold uppercase tracking-wider">{"C" + (i + 1)}</span>
            </Pad>
          ))}
        </div>

        {/* loop */}
        <div className="flex-none h-[1.85rem] flex gap-1.5">
          <div className="w-[3.4rem] h-full">
            <Button onPress={() => setLoopLen((l) => Math.max(0.25, l / 2))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (loopOn ? "text-lime-300" : "text-stone-400")}>
                {loopLen + " BEAT"}
              </span>
            </Readout>
          </div>
          <div className="w-[3.4rem] h-full">
            <Button onPress={() => setLoopLen((l) => Math.min(32, l * 2))}>
              <span className="font-semibold tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[4.6rem] h-full">
            <Button onPress={() => setLoopOn((v) => !v)}>
              <span className="font-semibold uppercase tracking-wider">{loopOn ? "Exit" : "Loop"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-6 flex-none px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span>ch 2 · {keylock ? "keylock" : "varispeed"}</span>
        <span className="text-lime-300 font-mono">{timeStr}</span>
      </div>
    </div>
  );
}