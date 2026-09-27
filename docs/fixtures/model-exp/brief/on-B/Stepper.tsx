type StepperProps = { value: number; min?: number; max?: number; step?: number; onChange: (v:number)=>void; disabled?: boolean };

export const Stepper_MIN = {"base":[7,2]};

export function Stepper(props: StepperProps) {
  const uid = useRef("stepper-" + Math.random().toString(36).slice(2)).current;
  const { value, onChange, disabled } = props;
  const min = props.min ?? -Infinity;
  const max = props.max ?? Infinity;
  const step = props.step && props.step > 0 ? props.step : 1;

  const [pressed, setPressed] = useState<number>(0);
  const [flash, setFlash] = useState<number>(0);
  const prev = useRef(value);
  const timers = useRef<any>({ t: null, i: null });

  useEffect(() => {
    if (prev.current !== value) {
      setFlash(value > prev.current ? 1 : -1);
      prev.current = value;
      const id = setTimeout(() => setFlash(0), 320);
      return () => clearTimeout(id);
    }
  }, [value]);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  const round = (v: number) => {
    const base = isFinite(min) ? min : 0;
    const n = Math.round((v - base) / step);
    const r = base + n * step;
    return Math.abs(r) < 1e-9 ? 0 : parseFloat(r.toFixed(6));
  };

  const bump = (dir: number) => {
    if (disabled) return;
    const next = clamp(round(value + dir * step));
    if (next !== value) onChange(next);
  };

  const stopRepeat = () => {
    if (timers.current.t) clearTimeout(timers.current.t);
    if (timers.current.i) clearInterval(timers.current.i);
    timers.current.t = null;
    timers.current.i = null;
  };

  useEffect(() => stopRepeat, []);

  const canDec = !disabled && value > min;
  const canInc = !disabled && value < max;

  const start = (e: any, dir: number) => {
    const enabled = dir < 0 ? canDec : canInc;
    if (!enabled) return;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    setPressed(dir);
    bump(dir);
    stopRepeat();
    timers.current.t = setTimeout(() => {
      timers.current.i = setInterval(() => {
        // read latest via functional bump using closure-safe ref
        bumpRef.current(dir);
      }, 80);
    }, 380);
  };

  const bumpRef = useRef(bump);
  bumpRef.current = bump;

  const end = () => { setPressed(0); stopRepeat(); };

  const StepperBtn = (p: { dir: number; enabled: boolean }) => {
    const isPressed = pressed === p.dir;
    return (
      <button
        type="button"
        disabled={!p.enabled}
        onPointerDown={(e) => start(e, p.dir)}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        className={
          "relative h-full flex-1 min-w-0 touch-none select-none overflow-hidden rounded-sm border transition-all duration-150 ease-out " +
          (p.enabled
            ? "border-yellow-300/40 bg-yellow-300/5 text-yellow-300 hover:bg-yellow-300 hover:text-black hover:shadow-[0_0_16px_-2px_rgba(253,224,71,0.6)] active:brightness-110 cursor-pointer"
            : "border-cyan-400/10 bg-black/40 text-zinc-600 cursor-not-allowed") +
          (isPressed ? " scale-[0.94] bg-yellow-300 text-black shadow-[0_0_18px_-2px_rgba(253,224,71,0.8)]" : "")
        }
      >
        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="absolute inset-[18%]">
          <g stroke="currentColor" strokeWidth="3" strokeLinecap="square">
            <line x1="5" y1="12" x2="19" y2="12" />
            {p.dir > 0 ? <line x1="12" y1="5" x2="12" y2="19" /> : null}
          </g>
        </svg>
        {p.enabled ? (
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-yellow-300/10 to-transparent" />
        ) : null}
      </button>
    );
  };

  const atMax = isFinite(max) && value >= max;

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: Stepper_MIN.base[0] + "rem", minHeight: Stepper_MIN.base[1] + "rem" }}
    >
      <div className={"flex h-full w-full items-stretch gap-2 transition-opacity duration-200 " + (disabled ? "opacity-40" : "opacity-100")}>
        <StepperBtn dir={-1} enabled={canDec} />

        <div className="relative h-full flex-[1.6] min-w-0 overflow-hidden rounded-md border border-cyan-400/20 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.14)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
          </svg>
          <div
            className={
              "pointer-events-none absolute inset-0 transition-opacity duration-300 " +
              (flash !== 0 ? "opacity-100" : "opacity-0") +
              (flash > 0 ? " bg-yellow-300/20" : " bg-rose-500/20")
            }
          />
          <div className="absolute inset-[14%] flex items-center justify-center">
            <FitText
              wrap={false}
              className={
                "font-mono font-black tracking-tighter transition-colors duration-200 " +
                (disabled
                  ? "text-zinc-500"
                  : atMax
                  ? "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]"
                  : "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]")
              }
            >
              {String(value)}
            </FitText>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        </div>

        <StepperBtn dir={1} enabled={canInc} />
      </div>
    </div>
  );
}