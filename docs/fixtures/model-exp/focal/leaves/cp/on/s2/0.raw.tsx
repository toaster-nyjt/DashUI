export default function GeneratedComponent() {
  // BUDGET height: chrome 2.5 + gap 0.4 + map 24.0 + pad 0.8 = 27.7 ≤ 27.7
  // BUDGET width: pad 0.8 + legend rail 13.0 + gap 0.5 + map 71.4 + gap 0.5 + controls 4.0 = 90.2 ≤ 90.2

  type Mk = { id: string; x: number; y: number; kind: string; label: string; district: string };

  const MARKERS: Mk[] = [
    { id: "ft-01", x: 0.14, y: 0.22, kind: "fasttravel", label: "Kabuki Roundabout", district: "Watson" },
    { id: "ft-02", x: 0.46, y: 0.16, kind: "fasttravel", label: "Corpo Plaza N", district: "City Center" },
    { id: "ft-03", x: 0.74, y: 0.35, kind: "fasttravel", label: "Sunset Motel", district: "Badlands" },
    { id: "ft-04", x: 0.28, y: 0.72, kind: "fasttravel", label: "Vista Del Rey", district: "Heywood" },
    { id: "ft-05", x: 0.62, y: 0.80, kind: "fasttravel", label: "Coastview Pier", district: "Pacifica" },
    { id: "vn-01", x: 0.22, y: 0.38, kind: "ripperdoc", label: "Viktor Vektor", district: "Watson" },
    { id: "vn-02", x: 0.55, y: 0.48, kind: "vendor", label: "Jinguji Boutique", district: "City Center" },
    { id: "vn-03", x: 0.40, y: 0.64, kind: "ripperdoc", label: "Cassius Ryder", district: "Santo Domingo" },
    { id: "vn-04", x: 0.84, y: 0.60, kind: "vendor", label: "Wilson's 2nd Amdt", district: "Badlands" },
    { id: "q-01", x: 0.34, y: 0.30, kind: "quest", label: "The Heist", district: "Watson" },
    { id: "q-02", x: 0.66, y: 0.26, kind: "gig", label: "Freedom of the Press", district: "City Center" },
    { id: "q-03", x: 0.50, y: 0.70, kind: "gig", label: "Dancing on a Minefield", district: "Heywood" },
    { id: "q-04", x: 0.78, y: 0.18, kind: "quest", label: "Ghost Town", district: "Badlands" },
  ];

  const ROUTES: Record<string, { x: number; y: number }[]> = {
    "q-01": [{ x: 0.14, y: 0.22 }, { x: 0.20, y: 0.27 }, { x: 0.27, y: 0.26 }, { x: 0.34, y: 0.30 }],
    "q-02": [{ x: 0.46, y: 0.16 }, { x: 0.54, y: 0.19 }, { x: 0.60, y: 0.22 }, { x: 0.66, y: 0.26 }],
    "q-03": [{ x: 0.28, y: 0.72 }, { x: 0.36, y: 0.74 }, { x: 0.44, y: 0.71 }, { x: 0.50, y: 0.70 }],
    "q-04": [{ x: 0.74, y: 0.35 }, { x: 0.79, y: 0.29 }, { x: 0.76, y: 0.23 }, { x: 0.78, y: 0.18 }],
  };

  const REGIONS = [
    { id: "watson", label: "WATSON", x: 0.20, y: 0.14 },
    { id: "center", label: "CITY CENTER", x: 0.52, y: 0.38 },
    { id: "heywood", label: "HEYWOOD", x: 0.30, y: 0.62 },
    { id: "pacifica", label: "PACIFICA", x: 0.66, y: 0.88 },
    { id: "santo", label: "SANTO DOMINGO", x: 0.48, y: 0.88 },
    { id: "badlands", label: "BADLANDS", x: 0.86, y: 0.20 },
  ];

  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 });
  const [tracked, setTracked] = useState<string>("q-02");
  const [selected, setSelected] = useState<string>("q-02");
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const trackedMk = useMemo(() => MARKERS.find((m) => m.id === tracked), [tracked]);

  const handleSelect = useCallback((id: string) => {
    setSelected(id);
    const m = MARKERS.find((k) => k.id === id);
    if (!m) return;
    if (m.kind === "quest" || m.kind === "gig") {
      setTracked(id);
      setCenter({ x: m.x, y: m.y });
    }
  }, []);

  const nudge = (dx: number, dy: number) =>
    setCenter((c) => ({
      x: Math.min(1, Math.max(0, c.x + dx)),
      y: Math.min(1, Math.max(0, c.y + dy)),
    }));

  const legend = [
    { k: "quest", label: "MAIN JOB", c: "text-yellow-300", d: "bg-yellow-300" },
    { k: "gig", label: "GIG / NCPD", c: "text-cyan-300", d: "bg-cyan-300" },
    { k: "fasttravel", label: "FAST TRAVEL", c: "text-fuchsia-400", d: "bg-fuchsia-400" },
    { k: "vendor", label: "VENDOR", c: "text-emerald-300", d: "bg-emerald-300" },
    { k: "ripperdoc", label: "RIPPERDOC", c: "text-red-400", d: "bg-red-400" },
  ];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-[#07070b] text-yellow-300 font-mono relative">
      {/* scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0px, rgba(255,255,255,0.35) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* CHROME */}
      <header className="flex-none h-10 flex items-stretch bg-yellow-300 text-black">
        <div className="flex items-center px-3 bg-black text-yellow-300 tracking-[0.35em] text-[11px] font-bold">
          NIGHT CITY // NAVIGATION
        </div>
        <div className="flex-1 min-w-0 flex items-center px-3 gap-3 overflow-hidden">
          <span className="text-[10px] font-black tracking-[0.25em]">GRID</span>
          <div className="flex-1 min-w-0 h-[2px] bg-black/70" />
          <span className="text-[10px] font-bold tracking-[0.2em] truncate">
            TRACKED: {trackedMk ? trackedMk.label.toUpperCase() : "NONE"}
          </span>
          <div className="flex gap-[3px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={"b" + i}
                className="w-1 h-3 bg-black transition-opacity duration-200"
                style={{ opacity: (pulse + i) % 12 < 5 ? 1 : 0.25 }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center px-3 bg-black text-cyan-300 text-[11px] tracking-[0.2em] font-bold">
          ZOOM {zoom.toFixed(2)}x
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex gap-2 p-2">
        {/* LEFT RAIL */}
        <aside className="w-[13rem] flex flex-col gap-2">
          <div className="border border-yellow-300/40 bg-yellow-300/[0.04] p-2">
            <div className="text-[9px] tracking-[0.3em] text-cyan-300 mb-2">LEGEND</div>
            <div className="flex flex-col gap-1.5">
              {legend.map((l) => (
                <div key={l.k} className="flex items-center gap-2 group">
                  <span
                    className={"w-2 h-2 rotate-45 " + l.d + " transition-transform duration-300 group-hover:scale-150"}
                  />
                  <span className={"text-[10px] tracking-[0.18em] " + l.c}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 border border-yellow-300/40 bg-gradient-to-b from-fuchsia-500/10 to-transparent p-2 flex flex-col gap-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="text-[9px] tracking-[0.3em] text-cyan-300 mb-1">DISTRICTS</div>
            {REGIONS.map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-[10px] tracking-[0.15em] text-yellow-300/80 border-l-2 border-yellow-300/30 pl-2 py-0.5 hover:border-fuchsia-400 hover:text-fuchsia-300 hover:translate-x-1 transition-all duration-200"
              >
                <span className="truncate">{r.label}</span>
                <span className="text-yellow-300/40">{String(i + 1).padStart(2, "0")}</span>
              </div>
            ))}
          </div>

          <div className="border border-cyan-300/40 bg-cyan-300/[0.05] p-2">
            <div className="text-[9px] tracking-[0.3em] text-cyan-300">SELECTED</div>
            <div className="text-[11px] font-bold tracking-[0.1em] truncate text-yellow-200">
              {MARKERS.find((m) => m.id === selected)?.label ?? "—"}
            </div>
            <div className="text-[9px] tracking-[0.2em] text-yellow-300/50 truncate">
              {MARKERS.find((m) => m.id === selected)?.district ?? ""}
            </div>
          </div>
        </aside>

        {/* MAP */}
        <div className="flex-1 relative border border-yellow-300/50 bg-[#0a0a12] overflow-clip">
          <div className="absolute inset-0 z-10 pointer-events-none border-2 border-transparent [box-shadow:inset_0_0_60px_rgba(240,220,60,0.12)]" />
          <div className="absolute left-0 top-0 z-10 pointer-events-none text-[9px] tracking-[0.3em] text-yellow-300/60 px-2 py-1 bg-black/60">
            SECTOR GRID // LIVE
          </div>
          <MapCanvas
            zoom={zoom}
            minZoom={0.6}
            maxZoom={3}
            center={center}
            regions={REGIONS}
            onViewportChange={(v) => {
              setZoom(v.zoom);
              setCenter(v.center);
            }}
          >
            <RoutePath points={ROUTES[tracked] ?? []} active />
            {MARKERS.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                position={{ x: m.x, y: m.y }}
                kind={m.kind}
                label={m.label}
                active={m.id === tracked || m.id === selected}
                onSelect={handleSelect}
              />
            ))}
          </MapCanvas>
        </div>

        {/* CONTROLS */}
        <div className="w-[4rem] flex flex-col gap-1.5">
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => nudge(0, -0.06)} tone="neutral">
              <span className="font-black">▲</span>
            </ActionButton>
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 h-[1.75rem]">
              <ActionButton onPress={() => nudge(-0.06, 0)} tone="neutral">
                <span className="font-black">◀</span>
              </ActionButton>
            </div>
            <div className="flex-1 h-[1.75rem]">
              <ActionButton onPress={() => nudge(0.06, 0)} tone="neutral">
                <span className="font-black">▶</span>
              </ActionButton>
            </div>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => nudge(0, 0.06)} tone="neutral">
              <span className="font-black">▼</span>
            </ActionButton>
          </div>

          <div className="h-[1.75rem] mt-1">
            <ActionButton onPress={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} tone="accent">
              <span className="font-black">+</span>
            </ActionButton>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton onPress={() => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))} tone="accent">
              <span className="font-black">−</span>
            </ActionButton>
          </div>
          <div className="h-[1.75rem]">
            <ActionButton
              onPress={() => {
                setZoom(1);
                setCenter({ x: 0.5, y: 0.5 });
              }}
              tone="danger"
            >
              <span className="font-black tracking-[0.1em] text-[0.8em]">RST</span>
            </ActionButton>
          </div>

          <div className="flex-1 border border-yellow-300/30 flex flex-col justify-end gap-[3px] p-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={"g" + i}
                className="block h-[3px] bg-fuchsia-400 transition-all duration-300"
                style={{ opacity: (pulse + i * 3) % 16 < 8 ? 0.9 : 0.2 }}
              />
            ))}
          </div>

          <div className="h-[1.75rem]">
            <ActionButton
              onPress={() => {
                if (trackedMk) setCenter({ x: trackedMk.x, y: trackedMk.y });
              }}
              tone="accent"
            >
              <span className="font-black tracking-[0.1em] text-[0.75em]">TRK</span>
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}