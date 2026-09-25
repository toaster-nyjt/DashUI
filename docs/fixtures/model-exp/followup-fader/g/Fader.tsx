type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[1.75,6],"orientation:horizontal":[6,1.75]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation || 'vertical';
  const horizontal = orientation === 'horizontal';
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const areaRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;
  const clamped = Math.min(Math.max(props.value, Math.min(min, max)), Math.max(min, max));
  const t = Math.min(1, Math.max(0, (clamped - min) / span));

  const fromRatio = (r: number) => {
    const rr = Math.min(1, Math.max(0, r));
    return min + rr * span;
  };

  const handlePos = (clientX: number, clientY: number) => {
    const el = areaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const r = horizontal
      ? (clientX - rect.left) / rect.width
      : 1 - (clientY - rect.top) / rect.height;
    props.onChange(fromRatio(r));
  };

  const ticks: number[] = [];
  for (let i = 0; i <= 8; i++) ticks.push(i / 8);

  const pct = (t * 100) + "%";
  const trackThick = "0.5rem";
  const thumbLong = "1.15rem";
  const thumbAcross = "1.5rem";

  const glow = drag
    ? "0 0 0 1px rgba(163,230,53,0.5), 0 0 14px 2px rgba(163,230,53,0.35)"
    : hover
    ? "0 0 0 1px rgba(251,191,36,0.45), 0 0 10px 1px rgba(245,158,11,0.3)"
    : "0 4px 10px rgba(0,0,0,0.55)";

  return (
    <div
      className="relative h-full w-full select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        ref={areaRef}
        className="absolute inset-0 touch-none cursor-pointer"
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        onPointerDown={(e) => {
          (e.currentTarget as any).setPointerCapture(e.pointerId);
          setDrag(true);
          handlePos(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => { if (drag) handlePos(e.clientX, e.clientY); }}
        onPointerUp={(e) => {
          try { (e.currentTarget as any).releasePointerCapture(e.pointerId); } catch (err) {}
          setDrag(false);
        }}
        onPointerCancel={() => setDrag(false)}
      >
        {/* tick rail */}
        <div
          className="absolute"
          style={
            horizontal
              ? { left: "0.6rem", right: "0.6rem", top: "50%", height: "1.1rem", transform: "translateY(-0.55rem)" }
              : { top: "0.6rem", bottom: "0.6rem", left: "50%", width: "1.1rem", transform: "translateX(-0.55rem)" }
          }
        >
          {ticks.map((tk, i) => (
            <div
              key={"tk-" + i}
              className={"absolute transition-all duration-200 ease-out " + (i % 4 === 0 ? "bg-amber-500/40" : "bg-stone-600/40")}
              style={
                horizontal
                  ? { left: (tk * 100) + "%", top: 0, width: "1px", height: i % 4 === 0 ? "0.34rem" : "0.2rem" }
                  : { top: (100 - tk * 100) + "%", left: 0, height: "1px", width: i % 4 === 0 ? "0.34rem" : "0.2rem" }
              }
            />
          ))}
          {ticks.map((tk, i) => (
            <div
              key={"tk2-" + i}
              className={"absolute transition-all duration-200 ease-out " + (i % 4 === 0 ? "bg-amber-500/40" : "bg-stone-600/40")}
              style={
                horizontal
                  ? { left: (tk * 100) + "%", bottom: 0, width: "1px", height: i % 4 === 0 ? "0.34rem" : "0.2rem" }
                  : { top: (100 - tk * 100) + "%", right: 0, height: "1px", width: i % 4 === 0 ? "0.34rem" : "0.2rem" }
              }
            />
          ))}
        </div>

        {/* track well */}
        <div
          className="absolute rounded-full border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden"
          style={
            horizontal
              ? { left: "0.6rem", right: "0.6rem", top: "50%", height: trackThick, transform: "translateY(-50%)" }
              : { top: "0.6rem", bottom: "0.6rem", left: "50%", width: trackThick, transform: "translateX(-50%)" }
          }
        >
          <div
            className="absolute rounded-full transition-all duration-150 ease-out"
            style={
              horizontal
                ? {
                    left: 0, top: 0, bottom: 0, width: pct,
                    background: "linear-gradient(90deg, rgba(180,83,9,0.65), " + (drag ? "rgba(163,230,53,0.95)" : "rgba(245,158,11,0.95)") + ")",
                    boxShadow: drag ? "0 0 12px rgba(163,230,53,0.45)" : "0 0 10px rgba(245,158,11,0.3)",
                  }
                : {
                    left: 0, right: 0, bottom: 0, height: pct,
                    background: "linear-gradient(0deg, rgba(180,83,9,0.65), " + (drag ? "rgba(163,230,53,0.95)" : "rgba(245,158,11,0.95)") + ")",
                    boxShadow: drag ? "0 0 12px rgba(163,230,53,0.45)" : "0 0 10px rgba(245,158,11,0.3)",
                  }
            }
          />
        </div>

        {/* thumb */}
        <div
          className="absolute transition-all duration-150 ease-out"
          style={
            horizontal
              ? {
                  left: "calc(0.6rem + " + t + " * (100% - 1.2rem))",
                  top: "50%",
                  width: thumbLong,
                  height: thumbAcross,
                  transform: "translate(-50%,-50%) scale(" + (drag ? 1.08 : hover ? 1.04 : 1) + ")",
                }
              : {
                  top: "calc(0.6rem + " + (1 - t) + " * (100% - 1.2rem))",
                  left: "50%",
                  height: thumbLong,
                  width: thumbAcross,
                  transform: "translate(-50%,-50%) scale(" + (drag ? 1.08 : hover ? 1.04 : 1) + ")",
                }
          }
        >
          <div
            className={
              "h-full w-full rounded-md border-2 transition-all duration-200 ease-out " +
              (drag ? "border-lime-400/70" : hover ? "border-amber-400/60" : "border-stone-700/80")
            }
            style={{
              background: "linear-gradient(" + (horizontal ? "90deg" : "180deg") + ", #3f3b36, #16140f 55%, #2a2622)",
              boxShadow: glow,
            }}
          >
            <div
              className="absolute transition-all duration-200 ease-out"
              style={
                horizontal
                  ? {
                      left: "50%", top: "18%", bottom: "18%", width: "2px", transform: "translateX(-1px)",
                      background: drag ? "rgba(163,230,53,0.95)" : "rgba(251,191,36,0.9)",
                      boxShadow: drag ? "0 0 8px rgba(163,230,53,0.8)" : "0 0 6px rgba(251,191,36,0.6)",
                    }
                  : {
                      top: "50%", left: "18%", right: "18%", height: "2px", transform: "translateY(-1px)",
                      background: drag ? "rgba(163,230,53,0.95)" : "rgba(251,191,36,0.9)",
                      boxShadow: drag ? "0 0 8px rgba(163,230,53,0.8)" : "0 0 6px rgba(251,191,36,0.6)",
                    }
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}