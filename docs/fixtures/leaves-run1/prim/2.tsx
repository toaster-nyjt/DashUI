export default function GeneratedComponent() {
  const TRACK = {
    title: "Solar Drift",
    artist: "Nø Vela",
    baseBpm: 126.0,
    key: "8A",
    duration: "5:42",
  };

  const WAVE = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.abs(Math.sin(i * 0.42)) * 0.55;
      const swell = Math.abs(Math.sin(i * 0.031)) * 0.4;
      const grit = (Math.sin(i * 1.9) * 0.5 + 0.5) * 0.25;
      const kick = i % 16 < 2 ? 0.35 : 0;
      arr.push(Math.min(1, 0.12 + beat + swell * 0.6 + grit + kick));
    }
    return arr;
  }, []);

  const BEAT_GRID = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 32; i++) g.push(i / 32);
    return g;
  }, []);

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.28);
  const [pitch, setPitch] = useState(0); // -8 .. +8 %
  const [jogAngle, setJogAngle] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [cues, setCues] = useState<(number | null)[]>([0.05, 0.33, null, 0.66]);
  const [activeCue, setActiveCue] = useState<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const bpm = TRACK.baseBpm * (1 + pitch / 100);

  // Playback / playhead + jog spin driven purely by state, never scrolling the page.
  useEffect(() => {
    if (!playing) {
      lastRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const speed = 1 + pitch / 100;
    const tick = (t: number) => {
      if (lastRef.current == null) lastRef.current = t;
      const dt = (t - lastRef.current) / 1000;
      lastRef.current = t;
      setPlayhead((p) => {
        let np = p + dt * 0.02 * speed;
        if (loopActive) {
          const loopLen = (loopBeats / 32) * 0.5;
          const start = activeCue != null ? cues[activeCue] ?? 0 : Math.floor(p / loopLen) * loopLen;
          if (np > start + loopLen) np = start;
        }
        if (np >= 1) np = 0;
        return np;
      });
      setJogAngle((a) => (a + dt * 3.4 * speed) % (Math.PI * 2));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, pitch, loopActive, loopBeats, activeCue, cues]);

  const fmtTime = (frac: number) => {
    const total = 5 * 60 + 42;
    const cur = Math.floor(frac * total);
    const m = Math.floor(cur / 60);
    const s = cur % 60;
    return m + ":" + (s < 10 ? "0" + s : s);
  };

  const handleJog = (delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => {
      let np = p + delta * 0.01;
      if (np < 0) np = 0;
      if (np > 1) np = 1;
      return np;
    });
  };

  const hitCue = (i: number) => {
    setCues((prev) => {
      const next = [...prev];
      if (next[i] == null) {
        next[i] = playhead;
      } else {
        setPlayhead(next[i] as number);
        setActiveCue(i);
      }
      return next;
    });
  };

  const pitchLabel = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm text-neutral-100 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-teal-300/90">Deck B</span>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-600 border border-teal-400/30 rounded px-1 py-px">CH2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (playing ? "bg-teal-400 shadow-[0_0_8px_1px] shadow-teal-500/70 animate-pulse" : "bg-neutral-700")
            }
          />
          <span className="text-[10px] tracking-wide text-neutral-500">{playing ? "PLAY" : "CUE"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-2.5 flex flex-col gap-2">
        {/* Track + BPM row */}
        <div className="flex items-stretch gap-2 shrink-0">
          <div className="flex-1 min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 px-2.5 py-1.5 flex flex-col justify-center overflow-hidden">
            <Readout>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold leading-tight text-neutral-100 truncate">{TRACK.title}</div>
                <div className="text-[11px] leading-tight text-neutral-500 truncate">{TRACK.artist}</div>
              </div>
            </Readout>
          </div>
          <div className="w-[112px] rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-teal-400/20 px-2 py-1 flex flex-col items-end justify-center overflow-hidden">
            <Readout>
              <div className="flex flex-col items-end leading-none">
                <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-teal-300">{bpm.toFixed(1)}</span>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 mt-0.5">BPM · {TRACK.key}</span>
              </div>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 p-1.5 overflow-hidden">
          <div className="h-14 w-full">
            <Waveform data={WAVE} playhead={playhead} beatGrid={BEAT_GRID} zoom={0.5} onScrub={(p) => setPlayhead(p)} />
          </div>
        </div>

        {/* Main control zone: jog + right column */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 rounded-xl bg-neutral-950/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)] border border-neutral-700/40 p-2 flex flex-col items-center justify-center overflow-hidden">
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
              <div className="aspect-square h-full max-h-full max-w-full">
                <JogWheel value={jogAngle} onScrub={handleJog} />
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between w-full px-1">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">Jog</span>
              <span className="font-mono text-[10px] tabular-nums text-teal-300/80">{fmtTime(playhead)}</span>
            </div>
          </div>

          {/* Right column: transport + pitch */}
          <div className="w-[140px] shrink-0 flex flex-col gap-2 min-h-0">
            {/* Transport buttons */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div className="h-11">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">
                    {playing ? (
                      <svg width="1em" height="1em" viewBox="0 0 12 12" fill="currentColor">
                        <rect x="2" y="1.5" width="3" height="9" rx="0.5" />
                        <rect x="7" y="1.5" width="3" height="9" rx="0.5" />
                      </svg>
                    ) : (
                      <svg width="1em" height="1em" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M2.5 1.5 L10 6 L2.5 10.5 Z" />
                      </svg>
                    )}
                    {playing ? "Pause" : "Play"}
                  </span>
                </ToggleButton>
              </div>
              <div className="h-11">
                <Button onPress={() => { setPlayhead(0); setActiveCue(null); }}>
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide">
                    <svg width="1em" height="1em" viewBox="0 0 12 12" fill="currentColor">
                      <circle cx="6" cy="6" r="3.2" />
                    </svg>
                    Cue
                  </span>
                </Button>
              </div>
            </div>

            {/* Sync + Keylock */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
              <div className="h-9">
                <ToggleButton on={sync} onChange={setSync}>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sync</span>
                </ToggleButton>
              </div>
              <div className="h-9">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <svg width="1em" height="1em" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                      <rect x="2.5" y="5" width="7" height="5" rx="1" />
                      <path d="M4 5 V3.5 a2 2 0 0 1 4 0 V5" />
                    </svg>
                    Key
                  </span>
                </ToggleButton>
              </div>
            </div>

            {/* Pitch fader */}
            <div className="flex-1 min-h-0 rounded-lg bg-neutral-950/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)] border border-neutral-700/40 px-2 py-2 flex items-stretch gap-2 overflow-hidden">
              <div className="flex flex-col items-center justify-between shrink-0">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">Pitch</span>
                <span className="font-mono text-[11px] font-bold tabular-nums text-teal-300 leading-none">{pitchLabel}</span>
              </div>
              <div className="flex-1 min-w-0 flex items-stretch justify-center">
                <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
              </div>
            </div>
          </div>
        </div>

        {/* Hot cues + loop controls */}
        <div className="shrink-0 flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-1.5">
            {cues.map((c, i) => (
              <div key={"cue-" + i} className="h-9">
                <Pad onPress={() => hitCue(i)} active={c != null && activeCue === i}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[11px] font-bold">{i + 1}</span>
                    <span className="text-[7px] font-semibold uppercase tracking-widest opacity-70">
                      {c != null ? "CUE" : "SET"}
                    </span>
                  </span>
                </Pad>
              </div>
            ))}
          </div>

          <div className="flex items-stretch gap-1.5">
            <div className="h-9 flex-1 basis-0">
              <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
                <span className="text-[12px] font-bold">÷2</span>
              </Button>
            </div>
            <div className="h-9 flex-[1.4] basis-0 rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-teal-400/20 flex items-center justify-center px-2 overflow-hidden">
              <Readout>
                <span className="flex items-baseline gap-1 leading-none">
                  <span className="font-mono text-base font-bold tabular-nums text-teal-300">
                    {loopBeats >= 1 ? loopBeats : "1/" + Math.round(1 / loopBeats)}
                  </span>
                  <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500">beat</span>
                </span>
              </Readout>
            </div>
            <div className="h-9 flex-1 basis-0">
              <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
                <span className="text-[12px] font-bold">×2</span>
              </Button>
            </div>
            <div className="h-9 flex-[1.4] basis-0">
              <ToggleButton on={loopActive} onChange={setLoopActive}>
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                  <svg width="1em" height="1em" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                    <path d="M3 4.5 a3 3 0 1 1 0 3" />
                    <path d="M3 3 V6 H6" />
                  </svg>
                  Loop
                </span>
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="tabular-nums">{fmtTime(playhead)} / {TRACK.duration}</span>
        <div className="flex items-center gap-2">
          <span className={sync ? "text-teal-300" : "text-neutral-600"}>{sync ? "SYNCED" : "MANUAL"}</span>
          <span className="text-neutral-700">·</span>
          <span className={keylock ? "text-emerald-400" : "text-neutral-600"}>KEY {keylock ? "LOCK" : "OFF"}</span>
        </div>
      </div>
    </div>
  );
}