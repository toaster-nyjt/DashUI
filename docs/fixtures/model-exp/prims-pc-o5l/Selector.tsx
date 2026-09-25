type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };

export const Selector_MIN = {"base":[5,2.2]};

export function Selector(props: SelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState<string | null>(null);
  const floor = Selector_MIN.base;

  return (
    <div
      className="h-full w-full min-h-0 min-w-0 relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {options.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-600">—</span>
            </div>
          ) : (
            <div
              className="grid gap-2 p-2 h-full w-full content-stretch"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(4.25rem, 1fr))", gridAutoRows: "minmax(1.5rem, 1fr)" }}
            >
              {options.map((o, i) => {
                const active = o.id === value;
                const pressed = press === o.id;
                return (
                  <button
                    key={uid + "-" + o.id + "-" + i}
                    type="button"
                    onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(o.id); }}
                    onPointerUp={() => setPress(null)}
                    onPointerCancel={() => setPress(null)}
                    onClick={() => onChange(o.id)}
                    className={
                      "relative min-w-0 flex items-center justify-center overflow-hidden rounded-md border touch-none select-none transition-all duration-200 ease-out " +
                      (active
                        ? "bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-lg shadow-amber-500/30"
                        : "bg-neutral-900/80 border-amber-500/25 text-stone-400 shadow-md shadow-black/40 hover:border-amber-400/60 hover:text-amber-300 hover:shadow-md hover:shadow-amber-500/30 hover:-translate-y-px") +
                      (pressed ? " scale-95 brightness-95" : "")
                    }
                  >
                    <span
                      className={
                        "pointer-events-none absolute left-0 top-0 h-full w-[3px] rounded-r-md transition-all duration-300 ease-out " +
                        (active ? "bg-lime-400 shadow-lg shadow-lime-400/30" : "bg-transparent")
                      }
                    />
                    <span
                      className={
                        "pointer-events-none absolute inset-0 bg-gradient-to-b transition-opacity duration-300 ease-out " +
                        (active ? "from-amber-400/15 to-transparent opacity-100 animate-pulse" : "from-stone-700/20 to-transparent opacity-60")
                      }
                    />
                    <span className="relative min-w-0 truncate px-2 text-[10px] font-semibold uppercase tracking-widest leading-none">
                      {o.label}
                    </span>
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