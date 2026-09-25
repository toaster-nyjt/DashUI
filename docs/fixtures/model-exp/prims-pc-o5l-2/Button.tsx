type ButtonProps = { onPress: () => void; children?: React.ReactNode };

export const Button_MIN = {"base":[2.5,1.75]};

export function Button(props: ButtonProps) {
  const uid = useRef("button-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(0);

  const fire = () => {
    setFlash((f) => f + 1);
    props.onPress();
  };

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: Button_MIN.base[0] + "rem", minHeight: Button_MIN.base[1] + "rem" }}
    >
      <button
        type="button"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setPressed(true);
        }}
        onPointerUp={(e) => {
          const wasIn = pressed;
          setPressed(false);
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const inside =
            e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (wasIn && inside) fire();
        }}
        onPointerCancel={() => setPressed(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPressed(true);
          }
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setPressed(false);
            fire();
          }
        }}
        className={
          "relative h-full w-full touch-none select-none overflow-hidden rounded-lg border " +
          "bg-gradient-to-b from-neutral-800/60 to-neutral-950/70 " +
          "transition-all duration-200 ease-out outline-none " +
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/50 " +
          (pressed
            ? "border-amber-400/70 shadow-inner shadow-black/70 scale-95 brightness-110 "
            : "border-amber-500/25 shadow-md shadow-black/40 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-px ")
        }
      >
        {/* top sheen */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-gradient-to-b from-amber-100/5 to-transparent" />
        {/* hover glow wash */}
        <span
          className={
            "pointer-events-none absolute inset-0 transition-all duration-200 ease-out " +
            (pressed ? "bg-amber-500/25" : "bg-amber-500/0")
          }
        />
        {/* press ripple */}
        <span
          key={uid + "-flash-" + flash}
          className={
            "pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full " +
            (flash > 0 ? "animate-ping bg-amber-400/20" : "hidden")
          }
          style={{ animationIterationCount: 1, animationDuration: "500ms" }}
        />
        {/* edge signal bar */}
        <span
          className={
            "pointer-events-none absolute inset-x-[10%] bottom-0 h-[2px] rounded-full transition-all duration-200 ease-out " +
            (pressed ? "bg-lime-400 shadow-lg shadow-lime-400/40 opacity-100" : "bg-amber-500/40 opacity-60")
          }
        />
        {props.children != null && props.children !== false ? (
          <span className="absolute inset-[14%]">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (pressed ? "text-amber-200" : "text-stone-300")
              }
            >
              {props.children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}