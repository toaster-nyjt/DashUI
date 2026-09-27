type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal'; detents?: number[] };

export const Fader_MIN = {"base":[2.2,7],"orientation:horizontal":[7,2.2]};

function FaderHandle(p: { vert: boolean; uid: string; active: boolean; hot: boolean }) {
  const { vert, uid, active, hot } = p;
  const vb = vert ? "0 0 44 21" : "0 0 21 44";
  const grips = [];
  for (let i = -2; i <= 2; i++) {
    if (vert) grips.push(<rect key={"g" + i} x={10} y={10.5 + i * 2.6 - 0.3} width={24} height={0.7} rx={0.35} fill="#ffffff" opacity={0.1} />);
    else grips.push(<rect key={"g" + i} x={10.5 + i * 2.6 - 0.3} y={10} width={0.7} height={24} rx={0.35} fill="#ffffff" opacity={0.1} />);
  }
  return (
    <svg viewBox={vb} preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <defs>
        <linearGradient id={uid + "-body"} x1="0" y1="0" x2={vert ? "0" : "1"} y2={vert ? "1" : "0"}>
          <stop offset="0%" stopColor="#3f3f46" />
          <stop offset="18%" stopColor="#27272a" />
          <stop offset="52%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id={uid + "-edge"} x1="0" y1="0" x2={vert ? "1" : "0"} y2={vert ? "0" : "1"}>
          <stop offset="0%" stopColor="#000" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={uid + "-line"} x1="0" y1="0" x2={vert ? "1" : "0"} y2={vert ? "0" : "1"}>
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
          <stop offset="35%" stopColor="#67e8f9" />
          <stop offset="65%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={vert ? 1 : 1} y={vert ? 1 : 1} width={vert ? 42 : 19} height={vert ? 19 : 42} rx={4} fill="#000" opacity="0.65" />
      <rect x={vert ? 1 : 1} y={vert ? 0.3 : 1} width={vert ? 42 : 19} height={vert ? 19 : 42} rx={4} fill={"url(#" + uid + "-body)"} />
      <rect x={vert ? 1.4 : 1.4} y={vert ? 0.7 : 1.4} width={vert ? 41.2 : 18.2} height={vert ? 18.2 : 41.2} rx={3.6} fill="none" stroke={"url(#" + uid + "-edge)"} strokeWidth="0.8" />
      {grips}
      <rect
        x={vert ? 3 : 9.6}
        y={vert ? 9.6 : 3}
        width={vert ? 38 : 1.8}
        height={vert ? 1.8 : 38}
        rx={0.9}
        fill={"url(#" + uid + "-line)"}
        opacity={active ? 1 : hot ? 0.85 : 0.6}
        style={{ transition: "opacity 200ms ease-out" }}
      />
      <rect
        x={vert ? 3 : 9.6}
        y={vert ? 9.6 : 3}
        width={vert ? 38 : 1.8}
        height={vert ? 1.8 : 38}
        rx={0.9}
        fill={"url(#" + uid + "-line)"}
        opacity={active ? 0.9 : 0}
        style={{ filter: "blur(2px)", transition: "opacity 200ms ease-out" }}
      />
      <rect x={vert ? 2 : 1.6} y={vert ? 1.2 : 2} width={vert ? 40 : 17.8} height={vert ? 1.1 : 40} rx={0.6} fill="#fff" opacity="0.12" />
    </svg>
  );
}

