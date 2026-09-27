type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[4,2]};

export function ActionButton(props: ActionButtonProps) {
  const tone = props.tone || 'neutral';
  const disabled = !!props.disabled;
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);

  const T = {
    neutral: {
      base: "bg-neutral-800/80",
      border: "border-cyan-300/40",
      hoverBorder: "border-cyan-200",
      text: "text-cyan-200",
      hoverText: "text-black",
      hoverBg: "bg-cyan-300",
      glow: "0 0 16px rgba(34,211,238,0.5)",
      rgb: "34,211,238",
      sweep: "rgba(34,211,238,0.55)"
    },
    accent: {
      base: "bg-gradient-to-r from-cyan-400 to-cyan-300",
      border: "border-transparent",
      hoverBorder: "border-transparent",
      text: "text-black",
      hoverText: "text-black",
      hoverBg: "",
      glow: "0 0 20px rgba(34,211,238,0.7)",
      rgb: "34,211,238",
      sweep: "rgba(255,255,255,0.6)"
    },
    danger: {
      base: "bg-gradient-to-r from-rose-500 to-red-600",
      border: "border-rose-400/50",
      hoverBorder: "border-rose-300",
      text: "text-white",
      hoverText: "text-white",
      hoverBg: "",
      glow: "0 0 16px rgba(244,63,94,0.6)",
      rgb: "244,63,94",
      sweep: "rgba(255,255,255,0.5)"
    }
  }[tone];

  const fire = () => {
    if (disabled) return;
    setFlash((f) => f + 1);
    props.onPress();
  };

  const active = !disabled && hover;
  const faceText =
    disabled ? "text-neutral-500"
      : tone === 'neutral' ? (active ? "text-black" : "text-cyan-200")
      : T.text;

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: ActionButton_MIN.base[0] + "rem", minHeight: ActionButton_MIN.base[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-sweep{0%{transform:translateX(-120%) skewX(-20deg);opacity:0}30%{opacity:1}100%{transform:translateX(220%) skewX(-20deg);opacity:0}}@keyframes " + uid + "-ring{0%{transform:scale(0.92);opacity:0.75}100%{transform:scale(1.12);opacity:0}}"}</style>

      <button
        type="button"
        disabled={disabled}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={() => setPress(false)}
        onPointerCancel={() => setPress(false)}
        onClick={fire}
        className={
          "group absolute inset-0 touch-none overflow-hidden border rounded-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          T.base + " " +
          (disabled
            ? "opacity-40 grayscale cursor-not-allowed " + T.border
            : "cursor-pointer " + (active ? T.hoverBorder : T.border) + " " +
              (tone === 'neutral' && active ? "bg-cyan-300 " : "") +
              (tone !== 'neutral' && active ? "brightness-125 " : ""))
        }
        style={{
          clipPath: "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))",
          boxShadow: disabled ? "none" : (active ? T.glow : "inset 0 0 12px rgba(0,0,0,0.6)"),
          transform: press && !disabled ? "scale(0.97)" : "scale(1)"
        }}
      >
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)" }}
        />
        {/* hover sweep */}
        {!disabled && active ? (
          <span
            key={"sweep-" + flash}
            className="pointer-events-none absolute inset-y-0 w-1/3"
            style={{
              background: "linear-gradient(90deg, transparent, " + T.sweep + ", transparent)",
              animation: uid + "-sweep 1.1s linear infinite"
            }}
          />
        ) : null}
        {/* press ring pulse on fire */}
        {flash > 0 && !disabled ? (
          <span
            key={"ring-" + flash}
            className="pointer-events-none absolute inset-0 border"
            style={{
              borderColor: "rgba(" + T.rgb + ",0.9)",
              animation: uid + "-ring 420ms ease-out forwards"
            }}
          />
        ) : null}
        {/* corner ticks */}
        <span className="pointer-events-none absolute left-0 top-0 h-[22%] w-[2px]" style={{ background: "rgba(" + T.rgb + ",0.8)" }} />
        <span className="pointer-events-none absolute right-0 bottom-0 h-[22%] w-[2px]" style={{ background: "rgba(" + T.rgb + ",0.8)" }} />

        {props.children != null ? (
          <span className="absolute inset-[14%] block">
            <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + faceText}>
              {props.children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}