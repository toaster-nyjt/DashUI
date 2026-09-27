type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal'; detents?: number[] };

export const Fader_MIN = {"base":[2,6],"orientation:horizontal":[6,2]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation || 'vertical';
  const vert = orientation === 'vertical';
  const floor = (Fader_MIN as any)["orientation:" + orientation] || Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const surfRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const span = props.max - props.min || 1;
  const clamp = (v: number) => Math.max(props.min, Math.min(props.max, v));
  const ratio = Math.max(0, Math.min(1, (clamp(props.value) - props.min) / span));

  const snap = (v: number) => {
    const d = props.detents;
    if (!d || d.length === 0) return v;
    let best = v;
    let bd = Infinity;
    for (let i = 0; i < d.length; i++) {
      const dist = Math.abs(d[i] - v);
      if (dist < bd) { bd = dist; best = d[i]; }
    }
    return bd <= Math.abs(span) * 0.035 ? best : v;
  };

  const fromEvent = (e: any) => {
    const el = surfRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const hr = handleRef.current ? handleRef.current.getBoundingClientRect() : null;
    const halfL = hr ? (vert ? hr.height : hr.width) / 2 : 0;
    const len = (vert ? r.height : r.width) - halfL * 2;
    if (len <= 0) return;
    const pos = vert ? (e.clientY - r.top - halfL) : (e.clientX - r.left - halfL);
    let rr = pos / len;
    if (vert) rr = 1 - rr;
    rr = Math.max(0, Math.min(1, rr));
    props.onChange(clamp(snap(props.min + rr * span)));
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(true);
    fromEvent(e);
  };
  const move = (e: any) => { if (drag) fromEvent(e); };
  const up = (e: any) => {
    setDrag(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const HL = "1.1rem";
  const trav = "calc(100% - " + HL + ")";
  const handlePos = vert
    ? { top: "calc(" + ((1 - ratio) * 100) + "% - " + ((1 - ratio) * 1.1) + "rem)", height: HL }
    : { left: "calc(" + (ratio * 100) + "% - " + (ratio * 1.1) + "rem)", width: HL };
  const fillLen = "calc(0.55rem + " + (ratio * 100) + "% - " + (ratio * 1.1) + "rem)";

  const ticks = (props.detents || []).map((d, i) => {
    const t = Math.max(0, Math.min(1, (d - props.min) / span));
    const off = "calc(0.55rem + " + (t * 100) + "% - " + (t * 1.1) + "rem)";
    const near = Math.abs(t - ratio) < 0.012;
    return (
      <div
        key={"dt-" + i}
        className={"absolute transition-all duration-200 ease-out " + (near ? "bg-fuchsia-300 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]" : "bg-white/25")}
        style={
          vert
            ? { bottom: off, left: "12%", right: "12%", height: near ? "2px" : "1px", transform: "translateY(50%)" }
            : { left: off, top: "12%", bottom: "12%", width: near ? "2px" : "1px", transform: "translateX(-50%)" }
        }
      />
    );
  });

  const grip = [0, 1, 2].map((i) => (
    <div
      key={"g-" + i}
      className={"rounded-full bg-black/45 transition-all duration-200 " + (vert ? "h-[1px] w-[55%]" : "w-[1px] h-[55%]")}
    />
  ));

  return (
    <div
      className="h-full w-full relative flex items-center justify-center select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        ref={surfRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={"relative touch-none cursor-pointer " + (vert ? "h-full w-[1.6rem]" : "w-full h-[1.6rem]")}
      >
        {/* groove */}
        <div
          className="absolute rounded-full bg-black/70 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/80"
          style={vert ? { top: 0, bottom: 0, left: "50%", width: "0.5rem", transform: "translateX(-50%)" } : { left: 0, right: 0, top: "50%", height: "0.5rem", transform: "translateY(-50%)" }}
        />
        {/* fill */}
        <div
          className={"absolute rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 transition-all ease-out " + (drag ? "duration-75 drop-shadow-[0_0_12px_rgba(217,70,239,0.7)]" : "duration-200 drop-shadow-[0_0_6px_rgba(217,70,239,0.45)]")}
          style={
            vert
              ? { bottom: 0, left: "50%", width: "0.5rem", height: fillLen, transform: "translateX(-50%)" }
              : { left: 0, top: "50%", height: "0.5rem", width: fillLen, transform: "translateY(-50%)" }
          }
        />
        {/* detents */}
        {ticks}
        {/* handle */}
        <div
          ref={handleRef}
          className={
            "absolute rounded-lg bg-gradient-to-b from-neutral-700 to-neutral-900 ring-1 ring-inset shadow-lg shadow-black/60 flex items-center justify-center transition-[box-shadow,transform,filter] ease-out duration-200 " +
            (vert ? "left-0 right-0 flex-col gap-[2px]" : "top-0 bottom-0 flex-row gap-[2px]") + " " +
            (drag
              ? "ring-fuchsia-400 brightness-125 drop-shadow-[0_0_14px_rgba(217,70,239,0.7)] scale-105"
              : hover
              ? "ring-fuchsia-400/50 brightness-110 drop-shadow-[0_0_10px_rgba(217,70,239,0.4)]"
              : "ring-white/10")
          }
          style={handlePos}
        >
          {grip}
          <div
            className={"absolute rounded-full transition-all duration-200 " + (drag || hover ? "bg-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]" : "bg-cyan-400/60")}
            style={vert ? { left: "8%", right: "8%", height: "2px" } : { top: "8%", bottom: "8%", width: "2px" }}
          />
        </div>
        <span className="hidden">{uid}</span>
      </div>
    </div>
  );
}