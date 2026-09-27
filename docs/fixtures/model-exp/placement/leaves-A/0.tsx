export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 1.5 + body 29.2 (BodyDiagram 15 / grid 3x(4)+gaps 13 / right: bar 2.5 + ItemList 12.7 + StatLineList 5.5 + toggle 2.25 + gaps 2.25) + footer 1.75 = 34.7 <= 34.7
  // BUDGET width: pad 1.5 + BodyDiagram 15 + gap 0.75 + slotgrid 9.75 + gap 0.75 + right 19 = 46.75 <= 52.0

  type Imp = {
    id: string; label: string; slot: string; subtitle: string; meta: string;
    value: number; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    icon: string; lines: { label: string; value: number | string; delta?: number }[];
  };

  const IMPLANTS: Imp[] = [
    { id: 'kiroshi', label: 'Kiroshi Optics MK.3', slot: 'ocular', subtitle: 'OCULAR SYSTEM', meta: 'RARE', value: 4, rarity: 'rare', icon: '◉',
      lines: [{ label: 'Scan Range', value: '+18 m', delta: 18 }, { label: 'Crit Chance', value: '+6%', delta: 6 }, { label: 'Detection', value: '-4%', delta: -4 }] },
    { id: 'sandevistan', label: 'Sandevistan QianT', slot: 'nervous', subtitle: 'NERVOUS SYSTEM', meta: 'LEGENDARY', value: 8, rarity: 'legendary', icon: '⚡',
      lines: [{ label: 'Time Dilation', value: '-70%', delta: -70 }, { label: 'Duration', value: '+8 s', delta: 8 }, { label: 'Stamina Drain', value: '+12%', delta: 12 }] },
    { id: 'biomon', label: 'Biomonitor Mk.2', slot: 'circulatory', subtitle: 'CIRCULATORY', meta: 'EPIC', value: 5, rarity: 'epic', icon: '♥',
      lines: [{ label: 'Max Health', value: '+120', delta: 120 }, { label: 'Regen Rate', value: '+2.4/s', delta: 2.4 }] },
    { id: 'ramupg', label: 'RAM Upgrade Militech', slot: 'cortex', subtitle: 'FRONTAL CORTEX', meta: 'EPIC', value: 6, rarity: 'epic', icon: '▤',
      lines: [{ label: 'RAM Capacity', value: '+4', delta: 4 }, { label: 'Buffer Regen', value: '+1.1/s', delta: 1.1 }] },
    { id: 'titan', label: 'Titanium Bone Lacing', slot: 'skeleton', subtitle: 'SKELETON', meta: 'RARE', value: 5, rarity: 'rare', icon: '⛨',
      lines: [{ label: 'Armor', value: '+94', delta: 94 }, { label: 'Melee DMG', value: '+15%', delta: 15 }] },
    { id: 'mantis', label: 'Mantis Blades', slot: 'arms', subtitle: 'ARMS', meta: 'EPIC', value: 7, rarity: 'epic', icon: '✂',
      lines: [{ label: 'Bleed Chance', value: '+35%', delta: 35 }, { label: 'Attack Speed', value: '+0.4', delta: 0.4 }] },
    { id: 'reflex', label: 'Reinforced Tendons', slot: 'legs', subtitle: 'LEGS', meta: 'UNCOMMON', value: 3, rarity: 'uncommon', icon: '⇡',
      lines: [{ label: 'Jump Height', value: '+40%', delta: 40 }, { label: 'Stamina', value: '+18', delta: 18 }] },
    { id: 'derm', label: 'Subdermal Armor', slot: 'integumentary', subtitle: 'INTEGUMENTARY', meta: 'RARE', value: 4, rarity: 'rare', icon: '▦',
      lines: [{ label: 'Armor', value: '+60', delta: 60 }, { label: 'Resist: Thermal', value: '+12%', delta: 12 }] },
    { id: 'immune', label: 'Blood Pump', slot: 'immune', subtitle: 'IMMUNE SYS', meta: 'LEGENDARY', value: 6, rarity: 'legendary', icon: '✚',
      lines: [{ label: 'Heal Burst', value: '+240', delta: 240 }, { label: 'Cooldown', value: '-8 s', delta: -8 }] },
    { id: 'hands', label: 'Smart Link', slot: 'hands', subtitle: 'HANDS', meta: 'RARE', value: 4, rarity: 'rare', icon: '✥',
      lines: [{ label: 'Smart Accuracy', value: '+22%', delta: 22 }, { label: 'Handling', value: '+9%', delta: 9 }] },
    { id: 'face', label: 'Nanorelays', slot: 'face', subtitle: 'FACE', meta: 'COMMON', value: 2, rarity: 'common', icon: '◈',
      lines: [{ label: 'Kerenzikov Dur.', value: '+1 s', delta: 1 }] },
  ];

  const DIAGRAM_SLOTS = [
    { id: 'cortex', label: 'FRONTAL CORTEX', pos: { x: 0.5, y: 0.09 }, locked: false },
    { id: 'ocular', label: 'OCULAR', pos: { x: 0.24, y: 0.21 }, locked: false },
    { id: 'nervous', label: 'NERVOUS SYS', pos: { x: 0.78, y: 0.32 }, locked: false },
    { id: 'circulatory', label: 'CIRCULATORY', pos: { x: 0.5, y: 0.45 }, locked: false },
    { id: 'skeleton', label: 'SKELETON', pos: { x: 0.2, y: 0.62 }, locked: false },
    { id: 'legs', label: 'LEGS', pos: { x: 0.62, y: 0.83 }, locked: true },
  ];
  const GRID_SLOTS = [
    { id: 'arms', label: 'ARMS', locked: false },
    { id: 'hands', label: 'HANDS', locked: false },
    { id: 'integumentary', label: 'SKIN', locked: false },
    { id: 'immune', label: 'IMMUNE', locked: false },
    { id: 'face', label: 'FACE', locked: false },
    { id: 'aux', label: 'AUX BUS', locked: true },
  ];

  const MAX_CAP = 32;

  const [installed, setInstalled] = useState<Record<string, string | null>>({
    cortex: 'ramupg', ocular: 'kiroshi', circulatory: 'biomon', arms: null,
    nervous: null, skeleton: 'titan', integumentary: null, immune: null, hands: null, face: null, legs: null,
  });
  const [selectedImplant, setSelectedImplant] = useState<string | null>('sandevistan');
  const [selectedSlot, setSelectedSlot] = useState<string | null>('nervous');
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const impById = (id: string | null) => IMPLANTS.find((i) => i.id === id) || null;
  const current = impById(selectedImplant);
  const usedCap = useMemo(
    () => Object.values(installed).reduce((s, id) => s + (impById(id)?.value || 0), 0),
    [installed]
  );

  const isInstalled = !!(current && installed[current.slot] === current.id);
  const slotLocked = (id: string) =>
    [...DIAGRAM_SLOTS, ...GRID_SLOTS].find((s) => s.id === id)?.locked ?? false;

  const toggleInstall = (on: boolean) => {
    if (!current) return;
    if (on && usedCap + current.value > MAX_CAP) return;
    setInstalled((prev) => ({ ...prev, [current.slot]: on ? current.id : null }));
    setSelectedSlot(current.slot);
    setFlash((f) => f + 1);
  };

  const hovered = hoverSlot ? impById(installed[hoverSlot]) : null;
  const tipLines = hovered
    ? hovered.lines
    : [{ label: 'Status', value: hoverSlot && slotLocked(hoverSlot) ? 'LOCKED' : 'EMPTY SOCKET' }];

  const items = IMPLANTS.map((i) => ({
    id: i.id,
    label: i.label,
    subtitle: i.subtitle,
    meta: installed[i.slot] === i.id ? 'INSTALLED' : i.meta,
    value: i.value + ' CAP',
    locked: slotLocked(i.slot),
  }));

  const slotEl = (s: { id: string; label: string; locked: boolean; pos?: { x: number; y: number } }) => {
    const imp = impById(installed[s.id]);
    return (
      <EquipmentSlot
        key={s.id}
        id={s.id}
        position={s.pos}
        locked={s.locked}
        empty={!imp}
        selected={selectedSlot === s.id}
        item={imp ? { id: imp.id, label: imp.label, icon: imp.icon, rarity: imp.rarity } : undefined}
        onSelect={(id) => {
          setSelectedSlot(id);
          const inst = installed[id];
          if (inst) setSelectedImplant(inst);
        }}
        onHover={setHoverSlot}
      />
    );
  };

  const pct = Math.round((usedCap / MAX_CAP) * 100);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#0a0a0f_60%)] text-cyan-50">
      <div className="h-9 flex-none flex items-center justify-between px-3 border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)]">
        <span className="font-mono font-bold tracking-[0.25em] uppercase text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)] truncate">
          Cyberware // Augmentation Grid
        </span>
        <span
          key={flash}
          className="font-mono text-[10px] tracking-wider uppercase text-fuchsia-400 animate-pulse"
        >
          ▮ link: vitals_hud {pulse % 2 ? '·' : '‥'}
        </span>
      </div>

      <div className="flex-1 flex flex-row gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Body Slot Diagram */}
        <div className="w-[15rem] flex flex-col gap-2">
          <div className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs leading-tight">
            Chassis Map
          </div>
          <div className="flex-1 rounded-lg border border-cyan-400/30 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] p-2">
            <BodyDiagram onBackgroundClick={() => setSelectedSlot(null)}>
              {DIAGRAM_SLOTS.map(slotEl)}
            </BodyDiagram>
          </div>
        </div>

        {/* Slot Grid + tooltip */}
        <div className="w-[9.75rem] flex flex-col gap-2">
          <div className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs leading-tight">
            Peripherals
          </div>
          <StatTooltip
            open={!!hoverSlot}
            title={hovered ? hovered.label : (hoverSlot || '').toUpperCase()}
            lines={tipLines}
          >
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] p-2">
              {GRID_SLOTS.map((s) => (
                <div key={s.id} className="h-[4.25rem]">{slotEl(s)}</div>
              ))}
            </div>
          </StatTooltip>
          <div className="font-mono text-[10px] tracking-wide text-slate-500 leading-tight">
            {GRID_SLOTS.filter((s) => s.locked).length} socket(s) gated by attribute threshold
          </div>
        </div>

        {/* Implant cards / capacity / control */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="rounded-lg border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] backdrop-blur-sm p-2 shadow-[0_0_20px_rgba(34,211,238,0.15),0_0_40px_rgba(217,70,239,0.08)]">
            <div className="flex items-baseline justify-between">
              <span className="font-mono font-medium tracking-wider uppercase text-slate-400 text-[10px]">
                Capacity Load
              </span>
              <span className={"font-mono font-black tracking-tight text-yellow-300 text-sm drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] " + (pct > 85 ? 'animate-pulse' : '')}>
                {usedCap}/{MAX_CAP}
              </span>
            </div>
            <div className="mt-1 h-[1.5rem] w-full">
              <StatBar value={usedCap} min={0} max={MAX_CAP} segments={16} showValue={false} tone={pct > 85 ? 'danger' : 'accent'} />
            </div>
          </div>

          <div className="flex-1 rounded-lg border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] p-1">
            <ItemList
              items={items}
              value={selectedImplant}
              onChange={(id) => {
                setSelectedImplant(id);
                const imp = impById(id);
                if (imp) setSelectedSlot(imp.slot);
              }}
              onActivate={(id) => {
                const imp = impById(id);
                if (imp && !slotLocked(imp.slot)) {
                  setSelectedImplant(id);
                  toggleInstall(installed[imp.slot] !== id);
                }
              }}
            />
          </div>

          <div className="rounded-lg border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] p-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-xs truncate">
                {current ? current.subtitle : 'NO MODULE'}
              </span>
              <span className="font-mono text-[10px] tracking-wider uppercase text-fuchsia-400 border border-fuchsia-500/40 rounded-sm px-2 py-1">
                {current ? current.value + ' CAP' : '—'}
              </span>
            </div>
            <div className="mt-2 h-[5rem] w-full">
              <StatLineList lines={current ? current.lines : [{ label: 'Select a module', value: '—' }]} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-[2.25rem] w-[9rem]">
                <ToggleButton
                  on={isInstalled}
                  onChange={toggleInstall}
                  disabled={!current || slotLocked(current.slot) || (!isInstalled && !!current && usedCap + current.value > MAX_CAP)}
                  tone={isInstalled ? 'danger' : 'accent'}
                >
                  <span className="font-mono font-bold tracking-[0.15em] uppercase">
                    {isInstalled ? 'Remove' : 'Install'}
                  </span>
                </ToggleButton>
              </div>
              <span className="font-mono text-[10px] tracking-wide uppercase text-slate-500 leading-tight">
                {current && slotLocked(current.slot)
                  ? 'socket locked · attribute req'
                  : current && !isInstalled && usedCap + current.value > MAX_CAP
                  ? 'insufficient capacity'
                  : 'deltas stream to vitals hud'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 border-t border-cyan-500/20 bg-black/50 font-mono tracking-wider uppercase text-[10px] text-cyan-400/70">
        <span className="truncate">
          slots active: {Object.values(installed).filter(Boolean).length} / {DIAGRAM_SLOTS.length + GRID_SLOTS.length}
        </span>
        <span className="text-yellow-300/80">load {pct}% {pulse % 2 ? '▮' : '▯'}</span>
      </div>
    </div>
  );
}