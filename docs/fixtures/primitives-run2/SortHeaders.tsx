type SortHeadersProps = {
  options: { id: string; label: string }[];
  value: { field: string; dir: "asc" | "desc" };
  onChange: (v: { field: string; dir: "asc" | "desc" }) => void;
};

export function SortHeaders(props: SortHeadersProps) {
  const { options, value, onChange } = props;

  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  const prevRef = useRef<{ field: string; dir: "asc" | "desc" } | null>(null);
  useEffect(() => {
    const prev = prevRef.current;
    if (prev && (prev.field !== value.field || prev.dir !== value.dir)) {
      setFlashKey((k) => k + 1);
    }
    prevRef.current = value;
  }, [value.field, value.dir]);

  const SortHeadersActivate = (id: string) => {
    if (id === value.field) {
      onChange({ field: id, dir: value.dir === "asc" ? "desc" : "asc" });
    } else {
      onChange({ field: id, dir: "asc" });
    }
  };

  // Empty state — clean recessed bar, no invented content.
  if (!options || options.length === 0) {
    return (
      <div className="h-full w-full min-w-0 min-h-0 flex items-stretch [container-type:size]">
        <div className="flex-1 min-w-0 min-h-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-800/60" />
      </div>
    );
  }

  const SortHeadersArrow = (props: {
    active: boolean;
    dir: "asc" | "desc";
    isHover: boolean;
  }) => {
    const { active, dir, isHover } = props;
    const strokeColor = active
      ? "currentColor"
      : isHover
      ? "rgba(251,191,36,0.55)"
      : "rgba(115,115,115,0.5)";
    return (
      <svg
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        aria-hidden="true"
      >
        {/* Up chevron */}
        <path
          d="M6 11 L12 5 L18 11"
          fill="none"
          stroke={strokeColor}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: active ? (dir === "asc" ? 1 : 0.25) : isHover ? 0.85 : 0.7,
            transform: active && dir === "asc" ? "translateY(-0.5px)" : "none",
            transition: "opacity 200ms ease-out, transform 200ms ease-out",
          }}
        />
        {/* Down chevron */}
        <path
          d="M6 13 L12 19 L18 13"
          fill="none"
          stroke={strokeColor}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            opacity: active ? (dir === "desc" ? 1 : 0.25) : isHover ? 0.85 : 0.7,
            transform: active && dir === "desc" ? "translateY(0.5px)" : "none",
            transition: "opacity 200ms ease-out, transform 200ms ease-out",
          }}
        />
      </svg>
    );
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch [container-type:size] select-none">
      <div className="flex-1 min-w-0 min-h-0 flex items-stretch rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-800/60 overflow-hidden">
        <div className="flex-1 min-w-0 min-h-0 flex flex-row items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {options.map((opt, i) => {
            const active = opt.id === value.field;
            const isHover = hovered === opt.id;
            const isPressed = pressed === opt.id;

            return (
              <button
                key={"sh-" + opt.id}
                type="button"
                onClick={() => SortHeadersActivate(opt.id)}
                onPointerEnter={() => setHovered(opt.id)}
                onPointerLeave={() => {
                  setHovered((h) => (h === opt.id ? null : h));
                  setPressed((p) => (p === opt.id ? null : p));
                }}
                onPointerDown={() => setPressed(opt.id)}
                onPointerUp={() => setPressed((p) => (p === opt.id ? null : p))}
                onPointerCancel={() => setPressed((p) => (p === opt.id ? null : p))}
                className={
                  "group relative flex-1 min-w-0 h-full flex items-center justify-between overflow-hidden px-[3cqmin] gap-[2cqmin] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-inset motion-reduce:transition-none " +
                  (i > 0 ? "border-l border-white/[0.05] " : "") +
                  (active
                    ? "bg-amber-500/[0.10] text-amber-300 "
                    : isHover
                    ? "bg-amber-500/[0.06] text-neutral-200 "
                    : "bg-transparent text-neutral-400 ")
                }
                style={{
                  transform: isPressed ? "scale(0.985)" : "scale(1)",
                }}
              >
                {/* Active bottom accent bar */}
                <span
                  className="pointer-events-none absolute left-0 right-0 bottom-0 h-[3px] bg-amber-500 shadow-[0_0_10px_-1px] shadow-amber-500/70 transition-all duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    opacity: active ? 1 : 0,
                    transform: active ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                  }}
                />
                {/* Hover underline hint (inactive) */}
                <span
                  className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px] bg-amber-400/40 transition-all duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    opacity: !active && isHover ? 1 : 0,
                    transform: !active && isHover ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "left",
                  }}
                />
                {/* Direction-change flash sweep on active column */}
                {active && (
                  <span
                    key={"flash-" + opt.id + "-" + flashKey}
                    className="pointer-events-none absolute inset-0 motion-reduce:hidden"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.22) 50%, transparent 100%)",
                      animation: "sortHeadersSweep 460ms ease-out 1",
                    }}
                  />
                )}

                {/* Label */}
                <span
                  className={
                    "relative min-w-0 truncate uppercase tracking-widest transition-colors duration-200 ease-out motion-reduce:transition-none " +
                    (active ? "font-bold" : "font-semibold")
                  }
                  style={{ fontSize: "min(3.4cqh, 3.4cqw, 12px)" }}
                >
                  {opt.label}
                </span>

                {/* Sort arrow */}
                <span
                  className="relative shrink-0 flex items-center justify-center transition-transform duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    height: "min(5.5cqh, 5.5cqw, 20px)",
                    width: "min(5.5cqh, 5.5cqw, 20px)",
                    transform: isHover && !active ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <SortHeadersArrow
                    active={active}
                    dir={value.dir}
                    isHover={isHover}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes sortHeadersSweep {
          0% { opacity: 0; transform: translateX(-30%); }
          40% { opacity: 1; }
          100% { opacity: 0; transform: translateX(30%); }
        }
      `}</style>
    </div>
  );
}