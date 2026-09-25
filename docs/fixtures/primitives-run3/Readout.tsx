type ReadoutProps = { value?: string | number; children?: React.ReactNode };
export function Readout(props: ReadoutProps) {
  const uid = useRef("readout-" + Math.random().toString(36).slice(2)).current;

  const hasValue = props.value !== undefined && props.value !== null && props.value !== "";
  const raw = hasValue ? String(props.value) : "";
  const usingValue = hasValue;
  const usingChildren = !usingValue && props.children !== undefined && props.children !== null && props.children !== false;
  const isEmpty = !usingValue && !usingChildren;

  // Track value changes to fire a brief "flicker" animation on updates.
  const prevRef = useRef(raw);
  const [pulse, setPulse] = useState(false);
  const [scanKey, setScanKey] = useState(0);
  useEffect(() => {
    if (usingValue && prevRef.current !== raw) {
      prevRef.current = raw;
      setPulse(true);
      setScanKey((k) => k + 1);
      const t = setTimeout(() => setPulse(false), 260);
      return () => clearTimeout(t);
    }
    prevRef.current = raw;
  }, [raw, usingValue]);

  // Split value into character cells so each glyph can animate independently.
  const chars = usingValue ? raw.split("") : [];
  const longest = Math.max(1, raw.length);

  // Font size derived from character count so short and long values both fill nicely.
  // ~0.62em advance per mono char; cap by height. Values expressed in container units.
  const widthPerChar = 62 / longest; // in cqw, with a little side padding budget baked in
  const fontFromWidth = Math.min(widthPerChar, 46);
  const fontFromHeight = 52; // cap by container height (cqh)
  const displayFont = Math.max(9, Math.min(fontFromWidth, fontFromHeight));

  const ReadoutCell = (cprops: { ch: string; i: number }) => {
    const ch = cprops.ch;
    const isSpace = ch === " ";
    const isSep = ch === ":" || ch === "." || ch === "%" || ch === "/" || ch === "-";
    return (
      <span
        key={"c-" + cprops.i}
        style={{
          animationDelay: pulse ? cprops.i * 14 + "ms" : "0ms",
          minWidth: isSpace ? "0.34em" : undefined,
        }}
        className={
          "relative inline-block text-center tabular-nums " +
          (isSpace ? "" : "min-w-[0.6em] ") +
          (isSep ? "text-amber-500/70 " : "text-amber-300 ") +
          (pulse ? "motion-safe:animate-[readoutGlyph_260ms_ease-out]" : "")
        }
      >
        {isSpace ? "\u00A0" : ch}
      </span>
    );
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] relative select-none">
      <style>{
        "@keyframes readoutGlyph{0%{transform:translateY(-14%) scale(1.14);opacity:0;filter:blur(0.6px)}45%{opacity:1}100%{transform:translateY(0) scale(1);opacity:1;filter:blur(0)}}" +
        "@keyframes readoutScan_" + uid + "{0%{transform:translateX(-120%);opacity:0}18%{opacity:0.9}100%{transform:translateX(120%);opacity:0}}" +
        "@keyframes readoutIdle_" + uid + "{0%,100%{opacity:0.5}50%{opacity:0.85}}"
      }</style>

      {/* Recessed readout well */}
      <div className="absolute inset-0 rounded-lg bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] border border-neutral-700/60 overflow-hidden">
        {/* faint horizontal scanlines for a screen feel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, rgba(251,191,36,0.10) 0px, rgba(251,191,36,0.10) 1px, transparent 1px, transparent 4px)",
          }}
        />
        {/* subtle inner amber vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(120% 140% at 50% 20%, rgba(245,158,11,0.10) 0%, rgba(0,0,0,0) 60%)",
          }}
        />

        {/* value-change sweep */}
        {usingValue && (
          <div
            key={"scan-" + scanKey}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 motion-reduce:hidden"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.22) 50%, transparent 100%)",
              animation: pulse ? "readoutScan_" + uid + " 320ms ease-out 1" : "none",
            }}
          />
        )}

        {/* pulse glow ring on change */}
        {usingValue && (
          <div
            className={
              "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-200 " +
              (pulse ? "opacity-100 shadow-[0_0_16px_-2px] shadow-amber-500/60" : "opacity-0")
            }
          />
        )}

        {/* content region */}
        <div className="absolute inset-0 flex items-center justify-center px-[3%] py-[4%]">
          {usingValue && (
            <div
              className="flex w-full items-center justify-center leading-none font-mono font-bold tracking-tight"
              style={{ fontSize: displayFont + "cqmin", filter: "drop-shadow(0 0 6px rgba(245,158,11,0.35))" }}
            >
              <span className="inline-flex items-baseline whitespace-nowrap">
                {chars.map((ch, i) => (
                  <ReadoutCell ch={ch} i={i} key={"cell-" + i} />
                ))}
              </span>
            </div>
          )}

          {usingChildren && (
            <div
              className="flex h-full w-full items-center justify-center text-center font-medium text-amber-200 leading-snug"
              style={{ fontSize: "min(15cqh, 8cqw)" }}
            >
              <div className="max-w-full [&_*]:min-w-0">{props.children}</div>
            </div>
          )}

          {isEmpty && (
            <div className="flex items-center justify-center gap-[2%]" style={{ opacity: 0.55 }}>
              {[0, 1, 2].map((d) => (
                <span
                  key={"dot-" + d}
                  className="inline-block rounded-full bg-amber-500/60 motion-reduce:animate-none"
                  style={{
                    width: "3.5cqmin",
                    height: "3.5cqmin",
                    animation: "readoutIdle_" + uid + " 1.6s ease-in-out infinite",
                    animationDelay: d * 220 + "ms",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* top glass sheen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
    </div>
  );
}