type FaderProps = {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  orientation?: "vertical" | "horizontal";
};

export const Fader_MIN = { "base": [1.6, 6], "orientation:horizontal": [6, 1.6] };

export function Fader(props: FaderProps) {
  const orientation = props.orientation ?? "vertical";
  const isH = orientation === "horizontal";
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;

  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  const span = props.max - props.min || 1;
  const raw = (props.value - props.min) / span;
  const t = Math.max(0, Math.min(1, raw)); // 0..1 along the value axis
  // For vertical, higher value = higher up (top). For horizontal, higher value = right.
  const posPct = isH ? t * 100 : (1 - t) * 100;

  const emit = (clientX: number, clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let frac: number;
    if (isH) {
      frac = (clientX - r.left) / (r.width || 1);
    } else {
      frac = 1 - (clientY - r.top) / (r.height || 1);
    }
    frac = Math.max(0, Math.min(1, frac));
    props.onChange(props.min + frac * span);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    emit(e.clientX, e.clientY);
  };
  const onMove = (e: any) => {
    if (!dragging) return;
    emit(e.clientX, e.clientY);
  };
  const onUp = (e: any) => {
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // Number of detent ticks along the rail
  const TICKS = 11;
  const ticks = [];
  for (let i = 0; i < TICKS; i++) ticks.push(i / (TICKS - 1));
  const center = Math.abs(t - 0.5) < 0.02;

  const active = dragging || hovering;

  // Shared color language: amber accent, lime when at center detent / dragging peak feel
  const glowColor = dragging ? "rgba(163,230,53,0.55)" : "rgba(245,158,11,0.45)";

  const FaderTrack = (
    <div
      ref={trackRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      className={
        "relative touch-none cursor-pointer select-none " +
        (isH ? "h-full w-full flex items-center" : "w-full h-full flex justify-center")
      }
    >
      {/* Rail well */}
      <div
        className={
          "absolute rounded-full border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden transition-all duration-200 ease-out " +
          (isH
            ? "left-0 right-0 top-1/2 -translate-y-1/2 h-[26%]"
            : "top-0 bottom-0 left-1/2 -translate-x-1/2 w-[26%]")
        }
      >
        {/* Filled travel */}
        <div
          className={
            "absolute transition-all duration-150 ease-out " +
            (isH ? "top-0 bottom-0 left-0" : "left-0 right-0 bottom-0")
          }
          style={
            isH
              ? {
                  width: posPct + "%",
                  background:
                    "linear-gradient(90deg, rgba(120,53,15,0.5), rgba(245,158,11,0.85))",
                }
              : {
                  height: t * 100 + "%",
                  background:
                    "linear-gradient(0deg, rgba(120,53,15,0.5), rgba(245,158,11,0.85))",
                }
          }
        />
        {/* moving sheen */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: isH
              ? "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(0,0,0,0.35))"
              : "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(0,0,0,0.35))",
          }}
        />
      </div>

      {/* Detent ticks */}
      <div className="absolute inset-0 pointer-events-none">
        {ticks.map((tk, i) => {
          const isMid = i === (TICKS - 1) / 2;
          const style: any = isH
            ? {
                left: tk * 100 + "%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                height: isMid ? "62%" : "40%",
                width: "2px",
              }
            : {
                top: (1 - tk) * 100 + "%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: isMid ? "62%" : "40%",
                height: "2px",
              };
          return (
            <span
              key={"tick-" + i}
              className={
                "absolute rounded-full transition-colors duration-200 " +
                (isMid ? "bg-amber-500/40" : "bg-stone-600/40")
              }
              style={style}
            />
          );
        })}
      </div>

      {/* Thumb */}
      <div
        className="absolute pointer-events-none transition-all duration-150 ease-out"
        style={
          isH
            ? {
                left: posPct + "%",
                top: "50%",
                transform:
                  "translate(-50%,-50%) scale(" + (dragging ? 1.08 : active ? 1.04 : 1) + ")",
                height: "86%",
                aspectRatio: "5 / 8",
              }
            : {
                top: posPct + "%",
                left: "50%",
                transform:
                  "translate(-50%,-50%) scale(" + (dragging ? 1.08 : active ? 1.04 : 1) + ")",
                width: "86%",
                aspectRatio: "8 / 5",
              }
        }
      >
        <div
          className={
            "relative h-full w-full rounded-md border-2 transition-all duration-200 ease-out " +
            (center
              ? "border-lime-400/70"
              : active
              ? "border-amber-400/70"
              : "border-stone-700/80")
          }
          style={{
            background:
              "linear-gradient(155deg, #3f3f46 0%, #27272a 45%, #18181b 100%)",
            boxShadow:
              (active
                ? "0 0 14px " + glowColor + ", "
                : "") +
              "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -2px 4px rgba(0,0,0,0.7), 0 4px 10px rgba(0,0,0,0.55)",
          }}
        >
          {/* Grip line across the middle */}
          <div
            className={
              "absolute rounded-full transition-colors duration-200 " +
              (center ? "bg-lime-400" : active ? "bg-amber-400" : "bg-amber-500/70")
            }
            style={
              isH
                ? {
                    left: "50%",
                    top: "18%",
                    bottom: "18%",
                    width: "2px",
                    transform: "translateX(-50%)",
                    boxShadow: active ? "0 0 8px " + glowColor : "none",
                  }
                : {
                    top: "50%",
                    left: "18%",
                    right: "18%",
                    height: "2px",
                    transform: "translateY(-50%)",
                    boxShadow: active ? "0 0 8px " + glowColor : "none",
                  }
            }
          />
          {/* subtle secondary grip lines */}
          <div
            className="absolute bg-black/40"
            style={
              isH
                ? { left: "34%", top: "26%", bottom: "26%", width: "1px" }
                : { top: "34%", left: "26%", right: "26%", height: "1px" }
            }
          />
          <div
            className="absolute bg-black/40"
            style={
              isH
                ? { left: "66%", top: "26%", bottom: "26%", width: "1px" }
                : { top: "66%", left: "26%", right: "26%", height: "1px" }
            }
          />
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {FaderTrack}
    </div>
  );
}