type StatusEffectStripProps = {
  effects: { id: string; label: string; iconUrl?: string; remaining?: number; tone?: "buff" | "debuff" | "neutral" }[];
  onSelect?: (id: string) => void;
};

export const StatusEffectStrip_MIN = {"base":[6,2.5]};

export function StatusEffectStrip(props: StatusEffectStripProps) {
  const { effects, onSelect } = props;
  const uid = useRef("ses-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [press, setPress] = useState<string | null>(null);
  const interactive = !!onSelect;

  const TONE = {
    buff: {
      text: "text-lime-300",
      border: "border-lime-400/40",
      bg: "bg-lime-500/10",
      fill: "bg-lime-400",
      glow: "shadow-[0_0_12px_rgba(163,230,53,0.35)]",
    },
    debuff: {
      text: "text-red-400",
      border: "border-red-500/40",
      bg: "bg-red-500/10",
      fill: "bg-red-500",
      glow: "shadow-[0_0_12px_rgba(239,68,68,0.35)]",
    },
    neutral: {
      text: "text-cyan-300",
      border: "border-cyan-400/35",
      bg: "bg-cyan-500/10",
      fill: "bg-cyan-400",
      glow: "shadow-[0_0_12px_rgba(34,211,238,0.35)]",
    },
  } as const;

  if (!effects || effects.length === 0) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{ minWidth: StatusEffectStrip_MIN.base[0] + "rem", minHeight: StatusEffectStrip_MIN.base[1] + "rem" }}
      >
        <div className="h-full w-full rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
          <span className="font-mono font-medium tracking-wider uppercase text-slate-500 text-[10px] leading-none truncate min-w-0">
            no active effects
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full"
      style={{ minWidth: StatusEffectStrip_MIN.base[0] + "rem", minHeight: StatusEffectStrip_MIN.base[1] + "rem" }}
    >
      <div className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-wrap content-start items-stretch gap-2 min-h-full">
          {effects.map((e, i) => {
            const tone = TONE[e.tone || "neutral"];
            const isHover = hover === e.id;
            const isPress = press === e.id;
            const hasR = typeof e.remaining === "number";
            const r = hasR ? Math.max(0, Math.min(1, e.remaining as number)) : 0;
            const low = hasR && r <= 0.2;
            return (
              <div
                key={e.id}
                role={interactive ? "button" : undefined}
                onPointerEnter={interactive ? () => setHover(e.id) : undefined}
                onPointerLeave={interactive ? () => { setHover(null); setPress(null); } : undefined}
                onPointerDown={interactive ? (ev: any) => { ev.currentTarget.setPointerCapture?.(ev.pointerId); setPress(e.id); } : undefined}
                onPointerUp={interactive ? () => { if (press === e.id) onSelect && onSelect(e.id); setPress(null); } : undefined}
                onPointerCancel={interactive ? () => setPress(null) : undefined}
                className={
                  "relative touch-none flex-1 basis-[7rem] max-w-[14rem] overflow-hidden rounded-sm border transition-all duration-200 ease-out " +
                  tone.border + " " + tone.bg +
                  (interactive ? " cursor-pointer" : "") +
                  (isHover ? " " + tone.glow + " brightness-125 -translate-y-px" : "") +
                  (isPress ? " translate-y-0 brightness-90 ring-2 ring-fuchsia-400/60" : "")
                }
                style={{ animation: "none", animationDelay: i * 40 + "ms" }}
              >
                {/* inner recess */}
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(21,15,40,0.75)_0%,rgba(10,10,20,0.9)_100%)]" />
                {/* scan sheen */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_3px)",
                  }}
                />
                {/* active edge */}
                <div className={"absolute left-0 top-0 h-full w-[2px] " + tone.fill + (low ? " animate-pulse" : "")} />

                <div className="relative h-full w-full flex items-center gap-2 px-2 py-1 min-w-0">
                  {/* icon / radial */}
                  <div className="relative h-[1.25rem] w-[1.25rem] shrink">
                    <svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
                      <defs>
                        <linearGradient id={uid + "-g-" + i} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.25" />
                        </linearGradient>
                      </defs>
                      <g className={tone.text}>
                        <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="4" />
                        {hasR ? (
                          <circle
                            cx="20"
                            cy="20"
                            r="17"
                            fill="none"
                            stroke={"url(#" + uid + "-g-" + i + ")"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            transform="rotate(-90 20 20)"
                            strokeDasharray={106.8}
                            strokeDashoffset={106.8 * (1 - r)}
                            style={{ transition: "stroke-dashoffset 500ms cubic-bezier(0.22,1,0.36,1)" }}
                          />
                        ) : null}
                        {!e.iconUrl ? (
                          <circle cx="20" cy="20" r={hasR ? 6 : 8} fill="currentColor" opacity={isHover ? 1 : 0.8} />
                        ) : null}
                      </g>
                    </svg>
                    {e.iconUrl ? (
                      <img
                        src={e.iconUrl}
                        alt=""
                        className={
                          "absolute inset-[22%] h-[56%] w-[56%] object-contain transition-transform duration-200 ease-out " +
                          (isHover ? "scale-110" : "")
                        }
                        style={{ filter: "drop-shadow(0 0 4px currentColor)" }}
                      />
                    ) : null}
                  </div>

                  {/* label + bar */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <span
                      className={
                        "block min-w-0 truncate font-mono font-medium tracking-wider uppercase text-[10px] leading-none transition-colors duration-200 " +
                        (isHover ? tone.text : "text-cyan-100/85")
                      }
                    >
                      {e.label}
                    </span>
                    {hasR ? (
                      <span className="block h-[3px] w-full rounded-sm bg-cyan-950/60 overflow-hidden">
                        <span
                          className={
                            "block h-full " + tone.fill + " transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] " +
                            (low ? "animate-pulse" : "")
                          }
                          style={{ width: (r * 100).toFixed(2) + "%" }}
                        />
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}