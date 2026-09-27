export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + map region 34.1 (≥ MapCanvas 8) + footer 1.75 = 38.1 ≤ 38.1
  // BUDGET width: map region 59.0 (≥ MapCanvas 10; overlays ZoomPanControls 2.5 + KeyLegend 6 float inside) = 59.0 ≤ 59.0

  const MIN_Z = 1;
  const MAX_Z = 4;

  const [zoom, setZoom] = useState(1.4);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [selected, setSelected] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);

  const player = { x: 0.42, y: 0.62 };
  const waypoint = { x: 0.71, y: 0.28 };

  const districts = [
    { id: "d-watson", label: "WATSON", x: 0.58, y: 0.2 },
    { id: "d-westbrook", label: "WESTBROOK", x: 0.8, y: 0.45 },
    { id: "d-heywood", label: "HEYWOOD", x: 0.33, y: 0.72 },
    { id: "d-citycenter", label: "CITY CENTER", x: 0.5, y: 0.45 },
    { id: "d-pacifica", label: "PACIFICA", x: 0.16, y: 0.86 },
    { id: "d-badlands", label: "BADLANDS", x: 0.86, y: 0.85 },
  ];

  const markers = [
    { id: "q-heist", label: "THE HEIST", kind: "quest" as const, x: 0.62, y: 0.31 },
    { id: "q-ripper", label: "RIPPERDOC: VIKTOR", kind: "poi" as const, x: 0.46, y: 0.55 },
    { id: "q-gig", label: "GIG: CYBERPSYCHO", kind: "quest" as const, x: 0.27, y: 0.4 },
    { id: "q-vendor", label: "NETRUNNER SHOP", kind: "poi" as const, x: 0.72, y: 0.64 },
    { id: "q-race", label: "STREET RACE", kind: "poi" as const, x: 0.2, y: 0.66 },
    { id: "q-sideline", label: "SIDE JOB: JUDY", kind: "quest" as const, x: 0.84, y: 0.22 },
  ];

  const route = [
    player,
    { x: 0.5, y: 0.55 },
    { x: 0.55, y: 0.42 },
    { x: 0.64, y: 0.36 },
    waypoint,
  ];

  const selectMarker = (id: string) => {
    setSelected(id);
    setPulse(true);
    const m = markers.find((k) => k.id === id);
    if (m) setCenter({ x: m.x, y: m.y });
  };

  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(false), 700);
    return () => clearTimeout(t);
  }, [pulse]);

  const active = markers.find((m) => m.id === selected);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#0a0a0f_60%)] text-cyan-50">
      <div className="flex-none h-9 px-3 flex items-center justify-between border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)]">
        <span className="font-mono font-bold tracking-[0.25em] uppercase text-cyan-100 text-sm drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
          NIGHT CITY / NAVGRID
        </span>
        <span
          className={
            "font-mono tracking-[0.2em] uppercase text-[10px] text-fuchsia-400 " +
            (pulse ? "animate-pulse" : "")
          }
        >
          {active ? "TARGET // " + active.label : "WAYPOINT ACTIVE"}
        </span>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapCanvas
            center={center}
            zoom={zoom}
            minZoom={MIN_Z}
            maxZoom={MAX_Z}
            onViewChange={(v) => {
              setCenter(v.center);
              setZoom(v.zoom);
            }}
          >
            <RouteOverlay points={route} animated tone="accent" />
            {districts.map((d) => (
              <MapMarker
                key={d.id}
                id={d.id}
                position={{ x: d.x, y: d.y }}
                kind="district"
                label={d.label}
              />
            ))}
            {markers.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={{ x: m.x, y: m.y }}
                kind={m.kind}
                label={m.label}
                active={selected === m.id}
                onSelect={selectMarker}
              />
            ))}
            <MapMarker
              id="waypoint"
              position={waypoint}
              kind="waypoint"
              label="TRACKED"
              active
            />
            <MapMarker
              id="player"
              position={player}
              kind="player"
              label="V"
              heading={38}
            />
          </MapCanvas>
        </div>

        <div className="absolute top-3 right-3 w-[2.5rem] h-[6.5rem]">
          <ZoomPanControls
            zoom={zoom}
            minZoom={MIN_Z}
            maxZoom={MAX_Z}
            onZoomChange={(z) => setZoom(z)}
            onRecenter={() => {
              setCenter(player);
              setZoom(1.4);
              setSelected(null);
            }}
          />
        </div>

        <div className="absolute bottom-3 left-3 w-[11rem] h-[7rem] rounded-lg border border-cyan-400/30 bg-[#0d0d14]/95 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] backdrop-blur-sm p-2 shadow-[0_0_20px_rgba(34,211,238,0.15),0_0_40px_rgba(217,70,239,0.08)]">
          <KeyLegend
            entries={[
              { id: "l1", label: "QUEST", kind: "quest" },
              { id: "l2", label: "POI", kind: "poi" },
              { id: "l3", label: "PLAYER", kind: "player" },
              { id: "l4", label: "WAYPOINT", kind: "waypoint" },
            ]}
          />
        </div>
      </div>

      <div className="flex-none h-7 px-3 flex items-center justify-between border-t border-cyan-500/20 bg-black/50 font-mono tracking-wider uppercase text-[10px] text-cyan-400/70">
        <span>ZOOM {zoom.toFixed(1)}×</span>
        <span className="truncate px-2">
          GRID {center.x.toFixed(2)} / {center.y.toFixed(2)}
        </span>
        <span className="text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]">
          ROUTE SYNCED
        </span>
      </div>
    </div>
  );
}