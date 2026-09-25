type FaderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  orientation?: "vertical" | "horizontal";
};
export function Fader(props: FaderProps) {
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const orientation = props.orientation || "vertical";
  const isVertical = orientation === "vertical";

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const span = props.max - props.min;
  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const ratio = span === 0 ? 0 : clamp01((props.value - props.min) / span);

  // For centered controls (like crossfade / pitch that span negative..positive
  // symmetrically) we detect a symmetric range and fill from center.
  const centered =
    Math.abs(props.min + props.max) < Math.abs(span) * 0.0001 && props.min < 0 && props.max > 0;
  const centerRatio = 0.5;

  const emitFromRatio = (r: number) => {
    const v = props.min + clamp01(r) * span;
    props.onChange(v);
  };

  const handlePointer = (clientX: number, clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let r: number;
    if (isVertical) {
      // top = max, bottom = min
      r = 1 - (clientY - rect.top) / (rect.height || 1);
    } else {
      r = (clientX - rect.left) / (rect.width || 1);
    }
    emitFromRatio(r);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    handlePointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    handlePointer(e.clientX, e.clientY);
  };
  const endDrag = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  // ---- shared visual pieces ----------------------------------------------

  const tickCount = 11;
  const ticks = [];
  for (let i = 0; i < tickCount; i++) ticks.push(i / (tickCount - 1));

  const accent = dragging ? "text-amber-300" : "text-amber-400";
  const glowShadow = dragging
    ? "0 0 12px rgba(245,158,11,0.55)"
    : hovering
    ? "0 0 8px rgba(245,158,11,0.35)"
    : "0 0 0 rgba(0,0,0,0)";

  // ============================ VERTICAL ==================================
  if (isVertical) {
    const fillTop = centered ? Math.min(centerRatio, ratio) : 0;
    const fillBottom = centered ? Math.max(centerRatio, ratio) : ratio;
    const fillHeightPct = (fillBottom - fillTop) * 100;
    const fillOffsetPct = (1 - fillBottom) * 100;

    return (
      <div className="h-full w-full min-w-0 min-h-0 flex items-stretch justify-center touch-none select-none">
        {/* tick rail (left) */}
        <div className="relative h-full w-[16%] min-w-0 flex flex-col justify-between py-[3%]">
          {ticks.map((t, i) => {
            const major = i === 0 || i === tickCount - 1 || (centered && i === 5);
            return (
              <div key={"tk-" + i} className="flex items-center justify-end pr-[8%]">
                <div
                  className={
                    "transition-colors duration-200 " +
                    (major ? "bg-amber-500/50" : "bg-stone-700/70")
                  }
                  style={{ height: "1px", width: major ? "78%" : "48%" }}
                />
              </div>
            );
          })}
        </div>

        {/* main track column */}
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className="relative h-full w-[34%] min-w-0 cursor-pointer"
          style={{ touchAction: "none" }}
        >
          {/* slot well */}
          <div className="absolute inset-x-[34%] top-[3%] bottom-[3%] rounded-full bg-black/70 border border-stone-800/70 shadow-inner shadow-black/70 overflow-hidden">
            {/* inner subtle sheen */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-stone-900/60 via-transparent to-stone-950/60" />
            {/* center marker for symmetric ranges */}
            {centered && (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-amber-500/30" />
            )}
            {/* fill */}
            <div
              className="absolute inset-x-0 rounded-full transition-all duration-100 ease-linear"
              style={{
                top: fillOffsetPct + "%",
                height: fillHeightPct + "%",
                background:
                  "linear-gradient(to top, rgba(245,158,11,0.85), rgba(251,191,36,0.55))",
                boxShadow: "0 0 10px rgba(245,158,11,0.4)",
              }}
            />
          </div>

          {/* thumb / cap */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-[top] duration-150 ease-out"
            style={{
              top: "calc(3% + " + (1 - ratio) * 94 + "%)",
              width: "100%",
            }}
          >
            <div
              className="relative -translate-y-1/2 mx-auto rounded-md border-2 border-stone-700/80 bg-gradient-to-b from-stone-700 to-stone-900 shadow-lg shadow-black/50 transition-all duration-150 ease-out"
              style={{
                width: "100%",
                aspectRatio: "1.7 / 1",
                transform:
                  "translateY(-50%) scale(" + (dragging ? 1.06 : hovering ? 1.03 : 1) + ")",
                boxShadow:
                  "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04), " + glowShadow,
              }}
            >
              {/* grip line lit with accent */}
              <div
                className={
                  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200 " +
                  (dragging ? "bg-amber-300" : hovering ? "bg-amber-400/90" : "bg-amber-500/70")
                }
                style={{
                  width: "62%",
                  height: "10%",
                  boxShadow: "0 0 6px rgba(245,158,11,0.5)",
                }}
              />
              <div
                className="absolute left-1/2 top-[30%] -translate-x-1/2 rounded-full bg-stone-950/60"
                style={{ width: "50%", height: "6%" }}
              />
              <div
                className="absolute left-1/2 bottom-[30%] -translate-x-1/2 rounded-full bg-stone-950/60"
                style={{ width: "50%", height: "6%" }}
              />
            </div>
          </div>
        </div>

        {/* right spacer to balance */}
        <div className="h-full w-[10%] min-w-0" />
      </div>
    );
  }

  // ============================ HORIZONTAL ================================
  const fillLeft = centered ? Math.min(centerRatio, ratio) : 0;
  const fillRight = centered ? Math.max(centerRatio, ratio) : ratio;
  const fillWidthPct = (fillRight - fillLeft) * 100;
  const fillOffsetPct = fillLeft * 100;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex flex-col justify-center touch-none select-none">
      {/* tick rail (top) */}
      <div className="relative w-full h-[16%] min-h-0 flex justify-between px-[3%]">
        {ticks.map((t, i) => {
          const major = i === 0 || i === tickCount - 1 || (centered && i === 5);
          return (
            <div key={"tkh-" + i} className="flex items-end justify-center pb-[8%]">
              <div
                className={
                  "transition-colors duration-200 " +
                  (major ? "bg-amber-500/50" : "bg-stone-700/70")
                }
                style={{ width: "1px", height: major ? "78%" : "48%" }}
              />
            </div>
          );
        })}
      </div>

      {/* main track row */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className="relative w-full h-[46%] min-h-0 cursor-pointer"
        style={{ touchAction: "none" }}
      >
        {/* slot well */}
        <div className="absolute inset-y-[30%] left-[3%] right-[3%] rounded-full bg-black/70 border border-stone-800/70 shadow-inner shadow-black/70 overflow-hidden">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-stone-900/60 via-transparent to-stone-950/60" />
          {centered && (
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-amber-500/30" />
          )}
          <div
            className="absolute inset-y-0 rounded-full transition-all duration-100 ease-linear"
            style={{
              left: fillOffsetPct + "%",
              width: fillWidthPct + "%",
              background:
                "linear-gradient(to right, rgba(245,158,11,0.85), rgba(251,191,36,0.55))",
              boxShadow: "0 0 10px rgba(245,158,11,0.4)",
            }}
          />
        </div>

        {/* thumb / cap */}
        <div
          className="absolute top-1/2 -translate-y-1/2 transition-[left] duration-150 ease-out"
          style={{
            left: "calc(3% + " + ratio * 94 + "%)",
            height: "100%",
          }}
        >
          <div
            className="relative -translate-x-1/2 my-auto rounded-md border-2 border-stone-700/80 bg-gradient-to-b from-stone-700 to-stone-900 shadow-lg shadow-black/50 transition-all duration-150 ease-out"
            style={{
              height: "100%",
              aspectRatio: "1 / 1.7",
              transform:
                "translateX(-50%) scale(" + (dragging ? 1.06 : hovering ? 1.03 : 1) + ")",
              boxShadow:
                "0 3px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04), " + glowShadow,
            }}
          >
            <div
              className={
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200 " +
                (dragging ? "bg-amber-300" : hovering ? "bg-amber-400/90" : "bg-amber-500/70")
              }
              style={{
                height: "62%",
                width: "10%",
                boxShadow: "0 0 6px rgba(245,158,11,0.5)",
              }}
            />
            <div
              className="absolute top-1/2 left-[30%] -translate-y-1/2 rounded-full bg-stone-950/60"
              style={{ height: "50%", width: "6%" }}
            />
            <div
              className="absolute top-1/2 right-[30%] -translate-y-1/2 rounded-full bg-stone-950/60"
              style={{ height: "50%", width: "6%" }}
            />
          </div>
        </div>
      </div>

      {/* bottom spacer to balance */}
      <div className="w-full h-[10%] min-h-0" />
    </div>
  );
}