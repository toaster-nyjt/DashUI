export default function GeneratedComponent() {
  const TRACK_SECS = 245;

  const wave = useMemo(() => {
    const n = 220;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const env =
        0.35 +
        0.45 * Math.abs(Math.sin(t * Math.PI * 3.1)) +
        0.2 * Math.abs(Math.sin(t * Math.PI * 17));
      const kick = i % 8 === 0 ? 0.35 : 0;
      out.push(Math.min(1, env + kick * (0.6 + 0.4 * Math.sin(i))));
    }
    return out;
  }, []);

  const beatGrid = useMemo(
    () => Array.from({ length: 33 }, (_, i) => i / 32),
    []
  );

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.08);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [angle, setAngle] = useState(0);
  const [loopOn, setLoopOn] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [cuePoint, setCuePoint] = useState(0.08);

  const [cues, setCues] = useState([
    { id: "A", pos: 0.08, set: true },
    { id: "B", pos: 0.31, set: true },
    { id: "C", pos: 0.57, set: false },
    { id: "D", pos: 0.79, set: false },
  ]);

  const baseBpm = 124.0;
  const bpm = baseBpm * (1 + pitch / 100);
  const rate = 1 + pitch / 100;

  const loopStart = useRef(0.08);
  const loopSpan = (loopBeats * (60 / bpm)) / TRACK_SECS;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let n = p + (0.06 * rate) / TRACK_SECS;
        if (loopOn && n > loopStart.current + loopSpan) n = loopStart.current;
        if (n >= 1) n = 0;
        return n;
      });
    }, 60);
    return () => clearInterval(id);
  }, [playing, rate, loopOn, loopSpan]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setAngle((a) => a + 0.16 * rate), 60);
    return () => clearInterval(id);
  }, [playing, rate]);

  const fmt = (v: number) => {
    const s = Math.max(0, Math.floor(v * TRACK_SECS));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  };

  const handleScrub = (d: number) => {
    setAngle((a) => a + d);
    setPlayhead((p) => Math.min(0.999, Math.max(0, p + d * 0.012)));
  };

  const hitCue = (i: number) => {
    setCues((prev) => {
      const next = prev.map((c, idx) =>
        idx === i && !c.set ? { ...c, pos: playhead, set: true } : c
      );
      return next;
    });
    const c = cues[i];
    if (c.set) setPlayhead(c.pos);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans">
      {/* HEADER */}
      <div className="h-8 flex-none px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2">
          <span
            className={
              "h-1.5 w-1.5 rounded-full bg-amber-400 transition-all duration-200 ease-out " +
              (playing ? "animate-pulse shadow-lg shadow-amber-500/40" : "opacity-50")
            }
          />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Deck A
          </span>
        </div>
        <span
          className={
            "font-medium uppercase tracking-widest text-[10px] transition-all duration-200 ease-out " +
            (sync ? "text-lime-300 animate-pulse" : "text-stone-500")
          }
        >
          {sync ? "Phase Lock" : "Channel 1"}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col justify-between gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TRACK INFO + BPM */}
        <div className="flex items-stretch gap-2 h-[2.5rem]">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">
                  MIDNIGHT TRANSIT
                </span>
                <span className="text-[0.7em] uppercase tracking-widest text-stone-400">
                  Kaelo Vance — 7A
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.5rem] h-full">
            <Readout>
              <span className="flex flex-col items-center leading-tight">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">
                  BPM
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="h-[3.25rem] w-full rounded-xl border border-stone-800/70 bg-stone-950/80 p-1">
          <div className="h-full w-full">
            <Waveform
              data={wave}
              playhead={playhead}
              beatGrid={beatGrid}
              zoom={0.55}
              onScrub={(p) => setPlayhead(Math.min(0.999, Math.max(0, p)))}
            />
          </div>
        </div>

        {/* JOG + TRANSPORT + PITCH */}
        <div className="flex items-stretch gap-2 h-[8rem]">
          <div className="h-[8rem] w-[8rem] rounded-full">
            <JogWheel value={angle} onScrub={handleScrub} />
          </div>

          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="font-semibold uppercase tracking-wider">
                {playing ? "▮▮ Pause" : "▶ Play"}
              </span>
            </ToggleButton>
            <Button
              onPress={() => {
                setPlayhead(cuePoint);
                setPlaying(false);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">Cue</span>
            </Button>
            <ToggleButton
              on={sync}
              onChange={(v) => {
                setSync(v);
                if (v) setPitch(0);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Key</span>
            </ToggleButton>
          </div>

          <div className="flex flex-col items-center gap-1 w-[2.75rem]">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
              {pitch > 0 ? "+" + pitch.toFixed(1) : pitch.toFixed(1)}
            </span>
            <div className="h-[6.75rem] w-[2rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => {
                  setPitch(v);
                  if (v !== 0) setSync(false);
                }}
                orientation="vertical"
              />
            </div>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="grid grid-cols-4 gap-2 h-[2.75rem]">
          {cues.map((c, i) => (
            <Pad key={c.id} active={c.set} onPress={() => hitCue(i)}>
              <span className="flex flex-col items-center leading-none">
                <span className="font-semibold uppercase tracking-wider">{c.id}</span>
                <span className="text-[0.62em] tracking-widest text-stone-500">
                  {c.set ? fmt(c.pos) : "SET"}
                </span>
              </span>
            </Pad>
          ))}
        </div>

        {/* LOOP CONTROLS */}
        <div className="flex items-stretch gap-2 h-[2rem]">
          <div className="w-[5.5rem] h-full">
            <Readout>
              <span
                className={
                  "font-mono font-bold tracking-tight " +
                  (loopOn ? "text-lime-300" : "text-stone-400")
                }
              >
                {loopBeats + " BT"}
              </span>
            </Readout>
          </div>
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
          <div className="flex-[1.6] h-full">
            <Button
              onPress={() => {
                loopStart.current = playhead;
                setCuePoint(playhead);
                setLoopOn((l) => !l);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">
                {loopOn ? "Exit" : "Loop"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          {keylock ? "Keylock On" : "Keylock Off"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-lime-300">
          {fmt(playhead)} / {fmt(1)}
        </span>
      </div>
    </div>
  );
}