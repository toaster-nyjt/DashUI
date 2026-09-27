export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + padding 0.75 + tabs 2 + gap 0.5 + list/detail region 20.4 + padding 0.75 + footer 1.75 = 28.4 → compact: body padding 0.5, gaps 0.5 → 2.25 + 0.5 + 2 + 0.5 + 20.2 + 0.5 + 1.75 = 27.7 ≤ 27.7
  // BUDGET width: padding 0.5 + questlist 32 + gap 0.75 + detail (StatReadout 3.5 min, holds 3 readouts 3×3.5=10.5 + gaps + ToggleSwitch 3.25 + ActionButton 3.5) 31.4 + padding 0.5 = 65.15 ≤ 65.9

  type Q = {
    id: string; title: string; objective?: string; district?: string; category?: string;
    rewardEddies?: number; rewardStreetCred?: number; tracked?: boolean; completed?: boolean;
    location?: { x: number; y: number } | null;
  };

  const [tab, setTab] = useState("main");
  const [quests, setQuests] = useState<Q[]>([
    { id: "q1", title: "The Heist", objective: "Retrieve the Relic from Konpeki Plaza", district: "Westbrook", category: "main", rewardEddies: 7500, rewardStreetCred: 320, tracked: true, location: { x: 0.72, y: 0.27 } },
    { id: "q2", title: "Play It Safe", objective: "Stop the Arasaka strike on Yorinobu", district: "Japantown", category: "main", rewardEddies: 5200, rewardStreetCred: 250, location: { x: 0.63, y: 0.34 } },
    { id: "q3", title: "Transmission", objective: "Enter the Voodoo Boys' net dive", district: "Pacifica", category: "main", rewardEddies: 6100, rewardStreetCred: 290, location: { x: 0.18, y: 0.68 } },
    { id: "q4", title: "Nocturne Op55N1", objective: "Decide V's final move with Hanako", district: "Corpo Plaza", category: "main", rewardEddies: 12000, rewardStreetCred: 600, location: { x: 0.48, y: 0.45 } },
    { id: "q5", title: "Chippin' In", objective: "Find Johnny's body with Rogue", district: "Badlands", category: "side", rewardEddies: 3000, rewardStreetCred: 180, location: { x: 0.88, y: 0.12 } },
    { id: "q6", title: "Riders on the Storm", objective: "Extract Saul from the Wraith camp", district: "Badlands", category: "side", rewardEddies: 2750, rewardStreetCred: 140, location: { x: 0.92, y: 0.22 } },
    { id: "q7", title: "Big in Japan", objective: "Escort Kiroshi tech out of Kabuki", district: "Watson", category: "side", rewardEddies: 1900, rewardStreetCred: 90, completed: true, location: { x: 0.55, y: 0.18 } },
    { id: "q8", title: "Sparking Violence", objective: "Neutralize the Maelstrom cell", district: "Northside", category: "gig", rewardEddies: 1400, rewardStreetCred: 70, location: { x: 0.6, y: 0.08 } },
    { id: "q9", title: "Flying Drugs", objective: "Intercept the Scav AV dropoff", district: "Santo Domingo", category: "gig", rewardEddies: 1650, rewardStreetCred: 85, location: { x: 0.42, y: 0.82 } },
    { id: "q10", title: "Hippocratic Oath", objective: "Exfil the ripperdoc from Arroyo", district: "Santo Domingo", category: "gig", rewardEddies: 1200, rewardStreetCred: 60, location: { x: 0.5, y: 0.88 } },
    { id: "q11", title: "Dirty Biz", objective: "Recover stolen shard from Tyger Claws", district: "Japantown", category: "gig", rewardEddies: 1750, rewardStreetCred: 95, location: { x: 0.66, y: 0.38 } },
  ]);
  const [selected, setSelected] = useState("q1");
  const [log, setLog] = useState("SYNCED // NET LINK STABLE");

  const tabs = useMemo(() => [
    { id: "main", label: "Main Jobs", count: quests.filter((q) => q.category === "main").length },
    { id: "side", label: "Side Jobs", count: quests.filter((q) => q.category === "side").length },
    { id: "gig", label: "Gigs", count: quests.filter((q) => q.category === "gig").length },
  ], [quests]);

  const visible = quests.filter((q) => q.category === tab);
  const active = quests.find((q) => q.id === selected) || visible[0];

  useEffect(() => {
    if (visible.length && !visible.some((q) => q.id === selected)) setSelected(visible[0].id);
  }, [tab]);

  const setTracked = (id: string, on: boolean) => {
    setQuests((prev) => prev.map((q) => ({ ...q, tracked: q.id === id ? on : on ? false : q.tracked })));
    setLog(on ? "TRACKING // ROUTE PLOTTED TO " + (quests.find((q) => q.id === id)?.district || "NC").toUpperCase() : "TRACKING DISENGAGED");
    const q = quests.find((x) => x.id === id);
    bus.emit("Cyberpunk 2077: Quest Journal->Cyberpunk 2077: Night City Map", {
      questId: id,
      tracked: on,
      location: on ? (q?.location ?? null) : null,
    });
  };

  const complete = (id: string) => {
    const q = quests.find((x) => x.id === id);
    if (!q) return;
    setQuests((prev) => prev.map((x) => (x.id === id ? { ...x, completed: true, tracked: false } : x)));
    setLog("PAYOUT // +" + (q.rewardEddies || 0) + " EB / +" + (q.rewardStreetCred || 0) + " SC");
    if (q.tracked) {
      bus.emit("Cyberpunk 2077: Quest Journal->Cyberpunk 2077: Night City Map", {
        questId: id,
        tracked: false,
        location: null,
      });
    }
    bus.emit("Cyberpunk 2077: Quest Journal->Cyberpunk 2077: V Vitals Status HUD", {
      questId: id,
      eddies: q.rewardEddies || 0,
      streetCred: q.rewardStreetCred || 0,
    });
  };

  useEffect(() => bus.on("Cyberpunk 2077: Night City Map->Cyberpunk 2077: Quest Journal", (data) => {
    const q = quests.find((x) => x.id === data.questId);
    if (!q) return;
    if (q.category) setTab(q.category);
    setSelected(q.id);
    setTracked(q.id, true);
  }), [quests]);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-cyan-50 font-mono">
      <div className="h-9 flex-none flex items-center justify-between px-3 border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-fuchsia-400 animate-pulse">◆</span>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)]">Quest Journal</span>
        </div>
        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-cyan-300/70 truncate">{log}</span>
      </div>

      <div className="flex-1 flex gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* LEFT: tabs + list */}
        <div className="flex-[1.35] flex flex-col gap-2">
          <div className="h-8 flex-none">
            <TabSelector options={tabs} value={tab} onChange={setTab} />
          </div>
          <div className="flex-1">
            <QuestList
              quests={visible}
              value={selected}
              onChange={setSelected}
              onActivate={(id) => setTracked(id, true)}
            />
          </div>
        </div>

        {/* RIGHT: detail */}
        <div className="flex-1 flex flex-col gap-2 rounded-lg border border-cyan-400/25 bg-zinc-900/80 backdrop-blur-sm p-2 shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)]">
          <div className="flex-none flex items-baseline justify-between gap-2">
            <span className="text-sm font-bold uppercase tracking-widest leading-tight text-cyan-50 truncate">
              {active ? active.title : "NO JOB"}
            </span>
            <span className="px-2 py-0.5 rounded-full border border-fuchsia-400/40 text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-300 truncate">
              {active?.district || "—"}
            </span>
          </div>

          {/* Objective Summary */}
          <div className="flex-none flex flex-col gap-1">
            <span className="text-[0.65rem] font-medium uppercase tracking-widest leading-none text-cyan-300/70">Objective</span>
            <div className="h-8">
              <StatReadout value={active?.objective || "—"} tone={active?.completed ? "neutral" : "accent"} />
            </div>
          </div>

          {/* Rewards */}
          <div className="flex-none flex flex-col gap-1">
            <span className="text-[0.65rem] font-medium uppercase tracking-widest leading-none text-cyan-300/70">Payout</span>
            <div className="flex gap-2">
              <div className="flex-1 h-9">
                <StatReadout value={active?.rewardEddies ?? 0} unit="EB" tone="accent" />
              </div>
              <div className="flex-1 h-9">
                <StatReadout value={active?.rewardStreetCred ?? 0} unit="SC" delta={active?.rewardStreetCred ? 1 : undefined} tone="warning" />
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Controls */}
          <div className="flex-none flex items-end gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[0.65rem] font-medium uppercase tracking-widest leading-none text-cyan-300/70">Track</span>
              <div className="h-7 w-full">
                <ToggleSwitch
                  on={!!active?.tracked}
                  disabled={!active || !!active.completed}
                  onChange={(on) => active && setTracked(active.id, on)}
                >
                  <span className="font-bold uppercase tracking-widest">{active?.tracked ? "ON" : "OFF"}</span>
                </ToggleSwitch>
              </div>
            </div>
            <div className="flex-1 h-8">
              <ActionButton
                tone={active?.completed ? "neutral" : "accent"}
                disabled={!active || !!active.completed}
                onPress={() => active && complete(active.id)}
              >
                <span className="font-bold uppercase tracking-widest">{active?.completed ? "CLEARED" : "COMPLETE"}</span>
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 border-t border-cyan-400/20 bg-black/50">
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cyan-300/70 truncate">
          {visible.length} ENTRIES / {quests.filter((q) => q.completed).length} CLEARED
        </span>
        <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)] truncate">
          {quests.find((q) => q.tracked)?.title || "NO ACTIVE TRACK"}
        </span>
      </div>
    </div>
  );
}