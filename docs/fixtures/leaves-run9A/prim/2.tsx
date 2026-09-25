export default function GeneratedComponent() {
  const WAVE_LEN = 220;
  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < WAVE_LEN; i++) {
      const beat = Math.sin(i * 0.42) * 0.5 + 0.5;
      const swell = Math.sin(i * 0.06) * 0.35 + 0.55;
      const grit = (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.35;
      const kick = i % 16 < 2 ? 0.35 : 0;
      arr.push(Math.min(1, (beat * 0.5 + grit * 0.5) * swell + kick));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 1; i += 1 / 32) g.push(i);
    return g;
  }, []);

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [jogAngle, setJogAngle] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopLen, setLoopLen] = useState(4); // beats
  const [loopOn, setLoopOn] = useState(false);
  const [cues, setCues] = useState<boolean[]>([true, false, false, true]);
  const [activeCue, setActiveCue] = useState<number | null>(0);

  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + pitch / 100);

  // playback advance
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const beatsPerSec = bpm / 60;
      const cycleBeats = 64; // waveform spans ~64 beats
      setPlayhead((p) => {
        let np = p + (beatsPerSec * dt) / cycleBeats;
        if (loopOn) {
          const loopSpan = loopLen / cycleBeats;
          const loopStart = Math.floor(p / loopSpan) * loopSpan;
          if (np >= loopStart + loopSpan) np = loopStart;
        }
        if (np >= 1) np -= 1;
        return np;
      });
      setJogAngle((a) => a + beatsPerSec * dt * 0.9);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, bpm, loopOn, loopLen]);

  const loopOptions = [1, 2, 4, 8, 16];
  const halveLoop = () => setLoopLen((l) => Math.max(1, loopOptions[Math.max(0, loopOptions.indexOf(l) - 1)] ?? 1));
  const doubleLoop = () => setLoopLen((l) => loopOptions[Math.min(loopOptions.length - 1, loopOptions.indexOf(l) + 1)] ?? 16);

  const hitCue = (i: number) => {
    setCues((c) => {
      const next = [...c];
      if (!next[i]) next[i] = true;
      return next;
    });
    setActiveCue(i);
    setPlayhead(0.05 + i * 0.22);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-violet-500/20 bg-neutral-900/80 bg-gradient-to-l from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"text-violet-400 text-[10px] transition-all duration-200 " + (playing ? "animate-pulse" : "opacity-70")}>◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck B</span>
        </div>
        <div className="flex items-center gap-2 flex-none">
          <span className={"text-[10px] uppercase tracking-widest transition-colors duration-200 " + (sync ? "text-lime-300" : "text-stone-600")}>
            {sync ? "Synced" : "Free"}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-stone-500">CH2</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-2 flex flex-col gap-2">
        {/* Track info + BPM readouts */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 min-w-0 h-[2.1rem]">
            <Readout>
              <div className="flex flex-col items-start justify-center w-full min-w-0 px-1">
                <span className="font-semibold tracking-tight text-[1em] text-stone-100 truncate w-full text-left">Midnight Circuit</span>
                <span className="text-[0.7em] uppercase tracking-widest text-stone-500 truncate w-full text-left">Volt Runner</span>
              </div>
            </Readout>
          </div>
          <div className="w-[5.5rem] flex-none h-[2.1rem]">
            <Readout>
              <div className="flex flex-col items-center justify-center leading-none">
                <span className={"font-mono font-bold tracking-tight text-[1.05em] " + (sync ? "text-lime-300" : "text-violet-300")}>{bpm.toFixed(1)}</span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">bpm</span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="flex-none h-[3rem]">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.5}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* Main deck area: jog wheel + pitch fader */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog wheel cluster */}
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1">
            <div className="w-[7.5rem] h-[7.5rem] max-w-full">
              <JogWheel value={jogAngle} onScrub={(d) => {
                setJogAngle((a) => a + d);
                setPlayhead((p) => {
                  let np = p + d * 0.02;
                  if (np < 0) np += 1;
                  if (np >= 1) np -= 1;
                  return np;
                });
              }} />
            </div>
            {/* Transport row */}
            <div className="flex-none flex items-stretch gap-1.5 w-full justify-center">
              <div className="w-[3rem] h-[1.7rem]">
                <Button onPress={() => { setPlaying(false); setActiveCue(0); setPlayhead(0.05); }}>
                  <span className="font-semibold uppercase tracking-wider text-[0.7em]">Cue</span>
                </Button>
              </div>
              <div className="w-[3.4rem] h-[1.7rem]">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="font-semibold uppercase tracking-wider text-[0.7em]">{playing ? "❚❚" : "▶"}</span>
                </ToggleButton>
              </div>
              <div className="w-[3rem] h-[1.7rem]">
                <ToggleButton on={sync} onChange={setSync}>
                  <span className="font-semibold uppercase tracking-wider text-[0.6em]">Sync</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="w-[3.4rem] flex-none flex flex-col items-center gap-1">
            <span className="flex-none text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none">Pitch</span>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="w-[1.6rem] h-full min-h-[6rem]">
                <Fader min={-8} max={8} value={pitch} onChange={(v) => setPitch(Math.round(v * 10) / 10)} orientation="vertical" />
              </div>
            </div>
            <div className="flex-none w-full h-[1.25rem]">
              <Readout>
                <span className={"font-mono font-bold tracking-tight text-[0.85em] " + (pitch === 0 ? "text-stone-100" : "text-violet-300")}>
                  {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
                </span>
              </Readout>
            </div>
            <div className="flex-none w-full h-[1.5rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider text-[0.55em]">Key</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Loop controls */}
        <div className="flex-none flex items-stretch gap-1.5">
          <div className="w-[2.1rem] flex-none h-[1.6rem]">
            <Button onPress={halveLoop}>
              <span className="font-semibold text-[0.85em]">½</span>
            </Button>
          </div>
          <div className="flex-1 min-w-0 h-[1.6rem]">
            <Readout>
              <div className="flex items-center justify-center gap-1 leading-none">
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">Loop</span>
                <span className={"font-mono font-bold tracking-tight text-[0.95em] " + (loopOn ? "text-lime-300" : "text-amber-400")}>{loopLen}</span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">bt</span>
              </div>
            </Readout>
          </div>
          <div className="w-[2.1rem] flex-none h-[1.6rem]">
            <Button onPress={doubleLoop}>
              <span className="font-semibold text-[0.85em]">×2</span>
            </Button>
          </div>
          <div className="w-[3.6rem] flex-none h-[1.6rem]">
            <ToggleButton on={loopOn} onChange={setLoopOn}>
              <span className="font-semibold uppercase tracking-wider text-[0.6em]">Loop</span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none grid grid-cols-4 gap-1.5">
          {cues.map((lit, i) => (
            <div key={"cue-" + i} className="h-[2.25rem]">
              <Pad active={lit || activeCue === i} onPress={() => hitCue(i)}>
                <div className="flex flex-col items-center justify-center leading-none">
                  <span className="font-semibold uppercase tracking-wider text-[0.75em]">{i + 1}</span>
                  <span className="text-[0.5em] uppercase tracking-widest opacity-70">cue</span>
                </div>
              </Pad>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}