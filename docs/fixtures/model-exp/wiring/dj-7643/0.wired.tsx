export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + titlestrip 2 + main(jog/fader) 17 + transport 2.5 + pads 3.5 + loop 2 + footer 1.75 + gaps 1.5 = 32.5 ≤ 38.1
  // BUDGET width: jog 17 + gap 0.75 + readouts 9 + gap 0.75 + fader col 4.5 + padding 1.5 = 33.5 ≤ 48.6

  const [track, setTrack] = useState({
    title: "NIGHTDRIVE ▸ VELVET AXIS",
    artist: "",
    baseBpm: 128,
    key: "",
    duration: 372,
    waveform: [] as number[],
  });

  const DUR = track.duration;
  const BASE_BPM = track.baseBpm;

  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [rot, setRot] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [keylock, setKeylock] = useState(true);
  const [sync, setSync] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [loopLen, setLoopLen] = useState("4");
  const [scrubbing, setScrubbing] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [cues, setCues] = useState<(number | null)[]>([0, 32.5, 96.25, null]);
  const cueRef = useRef(0);

  const rate = 1 + pitch / 100;
  const bpm = BASE_BPM * rate;

  useEffect(() => {
    if (!playing || scrubbing) return;
    const id = setInterval(() => {
      const d = 0.05 * rate;
      setTime((t) => (t + d) % DUR);
      setRot((r) => r + d / 1.8);
    }, 50);
    return () => clearInterval(id);
  }, [playing, scrubbing, rate, DUR]);

  // Stream playhead / play state / effective tempo to the waveform display
  useEffect(() => {
    bus.emit("DJ Table: Left Deck (Deck A)->DJ Table: Dual Waveform Display", {
      time,
      duration: DUR,
      playing,
      bpm,
    });
  }, [time, DUR, playing, bpm]);

  // Stream output signal level + play state to the mixer's channel A
  const level = useMemo<[number, number]>(() => {
    if (!playing) return [0, 0];
    const base = 0.55 + 0.35 * Math.abs(Math.sin(time * 2.3));
    const l = Math.min(1, Math.max(0, base + 0.05 * Math.sin(time * 7.1)));
    const r = Math.min(1, Math.max(0, base + 0.05 * Math.sin(time * 6.3 + 1.2)));
    return [Number(l.toFixed(3)), Number(r.toFixed(3))];
  }, [playing, time]);

  useEffect(() => {
    bus.emit("DJ Table: Left Deck (Deck A)->DJ Table: Central Mixer Console", {
      playing,
      level,
    });
  }, [playing, level]);

  // Seek command from the waveform display (Deck A lane)
  useEffect(
    () =>
      bus.on("DJ Table: Dual Waveform Display->DJ Table: Left Deck (Deck A)", (data) => {
        setTime(Math.min(DUR, Math.max(0, data.time)));
      }),
    [DUR]
  );

  // Load a fresh track from the library browser
  useEffect(
    () =>
      bus.on("DJ Table: Track Library Browser->DJ Table: Left Deck (Deck A)", (data) => {
        setTrack({
          title: (data.title || "").toUpperCase() + (data.artist ? " ▸ " + data.artist.toUpperCase() : ""),
          artist: data.artist,
          baseBpm: data.bpm,
          key: data.key,
          duration: data.duration,
          waveform: data.waveform || [],
        });
        cueRef.current = 0;
        setTime(0);
        setRot(0);
        setPlaying(false);
        setPitch(0);
        setLoopOn(false);
        setActiveCue(null);
        setCues([0, null, null, null]);
      }),
    []
  );

  const fmt = (s: number) => {
    const v = Math.max(0, s);
    const m = Math.floor(v / 60);
    const sec = Math.floor(v % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const scrub = useCallback((d: number) => {
    setRot((r) => r + d);
    setTime((t) => Math.min(DUR, Math.max(0, t + d * 1.8)));
  }, [DUR]);

  const hitCue = (i: number) => {
    setCues((c) => {
      if (c[i] == null) {
        const n = [...c];
        n[i] = time;
        return n;
      }
      return c;
    });
    const target = cues[i];
    if (target != null) setTime(target);
    setActiveCue(i);
    setTimeout(() => setActiveCue((a) => (a === i ? null : a)), 220);
  };

  const beats = [
    { id: "0.25", label: "1/4" },
    { id: "1", label: "1" },
    { id: "4", label: "4" },
    { id: "8", label: "8" },
  ];

  const prog = time / DUR;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#050308] text-zinc-100">
      {/* header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-violet-500/25">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 text-cyan-400 shadow-[0_0_8px_currentColor] animate-pulse" />
          <span className="text-sm font-bold tracking-[0.18em] uppercase text-zinc-200 truncate">Deck A</span>
        </div>
        <div className="flex items-center gap-2">
          <Indicator active={playing} tone="accent" blink={playing} />
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">
            {playing ? "playing" : "standby"}
          </span>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* track title */}
        <div className="flex-none h-[2rem] flex items-stretch gap-2">
          <div className="flex-1 h-[2rem]">
            <Readout value={track.title} marquee />
          </div>
          <div className="w-[7rem] h-[2rem]">
            <Readout value={bpm} unit="BPM" decimals={1} />
          </div>
        </div>

        {/* main row */}
        <div className="flex-1 flex items-stretch gap-2">
          {/* jog + transport */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full blur-2xl transition-opacity duration-500"
                style={{
                  opacity: playing ? 0.35 : 0.1,
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(34,211,238,0.5), transparent 62%)",
                }}
              />
              <div className="h-full aspect-square relative">
                <JogWheel
                  rotation={rot}
                  spinning={playing}
                  onScrub={scrub}
                  onTouchChange={setScrubbing}
                />
              </div>
            </div>
            <div className="flex-none h-[2.5rem] flex items-stretch gap-2">
              <div className="w-[5rem] h-[2.5rem]">
                <PushButton mode="momentary" tone="neutral" onPress={() => { setTime(cueRef.current); setPlaying(false); }}>
                  <span className="font-bold uppercase tracking-[0.12em]">CUE</span>
                </PushButton>
              </div>
              <div className="flex-1 h-[2.5rem]">
                <PushButton mode="toggle" tone="accent" on={playing} onChange={setPlaying}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-bold uppercase tracking-[0.12em]">{playing ? "PAUSE" : "PLAY"}</span>
                    <span className="text-[0.6em] tracking-[0.2em] opacity-70">DECK A</span>
                  </span>
                </PushButton>
              </div>
              <div className="w-[5rem] h-[2.5rem]">
                <PushButton mode="toggle" tone="accent" on={sync} onChange={setSync}>
                  <span className="font-bold uppercase tracking-[0.12em]">SYNC</span>
                </PushButton>
              </div>
            </div>
          </div>

          {/* time + pitch column */}
          <div className="w-[13rem] flex items-stretch gap-2">
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-[2rem]">
                <Readout value={fmt(time)} unit="ELAP" />
              </div>
              <div className="h-[2rem]">
                <Readout value={"-" + fmt(DUR - time)} unit="REM" />
              </div>
              <div className="flex-1 rounded-xl border border-zinc-800/80 bg-[#08060f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-2 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500 truncate">Keylock</span>
                  <div className="w-[3.25rem] h-[1.75rem]">
                    <ToggleSwitch on={keylock} onChange={setKeylock} />
                  </div>
                </div>
                <div className="relative h-[0.4rem] rounded-full bg-zinc-900 border border-zinc-800 overflow-clip">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-75 ease-linear"
                    style={{ width: (prog * 100).toFixed(2) + "%" }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-600">PITCH</span>
                  <span className="font-mono font-bold tracking-tight text-cyan-300 drop-shadow-[0_0_6px_currentColor] text-sm">
                    {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="w-[3.25rem] flex flex-col items-center gap-1">
              <div className="w-[3.25rem] flex-1">
                <Fader
                  min={-8}
                  max={8}
                  value={pitch}
                  onChange={setPitch}
                  orientation="vertical"
                  bipolar
                  detents={[-8, -4, 0, 4, 8]}
                />
              </div>
              <span className="flex-none text-[10px] font-semibold tracking-[0.14em] uppercase text-zinc-500">PITCH</span>
            </div>
          </div>
        </div>

        {/* hot cues + loop */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={"cue-" + i} className="w-[3.25rem] h-[3.25rem]">
                <CuePad
                  onPress={() => hitCue(i)}
                  onLongPress={() => setCues((c) => { const n = [...c]; n[i] = null; return n; })}
                  assigned={cues[i] != null}
                  active={activeCue === i}
                >
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-bold">{i + 1}</span>
                    <span className="text-[0.55em] tracking-[0.2em] opacity-70">
                      {cues[i] != null ? fmt(cues[i] as number) : "SET"}
                    </span>
                  </span>
                </CuePad>
              </div>
            ))}
          </div>
          <div className="flex-1 flex items-stretch gap-2 rounded-xl border border-zinc-800/80 bg-[#08060f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-2">
            <div className="w-[4.5rem] h-[2.25rem]">
              <PushButton mode="toggle" tone="accent" on={loopOn} onChange={setLoopOn}>
                <span className="font-bold uppercase tracking-[0.12em]">LOOP</span>
              </PushButton>
            </div>
            <div className="flex-1 h-[2.25rem]">
              <SegmentedSelector options={beats} value={loopLen} onChange={setLoopLen} />
            </div>
            <div className="w-[5.5rem] h-[2.25rem]">
              <Readout value={loopLen} unit="BEATS" />
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-zinc-950/90 border-t border-zinc-800/80">
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500 truncate">
          CH-A · {keylock ? "KEYLOCK ON" : "KEYLOCK OFF"} · {sync ? "SYNCED" : "FREE"}
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-300/80 truncate">
          {loopOn ? "LOOP " + loopLen + "B ACTIVE" : "LOOP IDLE"}
        </span>
      </div>
    </div>
  );
}