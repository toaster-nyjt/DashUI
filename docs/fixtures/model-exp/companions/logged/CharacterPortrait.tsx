type CharacterPortraitProps = { src: string; alt?: string; status?: 'normal' | 'damaged' | 'critical' };

export const CharacterPortrait_MIN = {"base":[4,5]};

export function CharacterPortrait(props: CharacterPortraitProps) {
  const uid = useRef("cportrait-" + Math.random().toString(36).slice(2)).current;
  const status = props.status || "normal";
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  const tone =
    status === "critical"
      ? { ring: "ring-rose-500/50", border: "border-rose-500/60", glow: "shadow-[0_0_22px_rgba(244,63,94,0.45)]", hex: "#f43f5e", tint: "bg-rose-600/25" }
      : status === "damaged"
      ? { ring: "ring-amber-300/40", border: "border-amber-300/50", glow: "shadow-[0_0_18px_rgba(251,191,36,0.35)]", hex: "#fbbf24", tint: "bg-amber-500/15" }
      : { ring: "ring-cyan-400/25", border: "border-cyan-400/40", glow: "shadow-[0_0_18px_rgba(34,211,238,0.25)]", hex: "#22d3ee", tint: "bg-cyan-400/5" };

  const corner = (pts: string, key: string) => (
    <polyline key={key} points={pts} fill="none" stroke={tone.hex} strokeWidth="1.6" strokeLinecap="square" opacity="0.9" />
  );

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: CharacterPortrait_MIN.base[0] + "rem", minHeight: CharacterPortrait_MIN.base[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-scan{0%{transform:translateY(-110%)}100%{transform:translateY(510%)}}@keyframes " + uid + "-glitch{0%,88%,100%{transform:translate(0,0);opacity:0}90%{transform:translate(-2%,0);opacity:.55}93%{transform:translate(2%,1%);opacity:.4}96%{transform:translate(-1%,-1%);opacity:.5}}@keyframes " + uid + "-pulse{0%,100%{opacity:.25}50%{opacity:.7}}"}</style>

      <div className={"absolute inset-0 overflow-hidden bg-black/60 border " + tone.border + " " + tone.glow + " ring-1 " + tone.ring + " transition-all duration-200 ease-out"}>
        {/* image */}
        <div className="absolute inset-0">
          {!err && props.src ? (
            <img
              src={props.src}
              alt={props.alt || ""}
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setErr(true)}
              className={
                "h-full w-full object-cover transition-all duration-500 ease-out " +
                (loaded ? "opacity-100 scale-100" : "opacity-0 scale-105") +
                (status === "critical" ? " saturate-150 contrast-125" : status === "damaged" ? " saturate-75" : "")
              }
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className="h-1/2 w-1/2 opacity-40">
                <circle cx="12" cy="8.5" r="3.6" fill="none" stroke={tone.hex} strokeWidth="1.1" />
                <path d="M4.5 20c1.2-4.2 4.1-6.2 7.5-6.2S18.3 15.8 19.5 20" fill="none" stroke={tone.hex} strokeWidth="1.1" />
              </svg>
            </div>
          )}
        </div>

        {/* status tint */}
        <div className={"absolute inset-0 " + tone.tint + " mix-blend-screen pointer-events-none transition-colors duration-300"} />

        {/* scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)" }}
        />
        {/* sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute left-0 w-full"
            style={{
              height: "18%",
              background: "linear-gradient(to bottom, transparent, " + tone.hex + "55, transparent)",
              animation: uid + "-scan 3.6s linear infinite",
            }}
          />
        </div>
        {/* glitch bars when damaged/critical */}
        {status !== "normal" && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              background: "repeating-linear-gradient(to bottom, " + tone.hex + "40 0 2px, transparent 2px 9px)",
              animation: uid + "-glitch " + (status === "critical" ? "1.6s" : "3s") + " steps(1,end) infinite",
            }}
          />
        )}
        {/* vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_26px_rgba(0,0,0,0.9)]" />

        {/* corner brackets */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none">
          {corner("0.8,14 0.8,0.8 14,0.8", "tl")}
          {corner("86,0.8 99.2,0.8 99.2,14", "tr")}
          {corner("99.2,86 99.2,99.2 86,99.2", "br")}
          {corner("14,99.2 0.8,99.2 0.8,86", "bl")}
        </svg>

        {/* status pip */}
        <div className="absolute right-0 top-0 flex items-center gap-[2px] p-1">
          {[0, 1, 2].map((i) => {
            const lit = status === "critical" ? i < 3 : status === "damaged" ? i < 2 : i < 1;
            return (
              <span
                key={"pip-" + i}
                className={"block h-[3px] w-[6px] transition-all duration-200 " + (lit ? "" : "opacity-20")}
                style={{
                  background: lit ? tone.hex : "#525252",
                  boxShadow: lit ? "0 0 6px " + tone.hex : "none",
                  animation: lit && status === "critical" ? uid + "-pulse 0.7s ease-in-out infinite" : undefined,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}