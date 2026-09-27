type MapCanvasProps = {
  regions: { id: string; label: string; path?: string; bounds?: { x: number; y: number; w: number; h: number } }[];
  center: { x: number; y: number };
  zoom: number;
  onViewChange: (view: { center: { x: number; y: number }; zoom: number }) => void;
  children?: React.ReactNode;
};

export function MapCanvas(props: MapCanvasProps) {
  const { regions, center, zoom, onViewChange, children } = props;
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const floor = MapCanvas_MIN.base;

  const S = 1000;
  const z = Math.max(0.5, Math.min(8, zoom || 1));
  const half = (S * 0.5) / z;
  const cx = Math.max(0, Math.min(1, center ? center.x : 0.5));
  const cy = Math.max(0, Math.min(1, center ? center.y : 0.5));
  const vb = (cx * S - half) + " " + (cy * S - half) + " " + half * 2 + " " + half * 2;

  const hostRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: number; px: number; py: number; cx: number; cy: number } | null>(null);
  const pinch = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  const emit = (nx: number, ny: number, nz: number) => {
    onViewChange({ center: { x: clamp01(nx), y: clamp01(ny) }, zoom: Math.max(0.5, Math.min(8, nz)) });
  };

  const onDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current.size === 2) {
      const pts = Array.from(pinch.current.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStart.current = { dist: d || 1, zoom: z };
      drag.current = null;
    } else {
      drag.current = { id: e.pointerId, px: e.clientX, py: e.clientY, cx: cx, cy: cy };
    }
    setActive(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (pinch.current.has(e.pointerId)) pinch.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const host = hostRef.current;
    if (!host) return;
    const r = host.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    if (pinch.current.size >= 2 && pinchStart.current) {
      const pts = Array.from(pinch.current.values());
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      emit(cx, cy, pinchStart.current.zoom * (d / pinchStart.current.dist));
      return;
    }
    const d0 = drag.current;
    if (!d0 || d0.id !== e.pointerId) return;
    const span = Math.min(r.width, r.height);
    const dx = (e.clientX - d0.px) / span / z;
    const dy = (e.clientY - d0.py) / span / z;
    emit(d0.cx - dx, d0.cy - dy, z);
  };

  const onUp = (e: React.PointerEvent) => {
    pinch.current.delete(e.pointerId);
    if (pinch.current.size < 2) pinchStart.current = null;
    if (drag.current && drag.current.id === e.pointerId) drag.current = null;
    if (pinch.current.size === 0) setActive(false);
  };

  const onDouble = (e: React.MouseEvent) => {
    const host = hostRef.current;
    if (!host) return;
    const r = host.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const span = Math.min(r.width, r.height);
    const ux = (e.clientX - r.left - r.width / 2) / span / z;
    const uy = (e.clientY - r.top - r.height / 2) / span / z;
    const nz = z >= 6 ? 1 : z * 1.6;
    emit(cx + ux * (1 - z / nz), cy + uy * (1 - z / nz), nz);
  };

  const strokeW = 2.2 / z;
  const labelSize = 26 / z;

  const palette = ["#22d3ee", "#e879f9", "#fcd34d", "#34d399", "#fb7185"];

  return (
    <div
      ref={hostRef}
      className={"relative h-full w-full overflow-hidden touch-none select-none bg-black/60 ring-1 ring-cyan-400/10 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] " + (active ? "cursor-grabbing" : "cursor-grab")}
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onDoubleClick={onDouble}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox={vb} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={uid + "-grid"} width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M50 0 L0 0 0 50" fill="none" stroke="rgba(34,211,238,0.14)" strokeWidth={0.9 / z} />
          </pattern>
          <pattern id={uid + "-grid2"} width="250" height="250" patternUnits="userSpaceOnUse">
            <path d="M250 0 L0 0 0 250" fill="none" stroke="rgba(34,211,238,0.28)" strokeWidth={1.4 / z} />
          </pattern>
          <radialGradient id={uid + "-vig"} cx="50%" cy="50%" r="72%">
            <stop offset="55%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.85" />
          </radialGradient>
          <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={5 / z} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={uid + "-sweep"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        <rect x={-S} y={-S} width={S * 3} height={S * 3} fill="#05070a" />
        <rect x={-S} y={-S} width={S * 3} height={S * 3} fill={"url(#" + uid + "-grid)"} />
        <rect x={-S} y={-S} width={S * 3} height={S * 3} fill={"url(#" + uid + "-grid2)"} />

        {regions.map((r, i) => {
          const col = palette[i % palette.length];
          const isHot = hover === r.id;
          const common = {
            fill: col,
            fillOpacity: isHot ? 0.28 : 0.13,
            stroke: col,
            strokeWidth: isHot ? strokeW * 1.8 : strokeW,
            strokeLinejoin: "round" as const,
            onPointerEnter: () => setHover(r.id),
            onPointerLeave: () => setHover((h) => (h === r.id ? null : h)),
            style: { transition: "fill-opacity 200ms ease-out, stroke-width 200ms ease-out" },
            filter: isHot ? "url(#" + uid + "-glow)" : undefined,
          };
          if (r.path) {
            return (
              <g key={r.id}>
                <path d={r.path} transform={"scale(" + S + ")"} vectorEffect="non-scaling-stroke" {...common} />
              </g>
            );
          }
          const b = r.bounds;
          if (!b) return null;
          return (
            <g key={r.id}>
              <rect x={b.x * S} y={b.y * S} width={b.w * S} height={b.h * S} {...common} />
              <path
                d={
                  "M" + (b.x * S + 6 / z) + "," + (b.y * S + 22 / z) +
                  " L" + (b.x * S + 6 / z) + "," + (b.y * S + 6 / z) +
                  " L" + (b.x * S + 22 / z) + "," + (b.y * S + 6 / z)
                }
                fill="none"
                stroke={col}
                strokeOpacity="0.9"
                strokeWidth={strokeW}
              />
            </g>
          );
        })}

        {regions.map((r, i) => {
          const col = palette[i % palette.length];
          let lx = 0.5;
          let ly = 0.5;
          if (r.bounds) {
            lx = r.bounds.x + r.bounds.w / 2;
            ly = r.bounds.y + r.bounds.h / 2;
          } else if (r.path) {
            const nums = r.path.match(/-?\d*\.?\d+/g);
            if (nums && nums.length >= 2) {
              const xs: number[] = [];
              const ys: number[] = [];
              for (let k = 0; k + 1 < nums.length; k += 2) {
                xs.push(parseFloat(nums[k]));
                ys.push(parseFloat(nums[k + 1]));
              }
              lx = (Math.min(...xs) + Math.max(...xs)) / 2;
              ly = (Math.min(...ys) + Math.max(...ys)) / 2;
            }
          }
          return (
            <text
              key={"lbl-" + r.id}
              x={lx * S}
              y={ly * S}
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="ui-monospace, monospace"
              fontWeight="700"
              fontSize={labelSize}
              letterSpacing={labelSize * 0.16}
              fill={hover === r.id ? "#ffffff" : col}
              opacity={hover === r.id ? 1 : 0.85}
              style={{ pointerEvents: "none", transition: "opacity 200ms ease-out" }}
            >
              {(r.label || "").toUpperCase()}
            </text>
          );
        })}

        <g opacity="0.55" style={{ pointerEvents: "none" }}>
          <line x1={cx * S - half} y1={cy * S} x2={cx * S + half} y2={cy * S} stroke="rgba(34,211,238,0.25)" strokeWidth={0.8 / z} strokeDasharray={6 / z + " " + 10 / z} />
          <line x1={cx * S} y1={cy * S - half} x2={cx * S} y2={cy * S + half} stroke="rgba(34,211,238,0.25)" strokeWidth={0.8 / z} strokeDasharray={6 / z + " " + 10 / z} />
          <circle cx={cx * S} cy={cy * S} r={9 / z} fill="none" stroke="#22d3ee" strokeWidth={1.4 / z} />
          <circle cx={cx * S} cy={cy * S} r={2.5 / z} fill="#22d3ee" />
        </g>

        <rect x={cx * S - half} y={cy * S - half} width={half * 2} height={half * 2} fill={"url(#" + uid + "-vig)"} style={{ pointerEvents: "none" }} />
      </svg>

      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-screen"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.35) 0px, rgba(34,211,238,0.35) 1px, transparent 1px, transparent 3px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute inset-y-0 w-1/3 animate-pulse"
        style={{
          left: "0%",
          background: "linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.07) 70%, rgba(34,211,238,0) 100%)",
          pointerEvents: "none",
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-5 w-5 border-l border-t border-cyan-300/60" />
        <div className="absolute right-0 top-0 h-5 w-5 border-r border-t border-cyan-300/60" />
        <div className="absolute left-0 bottom-0 h-5 w-5 border-l border-b border-cyan-300/60" />
        <div className="absolute right-0 bottom-0 h-5 w-5 border-r border-b border-cyan-300/60" />
      </div>

      <div
        className={"absolute inset-0 transition-all duration-200 ease-out " + (active ? "ring-1 ring-cyan-300/40 shadow-[inset_0_0_26px_rgba(34,211,238,0.18)]" : "")}
        style={{ pointerEvents: "none" }}
      >
        {children}
      </div>
    </div>
  );
}

export const MapCanvas_MIN = {"base":[12,9]};