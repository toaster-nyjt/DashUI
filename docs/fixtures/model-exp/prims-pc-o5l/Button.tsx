type ButtonProps = { onPress: () => void; children?: React.ReactNode };

export function Button(props: ButtonProps) {
  const uid = useRef("button-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(0);
  const floor = (Button_MIN as any).base;

  const fire = () => {
    props.onPress();
    setFlash((f) => f + 1);
  };

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setPressed(true);
        fire();
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <div
        className={
          "group absolute inset-0 overflow-hidden rounded-lg border transition-all duration-200 ease-out " +
          "shadow-md shadow-black/40 bg-gradient-to-b from-neutral-800/60 to-neutral-950/70 " +
          (pressed
            ? "border-amber-400/70 bg-amber-500/20 scale-95 brightness-95 shadow-lg shadow-amber-500/40"
            : "border-amber-500/25 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-px")
        }
      >
        {/* sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-amber-200/10 to-transparent" />
        {/* ripple flash */}
        <div
          key={"flash-" + uid + "-" + flash}
          className={
            "pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-amber-400/60 bg-amber-400/25 " +
            (flash > 0 ? "animate-ping" : "opacity-0")
          }
          style={{ animationIterationCount: 1, animationDuration: "450ms" }}
        />
        {/* edge glow line */}
        <div
          className={
            "pointer-events-none absolute inset-x-[8%] bottom-0 h-px transition-all duration-200 ease-out " +
            (pressed ? "bg-lime-400/80" : "bg-amber-500/25 group-hover:bg-amber-400/60")
          }
        />
        {props.children !== undefined && props.children !== null && props.children !== false ? (
          <div className="absolute inset-[16%]">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (pressed ? "text-amber-200" : "text-stone-300 group-hover:text-amber-300")
              }
            >
              {props.children}
            </FitText>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const Button_MIN = {"base":[2.5,1.5]};