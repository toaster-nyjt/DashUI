type TooltipProps = { open: boolean; content: React.ReactNode; anchor?: { x: number; y: number }; children?: React.ReactNode };

export const Tooltip_MIN = {"base":[9,3]};

export function Tooltip(props: TooltipProps) {
  const { open, content, anchor, children } = props;
  const uid = useRef("tooltip-" + Math.random().toString(36).slice(2)).current;
  const floor = Tooltip_MIN.base;

  // pulse key so the panel re-plays its entry sweep each time it opens
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (open) setPulse((p) => p + 1);
  }, [open]);

  const posStyle: any = anchor
    ? { left: anchor.x + "px", top: anchor.y + "px", transform: "translate(-50%, -100%)" }
    : { left: "50%", bottom: "100%", transform: "translateX(-50%)" };

  const clip = "polygon(0.55rem 0, 100% 0, 100% calc(100% - 0.55rem), calc(100% - 0.55rem) 100%, 0 100%, 0 0.55rem)";

  return (
    <div
      className="relative h-full w-full"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      {children != null ? (
        <div className="absolute inset-0">{children}</div>
      ) : null}

      <div className="pointer-events-none absolute inset-0 overflow-visible">
        <div
          key={"wrap-" + pulse}
          className={
            "absolute z-50 w-max max-w-[18rem] transition-all duration-200 ease-out " +
            (open
              ? "opacity-100 scale-100 blur-0"
              : "opacity-0 scale-[0.94] blur-[1px]")
          }
          style={{
            ...posStyle,
            marginBottom: anchor ? undefined : "0.6rem",
            marginTop: anchor ? "-0.6rem" : undefined,
          }}
        >
          {/* outer glow frame */}
          <div className="relative">
            <div
              className="absolute -inset-[1px] bg-gradient-to-br from-cyan-400/70 via-fuchsia-400/30 to-cyan-300/50"
              style={{ clipPath: clip }}
            />
            <div
              className="relative bg-neutral-900/95 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.22)]"
              style={{ clipPath: clip }}
            >
              {/* scanline texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, rgba(34,211,238,0.45) 0px, rgba(34,211,238,0.45) 1px, transparent 1px, transparent 3px)",
                }}
              />
              {/* top accent rail */}
              <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-cyan-300 via-cyan-400/40 to-transparent" />
              {/* left tick marks */}
              <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-fuchsia-400/80 via-cyan-400/30 to-transparent" />
              {/* entry sweep */}
              {open ? (
                <div
                  key={"sweep-" + pulse}
                  className="pointer-events-none absolute inset-0 overflow-hidden"
                >
                  <div
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent"
                    style={{ animation: "none", transform: "translateX(-120%)", animationName: uid + "-sweep", animationDuration: "650ms", animationTimingFunction: "ease-out", animationFillMode: "forwards" }}
                  />
                </div>
              ) : null}

              <div className="relative px-3 py-2">
                <div className="font-mono text-xs leading-relaxed tracking-normal text-cyan-100/90 [&_*]:font-mono">
                  {content}
                </div>
              </div>

              {/* bottom status hairline */}
              <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/40 to-fuchsia-400/40" />
            </div>

            {/* connector stem + node */}
            <div className="absolute left-1/2 top-full h-[0.55rem] w-[1px] -translate-x-1/2 bg-gradient-to-b from-cyan-300/80 to-transparent" />
            <div className="absolute left-1/2 top-full h-[5px] w-[5px] -translate-x-1/2 translate-y-[0.45rem] rotate-45 bg-cyan-300/90 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
        </div>
      </div>

      <style>{"@keyframes " + uid + "-sweep { from { transform: translateX(-120%); } to { transform: translateX(420%); } }"}</style>
    </div>
  );
}