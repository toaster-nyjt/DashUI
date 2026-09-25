type ReadoutProps = { value?: string | number; children?: React.ReactNode };

export function Readout(props: ReadoutProps) {
  const uid = useRef("readout-" + Math.random().toString(36).slice(2)).current;
  const content = props.children !== undefined && props.children !== null && props.children !== false
    ? props.children
    : (props.value !== undefined && props.value !== null ? props.value : null);
  const isEmpty = content === null || content === "";

  const prevRef = useRef<string>("");
  const key = typeof content === "string" || typeof content === "number" ? String(content) : "";
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    if (key !== prevRef.current) {
      prevRef.current = key;
      setFlash((f) => f + 1);
    }
  }, [key]);

  const floor = Readout_MIN.base;

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-black/50" />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(251,191,36)" stopOpacity="0.16" />
              <stop offset="55%" stopColor="rgb(251,191,36)" stopOpacity="0.02" />
              <stop offset="100%" stopColor="rgb(251,191,36)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
        <div className="pointer-events-none absolute inset-y-[18%] left-0 w-px bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />
        <div className="pointer-events-none absolute inset-y-[18%] right-0 w-px bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />

        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-px w-[28%] bg-stone-700/70" />
          </div>
        ) : (
          <div
            key={"v-" + flash}
            className="absolute inset-[12%] animate-[readoutIn_320ms_ease-out]"
          >
            <FitText className="font-mono font-bold tracking-tight text-amber-400 transition-all duration-200 ease-out">
              {content as any}
            </FitText>
          </div>
        )}
      </div>
      <style>{"@keyframes readoutIn{0%{opacity:.25;transform:translateY(6%) scale(.98);filter:brightness(1.6)}100%{opacity:1;transform:none;filter:brightness(1)}}"}</style>
    </div>
  );
}

export const Readout_MIN = {"base":[3,1.5]};