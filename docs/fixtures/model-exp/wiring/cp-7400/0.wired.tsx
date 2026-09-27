export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body pad 0.75 + body row 10.9 = 13.9 ≤ 13.9
  //   bars column inside body: 3 × StatBar 1.75 + 2 gaps 0.6 = 6.45 ≤ 10.9
  //   portrait 10.9 ≥ 4.5 floor; StatusEffectList 3.25 ≥ 2.75; SystemClock 2.5 ≥ 1.75
  // BUDGET width: pad 1.5 + portrait 7 + gap .75 + bars 40 + gap .75 + readouts (3×9 + 2×.5) = 28 + gap .75 + effects 26 + gap .75 + clock 11 = 116.3 ≤ 156.1

  // Attribute levels pushed from the Attributes & Perks Panel.
  const [body, setBody] = useState(12);
  const [reflexes, setReflexes] = useState(9);
  const [cool, setCool] = useState(10);

  // Max health scales with Body; base 200 + 20 per Body point above 3, plus cyberware bonus.
  const [implantHealth, setImplantHealth] = useState(0);
  const maxHealth = 200 + (body - 3) * 20 + implantHealth;

  const [health, setHealth] = useState(412);

  // Stamina/crit status derived from Reflexes and Cool.
  const staminaMax = 60 + reflexes * 4; // Reflexes raises stamina ceiling
  const critChance = Math.round(cool * 1.2); // Cool feeds crit status

  const [stamina, setStamina] = useState(78);
  const [cred, setCred] = useState(6400);
  const maxCred = 9000;

  // Armor is the sum of apparel armor and cyberware armor bonuses.
  const [apparelArmor, setApparelArmor] = useState(318);
  const [implantArmor, setImplantArmor] = useState(0);
  const armor = apparelArmor + implantArmor;

  const [level] = useState(34);
  const [eddies, setEddies] = useState(84210);
  const [now, setNow] = useState(Date.now());
  const [glitch, setGlitch] = useState(false);

  // Receive attribute allocations -> recompute Body/Reflexes/Cool derived stats.
  useEffect(
    () =>
      bus.on(
        "Cyberpunk 2077: Attributes & Perks Panel->Cyberpunk 2077: V Vitals Status HUD",
        (data) => {
          setBody(data.body);
          setReflexes(data.reflexes);
          setCool(data.cool);
        }
      ),
    []
  );

  // Receive cyberware bonuses -> extra armor + extra max health.
  useEffect(
    () =>
      bus.on(
        "Cyberpunk 2077: Cyberware Ripperdoc Loadout->Cyberpunk 2077: V Vitals Status HUD",
        (data) => {
          setImplantArmor(data.armor);
          setImplantHealth(data.health);
        }
      ),
    []
  );

  // Receive apparel armor rating -> Armor value display.
  useEffect(
    () =>
      bus.on(
        "Cyberpunk 2077: Weapons & Inventory Loadout->Cyberpunk 2077: V Vitals Status HUD",
        (data) => {
          setApparelArmor(data.armor);
        }
      ),
    []
  );

  // Receive quest completion rewards -> increment eddies + advance Street Cred bar.
  useEffect(
    () =>
      bus.on(
        "Cyberpunk 2077: Quest Journal->Cyberpunk 2077: V Vitals Status HUD",
        (data) => {
          setEddies((e) => e + data.eddies);
          setCred((c) => Math.min(maxCred, c + data.streetCred));
        }
      ),
    []
  );

  // Keep current health within the (possibly changed) max.
  useEffect(() => {
    setHealth((h) => Math.min(h, maxHealth));
  }, [maxHealth]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setStamina((s) => Math.max(18, Math.min(staminaMax, s + (Math.random() * 24 - 9))));
      setHealth((h) => Math.max(120, Math.min(maxHealth, h + (Math.random() * 30 - 12))));
      setCred((c) => Math.min(maxCred, c + Math.random() * 40));
    }, 1600);
    return () => clearInterval(t);
  }, [staminaMax, maxHealth]);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 180);
    }, 5200);
    return () => clearInterval(t);
  }, []);

  const effects = useMemo(
    () => [
      { id: "fx1", label: "Overclock", icon: "⚡", stacks: 2, remaining: 44, tone: "buff" as const },
      { id: "fx2", label: "Bleeding", icon: "🩸", remaining: 12, tone: "debuff" as const },
      { id: "fx3", label: "Berserk", icon: "☠", stacks: 1, remaining: 26, tone: "buff" as const },
      { id: "fx4", label: "Burn", icon: "🔥", remaining: 8, tone: "debuff" as const },
      { id: "fx5", label: "Second Heart", icon: "❤", stacks: 1, tone: "buff" as const },
    ],
    []
  );

  const hpTone = health / maxHealth < 0.3 ? "danger" : health / maxHealth < 0.6 ? "warning" : "accent";

  const Row = (props: { label: string; children: React.ReactNode; accent: string }) => (
    <div className="flex items-center gap-2">
      <span
        className={
          "w-24 text-[0.6rem] font-semibold uppercase tracking-[0.2em] leading-none " + props.accent
        }
      >
        {props.label}
      </span>
      <div className="flex-1 h-[1.75rem]">{props.children}</div>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-cyan-50 font-mono relative">
      {/* scanline sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(34,211,238,0.14) 0px, rgba(34,211,238,0.14) 1px, transparent 1px, transparent 4px)",
        }}
      />
      <div
        className={
          "pointer-events-none absolute inset-0 transition-opacity duration-150 " +
          (glitch ? "opacity-100" : "opacity-0")
        }
        style={{
          background:
            "linear-gradient(90deg, rgba(232,121,249,0.14), transparent 30%, rgba(34,211,238,0.14) 60%, transparent)",
        }}
      />

      <div className="flex-none h-9 px-3 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-transparent relative">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-fuchsia-400 animate-pulse">◈</span>
          <span
            className={
              "text-xs font-bold uppercase tracking-[0.25em] text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)] truncate " +
              (glitch ? "translate-x-[2px] skew-x-6" : "")
            }
          >
            V // VITALS STATUS LINK
          </span>
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-cyan-300/70 truncate">
          BIOMON · SANDEVISTAN SYNC NOMINAL
        </span>
      </div>

      <div className="flex-1 p-3 flex items-stretch gap-3 relative min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Portrait */}
        <div className="w-[7rem] h-full relative">
          <CharacterPortrait src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=400" alt="V" />
          <div className="pointer-events-none absolute -inset-px border border-fuchsia-400/40 rounded-lg shadow-[0_0_18px_-4px_rgba(232,121,249,0.6)]" />
        </div>

        {/* Bars */}
        <div className="flex-1 h-full flex flex-col justify-center gap-2 px-3 bg-black/60 border border-cyan-400/15 rounded-md shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
          <Row label="Health" accent="text-rose-400">
            <StatBar value={Math.round(health)} max={maxHealth} tone={hpTone as any} showNumeric />
          </Row>
          <Row label="Stamina" accent="text-cyan-300/80">
            <StatBar value={Math.round(stamina)} max={staminaMax} segments={10} tone="neutral" />
          </Row>
          <Row label="St. Cred" accent="text-orange-400">
            <StatBar value={Math.round(cred)} max={maxCred} tone="accent" showNumeric />
          </Row>
        </div>

        {/* Readouts */}
        <div className="w-[28rem] h-full grid grid-cols-3 gap-2">
          {[
            { k: "ARMOR", node: <StatReadout value={armor} unit="AP" delta={12} tone="accent" /> },
            { k: "CRIT", node: <StatReadout value={critChance} unit="%" tone="neutral" /> },
            { k: "EDDIES", node: <StatReadout value={eddies.toLocaleString()} unit="€$" delta={340} tone="neutral" /> },
          ].map((r) => (
            <div
              key={r.k}
              className="h-full flex flex-col justify-center gap-1 px-2 bg-zinc-900/80 backdrop-blur-sm border border-cyan-400/25 rounded-lg shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)] transition-all duration-200 hover:border-yellow-300/70"
            >
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-cyan-300/70 leading-none">{r.k}</span>
              <div className="h-[3.25rem]">{r.node}</div>
            </div>
          ))}
        </div>

        {/* Status effects */}
        <div className="w-[26rem] h-full flex flex-col justify-center gap-1 px-2 bg-black/60 border border-cyan-400/15 rounded-md shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-fuchsia-400 leading-none">
            ACTIVE EFFECTS
          </span>
          <div className="h-[3.5rem]">
            <StatusEffectList effects={effects} />
          </div>
        </div>

        {/* Clock */}
        <div className="w-[11rem] h-full flex flex-col justify-center gap-1 px-2 bg-zinc-900/80 border border-cyan-400/25 rounded-lg shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)]">
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-cyan-300/70 leading-none">
            NC LOCAL
          </span>
          <div className="h-[2.75rem]">
            <SystemClock time={now} format="24h" />
          </div>
        </div>
      </div>
    </div>
  );
}