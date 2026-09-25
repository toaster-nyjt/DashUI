type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };
export function ToggleButton(props: ToggleButtonProps) {
  const uid = useRef("togglebtn-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(0);
  const { on, onChange, children } = props;

  const commit = () => {
    setRipple((r) => r + 1);
    onChange(!on);
  };

  const faceColor = on ? "#0a0a0a" : "#a3a3a3";

  return (
    <div className="relative h-full w-full min-w-0 min-h-0 [container-type:size]">
      <button
        type="button"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setPressed(true);
        }}
        onPointerUp={(e) => {
          if (pressed) commit();
          setPressed(false);
        }}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        className={
          "group relative h-full w-full min-w-0 min-h-0 select-none touch-none overflow-hidden rounded-lg border outline-none transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
          (on
            ? "border-amber-400/40 bg-amber-500 text-neutral-950 shadow-[0_0_16px_-2px] shadow-amber-500/60"
            : "border-neutral-600/50 bg-gradient-to-b from-neutral-700 to-neutral-900 text-neutral-400 shadow-md shadow-black/40 hover:border-amber-400/50 hover:from-neutral-700 hover:to-neutral-800 hover:shadow-[0_0_14px_-2px] hover:shadow-amber-500/40")
        }
        style={{
          transform: pressed ? "translateY(0) scale(0.965)" : "translateY(0) scale(1)",
        }}
      >
        {/* Top sheen for raised metal look (off) / molten gloss (on) */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg transition-opacity duration-200 " +
            (on ? "bg-gradient-to-b from-amber-200/50 to-transparent" : "bg-gradient-to-b from-white/[0.10] to-transparent")
          }
        />

        {/* Bottom inner shadow to seat the cap */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-lg bg-gradient-to-t from-black/40 to-transparent"
        />

        {/* Active status pip — top-left corner marker */}
        <span
          aria-hidden
          className={
            "pointer-events-none absolute left-[7%] top-[14%] rounded-full transition-all duration-200 " +
            (on ? "bg-amber-100 shadow-[0_0_6px_1px] shadow-amber-100/80 animate-pulse motion-reduce:animate-none" : "bg-neutral-600")
          }
          style={{ width: "10cqmin", height: "10cqmin", minWidth: "3px", minHeight: "3px", maxWidth: "7px", maxHeight: "7px" }}
        />

        {/* Ripple burst on toggle */}
        <span
          key={ripple}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
          style={
            ripple === 0
              ? { display: "none" }
              : {
                  width: "10cqmin",
                  height: "10cqmin",
                  marginLeft: "-5cqmin",
                  marginTop: "-5cqmin",
                  background: on ? "rgba(255,237,213,0.55)" : "rgba(251,191,36,0.35)",
                  animation: "tglripple-" + uid + " 480ms ease-out forwards",
                }
          }
        />

        {/* Face content */}
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ padding: "12cqmin" }}
        >
          {children != null && children !== false ? (
            <span
              className="flex max-h-full max-w-full items-center justify-center text-center font-semibold uppercase tracking-widest transition-colors duration-200 [&_*]:min-w-0"
              style={{
                color: faceColor,
                fontSize: "clamp(6px, 34cqmin, 26px)",
                lineHeight: 1,
                whiteSpace: "nowrap",
                textShadow: on ? "0 1px 0 rgba(255,255,255,0.25)" : "0 1px 1px rgba(0,0,0,0.6)",
              }}
            >
              {children}
            </span>
          ) : (
            <span
              aria-hidden
              className="rounded-full transition-all duration-200"
              style={{
                width: "22cqmin",
                height: "22cqmin",
                maxWidth: "18px",
                maxHeight: "18px",
                minWidth: "6px",
                minHeight: "6px",
                background: on ? "#0a0a0a" : "radial-gradient(circle at 35% 30%, #52525b, #18181b)",
                boxShadow: on
                  ? "0 0 0 2px rgba(10,10,10,0.35), inset 0 0 4px rgba(255,255,255,0.4)"
                  : "inset 0 1px 2px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05)",
              }}
            />
          )}
        </span>

        <style>
          {"@keyframes tglripple-" +
            uid +
            " { 0% { transform: scale(0); opacity: 0.9; } 100% { transform: scale(9); opacity: 0; } }"}
        </style>
      </button>
    </div>
  );
}