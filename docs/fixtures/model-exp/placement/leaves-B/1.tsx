export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + gap 0.75 + body(map 30.35 / rail: ZoomPanControls 6.5 + gap 0.75 + KeyLegend 3.2 + slack) + gap 0.75 + footer 1.75 = 35.85 ≤ 38.1
  // BUDGET width: pad 0.75 + map 44.5 + gap 0.75 + rail 11.5 + pad 0.75 = 58.25 ≤ 59.0

  const [zoom, setZoom] = useState(1.15);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [selected, setSelected] = useState<string | null>("q-heist");
  const [pulse, setPulse] = useState(false);
  const [scan, setScan] = useState(0);

  const player = { x: 0.38, y: 0.62 };

  const districts = [
    { id: "d-watson", label: "WATSON", x: 0.52, y: 0.2 },
    { id: "d-westbrook", label: "WESTBROOK", x: 0.78, y: 0.36 },
    { id: "d-citycenter", label: "CITY CENTER", x: 0.46, y: 0.45 },
    { id: "d-heywood", label: "HEYWOOD", x: 0.3, y: 0.62 },
    { id: "d-pacifica", label: "PACIFICA", x: 0.14, y: 0.82 },
    { id: "d-santodomingo", label: "SANTO DOMINGO", x: 0.72, y: 0.76 },
  ];

  const quests = [
    { id: "q-heist", label: "THE HEIST", kind: "quest" as const, x: 0.6, y: 0.28 },
    { id: "q-ghost", label: "GHOST TOWN", kind: "quest" as const, x: 0.17, y: 0.74 },
    { id: "q-chippin", label: "CHIPPIN' IN", kind: "quest" as const, x: 0.81, y: 0.55 },
    { id: "p-ripper", label: "RIPPERDOC", kind: "poi" as const, x: 0.43, y: 0.52 },
    { id: "p-fixer", label: "FIXER: PADRE", kind: "poi" as const, x: 0.33, y: 0.68 },
    { id: "p-vendor", label: "NETRUNNER SHOP", kind: "poi" as const, x: 0.67, y: 0.7 },
  ];

  const target = quests.find((q) => q.id === selected) || null;

  const route = useMemo(() => {
    if (!target) return [];
    const mx = (player.x + target.x) / 2;
    const my = (player.y + target.y) / 2;
    return [
      { x: player.x, y: player.y },
      { x: mx + 0.06, y: player.y - 0.03 },
      { x: mx + 0.02, y: my },
      { x: target.x - 0.04, y: my - 0.05 },
      { x: target.x, y: target.y },
    ];
  }, [selected]);

  useEffect(() => {
    if (!target) return;
    setPulse(true);
    setCenter({ x: (player.x + target.x) / 2, y: (player.y + target.y) / 2 });
    const t = setTimeout(() => setPulse(false), 700);
    return () => clearTimeout(t);
  }, [selected]);

  useEffect(() => {
    const i = setInterval(() => setScan((s) => (s + 1) % 100), 90);
    return () => clearInterval(i);
  }, []);

  const dist = target
    ? (Math.hypot(target.x - player.x, target.y - player.y) * 8.4).toFixed(2)
    : "0.00";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-zinc-950 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#0a0a0f_60%)] text-cyan-50">
      <div className="h-9 flex-none flex items-center justify-between px-3 border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)]">
        <span className="font-mono font-bold tracking-[0.25em] uppercase text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)] text-sm truncate">
          NIGHT CITY // NETMAP
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-fuchsia-400 animate-pulse">
          ▮ LIVE FEED {String(scan).padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex-1 relative rounded-lg border border-cyan-400/30 overflow-clip shadow-[0_0_20px_rgba(34,211,238,0.15),0_0_40px_rgba(217,70,239,0.08)]">
          <div className="absolute inset-0">
            <MapCanvas
              center={center}
              zoom={zoom}
              minZoom={0.8}
              maxZoom={3}
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
              {quests.map((q) => (
                <MapMarker
                  key={q.id}
                  id={q.id}
                  position={{ x: q.x, y: q.y }}
                  kind={q.kind}
                  label={q.label}
                  active={selected === q.id}
                  onSelect={setSelected}
                />
              ))}
              <MapMarker id="player" position={player} kind="player" label="V" heading={45} />
              {target && (
                <MapMarker
                  id="waypoint"
                  position={{ x: target.x, y: target.y }}
                  kind="waypoint"
                  label={target.label}
                  active
                />
              )}
            </MapCanvas>
          </div>
          <div
            className={
              "pointer-events-none absolute inset-0 transition-all duration-500 " +
              (pulse ? "ring-2 ring-fuchsia-400/60" : "ring-1 ring-cyan-400/20")
            }
          />
          <div
            className="pointer-events-none absolute left-0 right-0 h-8 bg-[linear-gradient(180deg,rgba(34,211,238,0)_0%,rgba(34,211,238,0.10)_50%,rgba(34,211,238,0)_100%)]"
            style={{ top: scan + "%" }}
          />
        </div>

        <div className="w-[11.5rem] flex flex-col gap-3">
          <div className="rounded-lg border border-cyan-400/30 bg-[#0d0d14]/95 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] backdrop-blur-sm p-3 flex flex-col items-center gap-2">
            <span className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-[10px]">
              NAV CTRL
            </span>
            <div className="w-[2.5rem] h-[6.5rem]">
              <ZoomPanControls
                zoom={zoom}
                minZoom={0.8}
                maxZoom={3}
                onZoomChange={setZoom}
                onRecenter={() => {
                  setCenter(player);
                  setZoom(1.15);
                }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-cyan-400/30 bg-[#0d0d14]/95 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] backdrop-blur-sm p-3 flex flex-col gap-2">
            <span className="font-mono font-semibold tracking-[0.2em] uppercase text-cyan-300/80 text-[10px]">
              KEY
            </span>
            <div className="w-full h-[6.5rem]">
              <KeyLegend
                entries={[
                  { id: "k-quest", label: "MAIN JOB", kind: "quest" },
                  { id: "k-poi", label: "POINT OF INT", kind: "poi" },
                  { id: "k-player", label: "V // YOU", kind: "player" },
                  { id: "k-way", label: "WAYPOINT", kind: "waypoint" },
                  { id: "k-dist", label: "DISTRICT", kind: "district" },
                ]}
              />
            </div>
          </div>

          <div className="flex-1 rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] p-2 flex flex-col justify-center gap-1">
            <span className="font-mono font-medium tracking-wider uppercase text-slate-400 text-[10px]">
              TRACKED
            </span>
            <span
              className={
                "font-mono font-bold tracking-wider uppercase text-yellow-300 text-[11px] leading-tight truncate drop-shadow-[0_0_8px_rgba(253,224,71,0.6)] " +
                (pulse ? "animate-pulse" : "")
              }
            >
              {target ? target.label : "NONE"}
            </span>
            <span className="font-mono tracking-wide text-[10px] text-cyan-300/80">
              DIST {dist} KM
            </span>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none flex items-center justify-between px-3 border-t border-cyan-500/20 bg-black/50 font-mono tracking-wider uppercase text-[10px] text-cyan-400/70">
        <span className="truncate">
          GRID {center.x.toFixed(2)} / {center.y.toFixed(2)} · ZOOM ×{zoom.toFixed(2)}
        </span>
        <span className="text-fuchsia-400 truncate">
          {quests.length} SIGNALS · ROUTE {target ? "ACTIVE" : "IDLE"}
        </span>
      </div>
    </div>
  );
}