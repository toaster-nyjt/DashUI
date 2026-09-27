type ZoomControlProps = { value: number; min: number; max: number; step?: number; onChange: (zoom: number) => void; onReset?: () => void };

export const ZoomControl_MIN = {"base":[2.25,7.5]};

export function ZoomControl(props: ZoomControlProps) {
  const { value, min, max, step, onChange, onReset } = props;
  const uid = useRef("zoomcontrol-" + Math.random().toString(36).slice(2)).current;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [pulse, setPulse] = useState(0);

  const span = Math.max(1e-6, max - min);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => {
    if (!step || step <= 0) return clamp(v);
    const n = Math.round((v - min) / step);
    return clamp(min + n * step);
  };
  const frac = Math.min(1, Math.max(0, (clamp(value) - min) / span));

  useEffect(() => { setPulse((p) => p + 1); }, [value]);

  const emit = (v: number) => { const nv = snap(v); if (nv !== value) onChange(nv); };
  const stepAmt = step && step > 0 ? step : span / 8;

  const fromPointer = (e: any) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.height <= 0) return;
    const f = 1 - (e.clientY - r.top) / r.height;
    emit(min + Math.min(1, Math.max(0, f)) * span);
  };

  const ticks: number[] = [];
  if (step && step > 0) {
    const n = Math.round(span / step);
    if (n > 1 && n <= 24) for (let i = 0; i <= n; i++) ticks.push(i / n);
  }

  const btn =
    "relative w-full flex items-center justify-center border border-cyan-300/40 bg-neutral-800/80 text-cyan-300 " +
    "transition-all duration-200 ease-out hover:bg-cyan-300 hover:text-black hover:border-cyan-200 " +
    "hover:shadow-[0_0_16px_rgba(34,211,238,0.5)] active:scale-[0.94] active:brightness-110 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 disabled:opacity-40 disabled:grayscale";

  const Glyph = (p: { kind: "plus" | "minus" | "reset" }) => (
    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-[70%] w-[70%]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square">
      {p.kind === "plus" ? <g><path d="M12 5.5v13" /><path d="M5.5 12h13" /></g> : null}
      {p.kind === "minus" ? <path d="M5.5 12h13" /> : null}
      {p.kind === "reset" ? <g><path d="M12 6.5a5.5 5.5 0 1 1-5.2 3.7" /><path d="M6.2 5.2v5h5" /></g> : null}
    </svg>
  );

  return (
    <div
      className="h-full w-full flex flex-col items-center justify-stretch"
      style={{ minWidth: ZoomControl_MIN.base[0] + "rem", minHeight: ZoomControl_MIN.base[1] + "rem" }}
    >
      <div className="h-full flex flex-col items-stretch gap-[2%] w-full" style={{ maxWidth: "3.25rem" }}>
        <button
          type="button"
          aria-label="zoom in"
          disabled={value >= max - 1e-9}
          onClick={() => emit(value + stepAmt)}
          className={btn}
          style={{ height: "1.6rem", flex: "0 0 auto" }}
        >
          <Glyph kind="plus" />
        </button>

        <div
          ref={trackRef}
          onPointerDown={(e) => { (e.target as any).setPointerCapture?.(e.pointerId); setDrag(true); fromPointer(e); }}
          onPointerMove={(e) => { if (drag) fromPointer(e); }}
          onPointerUp={() => setDrag(false)}
          onPointerCancel={() => setDrag(false)}
          className="relative flex-1 min-h-0 w-full touch-none cursor-pointer bg-black/60 border border-cyan-400/25 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10 overflow-hidden"
        >
          {/* scan grid */}
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 6px)" }} />
          {/* fill */}
          <div
            className="absolute left-0 right-0 bottom-0 bg-gradient-to-t from-cyan-400 to-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-200 ease-out"
            style={{ height: (frac * 100) + "%", opacity: 0.85 }}
          />
          {/* ticks */}
          {ticks.map((t, i) => (
            <div
              key={"tk-" + uid + "-" + i}
              className="absolute right-0 bg-cyan-200/50"
              style={{ bottom: (t * 100) + "%", height: "1px", width: i % 2 === 0 ? "45%" : "25%" }}
            />
          ))}
          {/* thumb */}
          <div
            className="absolute left-0 right-0 transition-all duration-150 ease-out"
            style={{ bottom: "calc(" + (frac * 100) + "% - 0.3rem)", height: "0.6rem" }}
          >
            <div
              className={
                "absolute inset-0 border bg-neutral-900/90 " +
                (drag ? "border-fuchsia-300 shadow-[0_0_12px_rgba(232,121,249,0.5)]" : "border-cyan-300/70 shadow-[0_0_10px_rgba(34,211,238,0.45)]")
              }
            >
              <div className={"absolute left-[12%] right-[12%] top-1/2 h-[2px] -translate-y-1/2 " + (drag ? "bg-fuchsia-400" : "bg-cyan-300")} />
            </div>
          </div>
          {/* value pulse */}
          <div
            key={"pl-" + uid + "-" + pulse}
            className="absolute left-0 right-0 h-[2px] bg-cyan-100/80 pointer-events-none"
            style={{ bottom: (frac * 100) + "%", animation: "none", opacity: drag ? 0.9 : 0.35 }}
          />
        </div>

        <button
          type="button"
          aria-label="zoom out"
          disabled={value <= min + 1e-9}
          onClick={() => emit(value - stepAmt)}
          className={btn}
          style={{ height: "1.6rem", flex: "0 0 auto" }}
        >
          <Glyph kind="minus" />
        </button>

        {onReset ? (
          <button
            type="button"
            aria-label="reset zoom"
            onClick={() => onReset()}
            className={
              "relative w-full flex items-center justify-center border border-fuchsia-400/40 bg-neutral-800/70 text-fuchsia-400 " +
              "transition-all duration-150 ease-out hover:bg-fuchsia-500/25 hover:border-fuchsia-300 hover:text-fuchsia-200 " +
              "hover:shadow-[0_0_12px_rgba(232,121,249,0.5)] active:scale-[0.94] " +
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
            }
            style={{ height: "1.4rem", flex: "0 0 auto" }}
          >
            <Glyph kind="reset" />
          </button>
        ) : null}
      </div>
    </div>
  );
}