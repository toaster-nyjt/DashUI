type SortHeadersProps = { options: { id: string; label: string }[]; value: { field: string; dir: 'asc' | 'desc' }; onChange: (v: { field: string; dir: 'asc' | 'desc' }) => void };

export const SortHeaders_MIN = {"base":[8,1.75]};

export function SortHeaders(props: SortHeadersProps) {
  const { options, value, onChange } = props;
  const uid = useRef("sortheaders-" + Math.random().toString(36).slice(2)).current;
  const floor = SortHeaders_MIN.base;

  const handle = (id: string) => {
    if (value && value.field === id) {
      onChange({ field: id, dir: value.dir === "asc" ? "desc" : "asc" });
    } else {
      onChange({ field: id, dir: "asc" });
    }
  };

  return (
    <div
      className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {options.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600">
            no columns
          </span>
        </div>
      ) : (
        <div className="flex h-full w-full flex-wrap content-stretch items-stretch gap-2">
          {options.map((o, i) => {
            const active = !!value && value.field === o.id;
            const asc = active && value.dir === "asc";
            return (
              <button
                key={"sh-" + uid + "-" + o.id + "-" + i}
                type="button"
                onClick={() => handle(o.id)}
                className={
                  "group relative flex min-w-0 flex-1 basis-[5.5rem] items-center justify-between gap-2 overflow-hidden rounded-lg border px-2 py-1 transition-all duration-200 ease-out active:translate-y-0 active:scale-95 " +
                  (active
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-200 shadow-lg shadow-amber-500/30"
                    : "border-stone-700/60 bg-stone-950/80 text-stone-400 shadow-md shadow-black/40 hover:-translate-y-px hover:border-amber-400/60 hover:text-amber-300 hover:shadow-lg hover:shadow-amber-500/30")
                }
              >
                <span
                  className={
                    "pointer-events-none absolute inset-x-0 bottom-0 h-px transition-all duration-300 ease-out " +
                    (active ? "bg-amber-400/70" : "bg-transparent group-hover:bg-amber-400/30")
                  }
                />
                <span className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-[10px]">
                  {o.label}
                </span>
                <svg
                  viewBox="0 0 12 12"
                  preserveAspectRatio="xMidYMid meet"
                  className={
                    "h-3 w-3 transition-all duration-200 ease-out " +
                    (active
                      ? "opacity-100 " + (asc ? "rotate-0" : "rotate-180")
                      : "rotate-0 opacity-25 group-hover:opacity-60")
                  }
                >
                  <path
                    d="M6 2.2 L10 8.2 L2 8.2 Z"
                    fill={active ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}