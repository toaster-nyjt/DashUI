type ToggleSwitchProps = { on: boolean; onChange: (on: boolean) => void; disabled?: boolean; children?: React.ReactNode };

export const ToggleSwitch_MIN = {"base":[4.5,1.75]};

export function ToggleSwitch(props: ToggleSwitchProps) {
  const { on, onChange, disabled, children } = props;
  const uid = useRef("toggleswitch-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const floor = ToggleSwitch_MIN.base;
  const hasFace = children !== undefined && children !== null && children !== false;

  const accent = on ? "rgba(34,211,238," : "rgba(115,115,115,";

  return (
    <div
      className="h-full w-full relative"
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
        aria-pressed={on}
        className={
          "absolute inset-0 touch-none select-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (disabled ? "opacity-40 grayscale cursor-default" : "cursor-pointer")
        }
        style={{ transform: press && !disabled ? "scale(0.97)" : "scale(1)" }}
      >
        {/* recessed track */}
        <span
          className={
            "absolute inset-0 block border transition-all duration-200 ease-out bg-black/60 rounded-sm " +
            (on ? "border-cyan-400/50 shadow-[inset_0_0_12px_rgba(0,0,0,0.8),0_0_14px_rgba(34,211,238,0.35)]" : "border-cyan-400/20 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]")
          }
        />
        {/* scanline texture */}
        <span
          className="absolute inset-0 block opacity-40 pointer-events-none rounded-sm"
          style={{
            backgroundImage: "repeating-linear-gradient(135deg, rgba(34,211,238,0.07) 0px, rgba(34,211,238,0.07) 1px, transparent 1px, transparent 5px)"
          }}
        />
        {/* energized rail behind thumb */}
        <span
          className="absolute inset-y-[30%] left-[6%] right-[6%] block transition-all duration-300 ease-out rounded-sm"
          style={{
            background: on
              ? "linear-gradient(90deg, rgba(34,211,238,0.35), rgba(165,243,252,0.15))"
              : "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
            boxShadow: on ? "0 0 10px rgba(34,211,238,0.45)" : "none"
          }}
        />
        {/* tick marks */}
        <span className="absolute inset-y-[22%] left-[6%] right-[6%] flex items-stretch justify-between pointer-events-none">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <span
              key={"tk-" + i}
              className="block w-px transition-all duration-300"
              style={{
                background: accent + (on ? 0.35 : 0.18) + ")",
                opacity: on ? 1 : 0.6,
                transform: "scaleY(" + (i % 2 === 0 ? 1 : 0.5) + ")"
              }}
            />
          ))}
        </span>

        {/* face content region, opposite the thumb */}
        {hasFace ? (
          <span
            className="absolute top-[18%] bottom-[18%] block transition-all duration-300 ease-out"
            style={{
              left: on ? "6%" : "46%",
              right: on ? "46%" : "6%"
            }}
          >
            <FitText
              className={
                "font-mono font-bold tracking-widest uppercase transition-colors duration-200 " +
                (on ? "text-cyan-300" : "text-neutral-500")
              }
              wrap={false}
            >
              {children}
            </FitText>
          </span>
        ) : null}

        {/* thumb */}
        <span
          className="absolute top-[10%] bottom-[10%] block transition-all duration-300 ease-out"
          style={{
            width: "40%",
            left: on ? "56%" : "4%",
            transform: press && !disabled ? "scaleY(0.9)" : "scaleY(1)"
          }}
        >
          <span
            className={
              "absolute inset-0 block rounded-sm border transition-all duration-300 ease-out " +
              (on
                ? "border-transparent bg-gradient-to-r from-cyan-400 to-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.7)]"
                : "border-cyan-300/25 bg-neutral-800/90 shadow-[0_2px_6px_rgba(0,0,0,0.7)]")
            }
          />
          {/* grip lines on thumb */}
          <span className="absolute inset-y-[25%] left-1/2 -translate-x-1/2 flex items-stretch gap-[3px]">
            {[0, 1, 2].map((i) => (
              <span
                key={"gr-" + i}
                className="block w-px transition-all duration-300"
                style={{ background: on ? "rgba(0,0,0,0.55)" : "rgba(34,211,238,0.35)" }}
              />
            ))}
          </span>
          {/* live pulse dot */}
          {on ? (
            <span className="absolute top-[14%] right-[10%] h-[14%] w-[6%] min-w-0 rounded-full bg-black/70 animate-pulse" />
          ) : null}
        </span>

        {/* corner notches */}
        <span className={"absolute left-0 top-0 h-[22%] w-[6%] block transition-colors duration-200 " + (on ? "bg-cyan-300/70" : "bg-neutral-700/60")} />
        <span className={"absolute right-0 bottom-0 h-[22%] w-[6%] block transition-colors duration-200 " + (on ? "bg-cyan-300/70" : "bg-neutral-700/60")} />
      </button>
    </div>
  );
}