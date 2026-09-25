export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + body 18.55 (>= TrackTable 6, TreeSelector 4) = 20.8 <= 20.8
  // BUDGET width: p-3(0.75) + tree 16 + gap-3(0.75) + main-col flex-1(~57.6) + gap-3(0.75) + stage 16 + p-3(0.75) = ~93.4 <= 93.6

  type Track = {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    key: string;
    duration: string;
    _dur: number;
    _folder: string;
  };

  const ALL_TRACKS: Track[] = [
    { id: "t1", title: "Molten Skyline", artist: "Auralux", bpm: 124, key: "8A", duration: "6:42", _dur: 402, _folder: "house" },
    { id: "t2", title: "Amber Currents", artist: "Nyx Falco", bpm: 126, key: "9A", duration: "7:18", _dur: 438, _folder: "house" },
    { id: "t3", title: "Brass Horizon", artist: "Solvent", bpm: 122, key: "5B", duration: "5:55", _dur: 355, _folder: "house" },
    { id: "t4", title: "Tangerine Drift", artist: "Kilo Mode", bpm: 128, key: "11A", duration: "6:03", _dur: 363, _folder: "techno" },
    { id: "t5", title: "Graphite Pulse", artist: "Verta", bpm: 130, key: "12A", duration: "7:44", _dur: 464, _folder: "techno" },
    { id: "t6", title: "Ember Protocol", artist: "Halcyon 9", bpm: 132, key: "1A", duration: "6:29", _dur: 389, _folder: "techno" },
    { id: "t7", title: "Cyan Undertow", artist: "Marlo Vex", bpm: 118, key: "4A", duration: "5:12", _dur: 312, _folder: "chill" },
    { id: "t8", title: "Violet Signal", artist: "Estra", bpm: 120, key: "7B", duration: "6:58", _dur: 418, _folder: "chill" },
    { id: "t9", title: "Copper Rain", artist: "Dune Kestrel", bpm: 115, key: "3A", duration: "5:47", _dur: 347, _folder: "chill" },
    { id: "t10", title: "Ignition Line", artist: "Auralux", bpm: 127, key: "10A", duration: "6:11", _dur: 371, _folder: "recent" },
    { id: "t11", title: "Nocturne Alloy", artist: "Solvent", bpm: 123, key: "6A", duration: "7:02", _dur: 422, _folder: "recent" },
    { id: "t12", title: "Solar Resonance", artist: "Verta", bpm: 129, key: "2A", duration: "6:37", _dur: 397, _folder: "recent" },
    { id: "t13", title: "Deep Filament", artist: "Nyx Falco", bpm: 121, key: "8B", duration: "5:34", _dur: 334, _folder: "house" },
    { id: "t14", title: "Kinetic Ash", artist: "Kilo Mode", bpm: 134, key: "12B", duration: "6:50", _dur: 410, _folder: "techno" },
    { id: "t15", title: "Glass Meridian", artist: "Estra", bpm: 117, key: "5A", duration: "6:20", _dur: 380, _folder: "chill" },
    { id: "t16", title: "Overdrive Bloom", artist: "Halcyon 9", bpm: 131, key: "11B", duration: "7:26", _dur: 446, _folder: "recent" },
  ];

  const TREE = [
    {
      id: "library",
      label: "Library",
      children: [
        { id: "recent", label: "Recently Added" },
        {
          id: "genres",
          label: "Genres",
          children: [
            { id: "house", label: "House" },
            { id: "techno", label: "Techno" },
            { id: "chill", label: "Chill / Downtempo" },
          ],
        },
      ],
    },
  ];

  const COLUMNS = [
    { key: "title", label: "Title" },
    { key: "artist", label: "Artist" },
    { key: "bpm", label: "BPM", numeric: true },
    { key: "key", label: "Key" },
    { key: "duration", label: "Time", numeric: true },
  ];

  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("library");
  const [expanded, setExpanded] = useState<string[]>(["library", "genres"]);
  const [selected, setSelected] = useState("t1");
  const [sortKey, setSortKey] = useState("title");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [loadedA, setLoadedA] = useState<string | null>(null);
  const [loadedB, setLoadedB] = useState<string | null>(null);
  const [flashA, setFlashA] = useState(false);
  const [flashB, setFlashB] = useState(false);

  const folderMatch = (t: Track) => {
    if (folder === "library" || folder === "genres") return true;
    return t._folder === folder;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = ALL_TRACKS.filter(folderMatch).filter((t) => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.key.toLowerCase().includes(q) ||
        String(t.bpm).includes(q)
      );
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...base].sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (sortKey === "bpm") {
        av = a.bpm;
        bv = b.bpm;
      } else if (sortKey === "duration") {
        av = a._dur;
        bv = b._dur;
      } else {
        av = (a as any)[sortKey];
        bv = (b as any)[sortKey];
      }
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [query, folder, sortKey, sortDir]);

  const selectedTrack =
    filtered.find((t) => t.id === selected) || ALL_TRACKS.find((t) => t.id === selected) || null;

  const previewDuration = selectedTrack ? selectedTrack._dur : 0;

  useEffect(() => {
    setPlaying(false);
    setPosition(0);
  }, [selected]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPosition((p) => {
        const next = p + 0.4;
        if (next >= previewDuration) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing, previewDuration]);

  const loadDeck = (deck: "A" | "B") => {
    if (!selectedTrack) return;
    if (deck === "A") {
      setLoadedA(selectedTrack.id);
      setFlashA(true);
      setTimeout(() => setFlashA(false), 600);
    } else {
      setLoadedB(selectedTrack.id);
      setFlashB(true);
      setTimeout(() => setFlashB(false), 600);
    }
  };

  const loadedARow = ALL_TRACKS.find((t) => t.id === loadedA) || null;
  const loadedBRow = ALL_TRACKS.find((t) => t.id === loadedB) || null;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black bg-[radial-gradient(ellipse_at_top,rgba(251,146,60,0.06),transparent_60%)] text-amber-50">
      {/* Header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)] text-base leading-none">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Track Library Browser
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-[10px] tracking-wide text-neutral-400">
          {filtered.length} TRACKS
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex gap-3 p-3">
        {/* Left: Folder / Playlist Tree */}
        <div className="w-[16rem] flex flex-col gap-2 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/15 rounded-2xl shadow-2xl shadow-black/60 p-3">
          <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
            Playlists
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-gradient-to-b from-black to-neutral-900/80 border border-amber-500/10 rounded-xl shadow-inner shadow-black/70 p-2">
            <TreeSelector
              nodes={TREE}
              value={folder}
              onChange={setFolder}
              expanded={expanded}
              onToggleExpand={(id) =>
                setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]))
              }
            />
          </div>
        </div>

        {/* Center: Search + Table */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex-none">
            <SearchInput
              value={query}
              onChange={setQuery}
              onClear={() => setQuery("")}
              placeholder="Search title, artist, BPM or key…"
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-black to-neutral-900/80 border border-amber-500/10 rounded-xl shadow-inner shadow-black/70">
            <TrackTable
              columns={COLUMNS}
              rows={filtered}
              value={selected}
              onChange={setSelected}
              onActivate={(id) => {
                setSelected(id);
                loadDeck("A");
              }}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={(k, d) => {
                setSortKey(k);
                setSortDir(d);
              }}
            />
          </div>
        </div>

        {/* Right: Staging (Preview + Load buttons) */}
        <div className="w-[16rem] flex flex-col gap-2 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/15 rounded-2xl shadow-2xl shadow-black/60 p-3">
          <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
            Staging
          </div>

          {/* Selected track meta */}
          <div className="bg-gradient-to-b from-black to-neutral-900/80 border border-amber-500/10 rounded-xl shadow-inner shadow-black/70 p-2 flex flex-col gap-1 min-w-0">
            <div className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] text-sm truncate">
              {selectedTrack ? selectedTrack.title : "—"}
            </div>
            <div className="text-[10px] font-normal tracking-wide text-neutral-500 truncate">
              {selectedTrack ? selectedTrack.artist : "No track selected"}
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="font-mono text-[10px] tracking-wide text-teal-300">
                {selectedTrack ? selectedTrack.bpm + " BPM" : "-- BPM"}
              </span>
              <span className="font-mono text-[10px] tracking-wide text-violet-300">
                {selectedTrack ? selectedTrack.key : "--"}
              </span>
              <span className="font-mono text-[10px] tracking-wide text-neutral-400 ml-auto">
                {selectedTrack ? selectedTrack.duration : "-:--"}
              </span>
            </div>
          </div>

          {/* Preview player */}
          <div className="flex-none">
            <PreviewPlayer
              playing={playing}
              position={position}
              duration={previewDuration}
              onPlayToggle={setPlaying}
              onSeek={setPosition}
              label="Preview"
            />
          </div>

          {/* Load buttons */}
          <div className="mt-auto flex flex-col gap-2">
            <div className={"transition-all duration-500 rounded-lg " + (flashA ? "shadow-[0_0_16px_rgba(251,146,60,0.45)]" : "")}>
              <PushButton onPress={() => loadDeck("A")} tone="accent" disabled={!selectedTrack}>
                <span className="flex flex-col items-center leading-tight">
                  <span className="font-mono font-semibold tracking-wider uppercase">Load ▸ Deck A</span>
                  <span className="text-[0.7em] font-mono tracking-wide opacity-80">
                    {loadedARow ? loadedARow.title : "empty"}
                  </span>
                </span>
              </PushButton>
            </div>
            <div className={"transition-all duration-500 rounded-lg " + (flashB ? "shadow-[0_0_16px_rgba(45,212,191,0.4)]" : "")}>
              <PushButton onPress={() => loadDeck("B")} tone="neutral" disabled={!selectedTrack}>
                <span className="flex flex-col items-center leading-tight text-teal-200">
                  <span className="font-mono font-semibold tracking-wider uppercase">Load ▸ Deck B</span>
                  <span className="text-[0.7em] font-mono tracking-wide opacity-80">
                    {loadedBRow ? loadedBRow.title : "empty"}
                  </span>
                </span>
              </PushButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}