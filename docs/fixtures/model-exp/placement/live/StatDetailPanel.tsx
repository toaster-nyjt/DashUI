type StatDetailPanelProps = {
  entries: { label: string; value: string | number; delta?: number; tone?: "neutral" | "positive" | "negative" }[];
  title?: string;
  visible?: boolean;
};

export const StatDetailPanel_MIN = {"base":[9,4.5]};

export function StatDetailPanel(props: StatDetailPanelProps) {
  const { entries, title, visible } = props;
  const uid = useRef("statdetailpanel-" + Math.random().toString(36).slice(2)).current;
  const shown = visible !== false;
  const floor = StatDetailPanel_MIN.base;

  const toneText = (t?: string) =>
    t === "positive" ? "text-lime-400" : t === "negative" ? "text-red-500" : "text-cyan-50";

  const deltaMeta = (d: number) => {
    if (d > 0) return { c: "text-lime-400 border-lime-400/40 bg-lime-500/15", s: "+" };
    if (d < 0) return { c: "text-red-500 border-red-500/40 bg-red-500/15", s: "" };
    return { c: "text-slate-500 border-slate-500/30 bg-slate-500/10", s: "" };
  };

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        className={
          "relative h-full w-full overflow-hidden rounded-lg border border-cyan-400/30 " +
          "bg-[linear-gradient(135deg,rgba(21,15,40,0.9)_0%,rgba(10,10,20,0.95)_100%)] backdrop-blur-sm " +
          "shadow-[0_0_20px_rgba(34,211,238,0.15),0_0_40px_rgba(217,70,239,0.08)] " +
          "transition-all duration-200 ease-out " +
          (shown ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-1 blur-[2px] pointer-events-none")
        }
      >
        {/* corner ticks */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-yellow-300/70" />
          <div className="absolute right-0 bottom-0 h-3 w-3 border-r-2 border-b-2 border-fuchsia-500/50" />
          <div className="absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.6)_0px,rgba(34,211,238,0.6)_1px,transparent_1px,transparent_4px)]" />
        </div>

        <div className="relative flex h-full w-full flex-col">
          {title ? (
            <div className="flex h-9 w-full items-center gap-2 border-b border-cyan-400/30 px-3 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)]">
              <span className="h-2 w-2 rotate-45 bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
              <span className="min-w-0 truncate font-mono text-xs font-bold uppercase tracking-[0.25em] text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">
                {title}
              </span>
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {entries.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center px-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  no data
                </span>
              </div>
            ) : (
              <div className="flex w-full flex-col">
                {entries.map((e, i) => {
                  const d = e.delta;
                  const hasD = typeof d === "number" && isFinite(d);
                  const dm = hasD ? deltaMeta(d as number) : null;
                  return (
                    <div
                      key={uid + "-row-" + i}
                      className={
                        "group flex w-full items-center gap-2 border-b border-cyan-500/10 p-2 " +
                        "transition-all duration-200 ease-out hover:bg-cyan-500/10"
                      }
                      style={{ animation: "none" }}
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        {e.label}
                      </span>
                      <span
                        className={
                          "min-w-0 truncate font-mono text-sm font-black tracking-tight " +
                          toneText(e.tone) +
                          (e.tone === "positive"
                            ? " drop-shadow-[0_0_6px_rgba(163,230,53,0.5)]"
                            : e.tone === "negative"
                            ? " drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                            : " drop-shadow-[0_0_6px_rgba(34,211,238,0.35)]")
                        }
                      >
                        {e.value}
                      </span>
                      {hasD && dm ? (
                        <span
                          className={
                            "shrink truncate rounded-sm border px-2 py-1 font-mono text-[10px] font-bold leading-none tracking-wider " +
                            dm.c
                          }
                        >
                          {dm.s}
                          {d}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex h-7 w-full items-center justify-between border-t border-cyan-500/20 bg-black/50 px-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400/70">
              {entries.length > 0 ? entries.length + " stats" : "—"}
            </span>
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((k) => (
                <span
                  key={uid + "-dot-" + k}
                  className="h-1 w-3 bg-cyan-400/50"
                  style={{ opacity: 0.25 + k * 0.3 }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}