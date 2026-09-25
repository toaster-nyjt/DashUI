export default function GeneratedComponent() {
  const allTracks = [
    { id: "t1", pl: "house", title: "Neon Aqueduct", artist: "Vela Mox", bpm: 124, key: "8A", dur: "6:42" },
    { id: "t2", pl: "house", title: "Brass Monsoon", artist: "Kuro Ito", bpm: 126, key: "5A", dur: "5:18" },
    { id: "t3", pl: "house", title: "Slow Ember", artist: "Dune Parade", bpm: 122, key: "11B", dur: "7:04" },
    { id: "t4", pl: "techno", title: "Cathode Drift", artist: "Nulltide", bpm: 138, key: "2A", dur: "6:11" },
    { id: "t5", pl: "techno", title: "Iron Lattice", artist: "Fermi Cell", bpm: 142, key: "9A", dur: "5:47" },
    { id: "t6", pl: "techno", title: "Basalt Rite", artist: "Hex Ravine", bpm: 135, key: "4A", dur: "8:22" },
    { id: "t7", pl: "disco", title: "Velvet Circuit", artist: "Solar Pigeon", bpm: 118, key: "7B", dur: "4:56" },
    { id: "t8", pl: "disco", title: "Chrome Sunset", artist: "The Maribel", bpm: 114, key: "12B", dur: "5:33" },
    { id: "t9", pl: "ambient", title: "Glass Harbour", artist: "Ilka Wren", bpm: 92, key: "3B", dur: "9:10" },
    { id: "t10", pl: "ambient", title: "Pale Meridian", artist: "Osmo Lake", bpm: 88, key: "6B", dur: "7:39" },
    { id: "t11", pl: "house", title: "Tangerine Static", artist: "Vela Mox", bpm: 125, key: "8B", dur: "6:02" },
    { id: "t12", pl: "techno", title: "Null Vector", artist: "Fermi Cell", bpm: 140, key: "1A", dur: "6:58" },
  ];

  const [query, setQuery] = useState("");
  const [node, setNode] = useState("house");
  const [expanded, setExpanded] = useState<string[]>(["lib", "crates"]);
  const [sel, setSel] = useState("t1");
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [deckA, setDeckA] = useState<string | null>(null);
  const [deckB, setDeckB] = useState<string | null>(null);
  const [flash, setFlash] = useState<string>("");

  useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setPos((p) => (p >= 210 ? 0 : p + 0.25)), 250);
    return () => clearInterval(i);
  }, [playing]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(""), 1100);
    return () => clearTimeout(t);
  }, [flash]);

  const nodes = [
    {
      id: "lib",
      label: "LIBRARY",
      children: [
        { id: "all", label: "All Tracks" },
        { id: "ambient", label: "Ambient" },
      ],
    },
    {
      id: "crates",
      label: "CRATES",
      children: [
        { id: "house", label: "House Sets" },
        { id: "techno", label: "Techno 138+" },
        { id: "disco", label: "Disco Edits" },
      ],
    },
  ];

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = allTracks.filter((t) => {
      const inNode = node === "all" || node === "lib" || node === "crates" ? true : t.pl === node;
      const inQ = !q || (t.title + " " + t.artist + " " + t.key).toLowerCase().includes(q);
      return inNode && inQ;
    });
    r = [...r].sort((a: any, b: any) => {
      const x = a[sortKey], y = b[sortKey];
      const c = typeof x === "number" ? x - y : String(x).localeCompare(String(y));
      return sortDir === "asc" ? c : -c;
    });
    return r.map((t) => ({ id: t.id, title: t.title, artist: t.artist, bpm: t.bpm, key: t.key, dur: t.dur }));
  }, [query, node, sortKey, sortDir]);

  const current = allTracks.find((t) => t.id === sel);
  const nameOf = (id: string | null) => (id ? allTracks.find((t) => t.id === id)?.title || "—" : "EMPTY");

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50">
      <div className="h-9 flex-none px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 animate-pulse">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100">Track Library Browser</span>
        </div>
        <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
          {rows.length} results · sorted {sortKey}/{sortDir}
        </span>
      </div>

      <div className="flex-1 flex flex-row gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* LEFT: search + tree */}
        <div className="w-[17rem] flex flex-col gap-2">
          <div className="h-[2rem] w-full">
            <SearchInput value={query} onChange={setQuery} placeholder="Search title / artist / key" onClear={() => setQuery("")} />
          </div>
          <div className="flex-1 w-full rounded-xl border border-amber-500/10 bg-black/70 shadow-inner shadow-black/70 p-2">
            <div className="h-full w-full">
              <TreeSelector
                nodes={nodes}
                value={node}
                onChange={setNode}
                expanded={expanded}
                onToggleExpand={(id) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))}
              />
            </div>
          </div>
        </div>

        {/* CENTER: table */}
        <div className="flex-1 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
          <div className="h-full w-full">
            <TrackTable
              columns={[
                { key: "title", label: "Title" },
                { key: "artist", label: "Artist" },
                { key: "bpm", label: "BPM", numeric: true },
                { key: "key", label: "Key" },
                { key: "dur", label: "Time", numeric: true },
              ]}
              rows={rows}
              value={sel}
              onChange={(id) => { setSel(id); setPos(0); }}
              onActivate={(id) => { setSel(id); setPlaying(true); }}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={(k, d) => { setSortKey(k); setSortDir(d); }}
            />
          </div>
        </div>

        {/* RIGHT: preview + load */}
        <div className="w-[21rem] flex flex-col gap-2">
          <div className="rounded-xl border border-amber-500/10 bg-black/70 shadow-inner shadow-black/70 px-2 py-1.5 flex flex-col gap-1">
            <div className="font-mono font-bold tracking-tight text-amber-300 truncate drop-shadow-[0_0_8px_rgba(251,146,60,0.35)]">
              {current ? current.title : "NO SELECTION"}
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono tracking-wide text-neutral-500">
              <span className="truncate text-neutral-300">{current ? current.artist : "—"}</span>
              <span className="text-teal-300">{current ? current.bpm + " BPM · " + current.key : "--"}</span>
            </div>
          </div>

          <div className="h-[2.4rem] w-full">
            <PreviewPlayer
              playing={playing}
              position={pos}
              duration={210}
              onPlayToggle={setPlaying}
              onSeek={setPos}
              label="PREVIEW"
            />
          </div>

          <div className="flex-1 flex flex-row gap-2">
            <div className={"flex-1 flex flex-col gap-1 rounded-xl border p-2 transition-all duration-500 " + (flash === "A" ? "border-amber-400/60 shadow-[0_0_16px_rgba(251,146,60,0.45)] bg-amber-500/10" : "border-amber-500/15 bg-neutral-900/80")}>
              <div className="text-[10px] font-mono tracking-widest uppercase text-amber-400">Deck A</div>
              <div className="flex-1 w-full">
                <PushButton
                  tone="accent"
                  disabled={!current}
                  onPress={() => { if (current) { setDeckA(current.id); setFlash("A"); } }}
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-mono font-bold tracking-widest">LOAD ▸ A</span>
                    <span className="text-[0.62em] font-mono tracking-wide opacity-70">{nameOf(deckA)}</span>
                  </span>
                </PushButton>
              </div>
            </div>
            <div className={"flex-1 flex flex-col gap-1 rounded-xl border p-2 transition-all duration-500 " + (flash === "B" ? "border-teal-400/60 shadow-[0_0_16px_rgba(45,212,191,0.4)] bg-teal-500/10" : "border-amber-500/15 bg-neutral-900/80")}>
              <div className="text-[10px] font-mono tracking-widest uppercase text-teal-300">Deck B</div>
              <div className="flex-1 w-full">
                <PushButton
                  tone="neutral"
                  disabled={!current}
                  onPress={() => { if (current) { setDeckB(current.id); setFlash("B"); } }}
                >
                  <span className="flex flex-col items-center leading-tight">
                    <span className="font-mono font-bold tracking-widest">LOAD ▸ B</span>
                    <span className="text-[0.62em] font-mono tracking-wide opacity-70">{nameOf(deckB)}</span>
                  </span>
                </PushButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-7 flex-none px-3 bg-neutral-950/90 border-t border-amber-500/15 flex items-center justify-between font-mono text-[10px] tracking-wide text-neutral-400">
        <span>CRATE: <span className="text-amber-300">{node.toUpperCase()}</span>{query ? " · FILTER “" + query + "”" : ""}</span>
        <span className={playing ? "text-teal-300" : ""}>{playing ? "▶ PREVIEWING" : "◼ PREVIEW IDLE"}</span>
        <span>A: <span className="text-amber-300">{nameOf(deckA)}</span> · B: <span className="text-teal-300">{nameOf(deckB)}</span></span>
      </div>
    </div>
  );
}