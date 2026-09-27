type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal'; detents?: number[] };

export const Fader_MIN = {"base":[2.5,7],"orientation:horizontal":[7,2.5]};

export function Fader(props: FaderProps) {
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const orientation = props.orientation || 'vertical';
  const vertical = orientation === 'vertical';
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;

  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const travelRef = useRef<HTMLDivElement | null>(null);

  const span = props.max - props.min || 1;
  const clamp = (v: number) => Math.max(props.min, Math.min(props.max, v));
  const frac = Math.max(0, Math.min(1, (clamp(props.value) - props.min) / span));

  const snap = (v: number) => {
    const d = props.detents;
    if (!d || d.length === 0) return v;
    const tol = Math.abs(span) * 0.035;
    let best = v;
    let bd = Infinity;
    for (let i = 0; i < d.length; i++) {
      const dist = Math.abs(d[i] - v);
      if (dist < bd) { bd = dist; best = d[i]; }
    }
    return bd <= tol ? best : v;
  };

  const posToValue = (clientX: number, clientY: number) => {
    const el = travelRef.current;
    if (!el) return props.value;
    const r = el.getBoundingClientRect();
    let f: number;
    if (vertical) f = r.height > 0 ? 1 - (clientY - r.top) / r.height : 0;
    else f = r.width > 0 ? (clientX - r.left) / r.width : 0;
    f = Math.max(0, Math.min(1, f));
    return snap(clamp(props.min + f * span));
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    props.onChange(posToValue(e.clientX, e.clientY));
  };
  const onMove = (e: any) => {
    if (!drag) return;
    props.onChange(posToValue(e.clientX, e.clientY));
  };
  const onUp = (e: any) => {
    if (!drag) return;
    setDrag(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  const TICKS = 25;
  const ticks = [];
  for (let i = 0; i < TICKS; i++) {
    const t = i / (TICKS - 1);
    const major = i % 6 === 0;
    const mid = i % 3 === 0;
    ticks.push(
      <div
        key={"tk-" + i}
        className={"absolute " + (major ? "bg-cyan-300/60" : mid ? "bg-white/25" : "bg-white/10")}
        style={
          vertical
            ? { left: 0, right: 0, top: (t * 100) + "%", height: major ? "2px" : "1px", transform: "translateY(-50%)" }
            : { top: 0, bottom: 0, left: (t * 100) + "%", width: major ? "2px" : "1px", transform: "translateX(-50%)" }
        }
      />
    );
  }

  const detentMarks = (props.detents || []).map((d, i) => {
    const f = Math.max(0, Math.min(1, (d - props.min) / span));
    const p = (vertical ? (1 - f) : f) * 100;
    return (
      <div
        key={"dt-" + i}
        className="absolute rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 drop-shadow-[0_0_6px_rgba(217,70,239,0.7)] transition-all duration-200 ease-out"
        style={
          vertical
            ? { left: "50%", top: p + "%", width: "0.36rem", height: "0.36rem", transform: "translate(-50%,-50%)" }
            : { top: "50%", left: p + "%", width: "0.36rem", height: "0.36rem", transform: "translate(-50%,-50%)" }
        }
      />
    );
  });

  const pos = (vertical ? (1 - frac) : frac) * 100;
  const handleLen = "1.5rem";
  const handleCross = "2rem";

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={uid + "-glow"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.15" />
          </linearGradient>
        </defs>
      </svg>

      {/* tick rail */}
      <div
        className="absolute"
        style={
          vertical
            ? { left: "6%", right: "58%", top: "0.75rem", bottom: "0.75rem" }
            : { top: "6%", bottom: "58%", left: "0.75rem", right: "0.75rem" }
        }
      >
        {ticks}
      </div>

      {/* slot */}
      <div
        className="absolute rounded-full bg-black/70 ring-1 ring-inset ring-cyan-400/15 shadow-inner shadow-black/80 overflow-hidden"
        style={
          vertical
            ? { left: "50%", top: 0, bottom: 0, width: "0.62rem", transform: "translateX(-50%)" }
            : { top: "50%", left: 0, right: 0, height: "0.62rem", transform: "translateY(-50%)" }
        }
      >
        <div
          className="absolute bg-gradient-to-t from-fuchsia-600/40 via-violet-500/25 to-cyan-400/30 transition-all duration-150 ease-out"
          style={
            vertical
              ? { left: 0, right: 0, bottom: 0, height: (frac * 100) + "%" }
              : { top: 0, bottom: 0, left: 0, width: (frac * 100) + "%" }
          }
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(0,0,0,0.5))] pointer-events-none" />
      </div>

      {/* travel region */}
      <div
        ref={travelRef}
        className="absolute"
        style={
          vertical
            ? { left: 0, right: 0, top: "0.75rem", bottom: "0.75rem" }
            : { top: 0, bottom: 0, left: "0.75rem", right: "0.75rem" }
        }
      >
        {detentMarks}

        {/* handle */}
        <div
          className={"absolute transition-[filter,transform] duration-150 ease-out " + (drag ? "scale-[1.06]" : hover ? "scale-[1.03]" : "")}
          style={
            vertical
              ? { left: "50%", top: pos + "%", width: handleCross, height: handleLen, transform: "translate(-50%,-50%)", transition: drag ? "none" : undefined }
              : { top: "50%", left: pos + "%", width: handleLen, height: handleCross, transform: "translate(-50%,-50%)", transition: drag ? "none" : undefined }
          }
        >
          <div
            className={
              "absolute inset-0 rounded-lg bg-gradient-to-b from-neutral-700 to-neutral-950 ring-1 ring-inset shadow-lg shadow-black/60 transition-all duration-200 ease-out " +
              (drag ? "ring-fuchsia-400 drop-shadow-[0_0_14px_rgba(217,70,239,0.7)]" : hover ? "ring-cyan-300/50 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]" : "ring-white/15")
            }
          />
          {/* grip lines */}
          <div
            className="absolute flex items-center justify-center gap-[2px]"
            style={vertical ? { inset: "18% 14%", flexDirection: "column" } : { inset: "14% 18%", flexDirection: "row" }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={"g-" + i}
                className="bg-white/20"
                style={vertical ? { height: "1px", width: "100%" } : { width: "1px", height: "100%" }}
              />
            ))}
          </div>
          {/* index line */}
          <div
            className={"absolute rounded-full transition-all duration-200 ease-out " + (drag || hover ? "bg-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.9)]" : "bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]")}
            style={
              vertical
                ? { left: "8%", right: "8%", top: "50%", height: "2px", transform: "translateY(-50%)" }
                : { top: "8%", bottom: "8%", left: "50%", width: "2px", transform: "translateX(-50%)" }
            }
          />
        </div>
      </div>
    </div>
  );
}