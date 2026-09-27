export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + gap 0.4 + body(map 25.05 / rail 5×1.75=8.75 + gaps 1.6 = 10.35) = 27.7 ≤ 27.7
  // BUDGET width: rail 5 + gap 0.5 + map 84.7 = 90.2 ≤ 90.2

  const [zoom, setZoom] = useState(1.2);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [selected, setSelected] = useState("q_hf");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 1000), 90);
    return () => clearInterval(t);
  }, []);

  const districts = useMemo(
    () => [
      { id: "wat", label: "WATSON", x: 0.32, y: 0.24 },
      { id: "wes", label: "WESTBROOK", x: 0.74, y: 0.3 },
      { id: "ctr", label: "CITY CENTER", x: 0.47, y: 0.47 },
      { id: "hey", label: "HEYWOOD", x: 0.3, y: 0.68 },
      { id: "pac", label: "PACIFICA", x: 0.12, y: 0.82 },
      { id: "std", label: "SANTO DOMINGO", x: 0.74, y: 0.76 },
      { id: "bad", label: "BADLANDS", x: 0.88, y: 0.12 },
    ],
    []
  );

  const markers = useMemo(
    () => [
      { id: "ft_kabuki", kind: "fast-travel", label: "KABUKI MARKET", position: { x: 0.3, y: 0.2 } },
      { id: "ft_corpo", kind: "fast-travel", label: "CORPO PLAZA", position: { x: 0.5, y: 0.44 } },
      { id: "ft_jig", kind: "fast-travel", label: "JIG-JIG ST.", position: { x: 0.37, y: 0.31 } },
      { id: "ft_glen", kind: "fast-travel", label: "THE GLEN", position: { x: 0.34, y: 0.64 } },
      { id: "ft_grand", kind: "fast-travel", label: "GRAND IMPERIAL", position: { x: 0.14, y: 0.8 } },
      { id: "vn_vik", kind: "ripperdoc", label: "VIKTOR VEKTOR", position: { x: 0.26, y: 0.28 } },
      { id: "vn_fing", kind: "ripperdoc", label: "FINGERS M.D.", position: { x: 0.41, y: 0.35 } },
      { id: "vn_wak", kind: "vendor", label: "WAKAKO'S OFFICE", position: { x: 0.68, y: 0.27 } },
      { id: "vn_gun", kind: "vendor", label: "2ND AMENDMENT", position: { x: 0.62, y: 0.55 } },
      { id: "vn_rip", kind: "ripperdoc", label: "CASSIUS RYDER", position: { x: 0.79, y: 0.72 } },
      { id: "q_hf", kind: "quest", label: "THE HEIST — KONPEKI", position: { x: 0.71, y: 0.38 } },
      { id: "q_gig1", kind: "gig", label: "GIG: BACKS AGAINST THE WALL", position: { x: 0.2, y: 0.55 } },
      { id: "q_gig2", kind: "gig", label: "GIG: SR. SPACE HOLDINGS", position: { x: 0.85, y: 0.62 } },
      { id: "q_gig3", kind: "gig", label: "GIG: HOT MERCHANDISE", position: { x: 0.56, y: 0.7 } },
      { id: "q_main", kind: "quest", label: "PLAY IT SAFE", position: { x: 0.1, y: 0.86 } },
    ],
    []
  );

  const tracked = markers.find((m) => m.id === selected) || markers[0];

  const route = useMemo(() => {
    return [
      { x: 0.5, y: 0.44 },
      { x: 0.56, y: 0.41 },
      { x: 0.62, y: 0.43 },
      { x: tracked.position.x, y: tracked.position.y },
    ];
  }, [tracked]);

  const clampZ = (z: number) => Math.min(3, Math.max(0.6, +z.toFixed(2)));
  const pan = (dx: number, dy: number) =>
    setCenter((c) => ({
      x: Math.min(1, Math.max(0, +(c.x + dx).toFixed(3))),
      y: Math.min(1, Math.max(0, +(c.y + dy).toFixed(3))),
    }));

  const selectMarker = (id: string) => {
    const m = markers.find((k) => k.id === id);
    if (!m) return;
    setSelected(id);
    setCenter({ x: m.position.x, y: m.position.y });
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07090c] text-[#e9fbff] font-mono select-none">
      {/* header */}
      <div className="flex-none h-9 flex items-stretch gap-3 px-3 bg-gradient-to-r from-[#12161c] via-[#0b0e13] to-[#12161c] border-b border-[#fcee0a]/40">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-3 w-3 bg-[#fcee0a] animate-pulse" style={{ clipPath: "polygon(0 0,100% 0,100% 70%,70% 100%,0 100%)" }} />
          <span className="text-[11px] tracking-[0.42em] text-[#fcee0a] font-bold truncate">NIGHT CITY // NAVIGATION GRID</span>
        </div>
        <div className="flex-1 min-w-0 flex items-center">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#fcee0a]/60 via-[#00f0ff]/30 to-transparent" />
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] tracking-[0.3em] text-[#00f0ff]/70">TRACKED</span>
          <span className="text-[10px] tracking-[0.18em] text-[#ff2e88] truncate max-w-[22rem]">{tracked.label}</span>
          <span className="text-[9px] tracking-[0.25em] text-[#e9fbff]/40">ZM {zoom.toFixed(2)}×</span>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-2 p-2">
        {/* control rail */}
        <div className="flex-none w-[5rem] flex flex-col gap-2 justify-center">
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => setZoom((z) => clampZ(z + 0.25))} tone="accent">
              <span className="font-bold tracking-[0.2em]">+ ZM</span>
            </ActionButton>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => setZoom((z) => clampZ(z - 0.25))} tone="accent">
              <span className="font-bold tracking-[0.2em]">− ZM</span>
            </ActionButton>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => pan(0, -0.08)}>
              <span className="font-bold tracking-[0.2em]">▲ N</span>
            </ActionButton>
          </div>
          <div className="flex gap-1">
            <div className="flex-1 h-[1.75rem]">
              <ActionButton onPress={() => pan(-0.08, 0)}>
                <span className="font-bold">◀</span>
              </ActionButton>
            </div>
            <div className="flex-1 h-[1.75rem]">
              <ActionButton onPress={() => pan(0.08, 0)}>
                <span className="font-bold">▶</span>
              </ActionButton>
            </div>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => pan(0, 0.08)}>
              <span className="font-bold tracking-[0.2em]">▼ S</span>
            </ActionButton>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton
              onPress={() => {
                setZoom(1.2);
                setCenter({ x: 0.5, y: 0.5 });
              }}
              tone="danger"
            >
              <span className="font-bold tracking-[0.2em]">RST</span>
            </ActionButton>
          </div>
        </div>

        {/* map */}
        <div className="flex-1 relative border border-[#00f0ff]/25 bg-[#05070a]">
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,rgba(0,240,255,0.07) 0px,rgba(0,240,255,0.07) 1px,transparent 1px,transparent 4px)",
            }}
          />
          <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#fcee0a] z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#fcee0a] z-20 pointer-events-none" />
          <div className="absolute left-0 bottom-0 h-3 w-3 border-l-2 border-b-2 border-[#fcee0a] z-20 pointer-events-none" />
          <div className="absolute right-0 bottom-0 h-3 w-3 border-r-2 border-b-2 border-[#fcee0a] z-20 pointer-events-none" />
          <div
            className="absolute left-0 right-0 h-16 z-10 pointer-events-none"
            style={{
              top: (pulse % 100) + "%",
              transform: "translateY(-100%)",
              background: "linear-gradient(180deg,transparent,rgba(252,238,10,0.07))",
            }}
          />
          <div className="h-full w-full">
            <MapCanvas
              zoom={zoom}
              minZoom={0.6}
              maxZoom={3}
              center={center}
              regions={districts}
              onViewportChange={(v) => {
                setZoom(v.zoom);
                setCenter(v.center);
              }}
            >
              <RoutePath points={route} active />
              {markers.map((m) => (
                <MapMarker
                  key={m.id}
                  id={m.id}
                  position={m.position}
                  kind={m.kind}
                  label={m.label}
                  active={m.id === selected}
                  onSelect={selectMarker}
                />
              ))}
            </MapCanvas>
          </div>
        </div>
      </div>
    </div>
  );
}