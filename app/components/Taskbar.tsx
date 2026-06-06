import { useState } from 'react';

// A single on/off toggle switch
function Switch({ checked, onChange, disabled = false }
  : { checked : boolean; onChange : (v : boolean) => void; disabled? : boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors
        ${checked ? 'bg-borderactive' : 'bg-menubuttons'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Knob */}
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform
        ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

// Top toolbar: prompt bar + mode switches (separates editing from interaction)
export default function Taskbar({ interactMode, onInteractModeChange, onGenerate, isDesigning }
  : { interactMode : boolean; onInteractModeChange : (v : boolean) => void; onGenerate : (prompt : string) => void; isDesigning : boolean }) {

  // Local prompt text for the dashboard generator
  const [prompt, setPrompt] = useState('');

  // Fire the task off to the generator and clear the input
  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onGenerate(trimmed);
    setPrompt('');
  };

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-[60%] z-100 flex items-center gap-4 rounded-3xl border border-white/10 bg-menu px-4 py-2 shadow-lg">

      {/* Text bar — Enter submits the task to the dashboard generator. While a
          dashboard is generating the field is disabled (which also blocks any
          re-submission) and shows the in-progress label. */}
      <input
        type="text"
        value={isDesigning ? 'Currently Designing Layout…' : prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        disabled={isDesigning}
        placeholder="Generate component or dashboard"
        className="w-[70%] rounded-lg bg-menubuttons px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/40 disabled:opacity-70 disabled:cursor-not-allowed"
      />

      {/* Switches (remaining space) */}
      <div className="flex flex-1 items-center justify-end gap-6">

        {/* Greyed out for now */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40">Customize Mode</span>
          <Switch checked={false} onChange={() => {}} disabled />
        </div>

        {/* Functional: toggles meta-editing vs. component interaction */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/90">Interact Mode</span>
          <Switch checked={interactMode} onChange={onInteractModeChange} />
        </div>

      </div>
    </div>
  );
}
