type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal'; detents?: number[] };

export const Fader_MIN = {"base":[2,6],"orientation:horizontal":[6,2]};

export function Fader(props: FaderProps) {
  const { min, max, value, onChange, detents } = props;
  const orientation = props.orientation || 'vertical';
  const vertical = orientation === 'vertical';
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const travelRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const span = max - min || 1;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const ratio = Math.max(0, Math.min(1, (clamp(value) - min) / span));

  const snap = (v: number) => {
    if (!detents || detents.length === 0) return v;
    const tol = span * 0.035;
    let best = v, bd = Infinity;
    for (let i = 0; i < detents.length; i++) {
      const d = Math.abs(detents[i] - v);
      if (d < bd) { bd = d; best = detents[i]; }
    }
    return bd <= tol ? best : v;
  };

  const fromEvent = (e: any) => {
    const el = travelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let t;
    if (vertical) t = r.height ? 1 - (e.clientY - r.top) / r.height : 0;
    else t = r.width ? (e.clientX - r.left) / r.width : 0;
    t = Math.max(0, Math.min(1, t));
    onChange(clamp(snap(min + t * span)));
  };

  const pos = (vertical ? (1 - ratio) : ratio) * 100;

  const capLong = "1.05rem";
  const capCross = "1.9rem";

  return (
    <div
      className="h-full w-full relative select-none touch-none"
      style={{ minWidth: (Fader_MIN as any)["orientation:" + orientation] ? (Fader_MIN as any)["orientation:" + orientation][0] + "rem" : Fader_MIN.base[0] + "rem", minHeight: (Fader_MIN as any)["orientation:" + orientation] ? (Fader_MIN as any)["orientation:" + orientation][1] + "rem" : Fader_MIN.base[1] + "rem" }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={(e) => {
        (e.currentTarget as any).setPointerCapture(e.pointerId);
        setDrag(true);
        fromEvent(e);
      }}
      onPointerMove={(e) => { if (drag) fromEvent(e); }}
      onPointerUp={(e) => { setDrag(false); try { (e.currentTarget as any).releasePointerCapture(e.pointerId); } catch (err) {} }}
      onPointerCancel={() => setDrag(false)}
    >
      <div className={"absolute inset-0 flex " + (vertical ? "flex-col items-center" : "flex-row items-center")}>
        {/* track shell */}
        <div
          className="relative rounded-full bg-black/70 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/80 transition-all duration-200 ease-out"
          style={vertical
            ? { height: "100%", width: "0.8rem" }
            : { width: "100%", height: "0.8rem" }}
        >
          {/* travel region */}
          <div
            ref={travelRef}
            className="absolute"
            style={vertical
              ? { left: 0, right: 0, top: "0.55rem", bottom: "0.55rem" }
              : { top: 0, bottom: 0, left: "0.55rem", right: "0.55rem" }}
          >
            {/* fill */}
            <div
              className={"absolute rounded-full transition-all duration-150 ease-out " + (vertical
                ? "bg-gradient-to-t from-cyan-500/70 to-fuchsia-400/80"
                : "bg-gradient-to-r from-cyan-500/70 to-fuchsia-400/80")}
              style={vertical
                ? { left: "22%", right: "22%", bottom: 0, height: (ratio * 100) + "%", opacity: drag ? 1 : 0.85, filter: drag ? "drop-shadow(0 0 8px rgba(217,70,239,0.7))" : "none" }
                : { top: "22%", bottom: "22%", left: 0, width: (ratio * 100) + "%", opacity: drag ? 1 : 0.85, filter: drag ? "drop-shadow(0 0 8px rgba(217,70,239,0.7))" : "none" }}
            />
            {/* detents */}
            {(detents || []).map((d, i) => {
              const t = Math.max(0, Math.min(1, (d - min) / span));
              const p = (vertical ? (1 - t) : t) * 100;
              const near = Math.abs(t - ratio) < 0.012;
              return (
                <div
                  key={"det-" + uid + "-" + i}
                  className={"absolute rounded-full transition-all duration-200 ease-out " + (near ? "bg-fuchsia-300" : "bg-white/25")}
                  style={vertical
                    ? { top: p + "%", left: "-0.5rem", right: "-0.5rem", height: "1px", transform: "translateY(-0.5px)", boxShadow: near ? "0 0 10px rgba(217,70,239,0.9)" : "none" }
                    : { left: p + "%", top: "-0.5rem", bottom: "-0.5rem", width: "1px", transform: "translateX(-0.5px)", boxShadow: near ? "0 0 10px rgba(217,70,239,0.9)" : "none" }}
                />
              );
            })}
            {/* handle */}
            <div
              className="absolute"
              style={vertical
                ? { top: pos + "%", left: "50%", transform: "translate(-50%,-50%)" }
                : { left: pos + "%", top: "50%", transform: "translate(-50%,-50%)" }}
            >
              <div
                className={"rounded-md bg-gradient-to-br from-neutral-700 to-neutral-900 ring-1 ring-inset ring-white/15 shadow-lg shadow-black/60 transition-[transform,box-shadow,filter] duration-150 ease-out " + (drag ? "brightness-125 scale-105" : hover ? "brightness-110" : "")}
                style={{
                  width: vertical ? capCross : capLong,
                  height: vertical ? capLong : capCross,
                  boxShadow: drag
                    ? "0 0 16px rgba(217,70,239,0.65), 0 4px 10px rgba(0,0,0,0.7)"
                    : "0 3px 8px rgba(0,0,0,0.6)"
                }}
              >
                <div className="relative h-full w-full overflow-hidden rounded-md">
                  {/* index line */}
                  <div
                    className={"absolute rounded-full transition-all duration-200 ease-out " + (drag ? "bg-fuchsia-300" : "bg-cyan-300/80")}
                    style={vertical
                      ? { left: "8%", right: "8%", top: "50%", height: "2px", transform: "translateY(-1px)", boxShadow: "0 0 8px rgba(34,211,238,0.6)" }
                      : { top: "8%", bottom: "8%", left: "50%", width: "2px", transform: "translateX(-1px)", boxShadow: "0 0 8px rgba(34,211,238,0.6)" }}
                  />
                  {/* grip ribs */}
                  {[0, 1].map((k) => (
                    <div
                      key={"rib-" + uid + "-" + k}
                      className="absolute bg-white/10"
                      style={vertical
                        ? { left: "14%", right: "14%", top: k === 0 ? "26%" : "70%", height: "1px" }
                        : { top: "14%", bottom: "14%", left: k === 0 ? "26%" : "70%", width: "1px" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}