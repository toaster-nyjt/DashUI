export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + padding 1.5 + body 17.05 = 20.8 ≤ 20.8
  //   left col: SearchInput 2 + gap 0.5 + TreeSelector 14.55 = 17.05 (floors 2 / 4 ok)
  //   center col: TrackTable 17.05 (floor 6 ok)
  //   right col: PreviewPlayer 2.25 + gap 0.5 + 2×PushButton 3.5 + gap 0.5 + meta 10.3 = 17.05
  // BUDGET width: padding 1.5 + left 18 + gap 0.75 + center 54.35 + gap 0.75 + right 18.25 = 93.6 ≤ 93.6

  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("house-deep");
  const [expanded, setExpanded] = useState<string[]>(["lib", "house", "crates"]);
  const [sortKey, setSortKey] = useState("bpm");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState("t3");
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(42);
  const [loaded, setLoaded] = useState<{ A: string | null; B: string | null }>({ A: null, B: null });
  const [flash, setFlash] = useState<"A" | "B" | null>(null);

  const nodes = useMemo(
    () => [
      {
        id: "lib",
        label: "LIBRARY",
        children: [
          { id: "all", label: "All Tracks (1,284)" },
          { id: "recent", label: "Recently Added" },
          { id: "hot", label: "Hot Cues Set" },
        ],
      },
      {
        id: "house",
        label: "HOUSE",
        children: [
          { id: "house-deep", label: "Deep / Dub" },
          { id: "house-tech", label: "Tech House" },
          { id: "house-afro", label: "Afro House" },
        ],
      },
      {
        id: "crates",
        label: "CRATES",
        children: [
          { id: "crate-fri", label: "Friday Warmup" },
          { id: "crate-peak", label: "Peak Hour" },
          { id: "crate-close", label: "Closing Set" },
        ],
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      { key: "title", label: "Title" },
      { key: "artist", label: "Artist" },
      { key: "bpm", label: "BPM", numeric: true },
      { key: "key", label: "Key" },
      { key: "duration", label: "Time" },
    ],
    []
  );

  const allRows = useMemo(
    () => [
      { id: "t1", title: "Molten Drift", artist: "Kaspar Vey", bpm: 122, key: "8A", duration: "6:12", secs: 372 },
      { id: "t2", title: "Brass Horizon", artist: "Anouk Rill", bpm: 124, key: "5A", duration: "7:04", secs: 424 },
      { id: "t3", title: "Nightsmith", artist: "Orlo", bpm: 126, key: "11B", duration: "5:48", secs: 348 },
      { id: "t4", title: "Copper Rain", artist: "Sun Atlas", bpm: 121, key: "2A", duration: "6:33", secs: 393 },
      { id: "t5", title: "Filament", artist: "Mira Dune", bpm: 128, key: "9B", duration: "5:02", secs: 302 },
      { id: "t6", title: "Low Furnace", artist: "Tesh Kori", bpm: 123, key: "4A", duration: "8:19", secs: 499 },
      { id: "t7", title: "Ember Loop", artist: "Vantar", bpm: 125, key: "7A", duration: "6:58", secs: 418 },
      { id: "t8", title: "Glass Kiln", artist: "Noa Reyes", bpm: 127, key: "12B", duration: "5:31", secs: 331 },
      { id: "t9", title: "Slow Alloy", artist: "Dorr", bpm: 119, key: "3A", duration: "7:45", secs: 465 },
      { id: "t10", title: "Tangerine Static", artist: "Ilse Vonn", bpm: 130, key: "10A", duration: "4:56", secs: 296 },
      { id: "t11", title: "Anvil Dub", artist: "Kaspar Vey", bpm: 122, key: "6A", duration: "6:41", secs: 401 },
      { id: "t12", title: "Signal Forge", artist: "Orlo", bpm: 129, key: "1B", duration: "5:17", secs: 317 },
    ],
    []
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const f = allRows.filter(
      (r) => !q || r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q) || String(r.bpm).includes(q) || r.key.toLowerCase().includes(q)
    );
    const dir = sortDir === "asc" ? 1 : -1;
    return [...f].sort((a: any, b: any) => {
      const x = a[sortKey], y = b[sortKey];
      if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
      return String(x).localeCompare(String(y)) * dir;
    });
  }, [allRows, query, sortKey, sortDir]);

  const current = allRows.find((r) => r.id === selected) || allRows[0];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setPosition((p) => (p + 1 > current.secs ? 0 : p + 1)), 1000);
    return () => clearInterval(t);
  }, [playing, current.secs]);

  useEffect(() => setPosition(0), [selected]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [flash]);

  const load = (deck: "A" | "B") => {
    setLoaded((l) => ({ ...l, [deck]: current.title }));
    setFlash(deck);
  };

  const toggleExpand = (id: string) =>
    setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span className="text-amber-400 animate-pulse">◆</span>
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Track Library Browser</span>
        <span className="ml-auto font-mono text-[10px] tracking-wide text-neutral-500">{rows.length} / {allRows.length} TRACKS</span>
        <span className="font-mono text-[10px] tracking-wide text-teal-300">A:{loaded.A ? loaded.A.toUpperCase() : "—"}</span>
        <span className="font-mono text-[10px] tracking-wide text-violet-300">B:{loaded.B ? loaded.B.toUpperCase() : "—"}</span>
      </div>

      <div className="flex-1 flex gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)]">
        {/* LEFT */}
        <div className="w-[18rem] flex flex-col gap-2">
          <div className="h-[2rem]">
            <SearchInput value={query} onChange={setQuery} placeholder="Search title / artist / key" onClear={() => setQuery("")} />
          </div>
          <div className="flex-1 rounded-xl border border-amber-500/10 bg-black/70 shadow-inner shadow-black/70 p-2">
            <TreeSelector nodes={nodes} value={folder} onChange={setFolder} expanded={expanded} onToggleExpand={toggleExpand} />
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
          <TrackTable
            columns={columns}
            rows={rows}
            value={selected}
            onChange={setSelected}
            onActivate={() => load("A")}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={(k, d) => { setSortKey(k); setSortDir(d); }}
          />
        </div>

        {/* RIGHT */}
        <div className="w-[18.25rem] flex flex-col gap-2">
          <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">Preview</span>
              <span className="font-mono text-[10px] tracking-wide text-neutral-500">{folder.toUpperCase()}</span>
            </div>
            <div className="h-[2.25rem]">
              <PreviewPlayer
                playing={playing}
                position={position}
                duration={current.secs}
                onPlayToggle={setPlaying}
                onSeek={setPosition}
                label={current.title}
              />
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <div className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] text-sm truncate">
                {current.title}
              </div>
              <div className="text-[11px] tracking-wide text-neutral-400 truncate">{current.artist}</div>
              <div className="flex gap-2 pt-1">
                <div className="flex-1 min-w-0 rounded-md border border-amber-500/20 bg-black/70 px-2 py-1">
                  <div className="text-[10px] tracking-widest uppercase text-neutral-500">BPM</div>
                  <div className="font-mono font-bold tracking-tight text-amber-300 text-sm">{current.bpm.toFixed(1)}</div>
                </div>
                <div className="flex-1 min-w-0 rounded-md border border-teal-400/20 bg-black/70 px-2 py-1">
                  <div className="text-[10px] tracking-widest uppercase text-neutral-500">Key</div>
                  <div className="font-mono font-bold tracking-tight text-teal-300 text-sm">{current.key}</div>
                </div>
                <div className="flex-1 min-w-0 rounded-md border border-neutral-700/60 bg-black/70 px-2 py-1">
                  <div className="text-[10px] tracking-widest uppercase text-neutral-500">Time</div>
                  <div className="font-mono font-bold tracking-tight text-amber-100 text-sm">{current.duration}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <div className={"flex-1 h-[2.25rem] rounded-lg transition-all duration-200 ease-out " + (flash === "A" ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]" : "")}>
                <PushButton tone="accent" onPress={() => load("A")}>
                  <span className="flex flex-col items-center font-mono font-semibold tracking-wider uppercase">
                    <span className="text-[0.7em] opacity-70">Load</span>
                    <span>Deck A</span>
                  </span>
                </PushButton>
              </div>
              <div className={"flex-1 h-[2.25rem] rounded-lg transition-all duration-200 ease-out " + (flash === "B" ? "shadow-[0_0_16px_rgba(45,212,191,0.4)]" : "")}>
                <PushButton tone="neutral" onPress={() => load("B")}>
                  <span className="flex flex-col items-center font-mono font-semibold tracking-wider uppercase">
                    <span className="text-[0.7em] opacity-70">Load</span>
                    <span>Deck B</span>
                  </span>
                </PushButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}