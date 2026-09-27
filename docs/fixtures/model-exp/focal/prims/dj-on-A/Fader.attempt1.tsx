type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal'; detents?: number[] };

export const Fader_MIN = {"base":[2.2,7],"orientation:horizontal":[7,2.2]};

export function Fader(props: FaderProps) {
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const orientation = props.orientation ?? "vertical";
  const vertical = orientation !== "horizontal";
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;

  const railRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const span = props.max - props.min || 1;
  const clamp = (v: number) => Math.max(props.min, Math.min(props.max, v));
  const frac = Math.max(0, Math.min(1, (clamp(props.value) - props.min) / span));

  // value-change pulse
  const [pulse, setPulse] = useState(0);
  const lastVal = useRef(props.value);
  useEffect(() => {
    if (lastVal.current !== props.value) {
      lastVal.current = props.value;
      setPulse((p) => p + 1);
    }
  }, [props.value]);

  const detents = props.detents;
  const snap = (v: number) => {
    if (!detents || detents.length === 0) return v;
    let best = v;
    let bestD = Infinity;
    for (const d of detents) {
      const dd = Math.abs(d - v);
      if (dd < bestD) { bestD = dd; best = d; }
    }
    return bestD <= Math.abs(span) * 0.035 ? best : v;
  };

  const emit = (e: any) => {
    const el = railRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    let t = vertical ? 1 - (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
    t = Math.max(0, Math.min(1, t));
    props.onChange(clamp(snap(props.min + t * span)));
  };

  const TICKS = 21;
  const ticks = [];
  for (let i = 0; i < TICKS; i++) {
    const t = i / (TICKS - 1);
    const major = i % 5 === 0;
    const lit = t <= frac + 0.001;
    const pos = (vertical ? (1 - t) : t) * 100 + "%";
    const len = major ? "30%" : "16%";
    const common = "absolute transition-all duration-200 ease-out " +
      (lit ? "bg-cyan-300/80 shadow-[0_0_6px_rgba(34,211,238,0.6)]" : "bg-white/15");
    if (vertical) {
      ticks.push(<div key={"tl" + i} className={common} style={{ top: pos, left: 0, width: len, height: major ? 2 : 1, transform: "translateY(-50%)", borderRadius: 2 }} />);
      ticks.push(<div key={"tr" + i} className={common} style={{ top: pos, right: 0, width: len, height: major ? 2 : 1, transform: "translateY(-50%)", borderRadius: 2 }} />);
    } else {
      ticks.push(<div key={"tt" + i} className={common} style={{ left: pos, top: 0, height: len, width: major ? 2 : 1, transform: "translateX(-50%)", borderRadius: 2 }} />);
      ticks.push(<div key={"tb" + i} className={common} style={{ left: pos, bottom: 0, height: len, width: major ? 2 : 1, transform: "translateX(-50%)", borderRadius: 2 }} />);
    }
  }

  const detentMarks = (detents ?? []).map((d, i) => {
    const t = Math.max(0, Math.min(1, (d - props.min) / span));
    const near = Math.abs(t - frac) < 0.012;
    const pos = (vertical ? (1 - t) : t) * 100 + "%";
    const style: any = vertical
      ? { top: pos, left: "50%", transform: "translate(-50%,-50%) rotate(45deg)" }
      : { left: pos, top: "50%", transform: "translate(-50%,-50%) rotate(45deg)" };
    return (
      <div
        key={"det" + i}
        className={"absolute w-[0.34rem] h-[0.34rem] rounded-[2px] transition-all duration-200 ease-out " +
          (near ? "bg-fuchsia-400 ring-1 ring-fuchsia-200/60 drop-shadow-[0_0_10px_rgba(217,70,239,0.9)] scale-125" : "bg-fuchsia-500/35 ring-1 ring-inset ring-fuchsia-300/20")}
        style={style}
      />
    );
  });

  const grooveCross = vertical
    ? { left: "50%", transform: "translateX(-50%)", width: "0.7rem", top: 0, bottom: 0 }
    : { top: "50%", transform: "translateY(-50%)", height: "0.7rem", left: 0, right: 0 };

  const fillStyle: any = vertical
    ? { left: "50%", transform: "translateX(-50%)", width: "0.7rem", bottom: 0, height: frac * 100 + "%" }
    : { top: "50%", transform: "translateY(-50%)", height: "0.7rem", left: 0, width: frac * 100 + "%" };

  const handlePos: any = vertical
    ? { top: (1 - frac) * 100 + "%", left: "50%", width: "1.9rem", height: "1.1rem" }
    : { left: frac * 100 + "%", top: "50%", width: "1.1rem", height: "1.9rem" };

  const handleTransform = "translate(-50%,-50%) scale(" + (drag ? 1.08 : hover ? 1.03 : 1) + ")";

  const grips = [0, 1, 2, 3].map((i) => (
    <div
      key={"g" + i}
      className="absolute bg-black/50 shadow-[0_1px_0_rgba(255,255,255,0.08)]"
      style={vertical
        ? { left: "14%", right: "14%", height: 1, top: (26 + i * 16) + "%" }
        : { top: "14%", bottom: "14%", width: 1, left: (26 + i * 16) + "%" }}
    />
  ));

  return (
    <div className="relative h-full w-full select-none" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <linearGradient id={uid + "-fill"} x1="0" y1={vertical ? "1" : "0"} x2={vertical ? "0" : "1"} y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>

      {/* interactive surface */}
      <div
        className="absolute inset-0 touch-none cursor-pointer"
        onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture(e.pointerId); setDrag(true); emit(e); }}
        onPointerMove={(e) => { if (drag) emit(e); }}
        onPointerUp={(e) => { try { (e.currentTarget as any).releasePointerCapture(e.pointerId); } catch (err) {} setDrag(false); }}
        onPointerCancel={() => setDrag(false)}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        {/* rail area, inset along length so handle never clips */}
        <div
          ref={railRef}
          className="absolute"
          style={vertical
            ? { left: 0, right: 0, top: "0.75rem", bottom: "0.75rem" }
            : { top: 0, bottom: 0, left: "0.75rem", right: "0.75rem" }}
        >
          {ticks}

          {/* groove */}
          <div
            className="absolute rounded-full bg-black/80 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/90 overflow-hidden"
            style={grooveCross}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.9),rgba(255,255,255,0.05),rgba(0,0,0,0.9))]" />
          </div>

          {/* energised fill */}
          <div
            className={"absolute rounded-full transition-[height,width] duration-150 ease-out " + (drag ? "" : "duration-300")}
            style={{
              ...fillStyle,
              background: "linear-gradient(" + (vertical ? "0deg" : "90deg") + ",#22d3ee 0%,#818cf8 60%,#d946ef 100%)",
              boxShadow: "0 0 14px rgba(34,211,238,0.45), inset 0 0 6px rgba(255,255,255,0.35)",
              opacity: 0.9,
            }}
          />

          {detentMarks}

          {/* handle */}
          <div
            className="absolute"
            style={{
              ...handlePos,
              transform: handleTransform,
              transition: drag ? "transform 90ms ease-out" : "transform 320ms cubic-bezier(.22,1.2,.36,1), top 320ms cubic-bezier(.22,1.2,.36,1), left 320ms cubic-bezier(.22,1.2,.36,1)",
            }}
          >
            {/* glow halo */}
            <div
              key={"pulse-" + pulse}
              className="absolute -inset-[35%] rounded-xl motion-safe:animate-[ping_600ms_ease-out_1]"
              style={{ background: "radial-gradient(circle, rgba(217,70,239,0.35) 0%, rgba(217,70,239,0) 70%)" }}
            />
            <div
              className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/15 shadow-lg shadow-black/60 transition-all duration-200 ease-out"
              style={{
                backgroundImage: "linear-gradient(to bottom,#3f3f46,#18181b 55%,#09090b)",
                boxShadow: (drag || hover)
                  ? "0 0 16px rgba(217,70,239,0.55), 0 6px 10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.22)"
                  : "0 4px 8px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.14)",
              }}
            />
            {grips}
            {/* center indicator line */}
            <div
              className="absolute rounded-full transition-all duration-200 ease-out"
              style={vertical
                ? { left: "8%", right: "8%", height: "0.14rem", top: "50%", transform: "translateY(-50%)" }
                : { top: "8%", bottom: "8%", width: "0.14rem", left: "50%", transform: "translateX(-50%)" },
              }
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(" + (vertical ? "90deg" : "0deg") + ",#22d3ee,#f0abfc)",
                  boxShadow: drag ? "0 0 12px rgba(240,171,252,0.95)" : "0 0 7px rgba(34,211,238,0.75)",
                }}
              />
            </div>
            {/* top gloss */}
            <div
              className="absolute rounded-lg pointer-events-none"
              style={{ left: "6%", right: "6%", top: "6%", height: "28%", background: "linear-gradient(to bottom,rgba(255,255,255,0.18),rgba(255,255,255,0))" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}