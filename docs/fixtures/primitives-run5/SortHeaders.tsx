type SortHeadersProps = {
  options: { id: string; label: string }[];
  value: { field: string; dir: 'asc' | 'desc' };
  onChange: (v: { field: string; dir: 'asc' | 'desc' }) => void;
};

export function SortHeaders(props: SortHeadersProps) {
  const uid = useRef("sortheaders-" + Math.random().toString(36).slice(2)).current;
  const { options, value, onChange } = props;

  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  const handleActivate = (id: string) => {
    if (value.field === id) {
      onChange({ field: id, dir: value.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      onChange({ field: id, dir: 'asc' });
    }
  };

  const SortHeadersArrow = (arrowProps: { active: boolean; dir: 'asc' | 'desc'; hovered: boolean }) => {
    const { active, dir, hovered } = arrowProps;
    const up = active ? dir === 'asc' : true;
    const down = active ? dir === 'desc' : true;
    return (
      <span
        className="relative inline-flex flex-col items-center justify-center transition-all duration-200 ease-out"
        style={{ width: '0.62em', height: '0.9em' }}
        aria-hidden="true"
      >
        {/* Up chevron */}
        <svg
          viewBox="0 0 10 6"
          preserveAspectRatio="xMidYMid meet"
          className="block transition-all duration-200 ease-out"
          style={{
            width: '100%',
            height: '42%',
            opacity: up ? (active ? 1 : hovered ? 0.55 : 0.3) : 0.14,
            transform:
              active && dir === 'asc'
                ? 'translateY(0) scale(1.08)'
                : 'translateY(0) scale(1)',
          }}
        >
          <path
            d="M1 5 L5 1 L9 5"
            fill="none"
            stroke="currentColor"
            strokeWidth={active && dir === 'asc' ? 2 : 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ height: '16%' }} />
        {/* Down chevron */}
        <svg
          viewBox="0 0 10 6"
          preserveAspectRatio="xMidYMid meet"
          className="block transition-all duration-200 ease-out"
          style={{
            width: '100%',
            height: '42%',
            opacity: down ? (active ? 1 : hovered ? 0.55 : 0.3) : 0.14,
            transform:
              active && dir === 'desc'
                ? 'translateY(0) scale(1.08)'
                : 'translateY(0) scale(1)',
          }}
        >
          <path
            d="M1 1 L5 5 L9 1"
            fill="none"
            stroke="currentColor"
            strokeWidth={active && dir === 'desc' ? 2 : 1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch">
      <div
        className="h-full w-full min-w-0 min-h-0 flex items-stretch overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden select-none"
        style={{ WebkitOverflowScrolling: 'touch' as any }}
      >
        <div className="h-full min-w-0 flex items-stretch flex-1 gap-[2px] px-[2px]">
          {options.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <span className="font-medium uppercase tracking-widest leading-none text-[10px] text-stone-600">
                —
              </span>
            </div>
          ) : (
            options.map((opt, i) => {
              const active = value.field === opt.id;
              const isHover = hovered === opt.id;
              const isPress = pressed === opt.id;
              return (
                <button
                  key={"col-" + opt.id + "-" + i}
                  type="button"
                  onPointerEnter={() => setHovered(opt.id)}
                  onPointerLeave={() => {
                    setHovered((h) => (h === opt.id ? null : h));
                    setPressed((p) => (p === opt.id ? null : p));
                  }}
                  onPointerDown={() => setPressed(opt.id)}
                  onPointerUp={() => setPressed((p) => (p === opt.id ? null : p))}
                  onPointerCancel={() => setPressed((p) => (p === opt.id ? null : p))}
                  onClick={() => handleActivate(opt.id)}
                  className={
                    "group relative h-full min-w-0 flex-1 flex items-center overflow-hidden rounded-lg border transition-all duration-200 ease-out touch-none " +
                    (active
                      ? "border-amber-500/40 bg-amber-500/15 shadow-lg shadow-amber-500/30 "
                      : "border-stone-700/60 bg-stone-950/40 shadow-none hover:border-amber-400/50 hover:bg-amber-500/10 ") +
                    (isPress ? "scale-95 brightness-95 " : "")
                  }
                  style={{ paddingLeft: '0.7em', paddingRight: '0.55em' }}
                >
                  {/* active left accent bar */}
                  <span
                    className="absolute left-0 top-0 bottom-0 transition-all duration-300 ease-out"
                    style={{
                      width: '3px',
                      background:
                        'linear-gradient(to bottom, rgba(251,191,36,0.9), rgba(217,119,6,0.6))',
                      opacity: active ? 1 : 0,
                      transform: active ? 'scaleY(1)' : 'scaleY(0.3)',
                    }}
                    aria-hidden="true"
                  />

                  {/* sheen for active */}
                  <span
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
                    style={{
                      background:
                        'linear-gradient(to right, rgba(251,191,36,0.08), transparent 60%)',
                      opacity: active ? 1 : 0,
                    }}
                    aria-hidden="true"
                  />

                  {/* label region */}
                  <span className="relative min-w-0 flex-1 h-full flex items-center overflow-hidden">
                    <span
                      className={
                        "min-w-0 truncate font-semibold uppercase tracking-wider transition-colors duration-200 ease-out text-[11px] " +
                        (active
                          ? "text-amber-200"
                          : isHover
                          ? "text-amber-300"
                          : "text-stone-400")
                      }
                    >
                      {opt.label}
                    </span>
                  </span>

                  {/* sort direction glyph */}
                  <span
                    className={
                      "relative ml-[0.4em] flex items-center justify-center transition-colors duration-200 ease-out " +
                      (active
                        ? "text-amber-300"
                        : isHover
                        ? "text-amber-400"
                        : "text-stone-600")
                    }
                    style={{ fontSize: '11px' }}
                  >
                    <SortHeadersArrow active={active} dir={value.dir} hovered={isHover} />
                  </span>

                  {/* active underline pulse */}
                  <span
                    className="pointer-events-none absolute left-[0.6em] right-[0.5em] bottom-0 transition-all duration-300 ease-out"
                    style={{
                      height: '2px',
                      borderRadius: '2px',
                      background:
                        'linear-gradient(to right, rgba(251,191,36,0.85), rgba(163,230,53,0.5))',
                      opacity: active ? 1 : 0,
                      transform: active ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: value.dir === 'asc' ? 'left center' : 'right center',
                    }}
                    aria-hidden="true"
                  />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}