type CharacterPortraitProps = { src: string; animated?: boolean; state?: 'idle' | 'alert' | 'damaged' };

export const CharacterPortrait_MIN = {"base":[4,5]};

export function CharacterPortrait(props: CharacterPortraitProps) {
  const uid = useRef("charportrait-" + Math.random().toString(36).slice(2)).current;
  const state = props.state || "idle";
  const animated = !!props.animated;

  const TONE: any = {
    idle: { line: "rgba(34,211,238,0.55)", glow: "rgba(34,211,238,0.35)", accent: "#22d3ee", wash: "rgba(34,211,238,0.10)" },
    alert: { line: "rgba(253,224,71,0.7)", glow: "rgba(253,224,71,0.45)", accent: "#fde047", wash: "rgba(253,224,71,0.12)" },
    damaged: { line: "rgba(239,68,68,0.7)", glow: "rgba(239,68,68,0.45)", accent: "#ef4444", wash: "rgba(239,68,68,0.14)" }
  };
  const tone = TONE[state];

  const css =
    "@keyframes " + uid + "-scan{0%{transform:translateY(-12%)}100%{transform:translateY(112%)}}" +
    "@keyframes " + uid + "-glitchA{0%,86%,100%{transform:translate(0,0);opacity:0}88%{transform:translate(-2.5%,1%);opacity:.55}91%{transform:translate(2%,-1.5%);opacity:.4}94%{transform:translate(-1%,0);opacity:.3}96%{opacity:0}}" +
    "@keyframes " + uid + "-glitchB{0%,84%,100%{transform:translate(0,0);opacity:0}85%{transform:translate(2.5%,-1%);opacity:.5}90%{transform:translate(-2%,1.5%);opacity:.38}95%{opacity:0}}" +
    "@keyframes " + uid + "-slice{0%,80%,100%{opacity:0;transform:translateX(0)}82%{opacity:1;transform:translateX(3%)}86%{opacity:1;transform:translateX(-4%)}89%{opacity:0}}" +
    "@keyframes " + uid + "-breathe{0%,100%{opacity:.35}50%{opacity:.75}}" +
    "@keyframes " + uid + "-pulse{0%,100%{opacity:.5}50%{opacity:1}}" +
    "@keyframes " + uid + "-flicker{0%,100%{opacity:.9}47%{opacity:.9}48%{opacity:.55}50%{opacity:.95}72%{opacity:.7}74%{opacity:.95}}";

  const imgStyleBase: any = {
    position: "absolute", inset: 0, width: "100%", height: "100%",
    objectFit: "cover", display: "block"
  };

  const alertSpeed = state === "damaged" ? "1.4s" : state === "alert" ? "2.2s" : "3.6s";

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ minWidth: CharacterPortrait_MIN.base[0] + "rem", minHeight: CharacterPortrait_MIN.base[1] + "rem" }}>
      <style>{css}</style>

      {/* recessed frame */}
      <div
        className="absolute inset-0 rounded-md overflow-hidden bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]"
        style={{ border: "1px solid " + tone.line }}
      >
        {/* image stack */}
        <div className="absolute inset-0">
          <img src={props.src} alt="" draggable={false} style={Object.assign({}, imgStyleBase, {
            filter: state === "damaged" ? "saturate(0.7) contrast(1.15)" : state === "alert" ? "saturate(1.15) contrast(1.08)" : "saturate(1.02)",
            animation: animated ? uid + "-flicker 5s steps(24,end) infinite" : "none"
          })} />
          {animated ? (
            <>
              <img src={props.src} alt="" draggable={false} style={Object.assign({}, imgStyleBase, {
                mixBlendMode: "screen", filter: "url(#none) hue-rotate(-40deg) saturate(3)",
                animation: uid + "-glitchA " + (state === "damaged" ? "2.6s" : "5s") + " steps(30,end) infinite"
              })} />
              <img src={props.src} alt="" draggable={false} style={Object.assign({}, imgStyleBase, {
                mixBlendMode: "screen", filter: "hue-rotate(150deg) saturate(3)",
                animation: uid + "-glitchB " + (state === "damaged" ? "3.1s" : "6.2s") + " steps(30,end) infinite"
              })} />
              {/* horizontal slice tear */}
              <div style={{
                position: "absolute", left: 0, right: 0, top: "38%", height: "7%", overflow: "hidden",
                animation: uid + "-slice " + (state === "damaged" ? "2.2s" : "4.4s") + " steps(20,end) infinite"
              }}>
                <img src={props.src} alt="" draggable={false} style={{ position: "absolute", left: 0, top: "-38%", width: "100%", height: "1428%", objectFit: "cover" }} />
              </div>
              <div style={{
                position: "absolute", left: 0, right: 0, top: "68%", height: "4%", overflow: "hidden",
                animation: uid + "-slice " + (state === "damaged" ? "3.3s" : "6.8s") + " steps(20,end) infinite"
              }}>
                <img src={props.src} alt="" draggable={false} style={{ position: "absolute", left: 0, top: "-1700%", width: "100%", height: "2500%", objectFit: "cover" }} />
              </div>
            </>
          ) : null}
        </div>

        {/* tone wash + vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(160deg," + tone.wash + " 0%,rgba(0,0,0,0) 45%,rgba(0,0,0,0.55) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 26px rgba(0,0,0,0.85), inset 0 0 40px " + tone.glow }} />

        {/* scanlines */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.30) 0px, rgba(0,0,0,0.30) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)",
          opacity: 0.6
        }} />

        {/* sweeping scan bar */}
        {animated ? (
          <div className="absolute left-0 right-0 pointer-events-none" style={{
            height: "16%",
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%," + tone.glow + " 55%, rgba(255,255,255,0.10) 80%, rgba(0,0,0,0) 100%)",
            animation: uid + "-scan " + alertSpeed + " linear infinite"
          }} />
        ) : null}

        {/* HUD overlay */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none">
          <defs>
            <linearGradient id={uid + "-edge"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={tone.accent} stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d946ef" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* corner brackets */}
          <g stroke={"url(#" + uid + "-edge)"} strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke">
            <path d="M2 14 L2 2 L16 2" />
            <path d="M84 2 L98 2 L98 14" />
            <path d="M98 86 L98 98 L84 98" />
            <path d="M16 98 L2 98 L2 86" />
          </g>
          <g stroke={tone.accent} strokeWidth="1" opacity="0.5" vectorEffect="non-scaling-stroke">
            <line x1="2" y1="26" x2="2" y2="42" />
            <line x1="98" y1="58" x2="98" y2="74" />
          </g>
        </svg>

        {/* status ticks bottom-left */}
        <div className="absolute left-0 bottom-0 flex items-end gap-[2px] p-1 pointer-events-none">
          {[0, 1, 2].map((i) => (
            <span key={"tick-" + i} style={{
              display: "block", width: "3px", height: (4 + i * 3) + "px",
              background: tone.accent, boxShadow: "0 0 6px " + tone.accent,
              opacity: 0.8,
              animation: animated ? uid + "-pulse " + (0.9 + i * 0.35) + "s ease-in-out infinite" : "none"
            }} />
          ))}
        </div>

        {/* alert/damage frame pulse */}
        {state !== "idle" ? (
          <div className="absolute inset-0 pointer-events-none rounded-md" style={{
            boxShadow: "inset 0 0 0 2px " + tone.line + ", 0 0 16px " + tone.glow,
            animation: uid + "-breathe " + (state === "damaged" ? "0.9s" : "1.8s") + " ease-in-out infinite"
          }} />
        ) : null}
      </div>
    </div>
  );
}