import { Grid2x2, Eye, EyeOff, Plus } from 'lucide-react';
import { useState } from 'react';
import { ComponentInstance, ComponentDef } from '../utils/spec';

// Popup menu (shown after component generated) listing the possible features defined within the component definition.
// Active ones (in instance.activeIdx) are "visible" (eye); the rest are off.
// Allows for user defined features that also modify the component registry
export default function CustomizationSelector({ instance, componentRegistry, onSend }
  : {
      instance: ComponentInstance;
      componentRegistry: ComponentDef[];
      onSend: (toAdd: boolean, featureName: string) => void;
    }) {

  // Text for generating a brand new feature
  const [customFeature, setCustomFeature] = useState('');

  // The registry entry for the current component type
  const def = componentRegistry.find((d) => d.name === instance.name);
  const features = def?.features ?? [];

  return (
    <div className="bg-menu rounded-lg p-4 shadow-2xl border border-white/10 w-80">

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-white text-sm font-medium truncate">Customize - {instance.name}</h3>
        <Grid2x2 size={18} className="text-white/60 shrink-0" />
      </div>

      {/* All features, toggled with the eye icon */}
      <div className="space-y-2 mb-3">
        {features.map((name, index) => {
          // Check for if each feature is active in the actual component
          const active = instance.activeIdx.includes(index);
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

      {/* Generate a brand new feature */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customFeature}
          onChange={(e) => setCustomFeature(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customFeature.trim()) {
              onSend(true, customFeature.trim());
              setCustomFeature('');
            }
          }}
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Generate custom..."
          className="flex-1 bg-menubuttons rounded px-3 py-2 text-white/90 text-sm outline-none placeholder:text-white/30"
        />

        <button
          onMouseDown={() => {
            if (customFeature.trim()) {
              onSend(true, customFeature.trim());
              setCustomFeature('');
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
