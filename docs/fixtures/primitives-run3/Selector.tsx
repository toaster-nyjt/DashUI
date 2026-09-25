type SelectorProps = { options: { id: string; label: string }[]; onChange: (id: string) => void; value: string };

export function Selector(props: SelectorProps) {
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;
  const { options, value, onChange } = props;

  const [pressedId, setPressedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const hasOptions = options && options.length > 0;
  const activeIndex = hasOptions ? Math.max(0, options.findIndex((o) => o.id === value)) : -1;

  // Longest label length drives per-item font sizing so text scales with content.
  const maxLabelLen = useMemo(() => {
    if (!hasOptions) return 1;
    return options.reduce((m, o) => Math.max(m, (o.label || "").length), 1);
  }, [options, hasOptions]);

  // Modest operational font: shrinks a touch for longer labels, clamped to a legible band.
  const fontCqh = Math.max(2.6, Math.min(4.2, 22 / maxLabelLen));

  if (!hasOptions) {
    return (
      <div className="h-full w-full min-w-0 min-h-0 [container-type:size] flex items-center justify-center">
        <div className="rounded-lg border border-neutral-700/60 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] px-[4cqmin] py-[3cqmin] flex items-center justify-center">
          <span
            className="font-semibold uppercase tracking-widest text-neutral-600 leading-none select-none"
            style={{ fontSize: "3.2cqmin" }}
          >
            No Effects
          </span>
        </div>
      </div>
    );
  }

  const count = options.length;

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] flex items-stretch">
      {/* Recessed selector well */}
      <div className="relative flex-1 min-w-0 min-h-0 rounded-xl border border-neutral-700/70 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden p-[1.6cqmin]">
        {/* Scrollable option region — reflows: column when tall, row when wide via container query */}
        <div
          className="relative h-full w-full min-w-0 min-h-0 flex flex-col @[26rem]:flex-row overflow-y-auto @[26rem]:overflow-y-hidden @[26rem]:overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-[1.2cqmin]"
        >
          {options.map((opt, i) => {
            const isActive = opt.id === value;
            const isPressed = pressedId === opt.id;
            const isHover = hoverId === opt.id && !isActive;
            const label = opt.label || "";

            return (
              <button
                key={"opt-" + opt.id + "-" + i}
                type="button"
                onPointerDown={() => setPressedId(opt.id)}
                onPointerUp={() => setPressedId((p) => (p === opt.id ? null : p))}
                onPointerLeave={() => {
                  setPressedId((p) => (p === opt.id ? null : p));
                  setHoverId((h) => (h === opt.id ? null : h));
                }}
                onPointerEnter={() => setHoverId(opt.id)}
                onPointerCancel={() => setPressedId((p) => (p === opt.id ? null : p))}
                onClick={() => onChange(opt.id)}
                aria-pressed={isActive}
                className={
                  "group relative flex-1 min-w-0 min-h-0 flex items-center justify-center rounded-lg border select-none touch-none overflow-hidden transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
                  (isActive
                    ? "border-amber-400/40 bg-amber-500 text-neutral-950 shadow-[0_0_16px_-2px] shadow-amber-500/60 z-10"
                    : "border-neutral-700/60 bg-gradient-to-b from-neutral-800 to-neutral-900 text-neutral-400 shadow-md shadow-black/40 " +
                      "hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-200 hover:-translate-y-px active:translate-y-0")
                }
                style={{
                  transform: isPressed ? "scale(0.965)" : undefined,
                  minHeight: 0,
                  minWidth: 0,
                }}
              >
                {/* Active sheen sweep */}
                {isActive && (
                  <span
                    key={"sheen-" + opt.id}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40 motion-reduce:hidden"
                    style={{
                      background:
                        "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                      animation: "sel-sheen-" + uid + " 2.4s ease-in-out infinite",
                      backgroundSize: "220% 100%",
                    }}
                  />
                )}

                {/* Active top edge accent bar */}
                <span
                  aria-hidden
                  className={
                    "pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 h-[3%] min-h-[1.5px] rounded-full transition-all duration-300 ease-out " +
                    (isActive ? "w-[70%] bg-neutral-950/40" : "w-0 bg-transparent")
                  }
                />

                {/* Hover indicator dot */}
                <span
                  aria-hidden
                  className={
                    "pointer-events-none absolute bottom-[8%] left-1/2 -translate-x-1/2 rounded-full bg-amber-400 transition-all duration-200 ease-out " +
                    (isHover ? "opacity-80" : "opacity-0")
                  }
                  style={{ width: "6%", aspectRatio: "1 / 1", maxWidth: "6px" }}
                />

                {/* Label — truncates as operational text, stays within legible band */}
                <span
                  className={
                    "relative z-[1] block max-w-full truncate px-[6%] font-semibold uppercase tracking-widest leading-none transition-colors duration-200 " +
                    (isActive ? "text-neutral-950" : "")
                  }
                  style={{ fontSize: fontCqh + "cqh" }}
                  title={label}
                >
                  {label}
                </span>

                {/* Subtle inner top highlight for raised metal feel (inactive only) */}
                {!isActive && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-gradient-to-b from-white/[0.05] to-transparent"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Position pips along the bottom (only when a handful of options, purely decorative state map) */}
        {count <= 8 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-[1.4cqmin] pb-[0.6cqmin]">
            {options.map((opt, i) => (
              <span
                key={"pip-" + opt.id + "-" + i}
                aria-hidden
                className={
                  "block rounded-full transition-all duration-300 ease-out " +
                  (i === activeIndex ? "bg-amber-400 shadow-[0_0_6px_0] shadow-amber-500/70" : "bg-neutral-700")
                }
                style={{
                  height: "1.6cqmin",
                  width: i === activeIndex ? "5cqmin" : "1.6cqmin",
                  maxHeight: "5px",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>
        {"@keyframes sel-sheen-" +
          uid +
          " { 0% { background-position: 200% 0; } 60% { background-position: -120% 0; } 100% { background-position: -120% 0; } }"}
      </style>
    </div>
  );
}