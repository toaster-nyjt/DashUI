type ButtonProps = { onPress: () => void; children?: React.ReactNode };
export function Button(props: ButtonProps) {
  const uid = useRef("button-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
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
    setRipples((r) => [...r, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 520);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    setPressed(true);
    spawnRipple(e.clientX, e.clientY);
    try {
      (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const release = () => {
    if (pressed) {
      setPressed(false);
      props.onPress();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
    release();
  };

  const handlePointerCancel = () => {
    setPressed(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!pressed) setPressed(true);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      release();
    }
  };

  return (
    <button
      ref={rootRef}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={
        "group relative h-full w-full min-w-0 min-h-0 select-none touch-none overflow-hidden rounded-lg border outline-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
        (pressed
          ? "border-amber-400/60 bg-amber-500 translate-y-0 scale-[0.97] shadow-[0_0_18px_-2px] shadow-amber-500/70"
          : hovered
          ? "border-amber-400/50 bg-neutral-800 -translate-y-px shadow-[0_0_14px_-2px] shadow-amber-500/50"
          : "border-neutral-600/50 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-md shadow-black/40")
      }
    >
      {/* Top metal sheen */}
      <span
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg transition-opacity duration-200 " +
          (pressed
            ? "opacity-0"
            : "opacity-100 bg-gradient-to-b from-white/[0.10] to-transparent")
        }
      />

      {/* Ambient inner glow when active */}
      <span
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200 " +
          (pressed
            ? "opacity-100 bg-[radial-gradient(120%_120%_at_50%_50%,rgba(255,213,128,0.35)_0%,rgba(255,193,7,0)_70%)]"
            : "opacity-0")
        }
      />

      {/* Ripples */}
      {ripples.map((r) => (
        <span
          key={"rip-" + r.id}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x + "%",
            top: r.y + "%",
            width: "8%",
            height: "8%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(255,224,150,0.55) 0%, rgba(255,193,7,0) 70%)",
            animation: "btnRipple-" + uid + " 520ms ease-out forwards",
          }}
        />
      ))}

      {/* Accent underline strip */}
      <span
        aria-hidden="true"
        className={
          "pointer-events-none absolute inset-x-[14%] bottom-[6%] h-[3%] min-h-[1px] rounded-full transition-all duration-200 " +
          (pressed
            ? "bg-neutral-950/50 opacity-90"
            : hovered
            ? "bg-amber-400/70 opacity-90"
            : "bg-amber-400/25 opacity-60")
        }
      />

      {/* Face content */}
      {hasContent ? (
        <span className="absolute inset-[14%] flex items-center justify-center min-w-0 min-h-0">
          <FitText
            wrap
            className={
              "font-semibold uppercase tracking-widest text-center transition-colors duration-200 " +
              (pressed
                ? "text-neutral-950"
                : hovered
                ? "text-amber-200"
                : "text-neutral-200")
            }
          >
            {props.children}
          </FitText>
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <span
            className={
              "block rounded-full transition-all duration-200 " +
              (pressed
                ? "bg-neutral-950/70 shadow-[0_0_10px_1px_rgba(0,0,0,0.4)]"
                : hovered
                ? "bg-amber-300 shadow-[0_0_12px_1px] shadow-amber-400/70"
                : "bg-amber-400/70 shadow-[0_0_8px_0px] shadow-amber-500/40")
            }
            style={{ width: "18%", height: "18%", maxWidth: "14px", maxHeight: "14px" }}
          />
        </span>
      )}

      <style>
        {"@keyframes btnRipple-" +
          uid +
          " { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; } 100% { transform: translate(-50%, -50%) scale(14); opacity: 0; } }"}
      </style>
    </button>
  );
}