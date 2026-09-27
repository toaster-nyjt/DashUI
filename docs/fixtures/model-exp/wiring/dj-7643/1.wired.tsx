export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + readouts 2.75 + gap 0.5 + main (jog 21 + gap 0.5 + transport 3 = 24.5) + footer 1.75 = 32.75 ≤ 38.1
  // BUDGET width: pad 1.5 + jog 21 + gap 0.75 + fader col 4 + gap 0.75 + right col 15.5 + pad 1.5 = 45 ≤ 48.6

  const [track, setTrack] = useState({ title: "MIDNIGHT VOLTAGE — KAORI B.", baseBpm: 128.0, duration: 312 });

  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [rot, setRot] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [keylock, setKeylock] = useState(true);
  const [sync, setSync] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [loopBeats, setLoopBeats] = useState("4");
  const [cueTime, setCueTime] = useState(0);
  const [activeCue, setActiveCue] = useState<number | null>(null);
  const [touching, setTouching] = useState(false);

  const cues = useMemo(
    () => [
      { id: 0, label: "INTRO", t: 0, assigned: true },
      { id: 1, label: "DROP", t: 64, assigned: true },
      { id: 2, label: "BRK", t: 148, assigned: true },
      { id: 3, label: "OUT", t: 0, assigned: false },
    ],
    []
  );

  const rate = 1 + pitch / 100;
  const bpm = track.baseBpm * rate;

  useEffect(() => {
    if (!playing || touching) return;
    const id = setInterval(() => {
      setPos((p) => {
        const n = p + 0.1 * rate;
        return n >= track.duration ? track.duration : n;
      });
      setRot((r) => r + 0.1 * rate * 0.5555);
    }, 100);
    return () => clearInterval(id);
  }, [playing, rate, touching, track.duration]);

  // Emit playhead / play state / tempo to the waveform display (state channel).
  useEffect(() => {
    bus.emit("DJ Table: Right Deck (Deck B)->DJ Table: Dual Waveform Display", {
      time: pos,
      duration: track.duration,
      playing,
      bpm,
    });
  }, [pos, track.duration, playing, bpm]);

  // Stream live output signal level + play state into the mixer's channel B (state channel).
  const level = useMemo<[number, number]>(() => {
    if (!playing) return [0, 0];
    const phase = pos * rate;
    const base = 0.55 + 0.4 * Math.abs(Math.sin(phase * 1.7));
    const l = Math.max(0, Math.min(1, base));
    const r = Math.max(0, Math.min(1, base * (0.9 + 0.12 * Math.abs(Math.cos(phase * 2.3)))));
    return [l, r];
  }, [playing, pos, rate]);

  useEffect(() => {
    bus.emit("DJ Table: Right Deck (Deck B)->DJ Table: Central Mixer Console", {
      playing,
      level,
    });
  }, [playing, level]);

  // Seek command from the waveform display (event channel).
  useEffect(
    () =>
      bus.on("DJ Table: Dual Waveform Display->DJ Table: Right Deck (Deck B)", (data) => {
        const t = Math.min(track.duration, Math.max(0, data.time));
        setPos(t);
        setActiveCue(null);
      }),
    [track.duration]
  );

  // Load a fresh track from the library browser (event channel).
  useEffect(
    () =>
      bus.on("DJ Table: Track Library Browser->DJ Table: Right Deck (Deck B)", (data) => {
        setTrack({
          title: (data.title + " — " + data.artist).toUpperCase(),
          baseBpm: data.bpm,
          duration: data.duration,
        });
        setPlaying(false);
        setPitch(0);
        setSync(false);
        setLoopOn(false);
        setActiveCue(null);
        setCueTime(data.cuePoint);
        setPos(data.cuePoint);
        setRot(0);
      }),
    []
  );

  const fmt = (s: number) => {
    const v = Math.max(0, s);
    const m = Math.floor(v / 60);
    const sec = Math.floor(v % 60);
    return m + ":" + (sec < 10 ? "0" + sec : sec);
  };

  const scrub = useCallback((d: number) => {
    setRot((r) => r + d);
    setPos((p) => Math.min(track.duration, Math.max(0, p + d * 1.8)));
  }, [track.duration]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#050308] text-zinc-100 font-sans">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-violet-500/25">
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_currentColor] text-amber-400" />
        <span className="text-sm font-bold tracking-[0.18em] uppercase text-zinc-200 truncate">Deck B</span>
        <span className="ml-auto flex items-center gap-2">
          <Indicator active={playing} tone="accent" blink={false} />
          <span className="text-[10px] font-medium tracking-wide uppercase text-zinc-600">
            {playing ? "PLAYING" : "PAUSED"}
          </span>
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* READOUT STRIP */}
        <div className="flex-none flex items-stretch gap-2 h-[2.75rem]">
          <div className="flex-1">
            <Readout value={track.title} marquee />
          </div>
          <div className="w-[7rem]">
            <Readout value={bpm} unit="BPM" decimals={2} />
          </div>
          <div className="w-[5.5rem]">
            <Readout value={fmt(pos)} />
          </div>
          <div className="w-[5.5rem]">
            <Readout value={"-" + fmt(track.duration - pos)} />
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex items-stretch gap-3">
          {/* LEFT: PLATTER + TRANSPORT */}
          <div className="flex flex-col gap-2">
            <div className="w-[21rem] h-[21rem]">
              <JogWheel
                rotation={rot}
                spinning={playing && !touching}
                onScrub={scrub}
                onTouchChange={setTouching}
              />
            </div>
            <div className="flex gap-2 h-[3.25rem]">
              <div className="w-[7rem]">
                <PushButton
                  mode="momentary"
                  tone="neutral"
                  onPress={() => {
                    setPos(cueTime);
                    setPlaying(false);
                    setActiveCue(null);
                  }}
                >
                  <span className="font-bold uppercase tracking-[0.12em]">CUE</span>
                </PushButton>
              </div>
              <div className="flex-1">
                <PushButton mode="toggle" tone="accent" on={playing} onChange={setPlaying}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-bold uppercase tracking-[0.12em]">
                      {playing ? "PAUSE" : "PLAY"}
                    </span>
                    <span className="text-[0.62em] tracking-[0.2em] opacity-70">DECK B</span>
                  </span>
                </PushButton>
              </div>
              <div className="w-[6rem]">
                <PushButton
                  mode="toggle"
                  tone="accent"
                  on={sync}
                  onChange={(v) => {
                    setSync(v);
                    if (v) setPitch(0);
                  }}
                >
                  <span className="font-bold uppercase tracking-[0.12em]">SYNC</span>
                </PushButton>
              </div>
            </div>
          </div>

          {/* PITCH FADER COLUMN */}
          <div className="flex flex-col items-center gap-1 w-[4rem]">
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">PITCH</span>
            <div className="flex-1 w-[3rem]">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={(v) => {
                  setPitch(v);
                  setSync(false);
                }}
                orientation="vertical"
                bipolar
                detents={[0]}
              />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_6px_currentColor]">
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}
            </span>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 flex flex-col gap-2">
            {/* HOT CUES */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">Hot Cues</span>
              <div className="grid grid-cols-2 gap-2">
                {cues.map((c) => (
                  <div key={"cue-" + c.id} className="h-[4.5rem]">
                    <CuePad
                      assigned={c.assigned}
                      active={activeCue === c.id}
                      onPress={() => {
                        if (!c.assigned) return;
                        setActiveCue(c.id);
                        setPos(c.t);
                      }}
                      onLongPress={() => {
                        setCueTime(pos);
                        setActiveCue(c.id);
                      }}
                    >
                      <span className="flex flex-col items-center leading-none">
                        <span className="font-bold uppercase tracking-[0.14em]">{c.label}</span>
                        <span className="text-[0.62em] font-mono opacity-70">{fmt(c.t)}</span>
                      </span>
                    </CuePad>
                  </div>
                ))}
              </div>
            </div>

            {/* LOOP */}
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500">Loop</span>
              <div className="h-[2rem]">
                <SegmentedSelector
                  options={[
                    { id: "1", label: "1" },
                    { id: "2", label: "2" },
                    { id: "4", label: "4" },
                    { id: "8", label: "8" },
                    { id: "16", label: "16" },
                  ]}
                  value={loopBeats}
                  onChange={setLoopBeats}
                  orientation="horizontal"
                />
              </div>
              <div className="flex gap-2 h-[2.5rem]">
                <div className="flex-1">
                  <PushButton mode="toggle" tone="accent" on={loopOn} onChange={setLoopOn}>
                    <span className="font-bold uppercase tracking-[0.12em]">
                      {loopOn ? "EXIT" : "LOOP"}
                    </span>
                  </PushButton>
                </div>
                <div className="w-[6.5rem]">
                  <Readout value={loopBeats + " BEAT"} />
                </div>
              </div>
            </div>

            {/* KEYLOCK */}
            <div className="mt-auto flex items-center justify-between gap-2 h-[2.25rem] px-2 rounded-xl bg-[#08060f] border border-zinc-800/80 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-zinc-500 truncate">
                Keylock
              </span>
              <div className="w-[3.5rem] h-[1.75rem]">
                <ToggleSwitch on={keylock} onChange={setKeylock} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center justify-between px-3 bg-zinc-950/90 border-t border-zinc-800/80 text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
        <span className="truncate">CH-B · {keylock ? "KEYLOCK ON" : "KEYLOCK OFF"}</span>
        <span className="truncate">{sync ? "SYNC LOCKED" : "PITCH " + (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%"}</span>
      </div>
    </div>
  );
}