type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };
export function TreeSelect(props: TreeSelectProps) {
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;
  const { options, value, onChange } = props;

  type TreeSelectNode = { id: string; label: string; children?: any[] };

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({});

  const TreeSelectHasKids = (n: TreeSelectNode): boolean =>
    Array.isArray(n.children) && n.children.length > 0;

  // Build path to selected node so its ancestors auto-expand.
  const TreeSelectPathToValue = useMemo(() => {
    const path: Record<string, boolean> = {};
    const walk = (nodes: TreeSelectNode[], trail: string[]): boolean => {
      for (const n of nodes) {
        if (n.id === value) {
          for (const t of trail) path[t] = true;
          return true;
        }
        if (TreeSelectHasKids(n)) {
          if (walk(n.children as TreeSelectNode[], trail.concat(n.id))) {
            for (const t of trail) path[t] = true;
            return true;
          }
        }
      }
      return false;
    };
    if (Array.isArray(options)) walk(options, []);
    return path;
  }, [options, value]);

  const TreeSelectIsExpanded = (id: string): boolean => {
    if (Object.prototype.hasOwnProperty.call(manualExpanded, id)) return manualExpanded[id];
    return !!TreeSelectPathToValue[id];
  };

  const TreeSelectToggle = (id: string) => {
    setManualExpanded((prev) => {
      const cur = Object.prototype.hasOwnProperty.call(prev, id)
        ? prev[id]
        : !!TreeSelectPathToValue[id];
      return { ...prev, [id]: !cur };
    });
  };

  const TreeSelectChevron = (open: boolean, active: boolean) => (
    <span
      className={
        "flex items-center justify-center transition-transform duration-200 ease-out motion-reduce:transition-none " +
        (open ? "rotate-90" : "rotate-0")
      }
      style={{ width: "1em", height: "1em" }}
    >
      <svg viewBox="0 0 12 12" width="0.72em" height="0.72em" preserveAspectRatio="xMidYMid meet">
        <path
          d="M4 2 L8.5 6 L4 10"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={active ? "text-amber-300" : "text-neutral-500"}
        />
      </svg>
    </span>
  );

  const TreeSelectFolderIcon = (open: boolean, selected: boolean, active: boolean) => (
    <span
      className="relative flex items-center justify-center shrink-0"
      style={{ width: "1.15em", height: "1.15em" }}
    >
      <svg viewBox="0 0 20 20" width="1.15em" height="1.15em" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={uid + "-fold"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={selected ? "#fbbf24" : active ? "#d1a04a" : "#8a8172"} />
            <stop offset="100%" stopColor={selected ? "#d97706" : active ? "#7a6236" : "#4d4842"} />
          </linearGradient>
        </defs>
        {open ? (
          <>
            <path
              d="M2.5 5.5 C2.5 4.7 3.1 4.1 3.9 4.1 L7.4 4.1 L8.9 5.7 L15.2 5.7 C16 5.7 16.6 6.3 16.6 7.1 L16.6 7.6 L4.4 7.6 L2.5 14.4 Z"
              fill={"url(#" + uid + "-fold)"}
              opacity={0.55}
            />
            <path
              d="M4.4 7.9 L18 7.9 L15.9 15.1 C15.7 15.7 15.2 16 14.6 16 L2.6 16 C2 16 1.7 15.5 1.9 15 Z"
              fill={"url(#" + uid + "-fold)"}
            />
          </>
        ) : (
          <path
            d="M2.5 6 C2.5 5.2 3.1 4.6 3.9 4.6 L7.4 4.6 L8.9 6.2 L15.6 6.2 C16.4 6.2 17 6.8 17 7.6 L17 14 C17 14.8 16.4 15.4 15.6 15.4 L3.9 15.4 C3.1 15.4 2.5 14.8 2.5 14 Z"
            fill={"url(#" + uid + "-fold)"}
          />
        )}
      </svg>
    </span>
  );

  const TreeSelectLeafIcon = (selected: boolean, active: boolean) => (
    <span
      className="relative flex items-center justify-center shrink-0"
      style={{ width: "1.05em", height: "1.05em" }}
    >
      <svg viewBox="0 0 20 20" width="1.05em" height="1.05em" preserveAspectRatio="xMidYMid meet">
        <path
          d="M8 3.2 L8 12.4 A2.6 2.6 0 1 1 6.7 10.1 L6.7 5 L14 4 L14 11 A2.6 2.6 0 1 1 12.7 8.8 L12.7 5.3 L8 6 Z"
          fill={selected ? "#fcd34d" : active ? "#c9a15a" : "#7c7468"}
        />
      </svg>
    </span>
  );

  const TreeSelectRenderNodes = (nodes: TreeSelectNode[], depth: number) => {
    return nodes.map((node) => {
      const hasKids = TreeSelectHasKids(node);
      const open = hasKids && TreeSelectIsExpanded(node.id);
      const selected = node.id === value;
      const hovered = hoverId === node.id;
      const pressed = pressId === node.id;
      const active = selected || hovered;

      return (
        <div key={"ts-" + node.id} className="flex flex-col">
          <div
            role="treeitem"
            aria-selected={selected}
            aria-expanded={hasKids ? open : undefined}
            onPointerDown={() => setPressId(node.id)}
            onPointerUp={() => setPressId(null)}
            onPointerCancel={() => setPressId(null)}
            onPointerLeave={() => {
              setHoverId((p) => (p === node.id ? null : p));
              setPressId((p) => (p === node.id ? null : p));
            }}
            onPointerEnter={() => setHoverId(node.id)}
            onClick={() => {
              onChange(node.id);
              if (hasKids) TreeSelectToggle(node.id);
            }}
            className={
              "group relative flex items-center gap-[0.5em] cursor-pointer select-none rounded-md " +
              "transition-all duration-150 ease-out motion-reduce:transition-none " +
              (selected
                ? "bg-amber-500/15 text-neutral-100 shadow-[0_0_16px_-6px] shadow-amber-500/60"
                : hovered
                ? "bg-amber-500/10 text-neutral-100"
                : "text-neutral-300 hover:text-neutral-100") +
              (pressed ? " scale-[0.985]" : "")
            }
            style={{
              paddingTop: "0.42em",
              paddingBottom: "0.42em",
              paddingRight: "0.6em",
              paddingLeft: (0.55 + depth * 1.05) + "em",
              fontSize: "inherit",
            }}
          >
            {/* Selection accent bar */}
            <span
              className={
                "absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out motion-reduce:transition-none " +
                (selected
                  ? "bg-amber-400 shadow-[0_0_10px_0] shadow-amber-500/70"
                  : hovered
                  ? "bg-amber-400/40"
                  : "bg-transparent")
              }
              style={{ width: "0.18em", height: selected ? "72%" : "50%" }}
            />

            {/* Depth guide rails */}
            {depth > 0 &&
              Array.from({ length: depth }).map((_, i) => (
                <span
                  key={"rail-" + i}
                  className={active ? "absolute bg-amber-400/15" : "absolute bg-white/[0.05]"}
                  style={{
                    left: (0.55 + i * 1.05 + 0.5) + "em",
                    top: 0,
                    bottom: 0,
                    width: "1px",
                  }}
                />
              ))}

            {/* Chevron or spacer */}
            <span
              className="relative z-10 flex items-center justify-center shrink-0"
              style={{ width: "1em", height: "1em" }}
              onClick={(e) => {
                if (hasKids) {
                  e.stopPropagation();
                  TreeSelectToggle(node.id);
                }
              }}
            >
              {hasKids ? (
                TreeSelectChevron(open, active)
              ) : (
                <span
                  className={
                    "rounded-full " + (active ? "bg-amber-400/50" : "bg-neutral-700")
                  }
                  style={{ width: "0.22em", height: "0.22em" }}
                />
              )}
            </span>

            {/* Icon */}
            <span className="relative z-10 flex items-center">
              {hasKids
                ? TreeSelectFolderIcon(open, selected, active)
                : TreeSelectLeafIcon(selected, active)}
            </span>

            {/* Label */}
            <span
              className={
                "relative z-10 min-w-0 flex-1 truncate leading-snug tracking-tight " +
                (selected ? "font-semibold text-amber-200" : "font-medium")
              }
              style={{ fontSize: "0.92em" }}
              title={node.label}
            >
              {node.label}
            </span>

            {/* Count badge for folders */}
            {hasKids && (
              <span
                className={
                  "relative z-10 shrink-0 rounded-full tabular-nums font-mono transition-colors duration-150 " +
                  (active
                    ? "bg-amber-500/20 text-amber-200 border border-amber-400/30"
                    : "bg-neutral-800/80 text-neutral-500 border border-neutral-700/60")
                }
                style={{
                  fontSize: "0.62em",
                  paddingLeft: "0.5em",
                  paddingRight: "0.5em",
                  paddingTop: "0.12em",
                  paddingBottom: "0.12em",
                  lineHeight: 1,
                }}
              >
                {(node.children as TreeSelectNode[]).length}
              </span>
            )}
          </div>

          {/* Children */}
          {hasKids && (
            <div
              className={
                "overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none " +
                (open ? "opacity-100" : "opacity-0")
              }
              style={{
                display: open ? "block" : "none",
              }}
            >
              <div className="flex flex-col">
                {TreeSelectRenderNodes(node.children as TreeSelectNode[], depth + 1)}
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const empty = !Array.isArray(options) || options.length === 0;

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] flex flex-col">
      <div
        role="tree"
        className={
          "h-full w-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden " +
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
        style={{ fontSize: "clamp(11px, 4.2cqmin, 15px)" }}
      >
        {empty ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[0.6em] px-[1em] text-center">
            <span
              className="flex items-center justify-center opacity-40"
              style={{ width: "2.4em", height: "2.4em" }}
            >
              <svg viewBox="0 0 24 24" width="2.4em" height="2.4em" preserveAspectRatio="xMidYMid meet">
                <path
                  d="M3 7 C3 6 3.7 5.3 4.7 5.3 L9 5.3 L10.8 7.2 L19 7.2 C20 7.2 20.7 7.9 20.7 8.9 L20.7 17 C20.7 18 20 18.7 19 18.7 L4.7 18.7 C3.7 18.7 3 18 3 17 Z"
                  fill="none"
                  stroke="#8a8172"
                  strokeWidth={1.3}
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className="font-semibold uppercase tracking-widest text-neutral-600"
              style={{ fontSize: "0.7em" }}
            >
              No Crates
            </span>
          </div>
        ) : (
          <div className="flex flex-col py-[0.35em]">
            {TreeSelectRenderNodes(options as TreeSelectNode[], 0)}
          </div>
        )}
      </div>
    </div>
  );
}