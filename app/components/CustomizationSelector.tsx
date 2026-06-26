import { Grid2x2, Eye, EyeOff, Plus } from 'lucide-react';
import { useState } from 'react';
import { CompSpec, DefaultCompSpec } from '../utils/spec';

// Popup menu (shown after component generated) listing the possible customizations specified within the default spec.
// Active ones (in compSpec.specArrIdx) are "visible" (eye); the rest are off.
// Allows for user defined customization that also modifies default spec
export default function CustomizationSelector({ compSpec, defaultSpec, onSend }
  : {
      compSpec: CompSpec;
      defaultSpec: DefaultCompSpec[];
      onSend: (toAdd: boolean, specName: string) => void;
    }) {

  // Text for generating a brand new customization
  const [customSpec, setCustomSpec] = useState('');

  // The registry entry for the current component type
  const def = defaultSpec.find((d) => d.name === compSpec.name);
  const specArr = def?.spec.specArr ?? [];

  return (
    <div className="bg-menu rounded-lg p-4 shadow-2xl border border-white/10 w-80">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-white text-sm font-medium truncate">Customize - {compSpec.name}</h3>
        <Grid2x2 size={18} className="text-white/60 shrink-0" />
      </div>

      {/* All customizations, toggled with the eye icon */}
      <div className="space-y-2 mb-3">
        {specArr.map((name, index) => {
          // Check for if each customization in specArr is active in the actual component
          const active = compSpec.specArrIdx.includes(index);
          return (
            <div key={index} className="flex items-center gap-2">

              <button
                onMouseDown={() => onSend(!active, name)}
                className={`flex-1 bg-menubuttons hover:bg-menuhover rounded px-3 py-2 text-sm text-start ${active ? 'text-white/90' : 'text-white/40'}`}
              >
                {name}
              </button>

              <button
                onMouseDown={() => onSend(!active, name)}
                className="bg-menubuttons hover:bg-menuhover rounded p-2 text-white/60 hover:text-white/90 transition-colors"
              >
                {active ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>

            </div>
          );
        })}
      </div>

      {/* Generate a brand new customization */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customSpec} 
          onChange={(e) => setCustomSpec(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customSpec.trim()) {
              onSend(true, customSpec.trim());
              setCustomSpec('');
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Generate custom..."
          className="flex-1 bg-menubuttons rounded px-3 py-2 text-white/90 text-sm outline-none placeholder:text-white/30"
        />

        <button
          onMouseDown={() => {
            if (customSpec.trim()) {
              onSend(true, customSpec.trim());
              setCustomSpec('');
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
