type MapCanvasProps = { src?: string; center: { x: number; y: number }; zoom: number; minZoom: number; maxZoom: number; onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void; children?: any };

export const MapCanvas_MIN = {"base":[12,9]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pulse, setPulse] = useState(0);

  const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
  const z = clamp(props.zoom, props.minZoom, props.maxZoom);
  const cx = clamp(props.center.x, 0, 1);
  const cy = clamp(props.center.y, 0, 1);

  useEffect(() => { setPulse((p) => p + 1); }, [Math.round(z * 100), Math.round(cx * 1000), Math.round(cy * 1000)]);

  const onDown = (e: any) => {
    if (e.button !== undefined && e.button !== 0) return;
    const el = hostRef.current;
    if (!el) return;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: cx, cy: cy, moved: false };
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
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 2) d.moved = true;
    props.onViewChange({ center: { x: clamp(d.cx - dx, 0, 1), y: clamp(d.cy - dy, 0, 1) }, zoom: z });
  };
  const onUp = (e: any) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  };
  const onDouble = (e: any) => {
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const nz = clamp(z * 1.6, props.minZoom, props.maxZoom);
    const wx = cx + (px - 0.5) / z;
    const wy = cy + (py - 0.5) / z;
    props.onViewChange({ center: { x: clamp(wx - (px - 0.5) / nz, 0, 1), y: clamp(wy - (py - 0.5) / nz, 0, 1) }, zoom: nz });
  };

  const tx = (0.5 - cx * z) * 100;
  const ty = (0.5 - cy * z) * 100;
  const gridStep = z >= 4 ? 2.5 : z >= 2 ? 5 : 10;
  const lines: number[] = [];
  for (let v = 0; v <= 100.001; v += gridStep) lines.push(Math.round(v * 100) / 100);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/20 select-none"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1a0b2e_0%,#07070c_65%)]" />
      <div
        ref={hostRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={onDouble}
        className={"absolute inset-0 touch-none " + (dragging ? "cursor-grabbing" : "cursor-grab")}
      >
        <div
          className={"absolute inset-0 " + (dragging ? "" : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]")}
          style={{ transform: "translate(" + tx + "%, " + ty + "%) scale(" + z + ")", transformOrigin: "0 0" }}
        >
          {props.src ? (
            <img
              src={props.src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover opacity-70 contrast-125 saturate-50"
            />
          ) : null}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id={uid + "-terr"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0b1b2a" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#140a24" stopOpacity="0.85" />
              </linearGradient>
              <radialGradient id={uid + "-hot"} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
            </defs>
            {!props.src ? <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-terr)"} /> : null}
            {!props.src ? (
              <g>
                <circle cx="50" cy="46" r="26" fill={"url(#" + uid + "-hot)"} />
                <path d="M0 62 L18 55 L34 60 L52 48 L72 54 L100 44" fill="none" stroke="#22d3ee" strokeOpacity="0.22" strokeWidth={0.5 / z} />
                <path d="M0 24 L26 30 L44 22 L66 30 L100 20" fill="none" stroke="#d946ef" strokeOpacity="0.18" strokeWidth={0.5 / z} />
                <path d="M30 0 L34 34 L28 62 L36 100" fill="none" stroke="#22d3ee" strokeOpacity="0.15" strokeWidth={0.4 / z} />
                <path d="M70 0 L64 30 L72 66 L66 100" fill="none" stroke="#22d3ee" strokeOpacity="0.15" strokeWidth={0.4 / z} />
                <rect x="38" y="38" width="24" height="20" fill="#22d3ee" fillOpacity="0.05" stroke="#facc15" strokeOpacity="0.2" strokeWidth={0.3 / z} />
              </g>
            ) : null}
            <g stroke="#22d3ee" strokeOpacity="0.14" strokeWidth={0.25 / z}>
              {lines.map((v, i) => (
                <line key={"v" + i} x1={v} y1="0" x2={v} y2="100" />
              ))}
              {lines.map((v, i) => (
                <line key={"h" + i} x1="0" y1={v} x2="100" y2={v} />
              ))}
            </g>
            <g stroke="#facc15" strokeOpacity="0.22" strokeWidth={0.35 / z}>
              <line x1="0" y1="50" x2="100" y2="50" />
              <line x1="50" y1="0" x2="50" y2="100" />
            </g>
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth={0.6 / z} />
          </svg>
          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">{props.children}</div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-25 bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.18)_0px,rgba(34,211,238,0.18)_1px,transparent_1px,transparent_3px)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7)_100%)]" />

      <div className="pointer-events-none absolute inset-0">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <g stroke="#facc15" strokeOpacity="0.7" strokeWidth="0.5" fill="none">
            <path d="M1 8 L1 1 L9 1" />
            <path d="M91 1 L99 1 L99 8" />
            <path d="M99 92 L99 99 L91 99" />
            <path d="M9 99 L1 99 L1 92" />
          </g>
          <g stroke="#22d3ee" strokeOpacity="0.5" strokeWidth="0.3">
            <line x1="50" y1="46.5" x2="50" y2="49" />
            <line x1="50" y1="51" x2="50" y2="53.5" />
            <line x1="46.5" y1="50" x2="49" y2="50" />
            <line x1="51" y1="50" x2="53.5" y2="50" />
          </g>
        </svg>
        <div
          key={"ping-" + pulse}
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/60 opacity-0 animate-ping"
        />
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.8),transparent)] opacity-60 animate-[mapcanvasScan_4s_linear_infinite]" style={{ animationName: undefined }} />
      <div
        className={"pointer-events-none absolute inset-0 rounded-md transition-all duration-200 ease-out " + (dragging ? "ring-2 ring-fuchsia-400/50 shadow-[inset_0_0_30px_rgba(217,70,239,0.15)]" : "ring-0")}
      />
    </div>
  );
}