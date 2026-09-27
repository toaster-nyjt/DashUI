type StatReadoutProps = { value: number | string; delta?: number; tone?: "neutral" | "accent" | "danger"; children?: React.ReactNode };

const StatReadoutTONES: Record<string, { text: string; glow: string; bar: string; ring: string; rgb: string }> = {
  neutral: { text: "text-cyan-100", glow: "drop-shadow-[0_0_6px_rgba(34,211,238,0.35)]", bar: "from-cyan-400 to-cyan-200", ring: "ring-cyan-400/20", rgb: "34,211,238" },
  accent: { text: "text-fuchsia-300", glow: "drop-shadow-[0_0_8px_rgba(232,121,249,0.55)]", bar: "from-fuchsia-500 to-purple-400", ring: "ring-fuchsia-400/30", rgb: "232,121,249" },
  danger: { text: "text-rose-400", glow: "drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]", bar: "from-rose-500 to-red-400", ring: "ring-rose-400/30", rgb: "244,63,94" },
};

export const StatReadout_MIN = {"base":[3.5,2.4]};

export function StatReadout(props: StatReadoutProps) {
  const tone = props.tone || "neutral";
  const t = StatReadoutTONES[tone];
  const uid = useRef("statreadout-" + Math.random().toString(36).slice(2)).current;
  const floor = StatReadout_MIN.base;

  const [pulse, setPulse] = useState(0);
  const prev = useRef(props.value);
  useEffect(() => {
    if (prev.current !== props.value) {
      prev.current = props.value;
      setPulse((p) => p + 1);
    }
  }, [props.value]);

  const d = props.delta;
  const hasDelta = typeof d === "number" && isFinite(d);
  const deltaUp = hasDelta && (d as number) > 0;
  const deltaZero = hasDelta && (d as number) === 0;
  const deltaColor = deltaZero ? "text-neutral-500 border-neutral-600/50" : deltaUp ? "text-emerald-400 border-emerald-400/50" : "text-rose-400 border-rose-400/50";
  const deltaText = (deltaZero ? "±" : deltaUp ? "▲+" : "▼") + String(Math.abs(d as number));

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* recessed face */}
      <div className={"absolute inset-0 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] ring-1 " + t.ring + " rounded-sm overflow-hidden"}>
        {/* scanlines */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(" + t.rgb + ",0.5) 0px, rgba(" + t.rgb + ",0.5) 1px, transparent 1px, transparent 4px)" }}
        />
        {/* corner brackets */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 14 L0 0 L14 0" fill="none" stroke={"rgba(" + t.rgb + ",0.75)"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d="M100 86 L100 100 L86 100" fill="none" stroke={"rgba(" + t.rgb + ",0.75)"} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* value-change sweep */}
        <div
          key={"sweep-" + pulse}
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(100deg, transparent 35%, rgba(" + t.rgb + ",0.28) 50%, transparent 65%)",
            animation: pulse ? "none" : undefined,
            transform: "translateX(-100%)",
            animationName: uid + "-sweep",
            animationDuration: "650ms",
            animationTimingFunction: "ease-out",
            animationFillMode: "forwards",
          } as any}
        />
        <style>{"@keyframes " + uid + "-sweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}"}</style>
      </div>

      {/* content */}
      <div className="absolute inset-[9%] flex flex-col min-h-0 min-w-0 gap-[2px]">
        <div className="relative flex-[3] min-h-0 min-w-0 flex items-stretch">
          <div className="flex-1 min-w-0 min-h-0">
            <FitText
              wrap={false}
              className={"font-mono font-bold tracking-widest uppercase transition-all duration-200 ease-out " + t.text + " " + t.glow}
            >
              {String(props.value)}
            </FitText>
          </div>
          {hasDelta ? (
            <div className="w-[34%] max-w-[34%] min-w-0 min-h-0 flex items-start justify-end pl-1">
              <div className={"h-full w-full min-w-0 border rounded-sm bg-neutral-800/70 " + deltaColor}>
                <div className="absolute-none h-full w-full">
                  <FitText wrap={false} className={"font-mono font-bold tracking-widest uppercase " + deltaColor.split(" ")[0]}>
                    {deltaText}
                  </FitText>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {props.children != null && props.children !== false ? (
          <div className="flex-[1] min-h-0 min-w-0">
            <FitText wrap={false} className="font-mono font-semibold uppercase tracking-[0.18em] text-cyan-200/60">
              {props.children}
            </FitText>
          </div>
        ) : null}

        <div className="h-[6%] min-h-0 w-full bg-black/60 overflow-hidden">
          <div className={"h-full w-full bg-gradient-to-r " + t.bar} style={{ boxShadow: "0 0 8px rgba(" + t.rgb + ",0.6)" }} />
        </div>
      </div>
    </div>
  );
}