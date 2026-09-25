type ButtonProps = { onPress: () => void; children?: React.ReactNode };
export function Button(props: ButtonProps) {
  const uid = useRef("button-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const rootRef = useRef<HTMLButtonElement | null>(null);

  const hasContent = props.children !== undefined && props.children !== null && props.children !== false;

  const spawnRipple = (clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const id = rippleId.current++;
    setRipples((rs) => [...rs, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((rs) => rs.filter((r) => r.id !== id));
    }, 600);
  };

  return (
    <button
      ref={rootRef}
      type="button"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setPressed(true);
        spawnRipple(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (pressed) {
          setPressed(false);
          props.onPress();
        }
      }}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className={
        "group relative h-full w-full min-w-0 min-h-0 select-none touch-none overflow-hidden rounded-lg border outline-none transition-all duration-200 ease-out " +
        (pressed
          ? "border-amber-400/70 bg-gradient-to-b from-amber-500 to-amber-600 shadow-inner shadow-black/50 scale-95 brightness-95"
          : "border-amber-500/25 bg-gradient-to-b from-neutral-800/70 to-neutral-950/70 shadow-md shadow-black/40 hover:border-amber-400/60 hover:from-amber-500/25 hover:to-amber-600/10 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-px")
      }
    >
      {/* Top sheen highlight */}
      <span
        className={
          "pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-gradient-to-b transition-opacity duration-200 " +
          (pressed ? "from-amber-200/20 to-transparent opacity-40" : "from-stone-100/5 to-transparent opacity-100 group-hover:from-amber-200/15")
        }
      />

      {/* Inner accent ring on hover / press */}
      <span
        className={
          "pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset transition-all duration-200 " +
          (pressed ? "ring-amber-300/50" : "ring-transparent group-hover:ring-amber-400/40")
        }
      />

      {/* Corner glow accents */}
      <span
        className={
          "pointer-events-none absolute left-[6%] top-[14%] h-[8%] w-[8%] rounded-full bg-amber-400 blur-[2px] transition-all duration-300 " +
          (pressed ? "opacity-90 scale-125" : "opacity-0 group-hover:opacity-70")
        }
      />
      <span
        className={
          "pointer-events-none absolute right-[6%] bottom-[14%] h-[8%] w-[8%] rounded-full bg-amber-400 blur-[2px] transition-all duration-300 " +
          (pressed ? "opacity-90 scale-125" : "opacity-0 group-hover:opacity-70")
        }
      />

      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={"rip-" + r.id}
          className="pointer-events-none absolute rounded-full bg-amber-300/40"
          style={{
            left: r.x + "%",
            top: r.y + "%",
            width: "10%",
            height: "10%",
            transform: "translate(-50%, -50%) scale(0)",
            animation: uid + "-ripple 0.6s ease-out forwards",
          }}
        />
      ))}

      {/* Face content */}
      {hasContent ? (
        <span className="absolute inset-0 flex items-center justify-center px-[10%] py-[14%]">
          <span className="flex h-full w-full min-w-0 min-h-0 items-center justify-center">
            <FitText
              wrap={false}
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 " +
                (pressed ? "text-neutral-950" : "text-stone-200 group-hover:text-neutral-950")
              }
            >
              {props.children}
            </FitText>
          </span>
        </span>
      ) : (
        // Clean face: a subtle centered signal dot when there is no content
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={
              "rounded-full transition-all duration-200 " +
              (pressed ? "bg-neutral-950 shadow-none" : "bg-amber-400/70 shadow-sm shadow-amber-500/40 group-hover:bg-amber-300")
            }
            style={{ width: "16%", height: "16%" }}
          />
        </span>
      )}

      <style>{
        "@keyframes " + uid + "-ripple {" +
        "from { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }" +
        "to { transform: translate(-50%, -50%) scale(14); opacity: 0; }" +
        "}"
      }</style>
    </button>
  );
}