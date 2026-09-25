export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body padding 0.75 + body 16.05 (tree col: search 2 + gap 0.5 + tree 13.55) + footer 1.75 = 20.8 ≤ 20.8
  // BUDGET width: pad 0.75 + tree col 17 + gap 0.75 + table 56.3 (≥11) + gap 0.75 + rail 17 + pad 0.75 = 93.3 ≤ 93.6

  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("house-deep");
  const [expanded, setExpanded] = useState<string[]>(["lib", "house", "crates"]);
  const [sortKey, setSortKey] = useState("bpm");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState("t3");
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(38);
  const [flash, setFlash] = useState<null | "A" | "B">(null);
  const [loadedA, setLoadedA] = useState<string | null>(null);
  const [loadedB, setLoadedB] = useState<string | null>(null);

  const nodes = useMemo(
    () => [
      {
        id: "lib",
        label: "LIBRARY",
        children: [
          { id: "all", label: "All Tracks" },
          { id: "recent", label: "Recently Added" },
          { id: "prepared", label: "Prepared" },
        ],
      },
      {
        id: "house",
        label: "House",
        children: [
          { id: "house-deep", label: "Deep / Sunset" },
          { id: "house-tech", label: "Tech House" },
          { id: "house-afro", label: "Afro House" },
        ],
      },
      {
        id: "crates",
        label: "Crates",
        children: [
          { id: "crate-peak", label: "Peak Hour" },
          { id: "crate-warm", label: "Warm Up" },
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
      { id: "t1", title: "Molten Horizon", artist: "Kaya Ruiz", bpm: 122, key: "8A", duration: "6:12", secs: 372 },
      { id: "t2", title: "Brass Lagoon", artist: "Otto Vance", bpm: 124, key: "5A", duration: "5:48", secs: 348 },
      { id: "t3", title: "Amber Transit", artist: "Nila Sound", bpm: 126, key: "11B", duration: "7:03", secs: 423 },
      { id: "t4", title: "Slow Tide Dub", artist: "Perreault", bpm: 118, key: "2A", duration: "6:40", secs: 400 },
      { id: "t5", title: "Copper Static", artist: "Mira Volk", bpm: 128, key: "9B", duration: "5:15", secs: 315 },
      { id: "t6", title: "Night Foundry", artist: "Duplex Sun", bpm: 130, key: "4A", duration: "6:55", secs: 415 },
      { id: "t7", title: "Ember Drift", artist: "Hana Oyelo", bpm: 121, key: "12B", duration: "7:21", secs: 441 },
      { id: "t8", title: "Glass Rotor", artist: "Sebastien K", bpm: 127, key: "6A", duration: "5:02", secs: 302 },
      { id: "t9", title: "Tangerine Bloom", artist: "Lowfield", bpm: 123, key: "7B", duration: "6:28", secs: 388 },
      { id: "t10", title: "Velvet Circuit", artist: "Ada Marr", bpm: 125, key: "1A", duration: "6:05", secs: 365 },
      { id: "t11", title: "Cobalt Mirage", artist: "Tunde West", bpm: 132, key: "10A", duration: "4:58", secs: 298 },
      { id: "t12", title: "Salt & Neon", artist: "Rosetta Fly", bpm: 119, key: "3B", duration: "7:44", secs: 464 },
    ],
    []
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = allRows.filter(
      (r) => !q || r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q) || r.key.toLowerCase().includes(q)
    );
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a: any, b: any) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [allRows, query, sortKey, sortDir]);

  const current = allRows.find((r) => r.id === selected) || allRows[0];

  useEffect(() => {
    setPos(0);
    setPlaying(false);
  }, [selected]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => (p + 1 >= current.secs ? 0 : p + 1));
    }, 250);
    return () => clearInterval(id);
  }, [playing, current.secs]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(t);
  }, [flash]);

  const toggleExpand = (id: string) =>
    setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      {/* header */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,146,60,0.8)] animate-pulse" />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Track Library Browser</span>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">/ source</span>
        <div className="ml-auto flex items-center gap-2 font-mono text-[10px] tracking-wide text-neutral-500">
          <span className="text-teal-300">{rows.length}</span> results
        </div>
      </div>

      {/* body */}
      <div className="flex-1 flex gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* left: search + tree */}
        <div className="w-[17rem] flex flex-col gap-2">
          <div className="h-8 w-full">
            <SearchInput value={query} onChange={setQuery} placeholder="Search title / artist / key" onClear={() => setQuery("")} />
          </div>
          <div className="flex-1 w-full rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 overflow-clip">
            <TreeSelector
              nodes={nodes}
              value={folder}
              onChange={setFolder}
              expanded={expanded}
              onToggleExpand={toggleExpand}
            />
          </div>
        </div>

        {/* center: table */}
        <div className="flex-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 overflow-clip">
          <TrackTable
            columns={columns}
            rows={rows}
            value={selected}
            onChange={setSelected}
            onActivate={(id) => {
              setSelected(id);
              setPlaying(true);
            }}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={(k, d) => {
              setSortKey(k);
              setSortDir(d);
            }}
          />
        </div>

        {/* right rail */}
        <div className="w-[17rem] flex flex-col gap-2">
          <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-bold tracking-tight text-amber-300 text-sm truncate drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
                {current.title}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] tracking-wide text-neutral-500">
              <span className="truncate">{current.artist}</span>
              <span className="text-teal-300">{current.bpm} BPM · {current.key}</span>
            </div>
            <div className="h-9 w-full">
              <PreviewPlayer
                playing={playing}
                position={pos}
                duration={current.secs}
                onPlayToggle={setPlaying}
                onSeek={setPos}
                label="PREVIEW"
              />
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col gap-2">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">Stage Track</span>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className={"h-full w-full transition-all duration-200 ease-out " + (flash === "A" ? "scale-[0.97]" : "")}>
                <PushButton tone="accent" onPress={() => { setLoadedA(current.title); setFlash("A"); }}>
                  <span className="flex flex-col items-center font-mono font-semibold uppercase tracking-wider">
                    <span className="text-[0.7em] opacity-70">LOAD</span>
                    <span>DECK A</span>
                  </span>
                </PushButton>
              </div>
              <div className={"h-full w-full transition-all duration-200 ease-out " + (flash === "B" ? "scale-[0.97]" : "")}>
                <PushButton tone="neutral" onPress={() => { setLoadedB(current.title); setFlash("B"); }}>
                  <span className="flex flex-col items-center font-mono font-semibold uppercase tracking-wider text-teal-200">
                    <span className="text-[0.7em] opacity-70">LOAD</span>
                    <span>DECK B</span>
                  </span>
                </PushButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="h-7 flex-none flex items-center gap-4 px-3 bg-neutral-950/90 border-t border-amber-500/15 font-mono text-[10px] tracking-wide text-neutral-400">
        <span className="truncate">
          A: <span className={loadedA ? "text-amber-300" : "text-neutral-600"}>{loadedA || "—"}</span>
        </span>
        <span className="truncate">
          B: <span className={loadedB ? "text-teal-300" : "text-neutral-600"}>{loadedB || "—"}</span>
        </span>
        <span className="ml-auto uppercase">sort · {sortKey} {sortDir}</span>
      </div>
    </div>
  );
}