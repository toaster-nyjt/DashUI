type ActionButtonProps = { onPress: () => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ActionButton_MIN = {"base":[3.5,2]};

export function ActionButton(props: ActionButtonProps) {
  const { onPress, disabled, tone, children } = props;
  const t = tone || 'neutral';
  const uid = useRef("actionbutton-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);

  const skin =
    t === 'accent'
      ? {
          fill: "linear-gradient(90deg,rgba(34,211,238,0.95),rgba(165,243,252,0.9))",
          idleFill: "linear-gradient(90deg,rgba(34,211,238,0.9),rgba(165,243,252,0.85))",
          text: "text-black",
          edge: "rgba(34,211,238,0.9)",
          glow: "rgba(34,211,238,0.75)",
          scan: "rgba(0,0,0,0.25)"
        }
      : t === 'danger'
      ? {
          fill: "linear-gradient(90deg,rgba(244,63,94,0.95),rgba(220,38,38,0.95))",
          idleFill: "linear-gradient(90deg,rgba(244,63,94,0.85),rgba(190,18,60,0.85))",
          text: "text-white",
          edge: "rgba(251,113,133,0.7)",
          glow: "rgba(244,63,94,0.7)",
          scan: "rgba(255,255,255,0.18)"
        }
      : {
          fill: "linear-gradient(90deg,rgba(34,211,238,0.22),rgba(15,23,26,0.9))",
          idleFill: "linear-gradient(180deg,rgba(38,38,38,0.85),rgba(10,10,10,0.9))",
          text: "text-cyan-200",
          edge: "rgba(34,211,238,0.45)",
          glow: "rgba(34,211,238,0.45)",
          scan: "rgba(34,211,238,0.25)"
        };

  const active = !disabled && hover;
  const clip = "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))";

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: ActionButton_MIN.base[0] + "rem", minHeight: ActionButton_MIN.base[1] + "rem" }}
    >
      <button
        type="button"
        disabled={!!disabled}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPress(false); }}
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
        onPointerUp={() => { if (!press) return; setPress(false); }}
        onPointerCancel={() => setPress(false)}
        onClick={() => { if (disabled) return; setFlash(flash + 1); onPress(); }}
        className={
          "relative block h-full w-full touch-none select-none overflow-hidden border font-mono transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (disabled ? "cursor-not-allowed opacity-40 grayscale " : "cursor-pointer ")
        }
        style={{
          clipPath: clip,
          borderColor: skin.edge,
          background: active || press ? skin.fill : skin.idleFill,
          transform: press ? "scale(0.965)" : active ? "scale(1.012)" : "scale(1)",
          filter: press ? "brightness(1.2)" : active ? "brightness(1.1)" : "none",
          boxShadow: disabled
            ? "none"
            : (active || press
                ? "0 0 18px " + skin.glow + ", inset 0 0 14px rgba(0,0,0,0.5)"
                : "inset 0 0 12px rgba(0,0,0,0.8)")
        }}
      >
        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, " + skin.scan + " 0px, " + skin.scan + " 1px, transparent 1px, transparent 4px)"
          }}
        />
        {/* top edge accent */}
        <span
          className="pointer-events-none absolute left-0 right-0 top-0 transition-all duration-200"
          style={{ height: "2px", background: skin.edge, opacity: active || press ? 1 : 0.5 }}
        />
        {/* sweep on hover */}
        <span
          className="pointer-events-none absolute inset-y-0 transition-all duration-500 ease-out"
          style={{
            width: "40%",
            left: active ? "100%" : "-45%",
            background: "linear-gradient(90deg,transparent," + (t === 'neutral' ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.35)") + ",transparent)",
            transform: "skewX(-18deg)"
          }}
        />
        {/* press flash ring */}
        <span
          key={"flash-" + flash}
          className={"pointer-events-none absolute inset-0 " + (flash > 0 ? "animate-ping" : "")}
          style={{
            animationIterationCount: 1 as any,
            animationDuration: "500ms",
            boxShadow: flash > 0 ? "inset 0 0 0 2px " + skin.edge : "none",
            opacity: flash > 0 ? 0.8 : 0
          }}
        />
        {/* corner notch marks */}
        <span
          className="pointer-events-none absolute transition-opacity duration-200"
          style={{
            right: 0, top: 0, width: "0.6rem", height: "0.6rem",
            background: skin.edge, opacity: active || press ? 0.9 : 0.35,
            clipPath: "polygon(100% 0, 0 0, 100% 100%)"
          }}
        />
        {children != null && children !== false ? (
          <span className="absolute inset-[14%] block">
            <FitText className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + (t === 'neutral' && (active || press) ? "text-cyan-100" : skin.text)}>
              {children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}