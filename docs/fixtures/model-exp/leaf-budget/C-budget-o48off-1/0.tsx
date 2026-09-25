export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + gap 0.5 + laneA 3 + gap 0.5 + laneB 3 + gap 0.5 + minimap-row 1.5 + footer 1.75 + padding 0.5 = 13.5 ≤ 17.3
  // BUDGET width: zoom-rail 6 + gap 0.75 + lanes(flex-1 ≥ 12) + gap 0.75 + padding 0.5 = well under 156.1 (lanes absorb the rest)

  // ---- Sample waveform generators (deterministic, per-deck character) ----
  const deckASamples = useMemo(() => {
    const n = 900;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = Math.abs(Math.sin(t * Math.PI * 64)) * 0.55;
      const swell = (Math.sin(t * Math.PI * 6) * 0.5 + 0.5) * 0.4;
      const transient = i % 32 === 0 ? 0.4 : 0;
      const noise = (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.18;
      arr.push(Math.min(1, 0.12 + beat + swell + transient + Math.abs(noise)));
    }
    return arr;
  }, []);

  const deckBSamples = useMemo(() => {
    const n = 900;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = Math.abs(Math.sin(t * Math.PI * 48 + 1.2)) * 0.5;
      const swell = (Math.cos(t * Math.PI * 4) * 0.5 + 0.5) * 0.45;
      const transient = i % 40 === 0 ? 0.35 : 0;
      const noise = (Math.sin(i * 7.233 + 3.1) * 23421.631 % 1) * 0.16;
      arr.push(Math.min(1, 0.1 + beat + swell + transient + Math.abs(noise)));
    }
    return arr;
  }, []);

  const overviewSamples = useMemo(() => {
    const n = 300;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const env = Math.sin(t * Math.PI) * 0.7 + 0.2;
      const grain = Math.abs(Math.sin(i * 5.77) * 0.3);
      arr.push(Math.min(1, env + grain * 0.4));
    }
    return arr;
  }, []);

  const durationA = 214; // seconds
  const durationB = 198;

  // ---- Beat grids (times in seconds) ----
  const beatGridA = useMemo(() => {
    const bpm = 128;
    const spb = 60 / bpm;
    const out: number[] = [];
    for (let t = 0; t < durationA; t += spb) out.push(t);
    return out;
  }, []);

  const beatGridB = useMemo(() => {
    const bpm = 124;
    const spb = 60 / bpm;
    const out: number[] = [];
    for (let t = 0; t < durationB; t += spb) out.push(t);
    return out;
  }, []);

  // ---- Markers (cue / loop) ----
  const markersA = useMemo(
    () => [
      { id: "a-cue1", time: 14, kind: "cue" as const, color: "#fbbf24" },
      { id: "a-cue2", time: 62, kind: "cue" as const, color: "#fbbf24" },
      { id: "a-loopin", time: 96, kind: "loopIn" as const, color: "#2dd4bf" },
      { id: "a-loopout", time: 112, kind: "loopOut" as const, color: "#2dd4bf" },
      { id: "a-cue3", time: 158, kind: "cue" as const, color: "#fbbf24" },
    ],
    []
  );

  const markersB = useMemo(
    () => [
      { id: "b-cue1", time: 8, kind: "cue" as const, color: "#5eead4" },
      { id: "b-loopin", time: 48, kind: "loopIn" as const, color: "#a78bfa" },
      { id: "b-loopout", time: 64, kind: "loopOut" as const, color: "#a78bfa" },
      { id: "b-cue2", time: 120, kind: "cue" as const, color: "#5eead4" },
    ],
    []
  );

  // ---- Live playback state (self-driven demo; would be fed by decks) ----
  const [posA, setPosA] = useState(30);
  const [posB, setPosB] = useState(52);
  const [playingA, setPlayingA] = useState(true);
  const [playingB, setPlayingB] = useState(true);
  const [scrubA, setScrubA] = useState(0);
  const [scrubB, setScrubB] = useState(0);
  const scrubTimerA = useRef<number | null>(null);
  const scrubTimerB = useRef<number | null>(null);

  // Zoom in seconds-visible (shared across lanes)
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPosA((p) => (playingA ? (p + 0.05) % durationA : p));
      setPosB((p) => (playingB ? (p + 0.05) % durationB : p));
    }, 50);
    return () => window.clearInterval(id);
  }, [playingA, playingB]);

  const handleSeekA = useCallback((t: number) => {
    setPosA(Math.max(0, Math.min(durationA, t)));
  }, []);
  const handleSeekB = useCallback((t: number) => {
    setPosB(Math.max(0, Math.min(durationB, t)));
  }, []);

  const handleScrubA = useCallback((v: number) => {
    setScrubA(v);
    setPlayingA(false);
    setPosA((p) => Math.max(0, Math.min(durationA, p + (v - 1) * 0.15)));
    if (scrubTimerA.current) window.clearTimeout(scrubTimerA.current);
    scrubTimerA.current = window.setTimeout(() => {
      setScrubA(0);
      setPlayingA(true);
    }, 260);
  }, []);

  const handleScrubB = useCallback((v: number) => {
    setScrubB(v);
    setPlayingB(false);
    setPosB((p) => Math.max(0, Math.min(durationB, p + (v - 1) * 0.15)));
    if (scrubTimerB.current) window.clearTimeout(scrubTimerB.current);
    scrubTimerB.current = window.setTimeout(() => {
      setScrubB(0);
      setPlayingB(true);
    }, 260);
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" + sec : String(sec));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* Ambient warm top glow overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)]" />

      {/* Header / title bar */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_0_8px_rgba(251,146,60,0.6)] animate-pulse" />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Waveform Display
          </span>
          <span className="hidden sm:inline text-[10px] font-mono tracking-wide text-neutral-500 uppercase">
            Dual-Lane Analysis
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
            <span className="text-amber-300">DECK A</span>
            <span className="text-neutral-500">128.0 BPM</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)]" />
            <span className="text-teal-300">DECK B</span>
            <span className="text-neutral-500">124.0 BPM</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-stretch gap-3 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Zoom control rail */}
        <div className="flex-none w-[6rem] flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/15 rounded-2xl shadow-2xl shadow-black/60 py-1">
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Zoom
          </span>
          <div className="w-[2.75rem] h-[2.75rem]">
            <Knob
              value={zoom}
              min={2}
              max={40}
              mode="continuous"
              onChange={(v) => setZoom(v)}
            />
          </div>
          <span className="font-mono font-bold tracking-tight text-amber-300 text-[0.7rem] drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
            {zoom.toFixed(1)}s
          </span>
        </div>

        {/* Lanes + minimap column */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Deck A lane */}
          <div className="flex-1 flex items-stretch gap-2">
            <div className="flex-none w-[3.25rem] flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/25">
              <span className="font-mono font-bold text-amber-300 text-[0.8rem] drop-shadow-[0_0_8px_rgba(251,146,60,0.45)]">
                A
              </span>
              <span className="font-mono text-[9px] tracking-wide text-neutral-400 mt-0.5">
                {fmt(posA)}
              </span>
              {scrubA !== 0 && (
                <span className="font-mono text-[8px] tracking-wide text-amber-400 uppercase animate-pulse">
                  scr
                </span>
              )}
            </div>
            <div className="flex-1 relative rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 overflow-clip">
              <WaveformLane
                samples={deckASamples}
                duration={durationA}
                playhead={posA}
                zoom={zoom}
                beatGrid={beatGridA}
                markers={markersA}
                playing={playingA}
                onSeek={handleSeekA}
                onScrub={handleScrubA}
              />
              <div className="pointer-events-none absolute top-1 right-2 font-mono text-[9px] tracking-wide text-neutral-500">
                -{fmt(durationA - posA)}
              </div>
            </div>
          </div>

          {/* Deck B lane */}
          <div className="flex-1 flex items-stretch gap-2">
            <div className="flex-none w-[3.25rem] flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-teal-500/15 to-transparent border border-teal-400/25">
              <span className="font-mono font-bold text-teal-300 text-[0.8rem] drop-shadow-[0_0_8px_rgba(45,212,191,0.45)]">
                B
              </span>
              <span className="font-mono text-[9px] tracking-wide text-neutral-400 mt-0.5">
                {fmt(posB)}
              </span>
              {scrubB !== 0 && (
                <span className="font-mono text-[8px] tracking-wide text-teal-300 uppercase animate-pulse">
                  scr
                </span>
              )}
            </div>
            <div className="flex-1 relative rounded-xl border border-teal-400/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 overflow-clip">
              <WaveformLane
                samples={deckBSamples}
                duration={durationB}
                playhead={posB}
                zoom={zoom}
                beatGrid={beatGridB}
                markers={markersB}
                playing={playingB}
                onSeek={handleSeekB}
                onScrub={handleScrubB}
              />
              <div className="pointer-events-none absolute top-1 right-2 font-mono text-[9px] tracking-wide text-neutral-500">
                -{fmt(durationB - posB)}
              </div>
            </div>
          </div>

          {/* Overview minimap row */}
          <div className="flex-none h-[1.5rem] flex items-stretch gap-2">
            <div className="flex-none w-[3.25rem] flex items-center justify-center rounded-md bg-neutral-900/70 border border-amber-500/10">
              <span className="text-[9px] font-medium tracking-widest uppercase leading-none text-neutral-500">
                OVW
              </span>
            </div>
            <div className="flex-1 rounded-md border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 overflow-clip">
              <OverviewMinimap
                samples={overviewSamples}
                duration={durationA}
                position={posA}
                markers={markersA.map((m) => ({ id: m.id, time: m.time }))}
                onSeek={handleSeekA}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer / status strip */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15 font-mono text-[10px] tracking-wide text-neutral-400">
        <div className="flex items-center gap-3">
          <span className={playingA ? "text-teal-300" : "text-neutral-500"}>
            A {playingA ? "▶ PLAY" : "❚❚ CUE"}
          </span>
          <span className="text-neutral-700">|</span>
          <span className={playingB ? "text-teal-300" : "text-neutral-500"}>
            B {playingB ? "▶ PLAY" : "❚❚ CUE"}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
            CUE
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400/80" />
            LOOP
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-sm bg-neutral-600/50" />
            GRID
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-300">DRAG TO SCRATCH</span>
          <span className="text-neutral-600">·</span>
          <span className="text-neutral-500">CLICK OVW TO SEEK</span>
        </div>
      </div>
    </div>
  );
}