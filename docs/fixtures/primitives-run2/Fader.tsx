type FaderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  orientation?: "vertical" | "horizontal";
};

export function Fader(props: FaderProps) {
  const orientation = props.orientation ?? "vertical";
  const isVertical = orientation === "vertical";

  const trackRef = (globalThis as any).React
    ? useRef<HTMLDivElement | null>(null)
    : useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const range = props.max - props.min || 1;
  const clamped = Math.max(props.min, Math.min(props.max, props.value));
  // fraction 0..1 where 0 = min, 1 = max
  const frac = (clamped - props.min) / range;

  // For vertical, min at bottom, max at top -> thumb position from top = 1 - frac
  // For horizontal, min at left, max at right -> thumb position from left = frac

  const FaderComputeFromPointer = (clientX: number, clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let f: number;
    if (isVertical) {
      const y = clientY - rect.top;
      f = 1 - y / (rect.height || 1);
    } else {
      const x = clientX - rect.left;
      f = x / (rect.width || 1);
    }
    f = Math.max(0, Math.min(1, f));
    const raw = props.min + f * range;
    props.onChange(raw);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    FaderComputeFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    FaderComputeFromPointer(e.clientX, e.clientY);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Detent tick fractions along the travel
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  const active = dragging || hovering;

  // ------- VERTICAL LAYOUT -------
  if (isVertical) {
    const thumbTopPct = (1 - frac) * 100;
    const fillHeightPct = frac * 100;

    return (
      <div className="h-full w-full min-w-0 min-h-0 flex items-stretch justify-center [container-type:size]">
        <div className="relative h-full flex items-stretch justify-center" style={{ width: "42%" }}>
          {/* Tick rail (left) */}
          <div className="relative h-full" style={{ width: "26%" }}>
            {ticks.map((t, i) => (
              <div
                key={"vt-" + i}
                className="absolute right-0 h-px bg-neutral-600/70"
                style={{
                  top: "calc(" + (1 - t) * 100 + "% )",
                  width: t === 0.5 ? "100%" : "62%",
                  transform: "translateY(-0.5px)",
                }}
              />
            ))}
          </div>

          {/* Track column */}
          <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="relative h-full touch-none cursor-pointer select-none flex justify-center"
            style={{ width: "40%" }}
          >
            {/* Recessed slot */}
            <div
              className="absolute top-0 bottom-0 rounded-full bg-neutral-950/80 border border-neutral-700/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden"
              style={{ left: "50%", transform: "translateX(-50%)", width: "36%" }}
            >
              {/* Amber fill from bottom up to thumb */}
              <div
                className="absolute left-0 right-0 bottom-0 rounded-full transition-[height] duration-100 ease-linear"
                style={{
                  height: fillHeightPct + "%",
                  background:
                    "linear-gradient(to top,#f59e0b 0%,#fbbf24 60%,#fcd34d 100%)",
                  boxShadow: active
                    ? "0 0 16px -2px rgba(245,158,11,0.7)"
                    : "0 0 8px -3px rgba(245,158,11,0.5)",
                }}
              />
              {/* subtle inner sheen */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] via-transparent to-black/20 pointer-events-none" />
            </div>

            {/* Thumb (fader cap) */}
            <div
              className="absolute left-1/2 z-10 transition-transform duration-100 ease-linear"
              style={{
                top: thumbTopPct + "%",
                transform:
                  "translate(-50%,-50%) scale(" + (dragging ? 1.06 : hovering ? 1.03 : 1) + ")",
                width: "100%",
                height: "12%",
              }}
            >
              <div
                className="relative h-full w-full rounded-md border border-neutral-600/60 bg-gradient-to-b from-neutral-600 to-neutral-900 shadow-md shadow-black/50 overflow-hidden"
                style={{
                  boxShadow: active
                    ? "0 2px 8px rgba(0,0,0,0.5),0 0 16px -3px rgba(245,158,11,0.6)"
                    : "0 2px 6px rgba(0,0,0,0.5)",
                }}
              >
                {/* center grip line, amber */}
                <div
                  className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-amber-400 rounded-full transition-colors duration-200"
                  style={{
                    height: "16%",
                    boxShadow: "0 0 8px -1px rgba(251,191,36,0.8)",
                    opacity: active ? 1 : 0.85,
                  }}
                />
                {/* top/bottom edge highlight */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-white/[0.07]" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-black/30" />
              </div>
            </div>
          </div>

          {/* right spacer to keep cap visually centered */}
          <div style={{ width: "26%" }} />
        </div>
      </div>
    );
  }

  // ------- HORIZONTAL LAYOUT -------
  const thumbLeftPct = frac * 100;
  const isCenterZero = props.min < 0 && props.max > 0;
  // fill: for center-zero (crossfader style) fill from center; else from left
  const centerFrac = isCenterZero ? (0 - props.min) / range : 0;
  const centerPct = centerFrac * 100;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center [container-type:size]">
      <div className="relative w-full flex flex-col justify-center" style={{ height: "58%" }}>
        {/* Track row */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="relative w-full touch-none cursor-pointer select-none flex items-center"
          style={{ height: "60%" }}
        >
          {/* Recessed slot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 right-0 rounded-full bg-neutral-950/80 border border-neutral-700/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden"
            style={{ height: "34%" }}
          >
            {/* Fill */}
            {isCenterZero ? (
              <div
                className="absolute top-0 bottom-0 rounded-full transition-[left,right,width] duration-100 ease-linear"
                style={{
                  left: Math.min(centerPct, thumbLeftPct) + "%",
                  right: 100 - Math.max(centerPct, thumbLeftPct) + "%",
                  background:
                    "linear-gradient(to right,#f59e0b 0%,#fbbf24 55%,#fcd34d 100%)",
                  boxShadow: active
                    ? "0 0 16px -2px rgba(245,158,11,0.7)"
                    : "0 0 8px -3px rgba(245,158,11,0.5)",
                }}
              />
            ) : (
              <div
                className="absolute top-0 bottom-0 left-0 rounded-full transition-[width] duration-100 ease-linear"
                style={{
                  width: thumbLeftPct + "%",
                  background:
                    "linear-gradient(to right,#f59e0b 0%,#fbbf24 60%,#fcd34d 100%)",
                  boxShadow: active
                    ? "0 0 16px -2px rgba(245,158,11,0.7)"
                    : "0 0 8px -3px rgba(245,158,11,0.5)",
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-black/20 pointer-events-none" />
          </div>

          {/* Center marker for center-zero faders */}
          {isCenterZero && (
            <div
              className="absolute top-1/2 -translate-y-1/2 bg-neutral-500/70 rounded-full"
              style={{
                left: centerPct + "%",
                width: "1.5px",
                height: "150%",
                transform: "translate(-50%,-50%)",
              }}
            />
          )}

          {/* Thumb (fader cap) */}
          <div
            className="absolute top-1/2 z-10 transition-transform duration-100 ease-linear"
            style={{
              left: thumbLeftPct + "%",
              transform:
                "translate(-50%,-50%) scale(" + (dragging ? 1.06 : hovering ? 1.03 : 1) + ")",
              height: "100%",
              width: "14%",
            }}
          >
            <div
              className="relative h-full w-full rounded-md border border-neutral-600/60 bg-gradient-to-b from-neutral-600 to-neutral-900 shadow-md shadow-black/50 overflow-hidden"
              style={{
                boxShadow: active
                  ? "0 2px 8px rgba(0,0,0,0.5),0 0 16px -3px rgba(245,158,11,0.6)"
                  : "0 2px 6px rgba(0,0,0,0.5)",
              }}
            >
              {/* vertical grip line, amber */}
              <div
                className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 bg-amber-400 rounded-full transition-colors duration-200"
                style={{
                  width: "16%",
                  boxShadow: "0 0 8px -1px rgba(251,191,36,0.8)",
                  opacity: active ? 1 : 0.85,
                }}
              />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-white/[0.07]" />
              <div className="absolute inset-y-0 right-0 w-1/3 bg-black/30" />
            </div>
          </div>
        </div>

        {/* Tick rail (below track) */}
        <div className="relative w-full" style={{ height: "22%" }}>
          {ticks.map((t, i) => (
            <div
              key={"ht-" + i}
              className="absolute top-0 w-px bg-neutral-600/70"
              style={{
                left: t * 100 + "%",
                height: t === 0.5 ? "100%" : "62%",
                transform: "translateX(-0.5px)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}