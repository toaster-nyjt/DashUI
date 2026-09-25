type SortHeadersProps = {
  options: { id: string; label: string }[];
  value: { field: string; dir: 'asc' | 'desc' };
  onChange: (v: { field: string; dir: 'asc' | 'desc' }) => void;
};

export function SortHeaders(props: SortHeadersProps) {
  const { options, value, onChange } = props;
  const uid = useRef("sortheaders-" + Math.random().toString(36).slice(2)).current;

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);

  const handleActivate = (id: string) => {
    if (id === value.field) {
      onChange({ field: id, dir: value.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onChange({ field: id, dir: 'asc' });
    }
  };

  const SortHeadersArrow = (p: { active: boolean; dir: 'asc' | 'desc'; hovered: boolean }) => {
    const { active, dir, hovered } = p;
    const stroke = active ? "#0a0a0a" : hovered ? "#fbbf24" : "#525252";
    return (
      <svg
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full transition-transform duration-200 ease-out"
        style={{
          transform: active
            ? dir === 'asc'
              ? "rotate(0deg)"
              : "rotate(180deg)"
            : "rotate(0deg)",
          opacity: active ? 1 : hovered ? 0.9 : 0.55,
        }}
      >
        <path
          d="M12 5 L12 19 M12 5 L6.5 10.5 M12 5 L17.5 10.5"
          fill="none"
          stroke={stroke}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-[stroke] duration-200 ease-out"
        />
      </svg>
    );
  };

  if (!options || options.length === 0) {
    return (
      <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center [container-type:size]">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
          No columns
        </span>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col [container-type:size]">
      <div
        role="row"
        className="flex-1 min-h-0 w-full min-w-0 flex flex-row items-stretch rounded-lg overflow-hidden bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60"
      >
        {options.map((opt, i) => {
          const active = opt.id === value.field;
          const hovered = hoverId === opt.id;
          const pressed = pressId === opt.id;

          return (
            <button
              key={"col-" + opt.id}
              type="button"
              role="columnheader"
              aria-sort={active ? (value.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture?.(e.pointerId);
                setPressId(opt.id);
              }}
              onPointerUp={() => setPressId(null)}
              onPointerCancel={() => setPressId(null)}
              onPointerEnter={() => setHoverId(opt.id)}
              onPointerLeave={() => {
                setHoverId((h) => (h === opt.id ? null : h));
                setPressId((p) => (p === opt.id ? null : p));
              }}
              onClick={() => handleActivate(opt.id)}
              className={
                "group relative flex-1 min-w-0 h-full flex items-center justify-center gap-[6cqh] px-[3cqw] overflow-hidden touch-none select-none outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 " +
                (i > 0 ? "border-l border-white/[0.06] " : "") +
                (active
                  ? "bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 shadow-[0_0_16px_-2px] shadow-amber-500/60 "
                  : hovered
                  ? "bg-amber-500/10 text-amber-300 "
                  : "bg-transparent text-neutral-400 ") +
                (pressed ? "scale-[0.97] " : "")
              }
            >
              {/* Active top edge accent */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 transition-all duration-200 ease-out"
                style={{
                  height: "8%",
                  background: active
                    ? "linear-gradient(90deg, rgba(253,230,138,0.0), rgba(253,230,138,0.9), rgba(253,230,138,0.0))"
                    : "transparent",
                }}
              />

              {/* Label */}
              <span
                className={
                  "relative z-10 min-w-0 truncate font-semibold uppercase tracking-widest leading-none transition-colors duration-200 ease-out " +
                  (active ? "text-neutral-950" : hovered ? "text-amber-300" : "text-neutral-400")
                }
                style={{ fontSize: "clamp(7px, 34cqh, 13px)" }}
              >
                {opt.label}
              </span>

              {/* Direction indicator */}
              <span
                aria-hidden
                className="relative z-10 shrink-0 flex items-center justify-center transition-all duration-200 ease-out"
                style={{
                  width: "clamp(8px, 30cqh, 16px)",
                  height: "clamp(8px, 30cqh, 16px)",
                  opacity: active || hovered ? 1 : 0.4,
                  transform: active ? "translateX(0)" : "translateX(-1px)",
                }}
              >
                <SortHeadersArrow active={active} dir={value.dir} hovered={hovered} />
              </span>

              {/* Base underline for inactive columns (subtle) */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[10%] bottom-0 transition-all duration-200 ease-out"
                style={{
                  height: "6%",
                  background: active
                    ? "transparent"
                    : hovered
                    ? "linear-gradient(90deg, rgba(251,191,36,0.0), rgba(251,191,36,0.5), rgba(251,191,36,0.0))"
                    : "transparent",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}