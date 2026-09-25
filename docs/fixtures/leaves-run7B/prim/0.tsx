export default function GeneratedComponent() {
  const trackDuration = 214; // seconds
  const trackBpm = 128.0;

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.12); // normalized 0..1
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [jogAngle, setJogAngle] = useState(0);
  const [loopLen, setLoopLen] = useState(4); // beats
  const [loopActive, setLoopActive] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const scrubbingRef = useRef(false);

  // Static waveform data for the deck strip
  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.abs(Math.sin(i * 0.19)) * 0.5;
      const kick = i % 16 < 2 ? 0.45 : 0;
      const body = Math.abs(Math.sin(i * 0.07) * Math.cos(i * 0.031)) * 0.55;
      const noise = ((i * 73) % 11) / 11 * 0.18;
      arr.push(Math.min(1, 0.12 + beat + kick + body + noise));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 32; i++) g.push(i / 32 + 0.004);
    return g;
  }, []);

  // Playback engine — advance playhead via state (never scrolls host)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const effBpm = trackBpm * (1 + pitch / 100);
    const rate = effBpm / trackBpm; // relative speed
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!scrubbingRef.current) {
        setPlayhead((p) => {
          const np = p + (dt / trackDuration) * rate;
          return np >= 1 ? 0 : np;
        });
        setJogAngle((a) => a + dt * rate * 4.2);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, pitch]);

  const effectiveBpm = trackBpm * (1 + pitch / 100);

  const fmtTime = (frac: number) => {
    const total = Math.max(0, Math.min(trackDuration, frac * trackDuration));
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  };
  const remain = (frac: number) => "-" + fmtTime(1 - frac);

  const handleScrub = (pos: number) => {
    scrubbingRef.current = true;
    setPlayhead(Math.max(0, Math.min(1, pos)));
    window.clearTimeout((handleScrub as any)._t);
    (handleScrub as any)._t = window.setTimeout(() => {
      scrubbingRef.current = false;
    }, 120);
  };

  const handleJog = (delta: number) => {
    setJogAngle((a) => a + delta);
    scrubbingRef.current = true;
    setPlayhead((p) => Math.max(0, Math.min(1, p + delta / (Math.PI * 2) * 0.02)));
    window.clearTimeout((handleJog as any)._t);
    (handleJog as any)._t = window.setTimeout(() => {
      scrubbingRef.current = false;
    }, 140);
  };

  const cues = [1, 2, 3, 4];
  const loopSteps = [1, 2, 4, 8];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header / title bar */}
      <div className="h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"h-2 w-2 rounded-full bg-amber-400 " + (playing ? "animate-pulse shadow-lg shadow-amber-500/40" : "")} />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck A</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">CH 1</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-2 flex flex-col gap-2">
        {/* Track info + BPM readouts */}
        <div className="flex items-stretch gap-2">
          <div className="flex-1 min-w-0">
            <Readout>
              <div className="flex flex-col items-start w-full min-w-0 leading-none">
                <span className="font-semibold tracking-tight text-stone-100 text-[12px] truncate w-full">Midnight Circuit</span>
                <span className="font-normal tracking-wide text-stone-500 text-[10px] truncate w-full mt-0.5">Auralux — Neon Prowl EP</span>
              </div>
            </Readout>
          </div>
          <div className="w-[6.5rem]">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight " + (synced ? "text-lime-300" : "text-amber-400") + " text-[17px]"}>{effectiveBpm.toFixed(1)}</span>
                <span className="font-medium uppercase tracking-widest text-stone-500 text-[9px] mt-0.5">BPM</span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="relative">
          <div className="h-[3.25rem] rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden shadow-inner shadow-black/60 p-1">
            <div className="h-full w-full">
              <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={0.4} onScrub={handleScrub} />
            </div>
          </div>
          <div className="absolute top-1 right-2 flex items-center gap-2 pointer-events-none">
            <span className="font-mono font-bold tracking-tight text-stone-100 text-[11px] drop-shadow">{fmtTime(playhead)}</span>
            <span className="font-mono font-bold tracking-tight text-amber-400/80 text-[11px] drop-shadow">{remain(playhead)}</span>
          </div>
        </div>

        {/* Main control zone: jog wheel + right controls */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex flex-col items-stretch gap-2" style={{ width: "9.5rem" }}>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div className="aspect-square h-full max-h-full">
                <JogWheel value={jogAngle} onScrub={handleJog} />
              </div>
            </div>
            {/* Transport: Cue + Play/Pause */}
            <div className="grid grid-cols-2 gap-2 h-[2.25rem]">
              <Button onPress={() => { setPlayhead(activeCue !== null ? 0.12 : 0); setPlaying(false); }}>
                <span className="font-semibold uppercase tracking-wider text-amber-300">Cue</span>
              </Button>
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">{playing ? "❚❚" : "▶"}</span>
              </ToggleButton>
            </div>
          </div>

          {/* Right controls: pitch fader + toggles */}
          <div className="flex-1 min-w-0 flex gap-2">
            {/* Pitch fader */}
            <div className="flex flex-col items-center gap-1" style={{ width: "3rem" }}>
              <span className="font-medium uppercase tracking-widest text-stone-400 text-[9px] leading-none">Pitch</span>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <div className="h-full flex items-center">
                  <Fader min={-8} max={8} value={pitch} onChange={(v) => { setPitch(v); if (synced) setSynced(false); }} orientation="vertical" />
                </div>
              </div>
              <span className={"font-mono font-bold tracking-tight text-[10px] leading-none " + (pitch === 0 ? "text-stone-400" : "text-amber-400")}>{(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}</span>
            </div>

            {/* Sync + Keylock stack */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex-1 min-h-0">
                <ToggleButton on={synced} onChange={(v) => { setSynced(v); if (v) setPitch(0); }}>
                  <span className={"font-semibold uppercase tracking-wider " + (synced ? "" : "text-lime-300")}>Sync</span>
                </ToggleButton>
              </div>
              <div className="flex-1 min-h-0">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className={"font-semibold uppercase tracking-wider " + (keylock ? "" : "text-violet-300")}>Key</span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex flex-col gap-1">
          <span className="font-medium uppercase tracking-widest text-stone-500 text-[9px] leading-none px-0.5">Hot Cues</span>
          <div className="grid grid-cols-4 gap-2 h-[2.5rem]">
            {cues.map((c) => (
              <Pad key={"cue-" + c} active={activeCue === c} onPress={() => { setActiveCue(c); setPlayhead(0.12 + (c - 1) * 0.2); }}>
                <span className="font-semibold uppercase tracking-wider">{c}</span>
              </Pad>
            ))}
          </div>
        </div>

        {/* Loop controls */}
        <div className="flex items-stretch gap-2 h-[2.5rem]">
          <div className="w-[5.5rem]">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span className={"font-mono font-bold tracking-tight text-[15px] " + (loopActive ? "text-lime-300" : "text-amber-400")}>{loopLen}</span>
                <span className="font-medium uppercase tracking-widest text-stone-500 text-[8px] mt-0.5">Beats</span>
              </div>
            </Readout>
          </div>
          <div className="flex-1 min-w-0 grid grid-cols-4 gap-1">
            {loopSteps.map((s) => (
              <Button key={"loop-" + s} onPress={() => { setLoopLen(s); setLoopActive(true); }}>
                <span className={"font-semibold uppercase tracking-wider text-[11px] " + (loopActive && loopLen === s ? "text-lime-300" : "text-amber-300")}>{s}</span>
              </Button>
            ))}
          </div>
          <div className="w-[3.75rem]">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Loop</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer / status strip */}
      <div className="h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-mono uppercase tracking-widest text-[10px] text-stone-500">
          {playing ? <span className="text-lime-300">▮ PLAYING</span> : "▮ CUED"}
        </span>
        <span className="font-mono uppercase tracking-widest text-[10px] text-stone-500">
          {loopActive ? <span className="text-amber-300">LOOP {loopLen}</span> : "NO LOOP"} · {synced ? <span className="text-lime-300">SYNC</span> : "MANUAL"}
        </span>
      </div>
    </div>
  );
}