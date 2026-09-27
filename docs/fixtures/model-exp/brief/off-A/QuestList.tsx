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
      <div className="absolute inset-0 pointer-events-none opacity-[0.12] bg-[repeating-linear-gradient(0deg,rgba(34,211,238,0.6)_0px,rgba(34,211,238,0.6)_1px,transparent_1px,transparent_4px)]" />
      {quests.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[0.6rem] uppercase tracking-[0.2em] text-zinc-500">// no entries</span>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quests.map((q, i) => {
            const sel = value === q.id;
            const hov = hover === q.id;
            return (
              <div
                key={q.id}
                role="option"
                aria-selected={sel}
                onPointerDown={() => onChange(q.id)}
                onDoubleClick={() => { if (onActivate) onActivate(q.id); }}
                onPointerEnter={() => setHover(q.id)}
                onPointerLeave={() => setHover((h) => (h === q.id ? null : h))}
                className={
                  "relative w-full cursor-pointer select-none touch-none px-2 py-2 border-b border-cyan-400/10 transition-all duration-150 " +
                  (sel
                    ? "bg-yellow-300/10 "
                    : hov
                    ? "bg-cyan-400/10 "
                    : "bg-transparent ")
                }
              >
                <span
                  className={
                    "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200 " +
                    (sel
                      ? "bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.8)]"
                      : q.tracked
                      ? "bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.7)] animate-pulse"
                      : hov
                      ? "bg-cyan-400/70"
                      : "bg-transparent")
                  }
                />
                <div className="flex items-baseline gap-2 min-w-0">
                  <span
                    className={
                      "text-[0.6rem] tracking-[0.15em] transition-colors duration-150 " +
                      (q.completed ? "text-emerald-400" : sel ? "text-yellow-300" : "text-zinc-500")
                    }
                  >
                    {q.completed ? "✔" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={
                      "min-w-0 truncate text-xs font-bold uppercase tracking-widest leading-tight transition-colors duration-150 " +
                      (q.completed
                        ? "text-zinc-500 line-through"
                        : sel
                        ? "text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.45)]"
                        : "text-cyan-50")
                    }
                  >
                    {q.title}
                  </span>
                  {q.tracked ? (
                    <span className="ml-auto shrink text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-400 truncate min-w-0">◈trk</span>
                  ) : null}
                </div>

                {q.objective ? (
                  <div
                    className={
                      "mt-0.5 min-w-0 truncate text-[0.65rem] leading-none tracking-wide transition-colors duration-150 " +
                      (q.completed ? "text-zinc-600" : sel ? "text-cyan-100/90" : "text-cyan-300/70")
                    }
                  >
                    {"› " + q.objective}
                  </div>
                ) : null}

                <div className="mt-1 flex items-center gap-2 min-w-0">
                  {q.category ? (
                    <span className="min-w-0 truncate rounded-full border border-fuchsia-400/40 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-fuchsia-400">
                      {q.category}
                    </span>
                  ) : null}
                  {q.district ? (
                    <span className="min-w-0 truncate text-[0.6rem] uppercase tracking-[0.15em] text-zinc-500">
                      {q.district}
                    </span>
                  ) : null}
                  <span className="ml-auto flex items-center gap-2 min-w-0">
                    {typeof q.rewardEddies === "number" ? (
                      <span className="min-w-0 truncate text-[0.6rem] uppercase tracking-[0.15em] text-lime-300">
                        {"€$ " + fmt(q.rewardEddies)}
                      </span>
                    ) : null}
                    {typeof q.rewardStreetCred === "number" ? (
                      <span className="min-w-0 truncate text-[0.6rem] uppercase tracking-[0.15em] text-orange-400">
                        {"SC " + fmt(q.rewardStreetCred)}
                      </span>
                    ) : null}
                  </span>
                </div>

                {sel ? (
                  <span
                    key={uid + "-sel"}
                    className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-yellow-300/50"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}