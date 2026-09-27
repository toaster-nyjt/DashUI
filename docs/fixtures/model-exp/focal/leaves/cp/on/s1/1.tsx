export default function GeneratedComponent() {
  // BUDGET height: header 2 + body(portrait 10 / bars 3×1.25=3.75 + labels 3×0.9 + gaps 1) = 2 + 11.5 = 13.5 ≤ 13.9
  // BUDGET width: portrait 5.5 + gap .75 + bars 40 + gap .75 + status 22 + gap .75 + readouts 3×7=21 + gap .75 + clock 7 + padding 1.5 = 100.75 ≤ 156.1

  const [hp, setHp] = useState(214);
  const maxHp = 310;
  const [stam, setStam] = useState(88);
  const [cred] = useState(64);
  const [now, setNow] = useState(() => Date.now());
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setHp((h) => Math.max(60, Math.min(maxHp, h + Math.round((Math.random() - 0.42) * 18))));
      setStam((s) => Math.max(12, Math.min(100, s + Math.round((Math.random() - 0.45) * 22))));
    }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const effects = [
    { id: "ov", label: "Overclock", icon: "⚡", stacks: 2, remaining: 41, tone: "buff" as const },
    { id: "bl", label: "Bleeding", icon: "🩸", remaining: 12, tone: "debuff" as const },
    { id: "ar", label: "Armor Up", icon: "◈", stacks: 3, remaining: 120, tone: "buff" as const },
    { id: "bn", label: "Burn", icon: "🔥", remaining: 7, tone: "debuff" as const },
  ];

  const hpTone = hp / maxHp < 0.25 ? "danger" : hp / maxHp < 0.5 ? "warning" : "accent";

  const Label = ({ text, right }: { text: string; right?: string }) => (
    <div className="flex items-baseline justify-between gap-2 px-[2px]">
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-300/80 truncate">{text}</span>
      {right ? <span className="text-[10px] font-mono text-cyan-300/70">{right}</span> : null}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#0a0c0e] text-yellow-200 relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16] z-20"
        style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(255,255,255,.5) 0 1px, transparent 1px 3px)" }}
      />
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.75))]" />

      {/* CHROME */}
      <div className="flex-none h-8 flex items-center gap-3 px-3 bg-yellow-300 text-black">
        <span
          className={"text-[11px] font-black uppercase tracking-[0.45em] transition-transform duration-100 " + (glitch ? "translate-x-[3px] skew-x-12" : "")}
        >
          V // VITALS
        </span>
        <div className="h-[3px] flex-1 min-w-0 bg-black/80" />
        <span className="text-[10px] font-mono font-bold tracking-widest">SYS.LINK ACTIVE</span>
        <span className="h-2 w-2 bg-red-600 animate-pulse" />
      </div>

      {/* BODY */}
      <div className="flex-1 flex items-stretch gap-3 px-3 py-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* PORTRAIT */}
        <div className="flex-none w-[5.5rem] h-full relative">
          <div className="absolute -inset-[3px] bg-gradient-to-b from-cyan-400/60 to-fuchsia-500/50 animate-pulse" />
          <div className="relative h-full w-full overflow-clip">
            <CharacterPortrait src="/portrait-v.png" alt="V" />
          </div>
        </div>

        {/* BARS — FOCAL */}
        <div className="flex-1 flex flex-col justify-between gap-1.5">
          <div className="flex flex-col gap-[2px]">
            <Label text="Health" right={hp + " / " + maxHp} />
            <div className="h-[2.1rem] w-full">
              <StatBar value={hp} max={maxHp} tone={hpTone} showNumeric />
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <Label text="Stamina" right={stam + "%"} />
            <div className="h-[1.7rem] w-full">
              <StatBar value={stam} max={100} segments={10} tone="neutral" />
            </div>
          </div>
          <div className="flex flex-col gap-[2px]">
            <Label text="Street Cred" right={cred + " / 100"} />
            <div className="h-[1.45rem] w-full">
              <StatBar value={cred} max={100} tone="warning" />
            </div>
          </div>
        </div>

        {/* STATUS */}
        <div className="flex-none w-[22rem] flex flex-col gap-[2px]">
          <Label text="Status Effects" right="4 ACTIVE" />
          <div className="flex-1 w-full border border-cyan-400/25 bg-cyan-400/5 p-1">
            <div className="h-full w-full">
              <StatusEffectList effects={effects} />
            </div>
          </div>
        </div>

        {/* READOUTS */}
        <div className="flex-none flex items-stretch gap-2">
          {[
            { k: "ARMOR", el: <StatReadout value={412} unit="AR" delta={18} tone="accent" /> },
            { k: "LEVEL", el: <StatReadout value={37} delta={1} tone="warning" /> },
            { k: "EDDIES", el: <StatReadout value="48,920" unit="€$" delta={2400} tone="neutral" /> },
          ].map((r) => (
            <div key={r.k} className="w-[7.5rem] flex flex-col gap-[2px] group">
              <Label text={r.k} />
              <div className="flex-1 w-full border border-yellow-300/25 bg-yellow-300/[0.04] p-1 transition-colors duration-200 group-hover:border-yellow-300 group-hover:bg-yellow-300/10">
                {r.el}
              </div>
            </div>
          ))}
          <div className="w-[8rem] flex flex-col gap-[2px]">
            <Label text="Night City" />
            <div className="flex-1 w-full border border-fuchsia-500/30 bg-fuchsia-500/[0.06] p-1">
              <SystemClock time={now} format="24h" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none h-[3px] bg-gradient-to-r from-cyan-400 via-yellow-300 to-fuchsia-500" />
    </div>
  );
}