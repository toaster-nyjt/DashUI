type StatBarProps = { value: number; max: number; segments?: number; tone?: 'neutral' | 'accent' | 'warning' | 'danger'; showNumeric?: boolean };

export const StatBar_MIN = {"base":[7,1.5]};

export function StatBar(props: StatBarProps) {
  const uid = useRef("statbar-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";
  const max = props.max > 0 ? props.max : 1;
  const raw = props.value / max;
  const frac = Math.max(0, Math.min(1, isFinite(raw) ? raw : 0));

  const TONES: any = {
    neutral: { a: "#22d3ee", b: "#67e8f9", text: "text-cyan-300", glow: "rgba(34,211,238,0.7)" },
    accent: { a: "#fde047", b: "#fef08a", text: "text-yellow-300", glow: "rgba(253,224,71,0.7)" },
    warning: { a: "#f59e0b", b: "#fbbf24", text: "text-amber-400", glow: "rgba(245,158,11,0.7)" },
    danger: { a: "#f43f5e", b: "#fb7185", text: "text-rose-500", glow: "rgba(244,63,94,0.7)" }
  };
  const t = TONES[tone];
  const seg = props.segments && props.segments > 0 ? Math.floor(props.segments) : 0;

  const fillStyle: any = {
    background: "linear-gradient(90deg," + t.a + " 0%," + t.b + " 100%)",
    boxShadow: "0 0 10px " + t.glow + ", inset 0 0 6px rgba(255,255,255,0.35)"
  };

  const bar = (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
      {seg > 0 ? (
        <div className="absolute inset-[8%] flex items-stretch gap-[2px]">
          {Array.from({ length: seg }).map((_, i) => {
            const local = Math.max(0, Math.min(1, frac * seg - i));
            return (
              <div key={"sg-" + i} className="relative min-w-0 flex-1 overflow-hidden rounded-[2px] bg-cyan-400/5 border border-cyan-400/10">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500 ease-in-out"
                  style={Object.assign({ width: (local * 100) + "%", opacity: local > 0 ? 1 : 0 }, fillStyle)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="absolute inset-0 opacity-[0.25]" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 5px, rgba(34,211,238,0.35) 5px 6px)" }} />
          <div
            className="absolute inset-y-0 left-0 transition-[width,background-color] duration-500 ease-in-out"
            style={Object.assign({ width: (frac * 100) + "%" }, fillStyle)}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(0,0,0,0.5) 0 3px, transparent 3px 8px)" }}
            />
          </div>
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white/80 transition-[left] duration-500 ease-in-out"
            style={{ left: "calc(" + (frac * 100) + "% - 1px)", boxShadow: "0 0 8px " + t.glow, opacity: frac > 0.01 ? 1 : 0 }}
          />
          <div className="absolute inset-x-0 top-0 h-[35%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        </>
      )}
      <div className="absolute inset-0 rounded-md pointer-events-none" style={{ boxShadow: frac >= 0.999 ? "inset 0 0 14px " + t.glow : "none" }} />
    </div>
  );

  return (
    <div className="h-full w-full flex items-stretch gap-2" style={{ minWidth: StatBar_MIN.base[0] + "rem", minHeight: StatBar_MIN.base[1] + "rem" }}>
      <div className="relative flex-1 min-w-0 h-full">{bar}</div>
      {props.showNumeric ? (
        <div className="relative h-full w-[30%] max-w-[7rem] min-w-0">
          <div className="absolute inset-y-[10%] inset-x-0">
            <FitText wrap={false} align="end" className={"font-mono font-black tracking-tighter " + t.text + " drop-shadow-[0_0_8px_rgba(253,224,71,0.35)]"}>
              {Math.round(props.value) + "/" + Math.round(max)}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}