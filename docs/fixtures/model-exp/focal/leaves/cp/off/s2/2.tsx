export default function GeneratedComponent() {
  // BUDGET height: header 3 + gap 0.5 + body 29.1 (BodyDiagram 11+ floor ok) + gap 0.5 + capacity strip 5 = 38.1 ≤ 38.1
  // BUDGET width: diagram col 21 + gap 0.6 + detail col 19 = 40.6 ≤ 41.6

  type Imp = {
    id: string; label: string; icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    cost: number; armor: number; hp: number; regen: number; res: number;
  };

  const REGIONS: { id: string; name: string; x: number; y: number; options: Imp[] }[] = [
    {
      id: 'frontal', name: 'FRONTAL CORTEX', x: 0.5, y: 0.06,
      options: [
        { id: 'f1', label: 'Newton Module', icon: '◈', rarity: 'rare', cost: 8, armor: 0, hp: 0, regen: 2, res: 12 },
        { id: 'f2', label: 'Limbic Enhancer', icon: '◉', rarity: 'epic', cost: 14, armor: 4, hp: 20, regen: 1, res: 18 },
        { id: 'f3', label: 'Camillo RAM', icon: '⬢', rarity: 'legendary', cost: 20, armor: 6, hp: 40, regen: 5, res: 25 },
      ],
    },
    {
      id: 'ocular', name: 'OCULAR SYSTEM', x: 0.5, y: 0.19,
      options: [
        { id: 'o1', label: 'Kiroshi Mk.1', icon: '◎', rarity: 'uncommon', cost: 6, armor: 0, hp: 0, regen: 0, res: 8 },
        { id: 'o2', label: 'Kiroshi Mk.3', icon: '⊚', rarity: 'epic', cost: 12, armor: 2, hp: 10, regen: 0, res: 20 },
      ],
    },
    {
      id: 'nervous', name: 'NERVOUS SYSTEM', x: 0.17, y: 0.33,
      options: [
        { id: 'n1', label: 'Kerenzikov', icon: '⚡', rarity: 'rare', cost: 10, armor: 0, hp: 0, regen: 3, res: 14 },
        { id: 'n2', label: 'Synaptic Accel.', icon: '✦', rarity: 'legendary', cost: 18, armor: 3, hp: 15, regen: 6, res: 22 },
      ],
    },
    {
      id: 'circ', name: 'CIRCULATORY', x: 0.83, y: 0.33,
      options: [
        { id: 'c1', label: 'Blood Pump', icon: '❖', rarity: 'epic', cost: 13, armor: 2, hp: 55, regen: 9, res: 10 },
        { id: 'c2', label: 'Biomonitor', icon: '♥', rarity: 'uncommon', cost: 7, armor: 0, hp: 25, regen: 4, res: 6 },
      ],
    },
    {
      id: 'armL', name: 'ARMS', x: 0.13, y: 0.52,
      options: [
        { id: 'a1', label: 'Mantis Blades', icon: '⟁', rarity: 'legendary', cost: 16, armor: 5, hp: 0, regen: 0, res: 12 },
        { id: 'a2', label: 'Gorilla Arms', icon: '⬣', rarity: 'rare', cost: 11, armor: 8, hp: 20, regen: 0, res: 5 },
      ],
    },
    {
      id: 'skel', name: 'SKELETON', x: 0.87, y: 0.52,
      options: [
        { id: 's1', label: 'Titanium Bones', icon: '⌬', rarity: 'rare', cost: 9, armor: 14, hp: 30, regen: 0, res: 4 },
        { id: 's2', label: 'Bionic Joints', icon: '⊗', rarity: 'uncommon', cost: 6, armor: 7, hp: 10, regen: 0, res: 2 },
      ],
    },
    {
      id: 'integ', name: 'INTEGUMENTARY', x: 0.5, y: 0.66,
      options: [
        { id: 'i1', label: 'Subdermal Armor', icon: '▤', rarity: 'epic', cost: 12, armor: 22, hp: 0, regen: 0, res: 9 },
        { id: 'i2', label: 'Optical Camo', icon: '▦', rarity: 'legendary', cost: 17, armor: 10, hp: 0, regen: 2, res: 16 },
      ],
    },
    {
      id: 'legs', name: 'LEGS', x: 0.5, y: 0.9,
      options: [
        { id: 'l1', label: 'Reinforced Tendons', icon: '⤒', rarity: 'uncommon', cost: 5, armor: 3, hp: 0, regen: 1, res: 3 },
        { id: 'l2', label: 'Fortified Ankles', icon: '⤓', rarity: 'rare', cost: 8, armor: 6, hp: 12, regen: 0, res: 5 },
      ],
    },
  ];

  const [equipped, setEquipped] = useState<Record<string, number | null>>({
    frontal: 0, ocular: 1, nervous: 0, circ: 0, armL: 1, skel: 0, integ: null, legs: null,
  });
  const [selected, setSelected] = useState<string>('frontal');
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 120);
    return () => clearInterval(t);
  }, []);

  const MAX_CAP = 128;
  const region = REGIONS.find((r) => r.id === selected)!;
  const eqIdx = equipped[selected];
  const current = eqIdx === null || eqIdx === undefined ? null : region.options[eqIdx];

  const totals = useMemo(() => {
    let cap = 0, armor = 0, hp = 0, regen = 0, res = 0;
    REGIONS.forEach((r) => {
      const i = equipped[r.id];
      if (i === null || i === undefined) return;
      const o = r.options[i];
      cap += o.cost; armor += o.armor; hp += o.hp; regen += o.regen; res += o.res;
    });
    return { cap, armor, hp, regen, res };
  }, [equipped]);

  const cycle = (dir: number) => {
    setEquipped((prev) => {
      const len = region.options.length;
      const cur = prev[selected];
      const order: (number | null)[] = [null, ...region.options.map((_, i) => i)];
      const pos = order.indexOf(cur === undefined ? null : cur);
      const next = order[(pos + dir + order.length) % order.length];
      return { ...prev, [selected]: next as number | null };
    });
  };

  const capTone = totals.cap > MAX_CAP ? 'danger' : totals.cap > MAX_CAP * 0.82 ? 'warning' : 'accent';

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07070a] text-[#f5f3e7] font-mono relative">
      <style>{`
        @keyframes rd-sweep { 0%{transform:translateY(-110%)} 100%{transform:translateY(760%)} }
        @keyframes rd-flick { 0%,92%,100%{opacity:1} 94%{opacity:.35} 96%{opacity:.85} }
        @keyframes rd-dash { to { stroke-dashoffset: -400; } }
        @keyframes rd-glow { 0%,100%{opacity:.25} 50%{opacity:.7} }
      `}</style>

      {/* HEADER */}
      <div className="flex-none h-12 px-3 flex items-center gap-3 border-b-2 border-[#fcee0a] bg-[#0d0d12] relative overflow-clip">
        <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(90deg,#fcee0a 0 1px,transparent 1px 9px)' }} />
        <div className="relative w-7 h-7 bg-[#fcee0a] text-black flex items-center justify-center text-base font-black" style={{ clipPath: 'polygon(0 0,100% 0,100% 70%,78% 100%,0 100%)' }}>R</div>
        <div className="relative min-w-0 flex-1">
          <div className="text-[13px] font-black tracking-[0.22em] text-[#fcee0a] truncate" style={{ animation: 'rd-flick 5s infinite' }}>RIPPERDOC // CYBERWARE LOADOUT</div>
          <div className="text-[9px] tracking-[0.3em] text-[#00e5ff]/70 truncate">V.ARASAKA-OS ∙ BIOLINK STABLE</div>
        </div>
        <div className="relative text-[9px] tracking-[0.2em] text-[#ff2e63] border border-[#ff2e63]/50 px-2 py-1">
          TECH ABILITY 14
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 grid grid-cols-[1.05fr_1fr] gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* DIAGRAM COLUMN */}
        <div className="flex flex-col gap-1.5">
          <div className="flex-none text-[9px] tracking-[0.3em] text-[#fcee0a]/70">◤ SOMATIC MAP</div>
          <div className="flex-1 relative bg-[#0b0b10] border border-[#fcee0a]/25 p-1 overflow-clip">
            <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ background: 'repeating-linear-gradient(0deg,#00e5ff 0 1px,transparent 1px 6px)' }} />
            <div className="absolute left-0 right-0 h-8 pointer-events-none" style={{ background: 'linear-gradient(180deg,transparent,rgba(0,229,255,0.22),transparent)', animation: 'rd-sweep 4.5s linear infinite' }} />
            <div className="h-full w-full relative">
              <BodyDiagram points={REGIONS.map((r) => ({ id: r.id, x: r.x, y: r.y }))}>
                {REGIONS.map((r) => {
                  const i = equipped[r.id];
                  const o = i === null || i === undefined ? undefined : r.options[i];
                  return (
                    <EquipmentSlot
                      key={r.id}
                      slotId={r.id}
                      selected={selected === r.id}
                      position={{ x: r.x, y: r.y }}
                      onSelect={(id) => setSelected(id)}
                      item={o ? { id: o.id, label: o.label, icon: o.icon, rarity: o.rarity, stats: [{ label: 'CAP', value: o.cost }] } : undefined}
                    />
                  );
                })}
              </BodyDiagram>
            </div>
          </div>
        </div>

        {/* DETAIL COLUMN */}
        <div className="flex flex-col gap-2">
          <div className="flex-none bg-[#0d0d12] border-l-2 border-[#00e5ff] px-2 py-2">
            <div className="text-[9px] tracking-[0.3em] text-[#00e5ff]/70">SLOT</div>
            <div className="text-[14px] font-black tracking-[0.12em] text-[#fcee0a] truncate">{region.name}</div>
            <div className="text-[10px] tracking-[0.15em] truncate" style={{ color: current ? '#f5f3e7' : '#ff2e63' }}>
              {current ? current.icon + '  ' + current.label.toUpperCase() : '— EMPTY SOCKET —'}
            </div>
          </div>

          <div className="flex-none">
            <div className="text-[9px] tracking-[0.3em] text-[#fcee0a]/70 mb-1">◤ SLOT BONUSES</div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-[2.5rem]"><StatReadout value={current ? current.armor : 0} unit="ARM" delta={current ? current.armor : 0} tone="accent" /></div>
              <div className="h-[2.5rem]"><StatReadout value={current ? current.hp : 0} unit="HP" delta={current ? current.hp : 0} tone="neutral" /></div>
              <div className="h-[2.5rem]"><StatReadout value={current ? current.regen : 0} unit="RGN/s" delta={current ? current.regen : 0} tone="accent" /></div>
              <div className="h-[2.5rem]"><StatReadout value={current ? current.res : 0} unit="RES%" delta={current ? current.res : 0} tone="warning" /></div>
            </div>
          </div>

          <div className="flex-none">
            <div className="text-[9px] tracking-[0.3em] text-[#fcee0a]/70 mb-1">◤ SWAP IMPLANT</div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-[2.25rem]">
                <ActionButton onPress={() => cycle(-1)} tone="neutral">
                  <span className="tracking-[0.2em] font-black">◀ PREV</span>
                </ActionButton>
              </div>
              <div className="h-[2.25rem]">
                <ActionButton onPress={() => cycle(1)} tone="accent">
                  <span className="tracking-[0.2em] font-black">NEXT ▶</span>
                </ActionButton>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0b0b10] border border-[#fcee0a]/20 p-2 flex flex-col gap-1.5 relative overflow-clip">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 0%, rgba(252,238,10,0.10), transparent 60%)', animation: 'rd-glow 3s ease-in-out infinite' }} />
            <div className="text-[9px] tracking-[0.3em] text-[#00e5ff]/70 relative">◤ AGGREGATE → VITALS HUD</div>
            {([['ARMOR', totals.armor, 'accent'], ['MAX HP', totals.hp, 'neutral'], ['REGEN', totals.regen, 'accent'], ['RESIST', totals.res, 'warning']] as const).map(([lbl, v, t]) => (
              <div key={lbl} className="flex items-center gap-2 relative">
                <div className="w-[4.6rem] text-[9px] tracking-[0.18em] text-[#f5f3e7]/60">{lbl}</div>
                <div className="flex-1 h-[1.3rem]">
                  <StatBar value={v} max={lbl === 'REGEN' ? 25 : lbl === 'RESIST' ? 120 : lbl === 'ARMOR' ? 80 : 200} tone={t as any} showNumeric />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CAPACITY STRIP */}
      <div className="flex-none border-t-2 border-[#fcee0a] bg-[#0d0d12] px-3 py-2 flex items-center gap-3">
        <div className="flex-none">
          <div className="text-[9px] tracking-[0.3em] text-[#fcee0a]">CYBERWARE</div>
          <div className="text-[9px] tracking-[0.3em] text-[#fcee0a]/60">CAPACITY</div>
        </div>
        <div className="flex-1 h-[1.6rem]">
          <StatBar value={totals.cap} max={MAX_CAP} segments={16} tone={capTone as any} showNumeric />
        </div>
        <div
          className="flex-none text-[10px] font-black tracking-[0.2em] px-2 py-1 border transition-colors duration-300"
          style={{
            color: totals.cap > MAX_CAP ? '#ff2e63' : '#00e5ff',
            borderColor: totals.cap > MAX_CAP ? 'rgba(255,46,99,.6)' : 'rgba(0,229,255,.4)',
          }}
        >
          {totals.cap > MAX_CAP ? 'OVERLOAD' : MAX_CAP - totals.cap + ' FREE'}
        </div>
      </div>
    </div>
  );
}