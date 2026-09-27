type StatusEffectStripProps = {
  effects: { id: string; label: string; icon?: string; duration?: number; stacks?: number; polarity?: "buff" | "debuff" }[];
  onHover?: (id: string | null) => void;
};

export const StatusEffectStrip_MIN = {"base":[6,2.6]};

export function StatusEffectStrip(props: StatusEffectStripProps) {
  const { effects, onHover } = props;
  const uid = useRef("ses-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);

  const floor = StatusEffectStrip_MIN.base;

  const tone = (p?: "buff" | "debuff") =>
    p === "debuff"
      ? { text: "text-red-400", ring: "rgba(248,113,113,0.65)", bar: "#ef4444", edge: "rgba(248,113,113,0.45)" }
      : p === "buff"
      ? { text: "text-lime-400", ring: "rgba(163,230,53,0.65)", bar: "#a3e635", edge: "rgba(163,230,53,0.45)" }
      : { text: "text-cyan-300", ring: "rgba(34,211,238,0.6)", bar: "#22d3ee", edge: "rgba(34,211,238,0.4)" };

  const glyphOf = (e: { label: string; icon?: string }) => {
    if (e.icon && e.icon.length > 0) return e.icon;
    const parts = e.label.trim().split(/\s+/);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return e.label.trim().slice(0, 2).toUpperCase();
  };

  const fmtDur = (d: number) => {
    if (d >= 60) {
      const m = Math.floor(d / 60);
      const s = Math.floor(d % 60);
      return m + ":" + (s < 10 ? "0" + s : String(s));
    }
    return (d >= 10 ? Math.round(d) : Math.round(d * 10) / 10) + "s";
  };

  const setH = (id: string | null) => {
    setHover(id);
    if (onHover) onHover(id);
  };

  return (
    <div
      className="h-full w-full relative"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="absolute inset-0 rounded-md bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] ring-1 ring-cyan-400/20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,rgba(34,211,238,0.10)_0px,rgba(34,211,238,0.10)_1px,transparent_1px,transparent_4px)",
          }}
        />
      </div>

      {effects.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="font-mono font-normal tracking-[0.3em] uppercase text-[10px] leading-tight text-slate-500 truncate min-w-0">
            no active effects
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onPointerLeave={() => setH(null)}
        >
          <div className="min-h-full w-full flex flex-wrap items-center content-center justify-start gap-2 p-1">
            {effects.map((e, i) => {
              const t = tone(e.polarity);
              const hot = hover === e.id;
              const frac =
                typeof e.duration === "number" ? Math.max(0, Math.min(1, e.duration / 30)) : null;
              const low = typeof e.duration === "number" && e.duration <= 5;
              return (
                <div
                  key={e.id + "-" + i}
                  onPointerEnter={() => setH(e.id)}
                  className={
                    "relative rounded-sm border overflow-hidden transition-all duration-200 ease-out " +
                    (hot ? "scale-110 -translate-y-px " : "scale-100 ") +
                    (e.polarity === "debuff"
                      ? "border-red-500/50 bg-red-500/10 "
                      : e.polarity === "buff"
                      ? "border-lime-500/50 bg-lime-500/10 "
                      : "border-cyan-500/40 bg-cyan-500/10 ")
                  }
                  style={{
                    width: "2.5rem",
                    height: "2.1rem",
                    boxShadow: hot
                      ? "0 0 14px " + t.ring + ", inset 0 0 10px rgba(0,0,0,0.6)"
                      : "inset 0 0 10px rgba(0,0,0,0.6)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      background:
                        "linear-gradient(135deg," + t.edge + " 0%,rgba(0,0,0,0) 65%)",
                    }}
                  />
                  <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: t.bar, opacity: hot ? 1 : 0.7 }} />

                  <div
                    className={
                      "absolute left-[10%] right-[10%] top-[6%] bottom-[34%] " +
                      (low ? "animate-pulse" : "")
                    }
                  >
                    <FitText
                      wrap={false}
                      className={
                        "font-mono font-black tracking-tight transition-colors duration-200 " +
                        t.text +
                        " drop-shadow-[0_0_6px_currentColor]"
                      }
                    >
                      {glyphOf(e)}
                    </FitText>
                  </div>

                  {typeof e.duration === "number" ? (
                    <div className="absolute left-[8%] right-[8%] bottom-[16%] h-[34%] flex items-center justify-center">
                      <FitText
                        wrap={false}
                        className="font-mono font-medium tracking-wider uppercase text-slate-400"
                      >
                        {fmtDur(e.duration)}
                      </FitText>
                    </div>
                  ) : null}

                  {typeof e.stacks === "number" && e.stacks > 1 ? (
                    <div
                      className="absolute right-0 top-0 flex items-center justify-center bg-fuchsia-500/80 rounded-bl-sm"
                      style={{ width: "0.85rem", height: "0.7rem" }}
                    >
                      <div className="absolute inset-[1px]">
                        <FitText wrap={false} className="font-mono font-black tracking-tight text-black">
                          {String(e.stacks)}
                        </FitText>
                      </div>
                    </div>
                  ) : null}

                  {frac !== null ? (
                    <div className="absolute left-0 right-0 bottom-0 h-[3px] bg-black/70">
                      <div
                        className="h-full transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{
                          width: (frac * 100).toFixed(2) + "%",
                          background: t.bar,
                          boxShadow: "0 0 8px " + t.ring,
                        }}
                      />
                    </div>
                  ) : null}

                  <svg
                    viewBox="0 0 40 34"
                    preserveAspectRatio="none"
                    className="absolute inset-0 pointer-events-none"
                    style={{ opacity: hot ? 1 : 0 , transition: "opacity 200ms ease-out" }}
                  >
                    <defs>
                      <linearGradient id={uid + "-sweep-" + i} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={t.bar} stopOpacity="0" />
                        <stop offset="50%" stopColor={t.bar} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={t.bar} stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="40" height="34" fill={"url(#" + uid + "-sweep-" + i + ")"} />
                    <path d="M0 3 L3 0 M40 31 L37 34" stroke={t.bar} strokeWidth="1.2" fill="none" />
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}