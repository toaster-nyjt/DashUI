type ZoomControlProps = { value: number; min: number; max: number; step?: number; onChange: (zoom: number) => void; onReset?: () => void };

export function ZoomControl(props: ZoomControlProps) {
  const uid = useRef("zoomctl-" + Math.random().toString(36).slice(2)).current;
  const { value, min, max, onChange, onReset } = props;
  const span = Math.max(1e-6, max - min);
  const step = props.step && props.step > 0 ? props.step : span / 8;
  const levels = Math.max(1, Math.round(span / step));
  const segCount = Math.max(3, Math.min(12, levels));
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => clamp(min + Math.round((clamp(v) - min) / step) * step);
  const ratio = Math.min(1, Math.max(0, (value - min) / span));
  const barRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [pressed, setPressed] = useState<string | null>(null);

  const emit = (v: number) => {
    const n = snap(v);
    if (Math.abs(n - value) > 1e-9) { onChange(n); setPulse((p) => p + 1); }
  };

  const fromPointer = (e: any) => {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.height <= 0) return;
    const t = 1 - (e.clientY - r.top) / r.height;
    emit(min + Math.min(1, Math.max(0, t)) * span);
  };

  const glyphBtn = (
    id: string,
    disabled: boolean,
    act: () => void,
    path: JSX.Element,
    tone: "cyan" | "amber"
  ) => {
    const accent = tone === "cyan" ? "text-cyan-300" : "text-amber-300";
    const brd = tone === "cyan" ? "border-cyan-300/40" : "border-amber-300/40";
    return (
      <button
        type="button"
        disabled={disabled}
        onPointerDown={() => setPressed(id)}
        onPointerUp={() => setPressed(null)}
        onPointerLeave={() => setPressed(null)}
        onClick={act}
        className={
          "group relative flex-1 min-h-0 min-w-0 overflow-hidden border " + brd +
          " bg-neutral-800/80 " + accent +
          " rounded-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 " +
          (disabled
            ? "opacity-40 grayscale"
            : "hover:bg-cyan-300 hover:text-black hover:border-cyan-200 hover:shadow-[0_0_16px_rgba(34,211,238,0.5)] active:scale-[0.97] active:brightness-110")
        }
      >
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-400/10 to-transparent" />
        <span
          className={
            "pointer-events-none absolute inset-0 transition-opacity duration-150 " +
            (pressed === id ? "opacity-100 bg-cyan-300/25" : "opacity-0")
          }
        />
        <span className="absolute inset-[22%] block">
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
            {path}
          </svg>
        </span>
      </button>
    );
  };

  const atMax = value >= max - 1e-9;
  const atMin = value <= min + 1e-9;

  const plus = (
    <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" fill="none">
      <path d="M12 3.5v17M3.5 12h17" />
    </g>
  );
  const minus = (
    <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" fill="none">
      <path d="M3.5 12h17" />
    </g>
  );
  const reset = (
    <g stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="square">
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 3.2V8h-4.8" />
    </g>
  );

  const floor = ZoomControl_MIN.base;

  return (
    <div
      className="h-full w-full flex flex-col gap-[3px] touch-none select-none font-mono"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {glyphBtn("plus", atMax, () => emit(value + step), plus, "cyan")}

      <div
        ref={barRef}
        onPointerDown={(e) => {
          (e.currentTarget as any).setPointerCapture?.(e.pointerId);
          setDrag(true);
          fromPointer(e);
        }}
        onPointerMove={(e) => { if (drag) fromPointer(e); }}
        onPointerUp={(e) => { setDrag(false); (e.currentTarget as any).releasePointerCapture?.(e.pointerId); }}
        onPointerCancel={() => setDrag(false)}
        className={
          "relative flex-[2.2] min-h-0 min-w-0 cursor-ns-resize touch-none overflow-hidden border border-cyan-400/25 bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] transition-all duration-200 ease-out " +
          (drag ? "ring-cyan-400/60 shadow-[0_0_14px_rgba(34,211,238,0.35)_inset]" : "hover:ring-cyan-400/30")
        }
      >
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 10 100">
          <defs>
            <linearGradient id={uid + "-fill"} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(165,243,252)" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y={100 - ratio * 100}
            width="10"
            height={ratio * 100}
            fill={"url(#" + uid + "-fill)"}
            style={{ transition: "all 220ms ease-out" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col-reverse gap-[2px] p-[2px]">
          {Array.from({ length: segCount }).map((_, i) => {
            const lit = (i + 1) / segCount <= ratio + 1e-6;
            const edge = lit && (i + 2) / segCount > ratio + 1e-6;
            return (
              <div
                key={"seg-" + i}
                className={
                  "flex-1 min-h-0 border-l-2 transition-all duration-200 ease-out " +
                  (lit
                    ? "border-cyan-200 bg-cyan-400/25 " + (edge ? "shadow-[0_0_10px_rgba(34,211,238,0.7)]" : "")
                    : "border-cyan-400/15 bg-transparent")
                }
              />
            );
          })}
        </div>

        <div
          key={"cursor-" + pulse}
          className="pointer-events-none absolute left-0 right-0 h-[2px] bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
          style={{ bottom: "calc(" + ratio * 100 + "% - 1px)", transition: "bottom 220ms ease-out", animation: "pulse 700ms ease-out 1" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_4px)] opacity-40" />
      </div>

      {glyphBtn("minus", atMin, () => emit(value - step), minus, "cyan")}

      {onReset ? glyphBtn("reset", false, () => onReset(), reset, "amber") : null}
    </div>
  );
}

export const ZoomControl_MIN = {"base":[2.25,7.5]};