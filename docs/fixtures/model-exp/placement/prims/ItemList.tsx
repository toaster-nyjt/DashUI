type ItemListProps = {
  items: { id: string; label: string; subtitle?: string; meta?: string; value?: number | string; locked?: boolean; expandable?: boolean; children?: { id: string; label: string; meta?: string; value?: number | string; locked?: boolean }[] }[];
  value: string | null;
  onChange: (id: string) => void;
  expandedIds?: string[];
  onToggleExpand?: (id: string) => void;
  onActivate?: (id: string) => void;
};

export const ItemList_MIN = {"base":[9,4.5]};

export function ItemList(props: ItemListProps) {
  const { items, value, onChange, expandedIds, onToggleExpand, onActivate } = props;
  const uid = useRef("itemlist-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const prevSel = useRef<string | null>(value);

  useEffect(() => {
    if (value !== prevSel.current) {
      prevSel.current = value;
      setFlash(value);
      const t = setTimeout(() => setFlash(null), 420);
      return () => clearTimeout(t);
    }
  }, [value]);

  const isExpanded = (id: string) => !!(expandedIds && expandedIds.indexOf(id) >= 0);

  const rowBase =
    "relative w-full text-left flex items-center gap-2 p-2 border-l-2 transition-all duration-200 ease-out outline-none";

  const ItemListChevron = (p: { open: boolean; dim: boolean }) => (
    <svg viewBox="0 0 24 24" className="h-3 w-3" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <path
        d="M9 5 L16 12 L9 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transformOrigin: "50% 50%",
          transform: "rotate(" + (p.open ? 90 : 0) + "deg)",
          transition: "transform 220ms cubic-bezier(0.22,1,0.36,1)",
          opacity: p.dim ? 0.45 : 1,
        }}
      />
    </svg>
  );

  return (
    <div
      className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/20 rounded-md"
      style={{ minWidth: ItemList_MIN.base[0] + "rem", minHeight: ItemList_MIN.base[1] + "rem" }}
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id={uid + "-sel"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(253,224,71,0.22)" />
            <stop offset="100%" stopColor="rgba(217,70,239,0.05)" />
          </linearGradient>
        </defs>
      </svg>

      {items.length === 0 ? (
        <div className="h-full w-full flex items-center justify-center p-2">
          <span className="font-mono tracking-[0.2em] uppercase text-[10px] text-slate-500">// no data</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {items.map((it, idx) => {
            const sel = value === it.id;
            const hov = hover === it.id;
            const open = isExpanded(it.id);
            const canExpand = !!it.expandable && !!onToggleExpand;
            const kids = open && it.children ? it.children : [];
            return (
              <div key={it.id} className="flex flex-col">
                <div
                  role="button"
                  tabIndex={-1}
                  onPointerEnter={() => setHover(it.id)}
                  onPointerLeave={() => setHover((h) => (h === it.id ? null : h))}
                  onClick={() => { if (!it.locked) onChange(it.id); }}
                  onDoubleClick={() => { if (!it.locked && onActivate) onActivate(it.id); }}
                  className={
                    rowBase +
                    " " +
                    (it.locked
                      ? "opacity-40 grayscale border-transparent cursor-default"
                      : sel
                      ? "border-yellow-300/70 bg-[linear-gradient(90deg,rgba(253,224,71,0.16)_0%,rgba(217,70,239,0.06)_100%)] shadow-[0_0_16px_rgba(253,224,71,0.25)] cursor-pointer"
                      : "border-transparent hover:bg-cyan-500/10 hover:border-cyan-400 cursor-pointer") +
                    (flash === it.id ? " ring-2 ring-fuchsia-400/60" : "") +
                    (idx > 0 ? " border-t border-t-cyan-500/10" : "")
                  }
                >
                  {canExpand ? (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => { e.stopPropagation(); onToggleExpand && onToggleExpand(it.id); }}
                      className="shrink text-cyan-300 hover:text-yellow-300 transition-all duration-200 ease-out"
                    >
                      <ItemListChevron open={open} dim={false} />
                    </button>
                  ) : (
                    <span
                      className={
                        "h-1.5 w-1.5 rounded-sm transition-all duration-200 " +
                        (sel
                          ? "bg-yellow-300 drop-shadow-[0_0_6px_currentColor] text-yellow-300"
                          : hov
                          ? "bg-cyan-400"
                          : "bg-cyan-500/30")
                      }
                    />
                  )}

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span
                        className={
                          "min-w-0 truncate font-mono font-semibold tracking-wider uppercase text-xs leading-tight transition-colors duration-200 " +
                          (sel ? "text-yellow-300" : it.locked ? "text-slate-500" : "text-cyan-50")
                        }
                      >
                        {it.label}
                      </span>
                      {it.meta ? (
                        <span className="min-w-0 truncate font-mono tracking-wide text-[10px] leading-tight text-slate-500">
                          {it.meta}
                        </span>
                      ) : null}
                    </div>
                    {it.subtitle ? (
                      <span className="min-w-0 truncate font-sans text-[11px] leading-snug text-cyan-100/70">
                        {it.subtitle}
                      </span>
                    ) : null}
                  </div>

                  {it.value !== undefined && it.value !== null ? (
                    <span
                      className={
                        "min-w-0 truncate font-mono font-black tracking-tight text-xs leading-none transition-all duration-200 " +
                        (sel
                          ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                          : "text-cyan-300/80")
                      }
                    >
                      {it.value}
                    </span>
                  ) : null}

                  {onActivate && !it.locked ? (
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={(e) => { e.stopPropagation(); onActivate(it.id); }}
                      className={
                        "font-mono font-bold tracking-[0.15em] uppercase text-[10px] leading-none px-2 py-1 rounded-sm border transition-all duration-200 ease-out " +
                        (sel || hov
                          ? "opacity-100 border-yellow-300/40 bg-yellow-300 text-black hover:bg-yellow-200 hover:shadow-[0_0_18px_rgba(253,224,71,0.6)] hover:-translate-y-px active:translate-y-0 active:brightness-90"
                          : "opacity-0 border-transparent bg-transparent text-transparent pointer-events-none")
                      }
                    >
                      GO
                    </button>
                  ) : null}

                  {it.locked ? (
                    <span className="font-mono tracking-wider uppercase text-[10px] leading-none text-slate-500">
                      LOCK
                    </span>
                  ) : null}
                </div>

                {kids.length > 0 ? (
                  <div className="relative flex flex-col border-l border-cyan-500/20 ml-4">
                    {kids.map((c) => {
                      const csel = value === c.id;
                      const chov = hover === c.id;
                      return (
                        <div
                          key={c.id}
                          role="button"
                          tabIndex={-1}
                          onPointerEnter={() => setHover(c.id)}
                          onPointerLeave={() => setHover((h) => (h === c.id ? null : h))}
                          onClick={() => { if (!c.locked) onChange(c.id); }}
                          onDoubleClick={() => { if (!c.locked && onActivate) onActivate(c.id); }}
                          className={
                            "relative flex items-center gap-2 p-2 pl-3 border-l-2 transition-all duration-200 ease-out " +
                            (c.locked
                              ? "opacity-40 grayscale border-transparent cursor-default"
                              : csel
                              ? "border-fuchsia-400 bg-fuchsia-500/15 cursor-pointer"
                              : "border-transparent hover:bg-cyan-500/10 hover:border-cyan-400 cursor-pointer")
                          }
                        >
                          <span
                            className={
                              "h-px w-2 transition-all duration-200 " +
                              (csel ? "bg-fuchsia-400" : chov ? "bg-cyan-400" : "bg-cyan-500/30")
                            }
                          />
                          <span
                            className={
                              "flex-1 min-w-0 truncate font-mono tracking-wider uppercase text-[10px] leading-none transition-colors duration-200 " +
                              (csel ? "text-fuchsia-300" : c.locked ? "text-slate-500" : "text-cyan-200/90")
                            }
                          >
                            {c.label}
                          </span>
                          {c.meta ? (
                            <span className="min-w-0 truncate font-mono tracking-wide text-[10px] leading-none text-slate-500">
                              {c.meta}
                            </span>
                          ) : null}
                          {c.value !== undefined && c.value !== null ? (
                            <span
                              className={
                                "min-w-0 truncate font-mono font-black tracking-tight text-[10px] leading-none " +
                                (csel ? "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" : "text-cyan-300/80")
                              }
                            >
                              {c.value}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
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