export default function GeneratedComponent() {
  const TRACK_LEN = 260; // seconds
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.18); // 0..1
  const [pitch, setPitch] = useState(0); // -8..+8 percent
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [jogAngle, setJogAngle] = useState(0);
  const [cues, setCues] = useState<number[]>([]); // stored positions 0..1
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [loopBeats, setLoopBeats] = useState(4);
  const [looping, setLooping] = useState(false);
  const cueHeld = useRef(false);
  const preCue = useRef(0.18);

  const baseBpm = 126;
  const bpm = useMemo(() => baseBpm * (1 + pitch / 100), [pitch]);

  // Deck B waveform lane (violet identity) — synthesized amplitude data
  const wave = useMemo(() => {
    const n = 340;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = Math.abs(Math.sin(t * Math.PI * 34));
      const swell = 0.35 + 0.5 * Math.abs(Math.sin(t * Math.PI * 3.2));
      const kick = beat > 0.86 ? 1 : 0.45;
      const grit = 0.85 + 0.15 * Math.sin(i * 12.9898) * Math.cos(i * 4.1414);
      arr.push(Math.min(1, swell * kick * grit));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const grid: number[] = [];
    for (let i = 0; i < 33; i++) grid.push(i / 32);
    return grid;
  }, []);

  // playback advance
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loopStart = useLoopStartRef.current;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPlayhead((p) => {
        const secPerBeat = 60 / bpm;
        const dur = TRACK_LEN;
        let np = p + dt / dur;
        if (looping) {
          const ls = loopRef.current.start;
          const le = ls + (loopRef.current.beats * secPerBeat) / dur;
          if (np >= le) np = ls + (np - le);
        }
        if (np >= 1) np = 0;
        return np;
      });
      // spin jog while playing
      setJogAngle((a) => a + dt * (bpm / 60) * (Math.PI * 2) * 0.5);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, bpm, looping]);

  const useLoopStartRef = useRef(0);
  const loopRef = useRef({ start: 0.18, beats: 4 });
  useEffect(() => {
    loopRef.current.beats = loopBeats;
  }, [loopBeats]);

  const currentTime = playhead * TRACK_LEN;
  const remaining = TRACK_LEN - currentTime;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return (
      String(m) +
      ":" +
      String(sec).padStart(2, "0") +
      "." +
      String(ms).padStart(2, "0")
    );
  };

  const level = useMemo(() => {
    const idx = Math.floor(playhead * wave.length);
    return playing ? wave[Math.max(0, Math.min(wave.length - 1, idx))] : 0.02;
  }, [playhead, wave, playing]);

  const handleCuePress = () => {
    // set / recall cue point at start (standard CUE behavior)
    if (!playing) {
      preCue.current = playhead;
      setActiveCue(activeCue === -1 ? null : -1);
    } else {
      setPlaying(false);
      setPlayhead(preCue.current);
    }
  };

  const hitCue = (i: number) => {
    setCues((prev) => {
      const next = [...prev];
      if (next[i] === undefined) {
        next[i] = playhead;
        setActiveCue(i);
      } else {
        setPlayhead(next[i]);
        setActiveCue(i);
        loopRef.current.start = next[i];
      }
      return next;
    });
  };

  const pitchColor = synced ? "text-lime-300" : "text-amber-400";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* HEADER */}
      <div className="flex-none h-8 px-3 flex items-center justify-between border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full bg-violet-400 shadow-lg shadow-violet-500/40" />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200 truncate">
            Deck B
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold tracking-tight text-[0.9rem] leading-none text-violet-300">
            {bpm.toFixed(1)}
          </span>
          <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
            BPM
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2">
        {/* Track info + waveform */}
        <div className="flex-none flex flex-col gap-1.5">
          <div className="h-9">
            <Readout>
              <span className="flex flex-col leading-none">
                <span className="font-semibold tracking-tight text-stone-100">
                  Midnight Circuit
                </span>
                <span className="text-[0.7em] font-normal tracking-wide text-stone-400 mt-0.5">
                  Nova Kane
                </span>
              </span>
            </Readout>
          </div>
          <div className="h-16 relative">
            <Waveform
              data={wave}
              playhead={playhead}
              beatGrid={beatGrid}
              zoom={0.5}
              onScrub={(pos) => {
                setPlayhead(pos);
                loopRef.current.start = pos;
              }}
            />
          </div>
        </div>

        {/* Middle: Jog + right column */}
        <div className="flex-1 min-h-0 flex gap-2">
          {/* Jog wheel */}
          <div className="flex-none flex flex-col items-center justify-center gap-1">
            <div className="w-[7rem] h-[7rem] relative">
              <JogWheel
                value={jogAngle}
                onScrub={(delta) => {
                  setJogAngle((a) => a + delta);
                  setPlayhead((p) => {
                    let np = p + delta / (Math.PI * 2) * 0.02;
                    if (np < 0) np = 0;
                    if (np > 1) np = 0.999;
                    loopRef.current.start = np;
                    return np;
                  });
                }}
              />
            </div>
            <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
              Scratch
            </span>
          </div>

          {/* Right column: pitch fader + meter + transport */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Pitch + level */}
            <div className="flex-1 min-h-0 flex items-stretch gap-2">
              <div className="flex-1 min-w-0 flex flex-col items-center gap-1">
                <div className="flex-1 flex items-center">
                  <div className="w-[1.6rem] h-full max-h-[8rem]">
                    <Fader
                      min={-8}
                      max={8}
                      value={pitch}
                      orientation="vertical"
                      onChange={(v) => {
                        setPitch(v);
                        if (synced) setSynced(false);
                      }}
                    />
                  </div>
                </div>
                <span className="font-mono font-bold text-[0.7rem] leading-none tracking-tight text-amber-400">
                  {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
                </span>
                <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
                  Pitch
                </span>
              </div>

              <div className="flex-none flex flex-col items-center gap-1">
                <div className="w-[1.5rem] flex-1 max-h-[8rem]">
                  <LevelMeter level={level} />
                </div>
                <span className="font-medium uppercase tracking-widest text-[9px] text-stone-500 leading-none">
                  Lvl
                </span>
              </div>

              {/* Toggles: Sync + Keylock */}
              <div className="flex-none flex flex-col gap-1.5 justify-center">
                <div className="w-[3rem] h-[1.6rem]">
                  <ToggleButton
                    on={synced}
                    onChange={(on) => {
                      setSynced(on);
                      if (on) setPitch(0);
                    }}
                  >
                    <span className="font-semibold uppercase tracking-wider text-[0.62em]">
                      Sync
                    </span>
                  </ToggleButton>
                </div>
                <div className="w-[3rem] h-[1.6rem]">
                  <ToggleButton on={keylock} onChange={setKeylock}>
                    <span className="font-semibold uppercase tracking-wider text-[0.62em]">
                      Key
                    </span>
                  </ToggleButton>
                </div>
              </div>
            </div>

            {/* Transport row */}
            <div className="flex-none grid grid-cols-2 gap-1.5">
              <div className="h-[1.9rem]">
                <Button onPress={handleCuePress}>
                  <span className="font-semibold uppercase tracking-wider text-[0.72em]">
                    Cue
                  </span>
                </Button>
              </div>
              <div className="h-[1.9rem]">
                <ToggleButton
                  on={playing}
                  onChange={(on) => {
                    setPlaying(on);
                    if (on) preCue.current = playhead;
                  }}
                >
                  <span className="flex items-center justify-center gap-1 font-semibold uppercase tracking-wider text-[0.72em]">
                    {playing ? "Pause" : "Play"}
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Hot cues + loop controls */}
        <div className="flex-none flex flex-col gap-1.5">
          {/* Hot cue pads */}
          <div className="grid grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={"cue-" + i} className="h-[2.25rem]">
                <Pad
                  active={cues[i] !== undefined}
                  onPress={() => hitCue(i)}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-semibold uppercase tracking-wider text-[0.85em]">
                      {i + 1}
                    </span>
                  </span>
                </Pad>
              </div>
            ))}
          </div>

          {/* Loop controls */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-1.5 items-stretch">
            <div className="h-[1.9rem]">
              <Button
                onPress={() =>
                  setLoopBeats((b) => Math.max(0.25, b / 2))
                }
              >
                <span className="font-semibold uppercase tracking-wider text-[0.72em]">
                  ½
                </span>
              </Button>
            </div>
            <div className="min-w-[4.5rem] h-[1.9rem]">
              <Readout>
                <span className="flex flex-col items-center leading-none">
                  <span
                    className={
                      "font-mono font-bold tracking-tight text-[1em] " +
                      (looping ? "text-lime-300" : "text-amber-400")
                    }
                  >
                    {loopBeats < 1 ? "1/" + Math.round(1 / loopBeats) : loopBeats}
                  </span>
                  <span className="text-[0.55em] font-medium uppercase tracking-widest text-stone-500 mt-0.5">
                    Beat Loop
                  </span>
                </span>
              </Readout>
            </div>
            <div className="h-[1.9rem]">
              <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
                <span className="font-semibold uppercase tracking-wider text-[0.72em]">
                  ×2
                </span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="h-[1.9rem]">
              <ToggleButton
                on={looping}
                onChange={(on) => {
                  setLooping(on);
                  if (on) loopRef.current.start = playhead;
                }}
              >
                <span className="font-semibold uppercase tracking-wider text-[0.7em]">
                  Loop
                </span>
              </ToggleButton>
            </div>
            <div className="h-[1.9rem]">
              <Button
                onPress={() => {
                  loopRef.current.start = playhead;
                  setLooping(true);
                }}
              >
                <span className="font-semibold uppercase tracking-wider text-[0.7em]">
                  Set In
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex-none h-6 px-3 flex items-center justify-between border-t border-stone-800/70 bg-stone-950/70">
        <span className="font-medium uppercase tracking-widest text-[10px] text-stone-500">
          CH 2
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-tight text-lime-300">
            {fmt(currentTime)}
          </span>
          <span className="font-mono text-[10px] tracking-tight text-stone-500">
            -{fmt(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}