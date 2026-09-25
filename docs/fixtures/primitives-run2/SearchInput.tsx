type SearchInputProps = { value: string; onChange: (v: string) => void };
export function SearchInput(props: SearchInputProps) {
  const { value, onChange } = props;

  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [scanKey, setScanKey] = useState(0);

  const hasText = value.length > 0;
  const active = focused || hovered;

  // Re-trigger the scan sweep whenever focus turns on.
  useEffect(() => {
    if (focused) setScanKey((k) => k + 1);
  }, [focused]);

  const SearchInputKeyframes = (
    <style>
      {"@keyframes searchinput-scan{0%{transform:translateX(-120%);opacity:0}12%{opacity:1}88%{opacity:1}100%{transform:translateX(320%);opacity:0}}" +
        "@keyframes searchinput-blink{0%,45%{opacity:1}55%,100%{opacity:0.15}}" +
        "@keyframes searchinput-eq{0%{transform:scaleY(0.3)}50%{transform:scaleY(1)}100%{transform:scaleY(0.45)}}" +
        "@keyframes searchinput-ripple{0%{transform:scale(0.4);opacity:0.55}100%{transform:scale(1);opacity:0}}"}
    </style>
  );

  return (
    <div
      className="relative h-full w-full min-w-0 min-h-0 [container-type:size] select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {SearchInputKeyframes}

      {/* Ambient accent glow behind the field when active */}
      <div
        className={
          "pointer-events-none absolute -inset-1 rounded-[14px] transition-opacity duration-300 ease-out motion-reduce:transition-none " +
          (focused ? "opacity-100" : "opacity-0")
        }
        style={{
          background:
            "radial-gradient(120% 140% at 12% 50%, rgba(245,158,11,0.22), rgba(245,158,11,0) 62%)",
        }}
      />

      {/* The recessed field shell */}
      <div
        className={
          "group/searchinput relative z-10 flex h-full w-full items-stretch overflow-hidden rounded-lg border bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] transition-all duration-200 ease-out motion-reduce:transition-none " +
          (focused
            ? "border-amber-400/60 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_0_16px_-2px_rgba(245,158,11,0.6)]"
            : hovered
            ? "border-amber-400/30"
            : "border-neutral-700/60")
        }
        onMouseDown={(e) => {
          // Keep native caret placement when clicking directly in the text;
          // otherwise focus the field so clicking chrome still activates it.
          if (e.target !== inputRef.current) {
            e.preventDefault();
            inputRef.current && inputRef.current.focus();
          }
        }}
      >
        {/* Left magnifier / EQ icon zone */}
        <div className="relative flex aspect-square h-full shrink-0 items-center justify-center">
          {/* Idle: magnifier. Active-with-text: mini spectrum. Cross-faded. */}
          <div
            className={
              "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out motion-reduce:transition-none " +
              (active && hasText ? "opacity-0 scale-75" : "opacity-100 scale-100")
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[52cqh] w-[52cqh] max-h-[22px] max-w-[22px]"
              fill="none"
              stroke="currentColor"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle
                cx="10.5"
                cy="10.5"
                r="6.5"
                strokeWidth="1.8"
                className={
                  "transition-colors duration-200 " +
                  (active ? "text-amber-400" : "text-neutral-500")
                }
              />
              <line
                x1="15.5"
                y1="15.5"
                x2="21"
                y2="21"
                strokeWidth="1.8"
                strokeLinecap="round"
                className={
                  "transition-colors duration-200 " +
                  (active ? "text-amber-400" : "text-neutral-500")
                }
              />
            </svg>
          </div>

          {/* Mini animated spectrum shown once user is typing */}
          <div
            className={
              "absolute inset-0 flex items-end justify-center gap-[2px] px-[26%] pb-[34%] transition-all duration-300 ease-out motion-reduce:transition-none " +
              (active && hasText ? "opacity-100 scale-100" : "opacity-0 scale-125")
            }
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={"searchinput-bar-" + i}
                className="w-[16%] origin-bottom rounded-sm bg-amber-400 motion-reduce:animate-none"
                style={{
                  height: "60%",
                  animation:
                    "searchinput-eq " +
                    (520 + i * 130) +
                    "ms ease-in-out " +
                    i * 90 +
                    "ms infinite alternate",
                }}
              />
            ))}
          </div>
        </div>

        {/* Typed text region */}
        <div className="relative flex min-w-0 flex-1 items-center">
          {/* Placeholder rendered ourselves for exact token control */}
          {!hasText && (
            <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
              <span className="truncate text-[11px] font-normal uppercase tracking-widest text-neutral-600">
                Search tracks
              </span>
              {/* Blinking cursor when focused + empty */}
              {focused && (
                <span
                  className="ml-1 inline-block h-[46cqh] max-h-[16px] w-[1.5px] shrink-0 bg-amber-400 motion-reduce:animate-none"
                  style={{ animation: "searchinput-blink 1.05s steps(1) infinite" }}
                />
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={value}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="peer relative z-10 h-full w-full min-w-0 bg-transparent pr-2 text-[13px] font-medium leading-snug tracking-normal text-neutral-100 caret-amber-400 outline-none placeholder:text-transparent selection:bg-amber-500/30 selection:text-amber-100"
          />
        </div>

        {/* Right zone: clear button (only when there is text) */}
        <div className="relative flex aspect-square h-full shrink-0 items-center justify-center">
          <button
            type="button"
            tabIndex={hasText ? 0 : -1}
            aria-hidden={!hasText}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              onChange("");
              inputRef.current && inputRef.current.focus();
            }}
            className={
              "group/clear relative flex h-[62%] w-[62%] items-center justify-center rounded-full border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
              (hasText
                ? "pointer-events-auto scale-100 opacity-100 border-neutral-600/50 bg-neutral-800 text-neutral-400 hover:scale-[1.12] hover:border-rose-400/50 hover:bg-rose-500/20 hover:text-rose-300 active:scale-95"
                : "pointer-events-none scale-50 opacity-0 border-transparent")
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[58%] w-[58%] max-h-[13px] max-w-[13px]"
              fill="none"
              stroke="currentColor"
              preserveAspectRatio="xMidYMid meet"
            >
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scan-line sweep across the field on focus — subtle laser pass */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-lg">
          {focused && (
            <span
              key={"searchinput-scan-" + scanKey}
              className="absolute inset-y-0 left-0 w-1/4 motion-reduce:hidden"
              style={{
                background:
                  "linear-gradient(90deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.16) 50%, rgba(245,158,11,0) 100%)",
                animation: "searchinput-scan 900ms ease-out 1",
              }}
            />
          )}
        </div>

        {/* Bottom accent underline that fills from the left on focus */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[2px] overflow-hidden">
          <div
            className={
              "h-full origin-left bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.7)] transition-transform duration-300 ease-out motion-reduce:transition-none " +
              (focused ? "scale-x-100" : "scale-x-0")
            }
          />
        </div>
      </div>
    </div>
  );
}