type OptionSelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };

export function OptionSelector(props: OptionSelectorProps) {
  const { options, value, onChange } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);
  const [thumb, setThumb] = useState<{ x: number; y: number; w: number; h: number; ready: boolean }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    ready: false,
  });

  const selectedIndex = useMemo(() => {
    const i = options.findIndex((o) => o.id === value);
    return i;
  }, [options, value]);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const el = itemRefs.current[value];
    if (!el) {
      setThumb((t) => ({ ...t, ready: false }));
      return;
    }
    const trackRect = track.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setThumb({
      x: elRect.left - trackRect.left + track.scrollLeft,
      y: elRect.top - trackRect.top + track.scrollTop,
      w: elRect.width,
      h: elRect.height,
      ready: true,
    });
  }, [value]);

  useEffect(() => {
    measure();
  }, [measure, options, value]);

  useEffect(() => {
    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);
    if (trackRef.current) ro.observe(trackRef.current);
    Object.values(itemRefs.current).forEach((el) => {
      if (el) ro.observe(el);
    });
    return () => ro.disconnect();
  }, [measure, options]);

  const OptionSelectorEmpty = () => (
    <div className="flex h-full w-full items-center justify-center px-3">
      <div className="flex items-center gap-2 text-neutral-600">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-700 animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-widest">No FX</span>
      </div>
    </div>
  );

  if (!options || options.length === 0) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full min-w-0 min-h-0 [container-type:size]"
      >
        <OptionSelectorEmpty />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-w-0 min-h-0 [container-type:size] flex items-stretch"
    >
      <div
        ref={trackRef}
        className="relative flex w-full min-w-0 items-stretch gap-1 overflow-x-auto overflow-y-hidden rounded-lg border border-neutral-700/60 bg-neutral-950/80 p-1 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-none"
      >
        {/* Sliding molten thumb */}
        {thumb.ready && (
          <div
            className="pointer-events-none absolute z-0 rounded-md bg-rose-500/20 border border-rose-400/40 shadow-[0_0_16px_-2px] shadow-rose-500/60 transition-all duration-300 ease-out motion-reduce:transition-none"
            style={{
              transform: "translate3d(" + thumb.x + "px," + thumb.y + "px,0)",
              width: thumb.w + "px",
              height: thumb.h + "px",
            }}
          >
            {/* Inner sheen */}
            <div className="absolute inset-0 rounded-md bg-gradient-to-b from-rose-300/15 to-transparent" />
            {/* Beat-sync top pulse bar */}
            <div className="absolute inset-x-1.5 top-0 h-[2px] rounded-full bg-rose-300/70 animate-pulse motion-reduce:animate-none" />
          </div>
        )}

        {options.map((opt, i) => {
          const isSelected = opt.id === value;
          const isHover = hoverId === opt.id;
          const isPress = pressId === opt.id;
          const isNeighbor =
            selectedIndex >= 0 && (i === selectedIndex - 1 || i === selectedIndex + 1);

          return (
            <button
              key={"opt-" + opt.id}
              ref={(el) => {
                itemRefs.current[opt.id] = el;
              }}
              type="button"
              onClick={() => onChange(opt.id)}
              onPointerEnter={() => setHoverId(opt.id)}
              onPointerLeave={() => {
                setHoverId((h) => (h === opt.id ? null : h));
                setPressId((p) => (p === opt.id ? null : p));
              }}
              onPointerDown={() => setPressId(opt.id)}
              onPointerUp={() => setPressId((p) => (p === opt.id ? null : p))}
              onPointerCancel={() => setPressId((p) => (p === opt.id ? null : p))}
              className={
                "group relative z-10 flex min-w-0 flex-1 select-none items-center justify-center rounded-md px-2.5 py-1.5 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
                (isPress ? "scale-[0.96] " : isHover && !isSelected ? "scale-[1.03] " : "scale-100 ") +
                (isSelected
                  ? ""
                  : isHover
                  ? "bg-rose-500/10 "
                  : "")
              }
            >
              {/* Left index tick */}
              <span
                className={
                  "mr-1.5 hidden h-3.5 w-[3px] shrink-0 rounded-full transition-all duration-200 ease-out [@container(min-width:220px)]:block motion-reduce:transition-none " +
                  (isSelected
                    ? "bg-rose-300 shadow-[0_0_8px_0] shadow-rose-400/70"
                    : isHover
                    ? "bg-rose-400/50"
                    : isNeighbor
                    ? "bg-neutral-600"
                    : "bg-neutral-700/70")
                }
              />
              <span
                className={
                  "min-w-0 truncate text-[11px] font-semibold uppercase tracking-widest transition-colors duration-200 ease-out motion-reduce:transition-none " +
                  (isSelected
                    ? "text-rose-200"
                    : isHover
                    ? "text-rose-300/90"
                    : "text-neutral-400 group-hover:text-neutral-300")
                }
              >
                {opt.label}
              </span>
              {/* Selected active dot on the right */}
              <span
                className={
                  "ml-1.5 hidden h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ease-out [@container(min-width:160px)]:block motion-reduce:transition-none " +
                  (isSelected
                    ? "scale-100 bg-rose-400 shadow-[0_0_10px_-1px] shadow-rose-500/80 opacity-100"
                    : "scale-0 opacity-0")
                }
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}