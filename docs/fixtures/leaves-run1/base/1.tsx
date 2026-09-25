export default function GeneratedComponent() {
  const [chanA, setChanA] = useState({
    gain: 0.62,
    hi: 0.5,
    mid: 0.5,
    low: 0.5,
    fader: 0.82,
    cue: false,
  });
  const [chanB, setChanB] = useState({
    gain: 0.55,
    hi: 0.5,
    mid: 0.5,
    low: 0.5,
    fader: 0.74,
    cue: true,
  });
  const [crossfader, setCrossfader] = useState(0.5);
  const [master, setMaster] = useState(0.78);
  const [headMix, setHeadMix] = useState(0.4);

  const [levelA, setLevelA] = useState(0);
  const [levelB, setLevelB] = useState(0);

  const dragRef = useRef(null);

  // Simulated audio signal driving VU meters (post gain + fader + crossfader)
  useEffect(() => {
    let raf;
    let t = 0;
    const tick = () => {
      t += 0.08;
      const xfA = Math.min(1, (1 - crossfader) * 2);
      const xfB = Math.min(1, crossfader * 2);
      const beatA = 0.5 + 0.5 * Math.abs(Math.sin(t * 1.9));
      const beatB = 0.5 + 0.5 * Math.abs(Math.sin(t * 2.3 + 1.1));
      const noiseA = 0.82 + Math.random() * 0.18;
      const noiseB = 0.82 + Math.random() * 0.18;
      const tA = chanA.gain * chanA.fader * xfA * beatA * noiseA;
      const tB = chanB.gain * chanB.fader * xfB * beatB * noiseB;
      setLevelA((p) => p + (tA - p) * 0.35);
      setLevelB((p) => p + (tB - p) * 0.35);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chanA.gain, chanA.fader, chanB.gain, chanB.fader, crossfader]);

  const startVDrag = useCallback((getVal, setVal) => (e) => {
    e.preventDefault();
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const move = (ev) => {
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const v = 1 - Math.min(1, Math.max(0, (cy - rect.top) / rect.height));
      setVal(v);
    };
    move(e);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, []);

  const startHDrag = useCallback((setVal) => (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const move = (ev) => {
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const v = Math.min(1, Math.max(0, (cx - rect.left) / rect.width));
      setVal(v);
    };
    move(e);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, []);

  const startKnob = useCallback((getVal, setVal) => (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startVal = getVal();
    const move = (ev) => {
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const delta = (startY - cy) / 140;
      setVal(Math.min(1, Math.max(0, startVal + delta)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }, []);

  const Knob = ({ value, setValue, label, tint }) => {
    const angle = -135 + value * 270;
    const ring =
      tint === "A" ? "#fbbf24" : tint === "B" ? "#5eead4" : "#fda4af";
    return (
      <div className="flex flex-col items-center gap-1 min-w-0">
        <div
          onPointerDown={startKnob(() => value, setValue)}
          className="relative rounded-full border border-neutral-700/70 bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-md shadow-black/40 cursor-ns-resize touch-none select-none transition-transform duration-100 ease-out hover:scale-[1.04]"
          style={{ width: "clamp(22px,7vw,30px)", height: "clamp(22px,7vw,30px)" }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(from -135deg, " +
                ring +
                " 0deg, " +
                ring +
                " " +
                value * 270 +
                "deg, transparent " +
                value * 270 +
                "deg)",
              WebkitMask:
                "radial-gradient(circle, transparent 60%, #000 62%, #000 72%, transparent 74%)",
              mask: "radial-gradient(circle, transparent 60%, #000 62%, #000 72%, transparent 74%)",
              opacity: 0.9,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 origin-bottom transition-transform duration-100 ease-linear"
            style={{
              width: "2px",
              height: "42%",
              transform:
                "translate(-50%,-100%) rotate(" + angle + "deg)",
              transformOrigin: "bottom center",
              background: ring,
              borderRadius: "2px",
            }}
          />
        </div>
        <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-400 leading-none">
          {label}
        </span>
      </div>
    );
  };

  const VU = ({ level, tint }) => {
    const segs = 14;
    const active = Math.round(level * segs);
    const base = tint === "A" ? "#fbbf24" : "#5eead4";
    return (
      <div className="flex-1 min-h-0 w-2.5 flex flex-col-reverse gap-[2px] rounded bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] p-[2px]">
        {Array.from({ length: segs }).map((_, i) => {
          const on = i < active;
          const col =
            i >= segs - 2 ? "#fb7185" : i >= segs - 5 ? "#fbbf24" : "#34d399";
          return (
            <div
              key={"seg-" + i}
              className="flex-1 basis-0 min-h-0 rounded-[1px] transition-all duration-75 ease-out"
              style={{
                background: on ? (tint === "A" || tint === "B" ? col : base) : "#1c1917",
                boxShadow: on ? "0 0 6px -1px " + col : "none",
                opacity: on ? 1 : 0.5,
              }}
            />
          );
        })}
      </div>
    );
  };

  const Fader = ({ value, setValue, tint }) => {
    const glow = tint === "A" ? "#fbbf24" : "#5eead4";
    return (
      <div
        onPointerDown={startVDrag(() => value, setValue)}
        className="relative flex-1 min-h-0 w-6 mx-auto rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] cursor-ns-resize touch-none select-none"
      >
        <div className="absolute left-1/2 top-2 bottom-2 w-[3px] -translate-x-1/2 rounded-full bg-neutral-800" />
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-sm border border-neutral-500/50 bg-gradient-to-b from-neutral-500 to-neutral-800 shadow-md shadow-black/50 transition-[bottom] duration-100 ease-out"
          style={{
            width: "20px",
            height: "14px",
            bottom: "calc(" + value * 100 + "% - 7px)",
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-[2px] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: glow, boxShadow: "0 0 6px " + glow }}
          />
        </div>
      </div>
    );
  };

  const ChannelStrip = ({ ch, set, level, tint, label }) => {
    const setP = (k) => (v) => set((p) => ({ ...p, [k]: v }));
    const idColor = tint === "A" ? "text-amber-400" : "text-teal-300";
    return (
      <div className="flex-1 basis-0 min-w-0 flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 p-1.5">
        <div
          className={
            "text-[9px] font-bold uppercase tracking-widest leading-none " +
            idColor
          }
        >
          {label}
        </div>
        <Knob value={ch.gain} setValue={setP("gain")} label="Gain" tint={tint} />
        <div className="flex flex-col gap-1 w-full items-center">
          <Knob value={ch.hi} setValue={setP("hi")} label="Hi" tint={tint} />
          <Knob value={ch.mid} setValue={setP("mid")} label="Mid" tint={tint} />
          <Knob value={ch.low} setValue={setP("low")} label="Low" tint={tint} />
        </div>
        <div className="flex-1 min-h-0 w-full flex items-stretch justify-center gap-1.5 mt-0.5">
          <Fader value={ch.fader} setValue={setP("fader")} tint={tint} />
          <VU level={level} tint={tint} />
        </div>
        <button
          onClick={() => set((p) => ({ ...p, cue: !p.cue }))}
          className={
            "w-full rounded-md border py-1 text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ease-out " +
            (ch.cue
              ? tint === "A"
                ? "border-amber-400/40 bg-amber-500 text-neutral-950 shadow-[0_0_12px_-1px] shadow-amber-500/60"
                : "border-teal-400/40 bg-teal-500 text-neutral-950 shadow-[0_0_12px_-1px] shadow-teal-500/60"
              : "border-neutral-600/50 bg-neutral-800 text-neutral-400 hover:bg-neutral-700")
          }
        >
          Cue
        </button>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden rounded-none bg-neutral-950 bg-[radial-gradient(120%_120%_at_50%_-10%,#221a10_0%,#0c0b0a_55%,#050505_100%)]">
      <div className="h-9 px-3 flex items-center justify-between shrink-0 border-b border-white/[0.06] bg-neutral-900/60">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-rose-300/90">
          Mixer
        </span>
        <span className="font-mono text-[10px] tabular-nums text-neutral-500">
          MST {Math.round(master * 100)}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden p-2 flex flex-col gap-2">
        {/* Channel strips */}
        <div className="flex-1 min-h-0 flex gap-2">
          <ChannelStrip ch={chanA} set={setChanA} level={levelA} tint="A" label="Ch 1" />
          <ChannelStrip ch={chanB} set={setChanB} level={levelB} tint="B" label="Ch 2" />
        </div>

        {/* Crossfader */}
        <div className="shrink-0 rounded-xl border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 p-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-amber-400">
              A
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
              Crossfade
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-teal-300">
              B
            </span>
          </div>
          <div
            onPointerDown={startHDrag(setCrossfader)}
            className="relative h-6 rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] cursor-ew-resize touch-none select-none"
          >
            <div className="absolute left-2 right-2 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-neutral-800" />
            <div
              className="absolute top-1/2 -translate-y-1/2 rounded-sm border border-neutral-500/50 bg-gradient-to-b from-neutral-500 to-neutral-800 shadow-md shadow-black/50 transition-[left] duration-100 ease-out"
              style={{
                width: "16px",
                height: "22px",
                left: "calc(" + crossfader * 100 + "% - 8px)",
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 h-[70%] w-[2px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: "#fbbf24",
                  boxShadow: "0 0 6px #fbbf24",
                }}
              />
            </div>
          </div>
        </div>

        {/* Master + Headphone */}
        <div className="shrink-0 grid grid-cols-2 gap-2">
          {[
            { label: "Master", val: master, set: setMaster, tint: "#fda4af" },
            { label: "Phones", val: headMix, set: setHeadMix, tint: "#fbbf24" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/[0.06] bg-gradient-to-b from-neutral-800/70 to-neutral-900/90 p-2 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
                  {m.label}
                </span>
                <span className="font-mono text-[10px] font-bold tabular-nums text-amber-300 leading-none">
                  {Math.round(m.val * 100)}
                </span>
              </div>
              <div
                onPointerDown={startHDrag(m.set)}
                className="relative h-4 rounded-md bg-neutral-950/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] cursor-ew-resize touch-none select-none"
              >
                <div
                  className="absolute inset-y-1 left-1 rounded-sm transition-[width] duration-100 ease-out"
                  style={{
                    width: "calc(" + m.val * 100 + "% - 8px)",
                    background: m.tint,
                    boxShadow: "0 0 10px -2px " + m.tint,
                    opacity: 0.85,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-7 px-3 flex items-center justify-between shrink-0 border-t border-white/[0.06] bg-neutral-900/60 text-[10px] tracking-wide text-neutral-500">
        <span className="font-mono tabular-nums">
          A {Math.round(levelA * 100)} · B {Math.round(levelB * 100)}
        </span>
        <span className="uppercase tracking-widest text-rose-300/70">Output</span>
      </div>
    </div>
  );
}