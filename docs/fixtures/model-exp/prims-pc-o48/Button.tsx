type ButtonProps = { onPress: () => void; children?: React.ReactNode };
export const Button_MIN = { "base": [2, 1.5] };
export function Button(props: ButtonProps) {
  const { onPress, children } = props;

  const uid = useRef("button-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleSeq = useRef(0);
  const rootRef = useRef<HTMLButtonElement | null>(null);

  const spawnRipple = useCallback((clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const id = rippleSeq.current++;
    setRipples((r) => [...r.slice(-3), { id, x, y }]);
    setTimeout(() => {
      setRipples((r) => r.filter((rr) => rr.id !== id));
    }, 520);
  }, []);

  const handleDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button != null && e.button !== 0) return;
      setPressed(true);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
      spawnRipple(e.clientX, e.clientY);
    },
    [spawnRipple]
  );

  const handleUp = useCallback(() => {
    setPressed((was) => {
      if (was) onPress();
      return false;
    });
  }, [onPress]);

  const handleCancel = useCallback(() => {
    setPressed(false);
  }, []);

  const hasContent = children !== undefined && children !== null && children !== false;

  return (
    <button
      ref={rootRef}
      type="button"
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      onPointerLeave={() => setHovered(false)}
      onPointerEnter={() => setHovered(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setPressed(true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleUp();
        }
      }}
      style={{ minWidth: Button_MIN.base[0] + "rem", minHeight: Button_MIN.base[1] + "rem" }}
      className={
        "relative h-full w-full touch-none select-none overflow-hidden outline-none rounded-lg border cursor-pointer " +
        "transition-all duration-200 ease-out " +
        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/50 " +
        (pressed
          ? "border-amber-400/70 bg-amber-500 text-neutral-950 shadow-md shadow-black/40 scale-95 brightness-95 "
          : hovered
          ? "border-amber-400/60 bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/40 -translate-y-px "
          : "border-amber-500/25 bg-neutral-900/90 text-stone-200 shadow-md shadow-black/40 ")
      }
    >
      {/* Recessed metallic sheen base */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b transition-opacity duration-200 ease-out " +
          (pressed
            ? "from-amber-300/40 to-amber-600/50 opacity-100"
            : hovered
            ? "from-amber-200/40 to-amber-500/40 opacity-100"
            : "from-stone-700/30 to-neutral-950/50 opacity-100")
        }
      />

      {/* Top edge specular line (amber tint, never white) */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-x-1 top-0 h-px rounded-full transition-opacity duration-200 " +
          (pressed ? "bg-amber-200/50 opacity-70" : hovered ? "bg-amber-200/60 opacity-90" : "bg-amber-400/20 opacity-70")
        }
      />

      {/* Inner ring for tactile depth */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset transition-all duration-200 ease-out " +
          (pressed ? "ring-amber-300/50" : hovered ? "ring-amber-300/40" : "ring-stone-800/60")
        }
      />

      {/* Idle-state accent corner glints (subtle, keep it alive without content) */}
      {!hasContent && (
        <>
          <span
            aria-hidden
            className={
              "pointer-events-none absolute left-[14%] top-1/2 h-[42%] w-px -translate-y-1/2 rounded-full transition-all duration-300 ease-out " +
              (pressed || hovered ? "bg-neutral-950/60" : "bg-amber-400/40")
            }
          />
          <span
            aria-hidden
            className={
              "pointer-events-none absolute right-[14%] top-1/2 h-[42%] w-px -translate-y-1/2 rounded-full transition-all duration-300 ease-out " +
              (pressed || hovered ? "bg-neutral-950/60" : "bg-amber-400/40")
            }
          />
          <span
            aria-hidden
            className={
              "pointer-events-none absolute left-1/2 top-1/2 h-[30%] w-[30%] max-h-[0.55rem] max-w-[0.55rem] -translate-x-1/2 -translate-y-1/2 rounded-sm transition-all duration-300 ease-out " +
              (pressed
                ? "bg-neutral-950/70 scale-90"
                : hovered
                ? "bg-neutral-950/60 scale-105"
                : "bg-amber-400/50 scale-100")
            }
          />
        </>
      )}

      {/* Ripples from press point */}
      {ripples.map((r) => (
        <span
          key={uid + "-ripple-" + r.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full bg-amber-200/50"
          style={{
            left: r.x + "%",
            top: r.y + "%",
            width: "12%",
            height: "12%",
            transform: "translate(-50%, -50%)",
            animation: "none",
          }}
          ref={(node) => {
            if (node) {
              node.animate(
                [
                  { transform: "translate(-50%, -50%) scale(0.2)", opacity: 0.6 },
                  { transform: "translate(-50%, -50%) scale(14)", opacity: 0 },
                ],
                { duration: 520, easing: "ease-out", fill: "forwards" }
              );
            }
          }}
        />
      ))}

      {/* Face content */}
      {hasContent && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="absolute inset-[16%] flex items-center justify-center">
            <FitText
              wrap={false}
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (pressed || hovered ? "text-neutral-950" : "text-stone-200")
              }
            >
              {children}
            </FitText>
          </span>
        </span>
      )}

      {/* Bottom shadow lip for depth */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-x-1 bottom-0 h-px rounded-full transition-opacity duration-200 " +
          (pressed ? "bg-black/50 opacity-90" : "bg-black/60 opacity-80")
        }
      />
    </button>
  );
}