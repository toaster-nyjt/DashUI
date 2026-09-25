type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };
export const ToggleButton_MIN = {"base":[2.5,1.5]};
export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, children } = props;
  const uid = useRef("togglebutton-" + Math.random().toString(36).slice(2)).current;
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const prevOn = useRef(on);

  useEffect(() => {
    if (prevOn.current !== on) {
      prevOn.current = on;
      setFlashKey((k) => k + 1);
    }
  }, [on]);

  const floor = ToggleButton_MIN.base;

  const gradId = uid + "-grad";
  const litGradId = uid + "-lit";
  const sheenId = uid + "-sheen";
  const glowId = uid + "-glow";

  const handleDown = (e: any) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setPressed(true);
  };
  const handleUp = () => {
    if (pressed) {
      onChange(!on);
    }
    setPressed(false);
  };
  const handleCancel = () => setPressed(false);

  return (
    <div
      className="relative h-full w-full select-none touch-none cursor-pointer"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={handleDown}
      onPointerUp={handleUp}
      onPointerCancel={handleCancel}
      onPointerLeave={() => setHover(false)}
      onPointerEnter={() => setHover(true)}
    >
      {/* Ambient lit glow behind the button when active */}
      <div
        className="pointer-events-none absolute -inset-[6%] rounded-xl transition-all duration-300 ease-out"
        style={{
          opacity: on ? 1 : 0,
          background: "radial-gradient(60% 60% at 50% 50%, rgba(245,158,11,0.28), rgba(245,158,11,0) 72%)",
          filter: "blur(2px)"
        }}
      />

      {/* SVG frame + fill so borders, sheen and grid all scale with the box */}
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(41,37,36,0.85)" />
            <stop offset="1" stopColor="rgba(10,10,10,0.92)" />
          </linearGradient>
          <linearGradient id={litGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(251,191,36,0.30)" />
            <stop offset="0.5" stopColor="rgba(245,158,11,0.18)" />
            <stop offset="1" stopColor="rgba(180,83,9,0.22)" />
          </linearGradient>
          <linearGradient id={sheenId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="0.18" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id={glowId} cx="0.5" cy="0.5" r="0.6">
            <stop offset="0" stopColor="rgba(251,191,36,0.55)" />
            <stop offset="1" stopColor="rgba(251,191,36,0)" />
          </radialGradient>
        </defs>

        {/* Base body */}
        <rect
          x="2"
          y="2"
          width="96"
          height="56"
          rx="10"
          ry="10"
          fill={"url(#" + gradId + ")"}
          className="transition-all duration-200 ease-out"
        />

        {/* Lit overlay fill */}
        <rect
          x="2"
          y="2"
          width="96"
          height="56"
          rx="10"
          ry="10"
          fill={"url(#" + litGradId + ")"}
          className="transition-opacity duration-300 ease-out"
          style={{ opacity: on ? 1 : 0 }}
        />

        {/* Top sheen */}
        <rect
          x="2"
          y="2"
          width="96"
          height="56"
          rx="10"
          ry="10"
          fill={"url(#" + sheenId + ")"}
          style={{ opacity: pressed ? 0.4 : 1 }}
          className="transition-opacity duration-150 ease-out"
        />

        {/* Border */}
        <rect
          x="2.5"
          y="2.5"
          width="95"
          height="55"
          rx="9.5"
          ry="9.5"
          fill="none"
          className="transition-all duration-200 ease-out"
          stroke={
            on
              ? "rgba(251,191,36,0.55)"
              : hover
              ? "rgba(251,191,36,0.45)"
              : "rgba(245,158,11,0.22)"
          }
          strokeWidth={on ? 2 : 1.4}
        />

        {/* Inner accent hairline when lit */}
        <rect
          x="5"
          y="5"
          width="90"
          height="50"
          rx="7"
          ry="7"
          fill="none"
          stroke="rgba(251,191,36,0.35)"
          strokeWidth="0.8"
          className="transition-opacity duration-300 ease-out"
          style={{ opacity: on ? 1 : 0 }}
        />
      </svg>

      {/* Status LED pip (top-left corner) */}
      <div className="pointer-events-none absolute left-[7%] top-[16%]">
        <div
          className="rounded-full transition-all duration-200 ease-out"
          style={{
            width: "0.34rem",
            height: "0.34rem",
            background: on ? "rgb(250,204,21)" : "rgba(120,113,108,0.6)",
            boxShadow: on ? "0 0 6px 1px rgba(250,204,21,0.8)" : "none"
          }}
        />
        {on && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: "rgba(250,204,21,0.55)",
              animationDuration: "1.4s"
            }}
          />
        )}
      </div>

      {/* Toggle flash burst on state change */}
      {flashKey > 0 && (
        <div
          key={flashKey}
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            animation: "none",
            boxShadow: on
              ? "0 0 0 0 rgba(250,204,21,0.5)"
              : "0 0 0 0 rgba(120,113,108,0.4)"
          }}
        >
          <div
            className="absolute inset-0 rounded-xl origin-center"
            style={{
              background: on
                ? "radial-gradient(50% 50% at 50% 50%, rgba(251,191,36,0.35), rgba(251,191,36,0) 70%)"
                : "radial-gradient(50% 50% at 50% 50%, rgba(120,113,108,0.28), rgba(120,113,108,0) 70%)",
              animation: "tb-flash-" + uid + " 420ms ease-out forwards"
            }}
          />
        </div>
      )}

      {/* Face content */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-150 ease-out"
        style={{ transform: pressed ? "scale(0.94)" : "scale(1)" }}
      >
        {children != null && children !== false ? (
          <div className="absolute inset-[16%] flex items-center justify-center">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (on ? "text-amber-200" : hover ? "text-amber-300" : "text-stone-400")
              }
            >
              {children}
            </FitText>
          </div>
        ) : (
          <PowerGlyph on={on} hover={hover} glowId={glowId} />
        )}
      </div>

      <style>
        {"@keyframes tb-flash-" +
          uid +
          " { 0% { opacity: 0.9; transform: scale(0.85); } 100% { opacity: 0; transform: scale(1.15); } }"}
      </style>
    </div>
  );
}

function PowerGlyph(props: { on: boolean; hover: boolean; glowId: string }) {
  const { on, hover, glowId } = props;
  const stroke = on ? "rgb(253,224,71)" : hover ? "rgb(252,211,77)" : "rgb(120,113,108)";
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        preserveAspectRatio="xMidYMid meet"
        className="h-[46%] w-[46%] transition-all duration-200 ease-out"
        style={{
          filter: on ? "drop-shadow(0 0 3px rgba(250,204,21,0.8))" : "none"
        }}
      >
        {on && <circle cx="12" cy="12" r="11" fill={"url(#" + glowId + ")"} />}
        <path
          d="M12 3 L12 11"
          fill="none"
          stroke={stroke}
          strokeWidth="2.4"
          strokeLinecap="round"
          className="transition-all duration-200 ease-out"
        />
        <path
          d="M6.4 6.6 A8 8 0 1 0 17.6 6.6"
          fill="none"
          stroke={stroke}
          strokeWidth="2.4"
          strokeLinecap="round"
          className="transition-all duration-200 ease-out"
        />
      </svg>
    </div>
  );
}