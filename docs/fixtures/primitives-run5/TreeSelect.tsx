type TreeSelectNode = { id: string; label: string; children?: any[] };

type TreeSelectProps = {
  options: { id: string; label: string; children?: any[] }[];
  value: string;
  onChange: (id: string) => void;
};

export function TreeSelect(props: TreeSelectProps) {
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;

  const nodes = Array.isArray(props.options) ? props.options : [];

  // Build helpers -----------------------------------------------------------
  const TreeSelectFlatten = (
    list: TreeSelectNode[],
    depth: number,
    acc: { node: TreeSelectNode; depth: number; hasChildren: boolean }[]
  ) => {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (!n || typeof n.id !== "string") continue;
      const kids: TreeSelectNode[] = Array.isArray(n.children) ? n.children : [];
      acc.push({ node: n, depth, hasChildren: kids.length > 0 });
      if (kids.length > 0) TreeSelectFlatten(kids, depth + 1, acc);
    }
    return acc;
  };

  // path (set of ancestor ids) leading to the selected value
  const TreeSelectFindPath = (
    list: TreeSelectNode[],
    target: string,
    trail: string[]
  ): string[] | null => {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (!n || typeof n.id !== "string") continue;
      const next = trail.concat(n.id);
      if (n.id === target) return next;
      const kids: TreeSelectNode[] = Array.isArray(n.children) ? n.children : [];
      if (kids.length > 0) {
        const found = TreeSelectFindPath(kids, target, next);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedPath = useMemo(() => {
    const p = TreeSelectFindPath(nodes, props.value, []);
    return p ? p : [];
  }, [nodes, props.value]);

  // expansion state: transient UI state, seeded so the selected node's
  // ancestors are open. Keyed set of expanded ids.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [userTouched, setUserTouched] = useState(false);

  // Auto-open ancestors of the selected node (only until the user interacts).
  useEffect(() => {
    if (userTouched) return;
    if (selectedPath.length <= 1) return;
    setExpanded((prev) => {
      const next = { ...prev };
      let changed = false;
      // open all ancestors except the leaf itself
      for (let i = 0; i < selectedPath.length - 1; i++) {
        const id = selectedPath[i];
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [selectedPath, userTouched]);

  const toggle = (id: string) => {
    setUserTouched(true);
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute visible rows given expansion state.
  const visible = useMemo(() => {
    const rows: {
      node: TreeSelectNode;
      depth: number;
      hasChildren: boolean;
      open: boolean;
    }[] = [];
    const walk = (list: TreeSelectNode[], depth: number) => {
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        if (!n || typeof n.id !== "string") continue;
        const kids: TreeSelectNode[] = Array.isArray(n.children) ? n.children : [];
        const hasChildren = kids.length > 0;
        const open = !!expanded[n.id];
        rows.push({ node: n, depth, hasChildren, open });
        if (hasChildren && open) walk(kids, depth + 1);
      }
    };
    walk(nodes, 0);
    return rows;
  }, [nodes, expanded]);

  // Chevron glyph ------------------------------------------------------------
  const TreeSelectChevron = (o: { open: boolean }) => (
    <span
      className="flex items-center justify-center transition-transform duration-200 ease-out"
      style={{ transform: o.open ? "rotate(90deg)" : "rotate(0deg)" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 16 16" className="h-[0.9em] w-[0.9em]" preserveAspectRatio="xMidYMid meet">
        <path d="M6 4 L11 8 L6 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );

  // Crate/folder icon --------------------------------------------------------
  const TreeSelectCrate = (o: { hasChildren: boolean; open: boolean; selected: boolean }) => (
    <span className="flex items-center justify-center transition-colors duration-200 ease-out" aria-hidden="true">
      <svg viewBox="0 0 20 20" className="h-[1.05em] w-[1.05em]" preserveAspectRatio="xMidYMid meet">
        {o.hasChildren ? (
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ transition: "opacity 200ms ease-out" }}
          >
            <path
              d={
                o.open
                  ? "M3 7 H8 L9.5 8.5 H17 V15 H3 Z M4.5 9 H18 L16.5 15 H3 Z"
                  : "M3 7 H8 L9.5 8.5 H17 V15 H3 Z"
              }
            />
          </g>
        ) : (
          <g fill="currentColor">
            <circle cx="7" cy="13" r="2.4" />
            <rect x="8.6" y="4.5" width="1.5" height="8.5" rx="0.6" />
            <path d="M8.6 4.5 L14.5 6 V8.4 L8.6 6.9 Z" />
          </g>
        )}
      </svg>
    </span>
  );

  const isEmpty = visible.length === 0;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col">
      <div className="relative flex-1 min-h-0 min-w-0">
        {/* subtle inset well vignette drawn purely with tints */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-stone-800/40" aria-hidden="true" />

        <div
          className="h-full w-full min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tree"
        >
          {isEmpty ? (
            <div className="h-full w-full flex items-center justify-center px-3 py-4">
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600 select-none">
                Empty Crate
              </span>
            </div>
          ) : (
            <ul className="flex flex-col py-1">
              {visible.map((row, idx) => {
                const id = row.node.id;
                const selected = id === props.value;
                const onPath = selectedPath.indexOf(id) !== -1 && !selected;
                const indent = row.depth;

                return (
                  <li key={"row-" + id + "-" + idx} role="treeitem" aria-selected={selected} aria-expanded={row.hasChildren ? row.open : undefined}>
                    <div
                      className={
                        "group relative flex items-stretch cursor-pointer select-none transition-all duration-200 ease-out " +
                        (selected
                          ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40 shadow-lg shadow-amber-500/20"
                          : onPath
                          ? "text-stone-200 hover:bg-amber-500/10"
                          : "text-stone-400 hover:bg-amber-500/10 hover:text-stone-100")
                      }
                      onClick={() => props.onChange(id)}
                    >
                      {/* left selection accent bar */}
                      <span
                        className={
                          "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-all duration-200 ease-out " +
                          (selected
                            ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                            : onPath
                            ? "bg-amber-500/40"
                            : "bg-transparent group-hover:bg-amber-500/25")
                        }
                        aria-hidden="true"
                      />

                      {/* indentation guides + spacing */}
                      <div className="flex items-stretch shrink-0" aria-hidden="true">
                        {Array.from({ length: indent }).map((_, d) => (
                          <span
                            key={"ind-" + id + "-" + d}
                            className="relative flex w-[1.15em] items-stretch justify-center"
                          >
                            <span
                              className={
                                "w-px my-[0.15em] rounded-full transition-colors duration-200 ease-out " +
                                (onPath || selected ? "bg-amber-500/25" : "bg-stone-700/40")
                              }
                            />
                          </span>
                        ))}
                      </div>

                      {/* twisty / disclosure */}
                      <button
                        type="button"
                        className={
                          "shrink-0 flex items-center justify-center w-[1.5em] transition-colors duration-200 ease-out touch-none " +
                          (row.hasChildren
                            ? selected
                              ? "text-amber-300 hover:text-amber-200"
                              : "text-stone-500 hover:text-amber-300"
                            : "text-transparent")
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          if (row.hasChildren) toggle(id);
                        }}
                        tabIndex={-1}
                        aria-hidden={!row.hasChildren}
                      >
                        {row.hasChildren ? <TreeSelectChevron open={row.open} /> : null}
                      </button>

                      {/* crate icon */}
                      <div
                        className={
                          "shrink-0 flex items-center justify-center pr-[0.35em] transition-colors duration-200 ease-out " +
                          (selected
                            ? "text-amber-300"
                            : onPath
                            ? "text-amber-400/70"
                            : row.hasChildren
                            ? "text-stone-500 group-hover:text-amber-300/80"
                            : "text-lime-400/70 group-hover:text-lime-300")
                        }
                      >
                        <TreeSelectCrate hasChildren={row.hasChildren} open={row.open} selected={selected} />
                      </div>

                      {/* label (operational text) */}
                      <div className="min-w-0 flex-1 flex items-center py-[0.4em] pr-2">
                        <span
                          className={
                            "min-w-0 truncate text-[13px] leading-none transition-all duration-200 ease-out " +
                            (selected
                              ? "font-semibold tracking-tight text-amber-200"
                              : row.hasChildren
                              ? "font-medium tracking-tight"
                              : "font-normal tracking-normal")
                          }
                        >
                          {row.node.label}
                        </span>
                      </div>

                      {/* selected pulse dot */}
                      {selected ? (
                        <span className="shrink-0 flex items-center pr-2">
                          <span className="h-[0.4em] w-[0.4em] rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.7)] animate-pulse" aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}