type StatReadoutProps = { value: number | string; delta?: number; tone?: 'neutral' | 'accent' | 'danger'; children?: React.ReactNode };

export const StatReadout_MIN = {"base":[3.5,2.25]};

export function StatReadout(props: StatReadoutProps) {
  const { value, delta, tone = 'neutral', children } = props;
  const uid = useRef("statreadout-" + Math.random().toString(36).slice(2)).current;
  const floor = StatReadout_MIN.base;

  const palette =
    tone === 'accent'
      ? { text: "text-fuchsia-300", dim: "text-fuchsia-200/60", stroke: "rgba(232,121,249,0.55)", glow: "rgba(232,121,249,0.55)", bar: "from-fuchsia-500 to-purple-400" }
      : tone === 'danger'
      ? { text: "text-rose-400", dim: "text-rose-200/60", stroke: "rgba(244,63,94,0.55)", glow: "rgba(244,63,94,0.55)", bar: "from-rose-500 to-red-400" }
      : { text: "text-cyan-300", dim: "text-cyan-200/60", stroke: "rgba(34,211,238,0.5)", glow: "rgba(34,211,238,0.5)", bar: "from-cyan-400 to-cyan-200" };

  const prev = useRef<number | string>(value);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setPulse((p) => p + 1);
    }
  }, [value]);

  const hasDelta = typeof delta === "number" && !isNaN(delta as number);
  const d = hasDelta ? (delta as number) : 0;
  const deltaUp = d > 0;
  const deltaZero = d === 0;
  const deltaColor = deltaZero ? "text-neutral-500" : deltaUp ? "text-emerald-400" : "text-rose-400";
  const deltaTxt = (deltaUp ? "+" : d < 0 ? "−" : "±") + Math.abs(d);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* recessed face */}
      <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/10" />
      {/* scanlines */}
      <div
        className="absolute inset-0 opacity-[0.20]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 4px)",
        }}
      />
      {/* tone wash */}
      <div
        className="absolute inset-0 transition-all duration-200 ease-out"
        style={{ background: "linear-gradient(135deg," + palette.stroke.replace("0.5", "0.10").replace("0.55", "0.10") + " 0%, transparent 55%)" }}
      />
      {/* value-change flash */}
      <div
        key={"flash-" + pulse}
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent, " + palette.glow + ", transparent)",
          opacity: 0,
          animation: pulse ? uid + "-sweep 520ms ease-out" : "none",
        }}
      />
      <style>
        {"@keyframes " + uid + "-sweep{0%{opacity:0;transform:translateX(-60%)}25%{opacity:.35}100%{opacity:0;transform:translateX(60%)}}" +
          "@keyframes " + uid + "-rise{0%{opacity:0;transform:translateY(35%)}60%{opacity:1}100%{opacity:1;transform:translateY(0)}}"}
      </style>

      {/* corner brackets */}
      <svg className="pointer-events-none absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 14 L0 0 L14 0" fill="none" stroke={palette.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d="M86 0 L100 0 L100 14" fill="none" stroke={palette.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d="M100 86 L100 100 L86 100" fill="none" stroke={palette.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <path d="M14 100 L0 100 L0 86" fill="none" stroke={palette.stroke} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* content */}
      <div className="absolute inset-[7%] flex min-h-0 min-w-0 flex-col gap-[2px]">
        <div className="flex min-h-0 min-w-0 flex-[5] items-stretch gap-1">
          <div key={"v-" + pulse} className="min-h-0 min-w-0 flex-1" style={{ animation: pulse ? uid + "-rise 300ms ease-out" : "none" }}>
            <FitText
              wrap={false}
              align="center"
              className={"font-mono font-bold uppercase tracking-widest transition-colors duration-200 " + palette.text}
            >
              {String(value)}
            </FitText>
          </div>
          {hasDelta ? (
            <div className="flex w-[30%] max-w-[6rem] min-w-0 items-center justify-center">
              <div
                className={
                  "flex h-full w-full items-center justify-center border px-1 " +
                  (deltaZero
                    ? "border-neutral-600/40 bg-neutral-800/50"
                    : deltaUp
                    ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.35)]"
                    : "border-rose-400/50 bg-rose-600/10 shadow-[0_0_10px_rgba(244,63,94,0.35)]")
                }
              >
                <div className="h-full w-full min-h-0 min-w-0">
                  <FitText wrap={false} align="center" className={"font-mono font-bold tracking-widest " + deltaColor}>
                    {deltaTxt}
                  </FitText>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* accent rule */}
        <div className="relative h-[2px] w-full overflow-hidden bg-black/70">
          <div className={"absolute inset-0 bg-gradient-to-r " + palette.bar + " shadow-[0_0_8px_rgba(34,211,238,0.45)]"} />
        </div>

        {children != null && children !== false ? (
          <div className="min-h-0 min-w-0 flex-[2]">
            <FitText
              align="center"
              className={"font-mono font-semibold uppercase tracking-[0.18em] transition-colors duration-200 " + palette.dim}
            >
              {children}
            </FitText>
          </div>
        ) : null}
      </div>
    </div>
  );
}