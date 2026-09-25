type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[2,6],"orientation:horizontal":[6,2]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation || 'vertical';
  const horiz = orientation === 'horizontal';
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;
  const raw = (props.value - min) / span;
  const t = Math.max(0, Math.min(1, isFinite(raw) ? raw : 0));

  const emit = (clientX: number, clientY: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let f: number;
    if (horiz) f = r.width ? (clientX - r.left) / r.width : 0;
    else f = r.height ? 1 - (clientY - r.top) / r.height : 0;
    f = Math.max(0, Math.min(1, f));
    props.onChange(min + f * span);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(true);
    emit(e.clientX, e.clientY);
  };
  const move = (e: any) => { if (drag) emit(e.clientX, e.clientY); };
  const up = (e: any) => {
    setDrag(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const pct = (t * 100) + "%";
  const active = drag || hover;

  const ticks = [];
  for (let i = 0; i <= 8; i++) {
    const p = (i / 8) * 100;
    const major = i === 0 || i === 4 || i === 8;
    ticks.push(
      <div
        key={"tk-" + i}
        className={"absolute transition-all duration-200 ease-out " + (major ? "bg-amber-500/45" : "bg-stone-700/70")}
        style={
          horiz
            ? { left: p + "%", top: major ? "8%" : "20%", bottom: major ? "8%" : "20%", width: "1px", transform: "translateX(-0.5px)" }
            : { bottom: p + "%", left: major ? "8%" : "20%", right: major ? "8%" : "20%", height: "1px", transform: "translateY(0.5px)" }
        }
      />
    );
  }

  return (
    <div
      className="h-full w-full relative select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* tick gutter */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute" style={horiz ? { left: "6%", right: "6%", top: 0, bottom: 0 } : { top: "6%", bottom: "6%", left: 0, right: 0 }}>
          {ticks}
        </div>
      </div>

      <div
        ref={wrapRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="absolute touch-none cursor-pointer"
        style={horiz ? { left: "6%", right: "6%", top: 0, bottom: 0 } : { top: "6%", bottom: "6%", left: 0, right: 0 }}
      >
        {/* track well */}
        <div
          className={"absolute rounded-full bg-stone-950/80 border border-stone-800/70 shadow-inner shadow-black/70 transition-all duration-200 ease-out " + (active ? "border-amber-500/30" : "")}
          style={
            horiz
              ? { left: 0, right: 0, top: "50%", height: "0.42rem", transform: "translateY(-50%)" }
              : { top: 0, bottom: 0, left: "50%", width: "0.42rem", transform: "translateX(-50%)" }
          }
        >
          {/* fill */}
          <div
            className="absolute rounded-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-lg shadow-amber-500/30 transition-all duration-150 ease-out"
            style={
              horiz
                ? { left: 0, top: 0, bottom: 0, width: pct }
                : { bottom: 0, left: 0, right: 0, height: pct }
            }
          />
          {/* center detent glow */}
          <div
            className="absolute bg-lime-400/40 transition-all duration-200 ease-out"
            style={horiz ? { left: "50%", top: "-60%", bottom: "-60%", width: "1px" } : { bottom: "50%", left: "-60%", right: "-60%", height: "1px" }}
          />
        </div>

        {/* thumb */}
        <div
          className="absolute transition-all duration-150 ease-out"
          style={
            horiz
              ? { left: pct, top: "50%", transform: "translate(-50%,-50%)" }
              : { bottom: pct, left: "50%", transform: "translate(-50%,50%)" }
          }
        >
          <div
            className={
              "rounded-lg border-2 border-stone-700/80 bg-gradient-to-b from-neutral-700 to-neutral-950 shadow-lg shadow-black/50 flex items-center justify-center transition-all duration-200 ease-out " +
              (drag ? "border-amber-400/70 shadow-lg shadow-amber-500/40 scale-105" : active ? "border-amber-500/50 shadow-md shadow-amber-500/25" : "")
            }
            style={horiz ? { width: "0.85rem", height: "1.45rem" } : { width: "1.45rem", height: "0.85rem" }}
          >
            <div
              className="flex gap-[2px]"
              style={horiz ? { flexDirection: "row" } : { flexDirection: "column" }}
            >
              <div className={"rounded-full transition-all duration-200 ease-out " + (active ? "bg-amber-400" : "bg-stone-500")} style={horiz ? { width: "1px", height: "0.5rem" } : { height: "1px", width: "0.75rem" }} />
              <div className={"rounded-full transition-all duration-200 ease-out " + (active ? "bg-lime-300" : "bg-stone-600")} style={horiz ? { width: "1px", height: "0.5rem" } : { height: "1px", width: "0.75rem" }} />
              <div className={"rounded-full transition-all duration-200 ease-out " + (active ? "bg-amber-400" : "bg-stone-500")} style={horiz ? { width: "1px", height: "0.5rem" } : { height: "1px", width: "0.75rem" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}