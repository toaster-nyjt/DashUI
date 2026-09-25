export default function GeneratedComponent() {
  const BASE_BPM = 128.0;
  const TRACK_TITLE = "Nocturne Drift";
  const TRACK_ARTIST = "Kessler & Vane";
  const TRACK_KEY = "8A";
  const TRACK_LENGTH = 261; // seconds

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(18.4); // seconds
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [keylock, setKeylock] = useState(true);
  const [synced, setSynced] = useState(false);
  const [cuePoint, setCuePoint] = useState(0);
  const [cueHeld, setCueHeld] = useState(false);
  const [activeLoop, setActiveLoop] = useState<number | null>(null);
  const [jogGrab, setJogGrab] = useState(false);
  const [jogAngle, setJogAngle] = useState(0);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const beatMsRef = useRef<number>(0);

  const effBpm = useMemo(() => BASE_BPM * (1 + pitch / 100), [pitch]);
  const beatSec = useMemo(() => 60 / effBpm, [effBpm]);

  // playback + jog spin loop
  useEffect(() => {
    const tick = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (playing && !cueHeld && !jogGrab) {
        setPosition((p) => {
          let np = p + dt * (1 + pitch / 100);
          if (activeLoop != null) {
            const loopLen = activeLoop * beatSec;
            const loopStart = Math.floor((p) / Math.max(loopLen, 0.001)) * loopLen;
            if (np >= loopStart + loopLen) np = loopStart + (np - (loopStart + loopLen));
          }
          if (np >= TRACK_LENGTH) np = 0;
          return np;
        });
        setJogAngle((a) => (a + dt * (360 / (60 / 33.33)) * (1 + pitch / 100)) % 360);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = 0;
    };
  }, [playing, cueHeld, jogGrab, pitch, activeLoop, beatSec]);

  // beat pulse ms for CSS var
  useEffect(() => {
    beatMsRef.current = beatSec * 1000;
  }, [beatSec]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const cs = Math.floor((s % 1) * 100);
    return (
      String(m) + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const remaining = TRACK_LENGTH - position;
  const pct = (position / TRACK_LENGTH) * 100;

  // waveform bar heights (static, deterministic)
  const bars = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 90; i++) {
      const a = Math.sin(i * 0.42) * 0.5 + 0.5;
      const b = Math.sin(i * 0.13 + 2) * 0.5 + 0.5;
      const c = ((i * 73) % 11) / 11;
      arr.push(0.22 + (a * 0.5 + b * 0.3 + c * 0.2) * 0.78);
    }
    return arr;
  }, []);

  const beatInBar = ((position / beatSec) % 4);
  const beatPos = beatInBar / 4;

  const cuePads = [
    { label: "1", tone: "amber" },
    { label: "2", tone: "amber" },
    { label: "3", tone: "amber" },
    { label: "4", tone: "amber" },
  ];
  const loopSizes = [1, 2, 4, 8];

  const onCueDown = () => {
    if (playing) {
      setPlaying(false);
      setPosition(cuePoint);
    } else {
      setCuePoint(position);
      setCueHeld(true);
    }
  };
  const onCueUp = () => {
    if (cueHeld) {
      setCueHeld(false);
    }
  };

  const doSync = () => {
    setSynced((s) => !s);
    if (!synced) setPitch(0);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 backdrop-blur-sm text-neutral-100 select-none">
      {/* Header */}
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-teal-500/15 border border-teal-400/30 text-[9px] font-bold text-teal-300">
            B
          </span>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-teal-300/90 truncate">
            Deck B
          </span>
        </div>
        <div className="flex items-center gap-2 shrink min-w-0">
          <span
            className={
              "text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded " +
              (playing
                ? "text-teal-300 bg-teal-500/15 border border-teal-400/30"
                : "text-neutral-500 bg-neutral-800 border border-neutral-700/60")
            }
          >
            {playing ? "Play" : "Cue"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-hidden p-2.5 flex flex-col gap-2">
        {/* Track info + BPM row */}
        <div className="flex items-stretch gap-2 min-w-0">
          <div className="flex-1 basis-0 min-w-0 flex flex-col justify-center rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] px-2.5 py-1.5 overflow-hidden">
            <div className="text-[13px] font-semibold leading-tight text-neutral-100 truncate">
              {TRACK_TITLE}
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] text-neutral-500 leading-tight truncate">
                {TRACK_ARTIST}
              </span>
              <span className="text-[10px] font-semibold text-teal-300/80 shrink">
                {TRACK_KEY}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] px-2.5 py-1 min-w-0">
            <span className="font-mono text-2xl font-bold tabular-nums tracking-tight leading-none text-teal-300">
              {effBpm.toFixed(1)}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 leading-tight">
              BPM
            </span>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="relative h-11 shrink-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-[1px] px-1">
            {bars.map((h, i) => {
              const barPct = (i / bars.length) * 100;
              const played = barPct <= pct;
              return (
                <div
                  key={"wb-" + i}
                  className="flex-1 basis-0 min-w-0 flex items-center justify-center"
                >
                  <div
                    className={
                      "w-full rounded-[1px] " +
                      (played ? "bg-teal-400/80" : "bg-neutral-700/60")
                    }
                    style={{ height: Math.round(h * 100) + "%" }}
                  />
                </div>
              );
            })}
          </div>
          {/* beat grid */}
          <div className="absolute inset-0 flex items-center px-1 pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={"bg-" + i} className="flex-1 basis-0 min-w-0 relative h-full">
                <div className="absolute left-0 top-0 h-full w-px bg-teal-400/10" />
              </div>
            ))}
          </div>
          {/* playhead */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-teal-300 shadow-[0_0_10px_1px] shadow-teal-500/70"
            style={{ left: "calc(" + pct + "% )" }}
          />
        </div>

        {/* Main control area: jog + transport/pitch */}
        <div className="flex-1 min-h-0 flex gap-2 min-w-0">
          {/* Jog wheel */}
          <div className="flex-1 basis-0 min-w-0 min-h-0 flex items-center justify-center rounded-lg bg-neutral-950/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)] p-1.5">
            <div
              className="relative aspect-square h-full max-h-full max-w-full rounded-full border border-neutral-700/70 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-[0_6px_18px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing"
              onMouseDown={() => setJogGrab(true)}
              onMouseUp={() => setJogGrab(false)}
              onMouseLeave={() => setJogGrab(false)}
              style={{ boxShadow: playing ? "0 0 16px -2px rgba(20,184,166,0.55), 0 6px 18px rgba(0,0,0,0.6)" : undefined }}
            >
              {/* outer ring ticks */}
              <div className="absolute inset-0 rounded-full">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={"tick-" + i}
                    className="absolute left-1/2 top-1/2 w-px h-2 bg-neutral-600/50 origin-bottom"
                    style={{
                      transform:
                        "translate(-50%,-100%) rotate(" +
                        (i * 15) +
                        "deg) translateY(-42%)",
                    }}
                  />
                ))}
              </div>
              {/* rotating platter */}
              <div
                className="absolute inset-[10%] rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-700/60 transition-transform duration-100 ease-linear"
                style={{ transform: "rotate(" + jogAngle + "deg)" }}
              >
                <div className="absolute left-1/2 top-2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-teal-400/90 shadow-[0_0_8px] shadow-teal-500/60" />
                <div className="absolute inset-0 rounded-full [background:repeating-radial-gradient(circle,transparent_0_5px,rgba(255,255,255,0.02)_5px_6px)]" />
              </div>
              {/* center hub with position marker */}
              <div className="absolute inset-[34%] rounded-full bg-gradient-to-b from-neutral-700 to-neutral-900 border border-neutral-600/50 flex flex-col items-center justify-center overflow-hidden">
                <span className="font-mono text-[10px] font-bold text-teal-300 tabular-nums leading-none">
                  {fmtTime(position).slice(0, 4)}
                </span>
                <span className="font-mono text-[8px] text-neutral-500 tabular-nums leading-tight">
                  -{fmtTime(remaining).slice(0, 4)}
                </span>
              </div>
              {/* beat pulse ring */}
              <div
                className="absolute inset-0 rounded-full border pointer-events-none"
                style={{
                  borderColor:
                    beatPos < 0.12 && playing
                      ? "rgba(20,184,166,0.6)"
                      : "rgba(20,184,166,0.08)",
                }}
              />
            </div>
          </div>

          {/* Transport + pitch */}
          <div className="w-[38%] shrink min-w-0 min-h-0 flex flex-col gap-2">
            {/* Transport buttons */}
            <div className="flex gap-2 shrink-0">
              <button
                onMouseDown={onCueDown}
                onMouseUp={onCueUp}
                onMouseLeave={onCueUp}
                className="flex-1 basis-0 min-w-0 h-9 rounded-lg border border-neutral-600/50 bg-neutral-800 text-neutral-300 flex flex-col items-center justify-center transition-all duration-200 ease-out shadow-md shadow-black/40 hover:bg-neutral-700 active:scale-[0.97]"
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest leading-none">
                  Cue
                </span>
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                className={
                  "flex-1 basis-0 min-w-0 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 ease-out shadow-md shadow-black/40 active:scale-[0.97] " +
                  (playing
                    ? "bg-teal-500 border-teal-400/40 text-neutral-950 shadow-[0_0_14px_-2px] shadow-teal-500/60"
                    : "bg-neutral-800 border-neutral-600/50 text-teal-300 hover:bg-neutral-700")
                }
              >
                {playing ? (
                  <div className="flex gap-[3px]">
                    <span className="block w-1 h-3.5 bg-current rounded-[1px]" />
                    <span className="block w-1 h-3.5 bg-current rounded-[1px]" />
                  </div>
                ) : (
                  <span className="block w-0 h-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Sync + Keylock */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={doSync}
                className={
                  "flex-1 basis-0 min-w-0 h-7 rounded-lg border text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 ease-out active:scale-[0.97] " +
                  (synced
                    ? "bg-teal-500 text-neutral-950 border-teal-400/40 shadow-[0_0_12px_-1px] shadow-teal-500/60"
                    : "bg-neutral-800 text-neutral-400 border-neutral-600/50 hover:bg-neutral-700")
                }
              >
                Sync
              </button>
              <button
                onClick={() => setKeylock((k) => !k)}
                className={
                  "flex-1 basis-0 min-w-0 h-7 rounded-lg border text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 ease-out active:scale-[0.97] " +
                  (keylock
                    ? "bg-amber-500 text-neutral-950 border-amber-400/40 shadow-[0_0_12px_-1px] shadow-amber-500/60"
                    : "bg-neutral-800 text-neutral-400 border-neutral-600/50 hover:bg-neutral-700")
                }
              >
                Key
              </button>
            </div>

            {/* Pitch fader */}
            <div className="flex-1 min-h-0 flex gap-2 rounded-lg bg-neutral-950/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)] p-1.5 min-w-0">
              <div className="flex-1 basis-0 min-w-0 flex flex-col items-center justify-between">
                <span className="font-mono text-[11px] font-bold tabular-nums text-teal-300 leading-none">
                  {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
                </span>
                <div className="relative flex-1 my-1 w-full flex items-center justify-center">
                  {/* track */}
                  <div className="relative h-full w-1.5 rounded-full bg-neutral-800 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-px bg-teal-400/40" />
                  </div>
                  {/* range input rotated vertical */}
                  <input
                    type="range"
                    min={-8}
                    max={8}
                    step={0.1}
                    value={pitch}
                    onChange={(e) => {
                      setPitch(parseFloat(e.target.value));
                      setSynced(false);
                    }}
                    className="absolute h-full w-6 appearance-none bg-transparent cursor-pointer [writing-mode:vertical-lr] rotate-180 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-neutral-500 [&::-webkit-slider-thumb]:to-neutral-800 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-teal-400/40 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-sm [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-neutral-600"
                  />
                </div>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 leading-none">
                  Pitch
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hot cues + loop controls */}
        <div className="shrink-0 flex gap-2 min-w-0">
          {/* Hot cue pads */}
          <div className="flex-1 basis-0 min-w-0 flex flex-col gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 leading-none px-0.5">
              Hot Cue
            </span>
            <div className="grid grid-cols-4 gap-1">
              {cuePads.map((p, i) => (
                <button
                  key={"cue-" + i}
                  onClick={() => {
                    setPosition((i + 1) * 12.5);
                  }}
                  className="h-7 rounded-md border border-amber-400/20 bg-neutral-800 text-amber-300 text-[11px] font-bold flex items-center justify-center transition-all duration-200 ease-out hover:border-amber-400/50 hover:bg-amber-500/15 hover:scale-[1.03] active:scale-[0.95]"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loop controls */}
          <div className="flex-1 basis-0 min-w-0 flex flex-col gap-1">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-500 leading-none px-0.5">
              Loop
            </span>
            <div className="grid grid-cols-4 gap-1">
              {loopSizes.map((n) => {
                const on = activeLoop === n;
                return (
                  <button
                    key={"loop-" + n}
                    onClick={() => setActiveLoop(on ? null : n)}
                    className={
                      "h-7 rounded-md border text-[10px] font-bold flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.95] " +
                      (on
                        ? "bg-teal-500 text-neutral-950 border-teal-400/40 shadow-[0_0_12px_-1px] shadow-teal-500/60"
                        : "border-teal-400/20 bg-neutral-800 text-teal-300 hover:border-teal-400/50 hover:bg-teal-500/15 hover:scale-[1.03]")
                    }
                  >
                    {n}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="tabular-nums font-mono text-neutral-400">
          {fmtTime(position)}
        </span>
        <div className="flex items-center gap-2 min-w-0">
          {activeLoop != null && (
            <span className="text-teal-300 font-semibold">LOOP {activeLoop}</span>
          )}
          {keylock && <span className="text-amber-300 font-semibold">KEY</span>}
          <span className="tabular-nums font-mono">-{fmtTime(remaining)}</span>
        </div>
      </div>
    </div>
  );
}