type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[1.75,5],"orientation:horizontal":[5,1.75]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation || 'vertical';
  const horizontal = orientation === 'horizontal';
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;
  const clamped = Math.max(Math.min(props.value, Math.max(min, max)), Math.min(min, max));
  const ratio = Math.max(0, Math.min(1, (clamped - min) / span));

  const commit = (e: { clientX: number; clientY: number }) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let t;
    if (horizontal) t = (e.clientX - r.left) / (r.width || 1);
    else t = 1 - (e.clientY - r.top) / (r.height || 1);
    t = Math.max(0, Math.min(1, t));
    props.onChange(min + t * span);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    commit(e);
  };
  const onMove = (e: any) => { if (drag) commit(e); };
  const onUp = (e: any) => {
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (err) {}
    setDrag(false);
  };

  const pct = (ratio * 100) + "%";
  const ticks: number[] = [];
  for (let i = 0; i <= 8; i++) ticks.push(i);

  const active = drag || hover;
  const glow = drag
    ? "shadow-lg shadow-amber-500/40"
    : hover
    ? "shadow-md shadow-amber-500/30"
    : "shadow-md shadow-black/40";

  return (
    <div
      className="h-full w-full relative select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* tick rail */}
      <div className={"absolute inset-0 flex " + (horizontal ? "flex-col" : "flex-row") + " items-stretch"}>
        <div className={"relative " + (horizontal ? "w-full flex-1 min-h-0" : "h-full flex-1 min-w-0")}>
          <div
            className={
              "absolute " +
              (horizontal
                ? "left-[6%] right-[6%] top-[18%] bottom-[18%] flex flex-row justify-between items-start"
                : "top-[6%] bottom-[6%] left-[18%] right-[18%] flex flex-col justify-between items-start")
            }
          >
            {ticks.map((i) => (
              <div
                key={"tick-" + uid + "-" + i}
                className={
                  "transition-all duration-200 ease-out rounded-full " +
                  (i === 4 ? "bg-amber-500/40 " : "bg-stone-700/70 ") +
                  (horizontal
                    ? (i === 4 ? "w-px h-full" : "w-px h-1/2")
                    : (i === 4 ? "h-px w-full" : "h-px w-1/2"))
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* track */}
      <div
        ref={trackRef}
        className={
          "absolute " +
          (horizontal
            ? "left-[6%] right-[6%] top-1/2 -translate-y-1/2 h-[26%]"
            : "top-[6%] bottom-[6%] left-1/2 -translate-x-1/2 w-[26%]") +
          " rounded-full border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden transition-all duration-200 ease-out"
        }
      >
        <div
          className={
            "absolute rounded-full transition-all duration-150 ease-out bg-gradient-to-" +
            (horizontal ? "r" : "t") +
            " from-amber-600/40 via-amber-500/70 to-amber-400 " +
            (drag ? "opacity-100" : "opacity-80")
          }
          style={
            horizontal
              ? { left: 0, top: 0, bottom: 0, width: pct }
              : { left: 0, right: 0, bottom: 0, height: pct }
          }
        />
        <div
          className={
            "absolute rounded-full bg-lime-300 transition-all duration-150 ease-out " +
            (drag ? "opacity-90" : "opacity-0")
          }
          style={
            horizontal
              ? { top: 0, bottom: 0, left: pct, width: "2px", transform: "translateX(-1px)" }
              : { left: 0, right: 0, bottom: pct, height: "2px", transform: "translateY(1px)" }
          }
        />
      </div>

      {/* thumb */}
      <div
        className="absolute transition-all duration-150 ease-out"
        style={
          horizontal
            ? { left: "calc(6% + " + ratio + " * 88%)", top: "50%", transform: "translate(-50%,-50%)", width: "22%", height: "78%" }
            : { bottom: "calc(6% + " + ratio + " * 88%)", left: "50%", transform: "translate(-50%,50%)", height: "22%", width: "78%" }
        }
      >
        <div
          className={
            "h-full w-full rounded-md border border-amber-500/40 bg-gradient-to-b from-neutral-700/90 to-neutral-950 " +
            glow +
            " transition-all duration-200 ease-out " +
            (drag ? "scale-105 border-amber-400/70" : active ? "border-amber-400/60" : "")
          }
        >
          <div
            className={
              "absolute rounded-full transition-all duration-200 ease-out " +
              (drag ? "bg-lime-300 shadow-lg shadow-lime-400/40" : "bg-amber-400 shadow-md shadow-amber-500/30") +
              (horizontal ? " left-1/2 -translate-x-1/2 top-[14%] bottom-[14%] w-[14%]" : " top-1/2 -translate-y-1/2 left-[14%] right-[14%] h-[14%]")
            }
          />
        </div>
      </div>
    </div>
  );
}