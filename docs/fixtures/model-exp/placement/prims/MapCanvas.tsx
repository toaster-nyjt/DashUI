type MapCanvasProps = {
  src?: string;
  center: { x: number; y: number };
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: any;
};

export const MapCanvas_MIN = {"base":[10,8]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const z = Math.min(props.maxZoom, Math.max(props.minZoom, props.zoom));
  const cx = clamp01(props.center.x);
  const cy = clamp01(props.center.y);

  const onDown = (e: any) => {
    if (e.button != null && e.button !== 0) return;
    const el = hostRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: cx, cy: cy, moved: false };
    setDragging(true);
  };
  const onMove = (e: any) => {
    const d = dragRef.current;
    const el = hostRef.current;
    if (!d || !el || d.id !== e.pointerId) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const dx = (e.clientX - d.x) / (r.width * z);
    const dy = (e.clientY - d.y) / (r.height * z);
    if (Math.abs(e.clientX - d.x) > 2 || Math.abs(e.clientY - d.y) > 2) d.moved = true;
    props.onViewChange({ center: { x: clamp01(d.cx - dx), y: clamp01(d.cy - dy) }, zoom: z });
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
    const tx = cx + (px - 0.5) / z;
    const ty = cy + (py - 0.5) / z;
    const nz = Math.min(props.maxZoom, z * 1.6);
    props.onViewChange({ center: { x: clamp01(tx), y: clamp01(ty) }, zoom: nz });
  };

  const gridStep = 5;
  const lines: any[] = [];
  for (let i = 0; i <= 100; i += gridStep) {
    const major = i % 25 === 0;
    lines.push(<line key={"v" + i} x1={i} y1={0} x2={i} y2={100} stroke={major ? "rgba(34,211,238,0.28)" : "rgba(34,211,238,0.10)"} strokeWidth={major ? 0.35 : 0.15} />);
    lines.push(<line key={"h" + i} x1={0} y1={i} x2={100} y2={i} stroke={major ? "rgba(34,211,238,0.28)" : "rgba(34,211,238,0.10)"} strokeWidth={major ? 0.35 : 0.15} />);
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div
        ref={hostRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={onDouble}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className={"absolute inset-0 touch-none " + (dragging ? "cursor-grabbing" : "cursor-grab")}
      >
        <div
          className={"absolute inset-0 " + (dragging ? "" : "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]")}
          style={{
            transformOrigin: "50% 50%",
            transform: "scale(" + z + ") translate(" + (0.5 - cx) * 100 + "%," + (0.5 - cy) * 100 + "%)",
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)]" />
          {props.src ? (
            <img
              src={props.src}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full select-none object-cover opacity-80 saturate-50"
            />
          ) : null}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id={uid + "-vg"} cx="50%" cy="45%" r="70%">
                <stop offset="55%" stopColor="rgba(217,70,239,0.06)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.75)" />
              </radialGradient>
            </defs>
            <g>{lines}</g>
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-vg)"} />
          </svg>

          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
            {props.children}
          </div>
        </div>

        {/* HUD overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.6)_0px,rgba(34,211,238,0.6)_1px,transparent_1px,transparent_3px)]" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <g stroke="rgba(253,224,71,0.7)" strokeWidth="0.4" fill="none">
              <path d="M2 10 L2 2 L10 2" />
              <path d="M90 2 L98 2 L98 10" />
              <path d="M98 90 L98 98 L90 98" />
              <path d="M10 98 L2 98 L2 90" />
            </g>
            <g stroke={hover || dragging ? "rgba(253,224,71,0.85)" : "rgba(34,211,238,0.45)"} strokeWidth="0.25" className="transition-all duration-200 ease-out">
              <line x1="50" y1="44" x2="50" y2="48" />
              <line x1="50" y1="52" x2="50" y2="56" />
              <line x1="44" y1="50" x2="48" y2="50" />
              <line x1="52" y1="50" x2="56" y2="50" />
            </g>
            <circle
              cx="50"
              cy="50"
              r={dragging ? 3.2 : 2.2}
              fill="none"
              stroke="rgba(217,70,239,0.55)"
              strokeWidth="0.25"
              className="transition-all duration-200 ease-out"
            />
          </svg>
          <div
            className="absolute left-0 right-0 h-[2px] bg-[linear-gradient(90deg,transparent,rgba(34,211,238,0.5),transparent)]"
            style={{ animation: "mapcanvasScan 6s linear infinite" }}
          />
          <div className={"absolute inset-0 ring-1 ring-cyan-400/20 rounded-md transition-all duration-200 ease-out " + (dragging ? "shadow-[inset_0_0_24px_rgba(253,224,71,0.18)]" : "")} />
        </div>
      </div>
      <style>{"@keyframes mapcanvasScan{0%{top:-2%}100%{top:102%}}"}</style>
    </div>
  );
}