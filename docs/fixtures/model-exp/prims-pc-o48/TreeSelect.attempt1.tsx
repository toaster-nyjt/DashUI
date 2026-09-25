type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };
export const TreeSelect_MIN = {"base":[9,4]};
export function TreeSelect(props: TreeSelectProps) {
  const { options, value, onChange } = props;
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;
  const floor = (TreeSelect_MIN as any).base;

  type TSNode = { id: string; label: string; children?: any[] };

  // Track which branches are open. A branch is open by default when it (or a
  // descendant) is on the path to the selected value, so the selection is always
  // visible on first render.
  const findPath = (nodes: TSNode[], target: string, acc: string[]): string[] | null => {
    for (const n of nodes) {
      if (n.id === target) return acc.concat(n.id);
      if (n.children && n.children.length > 0) {
        const found = findPath(n.children as TSNode[], target, acc.concat(n.id));
        if (found) return found;
      }
    }
    return null;
  };

  const initialOpen = useMemo(() => {
    const set: Record<string, boolean> = {};
    const path = findPath(options as TSNode[], value, []);
    if (path) {
      // open all ancestors (exclude the node itself unless it has children)
      for (let i = 0; i < path.length; i++) set[path[i]] = true;
    }
    return set;
  }, []); // eslint-disable-line

  const [open, setOpen] = useState<Record<string, boolean>>(initialOpen);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpen((prev) => {
      const next: Record<string, boolean> = {};
      for (const k in prev) next[k] = prev[k];
      next[id] = !prev[id];
      return next;
    });
  };

  const isEmpty = !options || options.length === 0;

  // Chevron/twisty icon for expandable nodes
  const TreeSelectTwisty = (p: { open: boolean; hot: boolean }) => (
    <span
      className={
        "flex-none flex items-center justify-center transition-transform duration-200 ease-out " +
        (p.open ? "rotate-90 " : "rotate-0 ") +
        (p.hot ? "text-amber-300 " : "text-stone-500 ")
      }
      style={{ width: "0.85em", height: "0.85em" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  // Crate / folder glyph — differs subtly for a leaf vs a branch
  const TreeSelectGlyph = (p: { branch: boolean; open: boolean; selected: boolean; hot: boolean }) => {
    const color = p.selected
      ? "text-amber-300"
      : p.hot
      ? "text-amber-300"
      : p.branch
      ? "text-stone-400"
      : "text-stone-500";
    return (
      <span
        className={"flex-none flex items-center justify-center transition-colors duration-200 ease-out " + color}
        style={{ width: "1em", height: "1em" }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" preserveAspectRatio="xMidYMid meet">
          {p.branch ? (
            p.open ? (
              <>
                <path
                  d="M3 8.5V6.2C3 5.4 3.6 4.8 4.4 4.8H9l2 2h7.6c.8 0 1.4.6 1.4 1.4v1.1"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path
                  d="M2.6 10.5h18.8l-2 7.4c-.2.7-.8 1.3-1.6 1.3H5.6c-.7 0-1.4-.5-1.6-1.3l-1.4-7.4z"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                  fill="currentColor"
                  fillOpacity={0.16}
                />
              </>
            ) : (
              <path
                d="M3 7.2C3 6.4 3.6 5.8 4.4 5.8H9l2 2h7.6c.8 0 1.4.6 1.4 1.4v7.6c0 .8-.6 1.4-1.4 1.4H4.4C3.6 18.2 3 17.6 3 16.8V7.2z"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity={0.12}
              />
            )
          ) : (
            <>
              <path
                d="M6 3.6h8.4L19 8.2v11.2c0 .5-.4.9-.9.9H6c-.5 0-.9-.4-.9-.9V4.5c0-.5.4-.9.9-.9z"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity={0.1}
              />
              <path d="M14 3.8v4.4h4.4" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
            </>
          )}
        </svg>
      </span>
    );
  };

  const renderNodes = (nodes: TSNode[], depth: number): any => {
    return nodes.map((node) => {
      const hasChildren = !!(node.children && node.children.length > 0);
      const isOpen = !!open[node.id];
      const isSelected = node.id === value;
      const isHot = hoverId === node.id;

      return (
        <div key={"n-" + node.id} className="flex flex-col">
          <div
            role="treeitem"
            aria-selected={isSelected}
            aria-expanded={hasChildren ? isOpen : undefined}
            onMouseEnter={() => setHoverId(node.id)}
            onMouseLeave={() => setHoverId((h) => (h === node.id ? null : h))}
            onClick={() => {
              onChange(node.id);
              if (hasChildren) toggleOpen(node.id);
            }}
            className={
              "group relative flex items-center gap-[0.4em] rounded-md cursor-pointer select-none " +
              "transition-all duration-200 ease-out " +
              "px-[0.5em] py-[0.34em] " +
              (isSelected
                ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40 shadow-md shadow-amber-500/20 "
                : "text-stone-300 hover:bg-amber-500/10 hover:text-stone-100 ")
            }
            style={{ paddingLeft: 0.5 + depth * 1.05 + "em" }}
          >
            {/* Selection accent bar */}
            <span
              className={
                "absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out " +
                (isSelected ? "bg-amber-400 shadow-sm shadow-amber-500/50 " : "bg-transparent ")
              }
              style={{ width: "0.16em", height: isSelected ? "62%" : "0%" }}
              aria-hidden="true"
            />

            {/* Twisty (or spacer to keep glyphs aligned for leaves) */}
            {hasChildren ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOpen(node.id);
                }}
                className="flex-none flex items-center justify-center rounded-sm hover:bg-amber-500/10 transition-colors duration-150"
                style={{ width: "0.95em", height: "0.95em" }}
              >
                <TreeSelectTwisty open={isOpen} hot={isHot || isSelected} />
              </span>
            ) : (
              <span className="flex-none" style={{ width: "0.95em", height: "0.95em" }} aria-hidden="true" />
            )}

            <TreeSelectGlyph branch={hasChildren} open={isOpen} selected={isSelected} hot={isHot} />

            <span
              className={
                "min-w-0 flex-1 truncate transition-colors duration-200 ease-out " +
                (isSelected
                  ? "font-semibold "
                  : "font-normal ")
              }
            >
              {node.label}
            </span>

            {/* Child count badge for branches */}
            {hasChildren ? (
              <span
                className={
                  "flex-none tabular-nums font-mono tracking-tight transition-colors duration-200 ease-out " +
                  (isSelected ? "text-amber-300/80 " : isHot ? "text-amber-400/70 " : "text-stone-600 ")
                }
                style={{ fontSize: "0.78em" }}
              >
                {(node.children as TSNode[]).length}
              </span>
            ) : null}
          </div>

          {/* Children region with guide rail */}
          {hasChildren ? (
            <div
              className={
                "relative overflow-hidden transition-all duration-300 ease-out " +
                (isOpen ? "opacity-100 " : "opacity-0 ")
              }
              style={{
                maxHeight: isOpen ? "1000em" : "0em",
              }}
            >
              {isOpen ? (
                <>
                  <span
                    className="absolute top-0 bottom-0 bg-gradient-to-b from-amber-500/25 via-stone-700/50 to-stone-800/20"
                    style={{ left: 0.5 + depth * 1.05 + 0.47 + "em", width: "1px" }}
                    aria-hidden="true"
                  />
                  {renderNodes(node.children as TSNode[], depth + 1)}
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      );
    });
  };

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* Recessed crate-tree bed */}
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/50 overflow-hidden">
        {/* subtle top sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-amber-500/5 to-transparent"
          aria-hidden="true"
        />
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center px-[6%]">
            <FitText
              className="font-medium uppercase tracking-widest text-stone-600"
              wrap={false}
            >
              No Crates
            </FitText>
          </div>
        ) : (
          <div
            role="tree"
            className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div
              className="flex flex-col text-stone-300"
              style={{ fontSize: "0.82rem", padding: "0.4rem" }}
            >
              {renderNodes(options as TSNode[], 0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}