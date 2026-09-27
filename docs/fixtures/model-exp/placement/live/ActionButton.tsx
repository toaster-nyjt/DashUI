type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: "neutral" | "accent" | "danger"; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[2.5,1.75]};

export function ActionButton(props: ActionButtonProps) {
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";
  const disabled = !!props.disabled;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);

  const T: any = {
    neutral: {
      face: "bg-[linear-gradient(135deg,rgba(21,15,40,0.95)_0%,rgba(10,10,20,0.98)_100%)]",
      border: "border-cyan-500/40",
      borderHot: "border-cyan-400/80",
      text: "text-cyan-100",
      glow: "0 0 16px rgba(34,211,238,0.45)",
      stroke: "rgba(34,211,238,0.9)",
      wash: "rgba(34,211,238,0.18)",
    },
    accent: {
      face: "bg-[linear-gradient(135deg,rgba(253,224,71,0.18)_0%,rgba(40,32,4,0.95)_100%)]",
      border: "border-yellow-300/50",
      borderHot: "border-yellow-300",
      text: "text-yellow-300",
      glow: "0 0 18px rgba(253,224,71,0.6)",
      stroke: "rgba(253,224,71,0.95)",
      wash: "rgba(253,224,71,0.22)",
    },
    danger: {
      face: "bg-[linear-gradient(135deg,rgba(239,68,68,0.18)_0%,rgba(35,8,10,0.96)_100%)]",
      border: "border-red-500/50",
      borderHot: "border-red-400",
      text: "text-red-400",
      glow: "0 0 18px rgba(239,68,68,0.55)",
      stroke: "rgba(248,113,113,0.95)",
      wash: "rgba(239,68,68,0.22)",
    },
  };
  const t = T[tone];
  const clip = "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))";

  const fire = () => {
    if (disabled) return;
    setFlash((f) => f + 1);
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
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={() => { if (press) fire(); setPress(false); }}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        className={
          "absolute inset-0 touch-none overflow-hidden border transition-all duration-200 ease-out " +
          t.face + " " +
          (disabled ? "border-slate-700/50 opacity-40 grayscale cursor-default" : (hover ? t.borderHot + " cursor-pointer" : t.border + " cursor-pointer"))
        }
        style={{
          clipPath: clip,
          boxShadow: disabled ? "none" : (press ? "inset 0 2px 10px rgba(0,0,0,0.85), " + t.glow : (hover ? t.glow : "inset 0 1px 6px rgba(0,0,0,0.6)")),
          transform: disabled ? "none" : (press ? "translateY(1px) scale(0.985)" : (hover ? "translateY(-1px)" : "none")),
          filter: press ? "brightness(0.92)" : "none",
        }}
      >
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, transparent 1px, transparent 3px)" }}
        />
        {/* hover wash sweep */}
        <span
          className="pointer-events-none absolute inset-y-0 transition-all duration-500 ease-out"
          style={{
            left: disabled ? "-60%" : (hover ? "0%" : "-60%"),
            width: "60%",
            background: "linear-gradient(90deg, transparent 0%, " + t.wash + " 50%, transparent 100%)",
            opacity: hover && !disabled ? 1 : 0,
          }}
        />
        {/* corner bracket accents */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={t.stroke} stopOpacity="0.9" />
              <stop offset="100%" stopColor={t.stroke} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M0 0 H16" stroke={"url(#" + uid + "-edge)"} strokeWidth="3" vectorEffect="non-scaling-stroke" fill="none" opacity={disabled ? 0.3 : 1} />
          <path d="M100 100 H84" stroke={"url(#" + uid + "-edge)"} strokeWidth="3" vectorEffect="non-scaling-stroke" fill="none" opacity={disabled ? 0.3 : 0.7} />
        </svg>
        {/* left active edge */}
        <span
          className="pointer-events-none absolute left-0 top-0 bottom-0 transition-all duration-200 ease-out"
          style={{ width: press ? "0.22rem" : hover ? "0.16rem" : "0.08rem", background: t.stroke, opacity: disabled ? 0.25 : press ? 1 : 0.75, boxShadow: disabled ? "none" : "0 0 8px " + t.stroke }}
        />
        {/* press flash */}
        {flash > 0 && (
          <span
            key={"f" + flash}
            className="pointer-events-none absolute inset-0 animate-ping"
            style={{ background: t.wash, animationDuration: "500ms", animationIterationCount: 1 }}
          />
        )}
        {props.children !== undefined && props.children !== null && props.children !== "" ? (
          <span className="absolute inset-[14%] flex items-center justify-center">
            <FitText
              className={
                "font-mono font-bold tracking-[0.15em] uppercase transition-all duration-200 ease-out " +
                (disabled ? "text-slate-500" : t.text + " " + (hover || press ? "drop-shadow-[0_0_8px_currentColor]" : ""))
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