type StatReadoutProps = { value: number | string; delta?: number; tone?: "neutral" | "accent" | "danger"; children?: React.ReactNode };

export const StatReadout_MIN = {"base":[3.5,2.2]};

export function StatReadout(props: StatReadoutProps) {
  const { value, delta, tone = "neutral", children } = props;
  const uid = useRef("statreadout-" + Math.random().toString(36).slice(2)).current;
  const floor = StatReadout_MIN.base;

  const T = {
    neutral: { text: "text-cyan-50", accent: "text-cyan-300", line: "rgba(34,211,238,0.55)", glow: "rgba(34,211,238,0.55)", sub: "text-cyan-200/70" },
    accent: { text: "text-fuchsia-200", accent: "text-fuchsia-400", line: "rgba(232,121,249,0.6)", glow: "rgba(232,121,249,0.6)", sub: "text-fuchsia-300/70" },
    danger: { text: "text-rose-200", accent: "text-rose-500", line: "rgba(244,63,94,0.6)", glow: "rgba(244,63,94,0.6)", sub: "text-rose-300/70" }
  }[tone];

  const [pulse, setPulse] = useState(0);
  const prev = useRef<number | string>(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setPulse(function (p) { return p + 1; });
    }
  }, [value]);

  const hasDelta = typeof delta === "number" && !isNaN(delta as number);
  const up = hasDelta && (delta as number) > 0;
  const zero = hasDelta && (delta as number) === 0;
  const deltaTxt = hasDelta ? ((delta as number) > 0 ? "+" : "") + String(delta) : "";
  const deltaColor = zero ? "text-neutral-500" : up ? "text-emerald-400" : "text-rose-400";
  const deltaBorder = zero ? "border-neutral-600/50" : up ? "border-emerald-400/50" : "border-rose-400/50";

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={uid + "-sweep"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={T.glow} stopOpacity="0" />
            <stop offset="50%" stopColor={T.glow} stopOpacity="0.5" />
            <stop offset="100%" stopColor={T.glow} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="1.4" fill={"url(#" + uid + "-sweep)"} />
        <rect x="0" y="98.6" width="100" height="1.4" fill={T.line} opacity="0.35" />
        <rect x="0" y="0" width="0.9" height="100" fill={T.line} opacity="0.45" />
      </svg>

      <div key={"p-" + pulse} className="pointer-events-none absolute inset-0" style={{ animation: "none", boxShadow: "inset 0 0 22px " + T.glow, opacity: 0, animationName: uid + "-flash" }}>
        <style>{"@keyframes " + uid + "-flash{0%{opacity:0.85}100%{opacity:0}}"}</style>
      </div>
      <div key={"pp-" + pulse} className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 22px " + T.glow, animation: uid + "-flash 480ms ease-out forwards", opacity: 0 }} />

      <div className="absolute inset-[7%] flex flex-col min-h-0 min-w-0">
        {children ? (
          <div className="h-[26%] min-h-0 w-full">
            <FitText className={"font-mono font-semibold uppercase tracking-[0.18em] " + T.sub} align="start" wrap={false}>
              {children}
            </FitText>
          </div>
        ) : null}

        <div className="flex flex-1 min-h-0 min-w-0 items-stretch gap-2">
          <div className="flex-1 min-w-0 min-h-0">
            <FitText className={"font-mono font-bold tracking-widest uppercase transition-colors duration-200 " + T.text} align="start" wrap={false}>
              {String(value)}
            </FitText>
          </div>
          {hasDelta ? (
            <div className={"flex w-[26%] max-w-[40%] items-center justify-center border rounded-sm bg-neutral-800/70 transition-all duration-200 " + deltaBorder}>
              <div className="h-[62%] w-[86%] min-h-0 min-w-0">
                <FitText className={"font-mono font-bold tracking-widest uppercase " + deltaColor} wrap={false}>
                  {deltaTxt}
                </FitText>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}