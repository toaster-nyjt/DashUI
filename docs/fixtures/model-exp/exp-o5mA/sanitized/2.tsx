export default function GeneratedComponent() {
  const TRACK_LEN = 312; // seconds
  const BASE_BPM = 124.0;

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18);
  const [angle, setAngle] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [syncOn, setSyncOn] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopStart, setLoopStart] = useState(0.18);
  const [beats, setBeats] = useState(4);
  const [lastPad, setLastPad] = useState<number | null>(null);

  const wave = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) => {
        const t = i / 200;
        const env = 0.3 + 0.7 * Math.abs(Math.sin(t * Math.PI * 2.4 + 0.4));
        const grit = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.61));
        const micro = 0.75 + 0.25 * Math.sin(i * 0.43);
        return Math.max(0.07, Math.min(1, env * grit * micro));
      }),
    []
  );
  const grid = useMemo(() => Array.from({ length: 41 }, (_, i) => i / 40), []);
  const cues = useMemo(
    () => [
      { id: 1, pos: 0.06, name: "INTRO" },
      { id: 2, pos: 0.31, name: "DROP" },
      { id: 3, pos: 0.58, name: "BREAK" },
      { id: 4, pos: 0.81, name: "OUTRO" },
    ],
    []
  );

  const bpm = BASE_BPM * (1 + pitch / 100);
  const loopLen = (beats * (60 / bpm)) / TRACK_LEN;

  useEffect(() => {
    if (!playing) return;
    const step = 0.08 / TRACK_LEN;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let n = p + step;
        if (loopOn && n >= loopStart + loopLen) n = loopStart;
        if (n >= 1) n = 0;
        return n;
      });
      setAngle((a) => a + 0.11);
    }, 80);
    return () => clearInterval(id);
  }, [playing, loopOn, loopStart, loopLen]);

  const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" + r : r);
  };
  const elapsed = playhead * TRACK_LEN;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* HEADER */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "text-violet-400 text-[11px] transition-all duration-300 " +
              (playing ? "animate-pulse drop-shadow-[0_0_6px_rgba(167,139,250,0.9)]" : "opacity-60")
            }
          >
            ◆
          </span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <span
          className={
            "font-medium uppercase tracking-widest text-[10px] transition-all duration-300 " +
            (syncOn ? "text-lime-300 animate-pulse" : "text-stone-500")
          }
        >
          {syncOn ? "Sync Lock" : "Free"}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TRACK INFO + BPM */}
        <div className="flex gap-2 items-stretch">
          <div className="flex-1 h-[2.5rem]">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">Midnight Protocol</span>
                <span className="text-[0.66em] tracking-widest uppercase text-stone-400">
                  Velvet Acid · 7A
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.5rem] h-[2.5rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (syncOn ? "text-lime-300" : "text-violet-300")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">bpm</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="h-[2.9rem] w-full">
          <Waveform
            data={wave}
            playhead={playhead}
            beatGrid={grid}
            zoom={0.55}
            onScrub={(p) => setPlayhead(clamp(p))}
          />
        </div>

        {/* MAIN: JOG / TRANSPORT / PITCH */}
        <div className="flex-1 flex gap-2 items-stretch">
          <div className="h-full aspect-square">
            <JogWheel
              value={angle}
              onScrub={(d) => {
                setAngle((a) => a + d);
                setPlayhead((p) => clamp(p + d * 0.006));
              }}
            />
          </div>

          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 content-center">
            <div className="w-full h-[2.2rem]">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">
                  {playing ? "Pause" : "Play"}
                </span>
              </ToggleButton>
            </div>
            <div className="w-full h-[2.2rem]">
              <Button
                onPress={() => {
                  setPlaying(false);
                  setPlayhead(cues[0].pos);
                  setLastPad(null);
                }}
              >
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </Button>
            </div>
            <div className="w-full h-[2.2rem]">
              <ToggleButton
                on={syncOn}
                onChange={(v) => {
                  setSyncOn(v);
                  if (v) setPitch(0);
                }}
              >
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
            <div className="w-full h-[2.2rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
              Pit
            </span>
            <div className="w-[1.9rem] h-[6.4rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                orientation="vertical"
                onChange={(v) => {
                  setPitch(v);
                  if (v !== 0) setSyncOn(false);
                }}
              />
            </div>
            <span
              className={
                "font-mono font-bold text-[10px] leading-none transition-all duration-200 " +
                (pitch === 0 ? "text-stone-400" : "text-violet-300")
              }
            >
              {(pitch > 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="grid grid-cols-4 gap-2">
          {cues.map((c) => (
            <div key={"cue-" + c.id} className="w-full h-[2.6rem]">
              <Pad
                active={lastPad === c.id}
                onPress={() => {
                  setPlayhead(c.pos);
                  setLastPad(c.id);
                  setLoopStart(c.pos);
                }}
              >
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">{c.id}</span>
                  <span className="text-[0.6em] uppercase tracking-widest opacity-70">{c.name}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* LOOP CONTROLS */}
        <div className="flex gap-2 items-stretch">
          <div className="flex-1 h-[1.95rem]">
            <Button
              onPress={() => {
                setLoopStart(playhead);
                setLoopOn(true);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">In</span>
            </Button>
          </div>
          <div className="flex-1 h-[1.95rem]">
            <Button onPress={() => setLoopOn(false)}>
              <span className="font-semibold uppercase tracking-wider">Out</span>
            </Button>
          </div>
          <div className="flex-[1.5] h-[1.95rem]">
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight " +
                  (loopOn ? "text-lime-300 animate-pulse" : "text-stone-500")
                }
              >
                {beats >= 1 ? beats + " BT" : "1/" + Math.round(1 / beats)}
              </span>
            </Readout>
          </div>
          <div className="flex-1 h-[1.95rem]">
            <Button onPress={() => setBeats((b) => (b > 0.125 ? b / 2 : b))}>
              <span className="font-semibold uppercase tracking-wider">÷2</span>
            </Button>
          </div>
          <div className="flex-1 h-[1.95rem]">
            <Button onPress={() => setBeats((b) => (b < 32 ? b * 2 : b))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="truncate">
          CH2 · <span className="text-lime-300 font-mono">{fmt(elapsed)}</span>
        </span>
        <span className="truncate">
          -<span className="text-lime-300 font-mono">{fmt(TRACK_LEN - elapsed)}</span>
          <span className={"ml-2 " + (loopOn ? "text-lime-300" : "text-stone-600")}>loop</span>
        </span>
      </div>
    </div>
  );
}