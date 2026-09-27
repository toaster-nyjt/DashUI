type StepperProps = { value: number; min?: number; max?: number; step?: number; onChange: (v: number) => void; disabled?: boolean };

export function Stepper(props: StepperProps) {
  const uid = useRef("stepper-" + Math.random().toString(36).slice(2)).current;
  const min = props.min ?? -Infinity;
  const max = props.max ?? Infinity;
  const step = props.step ?? 1;
  const disabled = !!props.disabled;
  const [flash, setFlash] = useState(0);
  const [held, setHeld] = useState(0);
  const timers = useRef<any>({ t: null, i: null });

  const canDec = !disabled && props.value - step >= min - 1e-9;
  const canInc = !disabled && props.value + step <= max + 1e-9;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => {
    if (!isFinite(min)) return Math.round(v / step) * step;
    const n = Math.round((v - min) / step);
    return min + n * step;
  };

  const bump = (dir: number) => {
    const next = clamp(snap(props.value + dir * step));
    if (Math.abs(next - props.value) < 1e-9) return;
    props.onChange(parseFloat(next.toFixed(6)));
    setFlash(dir);
    window.setTimeout(() => setFlash(0), 220);
  };

  const stop = () => {
    if (timers.current.t) window.clearTimeout(timers.current.t);
    if (timers.current.i) window.clearInterval(timers.current.i);
    timers.current.t = null;
    timers.current.i = null;
    setHeld(0);
  };

  useEffect(() => stop, []);

  const start = (dir: number, e: any) => {
    if (disabled) return;
    if (dir > 0 ? !canInc : !canDec) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    setHeld(dir);
    bump(dir);
    timers.current.t = window.setTimeout(() => {
      timers.current.i = window.setInterval(() => bump(dir), 90);
    }, 380);
  };

  const Btn = (dir: number, enabled: boolean) => {
    const active = held === dir;
    return (
      <button
        type="button"
        disabled={!enabled}
        onPointerDown={(e) => start(dir, e)}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        className={
          "relative h-full flex-1 min-w-0 touch-none select-none overflow-hidden rounded-sm border transition-all duration-150 ease-out " +
          (enabled
            ? "border-yellow-300/40 bg-black/60 text-yellow-300 hover:bg-yellow-300 hover:text-black hover:shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)] active:scale-[0.97] active:brightness-110"
            : "border-cyan-400/15 bg-black/40 text-zinc-600 cursor-default")
        }
      >
        <span
          className={
            "pointer-events-none absolute inset-0 transition-opacity duration-200 " +
            (active ? "opacity-100 bg-yellow-300/25" : "opacity-0")
          }
        />
        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="absolute inset-[22%]">
          <g stroke="currentColor" strokeWidth={3} strokeLinecap="square">
            <line x1="4" y1="12" x2="20" y2="12" />
            {dir > 0 ? <line x1="12" y1="4" x2="12" y2="20" /> : null}
          </g>
        </svg>
      </button>
    );
  };

  const floor = Stepper_MIN.base;

  return (
    <div
      className="h-full w-full flex items-stretch gap-2"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {Btn(-1, canDec)}
      <div
        className={
          "relative h-full flex-[1.4] min-w-0 rounded-md border bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] transition-all duration-200 ease-out " +
          (disabled ? "border-cyan-400/10" : "border-cyan-400/20")
        }
      >
        <svg className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
        </svg>
        <div
          className={
            "pointer-events-none absolute inset-0 rounded-md transition-opacity duration-200 " +
            (flash !== 0 ? "opacity-100" : "opacity-0") +
            (flash > 0 ? " bg-yellow-300/15 shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)]" : " bg-cyan-400/10")
          }
        />
        <div className="absolute inset-[14%]">
          <FitText
            wrap={false}
            className={
              "font-mono font-black tracking-tighter transition-all duration-200 ease-out " +
              (disabled
                ? "text-zinc-600"
                : "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]") +
              (flash !== 0 ? " scale-105" : "")
            }
          >
            {String(props.value)}
          </FitText>
        </div>
      </div>
      {Btn(1, canInc)}
    </div>
  );
}

export const Stepper_MIN = {"base":[7,1.75]};