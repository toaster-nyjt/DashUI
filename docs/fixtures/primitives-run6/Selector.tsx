type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };

export const Selector_MIN = {"base":[6,3]};

export function Selector(props: SelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;
  const floor = Selector_MIN.base;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);

  const hasOptions = options && options.length > 0;
  const activeIndex = useMemo(() => {
    if (!hasOptions) return -1;
    return options.findIndex((o) => o.id === value);
  }, [options, value, hasOptions]);

  return (
    <div
      className="h-full w-full relative touch-none select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden">
        {/* decorative violet FX sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-amber-500/5" />
        <div
          className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-violet-500/10 rounded-xl"
          aria-hidden="true"
        />

        {!hasOptions ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-stone-600 font-medium uppercase tracking-widest text-[10px]">
              No FX
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="absolute inset-0 p-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex flex-col gap-2 min-h-full justify-center">
              {options.map((opt, i) => {
                const selected = opt.id === value;
                const hovered = hoverId === opt.id;
                const pressed = pressId === opt.id;

                const baseCls =
                  "group relative w-full flex items-center gap-2 rounded-md border transition-all duration-200 ease-out cursor-pointer touch-none";
                const stateCls = selected
                  ? "bg-violet-600/25 border-violet-500/50 text-violet-100 shadow-lg shadow-violet-500/30 ring-1 ring-inset ring-violet-500/50"
                  : hovered
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-200 shadow-md shadow-violet-500/20"
                  : "bg-neutral-900/60 border-stone-700/60 text-stone-400 shadow-none";
                const pressCls = pressed ? " scale-[0.97] brightness-95" : "";

                return (
                  <button
                    key={"opt-" + opt.id + "-" + i}
                    type="button"
                    onClick={() => onChange(opt.id)}
                    onPointerEnter={() => setHoverId(opt.id)}
                    onPointerLeave={() => {
                      setHoverId((h) => (h === opt.id ? null : h));
                      setPressId((p) => (p === opt.id ? null : p));
                    }}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setPressId(opt.id);
                    }}
                    onPointerUp={() => setPressId((p) => (p === opt.id ? null : p))}
                    onPointerCancel={() => setPressId((p) => (p === opt.id ? null : p))}
                    className={baseCls + " " + stateCls + pressCls}
                    style={{ padding: "0.5rem 0.625rem" }}
                  >
                    {/* left indicator rail */}
                    <span className="relative flex-none flex items-center justify-center" style={{ width: "0.75rem", alignSelf: "stretch" }}>
                      <span
                        className={
                          "block rounded-full transition-all duration-300 ease-out " +
                          (selected
                            ? "bg-violet-400 shadow-md shadow-violet-500/50"
                            : hovered
                            ? "bg-violet-500/50"
                            : "bg-stone-700")
                        }
                        style={{
                          width: selected ? "0.55rem" : "0.35rem",
                          height: selected ? "0.55rem" : "0.35rem",
                        }}
                      />
                      {selected ? (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="block rounded-full bg-violet-400/40 animate-ping" style={{ width: "0.55rem", height: "0.55rem" }} />
                        </span>
                      ) : null}
                    </span>

                    {/* label */}
                    <span className="relative flex-1 min-w-0" style={{ height: "1.1em" }}>
                      <FitText
                        align="start"
                        wrap={false}
                        className={
                          "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                          (selected
                            ? "text-violet-100"
                            : hovered
                            ? "text-violet-200"
                            : "text-stone-400")
                        }
                      >
                        {opt.label}
                      </FitText>
                    </span>

                    {/* active glow bar on right */}
                    <span
                      className={
                        "flex-none rounded-full transition-all duration-300 ease-out " +
                        (selected ? "bg-violet-400 shadow-sm shadow-violet-500/50" : "bg-transparent")
                      }
                      style={{
                        width: "0.14rem",
                        height: selected ? "1.1em" : "0.3em",
                        opacity: selected ? 1 : 0,
                      }}
                    />
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