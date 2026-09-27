type CharacterPortraitProps = { src: string; alt?: string };

export function CharacterPortrait(props: CharacterPortraitProps) {
  const uid = useRef("cportrait-" + Math.random().toString(36).slice(2)).current;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [props.src]);

  useEffect(() => {
    let alive = true;
    let t: any;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        setGlitch(true);
        setTimeout(() => { if (alive) setGlitch(false); }, 220);
        loop();
      }, 2200 + Math.random() * 3600);
    };
    loop();
    return () => { alive = false; clearTimeout(t); };
  }, []);

  const floor = CharacterPortrait_MIN.base;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-scan{0%{transform:translateY(-110%)}100%{transform:translateY(310%)}}" +
        "@keyframes " + uid + "-shift{0%{transform:translate(0,0)}25%{transform:translate(-2.5%,0.6%)}50%{transform:translate(2%,-1%)}75%{transform:translate(-1%,-0.4%)}100%{transform:translate(0,0)}}" +
        "@keyframes " + uid + "-flick{0%,100%{opacity:.18}50%{opacity:.4}}"
      }</style>

      {/* recessed well */}
      <div className="absolute inset-0 rounded-md border border-cyan-400/20 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* image layer */}
        <div
          className="absolute inset-0 transition-all duration-500 ease-out"
          style={glitch ? { animation: uid + "-shift 220ms steps(4,end) 1" } : undefined}
        >
          {!failed ? (
            <img
              src={props.src}
              alt={props.alt || ""}
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={
                "absolute inset-0 h-full w-full object-cover select-none transition-all duration-700 ease-out contrast-125 saturate-[1.15] " +
                (loaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-sm")
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
              <svg viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet" className="h-full w-full opacity-60">
                <g fill="none" stroke="rgb(34,211,238)" strokeOpacity="0.5" strokeWidth="1.2">
                  <circle cx="24" cy="18" r="7.5" />
                  <path d="M9.5 41c2.5-8 7.9-12 14.5-12s12 4 14.5 12" />
                </g>
              </svg>
            </div>
          )}
        </div>

        {/* chroma split ghosts on glitch */}
        {glitch && !failed && (
          <>
            <div
              className="absolute inset-0 mix-blend-screen opacity-60"
              style={{ backgroundImage: "linear-gradient(90deg, rgba(217,70,239,0.35), transparent 40%)", transform: "translateX(-2%)" }}
            />
            <div
              className="absolute inset-0 mix-blend-screen opacity-60"
              style={{ backgroundImage: "linear-gradient(270deg, rgba(34,211,238,0.35), transparent 40%)", transform: "translateX(2%)" }}
            />
            <div className="absolute left-0 right-0 top-[38%] h-[6%] bg-cyan-300/25 mix-blend-screen" />
          </>
        )}

        {/* scanline texture */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
            animation: uid + "-flick 3.2s ease-in-out infinite"
          }}
        />

        {/* sweeping scan beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute left-0 right-0 h-[16%] bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent"
            style={{ animation: uid + "-scan 4.5s linear infinite" }}
          />
        </div>

        {/* vignette + tint */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-cyan-400/10" />
      </div>

      {/* corner brackets */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full pointer-events-none"
      >
        <defs>
          <linearGradient id={uid + "-br"} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(253,224,71)" />
            <stop offset="100%" stopColor="rgb(34,211,238)" />
          </linearGradient>
        </defs>
        <g stroke={"url(#" + uid + "-br)"} strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" strokeLinecap="square">
          <path d="M1,14 L1,1 L14,1" />
          <path d="M86,1 L99,1 L99,14" />
          <path d="M99,86 L99,99 L86,99" />
          <path d="M14,99 L1,99 L1,86" />
        </g>
      </svg>

      {/* live tick dot */}
      <div className="absolute right-[6%] top-[6%] h-[6%] w-[6%] rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] animate-pulse pointer-events-none" />
    </div>
  );
}

export const CharacterPortrait_MIN = {"base":[3.5,4]};