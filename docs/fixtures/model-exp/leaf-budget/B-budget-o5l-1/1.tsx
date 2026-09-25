export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 0.75 + info 2.0 + gap 0.75 + main 15.0 + gap 0.75 + pads 3.0 + gap 0.75 + loop 3.25 + pad 0.75 + footer 1.75 = 31.0 ≤ 41.6
  // BUDGET width: pad 0.75 + jog 15.0 + gap 0.75 + transport 9.0 + gap 0.75 + fader 4.0 + gap 0.75 + meta 18.5 + pad 0.75 = 50.25 ≤ 52.0

  const [playing, setPlaying] = useState(false);
  const [sync, setSync] = useState(true);
  const [keylock, setKeylock] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [position, setPosition] = useState(42.7);
  const [rotation, setRotation] = useState(0);
  const [loopBeats, setLoopBeats] = useState(4);
  const [loopActive, setLoopActive] = useState(false);
  const [cueFlash, setCueFlash] = useState(false);
  const [activeCue, setActiveCue] = useState<number | null>(1);

  const duration = 284;
  const baseBpm = 126.0;
  const bpm = baseBpm * (1 + tempo / 100);
  const rate = 1 + tempo / 100;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => {
        const n = p + 0.08 * rate;
        return n >= duration ? 0 : n;
      });
      setRotation((r) => (r + 9 * rate) % 360);
    }, 80);
    return () => clearInterval(id);
  }, [playing, rate]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.abs(s) / 60);
    const sec = Math.floor(Math.abs(s) % 60);
    const cs = Math.floor((Math.abs(s) * 100) % 100);
    return (
      (s < 0 ? "-" : "") +
      m +
      ":" +
      String(sec).padStart(2, "0") +
      "." +
      String(cs).padStart(2, "0")
    );
  };

  const cues = [1, 2, 3, 4, 5, 6, 7, 8];
  const armed = [1, 2, 3, 5];

  const handleCue = () => {
    setCueFlash(true);
    setPlaying(false);
    setPosition(0);
    setTimeout(() => setCueFlash(false), 160);
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-400 truncate">
      {children}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* HEADER */}
      <div className="h-9 flex-none px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={
              "h-2 w-2 rounded-full transition-all duration-500 " +
              (playing
                ? "bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.45)]"
                : "bg-neutral-600")
            }
          />
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Deck A
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
          Channel A · 44.1k
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-col gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* INFO ROW */}
        <div className="flex-none flex items-stretch gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <Label>Track</Label>
            <div className="h-[1.75rem] w-full">
              <Readout value="NIGHT DRIVE — Solvent Ray" placeholder="—" />
            </div>
          </div>
          <div className="w-[7rem] flex flex-col gap-1">
            <Label>BPM</Label>
            <div className="h-[1.75rem] w-full">
              <Readout value={bpm.toFixed(2)} />
            </div>
          </div>
          <div className="w-[7rem] flex flex-col gap-1">
            <Label>Elapsed</Label>
            <div className="h-[1.75rem] w-full">
              <Readout value={fmt(position)} />
            </div>
          </div>
          <div className="w-[7rem] flex flex-col gap-1">
            <Label>Remain</Label>
            <div className="h-[1.75rem] w-full">
              <Readout value={fmt(-(duration - position))} />
            </div>
          </div>
        </div>

        {/* MAIN ROW */}
        <div className="flex-1 flex items-stretch gap-3">
          {/* PLATTER */}
          <div className="relative w-[15rem] rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex items-center justify-center overflow-clip">
            <div
              className={
                "absolute inset-4 rounded-full transition-all duration-500 " +
                (playing
                  ? "shadow-[0_0_46px_rgba(251,146,60,0.30)]"
                  : "shadow-none")
              }
            />
            <div className="relative h-[13.5rem] w-[13.5rem]">
              <JogWheel
                rotation={rotation}
                spinning={playing}
                onScrub={(v) => setPosition((p) => Math.max(0, Math.min(duration, p + v * 0.25)))}
                onRotate={(d) => {
                  setRotation((r) => (r + d * 360) % 360);
                  setPosition((p) => Math.max(0, Math.min(duration, p + d * 2)));
                }}
              />
            </div>
          </div>

          {/* TRANSPORT COLUMN */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label>Play / Pause</Label>
                <div className="flex-1 w-full">
                  <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                    <span className="flex flex-col items-center leading-tight font-mono font-semibold tracking-wider uppercase">
                      <span>{playing ? "▮▮" : "▶"}</span>
                      <span className="text-[0.62em] opacity-80">
                        {playing ? "Pause" : "Play"}
                      </span>
                    </span>
                  </ToggleButton>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Cue</Label>
                <div className="flex-1 w-full">
                  <PushButton onPress={handleCue} tone="neutral">
                    <span className="flex flex-col items-center leading-tight font-mono font-semibold tracking-wider uppercase">
                      <span className={cueFlash ? "text-teal-300" : ""}>◉</span>
                      <span className="text-[0.62em] opacity-80">Cue</span>
                    </span>
                  </PushButton>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Sync</Label>
                <div className="flex-1 w-full">
                  <ToggleButton on={sync} onChange={setSync} tone="accent">
                    <span className="font-mono font-semibold tracking-wider uppercase">
                      Sync
                    </span>
                  </ToggleButton>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-center justify-end">
                <Label>Keylock</Label>
                <div className="flex-1 w-full flex items-center justify-center">
                  <div className="h-[1.75rem] w-[3.5rem]">
                    <ToggleSwitch on={keylock} onChange={setKeylock} />
                  </div>
                </div>
                <div
                  className={
                    "font-mono text-[10px] tracking-widest uppercase transition-all duration-200 " +
                    (keylock ? "text-teal-300" : "text-neutral-600")
                  }
                >
                  {keylock ? "Locked · 7A" : "Free"}
                </div>
              </div>
            </div>

            <div className="flex-none rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] font-medium tracking-widest uppercase text-neutral-500">
                Pitch
              </span>
              <span className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {(tempo >= 0 ? "+" : "") + tempo.toFixed(2) + "%"}
              </span>
            </div>
          </div>

          {/* TEMPO FADER */}
          <div className="w-[4.5rem] flex flex-col items-center gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 py-2">
            <Label>Tempo</Label>
            <div className="flex-1 w-[2.6rem] flex justify-center">
              <Fader
                value={tempo}
                min={-8}
                max={8}
                orientation="vertical"
                bipolar
                detents={[-8, -4, 0, 4, 8]}
                onChange={setTempo}
              />
            </div>
            <span className="font-mono text-[10px] text-neutral-500">±8%</span>
          </div>
        </div>

        {/* HOT CUES */}
        <div className="flex-none flex flex-col gap-1">
          <Label>Hot Cues</Label>
          <div className="grid grid-cols-8 gap-2">
            {cues.map((n) => (
              <div key={"cue-" + n} className="h-[2.75rem] w-full">
                <CuePad
                  armed={armed.includes(n)}
                  onPress={() => {
                    setActiveCue(n);
                    if (armed.includes(n)) setPosition(n * 16.5);
                  }}
                  onAltPress={() => setActiveCue(null)}
                >
                  <span className="flex flex-col items-center leading-tight font-mono font-semibold tracking-wider">
                    <span>{n}</span>
                    <span className="text-[0.55em] opacity-70">
                      {activeCue === n ? "SET" : armed.includes(n) ? "CUE" : "—"}
                    </span>
                  </span>
                </CuePad>
              </div>
            ))}
          </div>
        </div>

        {/* LOOP CONTROLS */}
        <div className="flex-none flex items-center gap-3 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
          <div className="flex flex-col items-center gap-1">
            <Label>Beats</Label>
            <div className="h-[2.75rem] w-[2.75rem]">
              <Knob
                value={loopBeats}
                min={1}
                max={32}
                mode="stepped"
                steps={[1, 2, 4, 8, 16, 32]}
                onChange={setLoopBeats}
              />
            </div>
          </div>
          <div className="w-[6rem] flex flex-col gap-1">
            <Label>Loop</Label>
            <div className="h-[1.75rem] w-full">
              <Readout value={loopActive ? loopBeats + " BEAT" : "OFF"} />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-4 gap-2">
            <div className="h-[2.25rem] w-full">
              <PushButton onPress={() => setLoopActive(true)}>
                <span className="font-mono font-semibold tracking-wider uppercase">In</span>
              </PushButton>
            </div>
            <div className="h-[2.25rem] w-full">
              <PushButton onPress={() => setLoopActive(true)} tone="accent">
                <span className="font-mono font-semibold tracking-wider uppercase">Out</span>
              </PushButton>
            </div>
            <div className="h-[2.25rem] w-full">
              <PushButton onPress={() => setLoopBeats((b) => Math.max(1, b / 2))}>
                <span className="font-mono font-semibold tracking-wider uppercase">½×</span>
              </PushButton>
            </div>
            <div className="h-[2.25rem] w-full">
              <PushButton onPress={() => setLoopActive(false)} tone="danger">
                <span className="font-mono font-semibold tracking-wider uppercase">Exit</span>
              </PushButton>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <span
          className={
            "font-mono text-[10px] tracking-wide uppercase transition-all duration-200 " +
            (playing ? "text-teal-300" : "text-neutral-400")
          }
        >
          {playing ? "▸ Playing" : "❙❙ Standby"} · {bpm.toFixed(1)} BPM
        </span>
        <span className="font-mono text-[10px] tracking-wide text-neutral-500">
          {sync ? "SYNC MASTER" : "SYNC OFF"} · {loopActive ? "LOOP " + loopBeats : "NO LOOP"}
        </span>
      </div>
    </div>
  );
}