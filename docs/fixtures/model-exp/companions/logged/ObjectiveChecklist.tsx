type ObjectiveChecklistProps = { steps: { id: string; label: string; done: boolean; optional?: boolean }[]; activeId?: string | null };

export const ObjectiveChecklist_MIN = {"base":[9,5]};

export function ObjectiveChecklist(props: ObjectiveChecklistProps) {
  const uid = useRef("objchk-" + Math.random().toString(36).slice(2)).current;
  const steps = props.steps || [];
  const total = steps.length;
  const doneCount = steps.reduce(function (a, s) { return a + (s.done ? 1 : 0); }, 0);
  const pct = total > 0 ? (doneCount / total) * 100 : 0;
  const floor = ObjectiveChecklist_MIN.base;

  return (
    <div className="h-full w-full flex flex-col" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <style>{"@keyframes " + uid + "-scan{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}@keyframes " + uid + "-blip{0%,100%{opacity:.35;transform:scale(.82)}50%{opacity:1;transform:scale(1.12)}}@keyframes " + uid + "-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}"}</style>

      {/* progress rail */}
      <div className="relative h-1.5 w-full bg-black/60 border border-cyan-400/20 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 to-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.6)] transition-all duration-500 ease-out"
          style={{ width: pct + "%" }}
        />
        {total > 0 && doneCount < total ? (
          <div
            className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
            style={{ animation: uid + "-scan 2.4s linear infinite" }}
          />
        ) : null}
      </div>

      {/* list */}
      <div className="relative flex-1 min-h-0 min-w-0 mt-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {total === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] leading-tight text-neutral-500">NO OBJECTIVES</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {steps.map(function (s, i) {
              const active = props.activeId != null && props.activeId === s.id && !s.done;
              const accent = s.done
                ? "text-cyan-300"
                : active
                ? "text-amber-300"
                : s.optional
                ? "text-fuchsia-400"
                : "text-cyan-100/70";
              return (
                <div
                  key={s.id}
                  className={
                    "relative flex items-stretch gap-2 pl-1 pr-1 py-1 transition-all duration-200 ease-out " +
                    (active ? "bg-amber-400/10 border-l-2 border-amber-300 " : "border-l-2 border-transparent ") +
                    (s.done ? "opacity-70 " : "")
                  }
                  style={{ animation: uid + "-in 320ms ease-out both", animationDelay: Math.min(i, 10) * 35 + "ms" }}
                >
                  {/* spine + node */}
                  <div className="relative w-4 flex flex-col items-center">
                    {i > 0 ? (
                      <div className={"absolute top-0 h-1/2 w-px " + (s.done ? "bg-cyan-400/50" : "bg-cyan-400/15")} />
                    ) : null}
                    {i < total - 1 ? (
                      <div className={"absolute bottom-0 h-1/2 w-px " + (s.done ? "bg-cyan-400/40" : "bg-cyan-400/15")} />
                    ) : null}
                    <div className="relative my-auto">
                      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="w-4 h-4 overflow-visible">
                        <defs>
                          <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#a5f3fc" />
                          </linearGradient>
                        </defs>
                        <rect
                          x="3" y="3" width="18" height="18"
                          fill={s.done ? "url(#" + uid + "-fill)" : "rgba(0,0,0,0.6)"}
                          stroke={s.done ? "#67e8f9" : active ? "#fcd34d" : s.optional ? "rgba(232,121,249,0.6)" : "rgba(34,211,238,0.35)"}
                          strokeWidth="2"
                          style={{
                            transition: "all 300ms ease-out",
                            filter: s.done
                              ? "drop-shadow(0 0 4px rgba(34,211,238,0.7))"
                              : active
                              ? "drop-shadow(0 0 5px rgba(252,211,77,0.6))"
                              : "none",
                            animation: active ? uid + "-blip 1.4s ease-in-out infinite" : undefined,
                          }}
                        />
                        {s.done ? (
                          <path d="M7 12.5l3.2 3.3L17 8.6" fill="none" stroke="#000" strokeWidth="2.6" strokeLinecap="square" />
                        ) : null}
                      </svg>
                    </div>
                  </div>

                  {/* label */}
                  <div className="flex-1 min-w-0 flex items-center gap-1.5">
                    <span
                      className={
                        "min-w-0 truncate text-xs font-mono leading-none tracking-[0.08em] uppercase transition-colors duration-200 " +
                        accent + (s.done ? " line-through decoration-cyan-400/60" : "") + (active ? " font-bold" : " font-semibold")
                      }
                    >
                      {s.label}
                    </span>
                    {s.optional ? (
                      <span className="shrink text-[10px] font-medium uppercase tracking-[0.15em] leading-none text-fuchsia-400/90 border border-fuchsia-400/40 rounded-full px-1.5 py-0.5 bg-neutral-800/70">
                        OPT
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}