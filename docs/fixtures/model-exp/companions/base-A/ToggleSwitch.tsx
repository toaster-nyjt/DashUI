type ToggleSwitchProps = { on: boolean; onChange: (on: boolean) => void; disabled?: boolean; children?: React.ReactNode };

export const ToggleSwitch_MIN = {"base":[4,1.75]};

export function ToggleSwitch(props: ToggleSwitchProps) {
  const { on, onChange, disabled, children } = props;
  const uid = useRef("toggleswitch-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const floor = ToggleSwitch_MIN.base;

  const accent = on ? "rgba(34,211,238," : "rgba(115,115,115,";

  return (
    <div
      className="h-full w-full flex items-center justify-start gap-2 select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        type="button"
        disabled={disabled}
        onPointerDown={(e) => { if (!disabled) { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); } }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerLeave={() => setPress(false)}
        onClick={() => { if (!disabled) onChange(!on); }}
        className={
          "relative flex-none h-full aspect-[2/1] touch-none rounded-sm border overflow-hidden transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (disabled ? "opacity-40 grayscale cursor-default " : "cursor-pointer ") +
          (on
            ? "border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_14px_rgba(34,211,238,0.35)] "
            : "border-cyan-400/25 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ") +
          (press && !disabled ? "brightness-125 scale-[0.97] " : "")
        }
        style={{ maxHeight: "2.6rem", minHeight: 0 }}
      >
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
          }}
        />
        {/* rail groove */}
        <span className="pointer-events-none absolute left-[6%] right-[6%] top-1/2 -translate-y-1/2 h-[14%] bg-black/70 ring-1 ring-cyan-400/10" />
        {/* energized fill */}
        <span
          className="pointer-events-none absolute left-0 top-0 bottom-0 transition-all duration-300 ease-out bg-gradient-to-r from-cyan-400/50 to-cyan-200/20"
          style={{ width: on ? "100%" : "0%" }}
        />
        {/* tick marks */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[4px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={"tk-" + uid + "-" + i}
              className="block w-[1px] h-[30%] transition-all duration-300"
              style={{ background: accent + (on ? 0.8 : 0.35) + ")" }}
            />
          ))}
        </span>
        {/* thumb */}
        <span
          className={
            "pointer-events-none absolute top-[10%] bottom-[10%] aspect-[1/1] transition-all duration-300 ease-out border " +
            (on
              ? "bg-gradient-to-b from-cyan-200 to-cyan-400 border-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.8)]"
              : "bg-gradient-to-b from-neutral-500 to-neutral-800 border-neutral-500/70")
          }
          style={{ left: on ? "calc(100% - 10% - (80% * 1))" : "10%", transform: "translateX(" + (on ? "-4%" : "4%") + ")" }}
        >
          <span
            className="absolute inset-[26%] transition-all duration-300"
            style={{
              background: on ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.5)",
              clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            }}
          />
        </span>
        {on && !disabled ? (
          <span className="pointer-events-none absolute inset-0 ring-1 ring-cyan-300/40 animate-pulse" />
        ) : null}
      </button>

      {children !== undefined && children !== null ? (
        <span className="relative flex-1 min-w-0 h-full flex items-center">
          <span className="absolute inset-y-[14%] inset-x-0">
            <FitText
              align="start"
              className={
                "font-mono font-bold tracking-widest uppercase transition-colors duration-200 " +
                (disabled ? "text-neutral-500" : on ? "text-cyan-300" : "text-cyan-200/50")
              }
            >
              {children}
            </FitText>
          </span>
        </span>
      ) : null}
    </div>
  );
}