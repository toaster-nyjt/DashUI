export default function GeneratedComponent() {
  const track = { title: "Midnight Circuit", artist: "Vela Nox", bpm: 126, cue: 0.08 };
  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [playhead, setPlayhead] = useState(0.08);
  const [loopIn, setLoopIn] = useState<number | null>(null);
  const [loopOut, setLoopOut] = useState<number | null>(null);
  const [hotCues, setHotCues] = useState<(number | null)[]>([0.08, 0.31, null, null]);
  const [hitPad, setHitPad] = useState<number | null>(null);
  const [level, setLevel] = useState(0);

  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 320; i++) {
      const bar = Math.sin(i * 0.19) * 0.35 + 0.5;
      const kick = i % 8 === 0 ? 0.45 : 0;
      const n = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      arr.push(Math.min(1, Math.max(0.05, bar * 0.7 + kick + n * 0.2)));
    }
    return arr;
  }, []);
  const beatGrid = useMemo(() => Array.from({ length: 40 }, (_, i) => i / 40), []);

  const effBpm = track.bpm * (1 + pitch / 100);
  const bpmText = sync ? track.bpm.toFixed(1) : effBpm.toFixed(1);
  const totalSec = 372;
  const elapsed = Math.floor(playhead * totalSec);
  const timeText = String(Math.floor(elapsed / 60)).padStart(2, "0") + ":" + String(elapsed % 60).padStart(2, "0");

  useEffect(() => {
    if (!playing) {
      setLevel(0);
      return;
    }
    const id = setInterval(() => {
      setPlayhead((p) => {
        let n = p + (0.0003 * effBpm) / 126;
        if (loopIn !== null && loopOut !== null && n >= loopOut) n = loopIn;
        if (n >= 1) n = 0;
        return n;
      });
      setLevel(Math.random());
    }, 50);
    return () => clearInterval(id);
  }, [playing, effBpm, loopIn, loopOut]);

  const handleScrub = useCallback((delta: number) => {
    setPlayhead((p) => Math.min(1, Math.max(0, p + delta * 0.01)));
  }, []);

  const handleCue = () => {
    setPlaying(false);
    setPlayhead(track.cue);
  };

  const handlePad = (i: number) => {
    setHitPad(i);
    setTimeout(() => setHitPad(null), 180);
    const c = hotCues[i];
    if (c === null) {
      const next = [...hotCues];
      next[i] = playhead;
      setHotCues(next);
    } else {
      setPlayhead(c);
    }
  };

  const loopText =
    loopIn !== null && loopOut !== null
      ? Math.max(1, Math.round((loopOut - loopIn) * totalSec * (effBpm / 60))) + " BT"
      : loopIn !== null
      ? "IN…"
      : "OFF";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans">
      {/* header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"inline-block w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-500/40 " + (playing ? "animate-pulse" : "")} />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck A · Channel 1</span>
        </div>
        <span className={"text-[10px] uppercase tracking-widest transition-all duration-200 " + (playing ? "text-lime-300" : "text-stone-500")}>
          {playing ? "● Playing" : "■ Stopped"}
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-col p-3 gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* info row */}
        <div className="flex-none h-6 flex gap-2">
          <div className="flex-1 h-6">
            <Readout>
              <span className="flex items-center gap-2 font-semibold tracking-tight text-stone-100">
                <span>{track.title}</span>
                <span className="text-[0.75em] font-normal uppercase tracking-widest text-stone-400">{track.artist}</span>
              </span>
            </Readout>
          </div>
          <div className="w-[4rem] h-6">
            <Readout>
              <span className="font-mono font-bold tracking-tight text-stone-100">{timeText}</span>
            </Readout>
          </div>
          <div className="w-[5rem] h-6">
            <Readout>
              <span className={"font-mono font-bold tracking-tight transition-all duration-200 " + (sync ? "text-lime-300 animate-pulse" : "text-amber-400")}>
                {bpmText}
              </span>
            </Readout>
          </div>
        </div>

        {/* waveform */}
        <div className="flex-none h-12 w-full rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-clip">
          <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={1} onScrub={(p) => setPlayhead(p)} />
        </div>

        {/* main */}
        <div className="flex-1 flex gap-2">
          {/* left: transport + loop */}
          <div className="w-[6.5rem] flex flex-col gap-2">
            <div className="h-[1.75rem]">
              <Button onPress={handleCue}>
                <span className="font-semibold uppercase tracking-wider text-red-400">Cue</span>
              </Button>
            </div>
            <div className="h-[1.75rem]">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">{playing ? "❚❚ Pause" : "▶ Play"}</span>
              </ToggleButton>
            </div>
            <div className="h-[1.5rem]">
              <ToggleButton on={sync} onChange={setSync}>
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
            <div className="flex-1" />
            <div className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400 flex items-center justify-between">
              <span>Loop</span>
              <span className={"inline-block w-1.5 h-1.5 rounded-full " + (loopIn !== null && loopOut !== null ? "bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40" : "bg-stone-700")} />
            </div>
            <div className="h-5">
              <Readout>
                <span className={"font-mono font-bold tracking-tight " + (loopIn !== null && loopOut !== null ? "text-lime-300" : "text-stone-400")}>{loopText}</span>
              </Readout>
            </div>
            <div className="grid grid-cols-2 gap-2 h-[1.75rem]">
              <Button
                onPress={() => {
                  setLoopIn(playhead);
                  setLoopOut(null);
                }}
              >
                <span className="font-semibold uppercase tracking-wider">In</span>
              </Button>
              <Button
                onPress={() => {
                  if (loopIn !== null && loopOut === null && playhead > loopIn) setLoopOut(playhead);
                  else {
                    setLoopIn(null);
                    setLoopOut(null);
                  }
                }}
              >
                <span className="font-semibold uppercase tracking-wider">{loopIn !== null && loopOut !== null ? "Exit" : "Out"}</span>
              </Button>
            </div>
          </div>

          {/* center: jog */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative h-full aspect-square">
              <div
                className={"absolute -inset-1 rounded-full border border-dashed border-amber-500/30 transition-all duration-300 " + (playing ? "animate-[spin_6s_linear_infinite] border-amber-400/50" : "")}
              />
              <div className={"absolute -inset-3 rounded-full transition-all duration-500 " + (playing ? "shadow-[0_0_40px_-8px] shadow-amber-500/40" : "")} />
              <div className="absolute inset-0">
                <JogWheel value={playhead * Math.PI * 40} onScrub={handleScrub} />
              </div>
            </div>
          </div>

          {/* right: pitch + keylock */}
          <div className="w-[3rem] flex flex-col gap-2 items-center">
            <div className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">Pitch</div>
            <div className="flex-1 w-[1.6rem]">
              <Fader min={-8} max={8} value={sync ? 0 : pitch} onChange={setPitch} orientation="vertical" />
            </div>
            <div className={"font-mono font-bold text-[10px] tracking-tight transition-all duration-200 " + (pitch === 0 ? "text-stone-500" : "text-amber-400")}>
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
            </div>
            <div className="w-[3rem] h-[1.5rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className={"font-semibold uppercase tracking-wider " + (keylock ? "text-violet-300" : "")}>Key</span>
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* hot cue pads */}
        <div className="flex-none h-10 grid grid-cols-4 gap-2">
          {hotCues.map((c, i) => (
            <div key={"pad-" + i} className={"h-10 transition-all duration-200 " + (hitPad === i ? "scale-95 brightness-125" : "")}>
              <Pad onPress={() => handlePad(i)} active={c !== null}>
                <span className="flex flex-col items-center font-semibold uppercase tracking-wider">
                  <span>{"Cue " + (i + 1)}</span>
                  <span className="text-[0.7em] font-normal tracking-widest opacity-70">{c === null ? "set" : Math.floor(c * totalSec / 60) + ":" + String(Math.floor(c * totalSec) % 60).padStart(2, "0")}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="truncate">
          Out → CH1 <span className="text-lime-300">{Math.round(level * 100) + "%"}</span>
        </span>
        <span>
          Key {keylock ? <span className="text-violet-300">Locked</span> : "Free"} · {sync ? <span className="text-lime-300">Synced B</span> : "Manual"}
        </span>
      </div>
    </div>
  );
}