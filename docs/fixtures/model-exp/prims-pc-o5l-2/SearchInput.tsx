type SearchInputProps = { value: string; onChange: (v: string) => void };

export const SearchInput_MIN = {"base":[7,2]};

export function SearchInput(props: SearchInputProps) {
  const { value, onChange } = props;
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const [focused, setFocused] = useState(false);
  const [hover, setHover] = useState(false);
  const has = value.length > 0;

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: SearchInput_MIN.base[0] + "rem", minHeight: SearchInput_MIN.base[1] + "rem" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={
          "absolute inset-0 flex items-center gap-2 rounded-lg border bg-stone-950/80 overflow-hidden transition-all duration-200 ease-out " +
          (focused
            ? "border-amber-500/40 ring-2 ring-inset ring-amber-500/50 shadow-lg shadow-amber-500/20"
            : hover
            ? "border-amber-500/25 shadow-md shadow-black/40"
            : "border-stone-700/60 shadow-none")
        }
        style={{ paddingLeft: "0.5rem", paddingRight: "0.4rem" }}
      >
        {/* scan sheen */}
        <div
          className="absolute inset-y-0 left-0 w-full pointer-events-none transition-opacity duration-300 ease-out bg-gradient-to-r from-amber-500/10 via-transparent to-transparent"
          style={{ opacity: focused ? 1 : 0 }}
        />

        {/* magnifier */}
        <svg
          viewBox="0 0 24 24"
          preserveAspectRatio="xMidYMid meet"
          className="relative h-[55%] max-h-4 shrink transition-all duration-200 ease-out"
          style={{ width: "1rem", flexBasis: "1rem" }}
        >
          <defs>
            <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#a3e635" />
            </linearGradient>
          </defs>
          <g
            fill="none"
            stroke={focused || has ? "url(#" + uid + "-g)" : "#78716c"}
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <circle cx="10.5" cy="10.5" r="6" />
            <line x1="15" y1="15" x2="21" y2="21" />
          </g>
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
          className="relative flex-1 min-w-0 bg-transparent border-0 outline-none font-sans font-normal tracking-wide text-sm text-stone-100 placeholder:text-stone-600 caret-amber-400 transition-all duration-200 ease-out"
        />

        <button
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => e.preventDefault()}
          onClick={() => onChange("")}
          className={
            "relative grid place-items-center rounded-md border transition-all duration-200 ease-out " +
            (has
              ? "opacity-100 scale-100 border-amber-400/30 text-stone-400 hover:text-neutral-950 hover:bg-amber-400 hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/40 active:scale-90"
              : "opacity-0 scale-75 pointer-events-none border-transparent text-transparent")
          }
          style={{ width: "1.1rem", height: "1.1rem", flexBasis: "1.1rem" }}
        >
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style={{ width: "0.7rem", height: "0.7rem" }}>
            <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </g>
          </svg>
        </button>
      </div>

      {/* underglow bar */}
      <div className="absolute left-2 right-2 bottom-0 h-px overflow-hidden pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-300 ease-out"
          style={{ width: focused ? "100%" : has ? "45%" : "0%", marginLeft: "auto", marginRight: "auto", opacity: focused ? 0.9 : 0.5 }}
        />
      </div>
    </div>
  );
}