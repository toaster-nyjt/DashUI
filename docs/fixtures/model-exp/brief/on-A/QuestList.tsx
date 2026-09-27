type QuestListProps = { quests: { id: string; title: string; objective?: string; district?: string; category?: string; rewardEddies?: number; rewardStreetCred?: number; tracked?: boolean; completed?: boolean }[]; value?: string; onChange: (id: string) => void; onActivate?: (id: string) => void };

export const QuestList_MIN = {"base":[13,7]};

export function QuestList(props: QuestListProps) {
  const { quests, value, onChange, onActivate } = props;
  const uid = useRef("questlist-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const floor = QuestList_MIN.base;

  const fmt = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
    return String(n);
  };

  const fire = (id: string) => {
    onChange(id);
    setPulse(id);
    window.setTimeout(() => setPulse((p) => (p === id ? null : p)), 420);
  };

  return (
    <div className="h-full w-full relative" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div className="absolute inset-0 rounded-md bg-black/60 border border-cyan-400/15 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quests.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-[0.6rem] font-normal uppercase tracking-[0.15em] text-zinc-500">no entries</div>
            </div>
          ) : (
            <div className="flex flex-col">
              {quests.map((q, i) => {
                const sel = value === q.id;
                const hov = hover === q.id;
                return (
                  <div
                    key={q.id}
                    role="button"
                    onPointerEnter={() => setHover(q.id)}
                    onPointerLeave={() => setHover((h) => (h === q.id ? null : h))}
                    onPointerDown={() => fire(q.id)}
                    onDoubleClick={() => { if (onActivate) onActivate(q.id); }}
                    className={
                      "relative touch-none select-none px-2 py-2 border-b border-cyan-400/10 transition-all duration-200 ease-out " +
                      (sel ? "bg-cyan-400/10 " : hov ? "bg-cyan-400/5 " : "") +
                      (q.completed ? "opacity-60 " : "")
                    }
                  >
                    {/* left status bar */}
                    <div
                      className={
                        "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 " +
                        (sel
                          ? "bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]"
                          : q.tracked
                          ? "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.7)]"
                          : q.completed
                          ? "bg-emerald-500/70"
                          : hov
                          ? "bg-cyan-400/70"
                          : "bg-cyan-400/20")
                      }
                    />
                    {pulse === q.id ? (
                      <div className="pointer-events-none absolute inset-0 bg-yellow-300/15 animate-pulse" />
                    ) : null}

                    <div className="relative flex items-baseline gap-2 min-w-0">
                      <span
                        className={
                          "text-[0.6rem] font-normal uppercase tracking-[0.15em] " +
                          (sel ? "text-yellow-300" : "text-zinc-500")
                        }
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={
                          "min-w-0 truncate flex-1 text-xs font-bold uppercase tracking-widest leading-tight transition-colors duration-150 " +
                          (sel
                            ? "text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.4)]"
                            : q.completed
                            ? "text-zinc-500 line-through"
                            : hov
                            ? "text-cyan-50"
                            : "text-cyan-100/90")
                        }
                      >
                        {q.title}
                      </span>
                      {q.tracked ? (
                        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-400 animate-pulse">◆</span>
                      ) : null}
                      {q.completed ? (
                        <span className="text-[0.6rem] uppercase tracking-[0.15em] text-emerald-400">✓</span>
                      ) : null}
                    </div>

                    {q.objective ? (
                      <div className="relative mt-1 min-w-0 truncate text-[0.65rem] font-medium tracking-wide leading-none text-cyan-300/70">
                        {"› " + q.objective}
                      </div>
                    ) : null}

                    <div className="relative mt-1.5 flex items-center gap-2 min-w-0">
                      {q.district ? (
                        <span className="min-w-0 truncate max-w-[45%] px-2 py-0.5 rounded-full border border-fuchsia-400/40 text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-400">
                          {q.district}
                        </span>
                      ) : null}
                      {q.category ? (
                        <span className="min-w-0 truncate max-w-[40%] text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500">
                          {q.category}
                        </span>
                      ) : null}
                      <span className="flex-1" />
                      {typeof q.rewardEddies === "number" ? (
                        <span className="min-w-0 truncate text-[0.65rem] font-medium uppercase tracking-widest leading-none text-lime-300">
                          {"€$ " + fmt(q.rewardEddies)}
                        </span>
                      ) : null}
                      {typeof q.rewardStreetCred === "number" ? (
                        <span className="min-w-0 truncate text-[0.65rem] font-medium uppercase tracking-widest leading-none text-orange-400">
                          {"SC " + fmt(q.rewardStreetCred)}
                        </span>
                      ) : null}
                    </div>

                    {sel ? (
                      <div className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-yellow-300/50" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_0_14px_rgba(0,0,0,0.9)]" id={uid + "-vig"} />
      </div>
    </div>
  );
}