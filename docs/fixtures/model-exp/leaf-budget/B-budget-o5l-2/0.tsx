export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.0 + laneA 4.6 + gap 0.4 + laneB 4.6 + footer 1.75 = 14.6 ≤ 17.3
  // BUDGET width: pad 1.0 + zoomrail 5.0 + gap 0.75 + lanes 138.0 + gap 0.75 + minimaps 10.0 = 155.5 ≤ 156.1

  const mkSamples = (seed: number, n: number) => {
    const out: number[] = [];
    let s = seed;
    for (let i = 0; i < n; i++) {
      s = (s * 1664525 + 1013904223) % 4294967296;
      const r = s / 4294967296;
      const beat = Math.pow(Math.abs(Math.sin((i / n) * Math.PI * 64)), 3);
      const env = 0.45 + 0.4 * Math.sin((i / n) * Math.PI * 3);
      out.push(Math.min(1, Math.max(0.04, (0.28 + 0.72 * beat) * env * (0.6 + 0.6 * r))));
    }
    return out;
  };

  const durA = 312;
  const durB = 287;
  const samplesA = useMemo(() => mkSamples(7, 1400), []);
  const samplesB = useMemo(() => mkSamples(91, 1400), []);
  const gridA = useMemo(() => {
    const g: number[] = [];
    for (let t = 0.4; t < durA; t += 60 / 128) g.push(t);
    return g;
  }, []);
  const gridB = useMemo(() => {
    const g: number[] = [];
    for (let t = 0.9; t < durB; t += 60 / 126) g.push(t);
    return g;
  }, []);

  const markersA = [
    { id: "a1", time: 32.5, kind: "cue" as const },
    { id: "a2", time: 96.2, kind: "loopIn" as const },
    { id: "a3", time: 112.4, kind: "loopOut" as const },
    { id: "a4", time: 188.0, kind: "cue" as const },
  ];
  const markersB = [
    { id: "b1", time: 18.8, kind: "cue" as const },
    { id: "b2", time: 140.6, kind: "loopIn" as const },
    { id: "b3", time: 156.9, kind: "loopOut" as const },
  ];

  const [posA, setPosA] = useState(74.2);
  const [posB, setPosB] = useState(132.7);
  const [playA] = useState(true);
  const [playB] = useState(true);
  const [rateA, setRateA] = useState(1);
  const [rateB, setRateB] = useState(1);
  const [zoom, setZoom] = useState(8);

  useEffect(() => {
    const id = setInterval(() => {
      setPosA((p) => (playA ? (p + 0.1 * rateA + durA) % durA : p));
      setPosB((p) => (playB ? (p + 0.1 * rateB + durB) % durB : p));
    }, 100);
    return () => clearInterval(id);
  }, [playA, playB, rateA, rateB]);

  useEffect(() => {
    if (rateA === 1) return;
    const t = setTimeout(() => setRateA(1), 600);
    return () => clearTimeout(t);
  }, [rateA]);
  useEffect(() => {
    if (rateB === 1) return;
    const t = setTimeout(() => setRateB(1), 600);
    return () => clearTimeout(t);
  }, [rateB]);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black">
      <div className="h-9 flex-none px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 animate-pulse">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Waveform Display
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 truncate">
            dual-lane beat analysis
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-wide">
          <span className="text-amber-300">A · 128.0 BPM · {fmt(posA)}</span>
          <span className="text-teal-300">B · 126.0 BPM · {fmt(posB)}</span>
          <span className="text-neutral-500">SYNC Δ +2.0</span>
        </div>
      </div>

      <div className="flex-1 flex items-stretch gap-3 p-2 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Zoom rail */}
        <div className="w-[5.5rem] flex flex-col items-center justify-center gap-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 py-2">
          <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400">Zoom</span>
          <div className="w-[3rem] h-[3rem]">
            <Knob value={zoom} min={2} max={32} onChange={setZoom} mode="continuous" />
          </div>
          <span className="font-mono font-bold tracking-tight text-amber-300 text-[11px] drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
            {zoom.toFixed(1)}s
          </span>
        </div>

        {/* Lanes */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 flex items-stretch gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-1.5 transition-all duration-500">
            <div className="w-[3.2rem] flex flex-col justify-center gap-0.5 pl-1">
              <span className="font-mono text-[11px] font-bold tracking-widest text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                DECK A
              </span>
              <span className="font-mono text-[10px] tracking-wide text-neutral-500">{fmt(durA - posA)}</span>
            </div>
            <div className="flex-1 h-full">
              <WaveformLane
                samples={samplesA}
                duration={durA}
                playhead={posA}
                zoom={zoom}
                beatGrid={gridA}
                markers={markersA}
                playing={playA}
                onSeek={(t) => setPosA(t)}
                onScrub={(v) => setRateA(v)}
              />
            </div>
          </div>

          <div className="flex-1 flex items-stretch gap-2 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-1.5 transition-all duration-500">
            <div className="w-[3.2rem] flex flex-col justify-center gap-0.5 pl-1">
              <span className="font-mono text-[11px] font-bold tracking-widest text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
                DECK B
              </span>
              <span className="font-mono text-[10px] tracking-wide text-neutral-500">{fmt(durB - posB)}</span>
            </div>
            <div className="flex-1 h-full">
              <WaveformLane
                samples={samplesB}
                duration={durB}
                playhead={posB}
                zoom={zoom}
                beatGrid={gridB}
                markers={markersB}
                playing={playB}
                onSeek={(t) => setPosB(t)}
                onScrub={(v) => setRateB(v)}
              />
            </div>
          </div>
        </div>

        {/* Overviews */}
        <div className="w-[16rem] flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400">OVW · A</span>
            <div className="flex-1">
              <OverviewMinimap
                samples={samplesA}
                duration={durA}
                position={posA}
                markers={markersA.map((m) => ({ id: m.id, time: m.time }))}
                onSeek={(t) => setPosA(t)}
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-400">OVW · B</span>
            <div className="flex-1">
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

      <div className="h-7 flex-none px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          GRID LOCKED · CUES A:{markersA.length} B:{markersB.length}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-teal-300">
          SCRUB A {rateA.toFixed(2)}× · B {rateB.toFixed(2)}×
        </span>
      </div>
    </div>
  );
}