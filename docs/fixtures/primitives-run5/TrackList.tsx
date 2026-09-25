type TrackListProps = {
  options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[];
  value: string;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

export function TrackList(props: TrackListProps) {
  const uid = useRef("tracklist-" + Math.random().toString(36).slice(2)).current;
  const { options, value, onChange, onActivate } = props;

  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  const interactive = true;

  const doActivate = (id: string) => {
    if (onActivate) {
      onActivate(id);
      setFlash(id);
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setFlash(null), 420) as unknown as number;
    }
  };

  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
    };
  }, []);

  const isEmpty = !options || options.length === 0;

  // Column definitions with responsive priority. Lower priority number = shown first.
  // We use container queries via inline breakpoints on the grid template.
  // Approach: a header + scrollable body sharing the same grid template.

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col overflow-hidden [container-type:inline-size]">
      {/* Header */}
      <div className="shrink-0 flex items-stretch px-2 border-b border-stone-800/70 bg-stone-950/70 select-none">
        <div className="w-full min-w-0 flex items-center gap-2 py-1.5">
          {/* index rail */}
          <div className="hidden [@container(min-width:340px)]:flex w-[7%] min-w-0 items-center justify-center">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600 truncate">#</span>
          </div>
          {/* title / artist */}
          <div className="flex-1 min-w-0 flex items-center">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500 truncate">Track</span>
          </div>
          {/* key */}
          <div className="hidden [@container(min-width:460px)]:flex w-[12%] min-w-0 items-center justify-center">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500 truncate">Key</span>
          </div>
          {/* bpm */}
          <div className="hidden [@container(min-width:240px)]:flex w-[16%] min-w-0 items-center justify-end pr-1">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500 truncate">BPM</span>
          </div>
          {/* duration */}
          <div className="hidden [@container(min-width:380px)]:flex w-[14%] min-w-0 items-center justify-end pr-0.5">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500 truncate">Time</span>
          </div>
        </div>
      </div>

      {/* Body */}
      {isEmpty ? (
        <div className="flex-1 min-h-0 min-w-0 flex flex-col items-center justify-center gap-2 px-4 py-6">
          <div className="relative flex items-center justify-center">
            <span className="block w-6 h-6 rounded-full border-2 border-stone-700/80 border-t-amber-500/60 animate-[spin_2.4s_linear_infinite]" />
            <span className="absolute w-1.5 h-1.5 rounded-full bg-black/70 ring-1 ring-inset ring-stone-800" />
          </div>
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600 text-center">No tracks loaded</span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex flex-col">
            {options.map((t, i) => {
              const selected = t.id === value;
              const isHover = hovered === t.id;
              const isPress = pressed === t.id;
              const isFlash = flash === t.id;

              return (
                <li
                  key={t.id}
                  className="relative group select-none touch-none"
                  onPointerEnter={() => setHovered(t.id)}
                  onPointerLeave={() => {
                    setHovered((h) => (h === t.id ? null : h));
                    setPressed((p) => (p === t.id ? null : p));
                  }}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setPressed(t.id);
                    if (!selected) onChange(t.id);
                  }}
                  onPointerUp={() => setPressed((p) => (p === t.id ? null : p))}
                  onDoubleClick={() => doActivate(t.id)}
                >
                  <div
                    className={
                      "relative flex items-center gap-2 px-2 py-2 border-b border-stone-800/40 transition-all duration-200 ease-out " +
                      (isPress ? "scale-[0.995] " : "") +
                      (selected
                        ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40 "
                        : isHover
                        ? "bg-amber-500/10 text-stone-100 "
                        : "text-stone-300 ") +
                      (isFlash ? "shadow-lg shadow-amber-500/30 " : "shadow-none ")
                    }
                  >
                    {/* Selected accent bar */}
                    <span
                      className={
                        "pointer-events-none absolute left-0 top-0 h-full w-[3px] rounded-r-full transition-all duration-200 ease-out " +
                        (selected
                          ? "bg-amber-500 shadow-lg shadow-amber-500/40 opacity-100 "
                          : isHover
                          ? "bg-amber-500/40 opacity-100 "
                          : "opacity-0 ")
                      }
                    />

                    {/* Flash sweep on activate */}
                    {isFlash && (
                      <span className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-lime-400/25 to-transparent animate-[trkSweep_0.42s_ease-out_forwards]" />
                      </span>
                    )}

                    {/* Index rail */}
                    <div className="hidden [@container(min-width:340px)]:flex w-[7%] min-w-0 items-center justify-center">
                      {selected ? (
                        <span className="relative flex items-center justify-center w-full">
                          <span className="block w-2 h-2 rounded-full bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" />
                        </span>
                      ) : (
                        <span
                          className={
                            "font-mono leading-none text-[11px] truncate transition-colors duration-200 " +
                            (isHover ? "text-amber-300 " : "text-stone-600 ")
                          }
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {/* Title / Artist */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5 py-0.5">
                      <span
                        className={
                          "min-w-0 truncate font-semibold tracking-tight leading-tight text-sm transition-colors duration-200 " +
                          (selected ? "text-amber-100 " : isHover ? "text-stone-50 " : "text-stone-200 ")
                        }
                      >
                        {t.title}
                      </span>
                      <span
                        className={
                          "min-w-0 truncate font-normal tracking-wide leading-none text-[11px] transition-colors duration-200 " +
                          (selected ? "text-amber-300/80 " : "text-stone-500 ")
                        }
                      >
                        {t.artist}
                      </span>
                    </div>

                    {/* Key pill */}
                    <div className="hidden [@container(min-width:460px)]:flex w-[12%] min-w-0 items-center justify-center">
                      <span
                        className={
                          "min-w-0 truncate inline-flex items-center justify-center px-1.5 py-0.5 rounded-md border font-mono font-bold text-[11px] leading-none tracking-tight transition-all duration-200 " +
                          (selected
                            ? "border-amber-400/50 bg-amber-500/20 text-amber-200 "
                            : isHover
                            ? "border-violet-500/40 bg-violet-600/15 text-violet-200 "
                            : "border-stone-700/60 bg-stone-950/60 text-stone-400 ")
                        }
                      >
                        {t.key}
                      </span>
                    </div>

                    {/* BPM */}
                    <div className="hidden [@container(min-width:240px)]:flex w-[16%] min-w-0 items-center justify-end pr-1">
                      <span
                        className={
                          "min-w-0 truncate font-mono font-bold tracking-tight leading-none text-sm transition-colors duration-200 " +
                          (selected ? "text-lime-300 " : isHover ? "text-amber-300 " : "text-amber-400/90 ")
                        }
                      >
                        {Number.isFinite(t.bpm) ? t.bpm.toFixed(t.bpm % 1 === 0 ? 0 : 1) : "—"}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="hidden [@container(min-width:380px)]:flex w-[14%] min-w-0 items-center justify-end pr-0.5">
                      <span
                        className={
                          "min-w-0 truncate font-mono font-bold tracking-tight leading-none text-[13px] transition-colors duration-200 " +
                          (selected ? "text-stone-100 " : "text-stone-500 ")
                        }
                      >
                        {t.duration}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <style>{
        "@keyframes trkSweep{0%{transform:translateX(0)}100%{transform:translateX(400%)}}"
      }</style>
    </div>
  );
}