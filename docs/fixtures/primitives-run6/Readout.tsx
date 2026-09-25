type ReadoutProps = { value?: string | number; children?: React.ReactNode };

export function Readout(props: ReadoutProps) {
  const uid = useRef("readout-" + Math.random().toString(36).slice(2)).current;

  const hasValue = props.value !== undefined && props.value !== null && props.value !== "";
  const hasChildren = props.children !== undefined && props.children !== null;
  const content: React.ReactNode = hasValue ? props.value : props.children;
  const empty = !hasValue && !hasChildren;

  // Detect whether the primary content is a numeric-style readout (time/BPM) vs. metadata text.
  const raw = hasValue ? String(props.value) : "";
  const numericLike =
    hasValue &&
    !hasChildren &&
    /^[\s\-+0-9.:%/°'"a-zA-Z]*$/.test(raw) &&
    /[0-9]/.test(raw) &&
    raw.replace(/[^a-zA-Z]/g, "").length <= 4;

  const displayClass = numericLike
    ? "font-mono font-bold tracking-tight text-amber-400"
    : "font-mono font-bold tracking-tight text-stone-100";

  const [pulse, setPulse] = useState(0);
  const prevRef = useRef<React.ReactNode>(undefined);
  useEffect(() => {
    if (empty) return;
    const key = hasValue ? String(props.value) : "__node__";
    if (prevRef.current !== key) {
      prevRef.current = key;
      setPulse((p) => p + 1);
    }
  }, [props.value, props.children, empty, hasValue]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: Readout_MIN.base[0] + "rem", minHeight: Readout_MIN.base[1] + "rem" }}
    >
      {/* Recessed well */}
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70" />

      {/* Inner sheen */}
      <div className="pointer-events-none absolute inset-[3%] rounded-lg bg-gradient-to-b from-neutral-800/30 to-black/40" />

      {/* Scanline / bezel accent glow along the top edge */}
      <div className="pointer-events-none absolute inset-x-[4%] top-[6%] h-[1px] bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

      {/* Corner ticks (decorative, readout-instrument feel) */}
      <div className="pointer-events-none absolute inset-0">
        <span className="absolute left-[5%] top-[10%] h-[14%] w-[1px] bg-amber-500/20" />
        <span className="absolute left-[5%] top-[10%] h-[1px] w-[6%] bg-amber-500/20" />
        <span className="absolute right-[5%] bottom-[12%] h-[14%] w-[1px] bg-amber-500/20" />
        <span className="absolute right-[5%] bottom-[12%] h-[1px] w-[6%] bg-amber-500/20" />
      </div>

      {/* Soft breathing glow behind content on value change */}
      <div
        key={"glow-" + pulse}
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          animation: empty ? "none" : uid + "-flash 480ms ease-out",
        }}
      />

      {/* Content region */}
      {empty ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-[6%]">
            <span className="block h-[2px] w-[10%] min-w-[6px] rounded-full bg-stone-700/70" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-stone-600">
              ——
            </span>
            <span className="block h-[2px] w-[10%] min-w-[6px] rounded-full bg-stone-700/70" />
          </div>
        </div>
      ) : (
        <div
          key={"content-" + pulse}
          className="absolute inset-[14%] flex items-center justify-center"
          style={{ animation: uid + "-settle 420ms cubic-bezier(0.22,1,0.36,1)" }}
        >
          <FitText className={displayClass + " transition-colors duration-200 ease-out drop-shadow-[0_0_6px_rgba(251,191,36,0.15)]"}>
            {content}
          </FitText>
        </div>
      )}

      {/* Live indicator dot (bottom-right) for active readouts */}
      {!empty && (
        <span className="pointer-events-none absolute bottom-[8%] right-[7%] block h-[6%] max-h-[5px] min-h-[3px] w-[6%] max-w-[5px] min-w-[3px] rounded-full bg-amber-500/60 shadow-[0_0_5px_rgba(251,191,36,0.6)]">
          <span
            className="absolute inset-0 rounded-full bg-amber-400"
            style={{ animation: uid + "-blink 2200ms ease-in-out infinite" }}
          />
        </span>
      )}

      <style>{
        "@keyframes " + uid + "-flash{0%{opacity:0;box-shadow:inset 0 0 18px rgba(251,191,36,0.32)}100%{opacity:0;box-shadow:inset 0 0 0 rgba(251,191,36,0)}}" +
        "@keyframes " + uid + "-settle{0%{opacity:0;transform:translateY(6%) scale(0.985)}100%{opacity:1;transform:translateY(0) scale(1)}}" +
        "@keyframes " + uid + "-blink{0%,100%{opacity:0.35}50%{opacity:1}}"
      }</style>
    </div>
  );
}

export const Readout_MIN = {"base":[3,1.25]};