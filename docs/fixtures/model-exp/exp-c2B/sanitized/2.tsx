export default function GeneratedComponent() {
  const BASE_BPM = 126;
  const MASTER_BPM = 128;
  const TOTAL_BEATS = 96;
  const TICK = 60;
  const trackSeconds = (TOTAL_BEATS * 60) / BASE_BPM;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const [playing, setPlaying] = useState(true);
  const [pos, setPos] = useState(0.212);
  const [pitch, setPitch] = useState(0);
  const [synced, setSynced] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [angle, setAngle] = useState(0);
  const [cuePoint, setCuePoint] = useState(0.212);
  const [cues, setCues] = useState([0.06, 0.34, null, null]);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [armed, setArmed] = useState(false);

  const wave = useMemo(() => {
    const n = 288;
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const section =
        t < 0.1 ? 0.4 : t < 0.28 ? 0.78 : t < 0.4 ? 0.52 : t < 0.7 ? 1 : t < 0.86 ? 0.72 : 0.38;
      const kick = Math.pow(Math.abs(Math.sin((i * Math.PI) / 6)), 8);
      const rnd = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
      out.push(clamp(section * (0.34 + 0.4 * rnd + 0.46 * kick), 0.05, 1));
    }
    return out;
  }, []);

  const grid = useMemo(() => Array.from({ length: 24 }, (_, i) => i / 24), []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const rate = 1 + pitch / 100;
      const step = (TICK / 1000 / trackSeconds) * rate;
      setPos((p) => {
        let n = p + step;
        if (loopActive) {
          const len = Math.max(0.25, loopBeats) / TOTAL_BEATS;
          if (n >= loopStart + len) n = loopStart + ((n - loopStart) % len);
        }
        if (n >= 1) n -= 1;
        return n;
      });
      setAngle((a) => a + 0.26 * rate);
    }, TICK);
    return () => clearInterval(id);
  }, [playing, pitch, loopActive, loopBeats, loopStart, trackSeconds]);

  const bpm = BASE_BPM * (1 + pitch / 100);
  const beatPos = pos * TOTAL_BEATS;
  const beatFrac = beatPos - Math.floor(beatPos);
  const beatInBar = Math.floor(beatPos) % 4;
  const glow = playing ? 0.3 + 0.7 * (1 - beatFrac) : 0.3;
  const glowScale = playing ? 0.8 + 0.45 * (1 - beatFrac) : 1;

  const handleCue = () => {
    if (playing) {
      setPlaying(false);
      setPos(cuePoint);
    } else if (Math.abs(pos - cuePoint) > 0.0008) {
      setPos(cuePoint);
    } else {
      setCuePoint(pos);
    }
  };

  const handleSync = (on) => {
    setSynced(on);
    if (on) {
      setPitch(Math.round(clamp((MASTER_BPM / BASE_BPM - 1) * 100, -8, 8) * 10) / 10);
      setPos((p) => p - ((p * TOTAL_BEATS) % 1) / TOTAL_BEATS);
    }
  };

  const handlePitch = (v) => {
    setPitch(Math.round(v * 10) / 10);
    setSynced(false);
  };

  const handleScrub = (delta) => {
    setAngle((a) => a + delta);
    setPos((p) => clamp(p + delta * 0.012, 0, 0.9999));
  };

  const handlePad = (i) => {
    if (cues[i] == null) {
      setCues((prev) => {
        const n = prev.slice();
        n[i] = pos;
        return n;
      });
    } else {
      setPos(cues[i]);
    }
  };

  const loopLabel = loopActive
    ? loopBeats >= 1
      ? loopBeats + " BEAT"
      : "1/" + Math.round(1 / loopBeats) + " BT"
    : armed
    ? "IN SET"
    : "LOOP OFF";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-neutral-900 font-sans text-stone-100">
      <style>{"@keyframes dkb_sweep{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}"}</style>

      {/* HEADER */}
      <div className="h-8 flex-none relative overflow-hidden flex items-center justify-between px-3 border-b border-violet-500/15 bg-neutral-900/80 bg-gradient-to-r from-violet-500/10 to-transparent">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-violet-400/10 to-transparent"
          style={{ animation: "dkb_sweep 4.5s linear infinite" }}
        />
        <div className="relative flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-violet-400 shadow-lg shadow-violet-500/50 transition-all duration-100 ease-linear"
            style={{ opacity: glow, transform: "scale(" + glowScale + ")" }}
          />
          <span className="font-semibold uppercase tracking-widest text-[11px] text-stone-200">
            Deck B
          </span>
        </div>
        <div className="relative flex items-center gap-2">
          {synced ? (
            <span className="text-[10px] uppercase tracking-widest text-lime-300 animate-pulse">
              Lock
            </span>
          ) : null}
          <span className="text-[10px] uppercase tracking-widest text-stone-500">Ch 2</span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TRACK INFO + BPM */}
        <div className="h-[2.5rem] flex gap-2">
          <div className="flex-1">
            <Readout>
              <span className="flex flex-col items-start leading-tight">
                <span className="font-semibold tracking-tight text-stone-100">
                  MIDNIGHT TANGERINE
                </span>
                <span className="text-[0.6em] uppercase tracking-widest text-stone-500">
                  Velvet Circuit
                </span>
              </span>
            </Readout>
          </div>
          <div className="w-[5.5rem]">
            <Readout>
              <span className="flex flex-col items-center leading-none">
                <span
                  className={
                    "font-mono font-bold tracking-tight " +
                    (synced ? "text-lime-300" : "text-amber-400")
                  }
                >
                  {bpm.toFixed(1)}
                </span>
                <span className="text-[0.45em] uppercase tracking-widest text-stone-500">BPM</span>
              </span>
            </Readout>
          </div>
        </div>

        {/* WAVEFORM */}
        <div className="h-[2.75rem] w-full">
          <Waveform
            data={wave}
            playhead={pos}
            beatGrid={grid}
            zoom={0.45}
            onScrub={(p) => setPos(clamp(p, 0, 0.9999))}
          />
        </div>

        {/* TRANSPORT / JOG / PITCH */}
        <div className="flex-1 flex items-stretch gap-2 rounded-2xl border border-violet-500/15 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 p-2 shadow-2xl shadow-black/60">
          <div className="w-[5rem] flex flex-col gap-2">
            <div className="flex-1">
              <Button onPress={handleCue}>
                <span className="font-semibold uppercase tracking-wider">Cue</span>
              </Button>
            </div>
            <div className="flex-1">
              <ToggleButton on={playing} onChange={setPlaying}>
                <span className="font-semibold uppercase tracking-wider">
                  {playing ? "❚❚" : "▶"}
                </span>
              </ToggleButton>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="h-full max-w-full aspect-square">
              <JogWheel value={angle} onScrub={handleScrub} />
            </div>
          </div>

          <div className="w-[5rem] flex flex-col gap-2">
            <div className="flex-1">
              <ToggleButton on={synced} onChange={handleSync}>
                <span className="font-semibold uppercase tracking-wider">Sync</span>
              </ToggleButton>
            </div>
            <div className="flex-1">
              <ToggleButton on={keylock} onChange={setKeylock}>
                <span className="font-semibold uppercase tracking-wider">Keylock</span>
              </ToggleButton>
            </div>
          </div>

          <div className="w-[3.25rem] flex flex-col items-center gap-0.5">
            <span
              className={
                "font-mono font-bold text-[10px] leading-none transition-colors duration-200 ease-out " +
                (synced ? "text-lime-300" : "text-amber-400")
              }
            >
              {(pitch >= 0 ? "+" : "") + pitch.toFixed(1)}
            </span>
            <div className="flex-1 w-[2rem]">
              <Fader min={-8} max={8} value={pitch} onChange={handlePitch} orientation="vertical" />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-400">
              Pitch
            </span>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="h-[2.5rem] flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={"hc-" + i} className="flex-1">
              <Pad onPress={() => handlePad(i)} active={cues[i] != null}>
                <span className="font-semibold uppercase tracking-wider">{i + 1}</span>
              </Pad>
            </div>
          ))}
        </div>

        {/* LOOP */}
        <div className="h-[2rem] flex gap-2">
          <div className="flex-1">
            <Button
              onPress={() => {
                setLoopStart(pos);
                setArmed(true);
                setLoopActive(false);
              }}
            >
              <span className="font-semibold uppercase tracking-wider">In</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button
              onPress={() => {
                if (armed) {
                  const b = clamp(Math.round((pos - loopStart) * TOTAL_BEATS * 4) / 4, 0.25, 32);
                  setLoopBeats(b);
                  setLoopActive(true);
                  setArmed(false);
                } else {
                  if (!loopActive) setLoopStart(pos);
                  setLoopActive(!loopActive);
                }
              }}
            >
              <span className="font-semibold uppercase tracking-wider">Out</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.max(0.25, b / 2))}>
              <span className="font-semibold uppercase tracking-wider">½</span>
            </Button>
          </div>
          <div className="flex-1">
            <Button onPress={() => setLoopBeats((b) => Math.min(32, b * 2))}>
              <span className="font-semibold uppercase tracking-wider">×2</span>
            </Button>
          </div>
          <div className="w-[5.5rem]">
            <Readout>
              <span
                className={
                  "font-mono font-bold uppercase tracking-tight transition-colors duration-200 ease-out " +
                  (loopActive
                    ? "text-lime-300"
                    : armed
                    ? "text-violet-300 animate-pulse"
                    : "text-stone-500")
                }
              >
                {loopLabel}
              </span>
            </Readout>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 flex-none flex items-center justify-between px-3 border-t border-stone-800/70 bg-stone-950/70">
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-500">
          <span
            className={
              "h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out " +
              (playing ? "bg-lime-400 animate-pulse" : "bg-amber-400")
            }
          />
          <span className={playing ? "text-lime-300" : "text-amber-300"}>
            {playing ? "Playing" : "Cued"}
          </span>
          <span className="text-stone-700">/</span>
          <span>{keylock ? "Keylock" : "Vari"}</span>
        </span>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={"bt-" + i}
              className={
                "h-1.5 w-3 rounded-full transition-all duration-100 ease-linear " +
                (playing && i === beatInBar
                  ? "bg-lime-400 shadow shadow-lime-400/40"
                  : "bg-stone-700")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}