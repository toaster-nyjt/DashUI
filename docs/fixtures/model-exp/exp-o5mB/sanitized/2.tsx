export default function GeneratedComponent() {
  const BASE_BPM = 124.0;

  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.18);
  const [angle, setAngle] = useState(0);
  const [cuePoint, setCuePoint] = useState(0.18);
  const [cues, setCues] = useState<(number | null)[]>([0.18, 0.42, null, null]);
  const [loopActive, setLoopActive] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [flash, setFlash] = useState(-1);

  const rate = 1 + pitch / 100;
  const bpm = BASE_BPM * rate;

  const wave = useMemo(() => {
    const n = 240;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const bar = 0.45 + 0.42 * Math.abs(Math.sin(t * Math.PI * 3.1));
      const kick = i % 8 === 0 ? 0.45 : 0;
      const noise = 0.22 * Math.abs(Math.sin(i * 2.3) * Math.cos(i * 0.71));
      out.push(Math.min(1, bar * (0.55 + noise) + kick));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 32; i++) g.push(i / 32);
    return g;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let next = p + 0.0013 * rate;
        if (loopActive) {
          const span = (loopBeats / 32) * 0.55;
          if (next > cuePoint + span) next = cuePoint;
        }
        return next % 1;
      });
      setAngle((a) => a + 0.14 * rate);
    }, 60);
    return () => clearInterval(id);
  }, [playing, rate, loopActive, loopBeats, cuePoint]);

  useEffect(() => {
    if (flash < 0) return;
    const id = setTimeout(() => setFlash(-1), 220);
    return () => clearTimeout(id);
  }, [flash]);

  const total = 312;
  const secs = Math.floor(playhead * total);
  const time =
    String(Math.floor(secs / 60)).padStart(2, "0") + ":" + String(secs % 60).padStart(2, "0");
  const remain = total - secs;
  const rtime =
    "-" +
    String(Math.floor(remain / 60)).padStart(2, "0") +
    ":" +
    String(remain % 60).padStart(2, "0");

  const hitCue = (i: number) => {
    setFlash(i);
    setCues((c) => {
      const n = [...c];
      if (n[i] == null) {
        n[i] = playhead;
        return n;
      }
      setPlayhead(n[i] as number);
      return n;
    });
  };

  const onSync = (v: boolean) => {
    setSync(v);
    if (v) setPitch(1.8);
  };

  const padLabels = ["A", "B", "C", "D"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      {/* header */}
      <div className="flex-none h-8 px-3 flex items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <span
          className={
            "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
            (playing ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-violet-400")
          }
        />
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
          Deck B
        </span>
        <span className="ml-auto text-[10px] font-medium uppercase tracking-widest text-stone-500">
          CH 2
        </span>
        <span
          className={
            "text-[10px] font-medium uppercase tracking-widest transition-all duration-300 ease-out " +
            (sync ? "text-lime-300 animate-pulse" : "text-stone-600")
          }
        >
          Sync
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* track info + bpm */}
        <div className="flex gap-2 h-[2.4rem]">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col leading-tight">
                <span className="font-semibold uppercase tracking-wider text-stone-100">
                  Night Transit
                </span>
                <span className="text-[0.72em] uppercase tracking-widest text-stone-400">
                  Kora Vex — Subsurface
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.6rem] h-full">
            <Readout>
              <span className="flex flex-col leading-tight items-end">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (sync ? "text-lime-300" : "text-violet-300")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">BPM</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* waveform */}
        <div className="h-[2.75rem] w-full">
          <Waveform
            data={wave}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.6}
            onScrub={(p) => setPlayhead(Math.max(0, Math.min(1, p)))}
          />
        </div>

        {/* main deck row */}
        <div className="flex-1 flex gap-3">
          {/* pitch */}
          <div className="w-[2.4rem] h-full flex flex-col items-center gap-1">
            <span className="flex-none text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
              Pit
            </span>
            <div className="flex-1 w-[1.8rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                orientation="vertical"
                onChange={(v) => {
                  setPitch(v);
                  setSync(false);
                }}
              />
            </div>
          </div>

          {/* jog */}
          <div className="h-full aspect-square">
            <JogWheel value={angle} onScrub={(d) => { setAngle((a) => a + d); setPlayhead((p) => Math.max(0, Math.min(0.999, p + d * 0.01))); }} />
          </div>

          {/* transport */}
          <div className="flex-1 h-full flex flex-col gap-2">
            <div className="flex-1 flex gap-2">
              <div className="flex-1 h-full">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.15em]">{playing ? "❚❚" : "▶"}</span>
                    <span className="text-[0.62em] font-semibold uppercase tracking-widest">
                      {playing ? "Pause" : "Play"}
                    </span>
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1 h-full">
                <Button
                  onPress={() => {
                    setPlayhead(cuePoint);
                    setPlaying(false);
                  }}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.05em]">◆</span>
                    <span className="text-[0.62em] font-semibold uppercase tracking-widest">
                      Cue
                    </span>
                  </span>
                </Button>
              </div>
            </div>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 h-full">
                <ToggleButton on={sync} onChange={onSync}>
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                </ToggleButton>
              </div>
              <div className="flex-1 h-full">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-semibold uppercase tracking-wider">Key</span>
                    <span className="text-[0.62em] uppercase tracking-widest">Lock</span>
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* hot cues */}
        <div className="grid grid-cols-4 gap-2 h-[2.6rem]">
          {padLabels.map((l, i) => (
            <div key={"cue-" + i} className="h-full">
              <Pad onPress={() => hitCue(i)} active={cues[i] != null}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-semibold uppercase tracking-wider">{l}</span>
                  <span className="text-[0.6em] uppercase tracking-widest opacity-70">
                    {cues[i] != null
                      ? (flash === i ? "•••" : Math.floor((cues[i] as number) * total / 60) + ":" + String(Math.floor((cues[i] as number) * total) % 60).padStart(2, "0"))
                      : "set"}
                  </span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* loop */}
        <div className="flex gap-2 h-[1.9rem]">
          <div className="flex-1 h-full">
            <Button
              onPress={() => {
                setCuePoint(playhead);
                setLoopActive(true);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">In</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopActive(false)}>
              <span className="font-semibold uppercase tracking-wider">Out</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1 h-full">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold tracking-wider">2×</span>
            </Button>
          </div>
          <div className="w-[7rem] h-full">
            <Readout>
              <span className="flex items-baseline gap-1 leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (loopActive ? "text-lime-300" : "text-stone-400")
                  }
                >
                  {loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats}
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">beat</span>
              </span>
            </Readout>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex-none h-6 px-3 flex items-center justify-between gap-2 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="truncate">
          Pitch{" "}
          <span className={pitch === 0 ? "text-stone-400" : "text-lime-300"}>
            {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
          </span>
        </span>
        <span className="truncate text-stone-400 font-mono tracking-tight">{time}</span>
        <span className="truncate">
          <span className={remain < 40 ? "text-red-400 animate-pulse" : "text-lime-300"}>
            {rtime}
          </span>
        </span>
      </div>
    </div>
  );
}