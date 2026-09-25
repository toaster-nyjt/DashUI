export default function GeneratedComponent() {
  const DURATION = 312;
  const BASE_BPM = 124.0;
  const MASTER_BPM = 126.4;

  const [playing, setPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0.18);
  const [pitch, setPitch] = useState<number>(0);
  const [sync, setSync] = useState<boolean>(false);
  const [keylock, setKeylock] = useState<boolean>(true);
  const [jog, setJog] = useState<number>(0);
  const [cuePoint, setCuePoint] = useState<number>(0.18);
  const [cues, setCues] = useState<(number | null)[]>([0.06, 0.34, null, null]);
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [loopOn, setLoopOn] = useState<boolean>(false);
  const [loopBeats, setLoopBeats] = useState<number>(4);
  const loopStartRef = useRef<number>(0.18);

  const bpm = BASE_BPM * (1 + pitch / 100);

  const wave = useMemo<number[]>(() => {
    const arr: number[] = [];
    for (let i = 0; i < 256; i++) {
      const t = i / 256;
      const build = t > 0.52 && t < 0.86 ? 0.28 : 0;
      const env = 0.3 + 0.6 * Math.abs(Math.sin(t * Math.PI * 1.35)) + build;
      const grain = 0.5 + 0.5 * Math.sin(i * 2.71) * Math.cos(i * 0.93);
      const kick = i % 4 === 0 ? 0.3 : 0;
      arr.push(Math.max(0.06, Math.min(1, env * (0.45 + 0.55 * grain) + kick)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo<number[]>(() => {
    const g: number[] = [];
    const bar = (4 * 60) / BASE_BPM / DURATION;
    for (let p = 0; p < 1; p += bar) g.push(p);
    return g;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const step = 70;
    const bpmNow = BASE_BPM * (1 + pitch / 100);
    const loopLen = ((loopBeats * 60) / bpmNow) / DURATION;
    const id = setInterval(() => {
      setPosition((p) => {
        let n = p + (step / 1000 / DURATION) * (1 + pitch / 100);
        if (loopOn && n >= loopStartRef.current + loopLen) n = loopStartRef.current;
        if (n >= 1) n = 0;
        return n;
      });
      setJog((a) => a + 0.24 * (1 + pitch / 100));
    }, step);
    return () => clearInterval(id);
  }, [playing, pitch, loopOn, loopBeats]);

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const handleCue = () => {
    if (playing) {
      setPlaying(false);
      setPosition(cuePoint);
    } else {
      setCuePoint(position);
    }
  };

  const handleScrub = (d: number) => {
    setJog((a) => a + d);
    setPosition((p) => clamp01(p + d * 0.004));
  };

  const hitPad = (i: number) => {
    const c = cues[i];
    if (c == null) {
      setCues((prev) => {
        const n = prev.slice();
        n[i] = position;
        return n;
      });
      setActiveCue(i);
    } else {
      setPosition(c);
      setActiveCue(i);
      if (!playing) setPlaying(true);
    }
  };

  const toggleSync = (on: boolean) => {
    setSync(on);
    if (on) setPitch(Math.max(-8, Math.min(8, (MASTER_BPM / BASE_BPM - 1) * 100)));
  };

  const fmtBeats = (b: number) => (b < 1 ? (b === 0.5 ? "1/2" : "1/4") : String(b));
  const pitchStr = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* HEADER */}
      <div className="h-8 flex-none flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-1.5 w-1.5 rounded-full bg-violet-400 shadow-lg shadow-violet-500/50 transition-all duration-200 ease-out " +
              (playing ? "animate-pulse" : "opacity-60")
            }
          />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <span
          className={
            "font-mono uppercase tracking-widest text-[10px] transition-all duration-300 ease-out " +
            (sync ? "text-lime-300 animate-pulse" : "text-stone-600")
          }
        >
          {sync ? "sync lock" : "free run"}
        </span>
      </div>

      {/* BODY */}
      <div className="relative flex-1 flex flex-col gap-2 p-2">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(139,92,246,0.10),transparent_70%)]" />

        {/* TRACK INFO + BPM */}
        <div className="relative h-[2.75rem] flex gap-2">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">NOCTURNAL SIGNAL</span>
                <span className="text-[0.62em] uppercase tracking-widest text-stone-400">
                  Velvet Acid · Remaster
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.75rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight transition-colors duration-300 ease-out " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.42em] uppercase tracking-widest text-stone-500">bpm</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM STRIP */}
        <div className="relative h-[3rem] w-full">
          <Waveform
            data={wave}
            playhead={position}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={(p: number) => setPosition(clamp01(p))}
          />
        </div>

        {/* TRANSPORT / JOG / PITCH */}
        <div className="relative flex-1 flex gap-2">
          {/* transport */}
          <div className="w-[6.4rem] flex flex-col gap-1.5">
            <div className="flex-1">
              <ToggleButton on={playing} onChange={(v: boolean) => setPlaying(v)}>
                <span className="font-semibold uppercase tracking-wider">
                  {playing ? "❚❚ pause" : "▶ play"}
                </span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <Button onPress={handleCue}>
                <span className="font-semibold uppercase tracking-wider">cue</span>
              </Button>
            </div>
            <div className="h-[1.9rem] grid grid-cols-2 gap-1.5">
              <ToggleButton on={sync} onChange={toggleSync}>
                <span className="font-semibold uppercase tracking-wider">sync</span>
              </ToggleButton>
              <ToggleButton on={keylock} onChange={(v: boolean) => setKeylock(v)}>
                <span className="font-semibold uppercase tracking-wider">key</span>
              </ToggleButton>
            </div>
          </div>

          {/* jog */}
          <div className="relative flex-1 flex items-center justify-center">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={
                  "h-[88%] aspect-square rounded-full blur-2xl transition-all duration-500 ease-out " +
                  (playing ? "bg-violet-600/30 scale-105" : "bg-violet-900/15 scale-95")
                }
              />
            </div>
            <div className="relative h-full aspect-square">
              <JogWheel value={jog} onScrub={handleScrub} />
            </div>
          </div>

          {/* pitch */}
          <div className="w-[3.4rem] flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">
              pitch
            </span>
            <div className="flex-1 w-[1.9rem] flex justify-center">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                orientation="vertical"
                onChange={(v: number) => {
                  setPitch(v);
                  setSync(false);
                }}
              />
            </div>
            <span
              className={
                "font-mono font-bold tracking-tight text-[10px] leading-none transition-colors duration-200 ease-out " +
                (sync ? "text-lime-300" : "text-violet-300")
              }
            >
              {pitchStr}
            </span>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="relative h-[2.6rem] grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Pad
              key={"cue-" + i}
              active={cues[i] !== null}
              onPress={() => hitPad(i)}
            >
              <span
                className={
                  "font-semibold uppercase tracking-wider " +
                  (activeCue === i ? "text-violet-200" : "")
                }
              >
                {"cue " + (i + 1)}
              </span>
            </Pad>
          ))}
        </div>

        {/* LOOP */}
        <div className="relative h-[2rem] flex gap-2">
          <div className="w-[4.6rem]">
            <Button
              onPress={() => {
                if (!loopOn) {
                  loopStartRef.current = position;
                  setLoopOn(true);
                } else {
                  setLoopOn(false);
                }
              }}
            >
              <span className="font-semibold uppercase tracking-wider">
                {loopOn ? "exit" : "loop"}
              </span>
            </Button>
          </div>
          <div className="w-[3.2rem]">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <span className="flex items-baseline gap-1 leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (loopOn ? "text-lime-300" : "text-stone-500")
                  }
                >
                  {fmtBeats(loopBeats)}
                </span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">
                  {loopOn ? "beat loop" : "beats · idle"}
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[3.2rem]">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">2×</span>
            </Button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="truncate">deck b → ch 2</span>
        <span className="flex items-center gap-3">
          <span
            className={
              "transition-colors duration-200 ease-out " +
              (keylock ? "text-violet-300" : "text-stone-600")
            }
          >
            keylock
          </span>
          <span
            className={
              "transition-all duration-200 ease-out " +
              (playing ? "text-lime-300 animate-pulse" : "text-stone-600")
            }
          >
            {playing ? "playing" : "cued"}
          </span>
        </span>
      </div>
    </div>
  );
}