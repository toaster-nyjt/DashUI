export default function GeneratedComponent() {
  const BASE_BPM = 128;
  const DURATION = 272; // seconds
  const DECK_B_BPM = 124.6;
  const TITLE = "MIDNIGHT TANGERINE";
  const ARTIST = "KOVA / NEON RITUAL EP";

  const [playing, setPlaying] = useState<boolean>(false);
  const [pos, setPos] = useState<number>(0.118);
  const [pitch, setPitch] = useState<number>(0);
  const [sync, setSync] = useState<boolean>(false);
  const [keylock, setKeylock] = useState<boolean>(true);
  const [angle, setAngle] = useState<number>(0);
  const [cuePoint, setCuePoint] = useState<number>(0.118);
  const [cues, setCues] = useState<(number | null)[]>([0.021, 0.27, null, 0.63]);
  const [loopBeats, setLoopBeats] = useState<number>(4);
  const [loopActive, setLoopActive] = useState<boolean>(false);
  const [loopStart, setLoopStart] = useState<number>(0.118);

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  const wave = useMemo<number[]>(() => {
    let s = 20240516;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) % 4294967296;
      return s / 4294967296;
    };
    return Array.from({ length: 196 }, (_, i) => {
      const t = i / 196;
      const env = 0.32 + 0.68 * Math.abs(Math.sin(t * Math.PI * 2.4 + 0.4));
      const kick = i % 8 < 2 ? 1 : 0.6;
      const drop = t > 0.52 && t < 0.58 ? 0.2 : 1;
      return Math.max(0.06, Math.min(1, (0.3 + rnd() * 0.7) * env * kick * drop));
    });
  }, []);

  const beatGrid = useMemo<number[]>(
    () => Array.from({ length: 33 }, (_, i) => i / 32),
    []
  );

  const effBpm = BASE_BPM * (1 + pitch / 100);
  const elapsed = pos * DURATION;
  const remaining = Math.max(0, DURATION - elapsed);
  const beatPhase = (((elapsed * effBpm) / 60) % 1 + 1) % 1;

  useEffect(() => {
    if (!playing) return;
    const rate = 1 + pitch / 100;
    const loopLen = (loopBeats * (60 / (BASE_BPM * rate))) / DURATION;
    const id = window.setInterval(() => {
      setPos((p) => {
        let n = p + (0.06 * rate) / DURATION;
        if (loopActive && loopLen > 0 && n >= loopStart + loopLen) {
          n = loopStart + ((n - loopStart) % loopLen);
        }
        if (n >= 1) n = 0;
        return n;
      });
      setAngle((a) => a + 0.24 * rate);
    }, 60);
    return () => window.clearInterval(id);
  }, [playing, pitch, loopActive, loopStart, loopBeats]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + String(sec).padStart(2, "0");
  };

  const handleCue = () => {
    if (playing) {
      setPlaying(false);
      setPos(cuePoint);
    } else {
      setCuePoint(pos);
    }
  };

  const handleSync = (v: boolean) => {
    setSync(v);
    if (v) {
      const target = (DECK_B_BPM / BASE_BPM - 1) * 100;
      setPitch(Math.max(-8, Math.min(8, target)));
    }
  };

  const handlePitch = (v: number) => {
    setPitch(v);
    if (sync) setSync(false);
  };

  const handleJog = (d: number) => {
    setAngle((a) => a + d);
    setPos((p) => clamp01(p + ((d / (Math.PI * 2)) * 1.8) / DURATION));
  };

  const hitCue = (i: number) => {
    const c = cues[i];
    if (c === null || c === undefined) {
      const next = cues.slice();
      next[i] = pos;
      setCues(next);
    } else {
      setPos(c);
    }
  };

  const loopLabel =
    loopBeats < 1 ? (loopBeats === 0.5 ? "1/2" : "1/4") : String(loopBeats);
  const pitchStr = (pitch >= 0 ? "+" : "") + pitch.toFixed(2) + "%";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100 select-none">
      <style>
        {"@keyframes ndSheen{0%{transform:translateX(-140%)}55%{transform:translateX(320%)}100%{transform:translateX(320%)}}"}
      </style>

      {/* HEADER */}
      <div className="relative flex-none h-8 px-3 flex items-center justify-between overflow-clip border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
          style={{ animation: "ndSheen 5.5s ease-in-out infinite" }}
        />
        <div className="relative flex items-center gap-2">
          <span
            className="text-amber-400 text-[11px] leading-none transition-all duration-100 ease-linear"
            style={{
              transform: "scale(" + (playing ? 1 + 0.55 * (1 - beatPhase) : 1) + ")",
              opacity: playing ? 0.55 + 0.45 * (1 - beatPhase) : 0.8,
            }}
          >
            ◆
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-stone-200">
            Deck A
          </span>
          <span className="text-[10px] uppercase tracking-widest text-stone-600">/ CH 1</span>
        </div>
        <span
          className={
            "relative flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 ease-out " +
            (playing
              ? "border-lime-400/40 bg-lime-400/10 text-lime-300 shadow-lg shadow-lime-400/20"
              : "border-amber-500/30 bg-amber-500/5 text-amber-400")
          }
        >
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 " +
              (playing ? "bg-lime-400 animate-pulse" : "bg-amber-400")
            }
          />
          {playing ? "Playing" : "Cued"}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-1.5 p-2">
        {/* TRACK INFO / BPM / SYNC */}
        <div className="h-[2.6rem] flex items-stretch gap-1.5">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start gap-[0.12em]">
                <span className="font-semibold uppercase tracking-wide text-stone-100">
                  {TITLE}
                </span>
                <span className="text-[0.6em] font-normal uppercase tracking-[0.25em] text-stone-500">
                  {ARTIST}
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[5.5rem]">
            <Readout>
              <span className="flex flex-col items-center gap-[0.1em]">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {effBpm.toFixed(1)}
                </span>
                <span className="text-[0.36em] font-medium uppercase tracking-[0.4em] text-stone-500">
                  BPM
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[3.6rem]">
            <ToggleButton on={sync} onChange={handleSync}>
              <span className="font-semibold uppercase tracking-[0.18em]">Sync</span>
            </ToggleButton>
          </div>
        </div>

        {/* WAVEFORM STRIP */}
        <div className="h-[2.4rem] w-full">
          <Waveform
            data={wave}
            playhead={pos}
            beatGrid={beatGrid}
            zoom={0.65}
            onScrub={(p) => setPos(clamp01(p))}
          />
        </div>

        {/* TRANSPORT / JOG / PITCH */}
        <div className="flex-1 flex items-stretch gap-1.5">
          {/* transport */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-[2.5rem]">
              <Button onPress={handleCue}>
                <span className="font-semibold uppercase tracking-[0.3em]">Cue</span>
              </Button>
            </div>
            <div className="flex-1">
              <ToggleButton on={playing} onChange={(v) => setPlaying(v)}>
                <span className="flex flex-col items-center gap-[0.14em]">
                  <svg
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="block"
                  >
                    {playing ? (
                      <g>
                        <rect x="6" y="4" width="4.2" height="16" rx="1.2" />
                        <rect x="13.8" y="4" width="4.2" height="16" rx="1.2" />
                      </g>
                    ) : (
                      <path d="M7.5 4.6l12 7.4-12 7.4z" />
                    )}
                  </svg>
                  <span className="text-[0.34em] font-semibold uppercase tracking-[0.42em]">
                    {playing ? "Pause" : "Play"}
                  </span>
                </span>
              </ToggleButton>
            </div>
          </div>

          {/* jog wheel */}
          <div className="relative h-full aspect-square">
            <div
              className="pointer-events-none absolute inset-[10%] rounded-full bg-amber-500/25 blur-2xl transition-opacity duration-150 ease-linear"
              style={{ opacity: playing ? 0.25 + 0.45 * (1 - beatPhase) : 0.1 }}
            />
            <div className="relative h-full w-full">
              <JogWheel value={angle} onScrub={handleJog} />
            </div>
          </div>

          {/* keylock + pitch */}
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-[1.7rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-[0.15em]">Keylock</span>
              </ToggleButton>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
                Pitch
              </span>
              <span
                className={
                  "font-mono text-[11px] font-bold leading-none tracking-tight transition-colors duration-200 ease-out " +
                  (sync ? "text-lime-300 animate-pulse" : "text-amber-400")
                }
              >
                {pitchStr}
              </span>
            </div>
            <div className="flex flex-1 items-stretch justify-center gap-1.5">
              <div className="flex h-full flex-col justify-between py-[0.15rem] text-right">
                {["+8", "+4", "0", "-4", "-8"].map((t) => (
                  <span
                    key={"tick-" + t}
                    className="font-mono text-[8px] leading-none text-stone-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="h-full w-[2.1rem]">
                <Fader
                  orientation="vertical"
                  min={-8}
                  max={8}
                  value={pitch}
                  onChange={handlePitch}
                />
              </div>
              <div className="flex h-full flex-col justify-between py-[0.15rem]">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <span
                    key={"dash-" + i}
                    className={
                      "h-px transition-all duration-200 ease-out " +
                      (i % 2 === 0 ? "w-2.5 bg-amber-500/40" : "w-1.5 bg-stone-700/70")
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="h-[2.5rem] flex items-stretch gap-1.5">
          <div className="w-[2.6rem] flex flex-col justify-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
              Cues
            </span>
            <span className="h-px w-full bg-gradient-to-r from-amber-500/50 to-transparent" />
          </div>
          {[0, 1, 2, 3].map((i) => (
            <div key={"pad-" + i} className="flex-1 h-full">
              <Pad onPress={() => hitCue(i)} active={cues[i] !== null && cues[i] !== undefined}>
                <span className="font-semibold tracking-[0.2em]">{i + 1}</span>
              </Pad>
            </div>
          ))}
        </div>

        {/* LOOP */}
        <div className="h-[2rem] flex items-stretch gap-1.5">
          <div className="w-[2.6rem] flex flex-col justify-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
              Loop
            </span>
            <span className="h-px w-full bg-gradient-to-r from-violet-500/50 to-transparent" />
          </div>
          <div className="w-[2.8rem]">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="w-[3rem]">
            <Button
              onPress={() => {
                setLoopStart(pos);
                setLoopActive(true);
              }}
            >
              <span className="font-semibold uppercase tracking-[0.2em]">In</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight " +
                  (loopActive ? "text-lime-300" : "text-stone-500")
                }
              >
                {loopActive ? loopLabel + " BEAT" : "OFF"}
              </span>
            </Readout>
          </div>
          <div className="w-[3.4rem]">
            <Button onPress={() => setLoopActive(false)}>
              <span className="font-semibold uppercase tracking-[0.2em]">Exit</span>
            </Button>
          </div>
          <div className="w-[2.8rem]">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold tracking-wider">×2</span>
            </Button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="flex items-center gap-1.5">
          Elapsed
          <span className="font-mono tracking-tight text-lime-300">{fmt(elapsed)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          Rem
          <span className="font-mono tracking-tight text-stone-400">-{fmt(remaining)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
              (playing ? "bg-lime-400 animate-pulse" : "bg-stone-700")
            }
          />
          CH1 ▸ Mix
        </span>
      </div>
    </div>
  );
}