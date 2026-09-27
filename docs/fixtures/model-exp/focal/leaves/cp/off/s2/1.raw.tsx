export default function GeneratedComponent() {
  // BUDGET height: header 1.75 + gap 0.5 + body 11.65 (portrait 4.5 ≤ 11.65) = 13.9 ≤ 13.9
  // BUDGET width: pad 0.75 + portrait 6 + gap 0.5 + bars 26 + gap 0.5 + armor 7 + gap 0.5 + status 18 + gap 0.5 + level 7 + gap 0.5 + cred 20 + gap 0.5 + eddies 9 + gap 0.5 + clock 7 + pad 0.75 = 105.75 ≤ 156.1

  const [health] = useState(214);
  const [healthMax] = useState(280);
  const [stamina, setStamina] = useState(62);
  const [cred] = useState(740);
  const [credMax] = useState(1000);
  const [eddies] = useState(48210);
  const [now, setNow] = useState(Date.now());
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setStamina((s) => {
      const n = s + (Math.random() * 18 - 7);
      return Math.max(8, Math.min(100, n));
    }), 1200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const effects = useMemo(() => ([
    { id: "berserk", label: "BERSERK", icon: "⚡", stacks: 2, remaining: 24, tone: "buff" as const },
    { id: "bleed", label: "BLEED", icon: "🩸", remaining: 6, tone: "debuff" as const },
    { id: "armor", label: "SUBDERMAL", icon: "🛡", stacks: 3, tone: "buff" as const },
    { id: "emp", label: "EMP", icon: "◎", remaining: 11, tone: "debuff" as const },
  ]), []);

  const Label = ({ children, accent }: { children: React.ReactNode; accent?: boolean }) => (
    <div className={"flex-none flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] " + (accent ? "text-[#00e5ff]" : "text-[#fcee0a]")}>
      <span className="inline-block h-[3px] w-[3px] rotate-45 bg-current" />
      <span className="truncate">{children}</span>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#08070b] text-[#e8f6ff] relative">
      <style>{`
        @keyframes vsweep { 0%{transform:translateX(-30%)} 100%{transform:translateX(430%)} }
        @keyframes vpulse { 0%,100%{opacity:.35} 50%{opacity:1} }
        @keyframes vshift { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-2px,1px)} 66%{transform:translate(2px,-1px)} }
        @keyframes vscan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
      `}</style>

      {/* scanline + grid texture */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-[0.16] [background-image:repeating-linear-gradient(to_bottom,#7dfdfe_0px,#7dfdfe_1px,transparent_1px,transparent_3px)]" />
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div className="h-1/3 w-full bg-gradient-to-b from-transparent via-[#fcee0a]/10 to-transparent" style={{ animation: "vscan 5.5s linear infinite" }} />
      </div>

      {/* HEADER */}
      <div className="flex-none h-7 flex items-center gap-3 px-3 border-b border-[#fcee0a]/40 bg-[#fcee0a] text-[#08070b] relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={glitch ? { animation: "vshift .18s steps(2) infinite" } : undefined}>V // VITALS</span>
        <span className="h-[10px] w-px bg-[#08070b]/50" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-70">BIOMON LINK ACTIVE</span>
        <div className="flex-1 min-w-0 h-[6px] overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 w-16 bg-[#08070b]/60 skew-x-[-30deg]" style={{ animation: "vsweep 2.8s linear infinite" }} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em]">NC-2077</span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex items-stretch gap-3 px-3 py-2 relative z-10">
        {/* portrait */}
        <div className="flex-none w-[6rem] h-full relative" style={glitch ? { animation: "vshift .18s steps(2) infinite" } : undefined}>
          <div className="absolute -inset-[2px] border border-[#00e5ff]/50" />
          <CharacterPortrait src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&q=60" alt="V" />
        </div>

        {/* vitals column */}
        <div className="flex-none w-[26rem] flex flex-col justify-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label>Health</Label>
              <span className="text-[10px] font-mono text-[#ff2d55]">{health}/{healthMax}</span>
            </div>
            <div className="h-[1.35rem] w-full"><StatBar value={health} max={healthMax} tone="danger" showNumeric={false} /></div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label accent>Stamina</Label>
              <span className="text-[10px] font-mono text-[#00e5ff]" style={{ animation: "vpulse 1.6s ease-in-out infinite" }}>{Math.round(stamina)}%</span>
            </div>
            <div className="h-[1.35rem] w-full"><StatBar value={stamina} max={100} segments={10} tone="accent" showNumeric={false} /></div>
          </div>
        </div>

        {/* armor */}
        <div className="flex-none w-[7.5rem] flex flex-col justify-center gap-1 border-l border-[#00e5ff]/25 pl-3">
          <Label>Armor</Label>
          <div className="h-[2.4rem] w-full"><StatReadout value={412} unit="AR" delta={18} tone="accent" /></div>
        </div>

        {/* status effects */}
        <div className="flex-none w-[19rem] flex flex-col justify-center gap-1 border-l border-[#00e5ff]/25 pl-3">
          <Label accent>Status</Label>
          <div className="h-[2.9rem] w-full"><StatusEffectList effects={effects} /></div>
        </div>

        {/* level */}
        <div className="flex-none w-[7.5rem] flex flex-col justify-center gap-1 border-l border-[#00e5ff]/25 pl-3">
          <Label>Level</Label>
          <div className="h-[2.4rem] w-full"><StatReadout value={42} tone="warning" /></div>
        </div>

        {/* street cred */}
        <div className="flex-none w-[21rem] flex flex-col justify-center gap-1 border-l border-[#00e5ff]/25 pl-3">
          <div className="flex items-center justify-between">
            <Label>Street Cred</Label>
            <span className="text-[10px] font-mono text-[#fcee0a]">{cred}/{credMax}</span>
          </div>
          <div className="h-[1.35rem] w-full"><StatBar value={cred} max={credMax} tone="warning" showNumeric={false} /></div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-[#e8f6ff]/40">RANK · LEGEND OF NC</div>
        </div>

        {/* eddies */}
        <div className="flex-none w-[10rem] flex flex-col justify-center gap-1 border-l border-[#00e5ff]/25 pl-3">
          <Label accent>Eddies</Label>
          <div className="h-[2.4rem] w-full"><StatReadout value={eddies.toLocaleString()} unit="€$" delta={1250} tone="accent" /></div>
        </div>

        {/* clock */}
        <div className="flex-none w-[8rem] flex flex-col justify-center gap-1 border-l border-[#00e5ff]/25 pl-3">
          <Label>Local Time</Label>
          <div className="h-[2rem] w-full"><SystemClock time={now} format="24h" /></div>
        </div>

        <div className="flex-1 min-w-0 hidden lg:flex items-end justify-end pb-1">
          <div className="text-right text-[9px] leading-[1.4] font-mono uppercase tracking-[0.25em] text-[#00e5ff]/35 truncate">
            BIOMON//V.7 · SANDEVISTAN IDLE<br />TRAUMA TEAM PLATINUM
          </div>
        </div>
      </div>
    </div>
  );
}