type SearchInputProps = { value: string; onChange: (v: string) => void };
export const SearchInput_MIN = {"base":[7,1.75]};

export function SearchInput(props: SearchInputProps) {
  const { value, onChange } = props;
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const floor = SearchInput_MIN.base;
  const hasText = value.length > 0;
  const active = focused || hasText;

  // Ambient scanning sweep animation runs when idle/focused for tactile life.
  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Outer shell */}
      <div
        className={
          "absolute inset-0 rounded-lg border bg-stone-950/80 overflow-hidden transition-all duration-200 ease-out shadow-inner shadow-black/70 " +
          (focused
            ? "border-amber-500/50 shadow-lg shadow-amber-500/20 ring-2 ring-inset ring-amber-500/40"
            : hovered
            ? "border-amber-500/30"
            : "border-stone-700/60")
        }
      >
        {/* Warm sheen gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-500/5 to-neutral-950/40" />

        {/* Animated scan sweep — subtle horizontal shimmer that intensifies on focus */}
        <div
          className={
            "pointer-events-none absolute inset-y-0 w-[40%] bg-gradient-to-r from-transparent via-amber-400/10 to-transparent blur-sm transition-opacity duration-300 " +
            (focused ? "opacity-100" : hovered ? "opacity-60" : "opacity-25")
          }
          style={{
            animation: "searchsweep-" + uid + " 3.2s ease-in-out infinite",
          }}
        />

        {/* Bottom accent underline that fills on focus */}
        <div className="pointer-events-none absolute inset-x-2 bottom-0 h-[2px] overflow-hidden rounded-full">
          <div
            className={
              "h-full rounded-full transition-all duration-300 ease-out " +
              (focused ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" : hasText ? "bg-amber-500/50" : "bg-stone-700/50")
            }
            style={{ width: focused ? "100%" : hasText ? "60%" : "22%" }}
          />
        </div>

        {/* Content row */}
        <div className="absolute inset-0 flex items-stretch">
          {/* Search glyph region */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => inputRef.current && inputRef.current.focus()}
            className="relative flex h-full shrink-0 items-center justify-center transition-all duration-200 ease-out"
            style={{ width: "clamp(1.6rem, 16%, 2.4rem)" }}
          >
            <svg
              viewBox="0 0 24 24"
              preserveAspectRatio="xMidYMid meet"
              className={
                "h-[46%] w-[46%] transition-all duration-200 ease-out " +
                (active ? "text-amber-400" : hovered ? "text-stone-300" : "text-stone-500")
              }
            >
              <circle
                cx="10.5"
                cy="10.5"
                r="6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className={focused ? "animate-pulse" : ""}
              />
              <line
                x1="15.4"
                y1="15.4"
                x2="21"
                y2="21"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Input field */}
          <div className="relative flex-1 min-w-0 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              spellCheck={false}
              autoComplete="off"
              placeholder="Search library"
              className={
                "peer h-full w-full min-w-0 bg-transparent outline-none border-none " +
                "font-sans font-normal tracking-wide leading-none text-stone-100 " +
                "placeholder:font-medium placeholder:uppercase placeholder:tracking-widest placeholder:text-stone-600 " +
                "transition-colors duration-200"
              }
              style={{ fontSize: "clamp(0.75rem, 42%, 0.95rem)" }}
            />
          </div>

          {/* Clear button — only when there is text */}
          <div className="relative flex h-full shrink-0 items-center justify-center" style={{ width: "clamp(1.6rem, 16%, 2.4rem)" }}>
            <button
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange("");
                if (inputRef.current) inputRef.current.focus();
              }}
              aria-label="Clear search"
              className={
                "group flex items-center justify-center rounded-full border transition-all duration-200 ease-out " +
                (hasText
                  ? "h-[58%] w-[58%] scale-100 opacity-100 border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-400 hover:text-neutral-950 hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/40 active:scale-90 pointer-events-auto"
                  : "h-[58%] w-[58%] scale-50 opacity-0 border-transparent pointer-events-none")
              }
            >
              <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-[52%] w-[52%]">
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{
        "@keyframes searchsweep-" + uid + " {" +
        "0% { transform: translateX(-120%); }" +
        "55% { transform: translateX(320%); }" +
        "100% { transform: translateX(320%); }" +
        "}"
      }</style>
    </div>
  );
}