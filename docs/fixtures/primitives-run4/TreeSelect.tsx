type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };
export function TreeSelect(props: TreeSelectProps) {
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;

  type TreeSelectNode = { id: string; label: string; children?: any[] };

  // ---- utilities (all internal) -------------------------------------------

  const TreeSelectHasKids = (n: TreeSelectNode) =>
    Array.isArray(n.children) && n.children.length > 0;

  // Build id -> ancestor-path map so we can auto-expand to the selected node.
  const pathToSelected = useMemo(() => {
    const path: string[] = [];
    const walk = (nodes: TreeSelectNode[], trail: string[]): boolean => {
      for (const n of nodes) {
        if (n.id === props.value) {
          for (const t of trail) path.push(t);
          return true;
        }
        if (TreeSelectHasKids(n)) {
          if (walk(n.children as TreeSelectNode[], trail.concat(n.id))) return true;
        }
      }
      return false;
    };
    walk(props.options || [], []);
    return path;
  }, [props.options, props.value]);

  // Expansion state: which branch ids are open. Transient UI state (allowed).
  // Seed with the ancestors of the current value so selection is always visible.
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  // Ensure the path to the selected node is always visible without clobbering
  // the user's manual toggles.
  useEffect(() => {
    if (pathToSelected.length === 0) return;
    setOpenIds((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of pathToSelected) {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pathToSelected]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ---- sub components ------------------------------------------------------

  const TreeSelectChevron = (p: { open: boolean; visible: boolean }) => {
    if (!p.visible) {
      // leaf spacer keeps rows aligned; a subtle dot marks a leaf.
      return (
        <span className="flex h-full w-[1.1em] shrink-0 items-center justify-center">
          <span className="h-[3px] w-[3px] rounded-full bg-neutral-700" />
        </span>
      );
    }
    return (
      <span className="flex h-full w-[1.1em] shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          className={
            "h-[0.8em] w-[0.8em] transition-transform duration-200 ease-out motion-reduce:transition-none " +
            (p.open ? "rotate-90" : "rotate-0")
          }
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    );
  };

  const TreeSelectCrateIcon = (p: {
    hasKids: boolean;
    open: boolean;
    selected: boolean;
  }) => {
    return (
      <span
        className={
          "flex h-full w-[1.15em] shrink-0 items-center justify-center transition-colors duration-200 ease-out motion-reduce:transition-none " +
          (p.selected ? "text-amber-300" : p.hasKids ? "text-amber-400/70" : "text-neutral-500")
        }
      >
        {p.hasKids ? (
          <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            {p.open ? (
              <>
                <path d="M3 7h5l2 2h9a1 1 0 0 1 1 1v1H4l-1 8" />
                <path d="M3 20l2-9h17l-2 9z" />
              </>
            ) : (
              <>
                <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
              </>
            )}
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-[0.92em] w-[0.92em]" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="17" r="3" />
            <path d="M11 17V5l9-2v11" />
            <circle cx="17" cy="15" r="3" />
          </svg>
        )}
      </span>
    );
  };

  const TreeSelectRows = (p: { nodes: TreeSelectNode[]; depth: number }) => {
    if (!p.nodes || p.nodes.length === 0) return null;
    return (
      <>
        {p.nodes.map((node) => {
          const hasKids = TreeSelectHasKids(node);
          const isOpen = !!openIds[node.id];
          const isSelected = node.id === props.value;
          const isAncestor = pathToSelected.includes(node.id);

          const indent = 0.25 + p.depth * 0.95; // in em, scales with row font

          return (
            <div key={node.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => {
                  props.onChange(node.id);
                  if (hasKids) toggleOpen(node.id);
                }}
                style={{ paddingLeft: indent + "em" }}
                className={
                  "group relative flex items-center gap-[0.4em] pr-[0.6em] py-[0.5em] text-left transition-all duration-150 ease-out outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
                  (isSelected
                    ? "bg-amber-500/15 text-amber-200 shadow-[inset_0_0_14px_-6px_rgba(245,158,11,0.9)]"
                    : isAncestor
                    ? "text-neutral-200 hover:bg-amber-500/10"
                    : "text-neutral-300 hover:bg-amber-500/10")
                }
              >
                {/* left selection/active bar */}
                <span
                  className={
                    "pointer-events-none absolute left-0 top-0 h-full w-[2px] transition-all duration-200 ease-out motion-reduce:transition-none " +
                    (isSelected
                      ? "bg-amber-400 shadow-[0_0_10px_-1px] shadow-amber-500/70"
                      : isAncestor
                      ? "bg-amber-400/25"
                      : "bg-transparent group-hover:bg-amber-400/40")
                  }
                />

                {/* depth guide line (subtle) */}
                {p.depth > 0 && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-0 h-full w-px bg-white/[0.05]"
                    style={{ left: (0.25 + (p.depth - 1) * 0.95 + 0.55) + "em" }}
                  />
                )}

                <TreeSelectChevron open={isOpen} visible={hasKids} />
                <TreeSelectCrateIcon hasKids={hasKids} open={isOpen} selected={isSelected} />

                <span
                  className={
                    "min-w-0 flex-1 truncate text-[13px] leading-snug transition-colors duration-150 motion-reduce:transition-none " +
                    (isSelected
                      ? "font-semibold tracking-tight"
                      : "font-medium")
                  }
                >
                  {node.label}
                </span>

                {/* child count badge */}
                {hasKids && (
                  <span
                    className={
                      "ml-[0.3em] shrink-0 rounded-md px-[0.4em] py-[0.05em] font-mono text-[10px] tabular-nums transition-colors duration-200 ease-out motion-reduce:transition-none " +
                      (isSelected
                        ? "bg-amber-500/25 text-amber-200"
                        : "bg-neutral-800/70 text-neutral-500 group-hover:text-amber-300/80")
                    }
                  >
                    {node.children!.length}
                  </span>
                )}
              </button>

              {/* children region with reveal animation */}
              {hasKids && (
                <div
                  className={
                    "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none " +
                    (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")
                  }
                >
                  <div className="min-h-0 overflow-hidden">
                    <TreeSelectRows nodes={node.children as TreeSelectNode[]} depth={p.depth + 1} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  const isEmpty = !props.options || props.options.length === 0;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col overflow-hidden">
      {isEmpty ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-[0.6em] px-4 text-center">
          <svg viewBox="0 0 24 24" className="h-[2em] w-[2em] text-neutral-700" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          </svg>
          <span className="text-[11px] font-normal tracking-normal leading-tight text-neutral-600">
            No crates
          </span>
        </div>
      ) : (
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col py-[0.25em]">
            <TreeSelectRows nodes={props.options} depth={0} />
          </div>
        </div>
      )}
    </div>
  );
}