export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + map flex (>=8, actual ~37.1) + footer 2.25 = 41.6 <= 41.6
  // BUDGET width: map flex (90.2) >= 10 ; control stack 2.4 + markers 2.4 = fits <= 90.2

  type Kind = "fastTravel" | "mainQuest" | "sideQuest" | "gig" | "vendor";

  const MARKERS: { id: string; x: number; y: number; kind: Kind; label: string; district: string }[] = [
    { id: "ft-01", x: 0.14, y: 0.22, kind: "fastTravel", label: "MEGABUILDING H10", district: "WATSON / LITTLE CHINA" },
    { id: "ft-02", x: 0.52, y: 0.14, kind: "fastTravel", label: "CORPO PLAZA STN", district: "CITY CENTER" },
    { id: "ft-03", x: 0.83, y: 0.63, kind: "fastTravel", label: "RANCHO CORONADO", district: "SANTO DOMINGO" },
    { id: "ft-04", x: 0.28, y: 0.78, kind: "fastTravel", label: "VISTA DEL REY", district: "HEYWOOD" },
    { id: "mq-01", x: 0.41, y: 0.37, kind: "mainQuest", label: "THE HEIST // KONPEKI", district: "WATSON / JAPANTOWN" },
    { id: "mq-02", x: 0.66, y: 0.30, kind: "mainQuest", label: "PLAY IT SAFE", district: "CITY CENTER" },
    { id: "sq-01", x: 0.22, y: 0.52, kind: "sideQuest", label: "HEROES // JACKIE", district: "HEYWOOD" },
    { id: "sq-02", x: 0.74, y: 0.45, kind: "sideQuest", label: "SINNERMAN", district: "BADLANDS EDGE" },
    { id: "gg-01", x: 0.35, y: 0.64, kind: "gig", label: "GIG: FLIGHT OF THE CHEETAH", district: "WELLSPRINGS" },
    { id: "gg-02", x: 0.58, y: 0.71, kind: "gig", label: "GIG: BACKS AGAINST THE WALL", district: "SANTO DOMINGO" },
    { id: "gg-03", x: 0.89, y: 0.24, kind: "gig", label: "GIG: GOODBYE, NIGHT CITY", district: "NORTH OAK" },
    { id: "vd-01", x: 0.47, y: 0.55, kind: "vendor", label: "RIPPERDOC // VIKTOR", district: "LITTLE CHINA" },
    { id: "vd-02", x: 0.63, y: 0.18, kind: "vendor", label: "ARMS DEALER // WILSON", district: "CITY CENTER" },
    { id: "vd-03", x: 0.17, y: 0.66, kind: "vendor", label: "CLOTHING // JINGUJI", district: "WESTBROOK" },
  ];

  const ROUTE = [
    { x: 0.14, y: 0.22 },
    { x: 0.27, y: 0.29 },
    { x: 0.34, y: 0.34 },
    { x: 0.41, y: 0.37 },
  ];

  const [view, setView] = useState({ x: 0.5, y: 0.5, zoom: 1 });
  const [selected, setSelected] = useState("mq-01");
  const [sweep, setSweep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSweep((s) => (s + 1) % 100), 80);
    return () => clearInterval(id);
  }, []);

  const sel = useMemo(() => MARKERS.find((m) => m.id === selected), [selected]);

  const clampZoom = (z: number) => Math.min(3, Math.max(0.6, Math.round(z * 100) / 100));
  const clamp01 = (n: number) => Math.min(1, Math.max(0, Math.round(n * 1000) / 1000));
  const zoomBy = (d: number) => setView((v) => ({ ...v, zoom: clampZoom(v.zoom + d) }));
  const panBy = (dx: number, dy: number) =>
    setView((v) => ({ ...v, x: clamp01(v.x + dx), y: clamp01(v.y + dy) }));
  const recenter = () => setView({ x: 0.5, y: 0.5, zoom: 1 });

  const kindLabel: Record<Kind, string> = {
    fastTravel: "FAST TRAVEL",
    mainQuest: "MAIN JOB",
    sideQuest: "SIDE JOB",
    gig: "GIG",
    vendor: "VENDOR",
  };

  const kindGlyph: Record<Kind, string> = {
    fastTravel: "⏻",
    mainQuest: "◆",
    sideQuest: "◇",
    gig: "◈",
    vendor: "$",
  };

  const kindColor: Record<Kind, string> = {
    fastTravel: "text-[#00f0ff]",
    mainQuest: "text-[#fcee0a]",
    sideQuest: "text-[#bd00ff]",
    gig: "text-[#ff005c]",
    vendor: "text-[#3dfc6e]",
  };

  const counts = (k: Kind) => MARKERS.filter((m) => m.kind === k).length;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0510] via-[#120a1e] to-[#050208] font-mono">
      {/* HEADER */}
      <div className="h-9 flex-none px-3 bg-[#080410]/95 border-b border-[#00f0ff]/35 border-l-2 border-l-[#fcee0a] flex items-center gap-3">
        <span className="text-xs font-bold tracking-[0.22em] uppercase text-[#fcee0a] drop-shadow-[0_0_6px_rgba(252,238,10,0.5)]">
          NIGHT CITY // NAV GRID
        </span>
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#4a5568] truncate">
          SAT-LINK 7 · {MARKERS.length} SIGNALS
        </span>
        <div className="flex-1 min-w-0 flex items-center px-2">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#ff005c]/0 via-[#00f0ff]/60 to-[#bd00ff]/0" />
        </div>
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#7de3ef] animate-pulse">● LIVE</span>
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#4a5568]">
          ZOOM {view.zoom.toFixed(2)}×
        </span>
      </div>

      {/* MAP BODY */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapCanvas
            center={{ x: view.x, y: view.y }}
            zoom={view.zoom}
            onViewChange={(v) => setView({ x: v.x, y: v.y, zoom: v.zoom })}
          >
            <RouteOverlay points={ROUTE} active={true} />
            {MARKERS.map((m) => (
              <MapMarker
                key={m.id}
                id={m.id}
                x={m.x}
                y={m.y}
                kind={m.kind}
                selected={selected === m.id}
                onSelect={(id) => setSelected(id)}
              >
                <span className="font-black leading-none">{kindGlyph[m.kind]}</span>
              </MapMarker>
            ))}
          </MapCanvas>
        </div>

        {/* corner brackets */}
        <div className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-[#fcee0a]/70" />
        <div className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-[#00f0ff]/60" />
        <div className="pointer-events-none absolute left-2 bottom-2 h-5 w-5 border-l-2 border-b-2 border-[#00f0ff]/60" />
        <div className="pointer-events-none absolute right-2 bottom-2 h-5 w-5 border-r-2 border-b-2 border-[#ff005c]/60" />

        {/* scan sweep */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-24 bg-gradient-to-r from-[#00f0ff]/0 via-[#00f0ff]/10 to-[#00f0ff]/0 transition-all duration-100 ease-linear"
          style={{ left: sweep + "%" }}
        />

        {/* LEGEND */}
        <div className="absolute left-3 top-3 bg-[#12091c]/95 backdrop-blur-sm border border-[#00f0ff]/35 ring-1 ring-[#ff005c]/10 rounded-md shadow-[0_0_20px_rgba(0,240,255,0.15)] p-2">
          <div className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#4a5568] mb-1">SIGNAL INDEX</div>
          <div className="flex flex-col gap-1">
            {(["fastTravel", "mainQuest", "sideQuest", "gig", "vendor"] as Kind[]).map((k) => (
              <div key={k} className="flex items-center gap-2">
                <span className={"text-sm leading-none font-black " + kindColor[k]}>{kindGlyph[k]}</span>
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7de3ef]">{kindLabel[k]}</span>
                <span className="ml-auto text-[10px] tracking-[0.1em] text-[#4a5568]">{counts(k)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PAN / ZOOM CONTROLS */}
        <div className="absolute right-3 top-3 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-[2.4rem] h-[2rem]">
              <ActionButton onPress={() => panBy(0, -0.08)}>
                <span className="font-black">▲</span>
              </ActionButton>
            </div>
            <div className="flex gap-1">
              <div className="w-[2.4rem] h-[2rem]">
                <ActionButton onPress={() => panBy(-0.08, 0)}>
                  <span className="font-black">◀</span>
                </ActionButton>
              </div>
              <div className="w-[2.4rem] h-[2rem]">
                <ActionButton onPress={recenter} tone="accent">
                  <span className="font-black text-[0.7em] tracking-[0.1em]">CTR</span>
                </ActionButton>
              </div>
              <div className="w-[2.4rem] h-[2rem]">
                <ActionButton onPress={() => panBy(0.08, 0)}>
                  <span className="font-black">▶</span>
                </ActionButton>
              </div>
            </div>
            <div className="w-[2.4rem] h-[2rem]">
              <ActionButton onPress={() => panBy(0, 0.08)}>
                <span className="font-black">▼</span>
              </ActionButton>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="w-[2.4rem] h-[2rem]">
              <ActionButton onPress={() => zoomBy(0.25)} disabled={view.zoom >= 3}>
                <span className="font-black">+</span>
              </ActionButton>
            </div>
            <div className="w-[2.4rem] h-[2rem]">
              <ActionButton onPress={() => zoomBy(-0.25)} disabled={view.zoom <= 0.6}>
                <span className="font-black">−</span>
              </ActionButton>
            </div>
          </div>
        </div>

        {/* SELECTION READOUT */}
        <div className="absolute left-3 bottom-3 max-w-[26rem] bg-[#12091c]/95 backdrop-blur-sm border border-[#fcee0a] ring-1 ring-[#ff005c]/10 rounded-md shadow-[0_0_10px_rgba(252,238,10,0.4)] p-3">
          <div className="flex items-center gap-2">
            <span className={"text-base leading-none font-black " + (sel ? kindColor[sel.kind] : "text-[#4a5568]")}>
              {sel ? kindGlyph[sel.kind] : "—"}
            </span>
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#4a5568]">
              {sel ? kindLabel[sel.kind] : "NO SIGNAL"}
            </span>
            {sel && sel.kind === "mainQuest" ? (
              <span className="text-[10px] tracking-[0.1em] uppercase text-[#ff005c] animate-pulse">TRACKED</span>
            ) : null}
          </div>
          <div className="mt-1 text-sm leading-snug text-[#e8faff] truncate">{sel ? sel.label : "SELECT A MARKER"}</div>
          <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7de3ef] truncate">
            {sel ? sel.district : "—"}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none px-3 bg-[#080410]/95 border-t border-[#ff005c]/25 flex items-center gap-4">
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#4a5568]">
          POS {view.x.toFixed(2)} / {view.y.toFixed(2)}
        </span>
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#7de3ef]">
          ROUTE ACTIVE · {ROUTE.length} NODES
        </span>
        <div className="flex-1 min-w-0" />
        <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-[#4a5568] truncate">
          SEL // {selected.toUpperCase()}
        </span>
      </div>
    </div>
  );
}