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
  const maxZ = props.maxZoom ?? 8;
  const zoom = Math.min(maxZ, Math.max(minZ, props.zoom));
  const cx = Math.min(1, Math.max(0, props.center.x));
  const cy = Math.min(1, Math.max(0, props.center.y));

  const surfRef = useRef<HTMLDivElement | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragRef = useRef<{ id: number; lx: number; ly: number; cx: number; cy: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const emit = (z: number, x: number, y: number) => {
    props.onViewportChange({
      zoom: Math.min(maxZ, Math.max(minZ, z)),
      center: { x: clamp01(x), y: clamp01(y) },
    });
  };

  const down = (e: any) => {
    const el = surfRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      dragRef.current = { id: e.pointerId, lx: e.clientX, ly: e.clientY, cx: cx, cy: cy };
      setDragging(true);
    } else if (pointers.current.size === 2) {
      const p = Array.from(pointers.current.values());
      pinchRef.current = { dist: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1, zoom: zoom };
      dragRef.current = null;
    }
  };

  const move = (e: any) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const el = surfRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (pointers.current.size >= 2 && pinchRef.current) {
      const p = Array.from(pointers.current.values());
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1;
      emit(pinchRef.current.zoom * (d / pinchRef.current.dist), cx, cy);
      return;
    }
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId || r.width <= 0 || r.height <= 0) return;
    const dx = (e.clientX - d.lx) / r.width / zoom;
    const dy = (e.clientY - d.ly) / r.height / zoom;
    emit(zoom, d.cx - dx, d.cy - dy);
  };

  const up = (e: any) => {
    pointers.current.delete(e.pointerId);
    if (dragRef.current && dragRef.current.id === e.pointerId) dragRef.current = null;
    if (pointers.current.size < 2) pinchRef.current = null;
    if (pointers.current.size === 0) setDragging(false);
    else {
      const first = Array.from(pointers.current.entries())[0];
      dragRef.current = { id: first[0], lx: first[1].x, ly: first[1].y, cx: cx, cy: cy };
    }
  };

  const tx = (0.5 - cx * zoom) * 100;
  const ty = (0.5 - cy * zoom) * 100;
  const layerStyle: any = {
    transformOrigin: "0 0",
    transform: "translate(" + tx + "%," + ty + "%) scale(" + zoom + ")",
    transition: dragging ? "none" : "transform 300ms cubic-bezier(0.22,1,0.36,1)",
  };

  const gridMinor: any[] = [];
  for (let i = 1; i < 20; i++) {
    gridMinor.push(<line key={"gv" + i} x1={i * 5} y1={0} x2={i * 5} y2={100} stroke="rgba(34,211,238,0.10)" strokeWidth={0.15} />);
    gridMinor.push(<line key={"gh" + i} x1={0} y1={i * 5} x2={100} y2={i * 5} stroke="rgba(34,211,238,0.10)" strokeWidth={0.15} />);
  }
  const gridMajor: any[] = [];
  for (let i = 1; i < 5; i++) {
    gridMajor.push(<line key={"Mv" + i} x1={i * 20} y1={0} x2={i * 20} y2={100} stroke="rgba(34,211,238,0.26)" strokeWidth={0.3} />);
    gridMajor.push(<line key={"Mh" + i} x1={0} y1={i * 20} x2={100} y2={i * 20} stroke="rgba(34,211,238,0.26)" strokeWidth={0.3} />);
  }

  const blocks = [
    [8, 10, 22, 16], [36, 6, 18, 12], [60, 14, 26, 18], [10, 34, 16, 22],
    [32, 30, 30, 24], [70, 40, 20, 14], [14, 62, 24, 20], [46, 60, 18, 26],
    [72, 62, 18, 22], [40, 88, 26, 8], [86, 8, 10, 26],
  ];
  const roads = [
    "M0,26 L100,22", "M0,54 L100,58", "M0,80 L100,76",
    "M24,0 L28,100", "M58,0 L54,100", "M82,0 L86,100",
  ];

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border border-cyan-400/20 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div
        ref={surfRef}
        className={"absolute inset-0 touch-none " + (dragging ? "cursor-grabbing" : "cursor-grab")}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        {/* transformed world */}
        <div className="absolute inset-0" style={layerStyle}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={uid + "-blk"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.14)" />
                <stop offset="100%" stopColor="rgba(217,70,239,0.10)" />
              </linearGradient>
              <radialGradient id={uid + "-vig"} cx="50%" cy="50%" r="70%">
                <stop offset="55%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="#050508" />
            {gridMinor}
            {gridMajor}
            {blocks.map((b, i) => (
              <rect
                key={"b" + i}
                x={b[0]} y={b[1]} width={b[2]} height={b[3]}
                fill={"url(#" + uid + "-blk)"}
                stroke="rgba(34,211,238,0.35)"
                strokeWidth={0.25}
              />
            ))}
            {roads.map((d, i) => (
              <path key={"r" + i} d={d} fill="none" stroke="rgba(253,224,71,0.22)" strokeWidth={0.8} strokeLinecap="round" />
            ))}
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-vig)"} />
          </svg>

          {/* children layer — shares world coordinate space */}
          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
            {props.children}
          </div>
        </div>

        {/* region labels (unscaled) */}
        {(props.regions ?? []).map((r) => {
          const lx = (0.5 + (r.x - cx) * zoom) * 100;
          const ly = (0.5 + (r.y - cy) * zoom) * 100;
          if (lx < -20 || lx > 120 || ly < -20 || ly > 120) return null;
          return (
            <div
              key={r.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.2em] leading-none text-cyan-300/70 transition-all duration-200"
              style={{ left: lx + "%", top: ly + "%", textShadow: "0 0 8px rgba(34,211,238,0.6)" }}
            >
              <span className="text-fuchsia-400">◆ </span>
              {r.label}
            </div>
          );
        })}

        {/* scanline sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 4px)" }}
        />

        {/* reticle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-full w-full opacity-70">
            <g stroke="rgba(253,224,71,0.5)" strokeWidth={0.4} fill="none">
              <circle cx="50" cy="50" r={dragging ? 7 : 4} className="transition-all duration-200" />
              <line x1="50" y1="42" x2="50" y2="47" />
              <line x1="50" y1="53" x2="50" y2="58" />
              <line x1="42" y1="50" x2="47" y2="50" />
              <line x1="53" y1="50" x2="58" y2="50" />
            </g>
          </svg>
        </div>

        {/* corner frame */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-yellow-300/50" />
          <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-yellow-300/50" />
          <div className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-yellow-300/50" />
          <div className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-yellow-300/50" />
        </div>
      </div>
    </div>
  );
}