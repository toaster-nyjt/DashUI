type ReadoutProps = { value?: string | number; children?: React.ReactNode };

export function Readout(props: ReadoutProps) {
  const ReadoutUid = useRef("readout-" + Math.random().toString(36).slice(2)).current;

  const hasValue = props.value !== undefined && props.value !== null && props.value !== "";
  const content = hasValue ? props.value : props.children;
  const isEmpty =
    content === undefined ||
    content === null ||
    content === false ||
    (typeof content === "string" && content.length === 0);

  // Subtle "live" flicker keyed to content changes: re-trigger a brief pulse on the glow.
  const contentKey =
    typeof props.value === "string" || typeof props.value === "number"
      ? String(props.value)
      : "node";
  const [pulse, setPulse] = useState(0);
  const prevKey = useRef(contentKey);
  useEffect(() => {
    if (prevKey.current !== contentKey) {
      prevKey.current = contentKey;
      setPulse((p) => p + 1);
    }
  }, [contentKey]);

  return (
    <div className="relative h-full w-full min-w-0 min-h-0 overflow-hidden">
      {/* Recessed readout well */}
      <div className="absolute inset-0 rounded-xl border border-stone-800/70 bg-stone-950/80 shadow-inner shadow-black/70" />

      {/* Warm inner sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-amber-500/[0.06] via-transparent to-black/40" />

      {/* Top edge highlight line (amber, low opacity — never white) */}
      <div className="pointer-events-none absolute inset-x-[6%] top-0 h-px bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

      {/* Faint horizontal scanline grid for a "display" feel */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(120,113,108,0.12) 2px, rgba(120,113,108,0.12) 3px)",
        }}
      />

      {/* Corner accent brackets */}
      <div className="pointer-events-none absolute left-[3%] top-[10%] h-[22%] w-px bg-amber-400/20" />
      <div className="pointer-events-none absolute left-[3%] top-[10%] h-px w-[8%] bg-amber-400/20" />
      <div className="pointer-events-none absolute right-[3%] bottom-[10%] h-[22%] w-px bg-amber-400/20" />
      <div className="pointer-events-none absolute right-[3%] bottom-[10%] h-px w-[8%] bg-amber-400/20" />

      {/* Live pulse overlay: re-mounted on content change to fire a one-shot fade */}
      {!isEmpty && (
        <div
          key={"pulse-" + ReadoutUid + "-" + pulse}
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 50%, rgba(251,191,36,0.14), transparent 70%)",
            animation: "readoutPulse-" + ReadoutUid + " 600ms ease-out forwards",
          }}
        />
      )}

      <style>
        {"@keyframes readoutPulse-" +
          ReadoutUid +
          " { 0% { opacity: 0.9; } 100% { opacity: 0; } }"}
      </style>

      {/* Content region */}
      <div className="absolute inset-[12%] flex items-center justify-center">
        {isEmpty ? (
          <ReadoutEmpty uid={ReadoutUid} />
        ) : (
          <FitText
            className="font-mono font-bold tracking-tight text-amber-400"
            wrap={false}
          >
            {content}
          </FitText>
        )}
      </div>
    </div>
  );

  function ReadoutEmpty(sub: { uid: string }) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-[6%]">
        {[0, 1, 2].map((i) => (
          <span
            key={"dash-" + sub.uid + "-" + i}
            className="block h-[10%] min-h-0 w-[14%] rounded-full bg-stone-700/70"
            style={{
              animation:
                "readoutDash-" +
                sub.uid +
                " 1.6s ease-in-out infinite",
              animationDelay: i * 0.18 + "s",
            }}
          />
        ))}
        <style>
          {"@keyframes readoutDash-" +
            sub.uid +
            " { 0%,100% { opacity: 0.3; } 50% { opacity: 0.8; } }"}
        </style>
      </div>
    );
  }
}