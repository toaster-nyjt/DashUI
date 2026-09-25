type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[2,6],"orientation:horizontal":[6,2]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation || 'vertical';
  const horiz = orientation === 'horizontal';
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const ref = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const min = props.min;
  const max = props.max;
  const span = max - min || 1;
  const clamped = Math.min(Math.max(props.value, Math.min(min, max)), Math.max(min, max));
  const t = (clamped - min) / span;
  const pct = Math.min(1, Math.max(0, t)) * 100;

  const apply = (e: any) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let ratio;
    if (horiz) ratio = r.width ? (e.clientX - r.left) / r.width : 0;
    else ratio = r.height ? 1 - (e.clientY - r.top) / r.height : 0;
    ratio = Math.min(1, Math.max(0, ratio));
    props.onChange(min + ratio * span);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    apply(e);
  };
  const move = (e: any) => { if (drag) apply(e); };
  const up = (e: any) => { e.currentTarget.releasePointerCapture?.(e.pointerId); setDrag(false); };

  const ticks = [];
  for (let i = 0; i <= 8; i++) ticks.push(i);
  const active = drag || hover;

  return (
    <div
      className="h-full w-full relative touch-none select-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      ref={ref}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* tick rail */}
      <div className={"absolute " + (horiz ? "left-0 right-0 top-[8%] h-[18%]" : "top-0 bottom-0 left-[8%] w-[18%]") + " flex " + (horiz ? "flex-row items-start" : "flex-col-reverse items-start") + " justify-between pointer-events-none"}>
        {ticks.map((i) => (
          <div
            key={"tk-" + i}
            className={"transition-all duration-200 ease-out " + (horiz ? "w-px h-full" : "h-px w-full") + " " + (i === 4 ? "bg-amber-500/50" : "bg-stone-600/40")}
          />
        ))}
      </div>

      {/* track well */}
      <div className={"absolute " + (horiz ? "left-[2%] right-[2%] top-1/2 -translate-y-1/2 h-[30%]" : "top-[2%] bottom-[2%] left-1/2 -translate-x-1/2 w-[30%]") + " rounded-full bg-stone-950/80 border border-stone-800/70 shadow-inner shadow-black/70 overflow-hidden"}>
        <div
          className="absolute rounded-full bg-gradient-to-t from-amber-600/70 to-amber-400/90 transition-all duration-150 ease-out"
          style={
            horiz
              ? { left: 0, top: 0, bottom: 0, width: pct + "%" }
              : { bottom: 0, left: 0, right: 0, height: pct + "%" }
          }
        />
        <div
          className={"absolute rounded-full transition-all duration-200 ease-out " + (active ? "bg-lime-400/25" : "bg-transparent")}
          style={horiz ? { inset: 0 } : { inset: 0 }}
        />
      </div>

      {/* thumb */}
      <div
        className="absolute transition-all duration-150 ease-out pointer-events-none"
        style={
          horiz
            ? { left: "calc(2% + " + pct + "% * 0.96)", top: "50%", transform: "translate(-50%,-50%)", width: "18%", minWidth: "0.7rem", height: "76%" }
            : { bottom: "calc(2% + " + pct + "% * 0.96)", left: "50%", transform: "translate(-50%,50%)", height: "18%", minHeight: "0", width: "76%" }
        }
      >
        <div
          className={
            "h-full w-full rounded-md border-2 bg-gradient-to-b from-neutral-700 to-neutral-950 transition-all duration-200 ease-out " +
            (active
              ? "border-amber-400/70 shadow-lg shadow-amber-500/40 scale-105"
              : "border-stone-700/80 shadow-md shadow-black/60")
          }
        >
          <div className={"absolute " + (horiz ? "left-1/2 -translate-x-1/2 top-[15%] bottom-[15%] w-[2px]" : "top-1/2 -translate-y-1/2 left-[15%] right-[15%] h-[2px]") + " rounded-full transition-all duration-200 ease-out " + (active ? "bg-lime-400 shadow-sm shadow-lime-400/50" : "bg-amber-400/80")} />
        </div>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-0" aria-hidden="true">
        <defs><linearGradient id={uid} /></defs>
      </svg>
    </div>
  );
}