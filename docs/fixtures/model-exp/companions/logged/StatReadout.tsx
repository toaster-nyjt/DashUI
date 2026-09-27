type StatReadoutProps = { value: number | string; delta?: number; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const StatReadout_MIN = {"base":[3.5,2]};

export function StatReadout(props: StatReadoutProps) {
  const { value, delta, tone = "neutral", children } = props;
  const uid = useRef("statreadout-" + Math.random().toString(36).slice(2)).current;
  const floor = StatReadout_MIN.base;

  const TONES: any = {
    neutral: {
      text: "text-cyan-50",
      accent: "text-cyan-300/80",
      ring: "ring-cyan-400/15",
      bar: "from-cyan-400/70 via-cyan-200/40 to-transparent",
      glow: "0 0 10px rgba(34,211,238,0.35)",
      rgb: "34,211,238",
    },
    accent: {
      text: "text-fuchsia-300",
      accent: "text-fuchsia-300/80",
      ring: "ring-fuchsia-400/25",
      bar: "from-fuchsia-500/80 via-purple-400/40 to-transparent",
      glow: "0 0 14px rgba(232,121,249,0.5)",
      rgb: "232,121,249",
    },
    danger: {
      text: "text-rose-400",
      accent: "text-rose-300/80",
      ring: "ring-rose-400/25",
      bar: "from-rose-500/80 via-red-500/40 to-transparent",
      glow: "0 0 14px rgba(244,63,94,0.5)",
      rgb: "244,63,94",
    },
  };
  const t = TONES[tone] || TONES.neutral;

  const [pulse, setPulse] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setPulse((p) => p + 1);
    }
  }, [value]);

  const hasDelta = typeof delta === "number" && !isNaN(delta as number);
  const dPos = hasDelta && (delta as number) > 0;
  const dNeg = hasDelta && (delta as number) < 0;
  const deltaColor = dPos ? "text-emerald-400" : dNeg ? "text-rose-400" : "text-neutral-500";
  const deltaText = hasDelta
    ? (dPos ? "+" : dNeg ? "\u2212" : "\u00B1") + Math.abs(delta as number)
    : "";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-flick{0%{opacity:.25;transform:translateY(-6%) scale(1.06)}35%{opacity:1}55%{opacity:.6}100%{opacity:1;transform:translateY(0) scale(1)}}" +
        "@keyframes " + uid + "-sweep{0%{transform:translateX(-110%)}100%{transform:translateX(110%)}}" +
        "@keyframes " + uid + "-pip{0%,100%{opacity:.35}50%{opacity:1}}"
      }</style>

      {/* recessed plate */}
      <div className={"absolute inset-0 bg-black/60 ring-1 " + t.ring + " shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"} />

      {/* corner notches */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 0 H14 M0 0 V14" stroke={"rgba(" + t.rgb + ",0.55)"} strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" />
        <path d="M100 100 H86 M100 100 V86" stroke={"rgba(" + t.rgb + ",0.55)"} strokeWidth="2" vectorEffect="non-scaling-stroke" fill="none" />
      </svg>

      {/* top accent bar */}
      <div className={"absolute left-0 right-0 top-0 h-[3%] min-h-[2px] bg-gradient-to-r " + t.bar} />

      {/* scan sweep */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -inset-y-2 w-[35%]"
          style={{
            background: "linear-gradient(90deg,transparent,rgba(" + t.rgb + ",0.10),transparent)",
            animation: uid + "-sweep 4.5s linear infinite",
          }}
        />
      </div>

      {/* content */}
      <div className="absolute inset-[7%] flex min-h-0 min-w-0 flex-col">
        <div key={pulse} className="relative min-h-0 min-w-0 flex-1" style={{ animation: uid + "-flick 420ms ease-out" }}>
          <div className="absolute inset-0 flex min-h-0 min-w-0 items-stretch">
            <div className="min-h-0 min-w-0 flex-1">
              <FitText
                className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + t.text}
                wrap={false}
                align={hasDelta ? "start" : "center"}
              >
                {String(value)}
              </FitText>
            </div>
            {hasDelta ? (
              <div className="min-h-0 w-[30%] min-w-0 self-center">
                <FitText className={"font-mono font-bold uppercase tracking-widest " + deltaColor} wrap={false} align="end">
                  {deltaText}
                </FitText>
              </div>
            ) : null}
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 0 0 transparent", textShadow: t.glow }}
          />
        </div>

        {children != null && children !== false ? (
          <div className="mt-[2px] flex min-h-0 min-w-0 items-center gap-1" style={{ height: "34%" }}>
            <div
              className="h-[45%] w-[3px]"
              style={{ background: "rgba(" + t.rgb + ",0.7)", animation: uid + "-pip 2s ease-in-out infinite" }}
            />
            <div className="min-h-0 min-w-0 flex-1">
              <FitText className={"font-mono font-semibold uppercase tracking-[0.18em] " + t.accent} wrap={false} align="start">
                {children}
              </FitText>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}