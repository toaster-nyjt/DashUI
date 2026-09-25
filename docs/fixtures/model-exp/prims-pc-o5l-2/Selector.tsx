type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };

export const Selector_MIN = {"base":[6,2.5]};

export function Selector(props: SelectorProps) {
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState<string | null>(null);
  const floor = Selector_MIN.base;
  const opts = props.options || [];

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 overflow-hidden">
        {opts.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-widest leading-none text-stone-600">
              —
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className="grid gap-2 p-2"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(4.5rem, 1fr))" }}
            >
              {opts.map((o) => {
                const active = o.id === props.value;
                const down = pressed === o.id;
                return (
                  <button
                    key={uid + "-" + o.id}
                    type="button"
                    onPointerDown={(e) => {
                      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
                      setPressed(o.id);
                    }}
                    onPointerUp={() => setPressed(null)}
                    onPointerCancel={() => setPressed(null)}
                    onClick={() => props.onChange(o.id)}
                    className={
                      "relative min-w-0 flex items-center justify-center rounded-md border px-2 py-1 overflow-hidden select-none touch-none transition-all duration-200 ease-out " +
                      (active
                        ? "bg-amber-500/20 border-amber-400/50 text-amber-200 shadow-lg shadow-amber-500/30"
                        : "bg-neutral-900/80 border-amber-400/30 text-stone-400 shadow-md shadow-black/40 hover:border-amber-400/60 hover:text-amber-300 hover:shadow-md hover:shadow-amber-500/30 hover:-translate-y-px") +
                      (down ? " scale-95 brightness-95 translate-y-0" : "")
                    }
                    style={{ height: "1.75rem" }}
                  >
                    <span
                      className={
                        "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 ease-out " +
                        (active ? "bg-lime-400 shadow-lg shadow-lime-400/30" : "bg-transparent")
                      }
                    />
                    <span
                      className={
                        "min-w-0 truncate text-[10px] font-semibold uppercase tracking-widest leading-none transition-all duration-200 ease-out " +
                        (active ? "animate-pulse" : "")
                      }
                    >
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}