type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[1.75,6],"orientation:horizontal":[6,1.75]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation || 'vertical';
  const vert = orientation === 'vertical';
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;
  const clamped = Math.min(Math.max(props.value, Math.min(min, max)), Math.max(min, max));
  const frac = Math.min(1, Math.max(0, (clamped - min) / span));

  const floor = (Fader_MIN as any)["orientation:" + orientation] || Fader_MIN.base;

  const emit = (clientX: number, clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let f: number;
    if (vert) f = r.height > 0 ? 1 - (clientY - r.top) / r.height : 0;
    else f = r.width > 0 ? (clientX - r.left) / r.width : 0;
    f = Math.min(1, Math.max(0, f));
    props.onChange(min + f * span);
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(true);
    emit(e.clientX, e.clientY);
  };
  const onMove = (e: any) => { if (drag) emit(e.clientX, e.clientY); };
  const onUp = (e: any) => {
    setDrag(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const ticks: number[] = [];
  for (let i = 0; i <= 10; i++) ticks.push(i / 10);

  const pct = (frac * 100) + "%";
  const active = drag || hover;

  return (
    <div
      className="h-full w-full relative select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div className={"absolute inset-0 flex items-center justify-center " + (vert ? "flex-row" : "flex-col")}>
        {/* tick rail */}
        <div
          className={"relative " + (vert ? "h-[86%] w-[0.3rem] mr-1" : "w-[92%] h-[0.3rem] mb-1")}
          style={{ opacity: 0.85 }}
        >
          {ticks.map((t, i) => (
            <div
              key={"tick-" + uid + "-" + i}
              className={"absolute " + (vert
                ? "left-0 h-px " + (i % 5 === 0 ? "w-full bg-amber-500/45" : "w-[60%] bg-stone-600/50")
                : "top-0 w-px " + (i % 5 === 0 ? "h-full bg-amber-500/45" : "h-[60%] bg-stone-600/50"))}
              style={vert ? { top: ((1 - t) * 100) + "%" } : { left: (t * 100) + "%" }}
            />
          ))}
        </div>

        {/* interactive track */}
        <div
          ref={trackRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className={"relative touch-none cursor-pointer " + (vert ? "h-[86%] w-[0.55rem]" : "w-[92%] h-[0.55rem]")}
        >
          {/* well */}
          <div className="absolute inset-0 rounded-full bg-black/70 border border-stone-800/70 shadow-inner shadow-black/70" />
          {/* fill */}
          <div
            className={"absolute rounded-full bg-gradient-to-t from-amber-600/70 to-amber-400 transition-all duration-150 ease-out " +
              (active ? "shadow-lg shadow-amber-500/40" : "shadow-md shadow-amber-500/20")}
            style={vert
              ? { left: "15%", right: "15%", bottom: 0, height: pct }
              : { top: "15%", bottom: "15%", left: 0, width: pct }}
          />
          {/* center detent glow */}
          <div
            className={"absolute bg-lime-400/60 transition-all duration-200 ease-out " +
              (vert ? "left-0 right-0 h-px" : "top-0 bottom-0 w-px")}
            style={vert ? { top: "50%" } : { left: "50%" }}
          />
          {/* thumb */}
          <div
            className="absolute transition-transform duration-150 ease-out"
            style={vert
              ? { left: "50%", top: (100 - frac * 100) + "%", transform: "translate(-50%,-50%) scale(" + (drag ? 1.12 : active ? 1.06 : 1) + ")" }
              : { top: "50%", left: pct, transform: "translate(-50%,-50%) scale(" + (drag ? 1.12 : active ? 1.06 : 1) + ")" }}
          >
            <div
              className={"rounded-md border bg-gradient-to-b from-stone-700 to-neutral-950 flex items-center justify-center gap-[2px] " +
                "transition-all duration-200 ease-out " +
                (active ? "border-amber-400/70 shadow-lg shadow-amber-500/40" : "border-amber-500/25 shadow-md shadow-black/60") +
                " " + (vert ? "w-[1.15rem] h-[0.72rem] flex-col" : "h-[1.15rem] w-[0.72rem] flex-row")}
            >
              <span className={"bg-amber-400/80 " + (vert ? "h-px w-[55%]" : "w-px h-[55%]")} />
              <span className={(drag ? "bg-lime-300 " : "bg-amber-500/50 ") + (vert ? "h-px w-[70%]" : "w-px h-[70%]")} />
              <span className={"bg-amber-400/80 " + (vert ? "h-px w-[55%]" : "w-px h-[55%]")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}