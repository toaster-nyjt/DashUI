type MapLegendProps = { entries: { id: string; label: string; kind: string; visible?: boolean }[]; onToggle?: (id: string, visible: boolean) => void };

export const MapLegend_MIN = {"base":[7,3]};

const MapLegendKindStyle = (kind: string) => {
  const k = (kind || "").toLowerCase();
  if (k === "quest") return { color: "#facc15", shape: "diamond" };
  if (k === "player") return { color: "#22d3ee", shape: "player" };
  if (k === "waypoint") return { color: "#e879f9", shape: "pin" };
  if (k === "poi") return { color: "#a3e635", shape: "square" };
  if (k === "danger" || k === "hostile") return { color: "#ef4444", shape: "triangle" };
  if (k === "vendor" || k === "shop") return { color: "#38bdf8", shape: "square" };
  return { color: "#67e8f9", shape: "dot" };
};

export function MapLegend(props: MapLegendProps) {
  const { entries, onToggle } = props;
  const uid = useRef("maplegend-" + Math.random().toString(36).slice(2)).current;
  const floor = MapLegend_MIN.base;
  const interactive = !!onToggle;

  const Glyph = (p: { kind: string; on: boolean }) => {
    const st = MapLegendKindStyle(p.kind);
    const c = p.on ? st.color : "#475569";
    const gid = uid + "-g-" + p.kind.replace(/[^a-z0-9]/gi, "");
    return (
      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-full w-full transition-all duration-200 ease-out" style={{ filter: p.on ? "drop-shadow(0 0 5px " + c + ")" : "none" }}>
        <defs>
          <radialGradient id={gid} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c} stopOpacity={p.on ? 0.55 : 0.12} />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill={"url(#" + gid + ")"} />
        {st.shape === "diamond" && <path d="M12 3.5 L20.5 12 L12 20.5 L3.5 12 Z" fill={c} fillOpacity={p.on ? 0.85 : 0.35} stroke={c} strokeWidth="1.5" />}
        {st.shape === "square" && <rect x="5.5" y="5.5" width="13" height="13" rx="2" fill={c} fillOpacity={p.on ? 0.7 : 0.25} stroke={c} strokeWidth="1.5" />}
        {st.shape === "triangle" && <path d="M12 4 L20.5 19 L3.5 19 Z" fill={c} fillOpacity={p.on ? 0.7 : 0.25} stroke={c} strokeWidth="1.5" strokeLinejoin="round" />}
        {st.shape === "pin" && <path d="M12 21 C12 21 19 14.2 19 9.8 A7 7 0 0 0 5 9.8 C5 14.2 12 21 12 21 Z" fill={c} fillOpacity={p.on ? 0.55 : 0.2} stroke={c} strokeWidth="1.5" strokeLinejoin="round" />}
        {st.shape === "player" && (
          <g stroke={c} strokeWidth="1.6" fill="none">
            <circle cx="12" cy="12" r="4.2" fill={c} fillOpacity={p.on ? 0.8 : 0.3} />
            <circle cx="12" cy="12" r="8.4" strokeOpacity="0.7" strokeDasharray="4 3">
              {p.on && <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="8s" repeatCount="indefinite" />}
            </circle>
          </g>
        )}
        {st.shape === "dot" && <circle cx="12" cy="12" r="5.5" fill={c} fillOpacity={p.on ? 0.8 : 0.3} stroke={c} strokeWidth="1.5" />}
      </svg>
    );
  };

  return (
    <div className="h-full w-full min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      {entries.length === 0 ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-mono tracking-wider uppercase text-[10px] text-slate-500">no keys</span>
        </div>
      ) : (
        <div className="grid gap-2 p-1" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(6.5rem,1fr))" }}>
          {entries.map((e) => {
            const on = e.visible !== false;
            const st = MapLegendKindStyle(e.kind);
            const inner = (
              <>
                <span className="relative h-4 w-4 shrink" style={{ flex: "0 0 1rem" }}>
                  <Glyph kind={e.kind} on={on} />
                </span>
                <span
                  className={"min-w-0 truncate font-mono font-medium tracking-wider uppercase text-[10px] leading-none transition-all duration-200 ease-out " + (on ? "text-cyan-100" : "text-slate-500 line-through decoration-slate-600")}
                >
                  {e.label}
                </span>
                {interactive && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full transition-all duration-200 ease-out"
                    style={{ background: on ? st.color : "transparent", boxShadow: on ? "0 0 6px " + st.color : "inset 0 0 0 1px rgba(100,116,139,0.6)" }}
                  />
                )}
              </>
            );
            const base = "flex items-center gap-2 rounded-sm border px-2 py-1 transition-all duration-200 ease-out ";
            const skin = on
              ? "border-cyan-500/20 bg-cyan-500/5"
              : "border-slate-700/40 bg-black/40 opacity-70";
            if (!interactive) {
              return (
                <div key={e.id} className={base + skin} style={{ borderLeft: "2px solid " + (on ? st.color : "rgba(71,85,105,0.5)") }}>
                  {inner}
                </div>
              );
            }
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => onToggle && onToggle(e.id, !on)}
                className={base + skin + " text-left hover:bg-cyan-500/15 hover:border-cyan-400/60 active:brightness-90 hover:shadow-[0_0_10px_rgba(34,211,238,0.25)]"}
                style={{ borderLeft: "2px solid " + (on ? st.color : "rgba(71,85,105,0.5)") }}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}