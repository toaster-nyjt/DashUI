export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + points 2.75 + gap 0.5 + 5×attrRow(2.75)=13.75 + gaps 4×0.375=1.5 + gap 0.5 + perkhdr 1 + PerkList 8.5 + padding 1.5 + footer 1.75 = 33.5 ≤ 38.1
  // BUDGET width: padding 1.5 + label 8 + StatReadout 3.5 + gap 0.5 + Stepper 7 + bar flex = 20.5 ≤ 38.1

  const [attrs, setAttrs] = useState<{ id: string; label: string; abbr: string; value: number }[]>([
    { id: "body", label: "Body", abbr: "BOD", value: 12 },
    { id: "reflexes", label: "Reflexes", abbr: "REF", value: 9 },
    { id: "technical", label: "Technical Ability", abbr: "TEC", value: 14 },
    { id: "intelligence", label: "Intelligence", abbr: "INT", value: 7 },
    { id: "cool", label: "Cool", abbr: "COO", value: 10 },
  ]);
  const [base] = useState<Record<string, number>>({ body: 12, reflexes: 9, technical: 14, intelligence: 7, cool: 10 });
  const [pool, setPool] = useState(7);
  const [sel, setSel] = useState("body");
  const [flash, setFlash] = useState<string | null>(null);

  const perkMap: Record<string, { id: string; label: string; description?: string; rank?: number; maxRank?: number; unlocked?: boolean }[]> = {
    body: [
      { id: "b1", label: "Painkiller", description: "Health regen extends into combat.", rank: 2, maxRank: 3, unlocked: true },
      { id: "b2", label: "Wolverine", description: "+30% health regen rate.", rank: 1, maxRank: 2, unlocked: true },
      { id: "b3", label: "Dorph-Head", description: "Gain adrenaline on finisher.", rank: 0, maxRank: 3, unlocked: false },
      { id: "b4", label: "Quake", description: "Ground slam shockwave.", rank: 0, maxRank: 1, unlocked: false },
    ],
    reflexes: [
      { id: "r1", label: "Slippery", description: "+25% evasion while dodging.", rank: 3, maxRank: 3, unlocked: true },
      { id: "r2", label: "Air Dash", description: "Dash mid-air once.", rank: 1, maxRank: 1, unlocked: true },
      { id: "r3", label: "Mongoose", description: "Perfect dodge slows time.", rank: 0, maxRank: 2, unlocked: false },
    ],
    technical: [
      { id: "t1", label: "Glutton For War", description: "Regen RAM on grenade hit.", rank: 2, maxRank: 2, unlocked: true },
      { id: "t2", label: "Renaissance Punk", description: "+1 to all attributes ≥ 9.", rank: 1, maxRank: 1, unlocked: true },
      { id: "t3", label: "Edgerunner", description: "Exceed cyberware capacity.", rank: 1, maxRank: 2, unlocked: true },
      { id: "t4", label: "Chrome Compressor", description: "+10 cyberware capacity.", rank: 0, maxRank: 3, unlocked: false },
    ],
    intelligence: [
      { id: "i1", label: "Embedded Breach", description: "Auto-breach on quickhack.", rank: 1, maxRank: 2, unlocked: true },
      { id: "i2", label: "Overclock", description: "Spend health as RAM.", rank: 0, maxRank: 1, unlocked: false },
      { id: "i3", label: "Bloodware", description: "Quickhacks deal damage.", rank: 0, maxRank: 3, unlocked: false },
    ],
    cool: [
      { id: "c1", label: "Ninjutsu", description: "+35% stealth damage.", rank: 2, maxRank: 3, unlocked: true },
      { id: "c2", label: "Deep Breath", description: "Extended focus window.", rank: 1, maxRank: 2, unlocked: true },
      { id: "c3", label: "Killer Instinct", description: "+30% crouch move speed.", rank: 0, maxRank: 2, unlocked: false },
    ],
  };

  const setAttr = (id: string, v: number) => {
    setAttrs((prev) => {
      const cur = prev.find((a) => a.id === id);
      if (!cur) return prev;
      const min = base[id];
      const next = Math.max(min, Math.min(20, v));
      const delta = next - cur.value;
      if (delta > 0 && delta > pool) return prev;
      setPool((p) => p - delta);
      return prev.map((a) => (a.id === id ? { ...a, value: next } : a));
    });
    setSel(id);
    setFlash(id);
    setTimeout(() => setFlash(null), 450);
  };

  const spent = attrs.reduce((s, a) => s + (a.value - base[a.id]), 0);
  const selAttr = attrs.find((a) => a.id === sel)!;

  const bodyVal = attrs.find((a) => a.id === "body")!.value;
  const reflexesVal = attrs.find((a) => a.id === "reflexes")!.value;
  const coolVal = attrs.find((a) => a.id === "cool")!.value;
  const technicalVal = attrs.find((a) => a.id === "technical")!.value;

  useEffect(() => {
    bus.emit("Cyberpunk 2077: Attributes & Perks Panel->Cyberpunk 2077: V Vitals Status HUD", {
      body: bodyVal,
      reflexes: reflexesVal,
      cool: coolVal,
    });
  }, [bodyVal, reflexesVal, coolVal]);

  useEffect(() => {
    bus.emit("Cyberpunk 2077: Attributes & Perks Panel->Cyberpunk 2077: Cyberware Ripperdoc Loadout", {
      technical: technicalVal,
    });
  }, [technicalVal]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-cyan-50 font-mono">
      <div className="h-9 flex-none flex items-center justify-between px-3 border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-fuchsia-400 animate-pulse">◈</span>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)]">
            Attributes
          </span>
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-cyan-300/70">V // BUILD.SYS</span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Available points */}
        <div className="flex-none flex items-center gap-3 rounded-md border border-cyan-400/15 bg-black/60 px-2 py-2 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
          <div className="flex flex-col leading-none">
            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-cyan-300/70">Attribute Points</span>
            <span className="text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500">Spent {spent}</span>
          </div>
          <div className="ml-auto" style={{ width: "5rem", height: "2rem" }}>
            <StatReadout value={pool} unit="PTS" tone={pool > 0 ? "accent" : "neutral"} />
          </div>
        </div>

        {/* Attribute rows */}
        <div className="flex-none flex flex-col gap-1.5">
          {attrs.map((a) => {
            const active = sel === a.id;
            return (
              <div
                key={a.id}
                onClick={() => setSel(a.id)}
                className={
                  "flex items-center gap-2 rounded-md border px-2 py-1 transition-all duration-200 cursor-pointer " +
                  (active
                    ? "border-yellow-300/70 bg-cyan-400/10 shadow-[0_0_12px_-2px_rgba(253,224,71,0.5)]"
                    : "border-cyan-400/20 bg-black/40 hover:border-yellow-300/70 hover:bg-cyan-400/10")
                }
              >
                <div className="flex flex-col leading-none" style={{ width: "7.5rem" }}>
                  <span className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50">{a.label}</span>
                  <span className="text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">{a.abbr} — LV {a.value}</span>
                </div>

                <div style={{ width: "3.75rem", height: "2rem" }}>
                  <StatReadout
                    value={a.value}
                    delta={a.value - base[a.id] !== 0 ? a.value - base[a.id] : undefined}
                    tone={flash === a.id ? "accent" : a.value >= 15 ? "warning" : "neutral"}
                  />
                </div>

                <div className="flex-1 flex h-4 items-center gap-[2px] px-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className={
                        "h-full flex-1 rounded-[1px] transition-all duration-500 " +
                        (i < a.value
                          ? i < base[a.id]
                            ? "bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                            : "bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]"
                          : "bg-cyan-400/10")
                      }
                    />
                  ))}
                </div>

                <div style={{ width: "7rem", height: "2rem" }}>
                  <Stepper
                    value={a.value}
                    min={base[a.id]}
                    max={20}
                    step={1}
                    onChange={(v) => setAttr(a.id, v)}
                    disabled={pool <= 0 && a.value <= base[a.id]}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Perk highlights */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex-none flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              Perk Highlights
            </span>
            <span className="rounded-full border border-fuchsia-400/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-400">
              {selAttr.label}
            </span>
          </div>
          <div className="flex-1 rounded-md border border-cyan-400/15 bg-black/60 p-1 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]" style={{ minHeight: "8.5rem" }}>
            <PerkList perks={perkMap[sel]} />
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 border-t border-cyan-400/20 bg-black/50 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cyan-300/70">
        <span>{pool > 0 ? "◆ Points Pending Allocation" : "◆ Allocation Locked"}</span>
        <span className="text-lime-300">SYNC // VITALS · CHROME</span>
      </div>
    </div>
  );
}