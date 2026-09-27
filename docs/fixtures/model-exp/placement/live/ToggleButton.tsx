type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; disabled?: boolean; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const ToggleButton_MIN = {"base":[4.5,2]};

export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, disabled, tone = 'neutral', children } = props;
  const uid = useRef("togglebutton-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const [hover, setHover] = useState(false);
  const [flash, setFlash] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setFlash((f) => f + 1);
    const t = setTimeout(() => setFlash(0), 420);
    return () => clearTimeout(t);
  }, [on]);

  const TONE: any = {
    neutral: { c: "34,211,238", fill: "rgba(6,182,212,0.22)", border: "rgba(34,211,238,0.85)", text: "text-cyan-100", offText: "text-cyan-300/70" },
    accent: { c: "253,224,71", fill: "rgba(253,224,71,0.92)", border: "rgba(253,224,71,0.9)", text: "text-black", offText: "text-yellow-200/75" },
    danger: { c: "239,68,68", fill: "rgba(239,68,68,0.28)", border: "rgba(248,113,113,0.9)", text: "text-red-200", offText: "text-red-400/70" }
  };
  const T = TONE[tone] || TONE.neutral;
  const active = !disabled && on;
  const glowStrength = disabled ? 0 : on ? (hover ? 0.75 : 0.55) : hover ? 0.3 : 0.12;

  return (
    <div
      className={"relative h-full w-full select-none " + (disabled ? "opacity-40 grayscale" : "cursor-pointer")}
      style={{ minWidth: ToggleButton_MIN.base[0] + "rem", minHeight: ToggleButton_MIN.base[1] + "rem", touchAction: "manipulation" }}
      onPointerEnter={() => !disabled && setHover(true)}
      onPointerLeave={() => { setHover(false); setPress(false); }}
      onPointerDown={(e) => { if (disabled) return; (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPress(true); }}
      onPointerUp={(e) => { if (disabled) return; if (press) onChange(!on); setPress(false); }}
      onPointerCancel={() => setPress(false)}
      role="button"
      aria-pressed={on}
    >
      <div
        className="absolute inset-0 transition-all duration-200 ease-out overflow-hidden"
        style={{
          transform: press ? "translateY(1px) scale(0.985)" : hover && !disabled ? "translateY(-1px)" : "none",
          filter: press ? "brightness(0.9)" : "none"
        }}
      >
        {/* clipped angled body */}
        <div
          className="absolute inset-0 transition-all duration-200 ease-out"
          style={{
            clipPath: "polygon(0 0, calc(100% - 0.6rem) 0, 100% 0.6rem, 100% 100%, 0.6rem 100%, 0 calc(100% - 0.6rem))",
            background: on
              ? (tone === "accent"
                ? "linear-gradient(135deg,rgba(253,224,71,1) 0%,rgba(250,204,21,0.85) 100%)"
                : "linear-gradient(135deg,rgba(" + T.c + ",0.34) 0%,rgba(" + T.c + ",0.14) 100%)")
              : "linear-gradient(135deg,rgba(21,15,40,0.9) 0%,rgba(10,10,20,0.95) 100%)",
            boxShadow: (on ? "0 0 " + (14 + glowStrength * 22) + "px rgba(" + T.c + "," + glowStrength + ")" : "inset 0 2px 8px rgba(0,0,0,0.8)")
          }}
        />
        {/* border */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-200 ease-out"
          style={{
            clipPath: "polygon(0 0, calc(100% - 0.6rem) 0, 100% 0.6rem, 100% 100%, 0.6rem 100%, 0 calc(100% - 0.6rem))",
            background: "linear-gradient(135deg,rgba(" + T.c + "," + (on ? 0.95 : hover ? 0.55 : 0.32) + ") 0%,rgba(217,70,239," + (on ? 0.5 : 0.18) + ") 100%)",
            WebkitMask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "1px"
          }}
        />
        {/* scanline texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ background: "repeating-linear-gradient(0deg,rgba(0,0,0,0.35) 0px,rgba(0,0,0,0.35) 1px,transparent 1px,transparent 3px)" }}
        />
        {/* sweep on state change */}
        {flash > 0 ? (
          <div
            key={"fl-" + flash + uid}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(100deg,transparent 30%,rgba(255,255,255,0.35) 50%,transparent 70%)",
              animation: "none",
              transform: "translateX(0%)",
              WebkitMaskImage: "linear-gradient(#000,#000)",
              opacity: 0.9,
              transition: "opacity 400ms ease-out"
            }}
          />
        ) : null}
        {/* status rail */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 ease-out"
          style={{ background: on ? "rgba(" + T.c + ",1)" : "rgba(" + T.c + ",0.25)", boxShadow: on ? "0 0 10px rgba(" + T.c + ",0.9)" : "none" }} />
        {/* face */}
        <div className="absolute inset-y-0 left-[3px] right-0 flex items-center">
          <div className="relative flex-1 min-w-0 h-full flex items-center">
            <div className="absolute inset-[16%] left-[10%] right-[10%]">
              {children != null ? (
                <FitText className={"font-mono font-bold tracking-[0.15em] uppercase transition-colors duration-200 " + (on ? (tone === "accent" ? "text-black" : T.text + " drop-shadow-[0_0_6px_currentColor]") : "text-slate-400")}>
                  {children}
                </FitText>
              ) : null}
            </div>
          </div>
        </div>
        {/* indicator dot */}
        <div className="absolute right-[0.35rem] top-[0.3rem] flex items-center gap-[2px]">
          <span
            className={"block rounded-full transition-all duration-300 " + (on ? "animate-pulse" : "")}
            style={{
              width: "0.3rem", height: "0.3rem",
              background: on ? (tone === "accent" ? "rgba(0,0,0,0.75)" : "rgba(" + T.c + ",1)") : "rgba(100,116,139,0.5)",
              boxShadow: on && tone !== "accent" ? "0 0 8px rgba(" + T.c + ",0.9)" : "none"
            }}
          />
        </div>
        {/* corner notch accent */}
        <div className="absolute right-0 top-0" style={{ width: "0.6rem", height: "0.6rem", background: "linear-gradient(225deg,rgba(" + T.c + "," + (on ? 0.8 : 0.25) + ") 0%,transparent 60%)" }} />
      </div>
    </div>
  );
}