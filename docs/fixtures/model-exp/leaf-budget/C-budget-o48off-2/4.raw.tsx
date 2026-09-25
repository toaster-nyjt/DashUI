export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body 18.55 (>= TreeSelector 4, TrackTable 6) + footer 0 = 20.8 <= 20.8
  // BUDGET width: p-3 0.75 + tree 15 + gap 0.75 + [table 60 (min TrackTable 11) over PreviewPlayer 9] + gap 0.75 + rightRail 15 + p-3 0.75 = 93 <= 93.6

  const [query, setQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState("house");
  const [expanded, setExpanded] = useState<string[]>(["library", "genres"]);
  const [selectedTrack, setSelectedTrack] = useState("t3");
  const [sortKey, setSortKey] = useState("bpm");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [previewing, setPreviewing] = useState(false);
  const [previewPos, setPreviewPos] = useState(38);
  const [loadedA, setLoadedA] = useState<string | null>(null);
  const [loadedB, setLoadedB] = useState<string | null>(null);
  const [flashA, setFlashA] = useState(false);
  const [flashB, setFlashB] = useState(false);

  const nodes = [
    {
      id: "library",
      label: "Library",
      children: [
        { id: "recent", label: "Recently Added" },
        { id: "played", label: "Recently Played" },
        {
          id: "genres",
          label: "Genres",
          children: [
            { id: "house", label: "House" },
            { id: "techno", label: "Techno" },
            { id: "dnb", label: "Drum & Bass" },
            { id: "disco", label: "Nu-Disco" },
          ],
        },
        {
          id: "sets",
          label: "Playlists",
          children: [
            { id: "warmup", label: "Warm-Up" },
            { id: "peak", label: "Peak Time" },
            { id: "closing", label: "Closing Set" },
          ],
        },
      ],
    },
  ];

  const columns = [
    { key: "title", label: "Title" },
    { key: "artist", label: "Artist" },
    { key: "bpm", label: "BPM", numeric: true },
    { key: "key", label: "Key" },
    { key: "duration", label: "Time" },
  ];

  const allRows = useMemo(
    () => [
      { id: "t1", title: "Molten Horizon", artist: "Auralux", bpm: 124, key: "8A", duration: "6:12" },
      { id: "t2", title: "Brass Cathedral", artist: "Vellichor", bpm: 126, key: "9A", duration: "5:48" },
      { id: "t3", title: "Amber Currents", artist: "Neon Tide", bpm: 122, key: "5A", duration: "7:03" },
      { id: "t4", title: "Ember Drift", artist: "Solene", bpm: 128, key: "11B", duration: "6:34" },
      { id: "t5", title: "Copper Skyline", artist: "Halcyon Bloom", bpm: 123, key: "7A", duration: "5:21" },
      { id: "t6", title: "Tangerine Pulse", artist: "Ketsa", bpm: 174, key: "4A", duration: "4:57" },
      { id: "t7", title: "Graphite Rain", artist: "Auralux", bpm: 130, key: "2A", duration: "6:45" },
      { id: "t8", title: "Velvet Reactor", artist: "Nocturne", bpm: 125, key: "10A", duration: "7:19" },
      { id: "t9", title: "Molten Nights", artist: "Solene", bpm: 118, key: "6B", duration: "5:03" },
      { id: "t10", title: "Radiant Static", artist: "Vellichor", bpm: 127, key: "12A", duration: "6:08" },
      { id: "t11", title: "Sunset Protocol", artist: "Neon Tide", bpm: 120, key: "3A", duration: "6:52" },
      { id: "t12", title: "Cinder Bloom", artist: "Ketsa", bpm: 172, key: "1A", duration: "4:41" },
    ],
    []
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? allRows.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.artist.toLowerCase().includes(q) ||
            r.key.toLowerCase().includes(q)
        )
      : allRows;
    const sorted = [...filtered].sort((a, b) => {
      const av = a[sortKey as keyof typeof a];
      const bv = b[sortKey as keyof typeof b];
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [allRows, query, sortKey, sortDir]);

  const active = useMemo(
    () => allRows.find((r) => r.id === selectedTrack) || allRows[0],
    [allRows, selectedTrack]
  );

  const previewDuration = useMemo(() => {
    const [m, s] = active.duration.split(":").map(Number);
    return m * 60 + s;
  }, [active]);

  useEffect(() => {
    if (!previewing) return;
    const iv = setInterval(() => {
      setPreviewPos((p) => (p + 1 >= previewDuration ? 0 : p + 1));
    }, 1000);
    return () => clearInterval(iv);
  }, [previewing, previewDuration]);

  useEffect(() => {
    setPreviewPos(0);
  }, [selectedTrack]);

  const loadA = () => {
    setLoadedA(active.id);
    setFlashA(true);
    setTimeout(() => setFlashA(false), 600);
  };
  const loadB = () => {
    setLoadedB(active.id);
    setFlashB(true);
    setTimeout(() => setFlashB(false), 600);
  };

  const loadedATrack = allRows.find((r) => r.id === loadedA);
  const loadedBTrack = allRows.find((r) => r.id === loadedB);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] text-amber-50 font-sans">
      {/* Header */}
      <div className="h-9 flex-none flex items-center justify-between px-3 bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-base leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">◈</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Track Library
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-wide text-neutral-400">
          <span className="hidden sm:inline">{rows.length} TRACKS</span>
          <span className="text-teal-300">BROWSER</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex gap-3 p-3">
        {/* Left: Folder / Playlist Tree */}
        <div className="w-56 flex-none flex flex-col rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 overflow-clip">
          <div className="px-3 py-2 border-b border-amber-500/10">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Playlists
            </span>
          </div>
          <div className="flex-1 p-2 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TreeSelector
              nodes={nodes}
              value={selectedNode}
              onChange={setSelectedNode}
              expanded={expanded}
              onToggleExpand={(id) =>
                setExpanded((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                )
              }
            />
          </div>
        </div>

        {/* Center: Search + Table + Preview */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex-none">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search tracks, artists, keys…"
              onClear={() => setQuery("")}
            />
          </div>

          <div className="flex-1 min-h-0 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 overflow-clip">
            <div className="h-full overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TrackTable
                columns={columns}
                rows={rows}
                value={selectedTrack}
                onChange={setSelectedTrack}
                onActivate={loadA}
                sortKey={sortKey}
                sortDir={sortDir}
                onSortChange={(key, dir) => {
                  setSortKey(key);
                  setSortDir(dir);
                }}
              />
            </div>
          </div>

          <div className="flex-none">
            <PreviewPlayer
              playing={previewing}
              position={previewPos}
              duration={previewDuration}
              onPlayToggle={setPreviewing}
              onSeek={setPreviewPos}
              label={active.title + " — " + active.artist}
            />
          </div>
        </div>

        {/* Right: Staging / Load */}
        <div className="w-56 flex-none flex flex-col rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 overflow-clip">
          <div className="px-3 py-2 border-b border-amber-500/10">
            <span className="text-[11px] font-medium tracking-widest uppercase leading-none text-neutral-400">
              Load Selected
            </span>
          </div>

          <div className="flex-1 min-h-0 flex flex-col gap-2 p-3">
            {/* Selected track readout */}
            <div className="rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2">
              <div className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] text-sm leading-tight truncate">
                {active.title}
              </div>
              <div className="text-[10px] tracking-wide text-neutral-500 truncate">
                {active.artist}
              </div>
              <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] tracking-wide">
                <span className="px-1.5 py-0.5 rounded-md border border-amber-500/20 bg-neutral-800 text-amber-100">
                  {active.bpm} BPM
                </span>
                <span className="px-1.5 py-0.5 rounded-md border border-teal-400/40 bg-teal-500/10 text-teal-300">
                  {active.key}
                </span>
                <span className="text-neutral-400">{active.duration}</span>
              </div>
            </div>

            {/* Load buttons */}
            <div className="grid grid-cols-2 gap-2">
              <div className={"h-9 transition-all duration-500 " + (flashA ? "drop-shadow-[0_0_16px_rgba(251,146,60,0.55)]" : "")}>
                <PushButton onPress={loadA} tone="accent">
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[0.7em] tracking-widest text-neutral-950/70">LOAD</span>
                    <span className="tracking-wider">DECK A</span>
                  </span>
                </PushButton>
              </div>
              <div className={"h-9 transition-all duration-500 " + (flashB ? "drop-shadow-[0_0_16px_rgba(45,212,191,0.5)]" : "")}>
                <PushButton onPress={loadB} tone="neutral">
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[0.7em] tracking-widest text-teal-300/80">LOAD</span>
                    <span className="tracking-wider text-teal-200">DECK B</span>
                  </span>
                </PushButton>
              </div>
            </div>

            {/* Staged status */}
            <div className="mt-auto grid grid-cols-2 gap-2 font-mono text-[10px] tracking-wide">
              <div className="rounded-md border border-amber-500/20 bg-neutral-950/70 px-2 py-1.5 overflow-clip">
                <div className="text-amber-400 uppercase tracking-widest text-[9px]">Deck A</div>
                <div className="truncate text-neutral-300 mt-0.5">
                  {loadedATrack ? loadedATrack.title : "— empty —"}
                </div>
              </div>
              <div className="rounded-md border border-teal-400/30 bg-neutral-950/70 px-2 py-1.5 overflow-clip">
                <div className="text-teal-300 uppercase tracking-widest text-[9px]">Deck B</div>
                <div className="truncate text-neutral-300 mt-0.5">
                  {loadedBTrack ? loadedBTrack.title : "— empty —"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}