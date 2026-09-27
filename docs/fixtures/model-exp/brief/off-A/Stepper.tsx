type StepperProps = { value: number; min?: number; max?: number; step?: number; onChange: (v: number) => void; disabled?: boolean };

export const Stepper_MIN = {"base":[7,2]};

export function Stepper(props: StepperProps) {
  const uid = useRef("stepper-" + Math.random().toString(36).slice(2)).current;
  const step = props.step && props.step > 0 ? props.step : 1;
  const min = props.min !== undefined ? props.min : -Infinity;
  const max = props.max !== undefined ? props.max : Infinity;
  const disabled = !!props.disabled;
  const [pulse, setPulse] = useState(0);
  const [held, setHeld] = useState<null | 1 | -1>(null);
  const timers = useRef<any>({ t: null, i: null });
  const propsRef = useRef(props);
  propsRef.current = props;

  const clampSnap = (v: number) => {
    const base = props.min !== undefined ? props.min : 0;
    let n = base + Math.round((v - base) / step) * step;
    if (n < min) n = min;
    if (n > max) n = max;
    const p = Math.max(0, (String(step).split(".")[1] || "").length);
    return parseFloat(n.toFixed(p));
  };

  const canDec = !disabled && props.value > min + 1e-9;
  const canInc = !disabled && props.value < max - 1e-9;

  const bump = (dir: 1 | -1) => {
    const p = propsRef.current;
    const st = p.step && p.step > 0 ? p.step : 1;
    const lo = p.min !== undefined ? p.min : -Infinity;
    const hi = p.max !== undefined ? p.max : Infinity;
    const base = p.min !== undefined ? p.min : 0;
    let n = base + Math.round((p.value + dir * st - base) / st) * st;
    if (n < lo) n = lo;
    if (n > hi) n = hi;
    const dec = Math.max(0, (String(st).split(".")[1] || "").length);
    n = parseFloat(n.toFixed(dec));
    if (n !== p.value) {
      p.onChange(n);
      setPulse((x) => x + 1);
    }
  };

  const stopRepeat = () => {
    if (timers.current.t) clearTimeout(timers.current.t);
    if (timers.current.i) clearInterval(timers.current.i);
    timers.current.t = null;
    timers.current.i = null;
    setHeld(null);
  };

  useEffect(() => stopRepeat, []);

  const startRepeat = (dir: 1 | -1) => (e: any) => {
    if (disabled) return;
    if (e.currentTarget && e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    }
    setHeld(dir);
    bump(dir);
    timers.current.t = setTimeout(() => {
      timers.current.i = setInterval(() => bump(dir), 70);
    }, 380);
  };

  const btnBase =
    "relative h-full flex-1 min-w-0 flex items-center justify-center rounded-sm border transition-all duration-150 ease-out touch-none select-none overflow-hidden";

  const Arrow = (dir: 1 | -1, enabled: boolean) => (
    <button
      type="button"
      disabled={!enabled}
      onPointerDown={startRepeat(dir)}
      onPointerUp={stopRepeat}
      onPointerCancel={stopRepeat}
      onLostPointerCapture={stopRepeat}
      className={
        btnBase +
        " " +
        (enabled
          ? "border-yellow-300/40 bg-yellow-300/5 text-yellow-300 hover:bg-yellow-300 hover:text-black hover:shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)] active:scale-[0.94] active:brightness-125 cursor-pointer"
          : "border-cyan-400/10 bg-black/40 text-zinc-600 cursor-default") +
        (held === dir && enabled ? " bg-yellow-300 text-black shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)]" : "")
      }
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-[62%] w-[62%]">
        <g stroke="currentColor" strokeWidth={2.6} strokeLinecap="square" fill="none">
          <line x1="5" y1="12" x2="19" y2="12" />
          {dir === 1 ? <line x1="12" y1="5" x2="12" y2="19" /> : null}
        </g>
      </svg>
      {enabled ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-yellow-300/70 to-transparent" />
      ) : null}
    </button>
  );

  const atMin = props.min !== undefined && props.value <= min + 1e-9;
  const atMax = props.max !== undefined && props.value >= max - 1e-9;

  return (
    <div
      className="h-full w-full flex items-stretch gap-2"
      style={{ minWidth: Stepper_MIN.base[0] + "rem", minHeight: Stepper_MIN.base[1] + "rem" }}
    >
      <div className="h-full flex-[1.1] min-w-0">{Arrow(-1, canDec)}</div>

      <div
        className={
          "relative h-full flex-[1.6] min-w-0 rounded-md border bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] transition-all duration-200 ease-out " +
          (disabled ? "border-cyan-400/10" : "border-cyan-400/20")
        }
      >
        <svg className="absolute inset-0 h-full w-full opacity-70" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(34,211,238,0.16)" />
              <stop offset="55%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(217,70,239,0.12)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
        </svg>
        <div key={pulse} className="absolute inset-0 rounded-md animate-[ping_0.5s_ease-out_1] bg-yellow-300/10 pointer-events-none" />
        <div className="absolute inset-[14%] flex items-center justify-center">
          <FitText
            wrap={false}
            className={
              "font-mono font-black tracking-tighter transition-colors duration-200 " +
              (disabled
                ? "text-zinc-600"
                : "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]")
            }
          >
            {String(clampSnap(props.value))}
          </FitText>
        </div>
        <span
          className={
            "pointer-events-none absolute left-1 top-1 h-1 w-1 rounded-full transition-all duration-300 " +
            (atMin && !disabled ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" : "bg-cyan-400/20")
          }
        />
        <span
          className={
            "pointer-events-none absolute right-1 bottom-1 h-1 w-1 rounded-full transition-all duration-300 " +
            (atMax && !disabled ? "bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.8)]" : "bg-cyan-400/20")
          }
        />
      </div>

      <div className="h-full flex-[1.1] min-w-0">{Arrow(1, canInc)}</div>
    </div>
  );
}