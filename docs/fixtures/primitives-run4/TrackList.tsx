type TrackListProps = {
  options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[];
  value: string;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

export function TrackList(props: TrackListProps) {
  const uid = useRef("tracklist-" + Math.random().toString(36).slice(2)).current;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  const options = props.options || [];
  const interactive = true;
  const canActivate = typeof props.onActivate === "function";

  useEffect(() => {
    return () => {
      if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
    };
  }, []);

  const doActivate = (id: string) => {
    if (!canActivate) return;
    props.onActivate!(id);
    setFlashId(id);
    if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 420) as unknown as number;
  };

  // Camelot / musical key coloring — subtle harmonic tinting on the key badge.
  const TrackListKeyTone = (k: string): { text: string; ring: string; glow: string } => {
    const s = (k || "").toUpperCase();
    // rough grouping so visually adjacent keys feel related
    const code = s.charCodeAt(0) + s.charCodeAt(s.length - 1 || 0);
    const buckets = [
      { text: "text-amber-300", ring: "ring-amber-400/30", glow: "bg-amber-500/10" },
      { text: "text-teal-300", ring: "ring-teal-400/30", glow: "bg-teal-500/10" },
      { text: "text-rose-300", ring: "ring-rose-400/30", glow: "bg-rose-500/10" },
      { text: "text-emerald-300", ring: "ring-emerald-400/30", glow: "bg-emerald-500/10" },
    ];
    return buckets[code % buckets.length];
  };

  // Little equalizer bars used as the "now selected" indicator.
  const TrackListEqBars = (opts: { active: boolean; color: string }) => {
    const bars = [0, 1, 2, 3];
    return (
      <div className="flex h-full w-full items-end justify-center gap-[2px]">
        {bars.map((b) => (
          <span
            key={"eq-" + b}
            className={
              "w-[15%] rounded-sm transition-all duration-200 ease-out " +
              (opts.active ? opts.color : "bg-neutral-700")
            }
            style={{
              height: opts.active ? undefined : "22%",
              animation: opts.active
                ? "trackEq-" + uid + "-" + b + " " + (620 + b * 130) + "ms ease-in-out infinite alternate"
                : undefined,
            }}
          />
        ))}
      </div>
    );
  };

  const rowH = "min-h-[clamp(2.4rem,5.5cqh,3.4rem)]";

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col [container-type:size]">
      <style>
        {"@keyframes trackEq-" +
          uid +
          "-0 {0%{height:18%}100%{height:88%}}" +
          "@keyframes trackEq-" +
          uid +
          "-1 {0%{height:55%}100%{height:32%}}" +
          "@keyframes trackEq-" +
          uid +
          "-2 {0%{height:30%}100%{height:95%}}" +
          "@keyframes trackEq-" +
          uid +
          "-3 {0%{height:70%}100%{height:40%}}" +
          "@keyframes trackFlash-" +
          uid +
          " {0%{opacity:0.9;transform:scaleX(0)}100%{opacity:0;transform:scaleX(1)}}"}
      </style>

      {/* Column header — recedes on very short slots */}
      <div className="shrink-0 hidden [@container(min-height:9rem)]:flex items-center gap-2 px-2.5 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 select-none">
        <div className="w-[7%] min-w-0" />
        <div className="flex-[3] min-w-0 truncate">Track</div>
        <div className="hidden [@container(min-width:22rem)]:block w-[14%] min-w-0 truncate text-right">
          BPM
        </div>
        <div className="hidden [@container(min-width:16rem)]:block w-[12%] min-w-0 truncate text-center">
          Key
        </div>
        <div className="hidden [@container(min-width:13rem)]:block w-[16%] min-w-0 truncate text-right tabular-nums">
          Time
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] p-1">
        {options.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-center px-4">
            <div className="flex items-end gap-[3px] h-[14%] min-h-[1.2rem] opacity-40">
              {[0, 1, 2, 3, 4].map((b) => (
                <span
                  key={"empty-eq-" + b}
                  className="w-[6px] rounded-sm bg-neutral-700"
                  style={{ height: [40, 70, 30, 85, 55][b] + "%" }}
                />
              ))}
            </div>
            <div className="text-[11px] font-normal tracking-normal leading-tight text-neutral-600">
              No tracks in crate
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-1">
            {options.map((t, idx) => {
              const selected = t.id === props.value;
              const hovered = t.id === hoverId;
              const pressed = t.id === pressId;
              const flashing = t.id === flashId;
              const keyTone = TrackListKeyTone(t.key);

              return (
                <li key={t.id}>
                  <div
                    role="option"
                    aria-selected={selected}
                    className={
                      "group relative flex items-center gap-2 rounded-lg px-2 py-1 cursor-pointer select-none touch-none overflow-hidden " +
                      rowH +
                      " transition-all duration-150 ease-out border " +
                      (selected
                        ? "bg-amber-500/12 border-amber-400/30 shadow-[0_0_16px_-4px] shadow-amber-500/40"
                        : hovered
                        ? "bg-amber-500/[0.07] border-amber-400/20"
                        : "bg-neutral-900/40 border-white/[0.04]") +
                      (pressed ? " scale-[0.985]" : "")
                    }
                    onPointerEnter={() => setHoverId(t.id)}
                    onPointerLeave={() => {
                      setHoverId((h) => (h === t.id ? null : h));
                      setPressId((p) => (p === t.id ? null : p));
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setPressId(t.id);
                      if (!selected) props.onChange(t.id);
                    }}
                    onPointerUp={() => setPressId((p) => (p === t.id ? null : p))}
                    onDoubleClick={() => doActivate(t.id)}
                  >
                    {/* Left accent rail on selected */}
                    <span
                      className={
                        "absolute left-0 top-0 bottom-0 w-[3px] rounded-r transition-all duration-200 ease-out " +
                        (selected
                          ? "bg-amber-400 shadow-[0_0_10px_0] shadow-amber-500/70"
                          : hovered
                          ? "bg-amber-400/40"
                          : "bg-transparent")
                      }
                    />

                    {/* Activation flash sweep */}
                    {flashing && (
                      <span
                        className="absolute inset-0 origin-left bg-gradient-to-r from-amber-400/40 via-amber-300/10 to-transparent pointer-events-none"
                        style={{ animation: "trackFlash-" + uid + " 420ms ease-out forwards" }}
                      />
                    )}

                    {/* Index / EQ indicator */}
                    <div className="relative w-[7%] min-w-[1.4rem] h-[52%] min-h-[1rem] flex items-center justify-center shrink-0">
                      {selected ? (
                        <div className="h-[62%] w-full">
                          {TrackListEqBars({ active: true, color: "bg-amber-400" })}
                        </div>
                      ) : (
                        <span
                          className={
                            "font-mono text-[10px] tabular-nums leading-none transition-colors duration-150 " +
                            (hovered ? "text-amber-300/80" : "text-neutral-600")
                          }
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {/* Title + artist */}
                    <div className="flex-[3] min-w-0 flex flex-col justify-center leading-none py-0.5">
                      <span
                        className={
                          "min-w-0 truncate text-[13px] font-medium leading-snug transition-colors duration-150 " +
                          (selected
                            ? "text-neutral-50"
                            : hovered
                            ? "text-neutral-100"
                            : "text-neutral-200")
                        }
                      >
                        {t.title}
                      </span>
                      <span className="min-w-0 truncate text-[11px] font-normal tracking-normal leading-tight text-neutral-500">
                        {t.artist}
                      </span>
                    </div>

                    {/* BPM */}
                    <div className="hidden [@container(min-width:22rem)]:flex w-[14%] min-w-0 flex-col items-end justify-center leading-none shrink-0">
                      <span
                        className={
                          "font-mono text-[13px] font-bold tabular-nums tracking-tight leading-none transition-colors duration-150 " +
                          (selected ? "text-amber-300" : hovered ? "text-amber-300/80" : "text-neutral-300")
                        }
                      >
                        {Number.isFinite(t.bpm) ? Math.round(t.bpm) : "--"}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-600 leading-none mt-0.5">
                        BPM
                      </span>
                    </div>

                    {/* Key badge */}
                    <div className="hidden [@container(min-width:16rem)]:flex w-[12%] min-w-0 items-center justify-center shrink-0">
                      <span
                        className={
                          "inline-flex min-w-0 max-w-full items-center justify-center rounded-md px-1.5 py-0.5 ring-1 font-mono text-[11px] font-semibold leading-none truncate transition-all duration-150 " +
                          keyTone.text +
                          " " +
                          keyTone.ring +
                          " " +
                          (selected ? keyTone.glow : "bg-neutral-800/60")
                        }
                      >
                        {t.key || "--"}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="hidden [@container(min-width:13rem)]:flex w-[16%] min-w-0 items-center justify-end shrink-0">
                      <span
                        className={
                          "font-mono text-[11px] tabular-nums leading-none transition-colors duration-150 " +
                          (selected ? "text-neutral-300" : "text-neutral-500")
                        }
                      >
                        {t.duration || "--:--"}
                      </span>
                    </div>

                    {/* Load affordance — only when activation is wired */}
                    {canActivate && (
                      <div
                        className={
                          "shrink-0 w-[8%] min-w-[1.3rem] flex items-center justify-center overflow-hidden transition-all duration-200 ease-out " +
                          (hovered || selected ? "opacity-100 max-w-[2rem]" : "opacity-0 max-w-0")
                        }
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          doActivate(t.id);
                        }}
                        title="Load"
                      >
                        <span
                          className={
                            "inline-flex items-center justify-center rounded-md border h-[70%] min-h-[1rem] aspect-square transition-all duration-150 " +
                            "border-amber-400/30 text-amber-400 hover:bg-amber-500 hover:text-neutral-950 hover:border-amber-400 hover:shadow-[0_0_12px_-2px] hover:shadow-amber-500/60 active:scale-90"
                          }
                        >
                          <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none">
                            <path
                              d="M12 3v11m0 0l-4-4m4 4l4-4M5 21h14"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}