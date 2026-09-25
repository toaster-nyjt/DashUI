export default function GeneratedComponent() {
  const TRACK = { title: "Midnight Circuit", artist: "Vela Nox", bpm: 126, duration: 332 };
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [hotCues, setHotCues] = useState<(number | null)[]>([0.04, 0.31, null, null]);
  const [loopIn, setLoopIn] = useState<number | null>(null);
  const [loopOut, setLoopOut] = useState<number | null>(null);
  const [loopBeats, setLoopBeats] = useState(4);
  const [cueFlash, setCueFlash] = useState(false);

  const waveData = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 320; i++) {
      const env = 0.55 + 0.45 * Math.sin(i / 23) * Math.cos(i / 7.3);
      const beat = i % 8 === 0 ? 1 : 0.6;
      arr.push(Math.max(0.05, Math.min(1, Math.abs(env * beat + Math.sin(i * 1.7) * 0.18))));
    }
    return arr;
  }, []);
  const beatGrid = useMemo(() => {
    const g: number[] = [];
    const beats = (TRACK.duration / 60) * TRACK.bpm;
    for (let b = 0; b < beats; b += 4) g.push(b / beats);
    return g;
  }, []);

  const effPitch = synced ? 0 : pitch;
  const bpm = TRACK.bpm * (1 + effPitch / 100);
  const beatLen = 60 / bpm / TRACK.duration;

  const stateRef = useRef({ playing, effPitch, loopIn, loopOut });
  stateRef.current = { playing, effPitch, loopIn, loopOut };

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current;
      if (!s.playing) return;
      setPlayhead((p) => {
        let n = p + (0.05 / TRACK.duration) * (1 + s.effPitch / 100);
        if (s.loopIn !== null && s.loopOut !== null && n >= s.loopOut) n = s.loopIn;
        if (n >= 1) n = 0;
        return n;
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  const fmt = (pos: number) => {
    const t = Math.floor(pos * TRACK.duration);
    const m = Math.floor(t / 60);
    const s = t % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  };

  const handleCue = () => {
    setPlaying(false);
    setPlayhead(hotCues[0] ?? 0);
    setCueFlash(true);
    setTimeout(() => setCueFlash(false), 180);
  };

  const hitPad = (i: number) => {
    if (hotCues[i] === null) {
      const next = [...hotCues];
      next[i] = playhead;
      setHotCues(next);
    } else {
      setPlayhead(hotCues[i] as number);
      setPlaying(true);
    }
  };

  const setLoopLen = (beats: number) => {
    const b = Math.max(0.25, Math.min(32, beats));
    setLoopBeats(b);
    if (loopIn !== null) setLoopOut(Math.min(1, loopIn + b * beatLen));
  };

  const loopActive = loopIn !== null && loopOut !== null;
  const padColors = ["bg-amber-400", "bg-violet-400", "bg-lime-400", "bg-red-400"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100 font-sans select-none">
      {/* Header */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-violet-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className={"text-violet-400 transition-all duration-300 " + (playing ? "animate-pulse drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]" : "")}>◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">Deck B · Channel 2</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
          {keylock && <span className="text-violet-300 transition-all duration-200">Key</span>}
          {loopActive && <span className="text-amber-300 animate-pulse">Loop</span>}
          <span className={"transition-all duration-200 " + (playing ? "text-lime-300 animate-pulse" : "text-stone-600")}>{playing ? "● Live" : "○ Idle"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* Track info + BPM */}
        <div className="flex gap-2 h-[2.5rem]">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">{TRACK.title}</span>
                <span className="text-[0.7em] uppercase tracking-widest text-violet-300">{TRACK.artist} · {fmt(playhead)} / {fmt(1)}</span>
              </span>
            </Readout>
          </div>
          <div className="w-[6rem] h-full">
            <Readout>
              <span className="flex flex-col items-center leading-tight">
                <span className={"font-mono font-bold tracking-tight " + (synced ? "text-lime-300 animate-pulse" : "text-amber-400")}>{bpm.toFixed(2)}</span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-400">{synced ? "BPM · Sync" : "BPM"}</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* Waveform strip */}
        <div className="relative h-[3.5rem] rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-clip">
          <div className={"absolute inset-0 transition-opacity duration-300 " + (playing ? "opacity-100" : "opacity-40")}>
            <Waveform data={waveData} playhead={playhead} beatGrid={beatGrid} zoom={1} onScrub={(p) => setPlayhead(p)} />
          </div>
          {loopActive && (
            <div
              className="absolute top-0 bottom-0 bg-amber-400/15 border-x border-amber-400/60 pointer-events-none transition-all duration-200"
              style={{ left: (loopIn as number) * 100 + "%", width: ((loopOut as number) - (loopIn as number)) * 100 + "%" }}
            />
          )}
          {hotCues.map((c, i) =>
            c === null ? null : (
              <div key={"cm-" + i} className={"absolute top-0 w-0.5 h-2 pointer-events-none " + padColors[i]} style={{ left: c * 100 + "%" }} />
            )
          )}
        </div>

        {/* Middle: jog + loop + pitch */}
        <div className="flex-1 flex gap-2">
          {/* Jog */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-[8.5rem] h-[8.5rem]">
              <div
                className={"absolute -inset-1.5 rounded-full transition-opacity duration-500 " + (playing ? "opacity-100 animate-[spin_4s_linear_infinite]" : "opacity-30")}
                style={{ background: "conic-gradient(from 0deg, rgba(167,139,250,0.0), rgba(167,139,250,0.55), rgba(251,191,36,0.4), rgba(167,139,250,0.0))", WebkitMask: "radial-gradient(circle, transparent 66%, black 68%)", mask: "radial-gradient(circle, transparent 66%, black 68%)" }}
              />
              <div className="absolute inset-0">
                <JogWheel value={playhead * Math.PI * 2 * 40} onScrub={(d) => setPlayhead((p) => Math.max(0, Math.min(0.999, p + d * 0.004)))} />
              </div>
            </div>
          </div>

          {/* Loop controls */}
          <div className="flex flex-col gap-2 w-[10rem]">
            <div className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400 px-1">Loop</div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div className="w-full h-full">
                <Button onPress={() => { setLoopIn(playhead); setLoopOut(Math.min(1, playhead + loopBeats * beatLen)); }}>
                  <span className={"font-semibold uppercase tracking-wider " + (loopIn !== null ? "text-amber-300" : "")}>In</span>
                </Button>
              </div>
              <div className="w-full h-full">
                <Button onPress={() => { if (loopIn !== null) setLoopOut(Math.max(loopIn + beatLen * 0.25, playhead)); }}>
                  <span className={"font-semibold uppercase tracking-wider " + (loopOut !== null ? "text-amber-300" : "")}>Out</span>
                </Button>
              </div>
              <div className="w-full h-full">
                <Button onPress={() => setLoopLen(loopBeats / 2)}><span className="font-semibold tracking-wider">½</span></Button>
              </div>
              <div className="w-full h-full">
                <Button onPress={() => setLoopLen(loopBeats * 2)}><span className="font-semibold tracking-wider">×2</span></Button>
              </div>
            </div>
            <div className={"h-[1.75rem] rounded-lg transition-all duration-300 " + (loopActive ? "ring-1 ring-inset ring-amber-500/50 shadow-lg shadow-amber-500/20" : "")}>
              <Readout>
                <span className="flex items-baseline gap-1">
                  <span className={"font-mono font-bold tracking-tight " + (loopActive ? "text-amber-400 animate-pulse" : "text-stone-100")}>{loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats}</span>
                  <span className="text-[0.6em] uppercase tracking-widest text-stone-400">{loopActive ? "beats · on" : "beats"}</span>
                </span>
              </Readout>
            </div>
            <div className="h-[1.5rem]">
              <Button onPress={() => { setLoopIn(null); setLoopOut(null); }}>
                <span className="font-semibold uppercase tracking-wider">Exit</span>
              </Button>
            </div>
          </div>

          {/* Pitch fader */}
          <div className="flex flex-col w-[2.75rem] items-center gap-1">
            <div className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">Pitch</div>
            <div className={"flex-1 w-full transition-all duration-300 " + (synced ? "opacity-50" : "opacity-100")}>
              <Fader min={-8} max={8} value={effPitch} onChange={(v) => { setSynced(false); setPitch(v); }} orientation="vertical" />
            </div>
            <div className={"font-mono font-bold tracking-tight text-[10px] leading-none transition-colors duration-200 " + (synced ? "text-lime-300" : effPitch === 0 ? "text-stone-100" : "text-amber-400")}>
              {(effPitch >= 0 ? "+" : "") + effPitch.toFixed(1) + "%"}
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="grid grid-cols-4 gap-2 h-[2.5rem]">
          {hotCues.map((c, i) => (
            <div key={"pad-" + i} className="w-full h-full">
              <Pad onPress={() => hitPad(i)} active={c !== null}>
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-semibold uppercase tracking-wider">{"Cue " + (i + 1)}</span>
                  <span className="text-[0.65em] font-mono tracking-tight text-stone-400">{c === null ? "— set —" : fmt(c)}</span>
                </span>
              </Pad>
            </div>
          ))}
        </div>

        {/* Transport */}
        <div className="grid grid-cols-4 gap-2 h-[2.25rem]">
          <div className={"w-full h-full rounded-lg transition-all duration-150 " + (cueFlash ? "shadow-lg shadow-red-500/50 scale-95" : "")}>
            <Button onPress={handleCue}>
              <span className="font-semibold uppercase tracking-wider text-red-400">● Cue</span>
            </Button>
          </div>
          <div className={"w-full h-full rounded-lg transition-all duration-300 " + (playing ? "shadow-lg shadow-lime-400/30" : "")}>
            <ToggleButton on={playing} onChange={setPlaying}>
              <span className="font-semibold uppercase tracking-wider">{playing ? "❚❚ Pause" : "▶ Play"}</span>
            </ToggleButton>
          </div>
          <div className={"w-full h-full rounded-lg transition-all duration-300 " + (synced ? "shadow-lg shadow-lime-400/30" : "")}>
            <ToggleButton on={synced} onChange={setSynced}>
              <span className={"font-semibold uppercase tracking-wider " + (synced ? "animate-pulse" : "")}>Sync</span>
            </ToggleButton>
          </div>
          <div className={"w-full h-full rounded-lg transition-all duration-300 " + (keylock ? "ring-1 ring-inset ring-violet-500/50 shadow-lg shadow-violet-500/30" : "")}>
            <ToggleButton on={keylock} onChange={setKeylock}>
              <span className="font-semibold uppercase tracking-wider">Keylock</span>
            </ToggleButton>
          </div>
        </div>
      </div>
    </div>
  );
}