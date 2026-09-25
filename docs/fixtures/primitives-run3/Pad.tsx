type PadProps = { onPress: () => void; active?: boolean; children?: React.ReactNode };

export function Pad(props: PadProps) {
  const uid = useRef("pad-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(0);

  const active = !!props.active;

  const fireFlash = () => {
    setFlash((n) => n + 1);
  };

  const handleDown = (e: React.PointerEvent) => {
    e.preventDefault();
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {}
    setPressed(true);
    fireFlash();
    props.onPress();
  };

  const handleUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
    setPressed(false);
  };

  const handleLeave = () => {
    setHovered(false);
    setPressed(false);
  };

  // Color state resolution
  const bodyGradId = uid + "-body";
  const glowGradId = uid + "-glow";
  const sheenGradId = uid + "-sheen";
  const cornerGradId = uid + "-corner";
  const rippleGradId = uid + "-ripple";
  const bezelGradId = uid + "-bezel";
  const innerShadowId = uid + "-innershadow";

  return (
    <div
      className="relative h-full w-full min-w-0 min-h-0 select-none touch-none"
      style={{ WebkitTapHighlightColor: "transparent" }}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handleLeave}
      role="button"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative"
          style={{
            width: "100%",
            height: "100%",
            aspectRatio: "1 / 1",
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            style={{
              transition: "transform 200ms ease-out",
              transform: pressed
                ? "scale(0.93)"
                : hovered
                ? "scale(1.03)"
                : "scale(1)",
              filter: active
                ? "drop-shadow(0 0 7px rgba(245,158,11,0.55))"
                : hovered
                ? "drop-shadow(0 0 4px rgba(245,158,11,0.25))"
                : "drop-shadow(0 3px 5px rgba(0,0,0,0.5))",
            }}
          >
            <defs>
              <linearGradient id={bezelGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b5651" />
                <stop offset="45%" stopColor="#2d2b28" />
                <stop offset="100%" stopColor="#0d0c0b" />
              </linearGradient>

              <linearGradient id={bodyGradId} x1="0" y1="0" x2="0" y2="1">
                {active ? (
                  <>
                    <stop offset="0%" stopColor="#7a4d05" />
                    <stop offset="42%" stopColor="#4a3208" />
                    <stop offset="100%" stopColor="#1c1305" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#3f3d3a" />
                    <stop offset="48%" stopColor="#26241f" />
                    <stop offset="100%" stopColor="#131210" />
                  </>
                )}
              </linearGradient>

              <radialGradient id={glowGradId} cx="50%" cy="42%" r="62%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity={active ? 0.85 : 0} />
                <stop offset="55%" stopColor="#f59e0b" stopOpacity={active ? 0.28 : 0} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <linearGradient id={sheenGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
                <stop offset="18%" stopColor="#ffffff" stopOpacity="0.06" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              <radialGradient id={cornerGradId} cx="18%" cy="16%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={active ? 0.18 : 0.1} />
                <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>

              <radialGradient id={rippleGradId} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fde68a" stopOpacity="0.55" />
                <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <filter id={innerShadowId} x="-20%" y="-20%" width="140%" height="140%">
                <feOffset dx="0" dy="1.5" />
                <feGaussianBlur stdDeviation="1.4" result="off" />
                <feComposite in="SourceGraphic" in2="off" operator="over" />
              </filter>
            </defs>

            {/* Outer bezel / seam */}
            <rect
              x="3"
              y="3"
              width="94"
              height="94"
              rx="16"
              fill={"url(#" + bezelGradId + ")"}
            />
            {/* Inner seam line */}
            <rect
              x="5.5"
              y="5.5"
              width="89"
              height="89"
              rx="14"
              fill="none"
              stroke="#000000"
              strokeOpacity="0.55"
              strokeWidth="1"
            />

            {/* Pad body */}
            <rect
              x="7"
              y="7"
              width="86"
              height="86"
              rx="13"
              fill={"url(#" + bodyGradId + ")"}
            />

            {/* Accent glow bloom (active) */}
            {(active || pressed) && (
              <rect
                x="7"
                y="7"
                width="86"
                height="86"
                rx="13"
                fill={"url(#" + glowGradId + ")"}
                style={{
                  opacity: pressed && !active ? 0.55 : 1,
                  transition: "opacity 200ms ease-out",
                }}
              />
            )}

            {/* Corner highlight */}
            <rect
              x="7"
              y="7"
              width="86"
              height="86"
              rx="13"
              fill={"url(#" + cornerGradId + ")"}
            />

            {/* Top sheen strip */}
            <rect
              x="9"
              y="9"
              width="82"
              height="40"
              rx="11"
              fill={"url(#" + sheenGradId + ")"}
            />

            {/* Press ripple */}
            {flash > 0 && (
              <g key={flash}>
                <circle cx="50" cy="50" r="10" fill={"url(#" + rippleGradId + ")"}>
                  <animate
                    attributeName="r"
                    from="8"
                    to="58"
                    dur="0.5s"
                    begin="0s"
                    fill="freeze"
                    calcMode="spline"
                    keySplines="0.15 0.6 0.3 1"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.9"
                    to="0"
                    dur="0.5s"
                    begin="0s"
                    fill="freeze"
                  />
                </circle>
              </g>
            )}

            {/* Lit inner rim (active) */}
            <rect
              x="8.5"
              y="8.5"
              width="83"
              height="83"
              rx="12"
              fill="none"
              stroke="#f59e0b"
              strokeWidth={active ? 1.6 : 1}
              strokeOpacity={active ? 0.8 : hovered ? 0.35 : 0.16}
              style={{ transition: "stroke-opacity 200ms ease-out, stroke-width 200ms ease-out" }}
            />

            {/* Active status LED dot (top-left) */}
            <circle
              cx="16.5"
              cy="16.5"
              r="2.6"
              fill={active ? "#fbbf24" : "#3a3733"}
              style={{
                filter: active
                  ? "drop-shadow(0 0 3px rgba(251,191,36,0.9))"
                  : "none",
                transition: "fill 200ms ease-out",
              }}
            >
              {active && (
                <animate
                  attributeName="opacity"
                  values="1;0.55;1"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          </svg>

          {/* Face content overlay */}
          {props.children != null && props.children !== false && (
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{
                padding: "22%",
                transition: "transform 200ms ease-out",
                transform: pressed ? "scale(0.9)" : hovered ? "scale(1.04)" : "scale(1)",
              }}
            >
              <div
                className="flex items-center justify-center text-center font-mono font-bold tabular-nums tracking-tight leading-none"
                style={{
                  fontSize: "min(34cqw, 34cqh)",
                  color: active ? "#fde68a" : hovered ? "#d4c9ba" : "#8f877b",
                  textShadow: active
                    ? "0 0 8px rgba(251,191,36,0.7), 0 1px 1px rgba(0,0,0,0.6)"
                    : "0 1px 1px rgba(0,0,0,0.7)",
                  transition: "color 200ms ease-out, text-shadow 200ms ease-out",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  whiteSpace: "nowrap",
                }}
              >
                {props.children}
              </div>
            </div>
          )}

          {/* container-query context for face text scaling */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ containerType: "size" } as React.CSSProperties}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}