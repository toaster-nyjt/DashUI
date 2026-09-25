export default function GeneratedComponent() {
  // ---- Track / transport state -------------------------------------------
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18); // normalized 0..1
  const [pitch, setPitch] = useState(0); // -8 .. +8 percent
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [jogAngle, setJogAngle] = useState(0);
  const [activeCue, setActiveCue] = useState<number | null>(0);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);

  const baseBpm = 126.0;
  const bpm = useMemo(() => baseBpm * (1 + pitch / 100), [pitch]);

  // ---- Sample waveform data ----------------------------------------------
  const waveform = useMemo(() => {
    const n = 220;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = Math.abs(Math.sin(t * Math.PI * 32));
      const env = 0.35 + 0.5 * Math.sin(t * Math.PI * 3.1) ** 2;
      const kick = beat > 0.92 ? 0.4 : 0;
      const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      out.push(Math.min(1, env * (0.5 + 0.5 * beat) + kick + Math.abs(noise) * 0.12));
    }
    return out;
  }, []);

  const beatGrid = useMemo(() => {
    const grid: number[] = [];
    for (let i = 0; i <= 16; i++) grid.push(i / 16);
    return grid;
  }, []);

  // ---- Playback simulation ------------------------------------------------
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPlayhead((p) => {
        const speed = (bpm / 126) * 0.0016;
        let next = p + speed;
        if (loopActive) {
          const loopLen = (loopBeats / 16) * 0.5;
          const loopStart = activeCue != null ? 0.18 : 0.18;
          if (next > loopStart + loopLen) next = loopStart;
        }
        if (next >= 1) next = 0;
        return next;
      });
      setJogAngle((a) => a + (bpm / 126) * 0.14);
    }, 33);
    return () => clearInterval(id);
  }, [isPlaying, bpm, loopActive, loopBeats, activeCue]);

  // ---- Time readout -------------------------------------------------------
  const timeStr = useMemo(() => {
    const total = 254; // seconds of the track
    const cur = playhead * total;
    const m = Math.floor(cur / 60);
    const s = Math.floor(cur % 60);
    return m + ":" + String(s).padStart(2, "0");
  }, [playhead]);

  const cueColors = ["A", "B", "C", "D"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* ===== HEADER ===== */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[11px]">◆</span>
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck A
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={
              "h-1.5 w-1.5 rounded-full " +
              (isPlaying ? "bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40" : "bg-stone-700")
            }
          />
          <span className="font-medium uppercase tracking-widest text-[10px] text-stone-400">CH 1</span>
        </div>
      </div>

      {/* ===== BODY ===== */}
      <div className="flex-1 flex flex-col gap-2 p-2 overflow-clip min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* --- Track Info + BPM row --- */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start">
                <span className="font-semibold tracking-wide text-[1em]">Midnight Circuit</span>
                <span className="text-[0.7em] text-stone-500 tracking-wide">NOVA STATE</span>
              </span>
            </Readout>
          </div>
          <div className="flex-none w-[6.5rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " + (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.55em] uppercase tracking-widest text-stone-500 mt-0.5">BPM</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* --- Waveform strip --- */}
        <div className="flex-none h-[3.25rem]">
          <Waveform
            data={waveform}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.4}
            onScrub={(pos) => setPlayhead(pos)}
          />
        </div>

        {/* --- Center row: Jog wheel + transport / pitch --- */}
        <div className="flex-1 flex items-stretch gap-2">
          {/* Jog wheel */}
          <div className="flex-none flex items-center justify-center">
            <div className="w-[7rem] h-[7rem]">
              <JogWheel
                value={jogAngle}
                onScrub={(delta) => {
                  setJogAngle((a) => a + delta);
                  setPlayhead((p) => Math.max(0, Math.min(1, p + delta * 0.02)));
                }}
              />
            </div>
          </div>

          {/* Transport + sync/keylock stack */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1 flex items-stretch gap-2">
              <div className="flex-1">
                <ToggleButton on={isPlaying} onChange={(v) => setIsPlaying(v)}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1.1em]">{isPlaying ? "❚❚" : "▶"}</span>
                    <span className="text-[0.6em] tracking-wider mt-0.5">
                      {isPlaying ? "PAUSE" : "PLAY"}
                    </span>
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <Button
                  onPress={() => {
                    setPlayhead(0.18);
                    setActiveCue(0);
                    if (!isPlaying) setIsPlaying(false);
                  }}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[1em]">◉</span>
                    <span className="text-[0.6em] tracking-wider mt-0.5">CUE</span>
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex-none flex items-stretch gap-2 h-[2rem]">
              <div className="flex-1">
                <ToggleButton on={synced} onChange={(v) => setSynced(v)}>
                  <span className="text-[0.72em] tracking-wider">SYNC</span>
                </ToggleButton>
              </div>
              <div className="flex-1">
                <ToggleButton on={keylock} onChange={(v) => setKeylock(v)}>
                  <span className="text-[0.72em] tracking-wider">KEY</span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Pitch fader */}
          <div className="flex-none flex flex-col items-center gap-1">
            <div className="flex-1 flex items-center">
              <div className="w-[1.6rem] h-full min-h-[6rem]">
                <Fader min={-8} max={8} value={pitch} onChange={(v) => setPitch(v)} orientation="vertical" />
              </div>
            </div>
            <span className="flex-none font-mono text-[10px] text-amber-400 leading-none">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
            <span className="flex-none font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
              PITCH
            </span>
          </div>
        </div>

        {/* --- Hot cue pads + loop controls --- */}
        <div className="flex-none flex items-stretch gap-2">
          {/* Hot cues */}
          <div className="flex-1 grid grid-cols-4 gap-1.5">
            {cueColors.map((label, i) => (
              <div key={"cue-" + i} className="h-[2.1rem]">
                <Pad
                  active={activeCue === i}
                  onPress={() => {
                    setActiveCue(i);
                    setPlayhead(0.18 + i * 0.12);
                  }}
                >
                  <span className="text-[0.85em] tracking-wide">{label}</span>
                </Pad>
              </div>
            ))}
          </div>

          {/* Loop controls */}
          <div className="flex-none flex items-stretch gap-1.5">
            <div className="w-[2.4rem]">
              <Button onPress={() => setLoopBeats((b) => Math.max(1, b / 2))}>
                <span className="text-[0.9em]">½</span>
              </Button>
            </div>
            <div className="w-[3.4rem] flex flex-col justify-center">
              <Readout>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-mono font-bold text-[1em] text-amber-400">{loopBeats}</span>
                  <span className="text-[0.5em] uppercase tracking-widest text-stone-500 mt-0.5">
                    BEAT
                  </span>
                </span>
              </Readout>
            </div>
            <div className="w-[2.4rem]">
              <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
                <span className="text-[0.9em]">×2</span>
              </Button>
            </div>
            <div className="w-[3rem]">
              <ToggleButton on={loopActive} onChange={(v) => setLoopActive(v)}>
                <span className="text-[0.7em] tracking-wide">LOOP</span>
              </ToggleButton>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
          {keylock ? "KEYLOCK ON" : "KEYLOCK OFF"}
        </span>
        <span className="flex items-center gap-2">
          {synced && (
            <span className="font-medium uppercase tracking-widest text-[10px] text-lime-300 animate-pulse">
              SYNC
            </span>
          )}
          <span className="font-mono text-[10px] text-lime-300">{timeStr}</span>
        </span>
      </div>
    </div>
  );
}