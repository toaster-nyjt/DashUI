type MapCanvasProps = {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  center: { x: number; y: number };
  onViewportChange: (v: { zoom: number; center: { x: number; y: number } }) => void;
  regions?: { id: string; label: string; x: number; y: number }[];
  children?: any;
};

export const MapCanvas_MIN = {"base":[11,9]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const minZ = props.minZoom ?? 1;
  const maxZ = props.maxZoom ?? 6;
  const zoom = Math.min(maxZ, Math.max(minZ, props.zoom));
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const cx = clamp01(props.center.x);
  const cy = clamp01(props.center.y);

  const surfRef = useRef<HTMLDivElement | null>(null);
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map()).current;
  const gesture = useRef<{ dist: number; zoom: number; cx: number; cy: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const rect = () => surfRef.current ? surfRef.current.getBoundingClientRect() : null;

  const onDown = (e: any) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    if (ptrs.size === 1) {
      setDragging(true);
      gesture.current = { dist: 0, zoom: zoom, cx: cx, cy: cy, x: e.clientX, y: e.clientY };
    } else if (ptrs.size === 2) {
      const a = Array.from(ptrs.values());
      const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      gesture.current = { dist: d, zoom: zoom, cx: cx, cy: cy, x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
    }
  };

  const onMove = (e: any) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = rect();
    const g = gesture.current;
    if (!r || !g || r.width <= 0 || r.height <= 0) return;
    if (ptrs.size >= 2) {
      const a = Array.from(ptrs.values());
      const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      if (g.dist > 0) {
        const nz = Math.min(maxZ, Math.max(minZ, g.zoom * (d / g.dist)));
        const mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
        const ndx = (mx - g.x) / (r.width * nz);
        const ndy = (my - g.y) / (r.height * nz);
        props.onViewportChange({ zoom: nz, center: { x: clamp01(g.cx - ndx), y: clamp01(g.cy - ndy) } });
      }
    } else {
      const dx = (e.clientX - g.x) / (r.width * zoom);
      const dy = (e.clientY - g.y) / (r.height * zoom);
      props.onViewportChange({ zoom: zoom, center: { x: clamp01(g.cx - dx), y: clamp01(g.cy - dy) } });
    }
  };

  const onUp = (e: any) => {
    ptrs.delete(e.pointerId);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
    if (ptrs.size === 0) { setDragging(false); gesture.current = null; }
    else {
      const a = Array.from(ptrs.values());
      gesture.current = { dist: 0, zoom: zoom, cx: cx, cy: cy, x: a[0].x, y: a[0].y };
    }
  };

  const tx = 50 - cx * zoom * 100;
  const ty = 50 - cy * zoom * 100;
  const layerStyle = {
    transformOrigin: "0 0",
    transform: "translate(" + tx + "%," + ty + "%) scale(" + zoom + ")",
    transition: dragging ? "none" : "transform 300ms cubic-bezier(0.22,1,0.36,1)"
  } as any;

  const inv = 1 / zoom;
  const regions = props.regions ?? [];
  const floor = MapCanvas_MIN.base;

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        ref={surfRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={"absolute inset-0 touch-none " + (dragging ? "cursor-grabbing" : "cursor-grab")}
      >
        <div className="absolute inset-0" style={layerStyle}>
          {/* terrain / grid */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0b1116" />
                <stop offset="50%" stopColor="#04080b" />
                <stop offset="100%" stopColor="#0a0f14" />
              </linearGradient>
              <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-bg)"} />
            <circle cx="50" cy="50" r="46" fill={"url(#" + uid + "-glow)"} />
            {Array.from({ length: 19 }).map((_, i) => (
              <line key={"v" + i} x1={(i + 1) * 5} y1="0" x2={(i + 1) * 5} y2="100"
                stroke={(i + 1) % 4 === 0 ? "rgba(34,211,238,0.22)" : "rgba(34,211,238,0.09)"}
                strokeWidth={inv * 0.25} />
            ))}
            {Array.from({ length: 19 }).map((_, i) => (
              <line key={"h" + i} x1="0" y1={(i + 1) * 5} x2="100" y2={(i + 1) * 5}
                stroke={(i + 1) % 4 === 0 ? "rgba(34,211,238,0.22)" : "rgba(34,211,238,0.09)"}
                strokeWidth={inv * 0.25} />
            ))}
            <path d="M0 68 L22 60 L38 72 L60 55 L78 63 L100 48" fill="none"
              stroke="rgba(217,70,239,0.35)" strokeWidth={inv * 0.7} />
            <path d="M12 0 L18 30 L34 44 L30 74 L44 100" fill="none"
              stroke="rgba(253,224,71,0.18)" strokeWidth={inv * 0.6} />
            <path d="M100 18 L74 26 L62 44 L66 78 L82 100" fill="none"
              stroke="rgba(253,224,71,0.14)" strokeWidth={inv * 0.6} />
          </svg>

          {/* region markers */}
          {regions.map((r) => (
            <div key={r.id} className="absolute" style={{ left: clamp01(r.x) * 100 + "%", top: clamp01(r.y) * 100 + "%" }}>
              <div className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
                style={{ transform: "translate(-50%,-50%) scale(" + inv + ")" }}>
                <span className="h-1 w-1 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                <span className="whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.2em] leading-none text-cyan-300/70">
                  {r.label}
                </span>
              </div>
            </div>
          ))}

          {/* child markers / routes */}
          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
            {props.children}
          </div>
        </div>
      </div>

      {/* HUD chrome */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.5)_0px,rgba(34,211,238,0.5)_1px,transparent_1px,transparent_3px)]" />
        <div className="absolute left-1 top-1 h-3 w-3 border-l border-t border-yellow-300/60" />
        <div className="absolute right-1 top-1 h-3 w-3 border-r border-t border-yellow-300/60" />
        <div className="absolute bottom-1 left-1 h-3 w-3 border-b border-l border-yellow-300/60" />
        <div className="absolute bottom-1 right-1 h-3 w-3 border-b border-r border-yellow-300/60" />
        <div className={"absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 " + (dragging ? "opacity-100" : "opacity-0")}>
          <svg width="34" height="34" viewBox="0 0 34 34">
            <circle cx="17" cy="17" r="8" fill="none" stroke="rgba(253,224,71,0.7)" strokeWidth="0.8" strokeDasharray="3 3" />
            <line x1="17" y1="0" x2="17" y2="10" stroke="rgba(253,224,71,0.6)" strokeWidth="0.8" />
            <line x1="17" y1="24" x2="17" y2="34" stroke="rgba(253,224,71,0.6)" strokeWidth="0.8" />
            <line x1="0" y1="17" x2="10" y2="17" stroke="rgba(253,224,71,0.6)" strokeWidth="0.8" />
            <line x1="24" y1="17" x2="34" y2="17" stroke="rgba(253,224,71,0.6)" strokeWidth="0.8" />
          </svg>
        </div>
        {/* zoom state rail */}
        <div className="absolute bottom-2 right-2 flex h-[45%] w-1 flex-col-reverse gap-[2px] overflow-hidden rounded-full bg-black/60 ring-1 ring-cyan-400/20">
          <div
            className="w-full rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-500 ease-in-out"
            style={{ height: (maxZ > minZ ? ((zoom - minZ) / (maxZ - minZ)) * 100 : 100) + "%" }}
          />
        </div>
      </div>
    </div>
  );
}