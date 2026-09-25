export default function GeneratedComponent() {
  const allTracks = [
    { id: "t1", title: "Molten Circuit", artist: "Vela Kraus", bpm: 124, key: "8A", dur: "6:12", folder: "house" },
    { id: "t2", title: "Brass Horizon", artist: "Nokturn", bpm: 126, key: "11B", dur: "5:44", folder: "house" },
    { id: "t3", title: "Amber Static", artist: "Lo Fiend", bpm: 128, key: "4A", dur: "7:01", folder: "techno" },
    { id: "t4", title: "Signal Drift", artist: "Aya Mor", bpm: 132, key: "2B", dur: "6:38", folder: "techno" },
    { id: "t5", title: "Tangerine Dub", artist: "Suribachi", bpm: 120, key: "9A", dur: "8:22", folder: "dub" },
    { id: "t6", title: "Night Foundry", artist: "Kell Rue", bpm: 138, key: "6A", dur: "5:09", folder: "techno" },
    { id: "t7", title: "Copper Rain", artist: "Ivo Sand", bpm: 122, key: "12B", dur: "6:55", folder: "house" },
    { id: "t8", title: "Filament", artist: "Dess Oro", bpm: 130, key: "1A", dur: "4:47", folder: "edits" },
    { id: "t9", title: "Low Ember", artist: "Marisse", bpm: 118, key: "7B", dur: "7:30", folder: "dub" },
    { id: "t10", title: "Cyan Relay", artist: "Bord Two", bpm: 127, key: "5A", dur: "6:03", folder: "edits" },
    { id: "t11", title: "Furnace Walk", artist: "Otto Vane", bpm: 134, key: "3B", dur: "5:51", folder: "techno" },
    { id: "t12", title: "Slow Alloy", artist: "Hana Peel", bpm: 115, key: "10A", dur: "8:04", folder: "dub" },
  ];

  const [query, setQuery] = useState("");
  const [node, setNode] = useState("all");
  const [expanded, setExpanded] = useState<string[]>(["lib", "genres"]);
  const [selected, setSelected] = useState("t1");
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(38);
  const [flash, setFlash] = useState<null | "A" | "B">(null);
  const [deckA, setDeckA] = useState<string | null>(null);
  const [deckB, setDeckB] = useState<string | null>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => (p >= 372 ? 0 : p + 1)), 200);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(id);
  }, [flash]);

  const nodes = [
    {
      id: "lib",
      label: "LIBRARY",
      children: [
        { id: "all", label: "All Tracks" },
        {
          id: "genres",
          label: "Genres",
          children: [
            { id: "house", label: "House" },
            { id: "techno", label: "Techno" },
            { id: "dub", label: "Dub / Downtempo" },
          ],
        },
        { id: "edits", label: "My Edits" },
      ],
    },
  ];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = allTracks.filter((t) => {
      const inFolder = node === "all" || node === "lib" || node === "genres" ? true : t.folder === node;
      const inQuery = !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q);
      return inFolder && inQuery;
    });
    r = [...r].sort((a: any, b: any) => {
      const av = a[sortKey], bv = b[sortKey];
      const c = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? c : -c;
    });
    return r.map((t) => ({ id: t.id, title: t.title, artist: t.artist, bpm: t.bpm, key: t.key, dur: t.dur }));
  }, [query, node, sortKey, sortDir]);

  const current = allTracks.find((t) => t.id === selected) || allTracks[0];

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,146,60,0.8)] animate-pulse" />
        <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Track Library Browser</span>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">/ crate engine</span>
        <div className="flex-1" />
        <span className="font-mono text-[10px] tracking-wide text-teal-300">{rows.length} TRACKS</span>
      </div>

      <div className="flex-1 flex gap-3 p-3 bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* LEFT */}
        <div className="w-[17rem] flex flex-col gap-2">
          <div className="h-[2rem]">
            <SearchInput value={query} onChange={setQuery} placeholder="SEARCH CRATES…" onClear={() => setQuery("")} />
          </div>
          <div className="flex-1">
            <TreeSelector
              nodes={nodes}
              value={node}
              onChange={setNode}
              expanded={expanded}
              onToggleExpand={(id) =>
                setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))
              }
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col">
          <TrackTable
            columns={[
              { key: "title", label: "Title" },
              { key: "artist", label: "Artist" },
              { key: "bpm", label: "BPM", numeric: true },
              { key: "key", label: "Key" },
              { key: "dur", label: "Time", numeric: true },
            ]}
            rows={rows}
            value={selected}
            onChange={setSelected}
            onActivate={(id) => { setSelected(id); setPlaying(true); setPos(0); }}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={(k, d) => { setSortKey(k); setSortDir(d); }}
          />
        </div>

        {/* RIGHT */}
        <div className="w-[21rem] flex flex-col gap-2 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 p-2 shadow-2xl shadow-black/60">
          <div className="px-1">
            <div className="truncate font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {current.title}
            </div>
            <div className="mt-0.5 flex items-center gap-2 overflow-hidden">
              <span className="truncate text-[10px] tracking-wide text-neutral-500">{current.artist}</span>
              <span className="rounded-md border border-amber-500/20 px-1 font-mono text-[10px] text-amber-400">{current.bpm} BPM</span>
              <span className="rounded-md border border-teal-400/40 px-1 font-mono text-[10px] text-teal-300">{current.key}</span>
            </div>
          </div>

          <div className="h-[2.25rem]">
            <PreviewPlayer
              playing={playing}
              position={pos}
              duration={372}
              onPlayToggle={setPlaying}
              onSeek={setPos}
              label="PREVIEW"
            />
          </div>

          <div className="flex-1 flex gap-2">
            <div className={"flex-1 transition-all duration-200 ease-out " + (flash === "A" ? "scale-[0.98] drop-shadow-[0_0_16px_rgba(251,146,60,0.55)]" : "")}>
              <PushButton
                tone="accent"
                onPress={() => { setDeckA(current.title); setFlash("A"); }}
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="text-[0.7em] tracking-widest uppercase opacity-70">Load to</span>
                  <span className="font-mono font-bold tracking-wider">DECK A</span>
                </span>
              </PushButton>
            </div>
            <div className={"flex-1 transition-all duration-200 ease-out " + (flash === "B" ? "scale-[0.98] drop-shadow-[0_0_16px_rgba(45,212,191,0.55)]" : "")}>
              <PushButton
                tone="neutral"
                onPress={() => { setDeckB(current.title); setFlash("B"); }}
              >
                <span className="flex flex-col items-center leading-tight">
                  <span className="text-[0.7em] tracking-widest uppercase opacity-60">Load to</span>
                  <span className="font-mono font-bold tracking-wider text-teal-300">DECK B</span>
                </span>
              </PushButton>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-amber-500/10 bg-black/70 px-2 py-1 shadow-inner shadow-black/70">
            <span className="font-mono text-[10px] tracking-widest text-amber-400">A</span>
            <span className="flex-1 truncate font-mono text-[10px] text-neutral-400">{deckA || "— empty —"}</span>
            <span className="font-mono text-[10px] tracking-widest text-teal-300">B</span>
            <span className="flex-1 truncate font-mono text-[10px] text-neutral-400">{deckB || "— empty —"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}