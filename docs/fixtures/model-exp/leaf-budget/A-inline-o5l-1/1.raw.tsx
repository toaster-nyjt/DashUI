export default function GeneratedComponent() {
  const DURATION = 372;
  const BASE_BPM = 128;

  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState(41.2);
  const [tempo, setTempo] = useState(0);
  const [sync, setSync] = useState(false);
  const [keylock, setKeylock] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopIdx, setLoopIdx] = useState(2);
  const [cuePoint, setCuePoint] = useState(41.2);
  const [nudge, setNudge] = useState(0);
  const [pads, setPads] = useState<{ id: string; label: string; time: number | null }[]>([
    { id: "a", label: "1", time: 12.5 },
    { id: "b", label: "2", time: 88.0 },
    { id: "c", label: "3", time: 164.75 },
    { id: "d", label: "4", time: null },
  ]);

  const loopSteps = [0, 1, 2, 3, 4, 5, 6];
  const loopLabels = ["1/8", "1/4", "1/2", "1", "2", "4", "8"];

  const bpm = BASE_BPM * (1 + tempo / 100);
  const rate = (1 + tempo / 100) * (1 + nudge);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setRotation((r) => (r + rate * 6.2) % 360);
      setPosition((p) => {
        const n = p + 0.08 * rate;
        return n >= DURATION ? 0 : n;
      });
    }, 80);
    return () => clearInterval(id);
  }, [playing, rate]);

  useEffect(() => {
    if (nudge === 0) return;
    const t = setTimeout(() => setNudge(0), 220);
    return () => clearTimeout(t);
  }, [nudge]);

  const fmt = (s: number) => {
    const m = Math.floor(Math.max(0, s) / 60);
    const ss = Math.floor(Math.max(0, s) % 60);
    return m + ":" + (ss < 10 ? "0" + ss : "" + ss);
  };

  const handleScrub = (v: number) => setNudge(Math.max(-0.5, Math.min(0.5, v * 0.4)));
  const handleRotate = (d: number) => setPosition((p) => Math.max(0, Math.min(DURATION, p + d * 2)));

  const firePad = (id: string) => {
    setPads((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        if (p.time === null) return { ...p, time: position };
        return p;
      })
    );
    const p = pads.find((x) => x.id === id);
    if (p && p.time !== null) setPosition(p.time);
  };

  const Label = ({ children }: { children: React.ReactNode }) => (
    <div className="text-[10px] font-medium tracking-widest uppercase leading-none text-neutral-400 truncate">
      {children}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* header */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span
          className={
            "h-2 w-2 rounded-full transition-all duration-500 ease-in-out " +
            (playing
              ? "bg-amber-400 shadow-[0_0_16px_rgba(251,146,60,0.45)] animate-pulse"
              : "bg-neutral-600")
          }
        />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
          Deck A
        </span>
        <span className="ml-auto font-mono text-[10px] tracking-widest uppercase text-neutral-500">
          {playing ? "PLAYING" : "CUED"} · CH-A
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)]">
        {/* metadata row */}
        <div className="flex-none h-[4.25rem] grid grid-cols-[1fr_8rem_11rem] gap-3">
          <div className="flex flex-col gap-1">
            <Label>Track</Label>
            <div className="h-[2.75rem] w-full">
              <Readout value="MIDNIGHT CIRCUIT — VELDT" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>BPM</Label>
            <div className="h-[2.75rem] w-full">
              <Readout value={bpm.toFixed(2)} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Elapsed / Remain</Label>
            <div className="h-[2.75rem] w-full">
              <Readout value={fmt(position) + "  -" + fmt(DURATION - position)} />
            </div>
          </div>
        </div>

        {/* main row */}
        <div className="flex-1 flex gap-3">
          {/* platter */}
          <div className="h-full aspect-square relative rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60 overflow-clip">
            <div
              className={
                "h-full w-full rounded-full transition-shadow duration-500 ease-in-out " +
                (playing ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]" : "")
              }
            >
              <JogWheel
                rotation={rotation}
                spinning={playing}
                onScrub={handleScrub}
                onRotate={handleRotate}
              />
            </div>
            <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] tracking-widest uppercase text-amber-400/70">
              {nudge !== 0 ? (nudge > 0 ? "NUDGE +" : "NUDGE −") : "VINYL"}
            </div>
          </div>

          {/* controls column */}
          <div className="flex-1 flex flex-col gap-3">
            {/* transport */}
            <div className="flex-1 flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <Label>Transport</Label>
                <div className="flex-1 w-full min-h-[3.5rem]">
                  <ToggleButton on={playing} onChange={setPlaying} tone="accent">
                    <span className="font-mono font-semibold tracking-wider uppercase">
                      {playing ? "▮▮ Pause" : "▶ Play"}
                    </span>
                  </ToggleButton>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <Label>Cue</Label>
                <div className="flex-1 w-full min-h-[3.5rem]">
                  <PushButton
                    tone="neutral"
                    onPress={() => {
                      if (playing) {
                        setPlaying(false);
                        setPosition(cuePoint);
                      } else {
                        setCuePoint(position);
                      }
                    }}
                  >
                    <span className="font-mono font-semibold tracking-wider uppercase flex flex-col items-center">
                      <span>CUE</span>
                      <span className="text-[0.7em] text-amber-400/80">{fmt(cuePoint)}</span>
                    </span>
                  </PushButton>
                </div>
              </div>
            </div>

            {/* sync + keylock */}
            <div className="flex-none h-[4rem] flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <Label>Sync</Label>
                <div className="h-[2.5rem] w-full">
                  <ToggleButton on={sync} onChange={setSync} tone="accent">
                    <span className="font-mono font-semibold tracking-wider uppercase">SYNC</span>
                  </ToggleButton>
                </div>
              </div>
              <div className="w-[7rem] flex flex-col gap-1">
                <Label>Keylock</Label>
                <div className="h-[2.5rem] w-full flex items-center">
                  <div className="h-[1.75rem] w-[3.5rem]">
                    <ToggleSwitch on={keylock} onChange={setKeylock} />
                  </div>
                  <span
                    className={
                      "ml-2 font-mono text-[10px] tracking-widest uppercase transition-all duration-200 ease-out " +
                      (keylock ? "text-teal-300" : "text-neutral-500")
                    }
                  >
                    {keylock ? "ON" : "OFF"}
                  </span>
                </div>
              </div>
            </div>

            {/* loop */}
            <div className="flex-none h-[6.5rem] rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 flex flex-col gap-1 shadow-2xl shadow-black/60">
              <Label>Loop</Label>
              <div className="flex-1 flex items-center gap-2">
                <div className="h-[2.75rem] w-[2.75rem]">
                  <Knob
                    value={loopIdx}
                    min={0}
                    max={6}
                    mode="stepped"
                    steps={loopSteps}
                    onChange={(v) => setLoopIdx(Math.round(v))}
                  />
                </div>
                <div className="h-[2.5rem] w-[4.5rem]">
                  <Readout value={loopLabels[loopIdx] + " BT"} />
                </div>
                <div className="h-[2.5rem] flex-1">
                  <ToggleButton on={loopOn} onChange={setLoopOn} tone="accent">
                    <span className="font-mono font-semibold tracking-wider uppercase">LOOP</span>
                  </ToggleButton>
                </div>
                <div className="h-[2.5rem] w-[5rem]">
                  <PushButton tone="neutral" onPress={() => setPosition((p) => Math.max(0, p - 4))}>
                    <span className="font-mono font-semibold tracking-wider uppercase">RELOOP</span>
                  </PushButton>
                </div>
              </div>
            </div>
          </div>

          {/* tempo fader */}
          <div className="w-[5.5rem] flex flex-col gap-1 items-center rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
            <Label>Tempo</Label>
            <div className="flex-1 w-[2.6rem]">
              <Fader
                value={tempo}
                min={-8}
                max={8}
                bipolar
                detents={[0]}
                orientation="vertical"
                onChange={setTempo}
              />
            </div>
            <div className="font-mono font-bold tracking-tight text-[11px] text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {(tempo >= 0 ? "+" : "") + tempo.toFixed(1) + "%"}
            </div>
          </div>
        </div>

        {/* hot cues */}
        <div className="flex-none h-[6rem] rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 flex flex-col gap-1 shadow-2xl shadow-black/60">
          <Label>Hot Cues</Label>
          <div className="flex-1 flex gap-2">
            {pads.map((p) => (
              <div key={p.id} className="flex-1 h-full">
                <CuePad
                  armed={p.time !== null}
                  onPress={() => firePad(p.id)}
                  onAltPress={() =>
                    setPads((ps) => ps.map((x) => (x.id === p.id ? { ...x, time: null } : x)))
                  }
                >
                  <span className="font-mono font-semibold tracking-wider uppercase flex flex-col items-center">
                    <span>{p.label}</span>
                    <span className="text-[0.65em] opacity-70">
                      {p.time === null ? "SET" : fmt(p.time)}
                    </span>
                  </span>
                </CuePad>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none flex items-center gap-3 px-3 bg-neutral-950/90 border-t border-amber-500/15">
        <span className="font-mono text-[10px] tracking-wide text-neutral-400">KEY 8A</span>
        <span
          className={
            "font-mono text-[10px] tracking-wide transition-all duration-200 ease-out " +
            (sync ? "text-teal-300" : "text-neutral-500")
          }
        >
          {sync ? "SYNC LOCKED" : "FREE TEMPO"}
        </span>
        <span className="ml-auto font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          {loopOn ? "LOOP " + loopLabels[loopIdx] + " ACTIVE" : "→ WAVEFORM LANE A"}
        </span>
      </div>
    </div>
  );
}