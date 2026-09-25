type ButtonProps = { onPress: () => void; children?: React.ReactNode };
export const Button_MIN = { "base": [2.5, 1.75] };
export function Button(props: ButtonProps) {
  const { onPress, children } = props;
  const uid = useRef("button-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleSeq = useRef(0);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const floor = (Button_MIN as any).base;
  const hasContent = children !== undefined && children !== null && children !== false;

  const spawnRipple = (clientX: number, clientY: number) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = rect.width > 0 ? ((clientX - rect.left) / rect.width) * 100 : 50;
    const y = rect.height > 0 ? ((clientY - rect.top) / rect.height) * 100 : 50;
    const id = rippleSeq.current++;
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 620);
  };

  const handleDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    setPressed(true);
    spawnRipple(e.clientX, e.clientY);
    try {
      (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const handleUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pressed) {
      setPressed(false);
      onPress();
    }
  };

  const handleLeave = () => {
    setPressed(false);
  };

  return (
    <button
      ref={btnRef}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerLeave={handleLeave}
      onPointerCancel={handleLeave}
      className={
        "group relative h-full w-full select-none touch-none overflow-hidden rounded-lg border transition-all duration-200 ease-out " +
        (pressed
          ? "border-amber-400/70 bg-amber-400 shadow-lg shadow-amber-500/40 scale-95 brightness-95"
          : "border-amber-500/25 bg-neutral-900/90 shadow-md shadow-black/40 hover:border-amber-400/60 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-px active:translate-y-0")
      }
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* Recessed sheen layer */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-b transition-opacity duration-200 ease-out " +
          (pressed
            ? "from-amber-300/30 to-amber-600/10 opacity-100"
            : "from-stone-700/25 to-neutral-950/40 opacity-100 group-hover:from-amber-300/30 group-hover:to-amber-600/10")
        }
      />

      {/* Top edge highlight glint */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-x-2 top-0 h-px rounded-full transition-all duration-200 ease-out " +
          (pressed ? "bg-amber-200/50" : "bg-stone-500/30 group-hover:bg-amber-200/50")
        }
      />

      {/* Left accent bar that lights up */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-y-[18%] left-[6%] w-[3px] rounded-full transition-all duration-200 ease-out " +
          (pressed
            ? "bg-neutral-950/80 shadow-none"
            : "bg-amber-500/40 shadow-[0_0_6px_0_rgba(245,158,11,0.5)] group-hover:bg-neutral-950/70 group-hover:shadow-none")
        }
      />

      {/* Ripple bursts */}
      {ripples.map((r) => (
        <span
          key={"ripple-" + r.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x + "%",
            top: r.y + "%",
            width: "10%",
            height: "10%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(253,230,138,0.55) 0%, rgba(251,191,36,0.25) 45%, rgba(251,191,36,0) 70%)",
            animation: "btnRipple-" + uid + " 600ms ease-out forwards",
          }}
        />
      ))}

      {/* Face content */}
      {hasContent ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="absolute inset-[16%] flex items-center justify-center">
            <FitText
              wrap={false}
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (pressed
                  ? "text-neutral-950"
                  : "text-stone-300 group-hover:text-neutral-950")
              }
            >
              {children}
            </FitText>
          </span>
        </span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className={
              "block rounded-full transition-all duration-200 ease-out " +
              (pressed
                ? "bg-neutral-950/80 shadow-none"
                : "bg-amber-400/70 shadow-[0_0_8px_1px_rgba(251,191,36,0.5)] group-hover:bg-neutral-950/70 group-hover:shadow-none")
            }
            style={{ width: "26%", height: "26%" }}
          />
        </span>
      )}

      {/* Bottom inner shadow for depth */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-lg bg-gradient-to-t from-black/40 to-transparent"
      />

      <style>
        {"@keyframes btnRipple-" +
          uid +
          " { 0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.4); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(9); } }"}
      </style>
    </button>
  );
}