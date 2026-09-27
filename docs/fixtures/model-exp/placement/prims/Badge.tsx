type BadgeProps = { children?: React.ReactNode; tone?: 'neutral' | 'accent' | 'danger' };

export const Badge_MIN = {"base":[2,2]};

export function Badge(props: BadgeProps) {
  const uid = useRef("badge-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";

  const TONES: any = {
    neutral: {
      c: "#22d3ee",
      c2: "#a5f3fc",
      rgb: "34,211,238",
      text: "text-cyan-100 drop-shadow-[0_0_8px_rgba(34,211,238,0.75)]"
    },
    accent: {
      c: "#fde047",
      c2: "#fef9c3",
      rgb: "253,224,71",
      text: "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.7)]"
    },
    danger: {
      c: "#ef4444",
      c2: "#fca5a5",
      rgb: "239,68,68",
      text: "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
    }
  };
  const t = TONES[tone];

  const hex = "50,3 91,26.5 91,73.5 50,97 9,73.5 9,26.5";
  const hexIn = "50,13 82.5,31.5 82.5,68.5 50,87 17.5,68.5 17.5,31.5";

  const ticks = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const r1 = 44.5;
    const r2 = i % 6 === 0 ? 39 : 42;
    ticks.push(
      <line
        key={"tk-" + i}
        x1={50 + Math.cos(a) * r1}
        y1={50 + Math.sin(a) * r1}
        x2={50 + Math.cos(a) * r2}
        y2={50 + Math.sin(a) * r2}
        stroke={t.c}
        strokeWidth={i % 6 === 0 ? 1.6 : 0.7}
        opacity={i % 6 === 0 ? 0.85 : 0.35}
      />
    );
  }

  return (
    <div
      className="relative h-full w-full [container-type:size]"
      style={{ minWidth: Badge_MIN.base[0] + "rem", minHeight: Badge_MIN.base[1] + "rem" }}
    >
      <style>
        {"@keyframes " + uid + "-spin{to{transform:rotate(360deg)}}" +
          "@keyframes " + uid + "-sweep{0%{transform:translateY(-120%)}100%{transform:translateY(220%)}}" +
          "@keyframes " + uid + "-breathe{0%,100%{opacity:.45}50%{opacity:1}}"}
      </style>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "min(100cqw,100cqh)", height: "min(100cqw,100cqh)" }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <radialGradient id={uid + "-face"} cx="50%" cy="34%" r="72%">
              <stop offset="0%" stopColor={t.c} stopOpacity="0.28" />
              <stop offset="55%" stopColor="#0d0d14" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#050509" stopOpacity="1" />
            </radialGradient>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={t.c2} />
              <stop offset="50%" stopColor={t.c} />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            <filter id={uid + "-glow"} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g
            style={{
              transformOrigin: "50px 50px",
              animation: uid + "-spin 14s linear infinite"
            }}
          >
            {ticks}
            <circle
              cx="50"
              cy="50"
              r="47"
              fill="none"
              stroke={t.c}
              strokeOpacity="0.4"
              strokeWidth="0.9"
              strokeDasharray="14 8 3 8"
            />
          </g>

          <polygon points={hex} fill={"url(#" + uid + "-face)"} />
          <polygon
            points={hex}
            fill="none"
            stroke={"url(#" + uid + "-edge)"}
            strokeWidth="3"
            strokeLinejoin="miter"
            filter={"url(#" + uid + "-glow)"}
          />
          <polygon
            points={hexIn}
            fill="none"
            stroke={t.c}
            strokeOpacity="0.35"
            strokeWidth="0.9"
            strokeDasharray="5 4"
            style={{ animation: uid + "-breathe 2.6s ease-in-out infinite" }}
          />
          <polyline
            points="9,26.5 9,45 4,52"
            fill="none"
            stroke={t.c}
            strokeOpacity="0.7"
            strokeWidth="1.6"
          />
          <polyline
            points="91,73.5 91,55 96,48"
            fill="none"
            stroke="#d946ef"
            strokeOpacity="0.7"
            strokeWidth="1.6"
          />
          <polygon
            points="50,3 62,3 57,9 45,9"
            fill={t.c}
            opacity="0.55"
          />
        </svg>

        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ clipPath: "polygon(50% 3%,91% 26.5%,91% 73.5%,50% 97%,9% 73.5%,9% 26.5%)" }}
        >
          <div
            className="absolute inset-x-0 h-[22%]"
            style={{
              background:
                "linear-gradient(180deg,rgba(" + t.rgb + ",0) 0%,rgba(" + t.rgb + ",0.22) 50%,rgba(" + t.rgb + ",0) 100%)",
              animation: uid + "-sweep 3.6s linear infinite"
            }}
          />
        </div>

        {props.children != null && props.children !== false ? (
          <div className="absolute inset-[26%]">
            <FitText className={"font-mono font-black tracking-tight uppercase transition-all duration-200 ease-out " + t.text}>
              {props.children}
            </FitText>
          </div>
        ) : null}
      </div>
    </div>
  );
}