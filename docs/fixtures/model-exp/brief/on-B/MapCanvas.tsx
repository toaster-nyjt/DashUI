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
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const last = useRef<{ x: number; y: number; dist: number; zoom: number } | null>(null);

  const clampC = (c: { x: number; y: number }) => ({
    x: Math.min(1, Math.max(0, c.x)),
    y: Math.min(1, Math.max(0, c.y)),
  });

  const rect = () => wrapRef.current ? wrapRef.current.getBoundingClientRect() : null;

  const onDown = (e: any) => {
    const r = rect();
    if (!r) return;
    (e.currentTarget as any).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());
    if (pts.length === 1) {
      last.current = { x: e.clientX, y: e.clientY, dist: 0, zoom: z };
      setDragging(true);
    } else if (pts.length === 2) {
      const dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
      last.current = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2, dist: Math.hypot(dx, dy) || 1, zoom: z };
    }
  };

  const onMove = (e: any) => {
    if (!pointers.current.has(e.pointerId)) return;
    const r = rect();
    if (!r || !last.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = Array.from(pointers.current.values());
    if (pts.length >= 2) {
      const dx = pts[0].x - pts[1].x, dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;
      const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
      const nz = Math.min(maxZ, Math.max(minZ, last.current.zoom * (dist / last.current.dist)));
      const ndx = (mx - last.current.x) / r.width;
      const ndy = (my - last.current.y) / r.height;
      const c = clampC({ x: props.center.x - ndx / nz, y: props.center.y - ndy / nz });
      last.current = { x: mx, y: my, dist, zoom: nz };
      props.onViewportChange({ zoom: nz, center: c });
      return;
    }
    const ndx = (e.clientX - last.current.x) / r.width;
    const ndy = (e.clientY - last.current.y) / r.height;
    last.current = { x: e.clientX, y: e.clientY, dist: 0, zoom: z };
    props.onViewportChange({ zoom: z, center: clampC({ x: props.center.x - ndx / z, y: props.center.y - ndy / z }) });
  };

  const onUp = (e: any) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) { setDragging(false); last.current = null; }
    else {
      const pts = Array.from(pointers.current.values());
      last.current = { x: pts[0].x, y: pts[0].y, dist: 0, zoom: z };
    }
  };

  const onDouble = (e: any) => {
    const r = rect();
    if (!r) return;
    const nz = Math.min(maxZ, Math.max(minZ, z * 1.6));
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const worldX = props.center.x + (px - 0.5) / z;
    const worldY = props.center.y + (py - 0.5) / z;
    const c = clampC({ x: worldX - (px - 0.5) / nz, y: worldY - (py - 0.5) / nz });
    props.onViewportChange({ zoom: nz, center: c });
  };

  const cx = Math.min(1, Math.max(0, props.center.x));
  const cy = Math.min(1, Math.max(0, props.center.y));
  const tx = (0.5 - cx * z) * 100;
  const ty = (0.5 - cy * z) * 100;

  const grid: any[] = [];
  for (let i = 1; i < 12; i++) {
    grid.push(<line key={"gv" + i} x1={i * 100 / 12} y1={0} x2={i * 100 / 12} y2={100} stroke="rgba(34,211,238,0.10)" strokeWidth={0.15} />);
    grid.push(<line key={"gh" + i} x1={0} y1={i * 100 / 12} x2={100} y2={i * 100 / 12} stroke="rgba(34,211,238,0.10)" strokeWidth={0.15} />);
  }

  const blocks = [
    [6, 8, 30, 24], [40, 5, 34, 18], [78, 10, 16, 30], [8, 38, 22, 26],
    [36, 28, 26, 22], [66, 46, 26, 24], [14, 70, 30, 22], [50, 58, 12, 34],
    [66, 12, 8, 26], [36, 56, 10, 14]
  ];
  const roads = [
    "M0,32 L100,28", "M0,64 L100,68", "M30,0 L34,100", "M70,0 L66,100",
    "M0,88 L100,84", "M0,10 L100,6"
  ];

  return (
    <div
      ref={wrapRef}
      className={"relative h-full w-full overflow-hidden touch-none select-none rounded-md bg-black/60 " + (dragging ? "cursor-grabbing" : "cursor-grab")}
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onDoubleClick={onDouble}
    >
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out"
        style={{ transformOrigin: "0 0", transform: "translate(" + tx + "%," + ty + "%) scale(" + z + ")" }}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#09090b" />
              <stop offset="50%" stopColor="#000000" />
              <stop offset="100%" stopColor="#0b1416" />
            </linearGradient>
            <linearGradient id={uid + "-blk"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.16)" />
              <stop offset="100%" stopColor="rgba(217,70,239,0.10)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-bg)"} />
          {grid}
          {blocks.map((b, i) => (
            <rect key={"b" + i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx={0.8}
              fill={"url(#" + uid + "-blk)"} stroke="rgba(34,211,238,0.30)" strokeWidth={0.2} />
          ))}
          {roads.map((d, i) => (
            <path key={"r" + i} d={d} fill="none" stroke="rgba(253,224,71,0.25)" strokeWidth={0.5} strokeLinecap="round" />
          ))}
          {roads.map((d, i) => (
            <path key={"rd" + i} d={d} fill="none" stroke="rgba(253,224,71,0.5)" strokeWidth={0.12} strokeDasharray="1.5 2.5">
              <animate attributeName="stroke-dashoffset" from="0" to="-8" dur={(6 + i) + "s"} repeatCount="indefinite" />
            </path>
          ))}
        </svg>

        {(props.regions ?? []).map((r) => (
          <div
            key={r.id}
            className="absolute"
            style={{ left: (r.x * 100) + "%", top: (r.y * 100) + "%" }}
          >
            <div
              className="-translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.2em] leading-none text-cyan-300/80 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]"
              style={{ transform: "translate(-50%,-50%) scale(" + (1 / z) + ")", transformOrigin: "center" }}
            >
              {r.label}
            </div>
          </div>
        ))}

        <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
          {props.children}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 3px)" }} />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />
      <div className="pointer-events-none absolute inset-0 border border-cyan-400/15 rounded-md" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
        <line x1="50" y1="46" x2="50" y2="54" stroke="rgba(253,224,71,0.45)" strokeWidth="0.25" />
        <line x1="46" y1="50" x2="54" y2="50" stroke="rgba(253,224,71,0.45)" strokeWidth="0.25" />
      </svg>
      <div className="pointer-events-none absolute left-0 right-0 h-px bg-cyan-400/25 shadow-[0_0_10px_rgba(34,211,238,0.7)]" style={{ animation: "mapcanvasscan 5s linear infinite", top: 0 }} />
      <style>{"@keyframes mapcanvasscan{0%{top:0%}100%{top:100%}}"}</style>
    </div>
  );
}