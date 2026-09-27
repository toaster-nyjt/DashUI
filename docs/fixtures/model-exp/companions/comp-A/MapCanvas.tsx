type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: React.ReactNode;
};

export function MapCanvas(props: MapCanvasProps) {
  const { regions, center, zoom, onViewChange, children } = props;
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const floor = MapCanvas_MIN.base;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; cx: number; cy: number; w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const z = Math.max(0.2, zoom || 1);
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const onDown = (e: any) => {
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    dragRef.current = { x: e.clientX, y: e.clientY, cx: center.x, cy: center.y, w: r.width, h: r.height };
    setDragging(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const onMove = (e: any) => {
    const d = dragRef.current;
    if (!d) return;
    const nx = clamp01(d.cx - (e.clientX - d.x) / (d.w * z));
    const ny = clamp01(d.cy - (e.clientY - d.y) / (d.h * z));
    onViewChange({ center: { x: nx, y: ny }, zoom: z });
  };
  const onUp = (e: any) => {
    dragRef.current = null;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const worldStyle: any = {
    transformOrigin: "0 0",
    transform:
      "translate(50%, 50%) scale(" + z + ") translate(" + (-center.x * 100) + "%, " + (-center.y * 100) + "%)",
    transition: dragging ? "none" : "transform 260ms cubic-bezier(0.22,1,0.36,1)",
  };

  const labelPos = (r: any) => {
    if (r.bounds) return { x: r.bounds.x + r.bounds.w / 2, y: r.bounds.y + r.bounds.h / 2 };
    return null;
  };

  return (
    <div
      ref={hostRef}
      className="relative h-full w-full overflow-hidden bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="absolute inset-0" style={worldStyle}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
          <defs>
            <pattern id={uid + "-grid"} width="0.05" height="0.05" patternUnits="userSpaceOnUse">
              <path d="M0.05 0 L0 0 L0 0.05" fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth="0.0015" vectorEffect="non-scaling-stroke" />
            </pattern>
            <linearGradient id={uid + "-reg"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.20)" />
              <stop offset="100%" stopColor="rgba(217,70,239,0.12)" />
            </linearGradient>
            <linearGradient id={uid + "-hot"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.45)" />
              <stop offset="100%" stopColor="rgba(217,70,239,0.32)" />
            </linearGradient>
            <linearGradient id={uid + "-sweep"} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(34,211,238,0)" />
              <stop offset="60%" stopColor="rgba(34,211,238,0.22)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </linearGradient>
          </defs>
          <rect x="-1" y="-1" width="3" height="3" fill="#05070a" />
          <rect x="-1" y="-1" width="3" height="3" fill={"url(#" + uid + "-grid)"} />
          <rect x="0" y="0" width="1" height="1" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

          {regions.map((r) => {
            const hot = hover === r.id;
            const common = {
              fill: "url(#" + uid + (hot ? "-hot)" : "-reg)"),
              stroke: hot ? "rgba(103,232,249,0.95)" : "rgba(34,211,238,0.45)",
              strokeWidth: hot ? 2 : 1,
              vectorEffect: "non-scaling-stroke" as any,
              style: { transition: "fill 200ms ease-out, stroke 200ms ease-out" },
              onPointerEnter: () => setHover(r.id),
              onPointerLeave: () => setHover((h) => (h === r.id ? null : h)),
            };
            if (r.path) return <path key={r.id} d={r.path} {...common} />;
            if (r.bounds)
              return <rect key={r.id} x={r.bounds.x} y={r.bounds.y} width={Math.max(0, r.bounds.w)} height={Math.max(0, r.bounds.h)} {...common} />;
            return null;
          })}

          <g style={{ pointerEvents: "none" }}>
            <rect x="-1" y="0" width="1" height="1" fill={"url(#" + uid + "-sweep)"}>
              <animate attributeName="x" values="-1;1" dur="6s" repeatCount="indefinite" />
            </rect>
          </g>
        </svg>

        {regions.map((r) => {
          const p = labelPos(r);
          if (!p) return null;
          return (
            <div
              key={"lbl-" + r.id}
              className="absolute pointer-events-none"
              style={{ left: p.x * 100 + "%", top: p.y * 100 + "%" }}
            >
              <div
                className={
                  "-translate-x-1/2 -translate-y-1/2 whitespace-nowrap border px-2 py-1 backdrop-blur-sm transition-all duration-200 ease-out text-[10px] font-bold uppercase tracking-[0.18em] leading-none " +
                  (hover === r.id
                    ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
                    : "border-cyan-400/25 bg-black/55 text-cyan-200/70")
                }
                style={{ transform: "translate(-50%,-50%) scale(" + 1 / z + ")" }}
              >
                {r.label}
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0">{children}</div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.9), inset 0 0 22px rgba(34,211,238,0.10)" }}
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 6 L0 0 L8 0" fill="none" stroke="rgba(34,211,238,0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M100 6 L100 0 L92 0" fill="none" stroke="rgba(34,211,238,0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M0 94 L0 100 L8 100" fill="none" stroke="rgba(34,211,238,0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d="M100 94 L100 100 L92 100" fill="none" stroke="rgba(34,211,238,0.55)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="50" y1="46" x2="50" y2="54" stroke="rgba(232,121,249,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="46" y1="50" x2="54" y2="50" stroke="rgba(232,121,249,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

export const MapCanvas_MIN = {"base":[12,10]};