type PadProps = { onPress: () => void; active?: boolean; children?: React.ReactNode };
export function Pad(props: PadProps) {
  const uid = useRef("pad-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(false);
  const [hover, setHover] = useState(false);
  const flashTimer = useRef<number | null>(null);

  const active = !!props.active;

  useEffect(() => {
    return () => {
      if (flashTimer.current !== null) clearTimeout(flashTimer.current);
    };
  }, []);

  const fire = () => {
    props.onPress();
    setFlash(true);
    if (flashTimer.current !== null) clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(false), 260);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
    setPressed(true);
    fire();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    setPressed(false);
  };

  const onPointerLeave = () => {
    setHover(false);
    setPressed(false);
  };

  const hasChildren = props.children !== undefined && props.children !== null && props.children !== false;

  const faceColor = active
    ? "text-neutral-950"
    : flash
    ? "text-amber-200"
    : hover
    ? "text-amber-200"
    : "text-neutral-400";

  const shellBg = active
    ? "bg-gradient-to-b from-amber-400 to-amber-600"
    : "bg-gradient-to-b from-neutral-700 to-neutral-900";

  const shellShadow = active
    ? "shadow-[0_0_18px_-2px_rgba(245,158,11,0.7),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.5)]"
    : pressed
    ? "shadow-[inset_0_3px_8px_rgba(0,0,0,0.8)]"
    : flash
    ? "shadow-[0_0_16px_-2px_rgba(245,158,11,0.55),inset_0_1px_2px_rgba(255,255,255,0.08),inset_0_-3px_6px_rgba(0,0,0,0.6)]"
    : "shadow-[0_3px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.06),inset_0_-3px_6px_rgba(0,0,0,0.6)]";

  const shellBorder = active
    ? "border border-amber-300/50"
    : "border border-neutral-600/50";

  const transform = pressed
    ? "translateY(1px) scale(0.965)"
    : hover
    ? "translateY(-1px) scale(1.015)"
    : "translateY(0) scale(1)";

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center">
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={onPointerLeave}
        className={
          "relative h-full w-full min-w-0 min-h-0 rounded-md overflow-hidden cursor-pointer select-none touch-none transition-all duration-200 ease-out motion-reduce:transition-none " +
          shellBg +
          " " +
          shellBorder +
          " " +
          shellShadow
        }
        style={{ transform: transform }}
      >
        {/* top gloss */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
          style={{
            background: active
              ? "linear-gradient(to bottom, rgba(255,255,255,0.32), rgba(255,255,255,0))"
              : "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0))",
          }}
        />

        {/* corner status jewel when active/no children region gets subtle inner ring */}
        <div
          className={
            "pointer-events-none absolute inset-0 rounded-md transition-opacity duration-200 motion-reduce:transition-none " +
            (active ? "opacity-100" : "opacity-0")
          }
          style={{
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
          }}
        />

        {/* ripple flash on hit */}
        {flash && (
          <span
            key={uid + "-ripple"}
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full motion-reduce:hidden"
            style={{
              width: "160%",
              height: "160%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(253,230,138,0.55) 0%, rgba(245,158,11,0.15) 40%, rgba(245,158,11,0) 70%)",
              animation: "padripple-" + uid + " 260ms ease-out forwards",
            }}
          />
        )}

        {/* pulse ring for lit/armed state */}
        {active && (
          <span
            className="pointer-events-none absolute inset-[6%] rounded-[6px] animate-pulse motion-reduce:animate-none"
            style={{ boxShadow: "0 0 10px 0 rgba(245,158,11,0.5)" }}
          />
        )}

        {/* face content */}
        {hasChildren ? (
          <div className="absolute inset-[14%] flex items-center justify-center min-w-0 min-h-0">
            <FitText
              className={
                "font-mono font-bold tracking-tight tabular-nums transition-colors duration-200 motion-reduce:transition-none " +
                faceColor
              }
            >
              {props.children}
            </FitText>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={
                "block rounded-full transition-all duration-200 motion-reduce:transition-none " +
                (active
                  ? "bg-neutral-950/70 shadow-[0_0_6px_rgba(0,0,0,0.4)]"
                  : hover
                  ? "bg-amber-400/60"
                  : "bg-neutral-500/50")
              }
              style={{ width: "16%", height: "16%" }}
            />
          </div>
        )}

        <style>
          {"@keyframes padripple-" +
            uid +
            " { 0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.3); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1); } }"}
        </style>
      </div>
    </div>
  );
}