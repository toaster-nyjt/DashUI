type TrackListProps = {
  rows: { id: string; cells: Record<string, string> }[];
  columns: string[];
  value: string;
  onChange: (id: string) => void;
  onActivate?: (id: string) => void;
};

export function TrackList(props: TrackListProps) {
  const { rows, columns, value, onChange, onActivate } = props;

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [pressId, setPressId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);

  const TrackListParseNum = (s: string): number | null => {
    if (s == null) return null;
    const m = s.match(/-?\d+(\.\d+)?/);
    if (!m) return null;
    const n = parseFloat(m[0]);
    return isNaN(n) ? null : n;
  };

  const TrackListCompare = (a: string, b: string): number => {
    const na = TrackListParseNum(a);
    const nb = TrackListParseNum(b);
    if (na !== null && nb !== null) {
      if (na === nb) return (a || "").localeCompare(b || "");
      return na - nb;
    }
    return (a || "").localeCompare(b || "", undefined, { numeric: true, sensitivity: "base" });
  };

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const copy = rows.slice();
    copy.sort((r1, r2) => {
      const c1 = (r1.cells && r1.cells[sortKey]) || "";
      const c2 = (r2.cells && r2.cells[sortKey]) || "";
      return TrackListCompare(c1, c2) * sortDir;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const TrackListToggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const TrackListSelect = (id: string) => {
    if (id !== value) onChange(id);
  };

  const TrackListActivate = (id: string) => {
    if (!onActivate) return;
    onActivate(id);
    setFlashId(id);
    window.setTimeout(() => {
      setFlashId((cur) => (cur === id ? null : cur));
    }, 420);
  };

  const gridTemplate = useMemo(() => {
    if (columns.length === 0) return "1fr";
    // First column gets more room; subsequent columns share.
    const parts = columns.map((_, i) => (i === 0 ? "minmax(0,2.4fr)" : "minmax(0,1fr)"));
    return parts.join(" ");
  }, [columns]);

  const TrackListSortGlyph = (active: boolean, dir: 1 | -1) => {
    return (
      <span
        className={
          "ml-1 inline-flex h-[1em] w-[1em] items-center justify-center transition-all duration-200 ease-out " +
          (active ? "text-amber-400 opacity-100" : "text-neutral-600 opacity-0 group-hover/head:opacity-70")
        }
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none">
          <path
            d="M12 5 L12 19"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="opacity-40"
          />
          <path
            d={dir === 1 ? "M7 10 L12 5 L17 10" : "M7 14 L12 19 L17 14"}
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-200 ease-out"
          />
        </svg>
      </span>
    );
  };

  const hasRows = rows.length > 0;
  const hasCols = columns.length > 0;

  return (
    <div className="flex h-full w-full min-w-0 min-h-0 flex-col [container-type:size] text-neutral-200">
      {/* Column header */}
      {hasCols && (
        <div
          className="grid shrink-0 select-none items-stretch border-b border-white/[0.06] bg-neutral-900/70 pr-[6px]"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columns.map((col, ci) => {
            const active = sortKey === col;
            return (
              <button
                key={"th-" + ci}
                type="button"
                onClick={() => TrackListToggleSort(col)}
                className={
                  "group/head flex min-w-0 items-center overflow-hidden px-[max(6px,1.4cqmin)] py-[max(5px,1.4cqmin)] text-left transition-colors duration-150 ease-out " +
                  "text-[clamp(8px,2.5cqmin,12px)] font-semibold uppercase tracking-widest " +
                  (active ? "text-amber-400" : "text-neutral-400 hover:text-amber-300/90") +
                  (ci === 0 ? "" : " justify-start") +
                  " focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                }
              >
                <span
                  className={
                    "pointer-events-none absolute inset-x-0 -bottom-px h-px transition-all duration-200 ease-out " +
                    (active ? "bg-amber-400/60" : "bg-transparent")
                  }
                />
                <span className="truncate">{col}</span>
                {TrackListSortGlyph(active, sortDir)}
              </button>
            );
          })}
        </div>
      )}

      {/* Body */}
      <div className="relative min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!hasRows && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[1.5cqmin] px-4 text-center">
            <div className="flex h-[16cqmin] max-h-14 min-h-8 w-[16cqmin] max-w-14 min-w-8 items-center justify-center rounded-full border border-neutral-700/70 bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
              <svg viewBox="0 0 24 24" className="h-[55%] w-[55%] text-neutral-600" fill="none">
                <circle cx="9" cy="17" r="3" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 17 V6 L20 4 V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="17" cy="15" r="3" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <span className="text-[clamp(9px,3cqmin,13px)] font-semibold uppercase tracking-widest text-neutral-600">
              No Tracks
            </span>
          </div>
        )}

        {hasRows &&
          sortedRows.map((row, ri) => {
            const selected = row.id === value;
            const hovered = row.id === hoverId;
            const pressed = row.id === pressId;
            const flashing = row.id === flashId;

            return (
              <div
                key={row.id}
                role="button"
                tabIndex={0}
                onPointerDown={() => setPressId(row.id)}
                onPointerUp={() => setPressId((p) => (p === row.id ? null : p))}
                onPointerCancel={() => setPressId((p) => (p === row.id ? null : p))}
                onPointerEnter={() => setHoverId(row.id)}
                onPointerLeave={() => {
                  setHoverId((h) => (h === row.id ? null : h));
                  setPressId((p) => (p === row.id ? null : p));
                }}
                onClick={() => TrackListSelect(row.id)}
                onDoubleClick={() => TrackListActivate(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (onActivate) TrackListActivate(row.id);
                    else TrackListSelect(row.id);
                  } else if (e.key === " ") {
                    e.preventDefault();
                    TrackListSelect(row.id);
                  }
                }}
                style={{ gridTemplateColumns: gridTemplate }}
                className={
                  "group/row relative grid cursor-pointer items-center border-b border-white/[0.04] pr-[6px] transition-colors duration-150 ease-out " +
                  "motion-reduce:transition-none " +
                  (selected
                    ? "bg-amber-500/15 "
                    : hovered
                    ? "bg-amber-500/[0.08] "
                    : ri % 2 === 0
                    ? "bg-transparent "
                    : "bg-white/[0.015] ") +
                  (pressed ? "brightness-95 " : "") +
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber-400/60"
                }
              >
                {/* Selection accent bar */}
                <span
                  className={
                    "pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-left transition-all duration-200 ease-out motion-reduce:transition-none " +
                    (selected
                      ? "scale-y-100 bg-amber-400 shadow-[0_0_10px_0] shadow-amber-500/70"
                      : hovered
                      ? "scale-y-100 bg-amber-400/40"
                      : "scale-y-0 bg-amber-400/0")
                  }
                />

                {/* Activation flash sweep */}
                {flashing && (
                  <span className="pointer-events-none absolute inset-0 overflow-hidden">
                    <span className="absolute inset-0 animate-[tracklist-flash_420ms_ease-out] bg-gradient-to-r from-amber-400/0 via-amber-400/30 to-amber-400/0" />
                  </span>
                )}

                {columns.map((col, ci) => {
                  const raw = (row.cells && row.cells[col]) != null ? row.cells[col] : "";
                  const isFirst = ci === 0;
                  const num = TrackListParseNum(raw);
                  const isNumericCol = num !== null && raw.trim() !== "" && /^[^A-Za-z]*-?\d/.test(raw.trim());

                  return (
                    <div
                      key={row.id + "-c-" + ci}
                      className={
                        "flex min-w-0 items-center overflow-hidden px-[max(6px,1.4cqmin)] py-[max(6px,1.6cqmin)] " +
                        (isFirst ? "gap-[1.6cqmin]" : "")
                      }
                    >
                      {isFirst && (
                        <span className="relative flex h-[max(14px,4cqmin)] w-[max(14px,4cqmin)] shrink-0 items-center justify-center">
                          {selected ? (
                            // Playing / equalizer bars
                            <span className="flex h-[62%] w-[62%] items-end justify-between">
                              {[0, 1, 2].map((b) => (
                                <span
                                  key={"eq-" + b}
                                  className="w-[26%] rounded-sm bg-amber-400 shadow-[0_0_6px_0] shadow-amber-500/70 motion-reduce:h-[70%] motion-reduce:animate-none"
                                  style={{
                                    animation: "tracklist-eq 900ms ease-in-out infinite",
                                    animationDelay: b * 160 + "ms",
                                    height: "70%",
                                  }}
                                />
                              ))}
                            </span>
                          ) : (
                            // Index / play glyph
                            <>
                              <span
                                className={
                                  "font-mono text-[clamp(8px,2.6cqmin,12px)] tabular-nums transition-opacity duration-150 " +
                                  (hovered ? "opacity-0" : "text-neutral-600 opacity-100")
                                }
                              >
                                {String(ri + 1).padStart(2, "0")}
                              </span>
                              <span
                                className={
                                  "absolute inset-0 flex items-center justify-center text-amber-400 transition-opacity duration-150 " +
                                  (hovered ? "opacity-100" : "opacity-0")
                                }
                              >
                                <svg viewBox="0 0 24 24" className="h-[80%] w-[80%]" fill="currentColor">
                                  <path d="M8 5.5 L18 12 L8 18.5 Z" />
                                </svg>
                              </span>
                            </>
                          )}
                        </span>
                      )}

                      <span
                        className={
                          "min-w-0 truncate " +
                          (isNumericCol ? "font-mono tabular-nums " : "") +
                          (isFirst
                            ? "text-[clamp(9px,3cqmin,14px)] font-medium leading-snug " +
                              (selected ? "text-amber-200" : "text-neutral-100")
                            : "text-[clamp(8px,2.7cqmin,12px)] leading-tight " +
                              (selected ? "text-amber-300/90" : "text-neutral-400 group-hover/row:text-neutral-300"))
                        }
                      >
                        {raw !== "" ? raw : <span className="text-neutral-700">—</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>

      <style>{
        "@keyframes tracklist-eq{0%,100%{height:28%}50%{height:92%}}" +
        "@keyframes tracklist-flash{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}" +
        "@media (prefers-reduced-motion: reduce){.animate-\\[tracklist-flash_420ms_ease-out\\]{animation:none!important}}"
      }</style>
    </div>
  );
}