export default function GeneratedComponent() {
  // BUDGET height: header 2.75 + map 24.95 = 27.7 ≤ 27.7
  // BUDGET width: map 90.2 (markers 2x2 placed on surface) = 90.2 ≤ 90.2

  const [zoom, setZoom] = useState(1.2);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [activeId, setActiveId] = useState<string>("q-heist");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const districts = [
    { id: "watson", label: "WATSON", x: 0.28, y: 0.24 },
    { id: "westbrook", label: "WESTBROOK", x: 0.7, y: 0.3 },
    { id: "citycenter", label: "CITY CENTER", x: 0.48, y: 0.5 },
    { id: "heywood", label: "HEYWOOD", x: 0.33, y: 0.68 },
    { id: "pacifica", label: "PACIFICA", x: 0.14, y: 0.82 },
    { id: "santodomingo", label: "SANTO DOMINGO", x: 0.78, y: 0.74 },
    { id: "badlands", label: "BADLANDS", x: 0.9, y: 0.14 },
  ];

  const markers = [
    { id: "ft-kabuki", kind: "fast-travel", label: "KABUKI TERMINAL", x: 0.26, y: 0.2 },
    { id: "ft-corpo", kind: "fast-travel", label: "CORPO PLAZA", x: 0.52, y: 0.46 },
    { id: "ft-jig", kind: "fast-travel", label: "JIG-JIG ST.", x: 0.36, y: 0.33 },
    { id: "ft-rancho", kind: "fast-travel", label: "RANCHO CORONADO", x: 0.82, y: 0.7 },
    { id: "ft-coast", kind: "fast-travel", label: "COASTVIEW", x: 0.12, y: 0.86 },
    { id: "vd-ripper", kind: "vendor", label: "RIPPERDOC — VIKTOR", x: 0.22, y: 0.3 },
    { id: "vd-ripper2", kind: "vendor", label: "RIPPERDOC — FINGERS", x: 0.64, y: 0.28 },
    { id: "vd-arms", kind: "vendor", label: "WEAPON VENDOR", x: 0.45, y: 0.66 },
    { id: "vd-drop", kind: "vendor", label: "DROP POINT", x: 0.72, y: 0.55 },
    { id: "vd-clothes", kind: "vendor", label: "CLOTHING — JINGUJI", x: 0.6, y: 0.4 },
    { id: "q-heist", kind: "quest", label: "THE HEIST // KONPEKI PLAZA", x: 0.68, y: 0.22 },
    { id: "q-gig1", kind: "gig", label: "GIG: FLYING DRUGS", x: 0.3, y: 0.58 },
    { id: "q-gig2", kind: "gig", label: "GIG: BACKS AGAINST THE WALL", x: 0.86, y: 0.8 },
    { id: "q-ncpd", kind: "gig", label: "NCPD SCANNER HUSTLE", x: 0.18, y: 0.66 },
  ];

  const playerPos = { x: 0.42, y: 0.52 };
  const active = markers.find((m) => m.id === activeId);
  const routePoints = useMemo(() => {
    if (!active) return [];
    const mx = (playerPos.x + active.x) / 2;
    const my = Math.min(0.94, Math.max(0.06, (playerPos.y + active.y) / 2 + 0.08));
    return [
      playerPos,
      { x: mx, y: playerPos.y },
      { x: mx, y: my },
      { x: active.x, y: my },
      { x: active.x, y: active.y },
    ];
  }, [activeId]);

  const nudge = (dx: number, dy: number) =>
    setCenter((c) => ({
      x: Math.min(1, Math.max(0, c.x + dx)),
      y: Math.min(1, Math.max(0, c.y + dy)),
    }));

  const chip =
    "px-2 py-[2px] text-[10px] font-black tracking-[0.2em] uppercase border border-[#fcee0a]/40 text-[#fcee0a] bg-[#fcee0a]/10";

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07070a] text-[#fcee0a] font-mono relative">
      <style>{`
        @keyframes ncScan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
        @keyframes ncFlick { 0%,92%,100%{opacity:1} 94%{opacity:.35} 96%{opacity:.85} }
        @keyframes ncSlide { 0%{background-position:0 0} 100%{background-position:48px 48px} }
      `}</style>

      {/* CHROME */}
      <header className="flex-none h-[2.75rem] flex items-stretch gap-3 px-3 border-b-2 border-[#fcee0a] bg-[#0d0d12]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[#ff2a6d] text-lg leading-none" style={{ animation: "ncFlick 3s infinite" }}>◤</span>
          <span className="text-[13px] font-black tracking-[0.3em] uppercase truncate">Night City // Navigation</span>
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 border-l border-[#fcee0a]/25 pl-3">
          <span className="text-[9px] tracking-[0.25em] text-[#fcee0a]/50 uppercase">Tracked</span>
          <span className="text-[11px] font-bold tracking-[0.15em] text-[#00f0ff] truncate">
            {active ? active.label : "— NO TARGET —"}
          </span>
          <span className={chip}>{(zoom * 100).toFixed(0)}%</span>
          <span className="hidden md:inline text-[9px] tracking-[0.25em] text-[#fcee0a]/40 truncate">
            {"X " + center.x.toFixed(2) + "  Y " + center.y.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-[3.5rem] h-[1.75rem]">
            <ActionButton tone="accent" onPress={() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(2)))}>
              <span className="font-black tracking-[0.15em]">ZM+</span>
            </ActionButton>
          </div>
          <div className="w-[3.5rem] h-[1.75rem]">
            <ActionButton tone="accent" onPress={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))}>
              <span className="font-black tracking-[0.15em]">ZM−</span>
            </ActionButton>
          </div>
          <div className="w-[3.5rem] h-[1.75rem]">
            <ActionButton onPress={() => nudge(-0.08, 0)}><span className="font-black">◀</span></ActionButton>
          </div>
          <div className="w-[3.5rem] h-[1.75rem]">
            <ActionButton onPress={() => nudge(0.08, 0)}><span className="font-black">▶</span></ActionButton>
          </div>
          <div className="w-[3.5rem] h-[1.75rem]">
            <ActionButton onPress={() => nudge(0, -0.08)}><span className="font-black">▲</span></ActionButton>
          </div>
          <div className="w-[3.5rem] h-[1.75rem]">
            <ActionButton onPress={() => nudge(0, 0.08)}><span className="font-black">▼</span></ActionButton>
          </div>
          <div className="w-[3.5rem] h-[1.75rem]">
            <ActionButton
              tone="danger"
              onPress={() => {
                setZoom(1.2);
                setCenter(active ? { x: active.x, y: active.y } : { x: 0.5, y: 0.5 });
              }}
            >
              <span className="font-black tracking-[0.1em]">CNTR</span>
            </ActionButton>
          </div>
        </div>
      </header>

      {/* MAP */}
      <div className="flex-1 relative bg-[#07070a] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(#fcee0a22 1px,transparent 1px),linear-gradient(90deg,#fcee0a22 1px,transparent 1px)",
            backgroundSize: "48px 48px",
            animation: "ncSlide 7s linear infinite",
          }}
        />
        <div className="absolute inset-0 p-2">
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
            <RoutePath points={routePoints} active={true} />
            {markers.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={{ x: m.x, y: m.y }}
                kind={m.kind}
                label={m.label}
                active={m.id === activeId}
                onSelect={(id) => {
                  setActiveId(id);
                  const t = markers.find((k) => k.id === id);
                  if (t) setCenter({ x: t.x, y: t.y });
                }}
              />
            ))}
          </MapCanvas>
        </div>
        <div
          className="absolute inset-x-0 h-14 pointer-events-none"
          style={{
            background: "linear-gradient(180deg,transparent,#00f0ff22,transparent)",
            animation: "ncScan 5s linear infinite",
          }}
        />
        <div className="absolute left-2 bottom-2 flex gap-2 pointer-events-none">
          <span className={chip} style={{ borderColor: "#00f0ff66", color: "#00f0ff" }}>{"◆ FAST TRAVEL"}</span>
          <span className={chip}>{"● VENDOR"}</span>
          <span className={chip} style={{ borderColor: "#ff2a6d66", color: "#ff2a6d" }}>{"▲ JOB / GIG"}</span>
        </div>
        <div className="absolute right-3 bottom-2 text-[9px] tracking-[0.3em] text-[#fcee0a]/35 pointer-events-none uppercase">
          {"NETRUNNER LINK ▓" + "▒".repeat(1 + (pulse % 4)) + " STABLE"}
        </div>
      </div>
    </div>
  );
}