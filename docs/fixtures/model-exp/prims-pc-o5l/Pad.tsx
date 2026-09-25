type PadProps = { onPress: () => void; active?: boolean; children?: React.ReactNode };
export function Pad(props: PadProps) {
  const { onPress, active, children } = props;
  const uid = useRef("pad-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(0);

  const floor = (Pad_MIN as any).base;

  const fire = () => {
    setRipple((r) => r + 1);
    onPress();
  };

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        type="button"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setPressed(true);
          fire();
        }}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        className={
          "absolute inset-0 overflow-hidden rounded-md border transition-all duration-200 ease-out outline-none " +
          (active
            ? "bg-amber-500/20 border-amber-400/50 shadow-lg shadow-amber-500/30 "
            : "bg-neutral-900/90 border-amber-400/30 shadow-md shadow-black/40 ") +
          "hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/30 " +
          (pressed ? "scale-95 brightness-110 " : "hover:-translate-y-px ")
        }
      >
        <span
          className={
            "pointer-events-none absolute inset-0 rounded-md transition-all duration-300 ease-out bg-gradient-to-b " +
            (active ? "from-amber-400/25 to-transparent" : "from-stone-700/25 to-stone-950/40")
          }
        />
        {active ? (
          <span className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-amber-400/50 animate-pulse" />
        ) : null}
        <span
          key={"rp-" + uid + "-" + ripple}
          className={
            "pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 rounded-full " +
            (ripple > 0 ? "animate-ping bg-amber-400/30" : "")
          }
          style={ripple > 0 ? { height: "70%", width: "70%", marginLeft: "-35%", marginTop: "-35%", animationIterationCount: 1 } : undefined}
        />
        <span
          className={
            "pointer-events-none absolute left-[10%] right-[10%] top-[8%] h-[3%] rounded-full transition-all duration-200 ease-out " +
            (active ? "bg-lime-400/90 shadow-lg shadow-lime-400/30" : "bg-stone-700/70")
          }
        />
        {children != null ? (
          <span className="absolute inset-x-[12%] bottom-[12%] top-[22%]">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (active ? "text-amber-200" : "text-stone-400")
              }
            >
              {children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}
export const Pad_MIN = {"base":[2,2]};