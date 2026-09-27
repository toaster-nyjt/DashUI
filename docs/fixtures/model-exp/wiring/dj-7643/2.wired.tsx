export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 0.75 + laneA 5.5 + gap 0.5 + laneB 5.5 + pad 0.75 = 15.25 ≤ 17.3
  // BUDGET width: pad 0.75 + lanes(flex ~140) + gap 0.75 + zoom col 8 + pad 0.75 = 156.1 ≤ 156.1

  const makeWave = (seed: number, len: number) => {
    const out: number[] = [];
    let s = seed;
    for (let i = 0; i < len; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      const env = 0.45 + 0.4 * Math.sin(i / 90 + seed) + 0.15 * Math.sin(i / 17);
      const kick = i % 32 < 3 ? 0.35 : 0;
      out.push(Math.max(0.05, Math.min(1, env * (0.55 + r * 0.5) + kick)));
    }
    return out;
  };

  const waveA = useMemo(() => makeWave(7, 900), []);
  const waveB = useMemo(() => makeWave(41, 900), []);

  const [durA, setDurA] = useState(312);
  const [durB, setDurB] = useState(288);
  const [bpmA, setBpmA] = useState(126);
  const [bpmB, setBpmB] = useState(124);

  const gridA = useMemo(() => {
    const g: number[] = [];
    for (let t = 0.35; t < durA; t += 60 / bpmA) g.push(t);
    return g;
  }, [durA, bpmA]);
  const gridB = useMemo(() => {
    const g: number[] = [];
    for (let t = 1.1; t < durB; t += 60 / bpmB) g.push(t);
    return g;
  }, [durB, bpmB]);

  const [posA, setPosA] = useState(74.2);
  const [posB, setPosB] = useState(51.6);
  const [playA, setPlayA] = useState(true);
  const [playB, setPlayB] = useState(true);
  const [zoom, setZoom] = useState(4);

  useEffect(
    () =>
      bus.on("DJ Table: Left Deck (Deck A)->DJ Table: Dual Waveform Display", (data) => {
        setPosA(data.time);
        setDurA(data.duration);
        setPlayA(data.playing);
        setBpmA(data.bpm);
      }),
    []
  );

  useEffect(
    () =>
      bus.on("DJ Table: Right Deck (Deck B)->DJ Table: Dual Waveform Display", (data) => {
        setPosB(data.time);
        setDurB(data.duration);
        setPlayB(data.playing);
        setBpmB(data.bpm);
      }),
    []
  );

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  };

  const drift = ((posA % (60 / bpmA)) - (posB % (60 / bpmB))) * 1000;

  const seekA = (t: number) => {
    setPosA(t);
    bus.emit("DJ Table: Dual Waveform Display->DJ Table: Left Deck (Deck A)", { time: t });
  };

  const seekB = (t: number) => {
    setPosB(t);
    bus.emit("DJ Table: Dual Waveform Display->DJ Table: Right Deck (Deck B)", { time: t });
  };

  const Lane = (props: {
    label: string;
    accent: string;
    dot: string;
    data: number[];
    duration: number;
    playhead: number;
    grid: number[];
    overlay?: number[];
    playing: boolean;
    bpm: number;
    onSeek: (t: number) => void;
  }) => (
    <div className="flex-1 flex items-stretch gap-2">
      <div className="w-[7.5rem] flex flex-col justify-center gap-1 px-2 rounded-xl bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 border border-violet-500/25">
        <div className="flex items-center gap-1.5">
          <span className={"h-1.5 w-1.5 rounded-full " + props.dot + " shadow-[0_0_8px_currentColor]"} />
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500 truncate">
            {props.label}
          </span>
        </div>
        <div className={"font-mono font-bold tracking-tight text-lg leading-none drop-shadow-[0_0_6px_currentColor] " + props.accent}>
          {props.bpm.toFixed(1)}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-600">
          {fmt(props.playhead)} / {fmt(props.duration)}
        </div>
      </div>
      <div className="flex-1 rounded-xl border border-zinc-800/80 bg-[#08060f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-clip">
        <WaveformLane
          data={props.data}
          duration={props.duration}
          playhead={props.playhead}
          zoom={zoom}
          playing={props.playing}
          beatGrid={props.grid}
          overlayBeatGrid={props.overlay}
          onSeek={props.onSeek}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#050308] text-zinc-100">
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-violet-500/25">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full bg-violet-400 text-violet-400 shadow-[0_0_8px_currentColor] animate-pulse" />
          <span className="text-sm font-bold tracking-[0.18em] uppercase text-zinc-200 truncate">
            Dual Waveform Display
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
          <span>
            Phase Drift{" "}
            <span className={Math.abs(drift) < 12 ? "text-emerald-400" : "text-rose-400"}>
              {(drift >= 0 ? "+" : "") + drift.toFixed(0)}ms
            </span>
          </span>
          <span className="text-violet-300">Sync Overlay · B→A</span>
        </div>
      </div>

      <div className="flex-1 flex items-stretch gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 flex flex-col gap-2">
          <Lane
            label="Deck A"
            accent="text-cyan-300"
            dot="bg-cyan-400 text-cyan-400"
            data={waveA}
            duration={durA}
            playhead={posA}
            grid={gridA}
            overlay={gridB}
            playing={playA}
            bpm={bpmA}
            onSeek={seekA}
          />
          <Lane
            label="Deck B"
            accent="text-amber-300"
            dot="bg-amber-400 text-amber-400"
            data={waveB}
            duration={durB}
            playhead={posB}
            grid={gridB}
            playing={playB}
            bpm={bpmB}
            onSeek={seekB}
          />
        </div>

        <div className="w-[8rem] flex flex-col items-center justify-center gap-2 rounded-2xl border border-violet-500/25 bg-gradient-to-b from-zinc-900/95 to-zinc-950/95 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-3">
          <span className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500">
            Zoom
          </span>
          <div className="h-[4.5rem] w-[4.5rem]">
            <Knob min={1} max={16} value={zoom} onChange={setZoom} mode="continuous" />
          </div>
          <span className="font-mono font-bold tracking-tight text-violet-200 text-sm leading-none drop-shadow-[0_0_6px_currentColor]">
            {zoom.toFixed(1)}×
          </span>
        </div>
      </div>
    </div>
  );
}