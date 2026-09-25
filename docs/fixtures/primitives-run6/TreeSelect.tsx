type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };

export const TreeSelect_MIN = {"base":[9,5]};

export function TreeSelect(props: TreeSelectProps) {
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;

  const TreeSelectRowH = "min-h-[1.65rem]";

  type TSNode = { id: string; label: string; children?: any[] };

  const collectExpandable = (nodes: TSNode[], acc: Set<string>) => {
    for (const n of nodes) {
      if (n.children && n.children.length > 0) {
        acc.add(n.id);
        collectExpandable(n.children as TSNode[], acc);
      }
    }
    return acc;
  };

  const findPath = (nodes: TSNode[], target: string, trail: string[]): string[] | null => {
    for (const n of nodes) {
      if (n.id === target) return trail;
      if (n.children && n.children.length > 0) {
        const r = findPath(n.children as TSNode[], target, trail.concat(n.id));
        if (r) return r;
      }
    }
    return null;
  };

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const s = new Set<string>();
    const pathToSelected = findPath(props.options || [], props.value, []);
    if (pathToSelected) pathToSelected.forEach((id) => s.add(id));
    // default: open first level so tree reads as a tree
    for (const n of props.options || []) {
      if (n.children && n.children.length > 0) s.add(n.id);
    }
    return s;
  });

  // Keep ancestors of the selected value open when value changes externally.
  useEffect(() => {
    const path = findPath(props.options || [], props.value, []);
    if (!path || path.length === 0) return;
    setExpanded((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of path) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [props.value, props.options]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const Caret = (p: { open: boolean; muted: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      className={
        "h-[0.6rem] w-[0.6rem] shrink-0 transition-transform duration-200 ease-out " +
        (p.open ? "rotate-90 " : "rotate-0 ") +
        (p.muted ? "text-stone-600" : "text-amber-400")
      }
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );

  const FolderGlyph = (p: { open: boolean; selected: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      className={
        "h-[0.85rem] w-[0.85rem] shrink-0 transition-all duration-200 ease-out " +
        (p.selected ? "text-amber-300" : p.open ? "text-stone-300" : "text-stone-500")
      }
      fill="currentColor"
    >
      {p.open ? (
        <path d="M3 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1H8.6a2 2 0 0 0-1.9 1.4L4 19.5V6z" opacity="0.95" />
      ) : (
        <path d="M3 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
      )}
    </svg>
  );

  const LeafGlyph = (p: { selected: boolean }) => (
    <span
      className={
        "block h-[0.42rem] w-[0.42rem] shrink-0 rounded-[2px] rotate-45 transition-all duration-200 ease-out " +
        (p.selected ? "bg-lime-400 shadow-sm shadow-lime-400/50" : "bg-stone-600")
      }
    />
  );

  const renderNodes = (nodes: TSNode[], depth: number): any => {
    if (!nodes || nodes.length === 0) return null;
    return nodes.map((n) => {
      const hasChildren = !!(n.children && n.children.length > 0);
      const isOpen = expanded.has(n.id);
      const isSelected = props.value === n.id;

      return (
        <div key={"node-" + n.id} className="min-w-0">
          <div
            role="button"
            tabIndex={-1}
            onClick={() => {
              if (hasChildren) toggle(n.id);
              props.onChange(n.id);
            }}
            className={
              "group relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1 pr-2 " +
              TreeSelectRowH +
              " transition-all duration-200 ease-out " +
              (isSelected
                ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40 shadow-sm shadow-amber-500/20"
                : "text-stone-300 hover:bg-amber-500/10 hover:text-stone-100")
            }
            style={{ paddingLeft: 0.4 + depth * 0.85 + "rem" }}
          >
            {isSelected ? (
              <span className="pointer-events-none absolute left-0 top-1/2 h-[58%] w-[3px] -translate-y-1/2 rounded-full bg-amber-400 shadow-[0_0_8px] shadow-amber-500/50" />
            ) : null}

            <span className="flex h-[0.85rem] w-[0.7rem] shrink-0 items-center justify-center">
              {hasChildren ? (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(n.id);
                  }}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Caret open={isOpen} muted={!isSelected} />
                </span>
              ) : null}
            </span>

            {hasChildren ? (
              <FolderGlyph open={isOpen} selected={isSelected} />
            ) : (
              <LeafGlyph selected={isSelected} />
            )}

            <span
              className={
                "min-w-0 flex-1 truncate text-[11px] font-medium leading-none tracking-wide transition-colors duration-200 " +
                (isSelected ? "text-amber-200" : "")
              }
            >
              {n.label}
            </span>

            {hasChildren ? (
              <span
                className={
                  "shrink-0 rounded-[3px] px-1 py-[1px] text-[9px] font-semibold leading-none tabular-nums transition-all duration-200 " +
                  (isSelected
                    ? "bg-amber-400/20 text-amber-200"
                    : "bg-stone-800/70 text-stone-500 group-hover:text-stone-300")
                }
              >
                {(n.children as TSNode[]).length}
              </span>
            ) : null}
          </div>

          {hasChildren ? (
            <div
              className={
                "relative overflow-hidden transition-all duration-300 ease-out " +
                (isOpen ? "opacity-100" : "max-h-0 opacity-0")
              }
              style={isOpen ? undefined : { maxHeight: 0 }}
            >
              <span
                className="pointer-events-none absolute top-0 bottom-0 w-px bg-stone-700/50"
                style={{ left: 0.4 + depth * 0.85 + 0.35 + "rem" }}
              />
              {renderNodes(n.children as TSNode[], depth + 1)}
            </div>
          ) : null}
        </div>
      );
    });
  };

  const isEmpty = !props.options || props.options.length === 0;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: TreeSelect_MIN.base[0] + "rem", minHeight: TreeSelect_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/60" />
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-amber-500/[0.04] to-transparent" />

      <div className="relative flex h-full w-full flex-col">
        <div className="relative min-h-0 flex-1 overflow-y-auto px-1.5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isEmpty ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-stone-700"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
              </svg>
              <span className="text-[10px] font-medium uppercase tracking-widest text-stone-600">
                No Crates
              </span>
            </div>
          ) : (
            renderNodes(props.options as TSNode[], 0)
          )}
        </div>
      </div>
    </div>
  );
}