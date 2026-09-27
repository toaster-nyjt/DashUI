type TooltipProps = { open: boolean; content: React.ReactNode; anchor?: { x: number; y: number }; children?: React.ReactNode };

export function Tooltip(props: TooltipProps) {
  const uid = useRef("tooltip-" + Math.random().toString(36).slice(2)).current;
  const { open, content, anchor, children } = props;
  const hasContent = content !== null && content !== undefined && content !== false && content !== "";
  const show = open && hasContent;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (show) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 180);
    return () => clearTimeout(t);
  }, [show]);

  const anchored = !!anchor;
  const bubbleStyle: any = anchored
    ? { left: anchor!.x + "px", top: anchor!.y + "px", transform: "translate(-50%, calc(-100% - 0.75rem))", maxWidth: "22rem" }
    : { left: "50%", bottom: "100%", marginBottom: "0.6rem", transform: "translateX(-50%)", maxWidth: "22rem" };

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: Tooltip_MIN.base[0] + "rem", minHeight: Tooltip_MIN.base[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-in{0%{opacity:0;transform:translateY(6px) scale(.94)}60%{opacity:1}100%{opacity:1;transform:translateY(0) scale(1)}}" +
        "@keyframes " + uid + "-scan{0%{transform:translateY(-100%)}100%{transform:translateY(400%)}}" +
        "@keyframes " + uid + "-flick{0%,100%{opacity:.85}45%{opacity:.35}50%{opacity:1}}"
      }</style>

      <div className="h-full w-full">{children}</div>

      {(mounted || show) && (
        <div
          className="pointer-events-none absolute z-50"
          style={bubbleStyle}
          role="tooltip"
        >
          <div
            className={
              "relative min-w-0 border border-cyan-400/40 bg-neutral-900/90 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.25)] shadow-xl transition-all duration-200 ease-out " +
              (show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-95")
            }
            style={{
              clipPath: "polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem))",
              animation: show ? uid + "-in 220ms cubic-bezier(.2,.9,.25,1)" : undefined,
            }}
          >
            {/* top accent bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-cyan-300 via-fuchsia-400/70 to-transparent" />
            {/* scanline sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute left-0 h-[35%] w-full bg-gradient-to-b from-transparent via-cyan-300/10 to-transparent"
                style={{ animation: uid + "-scan 2.4s linear infinite" }}
              />
            </div>
            {/* corner ticks */}
            <div className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-cyan-300/70" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-2 w-2 border-b border-r border-fuchsia-400/60" />

            <div className="relative px-3 py-2">
              <div className="min-w-0 font-mono text-[11px] font-medium leading-relaxed tracking-[0.06em] text-cyan-100/90 [&_b]:text-cyan-300 [&_strong]:text-cyan-300">
                {content}
              </div>
            </div>

            {/* baseline glow */}
            <div
              className="pointer-events-none absolute -bottom-[1px] left-0 h-[1px] w-full bg-cyan-300/60"
              style={{ animation: uid + "-flick 3s steps(12,end) infinite" }}
            />
          </div>

          {/* stem */}
          <div className="relative mx-auto h-2 w-[1px]">
            <div className="absolute left-1/2 top-0 h-2 w-[1px] -translate-x-1/2 bg-gradient-to-b from-cyan-300/80 to-transparent" />
            <div className="absolute left-1/2 top-2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
          </div>
        </div>
      )}
    </div>
  );
}

export const Tooltip_MIN = {"base":[6,2]};