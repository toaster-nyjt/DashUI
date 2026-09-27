export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body 30.7 (slots col: label .9 + 2rows×4.25 + gap .5 + label .9 + 2rows×4.25 = 19.3) + footer 1.75 = 34.7 ≤ 34.7
  // BUDGET width: pad .75 + slotcol 9.5 + gap .75 + preview 14 + gap .75 + right 24.5 + pad .75 = 51.0 ≤ 52.0

  type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
  type Item = {
    id: string;
    name: string;
    rarity: Rarity;
    price: number;
    entries: { label: string; value: string | number; delta?: number; tone?: "neutral" | "positive" | "negative" }[];
  };

  const [slots, setSlots] = useState<{ id: string; group: "weapon" | "armor"; label: string; item?: Item; locked?: boolean }[]>([
    {
      id: "primary",
      group: "weapon",
      label: "PRIMARY",
      item: {
        id: "i1",
        name: "Yinglong SMG",
        rarity: "legendary",
        price: 14250,
        entries: [
          { label: "DPS", value: 412.6, delta: 38, tone: "positive" },
          { label: "Rate of Fire", value: "9.4 /s" },
          { label: "Crit Chance", value: "21%", delta: 6, tone: "positive" },
          { label: "Mod Slots", value: 3 },
        ],
      },
    },
    {
      id: "secondary",
      group: "weapon",
      label: "SIDEARM",
      item: {
        id: "i2",
        name: "Lexington T5",
        rarity: "rare",
        price: 3120,
        entries: [
          { label: "DPS", value: 188.2, delta: -12, tone: "negative" },
          { label: "Rate of Fire", value: "4.1 /s" },
          { label: "Crit Dmg", value: "+44%", delta: 9, tone: "positive" },
          { label: "Mod Slots", value: 2 },
        ],
      },
    },
    {
      id: "melee",
      group: "weapon",
      label: "MELEE",
      item: {
        id: "i3",
        name: "Mantis Blades",
        rarity: "epic",
        price: 8900,
        entries: [
          { label: "Attack Dmg", value: 266 },
          { label: "Bleed Chance", value: "35%", delta: 12, tone: "positive" },
          { label: "Stamina Cost", value: "-8%", tone: "positive" },
        ],
      },
    },
    { id: "grenade", group: "weapon", label: "THROWN", locked: true },
    {
      id: "head",
      group: "armor",
      label: "HEAD",
      item: {
        id: "a1",
        name: "Netrunner Visor",
        rarity: "rare",
        price: 2400,
        entries: [
          { label: "Armor", value: 118, delta: 14, tone: "positive" },
          { label: "RAM Bonus", value: "+2" },
          { label: "Detect Res", value: "18%" },
        ],
      },
    },
    {
      id: "torso",
      group: "armor",
      label: "TORSO",
      item: {
        id: "a2",
        name: "Samurai Jacket",
        rarity: "epic",
        price: 6650,
        entries: [
          { label: "Armor", value: 264, delta: 42, tone: "positive" },
          { label: "Thermal Res", value: "22%" },
          { label: "Street Cred", value: "+5", tone: "positive" },
        ],
      },
    },
    {
      id: "legs",
      group: "armor",
      label: "LEGS",
      item: {
        id: "a3",
        name: "Kevlar Cargos",
        rarity: "uncommon",
        price: 900,
        entries: [
          { label: "Armor", value: 96 },
          { label: "Carry Cap", value: "+18" },
        ],
      },
    },
    { id: "feet", group: "armor", label: "FEET", locked: false, item: undefined },
  ]);

  const [selected, setSelected] = useState("primary");
  const [eddies, setEddies] = useState(48920);
  const [flash, setFlash] = useState<null | "buy" | "sell">(null);
  const [log, setLog] = useState("LOADOUT SYNCED // NET STATUS NOMINAL");

  const sel = slots.find((s) => s.id === selected);
  const armor = useMemo(
    () =>
      slots.reduce((t, s) => {
        const a = s.item?.entries.find((e) => e.label === "Armor");
        return t + (a ? Number(a.value) || 0 : 0);
      }, 0),
    [slots]
  );

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  const transact = (kind: "buy" | "sell") => {
    if (!sel) return;
    const price = sel.item?.price ?? 1200;
    if (kind === "sell" && sel.item) {
      const gain = Math.round(price * 0.4);
      setEddies((e) => e + gain);
      setSlots((s) => s.map((x) => (x.id === sel.id ? { ...x, item: undefined } : x)));
      setLog("SOLD // +" + gain + " EDDIES // ARMOR RECALC");
    } else if (kind === "buy" && !sel.item) {
      setEddies((e) => Math.max(0, e - price));
      setSlots((s) =>
        s.map((x) =>
          x.id === sel.id
            ? {
                ...x,
                item: {
                  id: "n" + sel.id,
                  name: "Militech Standard",
                  rarity: "uncommon",
                  price: 1200,
                  entries: [
                    { label: "Armor", value: 74, delta: 74, tone: "positive" },
                    { label: "Mod Slots", value: 1 },
                  ],
                },
              }
            : x
        )
      );
      setLog("PURCHASED // -" + price + " EDDIES");
    } else {
      setLog(kind === "buy" ? "SLOT OCCUPIED // UNEQUIP FIRST" : "EMPTY SLOT // NOTHING TO SELL");
    }
    setFlash(kind);
  };

  const weapons = slots.filter((s) => s.group === "weapon");
  const armors = slots.filter((s) => s.group === "armor");

  const SlotGrid = ({ list }: { list: typeof slots }) => (
    <div className="grid grid-cols-2 gap-2">
      {list.map((s) => (
        <div key={s.id} className="flex flex-col gap-1">
          <div className="h-[4.25rem] w-[4.25rem]">
            <EquipmentSlot
              slotId={s.id}
              item={s.item ? { id: s.item.id, name: s.item.name, rarity: s.item.rarity } : undefined}
              locked={s.locked}
              selected={selected === s.id}
              onSelect={(id) => {
                setSelected(id);
                setLog("SLOT " + id.toUpperCase() + " // INSPECTING");
              }}
            />
          </div>
          <span className="font-mono font-medium tracking-wider uppercase text-slate-400 text-[10px] leading-none truncate">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#0a0a0f_60%)] text-cyan-50">
      <div className="h-9 flex-none px-3 flex items-center justify-between border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)]">
        <span className="font-mono font-bold tracking-[0.25em] uppercase text-cyan-100 text-sm drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
          Loadout // Gear
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono tracking-wider uppercase text-[10px] text-slate-400">ARMOR</span>
          <span
            className={
              "font-mono font-black tracking-tight text-yellow-300 text-sm drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] " +
              (flash ? "animate-pulse" : "")
            }
          >
            {armor}
          </span>
          <span className="font-mono tracking-wider uppercase text-[10px] text-slate-400">€$</span>
          <span
            className={
              "font-mono font-black tracking-tight text-yellow-300 text-sm drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] " +
              (flash ? "animate-pulse" : "")
            }
          >
            {eddies.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-3 p-3">
        <div className="flex flex-col gap-2">
          <span className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs leading-tight border-l-2 border-yellow-300/70 pl-2">
            Arms
          </span>
          <SlotGrid list={weapons} />
          <span className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs leading-tight border-l-2 border-fuchsia-500/70 pl-2 mt-1">
            Armor
          </span>
          <SlotGrid list={armors} />
        </div>

        <div className="w-[14rem] flex flex-col gap-2">
          <div className="h-[19rem] relative rounded-lg border border-cyan-400/30 overflow-clip bg-[#07070c] shadow-[0_0_20px_rgba(34,211,238,0.15),0_0_40px_rgba(217,70,239,0.08)]">
            <LoadoutPreview
              layers={slots
                .filter((s) => s.item)
                .map((s) => ({ id: s.item!.id, slot: s.id }))}
            />
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.07)_0px,rgba(34,211,238,0.07)_1px,transparent_1px,transparent_4px)]" />
            <div className="pointer-events-none absolute inset-x-0 h-12 bg-[linear-gradient(180deg,transparent,rgba(217,70,239,0.18),transparent)] animate-[scan_4s_linear_infinite]" />
          </div>
          <div className="flex-1 flex items-center justify-center rounded-md border border-cyan-500/20 bg-black/50 px-2">
            <span className="font-mono tracking-wide text-slate-500 text-[10px] leading-tight truncate">
              {sel?.item ? sel.item.name.toUpperCase() : "EMPTY BAY"}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex-1 rounded-lg border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] backdrop-blur-sm p-3 overflow-clip">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-mono font-bold tracking-widest uppercase text-cyan-50 text-lg leading-tight truncate">
                {sel?.item?.name ?? "NO ITEM"}
              </span>
              {sel?.item && (
                <span
                  className={
                    "font-mono tracking-wider uppercase text-[10px] px-2 py-1 border border-fuchsia-500/40 rounded-sm " +
                    (sel.item.rarity === "legendary"
                      ? "text-yellow-300"
                      : sel.item.rarity === "epic"
                      ? "text-fuchsia-400"
                      : sel.item.rarity === "rare"
                      ? "text-sky-400"
                      : sel.item.rarity === "uncommon"
                      ? "text-lime-400"
                      : "text-slate-300")
                  }
                >
                  {sel.item.rarity}
                </span>
              )}
            </div>
            <div className={"h-[13rem] " + (flash ? "ring-2 ring-fuchsia-400/60 rounded-md" : "")}>
              <StatDetailPanel
                title="ITEM STATS"
                visible={true}
                entries={sel?.item?.entries ?? [{ label: "Status", value: "SLOT EMPTY", tone: "negative" }]}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-[7rem] h-[2.5rem]">
              <ActionButton tone="accent" onPress={() => transact("buy")} disabled={!!sel?.item}>
                <span className="font-mono font-bold tracking-[0.15em] uppercase">BUY</span>
              </ActionButton>
            </div>
            <div className="w-[7rem] h-[2.5rem]">
              <ActionButton tone="danger" onPress={() => transact("sell")} disabled={!sel?.item}>
                <span className="font-mono font-bold tracking-[0.15em] uppercase">SELL</span>
              </ActionButton>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <span className="font-mono font-black tracking-tight text-yellow-300 text-lg drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]">
                {sel?.item ? "€$ " + sel.item.price.toLocaleString() : "€$ 1,200"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none px-3 flex items-center justify-between border-t border-cyan-500/20 bg-black/50">
        <span className="font-mono tracking-wider uppercase text-[10px] text-cyan-400/70 truncate">{log}</span>
        <span className="font-mono tracking-wider uppercase text-[10px] text-fuchsia-400">
          {slots.filter((s) => s.item).length}/{slots.length} EQUIPPED
        </span>
      </div>

      <style>{"@keyframes scan{0%{transform:translateY(-3rem)}100%{transform:translateY(20rem)}}"}</style>
    </div>
  );
}