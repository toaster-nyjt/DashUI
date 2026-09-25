export default function GeneratedComponent() {
  const [playing, setPlaying] = useState(false);
  const [cueing, setCueing] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [loopLen, setLoopLen] = useState(4);
  const [loopOn, setLoopOn] = useState(false);

  const baseBpm = 126.0;
  const bpm = useMemo(() => baseBpm * (1 + pitch / 100), [pitch]);

  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = Math.abs(Math.sin(t * Math.PI * 18));
      const kick = Math.pow(Math.abs(Math.sin(t * Math.PI * 72)), 6) * 0.7;
      const swell = 0.35 + 0.4 * Math.sin(t * Math.PI * 3.2 + 0.5);
      const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      arr.push(Math.min(1, Math.max(0.05, beat * 0.55 * swell + kick + Math.abs(noise) * 0.12)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 32; i++) g.push(i / 32);
    return g;
  }, []);

  const cues = [
    { id: 1, label: "INTRO", pos: 0.05 },
    { id: 2, label: "VERSE", pos: 0.28 },
    { id: 3, label: "DROP", pos: 0.52 },
    { id: 4, label: "BRK", pos: 0.74 },
  ];

  const loopSteps = [1, 2, 4, 8, 16];

  useEffect(() => {
    if (!playing || scrubbing) return;
    const speed = (bpm / 126) * 0.0009;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let next = p + speed;
        if (loopOn) {
          const start = activeCue != null ? cues.find((c) => c.id === activeCue)?.pos ?? 0 : 0;
          const end = Math.min(1, start + loopLen / 64);
          if (next >= end) next = start;
        }
        if (next >= 1) next = 0;
        return next;
      });
      setJogAngle((a) => a + speed * Math.PI * 8);
    }, 33);
    return () => clearInterval(id);
  }, [playing, scrubbing, bpm, loopOn, loopLen, activeCue]);

  const doCue = () => {
    setCueing(true);
    const target = activeCue != null ? cues.find((c) => c.id === activeCue)?.pos ?? 0 : 0;
    setPlayhead(target);
    setTimeout(() => setCueing(false), 160);
  };

  const timeStr = (frac: number) => {
    const total = 240;
    const s = Math.floor(frac * total);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(1, "0") + ":" + String(r).padStart(2, "0");
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-[radial-gradient(120%_120%_at_50%_-10%,#221a10_0%,#0c0b0a_55%,#050505_100%)] text-neutral-100">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400/90">Deck A</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 bg-amber-500/15 border border-amber-400/30 rounded-md px-1.5 py-0.5">CH1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={"h-1.5 w-1.5 rounded-full " + (playing ? "bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/70" : "bg-neutral-600")} />
          <span className="text-[10px] tracking-wide text-neutral-500 font-mono">{playing ? "PLAYING" : "CUED"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col gap-2">
        {/* Track info + BPM */}
        <div className="flex items-stretch gap-2 shrink-0">
          <div className="flex-1 min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2.5 py-1.5 flex flex-col justify-center overflow-hidden">
            <Readout>
              <span className="block text-[13px] font-semibold leading-tight text-amber-300 truncate">Midnight Circuit</span>
            </Readout>
            <Readout>
              <span className="block text-[11px] leading-tight text-neutral-500 truncate">Nova Kane · 4A</span>
            </Readout>
          </div>
          <div className="w-24 shrink-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2 py-1 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">BPM</span>
            <Readout>
              <span className="font-mono text-2xl font-bold tabular-nums tracking-tight leading-none text-amber-300">{bpm.toFixed(1)}</span>
            </Readout>
          </div>
        </div>

        {/* Waveform */}
        <div className="shrink-0 h-14 rounded-lg overflow-hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-white/[0.04]">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={0.6} onScrub={(p) => { setScrubbing(true); setPlayhead(p); setTimeout(() => setScrubbing(false), 120); }} />
        </div>

        {/* Middle: Jog wheel + Pitch fader */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Jog wheel area */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col items-center justify-center gap-1.5">
            <div className="relative flex-1 min-h-0 aspect-square max-h-full">
              <div className={"absolute inset-0 rounded-full transition-all duration-200 " + (playing ? "shadow-[0_0_16px_-2px] shadow-amber-500/60" : "")}>
                <JogWheel value={jogAngle} onScrub={(d) => { setScrubbing(true); setJogAngle((a) => a + d); setPlayhead((p) => Math.min(1, Math.max(0, p + d * 0.02))); setTimeout(() => setScrubbing(false), 120); }} />
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-neutral-950/70 px-2 py-1 text-center">
                  <span className="block font-mono text-[13px] font-bold tabular-nums leading-none text-amber-300">{timeStr(playhead)}</span>
                  <span className="block text-[9px] uppercase tracking-widest text-neutral-500 leading-none mt-0.5">-{timeStr(1 - playhead)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch fader */}
          <div className="w-16 shrink-0 min-h-0 flex flex-col items-center gap-1 rounded-lg bg-neutral-900/50 border border-white/[0.05] py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">Pitch</span>
            <div className="flex-1 min-h-0 py-0.5">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span className="font-mono text-[11px] font-bold tabular-nums leading-none text-amber-300">{(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%</span>
          </div>
        </div>

        {/* Transport row */}
        <div className="shrink-0 grid grid-cols-3 gap-2">
          <div className="h-10">
            <Button onPress={doCue}>
              <span className="flex items-center justify-center gap-1.5">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
                <span className="text-[11px] font-bold uppercase tracking-widest">Cue</span>
              </span>
            </Button>
          </div>
          <div className="h-10">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="flex items-center justify-center gap-1.5">
                {playing ? (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                ) : (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z" /></svg>
                )}
                <span className="text-[11px] font-bold uppercase tracking-widest">{playing ? "Pause" : "Play"}</span>
              </span>
            </ToggleButton>
          </div>
          <div className="h-10">
            <ToggleButton on={sync} onChange={setSync}>
              <span className="flex items-center justify-center gap-1.5">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M4 12a8 8 0 0 1 13-6M20 12a8 8 0 0 1-13 6" /><path d="M17 3v3h-3M7 21v-3h3" /></svg>
                <span className="text-[11px] font-bold uppercase tracking-widest">Sync</span>
              </span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5">
          {cues.map((c) => (
            <div key={"cue-" + c.id} className="h-9">
              <Pad active={activeCue === c.id} onPress={() => { setActiveCue(c.id); setPlayhead(c.pos); }}>
                <span className="flex flex-col items-center justify-center leading-none">
                  <span className="text-[9px] font-bold tabular-nums">{c.id}</span>
                  <span className="text-[8px] font-semibold uppercase tracking-wider">{c.label}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls + Keylock */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 min-w-0 flex items-stretch gap-1.5 rounded-lg bg-neutral-900/50 border border-white/[0.05] p-1.5">
            <div className="flex flex-col justify-center px-1 shrink-0">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">Loop</span>
              <Readout>
                <span className="font-mono text-[13px] font-bold tabular-nums leading-none text-amber-300">{loopLen}<span className="text-[9px] text-neutral-500 font-semibold"> BAR</span></span>
              </Readout>
            </div>
            <div className="w-8">
              <Button onPress={() => setLoopLen((l) => { const i = loopSteps.indexOf(l); return loopSteps[Math.max(0, i - 1)]; })}>
                <span className="text-[13px] font-bold leading-none">½</span>
              </Button>
            </div>
            <div className="w-8">
              <Button onPress={() => setLoopLen((l) => { const i = loopSteps.indexOf(l); return loopSteps[Math.min(loopSteps.length - 1, i + 1)]; })}>
                <span className="text-[13px] font-bold leading-none">×2</span>
              </Button>
            </div>
            <div className="flex-1 min-w-0">
              <ToggleButton on={loopOn} onChange={setLoopOn}>
                <span className="text-[10px] font-bold uppercase tracking-widest">{loopOn ? "Exit" : "In/Out"}</span>
              </ToggleButton>
            </div>
          </div>
          <div className="w-20 shrink-0">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="flex flex-col items-center justify-center leading-none">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                <span className="text-[8px] font-bold uppercase tracking-widest mt-0.5">Keylock</span>
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="font-mono">{timeStr(playhead)} / 4:00</span>
        <span className="flex items-center gap-2">
          {sync && <span className="text-amber-400/90 font-semibold uppercase tracking-widest">Synced</span>}
          {keylock && <span className="text-emerald-400 font-semibold uppercase tracking-widest">Key ●</span>}
          {loopOn && <span className="text-amber-300 font-semibold uppercase tracking-widest animate-pulse">Loop {loopLen}</span>}
        </span>
      </div>
    </div>
  );
}