type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[1.75,6],"orientation:horizontal":[6,1.75]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation ?? 'vertical';
  const vert = orientation === 'vertical';
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;

  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const min = props.min;
  const max = props.max;
  const span = max - min === 0 ? 1 : max - min;
  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const t = clamp01((props.value - min) / span);

  const emit = (e: { clientX: number; clientY: number }) => {
    const el = areaRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const ratio = vert
      ? 1 - clamp01((e.clientY - r.top) / r.height)
      : clamp01((e.clientX - r.left) / r.width);
    props.onChange(min + ratio * span);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    emit(e);
  };
  const move = (e: any) => { if (drag) emit(e); };
  const up = (e: any) => {
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (err) {}
    setDrag(false);
  };

  const pct = (t * 100).toFixed(3) + "%";
  const active = drag || hover;

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div
      className="h-full w-full relative select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        ref={areaRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={
          "absolute touch-none cursor-pointer transition-all duration-200 ease-out " +
          (vert ? "inset-y-[4%] left-0 right-0" : "inset-x-[4%] top-0 bottom-0")
        }
      >
        {/* tick gutter */}
        <div className="absolute inset-0 pointer-events-none">
          {ticks.map((tk, i) => (
            <div
              key={"tk-" + uid + "-" + i}
              className={
                "absolute transition-all duration-200 ease-out " +
                (tk === 0.5 ? "bg-amber-500/40" : "bg-stone-700/70") +
                (vert
                  ? " h-[1px] w-[min(70%,1.5rem)] left-1/2 -translate-x-1/2"
                  : " w-[1px] h-[min(70%,1.5rem)] top-1/2 -translate-y-1/2")
              }
              style={
                vert
                  ? { top: (100 - tk * 100) + "%" }
                  : { left: (tk * 100) + "%" }
              }
            />
          ))}
        </div>

        {/* track well */}
        <div
          className={
            "absolute bg-stone-950/80 border border-stone-800/70 rounded-full shadow-inner shadow-black/70 transition-all duration-200 ease-out " +
            (vert
              ? "top-0 bottom-0 left-1/2 -translate-x-1/2 w-[min(34%,0.7rem)]"
              : "left-0 right-0 top-1/2 -translate-y-1/2 h-[min(34%,0.7rem)]")
          }
        >
          {/* fill */}
          <div
            className={
              "absolute rounded-full transition-all duration-150 ease-out bg-gradient-to-t from-amber-600/70 via-amber-500/80 to-lime-400/80 " +
              (active ? "shadow-lg shadow-amber-500/30 brightness-110" : "") +
              (vert ? " bottom-0 left-0 right-0" : " left-0 top-0 bottom-0")
            }
            style={vert ? { height: pct } : { width: pct }}
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-amber-500/10 pointer-events-none" />
        </div>

        {/* thumb */}
        <div
          className={
            "absolute transition-all duration-150 ease-out " +
            (vert
              ? "left-1/2 w-[min(95%,2.1rem)] h-[min(13%,1rem)]"
              : "top-1/2 h-[min(95%,2.1rem)] w-[min(13%,1rem)]")
          }
          style={
            vert
              ? { top: (100 - t * 100) + "%", transform: "translate(-50%,-50%) scale(" + (drag ? 1.08 : hover ? 1.04 : 1) + ")" }
              : { left: pct, transform: "translate(-50%,-50%) scale(" + (drag ? 1.08 : hover ? 1.04 : 1) + ")" }
          }
        >
          <div
            className={
              "h-full w-full rounded-md border-2 bg-gradient-to-b from-neutral-700 to-neutral-950 transition-all duration-200 ease-out " +
              (active
                ? "border-amber-400/60 shadow-lg shadow-amber-500/40"
                : "border-stone-700/80 shadow-md shadow-black/60")
            }
          >
            <div
              className={
                "absolute rounded-full transition-all duration-200 ease-out " +
                (active ? "bg-lime-400 shadow-lg shadow-lime-400/40" : "bg-amber-500/80") +
                (vert
                  ? " left-[15%] right-[15%] top-1/2 h-[2px] -translate-y-1/2"
                  : " top-[15%] bottom-[15%] left-1/2 w-[2px] -translate-x-1/2")
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}