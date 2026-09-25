type SortHeadersProps = { options: { id: string; label: string }[]; value: { field: string; dir: 'asc' | 'desc' }; onChange: (v: { field: string; dir: 'asc' | 'desc' }) => void };
export const SortHeaders_MIN = {"base":[8,1.5]};
export function SortHeaders(props: SortHeadersProps) {
  const { options, value, onChange } = props;
  const uid = useRef("sortheaders-" + Math.random().toString(36).slice(2)).current;
  const floor = SortHeaders_MIN.base;

  const [pressedId, setPressedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    if (value.field === id) {
      onChange({ field: id, dir: value.dir === "asc" ? "desc" : "asc" });
    } else {
      onChange({ field: id, dir: "asc" });
    }
  };

  const SortHeadersArrow = (p: { active: boolean; dir: 'asc' | 'desc' }) => {
    const rot = p.dir === "asc" ? 180 : 0;
    return (
      <span
        className="relative inline-flex items-center justify-center shrink-0"
        style={{ width: "0.85em", height: "0.85em" }}
      >
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full transition-transform duration-200 ease-out"
          style={{
            transform: "rotate(" + rot + "deg)",
            opacity: p.active ? 1 : 0.28,
          }}
        >
          <defs>
            <linearGradient id={uid + "-arrow"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(253 230 138)" />
              <stop offset="100%" stopColor="rgb(245 158 11)" />
            </linearGradient>
          </defs>
          <path
            d="M12 5 L19 15 L5 15 Z"
            fill={p.active ? "url(#" + uid + "-arrow)" : "rgb(120 113 108)"}
            className="transition-all duration-200 ease-out"
          />
        </svg>
      </span>
    );
  };

  return (
    <div
      className="relative h-full w-full flex items-stretch overflow-hidden select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/40 to-neutral-950/60 pointer-events-none rounded-md" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-amber-500/20 pointer-events-none" />

      <div className="relative flex-1 min-w-0 flex items-stretch overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.length === 0 ? (
          <div className="flex-1 min-w-0 flex items-center justify-center px-2">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600 truncate">
              No columns
            </span>
          </div>
        ) : (
          options.map((opt, i) => {
            const active = value.field === opt.id;
            const pressed = pressedId === opt.id;
            const hovered = hoverId === opt.id;
            return (
              <button
                key={"col-" + opt.id + "-" + i}
                type="button"
                onPointerDown={() => setPressedId(opt.id)}
                onPointerUp={() => setPressedId(null)}
                onPointerLeave={() => {
                  setPressedId((p) => (p === opt.id ? null : p));
                  setHoverId((h) => (h === opt.id ? null : h));
                }}
                onPointerEnter={() => setHoverId(opt.id)}
                onPointerCancel={() => setPressedId(null)}
                onClick={() => handleClick(opt.id)}
                className={
                  "relative group flex-1 min-w-0 flex items-center justify-between gap-1.5 px-2 transition-all duration-200 ease-out touch-none outline-none " +
                  (i > 0 ? "border-l border-stone-800/70 " : "") +
                  (active
                    ? "bg-amber-500/15 "
                    : hovered
                    ? "bg-amber-500/10 "
                    : "bg-transparent ") +
                  (pressed ? "scale-[0.97] brightness-95 " : "")
                }
              >
                {active && (
                  <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-500/0 via-amber-400 to-amber-500/0 shadow-lg shadow-amber-500/30 pointer-events-none" />
                )}
                {active && (
                  <span className="absolute inset-0 ring-1 ring-inset ring-amber-500/30 pointer-events-none rounded-sm" />
                )}

                <span className="relative flex-1 min-w-0 h-full flex items-center overflow-hidden">
                  <span
                    className={
                      "min-w-0 truncate font-semibold uppercase tracking-wider leading-none text-[11px] transition-colors duration-200 ease-out " +
                      (active
                        ? "text-amber-200"
                        : hovered
                        ? "text-stone-100"
                        : "text-stone-400")
                    }
                  >
                    {opt.label}
                  </span>
                </span>

                <SortHeadersArrow active={active} dir={active ? value.dir : "desc"} />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}