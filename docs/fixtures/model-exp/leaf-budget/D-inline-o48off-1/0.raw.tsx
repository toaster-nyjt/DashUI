export default function GeneratedComponent() {
  // ---- Sample waveform generation (stable per mount) ----
  const genSamples = (seed: number, len: number): number[] => {
    const out: number[] = [];
    let s = seed;
    const rand = () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    for (let i = 0; i < len; i++) {
      const phase = i / len;
      // Song-like envelope: intro/build/drop/outro
      let env = 0.35;
      if (phase < 0.08) env = 0.25 + phase * 2.5;
      else if (phase < 0.35) env = 0.55 + Math.sin(phase * 22) * 0.12;
      else if (phase < 0.42) env = 0.9;
      else if (phase < 0.72) env = 0.78 + Math.sin(phase * 40) * 0.15;
      else if (phase < 0.8) env = 0.95;
      else env = Math.max(0.15, 0.9 - (phase - 0.8) * 3.2);
      const beat = 0.55 + 0.45 * Math.abs(Math.sin(i * 0.6));
      const noise = 0.6 + rand() * 0.4;
      out.push(Math.min(1, Math.max(0.04, env * beat * noise)));
    }
    return out;
  };

  const deckASamples = useMemo(() => genSamples(1337, 900), []);
  const deckBSamples = useMemo(() => genSamples(9042, 900), []);

  const deckADuration = 214; // seconds
  const deckBDuration = 268;
  const deckABpm = 128;
  const deckBBpm = 124;

  const beatGridFor = (dur: number, bpm: number): number[] => {
    const spb = 60 / bpm;
    const grid: number[] = [];
    for (let t = 0; t <= dur; t += spb) grid.push(t);
    return grid;
  };
  const deckABeats = useMemo(() => beatGridFor(deckADuration, deckABpm), []);
  const deckBBeats = useMemo(() => beatGridFor(deckBDuration, deckBBpm), []);

  const deckAMarkers = useMemo(
    () => [
      { id: "a-cue1", time: 12.4, kind: "cue" as const, color: "#fbbf24" },
      { id: "a-cue2", time: 61.2, kind: "cue" as const, color: "#fbbf24" },
      { id: "a-lin", time: 90.0, kind: "loopIn" as const, color: "#2dd4bf" },
      { id: "a-lout", time: 105.0, kind: "loopOut" as const, color: "#2dd4bf" },
      { id: "a-cue3", time: 150.8, kind: "cue" as const, color: "#fbbf24" },
    ],
    []
  );
  const deckBMarkers = useMemo(
    () => [
      { id: "b-cue1", time: 20.6, kind: "cue" as const, color: "#2dd4bf" },
      { id: "b-lin", time: 74.0, kind: "loopIn" as const, color: "#a78bfa" },
      { id: "b-lout", time: 90.0, kind: "loopOut" as const, color: "#a78bfa" },
      { id: "b-cue2", time: 140.0, kind: "cue" as const, color: "#2dd4bf" },
      { id: "b-cue3", time: 210.0, kind: "cue" as const, color: "#2dd4bf" },
    ],
    []
  );

  // ---- Playback state (simulating effector feed from Deck A / Deck B) ----
  const [posA, setPosA] = useState(48.6);
  const [posB, setPosB] = useState(72.2);
  const [playingA, setPlayingA] = useState(true);
  const [playingB, setPlayingB] = useState(true);

  // Zoom in seconds-visible (shared control)
  const [zoom, setZoom] = useState(16);

  // Scrub velocity flashes for feedback
  const [scrubA, setScrubA] = useState(0);
  const [scrubB, setScrubB] = useState(0);
  const scrubATimer = useRef<number | null>(null);
  const scrubBTimer = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPosA((p) => (playingA ? (p + 0.05) % deckADuration : p));
      setPosB((p) => (playingB ? (p + 0.05) % deckBDuration : p));
    }, 50);
    return () => window.clearInterval(id);
  }, [playingA, playingB]);

  const flashScrubA = (v: number) => {
    setScrubA(v);
    if (scrubATimer.current) window.clearTimeout(scrubATimer.current);
    scrubATimer.current = window.setTimeout(() => setScrubA(0), 260);
  };
  const flashScrubB = (v: number) => {
    setScrubB(v);
    if (scrubBTimer.current) window.clearTimeout(scrubBTimer.current);
    scrubBTimer.current = window.setTimeout(() => setScrubB(0), 260);
  };

  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ":" + (s < 10 ? "0" + s : String(s));
  };

  const LaneHeader = ({
    label,
    bpm,
    pos,
    dur,
    playing,
    scrub,
    accent,
  }: {
    label: string;
    bpm: number;
    pos: number;
    dur: number;
    playing: boolean;
    scrub: number;
    accent: "amber" | "teal";
  }) => {
    const dot = accent === "amber" ? "bg-amber-400" : "bg-teal-400";
    const glow =
      accent === "amber"
        ? "shadow-[0_0_10px_rgba(251,146,60,0.7)]"
        : "shadow-[0_0_10px_rgba(45,212,191,0.7)]";
    const txt = accent === "amber" ? "text-amber-300" : "text-teal-300";
    return (
      <div className="flex flex-none items-center gap-2 pr-1">
        <span
          className={
            "h-2 w-2 rounded-full " +
            dot +
            " " +
            (playing ? glow + " animate-pulse" : "opacity-40")
          }
        />
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-100">
          {label}
        </span>
        <span
          className={
            "font-mono text-[10px] font-bold tracking-tight " +
            txt +
            " drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]"
          }
        >
          {bpm.toFixed(1)}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
          BPM
        </span>
        <span
          className={
            "ml-1 font-mono text-[9px] uppercase tracking-widest transition-all duration-100 " +
            (scrub !== 0 ? "text-amber-400 opacity-100" : "text-neutral-600 opacity-40")
          }
        >
          {scrub !== 0 ? (scrub > 0 ? "▶▶ " : "◀◀ ") + scrub.toFixed(2) + "×" : "scratch"}
        </span>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)]">
      {/* Header / title bar */}
      <div className="flex h-9 flex-none items-center gap-3 border-b border-amber-500/20 bg-gradient-to-b from-neutral-800/80 to-neutral-900 px-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.7)]" />
          <span className="text-sm font-semibold uppercase tracking-wide text-amber-100">
            Waveform Display
          </span>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-widest text-neutral-500 sm:inline">
          Dual&nbsp;Deck · Beat&nbsp;Sync
        </span>

        {/* Zoom control lives in header (compact) */}
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
              Zoom
            </span>
            <div className="h-[2.5rem] w-[2.5rem]">
              <Knob
                value={zoom}
                min={4}
                max={64}
                mode="continuous"
                onChange={setZoom}
              />
            </div>
            <span className="font-mono text-[10px] font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {Math.round(zoom)}s
            </span>
          </div>
        </div>
      </div>

      {/* Body: overview minimap + two waveform lanes */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        {/* Overview minimap strip (whole-track scrub) */}
        <div className="flex flex-none items-center gap-3">
          <span className="w-14 font-mono text-[9px] uppercase tracking-widest text-neutral-500">
            Overview
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Deck A overview */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-amber-300">
                A
              </span>
              <div className="h-[1.5rem] flex-1">
                <OverviewMinimap
                  samples={deckASamples}
                  duration={deckADuration}
                  position={posA}
                  markers={deckAMarkers.map((m) => ({ id: m.id, time: m.time }))}
                  onSeek={(t) => setPosA(t)}
                />
              </div>
              <span className="font-mono text-[9px] tabular-nums tracking-tight text-neutral-400">
                {fmt(posA)}
              </span>
            </div>
            {/* Deck B overview */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-teal-300">
                B
              </span>
              <div className="h-[1.5rem] flex-1">
                <OverviewMinimap
                  samples={deckBSamples}
                  duration={deckBDuration}
                  position={posB}
                  markers={deckBMarkers.map((m) => ({ id: m.id, time: m.time }))}
                  onSeek={(t) => setPosB(t)}
                />
              </div>
              <span className="font-mono text-[9px] tabular-nums tracking-tight text-neutral-400">
                {fmt(posB)}
              </span>
            </div>
          </div>
        </div>

        {/* Deck A lane */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70">
          <LaneHeader
            label="Deck A"
            bpm={deckABpm}
            pos={posA}
            dur={deckADuration}
            playing={playingA}
            scrub={scrubA}
            accent="amber"
          />
          <div className="min-h-0 flex-1">
            <WaveformLane
              samples={deckASamples}
              duration={deckADuration}
              playhead={posA}
              zoom={zoom}
              beatGrid={deckABeats}
              markers={deckAMarkers}
              playing={playingA}
              onSeek={(t) => {
                setPosA(t);
                setPlayingA(false);
              }}
              onScrub={(v) => flashScrubA(v)}
            />
          </div>
        </div>

        {/* Deck B lane */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 p-2 shadow-inner shadow-black/70">
          <LaneHeader
            label="Deck B"
            bpm={deckBBpm}
            pos={posB}
            dur={deckBDuration}
            playing={playingB}
            scrub={scrubB}
            accent="teal"
          />
          <div className="min-h-0 flex-1">
            <WaveformLane
              samples={deckBSamples}
              duration={deckBDuration}
              playhead={posB}
              zoom={zoom}
              beatGrid={deckBBeats}
              markers={deckBMarkers}
              playing={playingB}
              onSeek={(t) => {
                setPosB(t);
                setPlayingB(false);
              }}
              onScrub={(v) => flashScrubB(v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}