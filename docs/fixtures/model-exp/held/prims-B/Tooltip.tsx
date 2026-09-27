type TooltipProps = { open: boolean; content: React.ReactNode; anchor?: { x: number; y: number }; children?: React.ReactNode };

export const Tooltip_MIN = {"base":[6,2]};

export function Tooltip(props: TooltipProps) {
  const { open, content, anchor, children } = props;
  const uid = useRef("tooltip-" + Math.random().toString(36).slice(2)).current;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  const floor = Tooltip_MIN.base;

  const positioned = !!anchor;
  const bubbleStyle: any = positioned
    ? { left: anchor!.x + "px", top: anchor!.y + "px", transform: "translate(-50%, -100%) translateY(-0.6rem)" }
    : { left: "50%", bottom: "100%", transform: "translateX(-50%) translateY(-0.5rem)" };

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {children != null ? (
        <div className="absolute inset-0 min-w-0 min-h-0">{children}</div>
      ) : null}

      {mounted ? (
        <div
          className="pointer-events-none absolute z-50"
          style={bubbleStyle}
        >
          <div
            className={
              "relative max-w-[22rem] border border-cyan-400/40 bg-neutral-900/90 backdrop-blur-md rounded-none " +
              "shadow-[0_0_20px_rgba(34,211,238,0.18)] shadow-xl transition-all duration-200 ease-out " +
              (open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-[0.96]")
            }
          >
            {/* top accent bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-transparent" />

            {/* scanline / glow backdrop */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent" />
              <div
                className="absolute inset-x-0 h-[35%] opacity-30"
                style={{
                  background: "linear-gradient(180deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.28) 50%, rgba(34,211,238,0) 100%)",
                  animation: "tt-sweep-" + uid + " 2.6s linear infinite"
                }}
              />
            </div>

            {/* corner brackets */}
            <span className="pointer-events-none absolute -left-px -top-px h-2 w-2 border-l border-t border-cyan-300/80" />
            <span className="pointer-events-none absolute -right-px -top-px h-2 w-2 border-r border-t border-cyan-300/80" />
            <span className="pointer-events-none absolute -left-px -bottom-px h-2 w-2 border-l border-b border-fuchsia-400/70" />
            <span className="pointer-events-none absolute -right-px -bottom-px h-2 w-2 border-r border-b border-fuchsia-400/70" />

            <div className="relative px-3 py-2 font-mono text-sm leading-relaxed tracking-normal text-cyan-100/90 [&_*]:min-w-0 break-words">
              {content}
            </div>

            {/* stem */}
            <div className="absolute left-1/2 top-full -translate-x-1/2">
              <div className="h-2 w-2 -translate-y-1/2 rotate-45 border-b border-r border-cyan-400/40 bg-neutral-900/90" />
            </div>
          </div>

          <style>
            {"@keyframes tt-sweep-" + uid + " { 0% { transform: translateY(-120%);} 100% { transform: translateY(320%);} }"}
          </style>
        </div>
      ) : null}
    </div>
  );
}