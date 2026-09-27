export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body 33.35 (map/rail, flex-1) + footer 1.75 = 37.35 ≤ 38.1
  // BUDGET width: map region 48.0 + gap 0.5 + zoom rail 2.5 + padding 1.0 = 52.0 ≤ 52.0
  // primitive floors: MapCanvas 12x9 (has ~48x33), ZoomControl 2.25x7.5 (has 2.5x8), MapMarker 2x2, RouteOverlay 4x4, Tooltip 7x2 (9x2.5)

  const regions = [
    { id: "wat", label: "WATSON", bounds: { x: 0.05, y: 0.06, w: 0.36, h: 0.3 } },
    { id: "cen", label: "CITY CENTER", bounds: { x: 0.44, y: 0.2, w: 0.28, h: 0.26 } },
    { id: "wes", label: "WESTBROOK", bounds: { x: 0.74, y: 0.08, w: 0.22, h: 0.34 } },
    { id: "hey", label: "HEYWOOD", bounds: { x: 0.3, y: 0.5, w: 0.3, h: 0.28 } },
    { id: "pac", label: "PACIFICA", bounds: { x: 0.05, y: 0.62, w: 0.22, h: 0.3 } },
    { id: "sto", label: "SANTO DOMINGO", bounds: { x: 0.64, y: 0.54, w: 0.3, h: 0.34 } },
  ];

  const quests = [
    { id: "q1", label: "THE HEIST", sub: "MAIN JOB // KONPEKI PLAZA", district: "City Center", position: { x: 0.55, y: 0.3 }, dist: 1.4 },
    { id: "q2", label: "SECOND CONFLICT", sub: "GIG // ARMS DEAL", district: "Watson", position: { x: 0.21, y: 0.19 }, dist: 3.2 },
    { id: "q3", label: "GHOST TOWN", sub: "SIDE JOB // BADLANDS EDGE", district: "Pacifica", position: { x: 0.14, y: 0.76 }, dist: 6.8 },
    { id: "q4", label: "CYBERPSYCHO", sub: "NCPD // HOSTILE SIGNAL", district: "Santo Domingo", position: { x: 0.79, y: 0.7 }, dist: 4.1 },
    { id: "q5", label: "CHIPPIN' IN", sub: "MAIN JOB // EBUNIKE", district: "Heywood", position: { x: 0.44, y: 0.62 }, dist: 2.3 },
  ];

  const fastTravel = [
    { id: "ft1", label: "FT // MEGABUILDING H10", position: { x: 0.34, y: 0.4 } },
    { id: "ft2", label: "FT // CORPO PLAZA", position: { x: 0.66, y: 0.24 } },
    { id: "ft3", label: "FT // GRAND IMPERIAL MALL", position: { x: 0.11, y: 0.88 } },
    { id: "ft4", label: "FT // ARASAKA WATERFRONT", position: { x: 0.88, y: 0.82 } },
  ];

  const player = { x: 0.35, y: 0.45 };

  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState("q1");
  const [tracked, setTracked] = useState("q1");
  const [hovered, setHovered] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const trackedQuest = useMemo(() => quests.find((q) => q.id === tracked) || null, [tracked]);

  const routePoints = useMemo(() => {
    if (!trackedQuest) return [];
    const t = trackedQuest.position;
    const mid1 = { x: player.x + (t.x - player.x) * 0.35, y: player.y + (t.y - player.y) * 0.1 };
    const mid2 = { x: player.x + (t.x - player.x) * 0.6, y: player.y + (t.y - player.y) * 0.75 };
    return [player, mid1, mid2, t];
  }, [tracked]);

  const hoveredEntity = useMemo(() => {
    if (!hovered) return null;
    const q = quests.find((x) => x.id === hovered);
    if (q) return { label: q.label, sub: q.sub, position: q.position, kind: "QUEST" };
    const f = fastTravel.find((x) => x.id === hovered);
    if (f) return { label: f.label, sub: "FAST TRAVEL TERMINAL // ONLINE", position: f.position, kind: "TERMINAL" };
    return null;
  }, [hovered]);

  const selectMarker = (id) => {
    setSelected(id);
    if (quests.some((q) => q.id === id)) {
      setTracked(id);
      const q = quests.find((x) => x.id === id);
      if (q) setCenter({ x: q.position.x, y: q.position.y });
    }
  };

  const sel = quests.find((q) => q.id === selected) || fastTravel.find((f) => f.id === selected);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-cyan-50 font-mono">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center justify-between gap-3 px-3 border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-neutral-900/80 to-transparent">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 bg-amber-300 rounded-full animate-pulse shadow-[0_0_12px_rgba(252,211,77,0.8)]" />
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 truncate">NIGHT CITY // NAVGRID</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
          <span className="px-2 py-1 border border-fuchsia-400/40 rounded-full bg-neutral-800/70 text-fuchsia-300">
            {quests.length} GIGS
          </span>
          <span className="text-amber-300/80">ZOOM {zoom.toFixed(1)}x</span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex gap-2 p-2 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 relative border border-cyan-400/25 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <MapCanvas
            regions={regions}
            center={center}
            zoom={zoom}
            onViewChange={(v) => {
              setCenter(v.center);
              setZoom(v.zoom);
            }}
          >
            <RouteOverlay points={routePoints} visible={!!trackedQuest} distance={trackedQuest ? trackedQuest.dist : 0} />
            {fastTravel.map((f) => (
              <MapMarker
                key={f.id}
                id={f.id}
                position={f.position}
                kind="fast-travel"
                state={selected === f.id ? "selected" : "default"}
                onSelect={selectMarker}
                onHover={setHovered}
              />
            ))}
            {quests.map((q) => (
              <MapMarker
                key={q.id}
                id={q.id}
                position={q.position}
                kind="quest"
                state={tracked === q.id ? "tracked" : selected === q.id ? "selected" : "default"}
                onSelect={selectMarker}
                onHover={setHovered}
              />
            ))}
          </MapCanvas>

          {/* scan sweep */}
          <div className="pointer-events-none absolute inset-0 overflow-clip">
            <div
              className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent transition-all duration-100 ease-linear"
              style={{ top: pulse + "%" }}
            />
            <div className="absolute inset-0 border border-cyan-300/10" />
            <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-cyan-300/60" />
            <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-cyan-300/60" />
            <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-cyan-300/60" />
            <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-cyan-300/60" />
          </div>

          {/* TOOLTIP */}
          {hoveredEntity ? (
            <div
              className="pointer-events-none absolute z-20 w-[11rem] h-[3rem]"
              style={{
                left: "calc(" + hoveredEntity.position.x * 100 + "% - 5.5rem)",
                top: "calc(" + hoveredEntity.position.y * 100 + "% - 4rem)",
              }}
            >
              <Tooltip
                open={true}
                anchor={{ x: hoveredEntity.position.x, y: hoveredEntity.position.y }}
                content={
                  <div className="leading-tight">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200 truncate">
                      {hoveredEntity.label}
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.15em] text-amber-300/80 truncate">
                      {hoveredEntity.sub}
                    </div>
                  </div>
                }
              />
            </div>
          ) : null}
        </div>

        {/* ZOOM RAIL */}
        <div className="flex-none w-[2.5rem] flex flex-col items-center justify-center gap-2">
          <div className="w-[2.5rem] h-[9rem]">
            <ZoomControl
              value={zoom}
              min={0.5}
              max={4}
              step={0.25}
              onChange={(z) => setZoom(z)}
              onReset={() => {
                setZoom(1);
                setCenter({ x: 0.5, y: 0.5 });
              }}
            />
          </div>
          <div className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 [writing-mode:vertical-rl] rotate-180">
            GRID SCALE
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center justify-between gap-3 px-3 border-t border-cyan-400/20 bg-black/70">
        <div className="flex-1 min-w-0 text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70 truncate">
          {sel ? "SEL // " + sel.label : "NO TARGET SELECTED"}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-cyan-300/80">
          {trackedQuest ? "ROUTE " + trackedQuest.dist.toFixed(1) + " KM" : "ROUTE OFFLINE"}
        </div>
      </div>
    </div>
  );
}