export default function GeneratedComponent() {
  const BASE_BPM = 128.0;
  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [loopLen, setLoopLen] = useState(4); // beats
  const [loopOn, setLoopOn] = useState(false);

  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.sin(i * 0.12) * 0.5 + 0.5;
      const kick = Math.max(0, Math.sin(i * 0.78)) * 0.8;
      const noise = (Math.sin(i * 2.3) * Math.sin(i * 0.7)) * 0.25;
      const env = 0.35 + 0.55 * Math.abs(Math.sin(i * 0.045));
      arr.push(Math.min(1, Math.max(0.04, (beat * 0.4 + kick * 0.5 + Math.abs(noise)) * env)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let p = 0; p <= 1.0001; p += 1 / 32) g.push(p);
    return g;
  }, []);

  const displayBpm = (BASE_BPM * (1 + pitch / 100)).toFixed(2);
  const cueColors = [0, 1, 2, 3];

  // Playback + jog spin
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const rate = (BASE_BPM * (1 + pitch / 100)) / 128;
      setPlayhead((p) => {
        let np = p + dt * 0.03 * rate;
        if (np > 1) np -= 1;
        return np;
      });
      setJogAngle((a) => a + dt * 3.2 * rate);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, pitch]);

  const doSync = (on: boolean) => {
    setSynced(on);
    if (on) setPitch(2.4); // snap toward Deck B tempo
  };

  const loopHalf = () => setLoopLen((l) => Math.max(0.25, l / 2));
  const loopDouble = () => setLoopLen((l) => Math.min(32, l * 2));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/10 to-transparent">
        <span className="text-amber-400 text-sm leading-none">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">CH 1</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={"h-1.5 w-1.5 rounded-full " + (playing ? "bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40" : "bg-stone-700")} />
          <span className="text-[10px] uppercase tracking-widest text-stone-500">{playing ? "Live" : "Cued"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM row */}
        <div className="flex gap-2 min-w-0">
          <div className="flex-1 basis-0 min-w-0">
            <Readout>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="truncate font-semibold text-[12px] tracking-tight text-stone-100">Midnight Circuit</span>
                <span className="truncate text-[11px] tracking-wide text-stone-500">Vela Nocturne</span>
              </div>
            </Readout>
          </div>
          <div className="w-[92px] shrink-0">
            <Readout>
              <div className="flex flex-col items-end leading-none">
                <span className={"font-mono font-bold tracking-tight text-lg " + (synced ? "text-lime-300" : "text-amber-400")}>{displayBpm}</span>
                <span className="text-[9px] uppercase tracking-widest text-stone-500">BPM {pitch >= 0 ? "+" : ""}{pitch.toFixed(1)}%</span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="h-14 shrink-0 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden p-1">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={0.5} onScrub={(p) => setPlayhead(p)} />
        </div>

        {/* Main deck: jog + right controls */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex flex-col items-center justify-center gap-2 shrink-0" style={{ width: "150px" }}>
            <div className="w-[132px] h-[132px]">
              <JogWheel value={jogAngle} onScrub={(d) => {
                setJogAngle((a) => a + d);
                setPlayhead((p) => {
                  let np = p + d / (Math.PI * 40);
                  if (np > 1) np -= 1; if (np < 0) np += 1;
                  return np;
                });
              }} />
            </div>
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 basis-0">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="font-semibold uppercase tracking-wider text-[11px]">{playing ? "❚❚" : "▶"}</span>
                </ToggleButton>
              </div>
              <div className="flex-1 basis-0">
                <Button onPress={() => { setPlaying(false); setPlayhead(0.18); }}>
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Cue</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Right controls: pitch fader + toggles */}
          <div className="flex-1 min-w-0 flex gap-2">
            {/* Pitch fader */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="flex-1 min-h-0">
                <Fader min={-8} max={8} value={pitch} onChange={(v) => { setPitch(v); if (synced) setSynced(false); }} orientation="vertical" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400 leading-none">Pitch</span>
            </div>

            {/* Sync / Keylock toggles */}
            <div className="flex-1 basis-0 min-w-0 flex flex-col gap-2">
              <div className="flex-1 basis-0 min-h-0">
                <ToggleButton on={synced} onChange={doSync}>
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Sync</span>
                </ToggleButton>
              </div>
              <div className="flex-1 basis-0 min-h-0">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-semibold uppercase tracking-wider text-[10px] leading-tight text-center">Key<br/>Lock</span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-2" style={{ height: "44px" }}>
          {cueColors.map((i) => (
            <Pad key={"cue-" + i} active={activeCue === i} onPress={() => setActiveCue((c) => (c === i ? null : i))}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">{i + 1}</span>
            </Pad>
          ))}
        </div>

        {/* Loop controls */}
        <div className="shrink-0 flex items-center gap-2" style={{ height: "40px" }}>
          <div className="w-16 shrink-0">
            <Button onPress={loopHalf}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">½</span>
            </Button>
          </div>
          <div className="flex-1 basis-0 min-w-0 h-full">
            <Readout>
              <div className="flex items-center justify-center gap-1.5 leading-none">
                <span className={"font-mono font-bold text-base " + (loopOn ? "text-lime-300" : "text-amber-400")}>{loopLen < 1 ? "1/" + Math.round(1 / loopLen) : loopLen}</span>
                <span className="text-[9px] uppercase tracking-widest text-stone-500">beats</span>
              </div>
            </Readout>
          </div>
          <div className="w-16 shrink-0">
            <Button onPress={loopDouble}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">×2</span>
            </Button>
          </div>
          <div className="w-[70px] shrink-0 h-full">
            <ToggleButton on={loopOn} onChange={setLoopOn}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Loop</span>
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}