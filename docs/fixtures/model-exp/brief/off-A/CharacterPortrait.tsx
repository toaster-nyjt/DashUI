type CharacterPortraitProps = { src: string; alt?: string };

export const CharacterPortrait_MIN = {"base":[3.5,4.5]};

export function CharacterPortrait(props: CharacterPortraitProps) {
  const uid = useRef("cportrait-" + Math.random().toString(36).slice(2)).current;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const floor = CharacterPortrait_MIN.base;

  useEffect(() => { setFailed(false); setLoaded(false); }, [props.src]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{"@keyframes " + uid + "-scan{0%{transform:translateY(-110%)}100%{transform:translateY(510%)}}@keyframes " + uid + "-glitch{0%,92%,100%{transform:translate(0,0);opacity:0}93%{transform:translate(-2%,1%);opacity:.5}95%{transform:translate(2%,-1%);opacity:.35}97%{transform:translate(-1%,0);opacity:.45}}@keyframes " + uid + "-flick{0%,100%{opacity:.25}50%{opacity:.6}}"}</style>

      {/* frame well */}
      <div className="absolute inset-0 rounded-md border border-cyan-400/20 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* image layer */}
        <div className="absolute inset-[4%] overflow-hidden rounded-sm bg-zinc-950">
          {!failed ? (
            <img
              src={props.src}
              alt={props.alt || ""}
              draggable={false}
              onLoad={() => setLoaded(true)}
              onError={() => setFailed(true)}
              className={
                "absolute inset-0 h-full w-full object-cover select-none transition-all duration-500 ease-out " +
                (loaded ? "opacity-100 scale-100 saturate-[1.15]" : "opacity-0 scale-105")
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
              <svg viewBox="0 0 48 48" preserveAspectRatio="xMidYMid meet" className="h-[70%] w-[70%]">
                <circle cx="24" cy="17" r="8" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" />
                <path d="M8 44c2-10 8-14 16-14s14 4 16 14" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" />
              </svg>
            </div>
          )}

          {/* duotone / neon grade */}
          <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-600/20 via-transparent to-cyan-400/15 mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />

          {/* scanlines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{ backgroundImage: "repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)" }}
          />
          {/* glitch band */}
          <div
            className="absolute left-0 right-0 pointer-events-none mix-blend-screen"
            style={{
              top: "30%",
              height: "12%",
              background: "linear-gradient(90deg, rgba(217,70,239,0.5), rgba(34,211,238,0.5))",
              animation: uid + "-glitch 5.5s steps(1,end) infinite",
            }}
          />
          {/* sweeping scan beam */}
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: "18%",
              background: "linear-gradient(to bottom, transparent, rgba(34,211,238,0.28), transparent)",
              animation: uid + "-scan 4.2s linear infinite",
            }}
          />
        </div>

        {/* corner brackets */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full pointer-events-none">
          <g fill="none" stroke="rgba(253,224,71,0.8)" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
            <polyline points="2,16 2,2 16,2" />
            <polyline points="84,2 98,2 98,16" />
            <polyline points="98,84 98,98 84,98" />
            <polyline points="16,98 2,98 2,84" />
          </g>
          <g stroke="rgba(34,211,238,0.45)" strokeWidth="1" vectorEffect="non-scaling-stroke">
            <line x1="46" y1="2" x2="54" y2="2" />
            <line x1="46" y1="98" x2="54" y2="98" />
          </g>
        </svg>

        {/* live dot */}
        <div
          className="absolute rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.9)]"
          style={{ right: "8%", top: "7%", width: "0.3rem", height: "0.3rem", animation: uid + "-flick 1.6s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}