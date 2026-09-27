type ListSelectorProps = {
  items: { id: string; label: string; subtitle?: string; category?: string; status?: string; children?: { id: string; label: string; done?: boolean }[] }[];
  value: string | null;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

export const ListSelector_MIN = {"base":[11,5]};

export function ListSelector(props: ListSelectorProps) {
  const { items, value, onChange, onActivate } = props;
  const uid = useRef("listselector-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);

  const statusTone = (s?: string) => {
    const t = (s || "").toLowerCase();
    if (t.indexOf("done") >= 0 || t.indexOf("complete") >= 0 || t.indexOf("success") >= 0) return "text-emerald-400 border-emerald-400/50";
    if (t.indexOf("fail") >= 0 || t.indexOf("danger") >= 0 || t.indexOf("critical") >= 0) return "text-rose-500 border-rose-400/50";
    if (t.indexOf("active") >= 0 || t.indexOf("track") >= 0 || t.indexOf("progress") >= 0) return "text-cyan-300 border-cyan-400/50";
    if (t.indexOf("lock") >= 0 || t.indexOf("new") >= 0) return "text-amber-300 border-amber-300/50";
    return "text-fuchsia-400 border-fuchsia-400/40";
  };

  return (
    <div
      className="h-full w-full relative overflow-hidden bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"
      style={{ minWidth: ListSelector_MIN.base[0] + "rem", minHeight: ListSelector_MIN.base[1] + "rem" }}
    >
      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.08" />
            <stop offset="60%" stopColor="rgb(0,0,0)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
      </svg>

      {items.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500 animate-pulse">// no entries</div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => {
            const sel = value === it.id;
            const hov = hover === it.id;
            return (
              <div key={it.id} className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onPointerEnter={() => setHover(it.id)}
                  onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                  onClick={() => {
                    if (sel && onActivate) onActivate(it.id);
                    else onChange(it.id);
                  }}
                  onDoubleClick={() => { if (onActivate) onActivate(it.id); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (sel && onActivate) onActivate(it.id);
                      else onChange(it.id);
                    }
                  }}
                  className={
                    "relative flex items-center gap-2 p-2 cursor-pointer select-none border-b border-cyan-400/10 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
                    (sel
                      ? "bg-cyan-400/10 ring-1 ring-cyan-400/60 text-cyan-200"
                      : hov
                      ? "bg-cyan-400/10"
                      : "bg-transparent")
                  }
                >
                  <span
                    className={
                      "block w-[3px] self-stretch transition-all duration-200 " +
                      (sel ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" : hov ? "bg-cyan-400/50" : "bg-cyan-400/15")
                    }
                  />
                  <span
                    className={
                      "text-[10px] font-medium uppercase tracking-[0.15em] leading-tight tabular-nums transition-colors duration-200 " +
                      (sel ? "text-cyan-300" : "text-neutral-500")
                    }
                  >
                    {(i + 1 < 10 ? "0" : "") + (i + 1)}
                  </span>

                  <span className="flex-1 min-w-0 flex flex-col gap-[2px]">
                    <span className="flex items-baseline gap-2 min-w-0">
                      <span
                        className={
                          "min-w-0 truncate text-xs font-bold uppercase tracking-[0.18em] leading-none transition-colors duration-200 " +
                          (sel ? "text-cyan-100" : hov ? "text-cyan-200" : "text-cyan-100/80")
                        }
                      >
                        {it.label}
                      </span>
                      {it.category ? (
                        <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-fuchsia-400/80">
                          {it.category}
                        </span>
                      ) : null}
                    </span>
                    {it.subtitle ? (
                      <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-400">
                        {it.subtitle}
                      </span>
                    ) : null}
                  </span>

                  {it.status ? (
                    <span
                      className={
                        "min-w-0 truncate max-w-[40%] border rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.15em] leading-none bg-neutral-800/70 transition-all duration-200 " +
                        statusTone(it.status) +
                        (sel ? " shadow-[0_0_12px_rgba(232,121,249,0.5)]" : "")
                      }
                    >
                      {it.status}
                    </span>
                  ) : null}
                </div>

                {sel && it.children && it.children.length > 0 ? (
                  <div className="bg-black/50 border-b border-cyan-400/10 py-1">
                    {it.children.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 pl-6 pr-2 py-1">
                        <span
                          className={
                            "h-[6px] w-[6px] rotate-45 transition-all duration-200 " +
                            (c.done ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-cyan-400/40 animate-pulse")
                          }
                        />
                        <span
                          className={
                            "min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.15em] leading-tight " +
                            (c.done ? "text-neutral-500 line-through" : "text-cyan-200/70")
                          }
                        >
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}