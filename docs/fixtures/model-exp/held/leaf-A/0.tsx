export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + pad 0.75 + map 32.1 + pad 0.75 + footer 1.75 = 37.6 ≤ 38.1
  // BUDGET width: pad 0.75 + map 47.5 + gap 0.75 + zoom 2.25 + pad 0.75 = 52.0 ≤ 52.0

  const regions = [
    { id: "wc", label: "WATSON", bounds: { x: 0.06, y: 0.08, w: 0.34, h: 0.3 } },
    { id: "cc", label: "CITY CENTER", bounds: { x: 0.42, y: 0.22, w: 0.26, h: 0.28 } },
    { id: "hw", label: "HEYWOOD", bounds: { x: 0.3, y: 0.55, w: 0.3, h: 0.3 } },
    { id: "pa", label: "PACIFICA", bounds: { x: 0.04, y: 0.58, w: 0.22, h: 0.3 } },
    { id: "sm", label: "SANTO DOMINGO", bounds: { x: 0.66, y: 0.5, w: 0.28, h: 0.38 } },
    { id: "wl", label: "WESTBROOK", bounds: { x: 0.7, y: 0.08, w: 0.26, h: 0.32 } },
  ];

  const quests = [
    { id: "q-heist", label: "THE HEIST", sub: "Konpeki Plaza // Main Job", pos: { x: 0.52, y: 0.31 }, district: "CITY CENTER" },
    { id: "q-ghost", label: "GHOST SIGNAL", sub: "Kabuki Market // Gig", pos: { x: 0.19, y: 0.2 }, district: "WATSON" },
    { id: "q-riptide", label: "RIPTIDE", sub: "Grand Imperial // Side Job", pos: { x: 0.12, y: 0.73 }, district: "PACIFICA" },
    { id: "q-chrome", label: "CHROME DEBT", sub: "Vista del Rey // Gig", pos: { x: 0.44, y: 0.69 }, district: "HEYWOOD" },
    { id: "q-blackwall", label: "BLACKWALL ECHO", sub: "Arasaka Wharf // Main Job", pos: { x: 0.79, y: 0.66 }, district: "SANTO DOMINGO" },
    { id: "q-jade", label: "JADE CIRCUIT", sub: "Japantown // Side Job", pos: { x: 0.82, y: 0.21 }, district: "WESTBROOK" },
  ];

  const fastTravel = [
    { id: "ft-01", label: "FT // LITTLE CHINA", sub: "Fast Travel Terminal", pos: { x: 0.31, y: 0.12 } },
    { id: "ft-02", label: "FT // CORPO PLAZA", sub: "Fast Travel Terminal", pos: { x: 0.63, y: 0.44 } },
    { id: "ft-03", label: "FT // EL COYOTE", sub: "Fast Travel Terminal", pos: { x: 0.35, y: 0.82 } },
    { id: "ft-04", label: "FT // MEGABUILDING H4", sub: "Fast Travel Terminal", pos: { x: 0.9, y: 0.44 } },
  ];

  const all = useMemo(
    () => [
      ...quests.map((q) => ({ ...q, kind: "quest" as const })),
      ...fastTravel.map((f) => ({ ...f, kind: "fasttravel" as const })),
    ],
    []
  );

  const [zoom, setZoom] = useState(1.2);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [selected, setSelected] = useState<string | null>("q-heist");
  const [tracked, setTracked] = useState<string | null>("q-heist");
  const [hovered, setHovered] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const trackedNode = all.find((m) => m.id === tracked) || null;
  const origin = { x: 0.31, y: 0.12 };
  const routePoints = trackedNode
    ? [
        origin,
        { x: (origin.x + trackedNode.pos.x) / 2, y: origin.y + 0.13 },
        { x: trackedNode.pos.x - 0.05, y: (origin.y + trackedNode.pos.y) / 2 + 0.06 },
        trackedNode.pos,
      ]
    : [];

  const dist = trackedNode
    ? Math.round(
        Math.hypot(trackedNode.pos.x - origin.x, trackedNode.pos.y - origin.y) * 1000
      ) / 100
    : 0;

  const hoverNode = all.find((m) => m.id === hovered) || null;

  const handleSelect = (id: string) => {
    setSelected(id);
    const n = all.find((m) => m.id === id);
    if (n) {
      setTracked(id);
      setCenter(n.pos);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-neutral-950 via-black to-neutral-900 text-cyan-50 font-mono">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center gap-3 px-3 border-b border-cyan-400/25 bg-gradient-to-r from-cyan-500/15 via-neutral-900/80 to-transparent">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
          NIGHT CITY // NAVGRID
        </span>
        <span className="h-[2px] flex-1 bg-gradient-to-r from-cyan-400/60 via-fuchsia-500/30 to-transparent" />
        <span
          className="text-[10px] font-medium uppercase tracking-[0.15em] text-fuchsia-400"
          style={{ opacity: 0.45 + 0.55 * Math.abs(Math.sin(pulse / 8)) }}
        >
          ● LINK ACTIVE
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
          Z{zoom.toFixed(1)}x
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* MAP STAGE */}
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
            <RouteOverlay points={routePoints} visible={!!trackedNode} distance={dist} />
            {all.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={m.pos}
                kind={m.kind}
                state={
                  m.id === tracked
                    ? "tracked"
                    : m.id === selected
                    ? "selected"
                    : "default"
                }
                onSelect={handleSelect}
                onHover={setHovered}
              />
            ))}
          </MapCanvas>

          {/* scan sweep */}
          <div
            className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent"
            style={{ left: (pulse % 100) + "%", transform: "translateX(-100%)" }}
          />
          <div className="pointer-events-none absolute inset-0 border border-cyan-300/10" />
          <div className="pointer-events-none absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-cyan-300/70" />
          <div className="pointer-events-none absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-fuchsia-400/70" />
          <div className="pointer-events-none absolute left-0 bottom-0 h-4 w-4 border-l-2 border-b-2 border-fuchsia-400/70" />
          <div className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 border-r-2 border-b-2 border-cyan-300/70" />

          {/* TOOLTIP */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: "calc(" + (hoverNode ? hoverNode.pos.x * 100 : 50) + "% )",
              top: "calc(" + (hoverNode ? hoverNode.pos.y * 100 : 50) + "% - 4.5rem)",
              width: "13rem",
              height: "3.5rem",
              transform: "translateX(-50%)",
            }}
          >
            <Tooltip
              open={!!hoverNode}
              content={
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                    {hoverNode ? hoverNode.label : ""}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-amber-300/80">
                    {hoverNode ? hoverNode.sub : ""}
                  </span>
                </div>
              }
              anchor={hoverNode ? hoverNode.pos : { x: 0.5, y: 0.5 }}
            />
          </div>
        </div>

        {/* ZOOM RAIL */}
        <div className="flex-none flex flex-col items-center justify-center gap-2" style={{ width: "2.25rem" }}>
          <div style={{ width: "2.25rem", height: "9rem" }}>
            <ZoomControl
              value={zoom}
              min={0.5}
              max={4}
              step={0.25}
              onChange={setZoom}
              onReset={() => {
                setZoom(1.2);
                setCenter({ x: 0.5, y: 0.5 });
              }}
            />
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-cyan-400/40 via-fuchsia-500/30 to-transparent" />
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center gap-3 px-3 border-t border-cyan-400/20 bg-black/70">
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70 truncate">
          {trackedNode ? "TRACKING :: " + trackedNode.label : "NO ROUTE SET"}
        </span>
        <span className="h-px flex-1 bg-amber-300/20" />
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-cyan-300/80">
          {dist.toFixed(2)} KM
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
          {quests.length} GIGS / {fastTravel.length} FT
        </span>
      </div>
    </div>
  );
}