type StatTooltipProps = { open: boolean; title?: string; lines: { label: string; value: number | string; delta?: number }[]; children?: React.ReactNode };

export const StatTooltip_MIN = {"base":[9,3]};

export function StatTooltip(props: StatTooltipProps) {
  const { open, title, lines, children } = props;
  const uid = useRef("statttip-" + Math.random().toString(36).slice(2)).current;
  const floor = StatTooltip_MIN.base;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  const deltaColor = (d: number) => (d > 0 ? "text-lime-400" : d < 0 ? "text-red-500" : "text-slate-500");
  const fmtDelta = (d: number) => (d > 0 ? "+" + d : "" + d);

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-in{0%{opacity:0;transform:translate(-50%,6px) scale(.94)}60%{opacity:1}100%{opacity:1;transform:translate(-50%,0) scale(1)}}" +
        "@keyframes " + uid + "-out{0%{opacity:1;transform:translate(-50%,0) scale(1)}100%{opacity:0;transform:translate(-50%,4px) scale(.96)}}" +
        "@keyframes " + uid + "-scan{0%{transform:translateY(-120%)}100%{transform:translateY(520%)}}" +
        "@keyframes " + uid + "-row{0%{opacity:0;transform:translateX(-6px)}100%{opacity:1;transform:translateX(0)}}"
      }</style>

      <div className="absolute inset-0 h-full w-full">{children}</div>

      {mounted ? (
        <div
          className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 w-max max-w-[18rem]"
          style={{
            animation: (open ? uid + "-in 220ms cubic-bezier(0.22,1,0.36,1) both" : uid + "-out 200ms ease-out both"),
          }}
        >
          <div className="relative overflow-hidden rounded-lg border border-cyan-400/30 bg-[#0d0d14]/95 bg-[linear-gradient(135deg,rgba(21,15,40,0.92)_0%,rgba(10,10,20,0.96)_100%)] backdrop-blur-sm shadow-[0_0_20px_rgba(34,211,238,0.15),0_0_40px_rgba(217,70,239,0.08)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),transparent)]" style={{ animation: uid + "-scan 2.6s linear infinite" }} />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-yellow-300/70" />

            {title ? (
              <div className="flex h-7 items-center border-b border-cyan-400/30 bg-[linear-gradient(90deg,rgba(6,182,212,0.15)_0%,rgba(217,70,239,0.08)_100%)] px-2">
                <span className="min-w-0 truncate font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-100 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">{title}</span>
              </div>
            ) : null}

            <div className="max-h-[11rem] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-2">
              {lines.length === 0 ? (
                <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">no data</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {lines.map((l, i) => (
                    <div
                      key={"l-" + i}
                      className="flex items-baseline gap-2"
                      style={{ animation: uid + "-row 260ms ease-out both", animationDelay: (i * 35) + "ms" }}
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-medium uppercase tracking-wider text-slate-400">{l.label}</span>
                      <span className="min-w-0 truncate font-mono text-[10px] font-bold tracking-tight text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]">{l.value}</span>
                      {typeof l.delta === "number" ? (
                        <span className={"min-w-0 truncate font-mono text-[10px] font-semibold tracking-wide " + deltaColor(l.delta)}>{fmtDelta(l.delta)}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="absolute left-1/2 top-full -mt-[5px] h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-cyan-400/30 bg-[#0b0b14]" />
        </div>
      ) : null}
    </div>
  );
}