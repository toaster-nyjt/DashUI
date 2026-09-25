type ButtonProps = { onPress: () => void; children?: React.ReactNode };
export function Button(props: ButtonProps) {
  const { onPress, children } = props;

  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const rippleId = useRef(0);
  const rootRef = useRef<HTMLButtonElement | null>(null);
  const activePointer = useRef<number | null>(null);

  const hasContent =
    children !== undefined && children !== null && children !== false && children !== "";

  const spawnRipple = (clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * 100;
    const id = rippleId.current++;
    setRipples((r) => [...r, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 520);
  };

  const fire = () => {
    onPress();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== null) return;
    activePointer.current = e.pointerId;
    try {
      (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    } catch {}
    setPressed(true);
    spawnRipple(e.clientX, e.clientY);
    fire();
  };

  const release = () => {
    activePointer.current = null;
    setPressed(false);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== e.pointerId) return;
    try {
      (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
    } catch {}
    release();
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (activePointer.current !== e.pointerId) return;
    release();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.repeat) return;
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setPressed(true);
      fire();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setPressed(false);
    }
  };

  return (
    <button
      ref={rootRef}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={() => setHovered(false)}
      onPointerEnter={() => setHovered(true)}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => release()}
      className={
        "group relative h-full w-full min-w-0 min-h-0 select-none overflow-hidden rounded-lg border touch-none outline-none " +
        "transition-all duration-200 ease-out " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 " +
        "motion-reduce:transition-none " +
        (pressed
          ? "border-amber-400/50 bg-gradient-to-b from-amber-500 to-amber-600 translate-y-0 scale-[0.97] shadow-[inset_0_2px_6px_rgba(0,0,0,0.55)] "
          : "border-neutral-600/50 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-md shadow-black/40 " +
            "hover:-translate-y-px hover:border-amber-400/50 hover:from-neutral-650 hover:shadow-[0_0_14px_-2px] hover:shadow-amber-500/50 ")
      }
    >
      {/* Top bevel highlight */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg " +
          "bg-gradient-to-b transition-opacity duration-200 ease-out " +
          (pressed ? "from-white/10 to-transparent opacity-40" : "from-white/10 to-transparent opacity-70")
        }
      />

      {/* Ambient accent wash on hover */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200 ease-out " +
          "bg-[radial-gradient(120%_120%_at_50%_120%,rgba(245,158,11,0.28),transparent_70%)] " +
          (hovered && !pressed ? "opacity-100" : "opacity-0")
        }
      />

      {/* Pressed inner amber glow ring */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-150 ease-out " +
          "shadow-[inset_0_0_18px_-2px_rgba(245,158,11,0.9)] " +
          (pressed ? "opacity-100" : "opacity-0")
        }
      />

      {/* Ripples from each press point */}
      {ripples.map((r) => (
        <span
          key={"btn-ripple-" + r.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full motion-reduce:hidden"
          style={{
            left: r.x + "%",
            top: r.y + "%",
            width: "8%",
            height: "8%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, rgba(253,230,138,0.55) 0%, rgba(245,158,11,0.35) 45%, transparent 72%)",
            animation: "buttonRippleAnim 520ms ease-out forwards",
          }}
        />
      ))}

      {/* Face content */}
      <span
        className={
          "relative z-[1] flex h-full w-full items-center justify-center px-2 py-1 " +
          "text-[11px] font-semibold uppercase tracking-widest leading-none text-center " +
          "transition-colors duration-150 ease-out " +
          (pressed
            ? "text-neutral-950"
            : hovered
            ? "text-amber-200"
            : "text-neutral-200")
        }
      >
        {hasContent ? (
          <span
            className={
              "flex min-w-0 max-w-full items-center justify-center gap-1 leading-none " +
              "transition-transform duration-100 ease-out " +
              (pressed ? "scale-[0.96]" : "scale-100")
            }
            style={{ fontSize: "clamp(7px, min(42cqh, 22cqw), 15px)" }}
          >
            {children}
          </span>
        ) : (
          <span
            aria-hidden
            className={
              "block rounded-full transition-all duration-150 ease-out " +
              (pressed
                ? "bg-neutral-950/80 shadow-[0_0_8px_rgba(0,0,0,0.6)]"
                : hovered
                ? "bg-amber-400 shadow-[0_0_10px_-1px_rgba(245,158,11,0.8)]"
                : "bg-neutral-500")
            }
            style={{ width: "12cqmin", height: "12cqmin", maxWidth: "8px", maxHeight: "8px" }}
          />
        )}
      </span>

      <style>{`
        @keyframes buttonRippleAnim {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(14); opacity: 0; }
        }
      `}</style>
    </button>
  );
}