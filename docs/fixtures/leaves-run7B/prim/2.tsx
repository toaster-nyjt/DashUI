export default function GeneratedComponent() {
  // ---- Track state (Deck B identity = violet) ----
  const [trackTitle] = useState("MIDNIGHT VOLTAGE");
  const [trackArtist] = useState("KOREDE & THE MACHINE");
  const [baseBpm] = useState(126.0);
  const [bpm, setBpm] = useState(126.0);

  // ---- Transport ----
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.28);
  const [cueDown, setCueDown] = useState(false);
  const cuePoint = useRef(0.12);

  // ---- Sync / Keylock ----
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(false);

  // ---- Pitch ----
  const [pitch, setPitch] = useState(0); // -8..+8 percent

  // ---- Jog ----
  const [jogAngle, setJogAngle] = useState(0);

  // ---- Loop ----
  const loopSizes = [1, 2, 4, 8, 16];
  const [loopIdx, setLoopIdx] = useState(1);
  const [looping, setLooping] = useState(false);

  // ---- Hot cues ----
  const [cues, setCues] = useState<(number | null)[]>([0.05, 0.34, null, null]);

  // ---- Waveform data (static synthesized sample) ----
  const waveData = useMemo(() => {
    const n = 220;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = Math.abs(Math.sin(t * Math.PI * 22));
      const env = 0.35 + 0.65 * Math.abs(Math.sin(t * Math.PI * 2.2));
      const kick = i % 14 < 2 ? 0.9 : 0.25;
      arr.push(Math.min(1, beat * env * kick + 0.08 + (i % 3) * 0.04));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const g: number[] = [];
    for (let i = 0; i <= 32; i++) g.push(i / 32);
    return g;
  }, []);

  // ---- Playback engine (state-driven, never scrolls host) ----
  useEffect(() => {
    if (!playing) return;
    const speed = (1 + pitch / 100) * (bpm / baseBpm) * 0.0009;
    const id = setInterval(() => {
      setPlayhead((p) => {
        let next = p + speed;
        if (looping) {
          const start = cuePoint.current;
          const span = (loopSizes[loopIdx] / 64) * (bpm / baseBpm);
          if (next > start + span) next = start;
        }
        if (next >= 1) next = 0;
        return next;
      });
      setJogAngle((a) => a + speed * Math.PI * 12);
    }, 16);
    return () => clearInterval(id);
  }, [playing, pitch, bpm, baseBpm, looping, loopIdx]);

  // ---- Sync adjusts pitch toward Deck A target ----
  useEffect(() => {
    if (synced) {
      setPitch(1.6);
      setBpm(128.0);
    } else {
      setBpm(baseBpm);
    }
  }, [synced, baseBpm]);

  const pitchPct = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";
  const effBpm = (bpm * (1 + pitch / 100)).toFixed(1);

  const handleScrub = (pos: number) => {
    setPlayhead(pos);
  };

  const handleJog = (delta: number) => {
    setJogAngle((a) => a + delta);
    setPlayhead((p) => Math.max(0, Math.min(1, p + delta * 0.02)));
  };

  const fireCue = (i: number) => {
    setCues((prev) => {
      const nx = [...prev];
      if (nx[i] == null) {
        nx[i] = playhead;
      } else {
        cuePoint.current = nx[i]!;
        setPlayhead(nx[i]!);
      }
      return nx;
    });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* HEADER */}
      <div className="h-8 shrink-0 flex items-center justify-between px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-lg shadow-violet-500/40 animate-pulse" />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
          <span className="font-medium uppercase tracking-widest text-[10px] text-violet-300/80">
            CH 2
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
          {playing ? (
            <span className="text-lime-300">▶ PLAY</span>
          ) : (
            <span className="text-stone-500">■ PAUSE</span>
          )}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* TRACK INFO + BPM ROW */}
        <div className="shrink-0 flex items-stretch gap-2">
          <div className="flex-1 min-w-0">
            <Readout>
              <div className="flex flex-col items-start justify-center h-full w-full min-w-0 px-1">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-stone-100 truncate w-full">
                  {trackTitle}
                </span>
                <span className="font-normal tracking-wide text-[10px] text-stone-500 truncate w-full">
                  {trackArtist}
                </span>
              </div>
            </Readout>
          </div>
          <div className="w-[5.5rem] flex flex-col items-stretch">
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 mb-0.5 text-center">
              BPM
            </span>
            <div className="flex-1">
              <Readout>
                <span
                  className={
                    "font-mono font-bold tracking-tight text-lg " +
                    (synced || keylock ? "text-lime-300" : "text-violet-300")
                  }
                >
                  {effBpm}
                </span>
              </Readout>
            </div>
          </div>
        </div>

        {/* WAVEFORM STRIP */}
        <div className="shrink-0 h-[3rem] rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden p-0.5">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.55}
            onScrub={handleScrub}
          />
        </div>

        {/* MAIN CONTROL AREA: JOG + RIGHT COLUMN */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* JOG WHEEL */}
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-[7.5rem] h-[7.5rem]">
              <JogWheel value={jogAngle} onScrub={handleJog} />
            </div>
            <div className="flex items-center gap-2">
              <ToggleButton on={synced} onChange={setSynced}>
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Sync
                </span>
              </ToggleButton>
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  Key
                </span>
              </ToggleButton>
            </div>
          </div>

          {/* RIGHT COLUMN: transport + pitch */}
          <div className="flex-1 min-w-0 flex gap-2">
            {/* TRANSPORT + LOOP + CUES */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* Transport buttons */}
              <div className="flex items-stretch gap-2 h-[2.2rem]">
                <div className="flex-1 min-w-0">
                  <Button onPress={() => {}}>
                    <div
                      onMouseDown={() => {
                        setCueDown(true);
                        cuePoint.current = playhead;
                      }}
                      onMouseUp={() => setCueDown(false)}
                      onMouseLeave={() => setCueDown(false)}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <span
                        className={
                          "font-semibold uppercase tracking-wider text-[11px] " +
                          (cueDown ? "text-amber-300" : "")
                        }
                      >
                        Cue
                      </span>
                    </div>
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <ToggleButton on={playing} onChange={setPlaying}>
                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                      {playing ? "❚❚" : "▶"}
                    </span>
                  </ToggleButton>
                </div>
              </div>

              {/* Loop controls */}
              <div className="flex flex-col gap-1">
                <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">
                  Loop
                </span>
                <div className="flex items-stretch gap-1 h-[1.9rem]">
                  <div className="w-[1.9rem]">
                    <Button
                      onPress={() =>
                        setLoopIdx((i) => Math.max(0, i - 1))
                      }
                    >
                      <span className="font-mono font-bold text-sm">÷</span>
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Readout>
                      <span className="font-mono font-bold tracking-tight text-amber-400 text-sm">
                        {loopSizes[loopIdx]}
                        <span className="text-[9px] text-stone-500 ml-0.5">
                          BT
                        </span>
                      </span>
                    </Readout>
                  </div>
                  <div className="w-[1.9rem]">
                    <Button
                      onPress={() =>
                        setLoopIdx((i) =>
                          Math.min(loopSizes.length - 1, i + 1)
                        )
                      }
                    >
                      <span className="font-mono font-bold text-sm">×</span>
                    </Button>
                  </div>
                </div>
                <div className="h-[1.9rem]">
                  <ToggleButton
                    on={looping}
                    onChange={(on) => {
                      setLooping(on);
                      if (on) cuePoint.current = playhead;
                    }}
                  >
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      {looping ? "Loop On" : "Loop"}
                    </span>
                  </ToggleButton>
                </div>
              </div>

              {/* Hot cue pads */}
              <div className="flex-1 min-h-0 flex flex-col gap-1">
                <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">
                  Hot Cues
                </span>
                <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-1">
                  {cues.map((c, i) => (
                    <Pad
                      key={"cue-" + i}
                      active={c != null}
                      onPress={() => fireCue(i)}
                    >
                      <span className="font-semibold uppercase tracking-wider text-[10px]">
                        {c != null ? "CUE " + (i + 1) : "SET " + (i + 1)}
                      </span>
                    </Pad>
                  ))}
                </div>
              </div>
            </div>

            {/* PITCH FADER */}
            <div className="w-[3.2rem] flex flex-col items-center gap-1">
              <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500">
                Pitch
              </span>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <Fader
                  min={-8}
                  max={8}
                  value={pitch}
                  onChange={(v) => {
                    setPitch(v);
                    if (synced) setSynced(false);
                  }}
                  orientation="vertical"
                />
              </div>
              <div className="w-full">
                <Readout>
                  <span
                    className={
                      "font-mono font-bold tracking-tight text-[11px] " +
                      (pitch === 0 ? "text-stone-100" : "text-violet-300")
                    }
                  >
                    {pitchPct}
                  </span>
                </Readout>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER STATUS */}
      <div className="h-6 shrink-0 flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-normal uppercase tracking-widest text-[10px] text-stone-500">
          {synced ? (
            <span className="text-lime-300 animate-pulse">◆ SYNC LOCK</span>
          ) : (
            <span>FREE</span>
          )}
        </span>
        <span className="font-mono uppercase tracking-widest text-[10px] text-lime-300">
          {(playhead * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}