export default function GeneratedComponent() {
  const DURATION = 312;
  const BASE_BPM = 124.0;

  const [playing, setPlaying] = useState(true);
  const [position, setPosition] = useState(47.2);
  const [rotation, setRotation] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(1);
  const [cues, setCues] = useState<boolean[]>([true, true, true, false, false, true, false, false]);
  const [pulse, setPulse] = useState(0);

  const rate = 1 + tempo / 100;
  const bpm = BASE_BPM * rate;

  useEffect(() => {
    const id = setInterval(() => {
      setRotation((r) => (playing ? (r + rate * 6) % 360 : r));
      if (playing) {
        setPosition((p) => {
          const n = p + 0.05 * rate;
          return n >= DURATION ? 0 : n;
        });
      }
    }, 50);
    return () => clearInterval(id);
  }, [playing, rate]);

  useEffect(() => {
    if (!playing) return;
    const beatMs = (60 / bpm) * 1000;
    const id = setInterval(() => setPulse((p) => p + 1), beatMs);
    return () => clearInterval(id);
  }, [playing, bpm]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    const cs = Math.floor((Math.abs(s) * 100) % 100);
    return (
      (s < 0 ? "-" : "") +
      String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") + "." + String(cs).padStart(2, "0")
    );
  };

  const handleScrub = useCallback((v: number) => {
    setPosition((p) => Math.max(0, Math.min(DURATION, p + v * 0.25)));
  }, []);
  const handleRotate = useCallback((d: number) => {
    setRotation((r) => (r + d * 360) % 360);
  }, []);

  const progress = position / DURATION;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span
          className={
            "h-2 w-2 rounded-full transition-all duration-100 " +
            (playing
              ? "bg-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.9)] scale-125"
              : "bg-neutral-600")
          }
          key={"dot-" + pulse}
        />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Deck A</span>
        <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/70">Player</span>
        <div className="flex-1" />
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
          {keylock ? "KEYLOCK" : "VARISPEED"}
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* METADATA ROW */}
        <div className="flex-none h-[4.25rem] flex gap-3 items-stretch">
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">Track</span>
            <div className="flex-1">
              <Readout value="NIGHTDRIVE — MOLTEN SUN" placeholder="NO TRACK" />
            </div>
          </div>
          <div className="w-[8.5rem] flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">BPM</span>
            <div className="flex-1">
              <Readout value={bpm.toFixed(2)} />
            </div>
          </div>
          <div className="w-[8.5rem] flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">Elapsed</span>
            <div className="flex-1">
              <Readout value={fmt(position)} />
            </div>
          </div>
          <div className="w-[8.5rem] flex flex-col gap-1">
            <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500 leading-none">Remain</span>
            <div className="flex-1">
              <Readout value={fmt(-(DURATION - position))} />
            </div>
          </div>
        </div>

        {/* MAIN ROW */}
        <div className="flex-1 flex gap-3">
          {/* PLATTER COLUMN */}
          <div className="w-[19rem] flex flex-col gap-3">
            <div
              className={
                "flex-1 w-full rounded-full transition-shadow duration-500 ease-in-out " +
                (playing ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]" : "")
              }
            >
              <JogWheel rotation={rotation} spinning={playing} onScrub={handleScrub} onRotate={handleRotate} />
            </div>
            <div className="flex-none h-[3.25rem] flex gap-3">
              <div className="w-[7rem]">
                <PushButton tone="accent" onPress={() => { setPosition(0); setPlaying(false); }}>
                  <span className="font-mono font-semibold tracking-wider">CUE</span>
                </PushButton>
              </div>
              <div className="flex-1">
                <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-mono font-bold tracking-wider">{playing ? "PAUSE" : "PLAY"}</span>
                    <span className="text-[0.6em] tracking-[0.3em] opacity-70">▶ / ‖</span>
                  </span>
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="flex-1 flex flex-col gap-3">
            {/* HOT CUES */}
            <div className="flex-1 flex flex-col gap-2 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60">
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Hot Cues</span>
                <span className="font-mono text-[10px] tracking-wide text-teal-300/80">
                  {activeCue !== null ? "BANK 1 · " + String.fromCharCode(65 + activeCue) : "BANK 1"}
                </span>
              </div>
              <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-2">
                {cues.map((armed, i) => (
                  <div key={"cue-" + i} className="w-full h-full">
                    <CuePad
                      armed={armed}
                      onPress={() => {
                        if (armed) { setActiveCue(i); setPosition((i + 1) * 18.5 % DURATION); }
                        else { setCues((c) => c.map((v, j) => (j === i ? true : v))); setActiveCue(i); }
                      }}
                      onAltPress={() => {
                        setCues((c) => c.map((v, j) => (j === i ? false : v)));
                        setActiveCue((a) => (a === i ? null : a));
                      }}
                    >
                      <span className="flex flex-col items-center leading-none">
                        <span className="font-mono font-bold tracking-wider">{String.fromCharCode(65 + i)}</span>
                        <span className="text-[0.55em] tracking-widest opacity-60">
                          {armed ? fmt((i + 1) * 18.5).slice(0, 5) : "SET"}
                        </span>
                      </span>
                    </CuePad>
                  </div>
                ))}
              </div>
            </div>

            {/* LOOP */}
            <div className="flex-none h-[6.25rem] flex gap-3 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Loop</span>
                <div className="w-[4.5rem] h-[4.5rem]">
                  <Knob
                    value={loopBeats}
                    min={1}
                    max={32}
                    mode="stepped"
                    steps={[1, 2, 4, 8, 16, 32]}
                    onChange={(v) => setLoopBeats(v)}
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                    <PushButton onPress={() => setLoopActive(true)}>
                      <span className="font-mono font-semibold tracking-wider">IN</span>
                    </PushButton>
                  </div>
                  <div className="flex-1">
                    <PushButton onPress={() => setLoopActive(true)}>
                      <span className="font-mono font-semibold tracking-wider">OUT</span>
                    </PushButton>
                  </div>
                  <div className="flex-1">
                    <PushButton tone={loopActive ? "danger" : "neutral"} onPress={() => setLoopActive((l) => !l)}>
                      <span className="font-mono font-semibold tracking-wider">{loopActive ? "EXIT" : "RELOOP"}</span>
                    </PushButton>
                  </div>
                </div>
                <div className="flex-1">
                  <Readout value={(loopActive ? "LOOP ● " : "LOOP ○ ") + loopBeats + " BEAT"} />
                </div>
              </div>
            </div>

            {/* SYNC / KEYLOCK */}
            <div className="flex-none h-[3.25rem] flex gap-3 items-stretch">
              <div className="flex-1">
                <ToggleButton on={sync} onChange={setSync} tone="accent">
                  <span className="flex flex-col items-center leading-none">
                    <span className="font-mono font-bold tracking-wider">SYNC</span>
                    <span className="text-[0.6em] tracking-[0.25em] opacity-70">MASTER</span>
                  </span>
                </ToggleButton>
              </div>
              <div className="flex-1 flex items-center justify-between gap-2 px-2 rounded-lg border border-amber-500/20 bg-black/60 shadow-inner shadow-black/70">
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Keylock</span>
                <div className="w-[3.25rem] h-[1.6rem]">
                  <ToggleSwitch on={keylock} onChange={setKeylock} />
                </div>
              </div>
            </div>
          </div>

          {/* TEMPO COLUMN */}
          <div className="w-[5.5rem] flex flex-col items-center gap-2 p-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">Tempo</span>
            <div className="w-[2.6rem] flex-1">
              <Fader
                value={tempo}
                min={-8}
                max={8}
                bipolar
                orientation="vertical"
                detents={[-8, -4, 0, 4, 8]}
                onChange={(v) => setTempo(v)}
              />
            </div>
            <span className="font-mono font-bold tracking-tight text-amber-300 text-[13px] drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {(tempo >= 0 ? "+" : "") + tempo.toFixed(1) + "%"}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center gap-3 px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className={"font-mono text-[10px] tracking-wide " + (playing ? "text-teal-300" : "text-neutral-400")}>
          {playing ? "PLAYING" : "PAUSED"}
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          A · 124 BPM · 8A · {sync ? "SYNCED" : "FREE"}
        </span>
        <div className="flex-1 h-1 rounded-full bg-black/70 shadow-inner shadow-black/70 overflow-clip">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-600 transition-all duration-200 ease-out"
            style={{ width: (progress * 100).toFixed(2) + "%" }}
          />
        </div>
        <span className="font-mono text-[10px] tracking-wide text-amber-400">{fmt(position).slice(0, 5)}</span>
      </div>
    </div>
  );
}