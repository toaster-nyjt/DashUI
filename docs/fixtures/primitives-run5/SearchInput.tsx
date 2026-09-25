type SearchInputProps = { value: string; onChange: (v: string) => void };
export function SearchInput(props: SearchInputProps) {
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = props.value.length > 0;
  const active = focused || hovered;

  // Decorative scanning ticks along the query field — a subtle "signal sweep"
  const SearchInputTicks = () => {
    const ticks: JSX.Element[] = [];
    const count = 40;
    for (let i = 0; i < count; i++) {
      const on = focused && (i % 3 === 0);
      ticks.push(
        <div
          key={"tk-" + i}
          className={
            "flex-1 min-w-0 rounded-full transition-all duration-300 ease-out " +
            (on ? "bg-amber-400/50" : "bg-stone-700/40")
          }
          style={{
            height: on ? "100%" : "40%",
            transitionDelay: (i * 12) + "ms",
          }}
        />
      );
    }
    return (
      <div className="absolute inset-x-0 bottom-0 h-[8%] flex items-end gap-[0.6%] px-[2%] opacity-70 pointer-events-none">
        {ticks}
      </div>
    );
  };

  return (
    <div
      className="h-full w-full min-w-0 min-h-0 relative flex items-stretch"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={
          "relative h-full w-full min-w-0 min-h-0 flex items-center overflow-hidden rounded-lg border bg-stone-950/80 " +
          "transition-all duration-200 ease-out " +
          (focused
            ? "border-amber-500/40 ring-2 ring-inset ring-amber-500/50 shadow-lg shadow-amber-500/20"
            : hovered
            ? "border-amber-500/30 shadow-md shadow-black/40"
            : "border-stone-700/60 shadow-md shadow-black/40")
        }
        onMouseDown={() => {
          if (inputRef.current) inputRef.current.focus();
        }}
      >
        {/* Left sheen accent bar */}
        <div
          className={
            "absolute left-0 top-0 h-full w-[3%] transition-all duration-300 ease-out " +
            (active
              ? "bg-gradient-to-b from-amber-400/70 via-amber-500/40 to-amber-400/70"
              : "bg-gradient-to-b from-stone-700/50 to-stone-800/30")
          }
        />

        {/* Ambient gradient wash */}
        <div
          className={
            "absolute inset-0 pointer-events-none transition-opacity duration-300 ease-out bg-gradient-to-r from-amber-500/5 via-transparent to-transparent " +
            (active ? "opacity-100" : "opacity-40")
          }
        />

        {/* Magnifier icon region */}
        <div className="relative h-full aspect-square shrink-0 flex items-center justify-center p-[2%]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="h-[52%] w-[52%] overflow-visible"
          >
            <defs>
              <linearGradient id={uid + "-glass"} x1="0" y1="0" x2="1" y2="1">
                <stop
                  offset="0"
                  stopColor={active ? "#fbbf24" : "#a8a29e"}
                  stopOpacity={active ? "0.9" : "0.55"}
                />
                <stop
                  offset="1"
                  stopColor={active ? "#f59e0b" : "#78716c"}
                  stopOpacity={active ? "0.9" : "0.4"}
                />
              </linearGradient>
              <radialGradient id={uid + "-lens"} cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stopColor="#fbbf24" stopOpacity={focused ? "0.28" : "0.1"} />
                <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle
              cx="42"
              cy="42"
              r="26"
              fill={"url(#" + uid + "-lens)"}
              className="transition-all duration-300 ease-out"
            />
            <circle
              cx="42"
              cy="42"
              r="26"
              fill="none"
              stroke={"url(#" + uid + "-glass)"}
              strokeWidth="9"
              className="transition-all duration-300 ease-out"
            />
            <line
              x1="61"
              y1="61"
              x2="86"
              y2="86"
              stroke={"url(#" + uid + "-glass)"}
              strokeWidth="11"
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
            {focused && (
              <circle cx="42" cy="42" r="34" fill="none" stroke="#fbbf24" strokeWidth="2" strokeOpacity="0.35">
                <animate attributeName="r" values="30;40;30" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        </div>

        {/* Input field */}
        <div className="relative flex-1 min-w-0 h-full flex items-center pr-[1%]">
          <input
            ref={inputRef}
            type="text"
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search tracks…"
            spellCheck={false}
            autoComplete="off"
            className={
              "w-full min-w-0 bg-transparent outline-none border-none " +
              "font-medium tracking-wide leading-none " +
              "text-[13px] text-stone-100 " +
              "placeholder:text-stone-600 placeholder:uppercase placeholder:tracking-widest placeholder:font-medium placeholder:text-[11px] " +
              "caret-amber-400 truncate"
            }
          />
        </div>

        {/* Clear button (only when there is text) */}
        {hasValue && (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault();
              props.onChange("");
              if (inputRef.current) inputRef.current.focus();
            }}
            className={
              "relative shrink-0 h-full aspect-square flex items-center justify-center p-[3%] group " +
              "transition-all duration-200 ease-out"
            }
          >
            <span
              className={
                "flex items-center justify-center h-[62%] w-[62%] rounded-full border transition-all duration-200 ease-out " +
                "border-stone-700/60 bg-stone-800/40 text-stone-400 " +
                "group-hover:border-red-500/50 group-hover:bg-red-500/15 group-hover:text-red-400 group-hover:shadow-md group-hover:shadow-red-500/20 " +
                "group-active:scale-90"
              }
            >
              <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="h-[52%] w-[52%]">
                <line x1="28" y1="28" x2="72" y2="72" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                <line x1="72" y1="28" x2="28" y2="72" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              </svg>
            </span>
          </button>
        )}

        {/* Right-edge status pip when idle-focused, echoing signal life */}
        {focused && !hasValue && (
          <div className="relative shrink-0 h-full aspect-[0.5] flex items-center justify-center pr-[6%]">
            <span className="block h-[22%] aspect-square rounded-full bg-lime-400 shadow-lg shadow-lime-400/40 animate-pulse" />
          </div>
        )}

        <SearchInputTicks />
      </div>
    </div>
  );
}