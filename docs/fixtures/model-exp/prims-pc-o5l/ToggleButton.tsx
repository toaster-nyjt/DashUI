type ToggleButtonProps = { on: boolean; onChange: (on: boolean) => void; children?: React.ReactNode };

export const ToggleButton_MIN = {"base":[2.5,1.5]};

export function ToggleButton(props: ToggleButtonProps) {
  const { on, onChange, children } = props;
  const uid = useRef("tgl-" + Math.random().toString(36).slice(2)).current;
  const [press, setPress] = useState(false);
  const floor = ToggleButton_MIN.base;

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setPress(true);
      }}
      onPointerUp={(e) => {
        if (press) onChange(!on);
        setPress(false);
      }}
      onPointerCancel={() => setPress(false)}
    >
      <div
        className={
          "absolute inset-0 rounded-lg border overflow-hidden transition-all duration-200 ease-out " +
          (on
            ? "border-amber-400/60 bg-amber-500/20 shadow-lg shadow-amber-500/30"
            : "border-amber-500/25 bg-neutral-900/90 shadow-md shadow-black/40 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/30") +
          (press ? " scale-95 brightness-95" : " hover:-translate-y-px")
        }
      >
        <div
          className={
            "absolute inset-0 bg-gradient-to-b transition-all duration-300 ease-out " +
            (on ? "from-amber-400/25 to-amber-600/10" : "from-neutral-800/40 to-neutral-950/60")
          }
        />
        {/* lit sweep */}
        <div
          className={
            "absolute inset-x-0 top-0 h-[8%] transition-all duration-300 ease-out " +
            (on ? "bg-amber-300/70" : "bg-stone-700/40")
          }
        />
        <div
          className={
            "absolute inset-x-0 bottom-0 h-[8%] transition-all duration-300 ease-out " +
            (on ? "bg-amber-400/40" : "bg-transparent")
          }
        />
        {/* status dot */}
        <div className="absolute left-[5%] top-1/2 -translate-y-1/2 h-[16%] w-[7%] min-w-0 rounded-full"
          style={{ background: on ? "rgb(163 230 53)" : "rgba(87,83,78,0.9)" }}
        />
        {on && (
          <div className="absolute left-[5%] top-1/2 -translate-y-1/2 h-[16%] w-[7%] rounded-full bg-lime-400 animate-pulse" />
        )}

        {children != null && (
          <div className="absolute inset-y-[18%] left-[16%] right-[10%]">
            <FitText
              className={
                "font-semibold uppercase tracking-wider transition-colors duration-200 ease-out " +
                (on ? "text-amber-200" : "text-stone-400")
              }
            >
              {children}
            </FitText>
          </div>
        )}
        <span className="hidden">{uid}</span>
      </div>
    </div>
  );
}