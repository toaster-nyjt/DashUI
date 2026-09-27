type ChecklistDisplayProps = { items: { id: string; label: string; state: 'done' | 'active' | 'pending'; optional?: boolean }[] };

export const ChecklistDisplay_MIN = {"base":[9,4]};

export function ChecklistDisplay(props: ChecklistDisplayProps) {
  const uid = useRef("checklistdisplay-" + Math.random().toString(36).slice(2)).current;
  const items = props.items || [];
  const floor = ChecklistDisplay_MIN.base;

  const CDMark = (p: { state: string }) => {
    const s = p.state;
    return (
      <svg viewBox="0 0 24 24" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={uid + "-g-" + s}>
            <stop offset="0%" stopColor={s === "done" ? "#a3e635" : s === "active" ? "#fde047" : "#22d3ee"} stopOpacity={s === "pending" ? "0.18" : "0.55"} />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill={"url(#" + uid + "-g-" + s + ")"} />
        {s === "active" ? (
          <>
            <circle cx="12" cy="12" r="9" fill="none" stroke="#fde047" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="4 3">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="6s" repeatCount="indefinite" />
            </circle>
            <path d="M12 4.5 L19.5 12 L12 19.5 L4.5 12 Z" fill="none" stroke="#fde047" strokeWidth="1.6" />
            <path d="M12 8 L16 12 L12 16 L8 12 Z" fill="#fde047">
              <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />
            </path>
          </>
        ) : s === "done" ? (
          <>
            <path d="M12 4 L19.5 12 L12 20 L4.5 12 Z" fill="rgba(163,230,53,0.15)" stroke="#a3e635" strokeWidth="1.4" />
            <path d="M7.8 12.2 L10.8 15.2 L16.3 8.8" fill="none" stroke="#a3e635" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
          </>
        ) : (
          <>
            <path d="M12 5 L19 12 L12 19 L5 12 Z" fill="none" stroke="#64748b" strokeOpacity="0.8" strokeWidth="1.3" strokeDasharray="2.5 2.5" />
            <circle cx="12" cy="12" r="1.8" fill="#475569" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="h-full w-full relative" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div className="absolute inset-0 rounded-md bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/20 overflow-hidden">
        {items.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="font-mono tracking-[0.25em] uppercase text-[10px] text-slate-500">no objectives</div>
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="relative flex flex-col py-1">
              <div className="absolute left-[1.15rem] top-2 bottom-2 w-px bg-gradient-to-b from-lime-400/40 via-cyan-400/25 to-transparent" />
              {items.map((it, i) => {
                const st = it.state;
                const color =
                  st === "done" ? "text-lime-400/80" : st === "active" ? "text-yellow-300" : "text-slate-500";
                return (
                  <div
                    key={it.id}
                    className={
                      "relative flex items-center gap-2 px-2 py-2 transition-all duration-200 ease-out " +
                      (st === "active"
                        ? "bg-[linear-gradient(90deg,rgba(253,224,71,0.12)_0%,rgba(253,224,71,0)_80%)] border-l-2 border-yellow-300/70"
                        : st === "done"
                        ? "border-l-2 border-lime-400/30"
                        : "border-l-2 border-transparent")
                    }
                  >
                    <div className="h-4 w-4 relative z-10 drop-shadow-[0_0_6px_currentColor] text-transparent">
                      <CDMark state={st} />
                    </div>
                    <div className="min-w-0 flex-1 flex items-baseline gap-2">
                      <div
                        className={
                          "min-w-0 truncate font-mono tracking-wide text-[11px] leading-tight transition-all duration-200 ease-out " +
                          (st === "done"
                            ? "text-slate-400 line-through decoration-lime-400/50"
                            : st === "active"
                            ? "text-cyan-50 uppercase font-semibold drop-shadow-[0_0_6px_rgba(253,224,71,0.35)]"
                            : "text-slate-500")
                        }
                      >
                        {it.label}
                      </div>
                      {it.optional ? (
                        <div className="font-mono uppercase tracking-[0.2em] text-[9px] leading-none text-fuchsia-400 border border-fuchsia-500/40 rounded-sm px-1 py-[2px]">
                          opt
                        </div>
                      ) : null}
                    </div>
                    <div className={"font-mono text-[9px] leading-none tracking-widest tabular-nums " + color}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
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