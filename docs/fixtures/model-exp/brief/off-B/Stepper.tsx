type StepperProps = { value: number; min?: number; max?: number; step?: number; onChange: (v:number)=>void; disabled?: boolean };

export const Stepper_MIN = {"base":[7,2]};

export function Stepper(props: StepperProps) {
  const uid = useRef("stepper-" + Math.random().toString(36).slice(2)).current;
  const min = props.min !== undefined ? props.min : -Infinity;
  const max = props.max !== undefined ? props.max : Infinity;
  const step = props.step !== undefined && props.step > 0 ? props.step : 1;
  const disabled = !!props.disabled;
  const [pressed, setPressed] = useState<number>(0);
  const [flash, setFlash] = useState<number>(0);
  const timer = useRef<any>(null);
  const prev = useRef<number>(props.value);

  useEffect(() => {
    if (prev.current !== props.value) {
      setFlash(props.value > prev.current ? 1 : -1);
      prev.current = props.value;
      const t = setTimeout(() => setFlash(0), 320);
      return () => clearTimeout(t);
    }
  }, [props.value]);

  const clampStep = (v: number) => {
    let n = v;
    if (props.min !== undefined) {
      const k = Math.round((n - props.min) / step);
      n = props.min + k * step;
    }
    if (n < min) n = min;
    if (n > max) n = max;
    const dec = (String(step).split(".")[1] || "").length;
    return dec > 0 ? parseFloat(n.toFixed(dec)) : n;
  };

  const bump = (dir: number) => {
    if (disabled) return;
    const next = clampStep(props.value + dir * step);
    if (next !== props.value) props.onChange(next);
  };

  const stop = () => {
    if (timer.current) { clearInterval(timer.current); clearTimeout(timer.current); timer.current = null; }
    setPressed(0);
  };

  const start = (e: any, dir: number) => {
    if (disabled) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    setPressed(dir);
    bump(dir);
    timer.current = setTimeout(() => {
      timer.current = setInterval(() => bump(dir), 80);
    }, 380);
  };

  useEffect(() => () => stop(), []);

  const atMin = props.value <= min + 1e-9;
  const atMax = props.value >= max - 1e-9;

  const Btn = (dir: number, off: boolean) => {
    const active = pressed === dir;
    const dead = disabled || off;
    return (
      <button
        type="button"
        disabled={dead}
        onPointerDown={(e) => start(e, dir)}
        onPointerUp={stop}
        onPointerCancel={stop}
        onLostPointerCapture={stop}
        className={
          "relative h-full flex-1 min-w-0 touch-none select-none overflow-hidden rounded-sm border transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-cyan-400/60 " +
          (dead
            ? "border-cyan-400/10 bg-black/50 text-zinc-600 cursor-default"
            : "border-yellow-300/40 bg-black/60 text-yellow-300 hover:bg-yellow-300 hover:text-black hover:shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)] active:scale-[0.97] active:brightness-110 " +
              (active ? "bg-yellow-300 text-black shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)]" : ""))
        }
      >
        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="absolute inset-[22%]">
          <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="square">
            <line x1="5" y1="12" x2="19" y2="12" />
            {dir > 0 ? <line x1="12" y1="5" x2="12" y2="19" /> : null}
          </g>
        </svg>
      </button>
    );
  };

  return (
    <div
      className="relative h-full w-full flex items-stretch gap-2"
      style={{ minWidth: Stepper_MIN.base[0] + "rem", minHeight: Stepper_MIN.base[1] + "rem" }}
    >
      {Btn(-1, atMin)}
      <div
        className={
          "relative h-full flex-[1.6] min-w-0 rounded-md border bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] transition-all duration-200 ease-out " +
          (disabled ? "border-cyan-400/10" : flash !== 0 ? "border-yellow-300/70 shadow-[0_0_12px_-2px_rgba(253,224,71,0.5)]" : "border-cyan-400/20")
        }
      >
        <svg className="absolute inset-0 h-full w-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
              <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
        </svg>
        <div className="absolute inset-[14%]">
          <FitText
            wrap={false}
            className={
              "font-mono font-black tracking-tighter transition-all duration-200 ease-out " +
              (disabled
                ? "text-zinc-500"
                : flash > 0
                ? "text-lime-300 drop-shadow-[0_0_10px_rgba(163,230,53,0.7)]"
                : flash < 0
                ? "text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.6)]"
                : "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]")
            }
          >
            {String(props.value)}
          </FitText>
        </div>
      </div>
      {Btn(1, atMax)}
    </div>
  );
}