import { Grid2x2, Plus, Loader2 } from 'lucide-react'; // Icon lib
import { useState } from 'react';

// Popup menu that lets you pick the component type to generate.
// Names come from the shared registry (defaultSpec); a custom name triggers
// LLM preset generation upstream.
export default function ComponentSelector({ names, loading, onSend }
  : { names: string[]; loading: boolean; onSend: (name: string) => void }) {

  // state var for typing a custom component name
  const [customName, setCustomName] = useState('');

  return (
    // Gives a subtle glow and shadows
    <div className="bg-menu rounded-lg p-4 shadow-2xl border border-white/10 w-80">

      {/* Header section, pushes the title and icon far apart*/}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-sm font-medium">Components</h3>
        {loading
          ? <Loader2 size={18} className="text-white/60 animate-spin" />
          : <Grid2x2 size={18} className="text-white/60" />}
      </div>

      {/* List the registry's component types */}
      <div className="space-y-2 mb-3">
        {names.map((name, index) => (
          <div key={index} className="flex items-center gap-2">

            {/* flex 1 pushes the icon as far right as possible */}
            <button
              onMouseDown={() => onSend(name)}
              className="flex-1 bg-menubuttons hover:bg-menuhover rounded px-3 py-2 text-white/90 text-sm text-start"
            >
              {name}
            </button>

            {/* The action button triggers generation for this type */}
            <button
              onMouseDown={() => onSend(name)}
              className="bg-menubuttons hover:bg-menuhover rounded p-2.25 text-white/60 hover:text-white/90 transition-colors"
            >
              <Plus size={18} />
            </button>

          </div>
        ))}
      </div>

      {/* Bottom custom component name field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          // Checks for enter
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customName.trim()) {
              onSend(customName.trim());
              setCustomName('');
            }
          }}
          // To stop it from bubbling up to Generated Box
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Custom component..."
          className="flex-1 bg-menubuttons rounded px-3 py-2 text-white/90 text-sm outline-none placeholder:text-white/30"
        />

        <button
          onMouseDown={() => {
            if (customName.trim()) {
              onSend(customName.trim());
              setCustomName('');
            }
          }}
          className="bg-menubuttons hover:bg-menuhover rounded p-2 text-white/60 hover:text-white/90"
        >
          <Plus size={18} />
        </button>

      </div>
    </div>
  );
}
