type RouteOverlayProps = { points: { x: number; y: number }[]; visible: boolean; distance?: number };

export const RouteOverlay_MIN = {"base":[5,4]};

export function RouteOverlay(props: RouteOverlayProps) {
  const { points, visible, distance } = props;
  const uid = useRef("routeoverlay-" + Math.random().toString(36).slice(2)).current;
  const floor = RouteOverlay_MIN.base;

  const pts = (points || []).filter(
    (p) => p && typeof p.x === "number" && typeof p.y === "number"
  );
  const S = 1000;
  const sx = (p: { x: number; y: number }) => Math.max(0, Math.min(1, p.x)) * S;
  const sy = (p: { x: number; y: number }) => Math.max(0, Math.min(1, p.y)) * S;

  const d = pts.length
    ? pts.map((p, i) => (i === 0 ? "M " : "L ") + sx(p).toFixed(2) + " " + sy(p).toFixed(2)).join(" ")
    : "";

  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = sx(pts[i]) - sx(pts[i - 1]);
    const dy = sy(pts[i]) - sy(pts[i - 1]);
    len += Math.sqrt(dx * dx + dy * dy);
  }

  const fmt = (v: number) => {
    if (!isFinite(v)) return "--";
    if (v >= 1000) return (v / 1000).toFixed(2) + " KM";
    return (v >= 100 ? Math.round(v) : v.toFixed(1)) + " M";
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-dash{to{stroke-dashoffset:-120}}" +
        "@keyframes " + uid + "-pulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.9;transform:scale(1.45)}}" +
        "@keyframes " + uid + "-fade{from{opacity:0}to{opacity:1}}"
      }</style>

      <div
        className="absolute inset-0 transition-all duration-300 ease-out"
        style={{
          opacity: visible && pts.length > 0 ? 1 : 0,
          filter: visible ? "none" : "blur(2px)",
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={"0 0 " + S + " " + S}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={uid + "-grad"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#67e8f9" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {d ? (
            <g filter={"url(#" + uid + "-glow)"}>
              <path
                d={d}
                fill="none"
                stroke="#22d3ee"
                strokeOpacity="0.18"
                strokeWidth="22"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke={"url(#" + uid + "-grad)"}
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                stroke="#a5f3fc"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="26 34"
                vectorEffect="non-scaling-stroke"
                style={{ animation: uid + "-dash 1.4s linear infinite" }}
              />
            </g>
          ) : null}
        </svg>

        {pts.map((p, i) => {
          const last = i === pts.length - 1;
          const first = i === 0;
          const color = last ? "#e879f9" : first ? "#22d3ee" : "#67e8f9";
          return (
            <div
              key={"wp-" + i}
              className="absolute"
              style={{
                left: Math.max(0, Math.min(1, p.x)) * 100 + "%",
                top: Math.max(0, Math.min(1, p.y)) * 100 + "%",
                transform: "translate(-50%,-50%)",
                animation: uid + "-fade 320ms ease-out both",
                animationDelay: i * 45 + "ms",
              }}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute rounded-full"
                  style={{
                    width: first || last ? "1.4rem" : "0.9rem",
                    height: first || last ? "1.4rem" : "0.9rem",
                    background: color,
                    animation: uid + "-pulse 1.8s ease-in-out infinite",
                    animationDelay: i * 120 + "ms",
                  }}
                />
                {first || last ? (
                  <div
                    className="rotate-45 border"
                    style={{
                      width: "0.62rem",
                      height: "0.62rem",
                      borderColor: color,
                      background: "rgba(0,0,0,0.75)",
                      boxShadow: "0 0 10px " + color,
                    }}
                  />
                ) : (
                  <div
                    className="rounded-full"
                    style={{
                      width: "0.3rem",
                      height: "0.3rem",
                      background: color,
                      boxShadow: "0 0 8px " + color,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {typeof distance === "number" ? (
          <div className="absolute left-0 bottom-0 h-[26%] max-h-[2.2rem] w-[62%] max-w-[9rem]">
            <div className="relative h-full w-full border border-cyan-400/30 bg-black/75 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-cyan-400 to-fuchsia-500" />
              <div className="absolute inset-y-[18%] left-[10%] right-[6%]">
                <FitText className="font-mono font-bold tracking-widest uppercase text-cyan-300" wrap={false}>
                  {fmt(distance)}
                </FitText>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}