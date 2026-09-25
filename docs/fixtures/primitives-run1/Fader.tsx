type FaderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  orientation?: "vertical" | "horizontal";
};

export function Fader(props: FaderProps) {
  const { min, max, value, onChange } = props;
  const orientation = props.orientation ?? "vertical";
  const isVert = orientation === "vertical";

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const span = max - min || 1;
  const clamped = Math.min(max, Math.max(min, value));
  const frac = (clamped - min) / span; // 0..1 min->max
  const pct = frac * 100;

  const FaderPosFromEvent = (clientX: number, clientY: number) => {
    const el = trackRef.current;
    if (!el) return clamped;
    const rect = el.getBoundingClientRect();
    let t: number;
    if (isVert) {
      const raw = (rect.bottom - clientY) / (rect.height || 1);
      t = Math.min(1, Math.max(0, raw));
    } else {
      const raw = (clientX - rect.left) / (rect.width || 1);
      t = Math.min(1, Math.max(0, raw));
    }
    return min + t * span;
  };

  const handleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
    onChange(FaderPosFromEvent(e.clientX, e.clientY));
  };
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    onChange(FaderPosFromEvent(e.clientX, e.clientY));
  };
  const handleUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  // Tick marks along the travel
  const FaderTickCount = 11;
  const ticks = Array.from({ length: FaderTickCount }, (_, i) => i / (FaderTickCount - 1));

  const active = dragging || hovered;

  // ---- VERTICAL ----
  if (isVert) {
    return (
      <div
        className="h-full w-full min-w-0 min-h-0 [container-type:size] flex items-stretch justify-center select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative h-full flex items-stretch justify-center px-[10%]">
          {/* Tick rail (left) */}
          <div className="relative h-full w-[14%] mr-[6%] shrink">
            {ticks.map((t, i) => {
              const major = i === 0 || i === FaderTickCount - 1 || i === (FaderTickCount - 1) / 2;
              return (
                <div
                  key={"vt-" + i}
                  className={
                    "absolute right-0 rounded-full transition-colors duration-200 " +
                    (major ? "bg-amber-400/40 h-[2px] w-full" : "bg-neutral-700/70 h-[1px] w-[60%]")
                  }
                  style={{ bottom: t * 100 + "%", transform: "translateY(50%)" }}
                />
              );
            })}
          </div>

          {/* Track */}
          <div
            ref={trackRef}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            className="relative h-full w-[26%] max-w-[44px] min-w-0 touch-none cursor-pointer"
          >
            {/* recessed slot */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[34%] rounded-full bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/70 overflow-hidden">
              {/* filled travel from bottom */}
              <div
                className={
                  "absolute inset-x-0 bottom-0 transition-all ease-out " +
                  (active ? "duration-100" : "duration-150")
                }
                style={{ height: pct + "%" }}
              >
                <div
                  className={
                    "absolute inset-0 bg-gradient-to-t from-amber-600/70 to-amber-400/90 transition-[box-shadow,opacity] duration-200 " +
                    (active
                      ? "opacity-100 shadow-[0_0_16px_-2px] shadow-amber-500/60"
                      : "opacity-80")
                  }
                />
              </div>
            </div>

            {/* Thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[220%] max-w-[46px]"
              style={{
                bottom: pct + "%",
                transform: "translate(-50%, 50%)",
                transition: active ? "bottom 100ms linear" : "bottom 150ms ease-out",
              }}
            >
              <div
                className={
                  "relative aspect-[7/4] w-full rounded-md border shadow-md shadow-black/40 " +
                  "bg-gradient-to-b from-neutral-600 to-neutral-900 transition-all duration-200 ease-out " +
                  (active
                    ? "border-amber-400/60 shadow-[0_0_16px_-2px] shadow-amber-500/60 scale-[1.04]"
                    : "border-neutral-600/60")
                }
              >
                {/* center grip line */}
                <div
                  className={
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] w-[70%] rounded-full transition-colors duration-200 " +
                    (active ? "bg-amber-300" : "bg-amber-400/70")
                  }
                />
                <div className="absolute left-1/2 top-[26%] -translate-x-1/2 h-[1px] w-[50%] rounded-full bg-black/50" />
                <div className="absolute left-1/2 bottom-[26%] -translate-x-1/2 h-[1px] w-[50%] rounded-full bg-black/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- HORIZONTAL ----
  return (
    <div
      className="h-full w-full min-w-0 min-h-0 [container-type:size] flex flex-col items-stretch justify-center select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-full flex flex-col items-stretch justify-center py-[8%]">
        {/* Track */}
        <div
          ref={trackRef}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          className="relative w-full h-[52%] max-h-[52px] min-h-0 touch-none cursor-pointer"
        >
          {/* recessed slot */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[34%] rounded-full bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/70 overflow-hidden">
            {/* center detent marker */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-neutral-700/80" />
            {/* filled travel: split around center for crossfader feel */}
            <div
              className={
                "absolute inset-y-0 transition-all ease-out " +
                (active ? "duration-100" : "duration-150")
              }
              style={
                frac >= 0.5
                  ? { left: "50%", width: (frac - 0.5) * 100 + "%" }
                  : { right: "50%", width: (0.5 - frac) * 100 + "%" }
              }
            >
              <div
                className={
                  "absolute inset-0 bg-gradient-to-r from-amber-600/70 to-amber-400/90 transition-[box-shadow,opacity] duration-200 " +
                  (active
                    ? "opacity-100 shadow-[0_0_16px_-2px] shadow-amber-500/60"
                    : "opacity-80")
                }
              />
            </div>
          </div>

          {/* Thumb */}
          <div
            className="absolute top-1/2 h-[220%] max-h-[52px]"
            style={{
              left: pct + "%",
              transform: "translate(-50%, -50%)",
              transition: active ? "left 100ms linear" : "left 150ms ease-out",
            }}
          >
            <div
              className={
                "relative h-full aspect-[4/7] rounded-md border shadow-md shadow-black/40 " +
                "bg-gradient-to-b from-neutral-600 to-neutral-900 transition-all duration-200 ease-out " +
                (active
                  ? "border-amber-400/60 shadow-[0_0_16px_-2px] shadow-amber-500/60 scale-[1.04]"
                  : "border-neutral-600/60")
              }
            >
              {/* center grip line (vertical) */}
              <div
                className={
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[70%] rounded-full transition-colors duration-200 " +
                  (active ? "bg-amber-300" : "bg-amber-400/70")
                }
              />
              <div className="absolute top-1/2 left-[26%] -translate-y-1/2 w-[1px] h-[50%] rounded-full bg-black/50" />
              <div className="absolute top-1/2 right-[26%] -translate-y-1/2 w-[1px] h-[50%] rounded-full bg-black/50" />
            </div>
          </div>
        </div>

        {/* Tick rail below */}
        <div className="relative w-full h-[16%] mt-[6%] shrink">
          {ticks.map((t, i) => {
            const major = i === 0 || i === FaderTickCount - 1 || i === (FaderTickCount - 1) / 2;
            return (
              <div
                key={"ht-" + i}
                className={
                  "absolute top-0 rounded-full transition-colors duration-200 " +
                  (major ? "bg-amber-400/40 w-[2px] h-full" : "bg-neutral-700/70 w-[1px] h-[60%]")
                }
                style={{ left: t * 100 + "%", transform: "translateX(-50%)" }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}