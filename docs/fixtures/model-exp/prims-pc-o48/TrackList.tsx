export const TrackList_MIN = {"base":[13,6]};

type TrackListProps = { options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[]; value: string; onChange: (id: string) => void; onActivate?: (id: string) => void };

export function TrackList(props: TrackListProps) {
  const { options, value, onChange, onActivate } = props;
  const uid = useRef("tracklist-" + Math.random().toString(36).slice(2)).current;
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const doActivate = useCallback(
    (id: string) => {
      onChange(id);
      if (onActivate) onActivate(id);
      setFlash(id);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 450);
    },
    [onChange, onActivate]
  );

  const isEmpty = !options || options.length === 0;

  return (
    <div
      className="relative h-full w-full flex flex-col overflow-hidden touch-none select-none"
      style={{ minWidth: TrackList_MIN.base[0] + "rem", minHeight: TrackList_MIN.base[1] + "rem" }}
    >
      {/* Header */}
      <div className="relative z-10 flex items-stretch h-8 shrink-0 border-b border-amber-500/15 bg-neutral-900/80 bg-gradient-to-r from-amber-500/5 to-transparent">
        <div className="flex-1 min-w-0 flex items-center px-3 gap-2">
          <span className="text-amber-400 text-[11px] leading-none">◆</span>
          <span className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
            Track
          </span>
        </div>
        <div className="hidden [@container(min-width:22rem)]:flex w-[7rem] items-center px-2 font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
          <span className="min-w-0 truncate">Artist</span>
        </div>
        <div className="flex w-[3rem] items-center justify-end px-2 font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
          <span className="min-w-0 truncate">BPM</span>
        </div>
        <div className="hidden [@container(min-width:17rem)]:flex w-[2.5rem] items-center justify-center px-2 font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
          <span className="min-w-0 truncate">Key</span>
        </div>
        <div className="flex w-[3.25rem] items-center justify-end px-3 font-medium uppercase tracking-widest leading-none text-stone-400 text-[10px]">
          <span className="min-w-0 truncate">Time</span>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 min-h-0 min-w-0 bg-stone-950/80 [container-type:inline-size]">
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            <div className="flex items-center gap-1.5 opacity-60">
              <span className="block h-3 w-0.5 rounded-full bg-stone-700 animate-pulse" />
              <span className="block h-5 w-0.5 rounded-full bg-stone-600 animate-pulse [animation-delay:120ms]" />
              <span className="block h-4 w-0.5 rounded-full bg-stone-700 animate-pulse [animation-delay:240ms]" />
              <span className="block h-6 w-0.5 rounded-full bg-stone-600 animate-pulse [animation-delay:360ms]" />
              <span className="block h-3 w-0.5 rounded-full bg-stone-700 animate-pulse [animation-delay:480ms]" />
            </div>
            <span className="font-medium uppercase tracking-widest leading-none text-stone-600 text-[10px]">
              No Tracks Loaded
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {options.map((opt, i) => {
              const selected = opt.id === value;
              const isHover = hovered === opt.id;
              const isPressed = pressed === opt.id;
              const isFlash = flash === opt.id;

              let rowClasses =
                "relative flex items-stretch h-11 shrink-0 border-b border-stone-800/50 cursor-pointer transition-all duration-200 ease-out";
              if (selected) {
                rowClasses += " bg-amber-500/15 ring-1 ring-inset ring-amber-500/40 shadow-lg shadow-amber-500/10";
              } else if (isHover) {
                rowClasses += " bg-amber-500/10";
              } else {
                rowClasses += " bg-transparent";
              }
              if (isPressed) rowClasses += " scale-[0.995] brightness-95";

              const titleColor = selected ? "text-amber-100" : isHover ? "text-stone-50" : "text-stone-200";
              const artistColor = selected ? "text-amber-300/80" : "text-stone-500";
              const bpmColor = selected ? "text-lime-300" : isHover ? "text-lime-300/80" : "text-stone-400";
              const keyColor = selected ? "text-amber-300" : "text-stone-500";
              const timeColor = selected ? "text-amber-200" : "text-stone-400";

              return (
                <div
                  key={"row-" + uid + "-" + opt.id + "-" + i}
                  className={rowClasses}
                  onPointerDown={(e) => {
                    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                    setPressed(opt.id);
                    onChange(opt.id);
                  }}
                  onPointerUp={() => setPressed(null)}
                  onPointerCancel={() => setPressed(null)}
                  onPointerEnter={() => setHovered(opt.id)}
                  onPointerLeave={() => {
                    setHovered((h) => (h === opt.id ? null : h));
                    setPressed((p) => (p === opt.id ? null : p));
                  }}
                  onDoubleClick={() => doActivate(opt.id)}
                >
                  {/* Selection edge accent */}
                  <div
                    className={
                      "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 ease-out " +
                      (selected
                        ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                        : isHover
                        ? "bg-amber-500/40"
                        : "bg-transparent")
                    }
                  />

                  {/* Load flash overlay */}
                  {isFlash ? (
                    <div className="pointer-events-none absolute inset-0 bg-lime-400/20 animate-pulse" />
                  ) : null}

                  {/* Title + inline artist (narrow) */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center px-3 gap-0.5 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Playing/selected pulse dot */}
                      <span
                        className={
                          "shrink-0 h-1.5 w-1.5 rounded-full transition-all duration-200 " +
                          (selected
                            ? "bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)] animate-pulse"
                            : isHover
                            ? "bg-amber-400/60"
                            : "bg-stone-700")
                        }
                      />
                      <span
                        className={
                          "min-w-0 truncate font-semibold tracking-tight leading-tight text-sm transition-colors duration-200 " +
                          titleColor
                        }
                      >
                        {opt.title}
                      </span>
                    </div>
                    <span
                      className={
                        "[@container(min-width:22rem)]:hidden min-w-0 truncate font-normal tracking-wide leading-none text-[11px] transition-colors duration-200 " +
                        artistColor
                      }
                    >
                      {opt.artist}
                    </span>
                  </div>

                  {/* Artist column (wide) */}
                  <div className="hidden [@container(min-width:22rem)]:flex w-[7rem] items-center px-2">
                    <span
                      className={
                        "min-w-0 truncate font-normal tracking-wide leading-none text-[11px] transition-colors duration-200 " +
                        artistColor
                      }
                    >
                      {opt.artist}
                    </span>
                  </div>

                  {/* BPM */}
                  <div className="flex w-[3rem] items-center justify-end px-2">
                    <span
                      className={
                        "min-w-0 truncate font-mono font-bold tracking-tight leading-none text-[13px] transition-colors duration-200 " +
                        bpmColor
                      }
                    >
                      {opt.bpm}
                    </span>
                  </div>

                  {/* Key */}
                  <div className="hidden [@container(min-width:17rem)]:flex w-[2.5rem] items-center justify-center px-2">
                    <span
                      className={
                        "min-w-0 truncate font-mono font-bold tracking-tight leading-none text-[12px] transition-colors duration-200 " +
                        keyColor
                      }
                    >
                      {opt.key}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex w-[3.25rem] items-center justify-end px-3">
                    <span
                      className={
                        "min-w-0 truncate font-mono font-bold tracking-tight leading-none text-[12px] transition-colors duration-200 " +
                        timeColor
                      }
                    >
                      {opt.duration}
                    </span>
                  </div>
                </div>
              );
            })}
            {/* Bottom breathing room */}
            <div className="h-2 shrink-0" />
          </div>
        )}

        {/* Top fade for depth */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-3 bg-gradient-to-b from-stone-950/80 to-transparent" />
        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-stone-950/90 to-transparent" />
      </div>
    </div>
  );
}