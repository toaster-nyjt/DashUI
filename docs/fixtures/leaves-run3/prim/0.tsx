export default function GeneratedComponent() {
  const TRACK = {
    title: "Midnight Protocol",
    artist: "Vellum & The Analog Ghosts",
    baseBpm: 124.0,
    key: "8A",
    durationSec: 254,
  };

  const [playing, setPlaying] = useState(false);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [progress, setProgress] = useState(0.14); // 0..1 playhead
  const [jogAngle, setJogAngle] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);

  const [cuePoint, setCuePoint] = useState<number | null>(0.14);
  const [loopActive, setLoopActive] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [activeCue, setActiveCue] = useState<number | null>(1);

  const rafRef = useRef<number | null>(null);
  const lastTs = useRef<number | null>(null);

  // Generate a stable pseudo waveform
  const waveData = useMemo(() => {
    const n = 220;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const beat = Math.sin((i / n) * Math.PI * 34) * 0.5 + 0.5;
      const swell = Math.sin((i / n) * Math.PI * 4) * 0.35 + 0.55;
      const grit =
        (Math.sin(i * 12.9898) * 43758.5453) % 1 < 0 ? 0.2 : 0.4;
      const spike = i % 17 === 0 ? 0.35 : 0;
      out.push(Math.min(1, Math.max(0.06, beat * 0.45 * swell + grit * 0.4 + spike)));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i <= 32; i++) arr.push(i / 32);
    return arr;
  }, []);

  const effectiveBpm = TRACK.baseBpm * (1 + pitch / 100);

  // Playback engine
  useEffect(() => {
    if (!playing) {
      lastTs.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      if (lastTs.current == null) lastTs.current = ts;
      const dt = (ts - lastTs.current) / 1000;
      lastTs.current = ts;
      setProgress((p) => {
        const rate = (1 + pitch / 100) / TRACK.durationSec;
        let np = p + dt * rate;
        if (loopActive && cuePoint != null) {
          const loopLen = (loopBeats * (60 / effectiveBpm)) / TRACK.durationSec;
          const loopStart = cuePoint;
          if (np >= loopStart + loopLen) np = loopStart;
        }
        if (np >= 1) np = 0;
        return np;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, pitch, loopActive, loopBeats, cuePoint, effectiveBpm]);

  // Jog wheel spins while playing
  useEffect(() => {
    if (!playing || scrubbing) return;
    let id: number;
    const spin = () => {
      setJogAngle((a) => a + 0.05 * (1 + pitch / 100));
      id = requestAnimationFrame(spin);
    };
    id = requestAnimationFrame(spin);
    return () => cancelAnimationFrame(id);
  }, [playing, scrubbing, pitch]);

  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" + s : s);
  };

  const elapsed = progress * TRACK.durationSec;
  const remain = TRACK.durationSec - elapsed;

  const handleScrub = (delta: number) => {
    setScrubbing(true);
    setJogAngle((a) => a + delta);
    setProgress((p) => Math.min(1, Math.max(0, p + delta / (Math.PI * 40))));
    window.clearTimeout((handleScrub as any)._t);
    (handleScrub as any)._t = window.setTimeout(() => setScrubbing(false), 120);
  };

  const handleWaveScrub = (pos: number) => {
    setProgress(Math.min(1, Math.max(0, pos)));
  };

  const cueDown = () => {
    if (cuePoint != null) setProgress(cuePoint);
    if (!playing) setPlaying(true);
  };
  const setCueHere = () => setCuePoint(progress);

  const doSync = (on: boolean) => {
    setSynced(on);
    if (on) {
      // Match Deck B (simulated 126 BPM)
      const targetBpm = 126.0;
      setPitch(((targetBpm / TRACK.baseBpm - 1) * 100));
    } else {
      setPitch(0);
    }
  };

  const cueColors = [
    "amber",
    "teal",
    "rose",
    "emerald",
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm text-neutral-100">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 border border-amber-400/30 text-amber-400 text-[11px] font-bold">
            A
          </span>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-400/90 truncate">
            Deck A — Channel 1
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (playing
                ? "bg-amber-400 shadow-[0_0_8px_1px] shadow-amber-500/70 animate-pulse"
                : "bg-neutral-700")
            }
          />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            {playing ? "Live" : "Cued"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 flex flex-col gap-2">
        {/* Track info + BPM row */}
        <div className="flex items-stretch gap-2 shrink-0">
          <div className="flex-1 min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 px-2.5 py-1.5 flex flex-col justify-center">
            <Readout>
              <span className="block text-[12px] font-semibold text-neutral-100 truncate leading-tight">
                {TRACK.title}
              </span>
            </Readout>
            <Readout>
              <span className="block text-[11px] font-normal tracking-normal leading-tight text-neutral-500 truncate">
                {TRACK.artist}
              </span>
            </Readout>
          </div>
          <div className="w-[104px] min-w-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-amber-400/10 px-2 py-1 flex flex-col items-center justify-center">
            <Readout>
              <span className="font-mono text-2xl font-bold tabular-nums tracking-tight leading-none text-amber-300">
                {effectiveBpm.toFixed(1)}
              </span>
            </Readout>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
                BPM
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-amber-400/70">
                {TRACK.key}
              </span>
            </div>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="shrink-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 h-14 overflow-hidden">
          <Waveform
            data={waveData}
            playhead={progress}
            beatGrid={beatGrid}
            zoom={0.4}
            onScrub={handleWaveScrub}
          />
        </div>

        {/* Time strip */}
        <div className="shrink-0 flex items-center justify-between px-0.5">
          <Readout>
            <span className="font-mono text-[11px] tabular-nums text-neutral-400">
              {fmtTime(elapsed)}
            </span>
          </Readout>
          <div className="flex items-center gap-1.5">
            {synced && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/15 border border-amber-400/30 rounded-md px-1.5 py-0.5">
                Sync
              </span>
            )}
            {keylock && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-teal-300 bg-teal-500/15 border border-teal-400/30 rounded-md px-1.5 py-0.5">
                Key
              </span>
            )}
          </div>
          <Readout>
            <span className="font-mono text-[11px] tabular-nums text-neutral-500">
              -{fmtTime(remain)}
            </span>
          </Readout>
        </div>

        {/* Main control zone: Jog + Pitch */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel column */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-2">
            <div className="flex-1 min-h-0 flex items-center justify-center rounded-lg bg-neutral-950/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 relative">
              <div className="aspect-square h-full max-h-full max-w-full p-1.5">
                <JogWheel value={jogAngle} onScrub={handleScrub} />
              </div>
              {playing && (
                <div className="pointer-events-none absolute inset-1.5 rounded-full animate-pulse shadow-[0_0_16px_-2px] shadow-amber-500/60" />
              )}
            </div>

            {/* Transport row */}
            <div className="shrink-0 flex items-stretch gap-2 h-11">
              <div className="flex-1 min-w-0">
                <Button onPress={cueDown}>
                  <span className="text-[11px] font-bold uppercase tracking-widest">
                    Cue
                  </span>
                </Button>
              </div>
              <div className="flex-[1.3] min-w-0">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest">
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                      {playing ? (
                        <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
                      ) : (
                        <path d="M8 5v14l11-7z" />
                      )}
                    </svg>
                    {playing ? "Pause" : "Play"}
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Pitch fader column */}
          <div className="w-[62px] min-w-0 min-h-0 flex flex-col items-center gap-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400 shrink-0">
              Pitch
            </span>
            <div className="flex-1 min-h-0 w-full flex justify-center rounded-lg bg-neutral-950/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/40 py-2">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => {
                  setPitch(v);
                  if (synced) setSynced(false);
                }}
                orientation="vertical"
              />
            </div>
            <Readout>
              <span className="font-mono text-[11px] tabular-nums text-amber-300 shrink-0">
                {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
              </span>
            </Readout>
          </div>
        </div>

        {/* Sync + Keylock row */}
        <div className="shrink-0 flex items-stretch gap-2 h-9">
          <div className="flex-1 min-w-0">
            <ToggleButton on={synced} onChange={doSync}>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Sync
              </span>
            </ToggleButton>
          </div>
          <div className="flex-1 min-w-0">
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Keylock
              </span>
            </ToggleButton>
          </div>
          <div className="flex-1 min-w-0">
            <Button onPress={setCueHere}>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Set Cue
              </span>
            </Button>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="shrink-0 grid grid-cols-4 gap-1.5 h-11">
          {[0, 1, 2, 3].map((i) => (
            <div key={"cue-" + i} className="min-w-0">
              <Pad
                active={activeCue === i}
                onPress={() => {
                  setActiveCue(i);
                  const target = cuePoint != null ? cuePoint + i * 0.08 : i * 0.08;
                  setProgress(Math.min(0.98, target));
                  if (!playing) setPlaying(true);
                }}
              >
                <span className="text-[10px] font-bold tracking-wider">
                  {"CUE " + (i + 1)}
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Loop controls */}
        <div className="shrink-0 flex items-stretch gap-2 h-10">
          <div className="w-16 min-w-0">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="text-[13px] font-bold">½</span>
            </Button>
          </div>
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-amber-400/10 px-2">
            <Readout>
              <span className="font-mono text-[15px] font-bold tabular-nums leading-none text-amber-300">
                {loopBeats >= 1 ? loopBeats + " BEAT" : loopBeats + " BT"}
              </span>
            </Readout>
            <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500 mt-0.5">
              {loopActive ? "Looping" : "Loop Length"}
            </span>
          </div>
          <div className="w-16 min-w-0">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="text-[13px] font-bold">×2</span>
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <ToggleButton on={loopActive} onChange={setLoopActive}>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Loop
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="truncate">
          OUT → MIXER CH1
        </span>
        <span className="font-mono tabular-nums text-neutral-400">
          {fmtTime(TRACK.durationSec)}
        </span>
      </div>
    </div>
  );
}