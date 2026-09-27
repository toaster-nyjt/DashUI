export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(attr chip 1.75 + 4 tiers x 3.5 = 14 + gaps 1.5) 17.25 ... body region flex-1 = 37.6 + footer 1.75 = 41.6 <= 41.6
  // BUDGET width: left rail 15 + gap 0.75 + 5 branches x 5.5(min node) = 27.5 + gaps 3 + right rail 15 = 61.25 <= 104.0

  type Perk = { id: string; abbr: string; label: string; bonus: string; maxRank: number };
  type Attr = { id: string; label: string; level: number; req: number[]; perks: Perk[] };

  const mk = (a: string, i: number, abbr: string, label: string, bonus: string, maxRank: number): Perk => ({
    id: a + "-" + i, abbr, label, bonus, maxRank,
  });

  const ATTRS: Attr[] = useMemo(() => ([
    {
      id: "bdy", label: "BODY", level: 12, req: [3, 7, 11, 15], perks: [
        mk("bdy", 0, "PNK", "PAINKILLER", "+12 MAX HEALTH", 3),
        mk("bdy", 1, "BRW", "BRAWLER", "+8% MELEE DMG", 2),
        mk("bdy", 2, "GLD", "GLADIATOR", "+15% BLOCK", 2),
        mk("bdy", 3, "STM", "STAMINA OS", "+20 STAMINA", 3),
        mk("bdy", 4, "WRK", "WRECKING", "+22% BLUNT DMG", 2),
        mk("bdy", 5, "IRN", "IRON LUNG", "-30% O2 DRAIN", 1),
        mk("bdy", 6, "UNS", "UNSHAKABLE", "IMMUNE STAGGER", 1),
        mk("bdy", 7, "JUG", "JUGGERNAUT", "+40 ARMOR", 1),
      ],
    },
    {
      id: "rfx", label: "REFLEXES", level: 16, req: [3, 7, 11, 15], perks: [
        mk("rfx", 0, "SLG", "SLIPPERY", "+10% EVADE", 3),
        mk("rfx", 1, "CRT", "CRIT WIRE", "+5% CRIT CHANCE", 3),
        mk("rfx", 2, "DSH", "AIR DASH", "UNLOCK AIR DASH", 1),
        mk("rfx", 3, "MTS", "MANTIS EDGE", "+18% BLADE DMG", 2),
        mk("rfx", 4, "RCL", "RECOIL NET", "-25% RECOIL", 2),
        mk("rfx", 5, "BLT", "BULLET TIME", "+2.0S SLOWMO", 1),
        mk("rfx", 6, "FLT", "FLYING DEATH", "+30% AIR CRIT", 1),
        mk("rfx", 7, "SND", "SANDEVISTAN", "+45% REFLEX OC", 1),
      ],
    },
    {
      id: "tec", label: "TECHNICAL", level: 9, req: [3, 7, 11, 15], perks: [
        mk("tec", 0, "FAB", "FABRICATOR", "-20% CRAFT COST", 3),
        mk("tec", 1, "SCR", "SCRAPPER", "+2 COMPONENTS", 2),
        mk("tec", 2, "MEC", "MECHANIC", "+15% SELL VALUE", 2),
        mk("tec", 3, "GRS", "GREASE MONK", "+10% TECH DMG", 2),
        mk("tec", 4, "EDG", "EDGERUNNER", "+1 CYBER CAP", 1),
        mk("tec", 5, "OVR", "OVERCLOCK", "+12% CHARGE", 2),
        mk("tec", 6, "CLD", "COLDBLOOD", "+8% ARMOR REGEN", 1),
        mk("tec", 7, "REN", "RENAISSANCE", "ALL CRAFT TIER V", 1),
      ],
    },
    {
      id: "int", label: "INTELLIGENCE", level: 20, req: [3, 7, 11, 15], perks: [
        mk("int", 0, "BFR", "BUFFER", "+2 RAM BUFFER", 3),
        mk("int", 1, "DMN", "DAEMON", "+2.0S HACK DUR", 3),
        mk("int", 2, "BRT", "BREACH", "+1 BREACH SLOT", 2),
        mk("int", 3, "SPR", "SPREAD", "+1 QUICKHACK JUMP", 2),
        mk("int", 4, "OVC", "OVERCHARGE", "+25% HACK DMG", 2),
        mk("int", 5, "BIO", "BIOCONDUCT", "+1 RAM / 6S", 1),
        mk("int", 6, "GST", "GHOST NET", "-35% TRACE", 1),
        mk("int", 7, "SBT", "SUBLIMINAL", "+50% CRIT HACK", 1),
      ],
    },
    {
      id: "cool", label: "COOL", level: 6, req: [3, 7, 11, 15], perks: [
        mk("cool", 0, "NRV", "NERVES", "+6% HEADSHOT", 3),
        mk("cool", 1, "STH", "STEALTH", "-20% DETECTION", 2),
        mk("cool", 2, "FCS", "FOCUS", "+12% SCOPE STEADY", 2),
        mk("cool", 3, "ASN", "ASSASSIN", "+15% DMG UNSEEN", 2),
        mk("cool", 4, "NIN", "NINJUTSU", "+25% TAKEDOWN", 1),
        mk("cool", 5, "CLM", "COLD CALM", "+10% RESIST", 2),
        mk("cool", 6, "VNS", "VANISH", "2S INVIS ON KILL", 1),
        mk("cool", 7, "REA", "REAPER", "+1 GRENADE SLOT", 1),
      ],
    },
  ]), []);

  const [ranks, setRanks] = useState<Record<string, number>>({ "rfx-0": 1, "int-0": 2, "bdy-0": 1 });
  const [committed, setCommitted] = useState(4);
  const [pool, setPool] = useState(11);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [log, setLog] = useState("SYSTEM READY // SELECT NODE TO ALLOCATE");
  const [slots, setSlots] = useState<Record<string, { id: string; label: string; rarity?: string } | null>>({
    "frontal": { id: "kere", label: "KERENZIKOV", rarity: "rare" },
    "arms": { id: "mantis", label: "MANTIS BLADES", rarity: "epic" },
    "os": { id: "sandy", label: "SANDEVISTAN MK4", rarity: "legendary" },
    "skel": null,
    "circ": { id: "bio", label: "BIOCONDUCTOR", rarity: "uncommon" },
    "nerv": null,
  });

  const spentTotal = useMemo(() => Object.values(ranks).reduce((a, b) => a + b, 0), [ranks]);
  const pending = spentTotal - committed;

  const tierOf = (i: number) => Math.floor(i / 2);

  const stateFor = (attr: Attr, perk: Perk, idx: number): "locked" | "available" | "unlocked" => {
    const t = tierOf(idx);
    const r = ranks[perk.id] || 0;
    if (r > 0) return "unlocked";
    if (attr.level < attr.req[t]) return "locked";
    if (t > 0) {
      const prevA = ranks[attr.id + "-" + (t - 1) * 2] || 0;
      const prevB = ranks[attr.id + "-" + ((t - 1) * 2 + 1)] || 0;
      if (prevA + prevB === 0) return "locked";
    }
    return "available";
  };

  const spend = (id: string) => {
    const attr = ATTRS.find((a) => id.startsWith(a.id))!;
    const idx = ATTRS.flatMap(() => []).length; // noop
    const perkIdx = attr.perks.findIndex((p) => p.id === id);
    const perk = attr.perks[perkIdx];
    const st = stateFor(attr, perk, perkIdx);
    const cur = ranks[id] || 0;
    if (st === "locked") { setLog("LOCKED // REQUIRES " + attr.label + " " + attr.req[tierOf(perkIdx)]); return; }
    if (cur >= perk.maxRank) { setLog("MAX RANK // " + perk.label); return; }
    if (pool <= 0) { setLog("INSUFFICIENT PERK POINTS // RESPEC TO RECLAIM"); return; }
    setRanks((r) => ({ ...r, [id]: cur + 1 }));
    setPool((p) => p - 1);
    setLog("ALLOCATED >> " + perk.label + " R" + (cur + 1) + " :: " + perk.bonus);
    void idx;
  };

  const commit = () => {
    if (pending <= 0) return;
    setCommitted(spentTotal);
    setLog("UPLINK >> " + pending + " PERK(S) FLUSHED TO HUD // BONUSES APPLIED");
  };

  const respec = () => {
    setPool((p) => p + spentTotal);
    setRanks({});
    setCommitted(0);
    setLog("RESPEC COMPLETE // " + spentTotal + " POINTS RECLAIMED");
  };

  const hovered = useMemo(() => {
    if (!hover) return null;
    for (const a of ATTRS) {
      const i = a.perks.findIndex((p) => p.id === hover.id);
      if (i >= 0) return { attr: a, perk: a.perks[i], idx: i };
    }
    return null;
  }, [hover, ATTRS]);

  const SLOT_DEF = [
    { id: "frontal", label: "FRONTAL CORTEX" },
    { id: "os", label: "OPERATING SYS" },
    { id: "arms", label: "ARMS" },
    { id: "skel", label: "SKELETON" },
    { id: "circ", label: "CIRCULATORY" },
    { id: "nerv", label: "NERVOUS SYS" },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 font-mono text-cyan-50">
      {/* header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-neutral-900/80 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-2 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_12px_rgba(232,121,249,0.8)] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 truncate">PERK // CYBERWARE MATRIX</span>
          <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 truncate">V.ARASAKA-NET // BUILD 2.77</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full border border-fuchsia-400/40 bg-neutral-800/70 text-[10px] uppercase tracking-[0.15em] text-fuchsia-300">{pending > 0 ? "UNCOMMITTED " + pending : "SYNCED"}</span>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-3 p-3 relative">
        {/* left rail */}
        <div className="w-[13rem] flex flex-col gap-3 border border-cyan-400/25 bg-neutral-900/85 backdrop-blur-md p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">ALLOCATION</div>
          <div className="w-full h-[5.5rem]">
            <StatReadout value={pool} tone="accent" delta={-pending}>
              <span className="flex flex-col">
                <span className="text-[0.4em] tracking-[0.3em] text-cyan-300/70">PERK POINTS</span>
              </span>
            </StatReadout>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-[3rem]">
              <StatReadout value={spentTotal} tone="neutral"><span className="text-[0.5em] tracking-[0.25em]">SPENT</span></StatReadout>
            </div>
            <div className="flex-1 h-[3rem]">
              <StatReadout value={committed} tone="accent"><span className="text-[0.5em] tracking-[0.25em]">LOCKED</span></StatReadout>
            </div>
          </div>
          <div className="w-full h-[2.5rem]">
            <ActionButton onPress={commit} disabled={pending <= 0} tone="accent">
              <span className="tracking-[0.2em]">COMMIT</span>
            </ActionButton>
          </div>
          <div className="w-full h-[2.5rem]">
            <ActionButton onPress={respec} disabled={spentTotal === 0} tone="danger">
              <span className="tracking-[0.2em]">RESPEC</span>
            </ActionButton>
          </div>
          <div className="flex-1 border border-cyan-400/20 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] p-2 flex flex-col justify-end gap-1">
            <div className="text-[10px] uppercase tracking-[0.15em] text-neutral-500">TIER GATES</div>
            {[0, 1, 2, 3].map((t) => (
              <div key={"g" + t} className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.15em] text-amber-300/70">T{t + 1}</span>
                <div className="flex-1 h-[3px] bg-black/60 border border-cyan-400/20">
                  <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-400 shadow-[0_0_8px_rgba(232,121,249,0.6)] transition-all duration-500" style={{ width: (25 + t * 22) + "%" }} />
                </div>
                <span className="text-[10px] text-cyan-200/70">LV{3 + t * 4}</span>
              </div>
            ))}
          </div>
        </div>

        {/* branches */}
        <div className="flex-1 flex gap-2">
          {ATTRS.map((attr) => (
            <div key={attr.id} className="flex-1 flex flex-col gap-2 border border-cyan-400/25 bg-gradient-to-b from-neutral-900/90 to-neutral-950/95 p-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-300 truncate">{attr.label}</span>
                <span className="px-2 py-[2px] rounded-full border border-fuchsia-400/40 bg-neutral-800/70 text-[10px] tracking-[0.12em] text-cyan-200/80">{attr.level}</span>
              </div>
              <div className="flex-1 flex flex-col relative">
                <div className="absolute left-1/2 top-2 bottom-2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-fuchsia-500/60 via-cyan-400/30 to-transparent" />
                {[0, 1, 2, 3].map((t) => {
                  const gated = attr.level < attr.req[t];
                  return (
                    <div key={attr.id + t} className="flex-1 flex items-center justify-center gap-2 relative">
                      <div className={"absolute left-0 right-0 top-1/2 h-[1px] " + (gated ? "bg-neutral-700/40" : "bg-cyan-400/25")} />
                      {[0, 1].map((k) => {
                        const idx = t * 2 + k;
                        const perk = attr.perks[idx];
                        const st = stateFor(attr, perk, idx);
                        return (
                          <div
                            key={perk.id}
                            className="relative z-10 w-[3.6rem] h-[3.6rem]"
                            onMouseMove={(e) => {
                              const host = e.currentTarget.closest("[data-body]") as HTMLElement | null;
                              if (!host) return;
                              const r = host.getBoundingClientRect();
                              setHover({ id: perk.id, x: e.clientX - r.left, y: e.clientY - r.top });
                            }}
                            onMouseLeave={() => setHover(null)}
                          >
                            <PerkNode
                              id={perk.id}
                              state={st}
                              rank={ranks[perk.id] || 0}
                              maxRank={perk.maxRank}
                              onSpend={spend}
                              hover={(id) => { if (id === null) setHover(null); }}
                            >
                              <span className="font-bold tracking-[0.1em] uppercase">{perk.abbr}</span>
                            </PerkNode>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* cyberware */}
        <div className="w-[15rem] flex flex-col gap-2 border border-yellow-300/40 bg-neutral-900/85 backdrop-blur-md p-3 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">CYBERWARE</span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">{Object.values(slots).filter(Boolean).length}/6</span>
          </div>
          <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2">
            {SLOT_DEF.map((s) => (
              <div key={s.id} className="flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-[0.12em] text-neutral-500 truncate">{s.label}</span>
                <div className="flex-1 min-h-[3.5rem]">
                  <EquipmentSlot
                    slotId={s.id}
                    item={slots[s.id]}
                    accepts="cyberware"
                    onSelect={(id) => setLog("SLOT SELECTED >> " + (slots[id]?.label || "EMPTY " + s.label))}
                    onClear={(id) => { setSlots((p) => ({ ...p, [id]: null })); setLog("EXTRACTED >> " + s.label); }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* tooltip layer */}
        <div data-body className="absolute inset-0 pointer-events-none">
          {hovered && hover && (
            <div
              className="absolute w-[15rem] h-[5.5rem] transition-opacity duration-150"
              style={{ left: Math.min(Math.max(hover.x - 120, 8), 1400) + "px", top: Math.max(hover.y - 96, 6) + "px" }}
            >
              <Tooltip
                open
                anchor={{ x: hover.x, y: hover.y }}
                content={
                  <span className="flex flex-col gap-[2px]">
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">{hovered.perk.label}</span>
                    <span className="text-[10px] uppercase tracking-[0.14em] text-fuchsia-300">{hovered.perk.bonus}</span>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                      RANK {(ranks[hovered.perk.id] || 0)}/{hovered.perk.maxRank} · REQ {hovered.attr.label} {hovered.attr.req[tierOf(hovered.idx)]}
                    </span>
                    <span className={"text-[10px] uppercase tracking-[0.12em] " + (stateFor(hovered.attr, hovered.perk, hovered.idx) === "locked" ? "text-rose-500" : "text-emerald-400")}>
                      {stateFor(hovered.attr, hovered.perk, hovered.idx)}
                    </span>
                  </span>
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* footer */}
      <div className="flex-none h-7 px-3 flex items-center justify-between gap-3 border-t border-cyan-400/20 bg-black/70">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70 truncate">{log}</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 truncate">POOL {pool} · SPENT {spentTotal}</span>
      </div>
    </div>
  );
}