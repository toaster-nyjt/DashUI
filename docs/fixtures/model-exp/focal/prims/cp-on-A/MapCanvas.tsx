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
  const minZ = props.minZoom ?? 1;
  const maxZ = props.maxZoom ?? 6;
  const z = Math.min(maxZ, Math.max(minZ, props.zoom));
  const cx = props.center.x;
  const cy = props.center.y;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);
  const [panning, setPanning] = useState(false);
  const [pulse, setPulse] = useState(0);

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  const emit = (nz: number, nx: number, ny: number) => {
    props.onViewportChange({ zoom: nz, center: { x: clamp01(nx), y: clamp01(ny) } });
  };

  const onDown = (e: any) => {
    if (e.button !== undefined && e.button !== 0) return;
    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx, cy, moved: false };
    setPanning(true);
  };
  const onMove = (e: any) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const r = hostRef.current?.getBoundingClientRect();
    if (!r || r.width === 0 || r.height === 0) return;
    const dx = (e.clientX - d.x) / r.width / z;
    const dy = (e.clientY - d.y) / r.height / z;
    if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3) d.moved = true;
    emit(z, d.cx - dx, d.cy - dy);
  };
  const onUp = (e: any) => {
    const d = drag.current;
    drag.current = null;
    setPanning(false);
    if (d && !d.moved) {
      const r = hostRef.current?.getBoundingClientRect();
      if (!r) return;
      const ratioX = (e.clientX - r.left) / r.width - 0.5;
      const ratioY = (e.clientY - r.top) / r.height - 0.5;
      const nz = Math.min(maxZ, z * 1.6);
      if (nz !== z) {
        emit(nz, cx + ratioX / z, cy + ratioY / z);
        setPulse((p) => p + 1);
      }
    }
  };

  const layerTransform =
    "translate(50%,50%) scale(" + z + ") translate(" + (-cx * 100) + "%," + (-cy * 100) + "%)";

  const MapCanvasBlocks: { x: number; y: number; w: number; h: number; t: number }[] = [];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 46; i++) {
    const w = 4 + rnd() * 13;
    const h = 4 + rnd() * 13;
    MapCanvasBlocks.push({ x: rnd() * (100 - w), y: rnd() * (100 - h), w, h, t: rnd() });
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ minWidth: MapCanvas_MIN.base[0] + "rem", minHeight: MapCanvas_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-md bg-black/60 border border-cyan-400/15 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        <div
          ref={hostRef}
          className={"absolute inset-0 touch-none " + (panning ? "cursor-grabbing" : "cursor-grab")}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => { drag.current = null; setPanning(false); }}
        >
          <div
            className="absolute inset-0 origin-top-left will-change-transform"
            style={{
              transform: layerTransform,
              transition: panning ? "none" : "transform 420ms cubic-bezier(0.22,0.9,0.28,1)",
            }}
          >
            {/* base terrain */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={uid + "-bg"} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#09090b" />
                  <stop offset="50%" stopColor="#000000" />
                  <stop offset="100%" stopColor="#0b1116" />
                </linearGradient>
                <linearGradient id={uid + "-blk"} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.16)" />
                  <stop offset="100%" stopColor="rgba(34,211,238,0.04)" />
                </linearGradient>
                <linearGradient id={uid + "-blk2"} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(217,70,239,0.16)" />
                  <stop offset="100%" stopColor="rgba(217,70,239,0.03)" />
                </linearGradient>
                <radialGradient id={uid + "-vig"} cx="0.5" cy="0.5" r="0.72">
                  <stop offset="55%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-bg)"} />
              {/* fine grid */}
              <g stroke="rgba(34,211,238,0.10)" strokeWidth="0.12">
                {Array.from({ length: 39 }).map((_, i) => (
                  <line key={"v" + i} x1={(i + 1) * 2.5} y1="0" x2={(i + 1) * 2.5} y2="100" />
                ))}
                {Array.from({ length: 39 }).map((_, i) => (
                  <line key={"h" + i} x1="0" y1={(i + 1) * 2.5} x2="100" y2={(i + 1) * 2.5} />
                ))}
              </g>
              {/* major grid */}
              <g stroke="rgba(34,211,238,0.26)" strokeWidth="0.22">
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={"V" + i} x1={(i + 1) * 10} y1="0" x2={(i + 1) * 10} y2="100" />
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={"H" + i} x1="0" y1={(i + 1) * 10} x2="100" y2={(i + 1) * 10} />
                ))}
              </g>
              {/* city blocks */}
              <g>
                {MapCanvasBlocks.map((b, i) => (
                  <rect
                    key={"b" + i}
                    x={b.x}
                    y={b.y}
                    width={b.w}
                    height={b.h}
                    rx="0.6"
                    fill={b.t > 0.82 ? "url(#" + uid + "-blk2)" : "url(#" + uid + "-blk)"}
                    stroke={b.t > 0.82 ? "rgba(217,70,239,0.45)" : "rgba(34,211,238,0.3)"}
                    strokeWidth="0.15"
                  />
                ))}
              </g>
              {/* arterial roads */}
              <g stroke="rgba(253,224,71,0.35)" strokeWidth="0.5" fill="none" strokeLinecap="round">
                <path d="M -2 32 L 40 32 L 58 50 L 102 50" />
                <path d="M 24 -2 L 24 44 L 46 66 L 46 102" />
                <path d="M 102 18 L 70 18 L 54 34 L 54 102" />
                <path d="M -2 78 L 34 78 L 52 88 L 102 88" />
              </g>
              <g stroke="rgba(253,224,71,0.9)" strokeWidth="0.14" fill="none" strokeDasharray="1.6 2.4">
                <path d="M -2 32 L 40 32 L 58 50 L 102 50">
                  <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="4s" repeatCount="indefinite" />
                </path>
                <path d="M 24 -2 L 24 44 L 46 66 L 46 102">
                  <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="5.5s" repeatCount="indefinite" />
                </path>
              </g>
              {/* water */}
              <path
                d="M 0 96 L 18 92 L 40 97 L 66 91 L 100 95 L 100 100 L 0 100 Z"
                fill="rgba(34,211,238,0.07)"
                stroke="rgba(34,211,238,0.35)"
                strokeWidth="0.2"
              />
            </svg>

            {/* region labels */}
            {(props.regions ?? []).map((r) => (
              <div
                key={r.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: r.x * 100 + "%", top: r.y * 100 + "%" }}
              >
                <div className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.7)]" />
                  <span className="min-w-0 truncate text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-cyan-300/80 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
                    {r.label}
                  </span>
                </div>
              </div>
            ))}

            {/* children: markers + routes, same coordinate space */}
            <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
              {props.children}
            </div>
          </div>

          {/* static overlay chrome */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.25]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, rgba(34,211,238,0.14) 0px, rgba(34,211,238,0.14) 1px, transparent 1px, transparent 4px)",
              }}
            />
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-vig)"} />
            </svg>
            {/* sweep */}
            <div
              key={"sweep"}
              className="absolute -inset-y-1 w-[22%] opacity-40"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(34,211,238,0.28), transparent)",
                animation: "mapcanvas-sweep 6s linear infinite",
              }}
            />
            {/* zoom pulse ring */}
            <div
              key={"pulse-" + pulse}
              className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-300/70"
              style={{ animation: "mapcanvas-pulse 700ms ease-out forwards" }}
            />
            {/* crosshair */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative h-8 w-8">
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-yellow-300/40" />
                <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-yellow-300/40" />
                <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
              </div>
            </div>
            {/* corner brackets */}
            <div className="absolute inset-1">
              <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-cyan-400/50" />
              <div className="absolute right-0 top-0 h-3 w-3 border-r border-t border-cyan-400/50" />
              <div className="absolute left-0 bottom-0 h-3 w-3 border-l border-b border-cyan-400/50" />
              <div className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-cyan-400/50" />
            </div>
            {/* zoom scale bar */}
            <div className="absolute left-2 bottom-2 flex items-end gap-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const frac = i / 6;
                const active = frac <= (z - minZ) / Math.max(0.0001, maxZ - minZ);
                return (
                  <span
                    key={"z" + i}
                    className={
                      "w-1 rounded-sm transition-all duration-200 ease-out " +
                      (active
                        ? "bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.7)]"
                        : "bg-cyan-400/20")
                    }
                    style={{ height: 3 + i * 2 + "px" }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <style>{
        "@keyframes mapcanvas-sweep{0%{transform:translateX(-30%)}100%{transform:translateX(480%)}}" +
        "@keyframes mapcanvas-pulse{0%{opacity:0.9;transform:translate(-50%,-50%) scale(0.3)}100%{opacity:0;transform:translate(-50%,-50%) scale(3.2)}}"
      }</style>
    </div>
  );
}