export function Fader(props: FaderProps) {
  const { min, max, value, onChange, detents } = props;
  const orientation = props.orientation || "vertical";
  const vert = orientation !== "horizontal";
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const travelRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const span = max - min || 1;
  const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
  const t = clamp01((value - min) / span);

  const HL = 1.05;
  const pad = HL / 2 + "rem";

  const apply = (clientX: number, clientY: number) => {
    const el = travelRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let ratio = vert ? 1 - (clientY - r.top) / (r.height || 1) : (clientX - r.left) / (r.width || 1);
    ratio = clamp01(ratio);
    let v = min + ratio * span;
    if (detents && detents.length) {
      let best: number | null = null;
      let bd = Infinity;
      for (const d of detents) {
        const dd = Math.abs((d - min) / span - ratio);
        if (dd < bd) { bd = dd; best = d; }
      }
      if (best != null && bd < 0.04) v = best;
    }
    onChange(v);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    apply(e.clientX, e.clientY);
  };
  const move = (e: any) => { if (drag) apply(e.clientX, e.clientY); };
  const up = (e: any) => {
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (err) {}
    setDrag(false);
  };

  const N = 21;
  const ticks = [];
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const major = i % 5 === 0;
    const pos = (vert ? (1 - f) : f) * 100 + "%";
    const len = major ? "0.46rem" : "0.26rem";
    const col = major ? "rgba(165,243,252,0.35)" : "rgba(255,255,255,0.13)";
    if (vert) {
      ticks.push(<div key={"tl" + i} className="absolute" style={{ top: pos, left: 0, width: len, height: "1px", background: col, transform: "translateY(-0.5px)" }} />);
      ticks.push(<div key={"tr" + i} className="absolute" style={{ top: pos, right: 0, width: len, height: "1px", background: col, transform: "translateY(-0.5px)" }} />);
    } else {
      ticks.push(<div key={"tt" + i} className="absolute" style={{ left: pos, top: 0, height: len, width: "1px", background: col, transform: "translateX(-0.5px)" }} />);
      ticks.push(<div key={"tb" + i} className="absolute" style={{ left: pos, bottom: 0, height: len, width: "1px", background: col, transform: "translateX(-0.5px)" }} />);
    }
  }

  const detentMarks = (detents || []).map((d, i) => {
    const f = clamp01((d - min) / span);
    const pos = (vert ? (1 - f) : f) * 100 + "%";
    const near = Math.abs(f - t) < 0.012;
    const style: any = vert
      ? { top: pos, left: 0, right: 0, height: "2px", transform: "translateY(-1px)" }
      : { left: pos, top: 0, bottom: 0, width: "2px", transform: "translateX(-1px)" };
    return (
      <div
        key={"d" + i}
        className="absolute rounded-full transition-all duration-200 ease-out"
        style={{
          ...style,
          background: near ? "linear-gradient(90deg,rgba(217,70,239,0),#f0abfc,rgba(217,70,239,0))" : "linear-gradient(90deg,rgba(217,70,239,0),rgba(217,70,239,0.5),rgba(217,70,239,0))",
          boxShadow: near ? "0 0 10px rgba(217,70,239,0.8)" : "0 0 4px rgba(217,70,239,0.25)",
          opacity: near ? 1 : 0.7,
        }}
      />
    );
  });

  const posPct = (vert ? (1 - t) : t) * 100 + "%";
  const trans = drag ? "all 60ms linear" : "all 260ms cubic-bezier(0.22,1,0.36,1)";

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative"
          style={vert ? { height: "100%", width: "100%", maxWidth: "3rem" } : { width: "100%", height: "100%", maxHeight: "3rem" }}
        >
          {/* graduation plate */}
          <div
            className="absolute"
            style={vert ? { top: pad, bottom: pad, left: 0, right: 0 } : { left: pad, right: pad, top: 0, bottom: 0 }}
          >
            {ticks}
          </div>

          {/* recessed slot */}
          <div
            className="absolute rounded-full bg-black/70 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/80 overflow-hidden"
            style={
              vert
                ? { top: 0, bottom: 0, left: "50%", width: "0.62rem", transform: "translateX(-50%)" }
                : { left: 0, right: 0, top: "50%", height: "0.62rem", transform: "translateY(-50%)" }
            }
          >
            <div
              className="absolute inset-0"
              style={{
                background: vert
                  ? "linear-gradient(90deg,rgba(0,0,0,0.9),rgba(255,255,255,0.06) 45%,rgba(0,0,0,0.9))"
                  : "linear-gradient(180deg,rgba(0,0,0,0.9),rgba(255,255,255,0.06) 45%,rgba(0,0,0,0.9))",
              }}
            />
            <div
              className="absolute rounded-full"
              style={
                vert
                  ? { left: "50%", width: "1px", top: "2%", bottom: "2%", transform: "translateX(-0.5px)", background: "linear-gradient(180deg,rgba(34,211,238,0.05),rgba(34,211,238,0.35),rgba(34,211,238,0.05))" }
                  : { top: "50%", height: "1px", left: "2%", right: "2%", transform: "translateY(-0.5px)", background: "linear-gradient(90deg,rgba(34,211,238,0.05),rgba(34,211,238,0.35),rgba(34,211,238,0.05))" }
              }
            />
          </div>

          {/* travel region (handle centers) */}
          <div
            ref={travelRef}
            className="absolute touch-none cursor-pointer"
            style={vert ? { top: pad, bottom: pad, left: 0, right: 0 } : { left: pad, right: pad, top: 0, bottom: 0 }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
          >
            {detentMarks}

            {/* bloom around handle */}
            <div
              className="absolute pointer-events-none"
              style={{
                ...(vert
                  ? { top: posPct, left: "50%", width: "3.2rem", height: "3.2rem" }
                  : { left: posPct, top: "50%", width: "3.2rem", height: "3.2rem" }),
                transform: "translate(-50%,-50%)",
                background: "radial-gradient(circle, rgba(217,70,239,0.55) 0%, rgba(217,70,239,0.16) 38%, rgba(217,70,239,0) 70%)",
                opacity: drag ? 1 : hover ? 0.55 : 0.22,
                filter: "blur(2px)",
                transition: trans,
              }}
            />

            {/* handle */}
            <div
              className="absolute pointer-events-none"
              style={{
                ...(vert
                  ? { top: posPct, left: "50%", width: "2.3rem", maxWidth: "100%", height: HL + "rem" }
                  : { left: posPct, top: "50%", height: "2.3rem", maxHeight: "100%", width: HL + "rem" }),
                transform: "translate(-50%,-50%) scale(" + (drag ? 1.07 : hover ? 1.03 : 1) + ")",
                transition: trans,
                filter: drag
                  ? "drop-shadow(0 0 12px rgba(217,70,239,0.7)) drop-shadow(0 4px 6px rgba(0,0,0,0.7))"
                  : "drop-shadow(0 3px 5px rgba(0,0,0,0.65))",
              }}
            >
              <FaderHandle vert={vert} uid={uid} active={drag} hot={hover} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}