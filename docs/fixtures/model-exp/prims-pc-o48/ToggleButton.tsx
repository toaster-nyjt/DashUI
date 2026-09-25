type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };

export const ToggleButton_MIN = { "base": [2.5, 1.75] };

export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, children } = props;
  const uid = useRef("togglebutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(0);

  const floor = (ToggleButton_MIN as any).base;

  const hasContent = children !== undefined && children !== null && children !== false;

  const handleToggle = () => {
    setFlash((f) => f + 1);
    onChange(!on);
  };

  const ToggleButtonPowerGlyph = (p: { lit: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full transition-all duration-200 ease-out"
      style={{ filter: p.lit ? "drop-shadow(0 0 3px rgba(163,230,53,0.55))" : "none" }}
    >
      <path
        d="M12 3.5 V11"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <path
        d="M7.4 6.6 A7 7 0 1 0 16.6 6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div
      className="relative h-full w-full touch-none select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setPressed(true);
        }}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={handleToggle}
        className={
          "group absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg border transition-all duration-200 ease-out outline-none " +
          (on
            ? "border-amber-400/55 bg-amber-500/20 text-amber-100 shadow-lg shadow-amber-500/30 "
            : "border-amber-500/25 bg-neutral-900/80 text-stone-400 shadow-md shadow-black/40 hover:border-amber-400/60 hover:text-amber-300 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-px ") +
          (pressed ? "translate-y-0 scale-95 brightness-95 " : "")
        }
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* recessed base sheen */}
        <span className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-stone-700/25 to-neutral-950/40" />

        {/* lit inner glow bed */}
        <span
          className={
            "pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b from-amber-400/25 via-amber-500/10 to-transparent transition-opacity duration-300 ease-out " +
            (on ? "opacity-100" : "opacity-0")
          }
        />

        {/* animated top edge light bar */}
        <span
          className={
            "pointer-events-none absolute inset-x-[12%] top-[6%] h-[6%] rounded-full transition-all duration-300 ease-out " +
            (on ? "bg-amber-300/80 shadow-[0_0_6px_rgba(251,191,36,0.7)]" : "bg-stone-600/40")
          }
        />

        {/* inner ring on active */}
        <span
          className={
            "pointer-events-none absolute inset-[6%] rounded-md ring-1 ring-inset transition-all duration-300 ease-out " +
            (on ? "ring-amber-400/40" : "ring-transparent")
          }
        />

        {/* pulsing active corner beacon */}
        <span
          className={
            "pointer-events-none absolute right-[8%] top-[10%] h-[10%] w-[10%] rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)] transition-all duration-300 ease-out " +
            (on ? "opacity-100 animate-pulse" : "opacity-0 scale-50")
          }
        />

        {/* click ripple flash */}
        <span
          key={"flash-" + flash}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[8%] w-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/50"
          style={{ animation: "tb-ripple-" + uid + " 480ms ease-out forwards" }}
        />

        {/* face content */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {hasContent ? (
            <span className="absolute inset-[16%] flex items-center justify-center">
              <FitText
                wrap={false}
                className={
                  "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                  (on ? "text-amber-100" : "text-stone-400 group-hover:text-amber-300")
                }
              >
                {children}
              </FitText>
            </span>
          ) : (
            <span
              className={
                "flex items-center justify-center transition-colors duration-200 ease-out " +
                (on ? "text-lime-300" : "text-stone-500 group-hover:text-amber-300")
              }
              style={{ width: "42%", height: "42%" }}
            >
              <ToggleButtonPowerGlyph lit={on} />
            </span>
          )}
        </span>

        {/* bottom shadow lip */}
        <span className="pointer-events-none absolute inset-x-[10%] bottom-[5%] h-[8%] rounded-full bg-black/50 blur-[1px]" />
      </button>

      <style>
        {"@keyframes tb-ripple-" +
          uid +
          " { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; } 100% { transform: translate(-50%, -50%) scale(14); opacity: 0; } }"}
      </style>
    </div>
  );
}