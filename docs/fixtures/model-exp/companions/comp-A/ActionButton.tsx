type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[4,2]};

export function ActionButton(props: ActionButtonProps) {
  const { onPress, disabled, tone = 'neutral', children } = props;
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(0);

  const T = {
    neutral: {
      face: "bg-neutral-800/80",
      border: "border-cyan-300/40",
      text: "text-cyan-200",
      textHot: "text-cyan-100",
      glow: "0 0 16px rgba(34,211,238,0.45)",
      glowStrong: "0 0 26px rgba(34,211,238,0.75)",
      sweep: "linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.35) 50%, rgba(34,211,238,0) 100%)",
      corner: "rgba(34,211,238,0.85)",
      ring: "rgba(34,211,238,0.6)"
    },
    accent: {
      face: "bg-gradient-to-r from-cyan-400 to-cyan-300",
      border: "border-transparent",
      text: "text-black",
      textHot: "text-black",
      glow: "0 0 20px rgba(34,211,238,0.6)",
      glowStrong: "0 0 30px rgba(34,211,238,0.9)",
      sweep: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
      corner: "rgba(8,14,16,0.85)",
      ring: "rgba(34,211,238,0.8)"
    },
    danger: {
      face: "bg-gradient-to-r from-rose-500 to-red-600",
      border: "border-rose-400/50",
      text: "text-white",
      textHot: "text-white",
      glow: "0 0 16px rgba(244,63,94,0.5)",
      glowStrong: "0 0 28px rgba(244,63,94,0.85)",
      sweep: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)",
      corner: "rgba(255,228,230,0.9)",
      ring: "rgba(244,63,94,0.7)"
    }
  }[tone];

  const floor = ActionButton_MIN.base;
  const active = !disabled;

  const fire = () => {
    if (disabled) return;
    setPulse((p) => p + 1);
    onPress();
  };

  return (
    <div className="h-full w-full relative" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <style>{"@keyframes " + uid + "-sweep{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}@keyframes " + uid + "-ring{0%{opacity:.85;transform:scale(1)}100%{opacity:0;transform:scale(1.12)}}"}</style>
      <button
        type="button"
        disabled={disabled}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPressed(false); }}
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPressed(true); }}
        onPointerUp={() => { if (pressed) fire(); setPressed(false); }}
        onPointerCancel={() => setPressed(false)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPressed(true); } }}
        onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPressed(false); fire(); } }}
        className={
          "absolute inset-0 touch-none select-none overflow-hidden rounded-none border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          T.face + " " + T.border + " " +
          (disabled ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer")
        }
        style={{
          clipPath: "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))",
          transform: active && pressed ? "scale(0.965)" : active && hover ? "scale(1.015)" : "scale(1)",
          filter: active && hover ? "brightness(1.2)" : "none",
          boxShadow: disabled ? "none" : pressed ? T.glowStrong : hover ? T.glow : "inset 0 0 12px rgba(0,0,0,0.6)"
        }}
      >
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)" }}
        />
        {/* hover sweep */}
        {active && hover ? (
          <span
            key={"sw-" + pulse}
            className="pointer-events-none absolute inset-y-0 w-1/2"
            style={{ background: T.sweep, animation: uid + "-sweep 900ms linear infinite" }}
          />
        ) : null}
        {/* press ring pulse */}
        {pulse > 0 ? (
          <span
            key={"ring-" + pulse}
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 0 2px " + T.ring, animation: uid + "-ring 420ms ease-out forwards" }}
          />
        ) : null}
        {/* corner ticks */}
        <span className="pointer-events-none absolute left-0 top-0 h-[0.35rem] w-[0.35rem]" style={{ borderTop: "2px solid " + T.corner, borderLeft: "2px solid " + T.corner, opacity: hover && active ? 1 : 0.55, transition: "opacity 200ms" }} />
        <span className="pointer-events-none absolute bottom-0 right-0 h-[0.35rem] w-[0.35rem]" style={{ borderBottom: "2px solid " + T.corner, borderRight: "2px solid " + T.corner, opacity: hover && active ? 1 : 0.55, transition: "opacity 200ms" }} />

        {children != null && children !== false ? (
          <span className="absolute inset-[14%] flex items-center justify-center">
            <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + (hover && active ? T.textHot : T.text)}>
              {children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}