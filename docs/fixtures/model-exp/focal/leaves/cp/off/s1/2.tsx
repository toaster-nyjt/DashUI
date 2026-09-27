export default function GeneratedComponent() {
  // BUDGET height: header 3 + main 24 (diagram 24 / slot grid 4×4 + gaps 1.5 = 17.5 + bonuses 4.5) + capacity strip 4.5 + padding 1 = 32.5 ≤ 38.1
  // BUDGET width: pad 0.5 + diagram col 14 + gap 0.5 + right col 26 (grid 2×6 + gap 0.5) + pad 0.5 = 41.5 ≤ 41.6

  const catalog: Record<string, { id: string; label: string; icon: string; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; cost: number; stats: { label: string; value: string | number }[] }[]> = {
    cortex: [
      { id: 'cx1', label: 'KIROSHI SYNAPSE', icon: '◉', rarity: 'legendary', cost: 28, stats: [{ label: 'ARM', value: 42 }, { label: 'HP', value: 60 }, { label: 'REG', value: 4 }] },
      { id: 'cx2', label: 'RAM RECOMPILER', icon: '▣', rarity: 'epic', cost: 18, stats: [{ label: 'ARM', value: 12 }, { label: 'HP', value: 20 }, { label: 'REG', value: 9 }] },
    ],
    ocular: [
      { id: 'oc1', label: 'KIROSHI MK.3', icon: '◎', rarity: 'epic', cost: 22, stats: [{ label: 'ARM', value: 8 }, { label: 'HP', value: 0 }, { label: 'REG', value: 2 }] },
      { id: 'oc2', label: 'BALLISTIC COPROC', icon: '⦿', rarity: 'rare', cost: 14, stats: [{ label: 'ARM', value: 18 }, { label: 'HP', value: 10 }, { label: 'REG', value: 0 }] },
    ],
    nervous: [
      { id: 'nv1', label: 'KERENZIKOV', icon: '⚡', rarity: 'legendary', cost: 26, stats: [{ label: 'ARM', value: 6 }, { label: 'HP', value: 15 }, { label: 'REG', value: 7 }] },
      { id: 'nv2', label: 'REFLEX TUNER', icon: '↯', rarity: 'rare', cost: 12, stats: [{ label: 'ARM', value: 4 }, { label: 'HP', value: 30 }, { label: 'REG', value: 3 }] },
    ],
    circ: [
      { id: 'cr1', label: 'BIOMONITOR', icon: '♥', rarity: 'rare', cost: 16, stats: [{ label: 'ARM', value: 0 }, { label: 'HP', value: 55 }, { label: 'REG', value: 12 }] },
      { id: 'cr2', label: 'BLOOD PUMP', icon: '✚', rarity: 'epic', cost: 24, stats: [{ label: 'ARM', value: 10 }, { label: 'HP', value: 80 }, { label: 'REG', value: 6 }] },
    ],
    skeleton: [
      { id: 'sk1', label: 'TITANIUM BONES', icon: '⬢', rarity: 'epic', cost: 20, stats: [{ label: 'ARM', value: 55 }, { label: 'HP', value: 25 }, { label: 'REG', value: 0 }] },
      { id: 'sk2', label: 'DENSE MARROW', icon: '⬡', rarity: 'uncommon', cost: 10, stats: [{ label: 'ARM', value: 20 }, { label: 'HP', value: 40 }, { label: 'REG', value: 2 }] },
    ],
    arms: [
      { id: 'ar1', label: 'MANTIS BLADES', icon: '⚔', rarity: 'legendary', cost: 30, stats: [{ label: 'ARM', value: 14 }, { label: 'HP', value: 0 }, { label: 'REG', value: 0 }] },
      { id: 'ar2', label: 'GORILLA ARMS', icon: '✊', rarity: 'epic', cost: 22, stats: [{ label: 'ARM', value: 26 }, { label: 'HP', value: 18 }, { label: 'REG', value: 1 }] },
    ],
    legs: [
      { id: 'lg1', label: 'REINFORCED TEND.', icon: '⇈', rarity: 'rare', cost: 14, stats: [{ label: 'ARM', value: 9 }, { label: 'HP', value: 12 }, { label: 'REG', value: 3 }] },
      { id: 'lg2', label: 'FORTIFIED ANKLES', icon: '⇊', rarity: 'uncommon', cost: 9, stats: [{ label: 'ARM', value: 16 }, { label: 'HP', value: 6 }, { label: 'REG', value: 0 }] },
    ],
    integ: [
      { id: 'in1', label: 'SUBDERMAL ARMOR', icon: '▤', rarity: 'epic', cost: 21, stats: [{ label: 'ARM', value: 68 }, { label: 'HP', value: 10 }, { label: 'REG', value: 0 }] },
      { id: 'in2', label: 'OPTICAL CAMO', icon: '◫', rarity: 'legendary', cost: 27, stats: [{ label: 'ARM', value: 30 }, { label: 'HP', value: 5 }, { label: 'REG', value: 5 }] },
    ],
  };

  const slotMeta = [
    { slotId: 'cortex', label: 'FRONTAL CORTEX', x: 0.5, y: 0.08 },
    { slotId: 'ocular', label: 'OCULAR SYSTEM', x: 0.5, y: 0.18 },
    { slotId: 'nervous', label: 'NERVOUS SYSTEM', x: 0.22, y: 0.36 },
    { slotId: 'circ', label: 'CIRCULATORY', x: 0.5, y: 0.42 },
    { slotId: 'skeleton', label: 'SKELETON', x: 0.78, y: 0.36 },
    { slotId: 'arms', label: 'ARMS', x: 0.18, y: 0.6 },
    { slotId: 'legs', label: 'LEGS', x: 0.5, y: 0.86 },
    { slotId: 'integ', label: 'INTEGUMENTARY', x: 0.82, y: 0.62 },
  ];

  const [equipped, setEquipped] = useState<Record<string, number>>({
    cortex: 0, ocular: 0, nervous: 0, circ: 0, skeleton: 1, arms: 1, legs: 0, integ: 0,
  });
  const [selected, setSelected] = useState('cortex');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 1000), 90);
    return () => clearInterval(t);
  }, []);

  const capacityMax = 186;
  const used = useMemo(
    () => slotMeta.reduce((s, m) => s + catalog[m.slotId][equipped[m.slotId]].cost, 0),
    [equipped]
  );
  const totals = useMemo(() => {
    let arm = 0, hp = 0, reg = 0;
    slotMeta.forEach((m) => {
      const it = catalog[m.slotId][equipped[m.slotId]];
      arm += Number(it.stats[0].value); hp += Number(it.stats[1].value); reg += Number(it.stats[2].value);
    });
    return { arm, hp, reg };
  }, [equipped]);

  const over = used > capacityMax;
  const sel = catalog[selected][equipped[selected]];
  const selLabel = slotMeta.find((s) => s.slotId === selected)!.label;

  const swap = () => {
    setEquipped((e) => ({ ...e, [selected]: (e[selected] + 1) % catalog[selected].length }));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07070a] text-[#e8e8ee] font-mono relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] z-20"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #fcee0a 0px, #fcee0a 1px, transparent 1px, transparent 4px)' }}
      />
      <style>{`
        @keyframes glitchx { 0%,92%,100%{transform:translateX(0)} 94%{transform:translateX(-2px)} 96%{transform:translateX(2px)} }
        @keyframes sweep { 0%{transform:translateY(-100%)} 100%{transform:translateY(900%)} }
        @keyframes breathe { 0%,100%{opacity:.35} 50%{opacity:1} }
      `}</style>

      {/* HEADER */}
      <div className="flex-none h-12 px-3 flex items-center justify-between border-b-2 border-[#fcee0a] bg-[#fcee0a]/[0.06]">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-[#fcee0a] text-base font-black tracking-[0.2em]" style={{ animation: 'glitchx 3.4s infinite' }}>RIPPERDOC</span>
          <span className="text-[10px] tracking-[0.35em] text-[#00f0ff] truncate">CYBERWARE//LOADOUT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] text-[#e8e8ee]/50">TECH.ABILITY 15</span>
          <span className="h-2 w-2 bg-[#ff2e55]" style={{ animation: 'breathe 1.1s infinite' }} />
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 basis-0 flex gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* DIAGRAM */}
        <div className="flex-none w-[14rem] flex flex-col gap-1">
          <div className="text-[9px] tracking-[0.3em] text-[#00f0ff]/70 px-1">SOMATIC MAP</div>
          <div className="flex-1 relative overflow-clip border border-[#00f0ff]/30 bg-[#00f0ff]/[0.03]">
            <BodyDiagram points={slotMeta.map((s) => ({ id: s.slotId, x: s.x, y: s.y }))} />
            <div
              className="pointer-events-none absolute left-0 right-0 h-8 z-10"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,240,255,0.22), transparent)', animation: 'sweep 4.2s linear infinite' }}
            />
            <div className="pointer-events-none absolute bottom-1 left-1 text-[8px] tracking-[0.25em] text-[#fcee0a]/70">
              SYNC {String(300 + (pulse % 97)).slice(0, 3)}%
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] tracking-[0.3em] text-[#fcee0a]/80">IMPLANT SOCKETS</span>
            <span className="text-[9px] tracking-[0.2em] text-[#e8e8ee]/40">08 / 08 ACTIVE</span>
          </div>

          <div className="flex-1 basis-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-0.5">
            <div className="grid grid-cols-2 gap-2">
              {slotMeta.map((m) => {
                const it = catalog[m.slotId][equipped[m.slotId]];
                return (
                  <div key={m.slotId} className="flex flex-col gap-0.5">
                    <span className={'text-[8px] tracking-[0.22em] transition-colors duration-200 ' + (selected === m.slotId ? 'text-[#fcee0a]' : 'text-[#e8e8ee]/40')}>
                      {m.label}
                    </span>
                    <div className="h-[4.25rem] transition-transform duration-200 hover:translate-x-[2px]">
                      <EquipmentSlot
                        slotId={m.slotId}
                        item={{ id: it.id, label: it.label, icon: it.icon, rarity: it.rarity, stats: it.stats }}
                        selected={selected === m.slotId}
                        onSelect={setSelected}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLOT BONUSES */}
          <div className="flex-none border-t border-[#fcee0a]/25 pt-1.5">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[9px] tracking-[0.25em] text-[#00f0ff]">{selLabel}</span>
              <span className="text-[9px] tracking-[0.2em] text-[#fcee0a]/80 truncate">{sel.label}</span>
            </div>
            <div className="flex gap-1.5">
              <div className="flex-1 h-[2.25rem]"><StatReadout value={totals.arm} unit="ARM" delta={Number(sel.stats[0].value)} tone="accent" /></div>
              <div className="flex-1 h-[2.25rem]"><StatReadout value={totals.hp} unit="HP" delta={Number(sel.stats[1].value)} tone="neutral" /></div>
              <div className="flex-1 h-[2.25rem]"><StatReadout value={totals.reg} unit="REG/S" delta={Number(sel.stats[2].value)} tone={over ? 'warning' : 'neutral'} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* CAPACITY + SWAP */}
      <div className="flex-none border-t-2 border-[#fcee0a] bg-[#fcee0a]/[0.05] px-3 py-2 flex items-center gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <span className="text-[9px] tracking-[0.3em] text-[#fcee0a]">CYBERWARE CAPACITY</span>
            <span className={'text-[10px] tracking-[0.2em] transition-colors ' + (over ? 'text-[#ff2e55]' : 'text-[#00f0ff]')}>
              {used} / {capacityMax} {over ? '⚠ OVERLOAD' : 'STABLE'}
            </span>
          </div>
          <div className="h-[1.5rem]">
            <StatBar value={Math.min(used, capacityMax)} max={capacityMax} segments={18} tone={over ? 'danger' : used > capacityMax * 0.8 ? 'warning' : 'accent'} showNumeric={false} />
          </div>
        </div>
        <div className="w-[7.5rem] h-[2.25rem]">
          <ActionButton onPress={swap} tone="accent">
            <span className="flex flex-col leading-none">
              <span className="font-black tracking-[0.2em]">SWAP</span>
              <span className="text-[0.6em] tracking-[0.25em] opacity-70">IMPLANT</span>
            </span>
          </ActionButton>
        </div>
      </div>
    </div>
  );
}