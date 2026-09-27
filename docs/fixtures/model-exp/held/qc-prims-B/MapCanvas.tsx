type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: any;
};

export const MapCanvas_MIN = {"base":[12,9]};

export function MapCanvas(props: MapCanvasProps) {
  const { regions, center, zoom, onViewChange, children } = props;
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; c: { x: number; y: number } } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hot, setHot] = useState<string | null>(null);

  const z = Math.max(0.2, zoom || 1);
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const onDown = (e: any) => {
    const el = hostRef.current;
    if (!el) return;
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, c: { x: center.x, y: center.y } };
    setDragging(true);
  };
  const onMove = (e: any) => {
    const d = dragRef.current;
    const el = hostRef.current;
    if (!d || !el || d.id !== e.pointerId) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const dx = (e.clientX - d.x) / r.width / z;
    const dy = (e.clientY - d.y) / r.height / z;
    onViewChange({ center: { x: clamp01(d.c.x - dx), y: clamp01(d.c.y - dy) }, zoom: z });
  };
  const onUp = (e: any) => {
    if (dragRef.current && dragRef.current.id === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  const floor = MapCanvas_MIN.base;

  const tf =
    "translate(50%, 50%) scale(" + z + ") translate(" + (-center.x * 100) + "%, " + (-center.y * 100) + "%)";

  const strokeW = 0.35 / z;

  return (
    <div
      className="relative h-full w-full overflow-hidden touch-none select-none bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem", cursor: dragging ? "grabbing" : "grab" }}
      ref={hostRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* static vignette / scan */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5" />

      <div className="absolute inset-0" style={{ transform: tf, transformOrigin: "0% 0%", willChange: "transform" }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id={uid + "-grid"} width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M5 0 L0 0 L0 5" fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth={0.25 / z} />
            </pattern>
            <pattern id={uid + "-grid2"} width="25" height="25" patternUnits="userSpaceOnUse">
              <path d="M25 0 L0 0 L0 25" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth={0.4 / z} />
            </pattern>
            <linearGradient id={uid + "-reg"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
              <stop offset="100%" stopColor="rgba(232,121,249,0.10)" />
            </linearGradient>
            <linearGradient id={uid + "-hot"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.42)" />
              <stop offset="100%" stopColor="rgba(232,121,249,0.28)" />
            </linearGradient>
          </defs>

          <rect x="-50" y="-50" width="200" height="200" fill={"url(#" + uid + "-grid)"} />
          <rect x="-50" y="-50" width="200" height="200" fill={"url(#" + uid + "-grid2)"} />

          {regions.map((r, i) => {
            const on = hot === r.id;
            const common = {
              fill: on ? "url(#" + uid + "-hot)" : "url(#" + uid + "-reg)",
              stroke: on ? "rgba(103,232,249,0.95)" : "rgba(34,211,238,0.45)",
              strokeWidth: on ? strokeW * 1.8 : strokeW,
              style: { transition: "fill 200ms ease-out, stroke 200ms ease-out" } as any,
              onPointerEnter: () => setHot(r.id),
              onPointerLeave: () => setHot((h) => (h === r.id ? null : h)),
            };
            if (r.path) {
              return (
                <g key={r.id + "-" + i}>
                  <path d={r.path} vectorEffect="non-scaling-stroke" {...(common as any)} />
                </g>
              );
            }
            const b = r.bounds;
            if (!b) return null;
            return (
              <g key={r.id + "-" + i}>
                <rect x={b.x * 100} y={b.y * 100} width={b.w * 100} height={b.h * 100} {...(common as any)} />
                <path
                  d={
                    "M" + (b.x * 100) + " " + ((b.y + b.h) * 100 - Math.min(4, b.h * 30)) +
                    " L" + (b.x * 100) + " " + ((b.y + b.h) * 100) +
                    " L" + (b.x * 100 + Math.min(4, b.w * 30)) + " " + ((b.y + b.h) * 100)
                  }
                  fill="none"
                  stroke={on ? "rgba(253,224,71,0.9)" : "rgba(34,211,238,0.6)"}
                  strokeWidth={strokeW * 1.6}
                />
              </g>
            );
          })}
        </svg>

        {/* region labels in map space */}
        {regions.map((r, i) => {
          const b = r.bounds;
          if (!b || !r.label) return null;
          const on = hot === r.id;
          return (
            <div
              key={"lbl-" + r.id + "-" + i}
              className="pointer-events-none absolute flex items-center justify-center"
              style={{
                left: b.x * 100 + "%",
                top: b.y * 100 + "%",
                width: b.w * 100 + "%",
                height: b.h * 100 + "%",
              }}
            >
              <span
                className={
                  "font-mono font-semibold uppercase leading-none whitespace-nowrap transition-all duration-200 ease-out " +
                  (on ? "text-cyan-100" : "text-cyan-300/70")
                }
                style={{
                  fontSize: 0.625 / z + "rem",
                  letterSpacing: 0.18 / z + "rem",
                  textShadow: on ? "0 0 8px rgba(34,211,238,0.8)" : "none",
                }}
              >
                {r.label}
              </span>
            </div>
          );
        })}

        {children ? (
          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">{children}</div>
        ) : null}
      </div>

      {/* crosshair + frame chrome */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-amber-300/40" />
        <div className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-amber-300/40" />
        <div className="absolute inset-0 ring-1 ring-inset ring-cyan-400/20" />
        <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-cyan-300/60" />
        <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-cyan-300/60" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-cyan-300/60" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-cyan-300/60" />
        <div
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent"
          style={{ animation: "mc" + uid.slice(-4) + " 5s linear infinite" }}
        />
      </div>
      <style>
        {"@keyframes mc" + uid.slice(-4) + " { 0% { top: 0%; opacity: 0 } 10% { opacity: 1 } 90% { opacity: 1 } 100% { top: 100%; opacity: 0 } }"}
      </style>
    </div>
  );
}