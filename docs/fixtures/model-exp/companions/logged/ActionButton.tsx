type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[4,2]};

export function ActionButton(props: ActionButtonProps) {
  const tone = props.tone || 'neutral';
  const disabled = !!props.disabled;
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);

  const T = {
    neutral: {
      face: "bg-neutral-800/80",
      glowFace: "rgba(34,211,238,0.10)",
      edge: "rgba(34,211,238,0.45)",
      edgeHot: "rgba(165,243,252,0.95)",
      text: hover && !disabled ? "text-cyan-100" : "text-cyan-300",
      glow: "0 0 16px rgba(34,211,238,0.45)",
      bar: "rgba(34,211,238,0.9)"
    },
    accent: {
      face: "bg-gradient-to-r from-cyan-400 to-cyan-300",
      glowFace: "rgba(255,255,255,0.18)",
      edge: "rgba(103,232,249,0.8)",
      edgeHot: "rgba(255,255,255,0.95)",
      text: "text-black",
      glow: "0 0 22px rgba(34,211,238,0.7)",
      bar: "rgba(0,0,0,0.6)"
    },
    danger: {
      face: "bg-gradient-to-r from-rose-500 to-red-600",
      glowFace: "rgba(255,255,255,0.15)",
      edge: "rgba(251,113,133,0.7)",
      edgeHot: "rgba(255,228,230,0.95)",
      text: "text-white",
      glow: "0 0 18px rgba(244,63,94,0.65)",
      bar: "rgba(255,255,255,0.7)"
    }
  }[tone];

  const fire = () => {
    if (disabled) return;
    setFlash(function (f) { return f + 1; });
    props.onPress();
  };

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: ActionButton_MIN.base[0] + "rem", minHeight: ActionButton_MIN.base[1] + "rem" }}
    >
      <button
        type="button"
        disabled={disabled}
        onPointerDown={function (e) {
          if (disabled) return;
          (e.currentTarget as any).setPointerCapture?.(e.pointerId);
          setPressed(true);
        }}
        onPointerUp={function () { if (pressed) { setPressed(false); fire(); } }}
        onPointerCancel={function () { setPressed(false); }}
        onPointerEnter={function () { setHover(true); }}
        onPointerLeave={function () { setHover(false); setPressed(false); }}
        onKeyDown={function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPressed(true); } }}
        onKeyUp={function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPressed(false); fire(); } }}
        className={
          "group absolute inset-0 touch-none overflow-hidden border-0 bg-transparent p-0 transition-all duration-200 ease-out focus-visible:outline-none " +
          (disabled ? "cursor-not-allowed opacity-40 grayscale" : "cursor-pointer")
        }
        style={{
          transform: pressed && !disabled ? "scale(0.965)" : "scale(1)",
          filter: !disabled && hover ? "brightness(1.18)" : "none",
          clipPath: "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))"
        }}
      >
        {/* face */}
        <span
          className={"absolute inset-0 " + T.face + " transition-all duration-200 ease-out"}
          style={{ boxShadow: !disabled && (hover || pressed) ? T.glow : "inset 0 0 14px rgba(0,0,0,0.7)" }}
        />
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)" }}
        />
        {/* diagonal sheen sweep on hover */}
        <span
          className="pointer-events-none absolute inset-y-0 w-1/3 transition-all duration-500 ease-out"
          style={{
            left: !disabled && hover ? "110%" : "-45%",
            background: "linear-gradient(100deg, transparent, " + T.glowFace + ", transparent)",
            transform: "skewX(-18deg)"
          }}
        />
        {/* flash on press */}
        <span
          key={"flash-" + flash}
          className={"pointer-events-none absolute inset-0 " + (flash > 0 ? "animate-[ping_0.45s_ease-out_1]" : "")}
          style={{ background: flash > 0 ? T.glowFace : "transparent", opacity: 0 }}
        />
        {/* border frame */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={!disabled && (hover || pressed) ? T.edgeHot : T.edge} />
              <stop offset="55%" stopColor={T.edge} />
              <stop offset="100%" stopColor={!disabled && hover ? T.edgeHot : T.edge} />
            </linearGradient>
          </defs>
          <path
            d="M0.8 0.8 H92 L99.2 8 V99.2 H8 L0.8 92 Z"
            fill="none"
            stroke={"url(#" + uid + "-edge)"}
            strokeWidth={pressed ? 2.6 : 1.6}
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-200 ease-out"
          />
        </svg>
        {/* corner ticks */}
        <span className="pointer-events-none absolute left-0 top-0 h-[3px] transition-all duration-300 ease-out" style={{ width: hover && !disabled ? "45%" : "18%", background: T.bar }} />
        <span className="pointer-events-none absolute bottom-0 right-0 h-[3px] transition-all duration-300 ease-out" style={{ width: hover && !disabled ? "45%" : "18%", background: T.bar }} />
        {/* face content */}
        {props.children !== undefined && props.children !== null && props.children !== false ? (
          <span className="absolute inset-x-[10%] inset-y-[18%]">
            <FitText className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + T.text}>
              {props.children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}