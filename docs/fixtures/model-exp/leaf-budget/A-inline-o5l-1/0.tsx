export default function GeneratedComponent() {
  const DUR_A = 312;
  const DUR_B = 268;

  const makeSamples = (n: number, seed: number) => {
    const out: number[] = [];
    let s = seed;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
    for (let i = 0; i < n; i++) {
      const p = i / n;
      const build = 0.35 + 0.45 * Math.abs(Math.sin(p * Math.PI * 2.2));
      const beat = 0.6 + 0.4 * Math.abs(Math.sin(i * 0.9));
      const drop = p > 0.28 && p < 0.72 ? 1 : 0.62;
      out.push(Math.max(0.05, Math.min(1, build * beat * drop * (0.75 + rnd() * 0.5))));
    }
    return out;
  };

  const samplesA = useMemo(() => makeSamples(720, 7), []);
  const samplesB = useMemo(() => makeSamples(720, 91), []);
  const overview = useMemo(() => makeSamples(300, 43), []);

  const gridA = useMemo(() => {
    const g: number[] = [];
    for (let t = 0; t < DUR_A; t += 60 / 128) g.push(t);
    return g;
  }, []);
  const gridB = useMemo(() => {
    const g: number[] = [];
    for (let t = 0; t < DUR_B; t += 60 / 126) g.push(t);
    return g;
  }, []);

  const markersA = useMemo(
    () => [
      { id: "a1", time: 18.2, kind: "cue" as const },
      { id: "a2", time: 74.5, kind: "loopIn" as const },
      { id: "a3", time: 90.6, kind: "loopOut" as const },
      { id: "a4", time: 156.0, kind: "cue" as const },
    ],
    []
  );
  const markersB = useMemo(
    () => [
      { id: "b1", time: 32.0, kind: "cue" as const },
      { id: "b2", time: 112.4, kind: "loopIn" as const },
      { id: "b3", time: 128.5, kind: "loopOut" as const },
    ],
    []
  );

  const [posA, setPosA] = useState(62.4);
  const [posB, setPosB] = useState(41.8);
  const [playA] = useState(true);
  const [playB] = useState(true);
  const [zoom, setZoom] = useState(8);
  const [scrub, setScrub] = useState<string>("—");

  useEffect(() => {
    const id = setInterval(() => {
      if (playA) setPosA((p) => (p + 0.08) % DUR_A);
      if (playB) setPosB((p) => (p + 0.08) % DUR_B);
    }, 80);
    return () => clearInterval(id);
  }, [playA, playB]);

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 animate-pulse">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Waveform Display
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-wide text-neutral-400">
          <span className="text-amber-300">A {fmt(posA)} / {fmt(DUR_A)} · 128.0 BPM</span>
          <span className="text-teal-300">B {fmt(posB)} / {fmt(DUR_B)} · 126.0 BPM</span>
          <span className="text-neutral-500">SCRUB {scrub}</span>
        </div>
      </div>

      <div className="flex-1 flex items-stretch gap-3 p-2 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* lanes + minimap */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex-1 flex items-stretch gap-2">
            <div className="flex-none flex flex-col items-center justify-center px-1">
              <span className="font-mono font-bold text-amber-300 text-sm drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">A</span>
              <span className="text-[10px] tracking-widest uppercase text-neutral-500">dk</span>
            </div>
            <div className="flex-1 h-full rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 overflow-clip">
              <WaveformLane
                samples={samplesA}
                duration={DUR_A}
                playhead={posA}
                zoom={zoom}
                beatGrid={gridA}
                markers={markersA}
                playing={playA}
                onSeek={(t) => setPosA(t)}
                onScrub={(v) => setScrub(v.toFixed(2) + "x")}
              />
            </div>
          </div>

          <div className="flex-1 flex items-stretch gap-2">
            <div className="flex-none flex flex-col items-center justify-center px-1">
              <span className="font-mono font-bold text-teal-300 text-sm drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">B</span>
              <span className="text-[10px] tracking-widest uppercase text-neutral-500">dk</span>
            </div>
            <div className="flex-1 h-full rounded-xl border border-teal-400/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 overflow-clip">
              <WaveformLane
                samples={samplesB}
                duration={DUR_B}
                playhead={posB}
                zoom={zoom}
                beatGrid={gridB}
                markers={markersB}
                playing={playB}
                onSeek={(t) => setPosB(t)}
                onScrub={(v) => setScrub(v.toFixed(2) + "x")}
              />
            </div>
          </div>

          <div className="h-8 flex-none flex items-center gap-2">
            <span className="text-[10px] tracking-widest uppercase text-neutral-500 px-1">ovw</span>
            <div className="flex-1 h-full rounded-xl border border-amber-500/10 bg-black/70 shadow-inner shadow-black/70 overflow-clip">
              <OverviewMinimap
                samples={overview}
                duration={DUR_A}
                position={posA}
                markers={markersA.map((m) => ({ id: m.id, time: m.time }))}
                onSeek={(t) => setPosA(t)}
              />
            </div>
          </div>
        </div>

        {/* zoom */}
        <div className="flex-none flex flex-col items-center justify-center gap-1 px-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
          <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">Zoom</span>
          <div className="w-[4.5rem] h-[4.5rem]">
            <Knob value={zoom} min={2} max={32} onChange={(v) => setZoom(v)} mode="continuous" />
          </div>
          <span className="font-mono font-bold tracking-tight text-amber-300 text-xs drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
            {zoom.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}