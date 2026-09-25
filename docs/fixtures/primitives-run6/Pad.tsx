type PadProps = {
  onPress: () => void;
  active?: boolean;
  children?: React.ReactNode;
};

export const Pad_MIN = { "base": [3, 2.25] };

export function Pad(props: PadProps) {
  const { onPress, active, children } = props;

  const uid = useRef("pad-" + Math.random().toString(36).slice(2)).current;

  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ripple, setRipple] = useState(0);

  const pointerActive = useRef(false);

  const fire = useCallback(() => {
    setRipple((r) => r + 1);
    onPress();
  }, [onPress]);

  const handleDown = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      pointerActive.current = true;
      setPressed(true);
      fire();
    },
    [fire]
  );

  const handleUp = useCallback((e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    pointerActive.current = false;
    setPressed(false);
  }, []);

  const handleCancel = useCallback(() => {
    pointerActive.current = false;
    setPressed(false);
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!e.repeat) {
          setPressed(true);
          fire();
        }
      }
    },
    [fire]
  );

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setPressed(false);
    }
  }, []);

  // Base surface classes for lit vs unlit states
  const litBg =
    "bg-gradient-to-br from-amber-500/30 via-amber-500/15 to-stone-950/70";
  const dimBg =
    "bg-gradient-to-br from-stone-800/50 via-stone-900/60 to-stone-950/80";

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: Pad_MIN.base[0] + "rem", minHeight: Pad_MIN.base[1] + "rem" }}
    >
      <button
        type="button"
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={handleCancel}
        onPointerLeave={() => setHovered(false)}
        onPointerEnter={() => setHovered(true)}
        onKeyDown={handleKey}
        onKeyUp={handleKeyUp}
        aria-pressed={!!active}
        className={
          "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border touch-none outline-none transition-all duration-200 ease-out " +
          (active
            ? litBg +
              " border-amber-400/50 shadow-lg shadow-amber-500/30 text-amber-100"
            : dimBg +
              " border-amber-500/25 shadow-md shadow-black/40 text-stone-300") +
          " hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-px hover:text-amber-200" +
          " active:translate-y-0 active:scale-95 active:brightness-95" +
          " focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500/50"
        }
      >
        {/* Recessed inner bevel */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-black/50"
        />

        {/* Top sheen highlight */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute inset-x-0 top-0 h-[42%] rounded-t-md bg-gradient-to-b transition-opacity duration-200 ease-out " +
            (active
              ? "from-amber-300/25 to-transparent opacity-100"
              : "from-stone-400/10 to-transparent opacity-70 group-hover:opacity-100")
          }
        />

        {/* Molten glow bloom when lit */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute -inset-[20%] rounded-full blur-2xl transition-all duration-500 ease-out " +
            (active
              ? "bg-amber-500/25 opacity-100 animate-pulse"
              : "bg-amber-500/0 opacity-0")
          }
        />

        {/* Corner status indicator: lit dot */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute right-[8%] top-[8%] aspect-square w-[12%] max-w-[0.55rem] rounded-full transition-all duration-300 ease-out " +
            (active
              ? "bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.55)] animate-pulse"
              : "bg-stone-700/70 " + (hovered ? "shadow-[0_0_4px_1px_rgba(251,191,36,0.25)]" : ""))
          }
        />

        {/* Bottom edge accent strip */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute inset-x-[6%] bottom-[6%] h-[3%] rounded-full transition-all duration-300 ease-out " +
            (active
              ? "bg-gradient-to-r from-transparent via-amber-400/80 to-transparent"
              : "bg-gradient-to-r from-transparent via-stone-600/40 to-transparent group-hover:via-amber-500/40")
          }
        />

        {/* Press flash overlay */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute inset-0 rounded-md bg-amber-300/25 transition-opacity duration-100 ease-out " +
            (pressed ? "opacity-100" : "opacity-0")
          }
        />

        {/* Expanding ripple on each hit */}
        <PadRipple key={"ripple-" + ripple} trigger={ripple} />

        {/* Face content */}
        {children != null ? (
          <span className="pointer-events-none absolute inset-[16%] flex items-center justify-center">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (active ? "text-amber-100" : "text-stone-300 group-hover:text-amber-200")
              }
            >
              {children}
            </FitText>
          </span>
        ) : null}
      </button>
    </div>
  );
}

function PadRipple(props: { trigger: number }) {
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (props.trigger === 0) return;
    setGo(false);
    const id = requestAnimationFrame(() => setGo(true));
    return () => cancelAnimationFrame(id);
  }, [props.trigger]);

  if (props.trigger === 0) return null;

  return (
    <span
      aria-hidden
      className={
        "pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/40 transition-all ease-out " +
        (go
          ? "duration-500 scale-[6] opacity-0"
          : "duration-0 scale-100 opacity-70")
      }
    />
  );
}