export default function GeneratedComponent() {
  const TRACK = { title: "MIDNIGHT TANGERINE", artist: "Kasper Vane", baseBpm: 124.0 };

  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.18);
  const [jogAngle, setJogAngle] = useState(0);
  const [cues, setCues] = useState<boolean[]>([true, true, false, false, true, false, false, false]);
  const [activeCue, setActiveCue] = useState<number | null>(0);
  const [loopLen, setLoopLen] = useState(4);
  const [looping, setLooping] = useState(false);
  const [flash, setFlash] = useState(false);

  const waveData = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < 220; i++) {
      const beat = Math.pow(Math.abs(Math.sin(i * 0.38)), 2);
      const body = 0.42 + 0.38 * Math.sin(i * 0.031) + 0.16 * Math.sin(i * 0.11);
      const v = Math.min(1, Math.max(0.06, body * (0.55 + 0.75 * beat)));
      out.push(v);
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 33; i++) g.push(i / 32);
    return g;
  }, []);

  const bpm = TRACK.baseBpm * (1 + pitch / 100);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const next = p + (bpm / 60) * 0.05 / 128;
        return next > 1 ? 0 : next;
      });
      setJogAngle((a) => a + 0.16);
    }, 50);
    return () => clearInterval(id);
  }, [playing, bpm]);

  useEffect(() => {
    if (!sync) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(t);
  }, [sync]);

  const elapsed = useMemo(() => {
    const total = 312;
    const s = Math.floor(playhead * total);
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }, [playhead]);

  const scrub = (d: number) => {
    setJogAngle((a) => a + d);
    setPlayhead((p) => Math.min(1, Math.max(0, p + d / 90)));
  };

  const cueLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* HEADER */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span
          className={
            "text-amber-400 text-[11px] leading-none transition-all duration-200 ease-out " +
            (playing ? "animate-pulse" : "opacity-60")
          }
        >
          ●
        </span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        <span className="ml-auto font-mono font-bold tracking-tight text-[10px] text-lime-300 tabular-nums">
          {elapsed}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* TRACK INFO + BPM */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 min-w-0 h-[2.1rem]">
            <Readout>
              <span className="flex flex-col items-start gap-[0.15em]">
                <span className="font-semibold uppercase tracking-wider text-stone-100">{TRACK.title}</span>
                <span className="text-[0.62em] uppercase tracking-widest text-stone-400">{TRACK.artist}</span>
              </span>
            </Readout>
          </div>
          <div className="w-[4.6rem] h-[2.1rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight transition-colors duration-300 " +
                    (sync ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">bpm</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="flex-none h-[2.6rem] rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-clip">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={(p) => setPlayhead(p)}
          />
        </div>

        {/* CORE: transport | jog | pitch */}
        <div className="flex-1 flex items-stretch gap-2">
          {/* transport column */}
          <div className="w-[3.7rem] flex flex-col gap-1.5">
            <div className="h-[1.6rem]">
              <ToggleButton on={sync} onChange={setSync}>
                <span className={"font-semibold uppercase tracking-wider " + (flash ? "animate-pulse" : "")}>
                  Sync
                </span>
              </ToggleButton>
            </div>
            <div className="h-[1.6rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="flex-1">
                <Button onPress={() => setPlayhead(activeCue !== null ? 0.02 : 0)}>
                  <span className="font-semibold uppercase tracking-wider text-amber-300">Cue</span>
                </Button>
              </div>
              <div className="flex-1">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="font-semibold uppercase tracking-wider">{playing ? "❚❚" : "▶"}</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* jog */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className={
                "aspect-square h-full max-h-full transition-all duration-300 ease-out " +
                (playing ? "drop-shadow-[0_0_14px_rgba(245,158,11,0.25)]" : "")
              }
            >
              <JogWheel value={jogAngle} onScrub={scrub} />
            </div>
          </div>

          {/* pitch */}
          <div className="w-[2.6rem] flex flex-col items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
              Pitch
            </span>
            <div className="flex-1 w-[1.7rem]">
              <Fader min={-8} max={8} value={pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <span
              className={
                "font-mono font-bold tracking-tight text-[10px] tabular-nums transition-colors duration-200 " +
                (pitch === 0 ? "text-stone-400" : "text-amber-400")
              }
            >
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
          </div>
        </div>

        {/* LOOP CONTROLS */}
        <div className="flex-none flex items-stretch gap-1.5">
          <div className="w-[2.7rem] h-[1.7rem]">
            <Button onPress={() => setLoopLen((l) => Math.max(0.25, l / 2))}>
              <span className="font-semibold uppercase tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1 h-[1.7rem]">
            <Readout>
              <span className="flex items-baseline gap-[0.35em]">
                <span
                  className={
                    "font-mono font-bold tracking-tight " + (looping ? "text-lime-300" : "text-stone-400")
                  }
                >
                  {loopLen < 1 ? "1/" + Math.round(1 / loopLen) : loopLen}
                </span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500">beat loop</span>
              </span>
            </Readout>
          </div>
          <div className="w-[2.7rem] h-[1.7rem]">
            <Button onPress={() => setLoopLen((l) => Math.min(32, l * 2))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[3.4rem] h-[1.7rem]">
            <ToggleButton on={looping} onChange={setLooping}>
              <span className="font-semibold uppercase tracking-wider">Loop</span>
            </ToggleButton>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="flex-none grid grid-cols-4 gap-1.5">
          {cueLabels.map((label, i) => (
            <div key={"cue-" + i} className="h-[2.25rem]">
              <Pad
                active={cues[i] || activeCue === i}
                onPress={() => {
                  setActiveCue(i);
                  setCues((c) => {
                    const n = [...c];
                    n[i] = true;
                    return n;
                  });
                  setPlayhead(i / 8 + 0.01);
                }}
              >
                <span className="font-semibold uppercase tracking-wider">{label}</span>
              </Pad>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span>CH 1</span>
        <span className={sync ? "text-lime-300 animate-pulse" : "text-stone-600"}>
          {sync ? "Locked" : "Free"}
        </span>
        <span className="ml-auto text-lime-300 tabular-nums">{Math.round(playhead * 100)}%</span>
      </div>
    </div>
  );
}