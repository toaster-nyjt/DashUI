type CharacterPortraitProps = { src: string; alt?: string };

export const CharacterPortrait_MIN = {"base":[4,4.5]};

export function CharacterPortrait(props: CharacterPortraitProps) {
  const uid = useRef("cportrait-" + Math.random().toString(36).slice(2)).current;
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    setStatus("loading");
  }, [props.src]);

  useEffect(() => {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      setGlitch(true);
      const off = setTimeout(() => { if (alive) setGlitch(false); }, 260);
      return off;
    };
    const iv = setInterval(tick, 3800);
    return () => { alive = false; clearInterval(iv); };
  }, []);

  const floor = CharacterPortrait_MIN.base;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-scan{0%{transform:translateY(-110%)}100%{transform:translateY(510%)}}" +
        "@keyframes " + uid + "-slide{0%{transform:translateX(0)}20%{transform:translateX(-3%)}40%{transform:translateX(2.5%)}60%{transform:translateX(-1.5%)}100%{transform:translateX(0)}}" +
        "@keyframes " + uid + "-flick{0%,100%{opacity:.18}50%{opacity:.34}}"
      }</style>

      {/* recessed well */}
      <div className="absolute inset-0 rounded-md border border-cyan-400/20 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* image viewport */}
        <div className="absolute inset-[4%] overflow-hidden rounded-sm bg-zinc-950">
          {status !== "error" ? (
            <img
              src={props.src}
              alt={props.alt || ""}
              draggable={false}
              onLoad={() => setStatus("ok")}
              onError={() => setStatus("error")}
              className={
                "absolute inset-0 h-full w-full object-cover select-none transition-all duration-500 ease-out " +
                (status === "ok" ? "opacity-100 saturate-[1.15] contrast-[1.1]" : "opacity-0")
              }
              style={glitch ? { animation: uid + "-slide 0.26s steps(4,end) both" } : undefined}
            />
          ) : null}

          {/* chromatic glitch echoes */}
          {status === "ok" && glitch ? (
            <>
              <img
                src={props.src}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover mix-blend-screen opacity-60"
                style={{ filter: "url(#none)", transform: "translateX(-2.5%)", mixBlendMode: "screen", opacity: 0.5, WebkitFilter: "none", backgroundColor: "transparent", clipPath: "inset(18% 0 46% 0)" }}
              />
              <div className="absolute inset-0 bg-fuchsia-500/20 mix-blend-screen" style={{ clipPath: "inset(56% 0 22% 0)" }} />
              <div className="absolute inset-0 bg-cyan-400/20 mix-blend-screen" style={{ clipPath: "inset(12% 0 70% 0)" }} />
            </>
          ) : null}

          {/* empty / error state */}
          {status === "error" || !props.src ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
              <svg viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet" className="h-full w-full opacity-60">
                <circle cx="24" cy="18" r="7" fill="none" stroke="rgb(34,211,238)" strokeOpacity="0.5" strokeWidth="1.5" />
                <path d="M10 42c2-9 7-13 14-13s12 4 14 13" fill="none" stroke="rgb(34,211,238)" strokeOpacity="0.5" strokeWidth="1.5" />
                <path d="M6 6 L42 42" stroke="rgb(244,63,94)" strokeOpacity="0.55" strokeWidth="1.2" />
              </svg>
            </div>
          ) : null}

          {/* loading sweep */}
          {status === "loading" && props.src ? (
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/10 via-transparent to-fuchsia-500/10 animate-pulse" />
          ) : null}

          {/* scanlines */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0.42) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)",
              animation: uid + "-flick 2.6s ease-in-out infinite",
            }}
          />
          {/* rolling scan bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[9%] bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent"
            style={{ animation: uid + "-scan 4.2s linear infinite" }} />
          {/* vignette + tint */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-cyan-400/5" />
        </div>

        {/* corner brackets */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id={uid + "-br"} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgb(253,224,71)" />
              <stop offset="100%" stopColor="rgb(232,121,249)" />
            </linearGradient>
          </defs>
          <g fill="none" stroke={"url(#" + uid + "-br)"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="square">
            <path d="M2 14 L2 2 L16 2" />
            <path d="M84 2 L98 2 L98 14" />
            <path d="M98 86 L98 98 L84 98" />
            <path d="M16 98 L2 98 L2 86" />
          </g>
          <g stroke="rgb(34,211,238)" strokeOpacity="0.5" strokeWidth="1" vectorEffect="non-scaling-stroke">
            <path d="M40 2 L60 2" />
            <path d="M40 98 L60 98" />
          </g>
        </svg>

        {/* live dot */}
        <div className="pointer-events-none absolute right-[8%] top-[7%] h-[5%] w-[5%] min-w-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
      </div>
    </div>
  );
}