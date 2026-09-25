export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + gap 0.5 + laneStack(2 × WaveformLane 3 = 6 + gap 0.5 = 6.5) + gap 0.5 + minimap 1.5 + footer 1.75 + padding 1.0 = 14.0 ≤ 17.3
  // BUDGET width: pad 0.75 + zoomCol(2.5 Knob) + gap 0.75 + lanes flex-1 (≈ 148.6) + gap 0.75 + pad 0.75 = ≈ 154.1 ≤ 156.1

  // ---- Sample waveform data generators ----
  const makeSamples = useCallback((seed: number, len: number) => {
    const out: number[] = [];
    let s = seed;
    for (let i = 0; i < len; i++) {
      s = (s * 9301 + 49297) % 233280;
      const rnd = s / 233280;
      const env =
        0.35 +
        0.35 * Math.abs(Math.sin(i * 0.018 + seed)) +
        0.2 * Math.abs(Math.sin(i * 0.11 + seed * 0.5));
      const transient = rnd > 0.94 ? 0.4 : 0;
      out.push(Math.min(1, env * (0.6 + rnd * 0.6) + transient));
    }
    return out;
  }, []);

  const deckASamples = useMemo(() => makeSamples(7, 512), [makeSamples]);
  const deckBSamples = useMemo(() => makeSamples(23, 512), [makeSamples]);
  const overviewA = useMemo(() => makeSamples(7, 220), [makeSamples]);

  // ---- Track meta ----
  const durationA = 214; // seconds
  const durationB = 268;
  const bpmA = 126;
  const bpmB = 128;

  // ---- Playback state (simulated deck feeds) ----
  const [playheadA, setPlayheadA] = useState(48);
  const [playheadB, setPlayheadB] = useState(112);
  const [playingA, setPlayingA] = useState(true);
  const [playingB, setPlayingB] = useState(true);
  const [zoom, setZoom] = useState(8); // seconds visible
  const [scrubA, setScrubA] = useState(1);
  const [scrubB, setScrubB] = useState(1);
  const scrubTimer = useRef<number | null>(null);

  // Advance playheads for lane A and the shared minimap
  useEffect(() => {
    const id = window.setInterval(() => {
      setPlayheadA((p) => {
        if (!playingA) return p;
        const np = p + 0.05 * scrubA;
        return np >= durationA ? 0 : np;
      });
      setPlayheadB((p) => {
        if (!playingB) return p;
        const np = p + 0.05 * scrubB;
        return np >= durationB ? 0 : np;
      });
    }, 50);
    return () => window.clearInterval(id);
  }, [playingA, playingB, scrubA, scrubB]);

  // ---- Beat grids ----
  const beatGridA = useMemo(() => {
    const spb = 60 / bpmA;
    const arr: number[] = [];
    for (let t = 0; t < durationA; t += spb) arr.push(t);
    return arr;
  }, []);
  const beatGridB = useMemo(() => {
    const spb = 60 / bpmB;
    const arr: number[] = [];
    for (let t = 0; t < durationB; t += spb) arr.push(t);
    return arr;
  }, []);

  // ---- Cue / loop markers ----
  const markersA = useMemo(
    () => [
      { id: "a-cue1", time: 12, kind: "cue" as const },
      { id: "a-loopin", time: 40, kind: "loopIn" as const },
      { id: "a-loopout", time: 56, kind: "loopOut" as const },
      { id: "a-loop", time: 48, kind: "loop" as const },
      { id: "a-cue2", time: 96, kind: "cue" as const },
    ],
    []
  );
  const markersB = useMemo(
    () => [
      { id: "b-cue1", time: 24, kind: "cue" as const, color: "#2dd4bf" },
      { id: "b-loopin", time: 88, kind: "loopIn" as const, color: "#2dd4bf" },
      { id: "b-loopout", time: 104, kind: "loopOut" as const, color: "#2dd4bf" },
      { id: "b-cue2", time: 160, kind: "cue" as const, color: "#2dd4bf" },
    ],
    []
  );
  const miniMarkersA = useMemo(
    () => markersA.map((m) => ({ id: m.id, time: m.time })),
    [markersA]
  );

  const handleScrub = useCallback(
    (deck: "A" | "B", velocity: number) => {
      if (deck === "A") setScrubA(velocity);
      else setScrubB(velocity);
      if (scrubTimer.current) window.clearTimeout(scrubTimer.current);
      scrubTimer.current = window.setTimeout(() => {
        setScrubA(1);
        setScrubB(1);
      }, 220);
    },
    []
  );

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : "" + s);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] text-amber-50">
      {/* ---- Header / title bar ---- */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">◈</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Waveform Display
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-wide">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
            <span className="text-neutral-400">DECK A</span>
            <span className="font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {bpmA.toFixed(1)}
            </span>
            <span className="text-neutral-500">BPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500/90 shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
            <span className="text-neutral-400">DECK B</span>
            <span className="font-bold tracking-tight text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
              {bpmB.toFixed(1)}
            </span>
            <span className="text-neutral-500">BPM</span>
          </div>
        </div>
      </div>

      {/* ---- Body ---- */}
      <div className="flex-1 flex flex-row items-stretch gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Zoom control column */}
        <div className="flex-none flex flex-col items-center justify-center gap-1.5 px-1">
          <div className="w-10 h-10">
            <Knob
              value={zoom}
              min={2}
              max={30}
              mode="continuous"
              onChange={(v) => setZoom(v)}
            />
          </div>
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
            Zoom
          </span>
          <span className="font-mono text-[10px] tracking-wide text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
            {zoom.toFixed(1)}s
          </span>
        </div>

        {/* Lanes + minimap */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Deck A lane */}
          <div className="flex-1 flex flex-row items-stretch gap-2">
            <div className="flex-none w-16 flex flex-col justify-center rounded-md border border-amber-500/20 bg-gradient-to-b from-black to-neutral-900/80 px-2 shadow-inner shadow-black/70">
              <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                Deck A
              </span>
              <span className="font-mono text-[10px] tracking-tight text-neutral-400">
                {fmt(playheadA)}
              </span>
            </div>
            <div className="flex-1 flex items-stretch rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-1 shadow-inner shadow-black/70 overflow-clip">
              <WaveformLane
                samples={deckASamples}
                duration={durationA}
                playhead={playheadA}
                zoom={zoom}
                beatGrid={beatGridA}
                markers={markersA}
                playing={playingA}
                onSeek={(t) => setPlayheadA(t)}
                onScrub={(v) => handleScrub("A", v)}
              />
            </div>
          </div>

          {/* Deck B lane */}
          <div className="flex-1 flex flex-row items-stretch gap-2">
            <div className="flex-none w-16 flex flex-col justify-center rounded-md border border-teal-400/20 bg-gradient-to-b from-black to-neutral-900/80 px-2 shadow-inner shadow-black/70">
              <span className="font-mono text-[10px] font-semibold tracking-wider uppercase text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
                Deck B
              </span>
              <span className="font-mono text-[10px] tracking-tight text-neutral-400">
                {fmt(playheadB)}
              </span>
            </div>
            <div className="flex-1 flex items-stretch rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-1 shadow-inner shadow-black/70 overflow-clip">
              <WaveformLane
                samples={deckBSamples}
                duration={durationB}
                playhead={playheadB}
                zoom={zoom}
                beatGrid={beatGridB}
                markers={markersB}
                playing={playingB}
                onSeek={(t) => setPlayheadB(t)}
                onScrub={(v) => handleScrub("B", v)}
              />
            </div>
          </div>

          {/* Track overview minimap */}
          <div className="flex-none flex flex-row items-center gap-2">
            <span className="flex-none w-16 text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400 text-right pr-1">
              Overview
            </span>
            <div className="flex-1 h-6 flex items-stretch rounded-lg border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 px-1 shadow-inner shadow-black/70 overflow-clip">
              <OverviewMinimap
                samples={overviewA}
                duration={durationA}
                position={playheadA}
                markers={miniMarkersA}
                onSeek={(t) => setPlayheadA(t)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Footer / status strip ---- */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-neutral-950/90 border-t border-amber-500/15 font-mono text-[10px] tracking-wide">
        <div className="flex items-center gap-4">
          <span className={playingA ? "text-teal-300" : "text-neutral-500"}>
            {playingA ? "▶ A PLAYING" : "❚❚ A PAUSED"}
          </span>
          <span className={playingB ? "text-teal-300" : "text-neutral-500"}>
            {playingB ? "▶ B PLAYING" : "❚❚ B PAUSED"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <span>
            A <span className="text-amber-300">{fmt(playheadA)}</span> / {fmt(durationA)}
          </span>
          <span>
            B <span className="text-teal-300">{fmt(playheadB)}</span> / {fmt(durationB)}
          </span>
          <span className="hidden sm:inline">GRID SYNC {Math.abs(bpmA - bpmB).toFixed(1)} Δ</span>
        </div>
      </div>
    </div>
  );
}