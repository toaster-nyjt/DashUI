type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };

export function Selector(props: SelectorProps) {
  const uid = useRef("selector-" + Math.random().toString(36).slice(2)).current;
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  const options = props.options || [];
  const activeIndex = Math.max(0, options.findIndex(function (o) { return o.id === props.value; }));

  const isEmpty = options.length === 0;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col">
      {isEmpty ? (
        <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center rounded-lg border border-neutral-700/60 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">No FX</span>
        </div>
      ) : (
        <div
          className="flex-1 min-h-0 min-w-0 grid gap-[2%] rounded-lg border border-neutral-700/60 bg-neutral-950/80 p-[3%] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(0, 1fr))",
            gridAutoRows: "minmax(0, 1fr)"
          }}
        >
          {options.map(function (opt, i) {
            const isActive = opt.id === props.value;
            const isHover = hovered === opt.id;
            const isPress = pressed === opt.id;

            const baseCls =
              "relative min-w-0 min-h-0 flex items-center justify-center rounded-md border overflow-hidden transition-all duration-200 ease-out select-none touch-none " +
              (isActive
                ? "border-amber-400/40 bg-amber-500/15 shadow-[0_0_16px_-2px] shadow-amber-500/60 "
                : isHover
                ? "border-amber-400/40 bg-amber-500/[0.08] "
                : "border-white/[0.06] bg-neutral-900/60 ") +
              (isPress ? "scale-[0.96] " : isHover && !isActive ? "scale-[1.02] " : "scale-100 ");

            return (
              <button
                key={"opt-" + opt.id + "-" + i}
                type="button"
                onPointerDown={function (e) {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setPressed(opt.id);
                }}
                onPointerUp={function () { setPressed(null); }}
                onPointerCancel={function () { setPressed(null); }}
                onPointerEnter={function () { setHovered(opt.id); }}
                onPointerLeave={function () { setHovered(null); setPressed(null); }}
                onClick={function () { props.onChange(opt.id); }}
                className={baseCls}
              >
                <span
                  className={
                    "pointer-events-none absolute left-0 top-0 h-full w-[3px] rounded-full transition-all duration-200 ease-out " +
                    (isActive
                      ? "bg-amber-400 shadow-[0_0_8px_0] shadow-amber-500/70"
                      : isHover
                      ? "bg-amber-400/40"
                      : "bg-transparent")
                  }
                />
                {isActive ? (
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_50%,rgba(245,158,11,0.18)_0%,transparent_60%)]" />
                ) : null}
                <div className="absolute inset-[8%] min-w-0 min-h-0 flex items-center justify-center">
                  <FitText
                    className={
                      "font-semibold uppercase tracking-widest transition-colors duration-200 " +
                      (isActive ? "text-amber-300" : isHover ? "text-neutral-100" : "text-neutral-400")
                    }
                  >
                    {opt.label}
                  </FitText>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}