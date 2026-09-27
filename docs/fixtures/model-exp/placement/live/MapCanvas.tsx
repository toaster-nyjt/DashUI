type MapCanvasProps = {
  imageUrl?: string;
  zoom: number;
  center: { x: number; y: number };
  onViewChange: (view: { zoom: number; center: { x: number; y: number } }) => void;
  children?: any;
};

export const MapCanvas_MIN = {"base":[8,6]};

export function MapCanvas(props: MapCanvasProps) {
  const uid = useRef("mapcanvas-" + Math.random().toString(36).slice(2)).current;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: number; x: number; y: number; cx: number; cy: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState(false);
  const [pulse, setPulse] = useState(0);

  const z = Math.max(0.2, props.zoom || 1);
  const cx = Math.min(1, Math.max(0, props.center ? props.center.x : 0.5));
  const cy = Math.min(1, Math.max(0, props.center ? props.center.y : 0.5));

  useEffect(() => {
    setPulse((p) => p + 1);
  }, [z]);

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

  const onDown = (e: any) => {
    if (e.button !== undefined && e.button !== 0) return;
    const el = hostRef.current;
    if (!el) return;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: cx, cy: cy };
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
    props.onViewChange({ zoom: z, center: { x: clamp01(d.cx - dx), y: clamp01(d.cy - dy) } });
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
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const tx = clamp01(cx + px / z);
    const ty = clamp01(cy + py / z);
    const nz = Math.min(8, z * 1.6);
    props.onViewChange({ zoom: nz, center: { x: tx, y: ty } });
  };

  const gridStep = 10;
  const lines = [];
  for (let i = 0; i <= gridStep; i++) lines.push(i);

  const contentStyle: any = {
    transform: "translate(" + ((0.5 - cx * z) * 100) + "%, " + ((0.5 - cy * z) * 100) + "%) scale(" + z + ")",
    transformOrigin: "0 0",
    transition: dragging ? "none" : "transform 420ms cubic-bezier(0.22,1,0.36,1)",
  };

  return (
    <div
      className="h-full w-full relative overflow-hidden rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
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
        className={"absolute inset-0 touch-none overflow-hidden " + (dragging ? "cursor-grabbing" : "cursor-grab")}
      >
        {/* moving world */}
        <div className="absolute inset-0" style={contentStyle}>
          {/* base plate */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,15,40,0.95)_0%,rgba(6,10,20,0.98)_100%)]" />
          {props.imageUrl ? (
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage: "url(" + props.imageUrl + ")",
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                filter: "saturate(0.5) contrast(1.15) brightness(0.8)",
              }}
            />
          ) : null}

          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={uid + "-glow"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
                <stop offset="100%" stopColor="rgba(217,70,239,0.12)" />
              </linearGradient>
              <radialGradient id={uid + "-hot"} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(253,224,71,0.18)" />
                <stop offset="100%" stopColor="rgba(253,224,71,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-glow)"} />
            <rect x="18" y="22" width="30" height="26" fill="rgba(34,211,238,0.05)" stroke="rgba(34,211,238,0.22)" strokeWidth="0.25" />
            <rect x="55" y="12" width="22" height="34" fill="rgba(217,70,239,0.05)" stroke="rgba(217,70,239,0.22)" strokeWidth="0.25" />
            <rect x="30" y="58" width="42" height="30" fill="rgba(34,211,238,0.04)" stroke="rgba(34,211,238,0.18)" strokeWidth="0.25" />
            <circle cx="50" cy="50" r="26" fill={"url(#" + uid + "-hot)"} />
            <path d="M0 40 L100 34" stroke="rgba(253,224,71,0.25)" strokeWidth="0.35" fill="none" />
            <path d="M44 0 L48 100" stroke="rgba(253,224,71,0.18)" strokeWidth="0.3" fill="none" />
            <path d="M0 74 L100 80" stroke="rgba(34,211,238,0.2)" strokeWidth="0.3" fill="none" />
            {lines.map((i) => (
              <line key={"gv-" + i} x1={i * (100 / gridStep)} y1="0" x2={i * (100 / gridStep)} y2="100" stroke="rgba(34,211,238,0.10)" strokeWidth="0.15" />
            ))}
            {lines.map((i) => (
              <line key={"gh-" + i} x1="0" y1={i * (100 / gridStep)} x2="100" y2={i * (100 / gridStep)} stroke="rgba(34,211,238,0.10)" strokeWidth="0.15" />
            ))}
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="0.4" />
          </svg>

          {/* children layer shares map coordinate space */}
          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
            {props.children}
          </div>
        </div>

        {/* static HUD overlays */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,rgba(34,211,238,0.5)_0px,rgba(34,211,238,0.5)_1px,transparent_1px,transparent_3px)" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.75)_100%)]" />
        <div
          key={"pulse-" + pulse}
          className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-fuchsia-400/30 animate-[ping_0.7s_ease-out_1] opacity-0"
        />
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M1 8 L1 1 L10 1" fill="none" stroke="rgba(253,224,71,0.7)" strokeWidth="0.6" />
          <path d="M99 8 L99 1 L90 1" fill="none" stroke="rgba(253,224,71,0.7)" strokeWidth="0.6" />
          <path d="M1 92 L1 99 L10 99" fill="none" stroke="rgba(253,224,71,0.7)" strokeWidth="0.6" />
          <path d="M99 92 L99 99 L90 99" fill="none" stroke="rgba(253,224,71,0.7)" strokeWidth="0.6" />
          <g opacity={dragging ? 0.85 : hover ? 0.45 : 0.22} style={{ transition: "opacity 200ms ease-out" }}>
            <line x1="50" y1="42" x2="50" y2="47" stroke="rgba(34,211,238,0.9)" strokeWidth="0.4" />
            <line x1="50" y1="53" x2="50" y2="58" stroke="rgba(34,211,238,0.9)" strokeWidth="0.4" />
            <line x1="42" y1="50" x2="47" y2="50" stroke="rgba(34,211,238,0.9)" strokeWidth="0.4" />
            <line x1="53" y1="50" x2="58" y2="50" stroke="rgba(34,211,238,0.9)" strokeWidth="0.4" />
          </g>
        </svg>
        <div
          className="pointer-events-none absolute inset-0 rounded-md transition-all duration-200 ease-out"
          style={{ boxShadow: dragging ? "inset 0 0 26px rgba(253,224,71,0.18)" : hover ? "inset 0 0 22px rgba(34,211,238,0.14)" : "none" }}
        />
      </div>
    </div>
  );
}