type PadProps = { onPress: () => void; active: boolean };

export function Pad(props: PadProps) {
  const { onPress, active } = props;

  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const padRef = useRef<HTMLButtonElement | null>(null);

  const spawnRipple = useCallback((clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const id = rippleId.current++;
    setRipples((r) => [...r, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((rp) => rp.id !== id));
    }, 620);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      try {
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
      } catch {}
      setPressed(true);
      spawnRipple(e.clientX, e.clientY);
      onPress();
    },
    [onPress, spawnRipple]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    try {
      (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
    } catch {}
    setPressed(false);
  }, []);

  const handlePointerCancel = useCallback(() => {
    setPressed(false);
  }, []);

  // Accent-driven surface classes
  const surfaceBase =
    "relative flex h-full w-full min-w-0 min-h-0 select-none items-center justify-center overflow-hidden rounded-md border touch-none transition-all duration-200 ease-out outline-none";

  const stateClasses = active
    ? "border-amber-400/60 bg-gradient-to-b from-amber-500 to-amber-600 text-neutral-950 shadow-[0_0_16px_-2px_rgba(245,158,11,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]"
    : "border-amber-400/20 bg-gradient-to-b from-neutral-700 to-neutral-900 text-neutral-500 shadow-md shadow-black/40 hover:border-amber-400/50 hover:from-neutral-600 hover:to-neutral-800 hover:text-amber-300/70";

  const pressClasses = pressed
    ? "scale-[0.94] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
    : "";

  return (
    <button
      ref={padRef}
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => e.preventDefault()}
      className={
        surfaceBase +
        " [container-type:size] " +
        stateClasses +
        " " +
        pressClasses
      }
    >
      {/* Corner registration ticks — subtle machined detail */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute left-[6%] top-[6%] h-[14%] w-[14%] rounded-tl-[3px] border-l border-t transition-colors duration-200 " +
          (active ? "border-neutral-950/40" : "border-amber-400/15")
        }
      />
      <span
        aria-hidden
        className={
          "pointer-events-none absolute right-[6%] top-[6%] h-[14%] w-[14%] rounded-tr-[3px] border-r border-t transition-colors duration-200 " +
          (active ? "border-neutral-950/40" : "border-amber-400/15")
        }
      />
      <span
        aria-hidden
        className={
          "pointer-events-none absolute bottom-[6%] left-[6%] h-[14%] w-[14%] rounded-bl-[3px] border-b border-l transition-colors duration-200 " +
          (active ? "border-neutral-950/40" : "border-amber-400/15")
        }
      />
      <span
        aria-hidden
        className={
          "pointer-events-none absolute bottom-[6%] right-[6%] h-[14%] w-[14%] rounded-br-[3px] border-b border-r transition-colors duration-200 " +
          (active ? "border-neutral-950/40" : "border-amber-400/15")
        }
      />

      {/* Armed sheen sweep when active */}
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 motion-reduce:hidden"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 48%, transparent 66%)",
            backgroundSize: "260% 100%",
            animation: "padSheen 2.6s linear infinite",
          }}
        />
      )}

      {/* Armed pulsing ring */}
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[3%] rounded-[4px] border border-neutral-950/50 motion-reduce:animate-none animate-pulse"
        />
      )}

      {/* Center glyph — a beveled trigger diamond that lights with state */}
      <span aria-hidden className="pointer-events-none relative flex items-center justify-center">
        <span
          className={
            "block rotate-45 rounded-[3px] transition-all duration-200 ease-out " +
            (active
              ? "h-[clamp(6px,20cqmin,44px)] w-[clamp(6px,20cqmin,44px)] bg-neutral-950/85 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              : "h-[clamp(5px,17cqmin,38px)] w-[clamp(5px,17cqmin,38px)] bg-amber-400/25 shadow-[inset_0_0_6px_rgba(0,0,0,0.5)]") +
            (pressed ? " scale-90" : "")
          }
        />
        <span
          className={
            "absolute rotate-45 rounded-[2px] transition-all duration-200 ease-out " +
            (active
              ? "h-[clamp(2px,7cqmin,16px)] w-[clamp(2px,7cqmin,16px)] bg-amber-400 shadow-[0_0_12px_2px_rgba(245,158,11,0.8)]"
              : "h-[clamp(2px,6cqmin,14px)] w-[clamp(2px,6cqmin,14px)] bg-amber-400/40")
          }
        />
      </span>

      {/* Press ripples */}
      {ripples.map((r) => (
        <span
          key={"ripple-" + r.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full motion-reduce:hidden"
          style={{
            left: r.x + "%",
            top: r.y + "%",
            width: "12%",
            height: "12%",
            transform: "translate(-50%, -50%)",
            background: active
              ? "radial-gradient(circle, rgba(10,10,10,0.55) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%)",
            animation: "padRipple 0.6s ease-out forwards",
          }}
        />
      ))}

      {/* Top edge highlight for the raised cap feel */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-x-[8%] top-0 h-[2px] rounded-full transition-opacity duration-200 " +
          (active ? "bg-white/40 opacity-80" : "bg-white/10 opacity-60")
        }
      />

      <style>{`
        @keyframes padRipple {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(9); opacity: 0; }
        }
        @keyframes padSheen {
          0% { background-position: 140% 0; }
          100% { background-position: -60% 0; }
        }
      `}</style>
    </button>
  );
}