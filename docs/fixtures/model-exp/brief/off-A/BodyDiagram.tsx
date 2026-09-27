type BodyDiagramProps = { children?: any; points?: { id: string; x: number; y: number }[] };

export const BodyDiagram_MIN = {"base":[9,12]};

export function BodyDiagram(props: BodyDiagramProps) {
  const uid = useRef("bodydiagram-" + Math.random().toString(36).slice(2)).current;
  const pts = props.points || [];
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = performance.now();
    const loop = (now: number) => {
      setT(((now - start) / 3200) % 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const BODY =
    "M50 6 C57 6 61 11 61 17 C61 22 59 25 57 27 C63 29 70 32 74 37 C78 42 80 52 81 62 C82 70 83 79 83 85 C83 89 79 91 76 89 C74 87 73 80 72 73 C71 68 70 64 69 62 C69 72 70 82 70 92 C70 100 69 108 68 116 C67 124 66 134 65 143 C64 150 63 154 62 156 C60 158 55 158 54 155 C53 151 53 142 52 133 C51 124 51 116 50 110 C49 116 49 124 48 133 C47 142 47 151 46 155 C45 158 40 158 38 156 C37 154 36 150 35 143 C34 134 33 124 32 116 C31 108 30 100 30 92 C30 82 31 72 31 62 C30 64 29 68 28 73 C27 80 26 87 24 89 C21 91 17 89 17 85 C17 79 18 70 19 62 C20 52 22 42 26 37 C30 32 37 29 43 27 C41 25 39 22 39 17 C39 11 43 6 50 6 Z";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: BodyDiagram_MIN.base[0] + "rem", minHeight: BodyDiagram_MIN.base[1] + "rem" }}
    >
      <div className="absolute inset-0">
        <svg className="h-full w-full" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={uid + "-body"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.26)" />
              <stop offset="55%" stopColor="rgba(34,211,238,0.10)" />
              <stop offset="100%" stopColor="rgba(217,70,239,0.18)" />
            </linearGradient>
            <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(253,224,71,0)" />
              <stop offset="50%" stopColor="rgba(253,224,71,0.75)" />
              <stop offset="100%" stopColor="rgba(253,224,71,0)" />
            </linearGradient>
            <pattern id={uid + "-grid"} width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M6 0H0V6" fill="none" stroke="rgba(34,211,238,0.30)" strokeWidth="0.35" />
            </pattern>
            <clipPath id={uid + "-clip"}>
              <path d={BODY} />
            </clipPath>
            <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* silhouette */}
          <path d={BODY} fill={"url(#" + uid + "-body)"} stroke="rgba(34,211,238,0.55)" strokeWidth="0.7" />
          <g clipPath={"url(#" + uid + "-clip)"}>
            <rect x="0" y="0" width="100" height="160" fill={"url(#" + uid + "-grid)"} opacity="0.55" />
            {/* spine / limb wiring */}
            <g stroke="rgba(34,211,238,0.45)" strokeWidth="0.45" fill="none">
              <path d="M50 28 V108" />
              <path d="M34 40 H66" />
              <path d="M30 52 H70" />
              <path d="M26 44 L21 80 M74 44 L79 80" />
              <path d="M40 112 L38 152 M60 112 L62 152" />
            </g>
            <rect x="0" y={(t * 190 - 20).toFixed(2)} width="100" height="16" fill={"url(#" + uid + "-scan)"} opacity="0.5" />
          </g>
          <path d={BODY} fill="none" stroke="rgba(253,224,71,0.35)" strokeWidth="0.25" />

          {/* point nodes */}
          {pts.map((p, i) => {
            const cx = Math.max(0, Math.min(1, p.x)) * 100;
            const cy = Math.max(0, Math.min(1, p.y)) * 160;
            const ph = (t + i * 0.13) % 1;
            return (
              <g key={"pt-" + p.id}>
                <line
                  x1="50"
                  y1={cy.toFixed(2)}
                  x2={cx.toFixed(2)}
                  y2={cy.toFixed(2)}
                  stroke="rgba(34,211,238,0.35)"
                  strokeWidth="0.4"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={cx.toFixed(2)}
                  cy={cy.toFixed(2)}
                  r={(2.4 + ph * 4).toFixed(2)}
                  fill="none"
                  stroke="rgba(253,224,71,0.6)"
                  strokeWidth="0.4"
                  opacity={(1 - ph) * 0.8}
                />
                <circle
                  cx={cx.toFixed(2)}
                  cy={cy.toFixed(2)}
                  r="1.9"
                  fill="rgb(253,224,71)"
                  filter={"url(#" + uid + "-glow)"}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* held slots */}
      <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
        {props.children}
      </div>
    </div>
  );
}