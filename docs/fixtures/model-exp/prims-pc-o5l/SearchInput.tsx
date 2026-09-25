type SearchInputProps = { value: string; onChange: (v: string) => void };

export function SearchInput(props: SearchInputProps) {
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const floor = SearchInput_MIN.base;
  const has = props.value.length > 0;

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={
          "absolute inset-0 flex items-center gap-2 overflow-hidden rounded-lg border bg-stone-950/80 transition-all duration-200 ease-out " +
          (focused
            ? "border-amber-500/40 ring-2 ring-inset ring-amber-500/50 shadow-lg shadow-amber-500/20"
            : hover
            ? "border-amber-400/40 shadow-md shadow-black/40"
            : "border-stone-700/60 shadow-md shadow-black/40")
        }
        style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}
      >
        {/* scan sweep */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent transition-opacity duration-300"
          style={{
            opacity: focused ? 1 : 0,
            animation: focused ? uid + "-sweep 2.4s linear infinite" : "none",
          }}
        />
        <style>
          {"@keyframes " + uid + "-sweep { 0% { transform: translateX(-120%);} 100% { transform: translateX(420%);} }"}
        </style>

        {/* magnifier */}
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          className="relative h-1/2 max-h-5 w-auto transition-all duration-200 ease-out"
          style={{ aspectRatio: "1 / 1" }}
        >
          <circle
            cx="10.5"
            cy="10.5"
            r="6"
            fill="none"
            strokeWidth="2"
            className={
              "transition-all duration-200 ease-out " +
              (focused || has ? "stroke-amber-400" : "stroke-stone-600")
            }
          />
          <line
            x1="15"
            y1="15"
            x2="20.5"
            y2="20.5"
            strokeWidth="2"
            strokeLinecap="round"
            className={
              "transition-all duration-200 ease-out " +
              (focused || has ? "stroke-amber-400" : "stroke-stone-600")
            }
          />
        </svg>

        <input
          type="text"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
          className="relative min-w-0 flex-1 bg-transparent text-sm font-normal leading-snug tracking-normal text-stone-100 placeholder:text-stone-600 caret-amber-400 outline-none"
        />

        {/* clear */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => props.onChange("")}
          className={
            "relative grid place-items-center rounded-md border border-amber-400/30 text-stone-400 transition-all duration-200 ease-out hover:border-amber-400/60 hover:text-amber-300 hover:shadow-md hover:shadow-amber-500/30 active:scale-95 " +
            (has ? "opacity-100" : "pointer-events-none opacity-0 scale-75")
          }
          style={{ width: "1.1rem", height: "1.1rem" }}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" preserveAspectRatio="xMidYMid meet">
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" />
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" />
          </svg>
        </button>

        {/* bottom signal line */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
          <div
            className={
              "h-full origin-left transition-transform duration-300 ease-out " +
              (has ? "bg-lime-400/70" : "bg-amber-500/50")
            }
            style={{ transform: "scaleX(" + (focused ? 1 : has ? 0.45 : 0) + ")" }}
          />
        </div>
      </div>
    </div>
  );
}

export const SearchInput_MIN = {"base":[7,1.75]};