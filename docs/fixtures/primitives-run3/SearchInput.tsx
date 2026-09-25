type SearchInputProps = { value: string; onChange: (v: string) => void };
export function SearchInput(props: SearchInputProps) {
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasValue = props.value.length > 0;
  const active = focused || hovered;

  const SearchInputSweep = () => (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "40%",
          left: focused ? "120%" : "-60%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.10) 50%, transparent 100%)",
          transition: "left 900ms ease-out, opacity 300ms ease-out",
          opacity: focused ? 1 : 0,
        }}
      />
    </div>
  );

  return (
    <div className="h-full w-full min-w-0 min-h-0 flex items-stretch [container-type:size]">
      <div
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={() => {
          if (inputRef.current) inputRef.current.focus();
        }}
        className="group relative h-full w-full min-w-0 min-h-0 flex items-center overflow-hidden rounded-lg border bg-neutral-950/80 transition-all duration-200 ease-out motion-reduce:transition-none"
        style={{
          borderColor: focused
            ? "rgba(251,191,36,0.55)"
            : hovered
            ? "rgba(251,191,36,0.30)"
            : "rgba(64,64,64,0.60)",
          boxShadow: focused
            ? "inset 0 2px 6px rgba(0,0,0,0.8), 0 0 16px -2px rgba(245,158,11,0.55)"
            : "inset 0 2px 6px rgba(0,0,0,0.8)",
          paddingLeft: "3.5%",
          paddingRight: "3.5%",
          gap: "2.5%",
        }}
      >
        <SearchInputSweep />

        {/* Search icon */}
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{
            height: "min(52cqh, 62cqmin)",
            width: "min(52cqh, 62cqmin)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full transition-all duration-200 ease-out motion-reduce:transition-none"
            style={{
              transform: active ? "scale(1.06)" : "scale(1)",
            }}
          >
            <defs>
              <linearGradient
                id={"grad-" + uid}
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={active ? "#fcd34d" : "#a3a3a3"}
                />
                <stop
                  offset="100%"
                  stopColor={active ? "#f59e0b" : "#737373"}
                />
              </linearGradient>
            </defs>
            <circle
              cx="10.5"
              cy="10.5"
              r="6.5"
              stroke={"url(#grad-" + uid + ")"}
              strokeWidth="2"
              style={{
                transition: "stroke 200ms ease-out",
              }}
            />
            <line
              x1="15.2"
              y1="15.2"
              x2="20.5"
              y2="20.5"
              stroke={"url(#grad-" + uid + ")"}
              strokeWidth="2.2"
              strokeLinecap="round"
              style={{
                transition: "stroke 200ms ease-out",
              }}
            />
          </svg>
          {focused && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-full motion-reduce:animate-none animate-pulse"
              style={{
                boxShadow: "0 0 10px -1px rgba(245,158,11,0.55)",
              }}
            />
          )}
        </div>

        {/* Text field */}
        <div className="relative flex-1 min-w-0 h-full flex items-center">
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
            className="peer w-full min-w-0 bg-transparent outline-none border-0 p-0 font-medium tabular-nums text-neutral-100 placeholder:text-neutral-600 placeholder:font-normal placeholder:tracking-normal caret-amber-400 selection:bg-amber-500/30 selection:text-amber-100"
            style={{
              fontSize: "clamp(11px, 34cqh, 15px)",
              lineHeight: 1.1,
            }}
          />
        </div>

        {/* Clear button */}
        {hasValue && (
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
            className="relative shrink-0 flex items-center justify-center rounded-full border border-amber-400/20 bg-neutral-800 text-neutral-400 transition-all duration-200 ease-out hover:border-amber-400/50 hover:bg-amber-500/15 hover:text-amber-300 hover:scale-[1.08] active:scale-[0.92] motion-reduce:transition-none"
            style={{
              height: "min(46cqh, 56cqmin)",
              width: "min(46cqh, 56cqmin)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
              className="h-[62%] w-[62%]"
            >
              <line
                x1="7"
                y1="7"
                x2="17"
                y2="17"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <line
                x1="17"
                y1="7"
                x2="7"
                y2="17"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}