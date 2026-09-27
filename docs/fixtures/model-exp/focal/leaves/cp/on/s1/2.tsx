export default function GeneratedComponent() {
  // BUDGET height: header 2.5 + body 26.1 + capacity 9.5 = 38.1 ≤ 38.1
  // BUDGET width: diagram 18 + gap 0.5 + detail 23.1 = 41.6 ≤ 41.6

  const SLOTS = [
    { id: "frontal", label: "FRONTAL CORTEX", x: 0.5, y: 0.06 },
    { id: "ocular", label: "OCULAR SYSTEM", x: 0.5, y: 0.2 },
    { id: "nervous", label: "NERVOUS SYSTEM", x: 0.16, y: 0.34 },
    { id: "circulatory", label: "CIRCULATORY", x: 0.84, y: 0.34 },
    { id: "arms", label: "ARMS", x: 0.13, y: 0.55 },
    { id: "skeleton", label: "SKELETON", x: 0.87, y: 0.55 },
    { id: "integumentary", label: "INTEGUMENTARY", x: 0.5, y: 0.72 },
    { id: "legs", label: "LEGS", x: 0.5, y: 0.92 },
  ];

  const CATALOG: Record<string, any[]> = {
    frontal: [
      { id: "f1", label: "Kerenzikov", icon: "◈", rarity: "epic", cost: 42, stats: [{ label: "SLOW-MO", value: "+30%" }, { label: "CRIT", value: "+8%" }] },
      { id: "f2", label: "Axolotl", icon: "◉", rarity: "legendary", cost: 60, stats: [{ label: "CD RED", value: "+25%" }, { label: "RAM", value: "+4" }] },
    ],
    ocular: [
      { id: "o1", label: "Kiroshi Mk.3", icon: "◎", rarity: "rare", cost: 28, stats: [{ label: "SCAN", value: "+40%" }, { label: "HEADSHOT", value: "+12%" }] },
      { id: "o2", label: "Ballistic Coproc.", icon: "✦", rarity: "epic", cost: 38, stats: [{ label: "ACCURACY", value: "+18%" }] },
    ],
    nervous: [
      { id: "n1", label: "Reflex Tuner", icon: "⌁", rarity: "epic", cost: 35, stats: [{ label: "REFLEX", value: "+22%" }, { label: "EVADE", value: "+9%" }] },
    ],
    circulatory: [
      { id: "c1", label: "Biomonitor", icon: "♥", rarity: "uncommon", cost: 18, stats: [{ label: "HP REGEN", value: "+6/s" }] },
      { id: "c2", label: "Blood Pump", icon: "◍", rarity: "legendary", cost: 52, stats: [{ label: "HEALTH", value: "+120" }, { label: "REGEN", value: "+14/s" }] },
    ],
    arms: [
      { id: "a1", label: "Gorilla Arms", icon: "⛬", rarity: "rare", cost: 30, stats: [{ label: "MELEE", value: "+45%" }] },
      { id: "a2", label: "Monowire", icon: "〰", rarity: "epic", cost: 44, stats: [{ label: "QUICKHACK", value: "+20%" }] },
    ],
    skeleton: [
      { id: "s1", label: "Titanium Bones", icon: "⬢", rarity: "rare", cost: 26, stats: [{ label: "ARMOR", value: "+85" }, { label: "CARRY", value: "+40" }] },
    ],
    integumentary: [
      { id: "i1", label: "Subdermal Armor", icon: "▤", rarity: "epic", cost: 36, stats: [{ label: "ARMOR", value: "+140" }, { label: "BURN RES", value: "+25%" }] },
      { id: "i2", label: "Optical Camo", icon: "◌", rarity: "legendary", cost: 55, stats: [{ label: "STEALTH", value: "+60%" }] },
    ],
    legs: [
      { id: "l1", label: "Reinforced Tendons", icon: "⌃", rarity: "uncommon", cost: 16, stats: [{ label: "JUMP", value: "+35%" }] },
      { id: "l2", label: "Fortified Ankles", icon: "⌄", rarity: "rare", cost: 24, stats: [{ label: "CHARGE JUMP", value: "+50%" }] },
    ],
  };

  const [equipped, setEquipped] = useState<Record<string, number | null>>({
    frontal: 0, ocular: 0, nervous: null, circulatory: 1, arms: 0, skeleton: 0, integumentary: null, legs: 0,
  });
  const [selected, setSelected] = useState("circulatory");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => p + 1), 1800);
    return () => clearInterval(t);
  }, []);

  const MAX_CAP = 240;
  const used = useMemo(
    () =>
      Object.entries(equipped).reduce((sum, [k, idx]) => (idx == null ? sum : sum + CATALOG[k][idx].cost), 0),
    [equipped]
  );

  const current = equipped[selected] == null ? null : CATALOG[selected][equipped[selected] as number];
  const slotMeta = SLOTS.find((s) => s.id === selected)!;

  const swap = () => {
    setEquipped((prev) => {
      const list = CATALOG[selected];
      const cur = prev[selected];
      const next = cur == null ? 0 : cur + 1 >= list.length ? null : cur + 1;
      return { ...prev, [selected]: next };
    });
  };

  const tone = used / MAX_CAP > 0.92 ? "danger" : used / MAX_CAP > 0.75 ? "warning" : "accent";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#0b0b06] text-[#f5f13a] font-mono relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] z-20 bg-[repeating-linear-gradient(0deg,#f5f13a_0px,#f5f13a_1px,transparent_1px,transparent_3px)]" />

      {/* HEADER */}
      <div className="flex-none h-10 flex items-center gap-2 px-3 bg-[#f5f13a] text-black">
        <span className="text-[13px] font-black tracking-[0.2em] truncate">RIPPERDOC // CYBERWARE LOADOUT</span>
        <span className="ml-auto text-[10px] font-bold tracking-[0.18em] bg-black text-[#f5f13a] px-2 py-0.5">V.2.13</span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex gap-1 p-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* DIAGRAM */}
        <div className="w-[18rem] relative bg-[#101008] border border-[#f5f13a]/30 overflow-clip">
          <div
            key={pulse}
            className="pointer-events-none absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-[#f5f13a]/12 to-transparent animate-[scan_1.8s_linear]"
          />
          <style>{"@keyframes scan{0%{top:-4rem}100%{top:100%}}@keyframes flick{0%,100%{opacity:1}50%{opacity:.55}}"}</style>
          <BodyDiagram points={SLOTS.map((s) => ({ id: s.id, x: s.x, y: s.y }))}>
            {SLOTS.map((s) => (
              <EquipmentSlot
                key={s.id}
                slotId={s.id}
                position={{ x: s.x, y: s.y }}
                selected={selected === s.id}
                item={
                  equipped[s.id] == null
                    ? undefined
                    : {
                        id: CATALOG[s.id][equipped[s.id] as number].id,
                        label: CATALOG[s.id][equipped[s.id] as number].label,
                        icon: CATALOG[s.id][equipped[s.id] as number].icon,
                        rarity: CATALOG[s.id][equipped[s.id] as number].rarity,
                        stats: CATALOG[s.id][equipped[s.id] as number].stats,
                      }
                }
                onSelect={setSelected}
              />
            ))}
          </BodyDiagram>
        </div>

        {/* DETAIL */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex-none bg-[#f5f13a] text-black px-2 py-1">
            <div className="text-[9px] font-bold tracking-[0.25em] truncate">{slotMeta.label}</div>
            <div className="text-[13px] font-black tracking-tight truncate">
              {current ? current.label.toUpperCase() : "— EMPTY SOCKET —"}
            </div>
          </div>

          <div className="flex-1 min-w-0 bg-[#101008] border border-[#f5f13a]/30 p-2 flex flex-col gap-2 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="text-[9px] tracking-[0.25em] text-[#f5f13a]/60">SLOT BONUSES</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(current ? current.stats : []).map((st: any, i: number) => (
                <div key={i} className="flex flex-col gap-0.5">
                  <div className="h-8">
                    <StatReadout value={st.value} tone="accent" />
                  </div>
                  <div className="text-[8px] tracking-[0.18em] text-[#f5f13a]/55 truncate">{st.label}</div>
                </div>
              ))}
              {!current && (
                <div className="col-span-2 text-[10px] text-[#f5f13a]/40 tracking-[0.15em] py-4">
                  NO IMPLANT INSTALLED.<br />PRESS SWAP TO FIT HARDWARE.
                </div>
              )}
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-[#f5f13a]/20">
              <span className="text-[9px] tracking-[0.2em] text-[#f5f13a]/60 truncate">
                COST {current ? current.cost : 0}
              </span>
              <div className="w-[7rem] h-[2.1rem]">
                <ActionButton onPress={swap} tone="accent">
                  <span className="font-black tracking-[0.2em]">SWAP</span>
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAPACITY — FOCAL */}
      <div className="flex-none px-2 pb-2 pt-1">
        <div className="flex items-baseline justify-between px-0.5 pb-1">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#f5f13a]/70">CYBERWARE CAPACITY</span>
          <span
            className="text-[11px] font-black tracking-[0.15em]"
            style={{ animation: used / MAX_CAP > 0.92 ? "flick 0.7s infinite" : undefined }}
          >
            {used} / {MAX_CAP}
          </span>
        </div>
        <div className="h-[4.6rem] w-full">
          <StatBar value={used} max={MAX_CAP} segments={24} tone={tone as any} showNumeric />
        </div>
      </div>
    </div>
  );
}