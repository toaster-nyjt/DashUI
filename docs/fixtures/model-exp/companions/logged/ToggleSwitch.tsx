type ToggleSwitchProps = { on: boolean; onChange: (on: boolean) => void; disabled?: boolean; children?: React.ReactNode };

export const ToggleSwitch_MIN = {"base":[4,2]};

export function ToggleSwitch(props: ToggleSwitchProps) {
  const { on, onChange, disabled, children } = props;
  const uid = useRef("toggleswitch-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const floor = ToggleSwitch_MIN.base;

  const accent = on ? "rgba(34,211,238," : "rgba(115,115,115,";

  return (
    <div
      className="h-full w-full flex items-center justify-center gap-2 select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        type="button"
        disabled={disabled}
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onClick={() => { if (!disabled) onChange(!on); }}
        className={
          "relative touch-none rounded-sm border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (disabled ? "opacity-40 grayscale cursor-default " : "cursor-pointer ") +
          (on
            ? "border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_14px_rgba(34,211,238,0.35)] "
            : "border-cyan-400/25 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ") +
          (press ? "scale-[0.97] brightness-110" : "")
        }
        style={{ width: "3.25rem", height: "1.5rem" }}
      >
        <svg viewBox="0 0 130 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.05)" />
            </linearGradient>
          </defs>
          {on && <rect x="0" y="0" width="130" height="60" fill={"url(#" + uid + "-fill)"} />}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={"h-" + i}
              x1={4 + i * 24}
              y1="0"
              x2={-8 + i * 24}
              y2="60"
              stroke={accent + (on ? "0.18)" : "0.10)")}
              strokeWidth="2"
            />
          ))}
        </svg>
        {/* thumb */}
        <span
          className={
            "absolute top-[10%] bottom-[10%] w-[42%] rounded-sm transition-all duration-200 ease-out " +
            (on
              ? "left-[56%] bg-gradient-to-b from-cyan-200 to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
              : "left-[2%] bg-gradient-to-b from-neutral-500 to-neutral-700 shadow-none")
          }
        >
          <span className="absolute inset-y-[22%] left-[26%] w-[2px] bg-black/50" />
          <span className="absolute inset-y-[22%] right-[26%] w-[2px] bg-black/50" />
        </span>
        <span
          className={
            "absolute -inset-[2px] rounded-sm pointer-events-none transition-opacity duration-300 " +
            (on ? "opacity-100 animate-pulse" : "opacity-0")
          }
          style={{ boxShadow: "0 0 16px rgba(34,211,238,0.45)" }}
        />
      </button>

      {children !== undefined && children !== null && children !== false ? (
        <div className="flex-1 min-w-0 h-full py-1 flex items-center">
          <div className="flex-1 min-w-0 h-[70%] min-h-0">
            <FitText
              align="start"
              className={
                "font-mono font-bold tracking-widest uppercase transition-colors duration-200 " +
                (disabled ? "text-neutral-500" : on ? "text-cyan-300" : "text-cyan-200/50")
              }
            >
              {children}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}