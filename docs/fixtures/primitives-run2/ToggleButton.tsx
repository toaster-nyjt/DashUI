type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };
export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, children } = props;

  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [ripple, setRipple] = useState(0);
  const hasContent = children !== undefined && children !== null && children !== false;

  const ToggleButtonSweep = () => (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <span
        key={"sweep-" + ripple}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "260%",
          aspectRatio: "1 / 1",
          transform: "translate(-50%, -50%) scale(0.2)",
          borderRadius: "9999px",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(251,191,36,0.0) 62%)",
          opacity: 0,
          animation:
            ripple > 0
              ? "toggleButtonRipple 560ms ease-out forwards"
              : "none",
        }}
      />
    </span>
  );

  return (
    <button
      type="button"
      onClick={() => {
        setRipple((r) => r + 1);
        onChange(!on);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
      onPointerEnter={() => setHovered(true)}
      className={
        "relative h-full w-full min-w-0 min-h-0 select-none touch-none overflow-hidden rounded-lg border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none " +
        (on
          ? "border-amber-400/50 bg-gradient-to-b from-amber-400 to-amber-500 text-neutral-950 shadow-[0_0_18px_-2px_rgba(245,158,11,0.7)]"
          : "border-neutral-600/50 bg-gradient-to-b from-neutral-700 to-neutral-900 text-neutral-300 shadow-md shadow-black/40 hover:border-amber-400/40")
      }
      style={{
        transform:
          "translateY(" +
          (pressed ? "0px" : on ? "-1px" : hovered ? "-1px" : "0px") +
          ") scale(" +
          (pressed ? "0.965" : on && hovered ? "1.015" : "1") +
          ")",
      }}
    >
      <style>
        {"@keyframes toggleButtonRipple{0%{opacity:0.7;transform:translate(-50%,-50%) scale(0.2);}100%{opacity:0;transform:translate(-50%,-50%) scale(1);}}@keyframes toggleButtonBreath{0%,100%{opacity:0.35;}50%{opacity:0.85;}}@keyframes toggleButtonScan{0%{transform:translateX(-120%);}100%{transform:translateX(120%);}}"}
      </style>

      {/* recessed inner bevel */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          boxShadow: on
            ? "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -2px 6px rgba(120,53,15,0.45)"
            : "inset 0 1px 1px rgba(255,255,255,0.06), inset 0 -2px 6px rgba(0,0,0,0.6)",
        }}
      />

      {/* top gloss highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg"
        style={{
          background: on
            ? "linear-gradient(to bottom, rgba(255,247,237,0.5), rgba(255,247,237,0))"
            : "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0))",
        }}
      />

      {/* animated glow breath when active */}
      {on && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg motion-reduce:animate-none"
          style={{
            boxShadow: "inset 0 0 22px rgba(255,237,213,0.55)",
            animation: "toggleButtonBreath 2200ms ease-in-out infinite",
          }}
        />
      )}

      {/* scanning sheen on hover (off state) */}
      {!on && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg"
        >
          <span
            className="absolute top-0 h-full w-1/3 motion-reduce:animate-none"
            style={{
              background:
                "linear-gradient(105deg, transparent, rgba(251,191,36,0.16), transparent)",
              animation: hovered ? "toggleButtonScan 900ms ease-out" : "none",
            }}
          />
        </span>
      )}

      <ToggleButtonSweep />

      {/* corner status pip */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[7%] top-[12%] rounded-full transition-all duration-200"
        style={{
          width: "min(9cqw, 9cqh)",
          height: "min(9cqw, 9cqh)",
          maxWidth: "10px",
          maxHeight: "10px",
          background: on ? "#0a0a0a" : "#57534e",
          boxShadow: on
            ? "0 0 8px rgba(10,10,10,0.6), inset 0 0 3px rgba(255,255,255,0.25)"
            : "inset 0 0 2px rgba(0,0,0,0.8)",
        }}
      />

      {/* face content */}
      <span
        className="pointer-events-none relative z-10 flex h-full w-full items-center justify-center overflow-hidden px-[8%] py-[6%]"
        style={{ [("containerType" as any)]: "size" } as React.CSSProperties}
      >
        {hasContent ? (
          <span
            className="flex max-h-full max-w-full items-center justify-center text-center font-semibold uppercase tracking-widest leading-none transition-colors duration-200"
            style={{
              fontSize: "min(46cqh, 22cqw)",
              letterSpacing: "0.12em",
              textShadow: on
                ? "0 1px 1px rgba(255,255,255,0.4)"
                : "0 1px 2px rgba(0,0,0,0.7)",
              whiteSpace: "nowrap",
            }}
          >
            {children}
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="rounded-full transition-all duration-200"
            style={{
              width: "min(26cqh, 26cqw)",
              height: "min(26cqh, 26cqw)",
              maxWidth: "18px",
              maxHeight: "18px",
              background: on
                ? "radial-gradient(circle at 35% 30%, #1c1917, #0a0a0a)"
                : "radial-gradient(circle at 35% 30%, #78716c, #292524)",
              boxShadow: on
                ? "0 0 10px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.3)"
                : "inset 0 1px 2px rgba(255,255,255,0.12), inset 0 -1px 2px rgba(0,0,0,0.7)",
            }}
          />
        )}
      </span>
    </button>
  );
}