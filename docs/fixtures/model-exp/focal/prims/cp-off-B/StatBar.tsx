type StatBarProps = { value: number; max: number; segments?: number; tone?: "neutral" | "accent" | "warning" | "danger"; showNumeric?: boolean };

export const StatBar_MIN = {"base":[6,1.5]};

export function StatBar(props: StatBarProps) {
  const uid = useRef("statbar-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";
  const max = props.max > 0 ? props.max : 1;
  const raw = props.value / max;
  const frac = Math.max(0, Math.min(1, isFinite(raw) ? raw : 0));

  const TONES: any = {
    neutral: { a: "#22d3ee", b: "#67e8f9", glow: "rgba(34,211,238,0.7)", text: "text-cyan-200" },
    accent: { a: "#fde047", b: "#fef08a", glow: "rgba(253,224,71,0.7)", text: "text-yellow-300" },
    warning: { a: "#f59e0b", b: "#fcd34d", glow: "rgba(245,158,11,0.7)", text: "text-amber-300" },
    danger: { a: "#f43f5e", b: "#fb7185", glow: "rgba(244,63,94,0.75)", text: "text-rose-400" }
  };
  const t = TONES[tone];
  const seg = props.segments && props.segments > 0 ? Math.floor(props.segments) : 0;

  const filledSegs = seg ? Math.round(frac * seg) : 0;

  const barArea = (
    <div className="relative h-full w-full min-w-0 overflow-hidden rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
      {seg ? (
        <div className="absolute inset-[8%] flex items-stretch gap-[2px]">
          {Array.from({ length: seg }).map((_, i) => {
            const on = i < filledSegs;
            return (
              <div
                key={"seg-" + i}
                className="flex-1 min-w-0 rounded-[1px] transition-all duration-300 ease-out"
                style={{
                  background: on ? "linear-gradient(180deg," + t.b + "," + t.a + ")" : "rgba(255,255,255,0.05)",
                  boxShadow: on ? "0 0 8px " + t.glow : "inset 0 0 6px rgba(0,0,0,0.9)",
                  opacity: on ? 1 : 0.6,
                  transitionDelay: (i * 18) + "ms"
                }}
              />
            );
          })}
        </div>
      ) : (
        <>
          <div
            className="absolute left-0 top-0 h-full transition-[width] duration-500 ease-in-out"
            style={{
              width: (frac * 100) + "%",
              background: "linear-gradient(90deg," + t.a + "," + t.b + ")",
              boxShadow: "0 0 10px " + t.glow
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "repeating-linear-gradient(115deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 2px, transparent 2px, transparent 6px)"
              }}
            />
            <div className="absolute inset-y-0 right-0 w-[3px] bg-white/80 animate-pulse" style={{ boxShadow: "0 0 10px " + t.glow }} />
          </div>
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent 9%, rgba(34,211,238,0.18) 9%, rgba(34,211,238,0.18) calc(9% + 1px))" }}
          />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-md" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }} />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
        <defs>
          <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100" height="10" fill={"url(#" + uid + "-sheen)"} />
      </svg>
    </div>
  );

  return (
    <div className="flex h-full w-full items-stretch gap-2" style={{ minWidth: StatBar_MIN.base[0] + "rem", minHeight: StatBar_MIN.base[1] + "rem" }}>
      <div className="relative min-w-0 flex-1">{barArea}</div>
      {props.showNumeric ? (
        <div className="relative h-full w-[28%] max-w-[9rem] min-w-0">
          <div className="absolute inset-y-[10%] left-0 right-0">
            <FitText wrap={false} className={"font-mono font-black tracking-tighter " + t.text + " drop-shadow-[0_0_8px_rgba(253,224,71,0.4)] transition-colors duration-300"} align="end">
              {Math.round(props.value) + "/" + Math.round(max)}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}