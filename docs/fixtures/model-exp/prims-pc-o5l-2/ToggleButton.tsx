type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };

export const ToggleButton_MIN = {"base":[3,1.75]};

export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, children } = props;
  const uid = useRef("tgl-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const floor = ToggleButton_MIN.base;

  const base =
    "relative h-full w-full overflow-hidden rounded-lg border transition-all duration-200 ease-out select-none touch-none shadow-md shadow-black/40 " +
    "active:scale-95 active:brightness-95 ";
  const state = on
    ? "border-amber-400/60 bg-amber-500/20 shadow-lg shadow-amber-500/30 hover:border-amber-400/80 hover:bg-amber-500/30"
    : "border-amber-500/25 bg-neutral-900/90 hover:border-amber-400/50 hover:bg-amber-500/10 hover:-translate-y-px";

  return (
    <div className="h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <button
        type="button"
        onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerLeave={() => setPress(false)}
        onClick={() => onChange(!on)}
        className={base + state}
      >
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id={uid + "-g"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={on ? "#fbbf24" : "#a8a29e"} stopOpacity={on ? 0.35 : 0.1} />
              <stop offset="100%" stopColor="#0c0a09" stopOpacity={on ? 0.45 : 0.6} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-g)"} />
        </svg>

        {/* lit edge bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[4%] transition-all duration-200 ease-out"
          style={{
            background: on ? "linear-gradient(to bottom,#fbbf24,#f59e0b)" : "rgba(120,113,108,0.35)",
            opacity: on ? 1 : 0.6,
            boxShadow: on ? "0 0 10px rgba(245,158,11,0.8)" : "none",
          }}
        />

        {/* press ripple / glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out"
          style={{
            opacity: press ? 1 : 0,
            background: "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.30), transparent 70%)",
          }}
        />

        {/* active inset ring + pulse */}
        {on ? (
          <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-amber-400/50 animate-pulse" />
        ) : null}

        {children != null && children !== false ? (
          <div className="absolute inset-[14%]">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (on ? "text-amber-200" : "text-stone-400")
              }
            >
              {children}
            </FitText>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-full transition-all duration-200 ease-out"
              style={{
                width: "0.5rem",
                height: "0.5rem",
                background: on ? "#a3e635" : "#44403c",
                boxShadow: on ? "0 0 10px rgba(163,230,53,0.8)" : "inset 0 0 4px rgba(0,0,0,0.8)",
              }}
            />
          </div>
        )}
      </button>
    </div>
  );
}