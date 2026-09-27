type StatBarProps = { value: number; max: number; segments?: number; tone?: 'neutral' | 'accent' | 'warning' | 'danger'; showNumeric?: boolean };

export const StatBar_MIN = {"base":[6,1.5]};

const StatBarTones = {
  neutral: { a: "rgba(34,211,238,1)", b: "rgba(103,232,249,1)", dim: "rgba(34,211,238,0.22)", text: "text-cyan-300", glow: "rgba(34,211,238,0.7)" },
  accent: { a: "rgba(253,224,71,1)", b: "rgba(254,240,138,1)", dim: "rgba(253,224,71,0.22)", text: "text-yellow-300", glow: "rgba(253,224,71,0.65)" },
  warning: { a: "rgba(245,158,11,1)", b: "rgba(252,211,77,1)", dim: "rgba(245,158,11,0.22)", text: "text-amber-400", glow: "rgba(245,158,11,0.6)" },
  danger: { a: "rgba(244,63,94,1)", b: "rgba(253,164,175,1)", dim: "rgba(244,63,94,0.22)", text: "text-rose-500", glow: "rgba(244,63,94,0.65)" }
};

export function StatBar(props: StatBarProps) {
  const uid = useRef("statbar-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";
  const T = (StatBarTones as any)[tone] || StatBarTones.neutral;
  const max = props.max > 0 ? props.max : 1;
  const raw = props.value / max;
  const frac = Math.max(0, Math.min(1, isFinite(raw) ? raw : 0));
  const floor = StatBar_MIN.base;

  const prev = useRef(frac);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (Math.abs(prev.current - frac) > 0.0005) {
      prev.current = frac;
      setPulse(function (p) { return p + 1; });
    }
  }, [frac]);

  const seg = props.segments && props.segments > 0 ? Math.floor(props.segments) : 0;
  const numTxt = String(Math.round(props.value)) + "/" + String(Math.round(max));

  const ticks = [];
  for (let i = 1; i < 10; i++) ticks.push(i);

  const cells = [];
  if (seg > 0) {
    for (let i = 0; i < seg; i++) {
      const lo = i / seg;
      const cellFill = Math.max(0, Math.min(1, (frac - lo) * seg));
      cells.push(
        <div key={"c" + i} className="relative flex-1 min-w-0 h-full overflow-hidden rounded-[2px]"
          style={{ background: "rgba(0,0,0,0.75)", boxShadow: "inset 0 0 6px rgba(0,0,0,0.9)", border: "1px solid " + (cellFill > 0 ? T.dim : "rgba(34,211,238,0.12)") }}>
          <div className="absolute inset-y-0 left-0 transition-[width,opacity] duration-500 ease-in-out"
            style={{
              width: (cellFill * 100) + "%",
              background: "linear-gradient(180deg," + T.b + "," + T.a + ")",
              boxShadow: "0 0 10px " + T.glow,
              opacity: cellFill > 0 ? 1 : 0
            }} />
          <div className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.35),transparent 45%,rgba(0,0,0,0.5))" }} />
        </div>
      );
    }
  }

  return (
    <div className="h-full w-full flex items-stretch gap-2 select-none" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <style>{"@keyframes " + uid + "-sweep{0%{transform:translateX(-110%)}100%{transform:translateX(210%)}}@keyframes " + uid + "-flash{0%{opacity:.85}100%{opacity:0}}"}</style>

      <div className="relative flex-1 min-w-0 h-full">
        <div className="absolute inset-0 rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* hatch texture */}
          <div className="absolute inset-0 opacity-[0.28] pointer-events-none"
            style={{ backgroundImage: "repeating-linear-gradient(115deg,rgba(34,211,238,0.18) 0px,rgba(34,211,238,0.18) 1px,transparent 1px,transparent 7px)" }} />

          {seg > 0 ? (
            <div className="absolute inset-[7%] flex items-stretch gap-[2px]">{cells}</div>
          ) : (
            <>
              {/* unlit rail */}
              <div className="absolute inset-y-[18%] left-0 right-0" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.4))" }} />
              {/* fill */}
              <div className="absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-500 ease-in-out" style={{ width: (frac * 100) + "%" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg," + T.b + " 0%," + T.a + " 45%,rgba(0,0,0,0.35) 100%)", boxShadow: "0 0 14px " + T.glow }} />
                <div className="absolute inset-x-0 top-0 h-[38%]" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.6),transparent)" }} />
                <div className="absolute inset-0 opacity-30"
                  style={{ backgroundImage: "repeating-linear-gradient(90deg,rgba(0,0,0,0.45) 0px,rgba(0,0,0,0.45) 1px,transparent 1px,transparent 5px)" }} />
                <div className="absolute inset-y-0 w-[26%]" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)", animation: uid + "-sweep 2.6s linear infinite" }} />
              </div>
              {/* leading edge */}
              <div className="absolute inset-y-0 w-[2px] transition-[left] duration-500 ease-in-out"
                style={{ left: "calc(" + (frac * 100) + "% - 1px)", background: "#fff", boxShadow: "0 0 10px " + T.glow + ",0 0 18px " + T.glow, opacity: frac > 0.002 ? 1 : 0 }} />
            </>
          )}

          {/* ticks */}
          {seg > 0 ? null : (
            <div className="absolute inset-0 pointer-events-none">
              {ticks.map(function (i) {
                return <div key={"t" + i} className="absolute top-0 bottom-0 w-px"
                  style={{ left: (i * 10) + "%", background: i === 5 ? "rgba(255,255,255,0.30)" : "rgba(255,255,255,0.14)" }} />;
              })}
            </div>
          )}

          {/* value-change flash */}
          <div key={"f" + pulse} className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg,transparent," + T.dim + ")", animation: uid + "-flash 420ms ease-out forwards" }} />

          <div className="absolute inset-0 rounded-md pointer-events-none" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }} />
        </div>
      </div>

      {props.showNumeric ? (
        <div className="relative h-full flex-[0_0_28%] min-w-0">
          <div className={"absolute inset-y-[12%] inset-x-0 " + T.text}>
            <FitText wrap={false} align="end"
              className={"font-mono font-black tracking-tighter " + T.text + " transition-colors duration-200"}>
              {numTxt}
            </FitText>
          </div>
        </div>
      ) : null}
    </div>
  );
}