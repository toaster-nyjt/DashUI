export default function GeneratedComponent() {
  // BUDGET height: padding 1rem + portrait/body row 11.5rem + 1rem = 13.5 ≤ 13.9
  // BUDGET width: pad 1 + portrait 8 + gap 1 + bars 60 + gap 1 + readouts(4 × 7=28) + gap 1 + status 22 + gap 1 + clock 8 + pad 1 = 132 ≤ 156.1

  const [hp, setHp] = useState(268);
  const maxHp = 340;
  const [stam, setStam] = useState(82);
  const [cred, setCred] = useState(64);
  const [eddies, setEddies] = useState(41820);
  const [clock, setClock] = useState(Date.now());
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setStam((s) => Math.max(18, Math.min(100, s + (Math.random() * 26 - 11))));
      setHp((h) => Math.max(96, Math.min(maxHp, h + (Math.random() * 30 - 12))));
      setCred((c) => (c >= 100 ? 12 : c + Math.random() * 3));
      setEddies((e) => e + Math.round(Math.random() * 90));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 160);
    }, 5200);
    return () => clearInterval(t);
  }, []);

  const effects = useMemo(
    () => [
      { id: "e1", label: "Overclock", icon: "⚡", stacks: 2, remaining: 24, tone: "buff" as const },
      { id: "e2", label: "Berserk", icon: "✖", remaining: 11, tone: "buff" as const },
      { id: "e3", label: "Bleeding", icon: "✦", stacks: 3, remaining: 7, tone: "debuff" as const },
      { id: "e4", label: "Burn", icon: "▲", remaining: 4, tone: "debuff" as const },
    ],
    []
  );

  const hpTone = hp / maxHp < 0.25 ? "danger" : hp / maxHp < 0.5 ? "warning" : "accent";

  const label = (t: string, v: string) => (
    <div className="flex items-baseline justify-between px-[0.15rem] pb-[0.2rem]">
      <span className="text-[0.62rem] font-black uppercase tracking-[0.34em] text-cyan-300/80">{t}</span>
      <span className="text-[0.62rem] font-mono font-bold tracking-widest text-[#fcee0a]">{v}</span>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07080c] text-[#fcee0a] relative">
      <style>{`
        @keyframes scanSweep { 0%{transform:translateX(-30%)} 100%{transform:translateX(130%)} }
        @keyframes flick { 0%,100%{opacity:.9} 47%{opacity:.35} 52%{opacity:1} }
        @keyframes pulseEdge { 0%,100%{box-shadow:inset 0 0 0 1px rgba(252,238,10,.35)} 50%{box-shadow:inset 0 0 0 1px rgba(0,255,240,.65)} }
      `}</style>

      {/* scanline texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16] z-20"
        style={{ backgroundImage: "repeating-linear-gradient(180deg,#fff 0px,#fff 1px,transparent 1px,transparent 3px)" }}
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%] z-20 opacity-20 bg-gradient-to-r from-transparent via-cyan-300 to-transparent" style={{ animation: "scanSweep 6s linear infinite" }} />
      <div className="pointer-events-none absolute inset-0 z-20" style={{ background: "radial-gradient(120% 180% at 50% 50%, transparent 55%, rgba(0,0,0,.85) 100%)" }} />

      <div className="flex-1 flex flex-row items-stretch gap-3 p-3 relative z-10">
        {/* PORTRAIT */}
        <div className="flex flex-row items-stretch gap-2">
          <div className="w-[0.35rem] bg-gradient-to-b from-[#fcee0a] via-[#ff003c] to-cyan-400" style={{ animation: "flick 3.5s infinite" }} />
          <div className="w-[8rem] h-full relative" style={{ filter: glitch ? "hue-rotate(80deg) contrast(1.4)" : "none", transition: "filter .12s" }}>
            <CharacterPortrait src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&q=60" alt="V" />
          </div>
          <div className="flex flex-col justify-between py-[0.15rem]">
            <span className="text-[1.5rem] font-black leading-none tracking-tighter text-[#fcee0a]" style={{ textShadow: glitch ? "0.12em 0 #ff003c, -0.12em 0 #00fff0" : "0 0 12px rgba(252,238,10,.5)" }}>V</span>
            <span className="text-[0.55rem] font-mono uppercase tracking-[0.3em] text-cyan-300/70 [writing-mode:vertical-rl] rotate-180">merc // n.c.</span>
          </div>
        </div>

        {/* BARS — FOCAL */}
        <div className="flex-1 flex flex-col justify-center gap-[0.55rem] px-2 bg-[#0c0e14]/70 border border-[#fcee0a]/20" style={{ clipPath: "polygon(0 0, calc(100% - 0.9rem) 0, 100% 0.9rem, 100% 100%, 0.9rem 100%, 0 calc(100% - 0.9rem))" }}>
          <div>
            {label("Health", Math.round(hp) + " / " + maxHp)}
            <div className="h-[2.6rem] w-full">
              <StatBar value={Math.round(hp)} max={maxHp} tone={hpTone as "accent"} showNumeric />
            </div>
          </div>
          <div>
            {label("Stamina", Math.round(stam) + "%")}
            <div className="h-[1.9rem] w-full">
              <StatBar value={Math.round(stam)} max={100} segments={12} tone="neutral" />
            </div>
          </div>
          <div>
            {label("Street Cred", "LVL 27 · " + Math.round(cred) + "%")}
            <div className="h-[1.6rem] w-full">
              <StatBar value={Math.round(cred)} max={100} tone="warning" />
            </div>
          </div>
        </div>

        {/* READOUTS */}
        <div className="flex flex-row items-stretch gap-2">
          {[
            { k: "ARMOR", n: <StatReadout value={412} unit="AR" delta={18} tone="accent" /> },
            { k: "LEVEL", n: <StatReadout value={42} tone="neutral" /> },
            { k: "EDDIES", n: <StatReadout value={eddies.toLocaleString()} unit="€$" delta={2} tone="warning" /> },
          ].map((c) => (
            <div key={c.k} className="w-[7.5rem] h-full flex flex-col border border-cyan-300/25 bg-[#0c0e14]/70 hover:border-[#fcee0a] transition-colors duration-200" style={{ animation: "pulseEdge 4s infinite" }}>
              <div className="flex-none h-[1.2rem] flex items-center px-2 bg-cyan-300/10 text-[0.55rem] font-black uppercase tracking-[0.3em] text-cyan-200">{c.k}</div>
              <div className="flex-1 flex items-center px-2">
                <div className="w-full h-[3rem]">{c.n}</div>
              </div>
            </div>
          ))}
        </div>

        {/* STATUS + CLOCK */}
        <div className="flex flex-col justify-between gap-2">
          <div className="w-[24rem] h-[5.2rem] border border-[#ff003c]/35 bg-[#0c0e14]/70 p-1">
            <StatusEffectList effects={effects} />
          </div>
          <div className="w-[24rem] h-[3rem] flex flex-row items-stretch gap-2">
            <div className="flex-1 flex items-center px-2 border border-[#fcee0a]/25 bg-[#fcee0a]/5">
              <span className="text-[0.6rem] font-mono uppercase tracking-[0.3em] text-[#fcee0a]/70 truncate">sys::night city</span>
            </div>
            <div className="w-[9rem] h-full">
              <SystemClock time={clock} format="24h" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}