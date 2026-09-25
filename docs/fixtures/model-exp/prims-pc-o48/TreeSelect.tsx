type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };

export const TreeSelect_MIN = {"base":[8,4]};

export function TreeSelect(props: TreeSelectProps) {
  const { options, value, onChange } = props;
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;
  const floor = (TreeSelect_MIN as any).base;

  type TSNode = { id: string; label: string; children?: any[] };

  const TreeSelectHasKids = (n: TSNode) => Array.isArray(n.children) && n.children.length > 0;

  // Collect ids of ancestors that contain the current value, so they auto-open.
  const openInit = useMemo(() => {
    const set: Record<string, boolean> = {};
    const walk = (nodes: TSNode[], trail: string[]): boolean => {
      let hit = false;
      for (const n of nodes || []) {
        const selfHit = n.id === value;
        const childHit = TreeSelectHasKids(n) ? walk(n.children as TSNode[], trail.concat(n.id)) : false;
        if (selfHit || childHit) {
          for (const t of trail) set[t] = true;
          if (childHit) set[n.id] = true;
          hit = true;
        }
      }
      return hit;
    };
    walk(options || [], []);
    return set;
  }, [options, value]);

  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState(false);

  // Merge auto-open (from value) with user toggles; user intent wins once touched.
  const effectiveOpen = (id: string): boolean => {
    if (Object.prototype.hasOwnProperty.call(open, id)) return open[id];
    return !!openInit[id];
  };

  const toggle = (id: string) => {
    setTouched(true);
    setOpen((prev) => {
      const cur = Object.prototype.hasOwnProperty.call(prev, id) ? prev[id] : !!openInit[id];
      return { ...prev, [id]: !cur };
    });
  };

  const isEmpty = !options || options.length === 0;

  const TreeSelectChevron = (o: { open: boolean; hot: boolean }) => (
    <span
      className={
        "flex items-center justify-center transition-transform duration-200 ease-out " +
        (o.open ? "rotate-90 " : "rotate-0 ") +
        (o.hot ? "text-amber-300" : "text-stone-500")
      }
      style={{ width: "0.9em", height: "0.9em" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 12 12" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path d="M4 2.5 L8.5 6 L4 9.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  const TreeSelectDot = (o: { selected: boolean }) => (
    <span
      className="relative flex items-center justify-center shrink-0"
      style={{ width: "0.55em", height: "0.55em" }}
      aria-hidden="true"
    >
      <span
        className={
          "absolute inset-0 rounded-full transition-all duration-200 ease-out " +
          (o.selected ? "bg-lime-400 shadow-lg shadow-lime-400/40" : "bg-stone-700")
        }
      />
      {o.selected ? (
        <span className="absolute inset-0 rounded-full bg-lime-400/60 animate-ping" />
      ) : null}
    </span>
  );

  const renderNodes = (nodes: TSNode[], depth: number) => {
    return nodes.map((n, i) => {
      const kids = TreeSelectHasKids(n);
      const opened = kids && effectiveOpen(n.id);
      const selected = n.id === value;
      const rowKey = "row-" + n.id + "-" + depth + "-" + i;
      return (
        <div key={rowKey} className="flex flex-col">
          <div
            role="treeitem"
            aria-selected={selected}
            aria-expanded={kids ? opened : undefined}
            onClick={(e) => {
              e.stopPropagation();
              onChange(n.id);
              if (kids && !opened) {
                setTouched(true);
                setOpen((prev) => ({ ...prev, [n.id]: true }));
              }
            }}
            className={
              "group relative flex items-center gap-2 rounded-md cursor-pointer select-none " +
              "text-[11px] font-medium tracking-wide leading-none " +
              "transition-all duration-200 ease-out " +
              "py-2 pr-2 " +
              (selected
                ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40 shadow-sm shadow-amber-500/10"
                : "text-stone-300 hover:bg-amber-500/10 hover:text-stone-100")
            }
            style={{ paddingLeft: "0.5rem" }}
          >
            {/* indentation guides */}
            <span className="flex items-stretch self-stretch shrink-0" aria-hidden="true">
              {Array.from({ length: depth }).map((_, d) => (
                <span
                  key={"ind-" + d}
                  className={
                    "border-l transition-colors duration-200 ease-out " +
                    (selected ? "border-amber-500/30" : "border-stone-800/70")
                  }
                  style={{ width: "0.75rem" }}
                />
              ))}
            </span>

            {/* chevron or spacer */}
            {kids ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(n.id);
                }}
                className={
                  "flex items-center justify-center shrink-0 rounded-sm transition-all duration-200 ease-out " +
                  "hover:bg-amber-500/15 active:scale-90"
                }
                style={{ width: "1.1em", height: "1.1em" }}
                aria-label={opened ? "collapse" : "expand"}
              >
                <TreeSelectChevron open={!!opened} hot={selected} />
              </button>
            ) : (
              <span className="shrink-0" style={{ width: "1.1em" }} aria-hidden="true" />
            )}

            {/* selection dot / crate marker */}
            <TreeSelectDot selected={selected} />

            {/* label */}
            <span className="min-w-0 flex-1 truncate uppercase tracking-wider">{n.label}</span>

            {/* trailing count for containers */}
            {kids ? (
              <span
                className={
                  "shrink-0 tabular-nums text-[10px] leading-none rounded-full px-1.5 py-0.5 border transition-all duration-200 ease-out " +
                  (selected
                    ? "text-amber-200 border-amber-400/40 bg-amber-500/10"
                    : "text-stone-500 border-stone-800/70 bg-stone-950/40 group-hover:text-amber-300 group-hover:border-amber-400/40")
                }
              >
                {(n.children as TSNode[]).length}
              </span>
            ) : null}

            {/* active edge glow */}
            {selected ? (
              <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-full bg-lime-400 shadow-lg shadow-lime-400/50" />
            ) : null}
          </div>

          {/* children */}
          {kids ? (
            <div
              className={
                "overflow-hidden transition-all duration-300 ease-out " +
                (opened ? "opacity-100" : "opacity-0")
              }
              style={{
                maxHeight: opened ? "9999px" : "0px",
              }}
            >
              {opened ? <div className="flex flex-col">{renderNodes(n.children as TSNode[], depth + 1)}</div> : null}
            </div>
          ) : null}
        </div>
      );
    });
  };

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 flex flex-col">
        {/* scroll body */}
        <div
          role="tree"
          className={
            "flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden " +
            "flex flex-col gap-0.5"
          }
          style={{ paddingLeft: "0.35rem", paddingRight: "0.35rem", paddingTop: "0.35rem", paddingBottom: "0.35rem" }}
        >
          {isEmpty ? (
            <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-stone-600">
                <span
                  className="rounded-md border border-stone-800/70 bg-stone-950/60 flex items-center justify-center"
                  style={{ width: "1.6rem", height: "1.6rem" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="w-3/5 h-3/5" preserveAspectRatio="xMidYMid meet">
                    <path
                      d="M3 6.5 C3 5.7 3.6 5 4.4 5 H9 L11 7 H19.6 C20.4 7 21 7.7 21 8.5 V17 C21 17.8 20.4 18.5 19.6 18.5 H4.4 C3.6 18.5 3 17.8 3 17 Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[10px] uppercase tracking-widest leading-none">No Crates</span>
              </div>
            </div>
          ) : (
            renderNodes(options, 0)
          )}
        </div>
      </div>
    </div>
  );
}