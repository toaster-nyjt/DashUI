type TreeSelectorProps = { nodes: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };

export function TreeSelector(props: TreeSelectorProps) {
  const TreeSelectorChevron = (p: { open: boolean; hasChildren: boolean }) => {
    if (!p.hasChildren) {
      return (
        <span className="inline-flex items-center justify-center shrink-0 w-[1.15em] h-[1.15em]">
          <span className="w-[0.3em] h-[0.3em] rounded-full bg-neutral-600" />
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center shrink-0 w-[1.15em] h-[1.15em]">
        <svg
          viewBox="0 0 24 24"
          className={
            "w-[0.9em] h-[0.9em] transition-transform duration-200 ease-out motion-reduce:transition-none " +
            (p.open ? "rotate-90 text-amber-400" : "rotate-0 text-neutral-500")
          }
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    );
  };

  const TreeSelectorCrateIcon = (p: { open: boolean; hasChildren: boolean; selected: boolean }) => {
    const tone = p.selected ? "text-neutral-950" : p.open && p.hasChildren ? "text-amber-400" : "text-neutral-500";
    if (p.hasChildren) {
      return (
        <svg
          viewBox="0 0 24 24"
          className={"w-[1.05em] h-[1.05em] shrink-0 transition-colors duration-150 motion-reduce:transition-none " + tone}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {p.open ? (
            <path d="M3 8h18l-2 10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1L3 8zM3 8l2-3h4l2 2h8" />
          ) : (
            <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
          )}
        </svg>
      );
    }
    return (
      <svg
        viewBox="0 0 24 24"
        className={"w-[1.05em] h-[1.05em] shrink-0 transition-colors duration-150 motion-reduce:transition-none " + tone}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="2.6" />
        <circle cx="16" cy="16" r="2.6" />
      </svg>
    );
  };

  const collectIds = (list: { id: string; label: string; children?: any[] }[], acc: string[]) => {
    for (const n of list) {
      acc.push(n.id);
      if (n.children && n.children.length) collectIds(n.children as any[], acc);
    }
    return acc;
  };

  const findPath = (
    list: { id: string; label: string; children?: any[] }[],
    target: string,
    trail: string[]
  ): string[] | null => {
    for (const n of list) {
      const nextTrail = trail.concat(n.id);
      if (n.id === target) return nextTrail;
      if (n.children && n.children.length) {
        const found = findPath(n.children as any[], target, nextTrail);
        if (found) return found;
      }
    }
    return null;
  };

  const allIds = useMemo(() => collectIds(props.nodes || [], []), [props.nodes]);

  const initialOpen = useMemo(() => {
    const set: Record<string, boolean> = {};
    const path = findPath(props.nodes || [], props.value, []);
    if (path) for (const id of path) set[id] = true;
    return set;
  }, []);

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setOpen((prev) => {
      const path = findPath(props.nodes || [], props.value, []);
      if (!path) return prev;
      let changed = false;
      const next = { ...prev };
      for (const id of path) {
        if (!next[id]) {
          next[id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [props.value, props.nodes]);

  const toggle = (id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasNodes = (props.nodes || []).length > 0;

  const renderNodes = (
    list: { id: string; label: string; children?: any[] }[],
    depth: number
  ) => {
    return list.map((node, idx) => {
      const kids = (node.children || []) as { id: string; label: string; children?: any[] }[];
      const hasChildren = kids.length > 0;
      const isOpen = !!open[node.id];
      const selected = node.id === props.value;
      const isHovered = hovered === node.id;

      return (
        <li key={node.id} className="relative">
          {depth > 0 && (
            <span
              className="absolute top-0 bottom-0 w-px bg-white/[0.05]"
              style={{ left: (depth * 0.85 - 0.55) + "em" }}
              aria-hidden="true"
            />
          )}
          <div
            role="treeitem"
            aria-selected={selected}
            aria-expanded={hasChildren ? isOpen : undefined}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered((h) => (h === node.id ? null : h))}
            onClick={() => {
              props.onChange(node.id);
              if (hasChildren) toggle(node.id);
            }}
            className={
              "group relative flex items-center gap-[0.5em] rounded-md cursor-pointer select-none " +
              "px-[0.5em] py-[0.42em] transition-all duration-150 ease-out motion-reduce:transition-none " +
              (selected
                ? "bg-amber-500 text-neutral-950 shadow-[0_0_14px_-3px] shadow-amber-500/60"
                : isHovered
                ? "bg-amber-500/10 text-neutral-100"
                : "text-neutral-300")
            }
            style={{ paddingLeft: (depth * 0.85 + 0.5) + "em" }}
          >
            {!selected && isHovered && (
              <span className="absolute left-0 top-[0.28em] bottom-[0.28em] w-[2px] rounded-full bg-amber-400/60" aria-hidden="true" />
            )}

            <span
              onClick={(e) => {
                if (hasChildren) {
                  e.stopPropagation();
                  toggle(node.id);
                }
              }}
              className={hasChildren ? "cursor-pointer" : ""}
            >
              <TreeSelectorChevron open={isOpen} hasChildren={hasChildren} />
            </span>

            <TreeSelectorCrateIcon open={isOpen} hasChildren={hasChildren} selected={selected} />

            <span
              className={
                "flex-1 min-w-0 truncate text-[length:1em] leading-snug tracking-tight " +
                (selected ? "font-semibold" : "font-medium")
              }
            >
              {node.label}
            </span>

            {hasChildren && (
              <span
                className={
                  "shrink-0 tabular-nums font-mono text-[0.78em] leading-none px-[0.5em] py-[0.28em] rounded-md " +
                  "transition-colors duration-150 motion-reduce:transition-none " +
                  (selected
                    ? "bg-neutral-950/25 text-neutral-950"
                    : isHovered
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-neutral-800/70 text-neutral-500")
                }
              >
                {kids.length}
              </span>
            )}
          </div>

          {hasChildren && (
            <div
              className={
                "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none " +
                (isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")
              }
            >
              <div className="overflow-hidden min-h-0">
                <ul className="flex flex-col gap-[0.15em] pt-[0.15em]">
                  {renderNodes(kids, depth + 1)}
                </ul>
              </div>
            </div>
          )}
        </li>
      );
    });
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] text-[clamp(11px,4.2cqmin,17px)] flex flex-col">
      {hasNodes ? (
        <div
          role="tree"
          className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex flex-col gap-[0.15em] pr-[0.2em]">{renderNodes(props.nodes, 0)}</ul>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-[0.6em] text-center px-[1em]">
          <svg
            viewBox="0 0 24 24"
            className="w-[2.4em] h-[2.4em] text-neutral-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
          </svg>
          <span className="text-[0.85em] font-semibold uppercase tracking-widest text-neutral-600">
            No Crates
          </span>
        </div>
      )}
    </div>
  );
}