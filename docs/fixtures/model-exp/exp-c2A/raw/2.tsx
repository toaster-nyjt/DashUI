export default function GeneratedComponent() {
  const TRACK_TITLE = "PHANTOM CIRCUIT";
  const TRACK_ARTIST = "VELA KANE";
  const TRACK_KEY = "4A";
  const BASE_BPM = 126;
  const DURATION = 312;
  const MASTER_BPM = 128;

  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0.085);
  const [pitch, setPitch] = useState(0);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [angle, setAngle] = useState(0);
  const [cuePoint, setCuePoint] = useState(0.085);
  const [cues, setCues] = useState<(number | null)[]>([0.03, 0.271, null, null]);
  const [loopOn, setLoopOn] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopStart, setLoopStart] = useState(0.085);
  const [bend, setBend] = useState(0);
  const bendTimer = useRef<number | null>(null);

  const effBpm = BASE_BPM * (1 + pitch / 100);

  /* ---------- transport clock ---------- */
  useEffect(() => {
    if (!playing) return;
    const TICK = 70;
    const id = window.setInterval(() => {
      const step = ((TICK / 1000) * (1 + pitch / 100)) / DURATION;
      setPlayhead((p) => {
        let np = p + step;
        if (loopOn) {
          const len = ((loopBeats * 60) / effBpm) / DURATION;
          if (len > 0 && np >= loopStart + len) {
            np = loopStart + ((np - loopStart) % len);
          }
        }
        if (np >= 1) np -= 1;
        return np;
      });
      setAngle((a) => a + 0.13 * (1 + pitch / 100));
    }, TICK);
    return () => window.clearInterval(id);
  }, [playing, pitch, loopOn, loopBeats, loopStart, effBpm]);

  useEffect(() => {
    return () => {
      if (bendTimer.current) window.clearTimeout(bendTimer.current);
    };
  }, []);

  /* ---------- audio-ish sample data ---------- */
  const waveData = useMemo(() => {
    const n = 512;
    const arr: number[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const beat = i % 8;
      const kick = beat === 0 ? 1 : beat === 4 ? 0.7 : 0;
      const hat = beat === 2 || beat === 6 ? 0.3 : 0;
      const bass = 0.26 + 0.16 * Math.sin(i * 0.9);
      let env = 0.62 + 0.38 * Math.sin(t * Math.PI * 2.4 - 0.6);
      if (t > 0.4 && t < 0.52) env *= 0.34;
      if (t >= 0.52 && t < 0.57) env *= 0.45 + (t - 0.52) * 11;
      if (t < 0.04) env *= 0.3 + t * 17;
      if (t > 0.94) env *= Math.max(0.12, (1 - t) * 14);
      const v = (kick + hat + bass + 0.1 * Math.abs(Math.sin(i * 2.7))) * env;
      arr.push(Math.max(0.04, Math.min(1, v)));
    }
    return arr;
  }, []);

  const beatGrid = useMemo(() => {
    const totalBeats = (DURATION * BASE_BPM) / 60;
    const g: number[] = [];
    for (let b = 0; b <= totalBeats; b += 16) g.push(b / totalBeats);
    return g;
  }, []);

  /* ---------- derived ---------- */
  const fmt = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : String(r));
  };
  const elapsed = playhead * DURATION;
  const pitchStr = (pitch >= 0 ? "+" : "") + pitch.toFixed(1) + "%";
  const bpmStr = effBpm.toFixed(1);
  const loopLabel =
    loopBeats < 1 ? (loopBeats >= 0.5 ? "1/2" : "1/4") : String(loopBeats);
  const cueCount = cues.filter((c) => c !== null).length;

  const beatPos = (playhead * DURATION) / (60 / effBpm);
  const phase = beatPos - Math.floor(beatPos);
  const pulse = Math.pow(1 - phase, 2.5);
  const glow = playing ? 0.16 + 0.68 * pulse : 0.07;
  const ringScale = playing ? 1 + 0.035 * pulse : 1;

  /* ---------- handlers ---------- */
  const handleScrub = useCallback((delta: number) => {
    setAngle((a) => a + delta);
    setPlayhead((p) => Math.min(0.9995, Math.max(0, p + delta * 0.006)));
    setBend(delta);
    if (bendTimer.current) window.clearTimeout(bendTimer.current);
    bendTimer.current = window.setTimeout(() => setBend(0), 280);
  }, []);

  const handleSeek = useCallback((pos: number) => {
    setPlayhead(Math.min(0.9995, Math.max(0, pos)));
  }, []);

  const handleCue = () => {
    if (playing) {
      setPlaying(false);
      setPlayhead(cuePoint);
    } else if (Math.abs(playhead - cuePoint) > 0.0015) {
      setCuePoint(playhead);
    } else {
      setPlaying(true);
    }
  };

  const handleSync = (on: boolean) => {
    setSynced(on);
    if (on) setPitch(Number((((MASTER_BPM / BASE_BPM) - 1) * 100).toFixed(1)));
  };

  const handlePitch = (v: number) => {
    setPitch(Number(v.toFixed(1)));
    if (synced) setSynced(false);
  };

  const handleCuePad = (i: number) => {
    const pos = cues[i];
    if (pos === null) {
      setCues((prev) => {
        const next = prev.slice();
        next[i] = playhead;
        return next;
      });
    } else {
      setPlayhead(pos);
    }
  };

  const toggleLoop = () => {
    if (loopOn) {
      setLoopOn(false);
    } else {
      setLoopStart(playhead);
      setLoopOn(true);
    }
  };

  const padLabels = ["A", "B", "C", "D"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none font-sans bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 text-stone-100">
      {/* HEADER */}
      <div className="h-8 flex-none flex items-center gap-2 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <span
          className="text-violet-400 text-[11px] leading-none transition-all duration-200 ease-out"
          style={{ opacity: 0.55 + 0.45 * (playing ? pulse : 0.6) }}
        >
          ◆
        </span>
        <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
          Deck B
        </span>
        <span className="text-[10px] uppercase tracking-widest text-stone-600">
          / ch2
        </span>
        <div className="ml-auto flex items-center gap-1.5 rounded-md border border-violet-500/40 px-2 py-[2px] transition-all duration-200 ease-out">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
              (playing
                ? "bg-lime-400 animate-pulse shadow-lg shadow-lime-400/40"
                : "bg-stone-600")
            }
          />
          <span
            className={
              "text-[10px] uppercase tracking-widest leading-none transition-colors duration-200 " +
              (playing ? "text-lime-300" : "text-stone-400")
            }
          >
            {playing ? "Live" : "Cued"}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-2 p-2">
        {/* INFO ROW */}
        <div className="flex gap-2 h-[2.8rem]">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">
                  {TRACK_TITLE}
                </span>
                <span className="text-[0.7em] uppercase tracking-widest text-stone-400">
                  {TRACK_ARTIST + " · " + TRACK_KEY}
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[5rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (synced ? "text-lime-300 animate-pulse" : "text-amber-400")
                  }
                >
                  {bpmStr}
                </span>
                <span className="text-[0.52em] uppercase tracking-widest text-stone-500">
                  bpm
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[3.4rem]">
            <ToggleButton on={synced} onChange={handleSync}>
              <span className="font-semibold uppercase tracking-wider">Sync</span>
            </ToggleButton>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="h-[2.9rem]">
          <Waveform
            data={waveData}
            playhead={playhead}
            beatGrid={beatGrid}
            zoom={0.72}
            onScrub={handleSeek}
          />
        </div>

        {/* MAIN */}
        <div className="flex-1 flex gap-2">
          {/* JOG + TRANSPORT */}
          <div className="flex-[5] flex flex-col gap-2">
            <div className="flex-1 flex items-center justify-center">
              <div className="relative h-full aspect-square">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-2 rounded-full bg-violet-500/25 blur-xl transition-opacity duration-100 ease-linear"
                  style={{ opacity: glow }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-[3px] rounded-full border border-violet-500/30 transition-transform duration-100 ease-linear"
                  style={{ transform: "scale(" + ringScale + ")" }}
                />
                <div
                  aria-hidden
                  className={
                    "pointer-events-none absolute -inset-[3px] rounded-full border transition-all duration-200 ease-out " +
                    (bend > 0
                      ? "border-t-amber-400/70 border-r-amber-400/40 border-b-transparent border-l-transparent"
                      : bend < 0
                      ? "border-b-amber-400/70 border-l-amber-400/40 border-t-transparent border-r-transparent"
                      : "border-transparent")
                  }
                />
                <div className="absolute inset-0">
                  <JogWheel value={angle} onScrub={handleScrub} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 h-[2.7rem]">
              <div className="flex-[3]">
                <ToggleButton on={playing} onChange={setPlaying}>
                  <span className="flex items-center gap-[0.4em] font-semibold uppercase tracking-wider">
                    <span>{playing ? "❚❚" : "▶"}</span>
                    <span>{playing ? "Pause" : "Play"}</span>
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-[2]">
                <Button onPress={handleCue}>
                  <span className="font-semibold uppercase tracking-wider">Cue</span>
                </Button>
              </div>
            </div>
          </div>

          {/* PADS + LOOP */}
          <div className="flex-[4] flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
                Hot Cues
              </span>
              <span className="text-[10px] font-mono leading-none text-violet-300/80">
                {cueCount + "/4"}
              </span>
            </div>
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
              {cues.map((c, i) => (
                <Pad
                  key={"hotcue-" + i}
                  active={c !== null}
                  onPress={() => handleCuePad(i)}
                >
                  <span className="flex flex-col items-center gap-[0.18em] leading-none">
                    <span className="font-semibold uppercase tracking-wider">
                      {padLabels[i]}
                    </span>
                    <span className="text-[0.58em] font-mono tracking-tight">
                      {c === null ? "--:--" : fmt(c * DURATION)}
                    </span>
                  </span>
                </Pad>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
                  Loop
                </span>
                <span
                  className={
                    "text-[10px] uppercase tracking-widest leading-none transition-colors duration-200 ease-out " +
                    (loopOn ? "text-lime-300 animate-pulse" : "text-stone-600")
                  }
                >
                  {loopOn ? "Active" : "Off"}
                </span>
              </div>
              <div className="h-[1.55rem]">
                <Readout>
                  <span
                    className={
                      "font-mono font-bold tracking-tight " +
                      (loopOn ? "text-lime-300" : "text-stone-500")
                    }
                  >
                    {loopLabel + " BEAT"}
                  </span>
                </Readout>
              </div>
              <div className="grid grid-cols-3 gap-1.5 h-[1.9rem]">
                <Button
                  onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}
                >
                  <span className="font-semibold tracking-wider">½</span>
                </Button>
                <Button onPress={toggleLoop}>
                  <span className="font-semibold uppercase tracking-wider">
                    Loop
                  </span>
                </Button>
                <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
                  <span className="font-semibold tracking-wider">×2</span>
                </Button>
              </div>
            </div>
          </div>

          {/* KEYLOCK + PITCH */}
          <div className="w-[3.2rem] flex flex-col gap-2">
            <div className="h-[1.8rem]">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Key</span>
              </ToggleButton>
            </div>
            <div className="text-center text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
              Pitch
            </div>
            <div className="flex-1">
              <Fader
                min={-8}
                max={8}
                value={pitch}
                onChange={handlePitch}
                orientation="vertical"
              />
            </div>
            <div
              className={
                "text-center font-mono text-[11px] leading-none transition-colors duration-200 ease-out " +
                (bend !== 0
                  ? "text-amber-300"
                  : synced
                  ? "text-lime-300"
                  : "text-stone-300")
              }
            >
              {pitchStr}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center gap-3 px-3 border-t border-stone-800/70 bg-stone-950/70 text-[10px] uppercase tracking-widest text-stone-500">
        <span className="truncate">Ch 2</span>
        <span className="font-mono text-lime-300 transition-all duration-100 ease-linear">
          {fmt(elapsed)}
        </span>
        <span className="font-mono text-stone-600 transition-all duration-100 ease-linear">
          {"-" + fmt(DURATION - elapsed)}
        </span>
        <span className="ml-auto truncate text-stone-600">
          {keylock ? "Key Lock" : "Key Free"}
        </span>
        <span
          className={
            "font-mono transition-colors duration-200 ease-out " +
            (bend !== 0 ? "text-amber-300" : "text-lime-300")
          }
        >
          {bend !== 0 ? (bend > 0 ? "bend +" : "bend −") : pitchStr}
        </span>
      </div>
    </div>
  );
}