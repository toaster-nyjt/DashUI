export default function GeneratedComponent() {
  // BUDGET height: header 2.5 + gap 0.5 + map region 24.2 (MapCanvas floor 8) + padding 0.5 = 27.7 ≤ 27.7
  // BUDGET width: pad 0.5 + map 68.2 + gap 0.5 + rail 20.5 + pad 0.5 = 90.2 ≤ 90.2

  const [zoom, setZoom] = useState(1.2);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [tracked, setTracked] = useState("gig-02");
  const [selected, setSelected] = useState<string | null>("gig-02");
  const [pulse, setPulse] = useState(0);
  const [scanline, setScanline] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setScanline((s) => (s + 1) % 360), 40);
    return () => clearInterval(t);
  }, []);

  const districts = useMemo(
    () => [
      { id: "wat", label: "WATSON", x: 0.32, y: 0.24 },
      { id: "wes", label: "WESTBROOK", x: 0.74, y: 0.3 },
      { id: "cc", label: "CITY CENTER", x: 0.48, y: 0.5 },
      { id: "hey", label: "HEYWOOD", x: 0.35, y: 0.7 },
      { id: "pac", label: "PACIFICA", x: 0.14, y: 0.82 },
      { id: "sm", label: "SANTO DOMINGO", x: 0.8, y: 0.74 },
    ],
    []
  );

  const fastTravel = [
    { id: "ft-01", label: "KABUKI ROOFTOP", x: 0.27, y: 0.2 },
    { id: "ft-02", label: "CORPO PLAZA", x: 0.52, y: 0.46 },
    { id: "ft-03", label: "VISTA DEL REY", x: 0.33, y: 0.74 },
    { id: "ft-04", label: "GLEN SOUTH", x: 0.72, y: 0.66 },
  ];

  const vendors = [
    { id: "vd-01", label: "RIPPERDOC — VIKTOR", x: 0.35, y: 0.31 },
    { id: "vd-02", label: "NETRUNNER SHOP", x: 0.63, y: 0.39 },
    { id: "vd-03", label: "RIPPERDOC — CASSIUS", x: 0.19, y: 0.65 },
  ];

  const quests = [
    { id: "gig-01", label: "GIG: BACKS AGAINST THE WALL", x: 0.44, y: 0.3, route: [{ x: 0.52, y: 0.46 }, { x: 0.48, y: 0.38 }, { x: 0.44, y: 0.3 }] },
    { id: "gig-02", label: "MAIN JOB: PLAYING FOR TIME", x: 0.67, y: 0.55, route: [{ x: 0.52, y: 0.46 }, { x: 0.58, y: 0.48 }, { x: 0.62, y: 0.54 }, { x: 0.67, y: 0.55 }] },
    { id: "gig-03", label: "GIG: WELCOME TO NIGHT CITY", x: 0.22, y: 0.78, route: [{ x: 0.52, y: 0.46 }, { x: 0.4, y: 0.6 }, { x: 0.3, y: 0.7 }, { x: 0.22, y: 0.78 }] },
  ];

  const trackedQuest = quests.find((q) => q.id === tracked) || quests[0];

  const nudge = (dx: number, dy: number) =>
    setCenter((c) => ({
      x: Math.min(1, Math.max(0, c.x + dx)),
      y: Math.min(1, Math.max(0, c.y + dy)),
    }));

  const selectMarker = (id: string) => {
    setSelected(id);
    const q = quests.find((x) => x.id === id);
    if (q) {
      setTracked(id);
      setCenter({ x: q.x, y: q.y });
    }
  };

  const allLabels = [...fastTravel, ...vendors, ...quests];
  const selectedLabel = allLabels.find((m) => m.id === selected);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07090c] text-[#d6fbff] font-mono">
      {/* header */}
      <div className="flex-none h-10 flex items-center gap-3 px-3 border-b border-[#f7ff4a]/30 bg-gradient-to-r from-[#12161b] via-[#0b0e12] to-[#12161b]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#f7ff4a] animate-pulse" />
          <span className="text-[11px] tracking-[0.35em] text-[#f7ff4a] font-bold">NIGHT CITY // NAVGRID</span>
        </div>
        <div className="h-4 w-px bg-[#00e5ff]/40" />
        <span className="text-[10px] tracking-[0.2em] text-[#00e5ff]/70 truncate">
          SECTOR SCAN {String(100 + pulse).slice(-2)}% · GPS LOCK ACTIVE
        </span>
        <div className="ml-auto flex items-center gap-2 text-[10px] tracking-[0.2em] text-[#ff2e6d]">
          <span className="px-2 py-[2px] border border-[#ff2e6d]/50 bg-[#ff2e6d]/10">TRACKING</span>
          <span className="text-[#d6fbff]/70 truncate max-w-[16rem]">{trackedQuest.label}</span>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-2 p-2">
        {/* map */}
        <div className="flex-1 relative border border-[#00e5ff]/25 bg-[#080c10]">
          <div
            className="absolute inset-0 pointer-events-none z-20 opacity-[0.25]"
            style={{
              background:
                "repeating-linear-gradient(0deg, rgba(0,229,255,0.12) 0px, rgba(0,229,255,0.12) 1px, transparent 1px, transparent 4px)",
            }}
          />
          <div
            className="absolute left-0 right-0 h-16 pointer-events-none z-20 transition-none"
            style={{
              top: (scanline / 360) * 100 + "%",
              background: "linear-gradient(180deg, transparent, rgba(247,255,74,0.10), transparent)",
            }}
          />
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
            <RoutePath points={trackedQuest.route} active={true} />
            {fastTravel.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={{ x: m.x, y: m.y }}
                kind="fast-travel"
                label={m.label}
                active={selected === m.id}
                onSelect={selectMarker}
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
                onSelect={selectMarker}
              />
            ))}
            {quests.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={{ x: m.x, y: m.y }}
                kind="quest"
                label={m.label}
                active={tracked === m.id || selected === m.id}
                onSelect={selectMarker}
              />
            ))}
          </MapCanvas>

          <div className="absolute bottom-2 left-2 z-30 text-[9px] tracking-[0.25em] text-[#00e5ff]/60 bg-[#07090c]/70 px-2 py-1 border border-[#00e5ff]/20">
            X {center.x.toFixed(3)} · Y {center.y.toFixed(3)} · ZM {zoom.toFixed(2)}×
          </div>
        </div>

        {/* rail */}
        <div className="w-[20rem] flex flex-col gap-2">
          {/* zoom / pan */}
          <div className="border border-[#f7ff4a]/25 bg-[#0b0f14] p-2">
            <div className="text-[9px] tracking-[0.3em] text-[#f7ff4a]/80 mb-2">VIEWPORT CONTROL</div>
            <div className="flex gap-2">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <div className="w-[3.5rem] h-[1.75rem]">
                  <ActionButton onPress={() => nudge(0, -0.08)}><span>▲</span></ActionButton>
                </div>
                <div />
                <div className="w-[3.5rem] h-[1.75rem]">
                  <ActionButton onPress={() => nudge(-0.08, 0)}><span>◀</span></ActionButton>
                </div>
                <div className="w-[3.5rem] h-[1.75rem]">
                  <ActionButton onPress={() => { setCenter({ x: 0.5, y: 0.5 }); setZoom(1.2); }} tone="accent"><span>◎</span></ActionButton>
                </div>
                <div className="w-[3.5rem] h-[1.75rem]">
                  <ActionButton onPress={() => nudge(0.08, 0)}><span>▶</span></ActionButton>
                </div>
                <div />
                <div className="w-[3.5rem] h-[1.75rem]">
                  <ActionButton onPress={() => nudge(0, 0.08)}><span>▼</span></ActionButton>
                </div>
                <div />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="w-full h-[1.75rem]">
                  <ActionButton onPress={() => setZoom((z) => Math.min(3, +(z + 0.3).toFixed(2)))} tone="accent">
                    <span className="tracking-[0.2em]">ZOOM +</span>
                  </ActionButton>
                </div>
                <div className="w-full h-[1.75rem]">
                  <ActionButton onPress={() => setZoom((z) => Math.max(0.6, +(z - 0.3).toFixed(2)))}>
                    <span className="tracking-[0.2em]">ZOOM −</span>
                  </ActionButton>
                </div>
                <div className="w-full h-[1.75rem]">
                  <ActionButton onPress={() => setCenter({ x: trackedQuest.x, y: trackedQuest.y })} tone="danger">
                    <span className="tracking-[0.2em]">CENTER JOB</span>
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>

          {/* readout */}
          <div className="flex-1 border border-[#00e5ff]/25 bg-[#0b0f14] p-2 flex flex-col gap-2">
            <div className="text-[9px] tracking-[0.3em] text-[#00e5ff]/80">MARKER FEED</div>
            <div className="text-[11px] leading-tight">
              <div className="text-[#f7ff4a] tracking-[0.15em] truncate">
                {selectedLabel ? selectedLabel.label : "NO SIGNAL"}
              </div>
              <div className="text-[9px] tracking-[0.2em] text-[#d6fbff]/50 mt-1 truncate">
                {selectedLabel ? "ID " + selectedLabel.id.toUpperCase() : "SELECT A MARKER"}
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-[#ff2e6d]/60 to-transparent" />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] tracking-[0.18em]">
              {[
                ["FAST TRAVEL", fastTravel.length, "#00e5ff"],
                ["VENDORS", vendors.length, "#f7ff4a"],
                ["JOBS", quests.length, "#ff2e6d"],
                ["DISTRICTS", districts.length, "#d6fbff"],
              ].map(([l, n, c]) => (
                <div key={String(l)} className="flex items-center justify-between border-b border-white/5 py-[2px] transition-colors hover:border-[#00e5ff]/40">
                  <span className="text-[#d6fbff]/55 truncate">{l}</span>
                  <span style={{ color: String(c) }}>{String(n).padStart(2, "0")}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto flex items-center gap-1">
              {Array.from({ length: 22 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 transition-all duration-200"
                  style={{
                    height: 3 + ((i * 7 + pulse) % 13),
                    background: i % 5 === 0 ? "#ff2e6d" : "rgba(0,229,255,0.5)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}