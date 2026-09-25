type ButtonProps = {
  onPress: () => void;
  tone?: 'neutral' | 'accent' | 'danger';
  active?: boolean;
};

export function Button(props: ButtonProps) {
  const tone = props.tone ?? 'neutral';
  const active = props.active ?? false;

  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const rippleId = useRef(0);
  const rootRef = useRef<HTMLButtonElement | null>(null);

  const ButtonSpawnRipple = (clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((clientY - rect.top) / Math.max(1, rect.height)) * 100;
    const id = rippleId.current++;
    setRipples((r) => [...r, { id, x, y }]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((rr) => rr.id !== id));
    }, 560);
  };

  const ButtonTones = {
    neutral: {
      accentRGB: '245,158,11',
      accentSoft: 'rgba(245,158,11,0.5)',
      idleBg: 'linear-gradient(to bottom, rgba(64,64,64,0.9), rgba(23,23,23,0.95))',
      idleText: 'text-neutral-300',
      idleBorder: 'border-neutral-600/50',
      activeBg: 'linear-gradient(to bottom, rgba(251,191,36,1), rgba(245,158,11,1))',
      activeText: 'text-neutral-950',
      activeBorder: 'border-amber-300/60',
      glow: 'rgba(245,158,11,0.6)',
      hoverGlow: 'rgba(245,158,11,0.5)',
      sheen: 'rgba(245,158,11,0.16)',
      idleDot: 'rgba(245,158,11,0.35)',
    },
    accent: {
      accentRGB: '45,212,191',
      accentSoft: 'rgba(45,212,191,0.5)',
      idleBg: 'linear-gradient(to bottom, rgba(64,64,64,0.9), rgba(23,23,23,0.95))',
      idleText: 'text-teal-200',
      idleBorder: 'border-teal-500/30',
      activeBg: 'linear-gradient(to bottom, rgba(94,234,212,1), rgba(20,184,166,1))',
      activeText: 'text-neutral-950',
      activeBorder: 'border-teal-200/60',
      glow: 'rgba(20,184,166,0.6)',
      hoverGlow: 'rgba(45,212,191,0.5)',
      sheen: 'rgba(45,212,191,0.18)',
      idleDot: 'rgba(45,212,191,0.4)',
    },
    danger: {
      accentRGB: '251,113,133',
      accentSoft: 'rgba(251,113,133,0.5)',
      idleBg: 'linear-gradient(to bottom, rgba(64,64,64,0.9), rgba(23,23,23,0.95))',
      idleText: 'text-rose-200',
      idleBorder: 'border-rose-500/30',
      activeBg: 'linear-gradient(to bottom, rgba(253,164,175,1), rgba(244,63,94,1))',
      activeText: 'text-neutral-950',
      activeBorder: 'border-rose-200/60',
      glow: 'rgba(244,63,94,0.6)',
      hoverGlow: 'rgba(251,113,133,0.5)',
      sheen: 'rgba(251,113,133,0.18)',
      idleDot: 'rgba(251,113,133,0.4)',
    },
  } as const;

  const t = ButtonTones[tone];

  const surfaceBg = active ? t.activeBg : t.idleBg;
  const textClass = active ? t.activeText : t.idleText;
  const borderClass = active ? t.activeBorder : t.idleBorder;

  const baseShadow = active
    ? 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 5px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.5), 0 0 18px -2px ' +
      t.glow
    : 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -3px 7px rgba(0,0,0,0.6), 0 4px 10px rgba(0,0,0,0.45)';

  return (
    <button
      ref={rootRef}
      type="button"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setPressed(true);
        ButtonSpawnRipple(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => {
        if (pressed) {
          setPressed(false);
          props.onPress();
        }
      }}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!pressed) setPressed(true);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setPressed(false);
          props.onPress();
        }
      }}
      className={
        'group relative h-full w-full min-w-0 min-h-0 select-none touch-none overflow-hidden rounded-lg border ' +
        borderClass +
        ' ' +
        textClass +
        ' [container-type:size] transition-all duration-200 ease-out outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-0 motion-reduce:transition-none ' +
        (pressed ? 'scale-[0.955]' : 'hover:-translate-y-px active:translate-y-0')
      }
      style={{
        backgroundImage: surfaceBg,
        boxShadow: baseShadow,
        transform: pressed ? 'translateY(0) scale(0.955)' : undefined,
      }}
    >
      {/* top glass sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-lg"
        style={{
          background: active
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.28), rgba(255,255,255,0))'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.07), rgba(255,255,255,0))',
        }}
      />

      {/* hover glow wash (idle only) */}
      {!active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 motion-reduce:transition-none"
          style={{
            background:
              'radial-gradient(120% 100% at 50% 120%, ' + t.sheen + ' 0%, rgba(0,0,0,0) 70%)',
          }}
        />
      )}

      {/* active edge glow ring — pulses gently to signal armed/engaged state */}
      {active && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1px] rounded-[7px] animate-pulse motion-reduce:animate-none"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35), inset 0 0 12px -2px ' + t.hoverGlow,
          }}
        />
      )}

      {/* press flash */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-100 ease-out"
        style={{
          opacity: pressed ? 1 : 0,
          background: active
            ? 'radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)'
            : 'radial-gradient(80% 80% at 50% 50%, rgba(' + t.accentRGB + ',0.4) 0%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* ripples from pointer location */}
      {ripples.map((r) => (
        <span
          key={"ripple-" + r.id}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            left: r.x + '%',
            top: r.y + '%',
            width: '10cqmax',
            height: '10cqmax',
            transform: 'translate(-50%, -50%) scale(0)',
            background: active
              ? 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)'
              : 'radial-gradient(circle, rgba(' + t.accentRGB + ',0.55) 0%, rgba(' + t.accentRGB + ',0) 70%)',
            animation: 'buttonRipple 560ms ease-out forwards',
          }}
        />
      ))}

      {/* center emblem — a compact power/pulse mark that reads the state without any text label */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          className="h-[58cqmin] w-[58cqmin]"
          style={{
            filter: active
              ? 'drop-shadow(0 0 4px rgba(0,0,0,0.35))'
              : 'drop-shadow(0 1px 1px rgba(0,0,0,0.6))',
          }}
        >
          {/* outer ring */}
          <circle
            cx="50"
            cy="50"
            r="34"
            fill="none"
            stroke={active ? 'rgba(0,0,0,0.55)' : 'rgba(' + t.accentRGB + ',0.55)'}
            strokeWidth={active ? 7 : 6}
            strokeLinecap="round"
            strokeDasharray="170 44"
            strokeDashoffset="21"
            transform="rotate(-90 50 50)"
            className="origin-center transition-all duration-200 ease-out"
          />
          {/* inner core dot — swells when pressed/active */}
          <circle
            cx="50"
            cy="14"
            r={active ? 7 : 5.5}
            fill={active ? 'rgba(0,0,0,0.65)' : 'rgba(' + t.accentRGB + ',0.9)'}
            className="transition-all duration-200 ease-out"
          />
        </svg>
      </span>

      {/* keyframes */}
      <style>{
        '@keyframes buttonRipple { 0% { transform: translate(-50%,-50%) scale(0); opacity: 0.9; } 100% { transform: translate(-50%,-50%) scale(3.4); opacity: 0; } }'
      }</style>
    </button>
  );
}