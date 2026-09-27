type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[4,2]};

export function ActionButton(props: ActionButtonProps) {
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || 'neutral';
  const disabled = !!props.disabled;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);

  const T: any = {
    neutral: {
      bg: "linear-gradient(160deg,rgba(38,38,38,0.95),rgba(10,10,10,0.95))",
      edge: "rgba(34,211,238,0.40)",
      edgeHot: "rgba(165,243,252,0.95)",
      glow: "rgba(34,211,238,0.55)",
      text: "text-cyan-200",
      sweep: "rgba(34,211,238,0.28)"
    },
    accent: {
      bg: "linear-gradient(120deg,rgba(34,211,238,1),rgba(103,232,249,1))",
      edge: "rgba(207,250,254,0.85)",
      edgeHot: "rgba(255,255,255,1)",
      glow: "rgba(34,211,238,0.85)",
      text: "text-black",
      sweep: "rgba(255,255,255,0.45)"
    },
    danger: {
      bg: "linear-gradient(120deg,rgba(244,63,94,1),rgba(190,18,60,1))",
      edge: "rgba(253,164,175,0.7)",
      edgeHot: "rgba(255,228,230,1)",
      glow: "rgba(244,63,94,0.75)",
      text: "text-white",
      sweep: "rgba(255,255,255,0.35)"
    }
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
        onPointerUp={() => { if (press) { setPress(false); fire(); } }}
        onPointerCancel={() => setPress(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPress(true); } }}
        onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setPress(false); fire(); } }}
        className={
          "absolute inset-0 touch-none overflow-hidden border-0 p-0 transition-all duration-200 ease-out focus-visible:outline-none " +
          (disabled ? "cursor-not-allowed opacity-40 grayscale" : "cursor-pointer")
        }
        style={{
          clipPath: clip,
          background: t.bg,
          transform: press && !disabled ? "scale(0.965)" : hover && !disabled ? "scale(1.012)" : "scale(1)",
          filter: !disabled && hover ? "brightness(1.18)" : "brightness(1)",
          boxShadow: disabled ? "none" : (hover || press ? "0 0 18px " + t.glow + ", inset 0 0 14px rgba(0,0,0,0.5)" : "inset 0 0 12px rgba(0,0,0,0.7)")
        }}
      >
        {/* inner edge frame */}
        <span
          className="pointer-events-none absolute inset-0 transition-all duration-200"
          style={{
            clipPath: clip,
            boxShadow: "inset 0 0 0 1px " + (hover && !disabled ? t.edgeHot : t.edge)
          }}
        />
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)" }}
        />
        {/* diagonal hatch on left rail */}
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-[0.35rem] transition-opacity duration-200"
          style={{
            opacity: disabled ? 0.3 : hover ? 1 : 0.6,
            backgroundImage: "repeating-linear-gradient(135deg," + t.edgeHot + " 0px," + t.edgeHot + " 1px, transparent 1px, transparent 4px)"
          }}
        />
        {/* sweep shine */}
        <span
          key={"sweep-" + flash}
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          style={{
            background: "linear-gradient(90deg, transparent, " + t.sweep + ", transparent)",
            animation: flash > 0 && !disabled ? "none" : undefined,
            transform: "translateX(" + (flash % 2 === 0 ? "0" : "0") + ")",
            ...(flash > 0 ? { animationName: uid + "-sweep", animationDuration: "520ms", animationTimingFunction: "ease-out", animationFillMode: "forwards" } : { opacity: 0 })
          }}
        />
        {/* press bloom */}
        {flash > 0 && !disabled ? (
          <span
            key={"bloom-" + flash}
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(circle at 50% 50%, " + t.glow + ", transparent 65%)",
              animationName: uid + "-bloom",
              animationDuration: "420ms",
              animationTimingFunction: "ease-out",
              animationFillMode: "forwards"
            }}
          />
        ) : null}
        {/* corner ticks */}
        <span className="pointer-events-none absolute right-0 top-0" style={{ width: "0.6rem", height: "0.6rem", background: "linear-gradient(225deg," + (hover && !disabled ? t.edgeHot : t.edge) + " 0 45%, transparent 46%)" }} />
        {/* face content */}
        {props.children != null ? (
          <span className="pointer-events-none absolute inset-[14%] left-[16%]">
            <FitText className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + (disabled ? "text-neutral-400" : t.text)}>
              {props.children}
            </FitText>
          </span>
        ) : null}
        <style>{
          "@keyframes " + uid + "-sweep{0%{opacity:0;transform:translateX(0)}15%{opacity:1}100%{opacity:0;transform:translateX(420%)}}" +
          "@keyframes " + uid + "-bloom{0%{opacity:0.85;transform:scale(0.85)}100%{opacity:0;transform:scale(1.15)}}"
        }</style>
      </button>
    </div>
  );
}