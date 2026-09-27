export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + [left: capbar 1.25 + label 0.9 + diagram 15 + grid 7.5 + gaps 1.5 = 26.15 | right: list 12 + stats 7 + toggle 2 + gaps 1.5 = 22.5] + footer 1.75 = 30.15 ≤ 34.7
  // BUDGET width: pad 1.5 + left 20 + gap 0.75 + right 29.75 = 52.0 ≤ 52.0

  const SLOTS = [
    { id: "cortex", label: "FRONTAL CORTEX", x: 0.5, y: 0.08, cost: 4 },
    { id: "ocular", label: "OCULAR SYSTEM", x: 0.5, y: 0.2, cost: 3 },
    { id: "nervous", label: "NERVOUS SYSTEM", x: 0.24, y: 0.33, cost: 5 },
    { id: "circulatory", label: "CIRCULATORY", x: 0.76, y: 0.33, cost: 4 },
    { id: "integumentary", label: "INTEGUMENTARY", x: 0.5, y: 0.45, cost: 3 },
    { id: "arm-l", label: "ARMS", x: 0.16, y: 0.55, cost: 6 },
    { id: "skeleton", label: "SKELETON", x: 0.84, y: 0.55, cost: 5 },
    { id: "leg", label: "LEGS", x: 0.5, y: 0.82, cost: 4 },
  ];

  const IMPLANTS: Record<string, { id: string; name: string; rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"; cost: number; req: string; locked?: boolean; stats: { label: string; value: string | number; delta?: number; tone?: "neutral" | "positive" | "negative" }[] }[]> = {
    cortex: [
      { id: "c1", name: "SELF-ICE", rarity: "rare", cost: 4, req: "INT 8", stats: [{ label: "RAM", value: "+4", delta: 4, tone: "positive" }, { label: "TRACE RESIST", value: "+20%", delta: 20, tone: "positive" }] },
      { id: "c2", name: "LIMBIC ENHANCER", rarity: "epic", cost: 6, req: "COOL 12", stats: [{ label: "CRIT CHANCE", value: "+15%", delta: 15, tone: "positive" }, { label: "STAMINA", value: "-5", delta: -5, tone: "negative" }] },
      { id: "c3", name: "MECHATRONIC CORE", rarity: "legendary", cost: 8, req: "INT 16", locked: true, stats: [{ label: "RAM", value: "+8", delta: 8, tone: "positive" }] },
    ],
    ocular: [
      { id: "o1", name: "KIROSHI MK.3", rarity: "epic", cost: 3, req: "TECH 9", stats: [{ label: "SCAN SPEED", value: "+40%", delta: 40, tone: "positive" }, { label: "HEADSHOT DMG", value: "+12%", delta: 12, tone: "positive" }] },
      { id: "o2", name: "THERMAL LENS", rarity: "uncommon", cost: 2, req: "—", stats: [{ label: "DETECTION", value: "+18%", delta: 18, tone: "positive" }] },
    ],
    nervous: [
      { id: "n1", name: "KERENZIKOV", rarity: "rare", cost: 5, req: "REF 11", stats: [{ label: "SLOW-MO", value: "1.8s" }, { label: "ARMOR", value: "-4", delta: -4, tone: "negative" }] },
      { id: "n2", name: "SYNAPTIC ACCEL", rarity: "legendary", cost: 7, req: "REF 18", locked: true, stats: [{ label: "REACTION", value: "+60%", delta: 60, tone: "positive" }] },
    ],
    circulatory: [
      { id: "b1", name: "BIOMONITOR", rarity: "uncommon", cost: 3, req: "—", stats: [{ label: "HEAL @20%", value: "+25%", delta: 25, tone: "positive" }] },
      { id: "b2", name: "BLOOD PUMP", rarity: "epic", cost: 5, req: "BODY 12", stats: [{ label: "MAX HEALTH", value: "+90", delta: 90, tone: "positive" }, { label: "REGEN", value: "+6/s", delta: 6, tone: "positive" }] },
    ],
    integumentary: [
      { id: "i1", name: "SUBDERMAL ARMOR", rarity: "rare", cost: 4, req: "BODY 9", stats: [{ label: "ARMOR", value: "+140", delta: 140, tone: "positive" }] },
      { id: "i2", name: "OPTICAL CAMO", rarity: "legendary", cost: 6, req: "COOL 15", locked: true, stats: [{ label: "STEALTH", value: "+100%", delta: 100, tone: "positive" }] },
    ],
    "arm-l": [
      { id: "a1", name: "MONOWIRE", rarity: "epic", cost: 6, req: "REF 10", stats: [{ label: "MELEE DMG", value: "+220", delta: 220, tone: "positive" }] },
      { id: "a2", name: "GORILLA ARMS", rarity: "rare", cost: 5, req: "BODY 11", stats: [{ label: "BODY", value: "+2", delta: 2, tone: "positive" }] },
    ],
    skeleton: [
      { id: "s1", name: "TITANIUM BONES", rarity: "rare", cost: 5, req: "BODY 10", stats: [{ label: "CARRY", value: "+60", delta: 60, tone: "positive" }, { label: "STAMINA", value: "+15", delta: 15, tone: "positive" }] },
    ],
    leg: [
      { id: "l1", name: "REINFORCED TENDONS", rarity: "uncommon", cost: 4, req: "—", stats: [{ label: "JUMP", value: "+35%", delta: 35, tone: "positive" }] },
      { id: "l2", name: "FORTIFIED ANKLES", rarity: "rare", cost: 4, req: "TECH 12", stats: [{ label: "FALL DMG", value: "-50%", delta: -50, tone: "positive" }] },
    ],
  };

  const LOCKED_SLOTS = ["integumentary"];
  const MAX_CAPACITY = 32;

  const [slot, setSlot] = useState("cortex");
  const [installed, setInstalled] = useState<Record<string, string | undefined>>({ cortex: "c1", ocular: "o1", leg: "l1" });
  const [pick, setPick] = useState<Record<string, string>>({ cortex: "c1", ocular: "o1", leg: "l1" });
  const [expanded, setExpanded] = useState<string | null>("c1");
  const [flash, setFlash] = useState(false);

  const list = IMPLANTS[slot] || [];
  const currentPick = pick[slot] || (list[0] && list[0].id) || "";
  const implant = list.find((i) => i.id === currentPick);
  const isInstalled = installed[slot] === currentPick && !!currentPick;
  const slotLocked = LOCKED_SLOTS.indexOf(slot) >= 0;

  const used = useMemo(
    () =>
      Object.keys(installed).reduce((sum, k) => {
        const id = installed[k];
        const it = (IMPLANTS[k] || []).find((x) => x.id === id);
        return sum + (it ? it.cost : 0);
      }, 0),
    [installed]
  );

  const itemFor = (sid: string) => {
    const id = installed[sid];
    const it = (IMPLANTS[sid] || []).find((x) => x.id === id);
    return it ? { id: it.id, name: it.name, rarity: it.rarity } : undefined;
  };

  const ping = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 450);
  };

  const toggleInstall = (on: boolean) => {
    if (!implant || implant.locked || slotLocked) return;
    if (on && used - (itemFor(slot) ? (itemFor(slot) as any).cost || 0 : 0) + implant.cost > MAX_CAPACITY) return;
    setInstalled((p) => {
      const next = { ...p };
      if (on) next[slot] = implant.id;
      else delete next[slot];
      return next;
    });
    ping();
  };

  const options = list.map((i) => ({
    id: i.id,
    label: i.name,
    sublabel: i.req === "—" ? "NO REQUIREMENT" : "REQ " + i.req,
    detail: i.locked ? "LOCKED — ATTRIBUTE THRESHOLD NOT MET" : installed[slot] === i.id ? "INSTALLED" : "AVAILABLE",
    meta: i.cost + " CAP",
    locked: i.locked,
    tone: (installed[slot] === i.id ? "accent" : i.locked ? "danger" : "neutral") as "accent" | "danger" | "neutral",
    children: i.stats.map((s, n) => ({ id: i.id + "-s" + n, label: s.label, detail: String(s.value), done: (s.delta || 0) > 0 })),
  }));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#0a0a0f_60%)] text-cyan-50">
      <div className="h-9 flex-none flex items-center justify-between px-3 border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)]">
        <span className="font-mono font-bold tracking-[0.25em] uppercase text-cyan-100 text-sm drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
          CYBERWARE // AUG GRID
        </span>
        <span className="font-mono tracking-[0.2em] uppercase text-[10px] text-fuchsia-400 animate-pulse">RIPPERDOC LINK ACTIVE</span>
      </div>

      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* LEFT: capacity + diagram + slot grid */}
        <div className="w-[20rem] flex flex-col gap-2">
          <div className="rounded-lg border border-cyan-400/30 bg-[#0d0d14]/95 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] p-2">
            <div className="flex items-end justify-between pb-1">
              <span className="font-mono font-medium tracking-wider uppercase text-[10px] text-slate-400">CYBERCAPACITY</span>
              <span
                className={
                  "font-mono font-black tracking-tight text-yellow-300 text-xs drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] " +
                  (flash ? "animate-pulse" : "")
                }
              >
                {used}/{MAX_CAPACITY}
              </span>
            </div>
            <div className="h-[1.25rem] w-full">
              <StatBar value={used} max={MAX_CAPACITY} segments={16} tone={used > MAX_CAPACITY * 0.85 ? "danger" : "accent"} animated />
            </div>
          </div>

          <div className="h-[15rem] w-full rounded-lg border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] p-1">
            <BodyDiagram regions={SLOTS.map((s) => ({ id: s.id, label: s.label, x: s.x, y: s.y }))}>
              {SLOTS.map((s) => (
                <EquipmentSlot
                  key={s.id}
                  slotId={s.id}
                  item={itemFor(s.id)}
                  locked={LOCKED_SLOTS.indexOf(s.id) >= 0}
                  selected={slot === s.id}
                  onSelect={(id) => setSlot(id)}
                />
              ))}
            </BodyDiagram>
          </div>

          <div className="rounded-lg border border-cyan-400/30 bg-[#0d0d14]/95 p-2">
            <div className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-[10px] pb-1">SLOT ARRAY</div>
            <div className="grid grid-cols-4 gap-1">
              {SLOTS.map((s) => (
                <div key={s.id} className="h-[2.4rem] w-full">
                  <EquipmentSlot
                    slotId={s.id}
                    item={itemFor(s.id)}
                    locked={LOCKED_SLOTS.indexOf(s.id) >= 0}
                    selected={slot === s.id}
                    onSelect={(id) => setSlot(id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono font-bold tracking-[0.2em] uppercase text-cyan-100 text-xs">
              {(SLOTS.find((s) => s.id === slot) || SLOTS[0]).label}
            </span>
            <span className="px-2 py-1 rounded-sm border border-fuchsia-500/40 bg-fuchsia-500/15 font-mono tracking-wider uppercase text-[10px] text-fuchsia-400">
              {list.length} MODS
            </span>
          </div>

          <div className="flex-1 w-full">
            <SelectionList
              options={options}
              value={currentPick}
              onChange={(id) => setPick((p) => ({ ...p, [slot]: id }))}
              onActivate={(id) => {
                setPick((p) => ({ ...p, [slot]: id }));
                const it = list.find((x) => x.id === id);
                if (it && !it.locked && !slotLocked) toggleInstall(installed[slot] !== id);
              }}
              expandedId={expanded || undefined}
              onExpandedChange={(id) => setExpanded(id)}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 h-[7rem]">
              <StatDetailPanel
                title={implant ? implant.name + " // DELTA" : "NO MODULE"}
                visible={!!implant}
                entries={
                  implant
                    ? implant.stats.concat([{ label: "CAP COST", value: implant.cost, tone: "neutral" as const }])
                    : []
                }
              />
            </div>
            <div className="w-[9rem] flex flex-col justify-between rounded-lg border border-cyan-400/30 bg-[#0d0d14]/95 p-2">
              <span className="font-mono font-medium tracking-wider uppercase text-[10px] text-slate-400">
                {slotLocked ? "SLOT LOCKED" : implant && implant.locked ? "REQ NOT MET" : "CHIPPING"}
              </span>
              <div className="h-[2.6rem] w-full">
                <ToggleButton
                  on={isInstalled}
                  disabled={!implant || !!(implant && implant.locked) || slotLocked}
                  tone={isInstalled ? "danger" : "accent"}
                  onChange={toggleInstall}
                >
                  <span className="font-mono font-bold tracking-[0.15em] uppercase">{isInstalled ? "REMOVE" : "INSTALL"}</span>
                </ToggleButton>
              </div>
              <span className="font-mono font-normal tracking-wide text-slate-500 text-[10px] leading-tight">
                {implant ? "COST " + implant.cost + " CAP" : "SELECT MODULE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 border-t border-cyan-500/20 bg-black/50 font-mono tracking-wider uppercase text-[10px] text-cyan-400/70">
        <span>INSTALLED :: {Object.keys(installed).length} / {SLOTS.length} SLOTS</span>
        <span className={flash ? "text-yellow-300 animate-pulse" : ""}>VITALS SYNC {flash ? "TRANSMITTING…" : "STABLE"}</span>
      </div>
    </div>
  );
}