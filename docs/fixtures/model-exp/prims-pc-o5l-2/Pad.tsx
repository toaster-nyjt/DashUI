type PadProps = { onPress: () => void; active?: boolean; children?: React.ReactNode };
export const Pad_MIN = {"base":[2.5,2]};
export function Pad(props: PadProps) {
  const { onPress, active, children } = props;
  const uid = useRef("pad-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(0);

  const base =
    "relative h-full w-full overflow-hidden rounded-md border transition-all duration-200 ease-out touch-none select-none outline-none " +
    (active
      ? "bg-amber-500/20 border-amber-400/50 shadow-lg shadow-amber-500/30 "
      : "bg-neutral-900/90 border-amber-400/30 shadow-md shadow-black/40 ") +
    "hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/30 hover:-translate-y-px " +
    (pressed ? "translate-y-0 scale-95 brightness-110 " : "");

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: Pad_MIN.base[0] + "rem", minHeight: Pad_MIN.base[1] + "rem" }}
    >
      <button
        type="button"
        className={base}
        onPointerDown={(e) => {
          (e.currentTarget as any).setPointerCapture?.(e.pointerId);
          setPressed(true);
          setFlash((f) => f + 1);
          onPress();
        }}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onLostPointerCapture={() => setPressed(false)}
      >
        {/* inner sheen */}
        <span
          className={
            "pointer-events-none absolute inset-0 rounded-md bg-gradient-to-b transition-all duration-300 ease-out " +
            (active ? "from-amber-400/25 to-transparent" : "from-stone-800/40 to-neutral-950/60")
          }
        />
        {/* lit corner beacon */}
        <span
          className={
            "pointer-events-none absolute right-[6%] top-[8%] h-[9%] w-[9%] rounded-full transition-all duration-200 ease-out " +
            (active ? "bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" : "bg-stone-700")
          }
        />
        {/* press ripple */}
        <span
          key={"rip-" + uid + "-" + flash}
          className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-inset ring-amber-400/70"
          style={{ animation: flash ? "none" : undefined, opacity: flash ? 0 : 0, transition: "opacity 200ms ease-out" }}
        />
        <span
          className={
            "pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset transition-all duration-200 ease-out " +
            (pressed ? "ring-amber-400/70" : active ? "ring-amber-500/40" : "ring-stone-800/70")
          }
        />
        {children != null && children !== false ? (
          <span className="absolute inset-[16%] flex items-center justify-center">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (active ? "text-amber-200" : pressed ? "text-amber-300" : "text-stone-400")
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