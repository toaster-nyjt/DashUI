type NumericReadoutProps = { value: number; decimals?: number; prefix?: string; suffix?: string; animate?: boolean };

export const NumericReadout_MIN = {"base":[3.5,1.5]};

export function NumericReadout(props: NumericReadoutProps) {
  const uid = useRef("numreadout-" + Math.random().toString(36).slice(2)).current;
  const decimals = props.decimals ?? 0;
  const animate = props.animate !== false;
  const target = typeof props.value === "number" && isFinite(props.value) ? props.value : 0;

  const [shown, setShown] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);
  const [flash, setFlash] = useState(0); // 0 none, 1 up, -1 down

  useEffect(() => {
    if (!animate) {
      fromRef.current = target;
      setShown(target);
      return;
    }
    const start = fromRef.current;
    if (start === target) return;
    setFlash(target > start ? 1 : -1);
    const dur = Math.min(900, 260 + Math.abs(target - start) * 6);
    const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = start + (target - start) * e;
      setShown(v);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
        setShown(target);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    const ft = setTimeout(() => setFlash(0), 520);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(ft); };
  }, [target, animate, decimals]);

  useEffect(() => { if (!animate) fromRef.current = target; }, [animate, target]);

  const display = (animate ? shown : target).toFixed(Math.max(0, Math.min(6, decimals)));
  const glow = flash === 1
    ? "drop-shadow-[0_0_14px_rgba(163,230,53,0.8)]"
    : flash === -1
      ? "drop-shadow-[0_0_14px_rgba(239,68,68,0.8)]"
      : "drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]";
  const numColor = flash === 1 ? "text-lime-300" : flash === -1 ? "text-red-400" : "text-yellow-300";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: NumericReadout_MIN.base[0] + "rem", minHeight: NumericReadout_MIN.base[1] + "rem" }}
    >
      {/* scanline texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-screen"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.25) 0px, rgba(34,211,238,0.25) 1px, transparent 1px, transparent 3px)" }}
      />
      {/* corner brackets */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(34,211,238,0.6)" />
            <stop offset="100%" stopColor="rgba(217,70,239,0.45)" />
          </linearGradient>
        </defs>
        <path d="M0.8 8 L0.8 0.8 L10 0.8" fill="none" stroke={"url(#" + uid + "-edge)"} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        <path d="M99.2 32 L99.2 39.2 L90 39.2" fill="none" stroke={"url(#" + uid + "-edge)"} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* flash ring */}
      <div
        className={
          "pointer-events-none absolute inset-0 rounded-md transition-all duration-300 ease-out " +
          (flash !== 0 ? "ring-2 ring-fuchsia-400/60 opacity-100" : "ring-0 ring-transparent opacity-0")
        }
      />
      <div className="absolute inset-[10%] min-h-0 min-w-0">
        <FitText wrap={false} className={"font-mono font-black tracking-tight transition-colors duration-200 ease-out " + numColor + " " + glow}>
          <span className="inline-flex items-baseline gap-[0.18em]">
            {props.prefix ? <span className="font-bold tracking-[0.1em] text-cyan-300/80">{props.prefix}</span> : null}
            <span className="tabular-nums">{display}</span>
            {props.suffix ? <span className="font-bold tracking-[0.1em] text-cyan-300/80">{props.suffix}</span> : null}
          </span>
        </FitText>
      </div>
    </div>
  );
}