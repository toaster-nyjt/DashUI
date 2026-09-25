type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[2,6],"orientation:horizontal":[6,2]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation ?? 'vertical';
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
  const frac = Math.max(0, Math.min(1, (clamped - min) / span));

  const pctFromEvent = (e: any) => {
    const el = trackRef.current;
    if (!el) return frac;
    const r = el.getBoundingClientRect();
    let f;
    if (horizontal) f = (e.clientX - r.left) / (r.width || 1);
    else f = 1 - (e.clientY - r.top) / (r.height || 1);
    return Math.max(0, Math.min(1, f));
  };

  const emit = (e: any) => {
    props.onChange(min + pctFromEvent(e) * span);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    emit(e);
  };
  const onMove = (e: any) => { if (drag) emit(e); };
  const onUp = (e: any) => {
    setDrag(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const pos = (frac * 100) + "%";
  const active = drag || hover;

  const ticks = [];
  for (let i = 0; i <= 8; i++) {
    const p = (i / 8) * 100 + "%";
    const major = i === 0 || i === 4 || i === 8;
    ticks.push(
      <div
        key={"tk-" + i}
        className={"absolute " + (major ? "bg-amber-500/45" : "bg-stone-700/60")}
        style={
          horizontal
            ? { left: p, top: major ? "8%" : "22%", bottom: major ? "8%" : "22%", width: "1px", transform: "translateX(-0.5px)" }
            : { top: p, left: major ? "8%" : "22%", right: major ? "8%" : "22%", height: "1px", transform: "translateY(-0.5px)" }
        }
      />
    );
  }

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className={"absolute inset-0 flex " + (horizontal ? "flex-col" : "flex-row") + " items-center justify-center"}>
        {/* tick gutter + track assembly */}
        <div className={"relative " + (horizontal ? "w-full h-full" : "h-full w-full") + " flex items-center justify-center"}>
          {/* ticks layer */}
          <div className={"absolute " + (horizontal ? "left-0 right-0 top-0 bottom-0" : "top-0 bottom-0 left-0 right-0") + " pointer-events-none opacity-70"}>
            <div className="absolute inset-0">{ticks}</div>
          </div>

          <div
            ref={trackRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            className={"relative touch-none cursor-pointer " + (horizontal ? "h-[0.9rem] w-full" : "w-[0.9rem] h-full")}
          >
            {/* well */}
            <div className={"absolute rounded-full bg-stone-950/80 border border-stone-800/70 shadow-inner shadow-black/70 transition-all duration-200 ease-out " +
              (horizontal ? "left-0 right-0 top-1/2 h-[0.45rem] -translate-y-1/2" : "top-0 bottom-0 left-1/2 w-[0.45rem] -translate-x-1/2")} />

            {/* fill */}
            <div
              className={"absolute rounded-full bg-gradient-to-" + (horizontal ? "r" : "t") +
                " from-amber-600/70 to-amber-400 transition-all duration-150 ease-out " +
                (active ? "shadow-lg shadow-amber-500/40" : "shadow-md shadow-black/40")}
              style={
                horizontal
                  ? { left: 0, width: pos, top: "50%", height: "0.45rem", transform: "translateY(-50%)" }
                  : { bottom: 0, height: pos, left: "50%", width: "0.45rem", transform: "translateX(-50%)" }
              }
            />

            {/* glow line */}
            <div
              className={"absolute pointer-events-none rounded-full bg-lime-400/80 transition-all duration-150 ease-out " + (active ? "opacity-100" : "opacity-0")}
              style={
                horizontal
                  ? { left: pos, top: "50%", height: "1.1rem", width: "2px", transform: "translate(-1px,-50%)" }
                  : { bottom: pos, left: "50%", width: "1.1rem", height: "2px", transform: "translate(-50%,1px)" }
              }
            />

            {/* thumb */}
            <div
              className="absolute transition-all duration-150 ease-out"
              style={
                horizontal
                  ? { left: pos, top: "50%", transform: "translate(-50%,-50%) scale(" + (drag ? 1.12 : hover ? 1.06 : 1) + ")" }
                  : { bottom: pos, left: "50%", transform: "translate(-50%,50%) scale(" + (drag ? 1.12 : hover ? 1.06 : 1) + ")" }
              }
            >
              <div
                className={"relative rounded-[0.3rem] border-2 border-stone-700/80 bg-gradient-to-b from-neutral-700 to-neutral-950 transition-all duration-200 ease-out " +
                  (active ? "shadow-lg shadow-amber-500/30 border-amber-400/50" : "shadow-lg shadow-black/50")}
                style={horizontal ? { width: "0.75rem", height: "1.35rem" } : { width: "1.35rem", height: "0.75rem" }}
              >
                <div
                  className={"absolute rounded-full transition-all duration-200 ease-out " + (active ? "bg-lime-400 shadow-md shadow-lime-400/40" : "bg-amber-400/80")}
                  style={horizontal ? { left: "50%", top: "12%", bottom: "12%", width: "2px", transform: "translateX(-1px)" } : { top: "50%", left: "12%", right: "12%", height: "2px", transform: "translateY(-1px)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <svg width="0" height="0" aria-hidden="true"><defs><linearGradient id={uid + "-g"} /></defs></svg>
    </div>
  );
}