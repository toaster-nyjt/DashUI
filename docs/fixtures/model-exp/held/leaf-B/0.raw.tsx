export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body(MapCanvas 33.1 ≥ 8) + footer 1.75 + padding 1.0 = 38.1 ≤ 38.1
  // BUDGET width: padding 1.0 + MapCanvas 47.9 + gap 0.75 + ZoomControl 2.35 = 52.0 ≤ 52.0

  const regions = [
    { id: "watson", label: "WATSON", bounds: { x: 0.06, y: 0.08, w: 0.34, h: 0.3 } },
    { id: "westbrook", label: "WESTBROOK", bounds: { x: 0.46, y: 0.05, w: 0.42, h: 0.28 } },
    { id: "citycenter", label: "CITY CENTER", bounds: { x: 0.3, y: 0.38, w: 0.3, h: 0.26 } },
    { id: "heywood", label: "HEYWOOD", bounds: { x: 0.04, y: 0.44, w: 0.22, h: 0.3 } },
    { id: "pacifica", label: "PACIFICA", bounds: { x: 0.08, y: 0.76, w: 0.36, h: 0.2 } },
    { id: "santodomingo", label: "SANTO DOMINGO", bounds: { x: 0.62, y: 0.4, w: 0.32, h: 0.34 } },
    { id: "badlands", label: "BADLANDS", bounds: { x: 0.5, y: 0.78, w: 0.44, h: 0.18 } },
  ];

  const quests = [
    { id: "q-heist", label: "THE HEIST", kind: "main", position: { x: 0.36, y: 0.46 }, note: "MAIN JOB // AFTERLIFE" },
    { id: "q-ripper", label: "CHROME FEVER", kind: "gig", position: { x: 0.18, y: 0.24 }, note: "GIG // KABUKI" },
    { id: "q-voodoo", label: "VOODOO SIGNAL", kind: "gig", position: { x: 0.2, y: 0.85 }, note: "GIG // PACIFICA" },
    { id: "q-convoy", label: "DUST CONVOY", kind: "side", position: { x: 0.74, y: 0.86 }, note: "SIDE // BADLANDS" },
    { id: "q-tower", label: "ARASAKA UPLINK", kind: "main", position: { x: 0.64, y: 0.18 }, note: "MAIN JOB // WESTBROOK" },
  ];

  const fastTravel = [
    { id: "ft-1", label: "NCART KABUKI", position: { x: 0.28, y: 0.14 }, note: "FAST TRAVEL // ONLINE" },
    { id: "ft-2", label: "NCART CORPO PLAZA", position: { x: 0.5, y: 0.55 }, note: "FAST TRAVEL // ONLINE" },
    { id: "ft-3", label: "NCART VISTA DEL REY", position: { x: 0.12, y: 0.62 }, note: "FAST TRAVEL // ONLINE" },
    { id: "ft-4", label: "NCART ARROYO", position: { x: 0.82, y: 0.62 }, note: "FAST TRAVEL // LOCKED" },
  ];

  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [zoom, setZoom] = useState(1.2);
  const [selected, setSelected] = useState<string | null>("q-heist");
  const [tracked, setTracked] = useState<string | null>("q-heist");
  const [hovered, setHovered] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const trackedQuest = useMemo(() => quests.find((q) => q.id === tracked) || null, [tracked]);

  const routePoints = useMemo(() => {
    if (!trackedQuest) return [];
    return [
      { x: 0.5, y: 0.55 },
      { x: (0.5 + trackedQuest.position.x) / 2, y: (0.55 + trackedQuest.position.y) / 2 - 0.06 },
      trackedQuest.position,
    ];
  }, [trackedQuest]);

  const routeDistance = useMemo(() => {
    let d = 0;
    for (let i = 1; i < routePoints.length; i++) {
      const dx = routePoints[i].x - routePoints[i - 1].x;
      const dy = routePoints[i].y - routePoints[i - 1].y;
      d += Math.sqrt(dx * dx + dy * dy);
    }
    return Math.round(d * 1240) / 100;
  }, [routePoints]);

  const all = useMemo(
    () => [
      ...quests.map((q) => ({ ...q, ft: false })),
      ...fastTravel.map((f) => ({ ...f, kind: "fast-travel", ft: true })),
    ],
    []
  );

  const hoverItem = all.find((m) => m.id === hovered) || null;
  const selectedItem = all.find((m) => m.id === selected) || null;

  const handleSelect = (id: string) => {
    setSelected(id);
    const item = all.find((m) => m.id === id);
    if (item && !item.ft) {
      setTracked(id);
      setCenter(item.position);
      setZoom((z) => Math.min(3, Math.max(1.4, z)));
    } else if (item) {
      setCenter(item.position);
    }
  };

  const markerState = (id: string): "default" | "selected" | "tracked" | "locked" => {
    if (id === "ft-4") return "locked";
    if (id === tracked) return "tracked";
    if (id === selected) return "selected";
    return "default";
  };

  const anchorFor = (p: { x: number; y: number }) => ({
    x: Math.min(0.82, Math.max(0.08, 0.5 + (p.x - center.x) * zoom)) * 100,
    y: Math.min(0.86, Math.max(0.06, 0.5 + (p.y - center.y) * zoom)) * 100,
  });

  const tipAnchor = hoverItem ? anchorFor(hoverItem.position) : { x: 50, y: 50 };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 font-mono text-cyan-50">
      <div className="h-9 flex-none px-3 flex items-center justify-between border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-neutral-900/80 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-block h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]"
            style={{ opacity: 0.35 + 0.65 * Math.abs(Math.sin(pulse / 6)) }}
          />
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200 truncate">
            NIGHT CITY // TACTICAL GRID
          </span>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 truncate">
          ZOOM {zoom.toFixed(1)}× · {String(Math.round(center.x * 1000)).padStart(3, "0")}/
          {String(Math.round(center.y * 1000)).padStart(3, "0")}
        </span>
      </div>

      <div className="flex-1 flex gap-3 p-2">
        <div className="relative flex-1 border border-cyan-400/25 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
          <MapCanvas
            regions={regions}
            center={center}
            zoom={zoom}
            onViewChange={(v) => {
              setCenter(v.center);
              setZoom(v.zoom);
            }}
          >
            <RouteOverlay points={routePoints} visible={!!trackedQuest} distance={routeDistance} />
            {quests.map((q) => (
              <MapMarker
                key={q.id}
                id={q.id}
                position={q.position}
                kind={q.kind}
                state={markerState(q.id)}
                onSelect={handleSelect}
                onHover={setHovered}
              />
            ))}
            {fastTravel.map((f) => (
              <MapMarker
                key={f.id}
                id={f.id}
                position={f.position}
                kind="fast-travel"
                state={markerState(f.id)}
                onSelect={handleSelect}
                onHover={setHovered}
              />
            ))}
          </MapCanvas>

          <div
            className="pointer-events-none absolute z-20 transition-all duration-200 ease-out"
            style={{ left: tipAnchor.x + "%", top: tipAnchor.y + "%", width: "13rem", height: "3.25rem" }}
          >
            <Tooltip
              open={!!hoverItem}
              anchor={{ x: 0, y: 0 }}
              content={
                <span className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                    {hoverItem ? hoverItem.label : ""}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-amber-300/80">
                    {hoverItem ? hoverItem.note : ""}
                  </span>
                </span>
              }
            />
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                TRACKING
              </span>
              <span className="border border-cyan-400/25 bg-neutral-900/85 px-2 py-1 text-xs font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-sm">
                {trackedQuest ? trackedQuest.label : "— NO ROUTE —"}
              </span>
            </div>
            <span className="rounded-full border border-fuchsia-400/40 bg-neutral-800/70 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-fuchsia-300 backdrop-blur-sm">
              {trackedQuest ? routeDistance.toFixed(2) + " KM" : "IDLE"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center" style={{ width: "2.35rem" }}>
          <div style={{ width: "2.35rem", height: "8.5rem" }}>
            <ZoomControl
              value={zoom}
              min={0.6}
              max={3}
              step={0.2}
              onChange={(z) => setZoom(z)}
              onReset={() => {
                setZoom(1.2);
                setCenter({ x: 0.5, y: 0.5 });
              }}
            />
          </div>
        </div>
      </div>

      <div className="h-7 flex-none px-3 flex items-center justify-between gap-3 border-t border-cyan-400/20 bg-black/70">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70 truncate">
          {selectedItem ? "SEL // " + selectedItem.label + " · " + selectedItem.note : "SEL // NONE"}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400 truncate">
          {quests.length} JOBS · {fastTravel.length} NCART
        </span>
      </div>
    </div>
  );
}