type MapCanvasProps = {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  center: { x: number; y: number };
  onViewportChange: (v: { zoom: number; center: { x: number; y: number } }) => void;
  regions?: { id: string; label: string; x: number; y: number }[];
  children?: any;
};

export const MapCanvas_MIN = {"base":[12,10]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const minZ = props.minZoom ?? 1;
  const maxZ = props.maxZoom ?? 4;
  const z = Math.min(maxZ, Math.max(minZ, props.zoom));
  const cx = props.center.x;
  const cy = props.center.y;

  const surfRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ px: number; py: number; cx: number; cy: number; moved: boolean } | null>(null);
  const [panning, setPanning] = useState(false);
  const [railing, setRailing] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => { setPulse(p => p + 1); }, [z]);

  const clamp01 = (v: number, zz: number) => {
    const half = 0.5 / zz;
    const lo = Math.min(half, 0.5);
    const hi = Math.max(1 - half, 0.5);
    return Math.min(hi, Math.max(lo, v));
  };

  const emit = (nz: number, ncx: number, ncy: number) => {
    const cz = Math.min(maxZ, Math.max(minZ, nz));
    props.onViewportChange({ zoom: cz, center: { x: clamp01(ncx, cz), y: clamp01(ncy, cz) } });
  };

  const onDown = (e: any) => {
    if (e.button !== undefined && e.button !== 0) return;
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, cx, cy, moved: false };
    setPanning(true);
  };
  const onMove = (e: any) => {
    const d = drag.current;
    if (!d) return;
    const el = surfRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const dx = (e.clientX - d.px) / r.width / z;
    const dy = (e.clientY - d.py) / r.height / z;
    if (Math.abs(e.clientX - d.px) + Math.abs(e.clientY - d.py) > 3) d.moved = true;
    emit(z, d.cx - dx, d.cy - dy);
  };
  const onUp = (e: any) => {
    (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
    drag.current = null;
    setPanning(false);
  };
  const onDouble = () => {
    const next = z >= maxZ - 0.001 ? minZ : Math.min(maxZ, z * 1.6);
    emit(next, cx, cy);
  };

  const railFromEvent = (e: any) => {
    const el = railRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.height <= 0) return;
    const t = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    emit(minZ + t * (maxZ - minZ), cx, cy);
  };
  const railDown = (e: any) => {
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    setRailing(true);
    railFromEvent(e);
  };
  const railMove = (e: any) => { if (railing) railFromEvent(e); };
  const railUp = (e: any) => {
    (e.currentTarget as any).releasePointerCapture?.(e.pointerId);
    setRailing(false);
  };

  const tx = 50 - cx * 100 * z;
  const ty = 50 - cy * 100 * z;
  const regions = props.regions ?? [];
  const zt = (z - minZ) / Math.max(0.0001, maxZ - minZ);

  const minorLines = [];
  for (let i = 1; i < 40; i++) {
    const p = i * 25;
    const major = i % 4 === 0;
    minorLines.push(
      <line key={"vx" + i} x1={p} y1={0} x2={p} y2={1000}
        stroke={major ? "rgba(34,211,238,0.22)" : "rgba(34,211,238,0.07)"} strokeWidth={major ? 1.2 : 0.6} />
    );
    minorLines.push(
      <line key={"hz" + i} x1={0} y1={p} x2={1000} y2={p}
        stroke={major ? "rgba(34,211,238,0.22)" : "rgba(34,211,238,0.07)"} strokeWidth={major ? 1.2 : 0.6} />
    );
  }
  const blocks = [];
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const h = (r * 7 + c * 13) % 11;
      if (h < 4) continue;
      const w = 28 + (h % 4) * 9;
      const hh = 24 + ((h * 3) % 5) * 9;
      blocks.push(
        <rect key={"b" + r + "-" + c}
          x={20 + c * 80 + (h % 3) * 4} y={20 + r * 80 + (h % 5) * 3}
          width={w} height={hh} rx={2}
          fill={h > 8 ? "rgba(217,70,239,0.10)" : "rgba(34,211,238,0.07)"}
          stroke={h > 8 ? "rgba(217,70,239,0.28)" : "rgba(34,211,238,0.16)"} strokeWidth={0.7} />
      );
    }
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md touch-none select-none"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-md bg-black/60 border border-cyan-400/15 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        <div
          ref={surfRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onDoubleClick={onDouble}
          className={"absolute inset-0 touch-none " + (panning ? "cursor-grabbing" : "cursor-grab")}
        >
          <div
            className={"absolute inset-0 " + (panning ? "" : "transition-transform duration-500 ease-out")}
            style={{ transformOrigin: "0 0", transform: "translate(" + tx + "%, " + ty + "%) scale(" + z + ")" }}
          >
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <defs>
                <radialGradient id={uid + "-haze"} cx="50%" cy="45%" r="70%">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.10)" />
                  <stop offset="65%" stopColor="rgba(217,70,239,0.05)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </radialGradient>
                <linearGradient id={uid + "-road"} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(253,224,71,0.35)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0.30)" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="1000" height="1000" fill="#05070a" />
              <rect x="0" y="0" width="1000" height="1000" fill={"url(#" + uid + "-haze)"} />
              <g>{blocks}</g>
              <g>{minorLines}</g>
              <g stroke={"url(#" + uid + "-road)"} fill="none" strokeLinecap="round">
                <path d="M -20 300 L 340 300 L 520 470 L 1020 470" strokeWidth={5} opacity={0.75} />
                <path d="M 200 -20 L 200 420 L 420 640 L 420 1020" strokeWidth={4} opacity={0.6} />
                <path d="M 1020 140 L 700 140 L 560 280 L 560 1020" strokeWidth={4} opacity={0.55} />
                <path d="M -20 780 L 380 780 L 620 700 L 1020 700" strokeWidth={3.5} opacity={0.5} />
              </g>
              <g stroke="rgba(34,211,238,0.35)" strokeWidth={0.8} fill="none" opacity={0.5}>
                <path d="M 0 0 L 1000 1000" strokeDasharray="6 14" />
                <path d="M 1000 0 L 0 1000" strokeDasharray="6 14" />
              </g>
            </svg>

            {regions.map((rg) => (
              <div
                key={rg.id}
                className="absolute"
                style={{ left: rg.x * 100 + "%", top: rg.y * 100 + "%" }}
              >
                <div
                  className="flex items-center gap-2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{ transform: "translate(-50%,-50%) scale(" + (1 / z) + ")" }}
                >
                  <span className="block h-1.5 w-1.5 rotate-45 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)]" />
                  <span className="min-w-0 truncate text-[0.6rem] font-medium uppercase tracking-[0.2em] leading-none text-cyan-300/70">
                    {rg.label}
                  </span>
                </div>
              </div>
            ))}

            <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
              {props.children}
            </div>
          </div>
        </div>

        {/* sweep */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.16]">
          <div
            className="absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 animate-[spin_14s_linear_infinite]"
            style={{ background: "conic-gradient(from 0deg, rgba(34,211,238,0) 0deg, rgba(34,211,238,0) 300deg, rgba(34,211,238,0.55) 355deg, rgba(34,211,238,0) 360deg)" }}
          />
        </div>

        {/* scanlines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(34,211,238,0.10) 0px, rgba(34,211,238,0.10) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)" }}
        />
        {/* vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)" }}
        />

        {/* reticle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            key={"ret" + pulse}
            className={"relative h-10 w-10 transition-opacity duration-300 " + (panning ? "opacity-90" : "opacity-40")}
          >
            <div className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-yellow-300/70" />
            <div className="absolute left-1/2 bottom-0 h-3 w-px -translate-x-1/2 bg-yellow-300/70" />
            <div className="absolute top-1/2 left-0 w-3 h-px -translate-y-1/2 bg-yellow-300/70" />
            <div className="absolute top-1/2 right-0 w-3 h-px -translate-y-1/2 bg-yellow-300/70" />
            <div className="absolute inset-[38%] rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)] animate-pulse" />
          </div>
        </div>

        {/* corner brackets */}
        <div className="pointer-events-none absolute inset-1">
          <div className="absolute left-0 top-0 h-4 w-4 border-l border-t border-cyan-400/40" />
          <div className="absolute right-0 top-0 h-4 w-4 border-r border-t border-cyan-400/40" />
          <div className="absolute left-0 bottom-0 h-4 w-4 border-l border-b border-cyan-400/40" />
          <div className="absolute right-0 bottom-0 h-4 w-4 border-r border-b border-cyan-400/40" />
        </div>

        {/* zoom rail */}
        <div className="absolute right-1.5 top-3 bottom-3 flex w-4 flex-col items-center justify-center">
          <div
            ref={railRef}
            onPointerDown={railDown}
            onPointerMove={railMove}
            onPointerUp={railUp}
            onPointerCancel={railUp}
            className={"relative h-full w-2 touch-none cursor-pointer rounded-full bg-black/70 border border-cyan-400/20 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] transition-all duration-200 " + (railing ? "shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)] border-yellow-300/50" : "")}
          >
            <div
              className="absolute inset-x-0 bottom-0 rounded-full bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-300 ease-out"
              style={{ height: (zt * 100) + "%" }}
            />
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
              <div key={"t" + t} className="absolute left-1/2 h-px w-3 -translate-x-1/2 bg-cyan-400/30"
                style={{ bottom: (t * 100) + "%" }} />
            ))}
            <div
              className="absolute left-1/2 h-2 w-4 -translate-x-1/2 translate-y-1/2 rounded-sm border border-yellow-300/60 bg-yellow-300 shadow-[0_0_12px_rgba(253,224,71,0.7)] transition-all duration-300 ease-out"
              style={{ bottom: (zt * 100) + "%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}