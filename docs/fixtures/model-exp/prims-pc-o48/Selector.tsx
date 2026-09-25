type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
export const Selector_MIN = {"base":[6,4]};
export function Selector(props: SelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;
  const floor = (Selector_MIN as any).base;

  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  const hasOptions = options && options.length > 0;
  const activeIndex = hasOptions ? options.findIndex((o) => o.id === value) : -1;

  return (
    <div
      className="h-full w-full relative flex flex-col text-stone-100"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {!hasOptions ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-none" style={{ width: "72%", height: "48%" }}>
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(120,113,108,0.10) 0px, rgba(120,113,108,0.10) 6px, transparent 6px, transparent 12px)" }} />
            <div className="relative flex items-center justify-center" style={{ width: "70%", height: "60%" }}>
              <FitText className="font-medium uppercase tracking-widest leading-none text-stone-600">NO FX</FitText>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute inset-[6%] flex flex-col">
          {/* Rail / signal strip behind the options */}
          <div className="relative flex-1 min-h-0 min-w-0 overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/50">
            {/* recessed sheen */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-black/40" />
            {/* animated selection glow, positioned per active option along the primary flow */}
            {activeIndex >= 0 ? (
              <div
                className="pointer-events-none absolute inset-y-0 transition-all duration-300 ease-out"
                style={{
                  left: (activeIndex / options.length) * 100 + "%",
                  width: (1 / options.length) * 100 + "%"
                }}
              >
                <div className="absolute inset-[8%] rounded-lg bg-amber-500/10 ring-1 ring-inset ring-amber-500/40 shadow-lg shadow-amber-500/30" />
                <div className="absolute inset-x-[18%] top-[6%] h-[3px] rounded-full bg-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
              </div>
            ) : null}

            {/* Options laid out along the long axis */}
            <div
              className="relative h-full w-full grid overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ gridAutoRows: "minmax(0, 1fr)", gridTemplateColumns: "repeat(" + options.length + ", minmax(0, 1fr))" }}
            >
              {options.map((opt, i) => {
                const isActive = opt.id === value;
                const isHovered = hovered === opt.id && !isActive;
                const isPressed = pressed === opt.id;
                return (
                  <button
                    key={"opt-" + opt.id + "-" + i}
                    type="button"
                    onPointerEnter={() => setHovered(opt.id)}
                    onPointerLeave={() => setHovered((h) => (h === opt.id ? null : h))}
                    onPointerDown={() => setPressed(opt.id)}
                    onPointerUp={() => setPressed((p) => (p === opt.id ? null : p))}
                    onPointerCancel={() => setPressed((p) => (p === opt.id ? null : p))}
                    onClick={() => onChange(opt.id)}
                    className={
                      "group relative min-w-0 min-h-0 flex items-stretch justify-center touch-none select-none outline-none transition-all duration-200 ease-out " +
                      (isPressed ? "scale-95 brightness-95 " : "") +
                      (i < options.length - 1 ? "border-r border-stone-800/60 " : "")
                    }
                  >
                    {/* per-option hover wash */}
                    <div
                      className={
                        "pointer-events-none absolute inset-[8%] rounded-lg transition-all duration-200 ease-out " +
                        (isHovered ? "bg-amber-500/10 ring-1 ring-inset ring-amber-500/30 shadow-md shadow-amber-500/20 " : "bg-transparent ")
                      }
                    />
                    {/* active status dot at the base */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-[6%] flex items-center justify-center">
                      <span
                        className={
                          "block rounded-full transition-all duration-200 ease-out " +
                          (isActive
                            ? "bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)] animate-pulse "
                            : isHovered
                            ? "bg-amber-400/60 "
                            : "bg-stone-700 ")
                        }
                        style={{ width: "22%", height: "6px" }}
                      />
                    </div>
                    {/* label face */}
                    <div className="relative flex-1 min-w-0 min-h-0 flex items-center justify-center">
                      <div className="absolute inset-x-[10%] top-[12%] bottom-[26%] flex items-center justify-center">
                        <FitText
                          className={
                            "font-semibold uppercase tracking-wider leading-none transition-colors duration-200 ease-out " +
                            (isActive
                              ? "text-amber-300 "
                              : isHovered
                              ? "text-amber-200 "
                              : "text-stone-400 ")
                          }
                        >
                          {opt.label}
                        </FitText>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}