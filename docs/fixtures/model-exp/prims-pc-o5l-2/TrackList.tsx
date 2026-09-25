type TrackListProps = { options: { id: string; title: string; artist: string; bpm: number; key: string; duration: string }[]; value: string; onChange: (id: string) => void; onActivate?: (id: string) => void };

export function TrackList(props: TrackListProps) {
  const { options, value, onChange, onActivate } = props;
  const [hover, setHover] = useState<string | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const floor = TrackList_MIN.base;

  const fire = (id: string) => {
    if (!onActivate) return;
    setPulse(id);
    onActivate(id);
    setTimeout(() => setPulse((p) => (p === id ? null : p)), 400);
  };

  return (
    <div className="h-full w-full flex flex-col" style={{ minWidth: floor[0] + "rem", minHeight: floor[1] + "rem" }}>
      <div className="flex items-center gap-2 px-2 h-5 border-b border-stone-800/70 bg-stone-950/80 rounded-t-xl">
        <div className="min-w-0 flex-1 truncate font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500">Track</div>
        <div className="w-8 text-right truncate font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500">BPM</div>
        <div className="w-6 text-right truncate font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500">Key</div>
        <div className="w-9 text-right truncate font-medium uppercase tracking-widest leading-none text-[10px] text-stone-500">Time</div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-stone-950/80 rounded-b-xl">
        {options.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-normal tracking-wide leading-none text-[11px] text-stone-600 uppercase">No tracks</span>
          </div>
        ) : (
          options.map((o, i) => {
            const sel = o.id === value;
            const hov = hover === o.id;
            return (
              <div
                key={o.id}
                onPointerEnter={() => setHover(o.id)}
                onPointerLeave={() => setHover((h) => (h === o.id ? null : h))}
                onPointerDown={() => onChange(o.id)}
                onDoubleClick={() => fire(o.id)}
                className={
                  "relative flex items-center gap-2 px-2 py-1 cursor-pointer select-none touch-none transition-all duration-200 ease-out border-b border-stone-800/50 " +
                  (sel
                    ? "bg-amber-500/15 ring-1 ring-inset ring-amber-500/40 "
                    : hov
                    ? "bg-amber-500/10 "
                    : "") +
                  (pulse === o.id ? "animate-pulse " : "")
                }
              >
                <div
                  className={
                    "w-[2px] self-stretch rounded-full transition-all duration-200 ease-out " +
                    (sel ? "bg-lime-400 shadow-lg shadow-lime-400/30" : hov ? "bg-amber-500/60" : "bg-stone-800/0")
                  }
                />
                <div className="w-4 text-right truncate font-mono leading-none text-[10px] text-stone-600">{i + 1}</div>
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <div
                    className={
                      "min-w-0 truncate font-medium tracking-tight leading-none text-[11px] transition-colors duration-200 " +
                      (sel ? "text-amber-200" : hov ? "text-stone-100" : "text-stone-300")
                    }
                  >
                    {o.title}
                  </div>
                  <div className="min-w-0 truncate font-normal tracking-wide leading-none text-[10px] text-stone-500">{o.artist}</div>
                </div>
                <div
                  className={
                    "w-8 text-right truncate font-mono font-bold tracking-tight leading-none text-[11px] transition-colors duration-200 " +
                    (sel ? "text-lime-300" : "text-amber-400/80")
                  }
                >
                  {o.bpm}
                </div>
                <div className="w-6 text-right truncate font-mono leading-none text-[11px] text-violet-300/80">{o.key}</div>
                <div className="w-9 text-right truncate font-mono leading-none text-[11px] text-stone-400">{o.duration}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export const TrackList_MIN = {"base":[11,5]};