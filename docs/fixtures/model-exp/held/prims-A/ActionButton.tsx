type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[4,2]};

export function ActionButton(props: ActionButtonProps) {
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";
  const disabled = !!props.disabled;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);

  const T = {
    neutral: {
      face: "bg-neutral-800/80",
      glow: "0 0 16px rgba(34,211,238,0.45)",
      border: "border-cyan-300/40",
      text: "text-cyan-200",
      hot: "text-cyan-100",
      sweep: "linear-gradient(90deg,transparent,rgba(34,211,238,0.35),transparent)",
      bar: "bg-cyan-400",
      corner: "rgba(34,211,238,0.9)"
    },
    accent: {
      face: "bg-gradient-to-r from-cyan-400 to-cyan-300",
      glow: "0 0 22px rgba(34,211,238,0.75)",
      border: "border-transparent",
      text: "text-black",
      hot: "text-black",
      sweep: "linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)",
      bar: "bg-black/70",
      corner: "rgba(0,0,0,0.75)"
    },
    danger: {
      face: "bg-gradient-to-r from-rose-500 to-red-600",
      glow: "0 0 18px rgba(244,63,94,0.65)",
      border: "border-rose-400/50",
      text: "text-white",
      hot: "text-white",
      sweep: "linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)",
      bar: "bg-white/70",
      corner: "rgba(255,255,255,0.8)"
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
        onPointerDown={function (e) { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={function () { if (press) { setPress(false); fire(); } }}
        onPointerCancel={function () { setPress(false); }}
        onPointerEnter={function () { setHover(true); }}
        onPointerLeave={function () { setHover(false); setPress(false); }}
        onKeyDown={function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPress(true); } }}
        onKeyUp={function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPress(false); fire(); } }}
        className={
          "group absolute inset-0 touch-none overflow-hidden border " + T.border + " " + T.face +
          " transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (disabled ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer")
        }
        style={{
          clipPath: "polygon(0.55rem 0, 100% 0, 100% calc(100% - 0.55rem), calc(100% - 0.55rem) 100%, 0 100%)",
          boxShadow: disabled ? "none" : (press ? "inset 0 0 18px rgba(0,0,0,0.75), " + T.glow : (hover ? T.glow : "inset 0 0 10px rgba(0,0,0,0.5)")),
          transform: press ? "scale(0.965)" : (hover && !disabled ? "scale(1.015)" : "scale(1)"),
          filter: hover && !disabled ? "brightness(1.18)" : "none"
        }}
      >
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)" }}
        />
        {/* diagonal hatch at edge */}
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-[14%] opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(135deg, " + T.corner + " 0px, " + T.corner + " 1px, transparent 1px, transparent 6px)" }}
        />
        {/* hover sweep */}
        <span
          className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out"
          style={{
            backgroundImage: T.sweep,
            transform: hover && !disabled ? "translateX(0%)" : "translateX(-110%)",
            opacity: disabled ? 0 : 1
          }}
        />
        {/* press flash */}
        {flash > 0 ? (
          <span
            key={uid + "-flash-" + flash}
            className="pointer-events-none absolute inset-0"
            style={{ background: "rgba(255,255,255,0.55)", animation: "none", opacity: 0, transition: "opacity 260ms ease-out" }}
            ref={function (el) { if (el) { el.style.opacity = "0.7"; requestAnimationFrame(function () { el.style.opacity = "0"; }); } }}
          />
        ) : null}
        {/* top/bottom rails */}
        <span className={"pointer-events-none absolute left-0 top-0 h-[2px] " + T.bar + " transition-all duration-300 ease-out"} style={{ width: hover && !disabled ? "100%" : "22%", opacity: 0.85 }} />
        <span className={"pointer-events-none absolute bottom-0 right-0 h-[2px] " + T.bar + " transition-all duration-300 ease-out"} style={{ width: hover && !disabled ? "100%" : "22%", opacity: 0.6 }} />
        {/* face content */}
        {props.children !== undefined && props.children !== null && props.children !== "" ? (
          <span className="absolute inset-[14%] flex items-center justify-center">
            <FitText
              className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + (hover && !disabled ? T.hot : T.text)}
            >
              {props.children}
            </FitText>
          </span>
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className={"h-[14%] w-[22%] " + T.bar} style={{ opacity: 0.5, clipPath: "polygon(0 0,100% 0,85% 100%,0 100%)" }} />
          </span>
        )}
      </button>
    </div>
  );
}