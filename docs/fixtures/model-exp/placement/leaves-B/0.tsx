export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(pad .75*2 = 1.5) + max(diagram 27, right[ slotgrid 4.25 + gap .5 + meter 2.4 + gap .5 + list flex(≥4.5) + gap .5 + stats 4.5 + gap .5 + toggle 2.25 ]) = 2.25+1.5+27+1.75(footer) = 32.5 ≤ 34.7
  // BUDGET width: pad .75 + diagram 17 + gap .75 + right 31 + pad .75 = 50.25 ≤ 52.0

  const SLOTS = [
    { id: "cortex", label: "FRONTAL CORTEX", pos: { x: 0.5, y: 0.08 }, item: { id: "i1", label: "Mem Boost", icon: "◈", rarity: "epic" as const } },
    { id: "ocular", label: "OCULAR", pos: { x: 0.3, y: 0.17 }, item: { id: "i2", label: "Kiroshi Mk3", icon: "◉", rarity: "legendary" as const } },
    { id: "nervous", label: "NERVOUS SYS", pos: { x: 0.7, y: 0.3 }, item: { id: "i3", label: "Reflex Tuner", icon: "⌁", rarity: "rare" as const } },
    { id: "circ", label: "CIRCULATORY", pos: { x: 0.5, y: 0.38 }, empty: true },
    { id: "arm-l", label: "ARM // L", pos: { x: 0.12, y: 0.45 }, item: { id: "i4", label: "Mantis Blade", icon: "⟠", rarity: "epic" as const } },
    { id: "arm-r", label: "ARM // R", pos: { x: 0.88, y: 0.45 }, empty: true },
    { id: "skel", label: "SKELETON", pos: { x: 0.5, y: 0.62 }, locked: true },
    { id: "leg-l", label: "LEGS", pos: { x: 0.3, y: 0.85 }, item: { id: "i5", label: "Fortified Ankles", icon: "⩗", rarity: "uncommon" as const } },
    { id: "leg-r", label: "INTEGUMENT", pos: { x: 0.7, y: 0.85 }, locked: true },
  ];

  const IMPLANTS: any[] = [
    {
      id: "i1", label: "MEMORY BOOST", subtitle: "Frontal Cortex", meta: "EPIC", value: "4 CAP", expandable: true,
      children: [{ id: "i1a", label: "+4 RAM CAPACITY", meta: "PASSIVE" }, { id: "i1b", label: "+8% QUICKHACK DMG", meta: "PASSIVE" }],
    },
    { id: "i2", label: "KIROSHI OPTICS MK.3", subtitle: "Ocular System", meta: "LEGENDARY", value: "3 CAP", expandable: true, children: [{ id: "i2a", label: "+12% CRIT CHANCE", meta: "PASSIVE" }] },
    { id: "i3", label: "SYNAPTIC ACCELERATOR", subtitle: "Nervous System", meta: "RARE", value: "5 CAP" },
    { id: "i4", label: "MANTIS BLADES", subtitle: "Arm // Left", meta: "EPIC", value: "6 CAP" },
    { id: "i5", label: "FORTIFIED ANKLES", subtitle: "Legs", meta: "UNCOMMON", value: "2 CAP" },
    { id: "i6", label: "BIOCONDUCTOR", subtitle: "Circulatory", meta: "RARE", value: "4 CAP" },
    { id: "i7", label: "TITANIUM BONES", subtitle: "Skeleton — INT 14 REQ", meta: "LOCKED", value: "7 CAP", locked: true },
    { id: "i8", label: "SUBDERMAL ARMOR", subtitle: "Integument — BODY 15 REQ", meta: "LOCKED", value: "5 CAP", locked: true },
  ];

  const STATS: Record<string, { label: string; value: string; delta?: number; tone?: "neutral" | "positive" | "negative" }[]> = {
    i1: [{ label: "RAM CAPACITY", value: "+4", delta: 4, tone: "positive" }, { label: "QUICKHACK DMG", value: "+8%", delta: 8, tone: "positive" }, { label: "HUMANITY", value: "-6", delta: -6, tone: "negative" }],
    i2: [{ label: "CRIT CHANCE", value: "+12%", delta: 12, tone: "positive" }, { label: "SCAN SPEED", value: "+25%", delta: 25, tone: "positive" }],
    i3: [{ label: "REFLEX WINDOW", value: "+1.5s", delta: 1, tone: "positive" }, { label: "STAMINA DRAIN", value: "+10%", delta: -10, tone: "negative" }],
    i4: [{ label: "MELEE DMG", value: "+140", delta: 140, tone: "positive" }, { label: "BLEED CHANCE", value: "+20%", delta: 20, tone: "positive" }],
    i5: [{ label: "CHARGE JUMP", value: "UNLOCK", tone: "positive" }],
    i6: [{ label: "HEALTH REGEN", value: "+3/s", delta: 3, tone: "positive" }],
    i7: [{ label: "ARMOR", value: "+220", delta: 220, tone: "positive" }],
    i8: [{ label: "ARMOR", value: "+180", delta: 180, tone: "positive" }],
  };

  const [installed, setInstalled] = useState<string[]>(["i1", "i2", "i3", "i4", "i5"]);
  const [sel, setSel] = useState<string | null>("i1");
  const [expanded, setExpanded] = useState<string[]>(["i1"]);
  const [slotSel, setSlotSel] = useState<string | null>("cortex");
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  const capacityUsed = useMemo(
    () => installed.reduce((a, id) => a + parseInt(String(IMPLANTS.find((i) => i.id === id)?.value || "0"), 10), 0),
    [installed]
  );
  const MAXCAP = 32;

  const selItem = IMPLANTS.find((i) => i.id === sel);
  const isOn = sel ? installed.indexOf(sel) >= 0 : false;

  const toggle = (on: boolean) => {
    if (!sel || selItem?.locked) return;
    setInstalled((p) => (on ? (p.indexOf(sel) >= 0 ? p : p.concat(sel)) : p.filter((x) => x !== sel)));
    setFlash(true);
    setTimeout(() => setFlash(false), 600);
  };

  const gridSlots = SLOTS.slice(0, 5);
  const hovered = SLOTS.find((s) => s.id === hoverSlot);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#0a0a0f_60%)] text-cyan-50">
      <div className="h-9 flex-none px-3 flex items-center justify-between border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)]">
        <span className="font-mono font-bold tracking-[0.25em] uppercase text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)] text-sm truncate">
          Cyberware :: Augmentation Grid
        </span>
        <span className="font-mono text-[10px] tracking-wider uppercase text-fuchsia-400 animate-pulse">◆ RIPPERDOC LINK ACTIVE</span>
      </div>

      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Body Slot Diagram */}
        <div className="w-[17rem] flex-none flex flex-col gap-2">
          <div className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs">Chassis Map</div>
          <div className="flex-1 relative rounded-lg border border-cyan-400/30 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-clip">
            <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.06)_0px,rgba(34,211,238,0.06)_1px,transparent_1px,transparent_6px)]" />
            <BodyDiagram onBackgroundClick={() => setSlotSel(null)}>
              {SLOTS.map((s) => (
                <EquipmentSlot
                  key={s.id}
                  id={s.id}
                  position={s.pos}
                  item={s.item}
                  empty={s.empty}
                  locked={s.locked}
                  selected={slotSel === s.id}
                  onSelect={(id) => setSlotSel(id)}
                  onHover={(id) => setHoverSlot(id)}
                />
              ))}
            </BodyDiagram>
          </div>
        </div>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Slot Grid + tooltip */}
          <StatTooltip
            open={!!hovered}
            title={hovered ? hovered.label : ""}
            lines={
              hovered && hovered.item
                ? (STATS[hovered.item.id] || []).map((l) => ({ label: l.label, value: l.value, delta: l.delta }))
                : [{ label: "STATUS", value: hovered && hovered.locked ? "LOCKED" : "EMPTY" }]
            }
          >
            <div className="flex gap-2">
              {gridSlots.map((s) => (
                <div key={"g-" + s.id} className="w-[5.2rem] h-[4.25rem]">
                  <EquipmentSlot
                    id={s.id}
                    item={s.item}
                    empty={s.empty}
                    locked={s.locked}
                    selected={slotSel === s.id}
                    onSelect={(id) => setSlotSel(id)}
                    onHover={(id) => setHoverSlot(id)}
                  />
                </div>
              ))}
              <div className="w-[5.2rem] h-[4.25rem]">
                <EquipmentSlot id="skel" locked selected={slotSel === "skel"} onSelect={(id) => setSlotSel(id)} onHover={(id) => setHoverSlot(id)} />
              </div>
            </div>
          </StatTooltip>

          {/* Capacity Meter */}
          <div className="rounded-lg border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] p-2 flex items-center gap-2">
            <span className="font-mono font-medium tracking-wider uppercase text-slate-400 text-[10px]">Capacity</span>
            <div className="flex-1 h-[1.6rem]">
              <StatBar value={capacityUsed} min={0} max={MAXCAP} segments={16} showValue tone={capacityUsed > MAXCAP * 0.85 ? "danger" : "accent"} />
            </div>
            <span className={"font-mono font-black tracking-tight text-yellow-300 text-sm drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" + (flash ? " animate-pulse" : "")}>
              {capacityUsed}/{MAXCAP}
            </span>
          </div>

          {/* Implant Cards */}
          <div className="flex-1 flex gap-2">
            <div className="flex-1 rounded-lg border border-cyan-500/20 overflow-clip">
              <ItemList
                items={IMPLANTS.map((i) => ({ ...i, meta: installed.indexOf(i.id) >= 0 ? "INSTALLED" : i.meta }))}
                value={sel}
                onChange={(id) => setSel(id)}
                expandedIds={expanded}
                onToggleExpand={(id) => setExpanded((p) => (p.indexOf(id) >= 0 ? p.filter((x) => x !== id) : p.concat(id)))}
                onActivate={(id) => { setSel(id); toggle(installed.indexOf(id) < 0); }}
              />
            </div>

            <div className="w-[13rem] flex-none flex flex-col gap-2">
              <div className={"flex-1 rounded-lg border p-2 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] transition-all duration-200 " + (flash ? "border-fuchsia-400/60 ring-2 ring-fuchsia-400/60" : "border-cyan-400/30")}>
                <div className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs mb-1 truncate">
                  {selItem ? selItem.label : "NO MODULE"}
                </div>
                <StatLineList lines={sel && STATS[sel] ? STATS[sel] : [{ label: "—", value: "—" }]} />
              </div>
              <div className="h-[2.4rem] w-full">
                <ToggleButton
                  on={isOn}
                  onChange={toggle}
                  disabled={!sel || !!selItem?.locked}
                  tone={isOn ? "danger" : "accent"}
                >
                  <span>{selItem?.locked ? "LOCKED" : isOn ? "UNINSTALL" : "INSTALL"}</span>
                </ToggleButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none px-3 flex items-center justify-between border-t border-cyan-500/20 bg-black/50 font-mono tracking-wider uppercase text-[10px] text-cyan-400/70">
        <span className="truncate">Installed // {installed.length} modules</span>
        <span className="text-fuchsia-400/80">Vitals HUD sync ▸ {capacityUsed > MAXCAP ? "OVERLOAD" : "NOMINAL"}</span>
      </div>
    </div>
  );
}