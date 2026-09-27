type SearchInputProps = { value: string; onChange: (q: string) => void; placeholder?: string };
export function SearchInput(props: SearchInputProps) {
  const { value, onChange, placeholder } = props;
  const uid = useRef("searchinput-" + Math.random().toString(36).slice(2)).current;
  const [focused, setFocused] = useState(false);
  const floor = (SearchInput_MIN as any).base;

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div
        className={
          "absolute inset-0 flex items-stretch bg-black/60 border rounded-sm shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] transition-all duration-200 ease-out overflow-hidden " +
          (focused
            ? "border-cyan-300/70 ring-1 ring-cyan-300/40 shadow-[inset_0_0_12px_rgba(0,0,0,0.8),0_0_16px_rgba(34,211,238,0.35)]"
            : "border-cyan-400/30")
        }
      >
        {/* left accent bar */}
        <div
          className={
            "w-[3px] transition-all duration-200 ease-out " +
            (focused ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" : "bg-cyan-400/30")
          }
        />
        {/* magnifier */}
        <div className="flex items-center justify-center pl-2 pr-1">
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-[1rem] w-[1rem]" fill="none">
            <defs>
              <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <circle
              cx="10.5"
              cy="10.5"
              r="6.5"
              stroke={"url(#" + uid + "-g)"}
              strokeWidth="2"
              opacity={focused ? 1 : 0.6}
              className="transition-opacity duration-200"
            />
            <line
              x1="15.5"
              y1="15.5"
              x2="21"
              y2="21"
              stroke={"url(#" + uid + "-g)"}
              strokeWidth="2"
              strokeLinecap="round"
              opacity={focused ? 1 : 0.6}
            />
          </svg>
        </div>

        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent outline-none border-none text-cyan-50 placeholder:text-neutral-500 font-mono text-sm tracking-[0.12em] uppercase pr-1"
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="px-2 flex items-center justify-center text-cyan-300/70 hover:text-black hover:bg-cyan-300 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-[0.85rem] w-[0.85rem]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        )}

        {/* scan sweep on focus */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className={
              "absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-300/10 to-transparent transition-opacity duration-300 " +
              (focused ? "opacity-100 animate-[searchinput-sweep_2.2s_linear_infinite]" : "opacity-0")
            }
          />
        </div>
      </div>
      <style>{"@keyframes searchinput-sweep{0%{transform:translateX(-120%)}100%{transform:translateX(420%)}}"}</style>
    </div>
  );
}
export const SearchInput_MIN = {"base":[7,2]};