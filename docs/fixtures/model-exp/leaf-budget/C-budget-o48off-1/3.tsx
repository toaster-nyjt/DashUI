export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body[ metaRow 3.2 + gap 0.75 + platterRow(jog 8 + tempo 6→ max 8) + gap 0.75 + loopRow 2.6 + gap 0.75 + padRow(cue 4) + gap 0.75 + transportRow 2.6 ] + footer 1.75 = 2.25 + 3.2+0.75+8+0.75+2.6+0.75+4+0.75+2.6 + 1.75 = 27.4 ≤ 41.6
  // BUDGET width: platterRow[ jog 8 + gap 0.75 + tempoBlock 4 + gap 0.75 + rightControls 6 ] padding 0.75*2 = 8+0.75+4+0.75+6+1.5 = 21 ≤ 52.0

  const DUR = 262; // seconds

  // Deck B loaded track state
  const [title] = useState("MIDNIGHT DRIVE");
  const [artist] = useState("Lunar Field");
  const [baseBpm] = useState(126.0);

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(48.3);
  const [tempo, setTempo] = useState(0); // -8..+8 % pitch
  const [rotation, setRotation] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);

  // Loop
  const [loopOn, setLoopOn] = useState(false);
  const [loopBeats, setLoopBeats] = useState(4); // stepped

  // Hot cues (8 pads)
  const [cues, setCues] = useState<(number | null)[]>([12.5, 48.3, null, 96.0, null, null, 160.2, null]);

  const effectiveBpm = baseBpm * (1 + tempo / 100);

  // Playback + platter motion (state-driven, no page scroll/focus)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const speed = 1 + tempo / 100;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPosition((p) => {
        let np = p + dt * speed;
        if (loopOn) {
          const loopSec = (loopBeats / effectiveBpm) * 60;
          const loopStart = 48.3;
          if (np > loopStart + loopSec) np = loopStart + ((np - loopStart) % loopSec);
        }
        if (np >= DUR) np = DUR;
        return np;
      });
      setRotation((r) => (r + dt * speed * 200) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, tempo, loopOn, loopBeats, effectiveBpm]);

  const handleScrub = useCallback((v: number) => {
    // nudge playback position by scrub velocity
    setPosition((p) => Math.max(0, Math.min(DUR, p + v * 0.05)));
  }, []);
  const handleRotate = useCallback((deltaTurns: number) => {
    setRotation((r) => (r + deltaTurns * 360) % 360);
  }, []);

  const fmt = (s: number) => {
    const sign = s < 0 ? "-" : "";
    const a = Math.abs(s);
    const m = Math.floor(a / 60);
    const sec = Math.floor(a % 60);
    const cs = Math.floor((a % 1) * 100);
    return sign + String(m).padStart(1, "0") + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0");
  };

  const remaining = -(DUR - position);

  const cueLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* Header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-teal-400/25">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.7)]" />
          <span className="text-sm font-semibold tracking-wide uppercase text-teal-100 truncate">Deck B — Right Player</span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">Channel B</span>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 flex flex-col gap-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Meta row: displays */}
        <div className="flex-none flex items-stretch gap-3" style={{ height: "3.2rem" }}>
          {/* Title */}
          <div className="flex-1 flex flex-col justify-center rounded-xl border border-teal-400/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-3 py-1">
            <div className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none mb-1">Now Playing</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-6">
                <Readout value={title} />
              </div>
              <span className="hidden sm:block text-[10px] font-normal tracking-wide text-neutral-500 truncate max-w-[8rem]">{artist}</span>
            </div>
          </div>
          {/* BPM */}
          <div className="w-24 flex flex-col justify-center rounded-xl border border-teal-400/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-2 py-1">
            <div className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none mb-1">BPM</div>
            <div className="h-6">
              <Readout value={effectiveBpm.toFixed(1)} />
            </div>
          </div>
          {/* Time */}
          <div className="w-40 flex items-center gap-2 rounded-xl border border-teal-400/15 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-2 py-1">
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none mb-1">Elapsed</div>
              <div className="h-6">
                <Readout value={fmt(position)} />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none mb-1">Remain</div>
              <div className="h-6">
                <Readout value={fmt(remaining)} />
              </div>
            </div>
          </div>
        </div>

        {/* Platter row */}
        <div className="flex-1 flex items-stretch gap-3">
          {/* Jog wheel */}
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-teal-400/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3">
            <div
              className={
                "rounded-full transition-shadow duration-500 " +
                (playing ? "shadow-[0_0_16px_rgba(45,212,191,0.4)]" : "")
              }
              style={{ width: "8rem", height: "8rem" }}
            >
              <JogWheel rotation={rotation} spinning={playing} onScrub={handleScrub} onRotate={handleRotate} />
            </div>
            <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Jog / Scratch</div>
          </div>

          {/* Tempo block */}
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-teal-400/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3">
            <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Tempo</div>
            <div className="flex-1 flex items-stretch" style={{ minHeight: "6rem" }}>
              <div style={{ width: "2.2rem" }} className="flex-1">
                <Fader
                  value={tempo}
                  min={-8}
                  max={8}
                  onChange={setTempo}
                  orientation="vertical"
                  bipolar
                  detents={[-8, -4, 0, 4, 8]}
                />
              </div>
            </div>
            <div className="font-mono text-xs font-bold tracking-tight text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)] leading-none">
              {(tempo >= 0 ? "+" : "") + tempo.toFixed(1) + "%"}
            </div>
          </div>

          {/* Right controls: sync, keylock */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex-1 rounded-2xl border border-teal-400/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-3 flex flex-col justify-center gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Sync</span>
                <div style={{ width: "5rem", height: "1.75rem" }}>
                  <ToggleButton on={sync} onChange={setSync} tone="accent">
                    <span>SYNC</span>
                  </ToggleButton>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Keylock</span>
                <div style={{ width: "3rem", height: "1.5rem" }}>
                  <ToggleSwitch on={keylock} onChange={setKeylock} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-normal tracking-wide text-neutral-500">Key</span>
                <span className="font-mono text-sm font-bold tracking-tight text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.35)]">
                  {keylock ? "8A" : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loop row */}
        <div className="flex-none flex items-center gap-3 rounded-xl border border-teal-400/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-lg shadow-black/50 p-2" style={{ height: "2.9rem" }}>
          <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none pl-1">Loop</span>
          <div style={{ width: "3.4rem", height: "1.75rem" }}>
            <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
              <span>{loopOn ? "ON" : "SET"}</span>
            </ToggleButton>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: "2.5rem", height: "2.5rem" }}>
              <Knob
                value={loopBeats}
                min={1}
                max={32}
                onChange={(v) => setLoopBeats(Math.round(v))}
                mode="stepped"
                steps={[1, 2, 4, 8, 16, 32]}
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none mb-1">Beats</div>
              <div style={{ width: "3.4rem", height: "1.4rem" }}>
                <Readout value={loopBeats} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div style={{ width: "3rem", height: "1.75rem" }}>
              <PushButton onPress={() => setLoopBeats((b) => Math.max(1, Math.round(b / 2)))} tone="neutral">
                <span>1/2</span>
              </PushButton>
            </div>
            <div style={{ width: "3rem", height: "1.75rem" }}>
              <PushButton onPress={() => setLoopBeats((b) => Math.min(32, Math.round(b * 2)))} tone="neutral">
                <span>×2</span>
              </PushButton>
            </div>
          </div>
        </div>

        {/* Hot cue pads */}
        <div className="flex-none">
          <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none mb-1 pl-1">Hot Cues</div>
          <div className="grid grid-cols-8 gap-2">
            {cues.map((cue, i) => (
              <div key={"cue-" + i} className="aspect-square" style={{ minHeight: "unset" }}>
                <div style={{ width: "100%", height: "100%" }} className="min-w-[2.5rem]">
                  <CuePad
                    armed={cue !== null}
                    onPress={() => {
                      if (cue === null) {
                        setCues((c) => {
                          const n = [...c];
                          n[i] = position;
                          return n;
                        });
                      } else {
                        setPosition(cue);
                        if (!playing) setPlaying(true);
                      }
                    }}
                    onAltPress={() =>
                      setCues((c) => {
                        const n = [...c];
                        n[i] = null;
                        return n;
                      })
                    }
                  >
                    <span className="flex flex-col leading-none">
                      <span className="font-mono font-semibold tracking-wider">{cueLabels[i]}</span>
                      <span className="text-[0.6em] font-normal tracking-normal opacity-80">
                        {cue !== null ? fmt(cue).slice(0, 4) : "—"}
                      </span>
                    </span>
                  </CuePad>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transport row */}
        <div className="flex-none flex items-center gap-3" style={{ height: "2.9rem" }}>
          <div className="flex-1" style={{ height: "2.6rem" }}>
            <PushButton onPress={() => setPosition(cues[1] ?? 0)} tone="accent">
              <span className="flex items-center gap-1">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="4" width="3" height="16" />
                  <path d="M20 4v16L9 12z" />
                </svg>
                <span>CUE</span>
              </span>
            </PushButton>
          </div>
          <div className="flex-[1.4]" style={{ height: "2.6rem" }}>
            <ToggleButton on={playing} onChange={setPlaying} tone="accent">
              <span className="flex items-center gap-2">
                {playing ? (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                ) : (
                  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 4v16l13-8z" />
                  </svg>
                )}
                <span>{playing ? "PAUSE" : "PLAY"}</span>
              </span>
            </ToggleButton>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-teal-400/15">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wide">
          <span className={playing ? "text-teal-300" : "text-neutral-500"}>{playing ? "▶ PLAYING" : "❚❚ CUED"}</span>
          <span className={loopOn ? "text-teal-300" : "text-neutral-500"}>{loopOn ? "LOOP " + loopBeats + "B" : "LOOP OFF"}</span>
          <span className={sync ? "text-teal-300" : "text-neutral-500"}>{sync ? "SYNC ON" : "SYNC OFF"}</span>
        </div>
        <div className="font-mono text-[10px] tracking-wide text-neutral-400">
          {effectiveBpm.toFixed(1)} BPM • {(tempo >= 0 ? "+" : "") + tempo.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}