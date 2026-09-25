type TrackListProps = { options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[]; value: string; onChange: (id: string) => void; onActivate?: (id: string) => void };

export const TrackList_MIN = {"base":[13,7]};

export function TrackList(props: TrackListProps) {
  const { options, value, onChange, onActivate } = props;
  const uid = useRef("tracklist-" + Math.random().toString(36).slice(2)).current;
  const floor = TrackList_MIN.base;

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);
  const [pulseId, setPulseId] = useState<string | null>(null);
  const pulseTimer = useRef<any>(null);

  const isEmpty = !options || options.length === 0;

  const TrackListFireActivate = (id: string) => {
    if (!onActivate) return;
    onActivate(id);
    setPulseId(id);
    if (pulseTimer.current) clearTimeout(pulseTimer.current);
    pulseTimer.current = setTimeout(() => setPulseId((p) => (p === id ? null : p)), 620);
  };

  useEffect(() => {
    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, []);

  // Deck-B violet accent for keys that are "compatible-alt" feel — purely decorative rotation
  const TrackListKeyTint = (k: string) => {
    // simple deterministic hue split between amber-ish and violet-ish families
    let h = 0;
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) & 0xffff;
    return h % 2 === 0;
  };

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden bg-stone-950/80 rounded-xl border border-stone-800/70 shadow-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* Column header */}
      <div className="shrink-0 flex items-stretch h-8 px-3 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent select-none">
        <div className="flex-[3] min-w-0 flex items-center gap-1 overflow-hidden">
          <span className="text-amber-400 text-[10px] leading-none">�#</span>
          <span className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">Track</span>
        </div>
        <div className="hidden [@container(min-width:22rem)]:flex flex-[1.6] min-w-0 items-center overflow-hidden">
          <span className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">Artist</span>
        </div>
        <div className="flex-[0.9] min-w-0 items-center justify-end hidden [@container(min-width:15rem)]:flex overflow-hidden">
          <span className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px] text-right">BPM</span>
        </div>
        <div className="flex-[0.7] min-w-0 items-center justify-end hidden [@container(min-width:18rem)]:flex overflow-hidden">
          <span className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px] text-right">Key</span>
        </div>
        <div className="flex-[0.8] min-w-0 flex items-center justify-end overflow-hidden">
          <span className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px] text-right">Time</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 min-w-0 relative">
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4 text-center">
            <div className="text-stone-600 text-[11px] uppercase tracking-widest leading-none font-medium">Crate Empty</div>
            <div className="text-stone-700 text-[10px] tracking-wide leading-none">Drop tracks to begin</div>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {options.map((t, i) => {
              const selected = t.id === value;
              const hovered = hoverId === t.id;
              const pressed = pressId === t.id;
              const pulsing = pulseId === t.id;
              const violet = TrackListKeyTint(t.key);

              return (
                <div
                  key={t.id}
                  role="button"
                  onPointerEnter={() => setHoverId(t.id)}
                  onPointerLeave={() => {
                    setHoverId((h) => (h === t.id ? null : h));
                    setPressId((p) => (p === t.id ? null : p));
                  }}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    setPressId(t.id);
                    onChange(t.id);
                  }}
                  onPointerUp={() => setPressId((p) => (p === t.id ? null : p))}
                  onDoubleClick={() => TrackListFireActivate(t.id)}
                  className={
                    "group relative flex items-stretch px-3 py-2 cursor-pointer touch-none select-none transition-all duration-200 ease-out border-b border-stone-800/40 " +
                    (selected
                      ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40 "
                      : hovered
                      ? "bg-amber-500/10 text-stone-100 "
                      : "text-stone-300 ") +
                    (pressed ? "brightness-95 " : "") +
                    (pulsing ? "shadow-lg shadow-amber-500/30 " : "shadow-none ")
                  }
                >
                  {/* Left active bar */}
                  <span
                    className={
                      "pointer-events-none absolute left-0 top-0 bottom-0 w-[3px] rounded-r transition-all duration-200 ease-out " +
                      (selected
                        ? "bg-amber-400 shadow-lg shadow-amber-500/40 " + (pulsing ? "animate-pulse " : "")
                        : hovered
                        ? "bg-amber-500/40 "
                        : "bg-transparent ")
                    }
                  />

                  {/* Load pulse sweep */}
                  {pulsing && (
                    <span className="pointer-events-none absolute inset-0 overflow-hidden">
                      <span
                        className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent"
                        style={{ animation: uid + "-sweep 0.6s ease-out forwards" }}
                      />
                    </span>
                  )}

                  {/* Index + Title */}
                  <div className="flex-[3] min-w-0 flex items-center gap-2 overflow-hidden">
                    <span
                      className={
                        "shrink-0 w-5 text-right font-mono font-bold tabular-nums leading-none text-[11px] transition-colors duration-200 " +
                        (selected ? "text-amber-300" : hovered ? "text-stone-400" : "text-stone-600")
                      }
                    >
                      {i + 1}
                    </span>
                    {/* Play glyph on selected/hover */}
                    <span
                      className={
                        "shrink-0 flex items-center justify-center transition-all duration-200 ease-out " +
                        (selected || hovered ? "w-2.5 opacity-100" : "w-0 opacity-0")
                      }
                    >
                      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" aria-hidden="true">
                        <path
                          d="M2 1.5 L8.5 5 L2 8.5 Z"
                          className={selected ? "fill-amber-400" : "fill-stone-500"}
                        />
                      </svg>
                    </span>
                    <div className="min-w-0 flex flex-col justify-center gap-0.5 overflow-hidden">
                      <span
                        className={
                          "min-w-0 truncate font-semibold tracking-tight leading-tight text-[13px] transition-colors duration-200 " +
                          (selected ? "text-amber-100" : hovered ? "text-stone-50" : "text-stone-200")
                        }
                      >
                        {t.title}
                      </span>
                      {/* Artist inline for narrow slots */}
                      <span className="[@container(min-width:22rem)]:hidden min-w-0 truncate font-normal tracking-wide leading-none text-[11px] text-stone-500">
                        {t.artist}
                      </span>
                    </div>
                  </div>

                  {/* Artist column (wide) */}
                  <div className="hidden [@container(min-width:22rem)]:flex flex-[1.6] min-w-0 items-center overflow-hidden">
                    <span
                      className={
                        "min-w-0 truncate font-normal tracking-wide leading-none text-[11px] transition-colors duration-200 " +
                        (selected ? "text-amber-200/80" : "text-stone-500")
                      }
                    >
                      {t.artist}
                    </span>
                  </div>

                  {/* BPM */}
                  <div className="flex-[0.9] min-w-0 items-center justify-end hidden [@container(min-width:15rem)]:flex overflow-hidden">
                    <span
                      className={
                        "min-w-0 truncate font-mono font-bold tabular-nums tracking-tight leading-none text-[12px] text-right transition-colors duration-200 " +
                        (selected ? "text-lime-300" : hovered ? "text-amber-300" : "text-amber-400/80")
                      }
                    >
                      {Number.isFinite(t.bpm) ? Math.round(t.bpm) : t.bpm}
                    </span>
                  </div>

                  {/* Key chip */}
                  <div className="flex-[0.7] min-w-0 items-center justify-end hidden [@container(min-width:18rem)]:flex overflow-hidden">
                    <span
                      className={
                        "min-w-0 truncate max-w-full inline-flex items-center justify-center px-1.5 py-0.5 rounded-md border font-mono font-semibold leading-none text-[10px] transition-all duration-200 ease-out " +
                        (selected
                          ? violet
                            ? "border-violet-500/50 text-violet-200 bg-violet-600/20"
                            : "border-amber-400/50 text-amber-200 bg-amber-500/20"
                          : violet
                          ? "border-violet-500/25 text-violet-300/80 bg-violet-600/5"
                          : "border-amber-400/20 text-amber-300/70 bg-amber-500/5")
                      }
                    >
                      {t.key}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex-[0.8] min-w-0 flex items-center justify-end overflow-hidden">
                    <span
                      className={
                        "min-w-0 truncate font-mono font-bold tabular-nums tracking-tight leading-none text-[12px] text-right transition-colors duration-200 " +
                        (selected ? "text-amber-100" : "text-stone-400")
                      }
                    >
                      {t.duration}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="h-1" />
          </div>
        )}
      </div>

      <style>{
        "@keyframes " + uid + "-sweep { 0% { transform: translateX(0); } 100% { transform: translateX(400%); } }"
      }</style>
    </div>
  );
}