export default function GeneratedComponent() {
  const DURATION = 332;
  const BASE_BPM = 124;
  const TARGET_BPM = 126;
  const LETTERS = ["A", "B", "C", "D"];

  const [playing, setPlaying] = useState(false);
  const [cued, setCued] = useState(true);
  const [position, setPosition] = useState(46.5);
  const [cuePoint, setCuePoint] = useState(32);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [angle, setAngle] = useState(0);
  const [cues, setCues] = useState<(number | null)[]>([16, 78.5, null, 204]);
  const [loopOn, setLoopOn] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopStart, setLoopStart] = useState(0);

  const rate = 1 + pitch / 100;
  const rateRef = useRef(1);
  rateRef.current = rate;
  const loopRef = useRef({ on: false, beats: 4, start: 0 });
  loopRef.current = { on: loopOn, beats: loopBeats, start: loopStart };

  useEffect(() => {
    if (!playing) return;
    const TICK = 70;
    const id = setInterval(() => {
      const r = rateRef.current;
      setPosition((p) => {
        let n = p + (TICK / 1000) * r;
        const lp = loopRef.current;
        if (lp.on) {
          const len = (lp.beats * 60) / (BASE_BPM * r);
          if (n >= lp.start + len) n = lp.start + (n - lp.start - len);
        }
        if (n >= DURATION) n = 0;
        return n;
      });
      setAngle((a) => (a + (TICK / 1000) * r * ((Math.PI * 2) / 1.8)) % (Math.PI * 2));
    }, TICK);
    return () => clearInterval(id);
  }, [playing]);

  const waveData = useMemo(() => {
    const n = 240;
    const out: number[] = [];
    let seed = 20240719;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    for (let i = 0; i < n; i++) {
      const t = i / n;
      let env = 0.32;
      if (t > 0.07) env = 0.55;
      if (t > 0.2) env = 0.9;
      if (t > 0.46) env = 0.42;
      if (t > 0.6) env = 1;
      if (t > 0.87) env = 0.36;
      const beat = 0.55 + 0.45 * Math.abs(Math.sin(t * n * 0.77));
      out.push(Math.max(0.06, Math.min(1, env * beat * (0.68 + 0.5 * rnd()))));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    const step = (16 * 60) / BASE_BPM;
    for (let t = 0; t < DURATION; t += step) g.push(t / DURATION);
    return g;
  }, []);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const fmtBeats = (b: number) => (b < 1 ? (b === 0.5 ? "1/2" : "1/4") : String(b));

  const bpm = (BASE_BPM * rate).toFixed(1);
  const pitchLabel = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";

  const handlePlay = (on: boolean) => {
    setPlaying(on);
    if (on) setCued(false);
  };

  const handleCue = () => {
    if (playing) {
      setPlaying(false);
      setPosition(cuePoint);
      setCued(true);
    } else {
      setCuePoint(position);
      setCued(true);
    }
  };

  const handleSync = (on: boolean) => {
    setSync(on);
    if (on) setPitch(Math.round((TARGET_BPM / BASE_BPM - 1) * 1000) / 10);
  };

  const handlePitch = (v: number) => {
    setPitch(Math.round(v * 10) / 10);
    if (sync) setSync(false);
  };

  const handleScrub = (delta: number) => {
    setAngle((a) => (a + delta * Math.PI * 2 + Math.PI * 2) % (Math.PI * 2));
    setPosition((p) => Math.max(0, Math.min(DURATION, p + delta * 1.8)));
  };

  const hitCue = (i: number) => {
    const c = cues[i];
    if (c === null) {
      setCues((prev) => prev.map((v, j) => (j === i ? position : v)));
    } else {
      setPosition(c);
    }
  };

  const status = playing ? "Playing" : cued ? "Cued" : "Paused";
  const statusClass = playing
    ? "text-lime-300 animate-pulse"
    : cued
    ? "text-amber-300"
    : "text-stone-500";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none font-sans bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* HEADER */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[11px] leading-none transition-all duration-200">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck A
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase tracking-widest text-stone-500 truncate">Ch 1</span>
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
              (playing
                ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse"
                : "bg-stone-700")
            }
          />
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-1.5 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TRACK INFO + BPM */}
        <div className="flex gap-1.5 h-11">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col gap-[0.18em]">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Tangerine</span>
                <span className="text-[0.6em] font-medium uppercase tracking-widest text-stone-400">
                  Velvet Circuit
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.5rem]">
            <Readout>
              <span className="flex flex-col items-center gap-[0.12em]">
                <span
                  className={
                    "font-mono font-bold tracking-tight transition-all duration-300 ease-out " +
                    (sync ? "text-lime-300 animate-pulse" : "text-amber-400")
                  }
                >
                  {bpm}
                </span>
                <span className="text-[0.45em] font-medium uppercase tracking-widest text-stone-500">
                  {sync ? "Bpm · lock" : "Bpm"}
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="h-10 w-full">
          <Waveform
            data={waveData}
            playhead={Math.max(0, Math.min(1, position / DURATION))}
            beatGrid={beatGrid}
            zoom={0.68}
            onScrub={(p) => setPosition(Math.max(0, Math.min(1, p)) * DURATION)}
          />
        </div>

        {/* TRANSPORT / JOG / PITCH */}
        <div className="flex-1 flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <div className="flex-[1.2]">
              <ToggleButton on={playing} onChange={handlePlay}>
                <span className="flex items-center gap-[0.45em]">
                  <svg width="1em" height="1em" viewBox="0 0 12 12" fill="currentColor">
                    {playing ? (
                      <g>
                        <rect x="2" y="1.5" width="3" height="9" rx="0.6" />
                        <rect x="7" y="1.5" width="3" height="9" rx="0.6" />
                      </g>
                    ) : (
                      <path d="M2.5 1.4 L10.4 6 L2.5 10.6 Z" />
                    )}
                  </svg>
                  <span className="font-semibold uppercase tracking-wider">
                    {playing ? "Pause" : "Play"}
                  </span>
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <Button onPress={handleCue}>
                <span className="flex items-center gap-[0.45em]">
                  <svg width="1em" height="1em" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="6" cy="6" r="3.2" />
                  </svg>
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </span>
              </Button>
            </div>
            <div className="flex-1 flex gap-1">
              <div className="flex-1">
                <ToggleButton on={sync} onChange={handleSync}>
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-semibold uppercase tracking-wider">Key</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          <div className="relative h-full aspect-square">
            <div
              className={
                "pointer-events-none absolute inset-6 rounded-full blur-xl transition-all duration-500 ease-out " +
                (playing ? "bg-amber-500/25" : "bg-amber-500/5")
              }
            />
            <div className="relative h-full w-full">
              <JogWheel value={angle} onScrub={handleScrub} />
            </div>
          </div>

          <div className="w-[4rem] flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
              Pitch
            </span>
            <div className="w-7 flex-1">
              <Fader min={-8} max={8} value={pitch} onChange={handlePitch} orientation="vertical" />
            </div>
            <span
              className={
                "font-mono font-bold tracking-tight text-[11px] leading-none transition-all duration-200 ease-out " +
                (sync ? "text-lime-300" : pitch === 0 ? "text-stone-400" : "text-amber-400")
              }
            >
              {pitchLabel}
            </span>
          </div>
        </div>

        {/* SECTION RULE */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
            Hot Cues
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-amber-500/35 via-amber-500/10 to-transparent" />
          <span className="text-[10px] uppercase tracking-widest leading-none text-stone-600">
            Tap · Set / Jump
          </span>
        </div>

        {/* HOT CUE PADS */}
        <div className="flex gap-1.5 h-11">
          {cues.map((c, i) => (
            <div key={"cue-" + i} className="flex-1">
              <Pad onPress={() => hitCue(i)} active={c !== null}>
                <span className="flex flex-col items-center gap-[0.14em]">
                  <span className="font-semibold uppercase tracking-wider">{LETTERS[i]}</span>
                  <span className="text-[0.55em] font-medium uppercase tracking-widest opacity-70">
                    {c !== null ? fmtTime(c) : "Set"}
                  </span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* LOOP CONTROLS */}
        <div className="flex gap-1.5 h-8">
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">÷2</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button
              onPress={() => {
                setLoopStart(position);
                setLoopOn(true);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">In</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopOn(false)}>
              <span className="font-semibold uppercase tracking-wider">Out</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
          <div className="flex-[1.6]">
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight transition-all duration-200 ease-out " +
                  (loopOn ? "text-lime-300 animate-pulse" : "text-stone-500")
                }
              >
                {(loopOn ? "⟲ " : "") + fmtBeats(loopBeats) + " BEAT"}
              </span>
            </Readout>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500 truncate">
          Deck A ▸ Ch 1 {keylock ? "· Keylock" : ""}
        </span>
        <span
          className={
            "text-[10px] uppercase tracking-widest transition-all duration-200 ease-out " + statusClass
          }
        >
          {status}
        </span>
      </div>
    </div>
  );
}