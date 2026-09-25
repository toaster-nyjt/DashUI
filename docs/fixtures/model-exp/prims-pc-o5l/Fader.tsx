type FaderProps = { min: number; max: number; value: number; onChange: (v: number) => void; orientation?: 'vertical' | 'horizontal' };

export const Fader_MIN = {"base":[1.5,5],"orientation:horizontal":[5,1.5]};

export function Fader(props: FaderProps) {
  const orientation = props.orientation ?? 'vertical';
  const horiz = orientation === 'horizontal';
  const floor = (Fader_MIN as any)["orientation:" + orientation] ?? Fader_MIN.base;
  const uid = useRef("fader-" + Math.random().toString(36).slice(2)).current;
  const ref = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [hover, setHover] = useState(false);

  const span = props.max - props.min || 1;
  const raw = (props.value - props.min) / span;
  const t = Math.max(0, Math.min(1, raw));

  const emit = (e: any) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let f = horiz ? (e.clientX - r.left) / (r.width || 1) : 1 - (e.clientY - r.top) / (r.height || 1);
    f = Math.max(0, Math.min(1, f));
    props.onChange(props.min + f * span);
  };

  const down = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(true);
    emit(e);
  };
  const move = (e: any) => { if (drag) emit(e); };
  const up = (e: any) => { setDrag(false); try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch (err) {} };

  const ticks = [];
  for (let i = 0; i <= 10; i++) ticks.push(i);

  const active = drag || hover;
  const pct = (t * 100) + "%";

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        ref={ref}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
        className="relative h-full w-full touch-none cursor-pointer select-none transition-all duration-200 ease-out"
      >
        {/* tick rail */}
        <div
          className={
            "absolute flex " +
            (horiz
              ? "left-0 right-0 top-[8%] h-[16%] flex-row items-start justify-between"
              : "top-0 bottom-0 left-[8%] w-[16%] flex-col-reverse items-start justify-between")
          }
        >
          {ticks.map((i) => (
            <div
              key={"tk-" + uid + "-" + i}
              className={
                "transition-all duration-200 ease-out rounded-full " +
                (i % 5 === 0 ? "bg-amber-500/50 " : "bg-stone-700/70 ") +
                (horiz ? "w-px h-full" : "h-px w-full")
              }
            />
          ))}
        </div>

        {/* track well */}
        <div
          className={
            "absolute rounded-full border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden " +
            (horiz
              ? "left-[2%] right-[2%] top-[42%] h-[26%]"
              : "top-[2%] bottom-[2%] left-[37%] w-[26%]")
          }
        >
          {/* fill */}
          <div
            className={
              "absolute rounded-full transition-all duration-150 ease-out bg-gradient-to-" +
              (horiz ? "r " : "t ") +
              (active
                ? "from-amber-600/70 to-lime-400/90 shadow-lg shadow-lime-400/30"
                : "from-amber-700/50 to-amber-400/80")
            }
            style={
              horiz
                ? { left: 0, top: 0, bottom: 0, width: pct }
                : { bottom: 0, left: 0, right: 0, height: pct }
            }
          />
        </div>

        {/* thumb */}
        <div
          className="absolute transition-all duration-150 ease-out"
          style={
            horiz
              ? { left: pct, top: "50%", transform: "translate(-50%,-50%)", width: "18%", height: "78%", minWidth: "0.55rem" }
              : { bottom: pct, left: "50%", transform: "translate(-50%,50%)", height: "12%", width: "78%", minHeight: "0.5rem" }
          }
        >
          <div
            className={
              "h-full w-full rounded-lg border-2 transition-all duration-200 ease-out bg-gradient-to-b from-neutral-700 to-neutral-950 " +
              (active
                ? "border-amber-400/70 shadow-lg shadow-amber-500/40 scale-105 brightness-110"
                : "border-stone-700/80 shadow-md shadow-black/60")
            }
          >
            <div
              className={
                "absolute rounded-full transition-all duration-200 ease-out " +
                (active ? "bg-lime-300 shadow-lg shadow-lime-400/40" : "bg-amber-400/80") +
                (horiz ? " left-1/2 top-[12%] bottom-[12%] w-[2px] -translate-x-1/2" : " top-1/2 left-[12%] right-[12%] h-[2px] -translate-y-1/2")
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}