type TrackListProps = { options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[]; value: string; onChange: (id: string) => void; onActivate?: (id: string) => void };
export function TrackList(props: TrackListProps) {
  const { options, value, onChange, onActivate } = props;

  const TrackListScrollRef = useRef<HTMLDivElement | null>(null);
  const [tlHovered, setTlHovered] = useState<string | null>(null);
  const [tlPressed, setTlPressed] = useState<string | null>(null);
  const [tlLayout, setTlLayout] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [tlPulse, setTlPulse] = useState<string | null>(null);
  const tlPrevValue = useRef<string>(value);

  const TlContainerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = TlContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect;
        setTlLayout({ w: cr.width, h: cr.height });
      }
    });
    ro.observe(el);
    setTlLayout({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (value !== tlPrevValue.current) {
      tlPrevValue.current = value;
      if (value) {
        setTlPulse(value);
        const t = setTimeout(() => setTlPulse(null), 420);
        return () => clearTimeout(t);
      }
    }
  }, [value]);

  const TlKeyTone = (k: string): string => {
    const key = (k || "").toString();
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 3;
    if (h === 0) return "text-amber-300 border-amber-400/30 bg-amber-500/10";
    if (h === 1) return "text-teal-300 border-teal-400/30 bg-teal-500/10";
    return "text-rose-300 border-rose-400/30 bg-rose-500/10";
  };

  const TlBpmHue = (bpm: number): string => {
    if (!isFinite(bpm)) return "text-neutral-400";
    if (bpm < 100) return "text-teal-300";
    if (bpm < 128) return "text-amber-300";
    return "text-rose-300";
  };

  const isNarrow = tlLayout.w > 0 && tlLayout.w < 360;
  const isCompact = tlLayout.w > 0 && tlLayout.w < 260;

  const TlEmpty = (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col items-center justify-center gap-2 select-none">
      <div className="flex items-end gap-[3px] opacity-40">
        {[0.3, 0.7, 0.45, 0.9, 0.55, 0.75, 0.35].map((v, i) => (
          <div
            key={"eq-" + i}
            className="w-[3px] rounded-full bg-amber-400/50"
            style={{
              height: 8 + v * 22 + "px",
              animation: "tlEqPulse 1200ms ease-in-out " + i * 90 + "ms infinite",
            }}
          />
        ))}
      </div>
      <div className="text-[11px] font-normal tracking-normal leading-tight text-neutral-600">No tracks loaded</div>
      <style>{"@keyframes tlEqPulse{0%,100%{transform:scaleY(0.4);opacity:0.35}50%{transform:scaleY(1);opacity:0.7}}"}</style>
    </div>
  );

  return (
    <div ref={TlContainerRef} className="h-full w-full min-w-0 min-h-0 flex flex-col [container-type:size]">
      <style>
        {"@keyframes tlSelPulse{0%{box-shadow:0 0 0 0 rgba(245,158,11,0.5),inset 0 0 24px -6px rgba(245,158,11,0.55)}100%{box-shadow:0 0 22px -4px rgba(245,158,11,0),inset 0 0 24px -12px rgba(245,158,11,0.2)}}" +
          "@keyframes tlBarSweep{0%{transform:translateY(-100%)}100%{transform:translateY(200%)}}" +
          "@keyframes tlDotPulse{0%,100%{transform:scale(0.85);opacity:0.7}50%{transform:scale(1.25);opacity:1}}"}
      </style>

      {options.length === 0 ? (
        TlEmpty
      ) : (
        <div
          ref={TrackListScrollRef}
          className="flex-1 min-h-0 w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-1 pr-0.5"
        >
          {options.map((opt) => {
            const selected = opt.id === value;
            const hovered = opt.id === tlHovered;
            const pressed = opt.id === tlPressed;
            const pulsing = opt.id === tlPulse;

            return (
              <div
                key={opt.id}
                role="option"
                aria-selected={selected}
                onPointerDown={(e) => {
                  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
                  setTlPressed(opt.id);
                  onChange(opt.id);
                }}
                onPointerUp={() => setTlPressed(null)}
                onPointerCancel={() => setTlPressed(null)}
                onPointerEnter={() => setTlHovered(opt.id)}
                onPointerLeave={() => {
                  setTlHovered((h) => (h === opt.id ? null : h));
                  setTlPressed((p) => (p === opt.id ? null : p));
                }}
                onDoubleClick={() => onActivate && onActivate(opt.id)}
                className={
                  "group relative shrink-0 overflow-hidden rounded-lg border touch-none cursor-pointer select-none transition-all duration-150 ease-out " +
                  (selected
                    ? "border-amber-400/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent"
                    : hovered
                    ? "border-amber-400/25 bg-amber-500/10"
                    : "border-white/[0.06] bg-neutral-950/60 hover:border-amber-400/25") +
                  (pressed ? " scale-[0.985]" : "")
                }
              >
                {/* left accent rail */}
                <div
                  className={
                    "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 ease-out " +
                    (selected
                      ? "bg-amber-400 shadow-[0_0_10px_0_rgba(245,158,11,0.8)]"
                      : hovered
                      ? "bg-amber-400/50"
                      : "bg-transparent")
                  }
                />

                {/* selection pulse overlay */}
                {pulsing && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-lg"
                    style={{ animation: "tlSelPulse 420ms ease-out forwards" }}
                  />
                )}

                {/* sweep shimmer while selected */}
                {selected && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40 motion-reduce:hidden">
                    <div
                      className="absolute -inset-x-2 h-1/2 bg-gradient-to-b from-transparent via-amber-300/10 to-transparent"
                      style={{ animation: "tlBarSweep 2600ms linear infinite" }}
                    />
                  </div>
                )}

                <div className="relative flex items-center gap-2.5 px-2.5 py-1.5 pl-3.5">
                  {/* status glyph */}
                  <div className="shrink-0 flex items-center justify-center" style={{ width: "14px" }}>
                    {selected ? (
                      <div className="flex items-end gap-[2px] h-3.5">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={"pl-" + i}
                            className="w-[2px] rounded-full bg-amber-400"
                            style={{
                              height: "100%",
                              transformOrigin: "bottom",
                              animation: "tlDotPulse 700ms ease-in-out " + i * 140 + "ms infinite",
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className={
                          "rounded-full transition-all duration-200 " +
                          (hovered ? "bg-amber-400/70 scale-110" : "bg-neutral-600")
                        }
                        style={{ width: "5px", height: "5px" }}
                      />
                    )}
                  </div>

                  {/* title + artist */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div
                      className={
                        "truncate text-[13px] font-medium leading-snug transition-colors duration-150 " +
                        (selected ? "text-amber-100" : hovered ? "text-neutral-100" : "text-neutral-200")
                      }
                    >
                      {opt.title}
                    </div>
                    <div className="truncate text-[11px] font-normal tracking-normal leading-tight text-neutral-500">
                      {opt.artist}
                    </div>
                  </div>

                  {/* KEY chip */}
                  {!isCompact && (
                    <div
                      className={
                        "shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums leading-none transition-all duration-150 " +
                        TlKeyTone(opt.key)
                      }
                    >
                      {opt.key}
                    </div>
                  )}

                  {/* BPM */}
                  {!isNarrow && (
                    <div className="shrink-0 flex flex-col items-end justify-center w-[46px]">
                      <div
                        className={
                          "font-mono text-[13px] font-bold tabular-nums leading-none transition-colors duration-150 " +
                          TlBpmHue(opt.bpm)
                        }
                      >
                        {Number.isFinite(opt.bpm) ? Math.round(opt.bpm) : "--"}
                      </div>
                      <div className="text-[8px] font-semibold uppercase tracking-widest text-neutral-600 leading-none mt-0.5">
                        BPM
                      </div>
                    </div>
                  )}

                  {/* duration */}
                  <div
                    className={
                      "shrink-0 text-right font-mono text-[11px] tabular-nums leading-none transition-colors duration-150 " +
                      (selected ? "text-amber-300/90" : "text-neutral-500") +
                      (isCompact ? " w-[36px]" : " w-[42px]")
                    }
                  >
                    {opt.duration}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}