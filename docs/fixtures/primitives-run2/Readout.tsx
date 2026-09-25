type ReadoutProps = { value?: string | number; children?: React.ReactNode };

export function Readout(props: ReadoutProps) {
  const ReadoutHasValue = props.value !== undefined && props.value !== null && String(props.value).length > 0;
  const ReadoutHasChildren = props.children !== undefined && props.children !== null && props.children !== false;
  const ReadoutContent = ReadoutHasValue ? String(props.value) : "";

  // Track previous value to trigger a subtle "flip / glow" pulse when it changes.
  const ReadoutPrevRef = useRef<string>(ReadoutContent);
  const [ReadoutPulseKey, setReadoutPulseKey] = useState(0);

  useEffect(() => {
    if (!ReadoutHasValue) return;
    if (ReadoutPrevRef.current !== ReadoutContent) {
      ReadoutPrevRef.current = ReadoutContent;
      setReadoutPulseKey((k) => k + 1);
    }
  }, [ReadoutContent, ReadoutHasValue]);

  // ---- Value-string rendering path (font-mono display readout, fit to slot) ----
  const ReadoutValueView = () => {
    const chars = ReadoutContent.length > 0 ? ReadoutContent.length : 1;

    // Fit the whole value on both axes. Width per glyph in a monospace face is
    // ~0.62em; leave margin so nothing clips. Height caps the size too.
    // Using cq units keeps it responsive to the slot on both axes.
    const byWidth = 92 / (chars * 0.62); // → cqw
    const byHeight = 62; // → cqh cap

    return (
      <div
        className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-md bg-neutral-950/80 px-[3%] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]"
        style={{ containerType: "size" } as React.CSSProperties}
      >
        {/* recessed amber horizon glow behind the digits */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_50%_120%,rgba(245,158,11,0.10)_0%,transparent_60%)]" />
        {/* faint scanline seam at bottom to feel like an LCD */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-amber-400/15" />

        {/* value-change flash overlay */}
        <div
          key={ReadoutPulseKey}
          className="pointer-events-none absolute inset-0 bg-amber-400/12 opacity-0 motion-reduce:hidden"
          style={{ animation: "readoutFlash 320ms ease-out forwards" }}
        />

        <span
          key={"txt-" + ReadoutPulseKey}
          className="relative z-10 block max-w-full whitespace-nowrap text-center font-mono font-bold tabular-nums tracking-tight leading-none text-amber-300 [text-shadow:0_0_10px_rgba(245,158,11,0.45)] motion-reduce:[animation:none]"
          style={{
            fontSize: "min(" + byWidth.toFixed(2) + "cqw, " + byHeight + "cqh)",
            animation: "readoutRise 320ms ease-out",
          }}
        >
          {ReadoutContent}
        </span>

        <style>
          {"@keyframes readoutFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}" +
            "@keyframes readoutRise{0%{opacity:0;transform:translateY(18%) scale(0.96)}100%{opacity:1;transform:translateY(0) scale(1)}}"}
        </style>
      </div>
    );
  };

  // ---- Children rendering path (arbitrary face content, scaled to fit) ----
  const ReadoutChildrenView = () => {
    // Measure the natural size of the content and the slot, then scale to fit
    // entirely on both axes (never clipped, never truncated).
    const outerRef = useRef<HTMLDivElement | null>(null);
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (!outer || !inner) return;

      const measure = () => {
        const ow = outer.clientWidth;
        const oh = outer.clientHeight;
        const iw = inner.scrollWidth;
        const ih = inner.scrollHeight;
        if (iw === 0 || ih === 0 || ow === 0 || oh === 0) return;
        const next = Math.min(ow / iw, oh / ih, 1);
        setScale((prev) => (Math.abs(prev - next) > 0.01 ? next : prev));
      };

      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(outer);
      ro.observe(inner);
      return () => ro.disconnect();
    }, []);

    return (
      <div
        ref={outerRef}
        className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-md bg-neutral-950/80 px-[3%] py-[2%] shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_50%_120%,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-amber-400/12" />

        <div
          key={ReadoutPulseKey}
          className="pointer-events-none absolute inset-0 bg-amber-400/10 opacity-0 motion-reduce:hidden"
          style={{ animation: "readoutFlash 320ms ease-out forwards" }}
        />

        <div
          ref={innerRef}
          className="relative z-10 flex max-w-full items-center justify-center text-center font-medium leading-snug text-neutral-200"
          style={{
            transform: "scale(" + scale + ")",
            transformOrigin: "center center",
          }}
        >
          {props.children}
        </div>

        <style>
          {"@keyframes readoutFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}"}
        </style>
      </div>
    );
  };

  // ---- Empty state: clean recessed well, no invented content ----
  const ReadoutEmptyView = () => (
    <div className="relative flex h-full w-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_140%_at_50%_120%,rgba(245,158,11,0.05)_0%,transparent_60%)]" />
      <div className="h-[10%] max-h-1 min-h-[2px] w-[22%] rounded-full bg-neutral-700/50" />
    </div>
  );

  return (
    <div className="h-full w-full min-w-0 min-h-0">
      {ReadoutHasChildren
        ? ReadoutChildrenView()
        : ReadoutHasValue
        ? ReadoutValueView()
        : ReadoutEmptyView()}
    </div>
  );
}