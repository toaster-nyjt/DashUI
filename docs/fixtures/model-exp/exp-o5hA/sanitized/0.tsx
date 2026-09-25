export default function GeneratedComponent() {
  const baseBpm = 128.0;
  const deckBBpm = 126.0;
  const duration = 232; // seconds

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.015);
  const [angle, setAngle] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [cuePoint] = useState(0.015);
  const [cues, setCues] = useState<(number | null)[]>([0.015, 0.281, 0.522, null]);
  const [loopActive, setLoopActive] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopStart, setLoopStart] = useState(0);

  const bpm = baseBpm * (1 + pitch / 100);

  const waveData = useMemo(() => {
    const n = 256;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const build = 0.30 + 0.55 * Math.pow(Math.sin(t * Math.PI * 3.1), 2);
      const detail = 0.18 * Math.sin(t * Math.PI * 27) + 0.12 * Math.sin(t * Math.PI * 61);
      const gate = t > 0.44 && t < 0.52 ? 0.35 : 1;
      const v = (build + detail) * gate;
      out.push(Math.max(0.05, Math.min(1, v)));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const phrase = (60 / baseBpm) * 16 / duration;
    const g: number[] = [];
    for (let p = 0; p < 1; p += phrase) g.push(p);
    return g;
  }, []);

  const loopLen = (loopBeats * (60 / bpm)) / duration;

  useEffect(() => {
    let id = 0;
    let last = 0;
    const step = (t: number) => {
      if (!last) last = t;
      const dt = Math.min(0.06, (t - last) / 1000);
      last = t;
      if (playing) {
        setPlayhead((p) => {
          let next = p + (dt / duration) * (1 + pitch / 100);
          if (loopActive) {
            const end = loopStart + loopLen;
            if (next >= end) next = loopStart + (next - end);
          }
          if (next >= 1) next = 0;
          return next;
        });
        setAngle((a) => a + dt * (bpm / 60) * Math.PI * 0.85);
      }
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [playing, pitch, bpm, loopActive, loopStart, loopLen]);

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const fmt = (pos: number) => {
    const s = Math.max(0, Math.floor(pos * duration));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  };

  const beats = playhead * duration * (bpm / 60);
  const phase = beats - Math.floor(beats);
  const pulse = Math.pow(1 - phase, 3);

  const handlePad = (i: number) => {
    setCues((prev) => {
      const next = prev.slice();
      if (next[i] == null) next[i] = playhead;
      return next;
    });
    if (cues[i] != null) setPlayhead(cues[i] as number);
  };

  const pitchStr = (pitch >= 0 ? "+" : "") + pitch.toFixed(1);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900">
      {/* header chrome */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span
          className="text-amber-400 text-[11px] leading-none"
          style={{ opacity: 0.35 + 0.65 * pulse, transform: "scale(" + (1 + 0.45 * pulse).toFixed(3) + ")" }}
        >
          ◆
        </span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        <span className="ml-auto font-mono text-[10px] tracking-widest text-stone-500">
          {fmt(playhead)} <span className="text-stone-700">/</span> <span className="text-amber-400/70">{fmt(1)}</span>
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* track info + bpm */}
        <div className="flex gap-2 h-[2.5rem]">
          <div className="flex-1 h-full">
            <Readout>
              <span className="flex flex-col items-start justify-center leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">MIDNIGHT TANGERINE</span>
                <span className="text-[0.62em] uppercase tracking-widest text-stone-500">
                  Velvet Circuit · A-min · -{fmt(1 - playhead)}
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[6.25rem] h-full">
            <Readout>
              <span className="flex flex-col items-center justify-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " + (sync ? "text-lime-300 animate-pulse" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.5em] uppercase tracking-widest text-stone-500">BPM</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* waveform strip */}
        <div className="h-[2.75rem] w-full">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.6}
            onScrub={(pos) => setPlayhead(clamp01(pos))}
          />
        </div>

        {/* jog + transport + pitch */}
        <div className="flex-1 flex gap-2 items-stretch">
          <div className="h-full aspect-square max-w-[11rem]">
            <JogWheel
              value={angle}
              onScrub={(d) => {
                setAngle((a) => a + d);
                setPlayhead((p) => clamp01(p + d * 0.012));
              }}
            />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1">
              <ToggleButton on={playing} onChange={(on) => setPlaying(on)}>
                <span className="font-semibold uppercase tracking-wider">{playing ? "❚❚  Pause" : "▶  Play"}</span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <Button
                onPress={() => {
                  setPlayhead(cuePoint);
                  setPlaying(false);
                }}
              >
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </Button>
            </div>
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <ToggleButton
                  on={sync}
                  onChange={(on) => {
                    setSync(on);
                    if (on) setPitch(Number((((deckBBpm / baseBpm) - 1) * 100).toFixed(1)));
                  }}
                >
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <ToggleButton on={keylock} onChange={(on) => setKeylock(on)}>
                  <span className="font-semibold uppercase tracking-wider">Key</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          <div className="w-[3.25rem] flex flex-col items-center gap-1">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">Pitch</span>
            <div className="flex-1 w-[1.9rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                orientation="vertical"
                onChange={(v) => {
                  setPitch(Number(v.toFixed(1)));
                  setSync(false);
                }}
              />
            </div>
            <span className="font-mono font-bold text-[10px] leading-none text-lime-300">{pitchStr}</span>
          </div>
        </div>

        {/* hot cue pads */}
        <div className="grid grid-cols-4 gap-2 h-[2.6rem]">
          {[0, 1, 2, 3].map((i) => (
            <Pad key={"cue-" + i} active={cues[i] != null} onPress={() => handlePad(i)}>
              <span className="flex flex-col items-center justify-center leading-none">
                <span className="font-semibold uppercase tracking-wider">{"CUE " + (i + 1)}</span>
                <span className="text-[0.55em] font-mono tracking-widest text-stone-500">
                  {cues[i] != null ? fmt(cues[i] as number) : "— · —"}
                </span>
              </span>
            </Pad>
          ))}
        </div>

        {/* loop controls */}
        <div className="flex gap-2 h-[2rem]">
          <div className="w-[3.25rem]">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">÷2</span>
            </Button>
          </div>
          <div className="w-[3.25rem]">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[5rem]">
            <Button
              onPress={() => {
                setLoopActive((a) => {
                  if (!a) setLoopStart(playhead);
                  return !a;
                });
              }}
            >
              <span className="font-semibold uppercase tracking-wider">Loop</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <span className="flex items-baseline justify-center gap-2 leading-none">
                <span className={"font-mono font-bold tracking-tight " + (loopActive ? "text-lime-300" : "text-stone-600")}>
                  {loopBeats >= 1 ? loopBeats + " BEAT" : "1/" + Math.round(1 / loopBeats) + " BEAT"}
                </span>
                <span
                  className={
                    "text-[0.55em] uppercase tracking-widest " +
                    (loopActive ? "text-lime-300 animate-pulse" : "text-stone-600")
                  }
                >
                  {loopActive ? "Active" : "Idle"}
                </span>
              </span>
            </Readout>
          </div>
        </div>
      </div>

      {/* footer chrome */}
      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span>
          Pitch <span className="font-mono text-lime-300">{pitchStr}%</span>
        </span>
        <span>
          Key <span className={keylock ? "text-violet-300" : "text-stone-600"}>{keylock ? "Lock" : "Free"}</span>
        </span>
        <span className="ml-auto">
          {sync ? (
            <span className="text-lime-300 animate-pulse">Sync · Deck B</span>
          ) : playing ? (
            <span className="text-amber-400">Playing</span>
          ) : (
            <span>Standby</span>
          )}
        </span>
      </div>
    </div>
  );
}