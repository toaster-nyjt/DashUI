type SortHeadersProps = {
  options: { id: string; label: string }[];
  value: { field: string; dir: "asc" | "desc" };
  onChange: (v: { field: string; dir: "asc" | "desc" }) => void;
};
export function SortHeaders(props: SortHeadersProps) {
  const uid = useRef("sortheaders-" + Math.random().toString(36).slice(2)).current;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);

  const options = props.options || [];
  const empty = options.length === 0;

  const SortHeadersArrow = (a: { active: boolean; dir: "asc" | "desc"; hovered: boolean }) => {
    // Up chevron + down chevron, one dimmed depending on direction.
    const upActive = a.active && a.dir === "asc";
    const downActive = a.active && a.dir === "desc";
    return (
      <svg
        viewBox="0 0 12 20"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-auto shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <g
          className="transition-all duration-200 ease-out"
          style={{
            transform: upActive ? "translateY(-0.6px)" : "none",
          }}
        >
          <path
            d="M1.6 8 L6 3.4 L10.4 8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              "transition-all duration-200 ease-out " +
              (upActive
                ? "stroke-amber-300"
                : a.hovered
                ? "stroke-neutral-400"
                : "stroke-neutral-600")
            }
            style={{
              strokeWidth: upActive ? 2.4 : 1.6,
              filter: upActive ? "drop-shadow(0 0 3px rgba(251,191,36,0.7))" : "none",
              opacity: a.active && !upActive ? 0.35 : 1,
            }}
          />
        </g>
        <g
          className="transition-all duration-200 ease-out"
          style={{
            transform: downActive ? "translateY(0.6px)" : "none",
          }}
        >
          <path
            d="M1.6 12 L6 16.6 L10.4 12"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              "transition-all duration-200 ease-out " +
              (downActive
                ? "stroke-amber-300"
                : a.hovered
                ? "stroke-neutral-400"
                : "stroke-neutral-600")
            }
            style={{
              strokeWidth: downActive ? 2.4 : 1.6,
              filter: downActive ? "drop-shadow(0 0 3px rgba(251,191,36,0.7))" : "none",
              opacity: a.active && !downActive ? 0.35 : 1,
            }}
          />
        </g>
      </svg>
    );
  };

  const handleActivate = (id: string) => {
    const isActive = props.value && props.value.field === id;
    if (isActive) {
      props.onChange({ field: id, dir: props.value.dir === "asc" ? "desc" : "asc" });
    } else {
      props.onChange({ field: id, dir: "asc" });
    }
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col">
      {empty ? (
        <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
            No columns
          </span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 min-w-0 flex items-stretch rounded-lg overflow-hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60">
          {options.map((opt, i) => {
            const isActive = props.value && props.value.field === opt.id;
            const isHover = hoverId === opt.id;
            const isPress = pressId === opt.id;
            const dir = isActive && props.value ? props.value.dir : "asc";
            return (
              <button
                key={"col-" + opt.id + "-" + i}
                type="button"
                onPointerEnter={() => setHoverId(opt.id)}
                onPointerLeave={() => {
                  setHoverId((h) => (h === opt.id ? null : h));
                  setPressId((p) => (p === opt.id ? null : p));
                }}
                onPointerDown={() => setPressId(opt.id)}
                onPointerUp={() => setPressId((p) => (p === opt.id ? null : p))}
                onClick={() => handleActivate(opt.id)}
                className={
                  "group relative flex-1 min-w-0 min-h-0 flex items-center gap-1.5 px-2.5 select-none touch-none overflow-hidden transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 " +
                  (i !== 0 ? "border-l border-white/[0.06] " : "") +
                  (isActive
                    ? "bg-amber-500/[0.12] "
                    : isHover
                    ? "bg-amber-500/[0.06] "
                    : "bg-transparent ")
                }
                style={{
                  transform: isPress ? "translateY(0.5px)" : "none",
                }}
              >
                {/* active bottom accent bar */}
                <span
                  className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px] transition-all duration-200 ease-out"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(251,191,36,0) 0%, rgba(251,191,36,0.9) 50%, rgba(251,191,36,0) 100%)",
                    opacity: isActive ? 1 : 0,
                    boxShadow: isActive ? "0 0 10px 0 rgba(245,158,11,0.6)" : "none",
                    transform: isActive ? "scaleX(1)" : "scaleX(0.4)",
                  }}
                />
                {/* subtle top sheen on hover/active */}
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2 transition-opacity duration-200 ease-out"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
                    opacity: isHover || isActive ? 1 : 0,
                  }}
                />

                {/* label region — grows, truncates */}
                <span className="relative flex-1 min-w-0 flex items-center overflow-hidden">
                  <span
                    className={
                      "min-w-0 truncate text-[10px] font-semibold uppercase tracking-widest transition-colors duration-200 ease-out " +
                      (isActive
                        ? "text-amber-300"
                        : isHover
                        ? "text-neutral-200"
                        : "text-neutral-400")
                    }
                    style={{
                      textShadow: isActive ? "0 0 8px rgba(251,191,36,0.45)" : "none",
                    }}
                  >
                    {opt.label}
                  </span>
                </span>

                {/* arrows region — fixed proportion, scales with row height */}
                <span className="relative shrink-0 h-[52%] max-h-4 flex items-center">
                  {SortHeadersArrow({ active: !!isActive, dir, hovered: isHover })}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}