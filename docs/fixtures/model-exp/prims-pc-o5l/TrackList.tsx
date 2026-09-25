type TrackListProps = { options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[]; value: string; onChange: (id: string) => void; onActivate?: (id: string) => void };

export const TrackList_MIN = {"base":[11,4.5]};

export function TrackList(props: TrackListProps) {
  const { options, value, onChange, onActivate } = props;
  const uid = useRef("tracklist-" + Math.random().toString(36).slice(2)).current;
  const [hover, setHover] = useState<string | null>(null);
  const floor = TrackList_MIN.base;

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden rounded-xl border border-stone-800/70 bg-stone-950/80"
      style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}
    >
      <div className="flex items-center gap-2 px-2 py-1 border-b border-stone-800/70 bg-neutral-900/80">
        <span className="text-amber-400 text-[10px] leading-none">◆</span>
        <div className="min-w-0 flex-1 truncate font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400">Track</div>
        <div className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400" style={{ width: "4ch" }}>BPM</div>
        <div className="min-w-0 truncate font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400" style={{ width: "3ch" }}>Key</div>
        <div className="min-w-0 truncate text-right font-medium uppercase tracking-widest leading-none text-[10px] text-stone-400" style={{ width: "5ch" }}>Len</div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="font-normal tracking-wide leading-none text-[11px] text-stone-600 uppercase">No tracks</div>
          </div>
        ) : (
          options.map((o, i) => {
            const sel = o.id === value;
            const hot = hover === o.id;
            return (
              <div
                key={uid + "-row-" + o.id + "-" + i}
                onPointerDown={() => onChange(o.id)}
                onDoubleClick={() => { if (onActivate) onActivate(o.id); }}
                onPointerEnter={() => setHover(o.id)}
                onPointerLeave={() => setHover((h) => (h === o.id ? null : h))}
                className={
                  "relative flex items-center gap-2 px-2 py-1 cursor-pointer select-none touch-none border-b border-stone-800/40 transition-all duration-200 ease-out " +
                  (sel
                    ? "bg-amber-500/15 ring-1 ring-inset ring-amber-500/40 text-amber-200"
                    : hot
                    ? "bg-amber-500/10 text-stone-100"
                    : "text-stone-300")
                }
              >
                <span
                  className={
                    "block rounded-full transition-all duration-200 ease-out " +
                    (sel ? "bg-lime-400 shadow-lg shadow-lime-400/30 animate-pulse" : hot ? "bg-amber-500/60" : "bg-stone-700/60")
                  }
                  style={{ width: "0.25rem", height: sel ? "1.1rem" : "0.6rem" }}
                />
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <div className={"min-w-0 truncate font-normal tracking-normal leading-snug text-sm transition-colors duration-200 " + (sel ? "text-amber-200" : hot ? "text-stone-100" : "text-stone-300")}>
                    {o.title}
                  </div>
                  <div className="min-w-0 truncate font-normal tracking-wide leading-none text-[11px] text-stone-500">{o.artist}</div>
                </div>
                <div className={"min-w-0 truncate font-mono leading-none text-[11px] transition-colors duration-200 " + (sel ? "text-lime-300" : "text-stone-400")} style={{ width: "4ch" }}>
                  {o.bpm}
                </div>
                <div className={"min-w-0 truncate text-center rounded-md border leading-none text-[10px] font-medium uppercase tracking-widest transition-all duration-200 " + (sel ? "border-violet-500/40 text-violet-300" : "border-stone-700/60 text-stone-500")} style={{ width: "3ch", paddingTop: "2px", paddingBottom: "2px" }}>
                  {o.key}
                </div>
                <div className="min-w-0 truncate text-right font-mono leading-none text-[11px] text-stone-500" style={{ width: "5ch" }}>
                  {o.duration}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}