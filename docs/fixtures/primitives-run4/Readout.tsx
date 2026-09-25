type ReadoutProps = { value?: string | number; children?: React.ReactNode };

export function Readout(props: ReadoutProps) {
  const uid = useRef("readout-" + Math.random().toString(36).slice(2)).current;

  const hasValue = props.value !== undefined && props.value !== null && props.value !== "";
  const hasChildren = props.children !== undefined && props.children !== null && props.children !== false;
  const isEmpty = !hasValue && !hasChildren;

  // Track content changes to fire a subtle "refresh" flash — the readout feels
  // alive as its numbers tick. Purely transient/visual state, not the value itself.
  const displayKey = hasValue
    ? "v:" + String(props.value)
    : hasChildren
    ? "c"
    : "empty";
  const prevKey = useRef(displayKey);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (prevKey.current !== displayKey) {
      prevKey.current = displayKey;
      setPulse((p) => p + 1);
    }
  }, [displayKey]);

  return (
    <div className="relative h-full w-full min-w-0 min-h-0 overflow-hidden rounded-lg">
      {/* Recessed molten-metal well */}
      <div className="absolute inset-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]" />
      {/* Warm inner ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg bg-[radial-gradient(120%_140%_at_50%_-20%,rgba(251,191,36,0.10)_0%,rgba(251,191,36,0.03)_40%,transparent_72%)]"
      />
      {/* Fine scanline sheen along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-lg bg-gradient-to-b from-amber-400/25 to-transparent" />
      {/* Seam border */}
      <div className="pointer-events-none absolute inset-0 rounded-lg border border-white/[0.06]" />

      {/* Content refresh flash overlay */}
      {!isEmpty && (
        <div
          key={"flash-" + pulse}
          className="pointer-events-none absolute inset-0 rounded-lg motion-reduce:hidden"
          style={{
            animation: "readoutFlash-" + uid + " 480ms ease-out",
            background:
              "radial-gradient(120% 140% at 50% 50%, rgba(251,191,36,0.16) 0%, transparent 70%)",
          }}
        />
      )}

      <style>
        {"@keyframes readoutFlash-" +
          uid +
          " { 0% { opacity: 0.9; } 100% { opacity: 0; } }" +
          " @keyframes readoutBlink-" +
          uid +
          " { 0%,100% { opacity: 0.65; } 50% { opacity: 0.15; } }"}
      </style>

      {/* Display region — always fed through FitText */}
      <div className="absolute inset-[10%] flex items-center justify-center">
        {isEmpty ? (
          <div className="flex h-full w-full items-center justify-center gap-[3%]">
            <span
              className="block h-[26%] w-[3%] max-w-[6px] rounded-full bg-amber-400/40"
              style={{ animation: "readoutBlink-" + uid + " 1.4s ease-in-out infinite" }}
            />
            <span
              className="block h-[26%] w-[3%] max-w-[6px] rounded-full bg-amber-400/40"
              style={{
                animation: "readoutBlink-" + uid + " 1.4s ease-in-out infinite",
                animationDelay: "0.7s",
              }}
            />
          </div>
        ) : hasValue ? (
          <FitText className="font-mono font-bold tabular-nums tracking-tight leading-none text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.35)] transition-colors duration-200">
            {String(props.value)}
          </FitText>
        ) : (
          <FitText
            wrap
            className="font-mono font-semibold tabular-nums tracking-tight leading-tight text-amber-300/95 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] transition-colors duration-200"
          >
            {props.children}
          </FitText>
        )}
      </div>
    </div>
  );
}