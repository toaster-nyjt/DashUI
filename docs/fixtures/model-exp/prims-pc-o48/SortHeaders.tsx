type SortHeadersProps = { options: { id: string; label: string }[]; value: { field: string; dir: 'asc' | 'desc' }; onChange: (v: { field: string; dir: 'asc' | 'desc' }) => void };
export const SortHeaders_MIN = {"base":[6,1.75]};
export function SortHeaders(props: SortHeadersProps) {
  const { options, value, onChange } = props;
  const uid = useRef("sortheaders-" + Math.random().toString(36).slice(2)).current;
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const floor = (SortHeaders_MIN as any).base;

  const handleActivate = (id: string) => {
    if (value.field === id) {
      onChange({ field: id, dir: value.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onChange({ field: id, dir: 'asc' });
    }
  };

  const SortHeadersArrow = (p: { active: boolean; dir: 'asc' | 'desc'; hot: boolean }) => {
    const rot = p.dir === 'desc' ? 180 : 0;
    const stroke = p.active ? "url(#" + uid + "-arrowgrad)" : (p.hot ? "#fbbf24" : "#78716c");
    return (
      <span
        className="relative inline-flex h-full items-center justify-center transition-all duration-200 ease-out"
        style={{ width: "0.75em", opacity: p.active ? 1 : (p.hot ? 0.9 : 0.35) }}
      >
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          className="h-[0.72em] w-[0.72em] transition-transform duration-200 ease-out"
          style={{ transform: "rotate(" + rot + "deg)" }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={uid + "-arrowgrad"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <path
            d="M12 5 L12 19 M6 11 L12 5 L18 11"
            fill="none"
            stroke={stroke}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  };

  return (
    <div
      className="relative flex h-full w-full items-stretch overflow-hidden rounded-lg border border-stone-800/70 bg-stone-950/80"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/[0.04] via-transparent to-transparent" />
      {options.length === 0 ? (
        <div className="relative flex h-full w-full items-center justify-center px-2">
          <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600 truncate">—</span>
        </div>
      ) : (
        <div className="relative flex h-full w-full items-stretch">
          {options.map((opt, i) => {
            const active = value.field === opt.id;
            const hot = hovered === opt.id;
            const isPressed = pressed === opt.id;
            return (
              <button
                key={"col-" + opt.id + "-" + i}
                type="button"
                onClick={() => handleActivate(opt.id)}
                onPointerEnter={() => setHovered(opt.id)}
                onPointerLeave={() => { setHovered((h) => (h === opt.id ? null : h)); setPressed((pp) => (pp === opt.id ? null : pp)); }}
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setPressed(opt.id); }}
                onPointerUp={() => setPressed((pp) => (pp === opt.id ? null : pp))}
                className={
                  "group relative flex h-full min-w-0 flex-1 select-none items-center gap-[0.4em] overflow-hidden px-[0.55em] text-left transition-all duration-200 ease-out touch-none " +
                  (i > 0 ? "border-l border-stone-800/70 " : "") +
                  (active
                    ? "bg-amber-500/12 "
                    : (hot ? "bg-amber-500/10 " : "bg-transparent "))
                }
                style={{ transform: isPressed ? "scale(0.97)" : "scale(1)" }}
              >
                {active && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-amber-500/40 via-amber-400 to-amber-500/40 shadow-lg shadow-amber-500/40" />
                )}
                {active && (
                  <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-500/30" />
                )}
                <span className="relative flex min-w-0 flex-1 items-center overflow-hidden">
                  <FitText
                    align="start"
                    wrap={false}
                    className={
                      "font-semibold uppercase tracking-wider leading-none transition-colors duration-200 ease-out " +
                      (active ? "text-amber-200" : (hot ? "text-stone-100" : "text-stone-400"))
                    }
                  >
                    {opt.label}
                  </FitText>
                </span>
                <span className="relative flex h-full flex-none items-center" style={{ width: "0.9em" }}>
                  <SortHeadersArrow active={active} dir={active ? value.dir : 'asc'} hot={hot} />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}