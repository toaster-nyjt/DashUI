export default function GeneratedComponent() {
  const WAVE = useMemo(() => {
    const n = 128;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.sin((i / n) * Math.PI * 16) * 0.4;
      const swell = Math.sin((i / n) * Math.PI * 3) * 0.35;
      const grit = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      arr.push(Math.min(1, Math.abs(beat + swell) + Math.abs(grit) * 0.35 + 0.08));
    }
    return arr;
  }, []);

  const BEATGRID = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 16; i++) g.push(i / 16);
    return g;
  }, []);

  const BASE_BPM = 126;

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);
  const [pitch, setPitch] = useState(0); // -8..+8 %
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [cues, setCues] = useState<boolean[]>([true, false, true, false]);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);

  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  const effectiveBpm = useMemo(() => {
    const b = BASE_BPM * (1 + pitch / 100);
    return Math.round(b * 10) / 10;
  }, [pitch]);

  useEffect(() => {
    if (!playing) {
      lastTs.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const step = (ts: number) => {
      if (lastTs.current == null) lastTs.current = ts;
      const dt = (ts - lastTs.current) / 1000;
      lastTs.current = ts;
      const speed = 0.045 * (1 + pitch / 100);
      setPlayhead((p) => {
        let np = p + dt * speed;
        if (loopActive) {
          const loopLen = (loopBeats / 16) * 1;
          const loopStart = Math.floor(p / loopLen) * loopLen;
          if (np >= loopStart + loopLen) np = loopStart;
        }
        if (np >= 1) np -= 1;
        return np;
      });
      setJogAngle((a) => a + dt * speed * Math.PI * 8);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, pitch, loopActive, loopBeats]);

  const handleCue = useCallback(() => {
    setPlayhead(0.18);
    setJogAngle(0);
  }, []);

  const toggleCuePad = useCallback((i: number) => {
    setCues((c) => c.map((v, idx) => (idx === i ? !v : v)));
    setPlayhead(0.05 + i * 0.22);
  }, []);

  const halveLoop = useCallback(() => setLoopBeats((b) => Math.max(1, b / 2)), []);
  const doubleLoop = useCallback(() => setLoopBeats((b) => Math.min(32, b * 2)), []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header */}
      <div className="h-8 shrink-0 flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className={"text-amber-400 text-[11px] transition-all duration-200 " + (playing ? "animate-pulse" : "")}>●</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        <span className="ml-auto font-mono font-bold tracking-tight text-[11px] text-stone-400">CH 1</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM readouts */}
        <div className="flex gap-2 min-w-0">
          <div className="flex-1 basis-0 min-w-0 h-9">
            <Readout>
              <div className="flex flex-col items-start justify-center leading-none min-w-0 w-full">
                <span className="font-semibold text-[11px] text-stone-100 truncate w-full">Midnight Circuit</span>
                <span className="font-normal tracking-wide text-[10px] text-stone-500 truncate w-full">VLKN — Neon Depths EP</span>
              </div>
            </Readout>
          </div>
          <div className="w-[92px] h-9">
            <Readout>
              <div className="flex flex-col items-center justify-center leading-none">
                <span className={"font-mono font-bold tracking-tight text-sm " + (synced ? "text-lime-300" : "text-amber-400")}>{effectiveBpm.toFixed(1)}</span>
                <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">BPM</span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="h-14 shrink-0 rounded-xl border border-stone-800/70 bg-stone-950/80 p-1">
          <Waveform data={WAVE} playhead={playhead} beatGrid={BEATGRID} zoom={0.5} onScrub={(pos) => setPlayhead(pos)} />
        </div>

        {/* Center: Jog wheel + pitch fader */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex flex-col items-center justify-center gap-1">
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <div className="h-full aspect-square max-w-full">
                <JogWheel value={jogAngle} onScrub={(d) => setPlayhead((p) => Math.min(1, Math.max(0, p + d * 0.06)))} />
              </div>
            </div>
            {/* Transport row */}
            <div className="w-full flex items-stretch gap-2">
              <div className="flex-1 basis-0 h-9">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="font-semibold uppercase tracking-wider text-[11px]">{playing ? "❚❚" : "▶"}</span>
                </ToggleButton>
              </div>
              <div className="flex-1 basis-0 h-9">
                <Button onPress={handleCue}>
                  <span className="font-semibold uppercase tracking-wider text-[11px]">CUE</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="w-16 min-h-0 flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-400">Pitch</span>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span className={"font-mono font-bold tracking-tight text-[11px] " + (pitch === 0 ? "text-stone-100" : pitch > 0 ? "text-amber-400" : "text-violet-300")}>
              {(pitch > 0 ? "+" : "") + pitch.toFixed(1) + "%"}
            </span>
          </div>
        </div>

        {/* Sync + Keylock */}
        <div className="flex items-stretch gap-2">
          <div className="flex-1 basis-0 h-9">
            <ToggleButton on={synced} onChange={setSynced}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Sync</span>
            </ToggleButton>
          </div>
          <div className="flex-1 basis-0 h-9">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider text-[11px]">Key</span>
            </ToggleButton>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="grid grid-cols-4 gap-2">
          {cues.map((active, i) => (
            <div key={"cue-" + i} className="h-10">
              <Pad active={active} onPress={() => toggleCuePad(i)}>
                <span className="font-semibold uppercase tracking-wider text-[11px]">{i + 1}</span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="flex items-stretch gap-2">
          <div className="w-11 h-9">
            <Button onPress={halveLoop}>
              <span className="font-semibold tracking-wider text-[12px]">÷2</span>
            </Button>
          </div>
          <div className="flex-1 basis-0 min-w-0 h-9">
            <Readout>
              <div className="flex items-center justify-center gap-1 leading-none">
                <span className="font-mono font-bold tracking-tight text-sm text-amber-400">{loopBeats}</span>
                <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">beat loop</span>
              </div>
            </Readout>
          </div>
          <div className="w-11 h-9">
            <Button onPress={doubleLoop}>
              <span className="font-semibold tracking-wider text-[12px]">×2</span>
            </Button>
          </div>
          <div className="w-16 h-9">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="font-semibold uppercase tracking-wider text-[10px]">Loop</span>
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}