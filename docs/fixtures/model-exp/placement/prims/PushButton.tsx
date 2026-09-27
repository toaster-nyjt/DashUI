type PushButtonProps = { children?: React.ReactNode; onPress: () => void; disabled?: boolean; tone?: "neutral" | "accent" | "danger" };

export const PushButton_MIN = {"base":[2.75,1.75]};

export function PushButton(props: PushButtonProps) {
  const tone = props.tone ?? "neutral";
  const disabled = !!props.disabled;
  const uid = useRef("pushbutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);
  const tRef = useRef<any>(null);

  useEffect(() => () => { if (tRef.current) clearTimeout(tRef.current); }, []);

  const T = (function () {
    if (tone === "accent") return {
      face: "linear-gradient(160deg,rgba(253,224,71,0.30) 0%,rgba(253,224,71,0.10) 45%,rgba(10,10,20,0.9) 100%)",
      edge: "rgba(253,224,71,0.75)",
      glow: "rgba(253,224,71,0.55)",
      bar: "#fde047",
      text: "text-yellow-200",
      rgb: "253,224,71"
    };
    if (tone === "danger") return {
      face: "linear-gradient(160deg,rgba(239,68,68,0.28) 0%,rgba(239,68,68,0.08) 45%,rgba(12,6,10,0.92) 100%)",
      edge: "rgba(248,113,113,0.7)",
      glow: "rgba(239,68,68,0.5)",
      bar: "#ef4444",
      text: "text-red-300",
      rgb: "239,68,68"
    };
    return {
      face: "linear-gradient(160deg,rgba(34,211,238,0.22) 0%,rgba(34,211,238,0.06) 45%,rgba(8,10,20,0.92) 100%)",
      edge: "rgba(34,211,238,0.55)",
      glow: "rgba(34,211,238,0.45)",
      bar: "#22d3ee",
      text: "text-cyan-100",
      rgb: "34,211,238"
    };
  })();

  const clip = "polygon(0 22%, 9% 0, 100% 0, 100% 78%, 91% 100%, 0 100%)";

  const fire = () => {
    if (disabled) return;
    setFlash((f) => f + 1);
    if (tRef.current) clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setFlash(0), 260);
    props.onPress();
  };

  const lit = !disabled && (hover || pressed);

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: PushButton_MIN.base[0] + "rem", minHeight: PushButton_MIN.base[1] + "rem" }}
    >
      {/* outer glow halo */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-200 ease-out"
        style={{
          clipPath: clip,
          boxShadow: disabled ? "none" : (pressed ? "0 0 22px " + T.glow : lit ? "0 0 16px " + T.glow : "0 0 6px rgba(" + T.rgb + ",0.18)"),
          background: "transparent"
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPressed(true); fire(); }}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => { setHover(false); setPressed(false); }}
        className={"absolute inset-0 touch-none overflow-hidden outline-none transition-all duration-200 ease-out " + (disabled ? "opacity-40 grayscale cursor-default" : "cursor-pointer")}
        style={{
          clipPath: clip,
          background: T.face,
          transform: pressed ? "translateY(1px) scale(0.975)" : lit ? "translateY(-1px)" : "none",
          filter: pressed ? "brightness(1.25)" : "none"
        }}
      >
        {/* inset base */}
        <span className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 2px 10px rgba(0,0,0,0.85), inset 0 0 0 1px " + (lit ? T.edge : "rgba(" + T.rgb + ",0.3)") }} />

        {/* scanlines */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.22] transition-opacity duration-200"
          style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 3px)" }}
        />

        {/* corner bevel accents */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={uid + "-sweep"} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={T.bar} stopOpacity="0" />
              <stop offset="50%" stopColor={T.bar} stopOpacity="0.85" />
              <stop offset="100%" stopColor={T.bar} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 22 L9 0" stroke={T.bar} strokeOpacity={lit ? 0.95 : 0.4} strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" />
          <path d="M100 78 L91 100" stroke={T.bar} strokeOpacity={lit ? 0.95 : 0.4} strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" />
          <rect x="0" y="0" width="100" height="3" fill={"url(#" + uid + "-sweep)"} opacity={lit ? 0.9 : 0} style={{ transition: "opacity 200ms ease-out" }} />
        </svg>

        {/* left energy bar */}
        <span
          className="pointer-events-none absolute left-0 top-0 h-full transition-all duration-200 ease-out"
          style={{ width: pressed ? "0.34rem" : lit ? "0.24rem" : "0.14rem", background: T.bar, opacity: disabled ? 0.5 : 0.9, boxShadow: lit ? "0 0 10px " + T.glow : "none" }}
        />

        {/* press flash */}
        {flash > 0 && (
          <span
            key={"flash-" + flash}
            className="pointer-events-none absolute inset-0"
            style={{
              background: "linear-gradient(120deg, rgba(" + T.rgb + ",0.55) 0%, rgba(255,255,255,0.35) 45%, rgba(" + T.rgb + ",0) 75%)",
              animation: "pushbtnflash-" + uid + " 260ms ease-out forwards"
            }}
          />
        )}

        {/* face content */}
        {props.children !== undefined && props.children !== null && props.children !== false && (
          <span className="absolute inset-[16%] flex items-center justify-center">
            <FitText
              className={"font-mono font-bold tracking-[0.15em] uppercase transition-all duration-200 ease-out " + (disabled ? "text-slate-500" : T.text)}
            >
              {props.children}
            </FitText>
          </span>
        )}

        <style>{"@keyframes pushbtnflash-" + uid + "{0%{opacity:.95;transform:translateX(-18%) skewX(-12deg)}100%{opacity:0;transform:translateX(18%) skewX(-12deg)}}"}</style>
      </button>
    </div>
  );
}