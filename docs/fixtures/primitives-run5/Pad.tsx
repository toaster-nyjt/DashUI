type PadProps = { onPress: () => void; active?: boolean; children?: React.ReactNode };
export function Pad(props: PadProps) {
  const { onPress, active, children } = props;
  const uid = useRef("pad-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleSeq = useRef(0);

  const spawnRipple = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const id = rippleSeq.current++;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 620);
  };

  const handleDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setPressed(true);
    spawnRipple(e);
    onPress();
  };

  const handleUp = () => {
    setPressed(false);
  };

  const baseBorder = active
    ? "border-amber-400/60"
    : "border-amber-400/25";
  const baseBg = active
    ? "bg-amber-500/20"
    : "bg-stone-950/70";
  const glow = active
    ? "shadow-lg shadow-amber-500/40"
    : "shadow-md shadow-black/40";
  const pressGlow = pressed ? "shadow-lg shadow-amber-500/60" : "";
  const contentColor = active ? "text-amber-200" : "text-stone-300";

  return (
    <div className="relative h-full w-full min-w-0 min-h-0">
      <button
        type="button"
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onPointerLeave={handleUp}
        className={
          "group relative h-full w-full min-w-0 min-h-0 overflow-hidden select-none touch-none rounded-md border-2 outline-none transition-all duration-200 ease-out " +
          baseBg + " " + baseBorder + " " + glow + " " + pressGlow + " " +
          "hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-px active:translate-y-0 active:scale-95 active:brightness-95"
        }
      >
        {/* Inner sheen */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute inset-0 rounded-md transition-opacity duration-300 ease-out bg-gradient-to-b " +
            (active
              ? "from-amber-400/20 via-transparent to-black/50 opacity-100"
              : "from-amber-500/5 via-transparent to-black/40 opacity-80")
          }
        />

        {/* Recessed inner ring for tactile depth */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[6%] rounded-[6px] ring-1 ring-inset ring-stone-800/60 shadow-inner shadow-black/70"
        />

        {/* Active state animated corner accents */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute left-[8%] top-[8%] h-[14%] w-[14%] rounded-tl-[4px] border-l-2 border-t-2 transition-all duration-300 ease-out " +
            (active ? "border-amber-300/80 opacity-100" : "border-amber-400/0 opacity-0")
          }
        />
        <span
          aria-hidden
          className={
            "pointer-events-none absolute right-[8%] bottom-[8%] h-[14%] w-[14%] rounded-br-[4px] border-r-2 border-b-2 transition-all duration-300 ease-out " +
            (active ? "border-amber-300/80 opacity-100" : "border-amber-400/0 opacity-0")
          }
        />

        {/* Active lit pulse glow overlay */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute inset-0 rounded-md transition-opacity duration-300 ease-out " +
            (active ? "opacity-100 animate-pulse" : "opacity-0")
          }
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(251,191,36,0.18), rgba(251,191,36,0) 70%)",
          }}
        />

        {/* Ripples on press */}
        {ripples.map((r) => (
          <span
            key={"rip-" + r.id}
            aria-hidden
            className="pointer-events-none absolute rounded-full"
            style={{
              left: r.x + "%",
              top: r.y + "%",
              width: "12%",
              height: "12%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(251,191,36,0.55), rgba(251,191,36,0) 70%)",
              animation: "padripple-" + uid + " 0.62s ease-out forwards",
            }}
          />
        ))}

        {/* Face content */}
        <span className="pointer-events-none absolute inset-[16%] flex items-center justify-center">
          {children != null && children !== false && children !== "" ? (
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                contentColor
              }
            >
              {children}
            </FitText>
          ) : null}
        </span>

        {/* Bottom light bar indicating armed state */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute left-[16%] right-[16%] bottom-[7%] h-[3%] rounded-full transition-all duration-300 ease-out " +
            (active
              ? "bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
              : "bg-stone-700/50")
          }
        />

        <style>
          {"@keyframes padripple-" + uid + " { 0% { opacity: 0.9; width: 8%; height: 8%; } 100% { opacity: 0; width: 160%; height: 160%; } }"}
        </style>
      </button>
    </div>
  );
}