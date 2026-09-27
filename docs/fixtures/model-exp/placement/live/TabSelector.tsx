type TabSelectorProps = { options: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void };

export const TabSelector_MIN = {"base":[8,2]};

export function TabSelector(props: TabSelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("tabselector-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    setFlash((f) => f + 1);
  }, [value]);

  const floor = TabSelector_MIN.base;

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,rgba(6,182,212,0.12)_0%,rgba(217,70,239,0.06)_100%)]" />
        <div
          key={"scan-" + flash}
          className="absolute inset-y-0 w-1/3 pointer-events-none bg-[linear-gradient(90deg,transparent_0%,rgba(253,224,71,0.10)_50%,transparent_100%)]"
          style={{ animation: "tabselectorSweep 700ms ease-out 1 forwards" }}
        />
        <style>{"@keyframes tabselectorSweep{0%{transform:translateX(-120%)}100%{transform:translateX(420%)}}"}</style>

        {options.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono tracking-wider uppercase text-[10px] text-slate-500">no categories</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-stretch gap-1 p-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {options.map((o) => {
              const active = o.id === value;
              const hot = hover === o.id && !active;
              return (
                <button
                  key={uid + "-" + o.id}
                  type="button"
                  onPointerEnter={() => setHover(o.id)}
                  onPointerLeave={() => setHover(null)}
                  onClick={() => onChange(o.id)}
                  className={
                    "group relative flex-1 min-w-0 flex items-center justify-center gap-2 px-2 rounded-sm border transition-all duration-200 ease-out touch-none " +
                    (active
                      ? "bg-yellow-300 border-yellow-300/70 shadow-[0_0_16px_rgba(253,224,71,0.4)] -translate-y-px"
                      : hot
                      ? "bg-cyan-500/20 border-cyan-400/60"
                      : "bg-transparent border-cyan-500/20")
                  }
                  style={{ clipPath: "polygon(0 0, calc(100% - 0.45rem) 0, 100% 0.45rem, 100% 100%, 0.45rem 100%, 0 calc(100% - 0.45rem))" }}
                >
                  <span
                    className={
                      "min-w-0 truncate font-mono font-bold uppercase text-[10px] tracking-[0.18em] transition-colors duration-200 " +
                      (active ? "text-black" : hot ? "text-cyan-100" : "text-slate-400")
                    }
                  >
                    {o.label}
                  </span>
                  {typeof o.count === "number" ? (
                    <span
                      className={
                        "shrink truncate rounded-sm border px-1 font-mono text-[10px] leading-none tracking-wide transition-all duration-200 " +
                        (active
                          ? "border-black/40 bg-black/20 text-black"
                          : "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-400")
                      }
                    >
                      {o.count}
                    </span>
                  ) : null}
                  <span
                    className={
                      "pointer-events-none absolute left-0 bottom-0 h-[2px] bg-cyan-400 transition-all duration-300 ease-out " +
                      (active ? "w-0 opacity-0" : hot ? "w-full opacity-100" : "w-0 opacity-0")
                    }
                  />
                  {active ? (
                    <span className="pointer-events-none absolute inset-0 rounded-sm ring-2 ring-fuchsia-400/60 animate-pulse" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}