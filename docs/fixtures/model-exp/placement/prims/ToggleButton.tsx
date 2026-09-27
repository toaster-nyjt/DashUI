type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger' };

export const ToggleButton_MIN = {"base":[4.5,2]};

export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, children, disabled, tone = "neutral" } = props;
  const uid = useRef("togglebutton-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setPulse((p) => p + 1);
  }, [on]);

  const TONE: any = {
    neutral: { c: "34,211,238", text: on ? "text-cyan-50" : "text-cyan-300/70", border: on ? "border-cyan-400/80" : "border-cyan-500/25" },
    accent: { c: "253,224,71", text: on ? "text-black" : "text-yellow-300/80", border: on ? "border-yellow-300/90" : "border-yellow-300/35" },
    danger: { c: "239,68,68", text: on ? "text-red-50" : "text-red-400/80", border: on ? "border-red-400/90" : "border-red-500/30" },
  };
  const t = TONE[tone];
  const rgb = t.c;

  const clip = "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))";

  const bg = on
    ? (tone === "accent"
        ? "linear-gradient(135deg,rgba(253,224,71,1) 0%,rgba(250,204,21,0.88) 100%)"
        : "linear-gradient(135deg,rgba(" + rgb + ",0.42) 0%,rgba(" + rgb + ",0.16) 100%)")
    : "linear-gradient(135deg,rgba(21,15,40,0.9) 0%,rgba(10,10,20,0.95) 100%)";

  const glow = disabled
    ? "none"
    : on
      ? "0 0 16px rgba(" + rgb + ",0.5), inset 0 0 12px rgba(" + rgb + ",0.25)"
      : hover
        ? "0 0 12px rgba(" + rgb + ",0.28), inset 0 2px 8px rgba(0,0,0,0.8)"
        : "inset 0 2px 8px rgba(0,0,0,0.8)";

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: ToggleButton_MIN.base[0] + "rem", minHeight: ToggleButton_MIN.base[1] + "rem" }}
    >
      <button
        type="button"
        disabled={!!disabled}
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        onClick={() => { if (!disabled) onChange(!on); }}
        aria-pressed={on}
        className={"absolute inset-0 touch-none overflow-hidden border transition-all duration-200 ease-out " + t.border + (disabled ? " opacity-40 grayscale cursor-default" : " cursor-pointer")}
        style={{
          clipPath: clip,
          backgroundImage: bg,
          boxShadow: glow,
          transform: press && !disabled ? "translateY(1px) scale(0.985)" : hover && !disabled ? "translateY(-1px)" : "none",
        }}
      >
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-30 transition-opacity duration-200"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,0.35) 0px,rgba(0,0,0,0.35) 1px,transparent 1px,transparent 3px)" }}
        />
        {/* sheen sweep on hover */}
        <span
          className="pointer-events-none absolute -inset-y-2 w-1/3 transition-all duration-500 ease-out"
          style={{
            left: hover && !disabled ? "110%" : "-45%",
            backgroundImage: "linear-gradient(100deg,transparent 0%,rgba(" + (tone === "accent" ? "255,255,255" : rgb) + ",0.22) 50%,transparent 100%)",
            opacity: disabled ? 0 : 1,
          }}
        />
        {/* state edge bar */}
        <span
          className="pointer-events-none absolute left-0 top-0 bottom-0 transition-all duration-300 ease-out"
          style={{
            width: on ? "0.3rem" : "0.14rem",
            background: tone === "accent" && on ? "rgba(0,0,0,0.75)" : "rgba(" + rgb + "," + (on ? 0.95 : 0.35) + ")",
            boxShadow: on ? "0 0 10px rgba(" + rgb + ",0.8)" : "none",
          }}
        />
        {/* corner ticks */}
        <span
          className="pointer-events-none absolute right-[3%] top-[10%] transition-all duration-300"
          style={{
            width: "0.34rem", height: "0.34rem", borderRadius: "9999px",
            background: on ? (tone === "accent" ? "rgba(0,0,0,0.8)" : "rgba(" + rgb + ",1)") : "rgba(100,116,139,0.5)",
            boxShadow: on ? "0 0 8px rgba(" + rgb + ",0.9)" : "none",
            animation: on && !disabled ? "none" : "none",
          }}
        />
        {/* activation flash */}
        <span
          key={"flash-" + pulse}
          className="pointer-events-none absolute inset-0"
          style={{
            background: "rgba(" + rgb + ",0.55)",
            animation: pulse > 0 && !disabled ? "toggleflash-" + uid + " 420ms ease-out forwards" : "none",
            opacity: 0,
          }}
        />
        {children != null ? (
          <span className="absolute inset-y-[18%] left-[12%] right-[10%]">
            <FitText
              className={"font-mono font-bold tracking-[0.15em] uppercase transition-colors duration-200 " + t.text + (on && tone !== "accent" ? " drop-shadow-[0_0_8px_currentColor]" : "")}
            >
              {children}
            </FitText>
          </span>
        ) : null}
      </button>
      <style>{"@keyframes toggleflash-" + uid + "{0%{opacity:0.75}35%{opacity:0.15}60%{opacity:0.5}100%{opacity:0}}"}</style>
    </div>
  );
}