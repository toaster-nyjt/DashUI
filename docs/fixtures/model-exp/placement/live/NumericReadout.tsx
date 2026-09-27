type NumericReadoutProps = {
  value: number | string;
  animate?: boolean;
  precision?: number;
  prefix?: string;
  suffix?: string;
  tone?: "neutral" | "accent" | "danger";
};

export const NumericReadout_MIN = {"base":[2.5,1.5]};

export function NumericReadout(props: NumericReadoutProps) {
  const uid = useRef("numreadout-" + Math.random().toString(36).slice(2)).current;
  const tone = props.tone || "accent";
  const precision = props.precision ?? 0;
  const isNum = typeof props.value === "number" && isFinite(props.value as number);
  const target = isNum ? (props.value as number) : 0;

  const [shown, setShown] = useState<number>(target);
  const shownRef = useRef<number>(target);
  const rafRef = useRef<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const prevKey = useRef<string>(String(props.value));

  useEffect(() => {
    const key = String(props.value);
    if (key !== prevKey.current) {
      prevKey.current = key;
      setPulse((p) => p + 1);
    }
  }, [props.value]);

  useEffect(() => {
    if (!isNum) return;
    if (!props.animate) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    if (from === target) return;
    const dur = 650;
    const t0 = (typeof performance !== "undefined" ? performance.now() : Date.now());
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * e;
      shownRef.current = v;
      setShown(v);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else rafRef.current = null;
    };
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [target, isNum, props.animate]);

  const toneText =
    tone === "danger"
      ? "text-red-500"
      : tone === "neutral"
      ? "text-cyan-100"
      : "text-yellow-300";
  const toneGlow =
    tone === "danger"
      ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
      : tone === "neutral"
      ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.45)]"
      : "drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]";
  const toneRing =
    tone === "danger"
      ? "rgba(239,68,68,0.35)"
      : tone === "neutral"
      ? "rgba(34,211,238,0.3)"
      : "rgba(253,224,71,0.35)";

  const body = isNum
    ? (props.animate ? shown : target).toLocaleString("en-US", {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      })
    : String(props.value);

  const text = (props.prefix || "") + body + (props.suffix || "");

  const floor = NumericReadout_MIN.base;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        key={"glow-" + pulse}
        className="pointer-events-none absolute inset-0 animate-[ping_0.7s_ease-out_1] opacity-0"
        style={{
          boxShadow: "inset 0 0 18px " + toneRing,
          animationName: "none",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, " +
            toneRing +
            " 0px, " +
            toneRing +
            " 1px, transparent 1px, transparent 4px)",
        }}
      />
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={toneRing} stopOpacity="0.9" />
            <stop offset="100%" stopColor={toneRing} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="2" height="100" fill={"url(#" + uid + "-edge)"} />
      </svg>

      <div
        key={"ghost-" + pulse}
        className={
          "pointer-events-none absolute inset-[10%] opacity-0 " +
          (tone === "danger"
            ? "text-red-400"
            : tone === "neutral"
            ? "text-fuchsia-400"
            : "text-fuchsia-400")
        }
        style={{
          animation: "numreadout-none 0s",
          transform: "translateX(2%)",
        }}
      >
        <FitText className="font-mono font-black tracking-tight" wrap={false}>
          {text}
        </FitText>
      </div>

      <div
        key={"main-" + pulse}
        className="absolute inset-[10%] transition-all duration-200 ease-out"
      >
        <FitText
          className={
            "font-mono font-black tracking-tight transition-colors duration-200 ease-out " +
            toneText +
            " " +
            toneGlow
          }
          wrap={false}
        >
          {text}
        </FitText>
      </div>
    </div>
  );
}