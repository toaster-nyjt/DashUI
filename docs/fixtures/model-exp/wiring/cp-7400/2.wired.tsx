export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + capacity 3.25 + gap 0.5 + diagram 25.5 + gap 0.5 + footer 1.75 = 33.75 ≤ 38.1
  // BUDGET width: pad 0.5 + diagram 15.5 + gap 0.5 + detail 23.5 + pad 0.5 = 40.5 ≤ 41.6

  type Imp = { id: string; label: string; icon?: string; rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; stats?: { label: string; value: string | number }[]; cost: number };

  const POOL: Record<string, Imp[]> = {
    cortex: [
      { id: 'c1', label: 'Kerenzikov', icon: '⌁', rarity: 'epic', stats: [{ label: 'SLOW-MO', value: '+1.5s' }, { label: 'CRIT', value: '+9%' }], cost: 14 },
      { id: 'c2', label: 'Axolotl', icon: '⌁', rarity: 'legendary', stats: [{ label: 'CD RED', value: '+18%' }, { label: 'RAM', value: '+3' }], cost: 20 },
    ],
    ocular: [
      { id: 'o1', label: 'Kiroshi Mk.3', icon: '◉', rarity: 'rare', stats: [{ label: 'SCAN', value: '+40%' }, { label: 'HEADSHOT', value: '+12%' }], cost: 8 },
      { id: 'o2', label: 'Ocular Grid', icon: '◉', rarity: 'epic', stats: [{ label: 'ACCURACY', value: '+15%' }, { label: 'SCAN', value: '+22%' }], cost: 11 },
    ],
    nervous: [
      { id: 'n1', label: 'Reflex Tuner', icon: '⚡', rarity: 'epic', stats: [{ label: 'REFLEX', value: '+11%' }, { label: 'MITIG', value: '+8%' }], cost: 13 },
      { id: 'n2', label: 'Synaptic Acc.', icon: '⚡', rarity: 'legendary', stats: [{ label: 'SLOW-MO', value: '+2.2s' }, { label: 'STAM', value: '+14%' }], cost: 17 },
    ],
    circ: [
      { id: 'b1', label: 'Blood Pump', icon: '❤', rarity: 'rare', stats: [{ label: 'HEALTH', value: '+120' }, { label: 'REGEN', value: '+6/s' }], cost: 10 },
      { id: 'b2', label: 'Biomonitor', icon: '❤', rarity: 'uncommon', stats: [{ label: 'HEAL', value: 'AUTO' }, { label: 'REGEN', value: '+3/s' }], cost: 6 },
    ],
    skeleton: [
      { id: 's1', label: 'Titanium Bones', icon: '⛨', rarity: 'rare', stats: [{ label: 'CARRY', value: '+60' }, { label: 'ARMOR', value: '+48' }], cost: 9 },
      { id: 's2', label: 'Dense Marrow', icon: '⛨', rarity: 'epic', stats: [{ label: 'ARMOR', value: '+74' }, { label: 'STAGGER', value: '-20%' }], cost: 12 },
    ],
    arms: [
      { id: 'a1', label: 'Mantis Blades', icon: '⚔', rarity: 'legendary', stats: [{ label: 'DMG', value: '+214' }, { label: 'BLEED', value: '+30%' }], cost: 16 },
      { id: 'a2', label: 'Gorilla Arms', icon: '⚔', rarity: 'epic', stats: [{ label: 'DMG', value: '+180' }, { label: 'BODY', value: '+2' }], cost: 12 },
    ],
    legs: [
      { id: 'l1', label: 'Reinf. Tendons', icon: '⤒', rarity: 'rare', stats: [{ label: 'JUMP', value: '+DBL' }, { label: 'STAM', value: '+10%' }], cost: 7 },
      { id: 'l2', label: 'Fortified Ankles', icon: '⤒', rarity: 'epic', stats: [{ label: 'CHARGE', value: '+35%' }, { label: 'FALL', value: '-50%' }], cost: 9 },
    ],
    skin: [
      { id: 'k1', label: 'Subdermal Armor', icon: '▤', rarity: 'epic', stats: [{ label: 'ARMOR', value: '+96' }, { label: 'RESIST', value: '+18%' }], cost: 11 },
      { id: 'k2', label: 'Optical Camo', icon: '▤', rarity: 'legendary', stats: [{ label: 'STEALTH', value: '+45%' }, { label: 'EVASION', value: '+12%' }], cost: 15 },
    ],
  };

  const REGIONS = [
    { id: 'cortex', name: 'Frontal Cortex', x: 0.5, y: 0.06 },
    { id: 'ocular', name: 'Ocular System', x: 0.17, y: 0.2 },
    { id: 'nervous', name: 'Nervous System', x: 0.83, y: 0.2 },
    { id: 'circ', name: 'Circulatory', x: 0.17, y: 0.42 },
    { id: 'skin', name: 'Integumentary', x: 0.83, y: 0.42 },
    { id: 'skeleton', name: 'Skeleton', x: 0.5, y: 0.6 },
    { id: 'arms', name: 'Arms', x: 0.17, y: 0.79 },
    { id: 'legs', name: 'Legs', x: 0.83, y: 0.79 },
  ];

  const [equipped, setEquipped] = useState<Record<string, number>>({
    cortex: 0, ocular: 0, nervous: -1, circ: 0, skin: -1, skeleton: 0, arms: 0, legs: -1,
  });
  const [sel, setSel] = useState('cortex');
  const [pulse, setPulse] = useState(0);
  const [technical, setTechnical] = useState(14);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  useEffect(() => bus.on("Cyberpunk 2077: Attributes & Perks Panel->Cyberpunk 2077: Cyberware Ripperdoc Loadout", (data) => {
    setTechnical(data.technical);
  }), []);

  const CAP = useMemo(() => Math.round(60 + technical * 3), [technical]);
  const used = useMemo(
    () => Object.keys(equipped).reduce((s, k) => s + (equipped[k] >= 0 ? POOL[k][equipped[k]].cost : 0), 0),
    [equipped]
  );

  const current = equipped[sel] >= 0 ? POOL[sel][equipped[sel]] : null;
  const region = REGIONS.find((r) => r.id === sel)!;

  const swap = () => {
    setEquipped((e) => {
      const next = (e[sel] + 1) % POOL[sel].length;
      const cand = POOL[sel][next];
      const base = used - (e[sel] >= 0 ? POOL[sel][e[sel]].cost : 0);
      if (base + cand.cost > CAP) return e;
      return { ...e, [sel]: next };
    });
  };
  const unequip = () => setEquipped((e) => ({ ...e, [sel]: -1 }));

  const tone: 'accent' | 'warning' | 'danger' = used / CAP > 0.92 ? 'danger' : used / CAP > 0.75 ? 'warning' : 'accent';

  const aggregate = useMemo(() => {
    let armor = 0, health = 0;
    Object.keys(equipped).forEach((k) => {
      if (equipped[k] < 0) return;
      POOL[k][equipped[k]].stats?.forEach((s) => {
        const n = parseInt(String(s.value).replace(/[^0-9-]/g, '')) || 0;
        if (s.label === 'ARMOR') armor += n;
        if (s.label === 'HEALTH') health += n;
      });
    });
    return { armor, health };
  }, [equipped]);

  useEffect(() => {
    bus.emit("Cyberpunk 2077: Cyberware Ripperdoc Loadout->Cyberpunk 2077: V Vitals Status HUD", { armor: aggregate.armor, health: aggregate.health });
  }, [aggregate.armor, aggregate.health]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-cyan-50 font-mono">
      <div className="h-9 flex-none px-3 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-fuchsia-400 animate-pulse">◆</span>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)]">
            Ripperdoc // Cyberware
          </span>
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-cyan-300/70">TECH ABILITY {technical}</span>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Capacity meter */}
        <div className="flex-none bg-black/60 border border-cyan-400/15 rounded-md shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] px-2 py-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[0.65rem] font-medium uppercase tracking-widest text-cyan-300/70">Cyberware Capacity</span>
            <span className="text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500">
              {used} / {CAP} UNITS
            </span>
          </div>
          <div className="w-full h-[1.5rem]">
            <StatBar value={used} max={CAP} tone={tone} showNumeric />
          </div>
        </div>

        <div className="flex-1 flex gap-2">
          {/* Diagram */}
          <div className="w-[15.5rem] h-full relative">
            <BodyDiagram points={REGIONS.map((r) => ({ id: r.id, x: r.x, y: r.y }))}>
              {REGIONS.map((r) => (
                <EquipmentSlot
                  key={r.id}
                  slotId={r.id}
                  selected={sel === r.id}
                  position={{ x: r.x, y: r.y }}
                  onSelect={setSel}
                  item={
                    equipped[r.id] >= 0
                      ? {
                          id: POOL[r.id][equipped[r.id]].id,
                          label: POOL[r.id][equipped[r.id]].label,
                          icon: POOL[r.id][equipped[r.id]].icon,
                          rarity: POOL[r.id][equipped[r.id]].rarity,
                        }
                      : undefined
                  }
                />
              ))}
            </BodyDiagram>
          </div>

          {/* Detail */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex-none bg-zinc-900/80 backdrop-blur-sm border border-cyan-400/25 rounded-lg shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)] px-2 py-2">
              <div className="text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">{region.name}</div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold uppercase tracking-widest text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)] truncate">
                  {current ? current.label : 'EMPTY SOCKET'}
                </span>
                <span className="text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-400">
                  {current ? current.rarity : '—'}
                </span>
              </div>
            </div>

            {/* Slot bonuses */}
            <div className="flex-none grid grid-cols-2 gap-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-[2.75rem]">
                  <div className="text-[0.6rem] uppercase tracking-[0.15em] text-cyan-300/70 leading-none pb-0.5 truncate">
                    {current?.stats?.[i]?.label ?? '---'}
                  </div>
                  <div className="h-[2rem]">
                    <StatReadout value={current?.stats?.[i]?.value ?? '--'} tone={current ? 'accent' : 'neutral'} />
                  </div>
                </div>
              ))}
              <div className="h-[2.75rem]">
                <div className="text-[0.6rem] uppercase tracking-[0.15em] text-cyan-300/70 leading-none pb-0.5">LOAD</div>
                <div className="h-[2rem]">
                  <StatReadout value={current ? current.cost : 0} unit="U" tone={tone} />
                </div>
              </div>
              <div className="h-[2.75rem]">
                <div className="text-[0.6rem] uppercase tracking-[0.15em] text-cyan-300/70 leading-none pb-0.5">FREE</div>
                <div className="h-[2rem]">
                  <StatReadout value={CAP - used} unit="U" tone="neutral" />
                </div>
              </div>
            </div>

            {/* aggregate output to vitals */}
            <div className="flex-1 bg-black/60 border border-cyan-400/15 rounded-md shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] p-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.65rem] font-medium uppercase tracking-widest text-cyan-300/70">Aggregate Output</span>
                <span className="text-[0.6rem] tracking-[0.2em] text-emerald-400">
                  {pulse % 20 < 10 ? '▮ SYNC' : '▯ SYNC'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="tracking-widest text-cyan-100/90">ARMOR</span>
                <span className="font-black tracking-tighter text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]">
                  +{aggregate.armor}
                </span>
              </div>
              <div className="h-[1.25rem] w-full">
                <StatBar value={aggregate.armor} max={300} tone="accent" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="tracking-widest text-cyan-100/90">MAX HEALTH</span>
                <span className="font-black tracking-tighter text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]">
                  +{aggregate.health}
                </span>
              </div>
              <div className="h-[1.25rem] w-full">
                <StatBar value={aggregate.health} max={300} tone="danger" />
              </div>
              <div className="flex-1 overflow-clip relative rounded-sm">
                <div
                  className="absolute inset-x-0 h-px bg-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-100"
                  style={{ top: pulse + '%' }}
                />
              </div>
            </div>

            <div className="flex-none flex gap-2">
              <div className="flex-1 h-[2.25rem]">
                <ActionButton onPress={swap} tone="accent">
                  <span className="font-bold uppercase tracking-widest">Swap Implant</span>
                </ActionButton>
              </div>
              <div className="w-[7rem] h-[2.25rem]">
                <ActionButton onPress={unequip} tone="danger" disabled={!current}>
                  <span className="font-bold uppercase tracking-widest">Remove</span>
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none px-3 flex items-center justify-between border-t border-cyan-400/20 bg-black/50">
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cyan-300/70">
          SLOTS {Object.values(equipped).filter((v) => v >= 0).length}/8
        </span>
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-lime-300">
          {used > CAP ? 'OVERLOAD' : 'BIOMONITOR NOMINAL'}
        </span>
      </div>
    </div>
  );
}