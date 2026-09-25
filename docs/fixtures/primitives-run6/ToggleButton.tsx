type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };
export const ToggleButton_MIN = {"base":[2,1.5]};
export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, children } = props;
  const uid = useRef("togglebutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const floor = (ToggleButton_MIN as any).base;

  const hasContent = children !== undefined && children !== null && children !== false;

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        setPressed(true);
      }}
      onPointerUp={() => {
        if (pressed) onChange(!on);
        setPressed(false);
      }}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <svg className="absolute inset-0 h-0 w-0" aria-hidden="true">
        <defs>
          <linearGradient id={uid + "-onfill"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(251 191 36)" />
            <stop offset="100%" stopColor="rgb(245 158 11)" />
          </linearGradient>
        </defs>
      </svg>

      <div
        className={
          "group absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 ease-out " +
          (on
            ? "border-amber-400/60 bg-gradient-to-b from-amber-400 to-amber-500 shadow-lg shadow-amber-500/40"
            : "border-amber-500/25 bg-gradient-to-b from-neutral-800/70 to-neutral-950/70 shadow-md shadow-black/40 hover:border-amber-400/50 hover:from-amber-500/10 hover:to-neutral-950/70 hover:shadow-lg hover:shadow-amber-500/25") +
          (pressed ? " scale-95 brightness-95" : on ? "" : " hover:-translate-y-px")
        }
      >
        {/* top sheen */}
        <div
          className={
            "pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-lg transition-opacity duration-200 " +
            (on ? "bg-gradient-to-b from-white/25 to-transparent opacity-90" : "bg-gradient-to-b from-white/5 to-transparent opacity-60")
          }
        />

        {/* lit ambient glow when on */}
        <div
          className={
            "pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset transition-all duration-300 " +
            (on ? "ring-amber-200/40" : "ring-transparent")
          }
        />

        {/* active status pip — top-left corner accent */}
        <div
          className={
            "pointer-events-none absolute left-[7%] top-[16%] aspect-square w-[10%] rounded-full transition-all duration-300 " +
            (on
              ? "bg-lime-300 shadow-[0_0_6px_1px_rgba(163,230,53,0.9)] animate-pulse"
              : "bg-stone-700/70")
          }
        />

        {/* face content OR default latch indicator */}
        {hasContent ? (
          <div className="absolute inset-[16%] flex items-center justify-center">
            <FitText
              wrap={false}
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 " +
                (on ? "text-neutral-950" : "text-stone-300 group-hover:text-amber-300")
              }
            >
              {children}
            </FitText>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-[34%] w-[64%] max-h-[1.4rem]">
              {/* latch pill track */}
              <div
                className={
                  "absolute inset-0 rounded-full border transition-all duration-200 " +
                  (on
                    ? "border-neutral-950/30 bg-neutral-950/25"
                    : "border-stone-700/70 bg-black/40")
                }
              />
              {/* latch slider */}
              <div
                className={
                  "absolute top-1/2 aspect-square h-[130%] -translate-y-1/2 rounded-full transition-all duration-200 ease-out " +
                  (on
                    ? "left-full -translate-x-[105%] bg-neutral-950 shadow-md shadow-black/50"
                    : "left-0 translate-x-[5%] bg-stone-500 shadow shadow-black/40")
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}