type TreeSelectProps = { options: { id: string; label: string; children?: any[] }[]; value: string; onChange: (id: string) => void };

export const TreeSelect_MIN = {"base":[8,4]};

export function TreeSelect(props: TreeSelectProps) {
  const { options, value, onChange } = props;
  const uid = useRef("treeselect-" + Math.random().toString(36).slice(2)).current;

  const collectParents = (nodes: any[], acc: Record<string, boolean>) => {
    (nodes || []).forEach((n) => {
      if (n && n.children && n.children.length) {
        acc[n.id] = true;
        collectParents(n.children, acc);
      }
    });
    return acc;
  };

  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<string | null>(null);

  const flat = useMemo(() => {
    const out: { id: string; label: string; depth: number; hasKids: boolean; open: boolean }[] = [];
    const walk = (nodes: any[], depth: number) => {
      (nodes || []).forEach((n) => {
        if (!n || typeof n.id !== "string") return;
        const kids = Array.isArray(n.children) ? n.children : [];
        const open = !closed[n.id];
        out.push({ id: n.id, label: String(n.label == null ? "" : n.label), depth, hasKids: kids.length > 0, open });
        if (kids.length && open) walk(kids, depth + 1);
      });
    };
    walk(options || [], 0);
    return out;
  }, [options, closed]);

  const toggle = (id: string) => setClosed((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div
      className="h-full w-full overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80"
      style={{ minWidth: TreeSelect_MIN.base[0] + "rem", minHeight: TreeSelect_MIN.base[1] + "rem" }}
    >
      <div className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {flat.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600">— empty —</span>
          </div>
        ) : (
          <div className="flex w-full flex-col py-1">
            {flat.map((n, i) => {
              const selected = n.id === value;
              const hot = hover === n.id;
              return (
                <div
                  key={uid + "-row-" + n.id + "-" + i}
                  onPointerEnter={() => setHover(n.id)}
                  onPointerLeave={() => setHover((h) => (h === n.id ? null : h))}
                  onClick={() => {
                    onChange(n.id);
                    if (n.hasKids) toggle(n.id);
                  }}
                  className={
                    "group relative flex w-full cursor-pointer select-none items-center gap-2 py-1 pr-2 transition-all duration-200 ease-out " +
                    (selected
                      ? "bg-amber-500/15 text-amber-200 ring-1 ring-inset ring-amber-500/40 shadow-lg shadow-amber-500/10"
                      : "text-stone-300 hover:bg-amber-500/10 hover:text-stone-100")
                  }
                  style={{ paddingLeft: 0.4 + n.depth * 0.75 + "rem" }}
                >
                  <span
                    className={
                      "absolute left-0 top-0 h-full w-[2px] transition-all duration-200 ease-out " +
                      (selected ? "bg-amber-400 shadow-lg shadow-amber-500/40" : hot ? "bg-amber-500/40" : "bg-transparent")
                    }
                  />
                  <span
                    onClick={(e) => {
                      if (n.hasKids) {
                        e.stopPropagation();
                        toggle(n.id);
                      }
                    }}
                    className={
                      "flex items-center justify-center transition-transform duration-200 ease-out " +
                      (n.hasKids ? (n.open ? "rotate-90" : "rotate-0") : "opacity-0")
                    }
                  >
                    <svg viewBox="0 0 10 10" preserveAspectRatio="xMidYMid meet" className="h-[0.55rem] w-[0.55rem]">
                      <path
                        d="M3 1.5 L7.5 5 L3 8.5 Z"
                        className={selected ? "fill-amber-300" : "fill-stone-500"}
                      />
                    </svg>
                  </span>
                  <svg viewBox="0 0 12 12" preserveAspectRatio="xMidYMid meet" className="h-[0.65rem] w-[0.65rem] transition-all duration-200 ease-out">
                    {n.hasKids ? (
                      <path
                        d="M1 3.2 A0.8 0.8 0 0 1 1.8 2.4 H4.6 L5.8 3.7 H10.2 A0.8 0.8 0 0 1 11 4.5 V8.8 A0.8 0.8 0 0 1 10.2 9.6 H1.8 A0.8 0.8 0 0 1 1 8.8 Z"
                        className={selected ? "fill-amber-400/80" : hot ? "fill-amber-500/50" : "fill-stone-600/70"}
                      />
                    ) : (
                      <circle
                        cx="6"
                        cy="6"
                        r="2.6"
                        className={selected ? "fill-lime-400" : hot ? "fill-amber-400/70" : "fill-stone-600"}
                      />
                    )}
                  </svg>
                  <span
                    className={
                      "min-w-0 flex-1 truncate text-[11px] leading-none tracking-wide transition-all duration-200 ease-out " +
                      (selected ? "font-semibold" : "font-normal")
                    }
                  >
                    {n.label}
                  </span>
                  {selected ? (
                    <span className="h-[0.35rem] w-[0.35rem] rounded-full bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}