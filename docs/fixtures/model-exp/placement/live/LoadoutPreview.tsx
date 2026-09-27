type LoadoutPreviewProps = { imageUrl?: string; layers?: { id: string; iconUrl?: string; slot: string }[] };

export const LoadoutPreview_MIN = {"base":[9,12]};

const LoadoutPreviewANCHORS: { k: string; p: [number, number] }[] = [
  { k: "head", p: [100, 34] },
  { k: "eye", p: [92, 40] },
  { k: "optic", p: [92, 40] },
  { k: "face", p: [108, 48] },
  { k: "neck", p: [100, 64] },
  { k: "back", p: [118, 86] },
  { k: "chest", p: [100, 100] },
  { k: "torso", p: [100, 108] },
  { k: "body", p: [100, 108] },
  { k: "outer", p: [76, 96] },
  { k: "arm", p: [64, 112] },
  { k: "hand", p: [50, 150] },
  { k: "glove", p: [50, 150] },
  { k: "primary", p: [148, 130] },
  { k: "secondary", p: [52, 176] },
  { k: "melee", p: [140, 176] },
  { k: "weapon", p: [148, 140] },
  { k: "leg", p: [100, 196] },
  { k: "boot", p: [100, 262] },
  { k: "feet", p: [100, 262] },
  { k: "foot", p: [100, 262] },
  { k: "skel", p: [100, 150] },
  { k: "nerv", p: [100, 74] },
  { k: "circ", p: [100, 118] },
];

function LoadoutPreviewAnchor(slot: string, i: number): [number, number] {
  const s = (slot || "").toLowerCase();
  for (let j = 0; j < LoadoutPreviewANCHORS.length; j++) {
    if (s.indexOf(LoadoutPreviewANCHORS[j].k) >= 0) return LoadoutPreviewANCHORS[j].p;
  }
  return [100, 70 + ((i * 37) % 180)];
}

