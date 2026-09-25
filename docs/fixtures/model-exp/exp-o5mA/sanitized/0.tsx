export default function GeneratedComponent() {
  const TRACK = { title: "MIDNIGHT TANGERINE", artist: "KOVA VELL", key: "8A", baseBpm: 128.0, dur: 332 };

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0.18);
  const [pitch, setPitch] = useState(0);
  const [jogAngle, setJogAngle] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [cues, setCues] = useState<number[]>([0.08, 0.34, 0.61, 0.85]);
  const [lastCue, setLastCue] = useState<number>(-1);
  const [loopOn, setLoopOn] = useState(false);
  const [loopIdx, setLoopIdx] = useState(3);
  const [flash, setFlash] = useState(false);

  const LOOPS = ["1/8", "1/4", "1/2", "1", "2", "4", "8", "16"];

  const wave = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < 180; i++) {
      const t = i / 180;
      const env = 0.35 + 0.5 * Math.abs(Math.sin(t * Math.PI * 2.2));
      const beat = i % 8 === 0 ? 0.42 : 0;
      const n = Math.abs(Math.sin(i * 12.9898) * 43758.5453 % 1);
      out.push(Math.min(1, env * (0.45 + n * 0.55) + beat));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => Array.from({ length: 33 }, (_, i) => i / 32), []);

  const bpm = TRACK.baseBpm * (1 + pitch / 100);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => {
        let n = p + (0.0022 * (1 + pitch / 100));
        if (loopOn) {
          const len = (parseFloat(LOOPS[loopIdx].includes("/") ? String(1 / Number(LOOPS[loopIdx].split("/")[1])) : LOOPS[loopIdx]) * 2) / 100;
          const start = Math.floor(p / len) * len;
          if (n > start + len) n = start;
        }
        return n >= 1 ? 0 : n;
      });
      setJogAngle((a) => a + 0.16 * (1 + pitch / 100));
    }, 60);
    return () => clearInterval(id);
  }, [playing, pitch, loopOn, loopIdx]);

  const pulse = () => { setFlash(true); setTimeout(() => setFlash(false), 220); };

  const time = (frac: number) => {
    const s = Math.max(0, Math.floor(TRACK.dur * frac));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* HEADER */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2">
          <span className={"text-amber-400 transition-all duration-200 ease-out " + (playing ? "animate-pulse" : "opacity-60")}>◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">KEY</span>
          <span className={"font-mono font-bold tracking-tight text-[11px] transition-all duration-300 ease-out " + (keylock ? "text-violet-300" : "text-stone-400")}>{TRACK.key}</span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

        {/* TRACK INFO + BPM */}
        <div className="h-[2.5rem] flex gap-2">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold uppercase tracking-wider text-stone-100">{TRACK.title}</span>
                <span className="text-[0.62em] uppercase tracking-widest text-stone-500">{TRACK.artist}</span>
              </span>
            </Readout>
          </div>
          <div className="w-[7.5rem] h-full">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (sync ? "text-lime-300" : "text-amber-400")}>{bpm.toFixed(2)}</span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">BPM {pitch >= 0 ? "+" : ""}{pitch.toFixed(1)}%</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="h-[2.9rem] w-full">
          <Waveform data={wave} playhead={position} beatGrid={beatGrid} zoom={0.55} onScrub={(p) => setPosition(p)} />
        </div>

        {/* MAIN: JOG / TRANSPORT / PITCH */}
        <div className="flex-1 flex gap-2">
          {/* JOG */}
          <div className="h-full aspect-square relative">
            <JogWheel
              value={jogAngle}
              onScrub={(d) => { setJogAngle((a) => a + d); setPosition((p) => Math.min(0.999, Math.max(0, p + d * 0.012))); }}
            />
          </div>

          {/* TRANSPORT */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1">
              <ToggleButton on={playing} onChange={(v) => { setPlaying(v); pulse(); }}>
                <span className="flex flex-col items-center leading-none">
                  <span className="text-[1.15em]">{playing ? "❚❚" : "▶"}</span>
                  <span className="text-[0.55em] font-semibold uppercase tracking-widest">{playing ? "Playing" : "Paused"}</span>
                </span>
              </ToggleButton>
            </div>
            <div className="h-[2.6rem]">
              <Button onPress={() => { setPosition(cues[0]); setPlaying(false); setLastCue(0); pulse(); }}>
                <span className="font-semibold uppercase tracking-wider text-amber-300">CUE</span>
              </Button>
            </div>
          </div>

          {/* PITCH + STATE TOGGLES */}
          <div className="w-[2.8rem] h-full flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">PIT</span>
            <div className="flex-1 w-[1.9rem]">
              <Fader min={-8} max={8} value={pitch} orientation="vertical" onChange={(v) => { setPitch(v); if (sync) setSync(false); }} />
            </div>
          </div>

          <div className="w-[4.6rem] h-full flex flex-col gap-2">
            <div className="flex-1">
              <ToggleButton on={sync} onChange={(v) => { setSync(v); if (v) setPitch(0); pulse(); }}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                  <span className="text-[0.55em] uppercase tracking-widest opacity-70">{sync ? "lock" : "free"}</span>
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">Key</span>
                  <span className="text-[0.55em] uppercase tracking-widest opacity-70">lock</span>
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="h-[2.6rem] grid grid-cols-4 gap-2">
          {cues.map((c, i) => (
            <Pad
              key={"cue-" + i}
              active={lastCue === i}
              onPress={() => { setPosition(c); setLastCue(i); setPlaying(true); pulse(); }}
            >
              <span className="flex flex-col items-center leading-none">
                <span className="font-semibold uppercase tracking-wider">{i + 1}</span>
                <span className="text-[0.5em] font-mono tracking-tight opacity-70">{time(c)}</span>
              </span>
            </Pad>
          ))}
        </div>

        {/* LOOP CONTROLS */}
        <div className="h-[2rem] flex gap-2">
          <div className="w-[3.2rem]">
            <Button onPress={() => setLoopIdx((i) => Math.max(0, i - 1))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <span className="flex items-baseline gap-[0.35em] leading-none">
                <span className={"font-mono font-bold tracking-tight " + (loopOn ? "text-lime-300" : "text-stone-400")}>{LOOPS[loopIdx]}</span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">beat loop</span>
              </span>
            </Readout>
          </div>
          <div className="w-[3.2rem]">
            <Button onPress={() => setLoopIdx((i) => Math.min(LOOPS.length - 1, i + 1))}>
              <span className="font-semibold tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[5rem]">
            <Button onPress={() => { setLoopOn((l) => !l); pulse(); }}>
              <span className={"font-semibold uppercase tracking-wider " + (loopOn ? "text-lime-300" : "text-amber-300")}>Loop</span>
            </Button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="flex items-center gap-1">
          <span className={"inline-block h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " + (flash ? "bg-amber-400 shadow-lg shadow-amber-500/40" : playing ? "bg-lime-400 animate-pulse" : "bg-stone-700")} />
          CH1
        </span>
        <span className="text-lime-300 font-mono tracking-tight">{time(position)}</span>
        <span className="text-stone-500">−{time(1 - position)}</span>
      </div>
    </div>
  );
}