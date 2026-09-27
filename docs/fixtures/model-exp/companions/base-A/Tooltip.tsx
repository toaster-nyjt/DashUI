type TooltipProps = { open: boolean; content: React.ReactNode; anchor?: { x: number; y: number }; children?: React.ReactNode };

export function Tooltip(props: TooltipProps) {
  const uid = useRef("tooltip-" + Math.random().toString(36).slice(2)).current;
  const { open, content, anchor, children } = props;
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  const floor = (Tooltip_MIN as any).base;

  // anchor ratio (0..100) -> position of the bubble inside the slot
  const ax = anchor ? Math.max(0, Math.min(100, anchor.x)) : 50;
  const ay = anchor ? Math.max(0, Math.min(100, anchor.y)) : 50;
  const below = ay < 50;
  const rightSide = ax < 50;

  const bubbleStyle: any = anchor
    ? {
        left: ax + "%",
        top: ay + "%",
        transform:
          "translate(" + (rightSide ? "0.6rem" : "calc(-100% - 0.6rem)") + ", " +
          (below ? "0.4rem" : "calc(-100% - 0.4rem)") + ")",
        maxWidth: "88%",
      }
    : { left: "50%", top: "50%", transform: "translate(-50%, -50%)", maxWidth: "96%" };

  return (
    <div className="relative h-full w-full" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      {children != null ? (
        <div className="absolute inset-0">{children}</div>
      ) : null}

      {mounted ? (
        <div
          className="absolute z-20 pointer-events-none transition-all duration-200 ease-out"
          style={{
            ...bubbleStyle,
            opacity: open ? 1 : 0,
            filter: open ? "none" : "blur(2px)",
          }}
        >
          <div
            className="relative border border-cyan-400/25 bg-neutral-900/85 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.15)] shadow-xl"
            style={{
              transformOrigin: (below ? "top " : "bottom ") + (rightSide ? "left" : "right"),
              transform: open ? "scale(1) translateY(0)" : "scale(0.92) translateY(" + (below ? "-0.35rem" : "0.35rem") + ")",
              transition: "transform 200ms cubic-bezier(0.2,0.9,0.25,1)",
            }}
          >
            {/* top accent scanline */}
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            {/* corner ticks */}
            <div className="absolute -left-px -top-px h-2 w-2 border-l border-t border-cyan-300/80" />
            <div className="absolute -right-px -bottom-px h-2 w-2 border-r border-b border-fuchsia-400/70" />
            {/* connector stub */}
            {anchor ? (
              <div
                className="absolute h-[1px] w-3 bg-gradient-to-r from-cyan-300/80 to-transparent"
                style={{
                  [below ? "top" : "bottom"]: "-0.4rem",
                  [rightSide ? "left" : "right"]: "0.25rem",
                  transform: rightSide ? "rotate(" + (below ? "-55deg" : "55deg") + ")" : "rotate(" + (below ? "55deg" : "-55deg") + ")",
                  transformOrigin: rightSide ? "left center" : "right center",
                } as any}
              />
            ) : null}

            <div className="relative px-3 py-2">
              <div className="text-sm font-mono font-normal tracking-normal leading-relaxed text-cyan-100/90 break-words">
                {content}
              </div>
            </div>

            {/* bottom status hairline */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <svg className="absolute inset-0 h-full w-full opacity-[0.12]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id={uid + "-sheen"} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
                  <stop offset="60%" stopColor="#000" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill={"url(#" + uid + "-sheen)"} />
            </svg>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const Tooltip_MIN = {"base":[8,2.5]};