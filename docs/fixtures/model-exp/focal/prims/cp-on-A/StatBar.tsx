type StatBarProps = { value: number; max: number; segments?: number; tone?: 'neutral' | 'accent' | 'warning' | 'danger'; showNumeric?: boolean };

const StatBarTONES: any = {
  neutral: { a: "rgba(34,211,238,1)", b: "rgba(6,182,212,0.55)", glow: "rgba(34,211,238,0.7)", txt: "text-cyan-300", bd: "rgba(34,211,238,0.35)" },
  accent: { a: "rgba(253,224,71,1)", b: "rgba(234,179,8,0.55)", glow: "rgba(253,224,71,0.65)", txt: "text-yellow-300", bd: "rgba(253,224,71,0.4)" },
  warning: { a: "rgba(251,191,36,1)", b: "rgba(217,119,6,0.55)", glow: "rgba(245,158,11,0.65)", txt: "text-amber-400", bd: "rgba(245,158,11,0.4)" },
  danger: { a: "rgba(244,63,94,1)", b: "rgba(190,18,60,0.6)", glow: "rgba(244,63,94,0.7)", txt: "text-rose-500", bd: "rgba(244,63,94,0.45)" }
};

export const StatBar_MIN = {"base":[6,1.5]};

export function StatBar(props: StatBarProps) {
  const uid = useRef("statbar-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "neutral";
  const T = StatBarTONES[tone];
  const max = props.max > 0 ? props.max : 1;
  const raw = props.value / max;
  const frac = Math.max(0, Math.min(1, isFinite(raw) ? raw : 0));
  const floor = StatBar_MIN.base;

  const segs = props.segments && props.segments > 0 ? Math.floor(props.segments) : 0;

  const prev = useRef(frac);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (Math.abs(prev.current - frac) > 0.0005) {
      prev.current = frac;
      setPulse((p) => p + 1);
    }
  }, [frac]);

  const fmt = (n: number) => {
    const r = Math.round(n * 10) / 10;
    return Math.abs(r - Math.round(r)) < 0.05 ? String(Math.round(r)) : r.toFixed(1);
  };

  const ticks = [];
  for (let i = 1; i < 10; i++) ticks.push(i / 10);

  const barCore = (
    <div className="relative h-full w-full overflow-hidden rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
      {/* hatch texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 6px)" }}
      />
      {!segs && (
        <>
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-in-out"
            style={{
              width: (frac * 100) + "%",
              background: "linear-gradient(90deg," + T.b + " 0%," + T.a + " 100%)",
              boxShadow: "0 0 10px " + T.glow + ", inset 0 1px 0 rgba(255,255,255,0.45)"
            }}
          >
            <div
              className="absolute inset-0 opacity-40"
              style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 7px)" }}
            />
            <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.35), transparent)" }} />
            <div
              key={"sweep-" + pulse}
              className="absolute inset-y-0 w-1/3"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", animation: "statbarsweep 900ms ease-out 1" }}
            />
          </div>
          {/* leading edge */}
          <div
            className="absolute inset-y-0 w-[2px] transition-[left] duration-500 ease-in-out"
            style={{ left: "calc(" + (frac * 100) + "% - 1px)", background: "#fff", boxShadow: "0 0 8px " + T.a + ", 0 0 16px " + T.glow, opacity: frac > 0.004 ? 1 : 0 }}
          />
        </>
      )}
      {segs > 0 && (
        <div className="absolute inset-[6%] flex gap-[2px]">
          {Array.from({ length: segs }).map((_, i) => {
            const cell = Math.max(0, Math.min(1, frac * segs - i));
            return (
              <div key={"s" + i} className="relative h-full flex-1 overflow-hidden rounded-[2px]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid " + T.bd }}>
                <div
                  className="absolute inset-y-0 left-0 transition-[width,opacity] duration-500 ease-in-out"
                  style={{
                    width: (cell * 100) + "%",
                    background: "linear-gradient(180deg," + T.a + "," + T.b + ")",
                    boxShadow: cell > 0 ? "0 0 8px " + T.glow : "none",
                    opacity: cell > 0 ? 1 : 0
                  }}
                />
                <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.3), transparent)", opacity: cell > 0 ? 1 : 0 }} />
              </div>
            );
          })}
        </div>
      )}
      {!segs && (
        <div className="pointer-events-none absolute inset-0">
          {ticks.map((t, i) => (
            <div
              key={"t" + i}
              className="absolute top-0 w-px"
              style={{ left: (t * 100) + "%", height: (i === 4 ? "100%" : "34%"), background: "rgba(0,0,0,0.6)", opacity: 0.8 }}
            />
          ))}
          {ticks.map((t, i) => (
            <div
              key={"tb" + i}
              className="absolute bottom-0 w-px"
              style={{ left: (t * 100) + "%", height: i === 4 ? "0%" : "34%", background: "rgba(0,0,0,0.6)" }}
            />
          ))}
        </div>
      )}
      {/* glass sheen + vignette */}
      <div className="pointer-events-none absolute inset-0 rounded-md" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10), transparent 45%, rgba(0,0,0,0.35))" }} />
      <div className="pointer-events-none absolute inset-0 rounded-md" style={{ boxShadow: "inset 0 0 14px " + (frac > 0 ? T.glow.replace("0.7", "0.25").replace("0.65", "0.22") : "rgba(0,0,0,0)") }} />
      <style>{"@keyframes statbarsweep{0%{transform:translateX(-120%);opacity:0}30%{opacity:.9}100%{transform:translateX(340%);opacity:0}}"}</style>
    </div>
  );

  return (
    <div className="relative flex h-full w-full items-stretch gap-2" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }} key={uid}>
      <div className="relative min-w-0 flex-1">{barCore}</div>
      {props.showNumeric && (
        <div className="relative h-full min-w-0" style={{ flex: "0 0 26%" }}>
          <div className="absolute inset-y-[8%] left-0 right-0">
            <FitText wrap={false} align="end" className={"font-mono font-black tracking-tighter " + T.txt + " drop-shadow-[0_0_8px_rgba(253,224,71,0.5)] transition-colors duration-200"}>
              {fmt(props.value) + "/" + fmt(props.max)}
            </FitText>
          </div>
        </div>
      )}
    </div>
  );
}