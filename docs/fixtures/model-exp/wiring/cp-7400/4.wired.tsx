export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body 23.7 (MapCanvas floor 8 ok) + footer 1.75 = 27.7 ≤ 27.7
  // BUDGET width: padding 0.75 + controls 4.5 + gap 0.75 + map 84.2 (floor 11 ok) + padding 0 = 90.2 ≤ 90.2

  const districts = [
    { id: "wat", label: "WATSON", x: 0.24, y: 0.22 },
    { id: "wes", label: "WESTBROOK", x: 0.72, y: 0.27 },
    { id: "cit", label: "CITY CENTER", x: 0.46, y: 0.46 },
    { id: "hey", label: "HEYWOOD", x: 0.33, y: 0.71 },
    { id: "pac", label: "PACIFICA", x: 0.14, y: 0.83 },
    { id: "san", label: "SANTO DOMINGO", x: 0.78, y: 0.76 },
  ];

  const fastTravel = [
    { id: "ft-kabuki", x: 0.22, y: 0.16, label: "KABUKI TERMINAL" },
    { id: "ft-corpo", x: 0.5, y: 0.4, label: "CORPO PLAZA" },
    { id: "ft-japan", x: 0.78, y: 0.2, label: "JAPANTOWN N." },
    { id: "ft-vista", x: 0.13, y: 0.9, label: "VISTA DEL REY" },
    { id: "ft-arasaka", x: 0.86, y: 0.68, label: "ARASAKA WS." },
  ];

  const vendors = [
    { id: "vd-vik", x: 0.3, y: 0.3, label: "VIKTOR // RIPPERDOC" },
    { id: "vd-fing", x: 0.19, y: 0.78, label: "FINGERS // RIPPERDOC" },
    { id: "vd-wilson", x: 0.6, y: 0.6, label: "WILSON // GUNS" },
    { id: "vd-cassius", x: 0.69, y: 0.36, label: "CASSIUS // CLOTHES" },
  ];

  const quests = [
    {
      id: "q-heist",
      x: 0.55, y: 0.24, label: "THE HEIST",
      route: [{ x: 0.5, y: 0.4 }, { x: 0.52, y: 0.33 }, { x: 0.55, y: 0.24 }],
    },
    {
      id: "q-ghost",
      x: 0.38, y: 0.62, label: "GHOST TOWN",
      route: [{ x: 0.5, y: 0.4 }, { x: 0.44, y: 0.5 }, { x: 0.38, y: 0.62 }],
    },
    {
      id: "q-gig",
      x: 0.82, y: 0.52, label: "GIG: FLIGHT OF THE CHEETAH",
      route: [{ x: 0.5, y: 0.4 }, { x: 0.66, y: 0.44 }, { x: 0.82, y: 0.52 }],
    },
    {
      id: "q-monk",
      x: 0.2, y: 0.5, label: "GIG: SINNERMAN",
      route: [{ x: 0.5, y: 0.4 }, { x: 0.33, y: 0.44 }, { x: 0.2, y: 0.5 }],
    },
  ];

  const [zoom, setZoom] = useState(1.2);
  const [center, setCenter] = useState({ x: 0.5, y: 0.45 });
  const [tracked, setTracked] = useState("q-gig");
  const [selected, setSelected] = useState<string | null>("q-gig");
  const [pulse, setPulse] = useState(0);
  const [externalTracked, setExternalTracked] = useState<{ questId: string; location: { x: number; y: number } | null } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  useEffect(() => bus.on("Cyberpunk 2077: Quest Journal->Cyberpunk 2077: Night City Map", (data) => {
    if (data && data.tracked) {
      setExternalTracked({ questId: data.questId, location: data.location });
      setTracked(data.questId);
      setSelected(data.questId);
      if (data.location) {
        setCenter({ x: data.location.x, y: data.location.y });
      }
    } else {
      const untrackedId = data ? data.questId : null;
      setExternalTracked((prev) => {
        if (prev && untrackedId && prev.questId !== untrackedId) return prev;
        return null;
      });
      setTracked((prev) => {
        if (untrackedId && prev !== untrackedId) return prev;
        return "";
      });
      setSelected((prev) => {
        if (untrackedId && prev !== untrackedId) return prev;
        return null;
      });
    }
  }), []);

  const trackedQuest = useMemo(
    () => quests.find((q) => q.id === tracked) || quests[0],
    [tracked]
  );

  const externalMarker = useMemo(() => {
    if (!externalTracked || !externalTracked.location) return null;
    if (quests.some((q) => q.id === externalTracked.questId)) return null;
    return externalTracked;
  }, [externalTracked]);

  const externalRoute = useMemo(() => {
    if (!externalMarker || !externalMarker.location) return null;
    return [{ x: 0.5, y: 0.4 }, externalMarker.location];
  }, [externalMarker]);

  const clampZ = (z: number) => Math.min(3, Math.max(0.6, +z.toFixed(2)));
  const pan = (dx: number, dy: number) =>
    setCenter((c) => ({
      x: Math.min(1, Math.max(0, +(c.x + dx).toFixed(3))),
      y: Math.min(1, Math.max(0, +(c.y + dy).toFixed(3))),
    }));

  const onMarker = (id: string) => {
    setSelected(id);
    const q = quests.find((x) => x.id === id);
    if (q) {
      setTracked(id);
      setCenter({ x: q.x, y: q.y });
      bus.emit("Cyberpunk 2077: Night City Map->Cyberpunk 2077: Quest Journal", { questId: id });
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-cyan-50 font-mono">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center justify-between px-3 border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-fuchsia-400 animate-pulse">◈</span>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)]">
            Night City // Navigation Grid
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500 truncate">
            TRACKED
          </span>
          <span className="px-2 py-0.5 rounded-full border border-fuchsia-400/40 text-[0.6rem] uppercase tracking-[0.2em] text-fuchsia-300 truncate">
            {trackedQuest.label}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex flex-row gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* CONTROL RAIL */}
        <div className="w-[4.5rem] flex-none flex flex-col items-stretch gap-2">
          <div className="text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500 text-center leading-none">
            ZOOM
          </div>
          <div className="h-[1.75rem]">
            <ActionButton tone="accent" onPress={() => setZoom((z) => clampZ(z + 0.2))}>
              <span className="font-mono font-bold tracking-widest">+</span>
            </ActionButton>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => setZoom((z) => clampZ(z - 0.2))}>
              <span className="font-mono font-bold tracking-widest">−</span>
            </ActionButton>
          </div>
          <div className="rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] py-1 text-center">
            <span className="font-mono font-black tracking-tighter text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)] text-sm">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div className="text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500 text-center leading-none mt-1">
            PAN
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => pan(0, -0.08)}>
              <span className="font-mono font-bold tracking-widest">▲</span>
            </ActionButton>
          </div>
          <div className="flex flex-row gap-1">
            <div className="h-[1.75rem] flex-1">
              <ActionButton onPress={() => pan(-0.08, 0)}>
                <span className="font-mono font-bold">◀</span>
              </ActionButton>
            </div>
            <div className="h-[1.75rem] flex-1">
              <ActionButton onPress={() => pan(0.08, 0)}>
                <span className="font-mono font-bold">▶</span>
              </ActionButton>
            </div>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => pan(0, 0.08)}>
              <span className="font-mono font-bold tracking-widest">▼</span>
            </ActionButton>
          </div>
          <div className="h-[1.75rem] mt-auto">
            <ActionButton
              tone="danger"
              onPress={() => {
                setZoom(1.2);
                setCenter({ x: 0.5, y: 0.45 });
              }}
            >
              <span className="font-mono font-bold uppercase tracking-widest text-[0.7em]">RST</span>
            </ActionButton>
          </div>
        </div>

        {/* MAP */}
        <div className="flex-1 relative rounded-lg border border-cyan-400/25 shadow-[0_0_20px_-4px_rgba(34,211,238,0.35)] overflow-clip">
          <MapCanvas
            zoom={zoom}
            minZoom={0.6}
            maxZoom={3}
            center={center}
            onViewportChange={(v) => {
              setZoom(v.zoom);
              setCenter(v.center);
            }}
            regions={districts}
          >
            {externalRoute ? (
              <RoutePath points={externalRoute} active />
            ) : (
              <RoutePath points={trackedQuest.route} active />
            )}

            {fastTravel.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={{ x: m.x, y: m.y }}
                kind="fast-travel"
                label={m.label}
                active={selected === m.id}
                onSelect={(id) => setSelected(id)}
              />
            ))}

            {vendors.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={{ x: m.x, y: m.y }}
                kind="vendor"
                label={m.label}
                active={selected === m.id}
                onSelect={(id) => setSelected(id)}
              />
            ))}

            {quests.map((q) => (
              <MapMarker
                key={q.id}
                id={q.id}
                position={{ x: q.x, y: q.y }}
                kind="quest"
                label={q.label}
                active={tracked === q.id || selected === q.id}
                onSelect={onMarker}
              />
            ))}

            {externalMarker && externalMarker.location && (
              <MapMarker
                key={externalMarker.questId}
                id={externalMarker.questId}
                position={{ x: externalMarker.location.x, y: externalMarker.location.y }}
                kind="quest"
                label={externalMarker.questId}
                active
                onSelect={onMarker}
              />
            )}
          </MapCanvas>

          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[length:100%_3px] opacity-40" />
          <div
            className="pointer-events-none absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent transition-all duration-100"
            style={{ top: pulse + "%" }}
          />
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center justify-between gap-3 px-3 border-t border-cyan-400/20 bg-black/50">
        <div className="flex items-center gap-3 min-w-0 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cyan-300/70">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            FAST TRAVEL {fastTravel.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
            VENDORS {vendors.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-300 animate-pulse" />
            JOBS {quests.length}
          </span>
        </div>
        <div className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cyan-300/70 truncate">
          GRID {(center.x * 100).toFixed(0)}·{(center.y * 100).toFixed(0)} // ROUTE LOCKED
        </div>
      </div>
    </div>
  );
}