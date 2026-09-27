export default function GeneratedComponent() {
  // BUDGET height: header 2.75 + body 19 (diagram) + gap 0.5 + capacity block 8 + padding 0.75 = 31 ≤ 38.1
  // BUDGET width: pad 0.75 + diagram 15.5 + gap 0.5 + detail 24.25 + pad 0.6 = 41.6 ≤ 41.6

  const slots = [
    { id: "frontal", label: "FRONTAL CORTEX", x: 0.5, y: 0.06, item: { id: "i1", label: "Self-ICE", icon: "◈", rarity: "epic" as const, stats: [{ label: "QUICKHACK RES", value: "+22%" }] }, bonuses: [{ v: 22, u: "%QH RES", d: 4 }, { v: 3, u: "RAM", d: 1 }, { v: 12, u: "CRIT%", d: 0 }] },
    { id: "ocular", label: "OCULAR SYSTEM", x: 0.5, y: 0.2, item: { id: "i2", label: "Kiroshi Mk.3", icon: "◉", rarity: "legendary" as const, stats: [{ label: "SCAN", value: "+40%" }] }, bonuses: [{ v: 40, u: "%SCAN", d: 9 }, { v: 8, u: "HEADSHOT", d: 2 }, { v: 5, u: "ACC", d: 0 }] },
    { id: "nervous", label: "NERVOUS SYSTEM", x: 0.5, y: 0.35, item: { id: "i3", label: "Kerenzikov", icon: "⌁", rarity: "rare" as const, stats: [{ label: "SLOW-MO", value: "1.5s" }] }, bonuses: [{ v: 1.5, u: "SEC", d: 0 }, { v: 15, u: "%EVADE", d: 3 }, { v: 6, u: "REFLEX", d: 1 }] },
    { id: "arms", label: "ARMS", x: 0.13, y: 0.42, item: { id: "i4", label: "Mantis Blades", icon: "⚔", rarity: "epic" as const, stats: [{ label: "DMG", value: "+118" }] }, bonuses: [{ v: 118, u: "DMG", d: 12 }, { v: 24, u: "BLEED", d: 5 }, { v: 2, u: "ARMOR", d: 0 }] },
    { id: "circulatory", label: "CIRCULATORY", x: 0.5, y: 0.5, item: { id: "i5", label: "Blood Pump", icon: "❤", rarity: "uncommon" as const, stats: [{ label: "HEAL", value: "+30%" }] }, bonuses: [{ v: 30, u: "%HEAL", d: 6 }, { v: 45, u: "HP", d: 10 }, { v: 4, u: "REGEN", d: 1 }] },
    { id: "integ", label: "INTEGUMENTARY", x: 0.87, y: 0.42, item: { id: "i6", label: "Subdermal Armor", icon: "▤", rarity: "rare" as const, stats: [{ label: "ARMOR", value: "+96" }] }, bonuses: [{ v: 96, u: "ARMOR", d: 14 }, { v: 12, u: "%RES", d: 2 }, { v: 0, u: "STEALTH", d: 0 }] },
    { id: "skeleton", label: "SKELETON", x: 0.5, y: 0.64, item: { id: "i7", label: "Titanium Bones", icon: "⯃", rarity: "common" as const, stats: [{ label: "CARRY", value: "+60" }] }, bonuses: [{ v: 60, u: "CARRY", d: 8 }, { v: 20, u: "%MELEE", d: 3 }, { v: 1, u: "ARMOR", d: 0 }] },
    { id: "legs", label: "LEGS", x: 0.5, y: 0.86, item: { id: "i8", label: "Reinforced Tendons", icon: "⇈", rarity: "uncommon" as const, stats: [{ label: "JUMP", value: "DOUBLE" }] }, bonuses: [{ v: 2, u: "JUMP", d: 0 }, { v: 18, u: "%MOVE", d: 4 }, { v: 7, u: "STAM", d: 1 }] },
  ];

  const [sel, setSel] = useState("ocular");
  const [cap, setCap] = useState(214);
  const [flash, setFlash] = useState(0);
  const maxCap = 290;
  const active = slots.find((s) => s.id === sel) || slots[0];

  const swap = () => {
    setCap((c) => {
      const n = c + (Math.random() > 0.5 ? 13 : -11);
      return Math.max(60, Math.min(maxCap, n));
    });
    setFlash((f) => f + 1);
  };

  const pct = cap / maxCap;
  const tone = pct > 0.92 ? "danger" : pct > 0.75 ? "warning" : "accent";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#08090c] text-[#fcee0a] font-mono relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16] z-0"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(252,238,10,.5) 0px,rgba(252,238,10,.5) 1px,transparent 1px,transparent 4px)" }}
      />

      {/* header */}
      <div className="flex-none h-11 px-3 flex items-center gap-3 bg-[#fcee0a] text-[#08090c] relative z-10">
        <span className="text-[10px] font-black tracking-[0.28em]">RIPPERDOC // CYBERWARE</span>
        <div className="flex-1 min-w-0 h-[6px] bg-[#08090c]/20 overflow-hidden">
          <div className="h-full w-1/3 bg-[#08090c] animate-[pulse_1.4s_ease-in-out_infinite]" />
        </div>
        <span className="text-[10px] font-bold tracking-widest truncate">V // MERC</span>
      </div>

      <div className="flex-1 flex flex-row gap-2 p-2 relative z-10">
        {/* diagram */}
        <div className="w-[15.5rem] flex-none relative bg-[#0d0f14] border border-[#fcee0a]/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,229,255,0.10),transparent_65%)]" />
          <div className="absolute inset-0">
            <BodyDiagram points={slots.map((s) => ({ id: s.id, x: s.x, y: s.y }))}>
              {slots.map((s) => (
                <EquipmentSlot
                  key={s.id}
                  slotId={s.id}
                  item={s.item}
                  selected={s.id === sel}
                  position={{ x: s.x, y: s.y }}
                  onSelect={setSel}
                />
              ))}
            </BodyDiagram>
          </div>
        </div>

        {/* detail */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-none bg-[#0d0f14] border-l-4 border-[#00e5ff] px-3 py-2">
            <div className="text-[9px] tracking-[0.3em] text-[#00e5ff]">{active.label}</div>
            <div className="text-base font-black tracking-tight text-[#fcee0a] truncate">{active.item.label}</div>
            <div className="text-[9px] tracking-[0.2em] uppercase text-[#fcee0a]/50">{active.item.rarity} // INSTALLED</div>
          </div>

          <div className="flex-none">
            <div className="text-[9px] tracking-[0.3em] text-[#fcee0a]/60 mb-1">SLOT BONUSES</div>
            <div className="flex flex-row gap-2">
              {active.bonuses.map((b, i) => (
                <div key={active.id + i} className="flex-1 h-[2.6rem]">
                  <StatReadout value={b.v} unit={b.u} delta={b.d} tone={i === 0 ? "accent" : "neutral"} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-[#0d0f14] border border-[#fcee0a]/20 p-2 flex flex-col justify-between">
            <div className="space-y-1">
              {["NEURAL LINK", "SYNC RATE", "HUMANITY"].map((l, i) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="text-[9px] tracking-[0.2em] text-[#fcee0a]/50 truncate">{l}</span>
                  <div className="flex-1 min-w-0 h-[3px] bg-[#fcee0a]/10 overflow-hidden">
                    <div
                      className="h-full bg-[#00e5ff] transition-all duration-700"
                      style={{ width: [72, 91, 58][i] + "%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-[2rem]">
                <ActionButton onPress={swap} tone="accent">
                  <span className="font-black tracking-[0.2em]">SWAP</span>
                </ActionButton>
              </div>
              <div className="w-[6rem] h-[2rem]">
                <ActionButton onPress={swap} tone="danger">
                  <span className="font-black tracking-[0.2em]">UNSLOT</span>
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOCAL: capacity meter */}
      <div className="flex-none relative z-10 px-2 pb-2">
        <div className="bg-[#0d0f14] border border-[#fcee0a]/30 p-3">
          <div className="flex items-end justify-between mb-2">
            <span className="text-[11px] font-black tracking-[0.3em] text-[#fcee0a]">CYBERWARE CAPACITY</span>
            <span
              key={flash}
              className="text-[11px] tracking-[0.2em] text-[#00e5ff] animate-[pulse_0.6s_ease-in-out_2]"
            >
              {cap} / {maxCap}
            </span>
          </div>
          <div className="h-[4.5rem] w-full transition-all duration-500">
            <StatBar value={cap} max={maxCap} tone={tone as "accent" | "warning" | "danger"} showNumeric />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-[2px] flex-1 min-w-0 bg-gradient-to-r from-[#fcee0a] to-transparent" />
            <span className="text-[9px] tracking-[0.25em] text-[#fcee0a]/50">TECH ABILITY LINKED</span>
          </div>
        </div>
      </div>
    </div>
  );
}