type CharacterPortraitProps = { src: string; alt?: string };

export function CharacterPortrait(props: CharacterPortraitProps) {
  const uid = useRef("cportrait-" + Math.random().toString(36).slice(2)).current;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const floor = CharacterPortrait_MIN.base;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [props.src]);

  const corner = (pos: string) => (
    <div
      className={"absolute " + pos + " w-[18%] h-[18%] pointer-events-none"}
      style={{ minWidth: 0, minHeight: 0 }}
    >
      <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <path
          d="M1 9 L1 1 L9 1"
          fill="none"
          stroke="rgb(253,224,71)"
          strokeWidth="2.5"
          strokeLinecap="square"
          opacity="0.85"
        />
      </svg>
    </div>
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {/* recessed viewport */}
      <div className="absolute inset-0 rounded-md overflow-hidden bg-black/60 border border-cyan-400/20 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)]">
        {/* image layer */}
        <div className="absolute inset-0">
          {!failed && (
            <img
              src={props.src}
              alt={props.alt || ""}
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={
                "absolute inset-0 h-full w-full object-cover select-none transition-all duration-700 ease-out " +
                (loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm")
              }
              style={{ filter: "saturate(1.15) contrast(1.08)" }}
            />
          )}
          {/* tint + vignette */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 0%, rgba(34,211,238,0.35), rgba(0,0,0,0) 60%)"
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(100% 100% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.75) 100%)"
            }}
          />
        </div>

        {/* empty / failed state */}
        {(failed || !props.src) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet" className="h-[62%] w-[62%] opacity-60">
              <defs>
                <linearGradient id={uid + "-ghost"} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="rgb(217,70,239)" stopOpacity="0.25" />
                </linearGradient>
              </defs>
              <circle cx="24" cy="17" r="8" fill="none" stroke={"url(#" + uid + "-ghost)"} strokeWidth="2" />
              <path
                d="M8 42 C10 30 17 27 24 27 C31 27 38 30 40 42"
                fill="none"
                stroke={"url(#" + uid + "-ghost)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)"
          }}
        />

        {/* sweeping scan beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute left-0 w-full h-[22%] opacity-40"
            style={{
              background:
                "linear-gradient(to bottom, rgba(34,211,238,0) 0%, rgba(34,211,238,0.5) 50%, rgba(34,211,238,0) 100%)",
              animation: uid + "-sweep 4.2s linear infinite"
            }}
          />
        </div>

        {/* glitch slices */}
        <div className="absolute inset-0 pointer-events-none mix-blend-screen">
          <div
            className="absolute left-0 w-full h-[3%] top-[32%] bg-fuchsia-500/50"
            style={{ animation: uid + "-glitch 5.1s steps(1,end) infinite" }}
          />
          <div
            className="absolute left-0 w-full h-[2%] top-[64%] bg-cyan-400/50"
            style={{ animation: uid + "-glitch 3.7s steps(1,end) infinite 1.3s" }}
          />
        </div>

        {/* inner frame line */}
        <div className="absolute inset-[3%] border border-cyan-400/20 rounded-sm pointer-events-none" />
      </div>

      {/* corner brackets */}
      {corner("top-0 left-0")}
      <div className="absolute top-0 right-0 w-[18%] h-[18%] pointer-events-none rotate-90">
        <svg viewBox="0 0 24 24" className="w-full h-full" preserveAspectRatio="none">
          <path d="M1 9 L1 1 L9 1" fill="none" stroke="rgb(253,224,71)" strokeWidth="2.5" opacity="0.85" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-[18%] h-[18%] pointer-events-none rotate-180">
        <svg viewBox="0 0 24 24" className="w-full h-full" preserveAspectRatio="none">
          <path d="M1 9 L1 1 L9 1" fill="none" stroke="rgb(253,224,71)" strokeWidth="2.5" opacity="0.85" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-[18%] h-[18%] pointer-events-none -rotate-90">
        <svg viewBox="0 0 24 24" className="w-full h-full" preserveAspectRatio="none">
          <path d="M1 9 L1 1 L9 1" fill="none" stroke="rgb(253,224,71)" strokeWidth="2.5" opacity="0.85" />
        </svg>
      </div>

      {/* live dot */}
      <div className="absolute top-[6%] right-[7%] h-[6%] w-[6%] rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] animate-pulse pointer-events-none" />

      <style>
        {"@keyframes " + uid + "-sweep{0%{top:-25%}100%{top:105%}}" +
          "@keyframes " + uid + "-glitch{0%,92%{opacity:0;transform:translateX(0)}93%{opacity:1;transform:translateX(-4%)}95%{opacity:1;transform:translateX(5%)}97%{opacity:0;transform:translateX(0)}100%{opacity:0}}"}
      </style>
    </div>
  );
}

export const CharacterPortrait_MIN = {"base":[4,4.5]};