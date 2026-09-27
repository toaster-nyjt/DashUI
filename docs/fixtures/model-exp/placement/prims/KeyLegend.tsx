type KeyLegendProps = { entries: { id: string; label: string; kind?: string }[] };

const KeyLegendTone = (kind?: string) => {
  switch ((kind || "").toLowerCase()) {
    case "quest": return "#fde047";
    case "poi": case "point-of-interest": case "pointofinterest": return "#22d3ee";
    case "player": return "#a3e635";
    case "waypoint": return "#e879f9";
    case "district": case "district-label": return "#94a3b8";
    case "route": return "#38bdf8";
    case "danger": case "hostile": return "#ef4444";
    case "vendor": case "shop": return "#fbbf24";
    default: return "#67e8f9";
  }
};

function KeyLegendGlyph(p: { kind?: string; color: string; uid: string; i: number }) {
  const k = (p.kind || "").toLowerCase();
  const c = p.color;
  const common = { stroke: c, fill: "none", strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  let shape: any;
  if (k === "quest") {
    shape = (
      <g>
        <path d="M12 3.2 L14.6 9.2 L21 9.9 L16.3 14.2 L17.7 20.6 L12 17.3 L6.3 20.6 L7.7 14.2 L3 9.9 L9.4 9.2 Z" {...common} fill={c} fillOpacity={0.25} />
      </g>
    );
  } else if (k === "player") {
    shape = (
      <g>
        <circle cx="12" cy="12" r="9" stroke={c} strokeOpacity={0.5} fill="none" strokeWidth={1.2}>
          <animate attributeName="r" values="6;10;6" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <path d="M12 4 L17 19 L12 15.4 L7 19 Z" fill={c} stroke={c} strokeWidth={1.2} strokeLinejoin="round" />
      </g>
    );
  } else if (k === "waypoint") {
    shape = (
      <g>
        <path d="M12 21.5 C12 21.5 19 14.6 19 9.6 A7 7 0 0 0 5 9.6 C5 14.6 12 21.5 12 21.5 Z" {...common} fill={c} fillOpacity={0.2} />
        <circle cx="12" cy="9.6" r="2.4" fill={c} />
      </g>
    );
  } else if (k === "district" || k === "district-label") {
    shape = (
      <g>
        <rect x="3.5" y="6.5" width="17" height="11" rx="1.5" {...common} strokeDasharray="3 2.4" fill={c} fillOpacity={0.1}>
          <animate attributeName="stroke-dashoffset" values="0;-10.8" dur="1.8s" repeatCount="indefinite" />
        </rect>
        <path d="M7.5 12 H16.5" stroke={c} strokeWidth={1.4} strokeLinecap="round" />
      </g>
    );
  } else if (k === "route") {
    shape = (
      <path d="M3 18 C7 18 7 9 12 9 C17 9 17 6 21 6" {...common} strokeWidth={2} strokeDasharray="4 3">
        <animate attributeName="stroke-dashoffset" values="14;0" dur="1.1s" repeatCount="indefinite" />
      </path>
    );
  } else if (k === "danger" || k === "hostile") {
    shape = (
      <g>
        <path d="M12 3.6 L21 19.4 H3 Z" {...common} fill={c} fillOpacity={0.18} />
        <path d="M12 9.4 V14" stroke={c} strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="12" cy="16.6" r="1" fill={c} />
      </g>
    );
  } else if (k === "poi" || k === "point-of-interest" || k === "pointofinterest") {
    shape = (
      <g>
        <circle cx="12" cy="12" r="7.2" {...common} fill={c} fillOpacity={0.14} />
        <circle cx="12" cy="12" r="2.6" fill={c} />
        <path d="M12 1.8 V4.4 M12 19.6 V22.2 M1.8 12 H4.4 M19.6 12 H22.2" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeOpacity={0.8} />
      </g>
    );
  } else {
    shape = (
      <g>
        <rect x="5" y="5" width="14" height="14" rx="2" {...common} fill={c} fillOpacity={0.22} />
        <path d="M8.6 12 L11 14.4 L15.6 9.6" stroke={c} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  }
  return (
    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-full w-full" style={{ filter: "drop-shadow(0 0 5px " + c + "88)" }}>
      {shape}
    </svg>
  );
}

export const KeyLegend_MIN = {"base":[6,3.2]};

export function KeyLegend(props: KeyLegendProps) {
  const uid = useRef("keylegend-" + Math.random().toString(36).slice(2)).current;
  const floor = KeyLegend_MIN.base;
  const entries = props.entries || [];

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-md bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/20 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.35] pointer-events-none bg-[repeating-linear-gradient(180deg,rgba(34,211,238,0.06)_0px,rgba(34,211,238,0.06)_1px,transparent_1px,transparent_4px)]" />
        <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-cyan-400/60 via-fuchsia-500/40 to-transparent" />
        {entries.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono font-normal tracking-wide text-slate-500 text-[10px] leading-tight uppercase">no key data</span>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              className="grid gap-2 p-2"
              style={{ gridTemplateColumns: "repeat(auto-fill,minmax(6.5rem,1fr))" }}
            >
              {entries.map((e, i) => {
                const c = KeyLegendTone(e.kind);
                return (
                  <div
                    key={e.id || ("k-" + i)}
                    className="flex items-center gap-2 rounded-sm border-l-2 bg-black/40 pl-1.5 pr-1 py-1 transition-all duration-200 ease-out"
                    style={{ borderLeftColor: c, boxShadow: "inset 0 0 12px " + c + "14", animation: "none" }}
                  >
                    <div className="h-4 w-4 shrink-0" style={{ width: "1rem", height: "1rem" }}>
                      <KeyLegendGlyph kind={e.kind} color={c} uid={uid} i={i} />
                    </div>
                    <span
                      className="min-w-0 truncate font-mono font-medium tracking-wider uppercase text-[10px] leading-none"
                      style={{ color: c, opacity: 0.92 }}
                    >
                      {e.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}