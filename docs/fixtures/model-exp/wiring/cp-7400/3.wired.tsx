export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + weapons 6.5 + gap .5 + label .75 + clothing (2 x 5.25 =10.5) + gap .5 + label .75 + mods 4.5 + footer 1.75 = 29.0 <= 38.1
  // BUDGET width: pad 1.5 + left flex (3 x 6 = 18 min) + gap .75 + right 24 = 44.25 <= 76.3

  type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
  type Item = {
    id: string;
    label: string;
    category?: string;
    rarity?: Rarity;
    icon?: string;
    quantity?: number;
    stats?: { label: string; value: string | number }[];
    armor?: number;
    dps?: number;
    slot: string;
  };

  const inventory: Item[] = [
    { id: "w1", label: "Lexington 'Jinx'", category: "Handgun", rarity: "rare", icon: "▬", quantity: 1, slot: "w1", dps: 214, stats: [{ label: "DPS", value: 214 }, { label: "RPM", value: 260 }] },
    { id: "w2", label: "Nue Smart Pistol", category: "Handgun", rarity: "epic", icon: "◤", quantity: 1, slot: "w1", dps: 268, stats: [{ label: "DPS", value: 268 }, { label: "RPM", value: 300 }] },
    { id: "w3", label: "Ajax Assault", category: "Rifle", rarity: "rare", icon: "═", quantity: 1, slot: "w2", dps: 331, stats: [{ label: "DPS", value: 331 }, { label: "RPM", value: 420 }] },
    { id: "w4", label: "Widow Maker", category: "Rifle", rarity: "legendary", icon: "✖", quantity: 1, slot: "w2", dps: 488, stats: [{ label: "DPS", value: 488 }, { label: "RPM", value: 200 }] },
    { id: "w5", label: "Mantis Blades", category: "Melee", rarity: "epic", icon: "⚔", quantity: 1, slot: "w3", dps: 302, stats: [{ label: "DPS", value: 302 }] },
    { id: "w6", label: "Cocktail Stick", category: "Melee", rarity: "uncommon", icon: "†", quantity: 1, slot: "w3", dps: 140, stats: [{ label: "DPS", value: 140 }] },
    { id: "c1", label: "Netrunner Visor", category: "Head", rarity: "rare", icon: "◉", quantity: 1, slot: "head", armor: 84, stats: [{ label: "ARM", value: 84 }] },
    { id: "c2", label: "Militech Respirator", category: "Face", rarity: "epic", icon: "▣", quantity: 1, slot: "face", armor: 96, stats: [{ label: "ARM", value: 96 }] },
    { id: "c3", label: "Samurai Jacket", category: "Torso", rarity: "legendary", icon: "▦", quantity: 1, slot: "torso", armor: 188, stats: [{ label: "ARM", value: 188 }] },
    { id: "c4", label: "Kevlar Sleeves", category: "Arms", rarity: "uncommon", icon: "≡", quantity: 1, slot: "arms", armor: 52, stats: [{ label: "ARM", value: 52 }] },
    { id: "c5", label: "Corpo Cargo Pants", category: "Legs", rarity: "rare", icon: "∏", quantity: 1, slot: "legs", armor: 110, stats: [{ label: "ARM", value: 110 }] },
    { id: "c6", label: "Kitsch Boots", category: "Feet", rarity: "uncommon", icon: "▲", quantity: 1, slot: "feet", armor: 47, stats: [{ label: "ARM", value: 47 }] },
    { id: "c7", label: "Aramid Trenchcoat", category: "Torso", rarity: "epic", icon: "▥", quantity: 1, slot: "torso", armor: 152, stats: [{ label: "ARM", value: 152 }] },
    { id: "c8", label: "Nomad Goggles", category: "Head", rarity: "common", icon: "○", quantity: 2, slot: "head", armor: 28, stats: [{ label: "ARM", value: 28 }] },
  ];

  const weaponSlots = [
    { id: "w1", name: "Slot I" },
    { id: "w2", name: "Slot II" },
    { id: "w3", name: "Slot III" },
  ];
  const clothingSlots = [
    { id: "head", name: "Head" },
    { id: "face", name: "Face" },
    { id: "torso", name: "Torso" },
    { id: "arms", name: "Arms" },
    { id: "legs", name: "Legs" },
    { id: "feet", name: "Feet" },
  ];

  const [equipped, setEquipped] = useState<Record<string, string | undefined>>({
    w1: "w1", w2: "w4", w3: "w5", head: "c1", face: "c2", torso: "c3", arms: "c4", legs: "c5", feet: "c6",
  });
  const [selectedSlot, setSelectedSlot] = useState<string>("torso");
  const [browserId, setBrowserId] = useState<string>("c7");
  const [flash, setFlash] = useState(0);

  const byId = useMemo(() => {
    const m: Record<string, Item> = {};
    inventory.forEach((i) => (m[i.id] = i));
    return m;
  }, []);

  const armorTotal = useMemo(
    () => clothingSlots.reduce((s, sl) => s + (byId[equipped[sl.id] || ""]?.armor || 0), 0),
    [equipped]
  );
  const dpsTotal = useMemo(
    () => weaponSlots.reduce((s, sl) => s + (byId[equipped[sl.id] || ""]?.dps || 0), 0),
    [equipped]
  );

  useEffect(() => {
    bus.emit("Cyberpunk 2077: Weapons & Inventory Loadout->Cyberpunk 2077: V Vitals Status HUD", { armor: armorTotal });
  }, [armorTotal]);

  const [mods, setMods] = useState<Record<string, string | undefined>>({ m1: "mk1", m2: undefined, m3: "pen" });
  const modDefs: Record<string, { id: string; label: string; icon: string; rarity: Rarity }> = {
    mk1: { id: "mk1", label: "Crunch MK.3", icon: "✚", rarity: "rare" },
    pen: { id: "pen", label: "Penetrator", icon: "◈", rarity: "epic" },
    pax: { id: "pax", label: "Pax", icon: "✜", rarity: "legendary" },
  };
  const cycleMod = (k: string) => {
    const order = [undefined, "mk1", "pen", "pax"] as (string | undefined)[];
    setMods((p) => ({ ...p, [k]: order[(order.indexOf(p[k]) + 1) % order.length] }));
  };

  const candidate = byId[browserId];
  const canEquip = !!candidate && equipped[candidate.slot] !== candidate.id;

  const doEquip = () => {
    if (!candidate) return;
    setEquipped((p) => ({ ...p, [candidate.slot]: candidate.id }));
    setSelectedSlot(candidate.slot);
    setFlash((f) => f + 1);
  };

  const browserItems = inventory.map((i) => ({
    id: i.id, label: i.label, category: i.category, rarity: i.rarity, icon: i.icon,
    quantity: i.quantity, stats: i.stats,
  }));

  const selItem = byId[equipped[selectedSlot] || ""];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-cyan-50 font-mono">
      <div className="h-9 flex-none px-3 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-fuchsia-400 animate-pulse">◆</span>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)]">
            Loadout // V.Kit
          </span>
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-cyan-300/70 truncate">
          Slot · {selectedSlot.toUpperCase()}
        </span>
      </div>

      <div className="flex-1 flex flex-row gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* LEFT: equipped */}
        <div className="flex-[3] flex flex-col gap-2">
          <div className="text-[0.65rem] font-medium uppercase tracking-widest text-cyan-300/70">Weapons</div>
          <div className="flex flex-row gap-2">
            {weaponSlots.map((s) => {
              const it = byId[equipped[s.id] || ""];
              return (
                <div key={s.id} className="flex-1 h-[6.5rem]">
                  <EquipmentSlot
                    slotId={s.id}
                    selected={selectedSlot === s.id}
                    onSelect={setSelectedSlot}
                    item={it ? { id: it.id, label: it.label, icon: it.icon, rarity: it.rarity, stats: it.stats } : undefined}
                  />
                </div>
              );
            })}
          </div>

          <div className="text-[0.65rem] font-medium uppercase tracking-widest text-cyan-300/70">Apparel</div>
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            {clothingSlots.map((s) => {
              const it = byId[equipped[s.id] || ""];
              return (
                <div key={s.id} className="h-[5.5rem]">
                  <EquipmentSlot
                    slotId={s.id}
                    selected={selectedSlot === s.id}
                    onSelect={setSelectedSlot}
                    item={it ? { id: it.id, label: it.label, icon: it.icon, rarity: it.rarity, stats: it.stats } : undefined}
                  />
                </div>
              );
            })}
          </div>

          <div className="text-[0.65rem] font-medium uppercase tracking-widest text-fuchsia-400/80">Mod Sockets</div>
          <div className="flex flex-row gap-2">
            {["m1", "m2", "m3"].map((k) => {
              const m = mods[k] ? modDefs[mods[k] as string] : undefined;
              return (
                <div key={k} className="flex-1 h-[4.5rem]">
                  <EquipmentSlot
                    slotId={k}
                    onSelect={cycleMod}
                    item={m ? { id: m.id, label: m.label, icon: m.icon, rarity: m.rarity } : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: stats + browser */}
        <div className="flex-[2] flex flex-col gap-2">
          <div className="grid grid-cols-4 gap-2">
            <div className="h-[2.75rem]"><StatReadout value={armorTotal} unit="ARM" tone="accent" delta={flash ? 12 : undefined} /></div>
            <div className="h-[2.75rem]"><StatReadout value={dpsTotal} unit="DPS" tone="danger" /></div>
            <div className="h-[2.75rem]"><StatReadout value={selItem ? (selItem.armor ?? selItem.dps ?? 0) : 0} unit={selItem?.armor ? "ARM" : "DPS"} tone="neutral" /></div>
            <div className="h-[2.75rem]"><StatReadout value={inventory.length} unit="ITM" tone="warning" /></div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-clip rounded-md">
              <ItemBrowser
                items={browserItems}
                value={browserId}
                onChange={setBrowserId}
                onActivate={(id) => {
                  const it = byId[id];
                  if (!it) return;
                  setEquipped((p) => ({ ...p, [it.slot]: it.id }));
                  setSelectedSlot(it.slot);
                  setFlash((f) => f + 1);
                }}
                placeholder="NO STASH DATA"
              />
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            <div className="flex-1 truncate text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500">
              {candidate ? candidate.label + " → " + candidate.slot.toUpperCase() : "—"}
            </div>
            <div className="w-[9rem] h-[2.25rem]">
              <ActionButton onPress={doEquip} disabled={!canEquip} tone="accent">
                <span className="font-black uppercase tracking-widest">Equip</span>
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none px-3 flex items-center justify-between border-t border-cyan-400/20 bg-black/50">
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cyan-300/70 truncate">
          Armor Rating Broadcast · {armorTotal}
        </span>
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-fuchsia-400/80 animate-pulse">
          ▸ Vitals Link Active
        </span>
      </div>
    </div>
  );
}