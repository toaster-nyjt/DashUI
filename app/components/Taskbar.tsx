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
export default function Taskbar({ interactMode, onInteractModeChange, onGenerate, isDesigning, targeting, canvasWidth }
  : { interactMode : boolean; onInteractModeChange : (v : boolean) => void; onGenerate : (prompt : string) => void; isDesigning : boolean;
      // True when a selected empty box is an active generation target — the bar wears
      // the same blue highlight a selected single-component box gets, to signal that a
      // submitted task will fill that box rather than the window.
      targeting : boolean;
      // Grid's pixel width; the bar centers/sizes off it so it tracks the grid's center.
      canvasWidth : number }) {

  // Local prompt text for the UI generator
  const [prompt, setPrompt] = useState('');

  // Fire the task off to the generator and clear the input
  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onGenerate(trimmed);
    setPrompt('');
  };

  // z-[35] sits between box chrome (borders/resize handles, ≤ z-30) and the
  // submenus (popups/ungroup menu, ≥ z-40): the bar covers box decorations but
  // every submenu still renders above it.
  return (
    <div
      // Centered on the grid (left = canvasWidth/2) and sized to 60% of it, so the bar
      // tracks the grid's center instead of the viewport's. Falls back to viewport % pre-measure.
      style={{ left: canvasWidth ? canvasWidth / 2 : '50%', width: canvasWidth ? canvasWidth * 0.6 : '60%' }}
      className={`fixed bottom-12 -translate-x-1/2 z-35 flex min-w-100 items-center gap-4 rounded-3xl bg-menu px-4 py-2 transition-all ${targeting ? 'border-3 border-borderactive ring-3 ring-borderactive/50 shadow-custom' : 'border-2 border-white/10 shadow-lg'}`}>

      {/* Text bar — Enter submits the task to the UI generator. While a
          UI is generating the field is disabled (which also blocks any
          re-submission) and shows the in-progress label. */}
      <input
        type="text"
        value={isDesigning ? 'Currently Designing Layout…' : prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        disabled={isDesigning}
        placeholder="Generate multi-component UI"
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
