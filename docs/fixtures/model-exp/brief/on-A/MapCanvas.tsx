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
  const hostRef = useRef<HTMLDivElement | null>(null);
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map()).current;
  const gesture = useRef<any>(null);
  const [drag, setDrag] = useState(false);

  const minZ = props.minZoom != null ? props.minZoom : 1;
  const maxZ = props.maxZoom != null ? props.maxZoom : 4;
  const zoom = Math.min(maxZ, Math.max(minZ, props.zoom));
  const cx = props.center ? props.center.x : 0.5;
  const cy = props.center ? props.center.y : 0.5;

  const clampCenter = (x: number, y: number, z: number) => {
    const h = 0.5 / Math.max(z, 0.0001);
    const cl = (v: number) => (h >= 0.5 ? 0.5 : Math.min(1 - h, Math.max(h, v)));
    return { x: cl(x), y: cl(y) };
  };

  const emit = (z: number, x: number, y: number) => {
    const c = clampCenter(x, y, z);
    props.onViewportChange({ zoom: z, center: c });
  };

  const down = (e: any) => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    if (ptrs.size === 1) {
      gesture.current = { mode: "pan", sx: e.clientX, sy: e.clientY, cx: cx, cy: cy };
      setDrag(true);
    } else if (ptrs.size === 2) {
      const arr = Array.from(ptrs.values());
      const d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
      gesture.current = { mode: "pinch", d: d || 1, z: zoom };
    }
  };

  const move = (e: any) => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    if (g.mode === "pan" && ptrs.size === 1) {
      const dx = (e.clientX - g.sx) / r.width / zoom;
      const dy = (e.clientY - g.sy) / r.height / zoom;
      emit(zoom, g.cx - dx, g.cy - dy);
    } else if (g.mode === "pinch" && ptrs.size >= 2) {
      const arr = Array.from(ptrs.values());
      const d = Math.hypot(arr[0].x - arr[1].x, arr[0].y - arr[1].y);
      const nz = Math.min(maxZ, Math.max(minZ, g.z * (d / g.d)));
      emit(nz, cx, cy);
    }
  };

  const up = (e: any) => {
    ptrs.delete(e.pointerId);
    if (ptrs.size === 0) { gesture.current = null; setDrag(false); }
    else if (ptrs.size === 1) {
      const only = Array.from(ptrs.entries())[0];
      gesture.current = { mode: "pan", sx: only[1].x, sy: only[1].y, cx: cx, cy: cy };
    }
  };

  const grid = [];
  for (let i = 1; i < 12; i++) grid.push(i);

  const inv = 1 / Math.max(zoom, 0.0001);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] touch-none select-none"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem", cursor: drag ? "grabbing" : "grab" }}
      ref={hostRef}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: "scale(" + zoom + ") translate(" + ((0.5 - cx) * 100) + "%," + ((0.5 - cy) * 100) + "%)",
          transformOrigin: "center center",
          transition: drag ? "none" : "transform 300ms ease-out",
          willChange: "transform"
        }}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#09090b" />
              <stop offset="50%" stopColor="#000000" />
              <stop offset="100%" stopColor="#0b1418" />
            </linearGradient>
            <radialGradient id={uid + "-glow"} cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
              <stop offset="100%" stopColor="rgba(34,211,238,0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-bg)"} />
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-glow)"} />
          {grid.map((i) => (
            <g key={"g" + i}>
              <line x1={(i * 100) / 12} y1="0" x2={(i * 100) / 12} y2="100" stroke="rgba(34,211,238,0.10)" strokeWidth="0.15" />
              <line x1="0" y1={(i * 100) / 12} x2="100" y2={(i * 100) / 12} stroke="rgba(34,211,238,0.10)" strokeWidth="0.15" />
            </g>
          ))}
          <g stroke="rgba(34,211,238,0.22)" strokeWidth="0.5" fill="none">
            <path d="M0 62 L26 58 L44 70 L72 66 L100 74" />
            <path d="M18 0 L22 30 L38 46 L34 78 L44 100" />
            <path d="M100 22 L74 28 L58 44 L38 46" />
            <path d="M6 88 L40 82 L62 92 L88 86" />
          </g>
          <g fill="rgba(236,72,153,0.10)" stroke="rgba(236,72,153,0.28)" strokeWidth="0.25">
            <rect x="46" y="30" width="20" height="18" />
            <rect x="12" y="18" width="14" height="12" />
            <rect x="70" y="62" width="18" height="16" />
          </g>
        </svg>

        {(props.regions || []).map((r) => (
          <div
            key={r.id}
            className="pointer-events-none absolute"
            style={{ left: r.x * 100 + "%", top: r.y * 100 + "%", transform: "translate(-50%,-50%) scale(" + inv + ")" }}
          >
            <span className="whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.2em] leading-none text-cyan-300/70 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
              {r.label}
            </span>
          </div>
        ))}

        <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
          {props.children}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, transparent 1px, transparent 4px)" }} />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.9), inset 0 0 22px rgba(34,211,238,0.12)" }} />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g stroke="rgba(253,224,71,0.55)" strokeWidth="0.4" fill="none">
          <path d="M1 8 L1 1 L9 1" />
          <path d="M91 1 L99 1 L99 8" />
          <path d="M99 92 L99 99 L91 99" />
          <path d="M9 99 L1 99 L1 92" />
        </g>
        <g stroke="rgba(34,211,238,0.35)" strokeWidth="0.25">
          <line x1="50" y1="46" x2="50" y2="54" />
          <line x1="46" y1="50" x2="54" y2="50" />
        </g>
      </svg>
    </div>
  );
}