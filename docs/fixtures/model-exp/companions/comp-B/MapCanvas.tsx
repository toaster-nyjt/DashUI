type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: React.ReactNode;
};

export const MapCanvas_MIN = {"base":[12,10]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const z = Math.max(0.2, props.zoom || 1);
  const cx = Math.min(1, Math.max(0, props.center?.x ?? 0.5));
  const cy = Math.min(1, Math.max(0, props.center?.y ?? 0.5));
  const regions = props.regions || [];

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, w: r.width, h: r.height };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = (e.clientX - d.x) / d.w / z;
    const dy = (e.clientY - d.y) / d.h / z;
    d.x = e.clientX;
    d.y = e.clientY;
    if (dx !== 0 || dy !== 0) props.onViewChange({ center: { x: clamp01(cx - dx), y: clamp01(cy - dy) }, zoom: z });
  };
  const endDrag = (e: React.PointerEvent) => {
    if (dragRef.current && dragRef.current.id === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  const content = (
    <div
      className="absolute inset-0"
      style={{
        transformOrigin: "0 0",
        transform: "translate(50%,50%) scale(" + z + ") translate(" + (-cx * 100) + "%," + (-cy * 100) + "%)",
        transition: dragging ? "none" : "transform 300ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
        <defs>
          <linearGradient id={uid + "-reg"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="rgb(232,121,249)" stopOpacity="0.07" />
          </linearGradient>
          <linearGradient id={uid + "-hot"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="rgb(232,121,249)" stopOpacity="0.22" />
          </linearGradient>
          <pattern id={uid + "-grid"} width="0.0625" height="0.0625" patternUnits="userSpaceOnUse">
            <path d="M 0.0625 0 L 0 0 0 0.0625" fill="none" stroke="rgb(34,211,238)" strokeOpacity="0.12" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="1" height="1" fill={"url(#" + uid + "-grid)"} />
        <rect x="0" y="0" width="1" height="1" fill="none" stroke="rgb(250,204,21)" strokeOpacity="0.28" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {regions.map((rg, i) => {
          const hot = hover === rg.id;
          const common = {
            fill: hot ? "url(#" + uid + "-hot)" : "url(#" + uid + "-reg)",
            stroke: hot ? "rgb(103,232,249)" : "rgba(34,211,238,0.45)",
            strokeWidth: hot ? 2.2 : 1.2,
            vectorEffect: "non-scaling-stroke" as any,
            style: { transition: "fill 200ms ease-out, stroke 200ms ease-out" },
            onPointerEnter: () => setHover(rg.id),
            onPointerLeave: () => setHover((h) => (h === rg.id ? null : h)),
          };
          if (rg.path) return <path key={rg.id + i} d={rg.path} {...common} />;
          if (rg.bounds)
            return <rect key={rg.id + i} x={rg.bounds.x} y={rg.bounds.y} width={Math.max(0, rg.bounds.w)} height={Math.max(0, rg.bounds.h)} {...common} />;
          return null;
        })}
      </svg>
      <div className="absolute inset-0">
        {regions.map((rg, i) => {
          if (!rg.bounds || !rg.label) return null;
          const lx = (rg.bounds.x + rg.bounds.w / 2) * 100;
          const ly = (rg.bounds.y + rg.bounds.h / 2) * 100;
          const hot = hover === rg.id;
          return (
            <div
              key={"lbl-" + rg.id + i}
              className="pointer-events-none absolute"
              style={{ left: lx + "%", top: ly + "%", transform: "translate(-50%,-50%) scale(" + 1 / z + ")" }}
            >
              <span
                className={
                  "block whitespace-nowrap border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] transition-all duration-200 ease-out " +
                  (hot
                    ? "border-cyan-300/70 bg-cyan-400/15 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                    : "border-cyan-400/20 bg-black/55 text-cyan-200/70")
                }
              >
                {rg.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0">{props.children}</div>
    </div>
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10" />
      <div
        ref={hostRef}
        className={"absolute inset-0 touch-none " + (dragging ? "cursor-grabbing" : "cursor-grab")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {content}
      </div>
      {regions.length === 0 ? (
        <div className="pointer-events-none absolute inset-[18%] flex items-center justify-center">
          <FitText className="font-mono font-bold uppercase tracking-widest text-neutral-500">NO MAP DATA</FitText>
        </div>
      ) : null}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 4px)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)" }}
      />
      <div className="pointer-events-none absolute inset-0 border border-cyan-400/25" />
      <div className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-cyan-300/70" />
      <div className="pointer-events-none absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-cyan-300/70" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-cyan-300/70" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-cyan-300/70" />
    </div>
  );
}