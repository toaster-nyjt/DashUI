export default function GeneratedComponent() {
  // ---- Sample loaded track (Deck B / channel 2) ----
  const baseBpm = 126.0;
  const trackTitle = "MIDNIGHT VOLTAGE";
  const trackArtist = "Neon Harbor";
  const trackKey = "8A";

  // ---- Transport state ----
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18); // normalized 0..1
  const [cueStored] = useState(0.06);

  // ---- Pitch / tempo ----
  const [pitch, setPitch] = useState(0); // percent -8..+8
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);

  // ---- Loop ----
  const loopLengths = [1, 2, 4, 8];
  const [loopIdx, setLoopIdx] = useState(1);
  const [looping, setLooping] = useState(false);

  // ---- Hot cues ----
  const [cues, setCues] = useState<boolean[]>([true, false, true, false]);

  // ---- Jog wheel ----
  const [jogAngle, setJogAngle] = useState(0);
  const scrubbingRef = useRef(false);

  // ---- Effective BPM (with pitch) ----
  const effBpm = useMemo(() => baseBpm * (1 + pitch / 100), [pitch]);

  // ---- Waveform sample data ----
  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.sin(i * 0.55) * 0.5 + 0.5;
      const env = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.028));
      const grit = (Math.sin(i * 2.3) + Math.sin(i * 5.1)) * 0.12;
      arr.push(Math.min(1, Math.max(0.05, (beat * 0.6 + 0.4) * env + grit)));
    }
    return arr;
  }, []);
  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 32; i++) g.push(i / 32);
    return g;
  }, []);

  // ---- Playback loop (transform/state only, never scroll) ----
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (!scrubbingRef.current) {
        const speed = (effBpm / 60) * 0.0026; // normalized progress/sec
        setPlayhead((p) => {
          let np = p + speed * dt * 60;
          if (looping) {
            const span = 0.02 * loopLengths[loopIdx];
            const start = cueStored;
            if (np > start + span) np = start;
          }
          if (np >= 1) np = 0;
          return np;
        });
        setJogAngle((a) => a + dt * (effBpm / 60) * Math.PI * 0.9);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, effBpm, looping, loopIdx, cueStored]);

  const handleScrub = (delta: number) => {
    scrubbingRef.current = true;
    setJogAngle((a) => a + delta);
    setPlayhead((p) => Math.min(1, Math.max(0, p + delta / (Math.PI * 8))));
    window.clearTimeout((handleScrub as any)._t);
    (handleScrub as any)._t = window.setTimeout(() => {
      scrubbingRef.current = false;
    }, 90);
  };

  const handleWaveScrub = (pos: number) => {
    scrubbingRef.current = true;
    setPlayhead(Math.min(1, Math.max(0, pos)));
    window.clearTimeout((handleWaveScrub as any)._t);
    (handleWaveScrub as any)._t = window.setTimeout(() => {
      scrubbingRef.current = false;
    }, 90);
  };

  const triggerCue = () => {
    setPlayhead(cueStored);
  };

  const toggleHotCue = (i: number) => {
    setCues((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const bpmText = (synced ? baseBpm : effBpm).toFixed(1);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* Header chrome */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "w-2 h-2 rounded-full " +
              (playing ? "bg-violet-400 animate-pulse shadow-lg shadow-violet-500/40" : "bg-stone-600")
            }
          />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <span className="font-medium uppercase tracking-widest text-[10px] text-violet-300/80">
          CH 2
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + BPM readouts */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 min-w-0 h-[3rem]">
            <Readout>
              <span className="flex flex-col leading-tight items-start">
                <span className="font-semibold tracking-wide text-violet-300">{trackTitle}</span>
                <span className="text-[0.68em] font-normal tracking-wide text-stone-400">
                  {trackArtist} · {trackKey}
                </span>
              </span>
            </Readout>
          </div>
          <div className="flex-none w-[6rem] h-[3rem]">
            <Readout>
              <span className="flex flex-col leading-none items-center">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpmText}
                </span>
                <span className="text-[0.5em] font-medium uppercase tracking-widest text-stone-500 mt-[0.15em]">
                  {synced ? "SYNC BPM" : "BPM"}
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="flex-none h-[2.6rem]">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.7}
            onScrub={handleWaveScrub}
          />
        </div>

        {/* Central row: pitch fader | jog wheel | transport + sync */}
        <div className="flex-1 min-h-0 flex items-stretch gap-2">
          {/* Pitch fader column */}
          <div className="flex-none w-[3.4rem] flex flex-col items-center justify-between rounded-xl border border-stone-800/70 bg-stone-950/80 py-2 px-1">
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">
              Pitch
            </span>
            <div className="flex-1 flex items-center justify-center py-1">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span
              className={
                "font-mono font-bold text-[11px] tracking-tight " +
                (pitch === 0 ? "text-stone-300" : pitch > 0 ? "text-amber-400" : "text-violet-300")
              }
            >
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>

          {/* Jog wheel */}
          <div className="flex-1 min-w-0 flex items-center justify-center rounded-xl border border-stone-800/70 bg-black/70 p-2">
            <div className="aspect-square h-full max-h-full">
              <JogWheel value={jogAngle} onScrub={handleScrub} />
            </div>
          </div>

          {/* Transport + toggles */}
          <div className="flex-none w-[6.4rem] flex flex-col gap-2">
            <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-2 gap-2">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="flex items-center gap-1">
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    {playing ? (
                      <>
                        <rect x="6" y="5" width="4" height="14" rx="1" />
                        <rect x="14" y="5" width="4" height="14" rx="1" />
                      </>
                    ) : (
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                  <span>{playing ? "Play" : "Cued"}</span>
                </span>
              </ToggleButton>
              <Button onPress={triggerCue}>
                <span className="flex items-center gap-1">
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="5" />
                  </svg>
                  <span>Cue</span>
                </span>
              </Button>
            </div>
            <div className="flex-none grid grid-cols-2 gap-2">
              <div className="h-[1.9rem]">
                <ToggleButton on={synced} onChange={setSynced}>
                  <span className="text-[0.85em]">Sync</span>
                </ToggleButton>
              </div>
              <div className="h-[1.9rem]">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="text-[0.78em]">Key</span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: hot cues + loop controls */}
        <div className="flex-none flex items-stretch gap-2">
          {/* Hot cue pads */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-4 gap-1.5">
              {cues.map((active, i) => (
                <div key={"cue-" + i} className="h-[2.3rem]">
                  <Pad active={active} onPress={() => toggleHotCue(i)}>
                    <span className="flex flex-col items-center leading-none">
                      <span className="text-[0.95em]">{i + 1}</span>
                      <span className="text-[0.5em] font-medium tracking-widest text-stone-400 mt-[0.15em]">
                        CUE
                      </span>
                    </span>
                  </Pad>
                </div>
              ))}
            </div>
          </div>

          {/* Loop controls */}
          <div className="flex-none w-[8.4rem] flex flex-col gap-1.5">
            <div className="flex items-stretch gap-1.5">
              <div className="flex-1">
                <Button
                  onPress={() =>
                    setLoopIdx((i) => Math.max(0, i - 1))
                  }
                >
                  <span className="text-[0.9em]">½</span>
                </Button>
              </div>
              <div className="flex-none w-[3.4rem] h-full">
                <Readout>
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-mono font-bold text-amber-400 text-[1.05em]">
                      {loopLengths[loopIdx]}
                    </span>
                    <span className="text-[0.5em] font-medium uppercase tracking-widest text-stone-500 mt-[0.1em]">
                      Beats
                    </span>
                  </span>
                </Readout>
              </div>
              <div className="flex-1">
                <Button
                  onPress={() =>
                    setLoopIdx((i) => Math.min(loopLengths.length - 1, i + 1))
                  }
                >
                  <span className="text-[0.9em]">×2</span>
                </Button>
              </div>
            </div>
            <div className="h-[1.9rem]">
              <ToggleButton on={looping} onChange={setLooping}>
                <span className="text-[0.82em]">{looping ? "Loop On" : "Loop"}</span>
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
          {looping ? "LOOP " + loopLengths[loopIdx] + "B" : "PLAY"}
        </span>
        <span className="font-mono text-[10px] tracking-widest text-lime-300">
          {(playhead * 100).toFixed(0).padStart(2, "0")}% · {keylock ? "KEYLOCK" : "VARI"}
        </span>
      </div>
    </div>
  );
}