export default function GeneratedComponent() {
  const track = { title: "Midnight Circuit", artist: "Vela Nox", bpm: 126, duration: 372 };

  const [playing, setPlaying] = useState<boolean>(false);
  const [playhead, setPlayhead] = useState<number>(0);
  const [pitch, setPitch] = useState<number>(0);
  const [keylock, setKeylock] = useState<boolean>(false);
  const [sync, setSync] = useState<boolean>(false);
  const [angle, setAngle] = useState<number>(0);
  const [hotCues, setHotCues] = useState<(number | null)[]>([0.08, null, 0.42, null]);
  const [loopBeats, setLoopBeats] = useState<number>(4);
  const [loopOn, setLoopOn] = useState<boolean>(false);
  const [loopStart, setLoopStart] = useState<number>(0);
  const [cuePoint] = useState<number>(0.08);
  const [lastCue, setLastCue] = useState<number | null>(null);

  const waveData = useMemo<number[]>(() => {
    const out: number[] = [];
    for (let i = 0; i < 240; i++) {
      const env = 0.35 + 0.45 * Math.abs(Math.sin(i / 19)) + 0.2 * Math.abs(Math.sin(i / 3.3));
      const kick = i % 8 === 0 ? 0.35 : 0;
      out.push(Math.min(1, env * 0.75 + kick + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.15));
    }
    return out;
  }, []);

  const beatGrid = useMemo<number[]>(() => {
    const beats = (track.duration / 60) * track.bpm;
    const g: number[] = [];
    for (let b = 0; b < beats; b += 4) g.push(b / beats);
    return g;
  }, [track.bpm, track.duration]);

  const effectivePitch = sync ? 1.6 : pitch;
  const effectiveBpm = track.bpm * (1 + effectivePitch / 100);
  const loopLen = ((60 / effectiveBpm) * loopBeats) / track.duration;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const step = (0.06 / track.duration) * (1 + effectivePitch / 100);
      setPlayhead((p) => {
        let n = p + step;
        if (loopOn && n > loopStart + loopLen) n = loopStart;
        if (n >= 1) n = 0;
        return n;
      });
      setAngle((a) => a + 0.06 * 3.5);
    }, 60);
    return () => clearInterval(id);
  }, [playing, effectivePitch, loopOn, loopStart, loopLen, track.duration]);

  const onScrub = useCallback((delta: number) => {
    setAngle((a) => a + delta);
    setPlayhead((p) => Math.max(0, Math.min(0.999, p + delta * 0.004)));
  }, []);

  const handleHotCue = (i: number) => {
    const c = hotCues[i];
    if (c === null) {
      const next = [...hotCues];
      next[i] = playhead;
      setHotCues(next);
    } else {
      setPlayhead(c);
      setLastCue(i);
      setTimeout(() => setLastCue(null), 350);
    }
  };

  const toggleLoop = () => {
    if (!loopOn) setLoopStart(playhead);
    setLoopOn(!loopOn);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" : "") + r;
  };
  const elapsed = fmt(playhead * track.duration);
  const remaining = fmt((1 - playhead) * track.duration);

  const padColors = ["amber", "lime", "violet", "red"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans select-none">
      {/* Header */}
      <div className="h-8 flex-none px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"h-2 w-2 rounded-full transition-all duration-200 ease-out " + (playing ? "bg-lime-400 shadow-lg shadow-lime-400/50 animate-pulse" : "bg-amber-400 shadow-md shadow-amber-500/40")} />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck A</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-500 truncate">
          <span className="text-stone-400">{elapsed}</span>
          <span className="text-stone-600">/</span>
          <span className="text-amber-400/80">-{remaining}</span>
          <span className={"transition-all duration-300 ease-out " + (sync ? "text-lime-300 animate-pulse" : "text-stone-600")}>{sync ? "Locked" : "Free"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-2 gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Track info + BPM */}
        <div className="h-[1.5rem] flex gap-2">
          <div className="flex-1 h-full">
            <Readout>
              <span className="font-semibold tracking-tight text-stone-100">{track.title}</span>
              <span className="text-stone-500 font-normal tracking-wide"> — {track.artist}</span>
            </Readout>
          </div>
          <div className="w-[6rem] h-full">
            <Readout>
              <span className={"font-mono font-bold tracking-tight transition-all duration-300 ease-out " + (sync ? "text-lime-300" : "text-amber-400")}>
                {effectiveBpm.toFixed(2)}
              </span>
              <span className="text-[0.6em] uppercase tracking-widest text-stone-500"> bpm</span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="h-[3rem] w-full relative">
          <div className={"absolute inset-0 rounded-xl pointer-events-none transition-all duration-500 ease-out " + (playing ? "shadow-lg shadow-amber-500/20" : "shadow-none")} />
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={1} onScrub={(p) => setPlayhead(p)} />
        </div>

        {/* Jog + pitch column */}
        <div className="flex-1 grid grid-cols-[1fr_4rem] gap-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full aspect-square relative">
                <div className={"absolute -inset-1 rounded-full transition-all duration-500 ease-out " + (playing ? "shadow-[0_0_28px_6px_rgba(251,191,36,0.25)] animate-pulse" : "shadow-none")} />
                <div
                  className="absolute inset-0 rounded-full pointer-events-none transition-transform duration-150 ease-out"
                  style={{ transform: "rotate(" + angle + "rad)" }}
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-lime-400 shadow-lg shadow-lime-400/50 -translate-y-2" />
                </div>
                <JogWheel value={angle} onScrub={onScrub} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-center">
            <span className="font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">Pitch</span>
            <div className="flex-1 w-[1.6rem] relative">
              <div className="absolute inset-0">
                <Fader min={-8} max={8} value={effectivePitch} onChange={setPitch} orientation="vertical" />
              </div>
            </div>
            <span className={"font-mono text-[10px] leading-none transition-all duration-200 " + (sync ? "text-lime-300" : "text-amber-400")}>
              {(effectivePitch >= 0 ? "+" : "") + effectivePitch.toFixed(1)}%
            </span>
            <div className="w-full h-[1.5rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
            <div className="w-full h-[1.5rem]">
              <ToggleButton on={sync} onChange={setSync}>
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="h-[2.5rem] grid grid-cols-4 gap-2">
          {hotCues.map((c, i) => (
            <div key={"hc-" + i} className={"h-full relative transition-all duration-200 ease-out " + (lastCue === i ? "scale-95 brightness-125" : "")}>
              <div className={"absolute inset-0 rounded-md pointer-events-none transition-all duration-300 ease-out " + (c !== null ? "shadow-lg shadow-amber-500/30" : "shadow-none")} />
              <Pad onPress={() => handleHotCue(i)} active={c !== null}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">Cue {i + 1}</span>
                  <span className="text-[0.65em] font-mono tracking-tight text-stone-400">
                    {c !== null ? fmt(c * track.duration) : "set"}
                  </span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Transport + loop */}
        <div className="h-[2rem] flex gap-2 items-stretch">
          <div className="w-[3.5rem] h-full">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="font-semibold uppercase tracking-wider">{playing ? "❚❚" : "▶"}</span>
            </ToggleButton>
          </div>
          <div className="w-[3.5rem] h-full">
            <Button onPress={() => { setPlayhead(cuePoint); setPlaying(false); }}>
              <span className="font-semibold uppercase tracking-wider text-red-400">Cue</span>
            </Button>
          </div>
          <div className="flex-1 h-full relative">
            <div className={"absolute inset-0 rounded-lg pointer-events-none transition-all duration-300 ease-out " + (loopOn ? "ring-1 ring-inset ring-lime-400/50 shadow-lg shadow-lime-400/30 animate-pulse" : "")} />
            <Readout>
              <span className="font-medium uppercase tracking-widest text-stone-400 text-[0.65em]">Loop </span>
              <span className={"font-mono font-bold tracking-tight " + (loopOn ? "text-lime-300" : "text-amber-400")}>
                {loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats}
              </span>
              <span className="text-[0.65em] text-stone-500 tracking-wide"> beats</span>
            </Readout>
          </div>
          <div className="w-[2.75rem] h-full">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.125, b / 2))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="w-[2.75rem] h-full">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[3.25rem] h-full">
            <Button onPress={toggleLoop}>
              <span className={"font-semibold uppercase tracking-wider " + (loopOn ? "text-lime-300" : "")}>{loopOn ? "Exit" : "Loop"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}