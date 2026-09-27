type ChecklistProps = { items: { id: string; label: string; done: boolean; optional?: boolean }[]; onSelect?: (id: string) => void };

export const Checklist_MIN = {"base":[9,3.5]};

export function Checklist(props: ChecklistProps) {
  const uid = useRef("checklist-" + Math.random().toString(36).slice(2)).current;
  const { items, onSelect } = props;
  const interactive = !!onSelect;
  const [hover, setHover] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  const doneCount = items.reduce(function (a, it) { return a + (it.done ? 1 : 0); }, 0);
  const pct = items.length ? (doneCount / items.length) * 100 : 0;

  return (
    <div
      className="h-full w-full flex flex-col min-h-0 min-w-0"
      style={{ minWidth: Checklist_MIN.base[0] + "rem", minHeight: Checklist_MIN.base[1] + "rem" }}
    >
      {/* progress spine */}
      <div className="relative h-[3px] w-full bg-cyan-950/40 rounded-sm overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-yellow-300 shadow-[0_0_16px_rgba(253,224,71,0.4)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: pct + "%" }}
        />
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-mono tracking-wider uppercase text-[10px] text-slate-500">no objectives</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map(function (it, i) {
              const isHover = interactive && hover === it.id;
              const isPress = interactive && pressed === it.id;
              const accent = it.done ? "text-lime-400" : it.optional ? "text-fuchsia-400" : "text-cyan-300";
              return (
                <div
                  key={it.id}
                  onPointerEnter={interactive ? function () { setHover(it.id); } : undefined}
                  onPointerLeave={interactive ? function () { setHover(null); setPressed(null); } : undefined}
                  onPointerDown={interactive ? function () { setPressed(it.id); } : undefined}
                  onPointerUp={interactive ? function () { setPressed(null); } : undefined}
                  onClick={interactive ? function () { onSelect && onSelect(it.id); } : undefined}
                  className={
                    "relative flex items-center gap-2 p-2 border-l-2 transition-all duration-200 ease-out " +
                    (interactive ? "cursor-pointer " : "") +
                    (isHover ? "bg-cyan-500/10 border-cyan-400 " : "border-transparent ") +
                    (isPress ? "brightness-90 " : "") +
                    (i > 0 ? "border-t border-t-cyan-500/20 " : "")
                  }
                >
                  {/* check box */}
                  <div className="relative h-4 w-4 shrink-0">
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" className={"absolute inset-0 h-full w-full transition-all duration-200 ease-out " + accent}>
                      <defs>
                        <linearGradient id={uid + "-g"} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M3 3 L21 3 L21 17 L17 21 L3 21 Z"
                        fill={it.done ? "url(#" + uid + "-g)" : "rgba(7,7,12,0.9)"}
                        stroke="currentColor"
                        strokeWidth={it.done ? 2.5 : 1.5}
                        opacity={it.done || isHover ? 1 : 0.55}
                      />
                      {it.done ? (
                        <path
                          d="M7 12.5 L11 16.5 L17.5 7.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="square"
                          className="drop-shadow-[0_0_6px_currentColor]"
                        />
                      ) : (
                        <circle cx="12" cy="12" r={isHover ? 4 : 2.5} fill="currentColor" opacity={isHover ? 0.8 : 0.35} className="transition-all duration-200 ease-out" />
                      )}
                    </svg>
                  </div>

                  <span
                    className={
                      "min-w-0 truncate flex-1 font-sans text-sm leading-snug tracking-normal transition-all duration-200 ease-out " +
                      (it.done
                        ? "text-slate-500 line-through"
                        : isHover
                        ? "text-cyan-50"
                        : "text-cyan-100/90")
                    }
                  >
                    {it.label}
                  </span>

                  {it.optional ? (
                    <span className="shrink-0 font-mono font-medium tracking-wider uppercase text-[10px] leading-none px-2 py-1 rounded-sm border border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-400">
                      opt
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}