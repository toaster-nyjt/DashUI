type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: any;
};

export const MapCanvas_MIN = {"base":[12,10]};

export function MapCanvas(props: MapCanvasProps) {
  const { regions, center, zoom, onViewChange, children } = props;
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; cx: number; cy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const z = Math.max(0.2, Math.min(12, zoom || 1));
  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const onDown = (e: any) => {
    if (e.button != null && e.button !== 0) return;
    const el = hostRef.current;
    if (!el) return;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: center.x, cy: center.y };
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
    onViewChange({ center: { x: clamp01(d.cx - dx), y: clamp01(d.cy - dy) }, zoom: z });
  };
  const onUp = (e: any) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
  };

  const tx = (0.5 - center.x) * 100;
  const ty = (0.5 - center.y) * 100;

  const grid: any[] = [];
  for (let i = 0; i <= 20; i++) {
    const p = i * 5;
    const major = i % 5 === 0;
    grid.push(<line key={"gv" + i} x1={p} y1={0} x2={p} y2={100} stroke={major ? "rgba(34,211,238,0.22)" : "rgba(34,211,238,0.08)"} strokeWidth={major ? 0.22 : 0.12} />);
    grid.push(<line key={"gh" + i} x1={0} y1={p} x2={100} y2={p} stroke={major ? "rgba(34,211,238,0.22)" : "rgba(34,211,238,0.08)"} strokeWidth={major ? 0.22 : 0.12} />);
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none touch-none bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem", cursor: dragging ? "grabbing" : "grab" }}
      ref={hostRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: "scale(" + z + ") translate(" + tx + "%," + ty + "%)",
          transformOrigin: "50% 50%",
          transition: dragging ? "none" : "transform 260ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#04090c" />
              <stop offset="55%" stopColor="#000000" />
              <stop offset="100%" stopColor="#0a1417" />
            </linearGradient>
            <linearGradient id={uid + "-reg"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.20)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.05)" />
            </linearGradient>
            <linearGradient id={uid + "-regh"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(232,121,249,0.30)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.12)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-bg)"} />
          <g>{grid}</g>
          {regions.map((r, i) => {
            const hot = hoverId === r.id;
            const common = {
              fill: hot ? "url(#" + uid + "-regh)" : "url(#" + uid + "-reg)",
              stroke: hot ? "rgba(232,121,249,0.9)" : "rgba(34,211,238,0.5)",
              strokeWidth: hot ? 0.5 : 0.3,
              vectorEffect: "non-scaling-stroke" as any,
              onPointerEnter: () => setHoverId(r.id),
              onPointerLeave: () => setHoverId((h) => (h === r.id ? null : h)),
              style: { transition: "fill 200ms ease-out, stroke 200ms ease-out" },
            };
            if (r.path) return <path key={r.id} d={r.path} {...common} />;
            const b = r.bounds;
            if (!b) return null;
            return <rect key={r.id} x={b.x * 100} y={b.y * 100} width={b.w * 100} height={b.h * 100} {...common} />;
          })}
        </svg>

        {regions.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500">no district data</div>
          </div>
        ) : null}

        {regions.map((r) => {
          const b = r.bounds;
          let lx = 50, ly = 50;
          if (b) { lx = (b.x + b.w / 2) * 100; ly = (b.y + b.h / 2) * 100; }
          else if (r.path) { return null; }
          const hot = hoverId === r.id;
          return (
            <div
              key={"lb-" + r.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: lx + "%", top: ly + "%", transform: "translate(-50%,-50%) scale(" + (1 / z) + ")" }}
            >
              <div
                className={
                  "px-2 py-1 border bg-neutral-900/70 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.18em] leading-none whitespace-nowrap transition-all duration-200 ease-out " +
                  (hot ? "border-fuchsia-400/60 text-fuchsia-300 shadow-[0_0_12px_rgba(232,121,249,0.5)]" : "border-cyan-400/25 text-cyan-200/80")
                }
              >
                {r.label}
              </div>
            </div>
          );
        })}

        <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">{children}</div>
      </div>

      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.06) 0px, rgba(34,211,238,0.06) 1px, transparent 1px, transparent 3px)" }}
      />
      <div className="absolute inset-0 pointer-events-none border border-cyan-400/25" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-1/2 h-px w-3 bg-cyan-400/50" />
        <div className="absolute right-0 top-1/2 h-px w-3 bg-cyan-400/50" />
        <div className="absolute top-0 left-1/2 w-px h-3 bg-cyan-400/50" />
        <div className="absolute bottom-0 left-1/2 w-px h-3 bg-cyan-400/50" />
      </div>
    </div>
  );
}