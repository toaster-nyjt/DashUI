type ReadoutProps = { value?: string | number; children?: React.ReactNode };

export function Readout(props: ReadoutProps) {
  const uid = useRef("readout-" + Math.random().toString(36).slice(2)).current;
  const floor = Readout_MIN.base;
  const hasValue = props.value !== undefined && props.value !== null && props.value !== "";
  const content = hasValue ? props.value : props.children;
  const isEmpty = content === undefined || content === null || content === "";

  const key = hasValue ? String(props.value) : "";
  const [flash, setFlash] = useState(0);
  const prev = useRef(key);
  useEffect(() => {
    if (prev.current !== key) {
      prev.current = key;
      setFlash((f) => f + 1);
    }
  }, [key]);

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-black/50" />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <defs>
            <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.10" />
              <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.0" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
        </svg>
        <div
          key={"flash-" + flash}
          className="pointer-events-none absolute inset-0 bg-amber-400/10 opacity-0"
          style={{ animation: flash ? "none" : undefined, transition: "opacity 300ms ease-out" }}
          ref={(el) => {
            if (el && flash) {
              el.style.opacity = "1";
              requestAnimationFrame(() => {
                if (el) el.style.opacity = "0";
              });
            }
          }}
        />
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
      </div>

      <div className="absolute inset-[9%]">
        {isEmpty ? (
          <div className="flex h-full w-full items-center justify-center gap-2">
            <span className="h-1 w-1 rounded-full bg-stone-700" />
            <span className="h-1 w-1 rounded-full bg-stone-700" />
            <span className="h-1 w-1 rounded-full bg-stone-700" />
          </div>
        ) : (
          <FitText className="font-mono font-bold tracking-tight text-amber-400 transition-all duration-200 ease-out">
            {content}
          </FitText>
        )}
      </div>
    </div>
  );
}

export const Readout_MIN = {"base":[2.5,1.25]};