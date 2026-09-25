type SortControlProps = { field: string; active: boolean; direction: 'asc' | 'desc'; onSort: (field: string) => void };
export function SortControl(props: SortControlProps) {
  const { field, active, direction, onSort } = props;

  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef<{ active: boolean; direction: 'asc' | 'desc' }>({ active, direction });

  useEffect(() => {
    const prev = prevRef.current;
    if (active && (!prev.active || prev.direction !== direction)) {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 420);
      prevRef.current = { active, direction };
      return () => clearTimeout(id);
    }
    prevRef.current = { active, direction };
  }, [active, direction]);

  const isAsc = direction === 'asc';

  // Bar heights that read as an ascending / descending staircase.
  const barsAsc = [0.34, 0.58, 0.82, 1.0];
  const barsDesc = [1.0, 0.82, 0.58, 0.34];
  const bars = isAsc ? barsAsc : barsDesc;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerCancel={() => setPressed(false)}
      className={
        "group relative flex h-full w-full min-w-0 min-h-0 select-none items-center justify-between overflow-hidden rounded-md px-2.5 py-1.5 text-left [container-type:size] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
        (active
          ? "bg-amber-500/[0.12] text-amber-300 "
          : "bg-transparent text-neutral-400 hover:bg-amber-500/[0.07] hover:text-amber-200 ")
      }
    >
      {/* animated flash sheen on direction / activation change */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-amber-400/25 to-transparent transition-opacity duration-200 motion-reduce:hidden " +
          (flash ? "opacity-100 animate-[sortSheen_0.42s_ease-out]" : "opacity-0")
        }
        style={{ transform: "translateX(-120%)" }}
      />

      {/* active bottom seam / underline that grows in */}
      <span
        aria-hidden
        className={
          "pointer-events-none absolute bottom-0 left-0 h-[2px] rounded-full bg-amber-400 transition-all duration-300 ease-out " +
          (active
            ? "w-full opacity-90 shadow-[0_0_10px_-1px] shadow-amber-500/70 "
            : hovered
            ? "w-full opacity-30 "
            : "w-0 opacity-0 ")
        }
      />

      {/* label */}
      <span
        className={
          "min-w-0 truncate pr-2 text-[clamp(9px,26cqh,15px)] font-semibold uppercase leading-none tracking-widest transition-all duration-200 " +
          (active ? "tracking-[0.18em]" : "")
        }
      >
        {field}
      </span>

      {/* direction indicator — a mini equalizer staircase + chevron */}
      <span
        className={
          "relative flex shrink-0 items-center gap-[clamp(2px,4cqmin,5px)] transition-transform duration-200 ease-out " +
          (pressed ? "scale-90" : hovered && !active ? "scale-105" : "scale-100")
        }
        style={{ height: "70%" }}
      >
        {/* staircase bars */}
        <span className="flex h-full items-end gap-[clamp(1px,2cqmin,3px)]">
          {bars.map((h, i) => {
            const lit = active || hovered;
            return (
              <span
                key={"bar-" + i}
                className={
                  "w-[clamp(2px,3cqmin,4px)] rounded-[1px] transition-all duration-200 ease-out " +
                  (active
                    ? "bg-amber-400 shadow-[0_0_6px_-1px] shadow-amber-500/70 "
                    : lit
                    ? "bg-amber-300/70 "
                    : "bg-neutral-600 ")
                }
                style={{
                  height: (lit ? h * 100 : Math.max(18, h * 42)) + "%",
                  transitionDelay: (active ? i * 40 : 0) + "ms",
                }}
              />
            );
          })}
        </span>

        {/* chevron flips between asc/desc */}
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          className={
            "h-[clamp(9px,55cqh,20px)] w-[clamp(9px,55cqh,20px)] transition-all duration-300 ease-out " +
            (active
              ? "text-amber-400 opacity-100 "
              : hovered
              ? "text-amber-300/70 opacity-80 "
              : "text-neutral-600 opacity-60 ") +
            (isAsc ? "rotate-0 " : "rotate-180 ")
          }
          style={{
            filter: active ? "drop-shadow(0 0 5px rgba(245,158,11,0.55))" : "none",
          }}
        >
          <path
            d="M12 6 L19 15 L14 15 L14 20 L10 20 L10 15 L5 15 Z"
            fill="currentColor"
          />
        </svg>
      </span>

      <style>
        {"@keyframes sortSheen{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}"}
      </style>
    </button>
  );
}