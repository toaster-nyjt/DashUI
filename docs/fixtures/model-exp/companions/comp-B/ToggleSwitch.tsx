type ToggleSwitchProps = { on: boolean; onChange: (on: boolean) => void; disabled?: boolean; children?: React.ReactNode };

export const ToggleSwitch_MIN = {"base":[4.5,1.75]};

export function ToggleSwitch(props: ToggleSwitchProps) {
  const { on, onChange, disabled, children } = props;
  const uid = useRef("toggleswitch-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const floor = ToggleSwitch_MIN.base;

  const accent = on ? "rgba(34,211,238,0.85)" : "rgba(115,115,115,0.5)";

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        role="switch"
        aria-checked={on}
        aria-disabled={disabled ? true : undefined}
        tabIndex={disabled ? -1 : 0}
        onPointerDown={(e) => {
          if (disabled) return;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setPress(true);
        }}
        onPointerUp={(e) => {
          if (disabled) return;
          setPress(false);
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const inside =
            e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (inside) onChange(!on);
        }}
        onPointerCancel={() => setPress(false)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!on);
          }
        }}
        className={
          "group absolute inset-0 touch-none overflow-hidden rounded-sm border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (disabled
            ? "cursor-default opacity-40 grayscale border-neutral-600/40 bg-black/60"
            : "cursor-pointer " +
              (on
                ? "border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_16px_rgba(34,211,238,0.35)] hover:shadow-[0_0_22px_rgba(34,211,238,0.55)]"
                : "border-cyan-400/25 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] hover:border-cyan-300/45")) +
          (press ? " brightness-125" : "")
        }
        style={{ transform: press && !disabled ? "scale(0.975)" : "scale(1)" }}
      >
        {/* hatch backdrop */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 40"
          aria-hidden="true"
        >
          <defs>
            <pattern id={uid + "-hatch"} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={accent} strokeWidth="1" opacity="0.35" />
            </pattern>
            <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
              <stop offset="100%" stopColor="rgba(165,243,252,0.25)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="40" fill={"url(#" + uid + "-hatch)"} />
          <rect
            x="0"
            y="0"
            width={on ? 100 : 0}
            height="40"
            fill={"url(#" + uid + "-fill)"}
            style={{ transition: "width 260ms cubic-bezier(.2,.8,.2,1)" }}
          />
          <rect x="0.5" y="0.5" width="99" height="39" fill="none" stroke={accent} strokeWidth="0.6" opacity="0.5" />
        </svg>

        {/* face content */}
        {children !== undefined && children !== null && children !== false ? (
          <div
            className="pointer-events-none absolute top-0 bottom-0 transition-all duration-300 ease-out"
            style={{ left: on ? "6%" : "34%", right: on ? "40%" : "8%" }}
          >
            <div className="absolute inset-[14%]">
              <FitText
                className={
                  "font-mono font-bold uppercase tracking-widest transition-colors duration-200 " +
                  (disabled ? "text-neutral-500" : on ? "text-cyan-200" : "text-cyan-300/60")
                }
                wrap={false}
                align={on ? "start" : "end"}
              >
                {children}
              </FitText>
            </div>
          </div>
        ) : null}

        {/* thumb */}
        <div
          className="pointer-events-none absolute top-[10%] bottom-[10%] transition-all duration-300"
          style={{
            width: "26%",
            left: on ? "70%" : "4%",
            transitionTimingFunction: "cubic-bezier(.2,.9,.15,1)",
          }}
        >
          <div
            className={
              "relative h-full w-full rounded-sm border transition-all duration-200 " +
              (disabled
                ? "border-neutral-600/50 bg-neutral-800"
                : on
                ? "border-cyan-200/80 bg-gradient-to-b from-cyan-300 to-cyan-500 shadow-[0_0_14px_rgba(34,211,238,0.75)]"
                : "border-cyan-400/30 bg-gradient-to-b from-neutral-700 to-neutral-900")
            }
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 26 40" preserveAspectRatio="none" aria-hidden="true">
              <line x1="9" y1="11" x2="9" y2="29" stroke={on ? "rgba(0,0,0,0.55)" : "rgba(34,211,238,0.35)"} strokeWidth="1.4" />
              <line x1="13" y1="11" x2="13" y2="29" stroke={on ? "rgba(0,0,0,0.55)" : "rgba(34,211,238,0.35)"} strokeWidth="1.4" />
              <line x1="17" y1="11" x2="17" y2="29" stroke={on ? "rgba(0,0,0,0.55)" : "rgba(34,211,238,0.35)"} strokeWidth="1.4" />
            </svg>
          </div>
        </div>

        {/* status LED */}
        <div
          className={
            "pointer-events-none absolute top-[14%] h-[16%] w-[4%] rounded-full transition-all duration-300 " +
            (disabled
              ? "bg-neutral-600"
              : on
              ? "animate-pulse bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
              : "bg-rose-600/70")
          }
          style={{ left: on ? "4%" : "93%" }}
        />
      </div>
    </div>
  );
}