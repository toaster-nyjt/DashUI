type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: any;
};

export const MapCanvas_MIN = {"base":[10,8]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const z = Math.max(0.25, props.zoom || 1);
  const cx = Math.min(1, Math.max(0, props.center ? props.center.x : 0.5));
  const cy = Math.min(1, Math.max(0, props.center ? props.center.y : 0.5));
  const regions = props.regions || [];

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const onDown = (e: any) => {
    if (e.button !== undefined && e.button !== 0) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    dragRef.current = { x: e.clientX, y: e.clientY, cx: cx, cy: cy };
    setDragging(true);
  };
  const onMove = (e: any) => {
    const d = dragRef.current;
    if (!d || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dx = (e.clientX - d.x) / r.width / z;
    const dy = (e.clientY - d.y) / r.height / z;
    props.onViewChange({ center: { x: clamp01(d.cx - dx), y: clamp01(d.cy - dy) }, zoom: z });
  };
  const onUp = (e: any) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const floor = MapCanvas_MIN.base;
  const tx = (0.5 - cx) * 100;
  const ty = (0.5 - cy) * 100;
  const layerStyle = {
    transform: "scale(" + z + ") translate(" + tx + "%, " + ty + "%)",
    transformOrigin: "50% 50%",
    transition: dragging ? "none" : "transform 320ms cubic-bezier(0.22,0.9,0.28,1)"
  } as any;

  const grid: any[] = [];
  for (let i = 1; i < 12; i++) {
    const p = i / 12;
    grid.push(<line key={"gv" + i} x1={p} y1={0} x2={p} y2={1} stroke="rgba(34,211,238,0.10)" strokeWidth={0.0015} />);
    grid.push(<line key={"gh" + i} x1={0} y1={p} x2={1} y2={p} stroke="rgba(34,211,238,0.10)" strokeWidth={0.0015} />);
  }

  return (
    <div
      ref={hostRef}
      className={"relative h-full w-full overflow-hidden touch-none select-none bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10 " + (dragging ? "cursor-grabbing" : "cursor-grab")}
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div className="absolute inset-0" style={layerStyle}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0a0f12" />
              <stop offset="55%" stopColor="#05080a" />
              <stop offset="100%" stopColor="#0d0a12" />
            </linearGradient>
            <linearGradient id={uid + "-reg"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.16)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.04)" />
            </linearGradient>
            <linearGradient id={uid + "-regHot"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(232,121,249,0.30)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0.10)" />
            </linearGradient>
          </defs>
          <rect x={0} y={0} width={1} height={1} fill={"url(#" + uid + "-bg)"} />
          {grid}
          <g>
            {regions.map((r) => {
              const hot = hover === r.id;
              const common = {
                fill: hot ? "url(#" + uid + "-regHot)" : "url(#" + uid + "-reg)",
                stroke: hot ? "rgba(232,121,249,0.9)" : "rgba(34,211,238,0.45)",
                strokeWidth: hot ? 2 : 1.2,
                vectorEffect: "non-scaling-stroke" as any,
                onPointerEnter: () => setHover(r.id),
                onPointerLeave: () => setHover((h) => (h === r.id ? null : h)),
                style: { transition: "fill 200ms ease-out, stroke 200ms ease-out" }
              };
              if (r.path) return <path key={r.id} d={r.path} {...common} />;
              if (r.bounds)
                return <rect key={r.id} x={r.bounds.x} y={r.bounds.y} width={Math.max(0, r.bounds.w)} height={Math.max(0, r.bounds.h)} {...common} />;
              return null;
            })}
          </g>
          <g opacity={0.5}>
            <line x1={0} y1={cy} x2={1} y2={cy} stroke="rgba(245,158,11,0.18)" strokeWidth={0.001} />
            <line x1={cx} y1={0} x2={cx} y2={1} stroke="rgba(245,158,11,0.18)" strokeWidth={0.001} />
          </g>
        </svg>

        {regions.map((r) =>
          r.bounds ? (
            <div
              key={"lbl-" + r.id}
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                left: (r.bounds.x + r.bounds.w / 2) * 100 + "%",
                top: (r.bounds.y + r.bounds.h / 2) * 100 + "%",
                transform: "translate(-50%,-50%) scale(" + 1 / z + ")"
              }}
            >
              <span
                className={
                  "whitespace-nowrap px-2 py-1 border text-[10px] font-mono font-bold uppercase tracking-[0.22em] transition-all duration-200 ease-out " +
                  (hover === r.id
                    ? "text-fuchsia-200 border-fuchsia-400/60 bg-black/80 shadow-[0_0_12px_rgba(232,121,249,0.5)]"
                    : "text-cyan-200/70 border-cyan-400/20 bg-black/55")
                }
              >
                {r.label}
              </span>
            </div>
          ) : null
        )}

        <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
          {props.children}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 4px)" }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.9), inset 0 0 18px rgba(34,211,238,0.10)" }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-0 right-0 h-[18%]"
          style={{
            background: "linear-gradient(180deg, transparent, rgba(34,211,238,0.10), transparent)",
            animation: "mapcanvassweep 5s linear infinite"
          }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 border border-cyan-400/25" />
      <style>{"@keyframes mapcanvassweep{0%{top:-20%}100%{top:110%}}"}</style>
    </div>
  );
}