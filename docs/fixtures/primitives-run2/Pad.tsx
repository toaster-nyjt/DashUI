type PadProps = { onPress: () => void; active?: boolean; children?: React.ReactNode };

export function Pad(props: PadProps) {
  const { onPress, active, children } = props;

  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);
  const rippleId = useRef(0);
  const holdRef = useRef(false);

  const fire = () => {
    const id = rippleId.current++;
    setRipples((r) => [...r, { id }]);
    onPress();
    window.setTimeout(() => {
      setRipples((r) => r.filter((x) => x.id !== id));
    }, 620);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    holdRef.current = true;
    setPressed(true);
    fire();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    holdRef.current = false;
    setPressed(false);
  };

  const onPointerLeave = () => {
    setHovered(false);
    if (holdRef.current) {
      holdRef.current = false;
      setPressed(false);
    }
  };

  const PadCorner = (p: { pos: string }) => (
    <span
      className={
        "pointer-events-none absolute h-[14%] w-[14%] " +
        p.pos +
        " transition-all duration-200 ease-out"
      }
    >
      <span
        className={
          "absolute inset-0 rounded-[2px] transition-all duration-200 ease-out " +
          (active
            ? "bg-amber-300/70 shadow-[0_0_6px_0] shadow-amber-400/70"
            : hovered
            ? "bg-amber-400/40"
            : "bg-neutral-600/40")
        }
      />
    </span>
  );

  return (
    <div className="relative h-full w-full min-w-0 min-h-0 [container-type:size]">
      <button
        type="button"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerEnter={() => setHovered(true)}
        className={
          "group relative h-full w-full min-w-0 min-h-0 touch-none select-none overflow-hidden rounded-md border outline-none " +
          "transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 " +
          "motion-reduce:transition-none " +
          (active
            ? "border-amber-400/60 bg-gradient-to-b from-amber-500/30 to-amber-600/15 shadow-[0_0_16px_-2px] shadow-amber-500/60 "
            : "border-amber-400/20 bg-gradient-to-b from-neutral-700/70 to-neutral-900/90 shadow-md shadow-black/40 " +
              "hover:border-amber-400/50 hover:from-amber-500/15 hover:to-neutral-900/80 hover:scale-[1.03] ") +
          (pressed ? "scale-[0.94] " : "") +
          (active && !pressed ? "scale-[1.0] " : "")
        }
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Inset well shading */}
        <span className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),inset_0_-6px_10px_rgba(0,0,0,0.55)]" />

        {/* Top gloss sheen */}
        <span
          className={
            "pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-md transition-opacity duration-200 ease-out " +
            "bg-gradient-to-b from-white/10 to-transparent " +
            (pressed ? "opacity-30" : "opacity-100")
          }
        />

        {/* Corner registration marks */}
        <PadCorner pos="left-[7%] top-[7%]" />
        <PadCorner pos="right-[7%] top-[7%]" />
        <PadCorner pos="left-[7%] bottom-[7%]" />
        <PadCorner pos="right-[7%] bottom-[7%]" />

        {/* Active ambient inner glow */}
        <span
          className={
            "pointer-events-none absolute inset-0 rounded-md transition-opacity duration-300 ease-out " +
            "bg-[radial-gradient(70%_70%_at_50%_45%,rgba(251,191,36,0.28),transparent_70%)] " +
            (active ? "opacity-100 animate-pulse motion-reduce:animate-none" : "opacity-0")
          }
        />

        {/* Ripples on press */}
        {ripples.map((r) => (
          <span
            key={"ripple-" + r.id}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[8%] w-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/70 bg-amber-400/20 motion-reduce:hidden"
            style={{ animation: "padRipple 620ms ease-out forwards" }}
          />
        ))}

        {/* Face content */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center p-[10%]">
          {children != null && children !== false ? (
            <span
              className={
                "flex max-h-full max-w-full items-center justify-center text-center font-mono font-bold tabular-nums leading-none tracking-tight transition-colors duration-200 ease-out " +
                (active ? "text-amber-200" : hovered ? "text-amber-300/90" : "text-neutral-300")
              }
              style={{ fontSize: "min(34cqw, 40cqh)" }}
            >
              {children}
            </span>
          ) : (
            <span
              className={
                "block rounded-full transition-all duration-300 ease-out " +
                (active
                  ? "h-[16%] w-[16%] bg-amber-300 shadow-[0_0_10px_1px] shadow-amber-400/80"
                  : hovered
                  ? "h-[12%] w-[12%] bg-amber-400/50"
                  : "h-[10%] w-[10%] bg-neutral-600/60")
              }
            />
          )}
        </span>

        {/* Bottom edge highlight bar as status LED strip */}
        <span
          className={
            "pointer-events-none absolute inset-x-[12%] bottom-[5%] h-[3%] rounded-full transition-all duration-300 ease-out " +
            (active
              ? "bg-amber-300 shadow-[0_0_8px_0] shadow-amber-400/80"
              : hovered
              ? "bg-amber-400/40"
              : "bg-neutral-700/50")
          }
        />
      </button>

      <style>{`
        @keyframes padRipple {
          0% { width: 8%; height: 8%; opacity: 0.9; }
          100% { width: 150%; height: 150%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}