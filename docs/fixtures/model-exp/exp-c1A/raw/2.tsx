export default function GeneratedComponent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [jogAngle, setJogAngle] = useState(0);
  const [playhead, setPlayhead] = useState(0);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [cues, setCues] = useState([-1, -1, -1, -1]);
  const [loopActive, setLoopActive] = useState(false);
  const [loopLen, setLoopLen] = useState(4);

  const baseBpm = 124;
  const totalSec = 254;

  const waveData = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 168; i++) {
      const env = 0.32 + 0.55 * Math.abs(Math.sin(i * 0.08)) * Math.abs(Math.sin(i * 0.021 + 1.2));
      const n = 0.14 * ((Math.sin(i * 1.7) + 1) / 2);
      arr.push(Math.min(1, env + n));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const a = [];
    for (let i = 0; i <= 32; i++) a.push(i / 32);
    return a;
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let np = p + 0.0011 * (1 + pitch / 100);
        if (np >= 1) np = 0;
        return np;
      });
      setJogAngle((a) => a + 0.16);
    }, 50);
    return () => clearInterval(id);
  }, [isPlaying, pitch]);

  const handleSync = (on) => {
    setSynced(on);
    if (on) setPitch(3.2);
  };

  const handleCue = () => {
    setPlayhead(0);
  };

  const handleCuePad = (i) => {
    if (cues[i] < 0) {
      setCues((prev) => {
        const n = [...prev];
        n[i] = playhead;
        return n;
      });
    } else {
      setPlayhead(cues[i]);
    }
  };

  const handleScrub = (delta) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => {
      let np = p + delta / (Math.PI * 22);
      if (np < 0) np += 1;
      if (np >= 1) np -= 1;
      return np;
    });
  };

  const effectiveBpm = baseBpm * (1 + pitch / 100);
  const bpmStr = effectiveBpm.toFixed(1);
  const pitchStr = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" + sec : sec);
  };
  const elapsed = playhead * totalSec;
  const elapsedStr = fmt(elapsed);
  const remainStr = fmt(totalSec - elapsed);

  const fmtLoop = (l) => {
    if (l >= 1) return String(l);
    if (l === 0.5) return "1/2";
    if (l === 0.25) return "1/4";
    return String(l);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/12 to-transparent">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50 animate-pulse" />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck B</span>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-violet-300 border border-violet-500/40 rounded-md px-1.5 py-0.5 leading-none">
          CH 2
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* Info bar */}
        <div className="h-[2.5rem] flex-none flex items-stretch gap-2">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col justify-center leading-tight text-left">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Protocol</span>
                <span className="text-[0.72em] font-normal tracking-wide text-stone-400">The Resonants · Am</span>
              </span>
            </Readout>
          </div>
          <div className="w-[6rem] flex-none">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (synced ? "text-lime-300" : "text-amber-400")}>
                  {bpmStr}
                </span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500 font-medium mt-[0.25em]">BPM</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="h-[2.75rem] flex-none">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.45}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Central deck */}
        <div className="flex-1 flex items-stretch gap-2">
          {/* Pitch fader */}
          <div className="flex-none w-[3.5rem] flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-medium leading-none">Pitch</span>
            <div className="flex-1 w-[1.8rem]">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span className={"font-mono font-bold leading-none text-[11px] " + (synced ? "text-lime-300" : "text-amber-400")}>
              {pitchStr}
            </span>
          </div>

          {/* Jog wheel */}
          <div className="flex-none h-full aspect-square">
            <JogWheel value={jogAngle} onScrub={handleScrub} />
          </div>

          {/* Transport 2x2 */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
            <ToggleButton on={isPlaying} onChange={setIsPlaying}>
              <span className="flex flex-col items-center leading-none">
                <span className="text-[1.35em]">{isPlaying ? "❚❚" : "▶"}</span>
                <span className="font-semibold uppercase tracking-wider text-[0.68em] mt-[0.25em]">
                  {isPlaying ? "Pause" : "Play"}
                </span>
              </span>
            </ToggleButton>
            <Button onPress={handleCue}>
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </Button>
            <ToggleButton on={synced} onChange={handleSync}>
              <span className="font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Keylock</span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cues + loop */}
        <div className="h-[5.5rem] flex-none flex flex-col gap-2">
          <div className="flex-1 flex gap-2">
            {cues.map((c, i) => (
              <div key={"cue-" + i} className="flex-1">
                <Pad active={c >= 0} onPress={() => handleCuePad(i)}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-bold text-[1.15em]">{i + 1}</span>
                    <span className="text-[0.55em] uppercase tracking-widest mt-[0.3em]">{c >= 0 ? "Cue" : "Set"}</span>
                  </span>
                </Pad>
              </div>
            ))}
          </div>
          <div className="flex-1 flex gap-2 items-stretch">
            <div className="flex-1">
              <Button onPress={() => setLoopActive(true)}>
                <span className="font-semibold uppercase tracking-wider text-[0.82em]">In</span>
              </Button>
            </div>
            <div className="flex-1">
              <Button onPress={() => setLoopActive(false)}>
                <span className="font-semibold uppercase tracking-wider text-[0.82em]">Out</span>
              </Button>
            </div>
            <div className="flex-1">
              <Readout>
                <span className="flex flex-col items-center leading-none">
                  <span className={"font-mono font-bold tracking-tight " + (loopActive ? "text-lime-300" : "text-stone-100")}>
                    {fmtLoop(loopLen)}
                  </span>
                  <span className="text-[0.5em] uppercase tracking-widest text-stone-500 mt-[0.25em]">Beat</span>
                </span>
              </Readout>
            </div>
            <div className="flex-1">
              <Button onPress={() => setLoopLen((l) => Math.max(0.25, l / 2))}>
                <span className="font-semibold text-[0.95em]">½</span>
              </Button>
            </div>
            <div className="flex-1">
              <Button onPress={() => setLoopLen((l) => Math.min(32, l * 2))}>
                <span className="font-semibold text-[0.95em]">×2</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest flex items-center gap-1.5">
          <span className={"h-1.5 w-1.5 rounded-full " + (isPlaying ? "bg-lime-400 animate-pulse" : "bg-stone-600")} />
          <span className={isPlaying ? "text-lime-300" : "text-stone-500"}>{isPlaying ? "Playing" : "Paused"}</span>
        </span>
        <span className="font-mono font-bold text-[11px] text-stone-100 tracking-tight">{elapsedStr}</span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">-{remainStr}</span>
      </div>
    </div>
  );
}