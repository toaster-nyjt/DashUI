type MapCanvasProps = {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  center: { x: number; y: number };
  onViewportChange: (v: { zoom: number; center: { x: number; y: number } }) => void;
  regions?: { id: string; label: string; x: number; y: number }[];
  children?: any;
};

export const MapCanvas_MIN = {"base":[12,10]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const minZ = props.minZoom ?? 1;
  const maxZ = props.maxZoom ?? 8;
  const z = Math.min(maxZ, Math.max(minZ, props.zoom || 1));
  const cx = Math.min(1, Math.max(0, props.center?.x ?? 0.5));
  const cy = Math.min(1, Math.max(0, props.center?.y ?? 0.5));

  const surfRef = useRef<HTMLDivElement | null>(null);
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map());
  const startRef = useRef<{ cx: number; cy: number; z: number; dist: number; mx: number; my: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clampCenter = (x: number, y: number, zz: number) => {
    const half = 0.5 / zz;
    if (zz <= 1) return { x: 0.5, y: 0.5 };
    return {
      x: Math.min(1 - half, Math.max(half, x)),
      y: Math.min(1 - half, Math.max(half, y)),
    };
  };

  const snapshot = () => {
    const pts = Array.from(ptrs.current.values());
    if (pts.length === 0) return;
    let mx = 0, my = 0;
    pts.forEach((p) => { mx += p.x; my += p.y; });
    mx /= pts.length; my /= pts.length;
    let dist = 0;
    if (pts.length >= 2) {
      const dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
      dist = Math.sqrt(dx * dx + dy * dy);
    }
    startRef.current = { cx: cx, cy: cy, z: z, dist: dist, mx: mx, my: my };
  };

  const onDown = (e: any) => {
    if (e.target && e.target.closest && e.target.closest("[data-map-child]")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    snapshot();
    setDragging(true);
  };

  const onMove = (e: any) => {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const st = startRef.current;
    const el = surfRef.current;
    if (!st || !el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const pts = Array.from(ptrs.current.values());
    let mx = 0, my = 0;
    pts.forEach((p) => { mx += p.x; my += p.y; });
    mx /= pts.length; my /= pts.length;

    let nz = st.z;
    if (pts.length >= 2 && st.dist > 4) {
      const dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      nz = Math.min(maxZ, Math.max(minZ, st.z * (d / st.dist)));
    }
    const dxN = (mx - st.mx) / r.width;
    const dyN = (my - st.my) / r.height;
    const nc = clampCenter(st.cx - dxN / nz, st.cy - dyN / nz, nz);
    props.onViewportChange({ zoom: nz, center: nc });
  };

  const onUp = (e: any) => {
    ptrs.current.delete(e.pointerId);
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {}
    if (ptrs.current.size === 0) { setDragging(false); startRef.current = null; }
    else snapshot();
  };

  const regions = props.regions ?? [];
  const tx = (0.5 - cx * z) * 100;
  const ty = (0.5 - cy * z) * 100;

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
          style={{ transform: "translate(" + tx + "%," + ty + "%) scale(" + z + ")", transformOrigin: "0 0" }}
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0b1014" />
                <stop offset="50%" stopColor="#05080a" />
                <stop offset="100%" stopColor="#0a0f14" />
              </linearGradient>
              <pattern id={uid + "-grid"} width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M5 0 L0 0 L0 5" fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth="0.15" />
              </pattern>
              <pattern id={uid + "-grid2"} width="25" height="25" patternUnits="userSpaceOnUse">
                <path d="M25 0 L0 0 L0 25" fill="none" stroke="rgba(34,211,238,0.3)" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-bg)"} />
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-grid)"} />
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-grid2)"} />
            <g stroke="rgba(253,224,71,0.18)" strokeWidth="0.5" fill="none">
              <path d="M0 62 L30 58 L52 70 L78 66 L100 74" />
              <path d="M18 0 L22 34 L14 62 L26 100" />
              <path d="M70 0 L64 30 L76 58 L68 100" />
            </g>
            <g fill="rgba(217,70,239,0.07)" stroke="rgba(217,70,239,0.25)" strokeWidth="0.25">
              <rect x="26" y="12" width="26" height="20" />
              <rect x="56" y="36" width="22" height="18" />
              <rect x="10" y="68" width="24" height="22" />
            </g>
            <rect x="0.4" y="0.4" width="99.2" height="99.2" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="0.4" />
          </svg>

          {regions.map((r) => (
            <div
              key={r.id}
              className="pointer-events-none absolute"
              style={{ left: (r.x * 100) + "%", top: (r.y * 100) + "%", transform: "translate(-50%,-50%) scale(" + (1 / z) + ")" }}
            >
              <div className="whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.2em] leading-none text-cyan-300/70 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
                {r.label}
              </div>
            </div>
          ))}

          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
            {props.children}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] [background:repeating-linear-gradient(180deg,rgba(34,211,238,0.6)_0px,rgba(34,211,238,0.6)_1px,transparent_1px,transparent_3px)]" />
      <div className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-yellow-300/60" />
      <div className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-yellow-300/60" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-yellow-300/60" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-yellow-300/60" />
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
        <div className="h-8 w-[2px] bg-gradient-to-b from-cyan-400/60 to-transparent" />
        <div className={"h-1.5 w-1.5 rounded-full bg-fuchsia-500 " + (dragging ? "animate-pulse" : "")} />
      </div>
    </div>
  );
}