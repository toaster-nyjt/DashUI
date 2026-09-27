type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: React.ReactNode;
};

export const MapCanvas_MIN = {"base":[9,7]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; cx: number; cy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
  const zoom = clamp(props.zoom || 1, 0.5, 8);
  const cx = clamp(props.center ? props.center.x : 0.5, 0, 1);
  const cy = clamp(props.center ? props.center.y : 0.5, 0, 1);

  const span = 1000 / zoom;
  const vx = cx * 1000 - span / 2;
  const vy = cy * 1000 - span / 2;
  const k = 1 / zoom;

  const emit = (nx: number, ny: number, nz: number) => {
    props.onViewChange({ center: { x: clamp(nx, 0, 1), y: clamp(ny, 0, 1) }, zoom: clamp(nz, 0.5, 8) });
  };

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: cx, cy: cy };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const el = hostRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pxPerUnit = (Math.max(r.width, r.height) * zoom) / 1000;
    if (pxPerUnit <= 0) return;
    const dx = (e.clientX - d.x) / pxPerUnit / 1000;
    const dy = (e.clientY - d.y) / pxPerUnit / 1000;
    emit(d.cx - dx, d.cy - dy, zoom);
  };
  const onUp = (e: React.PointerEvent) => {
    if (dragRef.current && dragRef.current.id === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  const grid: number[] = [];
  for (let i = 0; i <= 20; i++) grid.push(i * 50);

  const regions = props.regions || [];

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]" />
      <div
        ref={hostRef}
        className={
          "absolute inset-0 touch-none " +
          (dragging ? "cursor-grabbing" : "cursor-grab")
        }
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={vx + " " + vy + " " + span + " " + span}
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id={uid + "-reg"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.20" />
              <stop offset="100%" stopColor="rgb(232,121,249)" stopOpacity="0.07" />
            </linearGradient>
            <linearGradient id={uid + "-hot"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="rgb(232,121,249)" stopOpacity="0.25" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={2 * k} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect x={-2000} y={-2000} width={6000} height={6000} fill="rgb(6,8,10)" />

          <g stroke="rgba(34,211,238,0.10)" strokeWidth={k}>
            {grid.map((g) => (
              <line key={"gv-" + g} x1={g} y1={-1000} x2={g} y2={2000} />
            ))}
            {grid.map((g) => (
              <line key={"gh-" + g} x1={-1000} y1={g} x2={2000} y2={g} />
            ))}
          </g>
          <g stroke="rgba(34,211,238,0.22)" strokeWidth={1.6 * k}>
            {[0, 250, 500, 750, 1000].map((g) => (
              <line key={"mv-" + g} x1={g} y1={0} x2={g} y2={1000} />
            ))}
            {[0, 250, 500, 750, 1000].map((g) => (
              <line key={"mh-" + g} x1={0} y1={g} x2={1000} y2={g} />
            ))}
          </g>

          <rect x={0} y={0} width={1000} height={1000} fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth={2 * k} />

          {regions.map((r, i) => {
            const b = r.bounds;
            const hot = hover === r.id;
            const fill = "url(#" + uid + (hot ? "-hot" : "-reg") + ")";
            const stroke = hot ? "rgb(103,232,249)" : "rgba(34,211,238,0.5)";
            const common = {
              fill: fill,
              stroke: stroke,
              strokeWidth: (hot ? 2.6 : 1.6) * k,
              filter: hot ? "url(#" + uid + "-glow)" : undefined,
              onPointerEnter: () => setHover(r.id),
              onPointerLeave: () => setHover((h) => (h === r.id ? null : h)),
              style: { transition: "all 200ms ease-out" } as any,
            };
            return (
              <g key={r.id || "r-" + i}>
                {r.path ? (
                  <path d={r.path} {...common} />
                ) : b ? (
                  <rect x={b.x * 1000} y={b.y * 1000} width={b.w * 1000} height={b.h * 1000} {...common} />
                ) : null}
              </g>
            );
          })}

          {regions.map((r, i) => {
            const b = r.bounds;
            if (!b || !r.label) return null;
            const hot = hover === r.id;
            return (
              <g key={"lbl-" + (r.id || i)} pointerEvents="none">
                <text
                  x={(b.x + b.w / 2) * 1000}
                  y={(b.y + b.h / 2) * 1000}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={22 * k}
                  letterSpacing={3 * k}
                  style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700, transition: "fill 200ms ease-out" }}
                  fill={hot ? "rgb(165,243,252)" : "rgba(103,232,249,0.72)"}
                >
                  {r.label.toUpperCase()}
                </text>
                <line
                  x1={(b.x + b.w / 2) * 1000 - 24 * k}
                  x2={(b.x + b.w / 2) * 1000 + 24 * k}
                  y1={(b.y + b.h / 2) * 1000 + 16 * k}
                  y2={(b.y + b.h / 2) * 1000 + 16 * k}
                  stroke={hot ? "rgb(232,121,249)" : "rgba(34,211,238,0.35)"}
                  strokeWidth={1.5 * k}
                />
              </g>
            );
          })}

          {regions.length === 0 ? (
            <text
              x={500}
              y={500}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={26 * k}
              letterSpacing={5 * k}
              fill="rgba(115,115,115,0.9)"
              style={{ fontFamily: "ui-monospace, monospace", fontWeight: 700 }}
            >
              NO SIGNAL
            </text>
          ) : null}
        </svg>

        <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.6)_0px,rgba(34,211,238,0.6)_1px,transparent_1px,transparent_4px)]" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]" />

        {/* crosshair */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-fuchsia-400/60" />
          <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-fuchsia-400/60" />
          <div className="absolute inset-[30%] rounded-full border border-fuchsia-400/70 animate-pulse shadow-[0_0_12px_rgba(232,121,249,0.5)]" />
        </div>
      </div>

      {/* overlay content */}
      <div className="pointer-events-none absolute inset-0">{props.children}</div>

      {/* zoom controls */}
      <div className="absolute right-1 top-1 flex flex-col gap-1">
        {[1, -1].map((dir) => (
          <button
            key={"z" + dir}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => emit(cx, cy, dir > 0 ? zoom * 1.35 : zoom / 1.35)}
            className="h-6 w-6 border border-cyan-300/40 bg-neutral-800/80 text-cyan-200 font-mono font-bold text-xs leading-none flex items-center justify-center transition-all duration-200 ease-out hover:bg-cyan-300 hover:text-black hover:border-cyan-200 hover:shadow-[0_0_16px_rgba(34,211,238,0.5)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            {dir > 0 ? "+" : "\u2212"}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute left-1 bottom-1 border border-cyan-400/25 bg-black/70 px-2 py-1">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-amber-300/70">
          {"x" + zoom.toFixed(2) + " \u00b7 " + cx.toFixed(2) + "/" + cy.toFixed(2)}
        </span>
      </div>
    </div>
  );
}