type ToggleSwitchProps = { on: boolean; onChange: (on: boolean) => void; disabled?: boolean; children?: React.ReactNode };

export const ToggleSwitch_MIN = {"base":[4.5,1.75]};

export function ToggleSwitch(props: ToggleSwitchProps) {
  const { on, onChange, disabled, children } = props;
  const uid = useRef("toggleswitch-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const floor = ToggleSwitch_MIN.base;
  const hasKids = children !== undefined && children !== null && children !== false;

  const trackTone = disabled
    ? "border-neutral-700/50 bg-black/50"
    : on
      ? "border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
      : "border-cyan-400/20 bg-black/60";

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        type="button"
        disabled={!!disabled}
        aria-pressed={on}
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerLeave={() => setPress(false)}
        onClick={() => { if (!disabled) onChange(!on); }}
        className={
          "absolute inset-0 touch-none select-none rounded-sm border overflow-hidden transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] " +
          trackTone +
          (disabled ? " opacity-40 grayscale cursor-default" : " cursor-pointer active:brightness-110") +
          (press ? " scale-[0.98]" : "")
        }
      >
        {/* scanline texture */}
        <span
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: "repeating-linear-gradient(135deg, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 5px)"
          }}
        />
        {/* energized rail behind thumb */}
        <span
          className={
            "pointer-events-none absolute top-[14%] bottom-[14%] left-[3%] right-[3%] rounded-sm transition-all duration-300 ease-out " +
            (on
              ? "bg-gradient-to-r from-cyan-500/20 via-cyan-400/25 to-cyan-300/35"
              : "bg-gradient-to-r from-neutral-800/50 to-neutral-900/30")
          }
        />
        {/* tick marks */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-glow"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(165,243,252,0.95)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.55)" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect
              key={"tk-" + i}
              x={10 + i * 11}
              y={18}
              width={1.2}
              height={4}
              fill={on ? "url(#" + uid + "-glow)" : "rgba(115,115,115,0.45)"}
              className="transition-all duration-300"
            />
          ))}
        </svg>

        {/* label region — occupies the half the thumb is NOT on */}
        {hasKids ? (
          <span
            className={
              "pointer-events-none absolute top-[12%] bottom-[12%] w-[46%] transition-all duration-300 ease-out " +
              (on ? "left-[3%]" : "left-[51%]")
            }
          >
            <FitText
              className={
                "font-mono font-bold tracking-widest uppercase transition-colors duration-200 " +
                (disabled ? "text-neutral-500" : on ? "text-cyan-200" : "text-cyan-300/50")
              }
              wrap={false}
            >
              {children}
            </FitText>
          </span>
        ) : null}

        {/* thumb */}
        <span
          className={
            "pointer-events-none absolute top-[10%] bottom-[10%] w-[46%] rounded-sm border transition-all duration-300 ease-out " +
            (on
              ? "left-[51%] border-cyan-200/80 bg-gradient-to-b from-cyan-300 to-cyan-500 shadow-[0_0_14px_rgba(34,211,238,0.75)]"
              : "left-[3%] border-cyan-400/25 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-[0_0_6px_rgba(0,0,0,0.8)]")
          }
        >
          <span
            className={
              "absolute inset-y-[22%] left-1/2 -translate-x-1/2 w-[2px] transition-all duration-300 " +
              (on ? "bg-black/60" : "bg-cyan-400/40")
            }
          />
          <span
            className={
              "absolute inset-y-[22%] left-1/2 w-[2px] translate-x-[220%] transition-all duration-300 " +
              (on ? "bg-black/40" : "bg-cyan-400/20")
            }
          />
          <span
            className={
              "absolute inset-y-[22%] left-1/2 w-[2px] -translate-x-[320%] transition-all duration-300 " +
              (on ? "bg-black/40" : "bg-cyan-400/20")
            }
          />
        </span>

        {/* live edge indicator */}
        <span
          className={
            "pointer-events-none absolute top-0 h-[2px] transition-all duration-300 ease-out " +
            (on
              ? "left-0 right-0 bg-gradient-to-r from-transparent via-cyan-300 to-transparent"
              : "left-0 right-[70%] bg-neutral-700")
          }
        />
      </button>
    </div>
  );
}