export default function GeneratedComponent() {
  const BASE_BPM = 124;
  const DECK_A_BPM = 126;
  const DURATION = 312;

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.12);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [hotCues, setHotCues] = useState<(number | null)[]>([0.12, 0.31, null, null]);
  const [lastHit, setLastHit] = useState<number | null>(null);
  const [loopIn, setLoopIn] = useState<number | null>(null);
  const [loopOut, setLoopOut] = useState<number | null>(null);
  const [loopBeats, setLoopBeats] = useState(4);
  const [jogAngle, setJogAngle] = useState(0);
  const [scratching, setScratching] = useState(false);

  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 320; i++) {
      const env = 0.55 + 0.45 * Math.sin(i / 23) * Math.cos(i / 7.3);
      const beat = i % 8 === 0 ? 1 : 0.6;
      const n = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      arr.push(Math.min(1, Math.abs(env * beat * (0.6 + 0.4 * Math.abs(n)))));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 80; i++) g.push(i / 80);
    return g;
  }, []);

  const effectivePitch = sync ? (DECK_A_BPM / BASE_BPM - 1) * 100 : pitch;
  const bpm = BASE_BPM * (1 + effectivePitch / 100);
  const beatLen = 60 / bpm / DURATION;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let next = p + (0.05 / DURATION) * (1 + effectivePitch / 100);
        if (loopIn !== null && loopOut !== null && next >= loopOut) next = loopIn;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      setJogAngle((a) => a + 0.09 * (1 + effectivePitch / 100));
    }, 50);
    return () => clearInterval(id);
  }, [playing, effectivePitch, loopIn, loopOut]);

  const fmt = (n: number) => {
    const s = Math.max(0, Math.floor(n * DURATION));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  };

  const onScrub = (delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => Math.min(1, Math.max(0, p + delta * 0.004)));
    setScratching(true);
    setTimeout(() => setScratching(false), 180);
  };

  const hitPad = (i: number) => {
    setLastHit(i);
    setTimeout(() => setLastHit(null), 220);
    const c = hotCues[i];
    if (c === null) {
      const n = [...hotCues];
      n[i] = playhead;
      setHotCues(n);
    } else {
      setPlayhead(c);
    }
  };

  const setIn = () => {
    setLoopIn(playhead);
    setLoopOut(playhead + beatLen * loopBeats);
  };
  const setOut = () => {
    if (loopIn !== null && playhead > loopIn) {
      setLoopOut(playhead);
      setLoopBeats(Math.max(1, Math.round((playhead - loopIn) / beatLen)));
    }
  };
  const halve = () => {
    const b = Math.max(0.25, loopBeats / 2);
    setLoopBeats(b);
    if (loopIn !== null) setLoopOut(loopIn + beatLen * b);
  };
  const dbl = () => {
    const b = Math.min(64, loopBeats * 2);
    setLoopBeats(b);
    if (loopIn !== null) setLoopOut(loopIn + beatLen * b);
  };
  const exitLoop = () => {
    setLoopIn(null);
    setLoopOut(null);
  };

  const loopActive = loopIn !== null && loopOut !== null;
  const cueLabels = ["A", "B", "C", "D"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"inline-block w-2 h-2 rounded-full transition-all duration-200 " + (playing ? "bg-lime-400 shadow-lg shadow-lime-400/50 animate-pulse" : "bg-violet-500 shadow-md shadow-violet-500/40")} />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck B</span>
          <span className="text-[10px] uppercase tracking-widest text-violet-300/70 truncate">CH 2</span>
        </div>
        <div className="flex items-center gap-1 min-w-0">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={"seg-" + i}
              className={"block w-1 rounded-full transition-all duration-200 " + (playing ? "bg-violet-400 animate-pulse" : "bg-stone-700")}
              style={{ height: (4 + i * 3) + "px", animationDelay: i * 120 + "ms" }}
            />
          ))}
          <span className="ml-2 text-[10px] uppercase tracking-widest text-stone-500">{scratching ? "scratch" : playing ? "playing" : "standby"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* Top strip: track info, BPM, sync, keylock */}
        <div className="flex-none h-8 flex gap-2">
          <div className="flex-1 h-8 ring-1 ring-inset ring-violet-500/20 rounded-lg">
            <Readout>
              <span className="flex flex-col items-start leading-none">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Circuit</span>
                <span className="text-[0.7em] font-normal tracking-wide text-violet-300">Halcyon Drift · {fmt(playhead)} / {fmt(1)}</span>
              </span>
            </Readout>
          </div>
          <div className="w-16 h-8">
            <Readout>
              <span className={"font-mono font-bold tracking-tight transition-all duration-300 " + (sync ? "text-lime-300 animate-pulse" : "text-violet-300")}>{bpm.toFixed(1)}</span>
            </Readout>
          </div>
          <div className="w-12 h-8">
            <ToggleButton on={sync} onChange={setSync}>
              <span className="font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
          </div>
          <div className="w-12 h-8">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Key</span>
            </ToggleButton>
          </div>
        </div>

        {/* Waveform strip */}
        <div className={"flex-none h-12 rounded-xl border border-stone-800/70 bg-stone-950/80 transition-all duration-300 " + (loopActive ? "ring-1 ring-inset ring-violet-500/50" : "")}>
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={1} onScrub={(p) => setPlayhead(p)} />
        </div>

        {/* Main: transport | jog | pitch */}
        <div className="flex-1 flex gap-2">
          {/* Transport column */}
          <div className="flex-1 basis-0 flex flex-col gap-2 justify-center">
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none px-1">Transport</span>
            <div className="h-10 w-full">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">{playing ? "❚❚ Pause" : "▶ Play"}</span>
              </ToggleButton>
            </div>
            <div className="h-10 w-full">
              <Button
                onPress={() => {
                  const c = hotCues[0];
                  setPlayhead(c !== null ? c : 0);
                  setPlaying(false);
                }}
              >
                <span className="font-semibold uppercase tracking-wider text-red-400">● Cue</span>
              </Button>
            </div>
            <div className="flex items-center gap-1 px-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 leading-none">Elapsed</span>
              <span className="font-mono font-bold text-[11px] tracking-tight text-stone-100">{fmt(playhead)}</span>
            </div>
            <div className="flex items-center gap-1 px-1">
              <span className="text-[10px] uppercase tracking-widest text-stone-500 leading-none">Remain</span>
              <span className="font-mono font-bold text-[11px] tracking-tight text-violet-300">-{fmt(1 - playhead)}</span>
            </div>
          </div>

          {/* Jog wheel */}
          <div className="h-full aspect-square relative p-1">
            <div
              className={"absolute inset-0 rounded-full transition-all duration-300 " + (playing ? "opacity-100" : "opacity-40")}
              style={{
                background: "conic-gradient(from " + (jogAngle * 57.3) + "deg, rgba(167,139,250,0.55), rgba(245,158,11,0.15) 30%, transparent 55%, rgba(167,139,250,0.35) 85%, rgba(167,139,250,0.55))",
                filter: "blur(2px)",
              }}
            />
            <div className="relative w-full h-full">
              <JogWheel value={jogAngle} onScrub={onScrub} />
            </div>
          </div>

          {/* Pitch column */}
          <div className="flex-1 basis-0 flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none">Pitch</span>
            <span className={"font-mono font-bold text-[11px] tracking-tight transition-colors duration-200 " + (sync ? "text-lime-300" : "text-amber-400")}>
              {(effectivePitch >= 0 ? "+" : "") + effectivePitch.toFixed(2)}%
            </span>
            <div className="flex-1 w-8 flex justify-center">
              <div className="h-full w-8">
                <Fader min={-8} max={8} value={effectivePitch} onChange={(v) => { setSync(false); setPitch(v); }} orientation="vertical" />
              </div>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-stone-600 leading-none">±8</span>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none h-10 flex gap-2">
          {hotCues.map((c, i) => (
            <div key={"pad-" + i} className={"flex-1 h-10 rounded-md transition-all duration-200 " + (lastHit === i ? "shadow-lg shadow-violet-500/40 scale-[1.03]" : "")}>
              <Pad onPress={() => hitPad(i)} active={c !== null}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">Cue {cueLabels[i]}</span>
                  <span className="text-[0.7em] font-mono tracking-tight text-stone-400">{c !== null ? fmt(c) : "set"}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex-none h-7 flex gap-2">
          <div className={"w-16 h-7 rounded-lg transition-all duration-300 " + (loopActive ? "ring-1 ring-inset ring-violet-500/50 shadow-lg shadow-violet-500/30" : "")}>
            <Readout>
              <span className={"font-mono font-bold tracking-tight " + (loopActive ? "text-violet-300 animate-pulse" : "text-stone-100")}>
                {loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats} ♩
              </span>
            </Readout>
          </div>
          <div className="flex-1 h-7"><Button onPress={setIn}><span className="font-semibold uppercase tracking-wider">In</span></Button></div>
          <div className="flex-1 h-7"><Button onPress={setOut}><span className="font-semibold uppercase tracking-wider">Out</span></Button></div>
          <div className="flex-1 h-7"><Button onPress={halve}><span className="font-semibold uppercase tracking-wider">½</span></Button></div>
          <div className="flex-1 h-7"><Button onPress={dbl}><span className="font-semibold uppercase tracking-wider">×2</span></Button></div>
          <div className="flex-1 h-7"><Button onPress={exitLoop}><span className="font-semibold uppercase tracking-wider text-violet-300">Exit</span></Button></div>
        </div>
      </div>
    </div>
  );
}