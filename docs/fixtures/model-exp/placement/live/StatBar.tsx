type StatBarProps = { value: number; max: number; segments?: number; showValue?: boolean; tone?: 'neutral' | 'accent' | 'danger' | 'warning'; animated?: boolean };

export const StatBar_MIN = {"base":[6,1.25]};

export function StatBar(props: StatBarProps) {
  const uid = useRef("statbar-" + Math.random().toString(36).slice(2)).current;
  const max = props.max > 0 ? props.max : 1;
  const value = Math.max(0, Math.min(max, props.value));
  const pct = (value / max) * 100;
  const tone = props.tone || "neutral";
  const animated = !!props.animated;

  const TONES: any = {
    neutral: { fill: "#22d3ee", soft: "rgba(34,211,238,0.18)", edge: "rgba(34,211,238,0.45)", text: "text-cyan-100" },
    accent: { fill: "#fde047", soft: "rgba(253,224,71,0.16)", edge: "rgba(253,224,71,0.5)", text: "text-yellow-300" },
    danger: { fill: "#ef4444", soft: "rgba(239,68,68,0.16)", edge: "rgba(239,68,68,0.5)", text: "text-red-400" },
    warning: { fill: "#fbbf24", soft: "rgba(251,191,36,0.16)", edge: "rgba(251,191,36,0.5)", text: "text-amber-300" }
  };
  const T = TONES[tone];

  const segs = props.segments && props.segments > 0 ? Math.floor(props.segments) : 0;
  const filledExact = segs ? (value / max) * segs : 0;

  const floor = (StatBar_MIN as any).base;

  const blocks = [];
  if (segs) {
    for (let i = 0; i < segs; i++) {
      const f = Math.max(0, Math.min(1, filledExact - i));
      blocks.push(
        <div
          key={"blk-" + i}
          className="relative h-full flex-1 min-w-0 overflow-hidden rounded-[2px] transition-all duration-300 ease-out"
          style={{
            background: "#07070c",
            boxShadow: "inset 0 1px 4px rgba(0,0,0,0.85)",
            border: "1px solid " + (f > 0 ? T.edge : "rgba(34,211,238,0.14)")
          }}
        >
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              width: (f * 100) + "%",
              background: "linear-gradient(180deg," + T.fill + " 0%, " + T.fill + "cc 55%, rgba(0,0,0,0.35) 100%)",
              boxShadow: f > 0 ? "0 0 8px " + T.edge : "none",
              opacity: f > 0 ? 1 : 0
            }}
          />
          {f > 0 && animated ? (
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: "linear-gradient(90deg,transparent 0%," + T.soft + " 50%,transparent 100%)" }}
            />
          ) : null}
        </div>
      );
    }
  }

  const ticks = [];
  for (let i = 1; i < 8; i++) {
    ticks.push(
      <div
        key={"tk-" + i}
        className="absolute inset-y-0"
        style={{ left: (i * 12.5) + "%", width: "1px", background: "rgba(0,0,0,0.55)" }}
      />
    );
  }

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-sweep{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}@keyframes " + uid + "-flick{0%,100%{opacity:1}47%{opacity:.82}49%{opacity:1}}"}</style>

      <div className="absolute inset-0 flex items-stretch">
        {segs ? (
          <div className="flex h-full w-full items-stretch gap-[3px]">{blocks}</div>
        ) : (
          <div
            className="relative h-full w-full overflow-hidden rounded-md"
            style={{
              background: "#07070c",
              border: "1px solid rgba(34,211,238,0.2)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.8)"
            }}
          >
            <div className="absolute inset-0 opacity-60">{ticks}</div>

            <div
              className="absolute inset-y-[1px] left-[1px] rounded-[3px] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                width: "calc(" + pct + "% - 2px)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, " + T.fill + " 22%, " + T.fill + " 62%, rgba(0,0,0,0.45) 100%)",
                boxShadow: "0 0 12px " + T.edge + ", inset 0 0 6px rgba(255,255,255,0.15)",
                animation: animated ? uid + "-flick 2.6s steps(1,end) infinite" : undefined,
                opacity: pct > 0 ? 1 : 0
              }}
            >
              {animated ? (
                <div
                  className="absolute inset-y-0 w-1/4"
                  style={{
                    background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)",
                    animation: uid + "-sweep 2.2s linear infinite"
                  }}
                />
              ) : null}
            </div>

            {pct > 0 && pct < 100 ? (
              <div
                className="absolute inset-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  left: "calc(" + pct + "% - 1px)",
                  width: "2px",
                  background: "#fff",
                  opacity: 0.85,
                  boxShadow: "0 0 8px " + T.edge
                }}
              />
            ) : null}

            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "repeating-linear-gradient(0deg,rgba(0,0,0,0.22) 0px,rgba(0,0,0,0.22) 1px,transparent 1px,transparent 3px)" }}
            />
          </div>
        )}
      </div>

      {props.showValue ? (
        <div className="pointer-events-none absolute inset-y-[14%] right-[2%] left-[40%] flex items-center justify-end">
          <div className="h-full w-full">
            <FitText
              wrap={false}
              align="end"
              className={"font-mono font-black tracking-tight drop-shadow-[0_0_6px_rgba(0,0,0,0.9)] " + T.text}
            >
              {Math.round(value) + "/" + Math.round(max)}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}