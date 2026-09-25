type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };

export const TreeSelect_MIN = {"base":[7,3.5]};

export function TreeSelect(props: TreeSelectProps) {
  const { options, value, onChange } = props;
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<string | null>(null);

  const TreeSelectFlatten = (nodes: any[], depth: number, acc: { id: string; label: string; depth: number; hasKids: boolean; open: boolean }[]) => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!n || typeof n.id !== "string") continue;
      const kids = Array.isArray(n.children) ? n.children : [];
      const open = !collapsed[n.id];
      acc.push({ id: n.id, label: String(n.label == null ? "" : n.label), depth: depth, hasKids: kids.length > 0, open: open });
      if (kids.length > 0 && open) TreeSelectFlatten(kids, depth + 1, acc);
    }
    return acc;
  };

  const rows = useMemo(() => TreeSelectFlatten(Array.isArray(options) ? options : [], 0, []), [options, collapsed]);

  const toggle = (id: string) => setCollapsed(function (c) { const n = Object.assign({}, c); n[id] = !c[id]; return n; });

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{ minWidth: TreeSelect_MIN.base[0] + "rem", minHeight: TreeSelect_MIN.base[1] + "rem" }}
    >
      <div className="h-full w-full rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden">
        <div className="h-full w-full overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rows.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-600">no crates</span>
            </div>
          ) : (
            <div className="flex flex-col py-1">
              {rows.map(function (r) {
                const sel = r.id === value;
                const hov = hover === r.id;
                return (
                  <div
                    key={uid + "-" + r.id}
                    onPointerEnter={function () { setHover(r.id); }}
                    onPointerLeave={function () { setHover(function (h) { return h === r.id ? null : h; }); }}
                    onPointerDown={function () { onChange(r.id); }}
                    className={
                      "group relative flex items-center gap-2 cursor-pointer select-none px-2 py-1 transition-all duration-200 ease-out " +
                      (sel
                        ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40"
                        : "text-stone-300 hover:bg-amber-500/10 hover:text-stone-100")
                    }
                  >
                    <div
                      className="transition-all duration-200 ease-out"
                      style={{ width: r.depth * 0.6 + "rem" }}
                    />
                    <div
                      onPointerDown={function (e) { if (r.hasKids) { e.stopPropagation(); toggle(r.id); } }}
                      className={
                        "flex items-center justify-center transition-all duration-200 ease-out " +
                        (r.hasKids ? (sel ? "text-amber-300" : "text-stone-500 hover:text-amber-400") : "text-transparent")
                      }
                      style={{ width: "0.7rem", height: "0.7rem" }}
                    >
                      {r.hasKids ? (
                        <svg viewBox="0 0 12 12" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
                          <path
                            d="M4 2.2 L8.4 6 L4 9.8 Z"
                            fill="currentColor"
                            style={{
                              transformOrigin: "6px 6px",
                              transform: r.open ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 200ms ease-out"
                            }}
                          />
                        </svg>
                      ) : (
                        <span
                          className={
                            "block rounded-full transition-all duration-200 ease-out " +
                            (sel ? "bg-lime-400 shadow-lg shadow-lime-400/30" : hov ? "bg-amber-400/70" : "bg-stone-700")
                          }
                          style={{ width: "0.25rem", height: "0.25rem" }}
                        />
                      )}
                    </div>
                    <span
                      className={
                        "min-w-0 truncate text-[11px] tracking-wide leading-none transition-all duration-200 ease-out " +
                        (sel ? "font-semibold" : "font-normal")
                      }
                    >
                      {r.label}
                    </span>
                    {sel ? (
                      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-400 shadow-lg shadow-amber-500/30 animate-pulse" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}