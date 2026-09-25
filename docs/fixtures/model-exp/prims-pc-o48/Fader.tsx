type FaderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  orientation?: "vertical" | "horizontal";
};

export const Fader_MIN = { "base": [1.6, 6], "orientation:horizontal": [6, 1.6] };

export function Fader(props: FaderProps) {
  const { min, max, value, onChange } = props;
  const orientation = props.orientation ?? "vertical";
  const horizontal = orientation === "horizontal";

  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;

  const span = max - min || 1;
  const clamped = Math.max(min, Math.min(max, value));
  const ratio = (clamped - min) / span; // 0..1 from min to max

  // Position of thumb along the track: 0% = min end, 100% = max end.
  // Vertical: max at top, min at bottom. Horizontal: min at left, max at right.
  const posPct = ratio * 100;

  const posFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const el = trackRef.current;
      if (!el) return clamped;
      const rect = el.getBoundingClientRect();
      let r: number;
      if (horizontal) {
        r = (clientX - rect.left) / (rect.width || 1);
      } else {
        r = 1 - (clientY - rect.top) / (rect.height || 1);
      }
      r = Math.max(0, Math.min(1, r));
      return min + r * span;
    },
    [horizontal, min, span, clamped]
  );

  const handlePointerDown = useCallback(
    (e: any) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      setDragging(true);
      onChange(posFromEvent(e.clientX, e.clientY));
    },
    [onChange, posFromEvent]
  );

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!dragging) return;
      onChange(posFromEvent(e.clientX, e.clientY));
    },
    [dragging, onChange, posFromEvent]
  );

  const handlePointerUp = useCallback(
    (e: any) => {
      if (!dragging) return;
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
      setDragging(false);
    },
    [dragging]
  );

  const active = dragging || hovering;

  // Tick marks along the rail (decorative scale). Center tick emphasized.
  const tickCount = 11;
  const ticks = [];
  for (let i = 0; i < tickCount; i++) {
    const t = i / (tickCount - 1);
    const isCenter = i === (tickCount - 1) / 2;
    const isEnd = i === 0 || i === tickCount - 1;
    ticks.push({ t, isCenter, isEnd });
  }

  // ---- Shared piece styles ----
  const railGlow = active ? "shadow-[0_0_12px_-2px] shadow-amber-500/40" : "";

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {horizontal ? (
        // ===================== HORIZONTAL =====================
        <div className="absolute inset-0 flex flex-col items-stretch justify-center">
          {/* Tick scale row (top) */}
          <div className="relative w-full" style={{ height: "22%" }}>
            <div className="absolute inset-x-[6%] bottom-0 top-0">
              {ticks.map((tk, i) => (
                <span
                  key={"tick-" + i}
                  className={
                    "absolute bottom-0 w-px transition-all duration-200 ease-out " +
                    (tk.isCenter
                      ? "bg-amber-400/70"
                      : tk.isEnd
                      ? "bg-stone-500/70"
                      : "bg-stone-600/40")
                  }
                  style={{
                    left: tk.t * 100 + "%",
                    height: tk.isCenter ? "100%" : tk.isEnd ? "80%" : "55%",
                    transform: "translateX(-50%)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Rail + thumb */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="relative w-full flex-1 min-h-0 cursor-pointer touch-none"
          >
            {/* Rail groove */}
            <div className="absolute inset-x-[6%] top-1/2 -translate-y-1/2">
              <div
                className={
                  "relative w-full rounded-full border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 transition-all duration-200 ease-out " +
                  railGlow
                }
                style={{ height: "0.5rem" }}
              >
                {/* Center detent notch */}
                <span
                  className="absolute top-1/2 h-[140%] w-px -translate-x-1/2 -translate-y-1/2 bg-stone-600/50"
                  style={{ left: "50%" }}
                />
                {/* Filled travel from left (min) to thumb */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-600/70 to-amber-400 transition-all duration-150 ease-out"
                  style={{
                    width: posPct + "%",
                    boxShadow: active
                      ? "0 0 10px -1px rgba(245,158,11,0.55)"
                      : "0 0 6px -2px rgba(245,158,11,0.35)",
                  }}
                />
              </div>
            </div>

            {/* Thumb */}
            <div
              className="absolute top-1/2 transition-[left] duration-150 ease-out"
              style={{
                left: "calc(6% + " + posPct + "% * 0.88)",
                transform: "translate(-50%, -50%)",
              }}
            >
              <FaderThumb
                horizontal={horizontal}
                active={active}
                dragging={dragging}
                uid={uid}
              />
            </div>
          </div>

          {/* Bottom breathing space */}
          <div style={{ height: "14%" }} />
        </div>
      ) : (
        // ===================== VERTICAL =====================
        <div className="absolute inset-0 flex flex-row items-stretch justify-center">
          {/* Left breathing */}
          <div style={{ width: "12%" }} />

          {/* Rail + thumb */}
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className="relative h-full flex-1 min-w-0 cursor-pointer touch-none"
          >
            {/* Rail groove */}
            <div className="absolute inset-y-[5%] left-1/2 -translate-x-1/2">
              <div
                className={
                  "relative h-full rounded-full border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 transition-all duration-200 ease-out " +
                  railGlow
                }
                style={{ width: "0.5rem" }}
              >
                {/* Center detent notch */}
                <span
                  className="absolute left-1/2 w-[140%] h-px -translate-x-1/2 -translate-y-1/2 bg-stone-600/50"
                  style={{ top: "50%" }}
                />
                {/* Filled travel from bottom (min) up to thumb */}
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-amber-600/70 to-amber-400 transition-all duration-150 ease-out"
                  style={{
                    height: posPct + "%",
                    boxShadow: active
                      ? "0 0 10px -1px rgba(245,158,11,0.55)"
                      : "0 0 6px -2px rgba(245,158,11,0.35)",
                  }}
                />
              </div>
            </div>

            {/* Thumb (bottom = min => top offset = (100 - posPct)) */}
            <div
              className="absolute left-1/2 transition-[top] duration-150 ease-out"
              style={{
                top: "calc(5% + " + (100 - posPct) + "% * 0.9)",
                transform: "translate(-50%, -50%)",
              }}
            >
              <FaderThumb
                horizontal={horizontal}
                active={active}
                dragging={dragging}
                uid={uid}
              />
            </div>
          </div>

          {/* Tick scale column (right) */}
          <div className="relative h-full" style={{ width: "26%" }}>
            <div className="absolute inset-y-[5%] left-0 right-0">
              {ticks.map((tk, i) => (
                <span
                  key={"tick-" + i}
                  className={
                    "absolute left-0 h-px transition-all duration-200 ease-out " +
                    (tk.isCenter
                      ? "bg-amber-400/70"
                      : tk.isEnd
                      ? "bg-stone-500/70"
                      : "bg-stone-600/40")
                  }
                  style={{
                    top: (1 - tk.t) * 100 + "%",
                    width: tk.isCenter ? "100%" : tk.isEnd ? "80%" : "55%",
                    transform: "translateY(-50%)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FaderThumb(props: {
  horizontal: boolean;
  active: boolean;
  dragging: boolean;
  uid: string;
}) {
  const { horizontal, active, dragging, uid } = props;

  // Thumb keeps a fixed proportion; scales with slot via rem-based sizing on wrapper.
  // Use an SVG so the cap grip stays crisp and centered.
  const size = horizontal
    ? { w: "1.1rem", h: "1.9rem" }
    : { w: "1.9rem", h: "1.1rem" };

  return (
    <div
      className={
        "relative transition-all duration-150 ease-out " +
        (dragging ? "scale-105" : active ? "scale-[1.03]" : "scale-100")
      }
      style={{ width: size.w, height: size.h }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient
            id={uid + "-cap"}
            x1="0"
            y1="0"
            x2={horizontal ? "1" : "0"}
            y2={horizontal ? "0" : "1"}
          >
            <stop offset="0" stopColor="#57534e" />
            <stop offset="0.45" stopColor="#292524" />
            <stop offset="0.55" stopColor="#1c1917" />
            <stop offset="1" stopColor="#0c0a09" />
          </linearGradient>
          <linearGradient
            id={uid + "-edge"}
            x1="0"
            y1="0"
            x2={horizontal ? "1" : "0"}
            y2={horizontal ? "0" : "1"}
          >
            <stop offset="0" stopColor={active ? "#fbbf24" : "#78716c"} />
            <stop offset="1" stopColor={active ? "#b45309" : "#44403c"} />
          </linearGradient>
        </defs>

        {/* Body */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="18"
          ry="18"
          fill={"url(#" + uid + "-cap)"}
          stroke={"url(#" + uid + "-edge)"}
          strokeWidth="4"
          style={{ transition: "all 150ms ease-out" }}
        />
      </svg>

      {/* Center grip line (accent indicator of value line) */}
      {horizontal ? (
        <span
          className={
            "absolute left-1/2 top-[18%] bottom-[18%] w-[3px] -translate-x-1/2 rounded-full transition-all duration-150 ease-out " +
            (active ? "bg-amber-400" : "bg-amber-500/70")
          }
          style={{
            boxShadow: active
              ? "0 0 8px 0 rgba(251,191,36,0.7)"
              : "0 0 4px 0 rgba(245,158,11,0.4)",
          }}
        />
      ) : (
        <span
          className={
            "absolute top-1/2 left-[18%] right-[18%] h-[3px] -translate-y-1/2 rounded-full transition-all duration-150 ease-out " +
            (active ? "bg-amber-400" : "bg-amber-500/70")
          }
          style={{
            boxShadow: active
              ? "0 0 8px 0 rgba(251,191,36,0.7)"
              : "0 0 4px 0 rgba(245,158,11,0.4)",
          }}
        />
      )}

      {/* Subtle secondary grip ridges */}
      {horizontal ? (
        <>
          <span className="absolute left-1/2 top-[30%] h-[2px] w-[42%] -translate-x-1/2 rounded-full bg-stone-950/70" />
          <span className="absolute left-1/2 bottom-[30%] h-[2px] w-[42%] -translate-x-1/2 rounded-full bg-stone-950/70" />
        </>
      ) : (
        <>
          <span className="absolute top-1/2 left-[30%] w-[2px] h-[42%] -translate-y-1/2 rounded-full bg-stone-950/70" />
          <span className="absolute top-1/2 right-[30%] w-[2px] h-[42%] -translate-y-1/2 rounded-full bg-stone-950/70" />
        </>
      )}
    </div>
  );
}