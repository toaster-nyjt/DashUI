type MapCanvasProps = {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  center: { x: number; y: number };
  onViewportChange: (v: { zoom: number; center: { x: number; y: number } }) => void;
  regions?: { id: string; label: string; x: number; y: number }[];
  children?: any;
};

export const MapCanvas_MIN = {"base":[12,9]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const minZ = props.minZoom ?? 1;
  const maxZ = props.maxZoom ?? 6;
  const z = Math.min(maxZ, Math.max(minZ, props.zoom));
  const surfRef = useRef<HTMLDivElement | null>(null);
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map()).current;
  const gesture = useRef<any>(null);
  const [dragging, setDragging] = useState(false);

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const emit = (nz: number, cx: number, cy: number) => {
    props.onViewportChange({
      zoom: Math.min(maxZ, Math.max(minZ, nz)),
      center: { x: clamp01(cx), y: clamp01(cy) },
    });
  };

  const rect = () => surfRef.current ? surfRef.current.getBoundingClientRect() : null;

  const onDown = (e: any) => {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = rect();
    if (!r) return;
    if (ptrs.size === 1) {
      gesture.current = { mode: "pan", sx: e.clientX, sy: e.clientY, cx: props.center.x, cy: props.center.y, w: r.width, h: r.height };
      setDragging(true);
    } else if (ptrs.size === 2) {
      const pts = Array.from(ptrs.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      gesture.current = { mode: "pinch", d0: d, z0: z };
    }
  };

  const onMove = (e: any) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.mode === "pan" && ptrs.size === 1) {
      const dx = (e.clientX - g.sx) / g.w / z;
      const dy = (e.clientY - g.sy) / g.h / z;
      emit(z, g.cx - dx, g.cy - dy);
    } else if (g.mode === "pinch" && ptrs.size >= 2) {
      const pts = Array.from(ptrs.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      emit(g.z0 * (d / g.d0), props.center.x, props.center.y);
    }
  };

  const onUp = (e: any) => {
    ptrs.delete(e.pointerId);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {}
    if (ptrs.size === 0) { gesture.current = null; setDragging(false); }
    else if (ptrs.size === 1) {
      const r = rect();
      const p = Array.from(ptrs.values())[0];
      if (r) gesture.current = { mode: "pan", sx: p.x, sy: p.y, cx: props.center.x, cy: props.center.y, w: r.width, h: r.height };
    }
  };

  const tf =
    "translate(50%,50%) scale(" + z + ") translate(" +
    (-props.center.x * 100) + "%," + (-props.center.y * 100) + "%)";

  const grid = [];
  for (let i = 1; i < 12; i++) grid.push(i / 12);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div
        ref={surfRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={"absolute inset-0 touch-none " + (dragging ? "cursor-grabbing" : "cursor-grab")}
      >
        <div
          className={"absolute inset-0 " + (dragging ? "" : "transition-transform duration-300 ease-out")}
          style={{ transform: tf, transformOrigin: "0 0" }}
        >
          {/* terrain */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0b1418" />
                <stop offset="50%" stopColor="#05080a" />
                <stop offset="100%" stopColor="#0d0a14" />
              </linearGradient>
              <radialGradient id={uid + "-core"} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-bg)"} />
            <circle cx="50" cy="48" r="34" fill={"url(#" + uid + "-core)"} />
            <path d="M0 62 L22 55 L38 66 L60 58 L80 70 L100 63 L100 100 L0 100 Z" fill="rgba(217,70,239,0.07)" stroke="rgba(217,70,239,0.3)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
            <path d="M8 8 L40 12 L46 34 L20 40 Z" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.28)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
            <path d="M58 14 L92 20 L88 44 L62 40 Z" fill="rgba(253,224,71,0.04)" stroke="rgba(253,224,71,0.25)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
            <g stroke="rgba(34,211,238,0.10)" strokeWidth="0.25" vectorEffect="non-scaling-stroke">
              {grid.map((g, i) => (
                <line key={"v" + i} x1={g * 100} y1="0" x2={g * 100} y2="100" />
              ))}
              {grid.map((g, i) => (
                <line key={"h" + i} x1="0" y1={g * 100} x2="100" y2={g * 100} />
              ))}
            </g>
            <g stroke="rgba(34,211,238,0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" fill="none">
              <path d="M0 47 L34 47 L46 58 L100 58" />
              <path d="M52 0 L52 36 L64 48 L64 100" />
              <path d="M0 22 L28 22 L40 12" />
              <path d="M18 100 L18 66 L44 66" />
            </g>
            <g stroke="rgba(253,224,71,0.25)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" fill="none">
              <path d="M0 80 L100 80" />
              <path d="M82 0 L82 100" />
            </g>
          </svg>

          {/* region labels */}
          {(props.regions ?? []).map((r) => (
            <div
              key={r.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: r.x * 100 + "%", top: r.y * 100 + "%" }}
            >
              <div
                className="whitespace-nowrap text-[0.6rem] font-normal uppercase tracking-[0.15em] leading-none text-cyan-300/60"
                style={{ transform: "scale(" + (1 / z) + ")" }}
              >
                {r.label}
              </div>
            </div>
          ))}

          {/* children layer */}
          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
            {props.children}
          </div>
        </div>
      </div>

      {/* chrome overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_3px] opacity-40" />
        <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-yellow-300/60" />
        <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-yellow-300/60" />
        <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-yellow-300/60" />
        <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-yellow-300/60" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded-full border border-fuchsia-400/50 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
        </div>
        <div className="absolute bottom-1 right-1 rounded-full border border-fuchsia-400/40 bg-black/70 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] leading-none text-cyan-300/70">
          {"x" + z.toFixed(2)}
        </div>
      </div>
    </div>
  );
}