export default function GeneratedComponent() {
  // BUDGET height: chrome 1.75 + padding 0.75 + body row 11.0 (portrait 4.5..11 fits, bars 3×1.25 + 2×0.5 gaps = 4.75) = 13.5 ≤ 13.9
  // BUDGET width: pad 1 + portrait 8 + gap .75 + level 4 + gap .75 + bars 46 + gap .75 + readouts 2×7 + gap .75 + effects 22 + gap .75 + clock 6 + pad 1 = 106.5 ≤ 156.1

  const [hp, setHp] = useState(268);
  const hpMax = 340;
  const [stam, setStam] = useState(82);
  const [cred] = useState(1740);
  const credMax = 2500;
  const [eddies] = useState(48210);
  const [clock, setClock] = useState("21:47");
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setClock(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"));
      setStam((s) => Math.max(18, Math.min(100, s + (Math.random() * 18 - 8))));
      setHp((h) => Math.max(120, Math.min(hpMax, h + (Math.random() * 14 - 6))));
    }, 1600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 160);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const effects = [
    { id: "bleed", label: "BLEED", icon: "🩸", stacks: 2, remaining: 6, tone: "debuff" as const },
    { id: "overclk", label: "OVERCLOCK", icon: "⚡", stacks: 1, remaining: 21, tone: "buff" as const },
    { id: "armor", label: "ARMOR UP", icon: "🛡", remaining: 44, tone: "buff" as const },
    { id: "emp", label: "EMP", icon: "☢", stacks: 3, remaining: 9, tone: "debuff" as const },
  ];

  const Label = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/70">{children}</span>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07090d] text-cyan-100 font-mono relative">
      {/* scanline veil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] z-20"
        style={{ backgroundImage: "repeating-linear-gradient(180deg,rgba(0,255,240,0.5) 0px,rgba(0,255,240,0.5) 1px,transparent 1px,transparent 3px)" }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "radial-gradient(120% 180% at 12% 0%, rgba(255,0,90,0.16), transparent 55%), radial-gradient(120% 180% at 88% 100%, rgba(0,255,240,0.14), transparent 55%)" }}
      />

      {/* chrome */}
      <div className="flex-none h-7 px-4 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-[#ff003c]/20 via-transparent to-[#00fff0]/15 relative z-30">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={"text-[11px] font-black uppercase tracking-[0.42em] text-[#00fff0] transition-transform duration-100 " + (glitch ? "translate-x-[2px] skew-x-6" : "")}
            style={{ textShadow: glitch ? "2px 0 #ff003c, -2px 0 #00fff0" : "0 0 10px rgba(0,255,240,0.6)" }}
          >
            V // VITALS
          </span>
          <span className="h-3 w-px bg-cyan-400/40" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#ff003c]/80 truncate">merc · night city</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/60">link</span>
          <span className="h-2 w-2 rounded-full bg-[#00fff0] animate-pulse" style={{ boxShadow: "0 0 8px #00fff0" }} />
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex items-stretch gap-3 px-4 py-2 relative z-30 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* portrait + level */}
        <div className="flex-none flex items-center gap-3">
          <div
            className={"w-[7rem] h-full relative overflow-clip border border-[#00fff0]/40 transition-all duration-150 " + (glitch ? "translate-x-[1.5px]" : "")}
            style={{ boxShadow: "0 0 18px rgba(0,255,240,0.25) inset" }}
          >
            <CharacterPortrait src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400&q=60" alt="V" />
          </div>
          <div className="flex-none flex flex-col justify-center gap-1">
            <Label>LVL</Label>
            <div className="w-[4.5rem] h-[2.2rem]">
              <StatReadout value={42} tone="accent" delta={1} />
            </div>
          </div>
        </div>

        <div className="w-px self-stretch bg-gradient-to-b from-transparent via-[#ff003c]/50 to-transparent" />

        {/* bars */}
        <div className="flex-1 flex flex-col justify-center gap-[0.45rem]">
          <div className="flex items-center gap-2">
            <div className="w-[7rem] flex-none"><Label>HEALTH</Label></div>
            <div className="flex-1 h-[1.4rem]">
              <StatBar value={Math.round(hp)} max={hpMax} tone={hp / hpMax < 0.3 ? "danger" : "accent"} showNumeric />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[7rem] flex-none"><Label>STAMINA</Label></div>
            <div className="flex-1 h-[1.4rem]">
              <StatBar value={Math.round(stam)} max={100} tone={stam < 25 ? "warning" : "neutral"} showNumeric />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[7rem] flex-none"><Label>ST. CRED</Label></div>
            <div className="flex-1 h-[1.4rem]">
              <StatBar value={cred} max={credMax} segments={10} tone="accent" showNumeric />
            </div>
          </div>
        </div>

        <div className="w-px self-stretch bg-gradient-to-b from-transparent via-[#00fff0]/50 to-transparent" />

        {/* readouts */}
        <div className="flex-none flex items-center gap-3">
          <div className="flex flex-col justify-center gap-1">
            <Label>ARMOR</Label>
            <div className="w-[6.5rem] h-[2.2rem]"><StatReadout value={612} unit="AR" tone="neutral" delta={24} /></div>
          </div>
          <div className="flex flex-col justify-center gap-1">
            <Label>EDDIES</Label>
            <div className="w-[8rem] h-[2.2rem]"><StatReadout value={eddies.toLocaleString()} unit="€$" tone="warning" /></div>
          </div>
        </div>

        <div className="w-px self-stretch bg-gradient-to-b from-transparent via-[#ff003c]/50 to-transparent" />

        {/* status effects */}
        <div className="flex-none flex flex-col justify-center gap-1">
          <Label>STATUS</Label>
          <div className="w-[24rem] h-[2.9rem]">
            <StatusEffectList effects={effects} />
          </div>
        </div>

        <div className="flex-1 min-w-0 hidden xl:flex items-center">
          <div className="w-full h-[2.2rem] overflow-clip relative border-y border-cyan-400/15">
            <div
              className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap text-[10px] uppercase tracking-[0.3em] text-cyan-300/45"
              style={{ animation: "none", transform: "translateX(0)" }}
            >
              <span className="px-4">◇ biomonitor nominal ◇ trauma team subscription: platinum ◇ cyberware sync 98% ◇ ripperdoc alert: none ◇</span>
            </div>
          </div>
        </div>

        {/* clock */}
        <div className="flex-none flex flex-col justify-center gap-1 items-end">
          <Label>LOCAL</Label>
          <div className="w-[6.5rem] h-[2.2rem]">
            <SystemClock time={clock} format="24h" />
          </div>
        </div>
      </div>
    </div>
  );
}