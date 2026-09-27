type StatLineListProps = { lines: { label: string; value: number | string; delta?: number; tone?: 'neutral' | 'positive' | 'negative' }[] };

export const StatLineList_MIN = {"base":[7,2.75]};

export function StatLineList(props: StatLineListProps) {
  const uid = useRef("statlinelist-" + Math.random().toString(36).slice(2)).current;
  const lines = props.lines || [];

  const toneColor = (t?: string, d?: number) => {
    const tone = t ?? (typeof d === "number" ? (d > 0 ? "positive" : d < 0 ? "negative" : "neutral") : "neutral");
    if (tone === "positive") return { text: "text-lime-400", glow: "rgba(163,230,53,0.55)", bar: "bg-lime-400" };
    if (tone === "negative") return { text: "text-red-500", glow: "rgba(239,68,68,0.55)", bar: "bg-red-500" };
    return { text: "text-yellow-300", glow: "rgba(253,224,71,0.5)", bar: "bg-cyan-400" };
  };

  if (lines.length === 0) {
    return (
      <div className="h-full w-full relative overflow-hidden" style={{ minWidth: StatLineList_MIN.base[0] + "rem", minHeight: StatLineList_MIN.base[1] + "rem" }}>
        <div className="absolute inset-0 flex items-center justify-center rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
          <span className="font-mono font-medium tracking-wider uppercase text-slate-500 text-[10px] leading-none">no data</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: StatLineList_MIN.base[0] + "rem", minHeight: StatLineList_MIN.base[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-in{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}@keyframes " + uid + "-sweep{0%{transform:translateY(-100%)}100%{transform:translateY(600%)}}"}</style>
      <div className="absolute inset-0 rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute left-0 right-0 h-8 opacity-[0.07] bg-[linear-gradient(180deg,transparent,rgba(34,211,238,1),transparent)] pointer-events-none" style={{ animation: uid + "-sweep 5.5s linear infinite" }} />
        <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-col">
            {lines.map((ln, i) => {
              const c = toneColor(ln.tone, ln.delta);
              const hasDelta = typeof ln.delta === "number" && ln.delta !== 0;
              const sign = hasDelta ? ((ln.delta as number) > 0 ? "+" : "−") : "";
              const dmag = hasDelta ? Math.abs(ln.delta as number) : 0;
              return (
                <div
                  key={"sl-" + i + "-" + ln.label}
                  className="relative flex items-center gap-2 px-2 py-1 border-b border-cyan-500/10 transition-all duration-200 ease-out"
                  style={{ animation: uid + "-in 380ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: Math.min(i, 12) * 45 + "ms" }}
                >
                  <span className={"w-[2px] self-stretch rounded-sm " + c.bar} style={{ boxShadow: "0 0 6px " + c.glow }} />
                  <span className="min-w-0 flex-1 truncate font-mono font-medium tracking-wider uppercase text-slate-400 text-[10px] leading-none">
                    {ln.label}
                  </span>
                  {hasDelta ? (
                    <span className={"shrink truncate rounded-sm border border-fuchsia-500/40 bg-fuchsia-500/10 px-1 font-mono font-bold tracking-wide text-[10px] leading-none " + c.text}>
                      {sign + dmag}
                    </span>
                  ) : null}
                  <span
                    className={"shrink truncate font-mono font-black tracking-tight text-[11px] leading-none " + c.text}
                    style={{ textShadow: "0 0 8px " + c.glow }}
                  >
                    {String(ln.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-cyan-400/20 rounded-md" />
      </div>
    </div>
  );
}