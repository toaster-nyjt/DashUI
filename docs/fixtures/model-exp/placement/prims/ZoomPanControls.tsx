type ZoomPanControlsProps = { zoom: number; minZoom: number; maxZoom: number; onZoomChange: (zoom: number) => void; onRecenter?: () => void };

export const ZoomPanControls_MIN = {"base":[2.5,6.5]};

export function ZoomPanControls(props: ZoomPanControlsProps) {
  const uid = useRef("zoompan-" + Math.random().toString(36).slice(2)).current;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pulse, setPulse] = useState(0);

  const lo = Math.min(props.minZoom, props.maxZoom);
  const hi = Math.max(props.minZoom, props.maxZoom);
  const span = hi - lo || 1;
  const z = Math.min(hi, Math.max(lo, props.zoom));
  const t = (z - lo) / span;

  const prev = useRef(z);
  useEffect(() => {
    if (Math.abs(prev.current - z) > 1e-6) {
      prev.current = z;
      setPulse((p) => p + 1);
    }
  }, [z]);

  const emit = (v: number) => {
    const c = Math.min(hi, Math.max(lo, v));
    if (Math.abs(c - z) > 1e-6) props.onZoomChange(c);
  };

  const step = span / 8;

  const fromPointer = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.height <= 0) return;
    const ratio = 1 - (clientY - r.top) / r.height;
    emit(lo + Math.min(1, Math.max(0, ratio)) * span);
  };

  const btnBase =
    "relative flex-1 min-h-0 min-w-0 flex items-center justify-center rounded-md border transition-all duration-200 ease-out overflow-hidden";

  const Btn = (opts: { kind: string; disabled?: boolean; onClick: () => void; tone: "y" | "c" }) => {
    const yellow = opts.tone === "y";
    return (
      <button
        type="button"
        disabled={opts.disabled}
        onClick={opts.onClick}
        className={
          btnBase +
          " " +
          (yellow
            ? "border-yellow-300/40 bg-[linear-gradient(135deg,rgba(253,224,71,0.14)_0%,rgba(10,10,20,0.9)_100%)] text-yellow-300"
            : "border-fuchsia-500/40 bg-[linear-gradient(135deg,rgba(217,70,239,0.16)_0%,rgba(10,10,20,0.9)_100%)] text-fuchsia-400") +
          (opts.disabled
            ? " opacity-40 grayscale"
            : yellow
            ? " hover:bg-yellow-300 hover:text-black hover:shadow-[0_0_18px_rgba(253,224,71,0.6)] hover:-translate-y-px active:translate-y-0 active:brightness-90"
            : " hover:bg-fuchsia-500/25 hover:border-fuchsia-400 hover:text-fuchsia-200 hover:shadow-[0_0_12px_rgba(217,70,239,0.5)] hover:-translate-y-px active:translate-y-0 active:brightness-90")
        }
      >
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full p-[0.28rem] drop-shadow-[0_0_6px_currentColor]"
        >
          {opts.kind === "in" ? (
            <g stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" fill="none">
              <circle cx="10.5" cy="10.5" r="6.2" />
              <path d="M10.5 7.4v6.2M7.4 10.5h6.2" />
              <path d="M15.2 15.2L20 20" />
            </g>
          ) : null}
          {opts.kind === "out" ? (
            <g stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" fill="none">
              <circle cx="10.5" cy="10.5" r="6.2" />
              <path d="M7.4 10.5h6.2" />
              <path d="M15.2 15.2L20 20" />
            </g>
          ) : null}
          {opts.kind === "center" ? (
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
              <circle cx="12" cy="12" r="5.4" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <path d="M12 1.6v3.4M12 19v3.4M1.6 12h3.4M19 12h3.4" />
            </g>
          ) : null}
        </svg>
      </button>
    );
  };

  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div
      className="h-full w-full flex flex-col gap-1 items-stretch"
      style={{ minWidth: ZoomPanControls_MIN.base[0] + "rem", minHeight: ZoomPanControls_MIN.base[1] + "rem" }}
    >
      <Btn kind="in" tone="y" disabled={z >= hi - 1e-6} onClick={() => emit(z + step)} />

      <div
        ref={trackRef}
        className={
          "relative flex-[1.6] min-h-0 min-w-0 rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] touch-none cursor-ns-resize overflow-hidden transition-all duration-200 ease-out " +
          (dragging ? "ring-2 ring-fuchsia-400/60" : "ring-1 ring-cyan-400/20 hover:ring-cyan-400/50")
        }
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          setDragging(true);
          fromPointer(e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging) fromPointer(e.clientY);
        }}
        onPointerUp={(e) => {
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch (err) {}
          setDragging(false);
        }}
        onPointerCancel={() => setDragging(false)}
      >
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 10 100">
          <defs>
            <linearGradient id={uid + "-fill"} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#e879f9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="10" height="100" fill="rgba(8,51,68,0.4)" />
          <rect
            x="0"
            y={100 - t * 100}
            width="10"
            height={t * 100}
            fill={"url(#" + uid + "-fill)"}
            style={{ transition: "y 400ms cubic-bezier(0.22,1,0.36,1), height 400ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>

        <div className="absolute inset-0">
          {ticks.map((tk, i) => (
            <div
              key={"tk-" + i}
              className="absolute left-0 right-0 h-px bg-cyan-100/25"
              style={{ bottom: tk * 100 + "%" }}
            />
          ))}
        </div>

        <div
          key={"pulse-" + pulse}
          className="absolute left-0 right-0 flex items-center justify-center"
          style={{
            height: "0.5rem",
            bottom: "calc(" + t * 100 + "% - 0.25rem)",
            transition: "bottom 400ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div className="absolute inset-x-0 h-full rounded-[2px] bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.8)]" />
          <div className="absolute inset-x-0 h-full rounded-[2px] bg-fuchsia-400/60 animate-ping" />
        </div>
      </div>

      <Btn kind="out" tone="y" disabled={z <= lo + 1e-6} onClick={() => emit(z - step)} />

      {props.onRecenter ? <Btn kind="center" tone="c" onClick={() => props.onRecenter && props.onRecenter()} /> : null}
    </div>
  );
}