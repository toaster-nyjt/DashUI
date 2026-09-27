type TabSelectorProps = { options: { id: string; label: string; count?: number }[]; value: string; onChange: (id: string) => void };

export const TabSelector_MIN = {"base":[6,2.25]};

export function TabSelector(props: TabSelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("tabselector-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState<string | null>(null);
  const floor = TabSelector_MIN.base;

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-md bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border border-cyan-500/20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.15] bg-[repeating-linear-gradient(90deg,rgba(34,211,238,0.5)_0px,rgba(34,211,238,0.5)_1px,transparent_1px,transparent_7px)]" />
        <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {options.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <span className="font-mono tracking-wider uppercase text-[10px] text-slate-500">no channels</span>
            </div>
          ) : (
            <div className="min-h-full w-full flex flex-wrap content-stretch gap-[2px] p-[2px]">
              {options.map((o, i) => {
                const active = o.id === value;
                const isPressed = pressed === o.id;
                return (
                  <button
                    key={"tab-" + uid + "-" + o.id}
                    type="button"
                    onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPressed(o.id); }}
                    onPointerUp={() => setPressed(null)}
                    onPointerCancel={() => setPressed(null)}
                    onClick={() => { if (!active) onChange(o.id); }}
                    className={
                      "group relative touch-none flex-1 basis-[6rem] min-w-0 rounded-sm overflow-hidden flex items-center justify-center gap-2 px-2 py-1 transition-all duration-200 ease-out " +
                      (active
                        ? "bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.4)] border-l-2 border-yellow-300/70"
                        : "bg-cyan-500/10 border-l-2 border-cyan-400/20 hover:bg-cyan-500/25 hover:border-cyan-400 hover:-translate-y-px") +
                      (isPressed ? " brightness-90 translate-y-0" : "")
                    }
                  >
                    {active && (
                      <span className="pointer-events-none absolute inset-0 opacity-30 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_1px,transparent_1px,transparent_5px)]" />
                    )}
                    {!active && (
                      <span className="pointer-events-none absolute left-0 top-0 h-full w-0 group-hover:w-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] bg-[linear-gradient(90deg,rgba(34,211,238,0.18),transparent)]" />
                    )}
                    <span
                      className={
                        "relative min-w-0 truncate font-mono font-bold tracking-[0.18em] uppercase text-[11px] leading-none transition-colors duration-200 " +
                        (active ? "text-black" : "text-cyan-300/80 group-hover:text-cyan-100")
                      }
                    >
                      {o.label}
                    </span>
                    {typeof o.count === "number" && (
                      <span
                        className={
                          "relative shrink-0 rounded-sm px-1 py-[1px] font-mono font-bold tracking-wide text-[9px] leading-none transition-all duration-200 " +
                          (active
                            ? "bg-black/80 text-yellow-300"
                            : "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/40")
                        }
                      >
                        {o.count}
                      </span>
                    )}
                    <span
                      className={
                        "pointer-events-none absolute bottom-0 left-0 h-[2px] transition-all duration-300 ease-out " +
                        (active ? "w-full bg-black/70" : "w-0 bg-cyan-400")
                      }
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}