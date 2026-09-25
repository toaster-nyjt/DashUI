export default function GeneratedComponent() {
  const makeSamples = (seed: number, n: number) => {
    const out: number[] = [];
    let s = seed;
    for (let i = 0; i < n; i++) {
      s = (s * 1103515245 + 12345) % 2147483648;
      const r = s / 2147483648;
      const env = 0.45 + 0.4 * Math.sin((i / n) * Math.PI * 3.2) * Math.sin((i / n) * Math.PI);
      const beat = i % 16 < 2 ? 0.35 : 0;
      out.push(Math.max(0.05, Math.min(1, env + beat + r * 0.35 - 0.12)));
    }
    return out;
  };

  const durA = 246;
  const durB = 212;

  const samplesA = useMemo(() => makeSamples(7331, 900), []);
  const samplesB = useMemo(() => makeSamples(20481, 900), []);

  const gridA = useMemo(() => {
    const g: number[] = [];
    for (let t = 0.3; t < durA; t += 60 / 126) g.push(t);
    return g;
  }, []);
  const gridB = useMemo(() => {
    const g: number[] = [];
    for (let t = 0.9; t < durB; t += 60 / 124) g.push(t);
    return g;
  }, []);

  const markersA = useMemo(
    () => [
      { id: "a1", time: 16.2, kind: "cue" as const },
      { id: "a2", time: 64.5, kind: "loopIn" as const },
      { id: "a3", time: 80.5, kind: "loopOut" as const },
      { id: "a4", time: 132.0, kind: "cue" as const },
    ],
    []
  );
  const markersB = useMemo(
    () => [
      { id: "b1", time: 8.4, kind: "cue" as const },
      { id: "b2", time: 48.0, kind: "cue" as const },
      { id: "b3", time: 96.0, kind: "loopIn" as const },
      { id: "b4", time: 112.0, kind: "loopOut" as const },
    ],
    []
  );

  const [posA, setPosA] = useState(42.7);
  const [posB, setPosB] = useState(18.3);
  const [playA, setPlayA] = useState(true);
  const [playB, setPlayB] = useState(true);
  const [zoom, setZoom] = useState(8);
  const [scrubA, setScrubA] = useState(1);
  const [scrubB, setScrubB] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      if (playA) setPosA((p) => (p + 0.06 * scrubA + durA) % durA);
      if (playB) setPosB((p) => (p + 0.06 * scrubB + durB) % durB);
    }, 60);
    return () => clearInterval(id);
  }, [playA, playB, scrubA, scrubB]);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black">
      <div className="flex-none h-9 flex items-center gap-3 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.8)] animate-pulse" />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Waveform Display</span>
        <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-500">dual-lane · beat sync</span>
        <div className="flex-1" />
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-wide">
          <span className="text-amber-300">A 126.0 BPM</span>
          <span className="text-neutral-600">/</span>
          <span className="text-teal-300">B 124.0 BPM</span>
          <span className="text-neutral-600">/</span>
          <span className="text-neutral-400">ZOOM {zoom.toFixed(0)}s</span>
        </div>
      </div>

      <div className="flex-1 flex items-stretch gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Zoom cluster */}
        <div className="flex-none w-[5.5rem] flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="w-[3rem] h-[3rem]">
            <Knob value={zoom} min={2} max={32} mode="stepped" steps={[2, 4, 8, 16, 32]} onChange={setZoom} />
          </div>
          <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Zoom</span>
        </div>

        {/* Lanes */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 flex items-stretch gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70">
            <div className="flex-none w-[3.5rem] flex flex-col justify-center gap-1">
              <span className="font-mono text-[11px] font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                DECK A
              </span>
              <span className="font-mono text-[10px] text-neutral-500">{fmt(posA)}</span>
            </div>
            <div className="flex-1 h-[4.5rem]">
              <WaveformLane
                samples={samplesA}
                duration={durA}
                playhead={posA}
                zoom={zoom}
                beatGrid={gridA}
                markers={markersA}
                playing={playA}
                onSeek={(t) => setPosA(t)}
                onScrub={(v) => setScrubA(v)}
              />
            </div>
          </div>

          <div className="flex-1 flex items-stretch gap-2 rounded-2xl border border-teal-400/15 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70">
            <div className="flex-none w-[3.5rem] flex flex-col justify-center gap-1">
              <span className="font-mono text-[11px] font-bold tracking-tight text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
                DECK B
              </span>
              <span className="font-mono text-[10px] text-neutral-500">{fmt(posB)}</span>
            </div>
            <div className="flex-1 h-[4.5rem]">
              <WaveformLane
                samples={samplesB}
                duration={durB}
                playhead={posB}
                zoom={zoom}
                beatGrid={gridB}
                markers={markersB}
                playing={playB}
                onSeek={(t) => setPosB(t)}
                onScrub={(v) => setScrubB(v)}
              />
            </div>
          </div>
        </div>

        {/* Overviews */}
        <div className="flex-none w-[22rem] flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="flex-1 flex items-center gap-2">
            <span className="flex-none w-[1.5rem] text-[10px] font-mono tracking-widest text-amber-400">A</span>
            <div className="flex-1 h-[2.25rem]">
              <OverviewMinimap
                samples={samplesA}
                duration={durA}
                position={posA}
                markers={markersA.map((m) => ({ id: m.id, time: m.time }))}
                onSeek={(t) => setPosA(t)}
              />
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2">
            <span className="flex-none w-[1.5rem] text-[10px] font-mono tracking-widest text-teal-300">B</span>
            <div className="flex-1 h-[2.25rem]">
              <OverviewMinimap
                samples={samplesB}
                duration={durB}
                position={posB}
                markers={markersB.map((m) => ({ id: m.id, time: m.time }))}
                onSeek={(t) => setPosB(t)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}