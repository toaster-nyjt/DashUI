type TabSelectorProps = { options: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void };

export const TabSelector_MIN = {"base":[8,2.25]};

export function TabSelector(props: TabSelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("tabselector-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const floor = TabSelector_MIN.base;

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]" />
      <div
        className="absolute inset-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {options.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
              — — —
            </span>
          </div>
        ) : (
          <div className="min-h-full w-full flex flex-wrap content-stretch items-stretch gap-[2px] p-[2px]">
            {options.map((o, i) => {
              const active = o.id === value;
              const isHover = hover === o.id && !active;
              const isPress = pressed === o.id;
              return (
                <button
                  key={"tab-" + uid + "-" + o.id}
                  type="button"
                  onClick={() => onChange(o.id)}
                  onPointerDown={() => setPressed(o.id)}
                  onPointerUp={() => setPressed(null)}
                  onPointerCancel={() => setPressed(null)}
                  onPointerEnter={() => setHover(o.id)}
                  onPointerLeave={() => { setHover(null); setPressed(null); }}
                  className={
                    "group relative flex-1 basis-[5.5rem] min-w-0 flex items-center justify-center gap-1.5 px-2 overflow-hidden border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
                    (active
                      ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-200 shadow-[0_0_14px_rgba(34,211,238,0.28)] "
                      : "border-cyan-400/15 bg-neutral-900/70 text-cyan-200/60 hover:bg-cyan-400/10 hover:border-cyan-400/40 hover:text-cyan-100 ") +
                    (isPress ? "scale-[0.97] brightness-125 " : "")
                  }
                  style={{
                    clipPath:
                      "polygon(0.45rem 0, 100% 0, 100% calc(100% - 0.45rem), calc(100% - 0.45rem) 100%, 0 100%)",
                    transitionDelay: i * 12 + "ms",
                  }}
                >
                  <span
                    className={
                      "pointer-events-none absolute inset-0 bg-gradient-to-b transition-opacity duration-300 " +
                      (active
                        ? "from-cyan-400/25 via-transparent to-transparent opacity-100"
                        : "from-cyan-300/10 via-transparent to-transparent " + (isHover ? "opacity-100" : "opacity-0"))
                    }
                  />
                  <span
                    className={
                      "pointer-events-none absolute left-0 top-0 h-full w-[2px] transition-all duration-300 ease-out " +
                      (active
                        ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)] opacity-100"
                        : isHover
                        ? "bg-cyan-400/50 opacity-100"
                        : "opacity-0")
                    }
                  />
                  <span
                    className={
                      "pointer-events-none absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-cyan-300 to-fuchsia-400 shadow-[0_0_8px_rgba(34,211,238,0.7)] transition-all duration-300 ease-out " +
                      (active ? "w-full opacity-100" : "w-0 opacity-0")
                    }
                  />
                  {active && (
                    <span className="pointer-events-none absolute right-[0.15rem] top-[0.15rem] h-1 w-1 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,0.8)] animate-pulse" />
                  )}
                  <span
                    className={
                      "relative min-w-0 truncate text-[11px] font-bold uppercase tracking-[0.16em] leading-none transition-all duration-200 " +
                      (active ? "text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]" : "")
                    }
                  >
                    {o.label}
                  </span>
                  {typeof o.count === "number" && (
                    <span
                      className={
                        "relative rounded-full border px-1.5 py-[1px] text-[9px] font-semibold leading-none tabular-nums transition-all duration-200 " +
                        (active
                          ? "border-fuchsia-400/60 bg-fuchsia-500/25 text-fuchsia-200 shadow-[0_0_10px_rgba(232,121,249,0.45)]"
                          : "border-cyan-400/25 bg-black/50 text-cyan-200/60")
                      }
                    >
                      {o.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}