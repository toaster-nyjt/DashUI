type SearchInputProps = { value: string; onChange: (v: string) => void };
export function SearchInput(props: SearchInputProps) {
  const { value, onChange } = props;
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const floor = (SearchInput_MIN as any).base;
  const active = focused || value.length > 0;

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={
          "absolute inset-0 rounded-lg border bg-stone-950/80 overflow-hidden transition-all duration-200 ease-out " +
          (focused
            ? "border-amber-500/40 ring-2 ring-inset ring-amber-500/50 shadow-lg shadow-amber-500/20"
            : hover
            ? "border-amber-500/30 shadow-md shadow-black/40"
            : "border-stone-700/60 shadow-none")
        }
      >
        {/* sheen */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800/30 to-neutral-950/60 pointer-events-none" />
        {/* scanning accent line */}
        <div
          className={
            "absolute left-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-300 ease-out " +
            (active ? "w-full opacity-80" : "w-0 opacity-0")
          }
        />

        <div className="absolute inset-0 flex items-center gap-2 px-2 min-w-0">
          {/* icon */}
          <div className="h-full py-[18%] flex items-center">
            <svg
              viewBox="0 0 24 24"
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-auto transition-all duration-200 ease-out"
              style={{ aspectRatio: "1 / 1" }}
            >
              <defs>
                <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={active ? "#fbbf24" : "#a8a29e"} />
                  <stop offset="100%" stopColor={active ? "#f59e0b" : "#78716c"} />
                </linearGradient>
              </defs>
              <circle
                cx="10.5"
                cy="10.5"
                r="6.2"
                fill="none"
                stroke={"url(#" + uid + "-g)"}
                strokeWidth="2"
              />
              <line
                x1="15.2"
                y1="15.2"
                x2="20.5"
                y2="20.5"
                stroke={"url(#" + uid + "-g)"}
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              {active ? (
                <circle cx="10.5" cy="10.5" r="9" fill="none" stroke="#fbbf24" strokeOpacity="0.25" strokeWidth="1">
                  <animate attributeName="r" values="7;10;7" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
                </circle>
              ) : null}
            </svg>
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent outline-none border-0 text-sm font-normal tracking-wide leading-snug text-stone-100 placeholder:text-stone-600 caret-amber-400 transition-all duration-200 ease-out"
          />

          {value.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="h-full py-[22%] flex items-center justify-center text-stone-500 hover:text-amber-300 active:scale-90 transition-all duration-200 ease-out"
            >
              <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-full w-auto" style={{ aspectRatio: "1 / 1" }}>
                <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
                <line x1="8.8" y1="8.8" x2="15.2" y2="15.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="15.2" y1="8.8" x2="8.8" y2="15.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export const SearchInput_MIN = {"base":[6,1.75]};