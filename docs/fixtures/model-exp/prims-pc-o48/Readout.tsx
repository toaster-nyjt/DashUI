type ReadoutProps = { value?: string | number; children?: React.ReactNode };

export const Readout_MIN = {"base":[2.5,1.2]};

export function Readout(props: ReadoutProps) {
  const uid = useRef("readout-" + Math.random().toString(36).slice(2)).current;

  const hasValue = props.value !== undefined && props.value !== null && props.value !== "";
  const hasChildren = props.children !== undefined && props.children !== null && props.children !== false;
  const content = hasValue ? props.value : hasChildren ? props.children : null;
  const isEmpty = content === null || content === undefined || content === "";

  // Detect a "time / bpm style" numeric readout so we can lean into the mono glow look.
  const asString = hasValue ? String(props.value) : "";
  const looksNumeric = hasValue && /^[\s0-9:.,+\-%°'"a-zA-Z]*[0-9][\s0-9:.,+\-%°'"a-zA-Z]*$/.test(asString);

  const [pulse, setPulse] = useState(0);
  const prevRef = useRef<React.ReactNode>(content);

  useEffect(() => {
    if (prevRef.current !== content) {
      prevRef.current = content;
      setPulse((p) => p + 1);
    }
  }, [content]);

  const glow = looksNumeric ? "text-amber-400" : "text-stone-100";

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ minWidth: Readout_MIN.base[0] + "rem", minHeight: Readout_MIN.base[1] + "rem" }}
    >
      {/* Recessed well surface */}
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70 overflow-hidden">
        {/* Inner sheen */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-neutral-800/25 via-transparent to-black/50 pointer-events-none" />

        {/* Subtle scanline / display texture */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none opacity-[0.18]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={uid + "-scan"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity="0.0" />
              <stop offset="50%" stopColor="rgb(245 158 11)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0.0" />
            </linearGradient>
            <pattern
              id={uid + "-lines"}
              width="100"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <rect x="0" y="0" width="100" height="1" fill="rgb(120 113 108)" fillOpacity="0.16" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-lines)"} />
          <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-scan)"} />
        </svg>

        {/* Corner accent notch */}
        <div className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent pointer-events-none" />

        {/* Value change flash overlay */}
        <div
          key={"flash-" + pulse}
          className={
            "absolute inset-0 rounded-xl pointer-events-none " +
            (looksNumeric ? "bg-amber-400/12" : "bg-stone-100/8")
          }
          style={{ animation: "readoutFlash 420ms ease-out forwards" }}
        />

        {/* Content region */}
        <div className="absolute inset-[10%]">
          {isEmpty ? (
            <div className="flex h-full w-full items-center justify-center gap-[6%]">
              <span className="block h-[3px] w-[10%] rounded-full bg-stone-700/70" />
              <span className="block h-[3px] w-[16%] rounded-full bg-stone-700/50" />
              <span className="block h-[3px] w-[10%] rounded-full bg-stone-700/70" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FitText
                className={
                  (looksNumeric
                    ? "font-mono font-bold tracking-tight "
                    : "font-sans font-medium tracking-tight leading-snug ") +
                  glow +
                  " transition-colors duration-200 ease-out"
                }
              >
                {content}
              </FitText>
            </div>
          )}
        </div>
      </div>

      <style>{"@keyframes readoutFlash{0%{opacity:0.9}100%{opacity:0}}"}</style>
    </div>
  );
}