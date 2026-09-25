type JogWheelProps = { value?: number; onScrub: (delta: number) => void };

export function JogWheel(props: JogWheelProps) {
  const uid = useRef("jogwheel-" + Math.random().toString(36).slice(2)).current;
  const angle = props.value ?? 0;
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);
  const last = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const floor = (JogWheel_MIN as any).base;

  const angleAt = (e: any) => {
    const el = svgRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.hypot(dx / (r.width / 2), dy / (r.height / 2)) < 0.12) return null;
    return Math.atan2(dy, dx);
  };

  const down = (e: any) => {
    const a = angleAt(e);
    if (a === null) return;
    last.current = a;
    setDrag(true);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
  };
  const move = (e: any) => {
    if (!drag || last.current === null) return;
    const a = angleAt(e);
    if (a === null) return;
    let d = a - last.current;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    last.current = a;
    if (d !== 0) props.onScrub(d);
  };
  const up = (e: any) => {
    if (!drag) return;
    setDrag(false);
    last.current = null;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
  };

  const deg = (angle * 180) / Math.PI;
  const spokes = [];
  for (let i = 0; i < 36; i++) {
    const maj = i % 3 === 0;
    spokes.push(
      <line
        key={"sp-" + i}
        x1="0" y1={maj ? -40 : -40} x2="0" y2={maj ? -34 : -37}
        stroke={maj ? "rgb(251 191 36)" : "rgb(120 113 108)"}
        strokeOpacity={maj ? 0.75 : 0.5}
        strokeWidth={maj ? 1.6 : 1}
        strokeLinecap="round"
        transform={"rotate(" + i * 10 + ")"}
      />
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <svg
        ref={svgRef}
        viewBox="-50 -50 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full touch-none cursor-grab active:cursor-grabbing select-none"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <defs>
          <radialGradient id={uid + "-plat"} cx="38%" cy="30%" r="80%">
            <stop offset="0%" stopColor="rgb(68 64 60)" />
            <stop offset="55%" stopColor="rgb(41 37 36)" />
            <stop offset="100%" stopColor="rgb(12 10 9)" />
          </radialGradient>
          <radialGradient id={uid + "-well"} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgb(28 25 23)" />
            <stop offset="100%" stopColor="rgb(0 0 0)" />
          </radialGradient>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0.2" y2="1">
            <stop offset="0%" stopColor="rgb(251 191 36)" stopOpacity="0.22" />
            <stop offset="50%" stopColor="rgb(251 191 36)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="rgb(163 163 163)" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* outer glow ring */}
        <circle
          cx="0" cy="0" r="47"
          fill="none"
          stroke={drag ? "rgb(163 230 53)" : hover ? "rgb(251 191 36)" : "rgb(120 113 108)"}
          strokeOpacity={drag ? 0.7 : hover ? 0.45 : 0.25}
          strokeWidth={drag ? 2.2 : 1.4}
          className="transition-all duration-200 ease-out"
        />
        <circle cx="0" cy="0" r="44" fill={"url(#" + uid + "-plat)"} stroke="rgb(68 64 60)" strokeOpacity="0.8" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="44" fill={"url(#" + uid + "-sheen)"} />

        {/* rotating group */}
        <g
          transform={"rotate(" + deg + ")"}
          style={{ transition: drag ? "none" : "transform 150ms ease-out" }}
        >
          {spokes}
          {/* marker slab */}
          <rect
            x="-2.2" y="-42" width="4.4" height="17" rx="2.2"
            fill={drag ? "rgb(163 230 53)" : "rgb(245 158 11)"}
            className="transition-all duration-200 ease-out"
          />
          <circle cx="0" cy="-20" r="2" fill="rgb(251 191 36)" fillOpacity="0.5" />
          {/* grain arcs */}
          <circle cx="0" cy="0" r="30" fill="none" stroke="rgb(120 113 108)" strokeOpacity="0.18" strokeWidth="0.7" strokeDasharray="3 7" />
          <circle cx="0" cy="0" r="24" fill="none" stroke="rgb(120 113 108)" strokeOpacity="0.14" strokeWidth="0.6" strokeDasharray="2 9" />
        </g>

        {/* inner well */}
        <circle cx="0" cy="0" r="17" fill={"url(#" + uid + "-well)"} stroke="rgb(41 37 36)" strokeWidth="1.5" />
        <circle
          cx="0" cy="0" r="12"
          fill="none"
          stroke={drag ? "rgb(163 230 53)" : "rgb(245 158 11)"}
          strokeOpacity={drag ? 0.85 : 0.35}
          strokeWidth="1.2"
          strokeDasharray="38 200"
          transform={"rotate(" + deg * 1.6 + ")"}
          style={{ transition: drag ? "none" : "transform 150ms ease-out, stroke 200ms ease-out" }}
        />
        <circle
          cx="0" cy="0" r="3.2"
          fill={drag ? "rgb(163 230 53)" : "rgb(245 158 11)"}
          className={"transition-all duration-200 ease-out" + (drag ? " animate-pulse" : "")}
        />
      </svg>
    </div>
  );
}

export const JogWheel_MIN = {"base":[4,4]};