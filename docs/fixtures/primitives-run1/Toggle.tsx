type ToggleProps = { on: boolean; onChange: (on: boolean) => void };

export function Toggle(props: ToggleProps) {
  const { on, onChange } = props;
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(0);
  const rippleRef = useRef(0);

  const fire = () => {
    rippleRef.current += 1;
    setRipple(rippleRef.current);
    onChange(!on);
  };

  return (
    <div className="h-full w-full min-w-0 min-h-0 [container-type:size] flex items-center justify-center select-none">
      <button
        type="button"
        onClick={fire}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setPressed(true);
        }}
        onPointerUp={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        aria-pressed={on}
        className={
          "group relative h-full w-full min-w-0 min-h-0 rounded-full border touch-none overflow-hidden outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-amber-400/60 " +
          (on
            ? "border-amber-400/40 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8),0_0_16px_-2px_rgba(245,158,11,0.6)] "
            : "border-neutral-700/70 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] ") +
          (pressed ? "scale-[0.97] " : "")
        }
      >
        {/* Track heat sheen when ON */}
        <span
          className={
            "pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300 ease-out " +
            (on ? "opacity-100" : "opacity-0")
          }
          style={{
            background:
              "linear-gradient(90deg, rgba(245,158,11,0.28) 0%, rgba(245,158,11,0.10) 45%, rgba(245,158,11,0) 70%)",
          }}
        />

        {/* Track edge ticks */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-[6%]">
          <span className="flex flex-col items-center gap-[8%]">
            <span
              className={
                "block h-[26%] w-[2px] rounded-full transition-all duration-200 " +
                (on ? "bg-amber-400/80 shadow-[0_0_6px_rgba(245,158,11,0.8)]" : "bg-neutral-700")
              }
            />
          </span>
          <span
            className={
              "block rounded-full transition-all duration-200 " +
              (on ? "h-[22%] w-[22%] bg-amber-400/30" : "h-[18%] w-[18%] border border-neutral-700 bg-transparent")
            }
          />
        </span>

        {/* Sliding thumb */}
        <span
          className={
            "pointer-events-none absolute top-1/2 aspect-square h-[76%] -translate-y-1/2 rounded-full transition-all duration-200 ease-out " +
            (on
              ? "left-[calc(100%-4%)] -translate-x-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-[0_2px_8px_rgba(0,0,0,0.6),0_0_14px_-1px_rgba(245,158,11,0.7)]"
              : "left-[4%] bg-gradient-to-b from-neutral-600 to-neutral-800 shadow-[0_2px_6px_rgba(0,0,0,0.7)]")
          }
        >
          {/* Thumb core detail */}
          <span
            className={
              "absolute inset-[22%] rounded-full transition-all duration-200 " +
              (on
                ? "bg-neutral-950/20 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
                : "border border-neutral-500/40 bg-neutral-900/40")
            }
          />
          {/* Center status dot */}
          <span
            className={
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 " +
              (on ? "h-[26%] w-[26%] bg-neutral-950 shadow-[0_0_4px_rgba(0,0,0,0.6)]" : "h-[20%] w-[20%] bg-neutral-500")
            }
          />
        </span>

        {/* Ripple on toggle */}
        {ripple > 0 && (
          <span
            key={"ripple-" + ripple}
            className="pointer-events-none absolute top-1/2 aspect-square h-[76%] -translate-y-1/2 rounded-full"
            style={{
              left: on ? "calc(96% )" : "4%",
              transform: on ? "translate(-100%,-50%)" : "translate(0,-50%)",
              animation: "toggle-ripple 500ms ease-out forwards",
              background: on
                ? "radial-gradient(circle, rgba(245,158,11,0.5) 0%, rgba(245,158,11,0) 70%)"
                : "radial-gradient(circle, rgba(120,113,108,0.5) 0%, rgba(120,113,108,0) 70%)",
            }}
          />
        )}

        <style>{
          "@keyframes toggle-ripple{0%{opacity:0.9;scale:0.6}100%{opacity:0;scale:2.2}}"
        }</style>
      </button>
    </div>
  );
}