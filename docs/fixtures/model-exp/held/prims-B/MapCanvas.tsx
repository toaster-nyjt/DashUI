type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: any;
};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<any>(null);
  const dragRef = useRef<any>(null);
  const [dragging, setDragging] = useState(false);

  const zoom = Math.max(0.2, props.zoom || 1);
  const cx = Math.min(1, Math.max(0, props.center ? props.center.x : 0.5));
  const cy = Math.min(1, Math.max(0, props.center ? props.center.y : 0.5));
  const regions = props.regions || [];
  const floor = MapCanvas_MIN.base;

  const onDown = (e: any) => {
    const el = hostRef.current;
    if (!el) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    const r = el.getBoundingClientRect();
    dragRef.current = { px: e.clientX, py: e.clientY, w: r.width, h: r.height, cx: cx, cy: cy };
    setDragging(true);
  };
  const onMove = (e: any) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.px) / Math.max(1, d.w) / zoom;
    const dy = (e.clientY - d.py) / Math.max(1, d.h) / zoom;
    const nx = Math.min(1.2, Math.max(-0.2, d.cx - dx));
    const ny = Math.min(1.2, Math.max(-0.2, d.cy - dy));
    props.onViewChange({ center: { x: nx, y: ny }, zoom: zoom });
  };
  const onUp = (e: any) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const tx = 50 - cx * 100 * zoom;
  const ty = 50 - cy * 100 * zoom;
  const worldStyle = {
    transformOrigin: "0 0",
    transform: "translate(" + tx + "%," + ty + "%) scale(" + zoom + ")",
    transition: dragging ? "none" : "transform 220ms ease-out"
  } as any;

  const palette = ["#22d3ee", "#e879f9", "#fbbf24", "#34d399", "#f43f5e", "#a78bfa"];

  return (
    <div
      ref={hostRef}
      className="relative h-full w-full overflow-hidden touch-none select-none bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* static grid haze */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.10) 1px, transparent 1px)",
          backgroundSize: "8% 8%, 8% 8%"
        }}
      />

      {/* world layer */}
      <div className="absolute inset-0" style={worldStyle}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.22)" />
              <stop offset="100%" stopColor="rgba(232,121,249,0.10)" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.006" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter={"url(#" + uid + "-glow)"}>
            {regions.map((r, i) => {
              const col = palette[i % palette.length];
              if (r.path) {
                return (
                  <path
                    key={"rg-" + r.id}
                    d={r.path}
                    fill={"url(#" + uid + "-fill)"}
                    stroke={col}
                    strokeOpacity={0.65}
                    strokeWidth={1.4}
                    vectorEffect="non-scaling-stroke"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.35;0.8;0.35"
                      dur={(5 + (i % 4)) + "s"}
                      repeatCount="indefinite"
                    />
                  </path>
                );
              }
              const b = r.bounds;
              if (!b) return null;
              return (
                <g key={"rg-" + r.id}>
                  <rect
                    x={b.x}
                    y={b.y}
                    width={Math.max(0, b.w)}
                    height={Math.max(0, b.h)}
                    fill={"url(#" + uid + "-fill)"}
                    stroke={col}
                    strokeOpacity={0.6}
                    strokeWidth={1.4}
                    vectorEffect="non-scaling-stroke"
                  >
                    <animate
                      attributeName="stroke-opacity"
                      values="0.3;0.85;0.3"
                      dur={(4 + (i % 5)) + "s"}
                      repeatCount="indefinite"
                    />
                  </rect>
                  <line
                    x1={b.x}
                    y1={b.y}
                    x2={b.x + Math.min(b.w, 0.04)}
                    y2={b.y}
                    stroke={col}
                    strokeWidth={3}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* region labels, counter-scaled to stay legible */}
        {regions.map((r, i) => {
          const b = r.bounds;
          const lx = b ? (b.x + b.w / 2) * 100 : ((i % 4) + 0.5) * 25;
          const ly = b ? (b.y + b.h / 2) * 100 : (Math.floor(i / 4) + 0.5) * 25;
          return (
            <div
              key={"lb-" + r.id}
              className="absolute"
              style={{ left: lx + "%", top: ly + "%", transform: "translate(-50%,-50%) scale(" + 1 / zoom + ")" }}
            >
              <div className="max-w-[12rem] truncate min-w-0 border border-cyan-400/30 bg-black/70 px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] leading-none text-cyan-200/80">
                {r.label}
              </div>
            </div>
          );
        })}

        {/* held layers: markers / routes */}
        <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
          {props.children}
        </div>
      </div>

      {/* empty state */}
      {regions.length === 0 ? (
        <div className="absolute inset-[30%] pointer-events-none">
          <FitText className="font-mono font-bold uppercase tracking-widest text-cyan-300/30">NO MAP DATA</FitText>
        </div>
      ) : null}

      {/* scan sweep + vignette + reticle */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 3px)"
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 animate-pulse"
        style={{ boxShadow: "inset 0 0 40px rgba(34,211,238,0.12)" }}
      />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="50" y1="46" x2="50" y2="54" stroke="rgba(34,211,238,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        <line x1="46" y1="50" x2="54" y2="50" stroke="rgba(34,211,238,0.35)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="pointer-events-none absolute inset-0 border border-cyan-400/25" />
    </div>
  );
}

export const MapCanvas_MIN = {"base":[9,7]};