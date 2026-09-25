type FaderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  orientation?: "vertical" | "horizontal";
};
export function Fader(props: FaderProps) {
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const orientation = props.orientation === "horizontal" ? "horizontal" : "vertical";
  const isH = orientation === "horizontal";

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const range = props.max - props.min;
  const safeRange = range === 0 ? 1 : range;
  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const ratio = clamp01((props.value - props.min) / safeRange);

  const FADER_PAD = 8; // percent inset at each end so the thumb never clips
  const posPct = FADER_PAD + ratio * (100 - 2 * FADER_PAD);

  const emitFromClient = (clientX: number, clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let r: number;
    if (isH) {
      const usable = rect.width * (1 - 2 * (FADER_PAD / 100));
      const start = rect.left + rect.width * (FADER_PAD / 100);
      r = usable === 0 ? 0 : (clientX - start) / usable;
    } else {
      const usable = rect.height * (1 - 2 * (FADER_PAD / 100));
      const start = rect.top + rect.height * (FADER_PAD / 100);
      // vertical: top = max, bottom = min
      r = usable === 0 ? 0 : 1 - (clientY - start) / usable;
    }
    r = clamp01(r);
    props.onChange(props.min + r * range);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    emitFromClient(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    emitFromClient(e.clientX, e.clientY);
  };
  const endDrag = (e: React.PointerEvent) => {
    if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const active = dragging || hovering;

  // ----- shared bits -----
  const tickCount = 11;
  const ticks = [];
  for (let i = 0; i < tickCount; i++) {
    const t = i / (tickCount - 1);
    const isMajor = i === 0 || i === tickCount - 1 || i === (tickCount - 1) / 2;
    ticks.push({ t, isMajor });
  }

  const glow = dragging
    ? "shadow-[0_0_18px_-2px_rgba(245,158,11,0.75)]"
    : hovering
    ? "shadow-[0_0_14px_-3px_rgba(245,158,11,0.55)]"
    : "shadow-[0_0_0px_0px_rgba(245,158,11,0)]";

  if (isH) {
    return (
      <div className="h-full w-full min-w-0 min-h-0 flex items-center justify-center select-none touch-none">
        <div className="w-full h-full flex items-center px-[1%]">
          <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerEnter={() => setHovering(true)}
            onPointerLeave={() => setHovering(false)}
            className="relative w-full h-full min-w-0 min-h-0 cursor-ew-resize touch-none flex items-center"
          >
            {/* Recessed rail */}
            <div className="absolute left-[2%] right-[2%] top-1/2 -translate-y-1/2 h-[34%] rounded-full bg-neutral-950/80 border border-neutral-700/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* center notch marker for crossfader feel */}
              <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-amber-400/20" />
            </div>

            {/* Tick marks along track */}
            <div className="absolute inset-x-[2%] top-1/2 -translate-y-1/2 h-full pointer-events-none">
              {ticks.map((tk, i) => (
                <div
                  key={"tk-" + i}
                  className={
                    "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-colors duration-200 " +
                    (tk.isMajor ? "bg-amber-400/40" : "bg-neutral-600/50")
                  }
                  style={{
                    left: FADER_PAD + tk.t * (100 - 2 * FADER_PAD) + "%",
                    width: tk.isMajor ? "2px" : "1px",
                    height: tk.isMajor ? "62%" : "40%",
                  }}
                />
              ))}
            </div>

            {/* Thumb */}
            <div
              className="absolute top-1/2 z-10 transition-[left] duration-100 ease-linear"
              style={{
                left: posPct + "%",
                transform: "translate(-50%,-50%)",
              }}
            >
              <div
                className={
                  "relative flex items-center justify-center rounded-md border transition-all duration-200 ease-out " +
                  (dragging
                    ? "border-amber-400/70 scale-[1.06]"
                    : hovering
                    ? "border-amber-400/50 scale-[1.03]"
                    : "border-neutral-600/60 scale-100") +
                  " " +
                  glow
                }
                style={{
                  width: "clamp(14px, 6%, 26px)",
                  height: "clamp(26px, 74%, 999px)",
                  background:
                    "linear-gradient(180deg,#5c5c5c 0%,#2b2b2b 55%,#161616 100%)",
                }}
              >
                {/* center grip line + accent */}
                <div
                  className={
                    "h-[70%] w-[2px] rounded-full transition-colors duration-200 " +
                    (active ? "bg-amber-400" : "bg-amber-500/70")
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- VERTICAL -----
  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch justify-center select-none touch-none">
      <div className="h-full flex flex-col items-center py-[1%]">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          className="relative h-full min-h-0 cursor-ns-resize touch-none flex justify-center"
          style={{ width: "clamp(20px, 100%, 52px)" }}
        >
          {/* Recessed rail */}
          <div className="absolute top-[2%] bottom-[2%] left-1/2 -translate-x-1/2 w-[30%] rounded-full bg-neutral-950/80 border border-neutral-700/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* fill from bottom up to thumb */}
            <div
              className={
                "absolute left-0 right-0 bottom-0 transition-[height,background] duration-100 ease-linear " +
                (active
                  ? "bg-gradient-to-t from-amber-500/50 to-amber-400/25"
                  : "bg-gradient-to-t from-amber-500/35 to-amber-400/15")
              }
              style={{ height: ratio * 100 + "%" }}
            />
            {/* center detent line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-amber-400/20" />
          </div>

          {/* Tick marks */}
          <div className="absolute top-[2%] bottom-[2%] left-1/2 -translate-x-1/2 w-full pointer-events-none">
            {ticks.map((tk, i) => (
              <div
                key={"tk-" + i}
                className={
                  "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-200 " +
                  (tk.isMajor ? "bg-amber-400/40" : "bg-neutral-600/50")
                }
                style={{
                  top: FADER_PAD + (1 - tk.t) * (100 - 2 * FADER_PAD) + "%",
                  height: tk.isMajor ? "2px" : "1px",
                  width: tk.isMajor ? "58%" : "38%",
                }}
              />
            ))}
          </div>

          {/* Thumb */}
          <div
            className="absolute left-1/2 z-10 transition-[top] duration-100 ease-linear"
            style={{
              top: 100 - posPct + "%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <div
              className={
                "relative flex items-center justify-center rounded-md border transition-all duration-200 ease-out " +
                (dragging
                  ? "border-amber-400/70 scale-[1.06]"
                  : hovering
                  ? "border-amber-400/50 scale-[1.03]"
                  : "border-neutral-600/60 scale-100") +
                " " +
                glow
              }
              style={{
                height: "clamp(16px, 9%, 30px)",
                width: "clamp(26px, 150%, 999px)",
                background:
                  "linear-gradient(180deg,#5c5c5c 0%,#2b2b2b 55%,#161616 100%)",
              }}
            >
              {/* center grip line + accent */}
              <div
                className={
                  "w-[70%] h-[2px] rounded-full transition-colors duration-200 " +
                  (active ? "bg-amber-400" : "bg-amber-500/70")
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}