type ReadoutProps = { value: string };

export function Readout(props: ReadoutProps) {
  const { value } = props;

  const prevRef = useRef(value);
  const [flashKey, setFlashKey] = useState(0);
  const [prevValue, setPrevValue] = useState(value);
  const [dir, setDir] = useState<"up" | "down" | "same">("same");

  useEffect(() => {
    if (prevRef.current !== value) {
      const a = parseFloat(prevRef.current.replace(/[^0-9.\-]/g, ""));
      const b = parseFloat(value.replace(/[^0-9.\-]/g, ""));
      if (!isNaN(a) && !isNaN(b)) {
        setDir(b > a ? "up" : b < a ? "down" : "same");
      } else {
        setDir("same");
      }
      setPrevValue(prevRef.current);
      prevRef.current = value;
      setFlashKey((k) => k + 1);
    }
  }, [value]);

  // Detect whether the value is "primarily numeric" (BPM, time, %, counters)
  const ReadoutIsNumeric = (s: string) => {
    const digits = (s.match(/[0-9]/g) || []).length;
    return digits > 0 && digits >= Math.floor(s.replace(/\s/g, "").length / 2);
  };

  const numeric = ReadoutIsNumeric(value);

  // Split into segments so each glyph can animate independently on change.
  const chars = Array.from(value);

  return (
    <div className="relative h-full w-full min-w-0 min-h-0 [container-type:size] flex items-center justify-center overflow-hidden select-none">
      {/* recessed glass bed */}
      <div className="absolute inset-0 rounded-[8%/14%] bg-neutral-950/70 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] ring-1 ring-inset ring-white/[0.04]" />

      {/* subtle amber underglow that pulses on change */}
      <div
        key={"glow-" + flashKey}
        className="pointer-events-none absolute inset-0 rounded-[8%/14%] opacity-0 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 120%, rgba(245,158,11,0.22), rgba(245,158,11,0) 60%)",
          animation: "readoutGlow 620ms ease-out",
        }}
      />

      {/* fine scanline sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[8%/14%] opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(180deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0) 2px, rgba(255,255,255,0) 4px)",
        }}
      />

      {/* direction tick — a small edge marker that flicks up/down on numeric change */}
      {dir !== "same" && (
        <div
          key={"tick-" + flashKey}
          className={
            "pointer-events-none absolute right-[3%] top-1/2 -translate-y-1/2 opacity-0 motion-reduce:hidden " +
            (dir === "up" ? "text-emerald-400" : "text-rose-400")
          }
          style={{
            fontSize: "clamp(6px,10cqmin,22px)",
            lineHeight: 1,
            animation: "readoutTick 640ms ease-out",
          }}
        >
          {dir === "up" ? "▲" : "▼"}
        </div>
      )}

      {/* content */}
      <div className="relative z-10 flex min-w-0 items-baseline justify-center px-[6%]">
        {value.length === 0 ? (
          <span
            className="font-mono tabular-nums text-neutral-700 tracking-widest"
            style={{ fontSize: "clamp(9px,26cqmin,44px)", lineHeight: 1 }}
          >
            ––––
          </span>
        ) : (
          <span
            className={
              "min-w-0 truncate " +
              (numeric
                ? "font-mono font-bold tabular-nums tracking-tight text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)]"
                : "font-semibold tracking-tight text-neutral-100")
            }
            style={{
              fontSize: numeric
                ? "clamp(11px,34cqmin,120px)"
                : "clamp(9px,20cqmin,60px)",
              lineHeight: 1.05,
              maxWidth: "100%",
              whiteSpace: "nowrap",
            }}
          >
            {numeric
              ? chars.map((c, i) => (
                  <span
                    key={"c-" + flashKey + "-" + i}
                    className="inline-block motion-reduce:!animate-none"
                    style={{
                      animation: "readoutRoll 460ms cubic-bezier(0.16,1,0.3,1) both",
                      animationDelay: (i * 26) + "ms",
                    }}
                  >
                    {c === " " ? "\u00A0" : c}
                  </span>
                ))
              : value}
          </span>
        )}
      </div>

      {/* top hairline highlight for the glass */}
      <div className="pointer-events-none absolute inset-x-[6%] top-[8%] h-px rounded-full bg-gradient-to-r from-transparent via-amber-200/15 to-transparent" />

      <style>
        {
          "@keyframes readoutGlow{0%{opacity:0}18%{opacity:1}100%{opacity:0}}" +
          "@keyframes readoutTick{0%{opacity:0;transform:translateY(-50%) scale(0.6)}25%{opacity:1;transform:translateY(-50%) scale(1.1)}100%{opacity:0;transform:translateY(-50%) scale(0.9)}}" +
          "@keyframes readoutRoll{0%{opacity:0;transform:translateY(0.5em) rotateX(-55deg);filter:blur(1px)}60%{opacity:1;filter:blur(0)}100%{opacity:1;transform:translateY(0) rotateX(0deg)}}"
        }
      </style>
    </div>
  );
}