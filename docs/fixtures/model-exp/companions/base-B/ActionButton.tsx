type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[4,2]};

export function ActionButton(props: ActionButtonProps) {
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";
  const disabled = !!props.disabled;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);
  const floor = ActionButton_MIN.base;

  const T = {
    neutral: {
      fill: "rgba(23,23,23,0.85)",
      fill2: "rgba(10,10,10,0.9)",
      line: "rgba(34,211,238,0.40)",
      lineHot: "rgba(165,243,252,0.95)",
      glow: "rgba(34,211,238,0.55)",
      text: "text-cyan-200",
      textHot: "text-cyan-50"
    },
    accent: {
      fill: "rgba(34,211,238,0.90)",
      fill2: "rgba(103,232,249,0.75)",
      line: "rgba(165,243,252,0.85)",
      lineHot: "rgba(255,255,255,0.95)",
      glow: "rgba(34,211,238,0.85)",
      text: "text-black",
      textHot: "text-black"
    },
    danger: {
      fill: "rgba(159,18,57,0.80)",
      fill2: "rgba(24,6,12,0.92)",
      line: "rgba(251,113,133,0.60)",
      lineHot: "rgba(254,205,211,0.95)",
      glow: "rgba(244,63,94,0.7)",
      text: "text-rose-200",
      textHot: "text-white"
    }
  }[tone];

  const active = !disabled && (hover || press);

  const fire = () => {
    if (disabled) return;
    setFlash(function (f) { return f + 1; });
    props.onPress();
  };

  // clip path with cut corners
  const cut = "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))";

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <button
        type="button"
        disabled={disabled}
        onPointerDown={function (e) {
          if (disabled) return;
          (e.currentTarget as any).setPointerCapture?.(e.pointerId);
          setPress(true);
        }}
        onPointerUp={function () {
          if (press) { setPress(false); fire(); }
        }}
        onPointerCancel={function () { setPress(false); }}
        onPointerEnter={function () { setHover(true); }}
        onPointerLeave={function () { setHover(false); setPress(false); }}
        onKeyDown={function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPress(true); } }}
        onKeyUp={function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPress(false); fire(); } }}
        className={
          "absolute inset-0 touch-none overflow-hidden border-0 p-0 outline-none transition-all duration-200 ease-out focus-visible:outline-none " +
          (disabled ? "cursor-not-allowed opacity-40 grayscale" : "cursor-pointer")
        }
        style={{
          clipPath: cut,
          WebkitClipPath: cut,
          transform: press ? "scale(0.97)" : hover && !disabled ? "scale(1.012)" : "scale(1)",
          filter: press ? "brightness(1.18)" : hover && !disabled ? "brightness(1.08)" : "none"
        }}
      >
        {/* base fill */}
        <span
          className="absolute inset-0 transition-all duration-200 ease-out"
          style={{
            background: "linear-gradient(135deg," + T.fill + " 0%," + T.fill2 + " 100%)",
            boxShadow: active
              ? "inset 0 0 18px rgba(0,0,0,0.6), 0 0 18px " + T.glow
              : "inset 0 0 12px rgba(0,0,0,0.8)"
          }}
        />
        {/* scanlines */}
        <span
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 4px)"
          }}
        />
        {/* sweep shine on hover */}
        <span
          className="pointer-events-none absolute inset-y-0 w-1/3 transition-all duration-500 ease-out"
          style={{
            background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.22), transparent)",
            left: active ? "110%" : "-45%",
            opacity: disabled ? 0 : 1
          }}
        />
        {/* flash burst on press */}
        <span
          key={"flash-" + flash}
          className={"pointer-events-none absolute inset-0 " + (flash > 0 ? "animate-[ping_0.5s_ease-out_1]" : "")}
          style={{
            background: flash > 0 ? "radial-gradient(circle at 50% 50%," + T.glow + ", transparent 70%)" : "none",
            opacity: 0
          }}
        />
        {/* border frame */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={active ? T.lineHot : T.line} />
              <stop offset="50%" stopColor={T.line} />
              <stop offset="100%" stopColor={active ? T.lineHot : T.line} />
            </linearGradient>
          </defs>
          <path
            d="M0.8 0.8 H88 L99.2 11 V99.2 H12 L0.8 89 Z"
            fill="none"
            stroke={"url(#" + uid + "-edge)"}
            strokeWidth={active ? 2.4 : 1.6}
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-200 ease-out"
          />
        </svg>
        {/* corner ticks */}
        <span
          className="pointer-events-none absolute left-0 top-0 transition-all duration-200"
          style={{
            width: "0.5rem", height: "2px",
            background: active ? T.lineHot : "transparent"
          }}
        />
        <span
          className="pointer-events-none absolute bottom-0 right-0 transition-all duration-200"
          style={{
            width: "0.5rem", height: "2px",
            background: active ? T.lineHot : "transparent"
          }}
        />
        {/* face content */}
        {props.children !== undefined && props.children !== null && props.children !== false ? (
          <span className="absolute inset-[14%] flex items-center justify-center">
            <FitText
              className={
                "font-mono font-bold uppercase tracking-widest transition-colors duration-200 " +
                (active ? T.textHot : T.text)
              }
            >
              {props.children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}