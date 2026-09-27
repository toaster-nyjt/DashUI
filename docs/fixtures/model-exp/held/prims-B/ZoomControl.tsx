type ZoomControlProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (zoom: number) => void;
  onReset?: () => void;
};

export const ZoomControl_MIN = {"base":[2.25,6.5]};

export function ZoomControl(props: ZoomControlProps) {
  const { value, min, max, step, onChange, onReset } = props;
  const uid = useRef("zoomctl-" + Math.random().toString(36).slice(2)).current;
  const railRef = useRef<any>(null);
  const [drag, setDrag] = useState(false);
  const [press, setPress] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const range = Math.max(1e-9, max - min);
  const stepSize = step && step > 0 ? step : range / 10;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => {
    if (!step || step <= 0) return clamp(v);
    return clamp(min + Math.round((v - min) / step) * step);
  };
  const v = clamp(value);
  const t = (v - min) / range;

  // geometry
  const W = 60;
  const BTN = 46;
  const RAIL_TOP = BTN + 10;
  const RAIL_H = 104;
  const RAIL_BOT = RAIL_TOP + RAIL_H;
  const MINUS_Y = RAIL_BOT + 10;
  const RESET_Y = MINUS_Y + BTN + 10;
  const H = onReset ? RESET_Y + 34 : MINUS_Y + BTN;

  const tickCount = Math.min(20, Math.max(3, Math.round(range / stepSize)));
  const ticks: number[] = [];
  for (let i = 0; i <= tickCount; i++) ticks.push(i / tickCount);

  const thumbY = RAIL_BOT - t * RAIL_H;

  const fromPointer = (e: any) => {
    const el = railRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.height <= 0) return;
    const ratio = 1 - (e.clientY - r.top) / r.height;
    onChange(snap(min + Math.min(1, Math.max(0, ratio)) * range));
  };

  const bump = (dir: number) => onChange(snap(clamp(v + dir * stepSize)));

  const cyan = "#67e8f9";
  const btnFill = (id: string, disabled: boolean) =>
    disabled ? "rgba(0,0,0,0.45)" : press === id ? "rgba(34,211,238,0.35)" : hover === id ? "rgba(34,211,238,0.16)" : "rgba(10,12,14,0.72)";

  const atMax = v >= max - 1e-9;
  const atMin = v <= min + 1e-9;

  const Btn = (id: string, y: number, disabled: boolean, onAct: () => void, glyph: any) => (
    <g
      className="touch-none"
      style={{ cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, transition: "opacity 200ms ease-out" }}
      onPointerDown={(e: any) => {
        if (disabled) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setPress(id);
        onAct();
      }}
      onPointerUp={() => setPress(null)}
      onPointerCancel={() => setPress(null)}
      onPointerEnter={() => setHover(id)}
      onPointerLeave={() => { setHover(null); setPress(null); }}
    >
      <g style={{ transform: press === id ? "scale(0.94)" : "scale(1)", transformOrigin: String(W / 2) + "px " + String(y + BTN / 2) + "px", transition: "transform 140ms ease-out" }}>
        <rect
          x={7} y={y} width={W - 14} height={BTN}
          fill={btnFill(id, disabled)}
          stroke={press === id || hover === id ? cyan : "rgba(34,211,238,0.35)"}
          strokeWidth={1.4}
          style={{ transition: "fill 200ms ease-out, stroke 200ms ease-out" }}
        />
        {/* corner notches */}
        <path d={"M7 " + (y + 8) + " L7 " + y + " L15 " + y} fill="none" stroke={cyan} strokeWidth={1.6} opacity={0.8} />
        <path d={"M" + (W - 7) + " " + (y + BTN - 8) + " L" + (W - 7) + " " + (y + BTN) + " L" + (W - 15) + " " + (y + BTN)} fill="none" stroke={cyan} strokeWidth={1.6} opacity={0.8} />
        {glyph}
      </g>
    </g>
  );

  return (
    <div className="h-full w-full" style={{ minWidth: ZoomControl_MIN.base[0] + "rem", minHeight: ZoomControl_MIN.base[1] + "rem" }}>
      <svg viewBox={"0 0 " + W + " " + H} preserveAspectRatio="xMidYMid meet" className="h-full w-full touch-none select-none">
        <defs>
          <linearGradient id={uid + "-fill"} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a5f3fc" stopOpacity="1" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* plus */}
        {Btn("plus", 0, atMax, () => bump(1), (
          <g stroke={atMax ? "#737373" : cyan} strokeWidth={3} strokeLinecap="square" filter={atMax ? undefined : "url(#" + uid + "-glow)"}>
            <line x1={W / 2 - 10} y1={BTN / 2} x2={W / 2 + 10} y2={BTN / 2} />
            <line x1={W / 2} y1={BTN / 2 - 10} x2={W / 2} y2={BTN / 2 + 10} />
          </g>
        ))}

        {/* rail */}
        <g>
          <rect x={W / 2 - 9} y={RAIL_TOP - 4} width={18} height={RAIL_H + 8} fill="rgba(0,0,0,0.65)" stroke="rgba(34,211,238,0.14)" strokeWidth={1} />
          {ticks.map((tk, i) => {
            const y = RAIL_BOT - tk * RAIL_H;
            const on = tk <= t + 1e-6;
            return (
              <line
                key={"tk-" + i}
                x1={W / 2 - 16} y1={y} x2={W / 2 - 11} y2={y}
                stroke={on ? cyan : "rgba(34,211,238,0.28)"}
                strokeWidth={1.4}
                style={{ transition: "stroke 220ms ease-out" }}
              />
            );
          })}
          <rect x={W / 2 - 3} y={RAIL_TOP} width={6} height={RAIL_H} fill="rgba(34,211,238,0.10)" />
          <rect
            x={W / 2 - 3}
            y={thumbY}
            width={6}
            height={RAIL_BOT - thumbY}
            fill={"url(#" + uid + "-fill)"}
            style={{ transition: drag ? "none" : "y 220ms ease-out, height 220ms ease-out" }}
          />
          {/* thumb */}
          <g style={{ transform: "translateY(" + thumbY + "px)", transition: drag ? "none" : "transform 220ms ease-out" }}>
            <path
              d={"M" + (W / 2 - 13) + " 0 L" + (W / 2) + " -7 L" + (W / 2 + 13) + " 0 L" + (W / 2) + " 7 Z"}
              fill={drag ? "#fcd34d" : "#a5f3fc"}
              stroke={drag ? "#fde68a" : cyan}
              strokeWidth={1.2}
              filter={"url(#" + uid + "-glow)"}
              style={{ transition: "fill 180ms ease-out" }}
            />
            <line x1={W / 2 - 6} y1={0} x2={W / 2 + 6} y2={0} stroke="#0a0a0a" strokeWidth={1.2} />
          </g>
          {/* hit area */}
          <rect
            ref={railRef}
            x={7} y={RAIL_TOP} width={W - 14} height={RAIL_H}
            fill="transparent"
            className="touch-none"
            style={{ cursor: "ns-resize" }}
            onPointerDown={(e: any) => {
              e.currentTarget.setPointerCapture?.(e.pointerId);
              setDrag(true);
              fromPointer(e);
            }}
            onPointerMove={(e: any) => { if (drag) fromPointer(e); }}
            onPointerUp={() => setDrag(false)}
            onPointerCancel={() => setDrag(false)}
          />
        </g>

        {/* minus */}
        {Btn("minus", MINUS_Y, atMin, () => bump(-1), (
          <line
            x1={W / 2 - 10} y1={MINUS_Y + BTN / 2} x2={W / 2 + 10} y2={MINUS_Y + BTN / 2}
            stroke={atMin ? "#737373" : cyan} strokeWidth={3} strokeLinecap="square"
            filter={atMin ? undefined : "url(#" + uid + "-glow)"}
          />
        ))}

        {/* reset */}
        {onReset ? (
          <g
            className="touch-none"
            style={{ cursor: "pointer" }}
            onPointerDown={(e: any) => { e.currentTarget.setPointerCapture?.(e.pointerId); setPress("reset"); onReset(); }}
            onPointerUp={() => setPress(null)}
            onPointerCancel={() => setPress(null)}
            onPointerEnter={() => setHover("reset")}
            onPointerLeave={() => { setHover(null); setPress(null); }}
          >
            <g style={{ transform: press === "reset" ? "scale(0.9) rotate(-25deg)" : hover === "reset" ? "scale(1.06)" : "scale(1)", transformOrigin: String(W / 2) + "px " + String(RESET_Y + 12) + "px", transition: "transform 200ms ease-out" }}>
              <circle
                cx={W / 2} cy={RESET_Y + 12} r={11}
                fill={hover === "reset" ? "rgba(252,211,77,0.18)" : "rgba(10,12,14,0.72)"}
                stroke={hover === "reset" ? "#fcd34d" : "rgba(252,211,77,0.5)"}
                strokeWidth={1.4}
                style={{ transition: "all 200ms ease-out" }}
              />
              <path
                d={"M" + (W / 2 - 5) + " " + (RESET_Y + 12) + " a5 5 0 1 1 2 4"}
                fill="none" stroke="#fcd34d" strokeWidth={1.8} strokeLinecap="round"
              />
              <path d={"M" + (W / 2 - 8) + " " + (RESET_Y + 8) + " L" + (W / 2 - 5) + " " + (RESET_Y + 13) + " L" + (W / 2 - 1) + " " + (RESET_Y + 9)} fill="none" stroke="#fcd34d" strokeWidth={1.6} strokeLinecap="round" />
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
}