export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(weapons 3×4 =12 + gap .5×2=1 + labels 1.5 + armor 2×4=8 + gap .5 = 23.25 max col) + footer 1.75 + padding .75 = 28.0 ≤ 34.7
  // BUDGET width: pad .75 + weapons col 13 + gap .75 + preview 13 + gap .75 + detail col 15 + pad .75 = 44.0 ≤ 52.0

  type Rar = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  type Slot = {
    slotId: string;
    label: string;
    group: 'weapon' | 'armor';
    item?: { id: string; name: string; rarity?: Rar };
    locked?: boolean;
    armor: number;
    price: number;
    entries: { label: string; value: string | number; delta?: number; tone?: 'neutral' | 'positive' | 'negative' }[];
  };

  const [slots, setSlots] = useState<Slot[]>([
    {
      slotId: 'w1', label: 'PRIMARY', group: 'weapon', armor: 0, price: 12400,
      item: { id: 'i1', name: 'ACHILLES / SMART-SMG', rarity: 'legendary' },
      entries: [
        { label: 'DPS', value: 412.6, delta: 38, tone: 'positive' },
        { label: 'DMG', value: '61-74' },
        { label: 'RPM', value: 720, delta: 60, tone: 'positive' },
        { label: 'CRIT', value: '24.5%', delta: -2, tone: 'negative' },
        { label: 'MOD SLOTS', value: 3 },
      ],
    },
    {
      slotId: 'w2', label: 'SECONDARY', group: 'weapon', armor: 0, price: 5600,
      item: { id: 'i2', name: 'LEXINGTON TECH', rarity: 'rare' },
      entries: [
        { label: 'DPS', value: 188.2, delta: -14, tone: 'negative' },
        { label: 'DMG', value: '44-52' },
        { label: 'CHARGE', value: '1.2s' },
        { label: 'MOD SLOTS', value: 2 },
      ],
    },
    {
      slotId: 'w3', label: 'MELEE', group: 'weapon', armor: 0, price: 9100,
      item: { id: 'i3', name: 'MANTIS BLADES', rarity: 'epic' },
      entries: [
        { label: 'DPS', value: 264.0, delta: 12, tone: 'positive' },
        { label: 'BLEED', value: '35%' },
        { label: 'STAMINA', value: -8, tone: 'negative' },
      ],
    },
    {
      slotId: 'a1', label: 'HEAD', group: 'armor', armor: 84, price: 3300,
      item: { id: 'i4', name: 'NETRUNNER VISOR', rarity: 'uncommon' },
      entries: [
        { label: 'ARMOR', value: 84, delta: 9, tone: 'positive' },
        { label: 'RESIST / EMP', value: '12%' },
        { label: 'WEIGHT', value: 1.4 },
      ],
    },
    {
      slotId: 'a2', label: 'TORSO', group: 'armor', armor: 212, price: 7800,
      item: { id: 'i5', name: 'SAMURAI JACKET', rarity: 'epic' },
      entries: [
        { label: 'ARMOR', value: 212, delta: 31, tone: 'positive' },
        { label: 'RESIST / THERM', value: '18%' },
        { label: 'STREET CRED', value: '+4', tone: 'positive' },
      ],
    },
    {
      slotId: 'a3', label: 'LEGS', group: 'armor', armor: 118, price: 2400,
      item: { id: 'i6', name: 'MERC CARGO PANTS', rarity: 'common' },
      entries: [
        { label: 'ARMOR', value: 118 },
        { label: 'CARRY CAP', value: '+15' },
      ],
    },
    { slotId: 'a4', label: 'FEET', group: 'armor', armor: 0, price: 0, locked: true, entries: [{ label: 'SLOT', value: 'LOCKED' }] },
  ]);

  const [selected, setSelected] = useState('w1');
  const [eddies, setEddies] = useState(184250);
  const [flash, setFlash] = useState<null | 'buy' | 'sell'>(null);
  const [log, setLog] = useState('LOADOUT SYNCED // NET-LINK STABLE');

  const sel = slots.find((s) => s.slotId === selected)!;
  const armorTotal = useMemo(() => slots.reduce((a, s) => a + (s.item ? s.armor : 0), 0), [slots]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  const rarityText: Record<Rar, string> = {
    common: 'text-slate-300', uncommon: 'text-lime-400', rare: 'text-sky-400',
    epic: 'text-fuchsia-400', legendary: 'text-yellow-300',
  };

  const buy = () => {
    if (!sel || sel.locked) return;
    setEddies((e) => e - sel.price);
    setFlash('buy');
    setLog('PURCHASE // -' + sel.price.toLocaleString() + ' EB @ ' + sel.label);
  };
  const sell = () => {
    if (!sel || !sel.item) return;
    setEddies((e) => e + Math.round(sel.price * 0.4));
    setSlots((prev) => prev.map((s) => (s.slotId === sel.slotId ? { ...s, item: undefined } : s)));
    setFlash('sell');
    setLog('FENCED // +' + Math.round(sel.price * 0.4).toLocaleString() + ' EB @ ' + sel.label);
  };

  const weapons = slots.filter((s) => s.group === 'weapon');
  const armor = slots.filter((s) => s.group === 'armor');

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#0a0a0f_60%)] text-cyan-50 relative">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.6)_0px,rgba(34,211,238,0.6)_1px,transparent_1px,transparent_4px)]" />

      {/* HEADER */}
      <div className="h-9 flex-none flex items-center justify-between px-3 border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)] relative">
        <div className="font-mono font-bold tracking-[0.25em] uppercase text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)] text-sm truncate">
          GEAR&nbsp;/&nbsp;LOADOUT
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400">ARMOR</span>
          <span className="font-mono font-black tracking-tight text-sky-400 text-sm drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">{armorTotal}</span>
          <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400">EB</span>
          <span className={
            "font-mono font-black tracking-tight text-yellow-300 text-sm drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] transition-all duration-200 " +
            (flash ? "animate-pulse ring-2 ring-fuchsia-400/60 px-1 rounded-sm" : "")
          }>{eddies.toLocaleString()}</span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex gap-3 p-3 relative min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* LEFT: SLOTS */}
        <div className="w-[13rem] flex flex-col gap-2">
          <div className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs border-l-2 border-yellow-300/70 pl-2">Weapons</div>
          <div className="flex flex-col gap-2">
            {weapons.map((s) => (
              <div key={s.slotId} className="flex items-center gap-2">
                <div className="w-[4.5rem] h-[4rem]">
                  <EquipmentSlot
                    slotId={s.slotId}
                    item={s.item}
                    locked={s.locked}
                    selected={selected === s.slotId}
                    onSelect={setSelected}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-medium tracking-wider uppercase text-slate-400 text-[10px] leading-none">{s.label}</div>
                  <div className={"font-mono text-[11px] tracking-wide truncate mt-1 " + (s.item ? rarityText[s.item.rarity || 'common'] : 'text-slate-600')}>
                    {s.item ? s.item.name : '— EMPTY —'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs border-l-2 border-fuchsia-500/70 pl-2 mt-1">Armor</div>
          <div className="grid grid-cols-2 gap-2">
            {armor.map((s) => (
              <div key={s.slotId} className="flex flex-col gap-1">
                <div className="w-full h-[4rem]">
                  <EquipmentSlot
                    slotId={s.slotId}
                    item={s.item}
                    locked={s.locked}
                    selected={selected === s.slotId}
                    onSelect={setSelected}
                  />
                </div>
                <div className="font-mono font-medium tracking-wider uppercase text-slate-400 text-[10px] leading-none truncate">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: PREVIEW */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 rounded-lg border border-cyan-400/30 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_0_20px_rgba(34,211,238,0.15)] p-1 relative overflow-clip">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(0deg,transparent_60%,rgba(217,70,239,0.12)_100%)]" />
            <LoadoutPreview
              imageUrl="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=60"
              layers={slots.filter((s) => s.item).map((s) => ({ id: s.item!.id, slot: s.label }))}
            />
            <div className="absolute left-2 bottom-2 font-mono text-[10px] tracking-[0.2em] uppercase text-cyan-400/70">
              V // MERC · {slots.filter((s) => s.item).length}/7 EQUIPPED
            </div>
          </div>
        </div>

        {/* RIGHT: STATS + ACTIONS */}
        <div className="w-[15rem] flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-sm border border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-1">
            <span className="font-mono text-[10px] tracking-wider uppercase text-fuchsia-400 truncate">{sel.label}</span>
            <span className={"font-mono text-[10px] tracking-wider uppercase " + (sel.item ? rarityText[sel.item.rarity || 'common'] : 'text-slate-500')}>
              {sel.item ? (sel.item.rarity || 'common') : 'empty'}
            </span>
          </div>

          <div className="flex-1 rounded-lg border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] p-2">
            <StatDetailPanel
              title={sel.item ? sel.item.name : 'NO ITEM INSTALLED'}
              entries={sel.item ? sel.entries : [{ label: 'STATUS', value: 'VACANT' }]}
              visible
            />
          </div>

          <div className="rounded-md border border-cyan-500/20 bg-black/60 px-2 py-1 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400">VALUE</span>
            <span className="font-mono font-black tracking-tight text-yellow-300 text-sm drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]">
              {sel.price.toLocaleString()} EB
            </span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 h-[2.25rem]">
              <ActionButton onPress={buy} tone="accent" disabled={!!sel.locked}>
                <span className="font-mono font-bold tracking-[0.15em] uppercase">BUY</span>
              </ActionButton>
            </div>
            <div className="flex-1 h-[2.25rem]">
              <ActionButton onPress={sell} tone="danger" disabled={!sel.item}>
                <span className="font-mono font-bold tracking-[0.15em] uppercase">SELL</span>
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center justify-between px-3 border-t border-cyan-500/20 bg-black/50 font-mono tracking-wider uppercase text-[10px] text-cyan-400/70">
        <span className="truncate">{log}</span>
        <span className={"text-lime-400 " + (flash ? "animate-pulse" : "")}>● LINK OK</span>
      </div>
    </div>
  );
}