type SelectorProps = { options: { id: string; label: string }[]; value: string; onChange: (id: string) => void };

export function Selector(props: SelectorProps) {
  const { options, value, onChange } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const prevValueRef = useRef<string>(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setPulseKey((k) => k + 1);
    }
  }, [value]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
    };
    measure();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    return () => {
      if (ro) ro.disconnect();
    };
  }, []);

  const count = options.length;

  // Decide layout orientation from slot shape and item count.
  // Wide slot -> row; tall slot -> column; roughly square with many items -> grid.
  const layout = useMemo(() => {
    const w = dims.w || 1;
    const h = dims.h || 1;
    const ratio = w / h;

    if (count <= 0) return { mode: "empty" as const, cols: 1, rows: 1 };

    // Estimate a comfortable per-item minimum footprint.
    // Prefer row when clearly wide, column when clearly tall.
    if (ratio >= 1.9) {
      // Try single row; if items get too cramped, wrap into a grid of rows.
      const idealPerItem = 96; // px comfortable width
      const fitCols = Math.max(1, Math.floor(w / idealPerItem));
      const cols = Math.min(count, Math.max(1, fitCols));
      const rows = Math.ceil(count / cols);
      if (rows <= 1) return { mode: "row" as const, cols: count, rows: 1 };
      return { mode: "grid" as const, cols, rows };
    }

    if (ratio <= 0.62) {
      // Tall: column. If very many items and slot narrow-but-tall, stay column.
      const idealPerItem = 44; // px comfortable height
      const fitRows = Math.max(1, Math.floor(h / idealPerItem));
      if (fitRows >= count) return { mode: "column" as const, cols: 1, rows: count };
      // Not all fit visually — still column but scroll region handles overflow.
      return { mode: "column" as const, cols: 1, rows: count };
    }

    // Roughly square-ish: grid.
    const cols = Math.max(1, Math.min(count, Math.round(Math.sqrt(count * (ratio > 1 ? 1.35 : 0.85)))));
    const rows = Math.ceil(count / cols);
    return { mode: "grid" as const, cols, rows };
  }, [dims.w, dims.h, count]);

  const gridTemplateColumns = useMemo(() => {
    if (layout.mode === "row") return "repeat(" + layout.cols + ", minmax(0, 1fr))";
    if (layout.mode === "grid") return "repeat(" + layout.cols + ", minmax(0, 1fr))";
    return "minmax(0, 1fr)";
  }, [layout]);

  const isScrollable = layout.mode === "column";

  if (count === 0) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full min-w-0 min-h-0 flex items-center justify-center [container-type:size]"
      >
        <div className="rounded-lg border border-neutral-700/60 bg-neutral-950/80 px-3 py-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-600">
            No Effects
          </span>
        </div>
      </div>
    );
  }

  const renderOption = (opt: { id: string; label: string }) => {
    const selected = opt.id === value;
    const hovered = hoverId === opt.id;
    const pressed = pressId === opt.id;

    const base =
      "relative min-w-0 min-h-0 flex items-center justify-center overflow-hidden select-none touch-none rounded-md border transition-all duration-200 ease-out motion-reduce:transition-none";

    const state = selected
      ? "border-amber-400/50 bg-amber-500 text-neutral-950 shadow-[0_0_16px_-2px] shadow-amber-500/60 z-10"
      : hovered
      ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
      : "border-amber-400/20 bg-neutral-800/70 text-neutral-400";

    const pressTransform = pressed
      ? "scale-[0.97]"
      : selected
      ? "scale-[1.02]"
      : hovered
      ? "scale-[1.03] -translate-y-px"
      : "scale-100";

    return (
      <button
        key={opt.id}
        type="button"
        onClick={() => {
          if (opt.id !== value) onChange(opt.id);
        }}
        onPointerEnter={() => setHoverId(opt.id)}
        onPointerLeave={() => {
          setHoverId((h) => (h === opt.id ? null : h));
          setPressId((p) => (p === opt.id ? null : p));
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          setPressId(opt.id);
        }}
        onPointerUp={() => setPressId((p) => (p === opt.id ? null : p))}
        onPointerCancel={() => setPressId((p) => (p === opt.id ? null : p))}
        className={base + " " + state + " " + pressTransform}
        style={{ transitionProperty: "transform, background-color, border-color, box-shadow, color" }}
      >
        {/* Molten sweep accent behind selected */}
        {selected && (
          <span
            key={"pulse-" + opt.id + "-" + pulseKey}
            className="pointer-events-none absolute inset-0 rounded-md motion-reduce:animate-none"
            style={{
              background:
                "radial-gradient(120% 140% at 50% 0%, rgba(255,220,140,0.55) 0%, rgba(255,190,80,0.0) 60%)",
              animation: "none",
            }}
          />
        )}

        {/* Left indicator rail */}
        <span
          className="pointer-events-none absolute left-0 top-0 h-full w-[3px] rounded-l-md transition-all duration-200 motion-reduce:transition-none"
          style={{
            background: selected
              ? "linear-gradient(180deg, rgba(10,10,10,0.9), rgba(10,10,10,0.55))"
              : hovered
              ? "rgba(251,191,36,0.6)"
              : "rgba(251,191,36,0.0)",
            opacity: selected ? 0.9 : hovered ? 1 : 0,
          }}
        />

        {/* Selected pulse ring */}
        {selected && (
          <span className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-neutral-950/25" />
        )}

        <span
          className={
            "relative z-[1] block truncate px-2.5 py-1.5 text-center font-semibold uppercase tracking-widest transition-colors duration-150 " +
            (selected ? "text-neutral-950" : hovered ? "text-amber-200" : "text-neutral-300")
          }
          style={{
            fontSize: "clamp(8px, 2.6cqmin, 12px)",
            lineHeight: 1.05,
            letterSpacing: "0.12em",
          }}
          title={opt.label}
        >
          {opt.label}
        </span>

        {/* subtle top sheen on raised (unselected) */}
        {!selected && (
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-md opacity-40"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.0) 100%)",
            }}
          />
        )}
      </button>
    );
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-w-0 min-h-0 [container-type:size]"
    >
      <div
        className="h-full w-full min-w-0 min-h-0 rounded-lg bg-neutral-950/80 p-1.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]"
      >
        {isScrollable ? (
          <div className="h-full w-full min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-full flex-col gap-1.5">
              {options.map((opt) => (
                <div key={opt.id} className="min-w-0" style={{ minHeight: "clamp(30px, 12cqh, 56px)" }}>
                  {renderOption(opt)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            className="grid h-full w-full min-h-0 min-w-0 gap-1.5"
            style={{
              gridTemplateColumns,
              gridAutoRows: "minmax(0, 1fr)",
            }}
          >
            {options.map((opt) => renderOption(opt))}
          </div>
        )}
      </div>
    </div>
  );
}