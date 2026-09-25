type TrackListProps = {
  options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[];
  value: string;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

export function TrackList(props: TrackListProps) {
  const { options, value, onChange, onActivate } = props;
  const uid = useRef("tracklist-" + Math.random().toString(36).slice(2)).current;

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);

  const activate = (id: string) => {
    if (!onActivate) return;
    onActivate(id);
    setFlashId(id);
    if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashId(null), 520);
  };

  useEffect(() => {
    return () => {
      if (flashTimer.current != null) window.clearTimeout(flashTimer.current);
    };
  }, []);

  // Map musical key -> a hue accent within our secondary identity palette (amber/teal/rose family only).
  const TrackListKeyTone = (k: string): { text: string; bg: string; ring: string } => {
    const s = (k || "").trim().toLowerCase();
    // group by leading char code for stable but varied assignment
    let code = 0;
    for (let i = 0; i < s.length; i++) code = (code + s.charCodeAt(i)) % 3;
    if (code === 0) return { text: "text-amber-300", bg: "bg-amber-500/15", ring: "ring-amber-400/25" };
    if (code === 1) return { text: "text-teal-300", bg: "bg-teal-500/15", ring: "ring-teal-400/25" };
    return { text: "text-rose-300", bg: "bg-rose-500/15", ring: "ring-rose-400/25" };
  };

  const isEmpty = !options || options.length === 0;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col [container-type:size] font-sans">
      {/* Column header strip */}
      <div className="shrink-0 flex items-stretch px-2.5 h-7 border-b border-white/[0.06] bg-neutral-900/60 text-[10px] font-semibold uppercase tracking-widest text-neutral-500 select-none">
        <div className="flex-1 min-w-0 flex items-center">Track</div>
        <div className="w-[14%] min-w-0 flex items-center justify-end tabular-nums">BPM</div>
        <div className="w-[12%] min-w-0 flex items-center justify-center">Key</div>
        <div className="w-[16%] min-w-0 flex items-center justify-end tabular-nums">Time</div>
      </div>

      {/* Body */}
      {isEmpty ? (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 text-center px-4 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="8" cy="18" r="3" />
            <path d="M11 18V5l9-2v11" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="17" cy="14" r="3" />
          </svg>
          <div className="text-[11px] tracking-wide text-neutral-600">No tracks in crate</div>
        </div>
      ) : (
        <div
          className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]"
        >
          {options.map((opt, i) => {
            const selected = opt.id === value;
            const hovered = opt.id === hoverId;
            const pressed = opt.id === pressId;
            const flashing = opt.id === flashId;
            const tone = TrackListKeyTone(opt.key);

            return (
              <div
                key={opt.id}
                role="button"
                onPointerEnter={() => setHoverId(opt.id)}
                onPointerLeave={() => {
                  setHoverId((h) => (h === opt.id ? null : h));
                  setPressId((p) => (p === opt.id ? null : p));
                }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setPressId(opt.id);
                  onChange(opt.id);
                }}
                onPointerUp={() => setPressId((p) => (p === opt.id ? null : p))}
                onDoubleClick={() => activate(opt.id)}
                className={
                  "group relative flex items-stretch px-2.5 select-none cursor-pointer touch-none transition-colors duration-150 " +
                  "border-b border-white/[0.03] " +
                  (selected
                    ? "bg-amber-500/[0.14] "
                    : hovered
                    ? "bg-amber-500/[0.06] "
                    : i % 2 === 0
                    ? "bg-transparent "
                    : "bg-white/[0.015] ")
                }
                style={{
                  minHeight: "2.75rem",
                  transform: pressed ? "translateY(0.5px)" : "translateY(0)",
                }}
              >
                {/* Left accent rail */}
                <div
                  className={
                    "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 ease-out " +
                    (selected
                      ? "bg-amber-400 shadow-[0_0_10px_0] shadow-amber-500/70 "
                      : hovered
                      ? "bg-amber-400/40 "
                      : "bg-transparent ")
                  }
                />

                {/* Load flash sweep */}
                {flashing ? (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div
                      className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent"
                      style={{ animation: uid + "-sweep 0.5s ease-out forwards" }}
                    />
                  </div>
                ) : null}

                {/* Now-playing / selected pulse dot cluster on far left inside content */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5 py-1.5">
                  {/* Index / status glyph */}
                  <div className="shrink-0 w-5 flex items-center justify-center">
                    {selected ? (
                      <div className="flex items-end gap-[2px] h-3.5">
                        <span
                          className="w-[2px] bg-amber-400 rounded-full"
                          style={{ height: "100%", animation: uid + "-eq1 0.7s ease-in-out infinite alternate" }}
                        />
                        <span
                          className="w-[2px] bg-amber-400 rounded-full"
                          style={{ height: "60%", animation: uid + "-eq2 0.55s ease-in-out infinite alternate" }}
                        />
                        <span
                          className="w-[2px] bg-amber-400 rounded-full"
                          style={{ height: "80%", animation: uid + "-eq3 0.85s ease-in-out infinite alternate" }}
                        />
                      </div>
                    ) : (
                      <span
                        className={
                          "font-mono text-[11px] tabular-nums transition-colors duration-150 " +
                          (hovered ? "text-amber-400/80" : "text-neutral-600")
                        }
                      >
                        {hovered && onActivate ? (
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ) : (
                          String(i + 1).padStart(2, "0")
                        )}
                      </span>
                    )}
                  </div>

                  {/* Title + artist */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center leading-none gap-0.5">
                    <div
                      className={
                        "text-[13px] font-medium leading-snug truncate transition-colors duration-150 " +
                        (selected ? "text-amber-100" : hovered ? "text-neutral-100" : "text-neutral-200")
                      }
                    >
                      {opt.title}
                    </div>
                    <div
                      className={
                        "text-[11px] font-normal leading-tight truncate transition-colors duration-150 " +
                        (selected ? "text-amber-300/70" : "text-neutral-500")
                      }
                    >
                      {opt.artist}
                    </div>
                  </div>
                </div>

                {/* BPM */}
                <div className="w-[14%] min-w-0 flex items-center justify-end">
                  <span
                    className={
                      "font-mono text-[12px] font-bold tabular-nums tracking-tight transition-colors duration-150 " +
                      (selected ? "text-amber-300" : hovered ? "text-neutral-200" : "text-neutral-400")
                    }
                  >
                    {Number.isFinite(opt.bpm) ? opt.bpm.toFixed(opt.bpm % 1 === 0 ? 0 : 1) : "—"}
                  </span>
                </div>

                {/* Key chip */}
                <div className="w-[12%] min-w-0 flex items-center justify-center px-1">
                  <span
                    className={
                      "inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ring-1 transition-all duration-150 " +
                      tone.text + " " + tone.bg + " " + tone.ring + " " +
                      (selected ? "brightness-125 " : hovered ? "brightness-110 " : "")
                    }
                  >
                    {opt.key || "—"}
                  </span>
                </div>

                {/* Duration */}
                <div className="w-[16%] min-w-0 flex items-center justify-end">
                  <span
                    className={
                      "font-mono text-[11px] tabular-nums transition-colors duration-150 " +
                      (selected ? "text-amber-300/80" : "text-neutral-500")
                    }
                  >
                    {opt.duration || "--:--"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{
        "@keyframes " + uid + "-sweep{0%{left:-33%}100%{left:100%}}" +
        "@keyframes " + uid + "-eq1{0%{height:35%}100%{height:100%}}" +
        "@keyframes " + uid + "-eq2{0%{height:100%}100%{height:40%}}" +
        "@keyframes " + uid + "-eq3{0%{height:55%}100%{height:95%}}" +
        "@media (prefers-reduced-motion: reduce){" +
        "[style*='" + uid + "-sweep']{animation:none!important;opacity:0}" +
        "[style*='" + uid + "-eq1'],[style*='" + uid + "-eq2'],[style*='" + uid + "-eq3']{animation:none!important}" +
        "}"
      }</style>
    </div>
  );
}