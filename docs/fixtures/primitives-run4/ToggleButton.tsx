type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };
export function ToggleButton(props: ToggleButtonProps) {
  const uid = useRef("togglebutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(0);

  const on = props.on;

  const handleActivate = () => {
    setRipple((r) => r + 1);
    props.onChange(!on);
  };

  // Outer transparent slot filler
  return (
    <div className="h-full w-full min-w-0 min-h-0 relative select-none touch-none">
      <button
        type="button"
        aria-pressed={on}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setPressed(true);
        }}
        onPointerUp={(e) => {
          if (pressed) handleActivate();
          setPressed(false);
        }}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleActivate();
          }
        }}
        className={
          "group absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg border outline-none " +
          "transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 " +
          "motion-reduce:transition-none " +
          (on
            ? "border-amber-400/40 bg-gradient-to-b from-amber-500 to-amber-600 shadow-[0_0_16px_-2px] shadow-amber-500/60 "
            : "border-neutral-600/50 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-md shadow-black/40 hover:border-amber-400/50 hover:shadow-[0_0_14px_-2px] hover:shadow-amber-500/40 hover:-translate-y-px ") +
          (pressed ? "scale-[0.96] translate-y-0 " : "")
        }
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Inner bezel / recess sheen */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200 " +
            (on
              ? "bg-[radial-gradient(120%_120%_at_50%_-20%,rgba(255,240,200,0.55)_0%,rgba(255,255,255,0)_55%)] opacity-90"
              : "bg-[radial-gradient(120%_120%_at_50%_-20%,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_60%)] opacity-100")
          }
        />

        {/* Bottom inner shadow lip for tactility */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-lg bg-gradient-to-t from-black/40 to-transparent"
        />

        {/* Active status LED dot (top-left) — appears only when there is no face content need? show subtly always for tactile feedback */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute left-[6%] top-[10%] h-[10%] w-[10%] max-h-[7px] max-w-[7px] rounded-full transition-all duration-300 " +
            (on
              ? "bg-amber-200 shadow-[0_0_8px_2px] shadow-amber-300/80 opacity-100"
              : "bg-neutral-600 opacity-40")
          }
        />

        {/* Ripple pulse on activation */}
        <span
          key={"ripple-" + ripple}
          aria-hidden
          className={
            ripple > 0
              ? "pointer-events-none absolute left-1/2 top-1/2 h-[10%] w-[10%] -translate-x-1/2 -translate-y-1/2 rounded-full " +
                (on ? "bg-amber-200/40 " : "bg-amber-400/25 ") +
                "animate-[togglebutton_ripple_500ms_ease-out] motion-reduce:animate-none"
              : "hidden"
          }
        />

        {/* Face content */}
        {props.children !== undefined && props.children !== null && (
          <span className="absolute inset-[16%] flex items-center justify-center">
            <FitText
              className={
                "font-semibold uppercase tracking-widest transition-colors duration-200 " +
                (on ? "text-neutral-950" : "text-neutral-300 group-hover:text-amber-200")
              }
            >
              {props.children}
            </FitText>
          </span>
        )}
      </button>

      <style>{
        "@keyframes togglebutton_ripple{0%{transform:translate(-50%,-50%) scale(1);opacity:0.7}100%{transform:translate(-50%,-50%) scale(14);opacity:0}}"
      }</style>
    </div>
  );
}