export function LoadoutPreview(props: LoadoutPreviewProps) {
  const uid = useRef("loadoutpreview-" + Math.random().toString(36).slice(2)).current;
  const floor = LoadoutPreview_MIN.base;
  const layers = props.layers || [];

  const placed = useMemo(() => {
    let l = 0;
    let r = 0;
    return layers.slice(0, 10).map((ly, i) => {
      const a = LoadoutPreviewAnchor(ly.slot, i);
      const left = a[0] <= 100 ? true : false;
      const side = left ? "L" : "R";
      const idx = left ? l++ : r++;
      const bx = left ? 22 : 178;
      const by = 40 + idx * 46;
      return { ly, a, bx, by: Math.min(by, 272), side, key: ly.id + "-" + i };
    });
  }, [layers]);

  return (
    <div className="h-full w-full relative" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div className="absolute inset-0 rounded-md bg-[#07070c] border border-cyan-500/20 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 300" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={uid + "-body"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="55%" stopColor="#a21caf" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.16" />
            </linearGradient>
            <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0" />
              <stop offset="50%" stopColor="#fde047" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={uid + "-halo"} cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
            </radialGradient>
            <pattern id={uid + "-grid"} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0 H0 V10" fill="none" stroke="#06b6d4" strokeOpacity="0.10" strokeWidth="0.4" />
            </pattern>
            <clipPath id={uid + "-fig"}>
              <path d="M100 12c9 0 15 7 15 16 0 7-2 11-5 14 12 3 22 9 26 17 5 10 7 26 8 41 1 10 2 18 3 24l-13 3c-1-8-3-16-5-23l-3 40c0 22 2 44 4 66l-14 2-9-62-9 62-14-2c2-22 4-44 4-66l-3-40c-2 7-4 15-5 23l-13-3c1-6 2-14 3-24 1-15 3-31 8-41 4-8 14-14 26-17-3-3-5-7-5-14 0-9 6-16 15-16z" />
            </clipPath>
          </defs>

          <rect x="0" y="0" width="200" height="300" fill={"url(#" + uid + "-grid)"} />
          <rect x="0" y="0" width="200" height="300" fill={"url(#" + uid + "-halo)"} />

          {/* pedestal */}
          <ellipse cx="100" cy="280" rx="54" ry="9" fill="none" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="0.8" />
          <ellipse cx="100" cy="280" rx="34" ry="5.5" fill="none" stroke="#d946ef" strokeOpacity="0.35" strokeWidth="0.6">
            <animate attributeName="rx" values="34;38;34" dur="4s" repeatCount="indefinite" />
          </ellipse>

          <g clipPath={"url(#" + uid + "-fig)"}>
            <rect x="0" y="0" width="200" height="300" fill={"url(#" + uid + "-body)"} />
            {props.imageUrl ? (
              <image href={props.imageUrl} x="20" y="4" width="160" height="292" preserveAspectRatio="xMidYMid slice" opacity="0.95" />
            ) : (
              <g stroke="#67e8f9" strokeOpacity="0.30" strokeWidth="0.5">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
                  <line key={"h" + i} x1="20" y1={12 + i * 21} x2="180" y2={12 + i * 21} />
                ))}
                <line x1="100" y1="0" x2="100" y2="300" strokeOpacity="0.5" />
              </g>
            )}
            <rect x="0" width="200" height="26" fill={"url(#" + uid + "-scan)"}>
              <animate attributeName="y" values="-26;300" dur="3.6s" repeatCount="indefinite" />
            </rect>
          </g>

          <path
            d="M100 12c9 0 15 7 15 16 0 7-2 11-5 14 12 3 22 9 26 17 5 10 7 26 8 41 1 10 2 18 3 24l-13 3c-1-8-3-16-5-23l-3 40c0 22 2 44 4 66l-14 2-9-62-9 62-14-2c2-22 4-44 4-66l-3-40c-2 7-4 15-5 23l-13-3c1-6 2-14 3-24 1-15 3-31 8-41 4-8 14-14 26-17-3-3-5-7-5-14 0-9 6-16 15-16z"
            fill="none"
            stroke="#22d3ee"
            strokeOpacity="0.8"
            strokeWidth="1.1"
          />

          {/* corner brackets */}
          <g stroke="#fde047" strokeOpacity="0.55" strokeWidth="1.2" fill="none">
            <path d="M6 22V6h16" />
            <path d="M194 22V6h-16" />
            <path d="M6 278v16h16" />
            <path d="M194 278v16h-16" />
          </g>

          {placed.map((p, i) => (
            <g key={p.key}>
              <path
                d={"M" + p.a[0] + " " + p.a[1] + " L" + (p.side === "L" ? p.a[0] - 16 : p.a[0] + 16) + " " + p.by + " L" + (p.side === "L" ? p.bx + 9 : p.bx - 9) + " " + p.by}
                fill="none"
                stroke="#22d3ee"
                strokeOpacity="0.45"
                strokeWidth="0.7"
                strokeDasharray="3 2"
              >
                <animate attributeName="stroke-dashoffset" values="0;-10" dur="1.4s" repeatCount="indefinite" />
              </path>
              <circle cx={p.a[0]} cy={p.a[1]} r="2.6" fill="#fde047" opacity="0.9">
                <animate attributeName="r" values="2.2;3.4;2.2" dur={2 + (i % 3) * 0.4 + "s"} repeatCount="indefinite" />
              </circle>
              <circle cx={p.a[0]} cy={p.a[1]} r="5.5" fill="none" stroke="#fde047" strokeOpacity="0.35" strokeWidth="0.5" />

              <clipPath id={uid + "-ic" + i}>
                <circle cx={p.bx} cy={p.by} r="7.4" />
              </clipPath>
              <circle cx={p.bx} cy={p.by} r="8.6" fill="#07070c" stroke="#d946ef" strokeOpacity="0.6" strokeWidth="0.9" />
              {p.ly.iconUrl ? (
                <image
                  href={p.ly.iconUrl}
                  x={p.bx - 7.4}
                  y={p.by - 7.4}
                  width="14.8"
                  height="14.8"
                  preserveAspectRatio="xMidYMid slice"
                  clipPath={"url(#" + uid + "-ic" + i + ")"}
                />
              ) : (
                <text
                  x={p.bx}
                  y={p.by + 2.4}
                  textAnchor="middle"
                  fontSize="6.4"
                  fontFamily="ui-monospace, monospace"
                  letterSpacing="0.4"
                  fill="#67e8f9"
                >
                  {(p.ly.slot || "??").slice(0, 3).toUpperCase()}
                </text>
              )}
              <text
                x={p.side === "L" ? p.bx - 10 : p.bx + 10}
                y={p.by + 2.2}
                textAnchor={p.side === "L" ? "end" : "start"}
                fontSize="5.4"
                fontFamily="ui-monospace, monospace"
                letterSpacing="0.8"
                fill="#94a3b8"
              >
                {(p.ly.slot || "").slice(0, 8).toUpperCase()}
              </text>
            </g>
          ))}

          {layers.length === 0 ? (
            <text
              x="100"
              y="292"
              textAnchor="middle"
              fontSize="6.5"
              fontFamily="ui-monospace, monospace"
              letterSpacing="1.6"
              fill="#64748b"
            >
              NO GEAR EQUIPPED
            </text>
          ) : null}
        </svg>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[length:100%_3px] opacity-60" />
        <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-cyan-400/20" />
      </div>
    </div>
  );
}