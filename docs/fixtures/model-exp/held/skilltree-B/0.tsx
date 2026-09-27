export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + colHeader 2 + 4 tiers x 4.5 + 3 gaps x 0.75 + labels 4x1 + pad 1.5 + footer 1.75 = 35.75 <= 41.6
  // BUDGET width: 5 branches x 10.5 + 4 gaps x 0.5 + rail 20 + pad 1.5 = 76 <= 104.0

  const ATTRS = useMemo(
    () => [
      {
        id: "body",
        name: "BODY",
        level: 11,
        text: "text-rose-400",
        ring: "border-rose-400/40",
        glow: "rgba(244,63,94,0.55)",
        perks: [
          [
            { id: "b1", label: "PAINKILLER", req: 3, max: 3, desc: "Health regen +50% out of combat.", bonus: "+12 HEALTH" },
            { id: "b2", label: "GRUNT", req: 3, max: 2, desc: "Damage with LMGs increased.", bonus: "+8% DMG" },
          ],
          [
            { id: "b3", label: "STEEL SKIN", req: 6, max: 3, desc: "Increases total armor.", bonus: "+15 ARMOR" },
            { id: "b4", label: "DIVIDED ATT.", req: 6, max: 1, desc: "Reload while sprinting.", bonus: "UTILITY" },
          ],
          [
            { id: "b5", label: "JUGGERNAUT", req: 9, max: 2, desc: "Reduced damage while Berserk.", bonus: "-20% DMG TAKEN" },
            { id: "b6", label: "WOLVERINE", req: 9, max: 3, desc: "Health regen during combat.", bonus: "+6 HP/S" },
          ],
          [
            { id: "b7", label: "UNSHAKABLE", req: 14, max: 1, desc: "Immune to stagger effects.", bonus: "STATUS IMMUNE" },
            { id: "b8", label: "TITANIUM", req: 14, max: 2, desc: "Max stamina massively raised.", bonus: "+30 STAM" },
          ],
        ],
      },
      {
        id: "reflex",
        name: "REFLEXES",
        level: 14,
        text: "text-cyan-300",
        ring: "border-cyan-400/40",
        glow: "rgba(34,211,238,0.55)",
        perks: [
          [
            { id: "r1", label: "SLIPPERY", req: 3, max: 2, desc: "Evasion while dodging.", bonus: "+10% EVADE" },
            { id: "r2", label: "SPRINT+", req: 3, max: 3, desc: "Increases sprint speed.", bonus: "+12% SPEED" },
          ],
          [
            { id: "r3", label: "CRIT EDGE", req: 6, max: 3, desc: "Raises critical hit chance.", bonus: "+9% CRIT" },
            { id: "r4", label: "AIR DASH", req: 6, max: 1, desc: "Dodge mid-air.", bonus: "MOBILITY" },
          ],
          [
            { id: "r5", label: "BLADERUNNER", req: 10, max: 2, desc: "Mantis blade damage up.", bonus: "+18% BLADE" },
            { id: "r6", label: "TRICK SHOT", req: 10, max: 3, desc: "Pistol crit damage up.", bonus: "+25% CRIT DMG" },
          ],
          [
            { id: "r7", label: "FLASH STEP", req: 15, max: 1, desc: "Dash leaves afterimage decoy.", bonus: "PHANTOM" },
            { id: "r8", label: "KEREZNIKOV", req: 15, max: 2, desc: "Time slows while aiming.", bonus: "-40% TIME" },
          ],
        ],
      },
      {
        id: "tech",
        name: "TECHNICAL",
        level: 8,
        text: "text-amber-300",
        ring: "border-amber-300/40",
        glow: "rgba(252,211,77,0.55)",
        perks: [
          [
            { id: "t1", label: "MECHANIC", req: 3, max: 3, desc: "More components from disassembly.", bonus: "+30% SALVAGE" },
            { id: "t2", label: "FIELD TECH", req: 3, max: 2, desc: "Tech weapon charge faster.", bonus: "+15% CHARGE" },
          ],
          [
            { id: "t3", label: "ARMORER", req: 6, max: 2, desc: "Armor mods more effective.", bonus: "+10 ARMOR" },
            { id: "t4", label: "GREASE MNKY", req: 6, max: 1, desc: "Craft higher rarity gear.", bonus: "EPIC CRAFT" },
          ],
          [
            { id: "t5", label: "EDGERUNNER", req: 11, max: 2, desc: "Cyberware capacity raised.", bonus: "+4 SLOT CAP" },
            { id: "t6", label: "OVERCLOCK", req: 11, max: 3, desc: "Cyberware cooldowns reduced.", bonus: "-12% CD" },
          ],
          [
            { id: "t7", label: "CHROME GOD", req: 16, max: 1, desc: "Unlock legendary implants.", bonus: "LEGENDARY" },
            { id: "t8", label: "SELF-REPAIR", req: 16, max: 2, desc: "Implants auto-repair damage.", bonus: "AUTO HEAL" },
          ],
        ],
      },
      {
        id: "intel",
        name: "INTELLIGENCE",
        level: 12,
        text: "text-fuchsia-400",
        ring: "border-fuchsia-400/40",
        glow: "rgba(232,121,249,0.55)",
        perks: [
          [
            { id: "i1", label: "BUFFER", req: 3, max: 3, desc: "Increases RAM capacity.", bonus: "+3 RAM" },
            { id: "i2", label: "EXTENDED", req: 3, max: 2, desc: "Quickhack duration extended.", bonus: "+20% DURATION" },
          ],
          [
            { id: "i3", label: "BIOCONDUCT", req: 6, max: 2, desc: "RAM recovery accelerated.", bonus: "+2 RAM/S" },
            { id: "i4", label: "DAEMON", req: 6, max: 1, desc: "Upload daemons instantly.", bonus: "INSTANT" },
          ],
          [
            { id: "i5", label: "OVERCLOCK", req: 10, max: 3, desc: "Spend health as RAM.", bonus: "HP>RAM" },
            { id: "i6", label: "CONTAGION", req: 10, max: 2, desc: "Hacks spread to targets.", bonus: "+2 SPREAD" },
          ],
          [
            { id: "i7", label: "SUBLIMINAL", req: 14, max: 1, desc: "Hacks cost zero while hidden.", bonus: "0 RAM" },
            { id: "i8", label: "BLACKWALL", req: 14, max: 2, desc: "Forbidden ICE-breaker daemon.", bonus: "+45% HACK" },
          ],
        ],
      },
      {
        id: "cool",
        name: "COOL",
        level: 6,
        text: "text-emerald-400",
        ring: "border-emerald-400/40",
        glow: "rgba(52,211,153,0.55)",
        perks: [
          [
            { id: "c1", label: "COLD BLOOD", req: 3, max: 3, desc: "Buff after defeating an enemy.", bonus: "+10% SPEED" },
            { id: "c2", label: "GHOST", req: 3, max: 2, desc: "Reduced detection speed.", bonus: "-15% DETECT" },
          ],
          [
            { id: "c3", label: "SILENT RUN", req: 7, max: 2, desc: "Silent while crouch-sprinting.", bonus: "STEALTH" },
            { id: "c4", label: "DEADEYE", req: 7, max: 3, desc: "Headshot damage raised.", bonus: "+22% HEADSHOT" },
          ],
          [
            { id: "c5", label: "NINJUTSU", req: 11, max: 2, desc: "Stealth attack damage up.", bonus: "+35% STEALTH" },
            { id: "c6", label: "FROSTY SYN", req: 11, max: 3, desc: "Cold Blood stacks doubled.", bonus: "x2 STACKS" },
          ],
          [
            { id: "c7", label: "MERCILESS", req: 15, max: 1, desc: "Crits ignore enemy armor.", bonus: "ARMOR PIERCE" },
            { id: "c8", label: "IMMUNITY", req: 15, max: 2, desc: "Immune to bleed & poison.", bonus: "RESIST 100%" },
          ],
        ],
      },
    ],
    []
  );

  const TOTAL_POINTS = 18;
  const [ranks, setRanks] = useState({});
  const [hovered, setHovered] = useState(null);
  const [pending, setPending] = useState(null);
  const [cyber, setCyber] = useState({
    frontal: { id: "kereznikov", label: "KEREZNIKOV MK.4", rarity: "legendary" },
    ocular: { id: "kiroshi", label: "KIROSHI OPTICS", rarity: "epic" },
    arms: null,
    skeleton: { id: "titanium", label: "TITANIUM BONES", rarity: "rare" },
    nervous: null,
    circulatory: { id: "biomon", label: "BIOMONITOR", rarity: "uncommon" },
  });

  const spent = useMemo(
    () => Object.values(ranks).reduce((a, b) => a + b, 0),
    [ranks]
  );
  const available = TOTAL_POINTS - spent;

  const allPerks = useMemo(() => {
    const m = {};
    ATTRS.forEach((a) =>
      a.perks.forEach((tier) => tier.forEach((p) => (m[p.id] = { ...p, attr: a })))
    );
    return m;
  }, [ATTRS]);

  const stateOf = (attr, perk) => {
    const r = ranks[perk.id] || 0;
    if (r > 0) return "unlocked";
    if (attr.level >= perk.req && available > 0) return "available";
    return "locked";
  };

  const spend = (id) => {
    const p = allPerks[id];
    if (!p) return;
    if (p.attr.level < p.req) return;
    const r = ranks[id] || 0;
    if (r >= p.max || available <= 0) return;
    setRanks((prev) => ({ ...prev, [id]: r + 1 }));
    setPending(id);
    setTimeout(() => setPending(null), 600);
  };

  const hoverPerk = hovered ? allPerks[hovered] : null;

  const slots = [
    { id: "frontal", label: "FRONTAL CORTEX" },
    { id: "ocular", label: "OCULAR SYS" },
    { id: "arms", label: "ARMS" },
    { id: "skeleton", label: "SKELETON" },
    { id: "nervous", label: "NERVOUS SYS" },
    { id: "circulatory", label: "CIRCULATORY" },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-cyan-50 font-mono">
      {/* header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-neutral-900/80 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
            PERK / CYBERWARE MATRIX
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_12px_rgba(232,121,249,0.8)]" />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
          V // NIGHT CITY MERC · BUILD REV 2.077
        </span>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* branches */}
        <div className="flex-1 flex gap-2">
          {ATTRS.map((attr) => (
            <div
              key={attr.id}
              className={
                "flex-1 relative flex flex-col bg-neutral-900/85 backdrop-blur-md border " +
                attr.ring +
                " rounded-none overflow-clip"
              }
            >
              {/* animated spine */}
              <div className="pointer-events-none absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(0deg,transparent_0px,transparent_3px,#fff_3px,#fff_4px)]" />

              {/* branch header */}
              <div className="flex-none px-2 py-1.5 border-b border-cyan-400/20 bg-black/40 flex items-center justify-between">
                <span
                  className={
                    "text-[10px] font-bold uppercase tracking-[0.16em] truncate " + attr.text
                  }
                >
                  {attr.name}
                </span>
                <span className="text-[10px] font-medium tracking-[0.1em] text-neutral-400">
                  LV{attr.level}
                </span>
              </div>

              {/* tiers */}
              <div className="flex-1 flex flex-col justify-around py-2">
                {attr.perks.map((tier, ti) => {
                  const gated = attr.level < tier[0].req;
                  return (
                    <div key={ti} className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            "text-[9px] font-semibold uppercase tracking-[0.18em] " +
                            (gated ? "text-neutral-600" : "text-cyan-300/70")
                          }
                        >
                          TIER {ti + 1}
                        </span>
                        <span
                          className={
                            "text-[9px] tracking-[0.1em] " +
                            (gated ? "text-rose-500/80" : "text-neutral-500")
                          }
                        >
                          {gated ? "LOCK·" + tier[0].req : "OPEN"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5">
                        {tier.map((p) => {
                          const st = stateOf(attr, p);
                          return (
                            <div
                              key={p.id}
                              className={
                                "w-[3.9rem] h-[3.9rem] transition-all duration-200 ease-out " +
                                (pending === p.id ? "scale-110" : "scale-100")
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
                                <span className="font-bold tracking-widest uppercase">
                                  {p.label.slice(0, 5)}
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
          ))}
        </div>

        {/* rail */}
        <div className="w-[21rem] flex flex-col gap-2">
          {/* point spend control */}
          <div className="flex-none bg-neutral-900/85 backdrop-blur-md border border-yellow-300/40 rounded-none p-3 flex flex-col gap-2 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                POINT POOL
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-amber-300/70">
                {spent}/{TOTAL_POINTS} ALLOC
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-[6.5rem] h-[2.6rem]">
                <StatReadout value={available} tone={available > 0 ? "accent" : "danger"}>
                  <span className="flex flex-col">
                    <span className="text-[0.62em] tracking-[0.2em] text-cyan-300/70">FREE</span>
                  </span>
                </StatReadout>
              </div>
              <div className="w-[6.5rem] h-[2.6rem]">
                <StatReadout value={spent} tone="neutral">
                  <span className="flex flex-col">
                    <span className="text-[0.62em] tracking-[0.2em] text-cyan-300/70">SPENT</span>
                  </span>
                </StatReadout>
              </div>
              <div className="flex-1 h-[2.6rem]">
                <ActionButton
                  tone="accent"
                  disabled={!hoverPerk || available <= 0}
                  onPress={() => hoverPerk && spend(hoverPerk.id)}
                >
                  <span className="font-bold tracking-widest uppercase">SPEND</span>
                </ActionButton>
              </div>
            </div>
          </div>

          {/* tooltip */}
          <div className="flex-none bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] p-2">
            <div className="w-full h-[4.5rem]">
              <Tooltip
                open={!!hoverPerk}
                content={
                  hoverPerk ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                        {hoverPerk.label}
                      </span>
                      <span className="text-[11px] leading-snug text-cyan-100/80">
                        {hoverPerk.desc}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-fuchsia-400">
                        {hoverPerk.bonus} · RANK {(ranks[hoverPerk.id] || 0)}/{hoverPerk.max} · REQ{" "}
                        {hoverPerk.attr.name} {hoverPerk.req}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                      HOVER A NODE
                    </span>
                  )
                }
              >
                <div className="flex items-center px-1">
                  <span className="uppercase tracking-[0.15em] text-neutral-500">
                    {hoverPerk ? "SCANNING NODE…" : "NODE INSPECTOR // IDLE"}
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>

          {/* cyberware */}
          <div className="flex-1 bg-neutral-900/85 backdrop-blur-md border border-cyan-400/25 p-2 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
              CYBERWARE SLOTS
            </span>
            <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-1.5">
              {slots.map((s) => (
                <div key={s.id} className="w-full h-full">
                  <EquipmentSlot
                    slotId={s.id}
                    item={cyber[s.id]}
                    accepts={s.label}
                    onSelect={(id) =>
                      setCyber((p) => ({
                        ...p,
                        [id]: p[id] || { id: "blank-" + id, label: "SHARD SLOT", rarity: "common" },
                      }))
                    }
                    onClear={(id) => setCyber((p) => ({ ...p, [id]: null }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* reset */}
          <div className="flex-none h-[2.4rem]">
            <ActionButton
              tone="danger"
              disabled={spent === 0}
              onPress={() => {
                setRanks({});
                setHovered(null);
              }}
            >
              <span className="font-bold tracking-widest uppercase">RESET ALL POINTS</span>
            </ActionButton>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="flex-none h-7 px-3 flex items-center justify-between border-t border-cyan-400/20 bg-black/70">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70 truncate">
          ◤ RIPPERDOC LINK STABLE · BONUSES SYNCED TO HUD
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
          {hoverPerk ? hoverPerk.attr.name + " // " + hoverPerk.label : "AWAITING INPUT"}
        </span>
      </div>
    </div>
  );
}