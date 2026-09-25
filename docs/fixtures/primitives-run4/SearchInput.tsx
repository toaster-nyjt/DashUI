type SearchInputProps = { value: string; onChange: (v: string) => void };

export function SearchInput(props: SearchInputProps) {
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hasValue = props.value.length > 0;
  const active = focused || hovered;

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerDown={() => {
          const el = inputRef.current;
          if (el) {
            // place caret without scrolling; selection start = current focus intent
            requestAnimationFrame(() => {
              // no-op guard; browser handles caret on native click into input
            });
          }
        }}
        className={
          "relative group h-full w-full min-w-0 flex items-center gap-[2%] overflow-hidden rounded-lg border transition-all duration-200 ease-out " +
          (focused
            ? "border-amber-400/60 bg-neutral-950/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_0_14px_-2px_rgba(245,158,11,0.55)]"
            : hovered
            ? "border-amber-400/30 bg-neutral-950/85 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]"
            : "border-neutral-700/60 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]")
        }
        style={{ paddingLeft: "3%", paddingRight: "3%" }}
      >
        {/* Animated amber sweep on the recessed bed while focused */}
        <div
          aria-hidden
          className={
            "pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-300 ease-out " +
            (focused ? "opacity-100" : "opacity-0")
          }
          style={{
            background:
              "radial-gradient(120% 140% at 0% 50%, rgba(245,158,11,0.10) 0%, rgba(245,158,11,0.0) 45%)",
          }}
        />

        {/* Left accent rail that lights on focus */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 bottom-0 rounded-l-lg overflow-hidden"
          style={{ width: "2px" }}
        >
          <div
            className={
              "h-full w-full transition-all duration-300 ease-out " +
              (focused
                ? "bg-amber-400 shadow-[0_0_10px_0_rgba(245,158,11,0.8)]"
                : active
                ? "bg-amber-400/40"
                : "bg-neutral-700/40")
            }
          />
        </div>

        {/* Search glyph — scales fluidly, animates on focus */}
        <div
          aria-hidden
          className="relative shrink-0 flex items-center justify-center"
          style={{ height: "62%", aspectRatio: "1 / 1" }}
        >
          <svg
            viewBox="0 0 24 24"
            preserveAspectRatio="xMidYMid meet"
            className={
              "h-full w-full transition-all duration-300 ease-out " +
              (focused
                ? "text-amber-400 rotate-0 scale-100"
                : active
                ? "text-amber-400/70 scale-100"
                : "text-neutral-500 scale-95")
            }
          >
            <defs>
              <linearGradient id={uid + "-lens"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
              </linearGradient>
            </defs>
            <circle
              cx="10.5"
              cy="10.5"
              r="6.5"
              fill="none"
              stroke={"url(#" + uid + "-lens)"}
              strokeWidth="2"
            />
            <line
              x1="15.4"
              y1="15.4"
              x2="21"
              y2="21"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
            {/* pulsing scan dot inside the lens when focused */}
            <circle
              cx="10.5"
              cy="10.5"
              r="1.6"
              fill="currentColor"
              className={
                "transition-opacity duration-300 " +
                (focused ? "opacity-90 animate-pulse" : "opacity-0")
              }
            />
          </svg>
        </div>

        {/* The actual field: FitText owns nothing here — this is OPERATIONAL text (typed query) */}
        <div className="relative flex-1 min-w-0 h-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search tracks, artists, keys…"
            spellCheck={false}
            autoComplete="off"
            className={
              "peer w-full min-w-0 bg-transparent border-0 outline-none " +
              "text-[13px] font-medium leading-snug tracking-normal text-neutral-100 " +
              "placeholder:text-neutral-600 placeholder:font-normal caret-amber-400 " +
              "focus:outline-none focus-visible:outline-none"
            }
            style={{ padding: 0 }}
          />
        </div>

        {/* Clear button — only present when there is a value */}
        {hasValue ? (
          <button
            type="button"
            tabIndex={-1}
            onPointerDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              props.onChange("");
            }}
            aria-label="Clear search"
            className={
              "relative shrink-0 flex items-center justify-center rounded-full " +
              "transition-all duration-200 ease-out " +
              "text-neutral-500 hover:text-neutral-950 hover:bg-amber-400 " +
              "hover:shadow-[0_0_12px_-2px_rgba(245,158,11,0.7)] " +
              "active:scale-[0.9] motion-reduce:transition-none"
            }
            style={{ height: "58%", aspectRatio: "1 / 1" }}
          >
            <svg
              viewBox="0 0 24 24"
              preserveAspectRatio="xMidYMid meet"
              className="h-[62%] w-[62%]"
            >
              <line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : (
          // Idle: subtle animated caret hint bars (decorative equalizer) when not focused/empty
          <div
            aria-hidden
            className={
              "shrink-0 flex items-end gap-[3px] transition-opacity duration-300 " +
              (focused ? "opacity-0" : "opacity-40 group-hover:opacity-70")
            }
            style={{ height: "40%" }}
          >
            <span
              className="w-[2px] rounded-full bg-amber-400/70 motion-reduce:animate-none animate-[searchbar-eq_900ms_ease-in-out_infinite]"
              style={{ height: "40%", animationDelay: "0ms" }}
            />
            <span
              className="w-[2px] rounded-full bg-amber-400/70 motion-reduce:animate-none animate-[searchbar-eq_900ms_ease-in-out_infinite]"
              style={{ height: "80%", animationDelay: "150ms" }}
            />
            <span
              className="w-[2px] rounded-full bg-amber-400/70 motion-reduce:animate-none animate-[searchbar-eq_900ms_ease-in-out_infinite]"
              style={{ height: "55%", animationDelay: "300ms" }}
            />
          </div>
        )}

        {/* keyframes scoped by unique id via a style tag */}
        <style>
          {"@keyframes searchbar-eq{0%,100%{transform:scaleY(0.5)}50%{transform:scaleY(1)}}"}
        </style>
      </div>
    </div>
  );
}