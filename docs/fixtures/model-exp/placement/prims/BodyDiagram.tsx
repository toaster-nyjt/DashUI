type BodyDiagramProps = { children?: any; onBackgroundClick?: () => void };

export const BodyDiagram_MIN = {"base":[10,13]};

export function BodyDiagram(props: BodyDiagramProps) {
  const uid = useRef("bodydiagram-" + Math.random().toString(36).slice(2)).current;
  const [pulse, setPulse] = useState(false);

  const V = "0 0 100 140";

  const body =
    "M50 6 C44 6 40 10.5 40 16.5 C40 21 42 24.5 44.5 26.5 " +
    "C38 28.5 33.5 31 30 34 C25 38 22.5 44 21.5 51 L18 74 " +
    "L13 76 L10.5 60 L5.5 61 L8 82 C8.5 87 11 90 15 91 L23 93 " +
    "L24 76 L26 76 L26 92 C26 100 27.5 108 29 115 L31 134 " +
    "L41 134 L41 116 L44 96 L50 92 L56 96 L59 116 L59 134 " +
    "L69 134 L71 115 C72.5 108 74 100 74 92 L74 76 L76 76 L77 93 " +
    "L85 91 C89 90 91.5 87 92 82 L94.5 61 L89.5 60 L87 76 L82 74 " +
    "L78.5 51 C77.5 44 75 38 70 34 C66.5 31 62 28.5 55.5 26.5 " +
    "C58 24.5 60 21 60 16.5 C60 10.5 56 6 50 6 Z";

  const onDown = (e: any) => {
    if (!props.onBackgroundClick) return;
    if (e.target !== e.currentTarget) return;
    setPulse(true);
    window.setTimeout(() => setPulse(false), 420);
    props.onBackgroundClick();
  };

  return (
    <div className="h-full w-full" style={{ minWidth: BodyDiagram_MIN.base[0] + "rem", minHeight: BodyDiagram_MIN.base[1] + "rem" }}>
      <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
        <div className="relative h-full aspect-[5/7] max-w-full">
          <svg
            viewBox={V}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.20" />
                <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#d946ef" stopOpacity="0.16" />
              </linearGradient>
              <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde047" stopOpacity="0" />
                <stop offset="45%" stopColor="#fde047" stopOpacity="0.75" />
                <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <pattern id={uid + "-grid"} width="6" height="6" patternUnits="userSpaceOnUse">
                <path d="M6 0 L0 0 L0 6" fill="none" stroke="rgba(34,211,238,0.22)" strokeWidth="0.25" />
              </pattern>
              <clipPath id={uid + "-clip"}>
                <path d={body} />
              </clipPath>
              <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="1.6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* backdrop grid */}
            <rect x="0" y="0" width="100" height="140" fill="rgba(7,7,12,0.55)" />
            <rect x="0" y="0" width="100" height="140" fill={"url(#" + uid + "-grid)"} opacity="0.35" />

            {/* corner brackets */}
            <g stroke="rgba(253,224,71,0.6)" strokeWidth="0.7" fill="none">
              <path d="M3 12 L3 3 L12 3" />
              <path d="M97 12 L97 3 L88 3" />
              <path d="M3 128 L3 137 L12 137" />
              <path d="M97 128 L97 137 L88 137" />
            </g>

            {/* body */}
            <g filter={"url(#" + uid + "-glow)"}>
              <path d={body} fill={"url(#" + uid + "-fill)"} stroke="rgba(34,211,238,0.75)" strokeWidth="0.8" strokeLinejoin="round" />
            </g>

            <g clipPath={"url(#" + uid + "-clip)"}>
              <rect x="0" y="0" width="100" height="140" fill={"url(#" + uid + "-grid)"} opacity="0.8" />
              {/* skeleton-ish circuit traces */}
              <g stroke="rgba(217,70,239,0.45)" strokeWidth="0.5" fill="none">
                <path d="M50 27 L50 92" />
                <path d="M50 40 L34 46 M50 40 L66 46" />
                <path d="M50 58 L30 62 M50 58 L70 62" />
                <path d="M50 76 L38 82 M50 76 L62 82" />
                <path d="M44 96 L41 134 M56 96 L59 134" />
              </g>
              <g fill="rgba(34,211,238,0.8)">
                <circle cx="50" cy="40" r="0.9" />
                <circle cx="50" cy="58" r="0.9" />
                <circle cx="50" cy="76" r="0.9" />
                <circle cx="50" cy="92" r="1.1" />
              </g>
              {/* scan sweep */}
              <rect x="0" y="-30" width="100" height="30" fill={"url(#" + uid + "-scan)"}>
                <animate attributeName="y" values="-30;140" dur="4.2s" repeatCount="indefinite" />
              </rect>
              {/* horizontal micro scanlines */}
              <rect x="0" y="0" width="100" height="140" fill="none" />
            </g>

            {/* reticle around head */}
            <g opacity="0.55" stroke="rgba(253,224,71,0.7)" strokeWidth="0.4" fill="none">
              <circle cx="50" cy="16" r="14" strokeDasharray="4 6">
                <animateTransform attributeName="transform" type="rotate" from="0 50 16" to="360 50 16" dur="16s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>

          {/* click-catcher background */}
          {props.onBackgroundClick ? (
            <div
              className={
                "absolute inset-0 touch-none cursor-crosshair transition-all duration-200 ease-out " +
                (pulse ? "ring-2 ring-fuchsia-400/60 bg-fuchsia-500/10" : "ring-0")
              }
              onPointerDown={onDown}
            />
          ) : null}

          {/* held layer: EquipmentSlot children position themselves in 0-1 space */}
          <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}