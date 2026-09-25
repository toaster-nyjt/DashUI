type SortHeadersProps = { options: { id: string; label: string }[]; value: { field: string; dir: "asc" | "desc" }; onChange: (v: { field: string; dir: "asc" | "desc" }) => void };

export const SortHeaders_MIN = {"base":[7,1.75]};

export function SortHeaders(props: SortHeadersProps) {
  const { options, value, onChange } = props;
  const uid = useRef("sortheaders-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState<string | null>(null);

  const floor = SortHeaders_MIN.base;

  const pick = (id: string) => {
    if (value && value.field === id) onChange({ field: id, dir: value.dir === "asc" ? "desc" : "asc" });
    else onChange({ field: id, dir: "asc" });
  };

  const Arrow = (p: { dir: "asc" | "desc"; active: boolean }) => (
    <svg
      viewBox="0 0 12 12"
      preserveAspectRatio="xMidYMid meet"
      className={"h-[0.7em] w-[0.7em] transition-all duration-200 ease-out " + (p.active ? "opacity-100" : "opacity-0 scale-75")}
      style={{ transform: p.dir === "desc" ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <defs>
        <linearGradient id={uid + "-g"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(253 230 138)" />
          <stop offset="100%" stopColor="rgb(245 158 11)" />
        </linearGradient>
      </defs>
      <path d="M6 1.5 L10.5 8.5 L1.5 8.5 Z" fill={"url(#" + uid + "-g)"} />
    </svg>
  );

  return (
    <div
      className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {options.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600">—</span>
        </div>
      ) : (
        <div
          className="grid h-full w-full content-start gap-2 border-b border-amber-500/15 bg-neutral-900/80 px-2 py-1"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(4.5rem, 1fr))" }}
        >
          {options.map((o) => {
            const active = !!value && value.field === o.id;
            const dir = active ? value.dir : "asc";
            const down = pressed === o.id;
            return (
              <button
                key={"sh-" + o.id}
                type="button"
                onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPressed(o.id); }}
                onPointerUp={() => setPressed(null)}
                onPointerCancel={() => setPressed(null)}
                onClick={() => pick(o.id)}
                className={
                  "group relative flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border px-2 py-1 font-medium uppercase tracking-widest leading-none text-[10px] transition-all duration-200 ease-out touch-none " +
                  (active
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-200 shadow-md shadow-amber-500/30 "
                    : "border-stone-700/60 bg-stone-950/60 text-stone-400 hover:border-amber-400/60 hover:text-amber-300 hover:shadow-md hover:shadow-amber-500/30 hover:-translate-y-px ") +
                  (down ? "scale-95 brightness-95" : "")
                }
              >
                <span className="min-w-0 truncate">{o.label}</span>
                <Arrow dir={dir} active={active} />
                <span
                  className={
                    "pointer-events-none absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-amber-400 to-lime-400 transition-all duration-300 ease-out " +
                    (active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60")
                  }
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}