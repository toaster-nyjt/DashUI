type StatReadoutProps = { value: number | string; delta?: number; tone?: "neutral" | "accent" | "danger"; children?: React.ReactNode };

export function StatReadout(props: StatReadoutProps) {
  const tone = props.tone || "neutral";
  const uid = useRef("statreadout-" + Math.random().toString(36).slice(2)).current;
  const floor = (StatReadout_MIN as any).base;

  const T: any = {
    neutral: {
      text: "text-cyan-50",
      accent: "text-cyan-300",
      line: "rgba(34,211,238,0.55)",
      glow: "rgba(34,211,238,0.5)",
      ring: "ring-cyan-400/25",
      chip: "border-cyan-400/40 text-cyan-200",
    },
    accent: {
      text: "text-fuchsia-200",
      accent: "text-fuchsia-400",
      line: "rgba(232,121,249,0.6)",
      glow: "rgba(232,121,249,0.55)",
      ring: "ring-fuchsia-400/30",
      chip: "border-fuchsia-400/50 text-fuchsia-300",
    },
    danger: {
      text: "text-rose-200",
      accent: "text-rose-500",
      line: "rgba(244,63,94,0.6)",
      glow: "rgba(244,63,94,0.55)",
      ring: "ring-rose-400/30",
      chip: "border-rose-400/50 text-rose-300",
    },
  };
  const t = T[tone];

  const [flash, setFlash] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setFlash(function (f) { return f + 1; });
  }, [props.value]);

  const d = props.delta;
  const hasDelta = typeof d === "number" && isFinite(d);
  const up = hasDelta && (d as number) > 0;
  const zero = hasDelta && (d as number) === 0;
  const deltaTxt = hasDelta ? (up ? "+" : zero ? "±" : "−") + Math.abs(d as number) : "";
  const deltaColor = zero ? "text-neutral-500 border-neutral-600/50" : up ? "text-emerald-400 border-emerald-400/50" : "text-rose-400 border-rose-400/50";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-fl{0%{opacity:.85;transform:scale(1.035)}100%{opacity:0;transform:scale(1)}}@keyframes " + uid + "-sw{0%{transform:translateY(-120%)}100%{transform:translateY(420%)}}"}</style>

      {/* recessed face */}
      <div className={"absolute inset-0 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 " + t.ring + " rounded-sm overflow-hidden"}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id={uid + "-g"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.line} stopOpacity="0.18" />
              <stop offset="100%" stopColor={t.line} stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-g)"} />
          <path d="M0 0 H14 M0 0 V16" stroke={t.line} strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
          <path d="M100 100 H86 M100 100 V84" stroke={t.line} strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* scan sweep */}
        <div
          className="pointer-events-none absolute inset-x-0 h-[18%] opacity-[0.12]"
          style={{ background: "linear-gradient(to bottom, transparent, " + t.line + ", transparent)", animation: uid + "-sw 4.5s linear infinite" }}
        />
        {/* value change flash */}
        <div
          key={"fl-" + flash}
          className="pointer-events-none absolute inset-0"
          style={ flash ? { background: "radial-gradient(circle at 50% 50%, " + t.glow + ", transparent 70%)", animation: uid + "-fl 520ms ease-out forwards" } : { opacity: 0 } }
        />
      </div>

      {/* content */}
      <div className="absolute inset-[7%] flex flex-col min-h-0 min-w-0">
        <div className="flex-1 min-h-0 min-w-0 flex items-stretch gap-1">
          <div className="flex-1 min-h-0 min-w-0">
            <FitText className={"font-mono font-bold tracking-widest uppercase transition-all duration-200 ease-out " + t.accent} wrap={false}>
              {String(props.value)}
            </FitText>
          </div>
          {hasDelta ? (
            <div className={"self-start shrink w-[28%] max-w-[34%] min-h-0 h-[42%] flex items-center justify-center border rounded-full bg-neutral-800/70 " + deltaColor}>
              <div className="absolute-0 h-[70%] w-[86%]">
                <FitText className="font-mono font-bold tracking-widest uppercase" wrap={false}>{deltaTxt}</FitText>
              </div>
            </div>
          ) : null}
        </div>
        {props.children != null && props.children !== false ? (
          <div className="h-[30%] min-h-0 min-w-0 mt-[2px] flex items-stretch">
            <div className="flex-1 min-h-0 min-w-0">
              <FitText className={"font-mono font-semibold uppercase tracking-[0.18em] opacity-80 " + t.text} wrap={false} align="center">
                {props.children}
              </FitText>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const StatReadout_MIN = {"base":[3.5,2.25]};