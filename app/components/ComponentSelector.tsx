import { Grid2x2, Plus } from 'lucide-react'; // Icon lib
import { useState } from 'react';

// Preset options
const OPTIONS = [
  'Nav bar', 'Grid', 'Table', 'Card',
  'Carousel', 'Kanban board', 'Chart', 'Form'
];

// Popup menu that lets you select the component to inhabit the genbox
export default function ComponentSelector({ onSend }: { onSend: (prompt: string) => void }) {

  // state var for generating own prompt
  const [customPrompt, setCustomPrompt] = useState('');

  return (
    // Gives a suble glow and shadows
    <div className="bg-menu rounded-lg p-4 shadow-2xl border border-white/10 w-80">

      {/* Header section, pushes the title and icon far apart*/}
      <div className="flex items-center justify-between mb-4">

        <h3 className="text-white text-sm font-medium">Components</h3>
        <Grid2x2 size={18} className="text-white/60" />

      </div>

      {/* List options */}
      <div className="space-y-2 mb-3">
        {OPTIONS.map((name, index) => (
          <div key={index} className="flex items-center gap-2">

            {/* flex 1 pushes the icon as far right as possible */}
            <button 
              onMouseDown={() => onSend('Create ' + name)}
              className="flex-1 bg-menubuttons hover:bg-menuhover rounded px-3 py-2 text-white/90 text-sm text-start"
            >
              {name}
            </button>

            {/* The action button triggers your prompt generation */}
            <button
              onMouseDown={() => onSend('Create ' + name)}
              className="bg-menubuttons hover:bg-menuhover rounded p-2.25 text-white/60 hover:text-white/90 transition-colors"
            >
              <Plus size={18} />
            </button>

          </div>
        ))}
      </div>

      {/* Bottom custom component button */}
      <div className="flex gap-2">
        <input
          type="text"
          // Sets and displays the prompt
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          // Checks for enter
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customPrompt.trim()) {
              onSend(customPrompt);
              setCustomPrompt('');
            }
          }}
          // To stop it from bubblin g up to Generated Box
          onMouseDown={(e) => e.stopPropagation()}
          placeholder="Custom component..."
          className="flex-1 bg-menubuttons rounded px-3 py-2 text-white/90 text-sm outline-none placeholder:text-white/30"
        />

        <button
          onMouseDown={() => {
            if (customPrompt.trim()) {
              onSend(customPrompt);
              setCustomPrompt('');
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
