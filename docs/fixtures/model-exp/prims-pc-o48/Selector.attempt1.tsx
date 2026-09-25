type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
export const Selector_MIN = {"base":[6,3.2]};
export function Selector(props: SelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;
  const floor = Selector_MIN.base;

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);

  const activeIdx = options.findIndex((o) => o.id === value);
  const hasSelection = activeIdx >= 0;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* Recessed selection well */}
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden">
        {/* Faint violet FX sheen — this is an effect selector */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-violet-600/5 to-transparent" />
        {/* Active ring accent */}
        <div
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset transition-all duration-300 ease-out"
          style={{ boxShadow: hasSelection ? "inset 0 0 0 1px rgba(139,92,246,0.28)" : "inset 0 0 0 1px rgba(41,37,36,0)" }}
        />
      </div>

      {/* Options region */}
      <div className="absolute inset-[6%] flex flex-col min-h-0 min-w-0">
        {options.length === 0 ? (
          <div className="flex flex-1 items-center justify-center min-h-0 min-w-0">
            <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600 select-none">
              No FX
            </span>
          </div>
        ) : (
          <div className="flex flex-1 flex-col min-h-0 min-w-0 gap-[4%] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {options.map((opt, i) => {
              const isActive = opt.id === value;
              const isHover = hoverId === opt.id;
              const isPress = pressId === opt.id;

              return (
                <button
                  key={"opt-" + opt.id + "-" + i}
                  type="button"
                  onPointerEnter={() => setHoverId(opt.id)}
                  onPointerLeave={() => {
                    setHoverId((h) => (h === opt.id ? null : h));
                    setPressId((p) => (p === opt.id ? null : p));
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    setPressId(opt.id);
                  }}
                  onPointerUp={() => setPressId((p) => (p === opt.id ? null : p))}
                  onPointerCancel={() => setPressId((p) => (p === opt.id ? null : p))}
                  onClick={() => {
                    if (!isActive) onChange(opt.id);
                  }}
                  className={
                    "group relative flex min-h-0 min-w-0 flex-1 items-center overflow-hidden rounded-md border touch-none select-none transition-all duration-200 ease-out " +
                    (isActive
                      ? "border-violet-500/50 bg-violet-600/20 shadow-md shadow-violet-500/30 "
                      : isHover
                      ? "border-violet-500/40 bg-violet-600/8 shadow-none "
                      : "border-stone-800/60 bg-neutral-900/40 shadow-none ") +
                    (isPress ? "scale-[0.97] brightness-95 " : "")
                  }
                >
                  {/* Left signal bar / active marker */}
                  <div className="relative h-full w-[7%] shrink-0 overflow-hidden">
                    <div
                      className={
                        "absolute inset-y-[18%] left-[30%] w-[40%] rounded-full transition-all duration-300 ease-out " +
                        (isActive
                          ? "bg-violet-400 shadow-[0_0_6px_1px_rgba(139,92,246,0.6)] opacity-100"
                          : isHover
                          ? "bg-violet-500/50 opacity-70"
                          : "bg-stone-700/60 opacity-40")
                      }
                    />
                  </div>

                  {/* Label */}
                  <div className="relative flex min-h-0 min-w-0 flex-1 items-center overflow-hidden pl-[3%] pr-[6%]">
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <FitText
                        align="start"
                        wrap={false}
                        className={
                          "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                          (isActive
                            ? "text-violet-200"
                            : isHover
                            ? "text-violet-300"
                            : "text-stone-400")
                        }
                      >
                        {opt.label}
                      </FitText>
                    </div>
                  </div>

                  {/* Active glow sweep */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/10 via-transparent to-transparent transition-opacity duration-300 ease-out"
                    style={{ opacity: isActive ? 1 : 0 }}
                  />

                  {/* Right-edge lit indicator when active */}
                  <div className="relative h-full w-[7%] shrink-0 overflow-hidden">
                    <div
                      className={
                        "absolute right-[28%] top-1/2 h-[26%] w-[26%] -translate-y-1/2 rounded-full transition-all duration-300 ease-out " +
                        (isActive
                          ? "bg-violet-400 opacity-100 shadow-[0_0_6px_1px_rgba(139,92,246,0.55)] animate-pulse"
                          : "bg-transparent opacity-0")
                      }
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}