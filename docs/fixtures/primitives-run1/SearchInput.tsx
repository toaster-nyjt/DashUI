type SearchInputProps = { value: string; onChange: (v: string) => void; placeholder?: string };

export function SearchInput(props: SearchInputProps) {
  const SearchInputInputRef = useRef<HTMLInputElement | null>(null);
  const [SearchInputFocused, SearchInputSetFocused] = useState(false);
  const [SearchInputHover, SearchInputSetHover] = useState(false);

  const SearchInputHasValue = props.value.length > 0;
  const SearchInputActive = SearchInputFocused || SearchInputHover;

  const SearchInputBars = useMemo(() => [0, 1, 2, 3, 4, 5, 6], []);

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] relative flex items-stretch">
      <div
        onPointerEnter={() => SearchInputSetHover(true)}
        onPointerLeave={() => SearchInputSetHover(false)}
        onPointerDown={() => {
          const el = SearchInputInputRef.current;
          if (el) {
            try {
              const p = el.selectionStart;
            } catch (e) {}
          }
        }}
        className={
          "group relative flex h-full w-full min-w-0 items-center gap-[3cqmin] rounded-lg border bg-neutral-950/80 px-[3.5cqmin] transition-all duration-200 ease-out shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] " +
          (SearchInputFocused
            ? "border-amber-400/50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_0_16px_-2px_rgba(245,158,11,0.55)]"
            : SearchInputHover
            ? "border-amber-400/25"
            : "border-neutral-700/60")
        }
      >
        {/* Molten scan sweep across the well when active */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
          <div
            className={
              "absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent transition-opacity duration-300 " +
              (SearchInputFocused ? "opacity-100 motion-reduce:opacity-0" : "opacity-0")
            }
            style={{
              animation: SearchInputFocused ? "searchinput-sweep 2.4s linear infinite" : "none",
            }}
          />
        </div>

        {/* Search glyph / equalizer indicator */}
        <div
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: "min(22cqmin, 60%)", height: "min(50cqmin, 100%)" }}
        >
          {/* Magnifier — shown when idle/empty */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            className={
              "absolute h-[70%] w-[70%] transition-all duration-300 ease-out " +
              (SearchInputFocused
                ? "scale-75 opacity-0 rotate-45"
                : "scale-100 opacity-100 rotate-0")
            }
          >
            <circle
              cx="10.5"
              cy="10.5"
              r="6.5"
              stroke={SearchInputActive ? "#fbbf24" : "#a3a3a3"}
              strokeWidth="2"
              className="transition-[stroke] duration-200"
            />
            <line
              x1="15.2"
              y1="15.2"
              x2="21"
              y2="21"
              stroke={SearchInputActive ? "#fbbf24" : "#a3a3a3"}
              strokeWidth="2"
              strokeLinecap="round"
              className="transition-[stroke] duration-200"
            />
          </svg>

          {/* Equalizer bars — shown when focused, animate while typing */}
          <div
            className={
              "absolute flex h-full w-full items-center justify-center gap-[6%] transition-all duration-300 ease-out " +
              (SearchInputFocused ? "scale-100 opacity-100" : "scale-50 opacity-0")
            }
          >
            {SearchInputBars.map((b) => (
              <span
                key={"searchinput-bar-" + b}
                className="block w-[10%] rounded-full bg-amber-400 motion-reduce:!h-1/3 motion-reduce:!animate-none"
                style={{
                  height: SearchInputHasValue ? "70%" : "30%",
                  animation: SearchInputFocused
                    ? "searchinput-eq 0.9s ease-in-out " + b * 0.09 + "s infinite alternate"
                    : "none",
                  opacity: 0.55 + (b % 3) * 0.15,
                }}
              />
            ))}
          </div>
        </div>

        {/* The actual input */}
        <input
          ref={SearchInputInputRef}
          type="text"
          value={props.value}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={() => SearchInputSetFocused(true)}
          onBlur={() => SearchInputSetFocused(false)}
          className="peer relative z-10 h-full w-full min-w-0 bg-transparent font-medium tracking-tight text-neutral-100 outline-none placeholder:text-neutral-600 placeholder:font-normal caret-amber-400 text-[clamp(11px,26cqmin,40px)]"
          spellCheck={false}
          autoComplete="off"
        />

        {/* Clear button — only when there is a value */}
        {SearchInputHasValue && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              props.onChange("");
            }}
            className="relative z-10 flex aspect-square shrink-0 items-center justify-center rounded-full border border-neutral-600/50 bg-neutral-800 text-neutral-400 transition-all duration-200 ease-out hover:border-rose-400/50 hover:bg-rose-500/20 hover:text-rose-300 hover:scale-110 active:scale-90"
            style={{ height: "min(46cqmin, 78%)" }}
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-[55%] w-[55%]">
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        )}

        {/* Idle keyboard hint chip — only when empty & not focused */}
        {!SearchInputHasValue && !SearchInputFocused && (
          <div
            className="relative z-10 hidden shrink-0 items-center rounded-md border border-amber-400/20 bg-neutral-900/70 px-[2cqmin] font-semibold uppercase tracking-widest text-neutral-500 transition-opacity duration-200 @[10rem]:flex text-[clamp(8px,14cqmin,16px)]"
            style={{ height: "min(52cqmin, 70%)" }}
          >
            <span className="leading-none">⌕</span>
          </div>
        )}

        {/* Bottom accent underline that grows on focus */}
        <div className="pointer-events-none absolute inset-x-2 bottom-0 h-px overflow-hidden">
          <div
            className={
              "h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-300 ease-out " +
              (SearchInputFocused ? "w-full opacity-100" : "w-0 opacity-0 mx-auto")
            }
            style={{ marginInline: "auto" }}
          />
        </div>
      </div>

      <style>
        {"@keyframes searchinput-eq{0%{transform:scaleY(0.35)}100%{transform:scaleY(1)}}" +
          "@keyframes searchinput-sweep{0%{transform:translateX(0)}100%{transform:translateX(400%)}}"}
      </style>
    </div>
  );
}