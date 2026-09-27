type TooltipProps = { open: boolean; content: React.ReactNode; anchor?: { x: number; y: number }; children?: React.ReactNode };

export function Tooltip(props: TooltipProps) {
  const { open, content, anchor, children } = props;
  const uid = useRef("tooltip-" + Math.random().toString(36).slice(2)).current;
  const floor = (Tooltip_MIN as any).base;

  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  const norm = (v: number) => (Math.abs(v) <= 1 ? v * 100 : v);
  const hasAnchor = !!anchor;
  const ax = hasAnchor ? norm(anchor!.x) : 50;
  const ay = hasAnchor ? norm(anchor!.y) : 0;
  const xUnit = hasAnchor && Math.abs(anchor!.x) > 1 ? "px" : "%";
  const yUnit = hasAnchor && Math.abs(anchor!.y) > 1 ? "px" : "%";

  const bubbleStyle: any = hasAnchor
    ? { left: ax + xUnit, top: ay + yUnit, transform: "translate(-50%, -100%)" }
    : { left: "50%", top: "0%", transform: "translate(-50%, 0)" };

  const Bracket = (p: { pos: string }) => (
    <span
      className={
        "pointer-events-none absolute h-2 w-2 border-cyan-300/80 " +
        (p.pos === "tl"
          ? "left-0 top-0 border-l border-t"
          : p.pos === "tr"
          ? "right-0 top-0 border-r border-t"
          : p.pos === "bl"
          ? "bottom-0 left-0 border-b border-l"
          : "bottom-0 right-0 border-b border-r")
      }
    />
  );

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {children != null ? <div className="h-full w-full">{children}</div> : null}

      {mounted ? (
        <div className="pointer-events-none absolute inset-0 overflow-visible">
          <div className="absolute" style={bubbleStyle}>
            <div
              className={
                "relative -translate-y-[0.35rem] origin-bottom transition-all duration-200 ease-out " +
                (open
                  ? "opacity-100 scale-100 blur-0"
                  : "opacity-0 scale-[0.94] blur-[1px]")
              }
            >
              {/* halo */}
              <div className="pointer-events-none absolute -inset-1 bg-cyan-400/10 blur-md" />

              <div className="relative border border-cyan-400/40 bg-neutral-900/95 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.22)] shadow-xl">
                {/* top accent scan */}
                <div className="h-[2px] w-full bg-gradient-to-r from-fuchsia-500/70 via-cyan-300 to-transparent" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(0deg, rgba(34,211,238,0.6) 0px, rgba(34,211,238,0.6) 1px, transparent 1px, transparent 3px)",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, transparent 0 6px, rgba(232,121,249,0.8) 6px 7px, transparent 7px 14px)",
                  }}
                />

                <Bracket pos="tl" />
                <Bracket pos="tr" />
                <Bracket pos="bl" />
                <Bracket pos="br" />

                <div
                  className="relative px-3 py-2 font-mono text-xs leading-relaxed tracking-wide text-cyan-100/90 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-y-auto"
                  style={{ maxWidth: "22rem", maxHeight: "16rem", minWidth: "4rem" }}
                >
                  {content}
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
              </div>

              {/* pointer notch */}
              <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[1px]">
                <svg
                  width="14"
                  height="7"
                  viewBox="0 0 14 7"
                  preserveAspectRatio="xMidYMid meet"
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient id={uid + "-notch"} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(23,23,23)" stopOpacity="0.98" />
                      <stop offset="100%" stopColor="rgb(10,10,10)" stopOpacity="0.98" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 0 L7 7 L14 0 Z"
                    fill={"url(#" + uid + "-notch)"}
                    stroke="rgba(34,211,238,0.4)"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const Tooltip_MIN = {"base":[6,2]};