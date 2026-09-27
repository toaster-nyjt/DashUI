export default function GeneratedComponent() {
  // BUDGET height: header 2.75 + pad 0.75 + strip[gain 2.9 + eq 3×2.9=8.7 + filter 2.9 + fader 8 + cue 1.75 + labels/gaps ~5] = 29.25 + crossfader 5.25 + pad 0.75 = 38.0 ≤ 41.6
  // BUDGET width: pad 0.6 + chA 14.5 + gap 0.75 + center 14 + gap 0.75 + chB 14.5 + pad 0.6 = 45.7 ≤ 52.0

  const [gainA, setGainA] = useState(62);
  const [gainB, setGainB] = useState(48);
  const [eqA, setEqA] = useState({ hi: 0, mid: 2, lo: -3 });
  const [eqB, setEqB] = useState({ hi: -2, mid: 0, lo: 4 });
  const [filtA, setFiltA] = useState(0);
  const [filtB, setFiltB] = useState(0);
  const [volA, setVolA] = useState(84);
  const [volB, setVolB] = useState(66);
  const [xf, setXf] = useState(0);
  const [master, setMaster] = useState(72);
  const [cueMix, setCueMix] = useState(50);
  const [cueA, setCueA] = useState(true);
  const [cueB, setCueB] = useState(false);

  const [lvl, setLvl] = useState({ a: 0.4, b: 0.3, pa: 0.5, pb: 0.4 });

  const xfA = Math.min(1, (100 - xf) / 50);
  const xfB = Math.min(1, (100 + xf) / 50);

  useEffect(() => {
    const id = setInterval(() => {
      setLvl((p) => {
        const tA = Math.max(0, Math.min(1, (volA / 100) * xfA * (0.45 + gainA / 140) * (0.75 + Math.random() * 0.5)));
        const tB = Math.max(0, Math.min(1, (volB / 100) * xfB * (0.45 + gainB / 140) * (0.75 + Math.random() * 0.5)));
        const a = p.a + (tA - p.a) * 0.55;
        const b = p.b + (tB - p.b) * 0.55;
        return {
          a, b,
          pa: a > p.pa ? a : Math.max(a, p.pa - 0.02),
          pb: b > p.pb ? b : Math.max(b, p.pb - 0.02),
        };
      });
    }, 90);
    return () => clearInterval(id);
  }, [volA, volB, gainA, gainB, xfA, xfB]);

  const Cap = ({ children, tone }: { children: any; tone?: string }) => (
    <div className={"text-[0.55rem] font-semibold uppercase tracking-[0.2em] " + (tone || "text-zinc-500")}>{children}</div>
  );

  const KnobCell = ({ label, children, tone }: { label: string; children: any; tone?: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="h-[2.9rem] w-[2.9rem]">{children}</div>
      <Cap tone={tone}>{label}</Cap>
    </div>
  );

  const Strip = ({
    id, accent, glow, gain, setGain, eq, setEq, filt, setFilt, vol, setVol, level, peak, cue, setCue,
  }: any) => (
    <div className="relative flex flex-col items-center gap-2 rounded-lg border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-black px-3 py-2.5 overflow-clip">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] transition-all duration-300"
        style={{ background: accent, boxShadow: "0 0 14px " + accent, opacity: 0.35 + (id === "A" ? xfA : xfB) * 0.65 }}
      />
      <div className="flex w-full items-center justify-between">
        <div className="text-[0.95rem] font-black tracking-[0.3em]" style={{ color: accent, textShadow: "0 0 12px " + glow }}>
          CH {id}
        </div>
        <div className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-zinc-600">DECK {id}</div>
      </div>

      <KnobCell label="Trim" tone="text-zinc-400">
        <Knob min={0} max={100} value={gain} onChange={setGain} />
      </KnobCell>

      <div className="flex w-full flex-col items-center gap-1.5 rounded-md border border-zinc-800/80 bg-zinc-950/60 py-2">
        <div className="flex items-end gap-2.5">
          <KnobCell label="Hi"><Knob min={-12} max={12} value={eq.hi} onChange={(v: number) => setEq({ ...eq, hi: v })} detents={[0]} /></KnobCell>
          <KnobCell label="Mid"><Knob min={-12} max={12} value={eq.mid} onChange={(v: number) => setEq({ ...eq, mid: v })} detents={[0]} /></KnobCell>
          <KnobCell label="Low"><Knob min={-12} max={12} value={eq.lo} onChange={(v: number) => setEq({ ...eq, lo: v })} detents={[0]} /></KnobCell>
        </div>
        <Cap>3-Band EQ</Cap>
      </div>

      <KnobCell label="Filter" tone="text-zinc-400">
        <Knob min={-50} max={50} value={filt} onChange={setFilt} detents={[0]} />
      </KnobCell>

      <div className="flex items-end gap-3 pt-0.5">
        <div className="flex flex-col items-center gap-1">
          <div className="h-[8rem] w-[2.25rem]">
            <Fader min={0} max={100} value={vol} onChange={setVol} orientation="vertical" />
          </div>
          <Cap tone="text-zinc-400">Vol</Cap>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="h-[8rem] w-[1.4rem]">
            <LevelMeter level={level} peak={peak} orientation="vertical" />
          </div>
          <Cap>Lvl</Cap>
        </div>
      </div>

      <div className="h-[1.85rem] w-[5.5rem]">
        <ToggleButton on={cue} onChange={setCue} tone="accent">
          <span className="font-black tracking-[0.2em]">CUE {id}</span>
        </ToggleButton>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#08090b] text-zinc-200 font-sans">
      {/* header */}
      <div className="flex-none h-[2.75rem] flex items-center justify-between border-b border-zinc-800 bg-gradient-to-r from-black via-zinc-900 to-black px-4">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[0.9rem] font-black uppercase tracking-[0.35em] text-zinc-100">Mixer</span>
          <span className="truncate text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-zinc-600">2-Channel · Master Sink</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">Master</span>
          <div className="h-[1.1rem] w-[7rem] overflow-clip rounded-sm border border-zinc-800 bg-black">
            <div
              className="h-full transition-[width] duration-100"
              style={{
                width: Math.round(Math.max(lvl.a, lvl.b) * (master / 100) * 100) + "%",
                background: "linear-gradient(90deg,#22d3ee,#a3e635 62%,#f43f5e)",
                boxShadow: "0 0 12px rgba(34,211,238,0.5)",
              }}
            />
          </div>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-3 p-3">
        <div className="flex-1 flex">
          <div className="w-full">
            <Strip id="A" accent="#22d3ee" glow="rgba(34,211,238,0.6)" gain={gainA} setGain={setGainA} eq={eqA} setEq={setEqA}
              filt={filtA} setFilt={setFiltA} vol={volA} setVol={setVolA} level={lvl.a} peak={lvl.pa} cue={cueA} setCue={setCueA} />
          </div>
        </div>

        {/* center */}
        <div className="flex w-[13.5rem] flex-col items-center justify-between rounded-lg border border-zinc-800 bg-gradient-to-b from-zinc-900/70 via-black to-zinc-900/70 px-3 py-3">
          <div className="flex flex-col items-center gap-1">
            <Cap tone="text-zinc-400">Master Out</Cap>
            <div className="h-[4.25rem] w-[4.25rem] transition-transform duration-300 hover:scale-105">
              <Knob min={0} max={100} value={master} onChange={setMaster} />
            </div>
            <div className="text-[0.8rem] font-black tabular-nums tracking-widest text-cyan-300" style={{ textShadow: "0 0 12px rgba(34,211,238,0.55)" }}>
              {master.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-2 rounded-md border border-zinc-800/80 bg-black/60 py-3">
            <Cap tone="text-amber-400/80">Headphone Cue</Cap>
            <div className="h-[3.25rem] w-[3.25rem]">
              <Knob min={0} max={100} value={cueMix} onChange={setCueMix} />
            </div>
            <div className="text-[0.55rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 tabular-nums">
              {cueMix < 45 ? "CUE" : cueMix > 55 ? "MASTER" : "SPLIT"} · {cueMix}
            </div>
            <div className="flex gap-1">
              {[cueA, cueB].map((c, i) => (
                <span
                  key={"c" + i}
                  className="h-1.5 w-6 rounded-full transition-all duration-300"
                  style={{ background: c ? (i ? "#f472b6" : "#22d3ee") : "#27272a", boxShadow: c ? "0 0 10px currentColor" : "none", color: i ? "#f472b6" : "#22d3ee" }}
                />
              ))}
            </div>
          </div>

          <div className="flex w-full items-center justify-between text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            <span>A {Math.round(xfA * 100)}%</span>
            <span className="text-zinc-700">/</span>
            <span>{Math.round(xfB * 100)}% B</span>
          </div>
        </div>

        <div className="flex-1 flex">
          <div className="w-full">
            <Strip id="B" accent="#f472b6" glow="rgba(244,114,182,0.6)" gain={gainB} setGain={setGainB} eq={eqB} setEq={setEqB}
              filt={filtB} setFilt={setFiltB} vol={volB} setVol={setVolB} level={lvl.b} peak={lvl.pb} cue={cueB} setCue={setCueB} />
          </div>
        </div>
      </div>

      {/* crossfader */}
      <div className="flex-none h-[5.25rem] border-t border-zinc-800 bg-gradient-to-b from-zinc-900/70 to-black px-4 py-2">
        <div className="flex h-full items-center gap-4">
          <div className="text-[0.75rem] font-black tracking-[0.25em] text-cyan-300" style={{ textShadow: "0 0 10px rgba(34,211,238,0.5)" }}>A</div>
          <div className="flex-1 flex flex-col justify-center gap-1">
            <div className="h-[2.4rem] w-full">
              <Fader min={-100} max={100} value={xf} onChange={setXf} orientation="horizontal" detents={[0]} />
            </div>
            <div className="flex items-center justify-between px-1 text-[0.5rem] font-semibold uppercase tracking-[0.25em] text-zinc-600">
              <span>Crossfader</span>
              <span className="tabular-nums text-zinc-500">{xf > 0 ? "+" : ""}{xf}</span>
              <span>Curve · Smooth</span>
            </div>
          </div>
          <div className="text-[0.75rem] font-black tracking-[0.25em] text-pink-400" style={{ textShadow: "0 0 10px rgba(244,114,182,0.5)" }}>B</div>
        </div>
      </div>
    </div>
  );
}