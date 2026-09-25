type ToggleButtonProps = {
  on: boolean;
  onChange: (on: boolean) => void;
  children?: React.ReactNode;
};

export function ToggleButton(props: ToggleButtonProps) {
  const uid = useRef("togglebutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const prevOn = useRef(props.on);

  useEffect(() => {
    if (prevOn.current !== props.on) {
      setPulseKey((k) => k + 1);
      prevOn.current = props.on;
    }
  }, [props.on]);

  const on = props.on;

  const onClass = on
    ? "border-amber-400/60 bg-gradient-to-b from-amber-500/25 to-amber-600/10 text-amber-200 shadow-lg shadow-amber-500/30"
    : "border-amber-500/25 bg-gradient-to-b from-neutral-800/60 to-neutral-950/70 text-stone-400 shadow-md shadow-black/40";

  const hoverBoost =
    hovered && !pressed
      ? on
        ? "brightness-110 border-amber-400/80"
        : "border-amber-400/45 text-amber-300"
      : "";

  const pressClass = pressed ? "scale-95 brightness-95" : "";

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setPressed(true);
      }}
      onPointerUp={(e) => {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {}
        setPressed(false);
      }}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerEnter={() => setHovered(true)}
      onClick={() => props.onChange(!on)}
      className={
        "group relative h-full w-full min-w-0 min-h-0 select-none touch-none rounded-lg border overflow-hidden transition-all duration-200 ease-out " +
        onClass +
        " " +
        hoverBoost +
        " " +
        pressClass
      }
    >
      {/* recessed inner sheen */}
      <span
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.25) 100%)",
        }}
      />

      {/* active glow ring */}
      <span
        className={
          "pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset transition-all duration-300 ease-out " +
          (on ? "ring-amber-400/50" : "ring-stone-800/40")
        }
      />

      {/* left status bar */}
      <span
        className={
          "pointer-events-none absolute left-0 top-0 h-full w-[6%] min-w-0 transition-all duration-200 ease-out " +
          (on ? "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.6)]" : "bg-stone-700/70")
        }
      />

      {/* status LED top-right */}
      <span className="pointer-events-none absolute right-[7%] top-[16%] flex items-center justify-center">
        <span
          className={
            "block rounded-full transition-all duration-200 ease-out " +
            (on
              ? "bg-lime-400 shadow-[0_0_8px_2px_rgba(163,230,53,0.7)] animate-pulse"
              : "bg-stone-700")
          }
          style={{ width: "0.5em", height: "0.5em", fontSize: "min(6vw,6vh)" }}
        />
      </span>

      {/* value-change ripple */}
      {pulseKey > 0 && (
        <span
          key={pulseKey}
          className={
            "pointer-events-none absolute inset-0 rounded-lg " +
            (on ? "bg-amber-400/25" : "bg-stone-500/15")
          }
          style={{ animation: "none" }}
          ref={(el) => {
            if (el) {
              el.animate(
                [
                  { opacity: 0.7, transform: "scale(0.85)" },
                  { opacity: 0, transform: "scale(1.05)" },
                ],
                { duration: 420, easing: "ease-out" }
              );
            }
          }}
        />
      )}

      {/* face content */}
      {props.children !== undefined && props.children !== null && (
        <span className="absolute inset-y-[14%] left-[10%] right-[14%] flex items-center justify-center">
          <FitText
            className={
              "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
              (on ? "text-amber-200" : hovered ? "text-amber-300" : "text-stone-300")
            }
          >
            {props.children}
          </FitText>
        </span>
      )}
    </button>
  );
}