export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body padding 1.5 + col label 1.75 + 4 tiers x 4.5 = 18 + gaps 1.5 + footer 1.75 = 26.75 <= 41.6
  // BUDGET width: pad 1.5 + 5 branches x 9.5 = 47.5 + gaps 4x0.75 = 3 + rail 22 + gap 0.75 = 74.75 <= 104.0

  const TIER_REQ = [3, 7, 11, 15];

  const BRANCHES = [
    {
      id: "body", label: "BODY", level: 12, accent: "text-rose-400", line: "from-rose-500/60",
      perks: [
        { id: "bd1", tier: 0, label: "PAIN\nEDITOR", max: 3, bonus: "+12% MAX HEALTH", desc: "Subdermal shock dampeners reduce incoming impact trauma." },
        { id: "bd2", tier: 0, label: "IRON\nLUNG", max: 2, bonus: "+2.0s STAMINA REGEN", desc: "Oxygenated blood scrubbers extend sprint duration." },
        { id: "bd3", tier: 1, label: "WRECK-\nING BALL", max: 2, bonus: "+18% MELEE DMG", desc: "Kinetic amplifiers behind every swing." },
        { id: "bd4", tier: 1, label: "BLOOD\nPUMP", max: 3, bonus: "+4 HP/SEC", desc: "Emergency adrenal flood on critical damage." },
        { id: "bd5", tier: 2, label: "JUGGER-\nNAUT", max: 1, bonus: "+25 ARMOR", desc: "Plated dermal weave. Heavy, loud, effective." },
        { id: "bd6", tier: 3, label: "UNBRE-\nAKABLE", max: 1, bonus: "IMMUNE: BLEED", desc: "Nanite clotting suite. Never bleed out again." },
      ],
    },
    {
      id: "reflex", label: "REFLEXES", level: 9, accent: "text-cyan-300", line: "from-cyan-400/60",
      perks: [
        { id: "rf1", tier: 0, label: "SLIPPY", max: 3, bonus: "+9% DODGE", desc: "Vestibular tuning for lateral bursts." },
        { id: "rf2", tier: 0, label: "TRIGGER\nDISCIP.", max: 2, bonus: "+7% CRIT CHANCE", desc: "Micro-stabilized aim on the third shot." },
        { id: "rf3", tier: 1, label: "KEREN-\nZIKOV", max: 2, bonus: "+15% RELOAD SPD", desc: "Time dilates while you slot a fresh mag." },
        { id: "rf4", tier: 1, label: "AIR\nDASH", max: 1, bonus: "+1 MID-AIR DASH", desc: "Charged leg servos. Pure kinetic poetry." },
        { id: "rf5", tier: 2, label: "BULLET\nDELUGE", max: 2, bonus: "+22% SMG DPS", desc: "Recoil curve flattened to a straight line." },
        { id: "rf6", tier: 3, label: "FLASH\nSTEP", max: 1, bonus: "PHASE DASH", desc: "Two meters of nothing. Then you're behind them." },
      ],
    },
    {
      id: "tech", label: "TECHNICAL", level: 7, accent: "text-amber-300", line: "from-amber-400/60",
      perks: [
        { id: "tc1", tier: 0, label: "GLUED\nTO GUNS", max: 3, bonus: "+10% TECH DMG", desc: "Charge weapons draw cleaner current." },
        { id: "tc2", tier: 0, label: "FIELD\nTECH", max: 2, bonus: "+20% CRAFT XP", desc: "Every teardown teaches you something." },
        { id: "tc3", tier: 1, label: "LICENSE\nTO CHROME", max: 2, bonus: "+1 CYBERWARE SLOT", desc: "Ripperdoc-grade install tolerance." },
        { id: "tc4", tier: 1, label: "MECH\nLOOTER", max: 1, bonus: "+RARE COMPONENTS", desc: "Drones drop what you actually need." },
        { id: "tc5", tier: 2, label: "EDGE-\nRUNNER", max: 1, bonus: "+20 CYBER CAPACITY", desc: "Ride the humanity line. Carefully." },
        { id: "tc6", tier: 3, label: "RENAI-\nSSANCE", max: 1, bonus: "CRAFT: LEGENDARY", desc: "You can build what corpos only sell." },
      ],
    },
    {
      id: "int", label: "INTELLIGENCE", level: 14, accent: "text-fuchsia-400", line: "from-fuchsia-500/60",
      perks: [
        { id: "in1", tier: 0, label: "BIO-\nSYNERGY", max: 3, bonus: "+1.5s HACK DURATION", desc: "Daemons linger in hostile wetware." },
        { id: "in2", tier: 0, label: "RAM\nRECLAM.", max: 2, bonus: "+2 RAM RECOVERY", desc: "Buffer scrubs itself after every upload." },
        { id: "in3", tier: 1, label: "SUB-\nLIMINAL", max: 2, bonus: "-15% QUICKHACK COST", desc: "Cheaper daemons on unaware targets." },
        { id: "in4", tier: 1, label: "OVER-\nCLOCK", max: 1, bonus: "HEALTH AS RAM", desc: "Burn blood for bandwidth." },
        { id: "in5", tier: 2, label: "SPREAD-\nER", max: 2, bonus: "+2 CONTAGION JUMPS", desc: "One target becomes the whole room." },
        { id: "in6", tier: 3, label: "QUEEN OF\nTHE HIGH.", max: 1, bonus: "CYBERPSYCHOSIS", desc: "Push a netrunner past their own firewall." },
      ],
    },
    {
      id: "cool", label: "COOL", level: 5, accent: "text-emerald-400", line: "from-emerald-400/60",
      perks: [
        { id: "cl1", tier: 0, label: "NINJU-\nTSU", max: 3, bonus: "+25% SNEAK DMG", desc: "Crouched strikes land where they matter." },
        { id: "cl2", tier: 0, label: "COLD\nBLOOD", max: 2, bonus: "+8% MOVE SPEED", desc: "Stacks with every body you drop." },
        { id: "cl3", tier: 1, label: "GHOST", max: 2, bonus: "-20% DETECTION", desc: "Cameras read you as static." },
        { id: "cl4", tier: 1, label: "DEAD\nEYE", max: 1, bonus: "+30% SNIPER CRIT", desc: "Breath held, world slowed." },
        { id: "cl5", tier: 2, label: "STUNNING\nBLOWS", max: 1, bonus: "+40% STAGGER", desc: "They stay down longer." },
        { id: "cl6", tier: 3, label: "IMMUNITY", max: 1, bonus: "IMMUNE: POISON", desc: "Filtration mesh in every capillary." },
      ],
    },
  ];

  const ALL = BRANCHES.flatMap((b) => b.perks.map((p) => ({ ...p, branch: b })));

  const [ranks, setRanks] = useState<Record<string, number>>({ bd1: 1, rf1: 2, in1: 1 });
  const [hovered, setHovered] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);
  const [pulse, setPulse] = useState(0);
  const TOTAL = 14;

  const spent = useMemo(() => Object.values(ranks).reduce((a, b) => a + b, 0), [ranks]);
  const available = TOTAL - spent;

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 1000), 90);
    return () => clearInterval(t);
  }, []);

  const tierUnlocked = (branchId: string, tier: number) => {
    const b = BRANCHES.find((x) => x.id === branchId)!;
    if (b.level < TIER_REQ[tier]) return false;
    if (tier === 0) return true;
    return b.perks.some((p) => p.tier === tier - 1 && (ranks[p.id] || 0) > 0);
  };

  const stateOf = (p: any): "locked" | "available" | "unlocked" => {
    const r = ranks[p.id] || 0;
    if (r > 0) return "unlocked";
    return tierUnlocked(p.branch.id, p.tier) ? "available" : "locked";
  };

  const spend = (id: string) => {
    const p = ALL.find((x) => x.id === id);
    if (!p) return;
    const r = ranks[id] || 0;
    if (available <= 0 || r >= p.max) return;
    if (stateOf(p) === "locked") return;
    setRanks((prev) => ({ ...prev, [id]: r + 1 }));
    setCommitted(false);
  };

  const reset = () => { setRanks({}); setCommitted(false); };

  const [slots, setSlots] = useState<Record<string, any>>({
    os: { id: "os", label: "MILITECH OS", rarity: "legendary" },
    arms: { id: "arms", label: "MANTIS BLADES", rarity: "epic" },
    legs: null,
    frontal: { id: "fc", label: "KEREZIKOV", rarity: "rare" },
  });
  const SLOT_DEFS = [
    { id: "os", name: "OPERATING SYS" },
    { id: "frontal", name: "FRONTAL CORTEX" },
    { id: "arms", name: "ARMS" },
    { id: "legs", name: "SKELETON / LEGS" },
  ];
  const [activeSlot, setActiveSlot] = useState<string | null>("os");
  const POOL: Record<string, any> = {
    os: { id: "os2", label: "NETWATCH MK5", rarity: "epic" },
    frontal: { id: "fc2", label: "NEWTON MOD", rarity: "uncommon" },
    arms: { id: "ar2", label: "GORILLA ARMS", rarity: "rare" },
    legs: { id: "lg2", label: "REINF. TENDONS", rarity: "rare" },
  };

  const hoveredPerk = hovered ? ALL.find((p) => p.id === hovered) : null;

  const bonuses = useMemo(
    () => ALL.filter((p) => (ranks[p.id] || 0) > 0).map((p) => p.bonus),
    [ranks]
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-cyan-50 font-mono">
      {/* HEADER */}
      <div className="flex-none h-9 px-3 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-neutral-900/80 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 truncate">
            PERK &amp; CYBERWARE MATRIX
          </span>
          <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 truncate">
            // V.NIGHTCITY / BUILD-REV {String(spent).padStart(2, "0")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_12px_rgba(232,121,249,0.5)] animate-pulse" />
          <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70">
            {committed ? "BUILD COMMITTED" : "UNSAVED ALLOCATION"}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* TREE */}
        <div className="flex-1 flex gap-3">
          {BRANCHES.map((b) => {
            const tiers = [0, 1, 2, 3];
            const branchSpent = b.perks.reduce((a, p) => a + (ranks[p.id] || 0), 0);
            return (
              <div
                key={b.id}
                className="flex-1 relative flex flex-col border border-cyan-400/25 rounded-none bg-neutral-900/85 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.10)] overflow-clip"
              >
                {/* animated spine */}
                <div className="pointer-events-none absolute inset-y-8 left-1/2 w-px -translate-x-1/2">
                  <div className={"h-full w-full bg-gradient-to-b " + b.line + " via-white/5 to-transparent opacity-70"} />
                </div>
                <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgba(34,211,238,0.6)_6px_7px)]" />

                {/* branch head */}
                <div className="relative flex-none h-[2.25rem] px-2 flex items-center justify-between border-b border-cyan-400/20 bg-black/40">
                  <span className={"text-[10px] font-bold uppercase tracking-[0.18em] truncate " + b.accent}>{b.label}</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                    {b.level} · {branchSpent}
                  </span>
                </div>

                <div className="relative flex-1 flex flex-col justify-between px-2 py-2">
                  {tiers.map((t) => {
                    const nodes = b.perks.filter((p) => p.tier === t);
                    const open = b.level >= TIER_REQ[t];
                    return (
                      <div key={t} className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1 w-full">
                          <div className={"h-px flex-1 " + (open ? "bg-cyan-400/25" : "bg-neutral-700/40")} />
                          <span className={"text-[9px] font-medium uppercase tracking-[0.15em] " + (open ? "text-cyan-300/70" : "text-neutral-600")}>
                            {open ? "T" + (t + 1) : "LVL " + TIER_REQ[t]}
                          </span>
                          <div className={"h-px flex-1 " + (open ? "bg-cyan-400/25" : "bg-neutral-700/40")} />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          {nodes.map((p) => {
                            const st = stateOf({ ...p, branch: b });
                            return (
                              <div
                                key={p.id}
                                className={
                                  "h-[4rem] w-[4rem] transition-all duration-200 ease-out " +
                                  (hovered === p.id ? "scale-[1.06]" : "") +
                                  (st === "available" ? " drop-shadow-[0_0_10px_rgba(232,121,249,0.35)]" : "")
                                }
                              >
                                <PerkNode
                                  id={p.id}
                                  state={st}
                                  rank={ranks[p.id] || 0}
                                  maxRank={p.max}
                                  onSpend={spend}
                                  hover={setHovered}
                                >
                                  <span className="flex flex-col items-center leading-none tracking-widest uppercase font-bold">
                                    {p.label.split("\n").map((l, i) => (
                                      <span key={i} className="text-[0.62em]">{l}</span>
                                    ))}
                                  </span>
                                </PerkNode>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* RAIL */}
        <div className="w-[22rem] flex flex-col gap-3">
          {/* points */}
          <div className="flex-none border border-yellow-300/40 rounded-none bg-neutral-900/85 backdrop-blur-md p-3 flex flex-col gap-2 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">POINT ALLOCATION</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-amber-300/70">{pulse % 2 ? "◗" : "◖"} LIVE</span>
            </div>
            <div className="flex gap-2">
              <div className="h-[2.5rem] w-[6.5rem]">
                <StatReadout value={available} tone={available > 0 ? "accent" : "danger"}>
                  <span className="text-[0.6em] tracking-widest uppercase text-cyan-200/70">FREE</span>
                </StatReadout>
              </div>
              <div className="h-[2.5rem] w-[6.5rem]">
                <StatReadout value={spent} tone="neutral">
                  <span className="text-[0.6em] tracking-widest uppercase text-cyan-200/70">SPENT</span>
                </StatReadout>
              </div>
              <div className="h-[2.5rem] flex-1">
                <StatReadout value={TOTAL} tone="neutral">
                  <span className="text-[0.6em] tracking-widest uppercase text-cyan-200/70">POOL</span>
                </StatReadout>
              </div>
            </div>
            <div className="h-1.5 w-full bg-black/60 border border-cyan-400/20 overflow-clip">
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 shadow-[0_0_8px_rgba(232,121,249,0.6)] transition-all duration-500 ease-out"
                style={{ width: (spent / TOTAL) * 100 + "%" }}
              />
            </div>
            <div className="flex gap-2">
              <div className="h-[2.25rem] flex-1">
                <ActionButton onPress={() => setCommitted(true)} disabled={committed || spent === 0} tone="accent">
                  <span className="tracking-widest">COMMIT</span>
                </ActionButton>
              </div>
              <div className="h-[2.25rem] flex-1">
                <ActionButton onPress={reset} disabled={spent === 0} tone="danger">
                  <span className="tracking-widest">RESPEC</span>
                </ActionButton>
              </div>
            </div>
          </div>

          {/* tooltip */}
          <div className="flex-none border border-cyan-400/25 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10 p-2">
            <div className="h-[5.5rem] w-full">
              <Tooltip
                open={true}
                content={
                  hoveredPerk ? (
                    <div className="flex flex-col gap-1 text-left">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                        {hoveredPerk.label.replace("\n", "")} · {(ranks[hoveredPerk.id] || 0)}/{hoveredPerk.max}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.15em] text-fuchsia-400">{hoveredPerk.bonus}</div>
                      <div className="text-[11px] leading-snug text-cyan-100/80">{hoveredPerk.desc}</div>
                      <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">
                        REQ {hoveredPerk.branch.label} {TIER_REQ[hoveredPerk.tier]}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] uppercase tracking-[0.15em] text-neutral-500">
                      HOVER A NODE FOR DAEMON SPEC
                    </div>
                  )
                }
              />
            </div>
          </div>

          {/* cyberware */}
          <div className="flex-1 border border-cyan-400/25 bg-neutral-900/85 backdrop-blur-md p-3 flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">CYBERWARE SLOTS</span>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {SLOT_DEFS.map((s) => (
                <div key={s.id} className="flex flex-col gap-1">
                  <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-400 truncate">{s.name}</span>
                  <div className={"h-[3.5rem] w-full transition-all duration-200 " + (activeSlot === s.id ? "ring-1 ring-cyan-400/60" : "")}>
                    <EquipmentSlot
                      slotId={s.id}
                      item={slots[s.id]}
                      accepts={s.id}
                      onSelect={(id) => {
                        setActiveSlot(id);
                        setSlots((prev) => ({ ...prev, [id]: prev[id] ? prev[id] : POOL[id] }));
                      }}
                      onClear={(id) => setSlots((prev) => ({ ...prev, [id]: null }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex-none h-7 px-3 flex items-center gap-3 border-t border-cyan-400/20 bg-black/70 overflow-hidden">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70 flex-none">ACTIVE BONUSES ▸</span>
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
          {bonuses.length === 0 ? (
            <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">NO PERKS ALLOCATED</span>
          ) : (
            bonuses.slice(0, 7).map((b, i) => (
              <span
                key={i}
                className="flex-none px-2 py-0.5 rounded-full border border-fuchsia-400/40 bg-neutral-800/70 text-[9px] uppercase tracking-[0.15em] text-fuchsia-300"
              >
                {b}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}