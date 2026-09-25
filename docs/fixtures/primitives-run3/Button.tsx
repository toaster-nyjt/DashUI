type ButtonProps = { onPress: () => void; children?: React.ReactNode };
export function Button(props: ButtonProps) {
  const uid = useRef("button-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleSeq = useRef(0);
  const rootRef = useRef<HTMLButtonElement | null>(null);

  const spawnRipple = (clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const id = ++rippleSeq.current;
    setRipples((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 620);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setPressed(true);
    spawnRipple(e.clientX, e.clientY);
    props.onPress();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    setPressed(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!pressed) {
        setPressed(true);
        props.onPress();
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
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
      onPointerCancel={handlePointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      className={
        "group relative h-full w-full min-w-0 min-h-0 select-none touch-none overflow-hidden rounded-lg outline-none " +
        "flex items-center justify-center " +
        "border transition-all duration-200 ease-out " +
        "focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 " +
        "motion-reduce:transition-none " +
        (pressed
          ? "border-amber-400/60 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] translate-y-0 scale-[0.97]"
          : hovered
          ? "border-amber-400/50 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-[0_0_16px_-2px] shadow-amber-500/50 -translate-y-px"
          : "border-neutral-600/50 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-md shadow-black/40")
      }
      style={{ containerType: "size" } as React.CSSProperties}
    >
      {/* top sheen */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg bg-gradient-to-b transition-opacity duration-200 " +
          (pressed
            ? "from-white/[0.03] to-transparent opacity-40"
            : "from-white/[0.10] to-transparent opacity-100")
        }
      />

      {/* amber wash on hover/press */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200 " +
          "bg-[radial-gradient(120%_120%_at_50%_-20%,rgba(245,158,11,0.22),transparent_60%)] " +
          (hovered || pressed ? "opacity-100" : "opacity-0")
        }
      />

      {/* inner hairline ring for metal seam */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[1px] rounded-[7px] ring-1 ring-inset ring-white/[0.05]"
      />

      {/* ripples */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
        {ripples.map((r) => (
          <span
            key={"rip-" + uid + "-" + r.id}
            className="absolute rounded-full bg-amber-400/40 motion-reduce:hidden"
            style={{
              left: r.x + "%",
              top: r.y + "%",
              width: "10cqmin",
              height: "10cqmin",
              transform: "translate(-50%, -50%) scale(0)",
              animation: "btnRipple-" + uid + " 600ms ease-out forwards",
            }}
          />
        ))}
      </span>

      {/* face content */}
      <span
        className={
          "relative z-10 flex max-h-full max-w-full items-center justify-center overflow-hidden text-center " +
          "px-[8cqmin] " +
          "font-semibold uppercase tracking-widest leading-none " +
          "transition-all duration-200 ease-out " +
          (pressed
            ? "text-amber-300 translate-y-px"
            : hovered
            ? "text-amber-200"
            : "text-neutral-200")
        }
        style={{
          fontSize: "min(34cqh, 22cqw)",
          textShadow: hovered || pressed ? "0 0 10px rgba(245,158,11,0.55)" : "none",
        }}
      >
        {props.children}
      </span>

      <style>
        {"@keyframes btnRipple-" +
          uid +
          " { 0% { transform: translate(-50%, -50%) scale(0); opacity: 0.55; } 100% { transform: translate(-50%, -50%) scale(9); opacity: 0; } }"}
      </style>
    </button>
  );
}