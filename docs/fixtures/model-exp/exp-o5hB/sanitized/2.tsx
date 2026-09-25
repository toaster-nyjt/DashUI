export default function GeneratedComponent() {
  const DURATION = 312;
  const BASE_BPM = 124.0;
  const DECK_A_BPM = 126.4;

  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.182);
  const [jogAngle, setJogAngle] = useState(0);
  const [cuePoint, setCuePoint] = useState(0.182);
  const [cues, setCues] = useState<(number | null)[]>([0.0, 0.244, null, null]);
  const [loopOn, setLoopOn] = useState(false);
  const [loopStart, setLoopStart] = useState(0.182);
  const [loopIdx, setLoopIdx] = useState(3);
  const [lastAction, setLastAction] = useState("TRACK LOADED");

  const LOOP_STEPS = [0.25, 0.5, 1, 2, 4, 8, 16];
  const loopBeats = LOOP_STEPS[loopIdx];

  const rate = 1 + pitch / 100;
  const bpm = BASE_BPM * rate;

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const fmt = (t: number) => {
    const s = Math.max(0, Math.floor(t));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };

  const waveData = useMemo(() => {
    const n = 240;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const env = 0.42 + 0.34 * Math.sin(t * Math.PI * 2.1) + 0.16 * Math.sin(t * Math.PI * 11.3);
      const kick = i % 8 === 0 ? 0.42 : i % 4 === 0 ? 0.18 : 0;
      const grit = 0.14 * Math.abs(Math.sin(i * 1.73));
      const breakdown = t > 0.42 && t < 0.54 ? 0.35 : 1;
      arr.push(Math.max(0.05, Math.min(1, (env + kick + grit) * breakdown)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => Array.from({ length: 33 }, (_, i) => i / 32), []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPlayhead((p) => {
        let np = p + (0.08 * rate) / DURATION;
        if (loopOn) {
          const len = (loopBeats * 60) / bpm / DURATION;
          if (np >= loopStart + len) np = loopStart + ((np - loopStart) % len);
        }
        if (np >= 1) np = 0;
        return np;
      });
      setJogAngle((a) => a + 0.3 * rate);
    }, 80);
    return () => window.clearInterval(id);
  }, [playing, rate, loopOn, loopBeats, loopStart, bpm]);

  const beatPos = (playhead * DURATION * bpm) / 60;
  const beatIndex = Math.floor(beatPos) % 4;

  const handleScrub = (delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => clamp01(p + delta * 0.006));
    setLastAction(delta > 0 ? "SCRUB FWD" : "SCRUB BACK");
  };

  const handleCue = () => {
    if (playing) {
      setPlaying(false);
      setPlayhead(cuePoint);
      setLastAction("CUE — RETURN " + fmt(cuePoint * DURATION));
    } else {
      setCuePoint(playhead);
      setLastAction("CUE SET @ " + fmt(playhead * DURATION));
    }
  };

  const handleSync = (on: boolean) => {
    setSync(on);
    if (on) {
      const p = Math.max(-8, Math.min(8, (DECK_A_BPM / BASE_BPM - 1) * 100));
      setPitch(Math.round(p * 10) / 10);
      setLastAction("SYNC LOCK → DECK A " + DECK_A_BPM.toFixed(1));
    } else {
      setLastAction("SYNC RELEASED");
    }
  };

  const hitCue = (i: number) => {
    setCues((prev) => {
      if (prev[i] === null) {
        const next = prev.slice();
        next[i] = playhead;
        return next;
      }
      return prev;
    });
    const stored = cues[i];
    if (stored !== null) {
      setPlayhead(stored);
      setLastAction("HOT CUE " + (i + 1) + " → " + fmt(stored * DURATION));
    } else {
      setLastAction("HOT CUE " + (i + 1) + " STORED");
    }
  };

  const elapsed = playhead * DURATION;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      <header className="h-8 flex-none px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-2 w-2 rounded-full transition-all duration-200 ease-out " +
              (playing
                ? "bg-violet-400 shadow-lg shadow-violet-500/40 animate-pulse"
                : "bg-stone-700")
            }
          />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
          <span
            className={
              "text-[10px] uppercase tracking-widest transition-all duration-300 ease-out " +
              (sync ? "text-lime-300 animate-pulse" : "text-stone-600")
            }
          >
            {sync ? "locked" : "free"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-stone-500">CH2</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((d) => (
              <span
                key={"ph-" + d}
                className={
                  "h-1.5 rounded-full transition-all duration-100 ease-linear " +
                  (playing && d === beatIndex
                    ? d === 0
                      ? "w-3 bg-lime-400 shadow-md shadow-lime-400/40"
                      : "w-3 bg-violet-400 shadow-md shadow-violet-500/40"
                    : "w-1.5 bg-stone-700")
                }
              />
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-none h-9 flex items-stretch gap-2">
          <div className="flex-1">
            <Readout>
              <div className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">Nocturne Drift</span>
                <span className="text-[0.62em] uppercase tracking-widest text-stone-500">
                  Kaelo Vance · 5A · CH2
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-[6.75rem]">
            <Readout>
              <div className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">bpm</span>
              </div>
            </Readout>
          </div>
        </div>

        <div className="flex-none h-12">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={(p) => {
              setPlayhead(clamp01(p));
              setLastAction("SEEK " + fmt(clamp01(p) * DURATION));
            }}
          />
        </div>

        <div className="flex-1 flex items-stretch gap-2">
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="flex-1">
              <ToggleButton
                on={playing}
                onChange={(v) => {
                  setPlaying(v);
                  setLastAction(v ? "PLAY" : "PAUSE");
                }}
              >
                <span className="flex items-center justify-center gap-1.5 font-semibold uppercase tracking-wider">
                  <svg width="1em" height="1em" viewBox="0 0 12 12" fill="currentColor">
                    {playing ? (
                      <g>
                        <rect x="2" y="1.5" width="3" height="9" rx="0.6" />
                        <rect x="7" y="1.5" width="3" height="9" rx="0.6" />
                      </g>
                    ) : (
                      <path d="M2.5 1.5 L10.5 6 L2.5 10.5 Z" />
                    )}
                  </svg>
                  <span>{playing ? "Pause" : "Play"}</span>
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <Button onPress={handleCue}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                  <span className="text-[0.6em] uppercase tracking-widest opacity-70">
                    {fmt(cuePoint * DURATION)}
                  </span>
                </span>
              </Button>
            </div>
            <div className="flex-1">
              <ToggleButton on={sync} onChange={handleSync}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                  <span className="text-[0.6em] uppercase tracking-widest opacity-70">
                    {sync ? "A " + DECK_A_BPM.toFixed(1) : "free run"}
                  </span>
                </span>
              </ToggleButton>
            </div>
          </div>

          <div className="flex-none h-full aspect-square">
            <JogWheel value={jogAngle} onScrub={handleScrub} />
          </div>

          <div className="w-[5rem] flex flex-col items-center gap-1">
            <div
              className={
                "h-[0.9rem] flex items-center font-mono font-bold tracking-tight text-[11px] transition-all duration-200 ease-out " +
                (sync ? "text-lime-300" : "text-amber-400")
              }
            >
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
            </div>
            <div className="flex-1 w-[2.25rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                orientation="vertical"
                onChange={(v) => {
                  setPitch(Math.round(v * 10) / 10);
                  if (sync) setSync(false);
                  setLastAction("PITCH " + (v >= 0 ? "+" : "") + v.toFixed(1) + "%");
                }}
              />
            </div>
            <div className="w-[4.25rem] h-[1.75rem]">
              <ToggleButton
                on={keylock}
                onChange={(v) => {
                  setKeylock(v);
                  setLastAction(v ? "KEYLOCK ON" : "KEYLOCK OFF");
                }}
              >
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        <div className="flex-none h-[2.6rem] grid grid-cols-4 gap-1.5">
          {cues.map((c, i) => (
            <Pad key={"cue-" + i} active={c !== null} onPress={() => hitCue(i)}>
              <span className="flex flex-col items-center leading-none">
                <span className="font-semibold uppercase tracking-wider">{i + 1}</span>
                <span className="text-[0.58em] uppercase tracking-widest opacity-75">
                  {c !== null ? fmt(c * DURATION) : "set"}
                </span>
              </span>
            </Pad>
          ))}
        </div>

        <div className="flex-none h-8 flex gap-1.5">
          <div className="w-[6.5rem]">
            <Readout>
              <div className="flex items-baseline gap-1 leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (loopOn ? "text-lime-300" : "text-stone-400")
                  }
                >
                  {loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats}
                </span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">beat</span>
              </div>
            </Readout>
          </div>
          <div className="flex-1 h-full">
            <Button
              onPress={() => {
                setLoopIdx((i) => Math.max(0, i - 1));
                setLastAction("LOOP HALVED");
              }}
            >
              <span className="font-semibold uppercase tracking-wider">1/2</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button
              onPress={() => {
                setLoopIdx((i) => Math.min(LOOP_STEPS.length - 1, i + 1));
                setLastAction("LOOP DOUBLED");
              }}
            >
              <span className="font-semibold uppercase tracking-wider">x2</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button
              onPress={() => {
                if (!loopOn) {
                  setLoopStart(playhead);
                  setLoopOn(true);
                  setLastAction("LOOP IN @ " + fmt(playhead * DURATION));
                } else {
                  setLoopOn(false);
                  setLastAction("LOOP EXIT");
                }
              }}
            >
              <span className="font-semibold uppercase tracking-wider">
                {loopOn ? "Exit" : "Loop"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <footer className="h-6 flex-none px-3 flex items-center justify-between gap-2 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="min-w-0 truncate">{lastAction}</span>
        <span className="flex items-center gap-1.5">
          <span
            className={
              "font-mono transition-all duration-100 ease-linear " +
              (playing ? "text-lime-300" : "text-stone-400")
            }
          >
            {fmt(elapsed)}
          </span>
          <span className="text-stone-700">/</span>
          <span className="font-mono text-stone-500">-{fmt(DURATION - elapsed)}</span>
        </span>
      </footer>
    </div>
  );
}