type BodyDiagramProps = { children?: React.ReactNode; onBackgroundClick?: () => void };

export const BodyDiagram_MIN = {"base":[9,13]};

export function BodyDiagram(props: BodyDiagramProps) {
  const uid = useRef("bodydiagram-" + Math.random().toString(36).slice(2)).current;
  const floor = BodyDiagram_MIN.base;

  const grid: JSX.Element[] = [];
  for (let x = 10; x < 200; x += 10) {
    grid.push(<line key={"gx" + x} x1={x} y1={0} x2={x} y2={300} stroke="rgba(34,211,238,0.07)" strokeWidth={0.4} />);
  }
  for (let y = 10; y < 300; y += 10) {
    grid.push(<line key={"gy" + y} x1={0} y1={y} x2={200} y2={y} stroke="rgba(34,211,238,0.07)" strokeWidth={0.4} />);
  }

  const torso = "M86,56 L114,56 L126,68 L142,78 C151,83 153,92 151,104 L146,132 L137,127 L135,152 C135,168 131,180 129,191 L71,191 C69,180 65,168 65,152 L63,127 L54,132 L49,104 C47,92 49,83 58,78 L74,68 Z";
  const armL = "M58,78 C48,85 45,99 43,117 L37,161 C35,173 33,182 35,191 L45,192 C47,182 49,173 51,161 L57,129 Z";
  const armR = "M142,78 C152,85 155,99 157,117 L163,161 C165,173 167,182 165,191 L155,192 C153,182 151,173 149,161 L143,129 Z";
  const legs = "M71,191 L69,231 L64,272 L62,289 L83,289 L87,262 L93,223 L100,198 L107,223 L113,262 L117,289 L138,289 L136,272 L131,231 L129,191 Z";
  const head = "M100,12 C112,12 122,22 122,36 C122,50 113,62 100,62 C87,62 78,50 78,36 C78,22 88,12 100,12 Z";

  const outline = "text-cyan-400";

  return (
    <div className="relative h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <svg viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id={uid + "-aura"} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#1a0b2e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#07070c" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id={uid + "-body"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.20)" />
            <stop offset="55%" stopColor="rgba(217,70,239,0.10)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.05)" />
          </linearGradient>
          <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(253,224,71,0)" />
            <stop offset="50%" stopColor="rgba(253,224,71,0.55)" />
            <stop offset="100%" stopColor="rgba(253,224,71,0)" />
          </linearGradient>
          <filter id={uid + "-glow"} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={uid + "-clip"}>
            <path d={head} />
            <path d={torso} />
            <path d={armL} />
            <path d={armR} />
            <path d={legs} />
          </clipPath>
        </defs>

        <rect
          x="0"
          y="0"
          width="200"
          height="300"
          fill={"url(#" + uid + "-aura)"}
          onClick={props.onBackgroundClick}
          style={{ cursor: props.onBackgroundClick ? "crosshair" : "default" }}
        />
        <g pointerEvents="none">
          {grid}

          {/* corner frame ticks */}
          <g stroke="rgba(253,224,71,0.7)" strokeWidth={1.2} fill="none">
            <path d="M4,16 L4,4 L18,4" />
            <path d="M182,4 L196,4 L196,16" />
            <path d="M196,284 L196,296 L182,296" />
            <path d="M18,296 L4,296 L4,284" />
          </g>

          {/* body silhouette */}
          <g filter={"url(#" + uid + "-glow)"}>
            <g fill={"url(#" + uid + "-body)"} stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" className={outline}>
              <path d={head} />
              <path d={torso} />
              <path d={armL} />
              <path d={armR} />
              <path d={legs} />
            </g>
          </g>

          {/* interior circuitry */}
          <g clipPath={"url(#" + uid + "-clip)"}>
            <g stroke="rgba(217,70,239,0.35)" strokeWidth={0.7} fill="none">
              <path d="M100,62 L100,191" />
              <path d="M100,86 L74,100 M100,86 L126,100" />
              <path d="M100,120 L66,130 M100,120 L134,130" />
              <path d="M100,196 L86,262 M100,196 L114,262" />
              <path d="M58,78 L50,160 M142,78 L150,160" />
            </g>
            <g fill="rgba(34,211,238,0.9)">
              <circle cx="100" cy="36" r="1.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx="100" cy="92" r="1.6">
                <animate attributeName="opacity" values="1;0.25;1" dur="3.1s" repeatCount="indefinite" />
              </circle>
              <circle cx="66" cy="130" r="1.4">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="134" cy="130" r="1.4">
                <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite" />
              </circle>
            </g>
            {/* horizontal body scanlines */}
            <g stroke="rgba(34,211,238,0.12)" strokeWidth={0.5}>
              {Array.from({ length: 60 }).map((_, i) => (
                <line key={"s" + i} x1={0} y1={i * 5 + 2} x2={200} y2={i * 5 + 2} />
              ))}
            </g>
            <rect x="0" y="-20" width="200" height="26" fill={"url(#" + uid + "-scan)"}>
              <animate attributeName="y" values="-26;300" dur="4.6s" repeatCount="indefinite" />
            </rect>
          </g>

          {/* axis reticle */}
          <g stroke="rgba(34,211,238,0.25)" strokeWidth={0.6} strokeDasharray="3 4">
            <line x1="100" y1="4" x2="100" y2="296" />
          </g>
        </g>

        <foreignObject x="0" y="0" width="200" height="300">
          <div className="relative h-full w-full">
            <div className="absolute inset-0 grid grid-rows-[100%] grid-cols-[100%] [&>*]:[grid-area:1/1]">
              {props.children}
            </div>
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}