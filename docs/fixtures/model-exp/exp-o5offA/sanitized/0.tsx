export default function GeneratedComponent() {
  const TRACK = { title: "MIDNIGHT TANGERINE", artist: "Vela Kortez", bpm: 126.0, key: "8A", len: 312 };

  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [pos, setPos] = useState(0.182);
  const [angle, setAngle] = useState(0);
  const [cues, setCues] = useState<Record<number, number | null>>({ 1: 0.05, 2: 0.32, 3: null, 4: 0.71 });
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState(4);
  const [scratching, setScratching] = useState(false);

  const waveData = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < 220; i++) {
      const t = i / 220;
      const kick = Math.pow(Math.abs(Math.sin(t * Math.PI * 34)), 6);
      const body = 0.42 + 0.34 * Math.sin(t * Math.PI * 5.1) + 0.16 * Math.sin(t * Math.PI * 17.3);
      const drop = t > 0.45 && t < 0.78 ? 1.12 : 0.82;
      out.push(Math.max(0.06, Math.min(1, (body * drop + kick * 0.45) * (0.7 + 0.3 * Math.sin(t * 31)))));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i < 33; i++) g.push(i / 32);
    return g;
  }, []);

  const effBpm = TRACK.bpm * (1 + pitch / 100);

  useEffect(() => {
    if (!playing || scratching) return;
    const id = setInterval(() => {
      setPos((p) => {
        let n = p + (0.08 * (1 + pitch / 100)) / TRACK.len;
        if (loopOn) {
          const loopSec = (60 / effBpm) * loopLen;
          const start = Math.floor(p * TRACK.len / loopSec) * loopSec / TRACK.len;
          if (n > start + loopSec / TRACK.len) n = start;
        }
        return n >= 1 ? 0 : n;
      });
      setAngle((a) => a + 0.09 * (1 + pitch / 100));
    }, 80);
    return () => clearInterval(id);
  }, [playing, pitch, loopOn, loopLen, effBpm, scratching]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ":" + (r < 10 ? "0" + r : r);
  };
  const elapsed = pos * TRACK.len;

  const onScrub = (d: number) => {
    setScratching(true);
    setAngle((a) => a + d);
    setPos((p) => Math.max(0, Math.min(0.9999, p + d * 0.012)));
    window.setTimeout(() => setScratching(false), 120);
  };

  const hitCue = (n: number) => {
    const c = cues[n];
    if (c == null) {
      setCues((s) => ({ ...s, [n]: pos }));
      setActiveCue(n);
    } else {
      setPos(c);
      setActiveCue(n);
      setPlaying(true);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* HEADER */}
      <div className="h-8 flex-none px-3 flex items-center gap-2 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <span className={"text-amber-400 text-[11px] transition-all duration-200 " + (playing ? "animate-pulse" : "opacity-60")}>◆</span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">Deck A</span>
        <div className="flex-1 min-w-0 h-px bg-gradient-to-r from-amber-500/30 to-transparent" />
        <span className={"font-mono font-bold text-[10px] tracking-tight transition-all duration-200 " + (sync ? "text-lime-300 animate-pulse" : "text-stone-600")}>
          {sync ? "PHASE LOCK" : "FREE"}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 p-2 flex flex-col gap-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TRACK INFO + BPM */}
        <div className="flex-none flex gap-2 items-stretch">
          <div className="flex-1 h-[2.2rem]">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold uppercase tracking-wider text-stone-100">{TRACK.title}</span>
                <span className="text-[0.72em] tracking-widest uppercase text-stone-500">{TRACK.artist}</span>
              </span>
            </Readout>
          </div>
          <div className="w-[5.6rem] h-[2.2rem]">
            <Readout>
              <span className="flex flex-col items-center leading-tight">
                <span className={"font-mono font-bold tracking-tight " + (sync ? "text-lime-300" : "text-amber-400")}>{effBpm.toFixed(1)}</span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">BPM · {TRACK.key}</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="flex-none h-[2.6rem] rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-clip">
          <Waveform data={waveData} playhead={pos} beatGrid={beatGrid} zoom={0.55} onScrub={(p) => setPos(p)} />
        </div>

        {/* JOG + PITCH */}
        <div className="flex-none flex gap-2 items-stretch">
          <div className="w-[6.4rem] h-[6.4rem] rounded-full">
            <JogWheel value={angle} onScrub={onScrub} />
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="flex-1 h-[1.7rem]">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="font-semibold uppercase tracking-wider">{playing ? "▮▮ Pause" : "▶ Play"}</span>
                </ToggleButton>
              </div>
              <div className="w-[3.4rem] h-[1.7rem]">
                <Button onPress={() => { setPos(cues[1] ?? 0); setPlaying(false); }}>
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 h-[1.7rem]">
                <ToggleButton on={sync} onChange={(v) => { setSync(v); if (v) setPitch(1.4); }}>
                  <span className="font-semibold uppercase tracking-wider">Sync</span>
                </ToggleButton>
              </div>
              <div className="flex-1 h-[1.7rem]">
                <ToggleButton on={keylock} onChange={setKeylock}>
                  <span className="font-semibold uppercase tracking-wider">Key</span>
                </ToggleButton>
              </div>
            </div>

            <div className="flex-1 flex gap-2 items-stretch">
              <div className="flex flex-col justify-center gap-1">
                <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">Pitch</span>
                <span className="font-mono font-bold tracking-tight text-[11px] text-amber-400 transition-all duration-200">
                  {(pitch >= 0 ? "+" : "") + pitch.toFixed(2)}%
                </span>
                <span className="text-[10px] tracking-wide leading-none text-stone-600">{fmt(elapsed)} / {fmt(TRACK.len)}</span>
              </div>
              <div className="flex-1 flex items-center justify-end">
                <div className="w-[6.4rem] h-[1.6rem]">
                  <Fader min={-8} max={8} value={pitch} onChange={(v) => { setPitch(v); setSync(false); }} orientation="horizontal" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="flex-none grid grid-cols-4 gap-2 h-[2.3rem]">
          {[1, 2, 3, 4].map((n) => (
            <Pad key={"cue-" + n} active={activeCue === n || cues[n] != null} onPress={() => hitCue(n)}>
              <span className="flex flex-col items-center leading-none">
                <span className="font-semibold uppercase tracking-wider">{"CUE " + n}</span>
                <span className="text-[0.62em] tracking-widest text-stone-500">{cues[n] != null ? fmt((cues[n] as number) * TRACK.len) : "SET"}</span>
              </span>
            </Pad>
          ))}
        </div>

        {/* LOOP CONTROLS */}
        <div className="flex-none flex gap-2 h-[1.8rem]">
          <div className="w-[2.6rem]">
            <Button onPress={() => setLoopLen((l) => Math.max(0.25, l / 2))}>
              <span className="font-semibold tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Readout>
              <span className="font-mono font-bold tracking-tight text-amber-400">{loopLen >= 1 ? loopLen + " BEAT" : "1/" + Math.round(1 / loopLen)}</span>
            </Readout>
          </div>
          <div className="w-[2.6rem]">
            <Button onPress={() => setLoopLen((l) => Math.min(32, l * 2))}>
              <span className="font-semibold tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[4.4rem]">
            <ToggleButton on={loopOn} onChange={setLoopOn}>
              <span className="font-semibold uppercase tracking-wider">Loop</span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none px-3 flex items-center gap-2 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span>CH1</span>
        <span className="text-lime-300 transition-all duration-100 ease-linear">{playing ? "PLAY" : "CUED"}</span>
        <div className="flex-1 min-w-0 h-[3px] rounded-full bg-stone-900 overflow-clip">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-lime-400 transition-all duration-100 ease-linear"
            style={{ width: (pos * 100).toFixed(2) + "%" }}
          />
        </div>
        <span className={"transition-all duration-200 " + (keylock ? "text-violet-300" : "text-stone-600")}>{keylock ? "KEYLOCK" : "VARI"}</span>
      </div>
    </div>
  );
}