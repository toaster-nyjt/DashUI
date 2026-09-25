export default function GeneratedComponent() {
  type Track = {
    id: string;
    title: string;
    artist: string;
    bpm: number;
    key: string;
    duration: string;
    durationSec: number;
    folder: string;
  };

  const allTracks: Track[] = [
    { id: "t1", title: "Molten Horizon", artist: "Kasu Vela", bpm: 124, key: "8A", duration: "6:12", durationSec: 372, folder: "house" },
    { id: "t2", title: "Brass Cathedral", artist: "Onyx Ré", bpm: 126, key: "9A", duration: "5:48", durationSec: 348, folder: "house" },
    { id: "t3", title: "Tangerine Drift", artist: "Lumen Sol", bpm: 122, key: "7B", duration: "7:04", durationSec: 424, folder: "house" },
    { id: "t4", title: "Ember Protocol", artist: "Vachi", bpm: 128, key: "10A", duration: "6:33", durationSec: 393, folder: "techno" },
    { id: "t5", title: "Graphite Pulse", artist: "Nerø Fade", bpm: 132, key: "11A", duration: "5:21", durationSec: 321, folder: "techno" },
    { id: "t6", title: "Copper Rain", artist: "Seyla", bpm: 130, key: "12A", duration: "6:58", durationSec: 418, folder: "techno" },
    { id: "t7", title: "Violet Routing", artist: "Aeko Dune", bpm: 118, key: "6A", duration: "8:12", durationSec: 492, folder: "deep" },
    { id: "t8", title: "Warm Analog", artist: "Idris Moye", bpm: 120, key: "5B", duration: "7:39", durationSec: 459, folder: "deep" },
    { id: "t9", title: "Amber Undertow", artist: "Saga Lune", bpm: 116, key: "4A", duration: "6:44", durationSec: 404, folder: "deep" },
    { id: "t10", title: "Charcoal Bloom", artist: "Petr Volk", bpm: 123, key: "8B", duration: "5:56", durationSec: 356, folder: "recent" },
    { id: "t11", title: "Solar Cascade", artist: "Miya Rho", bpm: 127, key: "9B", duration: "6:20", durationSec: 380, folder: "recent" },
    { id: "t12", title: "Nightforge", artist: "Delun", bpm: 134, key: "1A", duration: "5:11", durationSec: 311, folder: "recent" },
    { id: "t13", title: "Teal Meridian", artist: "Kasu Vela", bpm: 121, key: "7A", duration: "7:22", durationSec: 442, folder: "recent" },
    { id: "t14", title: "Furnace Glow", artist: "Onyx Ré", bpm: 129, key: "10B", duration: "6:05", durationSec: 365, folder: "techno" },
  ];

  const treeNodes = [
    {
      id: "library",
      label: "LIBRARY",
      children: [
        { id: "recent", label: "Recent Adds" },
        { id: "house", label: "House" },
        { id: "techno", label: "Techno" },
        { id: "deep", label: "Deep / Melodic" },
      ],
    },
  ];

  const columns = [
    { key: "title", label: "Title" },
    { key: "artist", label: "Artist" },
    { key: "bpm", label: "BPM", numeric: true },
    { key: "key", label: "Key" },
    { key: "duration", label: "Time", numeric: true },
  ];

  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("recent");
  const [expanded, setExpanded] = useState<string[]>(["library"]);
  const [selected, setSelected] = useState<string>("t10");
  const [sortKey, setSortKey] = useState<string>("bpm");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [previewId, setPreviewId] = useState<string>("t10");
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  const [flashA, setFlashA] = useState(false);
  const [flashB, setFlashB] = useState(false);
  const [loadedA, setLoadedA] = useState<string | null>(null);
  const [loadedB, setLoadedB] = useState<string | null>(null);

  const previewTrack = useMemo(
    () => allTracks.find((t) => t.id === previewId) || null,
    [previewId]
  );

  const selectedTrack = useMemo(
    () => allTracks.find((t) => t.id === selected) || null,
    [selected]
  );

  const filtered = useMemo(() => {
    let list = allTracks.filter((t) => t.folder === folder);
    const q = query.trim().toLowerCase();
    if (q) {
      list = allTracks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.key.toLowerCase() === q ||
          String(t.bpm).includes(q)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    list = [...list].sort((a, b) => {
      const av = (a as any)[sortKey];
      const bv = (b as any)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return list;
  }, [folder, query, sortKey, sortDir]);

  const rows = useMemo(
    () =>
      filtered.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        bpm: t.bpm,
        key: t.key,
        duration: t.duration,
      })),
    [filtered]
  );

  useEffect(() => {
    if (!playing || !previewTrack) return;
    const iv = setInterval(() => {
      setPosition((p) => {
        if (p >= previewTrack.durationSec) {
          setPlaying(false);
          return 0;
        }
        return p + 1;
      });
    }, 240);
    return () => clearInterval(iv);
  }, [playing, previewTrack]);

  const auditionTrack = (id: string) => {
    setPreviewId(id);
    setPosition(0);
    setPlaying(true);
  };

  const loadToDeck = (deck: "A" | "B") => {
    if (!selectedTrack) return;
    if (deck === "A") {
      setLoadedA(selectedTrack.id);
      setFlashA(true);
      setTimeout(() => setFlashA(false), 650);
    } else {
      setLoadedB(selectedTrack.id);
      setFlashB(true);
      setTimeout(() => setFlashB(false), 650);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-b from-neutral-950 via-stone-950 to-black text-amber-50 font-sans">
      {/* Header */}
      <div className="flex-none h-9 px-3 flex items-center justify-between bg-gradient-to-b from-neutral-800/80 to-neutral-900 border-b border-amber-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 text-[0.9rem] leading-none drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]">◆</span>
          <span className="text-sm font-semibold tracking-wide uppercase text-amber-100 truncate">
            Track Library
          </span>
          <span className="font-mono text-[10px] tracking-wide text-neutral-500 truncate hidden sm:inline">
            / browser
          </span>
        </div>
        <div className="font-mono text-[10px] tracking-wide text-neutral-400 flex items-center gap-2">
          <span className="text-teal-300">{filtered.length}</span>
          <span className="uppercase">tracks</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-3 flex gap-3">
        {/* Left column: tree + search */}
        <div className="flex flex-col gap-3 w-[16rem] flex-none">
          <div className="flex-none">
            <SearchInput
              value={query}
              onChange={setQuery}
              onClear={() => setQuery("")}
              placeholder="Search title / artist / key…"
            />
          </div>
          <div className="flex-1 min-h-0 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col">
            <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 px-1 pb-2 leading-none">
              Playlists
            </div>
            <div className="flex-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 p-2 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TreeSelector
                nodes={treeNodes}
                value={folder}
                onChange={(id) => {
                  if (id === "library") return;
                  setFolder(id);
                  setQuery("");
                }}
                expanded={expanded}
                onToggleExpand={(id) =>
                  setExpanded((e) =>
                    e.includes(id) ? e.filter((x) => x !== id) : [...e, id]
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Center: track table */}
        <div className="flex-1 min-w-0 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 leading-none">
              {query.trim() ? "Search Results" : "Tracks"}
            </span>
            <span className="font-mono text-[10px] tracking-wide text-neutral-500 uppercase">
              sort: <span className="text-amber-300">{sortKey}</span>{" "}
              {sortDir === "asc" ? "↑" : "↓"}
            </span>
          </div>
          <div className="flex-1 rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 overflow-hidden">
            <TrackTable
              columns={columns}
              rows={rows}
              value={selected}
              onChange={setSelected}
              onActivate={auditionTrack}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={(k, d) => {
                setSortKey(k);
                setSortDir(d);
              }}
            />
          </div>
        </div>

        {/* Right: preview + load actions */}
        <div className="flex flex-col gap-3 w-[20rem] flex-none">
          {/* Now staging readout */}
          <div className="flex-none rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
            <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 px-1 pb-1 leading-none">
              Staged
            </div>
            <div className="rounded-xl border border-amber-500/10 bg-gradient-to-b from-black to-neutral-900/80 shadow-inner shadow-black/70 px-3 py-2 flex items-center justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="font-mono font-bold tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.35)] truncate text-[0.95rem] leading-tight">
                  {selectedTrack ? selectedTrack.title : "—"}
                </div>
                <div className="font-mono text-[10px] tracking-wide text-neutral-500 truncate">
                  {selectedTrack ? selectedTrack.artist : "no selection"}
                </div>
              </div>
              <div className="flex-none flex flex-col items-end gap-1">
                <span className="font-mono font-bold text-teal-300 text-[0.85rem] leading-none tracking-tight">
                  {selectedTrack ? selectedTrack.bpm : "--"}
                </span>
                <span className="font-mono text-[10px] tracking-wide text-violet-300 leading-none">
                  {selectedTrack ? selectedTrack.key : "--"}
                </span>
              </div>
            </div>
          </div>

          {/* Preview player */}
          <div className="flex-none rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2">
            <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 px-1 pb-1 leading-none">
              Preview
            </div>
            <PreviewPlayer
              playing={playing}
              position={position}
              duration={previewTrack ? previewTrack.durationSec : 0}
              onPlayToggle={(p) => setPlaying(p)}
              onSeek={(t) => setPosition(t)}
              label={previewTrack ? previewTrack.title : "—"}
            />
          </div>

          {/* Load buttons */}
          <div className="flex-1 min-h-0 rounded-2xl border border-amber-500/15 bg-gradient-to-b from-neutral-900 to-neutral-950 shadow-2xl shadow-black/60 p-2 flex flex-col">
            <div className="text-[11px] font-medium tracking-widest uppercase text-neutral-400 px-1 pb-2 leading-none">
              Load To Deck
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="flex flex-col items-stretch justify-center gap-1">
                <PushButton onPress={() => loadToDeck("A")} tone="accent" disabled={!selectedTrack}>
                  <span className="flex flex-col items-center leading-tight">
                    <span className="text-[0.7em] tracking-widest opacity-80">LOAD ›</span>
                    <span className="tracking-wider">DECK A</span>
                  </span>
                </PushButton>
                <span
                  className={
                    "font-mono text-[10px] tracking-wide text-center uppercase leading-none transition-all duration-500 " +
                    (flashA
                      ? "text-amber-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                      : "text-neutral-500")
                  }
                >
                  {loadedA
                    ? "▸ " + (allTracks.find((t) => t.id === loadedA)?.title ?? "")
                    : "empty"}
                </span>
              </div>

              <div className="flex flex-col items-stretch justify-center gap-1">
                <PushButton onPress={() => loadToDeck("B")} tone="neutral" disabled={!selectedTrack}>
                  <span className="flex flex-col items-center leading-tight">
                    <span className="text-[0.7em] tracking-widest opacity-80">LOAD ›</span>
                    <span className="tracking-wider">DECK B</span>
                  </span>
                </PushButton>
                <span
                  className={
                    "font-mono text-[10px] tracking-wide text-center uppercase leading-none transition-all duration-500 " +
                    (flashB
                      ? "text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                      : "text-neutral-500")
                  }
                >
                  {loadedB
                    ? "▸ " + (allTracks.find((t) => t.id === loadedB)?.title ?? "")
                    : "empty"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer status strip */}
      <div className="flex-none h-7 px-3 flex items-center justify-between bg-neutral-950/90 border-t border-amber-500/15">
        <div className="font-mono text-[10px] tracking-wide text-neutral-400 truncate">
          {folder === "recent"
            ? "RECENT ADDS"
            : folder === "house"
            ? "HOUSE"
            : folder === "techno"
            ? "TECHNO"
            : "DEEP / MELODIC"}
          {query.trim() ? " · filtered" : ""}
        </div>
        <div className="font-mono text-[10px] tracking-wide flex items-center gap-3">
          <span className={playing ? "text-teal-300" : "text-neutral-500"}>
            {playing ? "● AUDITION" : "○ IDLE"}
          </span>
          <span className="text-neutral-500 hidden sm:inline">
            A:<span className={loadedA ? "text-amber-300" : "text-neutral-600"}>{loadedA ? "●" : "○"}</span>{" "}
            B:<span className={loadedB ? "text-teal-300" : "text-neutral-600"}>{loadedB ? "●" : "○"}</span>
          </span>
        </div>
      </div>
    </div>
  );
}