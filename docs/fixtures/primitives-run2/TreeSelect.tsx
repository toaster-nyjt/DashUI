type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };

export function TreeSelect(props: TreeSelectProps) {
  const { options, value, onChange } = props;

  type TreeSelectNode = { id: string; label: string; children?: any[] };

  const TreeSelectHasKids = (n: TreeSelectNode): boolean =>
    Array.isArray(n.children) && n.children.length > 0;

  const TreeSelectCollectOpenPath = (
    nodes: TreeSelectNode[],
    target: string,
    acc: string[]
  ): boolean => {
    for (const n of nodes) {
      if (n.id === target) return true;
      if (TreeSelectHasKids(n)) {
        if (TreeSelectCollectOpenPath(n.children as TreeSelectNode[], target, acc)) {
          acc.push(n.id);
          return true;
        }
      }
    }
    return false;
  };

  const initialOpen = useMemo(() => {
    const acc: string[] = [];
    TreeSelectCollectOpenPath(options as TreeSelectNode[], value, acc);
    const set: Record<string, boolean> = {};
    for (const id of acc) set[id] = true;
    // also open all top-level folders by default so the tree reads as a tree
    for (const n of options as TreeSelectNode[]) {
      if (TreeSelectHasKids(n) && set[n.id] === undefined) set[n.id] = true;
    }
    return set;
  }, [options]);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);

  // Ensure the branch leading to a newly-selected value is opened.
  useEffect(() => {
    const acc: string[] = [];
    TreeSelectCollectOpenPath(options as TreeSelectNode[], value, acc);
    if (acc.length === 0) return;
    setOpen((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const id of acc) {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [value, options]);

  const toggleOpen = useCallback((id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const TreeSelectChevron = (opts: { open: boolean; visible: boolean }) => {
    if (!opts.visible) {
      return <span className="inline-block w-[1.1em] shrink-0" aria-hidden="true" />;
    }
    return (
      <span
        className="inline-flex w-[1.1em] shrink-0 items-center justify-center text-amber-400/70 transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{ transform: opts.open ? "rotate(90deg)" : "rotate(0deg)" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 12 12" className="h-[0.85em] w-[0.85em]" fill="none">
          <path
            d="M4 2.5 L8 6 L4 9.5"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  };

  const TreeSelectFolderIcon = (opts: {
    open: boolean;
    hasKids: boolean;
    selected: boolean;
  }) => {
    const cls =
      "h-[0.95em] w-[0.95em] shrink-0 transition-colors duration-150 motion-reduce:transition-none " +
      (opts.selected ? "text-neutral-950" : "text-amber-400/80");
    if (!opts.hasKids) {
      // leaf crate: a small stacked "record crate" mark
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" aria-hidden="true">
          <rect
            x="2.5"
            y="4"
            width="11"
            height="8.5"
            rx="1.4"
            stroke="currentColor"
            strokeWidth={1.3}
          />
          <line
            x1="2.5"
            y1="7"
            x2="13.5"
            y2="7"
            stroke="currentColor"
            strokeWidth={1.1}
          />
          <circle cx="8" cy="9.8" r="1.15" stroke="currentColor" strokeWidth={1.1} />
        </svg>
      );
    }
    if (opts.open) {
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="none" aria-hidden="true">
          <path
            d="M2.4 5.2 C2.4 4.3 3.1 3.6 4 3.6 H6.2 L7.6 5 H12 C12.9 5 13.6 5.7 13.6 6.6 V6.9 H4.6 C3.9 6.9 3.3 7.3 3.1 8 L2 12"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d="M3.1 8 C3.3 7.3 3.9 6.9 4.6 6.9 H14.4 L13.1 11.3 C12.9 12 12.3 12.4 11.6 12.4 H2.4 C1.9 12.4 1.6 11.9 1.8 11.4 L3.1 8 Z"
            fill="currentColor"
            fillOpacity={0.14}
            stroke="currentColor"
            strokeWidth={1.25}
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 16 16" className={cls} fill="none" aria-hidden="true">
        <path
          d="M2.2 5 C2.2 4.1 2.9 3.4 3.8 3.4 H6.1 L7.5 4.8 H12.2 C13.1 4.8 13.8 5.5 13.8 6.4 V11 C13.8 11.9 13.1 12.6 12.2 12.6 H3.8 C2.9 12.6 2.2 11.9 2.2 11 V5 Z"
          fill="currentColor"
          fillOpacity={0.1}
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const TreeSelectRow = (opts: { node: TreeSelectNode; depth: number }) => {
    const { node, depth } = opts;
    const hasKids = TreeSelectHasKids(node);
    const isOpen = !!open[node.id];
    const selected = node.id === value;
    const [pressed, setPressed] = useState(false);

    const onActivate = () => {
      onChange(node.id);
      if (hasKids) toggleOpen(node.id);
    };

    const base =
      "group relative flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-all duration-150 ease-out select-none touch-none motion-reduce:transition-none border-l-2 ";
    const stateCls = selected
      ? "bg-amber-500 text-neutral-950 shadow-[0_0_12px_-1px] shadow-amber-500/60 border-amber-300"
      : "text-neutral-200 hover:bg-amber-500/10 hover:text-neutral-100 border-transparent hover:border-amber-400/50";
    const pressCls = pressed ? " scale-[0.98]" : "";

    return (
      <div className="min-w-0">
        <button
          type="button"
          onClick={onActivate}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          className={base + stateCls + pressCls}
          aria-expanded={hasKids ? isOpen : undefined}
          aria-selected={selected}
          title={node.label}
        >
          {/* indent guides */}
          {depth > 0 && (
            <span
              className="pointer-events-none flex shrink-0"
              aria-hidden="true"
              style={{ width: depth * 0.85 + "em" }}
            >
              {Array.from({ length: depth }).map((_, i) => (
                <span
                  key={"g-" + i}
                  className="block h-full w-[0.85em] shrink-0"
                  style={{
                    borderLeft: "1px solid rgba(251,191,36,0.14)",
                  }}
                />
              ))}
            </span>
          )}

          {TreeSelectChevron({ open: isOpen, visible: hasKids })}
          {TreeSelectFolderIcon({ open: isOpen, hasKids, selected })}

          <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-snug tracking-normal">
            {node.label}
          </span>

          {hasKids && (
            <span
              className={
                "ml-auto shrink-0 rounded px-1 font-mono text-[10px] tabular-nums leading-none transition-colors duration-150 motion-reduce:transition-none " +
                (selected
                  ? "bg-neutral-950/25 text-neutral-900"
                  : "bg-neutral-800/70 text-neutral-500 group-hover:text-amber-400/80")
              }
            >
              {(node.children as TreeSelectNode[]).length}
            </span>
          )}

          {/* selected accent tick */}
          {selected && (
            <span
              className="pointer-events-none absolute right-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-neutral-950/70"
              aria-hidden="true"
            />
          )}
        </button>

        {hasKids && (
          <div
            className="overflow-hidden transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
            style={{
              display: "grid",
              gridTemplateRows: isOpen ? "1fr" : "0fr",
            }}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="pt-0.5">
                {(node.children as TreeSelectNode[]).map((child) => (
                  <TreeSelectRow key={child.id} node={child} depth={depth + 1} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const isEmpty = !Array.isArray(options) || options.length === 0;

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size]">
      {isEmpty ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
          <svg
            viewBox="0 0 24 24"
            className="h-[14%] max-h-8 min-h-4 w-auto text-neutral-700"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 7 C3 5.6 4.1 4.5 5.5 4.5 H9 L11 6.5 H18.5 C19.9 6.5 21 7.6 21 9 V16.5 C21 17.9 19.9 19 18.5 19 H5.5 C4.1 19 3 17.9 3 16.5 V7 Z"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[11px] font-normal leading-tight tracking-normal text-neutral-600">
            No crates
          </span>
        </div>
      ) : (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col gap-0.5 pr-0.5">
            {(options as TreeSelectNode[]).map((node) => (
              <TreeSelectRow key={node.id} node={node} depth={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}