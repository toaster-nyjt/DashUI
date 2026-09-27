type SelectionListProps = {
  options: { id: string; label: string; sublabel?: string; detail?: string; meta?: string | number; locked?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: { id: string; label: string; detail?: string; done?: boolean }[] }[];
  value?: string;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
  expandedId?: string;
  onExpandedChange?: (id: string | null) => void;
};

export const SelectionList_MIN = {"base":[11,5]};

export function SelectionList(props: SelectionListProps) {
  const uid = useRef("sellist-" + Math.random().toString(36).slice(2)).current;
  const { options, value, onChange, onActivate, expandedId, onExpandedChange } = props;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const floor = SelectionList_MIN.base;

  useEffect(() => {
    if (!value) return;
    setPulse(value);
    const t = setTimeout(() => setPulse(null), 420);
    return () => clearTimeout(t);
  }, [value]);

  const toneText = (t?: string, sel?: boolean) =>
    t === "danger" ? "text-red-400" : t === "accent" ? "text-fuchsia-300" : sel ? "text-cyan-50" : "text-cyan-100/90";
  const toneEdge = (t?: string) =>
    t === "danger" ? "bg-red-500" : t === "accent" ? "bg-fuchsia-400" : "bg-cyan-400";

  return (
    <div
      className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {options.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">no entries</span>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2 p-[2px]">
          {options.map((o, i) => {
            const sel = value === o.id;
            const exp = expandedId === o.id && !!o.children && o.children.length > 0;
            const hov = hover === o.id && !o.locked;
            const canExpand = !!o.children && o.children.length > 0 && !!onExpandedChange && !o.locked;
            return (
              <div
                key={o.id}
                className={
                  "relative w-full overflow-hidden rounded-md border transition-all duration-200 ease-out " +
                  (o.locked
                    ? "border-cyan-500/20 bg-[#07070c] opacity-40 grayscale "
                    : sel
                    ? "border-yellow-300/60 bg-[linear-gradient(100deg,rgba(253,224,71,0.10)_0%,rgba(10,10,20,0.95)_60%)] shadow-[0_0_16px_rgba(253,224,71,0.4)] "
                    : hov
                    ? "border-cyan-400/50 bg-cyan-500/10 "
                    : "border-cyan-500/20 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] ") +
                  (pulse === o.id ? "ring-2 ring-fuchsia-400/60 " : "")
                }
                onPointerEnter={() => setHover(o.id)}
                onPointerLeave={() => setHover((h) => (h === o.id ? null : h))}
              >
                {/* tone edge */}
                <div
                  className={
                    "pointer-events-none absolute left-0 top-0 h-full transition-all duration-200 ease-out " +
                    (sel ? "w-[3px] bg-yellow-300 " : hov ? "w-[3px] " + toneEdge(o.tone) : "w-[2px] " + toneEdge(o.tone) + " opacity-50")
                  }
                />
                {/* scan sheen */}
                <div
                  className={
                    "pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.10)_50%,transparent_100%)] transition-opacity duration-500 " +
                    (hov || sel ? "opacity-100" : "opacity-0")
                  }
                />
                <div
                  role="button"
                  tabIndex={o.locked ? -1 : 0}
                  className={"relative flex w-full items-center gap-2 p-2 pl-3 " + (o.locked ? "cursor-not-allowed" : "cursor-pointer")}
                  onPointerDown={(e) => {
                    if (o.locked) return;
                    e.preventDefault();
                    onChange(o.id);
                  }}
                  onDoubleClick={() => { if (!o.locked && onActivate) onActivate(o.id); }}
                  onKeyDown={(e) => {
                    if (o.locked) return;
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(o.id); if (e.key === "Enter" && onActivate) onActivate(o.id); }
                  }}
                >
                  {/* index marker */}
                  <div className="flex w-[1.1rem] min-w-0 flex-col items-center justify-center">
                    <span
                      className={
                        "font-mono text-[10px] leading-none tracking-wide transition-colors duration-200 " +
                        (sel ? "text-yellow-300 drop-shadow-[0_0_6px_currentColor]" : "text-slate-500")
                      }
                    >
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span
                        className={
                          "min-w-0 flex-1 truncate font-mono text-xs font-semibold uppercase leading-none tracking-wider transition-colors duration-200 " +
                          toneText(o.tone, sel)
                        }
                      >
                        {o.label}
                      </span>
                      {o.sublabel ? (
                        <span className="min-w-0 max-w-[45%] truncate rounded-sm border border-fuchsia-500/40 bg-fuchsia-500/15 px-2 py-1 font-mono text-[10px] uppercase leading-none tracking-wider text-fuchsia-300">
                          {o.sublabel}
                        </span>
                      ) : null}
                    </div>
                    {o.detail ? (
                      <span className="min-w-0 truncate font-sans text-[10px] leading-snug text-cyan-300/80">{o.detail}</span>
                    ) : null}
                  </div>

                  {o.meta !== undefined && o.meta !== null ? (
                    <span
                      className={
                        "min-w-0 truncate font-mono text-xs font-black leading-none tracking-tight transition-all duration-200 " +
                        (sel ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" : "text-cyan-200")
                      }
                    >
                      {o.meta}
                    </span>
                  ) : null}

                  {o.locked ? (
                    <svg viewBox="0 0 24 24" className="h-3 w-3 text-slate-500" preserveAspectRatio="xMidYMid meet">
                      <rect x="5" y="10" width="14" height="10" rx="2" fill="currentColor" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ) : canExpand ? (
                    <button
                      type="button"
                      className="flex h-5 w-5 items-center justify-center rounded-sm border border-cyan-500/20 text-cyan-300 transition-all duration-200 ease-out hover:border-cyan-400/60 hover:bg-cyan-500/30 hover:text-cyan-100"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpandedChange!(exp ? null : o.id);
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className={"h-3 w-3 transition-transform duration-300 ease-out " + (exp ? "rotate-90" : "rotate-0")}
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ) : null}
                </div>

                {/* nested children */}
                {o.children && o.children.length > 0 ? (
                  <div
                    className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{ gridTemplateRows: exp ? "1fr" : "0fr", opacity: exp ? 1 : 0 }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="flex flex-col gap-1 border-t border-cyan-500/20 bg-black/50 p-2 pl-3">
                        {o.children.map((c) => (
                          <div key={uid + "-" + c.id} className="flex min-w-0 items-center gap-2">
                            <span
                              className={
                                "h-[6px] w-[6px] rotate-45 transition-all duration-200 " +
                                (c.done ? "bg-lime-400 drop-shadow-[0_0_6px_currentColor]" : "border border-cyan-400/60 bg-transparent")
                              }
                            />
                            <span
                              className={
                                "min-w-0 flex-1 truncate font-mono text-[10px] uppercase leading-none tracking-wider " +
                                (c.done ? "text-slate-500 line-through" : "text-cyan-100/90")
                              }
                            >
                              {c.label}
                            </span>
                            {c.detail ? (
                              <span className="min-w-0 max-w-[40%] truncate font-mono text-[10px] leading-none tracking-wide text-slate-500">
                                {c.detail}
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
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