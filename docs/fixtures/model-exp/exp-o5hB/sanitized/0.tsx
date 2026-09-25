export default function GeneratedComponent() {
  const DURATION = 245;
  const BASE_BPM = 126.0;

  const [playing, setPlaying] = useState<boolean>(true);
  const [playhead, setPlayhead] = useState<number>(0.18);
  const [pitch, setPitch] = useState<number>(0);
  const [sync, setSync] = useState<boolean>(false);
  const [keylock, setKeylock] = useState<boolean>(true);
  const [loopOn, setLoopOn] = useState<boolean>(false);
  const [loopBeats, setLoopBeats] = useState<number>(4);
  const [cuePoint, setCuePoint] = useState<number>(0.18);
  const [cues, setCues] = useState<(number | null)[]>([0.0, null, 0.52, null]);
  const [angle, setAngle] = useState<number>(0);

  const loopStartRef = useRef<number>(0.18);

  const rate = 1 + pitch / 100;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const r = 1 + pitch / 100;
      setPlayhead((p) => {
        let n = p + (0.05 * r) / DURATION;
        if (loopOn) {
          const len = (loopBeats * 60) / (BASE_BPM * r) / DURATION;
          const start = loopStartRef.current;
          if (n >= start + len) n = start;
        }
        return n >= 1 ? 0 : n;
      });
      setAngle((a) => a + 0.05 * r * 2.1);
    }, 50);
    return () => clearInterval(id);
  }, [playing, pitch, loopOn, loopBeats]);

  const waveData = useMemo<number[]>(() => {
    const n = 220;
    const arr: number[] = [];
    let seed = 1337;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const env =
        0.42 +
        0.33 * Math.sin(t * Math.PI * 3.1) +
        0.16 * Math.sin(t * Math.PI * 9.7 + 1.2);
      const kick = i % 4 === 0 ? 0.26 : 0;
      arr.push(Math.max(0.06, Math.min(1, env * 0.85 + kick + rnd() * 0.22)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo<number[]>(() => {
    const g: number[] = [];
    const step = (16 * 60) / BASE_BPM / DURATION;
    for (let p = 0; p < 1; p += step) g.push(p);
    return g;
  }, []);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const bpmStr = (BASE_BPM * rate).toFixed(1);
  const pitchStr = (pitch >= 0 ? "+" : "") + pitch.toFixed(1);

  const handleCue = () => {
    if (playing) {
      setPlaying(false);
      setPlayhead(cuePoint);
    } else {
      setCuePoint(playhead);
    }
  };

  const handlePad = (i: number) => {
    const c = cues[i];
    if (c == null) {
      setCues((prev) => prev.map((v, idx) => (idx === i ? playhead : v)));
    } else {
      setPlayhead(c);
      loopStartRef.current = c;
      setPlaying(true);
    }
  };

  const handleSync = (on: boolean) => {
    setSync(on);
    if (on) setPitch(1.6);
  };

  const toggleLoop = () => {
    setLoopOn((v) => {
      if (!v) loopStartRef.current = playhead;
      return !v;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      <style>
        {"@keyframes deckSweep{0%{transform:translateX(-140%)}100%{transform:translateX(560%)}}.deck-sweep{animation:deckSweep 3.4s linear infinite}"}
      </style>

      {/* HEADER */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent relative overflow-clip">
        <span
          className={
            "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
            (playing
              ? "bg-lime-400 shadow-lg shadow-lime-400/50 animate-pulse"
              : "bg-stone-600")
          }
        />
        <span className="text-amber-400 text-[11px] leading-none">◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck A
        </span>
        <div className="flex-1 min-w-0" />
        <span
          className={
            "font-mono text-[10px] uppercase tracking-widest transition-all duration-200 ease-out " +
            (sync ? "text-lime-300 animate-pulse" : "text-stone-500")
          }
        >
          {sync ? "phase lock" : "ch 1"}
        </span>
        {playing ? (
          <span className="deck-sweep pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-amber-400/15 to-transparent" />
        ) : null}
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TRACK INFO + BPM */}
        <div className="h-[2.6rem] flex-none flex gap-2">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start justify-center leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">
                  MIDNIGHT TANGERINE
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">
                  Solvent Arc · 7A · 4:05
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[7rem] flex-none">
            <Readout>
              <span className="flex flex-col items-center justify-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpmStr}
                </span>
                <span className="text-[0.48em] uppercase tracking-widest text-stone-500">
                  {sync ? "synced" : "bpm"}
                </span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="flex-1 rounded-xl border border-stone-800/70 bg-stone-950/80 p-1 shadow-none">
          <div className="w-full h-full">
            <Waveform
              data={waveData}
              playhead={playhead}
              beatGrid={beatGrid}
              onScrub={(pos) => {
                setPlayhead(Math.max(0, Math.min(1, pos)));
                loopStartRef.current = Math.max(0, Math.min(1, pos));
              }}
            />
          </div>
        </div>

        {/* JOG + TRANSPORT + PITCH */}
        <div className="h-[9.25rem] flex-none flex gap-2">
          {/* JOG WELL */}
          <div
            className={
              "w-[9.25rem] flex-none rounded-2xl border-2 border-stone-700/80 bg-black/70 p-[0.375rem] shadow-lg shadow-black/50 ring-1 ring-inset transition-all duration-300 ease-out " +
              (playing
                ? "ring-amber-500/30 shadow-amber-500/20"
                : "ring-stone-800/70")
            }
          >
            <div className="w-full h-full">
              <JogWheel
                value={angle}
                onScrub={(delta) => {
                  setAngle((a) => a + delta);
                  setPlayhead((p) => Math.max(0, Math.min(1, p + delta * 0.012)));
                }}
              />
            </div>
          </div>

          {/* TRANSPORT COLUMN */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-[3.25rem] flex-none flex gap-2">
              <div className="flex-[1.35]">
                <ToggleButton on={playing} onChange={(on) => setPlaying(on)}>
                  <span className="flex items-center justify-center gap-[0.35em] font-semibold uppercase tracking-wider">
                    <span>{playing ? "❚❚" : "▶"}</span>
                    <span>{playing ? "PAUSE" : "PLAY"}</span>
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <Button onPress={handleCue}>
                  <span className="flex flex-col items-center justify-center leading-none">
                    <span className="font-semibold uppercase tracking-wider">CUE</span>
                    <span className="text-[0.5em] font-mono uppercase tracking-widest text-stone-500">
                      {fmt(cuePoint * DURATION)}
                    </span>
                  </span>
                </Button>
              </div>
            </div>

            <div className="h-[2.4rem] flex-none flex gap-2">
              <div className="flex-1">
                <ToggleButton on={sync} onChange={handleSync}>
                  <span className="font-semibold uppercase tracking-wider">SYNC</span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <ToggleButton on={keylock} onChange={(on) => setKeylock(on)}>
                  <span className="font-semibold uppercase tracking-wider">KEYLOCK</span>
                </ToggleButton>
              </div>
            </div>

            <div className="flex-1 flex gap-1">
              <div className="flex-1">
                <Button
                  onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}
                >
                  <span className="font-semibold tracking-wider">½</span>
                </Button>
              </div>
              <div className="flex-1">
                <Button onPress={toggleLoop}>
                  <span className="font-semibold uppercase tracking-wider">
                    {loopOn ? "EXIT" : "LOOP"}
                  </span>
                </Button>
              </div>
              <div className="flex-1">
                <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
                  <span className="font-semibold tracking-wider">×2</span>
                </Button>
              </div>
              <div className="w-[4.2rem] flex-none">
                <Readout>
                  <span className="flex flex-col items-center justify-center leading-none">
                    <span
                      className={
                        "font-mono font-bold tracking-tight " +
                        (loopOn ? "text-lime-300" : "text-amber-400")
                      }
                    >
                      {loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats}
                    </span>
                    <span className="text-[0.48em] uppercase tracking-widest text-stone-500">
                      beats
                    </span>
                  </span>
                </Readout>
              </div>
            </div>
          </div>

          {/* PITCH */}
          <div className="w-[3rem] flex-none flex flex-col items-center gap-1 rounded-xl border border-stone-800/70 bg-stone-950/80 py-1.5">
            <span className="text-[9px] font-medium uppercase tracking-widest text-stone-400 leading-none">
              PITCH
            </span>
            <div className="flex-1 w-[1.9rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => {
                  setPitch(v);
                  if (sync) setSync(false);
                }}
                orientation="vertical"
              />
            </div>
            <span
              className={
                "font-mono text-[10px] font-bold leading-none transition-all duration-200 ease-out " +
                (sync ? "text-lime-300" : "text-amber-400")
              }
            >
              {pitchStr}
            </span>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="h-[2.7rem] flex-none grid grid-cols-4 gap-2">
          {cues.map((c, i) => (
            <Pad key={"cue-" + i} active={c != null} onPress={() => handlePad(i)}>
              <span className="flex flex-col items-center justify-center leading-none">
                <span className="font-semibold uppercase tracking-wider">
                  {i + 1}
                </span>
                <span className="text-[0.46em] font-mono uppercase tracking-widest">
                  {c != null ? fmt(c * DURATION) : "set"}
                </span>
              </span>
            </Pad>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center gap-2 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className={playing ? "text-lime-300" : "text-stone-500"}>
          {playing ? "play" : "cue"}
        </span>
        <span className="font-mono text-lime-300">{fmt(playhead * DURATION)}</span>
        <span className="text-stone-700">/</span>
        <span className="font-mono">-{fmt((1 - playhead) * DURATION)}</span>
        <div className="flex-1" />
        <span className={loopOn ? "text-amber-300" : "text-stone-600"}>
          {loopOn ? "loop " + (loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats) : "no loop"}
        </span>
      </div>
    </div>
  );
}