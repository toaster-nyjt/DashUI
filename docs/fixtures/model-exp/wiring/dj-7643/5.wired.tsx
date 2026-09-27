export default function GeneratedComponent() {
  // BUDGET height: header 2.25 + p 0.75 + search 2 + gap 0.5 + tracklist 12.05 + gap 0.5 + buttons 2 + p 0.75 + footer 1.75 = 24.3 ≤ 24.3
  // BUDGET width: p 0.75 + sidebar 11 + gap 0.75 + main 35.35 + p 0.75 = 48.6 ≤ 48.6

  const [query, setQuery] = useState("");
  const [crate, setCrate] = useState("house");
  const [expanded, setExpanded] = useState<string[]>(["lib", "genres"]);
  const [selected, setSelected] = useState("t3");
  const [sortKey, setSortKey] = useState("bpm");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [preview, setPreview] = useState(false);
  const [loaded, setLoaded] = useState<{ a: string | null; b: string | null }>({ a: null, b: null });
  const [flash, setFlash] = useState<string>("");

  const nodes = useMemo(
    () => [
      {
        id: "lib",
        label: "Library",
        count: 248,
        children: [
          { id: "recent", label: "Recently Added", count: 24 },
          { id: "prepare", label: "Prepare", count: 9 },
        ],
      },
      {
        id: "genres",
        label: "Genres",
        count: 186,
        children: [
          { id: "house", label: "Deep House", count: 62 },
          { id: "techno", label: "Techno", count: 48 },
          { id: "dnb", label: "Drum & Bass", count: 31 },
          { id: "disco", label: "Nu Disco", count: 45 },
        ],
      },
      { id: "usb", label: "USB / RANE-01", count: 74 },
    ],
    []
  );

  const allTracks = useMemo(
    () => [
      { id: "t1", title: "Violet Hours", artist: "Kaito Mori", bpm: 122, key: "8A", duration: 384, crate: "house" },
      { id: "t2", title: "Neon Sublimation", artist: "AURA/9", bpm: 126, key: "5A", duration: 412, crate: "house" },
      { id: "t3", title: "Cold Signal", artist: "Vessel Park", bpm: 128, key: "11B", duration: 356, crate: "techno" },
      { id: "t4", title: "Marble Skin", artist: "Lune Étoile", bpm: 124, key: "3A", duration: 298, crate: "house" },
      { id: "t5", title: "Iron Lantern", artist: "Sevvo", bpm: 134, key: "7B", duration: 421, crate: "techno" },
      { id: "t6", title: "Glass Motorway", artist: "Nia Ferro", bpm: 118, key: "2A", duration: 331, crate: "disco" },
      { id: "t7", title: "Halogen Dust", artist: "Mode Collapse", bpm: 140, key: "9A", duration: 289, crate: "techno" },
      { id: "t8", title: "Undercurrent", artist: "Sable Rhodes", bpm: 174, key: "12B", duration: 366, crate: "dnb" },
      { id: "t9", title: "Paper Moon Rework", artist: "Otto Vane", bpm: 120, key: "6A", duration: 402, crate: "disco" },
      { id: "t10", title: "Static Bloom", artist: "Kaito Mori", bpm: 130, key: "10A", duration: 344, crate: "techno" },
      { id: "t11", title: "Low Orbit Lovers", artist: "AURA/9", bpm: 123, key: "4B", duration: 377, crate: "house" },
      { id: "t12", title: "Midnight Ledger", artist: "Rue Delacroix", bpm: 172, key: "1A", duration: 312, crate: "dnb" },
    ],
    []
  );

  // Deterministic normalized waveform samples derived from a track's identity.
  const waveformFor = (id: string, bpm: number, duration: number) => {
    let seed = bpm + duration;
    for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 100000;
    const samples: number[] = [];
    for (let i = 0; i < 8; i++) {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      samples.push(Math.round(((seed % 1000) / 1000) * 100) / 100);
    }
    return samples;
  };

  const columns = [
    { id: "title", label: "Title", sortable: true },
    { id: "artist", label: "Artist", sortable: true },
    { id: "bpm", label: "BPM", sortable: true },
    { id: "key", label: "Key", sortable: true },
    { id: "duration", label: "Time", sortable: true },
  ];

  const tracks = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = allTracks.filter((t) => {
      const inCrate =
        crate === "lib" || crate === "recent" || crate === "prepare" || crate === "usb" || crate === "genres"
          ? true
          : t.crate === crate;
      const match = !q || t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q) || t.key.toLowerCase().includes(q);
      return inCrate && match;
    });
    list = [...list].sort((a: any, b: any) => {
      const av = a[sortKey], bv = b[sortKey];
      const c = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? c : -c;
    });
    return list;
  }, [allTracks, query, crate, sortKey, sortDir]);

  useEffect(() => {
    if (tracks.length && !tracks.some((t) => t.id === selected)) setSelected(tracks[0].id);
  }, [tracks, selected]);

  const current = allTracks.find((t) => t.id === selected);

  const load = (deck: "a" | "b") => {
    if (!current) return;
    const waveform = waveformFor(current.id, current.bpm, current.duration);
    if (deck === "a") {
      bus.emit("DJ Table: Track Library Browser->DJ Table: Left Deck (Deck A)", {
        title: current.title,
        artist: current.artist,
        bpm: current.bpm,
        key: current.key,
        duration: current.duration,
        waveform,
      });
    } else {
      bus.emit("DJ Table: Track Library Browser->DJ Table: Right Deck (Deck B)", {
        id: current.id,
        title: current.title,
        artist: current.artist,
        bpm: current.bpm,
        key: current.key,
        duration: current.duration,
        cuePoint: 0,
        waveform,
      });
    }
    setLoaded((p) => ({ ...p, [deck]: current.id }));
    setFlash(deck);
    window.setTimeout(() => setFlash(""), 700);
  };

  const labelOf = (id: string | null) => {
    const t = allTracks.find((x) => x.id === id);
    return t ? t.title : "—";
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-gradient-to-br from-[#0a0612] via-[#120a1f] to-[#050308] text-zinc-100 font-sans">
      {/* HEADER */}
      <div className="h-9 flex-none flex items-center gap-2 px-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-violet-500/25">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_currentColor] text-emerald-400 animate-pulse" />
        <span className="text-sm font-bold tracking-[0.18em] uppercase text-zinc-200 truncate">Track Library Browser</span>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-300/80">
          {tracks.length} / {allTracks.length} trk
        </span>
      </div>

      {/* BODY */}
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* SIDEBAR */}
        <div className="w-[11rem] flex flex-col gap-2">
          <div className="text-[11px] font-semibold tracking-[0.14em] uppercase leading-none text-zinc-500">Crates</div>
          <div className="flex-1 rounded-xl border border-zinc-800/80 bg-[#08060f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] p-1.5 overflow-clip">
            <TreeSelector
              nodes={nodes}
              value={crate}
              onChange={setCrate}
              expanded={expanded}
              onExpandedChange={setExpanded}
            />
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex flex-col gap-2">
          {/* SEARCH ROW */}
          <div className="h-8 flex items-center gap-2">
            <div className="flex-1 h-8">
              <TextInput
                value={query}
                onChange={setQuery}
                placeholder="SEARCH TITLE / ARTIST / KEY…"
                onSubmit={(t) => setQuery(t)}
              />
            </div>
            <div className="w-[9rem] h-8">
              <PushButton mode="toggle" on={preview} onChange={setPreview} tone={preview ? "accent" : "neutral"}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-bold uppercase tracking-[0.12em]">{preview ? "◼ Previewing" : "▶ Preview"}</span>
                  <span className="text-[0.62em] tracking-[0.2em] opacity-70">CUE OUT</span>
                </span>
              </PushButton>
            </div>
          </div>

          {/* TABLE */}
          <div className="flex-1 rounded-xl border border-zinc-800/80 bg-[#08060f] shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] overflow-clip">
            <TrackList
              tracks={tracks}
              columns={columns}
              value={selected}
              onChange={setSelected}
              onActivate={() => load("a")}
              sortKey={sortKey}
              sortDirection={sortDir}
              onSortChange={(k, d) => {
                setSortKey(k);
                setSortDir(d);
              }}
            />
          </div>

          {/* LOAD ROW */}
          <div className="h-9 flex items-center gap-2">
            <div className="flex-1 truncate text-[11px] font-mono uppercase tracking-[0.14em] text-zinc-500">
              <span className="text-zinc-300">{current ? current.title : "NO SELECTION"}</span>
              {current ? <span className="text-emerald-300/70"> · {current.bpm} BPM · {current.key}</span> : null}
            </div>
            <div className="w-[10rem] h-9">
              <PushButton mode="momentary" onPress={() => load("a")} tone="accent" disabled={!current}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-bold uppercase tracking-[0.14em] text-cyan-200">Load ▸ Deck A</span>
                  <span className="text-[0.6em] tracking-[0.18em] opacity-60">{labelOf(loaded.a)}</span>
                </span>
              </PushButton>
            </div>
            <div className="w-[10rem] h-9">
              <PushButton mode="momentary" onPress={() => load("b")} tone="accent" disabled={!current}>
                <span className="flex flex-col items-center leading-none">
                  <span className="font-bold uppercase tracking-[0.14em] text-amber-200">Load ▸ Deck B</span>
                  <span className="text-[0.6em] tracking-[0.18em] opacity-60">{labelOf(loaded.b)}</span>
                </span>
              </PushButton>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="h-7 flex-none flex items-center gap-3 px-3 bg-zinc-950/90 border-t border-zinc-800/80 text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
        <span className="truncate">SORT {sortKey}/{sortDir}</span>
        <span className="text-zinc-700">|</span>
        <span className="truncate">CRATE {crate}</span>
        <span className="ml-auto flex items-center gap-2">
          <span className={"transition-all duration-200 " + (flash === "a" ? "text-cyan-300 drop-shadow-[0_0_6px_currentColor]" : "")}>A:{labelOf(loaded.a).slice(0, 14)}</span>
          <span className="text-zinc-700">|</span>
          <span className={"transition-all duration-200 " + (flash === "b" ? "text-amber-300 drop-shadow-[0_0_6px_currentColor]" : "")}>B:{labelOf(loaded.b).slice(0, 14)}</span>
        </span>
      </div>
    </div>
  );
}