type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[1.75,6],"orientation:horizontal":[6,1.75]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation || 'vertical';
  const vert = orientation === 'vertical';
  const floor = (Fader_MIN as any)["orientation:" + orientation] || Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const travelRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const span = props.max - props.min || 1;
  const t = Math.max(0, Math.min(1, (props.value - props.min) / span));

  const apply = (e: any) => {
    const el = travelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let ratio = vert
      ? 1 - (e.clientY - r.top) / (r.height || 1)
      : (e.clientX - r.left) / (r.width || 1);
    ratio = Math.max(0, Math.min(1, ratio));
    props.onChange(props.min + ratio * span);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    apply(e);
  };
  const move = (e: any) => { if (drag) apply(e); };
  const up = (e: any) => {
    if (drag) { try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (err) {} }
    setDrag(false);
  };

  const ticks = [];
  for (let i = 0; i <= 8; i++) ticks.push(i);

  const active = drag || hover;
  const glow = drag
    ? "0 0 0 1px rgba(251,191,36,0.55), 0 0 14px 2px rgba(251,191,36,0.45)"
    : active
      ? "0 0 0 1px rgba(251,191,36,0.4), 0 0 10px 1px rgba(251,191,36,0.28)"
      : "0 2px 6px rgba(0,0,0,0.6)";

  const pct = (t * 100) + "%";

  return (
    <div
      className="relative h-full w-full touch-none select-none cursor-pointer"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* tick rail */}
      <div className={"absolute " + (vert ? "inset-y-[0.55rem] left-0 w-[30%] flex flex-col justify-between" : "inset-x-[0.55rem] bottom-0 h-[30%] flex flex-row-reverse justify-between items-end")}>
        {ticks.map((i) => (
          <div
            key={"tk-" + uid + "-" + i}
            className={"transition-all duration-200 ease-out " + (i % 4 === 0 ? "bg-amber-500/40" : "bg-stone-600/40") + " " + (vert ? "h-px " + (i % 4 === 0 ? "w-full" : "w-1/2") : "w-px " + (i % 4 === 0 ? "h-full" : "h-1/2"))}
          />
        ))}
      </div>

      {/* track well */}
      <div className={"absolute " + (vert ? "inset-y-0 left-1/2 -translate-x-1/2 w-[0.5rem]" : "inset-x-0 top-1/2 -translate-y-1/2 h-[0.5rem]") + " rounded-full bg-stone-950/80 border border-stone-800/70 shadow-inner shadow-black/70 overflow-hidden"}>
        <div
          className={"absolute transition-all duration-150 ease-out " + (vert ? "inset-x-0 bottom-0 bg-gradient-to-t" : "inset-y-0 left-0 bg-gradient-to-r") + " from-amber-600/50 via-amber-500/70 to-lime-400/80"}
          style={vert ? { height: pct } : { width: pct }}
        />
      </div>

      {/* travel region + thumb */}
      <div
        ref={travelRef}
        className={"absolute " + (vert ? "inset-y-[0.55rem] inset-x-0" : "inset-x-[0.55rem] inset-y-0")}
      >
        <div
          className="absolute transition-all duration-150 ease-out"
          style={
            vert
              ? { top: (100 - t * 100) + "%", left: "50%", transform: "translate(-50%,-50%) scale(" + (drag ? 1.12 : active ? 1.05 : 1) + ")", width: "1.4rem", height: "0.85rem" }
              : { left: pct, top: "50%", transform: "translate(-50%,-50%) scale(" + (drag ? 1.12 : active ? 1.05 : 1) + ")", height: "1.4rem", width: "0.85rem" }
          }
        >
          <div
            className="h-full w-full rounded-md border border-amber-500/40 bg-gradient-to-b from-stone-700 via-stone-800 to-neutral-950 transition-all duration-200 ease-out"
            style={{ boxShadow: glow }}
          >
            <div className={"absolute " + (vert ? "left-[12%] right-[12%] top-1/2 h-[2px] -translate-y-1/2" : "top-[12%] bottom-[12%] left-1/2 w-[2px] -translate-x-1/2") + " rounded-full transition-all duration-200 ease-out " + (drag ? "bg-lime-300" : active ? "bg-amber-300" : "bg-amber-400/80")} />
          </div>
        </div>
      </div>
    </div>
  );
}