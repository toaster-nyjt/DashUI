type QuestListProps = {
  quests: { id: string; title: string; objective?: string; district?: string; category?: string; rewardEddies?: number; rewardStreetCred?: number; tracked?: boolean; completed?: boolean }[];
  value?: string;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

export const QuestList_MIN = {"base":[11,6]};

export function QuestList(props: QuestListProps) {
  const { quests, value, onChange, onActivate } = props;
  const uid = useRef("questlist-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);

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
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(34,211,238,0.06) 0px, rgba(34,211,238,0.06) 1px, transparent 1px, transparent 4px)"
        }}
      />
      <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {quests.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-[0.6rem] font-normal uppercase tracking-[0.15em] text-zinc-500">// no entries</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {quests.map((q, i) => {
              const selected = value !== undefined && value === q.id;
              const isHover = hover === q.id;
              return (
                <div
                  key={q.id + "-" + i}
                  onPointerEnter={() => setHover(q.id)}
                  onPointerLeave={() => setHover((h) => (h === q.id ? null : h))}
                  onPointerDown={() => onChange(q.id)}
                  onDoubleClick={() => { if (onActivate) onActivate(q.id); }}
                  className={
                    "relative touch-none cursor-pointer select-none px-2 py-2 border-b border-cyan-400/10 transition-all duration-150 " +
                    (selected
                      ? "bg-yellow-300/10 "
                      : isHover
                      ? "bg-cyan-400/10 "
                      : "bg-transparent ") +
                    (q.completed && !selected ? "opacity-60 " : "")
                  }
                >
                  <span
                    className={
                      "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 " +
                      (selected
                        ? "bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]"
                        : q.tracked
                        ? "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.7)]"
                        : isHover
                        ? "bg-cyan-400/70"
                        : "bg-transparent")
                    }
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    {q.tracked ? (
                      <span className="text-fuchsia-400 text-[0.6rem] leading-none animate-pulse">◆</span>
                    ) : (
                      <span className={"text-[0.6rem] leading-none " + (selected ? "text-yellow-300" : "text-cyan-300/40")}>▸</span>
                    )}
                    <div
                      className={
                        "min-w-0 truncate text-xs font-bold uppercase tracking-widest leading-tight transition-colors duration-150 " +
                        (selected
                          ? "text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.45)]"
                          : q.completed
                          ? "text-zinc-500 line-through"
                          : "text-cyan-50")
                      }
                    >
                      {q.title}
                    </div>
                    {q.completed ? (
                      <span className="ml-auto text-[0.6rem] uppercase tracking-[0.15em] text-emerald-400 leading-none">✓</span>
                    ) : null}
                  </div>

                  {q.objective ? (
                    <div className="mt-1 min-w-0 truncate text-[0.65rem] font-normal tracking-normal leading-none text-cyan-100/80">
                      {q.objective}
                    </div>
                  ) : null}

                  {(q.district || q.category || q.rewardEddies !== undefined || q.rewardStreetCred !== undefined) ? (
                    <div className="mt-1.5 flex items-center gap-2 min-w-0 overflow-hidden">
                      {q.district ? (
                        <span className="min-w-0 truncate text-[0.6rem] uppercase tracking-[0.15em] leading-none text-cyan-300/70">
                          {q.district}
                        </span>
                      ) : null}
                      {q.category ? (
                        <span className="min-w-0 truncate rounded-full border border-fuchsia-400/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] leading-none text-fuchsia-400">
                          {q.category}
                        </span>
                      ) : null}
                      <span className="ml-auto flex items-center gap-2 leading-none">
                        {q.rewardEddies !== undefined ? (
                          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-lime-300">€${fmt(q.rewardEddies)}</span>
                        ) : null}
                        {q.rewardStreetCred !== undefined ? (
                          <span className="text-[0.6rem] uppercase tracking-[0.15em] text-orange-400">SC{fmt(q.rewardStreetCred)}</span>
                        ) : null}
                      </span>
                    </div>
                  ) : null}

                  <span
                    className={
                      "pointer-events-none absolute inset-0 border transition-all duration-200 " +
                      (selected
                        ? "border-yellow-300/40 shadow-[inset_0_0_14px_-4px_rgba(253,224,71,0.6)]"
                        : "border-transparent")
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div id={uid + "-edge"} className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}