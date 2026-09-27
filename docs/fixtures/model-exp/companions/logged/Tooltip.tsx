type TooltipProps = { open: boolean; content: React.ReactNode; anchor?: { x: number; y: number }; children?: React.ReactNode };

export const Tooltip_MIN = {"base":[7,2]};

export function Tooltip(props: TooltipProps) {
  const { open, content, anchor, children } = props;
  const uid = useRef("tooltip-" + Math.random().toString(36).slice(2)).current;
  const floor = Tooltip_MIN.base;

  const [shown, setShown] = useState(open);
  useEffect(() => {
    if (open) { setShown(true); return; }
    const t = setTimeout(() => setShown(false), 180);
    return () => clearTimeout(t);
  }, [open]);

  const positioned = !!anchor;
  const bubbleStyle: any = positioned
    ? { left: anchor!.x + "px", top: anchor!.y + "px", transform: "translate(-50%,-100%) translateY(-0.6rem)" }
    : { left: "50%", bottom: "100%", transform: "translateX(-50%)", marginBottom: "0.4rem" };

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <style>{
        "@keyframes " + uid + "-in{0%{opacity:0;transform:scale(.92)}60%{opacity:1}100%{opacity:1;transform:scale(1)}}" +
        "@keyframes " + uid + "-sweep{0%{transform:translateY(-100%)}100%{transform:translateY(400%)}}" +
        "@keyframes " + uid + "-flick{0%,100%{opacity:1}42%{opacity:.72}46%{opacity:1}}"
      }</style>

      {children != null ? (
        <div className="absolute inset-0 min-w-0 min-h-0">{children}</div>
      ) : null}

      {shown ? (
        <div
          className="pointer-events-none absolute z-50"
          style={bubbleStyle}
        >
          <div
            className={
              "relative transition-all duration-200 ease-out " +
              (open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1")
            }
            style={{ animation: open ? uid + "-in 220ms ease-out" : undefined }}
          >
            <div className="relative max-w-[22rem] min-w-0 overflow-hidden border border-cyan-400/40 bg-neutral-900/90 backdrop-blur-md px-3 py-2 shadow-[0_0_20px_rgba(34,211,238,0.22)] shadow-xl">
              {/* scan sweep */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
                <div
                  className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent"
                  style={{ animation: uid + "-sweep 2.6s linear infinite" }}
                />
              </div>
              {/* top accent rail */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-400/70 to-transparent" />
              {/* corner brackets */}
              <div className="pointer-events-none absolute left-0 top-0 h-2 w-2 border-l border-t border-cyan-300/80" />
              <div className="pointer-events-none absolute right-0 top-0 h-2 w-2 border-r border-t border-cyan-300/80" />
              <div className="pointer-events-none absolute left-0 bottom-0 h-2 w-2 border-l border-b border-fuchsia-400/70" />
              <div className="pointer-events-none absolute right-0 bottom-0 h-2 w-2 border-r border-b border-fuchsia-400/70" />

              <div
                className="relative min-w-0 font-mono text-xs leading-relaxed tracking-[0.08em] text-cyan-100/90"
                style={{ animation: uid + "-flick 4s steps(1,end) infinite" }}
              >
                {content}
              </div>
            </div>

            {/* stem */}
            <div className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2">
              <div className="h-2 w-px bg-cyan-400/70 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="mx-auto h-1 w-1 -translate-y-[1px] rotate-45 bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}