type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };
export function Selector(props: SelectorProps) {
  const { options, value, onChange } = props;
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;

  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEmpty = !options || options.length === 0;

  const selectedIndex = useMemo(() => {
    if (isEmpty) return -1;
    return options.findIndex((o) => o.id === value);
  }, [options, value, isEmpty]);

  const triggerFlash = (id: string) => {
    setFlash(id);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 360);
  };

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const handleSelect = (id: string) => {
    triggerFlash(id);
    if (id !== value) onChange(id);
  };

  if (isEmpty) {
    return (
      <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center">
        <div className="flex items-center gap-2 opacity-60">
          <span className="inline-block h-1 w-1 rounded-full bg-stone-600 animate-pulse" />
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600">No FX</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full min-w-0 min-h-0 relative flex flex-col overflow-hidden">
      {/* Ambient molten sheen tied to selection */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-40 transition-all duration-500 ease-out"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, rgba(245,158,11,0.10), rgba(245,158,11,0) 60%)",
          }}
        />
      </div>

      {/* Options region: reflows to slot shape via flex-wrap; scrolls when overflowing */}
      <div className="relative z-10 flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-wrap content-start items-stretch gap-2 p-2">
          {options.map((opt, i) => {
            const isSelected = opt.id === value;
            const isHover = hovered === opt.id;
            const isPress = pressed === opt.id;
            const isFlash = flash === opt.id;

            const base =
              "group relative flex-1 basis-24 min-w-0 min-h-0 flex items-center justify-center rounded-md border overflow-hidden touch-none select-none cursor-pointer transition-all duration-200 ease-out shadow-md shadow-black/40";

            const stateClasses = isSelected
              ? "bg-amber-500/20 border-amber-400/50 text-amber-200 ring-1 ring-inset ring-amber-400/50 shadow-lg shadow-amber-500/30 -translate-y-px"
              : isHover
              ? "bg-amber-500/10 border-amber-400/60 text-amber-300 shadow-md shadow-amber-500/30 -translate-y-px"
              : "bg-stone-950/80 border-stone-700/60 text-stone-400";

            const pressClass = isPress ? "translate-y-0 scale-95 brightness-95" : "";

            return (
              <button
                key={"opt-" + opt.id}
                type="button"
                onPointerEnter={() => setHovered(opt.id)}
                onPointerLeave={() => {
                  setHovered((h) => (h === opt.id ? null : h));
                  setPressed((p) => (p === opt.id ? null : p));
                }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setPressed(opt.id);
                }}
                onPointerUp={() => setPressed((p) => (p === opt.id ? null : p))}
                onPointerCancel={() => setPressed((p) => (p === opt.id ? null : p))}
                onClick={() => handleSelect(opt.id)}
                className={base + " " + stateClasses + " " + pressClass}
              >
                {/* Left signal edge indicator */}
                <span
                  className={
                    "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 ease-out " +
                    (isSelected
                      ? "bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.7)]"
                      : isHover
                      ? "bg-amber-500/50"
                      : "bg-transparent")
                  }
                />

                {/* Selected animated sweep glow */}
                {isSelected && (
                  <span
                    className="pointer-events-none absolute inset-0 opacity-70"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.14) 50%, rgba(245,158,11,0) 100%)",
                      backgroundSize: "220% 100%",
                      animation: "selSweep_" + uid + " 2.6s ease-in-out infinite",
                    }}
                  />
                )}

                {/* Press / re-select flash ripple */}
                {isFlash && (
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(60% 120% at 50% 50%, rgba(245,158,11,0.35), rgba(245,158,11,0) 70%)",
                      animation: "selFlash_" + uid + " 0.36s ease-out forwards",
                    }}
                  />
                )}

                {/* Label — display text via FitText */}
                <span className="absolute inset-[16%] flex items-center">
                  <FitText
                    wrap={false}
                    align="center"
                    className={
                      "font-semibold uppercase tracking-wider transition-colors duration-200 " +
                      (isSelected
                        ? "text-amber-200"
                        : isHover
                        ? "text-amber-300"
                        : "text-stone-400")
                    }
                  >
                    {opt.label}
                  </FitText>
                </span>

                {/* Bottom active bar */}
                <span
                  className={
                    "absolute left-1/2 -translate-x-1/2 bottom-1 h-[2px] rounded-full transition-all duration-300 ease-out " +
                    (isSelected
                      ? "w-3/5 bg-amber-400/80"
                      : isHover
                      ? "w-1/4 bg-amber-500/40"
                      : "w-0 bg-transparent")
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Position strip: which slot is selected, out of how many */}
      <div className="relative z-10 flex items-center gap-[3px] px-2 pb-2 pt-0">
        {options.map((opt, i) => (
          <span
            key={"pip-" + opt.id}
            className={
              "h-[3px] flex-1 min-w-0 rounded-full transition-all duration-300 ease-out " +
              (i === selectedIndex
                ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                : "bg-stone-700/70")
            }
          />
        ))}
      </div>

      <style>{
        "@keyframes selSweep_" + uid + " { 0% { background-position: 200% 0; } 100% { background-position: -120% 0; } }" +
        "@keyframes selFlash_" + uid + " { 0% { opacity: 0.9; transform: scale(0.9); } 100% { opacity: 0; transform: scale(1.15); } }"
      }</style>
    </div>
  );
}