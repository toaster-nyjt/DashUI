export default function GeneratedComponent() {
  const trackLength = 200;
  const bpm = 126.0;

  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < trackLength; i++) {
      const phase = i / trackLength;
      const kick = Math.pow(Math.abs(Math.sin(i * 0.55)), 6) * 0.9;
      const body = (Math.sin(i * 0.21) * 0.5 + 0.5) * 0.55;
      const hats = (Math.sin(i * 1.7) * 0.5 + 0.5) * 0.28;
      const drop = phase > 0.32 && phase < 0.34 ? 0.1 : 1;
      const build = 0.35 + phase * 0.6;
      arr.push(Math.min(1, (kick + body + hats) * drop * build * 0.85 + 0.06));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const grid: number[] = [];
    for (let i = 0; i < 32; i++) grid.push(i / 32);
    return grid;
  }, []);

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [pitch, setPitch] = useState(0);
  const [jogAngle, setJogAngle] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [zoom, setZoom] = useState(1);

  const [cues, setCues] = useState<(number | null)[]>([0.06, 0.32, null, null]);
  const [activeCue, setActiveCue] = useState<number | null>(0);

  const loopSizes = ["1/4", "1/2", "1", "2", "4", "8"];
  const [loopIdx, setLoopIdx] = useState(2);
  const [looping, setLooping] = useState(false);

  const cueColors = ["amber", "teal", "rose", "emerald"];

  const rate = 1 + pitch / 100;
  const displayBpm = (bpm * rate).toFixed(1);

  // Playback + jog spin
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPlayhead((p) => {
        let next = p + (dt / 180) * rate;
        if (looping) {
          const beats = parseFloat(loopSizes[loopIdx].includes("/") ? "0.5" : loopSizes[loopIdx]);
          const loopSpan = (beats * (60 / (bpm * rate))) / 180;
          const anchor = activeCue !== null && cues[activeCue] !== null ? cues[activeCue]! : 0.18;
          if (next >= anchor + loopSpan) next = anchor;
        }
        if (next >= 1) next = 0;
        return next;
      });
      setJogAngle((a) => a + dt * rate * 3.6);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, rate, looping, loopIdx, activeCue, cues]);

  const handleScrub = useCallback((delta: number) => {
    setPlayhead((p) => Math.max(0, Math.min(1, p + delta / (12 * Math.PI))));
    setJogAngle((a) => a + delta);
  }, []);

  const handleWaveScrub = useCallback((pos: number) => {
    setPlayhead(Math.max(0, Math.min(1, pos)));
  }, []);

  const setCueSlot = (i: number) => {
    setCues((prev) => {
      if (prev[i] === null) {
        const copy = [...prev];
        copy[i] = playhead;
        return copy;
      }
      return prev;
    });
    if (cues[i] !== null) {
      setPlayhead(cues[i]!);
      setActiveCue(i);
    } else {
      setActiveCue(i);
    }
  };

  const doCue = () => {
    const anchor = activeCue !== null && cues[activeCue] !== null ? cues[activeCue]! : 0;
    setPlayhead(anchor);
    setPlaying(false);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm text-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-teal-300/90">Deck B</span>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-600 px-1.5 py-0.5 rounded border border-teal-400/20 bg-teal-500/10">CH2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (playing ? "bg-teal-400 shadow-[0_0_8px_1px] shadow-teal-500/70 animate-pulse" : "bg-neutral-700")
            }
          />
          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">{playing ? "LIVE" : "CUED"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col gap-2">
        {/* Track info + BPM */}
        <div className="flex items-stretch gap-2 shrink-0">
          <div className="flex-1 min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2.5 py-1.5 flex flex-col justify-center overflow-hidden">
            <Readout>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold leading-tight text-teal-200 truncate">Neon Mirage</div>
                <div className="text-[10px] font-normal tracking-normal leading-tight text-neutral-500 truncate">Astra Void — Nightfall EP</div>
              </div>
            </Readout>
          </div>
          <div className="rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 px-2.5 py-1 flex flex-col items-end justify-center min-w-0">
            <Readout>
              <div className="flex items-baseline gap-1 leading-none">
                <span className="font-mono text-xl font-bold tabular-nums tracking-tight text-teal-300">{displayBpm}</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">BPM</span>
              </div>
            </Readout>
            <span className={"text-[9px] font-mono tabular-nums leading-none mt-0.5 " + (pitch === 0 ? "text-neutral-600" : pitch > 0 ? "text-teal-400" : "text-rose-400")}>
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 h-14 rounded-lg overflow-hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-800">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={zoom} onScrub={handleWaveScrub} />
        </div>

        {/* Main control zone: jog + right rail */}
        <div className="flex-1 min-h-0 flex gap-2.5">
          {/* Jog wheel column */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex flex-col items-center gap-1.5">
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <div className="relative h-full aspect-square max-h-full">
                <div
                  className={
                    "absolute inset-0 rounded-full transition-all duration-200 " +
                    (playing ? "shadow-[0_0_16px_-2px] shadow-teal-500/60" : "")
                  }
                />
                <JogWheel value={jogAngle} onScrub={handleScrub} />
              </div>
            </div>
            {/* Transport */}
            <div className="w-full grid grid-cols-2 gap-1.5 shrink-0">
              <div className="h-8">
                <Button onPress={doCue}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest">Cue</span>
                </Button>
              </div>
              <div className="h-8">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="text-[10px] font-semibold uppercase tracking-widest">{playing ? "Pause" : "Play"}</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Right rail: pitch fader + sync/keylock */}
          <div className="flex gap-2 shrink-0">
            {/* Pitch fader */}
            <div className="flex flex-col items-center gap-1 min-h-0">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 shrink-0">Pitch</span>
              <div className="flex-1 min-h-0 w-7">
                <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
              </div>
              <span className="text-[8px] font-mono tabular-nums text-neutral-600 shrink-0">{(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}</span>
            </div>

            {/* Sync + Keylock stack */}
            <div className="flex flex-col gap-1.5 justify-center">
              <div className="h-9 w-14">
                <ToggleButton on={sync} onChange={setSync}>
                  <span className="text-[9px] font-semibold uppercase tracking-widest leading-none">Sync</span>
                </ToggleButton>
              </div>
              <div className="h-9 w-14">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="flex flex-col items-center leading-none gap-0.5">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[13px]">
                      <rect x="5" y="11" width="14" height="9" rx="2" />
                      <path d="M8 11V8a4 4 0 018 0" />
                    </svg>
                    <span className="text-[8px] font-semibold uppercase tracking-wider">Key</span>
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5">
          {cues.map((c, i) => {
            const color = cueColors[i];
            const filled = c !== null;
            return (
              <div key={"cue-" + i} className="h-9 relative">
                <Pad onPress={() => setCueSlot(i)} active={filled}>
                  <span className="flex flex-col items-center leading-none gap-0.5">
                    <span
                      className={
                        "text-[8px] font-mono uppercase tracking-widest " +
                        (filled
                          ? color === "amber"
                            ? "text-amber-300"
                            : color === "teal"
                            ? "text-teal-300"
                            : color === "rose"
                            ? "text-rose-300"
                            : "text-emerald-300"
                          : "text-neutral-500")
                      }
                    >
                      {filled ? "CUE" : "SET"}
                    </span>
                    <span className="text-[11px] font-bold">{i + 1}</span>
                  </span>
                </Pad>
              </div>
            );
          })}
        </div>

        {/* Loop controls */}
        <div className="shrink-0 flex items-center gap-1.5">
          <div className="h-8 flex-1 basis-0 min-w-0">
            <Button onPress={() => setLoopIdx((v) => Math.max(0, v - 1))}>
              <span className="text-[13px] font-bold leading-none">−</span>
            </Button>
          </div>
          <div className="h-8 min-w-0 px-2 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 flex items-center justify-center gap-1">
            <Readout>
              <span className="font-mono text-sm font-bold tabular-nums text-teal-300 leading-none">{loopSizes[loopIdx]}</span>
            </Readout>
            <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-600">beat</span>
          </div>
          <div className="h-8 flex-1 basis-0 min-w-0">
            <Button onPress={() => setLoopIdx((v) => Math.min(loopSizes.length - 1, v + 1))}>
              <span className="text-[13px] font-bold leading-none">+</span>
            </Button>
          </div>
          <div className="h-8 flex-[1.4] basis-0 min-w-0">
            <ToggleButton on={looping} onChange={setLooping}>
              <span className="text-[9px] font-semibold uppercase tracking-widest leading-none">Loop</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="font-mono tabular-nums">{Math.floor(playhead * 240 / 60)}:{String(Math.floor((playhead * 240) % 60)).padStart(2, "0")}</span>
        <div className="flex items-center gap-2">
          <span className={"font-mono uppercase tracking-widest " + (sync ? "text-teal-300" : "text-neutral-600")}>{sync ? "SYNC A" : "MANUAL"}</span>
          <span className="text-neutral-700">·</span>
          <button
            onClick={() => setZoom((z) => (z >= 2 ? 0.5 : z + 0.5))}
            className="font-mono tabular-nums text-neutral-500 hover:text-teal-300 transition-colors duration-150"
          >
            {zoom.toFixed(1)}×
          </button>
        </div>
      </div>
    </div>
  );
}