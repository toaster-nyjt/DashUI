type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: React.ReactNode;
};

const MapCanvasClamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const regions = props.regions || [];
  const zoom = MapCanvasClamp(props.zoom || 1, 0.4, 16);
  const cx = MapCanvasClamp(props.center ? props.center.x : 0.5, -0.5, 1.5);
  const cy = MapCanvasClamp(props.center ? props.center.y : 0.5, -0.5, 1.5);

  const [hover, setHover] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map()).current;
  const gesture = useRef<{ dist: number; zoom: number; center: { x: number; y: number }; last: { x: number; y: number } } | null>(null);

  const emit = (c: { x: number; y: number }, z: number) => {
    props.onViewChange({
      center: { x: MapCanvasClamp(c.x, 0, 1), y: MapCanvasClamp(c.y, 0, 1) },
      zoom: MapCanvasClamp(z, 0.4, 16),
    });
  };

  const sideOf = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { side: Math.min(r.width, r.height) || 1, rect: r };
  };

  const onDown = (e: any) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) {
      setDragging(true);
      gesture.current = { dist: 0, zoom: zoom, center: { x: cx, y: cy }, last: { x: e.clientX, y: e.clientY } };
    } else if (ptrs.size === 2) {
      const p = Array.from(ptrs.values());
      const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1;
      gesture.current = { dist: d, zoom: zoom, center: { x: cx, y: cy }, last: { x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 } };
    }
  };

  const onMove = (e: any) => {
    if (!ptrs.has(e.pointerId) || !gesture.current) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const { side } = sideOf(e.currentTarget);
    const pts = Array.from(ptrs.values());
    if (pts.length >= 2) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const nz = MapCanvasClamp(gesture.current.zoom * (d / (gesture.current.dist || d)), 0.4, 16);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const dx = mid.x - gesture.current.last.x;
      const dy = mid.y - gesture.current.last.y;
      gesture.current.last = mid;
      emit({ x: cx - dx / (side * nz), y: cy - dy / (side * nz) }, nz);
      return;
    }
    const dx = e.clientX - gesture.current.last.x;
    const dy = e.clientY - gesture.current.last.y;
    gesture.current.last = { x: e.clientX, y: e.clientY };
    emit({ x: cx - dx / (side * zoom), y: cy - dy / (side * zoom) }, zoom);
  };

  const onUp = (e: any) => {
    ptrs.delete(e.pointerId);
    if (ptrs.size === 0) {
      setDragging(false);
      gesture.current = null;
    }
  };

  const onDouble = (e: any) => {
    const { side, rect } = sideOf(e.currentTarget);
    const ox = (e.clientX - (rect.left + rect.width / 2)) / (side * zoom);
    const oy = (e.clientY - (rect.top + rect.height / 2)) / (side * zoom);
    const nz = MapCanvasClamp(zoom * 1.6, 0.4, 16);
    emit({ x: cx + ox * (1 - zoom / nz) + ox * (zoom / nz) * 0, y: cy + oy * (1 - zoom / nz) }, nz);
  };

  const k = 1000 * zoom;
  const mapT = "translate(500,500) scale(" + k + ") translate(" + -cx + "," + -cy + ")";
  const toScreen = (x: number, y: number) => ({ sx: 500 + (x - cx) * k, sy: 500 + (y - cy) * k });

  const gridLines = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const major = i % 5 === 0;
    gridLines.push(
      <line key={"gv" + i} x1={t} y1={-0.2} x2={t} y2={1.2} stroke={major ? "rgba(34,211,238,0.28)" : "rgba(34,211,238,0.11)"} strokeWidth={major ? 1.1 : 0.6} vectorEffect="non-scaling-stroke" />
    );
    gridLines.push(
      <line key={"gh" + i} x1={-0.2} y1={t} x2={1.2} y2={t} stroke={major ? "rgba(34,211,238,0.28)" : "rgba(34,211,238,0.11)"} strokeWidth={major ? 1.1 : 0.6} vectorEffect="non-scaling-stroke" />
    );
  }

  const floor = MapCanvas_MIN.base;

  return (
    <div
      className="relative h-full w-full overflow-hidden touch-none select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem", cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onDoubleClick={onDouble}
    >
      <style>{"@keyframes " + uid + "-sweep{0%{transform:translateY(-10%)}100%{transform:translateY(110%)}}@keyframes " + uid + "-pulse{0%,100%{opacity:.35}50%{opacity:.9}}"}</style>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id={uid + "-clip"}>
            <rect x="0" y="0" width="1000" height="1000" />
          </clipPath>
          <radialGradient id={uid + "-vig"} cx="50%" cy="50%" r="72%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
          </radialGradient>
          <linearGradient id={uid + "-reg"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={uid + "-regHot"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e879f9" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.14" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g clipPath={"url(#" + uid + "-clip)"}>
          <rect x="0" y="0" width="1000" height="1000" fill="#04070a" />

          <g transform={mapT}>{gridLines}</g>

          <g transform={mapT}>
            {regions.map((r, i) => {
              const hot = hover === r.id;
              const common = {
                fill: hot ? "url(#" + uid + "-regHot)" : "url(#" + uid + "-reg)",
                stroke: hot ? "#e879f9" : "rgba(34,211,238,0.55)",
                strokeWidth: hot ? 2.4 : 1.4,
                vectorEffect: "non-scaling-stroke" as any,
                style: { transition: "fill 200ms ease-out, stroke 200ms ease-out" },
                onPointerEnter: () => setHover(r.id),
                onPointerLeave: () => setHover((h) => (h === r.id ? null : h)),
              };
              if (r.path) return <path key={r.id || i} d={r.path} {...common} />;
              if (r.bounds)
                return <rect key={r.id || i} x={r.bounds.x} y={r.bounds.y} width={Math.max(0, r.bounds.w)} height={Math.max(0, r.bounds.h)} {...common} />;
              return null;
            })}
          </g>

          {/* children overlay in map space */}
          <g transform={mapT + " scale(0.001)"}>
            <foreignObject x={0} y={0} width={1000} height={1000} style={{ overflow: "visible" }}>
              <div className="relative h-full w-full" style={{ pointerEvents: "auto" }}>
                {props.children}
              </div>
            </foreignObject>
          </g>

          {/* unscaled labels */}
          <g>
            {regions.map((r, i) => {
              if (!r.bounds || !r.label) return null;
              const p = toScreen(r.bounds.x + r.bounds.w / 2, r.bounds.y + r.bounds.h / 2);
              if (p.sx < -80 || p.sx > 1080 || p.sy < -40 || p.sy > 1040) return null;
              const hot = hover === r.id;
              return (
                <g key={"lb-" + (r.id || i)} transform={"translate(" + p.sx + "," + p.sy + ")"} style={{ transition: "opacity 200ms ease-out" }}>
                  <line x1={-14} y1={0} x2={-5} y2={0} stroke={hot ? "#e879f9" : "rgba(34,211,238,0.6)"} strokeWidth={1.4} />
                  <line x1={5} y1={0} x2={14} y2={0} stroke={hot ? "#e879f9" : "rgba(34,211,238,0.6)"} strokeWidth={1.4} />
                  <text
                    x={0}
                    y={-12}
                    textAnchor="middle"
                    fontFamily="ui-monospace, monospace"
                    fontSize={20}
                    fontWeight="700"
                    letterSpacing="3"
                    fill={hot ? "#f5d0fe" : "#a5f3fc"}
                    filter={hot ? "url(#" + uid + "-glow)" : undefined}
                  >
                    {String(r.label).toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>

          {regions.length === 0 ? (
            <text
              x={500}
              y={500}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize={26}
              letterSpacing="6"
              fill="rgba(115,115,115,0.9)"
            >
              NO DISTRICT DATA
            </text>
          ) : null}

          {/* reticle */}
          <g opacity="0.55">
            <line x1={500} y1={470} x2={500} y2={530} stroke="#22d3ee" strokeWidth="1" />
            <line x1={470} y1={500} x2={530} y2={500} stroke="#22d3ee" strokeWidth="1" />
            <circle cx={500} cy={500} r={16} fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 6" style={{ animation: uid + "-pulse 2.4s ease-in-out infinite" }} />
          </g>

          {/* corner brackets */}
          <g stroke="#facc15" strokeOpacity="0.5" strokeWidth="2" fill="none">
            <path d="M14 54 L14 14 L54 14" />
            <path d="M946 14 L986 14 L986 54" />
            <path d="M986 946 L986 986 L946 986" />
            <path d="M54 986 L14 986 L14 946" />
          </g>

          <rect x="0" y="0" width="1000" height="1000" fill={"url(#" + uid + "-vig)"} pointerEvents="none" />
          <g pointerEvents="none" style={{ animation: uid + "-sweep 5.5s linear infinite" }}>
            <rect x="0" y="0" width="1000" height="70" fill="#22d3ee" opacity="0.055" />
            <rect x="0" y="66" width="1000" height="2" fill="#67e8f9" opacity="0.28" />
          </g>
        </g>
      </svg>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)",
          mixBlendMode: "multiply",
        }}
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-cyan-400/20" />
    </div>
  );
}

export const MapCanvas_MIN = {"base":[10,8]};