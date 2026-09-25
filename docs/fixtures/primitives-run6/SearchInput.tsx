export const SearchInput_MIN = {"base":[7,1.75]};

export function SearchInput(props: SearchInputProps) {
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const value = props.value ?? "";
  const hasValue = value.length > 0;
  const active = focused || hasValue;

  const floor = SearchInput_MIN.base;

  const accent = focused ? "rgb(251 191 36)" : hasValue ? "rgb(217 119 6)" : "rgb(120 113 108)";

  return (
    <div
      className="relative h-full w-full touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* Animated ambient glow behind the field when active */}
      <div
        className="pointer-events-none absolute -inset-[6%] rounded-full blur-md transition-all duration-500 ease-out"
        style={{
          opacity: focused ? 0.5 : hasValue ? 0.22 : 0,
          background:
            "radial-gradient(120% 140% at 12% 50%, rgba(251,191,36,0.35), rgba(217,119,6,0.08) 55%, transparent 75%)",
        }}
      />

      {/* Main field shell */}
      <div
        className="absolute inset-0 flex items-center overflow-hidden rounded-lg border transition-all duration-200 ease-out"
        style={{
          borderColor: focused
            ? "rgba(251,191,36,0.45)"
            : hovered
            ? "rgba(217,119,6,0.4)"
            : "rgba(120,113,108,0.6)",
          background:
            "linear-gradient(180deg, rgba(28,25,23,0.9) 0%, rgba(12,10,9,0.92) 100%)",
          boxShadow: focused
            ? "inset 0 1px 0 rgba(251,191,36,0.06), inset 0 0 0 1px rgba(251,191,36,0.28), 0 0 18px -4px rgba(251,191,36,0.45)"
            : "inset 0 1px 2px rgba(0,0,0,0.7)",
        }}
        onPointerDown={() => {
          const el = inputRef.current;
          if (el) el.focus();
        }}
      >
        {/* Left edge accent bar */}
        <div
          className="h-full shrink-0 transition-all duration-300 ease-out"
          style={{
            width: "3%",
            minWidth: "2px",
            maxWidth: "5px",
            background: accent,
            opacity: active ? 1 : 0.5,
            boxShadow: focused ? "0 0 10px rgba(251,191,36,0.7)" : "none",
          }}
        />

        {/* Search glyph */}
        <div className="flex h-full shrink-0 items-center justify-center" style={{ width: "13%", minWidth: "1.1rem", maxWidth: "2.2rem" }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-[52%] w-[52%] transition-all duration-300 ease-out"
            style={{
              color: accent,
              transform: focused ? "scale(1.08) rotate(-6deg)" : "scale(1) rotate(0deg)",
              filter: focused ? "drop-shadow(0 0 4px rgba(251,191,36,0.6))" : "none",
            }}
            preserveAspectRatio="xMidYMid meet"
          >
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2.2" />
            <line
              x1="15.4"
              y1="15.4"
              x2="21"
              y2="21"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Text region */}
        <div className="relative flex h-full min-w-0 flex-1 items-center">
          {/* Placeholder scanline pulse when empty + focused */}
          {!hasValue && (
            <div
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap font-medium uppercase tracking-widest text-stone-600 transition-all duration-300 ease-out"
              style={{
                fontSize: "clamp(9px, 42%, 13px)",
                opacity: focused ? 0.9 : 0.6,
                transform: focused ? "translate(2px,-50%)" : "translate(0,-50%)",
              }}
            >
              Search tracks
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => props.onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellCheck={false}
            autoComplete="off"
            className="h-full w-full min-w-0 border-0 bg-transparent font-sans font-normal tracking-normal text-stone-100 caret-amber-400 outline-none placeholder:text-transparent"
            style={{ fontSize: "clamp(11px, 46%, 15px)", padding: 0 }}
          />

          {/* Blinking caret companion glow bar under text baseline when focused */}
          <div
            className="pointer-events-none absolute bottom-[14%] left-0 h-[2px] rounded-full transition-all duration-300 ease-out"
            style={{
              width: focused ? "100%" : "0%",
              background:
                "linear-gradient(90deg, rgba(251,191,36,0.75), rgba(217,119,6,0.1) 80%, transparent)",
              opacity: focused ? 0.8 : 0,
            }}
          />
        </div>

        {/* Clear button — appears only when there is text */}
        <button
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            props.onChange("");
            const el = inputRef.current;
            if (el) el.focus();
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          className="group flex h-full items-center justify-center transition-all duration-200 ease-out"
          style={{
            width: hasValue ? "14%" : "0%",
            minWidth: hasValue ? "1.1rem" : "0px",
            maxWidth: "2.2rem",
            opacity: hasValue ? 1 : 0,
            pointerEvents: hasValue ? "auto" : "none",
          }}
          aria-label="Clear search"
        >
          <span
            className="flex items-center justify-center rounded-full border transition-all duration-200 ease-out group-hover:scale-110 group-active:scale-90"
            style={{
              width: "62%",
              height: "62%",
              maxWidth: "1.15rem",
              maxHeight: "1.15rem",
              borderColor: "rgba(239,68,68,0.35)",
              background: "rgba(239,68,68,0.12)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-[58%] w-[58%] text-red-400 transition-colors duration-200 group-hover:text-red-300"
              preserveAspectRatio="xMidYMid meet"
            >
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}