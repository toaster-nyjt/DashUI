type PadProps = {
  onPress: () => void;
  active?: boolean;
  children?: React.ReactNode;
};

export const Pad_MIN = {"base":[2.5,2]};

export function Pad(props: PadProps) {
  const { onPress, active, children } = props;
  const uid = useRef("pad-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [flash, setFlash] = useState(0);

  const gradTop = uid + "-gradTop";
  const gradGlow = uid + "-gradGlow";
  const gradSheen = uid + "-gradSheen";
  const clipCorner = uid + "-clipCorner";

  const fire = useCallback(() => {
    setFlash((f) => f + 1);
    onPress();
  }, [onPress]);

  const hasContent = children !== undefined && children !== null && children !== false;

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: Pad_MIN.base[0] + "rem", minHeight: Pad_MIN.base[1] + "rem" }}
    >
      <button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setPressed(true);
          fire();
        }}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setHovered(false)}
        onPointerEnter={() => setHovered(true)}
        className={
          "group absolute inset-0 flex items-stretch justify-stretch overflow-hidden rounded-md border transition-all duration-200 ease-out outline-none touch-none " +
          (active
            ? "border-amber-400/50 bg-amber-500/20 shadow-lg shadow-amber-500/30 "
            : "border-amber-400/30 bg-neutral-900/90 shadow-md shadow-black/40 hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/30 ") +
          (pressed ? "scale-95 brightness-95 " : "")
        }
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Base recessed gradient sheen */}
        <span
          className={
            "pointer-events-none absolute inset-0 rounded-md transition-opacity duration-300 ease-out bg-gradient-to-b " +
            (active
              ? "from-amber-400/25 to-neutral-950/40 opacity-100 "
              : "from-stone-800/40 to-neutral-950/60 opacity-100 ")
          }
        />

        {/* Corner accent tab (top-left) — deck identity flourish */}
        <span
          className={
            "pointer-events-none absolute left-0 top-0 h-[26%] w-[26%] transition-all duration-300 ease-out " +
            (active ? "opacity-100" : "opacity-70 group-hover:opacity-100")
          }
        >
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
            <defs>
              <linearGradient id={gradTop} x1="0" y1="0" x2="1" y2="1">
                <stop
                  offset="0"
                  stopColor={active ? "rgb(251 191 36)" : "rgb(245 158 11)"}
                  stopOpacity={active ? "0.9" : "0.55"}
                />
                <stop offset="1" stopColor="rgb(245 158 11)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 0 H100 L0 100 Z" fill={"url(#" + gradTop + ")"} />
          </svg>
        </span>

        {/* Live status dot (top-right) */}
        <span
          className={
            "pointer-events-none absolute right-[10%] top-[12%] aspect-square w-[14%] rounded-full transition-all duration-200 ease-out " +
            (active
              ? "bg-amber-400 shadow-[0_0_8px_2px] shadow-amber-400/60 animate-pulse"
              : "bg-stone-700 " + (hovered ? "ring-1 ring-amber-500/40" : ""))
          }
        />

        {/* Bottom signal bar — lights lime on lit state */}
        <span className="pointer-events-none absolute inset-x-[10%] bottom-[9%] h-[6%] overflow-hidden rounded-full bg-stone-800/70">
          <span
            className={
              "block h-full rounded-full transition-all duration-300 ease-out " +
              (active
                ? "w-full bg-lime-400 shadow-[0_0_6px_1px] shadow-lime-400/50"
                : "w-1/3 bg-stone-700 " + (hovered ? "w-1/2 bg-amber-500/60" : ""))
            }
          />
        </span>

        {/* Trigger flash ripple on hit */}
        <span
          key={flash}
          className={
            "pointer-events-none absolute inset-0 rounded-md " +
            (flash > 0 ? "animate-[padflash_0.45s_ease-out]" : "opacity-0")
          }
          style={{
            background:
              "radial-gradient(circle at center, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0.12) 40%, rgba(251,191,36,0) 70%)"
          }}
        />

        {/* Top edge sheen highlight */}
        <span
          className={
            "pointer-events-none absolute inset-x-0 top-0 h-[30%] rounded-t-md bg-gradient-to-b transition-opacity duration-200 ease-out " +
            (active ? "from-amber-200/20 to-transparent opacity-100" : "from-amber-100/5 to-transparent opacity-60 group-hover:opacity-100")
          }
        />

        {/* Face content region */}
        <span className="pointer-events-none absolute inset-x-[14%] inset-y-[22%] flex items-center justify-center">
          {hasContent ? (
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (active ? "text-amber-200" : hovered ? "text-amber-300" : "text-stone-400")
              }
            >
              {children}
            </FitText>
          ) : null}
        </span>

        {/* Keyframes */}
        <style>{
          "@keyframes padflash{0%{opacity:1;transform:scale(0.6)}60%{opacity:0.5}100%{opacity:0;transform:scale(1.15)}}"
        }</style>
      </button>
    </div>
  );
}