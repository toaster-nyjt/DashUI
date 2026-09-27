type TooltipProps = { open: boolean; content: React.ReactNode; anchor?: { x: number; y: number }; children?: React.ReactNode };

export const Tooltip_MIN = {"base":[8,2.5]};

export function Tooltip(props: TooltipProps) {
  const { open, content, anchor, children } = props;
  const uid = useRef("tooltip-" + Math.random().toString(36).slice(2)).current;
  const floor = Tooltip_MIN.base;

  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 180);
    return () => clearTimeout(t);
  }, [open]);

  const positioned = !!anchor;
  const panelStyle: any = positioned
    ? { left: anchor!.x + "px", top: anchor!.y + "px", transform: "translate(-50%,-100%) translateY(-0.6rem)" }
    : { left: "50%", bottom: "100%", transform: "translateX(-50%)", marginBottom: "0.5rem" };

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {children != null ? <div className="absolute inset-0">{children}</div> : null}

      {mounted ? (
        <div
          className="pointer-events-none absolute z-50"
          style={{ ...panelStyle, maxWidth: "22rem" }}
        >
          <div
            className={
              "relative border border-cyan-400/40 bg-neutral-900/90 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.18)] shadow-xl transition-all duration-200 ease-out " +
              (open ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-1 scale-95")
            }
          >
            {/* top accent rail */}
            <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-fuchsia-400/70 to-transparent" />
            {/* scanline wash */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(34,211,238,0.35) 0px, rgba(34,211,238,0.35) 1px, transparent 1px, transparent 4px)",
              }}
            />
            {/* corner brackets */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id={uid + "-cg"} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgb(103,232,249)" />
                  <stop offset="100%" stopColor="rgb(232,121,249)" />
                </linearGradient>
              </defs>
              <g stroke={"url(#" + uid + "-cg)"} strokeWidth="1.6" fill="none" vectorEffect="non-scaling-stroke">
                <path d="M0 14 L0 0 L14 0" />
                <path d="M100 86 L100 100 L86 100" />
              </g>
            </svg>

            <div className="relative px-3 py-2 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-cyan-100/90">
              {content}
            </div>

            {/* pointer notch */}
            <div
              className={
                "absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-cyan-400/40 bg-neutral-900/90 " +
                (positioned ? "-bottom-[5px]" : "-bottom-[5px]")
              }
            />
            <div className="pointer-events-none absolute -inset-[1px] animate-pulse bg-cyan-400/[0.04]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}