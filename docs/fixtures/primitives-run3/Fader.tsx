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
  const isVertical = orientation === "vertical";

  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const span = max - min;
  const safeSpan = span === 0 ? 1 : span;
  const clampedValue = Math.max(min, Math.min(max, value));
  // ratio 0..1 from min->max
  const ratio = (clampedValue - min) / safeSpan;

  // Detect a bipolar/centered fader (min < 0 < max, roughly symmetric) — pitch/crossfade style
  const isBipolar = min < 0 && max > 0;
  const centerRatio = isBipolar ? (0 - min) / safeSpan : 0;

  // Position of the thumb along the visual axis, as percent.
  // For vertical: 0% ratio => bottom, 100% ratio => top.
  const thumbPct = ratio * 100;

  const FaderComputeFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let r: number;
      if (isVertical) {
        const h = rect.height || 1;
        r = 1 - (clientY - rect.top) / h;
      } else {
        const w = rect.width || 1;
        r = (clientX - rect.left) / w;
      }
      r = Math.max(0, Math.min(1, r));
      const next = min + r * safeSpan;
      onChange(next);
    },
    [isVertical, min, safeSpan, onChange]
  );

  const FaderOnPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    FaderComputeFromPointer(e.clientX, e.clientY);
  };

  const FaderOnPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    FaderComputeFromPointer(e.clientX, e.clientY);
  };

  const FaderOnPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const active = dragging || hovering;

  // Tick marks along the rail
  const FaderTicks = () => {
    const count = 9;
    const ticks: React.ReactElement[] = [];
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const isMid = i === (count - 1) / 2;
      const isEnd = i === 0 || i === count - 1;
      if (isVertical) {
        ticks.push(
          <div
            key={"tick-" + i}
            className="absolute left-0 right-0 flex items-center justify-between"
            style={{ top: (1 - t) * 100 + "%", transform: "translateY(-50%)" }}
          >
            <span
              className={
                "block rounded-full transition-colors duration-200 " +
                (isMid
                  ? "bg-amber-400/50"
                  : isEnd
                  ? "bg-neutral-500/60"
                  : "bg-neutral-600/40")
              }
              style={{
                width: isMid ? "34%" : isEnd ? "26%" : "18%",
                height: "2px",
              }}
            />
            <span
              className={
                "block rounded-full transition-colors duration-200 " +
                (isMid
                  ? "bg-amber-400/50"
                  : isEnd
                  ? "bg-neutral-500/60"
                  : "bg-neutral-600/40")
              }
              style={{
                width: isMid ? "34%" : isEnd ? "26%" : "18%",
                height: "2px",
              }}
            />
          </div>
        );
      } else {
        ticks.push(
          <div
            key={"tick-" + i}
            className="absolute top-0 bottom-0 flex flex-col items-center justify-between"
            style={{ left: t * 100 + "%", transform: "translateX(-50%)" }}
          >
            <span
              className={
                "block rounded-full transition-colors duration-200 " +
                (isMid
                  ? "bg-amber-400/50"
                  : isEnd
                  ? "bg-neutral-500/60"
                  : "bg-neutral-600/40")
              }
              style={{
                height: isMid ? "34%" : isEnd ? "26%" : "18%",
                width: "2px",
              }}
            />
            <span
              className={
                "block rounded-full transition-colors duration-200 " +
                (isMid
                  ? "bg-amber-400/50"
                  : isEnd
                  ? "bg-neutral-500/60"
                  : "bg-neutral-600/40")
              }
              style={{
                height: isMid ? "34%" : isEnd ? "26%" : "18%",
                width: "2px",
              }}
            />
          </div>
        );
      }
    }
    return <>{ticks}</>;
  };

  // Fill geometry — from center for bipolar, from origin otherwise
  const fillStyle: React.CSSProperties = (() => {
    if (isVertical) {
      if (isBipolar) {
        const lo = Math.min(centerRatio, ratio) * 100;
        const hi = Math.max(centerRatio, ratio) * 100;
        return { bottom: lo + "%", height: hi - lo + "%" };
      }
      return { bottom: "0%", height: thumbPct + "%" };
    } else {
      if (isBipolar) {
        const lo = Math.min(centerRatio, ratio) * 100;
        const hi = Math.max(centerRatio, ratio) * 100;
        return { left: lo + "%", width: hi - lo + "%" };
      }
      return { left: "0%", width: thumbPct + "%" };
    }
  })();

  return (
    <div
      className="h-full w-full min-w-0 min-h-0 select-none touch-none"
      onPointerDown={FaderOnPointerDown}
      onPointerMove={FaderOnPointerMove}
      onPointerUp={FaderOnPointerUp}
      onPointerCancel={FaderOnPointerUp}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ cursor: isVertical ? "ns-resize" : "ew-resize" }}
    >
      <div
        className={
          "h-full w-full min-w-0 min-h-0 flex " +
          (isVertical
            ? "flex-row items-stretch justify-center"
            : "flex-col items-center justify-center")
        }
      >
        {/* Rail wrapper keeps the interactive band centered while ticks flank it */}
        <div
          className={
            "relative " +
            (isVertical
              ? "h-full flex flex-row items-stretch"
              : "w-full flex flex-col items-stretch")
          }
          style={
            isVertical
              ? { width: "70%", maxWidth: "72px", minWidth: 0 }
              : { height: "70%", maxHeight: "72px", minHeight: 0 }
          }
        >
          {/* Tick lane */}
          <div
            className={
              "relative " +
              (isVertical ? "h-full" : "w-full")
            }
            style={
              isVertical
                ? { width: "100%", minWidth: 0 }
                : { height: "100%", minHeight: 0 }
            }
          >
            <FaderTicks />

            {/* The recessed track, centered in the lane */}
            <div
              ref={trackRef}
              className={
                "absolute rounded-full bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] border border-neutral-700/70 overflow-hidden " +
                "transition-[box-shadow] duration-200 ease-out"
              }
              style={
                isVertical
                  ? {
                      top: 0,
                      bottom: 0,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "26%",
                      minWidth: "6px",
                    }
                  : {
                      left: 0,
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: "26%",
                      minHeight: "6px",
                    }
              }
            >
              {/* Center detent glow for bipolar */}
              {isBipolar && (
                <div
                  className="absolute bg-amber-400/20"
                  style={
                    isVertical
                      ? {
                          left: 0,
                          right: 0,
                          bottom: centerRatio * 100 + "%",
                          height: "2px",
                          transform: "translateY(50%)",
                        }
                      : {
                          top: 0,
                          bottom: 0,
                          left: centerRatio * 100 + "%",
                          width: "2px",
                          transform: "translateX(-50%)",
                        }
                  }
                />
              )}

              {/* Fill */}
              <div
                className={
                  "absolute rounded-full transition-[box-shadow,background-color] duration-150 ease-out " +
                  (active
                    ? "bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_0_16px_-2px] shadow-amber-500/60"
                    : "bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_10px_-3px] shadow-amber-500/40")
                }
                style={
                  isVertical
                    ? {
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "100%",
                        ...fillStyle,
                      }
                    : {
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: "100%",
                        ...fillStyle,
                      }
                }
              />

              {/* Moving glow highlight that tracks the thumb inside the track */}
              <div
                className="absolute rounded-full bg-amber-200/70 blur-[1px] transition-[opacity] duration-200"
                style={
                  isVertical
                    ? {
                        left: "50%",
                        transform: "translate(-50%, 50%)",
                        bottom: thumbPct + "%",
                        width: "70%",
                        height: "3px",
                        opacity: active ? 0.9 : 0.5,
                      }
                    : {
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        left: thumbPct + "%",
                        height: "70%",
                        width: "3px",
                        opacity: active ? 0.9 : 0.5,
                      }
                }
              />
            </div>

            {/* Thumb / cap — rides above the track, centered in the lane */}
            <div
              className="absolute pointer-events-none"
              style={
                isVertical
                  ? {
                      left: "50%",
                      bottom: thumbPct + "%",
                      transform: "translate(-50%, 50%)",
                      width: "100%",
                    }
                  : {
                      top: "50%",
                      left: thumbPct + "%",
                      transform: "translate(-50%, -50%)",
                      height: "100%",
                    }
              }
            >
              <FaderCap
                isVertical={isVertical}
                active={active}
                dragging={dragging}
                uid={uid}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function FaderCap(inner: {
    isVertical: boolean;
    active: boolean;
    dragging: boolean;
    uid: string;
  }) {
    const { isVertical: iv, active: act, dragging: drg, uid: id } = inner;
    // The cap is a metallic slab with a bright indicator line across its middle.
    return (
      <div
        className={
          "relative flex items-center justify-center rounded-md border overflow-hidden " +
          "bg-gradient-to-b from-neutral-600 to-neutral-900 " +
          "transition-all duration-150 ease-out " +
          (act
            ? "border-amber-400/50 shadow-[0_0_16px_-2px] shadow-amber-500/60"
            : "border-neutral-500/40 shadow-md shadow-black/50")
        }
        style={
          iv
            ? {
                width: "180%",
                height: "22%",
                maxHeight: "34px",
                minHeight: "14px",
                marginLeft: "-40%",
                transform: drg ? "scale(1.06)" : "scale(1)",
              }
            : {
                height: "180%",
                width: "22%",
                maxWidth: "34px",
                minWidth: "14px",
                marginTop: "-40%",
                transform: drg ? "scale(1.06)" : "scale(1)",
              }
        }
      >
        {/* Top sheen */}
        <div
          className="absolute inset-x-0 top-0 bg-white/10"
          style={{ height: "40%" }}
        />
        {/* Indicator line across the grip */}
        <div
          className={
            "relative rounded-full transition-all duration-150 " +
            (act
              ? "bg-amber-300 shadow-[0_0_8px_0] shadow-amber-400/80"
              : "bg-amber-400/80")
          }
          style={
            iv
              ? { width: "78%", height: "2px" }
              : { height: "78%", width: "2px" }
          }
        />
        {/* Secondary grip grooves */}
        <div
          className="absolute rounded-full bg-black/40"
          style={
            iv
              ? {
                  width: "78%",
                  height: "1px",
                  top: "28%",
                  left: "11%",
                }
              : {
                  height: "78%",
                  width: "1px",
                  left: "28%",
                  top: "11%",
                }
          }
        />
        <div
          className="absolute rounded-full bg-black/40"
          style={
            iv
              ? {
                  width: "78%",
                  height: "1px",
                  bottom: "28%",
                  left: "11%",
                }
              : {
                  height: "78%",
                  width: "1px",
                  right: "28%",
                  top: "11%",
                }
          }
        />
      </div>
    );
  }
}