type StatBarProps = { value: number; min?: number; max?: number; segments?: number; showValue?: boolean; tone?: 'neutral' | 'accent' | 'danger' };

export const StatBar_MIN = {"base":[4,1]};

export function StatBar(props: StatBarProps) {
  const uid = useRef("statbar-" + Math.random().toString(36).slice(2)).current;
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const tone = props.tone ?? "neutral";
  const span = max - min === 0 ? 1 : max - min;
  const raw = (props.value - min) / span;
  const frac = Math.max(0, Math.min(1, isFinite(raw) ? raw : 0));
  const pct = frac * 100;

  const TONES: any = {
    neutral: { a: "#22d3ee", b: "#a5f3fc", glow: "rgba(34,211,238,0.6)", text: "text-cyan-100", ring: "ring-cyan-400/20" },
    accent: { a: "#d946ef", b: "#c084fc", glow: "rgba(232,121,249,0.6)", text: "text-fuchsia-100", ring: "ring-fuchsia-400/20" },
    danger: { a: "#f43f5e", b: "#fb7185", glow: "rgba(244,63,94,0.6)", text: "text-rose-100", ring: "ring-rose-400/20" },
  };
  const t = TONES[tone];

  const segs = props.segments && props.segments > 1 ? Math.floor(props.segments) : 0;

  const floor = (StatBar_MIN as any).base;

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        className={"absolute inset-0 overflow-hidden bg-black/60 border border-cyan-400/20 ring-1 " + t.ring + " shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]"}
      >
        {/* hatch backdrop */}
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <pattern id={uid + "-hatch"} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <rect x="0" y="0" width="1.4" height="6" fill={t.a} opacity="0.10" />
            </pattern>
            <linearGradient id={uid + "-fill"} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={t.a} />
              <stop offset="100%" stopColor={t.b} />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-hatch)"} />
        </svg>

        {/* fill */}
        <div
          className="absolute left-0 top-0 h-full transition-all duration-500 ease-out"
          style={{
            width: pct + "%",
            background: "linear-gradient(90deg," + t.a + "," + t.b + ")",
            boxShadow: "0 0 8px " + t.glow + ", 0 0 18px " + t.glow,
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0) 55%,rgba(0,0,0,0.35))" }}
          />
          <div
            className="absolute inset-y-0 right-0 w-[8%] animate-pulse"
            style={{ background: "linear-gradient(90deg,rgba(255,255,255,0)," + t.b + ")" }}
          />
        </div>

        {/* leading edge marker */}
        {frac > 0.005 && frac < 0.995 ? (
          <div
            className="absolute top-0 h-full w-[2px] transition-all duration-500 ease-out"
            style={{ left: "calc(" + pct + "% - 1px)", background: "#ffffff", opacity: 0.75, boxShadow: "0 0 10px " + t.glow }}
          />
        ) : null}

        {/* segment notches */}
        {segs > 0 ? (
          <div className="absolute inset-0 flex">
            {Array.from({ length: segs }).map((_, i) => (
              <div
                key={"seg-" + i}
                className="h-full flex-1"
                style={{
                  borderRight: i === segs - 1 ? "none" : "1px solid rgba(0,0,0,0.85)",
                  boxShadow: i === segs - 1 ? "none" : "inset -2px 0 0 rgba(255,255,255,0.04)",
                }}
              />
            ))}
          </div>
        ) : null}

        {/* value overlay */}
        {props.showValue ? (
          <div className="absolute inset-y-[14%] left-[3%] right-[3%]">
            <FitText
              className={"font-mono font-bold tracking-widest uppercase " + t.text + " [text-shadow:0_0_6px_rgba(0,0,0,0.95)]"}
              wrap={false}
              align="end"
            >
              {String(Math.round(props.value))}
            </FitText>
          </div>
        ) : null}

        {/* corner ticks */}
        <div className="pointer-events-none absolute left-0 top-0 h-[3px] w-[3px]" style={{ background: t.a, opacity: 0.8 }} />
        <div className="pointer-events-none absolute right-0 bottom-0 h-[3px] w-[3px]" style={{ background: t.a, opacity: 0.8 }} />
      </div>
    </div>
  );
}