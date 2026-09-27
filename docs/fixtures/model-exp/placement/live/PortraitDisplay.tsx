type PortraitDisplayProps = { imageUrl: string; alt?: string; glitchIntensity?: number };

export const PortraitDisplay_MIN = {"base":[5,6]};

export function PortraitDisplay(props: PortraitDisplayProps) {
  const uid = useRef("portraitdisplay-" + Math.random().toString(36).slice(2)).current;
  const g = Math.max(0, Math.min(1, props.glitchIntensity ?? 0));
  const alt = props.alt ?? "";
  const floor = PortraitDisplay_MIN.base;

  const dur = (2.6 - g * 1.9).toFixed(2) + "s";
  const shift = (0.4 + g * 3.2).toFixed(2);
  const sweep = (6 - g * 3.4).toFixed(2) + "s";

  const css =
    "@keyframes " + uid + "-glitch{" +
    "0%,64%,100%{transform:translate3d(0,0,0);opacity:0}" +
    "66%{transform:translate3d(" + shift + "%,-0.6%,0);opacity:" + (0.25 + g * 0.6).toFixed(2) + "}" +
    "70%{transform:translate3d(-" + shift + "%,0.8%,0);opacity:" + (0.2 + g * 0.55).toFixed(2) + "}" +
    "74%{transform:translate3d(" + (Number(shift) * 0.5).toFixed(2) + "%,0,0);opacity:" + (0.15 + g * 0.45).toFixed(2) + "}" +
    "78%{transform:translate3d(0,0,0);opacity:0}}" +
    "@keyframes " + uid + "-slice{" +
    "0%,60%,100%{clip-path:inset(40% 0 40% 0);opacity:0}" +
    "63%{clip-path:inset(12% 0 71% 0);opacity:" + (0.3 + g * 0.6).toFixed(2) + ";transform:translateX(" + shift + "%)}" +
    "67%{clip-path:inset(58% 0 25% 0);opacity:" + (0.3 + g * 0.6).toFixed(2) + ";transform:translateX(-" + shift + "%)}" +
    "71%{clip-path:inset(78% 0 8% 0);opacity:" + (0.2 + g * 0.5).toFixed(2) + ";transform:translateX(" + (Number(shift) * 0.7).toFixed(2) + "%)}" +
    "75%{opacity:0;transform:translateX(0)}}" +
    "@keyframes " + uid + "-sweep{0%{transform:translateY(-120%)}100%{transform:translateY(520%)}}" +
    "@keyframes " + uid + "-flicker{0%,100%{opacity:.30}42%{opacity:.5}47%{opacity:.18}55%{opacity:.42}}" +
    "@keyframes " + uid + "-pulse{0%,100%{opacity:.55}50%{opacity:1}}";

  const layer = "absolute inset-0 h-full w-full object-cover select-none pointer-events-none";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{css}</style>

      {/* recessed frame */}
      <div className="absolute inset-0 rounded-md border border-cyan-500/20 bg-[#07070c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* image stack */}
        <div className="absolute inset-[3%] overflow-hidden rounded-sm bg-black">
          <img
            src={props.imageUrl}
            alt={alt}
            draggable={false}
            className={layer + " saturate-125 contrast-110"}
          />
          {/* chromatic ghosts */}
          <img
            src={props.imageUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={layer + " mix-blend-screen"}
            style={{
              filter: "url(#none) sepia(1) hue-rotate(300deg) saturate(6)",
              animation: uid + "-glitch " + dur + " steps(1,end) infinite",
            }}
          />
          <img
            src={props.imageUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={layer + " mix-blend-screen"}
            style={{
              filter: "sepia(1) hue-rotate(140deg) saturate(6)",
              animation: uid + "-glitch " + dur + " steps(1,end) infinite reverse",
            }}
          />
          {/* torn slice */}
          <img
            src={props.imageUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={layer}
            style={{ animation: uid + "-slice " + dur + " steps(1,end) infinite" }}
          />

          {/* scanlines */}
          <div
            className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.55)_0px,rgba(0,0,0,0.55)_1px,transparent_1px,transparent_3px)]"
            style={{ animation: uid + "-flicker " + dur + " ease-in-out infinite" }}
          />
          {/* sweep bar */}
          <div
            className="absolute left-0 right-0 h-[14%] pointer-events-none bg-[linear-gradient(to_bottom,transparent,rgba(34,211,238,0.18),rgba(253,224,71,0.12),transparent)]"
            style={{ animation: uid + "-sweep " + sweep + " linear infinite" }}
          />
          {/* vignette + tint */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,5,10,0.85)_100%)]" />
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(6,182,212,0.12)_0%,transparent_45%,rgba(217,70,239,0.14)_100%)] mix-blend-screen" />
        </div>

        {/* frame edge glow */}
        <div className="absolute inset-0 pointer-events-none rounded-md ring-1 ring-cyan-400/20" />
      </div>

      {/* corner brackets */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full pointer-events-none"
      >
        <g
          stroke="rgb(253 224 71)"
          strokeOpacity="0.8"
          strokeWidth="1.2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        >
          <path d="M1 12 L1 1 L12 1" />
          <path d="M88 1 L99 1 L99 12" />
          <path d="M99 88 L99 99 L88 99" />
          <path d="M12 99 L1 99 L1 88" />
        </g>
        <g stroke="rgb(34 211 238)" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke">
          <line x1="20" y1="1" x2="42" y2="1" style={{ animation: uid + "-pulse 2.4s ease-in-out infinite" }} />
          <line x1="58" y1="99" x2="80" y2="99" style={{ animation: uid + "-pulse 2.4s ease-in-out infinite reverse" }} />
        </g>
      </svg>
    </div>
  );
}