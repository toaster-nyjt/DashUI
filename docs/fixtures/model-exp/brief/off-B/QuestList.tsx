type QuestListProps = {
  quests: { id: string; title: string; objective?: string; district?: string; category?: string; rewardEddies?: number; rewardStreetCred?: number; tracked?: boolean; completed?: boolean }[];
  value?: string;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

export const QuestList_MIN = {"base":[13,6]};

export function QuestList(props: QuestListProps) {
  const { quests, value, onChange, onActivate } = props;
  const uid = useRef("questlist-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);

  const fmt = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
    return String(n);
  };

  return (
    <div
      className="h-full w-full relative overflow-hidden rounded-md border border-cyan-400/15 bg-black/60 shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] font-mono"
      style={{ minWidth: QuestList_MIN.base[0] + "rem", minHeight: QuestList_MIN.base[1] + "rem" }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.5) 0px, rgba(34,211,238,0.5) 1px, transparent 1px, transparent 4px)" }}
      />
      <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {quests.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-[0.6rem] font-normal uppercase tracking-[0.15em] text-zinc-500">no entries</span>
          </div>
        ) : (
          <div className="flex flex-col">
            {quests.map((q, i) => {
              const sel = value !== undefined && value === q.id;
              const hov = hover === q.id;
              const prs = pressed === q.id;
              return (
                <div
                  key={"ql-" + uid + "-" + q.id}
                  onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); setPressed(q.id); onChange(q.id); }}
                  onPointerUp={() => setPressed(null)}
                  onPointerCancel={() => setPressed(null)}
                  onPointerEnter={() => setHover(q.id)}
                  onPointerLeave={() => { setHover(null); setPressed(null); }}
                  onDoubleClick={() => { if (onActivate) onActivate(q.id); }}
                  className={
                    "touch-none cursor-pointer relative flex items-stretch gap-2 px-2 py-2 border-b border-cyan-400/10 transition-all duration-150 ease-out " +
                    (sel
                      ? "bg-cyan-400/10 "
                      : hov
                      ? "bg-cyan-400/[0.07] "
                      : "bg-transparent ") +
                    (prs ? "brightness-125 " : "")
                  }
                  style={{ animation: "none", opacity: q.completed && !sel ? 0.55 : 1 }}
                >
                  {/* left rail */}
                  <div className="relative w-[3px] rounded-full overflow-hidden bg-cyan-400/10">
                    <div
                      className={
                        "absolute inset-x-0 bottom-0 transition-all duration-300 ease-out " +
                        (sel
                          ? "top-0 bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]"
                          : q.tracked
                          ? "top-0 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.7)] animate-pulse"
                          : hov
                          ? "top-1/4 bg-cyan-400/70"
                          : "top-full bg-cyan-400/40")
                      }
                    />
                  </div>

                  {/* main */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={
                          "text-[0.6rem] leading-none transition-colors duration-150 " +
                          (q.completed ? "text-emerald-400" : sel ? "text-yellow-300" : q.tracked ? "text-fuchsia-400" : "text-cyan-300/50")
                        }
                      >
                        {q.completed ? "\u2713" : q.tracked ? "\u25C6" : "\u25B8"}
                      </span>
                      <span
                        className={
                          "min-w-0 truncate text-xs font-bold uppercase tracking-widest leading-tight transition-colors duration-150 " +
                          (q.completed
                            ? "text-zinc-500 line-through"
                            : sel
                            ? "text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.45)]"
                            : hov
                            ? "text-cyan-50"
                            : "text-cyan-100/90")
                        }
                      >
                        {q.title}
                      </span>
                      {q.category ? (
                        <span className="min-w-0 truncate shrink text-[0.6rem] font-normal uppercase tracking-[0.15em] leading-none text-fuchsia-400/80 border border-fuchsia-400/40 rounded-full px-2 py-0.5">
                          {q.category}
                        </span>
                      ) : null}
                    </div>
                    {q.objective ? (
                      <div className="min-w-0 truncate text-[0.65rem] font-medium uppercase tracking-widest leading-none text-cyan-300/70">
                        {q.objective}
                      </div>
                    ) : null}
                  </div>

                  {/* meta */}
                  <div className="shrink min-w-0 flex flex-col items-end justify-center gap-1">
                    {q.district ? (
                      <span className="min-w-0 max-w-full truncate text-[0.6rem] font-normal uppercase tracking-[0.15em] leading-none text-zinc-500">
                        {q.district}
                      </span>
                    ) : null}
                    {(q.rewardEddies !== undefined || q.rewardStreetCred !== undefined) ? (
                      <span className="min-w-0 max-w-full truncate text-[0.6rem] font-medium uppercase tracking-[0.15em] leading-none flex items-center gap-2">
                        {q.rewardEddies !== undefined ? (
                          <span className="text-lime-300">{"\u20AC$" + fmt(q.rewardEddies)}</span>
                        ) : null}
                        {q.rewardStreetCred !== undefined ? (
                          <span className="text-orange-400">{"SC " + fmt(q.rewardStreetCred)}</span>
                        ) : null}
                      </span>
                    ) : null}
                  </div>

                  {sel ? (
                    <div className="pointer-events-none absolute inset-0 border border-yellow-300/40 rounded-sm shadow-[inset_0_0_14px_-4px_rgba(253,224,71,0.5)]" />
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