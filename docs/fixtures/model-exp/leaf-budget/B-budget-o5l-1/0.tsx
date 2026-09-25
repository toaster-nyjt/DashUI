export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.0 + laneA 5.6 + gap 0.5 + laneB 5.6 = 14.95 ≤ 17.3
  // BUDGET width: pad 1.0 + lanes 136 + gap 0.75 + rail 17 = 154.75 ≤ 156.1

  const duration = 312;

  const makeSamples = (seed: number, n: number) => {
    const out: number[] = [];
    let s = seed;
    for (let i = 0; i < n; i++) {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const r = s / 4294967296;
      const beat = Math.abs(Math.sin((i / n) * Math.PI * 64));
      const env = 0.35 + 0.65 * Math.abs(Math.sin((i / n) * Math.PI * 3.3));
      out.push(Math.min(1, 0.18 + env * (0.5 * beat + 0.55 * r)));
    }
    return out;
  };

  const samplesA = useMemo(() => makeSamples(7, 640), []);
  const samplesB = useMemo(() => makeSamples(4211, 640), []);

  const beatGridA = useMemo(() => {
    const g: number[] = [];
    for (let t = 0.2; t < duration; t += 60 / 128) g.push(t);
    return g;
  }, []);
  const beatGridB = useMemo(() => {
    const g: number[] = [];
    for (let t = 0.6; t < duration; t += 60 / 126) g.push(t);
    return g;
  }, []);

  const markersA = useMemo(
    () => [
      { id: "a1", time: 16, kind: "cue" as const },
      { id: "a2", time: 64, kind: "loopIn" as const },
      { id: "a3", time: 80, kind: "loopOut" as const },
      { id: "a4", time: 148, kind: "cue" as const },
    ],
    []
  );
  const markersB = useMemo(
    () => [
      { id: "b1", time: 32, kind: "cue" as const },
      { id: "b2", time: 112, kind: "loopIn" as const },
      { id: "b3", time: 128, kind: "loopOut" as const },
    ],
    []
  );

  const [posA, setPosA] = useState(42.5);
  const [posB, setPosB] = useState(97.2);
  const [playingA] = useState(true);
  const [playingB] = useState(true);
  const [zoom, setZoom] = useState(8);

  useEffect(() => {
    const id = setInterval(() => {
      setPosA((p) => (playingA ? (p + 0.1) % duration : p));
      setPosB((p) => (playingB ? (p + 0.1) % duration : p));
    }, 100);
    return () => clearInterval(id);
  }, [playingA, playingB]);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* header */}
      <div className="h-9 flex-none flex items-center gap-3 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.45)] animate-pulse" />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Waveform Display</span>
        <div className="h-4 w-px bg-amber-500/20" />
        <span className="font-mono text-[10px] tracking-widest uppercase text-amber-400">A 128.0</span>
        <span className="font-mono text-[10px] tracking-widest uppercase text-teal-300">B 126.0</span>
        <div className="flex-1 min-w-0" />
        <span className="font-mono text-[10px] tracking-wide text-neutral-500 truncate">
          GRID LOCK · {zoom.toFixed(0)}s VIEW
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-row gap-3 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* lanes */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Deck A */}
          <div className="flex-1 flex flex-row items-stretch gap-2">
            <div className="w-16 flex flex-col justify-center gap-1 px-1 border-l-2 border-amber-400/70">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-amber-400">Deck A</span>
              <span className="font-mono font-bold tracking-tight text-[13px] text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {fmt(posA)}
              </span>
            </div>
            <div className="flex-1 rounded-xl border border-amber-500/10 bg-black/70 shadow-inner shadow-black/70 overflow-clip p-1">
              <WaveformLane
                samples={samplesA}
                duration={duration}
                playhead={posA}
                zoom={zoom}
                beatGrid={beatGridA}
                markers={markersA}
                playing={playingA}
                onSeek={(t) => setPosA(t)}
                onScrub={() => {}}
              />
            </div>
          </div>

          {/* Deck B */}
          <div className="flex-1 flex flex-row items-stretch gap-2">
            <div className="w-16 flex flex-col justify-center gap-1 px-1 border-l-2 border-teal-400/70">
              <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-teal-300">Deck B</span>
              <span className="font-mono font-bold tracking-tight text-[13px] text-teal-200 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
                {fmt(posB)}
              </span>
            </div>
            <div className="flex-1 rounded-xl border border-amber-500/10 bg-black/70 shadow-inner shadow-black/70 overflow-clip p-1">
              <WaveformLane
                samples={samplesB}
                duration={duration}
                playhead={posB}
                zoom={zoom}
                beatGrid={beatGridB}
                markers={markersB}
                playing={playingB}
                onSeek={(t) => setPosB(t)}
                onScrub={() => {}}
              />
            </div>
          </div>
        </div>

        {/* right rail */}
        <div className="w-[18rem] flex flex-row gap-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
          {/* minimaps */}
          <div className="flex-1 flex flex-col justify-center gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-normal tracking-wide leading-none text-neutral-500 font-mono">OVERVIEW A</span>
              <div className="h-[1.7rem] w-full">
                <OverviewMinimap
                  samples={samplesA}
                  duration={duration}
                  position={posA}
                  markers={markersA.map((m) => ({ id: m.id, time: m.time }))}
                  onSeek={(t) => setPosA(t)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-normal tracking-wide leading-none text-neutral-500 font-mono">OVERVIEW B</span>
              <div className="h-[1.7rem] w-full">
                <OverviewMinimap
                  samples={samplesB}
                  duration={duration}
                  position={posB}
                  markers={markersB.map((m) => ({ id: m.id, time: m.time }))}
                  onSeek={(t) => setPosB(t)}
                />
              </div>
            </div>
          </div>

          {/* zoom */}
          <div className="w-[4.5rem] flex flex-col items-center justify-center gap-1">
            <div className="h-[3.4rem] w-[3.4rem]">
              <Knob
                value={zoom}
                min={2}
                max={32}
                mode="stepped"
                steps={[2, 4, 8, 16, 32]}
                onChange={(v) => setZoom(v)}
              />
            </div>
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">Zoom</span>
            <span className="font-mono font-bold tracking-tight text-[12px] text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {zoom.toFixed(0)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}